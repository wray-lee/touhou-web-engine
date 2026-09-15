/**
 * ECL → TypeScript code generator.
 *
 * Takes the disassembled IR from EclDisasm and emits one `function*` generator
 * per sub. The generator yields frame counts (wait), calls other subs via the
 * runtime context, and maps ECL opcodes to the danmaku primitive library.
 *
 * The output is valid TypeScript that imports from `src/th08/danmaku/` and can
 * be compiled, run, and human-edited.
 */

import { type DisasmSub, type DisasmInstruction, type VarRef } from './EclDisasm';
import type { Block } from './EclDisasm';
import { decodeSpellCard } from './EclSpellCard';
import { FLOAT_FIELD_BY_ID, INT_FIELD_BY_ID } from '../core/EclRegisters';
import { REC } from '../sim/BulletTransform';
import {
  f32ToBits,
  isReg,
  laserWords,
  SHOT_AIM_MODES,
  shotWords,
  unpackLaser,
  unpackShot,
  type LaserDescriptor,
  type Operand,
  type RegisterLookup,
  type ShotDescriptor,
} from '../danmaku/ShotDescriptor';

/**
 * "Is this operand word a register selector?" ? the same question
 * `ResolveInt`/`ResolveFloat` ask at fire time, answered from the same table.
 * An indirect flag over an id that names nothing is inert in retail, so decoding
 * it as a literal here cannot disagree with what the interpreter would have done.
 */
const isRegister: RegisterLookup = (id) =>
  Object.prototype.hasOwnProperty.call(INT_FIELD_BY_ID, id) ||
  Object.prototype.hasOwnProperty.call(FLOAT_FIELD_BY_ID, id);

/** The register a selector names, for the trailing comment. */
function registerName(id: number): string {
  return INT_FIELD_BY_ID[id] ?? FLOAT_FIELD_BY_ID[id] ?? `reg 0x${id.toString(16)}`;
}

/**
 * The shortest decimal that still reads back as this exact single.
 *
 * `0.005` and `0.005000000000000000104083408558608425664715468883514404296875`
 * are the same f32, and only one of them belongs in source a person has to read.
 */
function f32Literal(value: number, word: number): string {
  for (let precision = 1; precision <= 17; precision++) {
    const text = value.toPrecision(precision);
    if (f32ToBits(Number(text)) === word) return text;
  }
  return String(value);
}

/** One descriptor field as source: a literal, or `reg(0x2720)` with its name. */
function emitOperand(operand: Operand, word: number, isFloat: boolean): string {
  if (isReg(operand)) {
    return `reg(0x${operand.reg.toString(16)}) /* ${registerName(operand.reg)} */`;
  }
  return isFloat ? f32Literal(operand, word) : String(operand | 0);
}

/**
 * The launcher's transform word, decoded.
 *
 * `dispatchShot` reads the two form gates and the muzzle-sound bit itself and
 * hands the rest to the bullet-transform chain, whose bit names are `REC`. They
 * are one bit space ? `applyTransformRecord` tests `f & REC.BIRTH_PUSH` on the
 * very word the launcher carried ? so the generated source can name every set bit
 * instead of leaving `515` for someone to look up.
 */
const SHOT_TRANSFORM: Record<string, number> = {
  ...REC,
  /** Fire only while the flying member is the ? half of the team. */
  YOUKAI_ONLY: 0x8000,
  /** The mirror gate: fire only while the ? half is flying. */
  HUMAN_ONLY: 0x10000,
};

/** The transform word as hex plus the names of the bits it actually sets. */
function emitTransform(word: number): string {
  const value = word >>> 0;
  if (value === 0) return '0';
  const names = Object.entries(SHOT_TRANSFORM)
    .filter(([, bit]) => (value & bit) !== 0)
    .map(([name]) => name);
  const hex = `0x${value.toString(16)}`;
  return names.length > 0 ? `${hex} /* ${names.join(' | ')} */` : hex;
}

/**
 * Render a decoded launcher.
 *
 * `shotWords` hands back the ten words in the order `dispatchShot` consumes them,
 * so each field here is the operand at that position: source and runtime agree by
 * construction rather than by review. `ShotDescriptor.test.ts` proves the rebuild
 * is word-for-word faithful over every launcher in the shipped data.
 */
function emitShot(desc: ShotDescriptor, words: ReadonlyArray<number>, op: number): string {
  const int = (name: string, value: Operand) => `  ${name}: ${emitOperand(value, 0, false)},`;
  const flt = (name: string, value: Operand, i: number) =>
    `  ${name}: ${emitOperand(value, words[i] | 0, true)},`;
  return [
    `e.spawnShot({`,
    `  mode: '${desc.mode}', // aim ${SHOT_AIM_MODES.indexOf(desc.mode)} of 96..104`,
    int('type', desc.type),
    int('color', desc.color),
    int('count', desc.count),
    int('rings', desc.rings),
    flt('speed', desc.speed, 4),
    flt('speed2', desc.speed2, 5),
    flt('angle', desc.angle, 6),
    flt('angleStep', desc.angleStep, 7),
    `  transform: ${emitTransform(desc.transform)},`,
    `}); // op ${op}`,
  ].join('\n');
}

/** The laser counterpart of `emitShot`: fifteen words, thirteen of them operands. */
function emitLaser(desc: LaserDescriptor, words: ReadonlyArray<number>, op: number): string {
  const int = (name: string, value: Operand) => `  ${name}: ${emitOperand(value, 0, false)},`;
  const flt = (name: string, value: Operand, i: number) =>
    `  ${name}: ${emitOperand(value, words[i] | 0, true)},`;
  return [
    `e.spawnLaser({`,
    `  aimed: ${desc.aimed}, // op ${op} ${desc.aimed ? 'tracks the ship' : 'keeps the absolute angle'}`,
    `  type: ${desc.type},`,
    int('color', desc.color),
    flt('angle', desc.angle, 2),
    flt('speed', desc.speed, 3),
    flt('tail', desc.tail, 4),
    flt('head', desc.head, 5),
    flt('startLength', desc.startLength, 6),
    flt('width', desc.width, 7),
    int('startTime', desc.startTime),
    int('duration', desc.duration),
    int('despawn', desc.despawn),
    `  hitboxStart: ${desc.hitboxStart},`,
    `  hitboxEnd: ${desc.hitboxEnd},`,
    `  flags: 0x${(desc.flags >>> 0).toString(16)},`,
    `}); // op ${op}`,
  ].join('\n');
}

/** Format a VarRef as a TypeScript expression. */
function emitRef(ref: VarRef): string {
  if (ref.kind === 'literal') {
    const v = ref.value;
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(6).replace(/0+$/, '0');
  }
  return 'e.' + ref.name;
}

/**
 * The destination operand of op 36 exactly as the original stores it. The slot
 * re-resolves it on every frame it runs, so a register has to arrive as its id
 * rather than as its value, while a literal arrives as itself. The name goes in
 * a comment so the generated source stays readable.
 */
function emitRawRef(ref: VarRef): string {
  return ref.kind === 'literal' ? emitRef(ref) : ref.id + ' /* ' + ref.name + ' */';
}

/** JS operator for an ECL compare opcode (float compares behave the same here). */
function cmpOperator(op: string): string {
  return op.endsWith('f') ? op.slice(0, -1) : op;
}

/** Emit one instruction as a TypeScript statement. */
function emitInstruction(ins: DisasmInstruction, indent: string): string[] {
  const op = ins.opcode;
  const info = ins.opInfo;
  const args = ins.args;
  const lines: string[] = [];

  // Difficulty filter
  const guard = ins.diffMask !== 0xff && ins.diffMask !== 0 ? `e.isDiff(${diffParts(ins.diffMask)})` : null;

  const a = (i: number) => (args[i] ? emitRef(args[i]) : 'undefined');

  let stmt = '';

  // Delay: opcode 2 = "wait N frames", where N is either a literal or one of
  // the int registers (the VM reads the register's current value at run time).
  if (op === 2) stmt = `yield e.delay(${a(0)});`;
  // Arithmetic / assignment (opcodes 6-31)
  else if (op === 6 || op === 7) {
    // MOV with the same register on both sides is in the original bytecode. It cannot
    // change any state, so translate it to a comment instead of an assignment that
    // ESLint's no-self-assign is right to reject.
    stmt = a(0) === a(1) ? `// ECL op ${op}: ${a(0)} = ${a(0)} is a no-op` : `${a(0)} = ${a(1)};`;
  } else if (op === 8) stmt = `${a(0)} = e.randSign(${a(1)});`;
  else if (op === 9) stmt = `${a(0)} = e.randSignF(${a(1)});`;
  else if (op === 10) stmt = `${a(0)} += ${a(1)};`;
  else if (op === 11) stmt = `${a(0)} -= ${a(1)};`;
  else if (op === 12) stmt = `${a(0)} *= ${a(1)};`;
  else if (op === 13) stmt = `${a(0)} = Math.trunc(${a(0)} / ${a(1)});`;
  else if (op === 14) stmt = `${a(0)} %= ${a(1)};`;
  else if (op === 15) stmt = `${a(0)} += ${a(1)};`;
  else if (op === 16) stmt = `${a(0)} -= ${a(1)};`;
  else if (op === 17) stmt = `${a(0)} *= ${a(1)};`;
  else if (op === 18) stmt = `${a(0)} /= ${a(1)};`;
  else if (op === 19) stmt = `${a(0)} %= ${a(1)};`;
  else if (op >= 20 && op <= 24) {
    const ops = ['+', '-', '*', '/', '%'];
    stmt = `${a(0)} = ${a(1)} ${ops[op - 20]} ${a(2)};`;
  } else if (op >= 25 && op <= 29) {
    const ops = ['+', '-', '*', '/', '%'];
    stmt = `${a(0)} = ${a(1)} ${ops[op - 25]} ${a(2)};`;
  } else if (op === 30) stmt = `${a(0)}++;`;
  else if (op === 31) stmt = `${a(0)}--;`;
  else if (op === 32) stmt = `${a(0)} = Math.sin(${a(1)});`;
  else if (op === 33) stmt = `${a(0)} = Math.cos(${a(1)});`;
  else if (op === 34) stmt = `${a(0)} = Math.atan2(${a(4)} - ${a(2)}, ${a(3)} - ${a(1)});`;
  else if (op === 37) stmt = `${a(0)} = normalizeAngle(${a(0)});`;
  else if (op === 38) stmt = `${a(0)} = Math.cos(${a(2)}) * ${a(3)}; ${a(1)} = Math.sin(${a(2)}) * ${a(3)};`;
  else if (op === 39) stmt = `${a(0)} = Math.hypot(${a(1)} - ${a(3)}, ${a(2)} - ${a(4)});`;
  // Op 35 is the same shape as the arithmetic ops: one write, three reads.
  else if (op === 35) stmt = `${a(0)} = (${a(1)} - ${a(2)}) * ${a(3)} + ${a(2)};`;
  // Op 36 hands the slot the destination operand raw, because the original
  // resolves it again on every frame the interpolator runs.
  else if (op === 36) {
    const raw0 = args[0] ? emitRawRef(args[0]) : 'undefined';
    stmt = `e.interpSlot(${raw0}, ${a(1)}, ${a(2)}, ${a(3)}, ${a(4)}, ${a(5)}, ${a(6)}, ${a(7)});`;
  }

  // ANM / sprite setup
  else if (op === 54) stmt = `e.setAnm(${a(0)});`;
  else if (op === 55) stmt = `e.setAnmScripts6(${a(0)});`;
  else if (op === 56) stmt = `e.setAnmScripts6x(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)}, ${a(4)}, ${a(5)});`;
  else if (op === 58) stmt = `e.setAnmAlt(${a(0)});`;
  else if (op === 62) stmt = `e.autoAnm();`;

  // Movement
  // Ops 64 and 67 use the generic branch, whose operand list comes from the
  // signature in EclOpcodes.
  else if (op === 63) stmt = `e.setRelPos(${a(0)}, ${a(1)});`;
  else if (op === 65) stmt = `e.setHeadingSpeed(${a(0)}, ${a(1)});`;
  else if (op === 66) stmt = `e.movePolar(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)});`;
  else if (op === 68) stmt = `e.moveToPlayer(${a(0)}, ${a(1)});`;
  else if (op === 69) stmt = `e.moveToPlayerPolar(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)});`;
  else if (op === 70) stmt = `e.setHeadingVel(${a(0)});`;
  else if (op === 71) stmt = `e.setSpeedAccel(${a(0)});`;
  else if (op === 72) stmt = `e.moveOrbit(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)}, ${a(4)}, ${a(5)}, ${a(6)});`;
  else if (op === 73) stmt = `e.moveArc(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)});`;
  else if (op === 74) stmt = `e.setAccel(${a(0)}, ${a(1)}, ${a(2)});`;
  else if (op === 75) stmt = `e.setMotionClamp(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)});`;
  else if (op === 76) stmt = `e.clearMotionClamp();`;
  else if (op === 77) stmt = `e.setBounds(${a(0)}, ${a(1)});`;
  else if (op === 78) stmt = `e.setBoundsAlt(${a(0)}, ${a(1)});`;

  // Flags / hitbox
  else if (op === 79) stmt = `e.writeScriptFlags(${a(0)});`;
  else if (op === 80) stmt = `e.clearScriptFlags(${a(0)});`;
  else if (op === 81) stmt = `e.setScriptFlags(${a(0)});`;
  else if (op === 82) stmt = `e.setShotNoFireRadius(${a(0)});`;
  else if (op === 83) stmt = `e.setHitFlash(${a(0)});`;

  // Remote / params
  else if (op === 86) stmt = `${a(0)} = e.readIntRemote(${a(1)}, ${a(2)});`;
  else if (op === 87) stmt = `${a(0)} = e.readFloatRemote(${a(1)}, ${a(2)});`;
  else if (op === 88) stmt = `e.callSubRemote(${a(0)}, ${a(1)});`;
  else if (op === 89) stmt = `e.setParams(${a(0)}, ${a(1)});`;

  // Linked children (ops 90..92). The three variants differ only in where the
  // familiar lands and whether it keeps riding its parent, so the operand list
  // is shared and the register references have to survive into the call.
  else if (op >= 90 && op <= 92) {
    const name = op === 90 ? 'linkChildStandard' : op === 91 ? 'linkChildRelative' : 'linkChildAttached';
    stmt = `e.${name}(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)}, ${a(4)}, ${a(5)});`;
  }

  // Spawn
  else if (op === 93) stmt = `e.spawnEnemy(${ins.operands.map(String).join(', ')});`;
  else if (op === 94) stmt = `e.spawnEnemyAlt(${ins.operands.map(String).join(', ')});`;

  // Boss
  else if (op === 105) stmt = `e.setShotRepeat(${a(0)});`;
  else if (op === 106) stmt = `e.setShotRepeatRand(${a(0)});`;
  else if (op === 112) stmt = `e.clearAllBullets();`;
  else if (op === 118) stmt = `e.aimAtPlayer(${a(0)}, ${a(1)});`;
  else if (op === 124) stmt = `e.playSfx(${a(0)});`;
  else if (op === 127) stmt = `e.setBossPresent(${a(0)});`;
  else if (op === 128) stmt = `e.spawnEffect(${ins.operands.map(String).join(', ')});`;
  else if (op === 131) stmt = `e.setLives(${a(0)});`;
  else if (op === 137) stmt = `e.setTimeout(${a(0)});`;
  else if (op === 141) stmt = `e.spawnItem(${a(0)});`;
  else if (op === 148) stmt = `e.eclSetLives(${a(0)});`;
  else if (op === 158) stmt = `e.setLifeBarSlice(${a(0)}, ${a(1)}, ${a(2)}, ${a(3)});`;
  else if (op === 161) stmt = `e.removeBulletsRadius(${a(0)});`;
  else if (op === 162) stmt = `e.removeAllBullets();`;
  else if (op === 179) stmt = `e.startStageBg();`;

  // The launchers and the lasers are the two instructions whose operands the
  // interpreter resolves itself, at fire time, against the register file. They are
  // decoded here into a descriptor: literals come out as numbers, register
  // selectors stay selectors and arrive as `reg(id)`, and `packShot`/`packLaser`
  // rebuild the exact word vector the original handler saw. That is what lets the
  // source say `angle: reg(0x2720) /* f0 */` where it used to say `0`.
  //
  // `ShotDescriptor.test.ts` proves the rebuild is faithful over every launcher and
  // laser in all nine shipped `.ecl` files, so nothing here can drift silently.
  else if (op >= 96 && op <= 104) {
    const words = shotWords(op, ins.operands, ins.operandFlags);
    stmt = emitShot(unpackShot(words, isRegister), words, op);
  } else if (op === 114 || op === 115) {
    const words = laserWords(op, ins.operands, ins.operandFlags);
    stmt = emitLaser(unpackLaser(words, isRegister), words, op);
  }

  // Spell-card declaration. Unlike the launchers this blob is pure data — two
  // XOR'd Shift-JIS strings plus three scalars — so decoding it here is what lets
  // the generated script read like a card list instead of fifty magic words.
  else if (op === 122) {
    const card = decodeSpellCard(ins.operands);
    stmt =
      `e.startSpell(${JSON.stringify(card.name)}, ${JSON.stringify(card.owner)}, ` +
      `${card.number}, ${card.face}, ${card.bonus});`;
  } else if (op === 123) {
    stmt = `e.endSpell();`;
  }

  // Default: emit as a generic call with the opcode name
  else {
    const argList = args.map((_, i) => a(i)).join(', ');
    stmt = `e.${info.name}(${argList}); // op ${op}`;
  }

  if (guard) {
    lines.push(`${indent}if (${guard}) {`);
    lines.push(indentBlock(stmt, `${indent}  `));
    lines.push(`${indent}}`);
  } else {
    lines.push(indentBlock(stmt, indent));
  }

  return lines;
}

/** Indent a possibly multi-line statement one block deeper. */
function indentBlock(stmt: string, indent: string): string {
  return stmt
    .split('\n')
    .map((line) => `${indent}${line}`)
    .join('\n');
}

/** Difficulty names for a bitmask, e.g. `HARD | LUNATIC`. */
function diffParts(mask: number): string {
  const parts: string[] = [];
  if (mask & 0x01) parts.push('EASY');
  if (mask & 0x02) parts.push('NORMAL');
  if (mask & 0x04) parts.push('HARD');
  if (mask & 0x08) parts.push('LUNATIC');
  if (mask & 0x10) parts.push('EXTRA');
  return parts.join(' | ');
}

/** Opcodes consumed by the block graph instead of becoming statements. */
const CONTROL_OPS = new Set([1, 4, 5, 52, 53]);

function isControl(ins: DisasmInstruction): boolean {
  return CONTROL_OPS.has(ins.opcode) || (ins.opcode >= 40 && ins.opcode <= 51);
}

/** Loop counters that are literals need a home that survives re-entry. */
function counterRef(exit: { kind: 'loop'; counter: VarRef }, locals: Map<VarRef, string>): string {
  const c = exit.counter;
  if (c.kind !== 'literal') return emitRef(c);
  let name = locals.get(c);
  if (!name) {
    name = `__loop${locals.size}`;
    locals.set(c, name);
  }
  return name;
}

/** Emit one `case N:` arm of the dispatch switch, mirroring the block exit. */
function emitBlock(block: Block, blocks: Block[], known: Set<number>, locals: Map<VarRef, string>): string[] {
  const i = '      ';
  const b = '        ';
  const lines: string[] = [`${i}case ${block.id}: {`];
  const fallLine = block.id + 1 < blocks.length ? `pc = ${block.id + 1};` : 'return;';
  const exit = block.exit;

  for (const ins of block.instructions) {
    if (isControl(ins)) continue;
    lines.push(...emitInstruction(ins, b));
  }

  switch (exit.kind) {
    case 'fall':
      lines.push(`${b}${fallLine}`);
      break;

    case 'wait':
      if (exit.frames > 0) lines.push(`${b}yield ${exit.frames};`);
      lines.push(`${b}${fallLine}`);
      break;

    case 'return':
      if (exit.guard) {
        lines.push(`${b}if (${exit.guard}) return;`);
        lines.push(`${b}${fallLine}`);
      } else {
        lines.push(`${b}return;`);
      }
      break;

    case 'call': {
      const call = known.has(exit.subId)
        ? `yield* sub_${exit.subId}(e);`
        : `e.nop(${exit.subId}); // callSub sub_${exit.subId} is not present in this file`;
      if (exit.guard) lines.push(`${b}if (${exit.guard}) ${call}`);
      else lines.push(`${b}${call}`);
      lines.push(`${b}${fallLine}`);
      break;
    }

    default: {
      // jump / loop / branch: a conditional transfer of control.
      const targetLine = exit.targetBlock >= 0 ? `pc = ${exit.targetBlock};` : 'return;';

      if (exit.kind === 'jump' && !exit.guard) {
        if (exit.waitBefore > 0) lines.push(`${b}yield ${exit.waitBefore};`);
        lines.push(`${b}${targetLine}`);
        break;
      }

      let cond: string;
      if (exit.kind === 'jump') cond = exit.guard as string;
      else if (exit.kind === 'loop') {
        const ref = counterRef(exit, locals);
        cond = `${exit.guard ? `${exit.guard} && ` : ''}--${ref} > 0`;
      } else {
        cond = `${exit.guard ? `${exit.guard} && ` : ''}${emitRef(exit.lhs)} ${cmpOperator(exit.op)} ${emitRef(exit.rhs)}`;
      }
      lines.push(`${b}if (${cond}) {`);
      if (exit.waitBefore > 0) lines.push(`${b}  yield ${exit.waitBefore};`);
      lines.push(`${b}  ${targetLine}`);
      lines.push(`${b}  break;`);
      lines.push(`${b}}`);
      lines.push(`${b}${fallLine}`);
      break;
    }
  }

  // Every arm ends in an unconditional break; the dispatcher owns `pc` -- except the ones
  // whose last statement is already a bare `return;`, whether the script ended there or
  // the block simply ran off the end of the sub. Adding a break to those is unreachable
  // code, and 446 instances of it were in the translated output before anyone looked.
  if (lines.at(-1) !== `${b}return;`) lines.push(`${i}  break;`);
  lines.push(`${i}}`);
  return lines;
}

/** Emit every sub of one ECL file as a dispatch-loop generator. */
export function emitEclFile(subs: DisasmSub[], fileName: string): string {
  const known = new Set(subs.map((s) => s.id));
  const lines: string[] = [
    `// ${fileName}: ${subs.length} subs, translated by tools/th08/ecl`,
    '// Each sub is a generator whose body is the original ECL control-flow graph',
    '// replayed as a block dispatcher: `pc` is a block id, `yield n` waits n',
    '// frames, and jumps/loops/gotos keep the exact structure ZUN compiled.',
    '',
  ];

  for (const sub of subs) {
    if (sub.instructions.length === 0) {
      lines.push('// eslint-disable-next-line require-yield -- the original sub has no instructions');
      lines.push(`export function* sub_${sub.id}(e: EnemyCtx): Generator<number, void, void> {`);
      lines.push('  // Empty forward declaration in the original ECL.');
      lines.push('  void e;');
      lines.push('}');
      lines.push('');
      continue;
    }

    const locals = new Map<VarRef, string>();
    const body: string[] = [];
    for (const block of sub.blocks) body.push(...emitBlock(block, sub.blocks, known, locals));

    const head = lines.length;
    lines.push(`export function* sub_${sub.id}(e: EnemyCtx): Generator<number, void, void> {`);
    lines.push('  let pc = 0;');
    for (const [ref, name] of locals) lines.push(`  let ${name} = ${emitRef(ref)};`);
    if (sub.blocks.length > 0 && sub.blocks[0].entryTime > 0) {
      lines.push(
        `  yield ${sub.blocks[0].entryTime}; // the script starts at frame ${sub.blocks[0].entryTime}`,
      );
    }
    lines.push('  let steps = 0;');
    lines.push('  while (pc >= 0) {');
    lines.push('    // A loop body with no waits would otherwise spin inside one frame.');
    lines.push('    if (++steps > 2000) { steps = 0; yield 1; }');
    lines.push('    switch (pc) {');
    lines.push(...body);
    lines.push('      default:');
    lines.push('        return;');
    lines.push('    }');
    lines.push('  }');
    lines.push('}');
    lines.push('');
    // A script that only waits and jumps never touches the enemy it belongs to, and
    // `noUnusedParameters` is right about that one: name the context `_e`, so the
    // translated modules type-check without a blanket exemption.
    if (!lines.slice(head + 1, lines.length - 1).some((line) => /\be\b/.test(line))) {
      lines[head] = lines[head].replace('(e: EnemyCtx)', '(_e: EnemyCtx)');
    }
  }

  return lines.join('\n');
}
