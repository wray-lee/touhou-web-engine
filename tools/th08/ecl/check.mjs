/**
 * Static contract check between the generated ECL scripts and the runtime.
 *
 * `tsc` type-checks the generated subs, but it cannot see the gap between the
 * `EnemyCtx` the translator writes against and the `EnemySlot` the sim
 * instantiates, so a call to a method the slot does not implement, or a write to a
 * read-only accessor, only shows up as a crash several thousand frames into a
 * play-through. This walks every generated file and reports those classes of
 * breakage: missing members, wrong argument counts, write-only-a-getter
 * properties, and unresolvable registers emitted as bare numbers.
  *
  * The scan targets `src/th08/stages/<route>/scripts.ts`, which is what
  * `npm run ecl:th08` writes and what the game imports. An earlier revision read
  * `.scratch/generated`; that copy is never refreshed, so the check reported
  * twenty-odd members that have existed for months.
  *
  *   node --import ./tools/th08/ecl/register.mjs tools/th08/ecl/check.mjs
  */
import fs from 'node:fs';
import path from 'node:path';
import { EnemySlot } from '../../../src/th08/sim/EnemySlot.ts';
import { createGameState } from '../../../src/th08/sim/GameState.ts';

const STAGES = path.join('src', 'th08', 'stages');
const gs = createGameState('normal', 0);
const probe = new EnemySlot(gs);

/** Every member the class exposes, instance fields included. */
function members(obj) {
  const names = new Set();
  let proto = Object.getPrototypeOf(obj);
  while (proto && proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) names.add(key);
    proto = Object.getPrototypeOf(proto);
  }
  for (const key of Object.keys(obj)) names.add(key);
  return names;
}

/** Freshly reset slot: the field list a generated sub can legally touch. */
const live = new EnemySlot(gs);
live.reset(0, 0, 0, gs);
const have = members(live);

function settable(obj, key) {
  const before = obj[key];
  try {
    obj[key] = typeof before === 'number' ? before : 0;
    return true;
  } catch {
    return false;
  }
}

const missingMethods = new Map();
const missingProps = new Map();
const readOnlyProps = new Map();
const bareRegisters = new Map();
const wrongArity = new Map();

/**
 * Count the arguments of the call that starts at `open`, the index of its `(`.
 *
 * The generated subs carry `// @ts-nocheck`, so TypeScript never sees a method
 * called with too few arguments and `randSignF()` happily returns `undefined`
 * negated, which is `NaN`, which then rides an interpolator tangent into the
 * position register. This is the check that catches it at translate time.
 */
function countArgs(text, open) {
  let depth = 0;
  let commas = 0;
  let filled = false;
  let quote = '';
  for (let i = open; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote) quote = '';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { quote = c; filled = true; continue; }
    if (c === '(' || c === '[' || c === '{') {
      depth++;
      if (depth === 1) filled = false;
      continue;
    }
    if (c === ')' || c === ']' || c === '}') {
      depth--;
      if (depth === 0) return filled ? commas + 1 : 0;
      continue;
    }
    if (c === ',') {
      if (depth === 1) commas++;
      continue;
    }
    if (!/\s/.test(c)) filled = true;
  }
  return 0;
}

/** The declared parameter count of a runtime method, or -1 when unknown. */
function arityOf(name) {
  const fn = typeof live[name] === 'function'
    ? live[name]
    : Object.getPrototypeOf(live)?.[name];
  return typeof fn === 'function' ? fn.length : -1;
}

const files = fs
  .readdirSync(STAGES, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(entry.name, 'scripts.ts'))
  .filter((rel) => fs.existsSync(path.join(STAGES, rel)))
  .sort();
for (const file of files) {
  const text = fs.readFileSync(path.join(STAGES, file), 'utf8');
  const lines = text.split('\n');
  // Running character offset of the current line inside `text`. The arity scan needs it:
  // a launch is emitted as one multi-line descriptor object, so counting commas inside
  // the first line alone always reports zero arguments.
  let offset = 0;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const where = `${file}:${index + 1}`;
    // Absolute offset of this line, consumed before any branch `continue`s.
    const lineStart = offset;
    offset += line.length + 1;
    const call = /\be\.([A-Za-z_$][\w$]*)\s*\(/.exec(line);
    if (call) {
      const name = call[1];
      if (!have.has(name)) {
        if (!missingMethods.has(name)) missingMethods.set(name, []);
        missingMethods.get(name).push(where);
      } else {
        const want = arityOf(name);
        if (want > 0) {
          const openAbs = lineStart + line.indexOf('(', call.index + call[0].length - 1);
          const got = countArgs(text, openAbs);
          if (got < want) {
            const key = name + '(' + got + '/' + want + ')';
            if (!wrongArity.has(key)) wrongArity.set(key, []);
            wrongArity.get(key).push(where);
          }
        }
      }
      continue;
    }
    const write = /^\s*e\.([A-Za-z_$][\w$]*)\s*(?:[-+*/]?=)/.exec(line);
    if (write) {
      const name = write[1];
      if (!have.has(name)) {
        if (!missingProps.has(name)) missingProps.set(name, []);
        missingProps.get(name).push(where);
      } else if (!settable(live, name)) {
        if (!readOnlyProps.has(name)) readOnlyProps.set(name, []);
        readOnlyProps.get(name).push(where);
      }
      continue;
    }
    // A bare register id that reached the emitted source means the operand
    // table had no name for it -- and `EclEmitTs` falls back to the raw
    // operand, so `if (0x2770 >= 5)` silently became `if (10096 >= 5)`.
    // That is a control-flow inversion, not a cosmetic gap, so it fails below.
    const bare = /\(?\s*(\d{5})\s*(?:[-+*/]?=|>=|<=|>|<|,|\))/.exec(line);
    const regId = bare ? Number(bare[1]) : 0;
    if (regId >= 0x2740 && regId <= 0x2780) {
      const key = `${regId} (0x${regId.toString(16)})`;
      if (!bareRegisters.has(key)) bareRegisters.set(key, 0);
      bareRegisters.set(key, bareRegisters.get(key) + 1);
    }
  }
}

const report = (label, entries) => {
  if (entries.length === 0) return;
  console.log(`${label}:`);
  for (const [name, where] of entries) {
    const n = Array.isArray(where) ? where.length : where;
    const sample = Array.isArray(where) ? ` ${where[0]}` : '';
    console.log(`  ${name}  x${n}${sample}`);
  }
};

report('methods the runtime does not implement', [...missingMethods.entries()]);
report('properties the runtime does not have', [...missingProps.entries()]);
report('properties a script writes but cannot set', [...readOnlyProps.entries()]);
report('bare register ids left in the emitted source', [...bareRegisters.entries()]);

report('calls with too few arguments', [...wrongArity.entries()]);

const blocked = missingMethods.size + missingProps.size + readOnlyProps.size + wrongArity.size + bareRegisters.size;
console.log(blocked === 0 ? 'OK — every generated call and register resolves' : `FAIL — ${blocked} unresolved sites`);
process.exit(blocked === 0 ? 0 : 1);
