/**
 * ECL -> TypeScript translator driver.
 *
 * Reads the unpacked `*.ecl` stage scripts and writes three modules per route:
 *   src/th08/stages/<route>/scripts.ts  enemy subs as control-flow generators
 *   src/th08/stages/<route>/waves.ts    raw spawn timeline + file header
 *   src/th08/stages/<route>/index.ts    the route facade: metadata + op-122 card table
 *
 * The output is committed source, not scratch: a fresh clone plays all seven
 * campaign routes without running the translator. Regenerate with `npm run ecl:th08`.
 *
 * Run:  node --import ./tools/th08/ecl/register.mjs tools/th08/ecl/generate.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import { parseEcl } from '../../../src/th08/format/EclFile.ts';
import { disasmEcl } from '../../../src/th08/format/EclDisasm.ts';
import { emitEclFile } from '../../../src/th08/format/EclEmitTs.ts';
import { decodeSpellCard } from '../../../src/th08/format/EclSpellCard.ts';
import { isLastSpellCard } from '../../../src/th08/sim/LastSpellCards.ts';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const OUT_ROOT = path.join(process.cwd(), 'src', 'th08', 'stages');

/**
 * Script file -> route directory.
 *
 * The numbering is retail's and does not line up with the printed stage numbers:
 * 6A is `ecldata6` and the true final 6B is `ecldata7`, while `ecldata8` is the
 * Extra script the campaign never loads.
 */
const ROUTES = [
  ['ecldata1', 'stage1'],
  ['ecldata2', 'stage2'],
  ['ecldata3', 'stage3'],
  ['ecldata4a', 'stage4a'],
  ['ecldata4b', 'stage4b'],
  ['ecldata5', 'stage5'],
  ['ecldata6', 'stage6a'],
  ['ecldata7', 'stage6b'],
  ['ecldata8', 'extra'],
];

/**
 * Preamble for one generated module.
 *
 * The output is type-checked source, not a `@ts-nocheck` blob: a translated script that
 * calls a renamed `EnemyCtx` method now fails `tsc` on the commit that renames it, instead
 * of throwing from inside a boss fight hundreds of frames in. That also means the preamble
 * can only import and declare what the body actually uses, because the project lints with
 * `noUnusedLocals`.
 */
function headerFor(fileName, body) {
  const lines = [
    '// Auto-generated from ' + fileName + ' by tools/th08/ecl',
    '// Do not edit directly; change the translator and run `npm run ecl:th08`.',
    '//',
    '// Each sub is a generator that yields frame counts (wait N frames).',
    '// The runtime calls .next() once per game frame.',
    '',
    "import type { EnemyCtx } from '../../danmaku/EnemyCtx';",
  ];
  if (/\bnormalizeAngle\(/.test(body)) {
    lines.push("import { normalizeAngle } from '../../core/math';");
  }
  if (/\breg\(/.test(body)) {
    lines.push("import { reg } from '../../danmaku/ShotDescriptor';");
  }
  const masks = [
    ['EASY', '0x01'],
    ['NORMAL', '0x02'],
    ['HARD', '0x04'],
    ['LUNATIC', '0x08'],
    ['EXTRA', '0x10'],
  ].filter(([name]) => new RegExp('\\b' + name + '\\b').test(body));
  if (masks.length > 0) {
    lines.push('', '// Difficulty bitmasks (from GameState.ts)');
    for (const [name, value] of masks) lines.push(`const ${name} = ${value};`);
  }
  lines.push('');
  return lines.join('\n');
}

function emitTimelineModule(ecl, fileName) {
  const lines = [
    `// Auto-generated timeline data from ${fileName}`,
    `// Contains ${ecl.timelines.length} timeline(s), ${ecl.subCount} subs`,
    '',
    "import type { EclFile, EclTimeline } from '../../format/EclFile';",
    '',
    'export const TIMELINES: EclTimeline[] = [',
  ];
  for (const timeline of ecl.timelines) {
    lines.push('  {');
    lines.push(`    index: ${timeline.index},`);
    lines.push(`    offset: ${timeline.offset},`);
    lines.push('    instructions: [');
    for (const ins of timeline.instructions) {
      lines.push(
        `      { offset: 0, time: ${ins.time}, opcode: ${ins.opcode}, size: ${ins.size}, ` +
        `difficultyMask: ${ins.difficultyMask}, args: new Int32Array([${[...ins.args].join(',')}]) },`,
      );
    }
    lines.push('    ],');
    lines.push('  },');
  }
  lines.push('];');
  lines.push('');
  lines.push('export const ECL_FILE: EclFile = {');
  lines.push(`  version: ${ecl.version},`);
  lines.push(`  subCount: ${ecl.subCount},`);
  lines.push('  subs: [],');
  lines.push('  timelines: TIMELINES,');
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

/**
 * Every op-122 declaration in the file, in sub order.
 *
 * This is the table that makes a translated script navigable: the card name, its owner,
 * the cut-in face, the bonus, and -- through `g_LastSpellNumbers` -- whether running the
 * card out costs the player "Spell Bonus Failed" or "Last Spell Failed".
 */
function spellCardsOf(subs) {
  const cards = [];
  for (const sub of subs) {
    for (const ins of sub.instructions) {
      if (ins.opcode !== 122) continue;
      const card = decodeSpellCard(ins.operands);
      cards.push({
        sub: sub.id,
        id: card.number,
        name: card.name,
        owner: card.owner,
        face: card.face,
        bonus: card.bonus,
        lastSpell: isLastSpellCard(card.number),
      });
    }
  }
  return cards;
}

function indexFor(route, fileName, ecl, cards) {
  const finals = cards.filter((card) => card.lastSpell).length;
  const lines = [
    `// Auto-generated facade for ${fileName} by tools/th08/ecl.`,
    '// Do not edit directly; change the translator and run `npm run ecl:th08`.',
    '//',
    `// ${ecl.subCount} subs, ${ecl.timelines.length} timeline(s), ${cards.length} spell cards`,
    `// declared by op 122, ${finals} of them final spells per g_LastSpellNumbers.`,
    '',
    "import type { StageScript } from '../StageScript';",
    "import * as SCRIPTS from './scripts';",
    "import { ECL_FILE } from './waves';",
    '',
    `export const ${route.toUpperCase()}_SCRIPT: StageScript = {`,
    `  route: ${JSON.stringify(route)},`,
    `  source: ${JSON.stringify(fileName)},`,
    `  subCount: ${ecl.subCount},`,
    `  timelineCount: ${ecl.timelines.length},`,
    '  cards: [',
  ];
  for (const card of cards) {
    lines.push(
      `    { sub: ${card.sub}, id: ${card.id}, name: ${JSON.stringify(card.name)}, ` +
        `owner: ${JSON.stringify(card.owner)}, face: ${card.face}, bonus: ${card.bonus}, ` +
        `lastSpell: ${card.lastSpell} },`,
    );
  }
  lines.push('  ],');
  lines.push('  scripts: SCRIPTS,');
  lines.push('  waves: ECL_FILE,');
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

fs.mkdirSync(OUT_ROOT, { recursive: true });

/**
 * The translated modules are checked-in source, not scratch data: they are typed, linted,
 * and prettied like everything else. Formatting on the way out keeps `ecl:th08` idempotent
 * against `format:check`, so a regeneration can never leave the tree dirty for style alone.
 */
async function writeSource(file, source) {
  const options = { ...(await prettier.resolveConfig(file)), parser: 'typescript' };
  fs.writeFileSync(file, await prettier.format(source, options));
}

let shotCalls = 0;
for (const [name, route] of ROUTES) {
  const rawPath = path.join(RAW_DIR, `${name}.ecl`);
  if (!fs.existsSync(rawPath)) {
    console.warn(`skip ${name}: ${rawPath} not found`);
    continue;
  }
  const outDir = path.join(OUT_ROOT, route);
  fs.mkdirSync(outDir, { recursive: true });
  const ecl = parseEcl(fs.readFileSync(rawPath));
  const subs = disasmEcl(ecl);
  const body = emitEclFile(subs, `${name}.ecl`);
  const source = headerFor(`${name}.ecl`, body) + body;
  shotCalls += (source.match(/e\.shotSetup\(/g) ?? []).length;
  const cards = spellCardsOf(subs);
  await writeSource(path.join(outDir, 'scripts.ts'), source);
  await writeSource(path.join(outDir, 'waves.ts'), emitTimelineModule(ecl, `${name}.ecl`));
  await writeSource(path.join(outDir, 'index.ts'), indexFor(route, `${name}.ecl`, ecl, cards));
  console.log(
    `${name} -> stages/${route}: ${ecl.subCount} subs, ${ecl.timelines.length} timelines, ` +
      `${cards.length} cards, ${source.split('\n').length} lines`,
  );
}
console.log(`done - ${shotCalls} shotSetup call sites`);
