/**
 * ECL disassembler: turn raw EclFile instructions into a structured IR.
 *
 * Phase 1: linearize — attach opcode info, resolve variable references.
 * Phase 2: control flow — identify wait/jump/loop/call/compare-branch, build
 *          a block graph with structured if/while/for equivalents.
 * Phase 3: variable naming — map 0x2710..0x2762 register IDs to semantic names.
 *
 * The output IR is what emit-ts.mjs consumes to produce generator functions.
 */

import { type EclInstruction, type EclSub, type EclFile } from './EclFile';
import { ECL_OPCODES, type OpcodeInfo } from './EclOpcodes';

/** Decoded variable reference: register id or literal. */
export type VarRef =
  | { kind: 'literal'; value: number }
  | { kind: 'int'; id: number; name: string }
  | { kind: 'float'; id: number; name: string };

/** One disassembled instruction with named operands. */
export interface DisasmInstruction {
  offset: number;
  time: number;
  opcode: number;
  opInfo: OpcodeInfo;
  diffMask: number;
  operands: number[];
  operandFlags: number;
  /** Resolved operand references (literal or variable). */
  args: VarRef[];
}

/** How a block hands control over to the next one. */
export type BlockExit =
  | { kind: 'fall'; guard: string | null } // falls to next block
  | { kind: 'return'; guard: string | null } // sub ends
  /** Frames to wait before resuming at the target; 0 for backward jumps. */
  | {
      kind: 'jump';
      targetOffset: number;
      targetBlock: number;
      targetTime: number;
      waitBefore: number;
      guard: string | null;
    }
  | {
      kind: 'loop';
      targetOffset: number;
      targetBlock: number;
      targetTime: number;
      waitBefore: number;
      counter: VarRef;
      guard: string | null;
    }
  | {
      kind: 'branch';
      targetOffset: number;
      targetBlock: number;
      targetTime: number;
      waitBefore: number;
      op: string;
      lhs: VarRef;
      rhs: VarRef;
      guard: string | null;
    }
  | { kind: 'call'; subId: number; guard: string | null }
  | { kind: 'wait'; frames: number };

/** A basic block: a straight-line sequence between control-flow edges. */
export interface Block {
  id: number;
  /** Absolute file offset of the first instruction — the jump landing pad. */
  entryOffset: number;
  /** Script time of the first instruction, used for resume accounting. */
  entryTime: number;
  instructions: DisasmInstruction[];
  /** Control flow at the end of the block. */
  exit: BlockExit;
}

/** `e.isDiff(...)` condition for an instruction, or null when it always runs. */
function diffGuard(ins: { difficultyMask?: number; diffMask?: number }): string | null {
  const mask = (ins.diffMask ?? ins.difficultyMask ?? 0xff) & 0xff;
  if (mask === 0xff || mask === 0) return null;
  const parts: string[] = [];
  if (mask & 0x01) parts.push('EASY');
  if (mask & 0x02) parts.push('NORMAL');
  if (mask & 0x04) parts.push('HARD');
  if (mask & 0x08) parts.push('LUNATIC');
  if (mask & 0x10) parts.push('EXTRA');
  return `e.isDiff(${parts.join(' | ')})`;
}

/** A fully disassembled sub, ready for the TS emitter. */
export interface DisasmSub {
  id: number;
  blocks: Block[];
  /** Flattened instruction list (convenience for linear iteration). */
  instructions: DisasmInstruction[];
}

// --- Variable register table (from EclOperandsInt/Float.cpp) ---

const INT_VARS: Record<number, string> = {
  0x2710: 'i0',
  0x2711: 'i1',
  0x2712: 'i2',
  0x2713: 'i3',
  0x2714: 'i4',
  0x2715: 'i5',
  0x2716: 'i6',
  0x2717: 'i7',
  0x2718: 'ei0',
  0x2719: 'ei1',
  0x271a: 'ei2',
  0x271b: 'ei3',
  0x271c: 'ei4',
  0x271d: 'ei5',
  0x271e: 'ei6',
  0x271f: 'ei7',
  0x2730: 'randU31',
  0x2731: 'randF32i',
  0x2732: 'randU32',
  0x2733: 'randF32Si',
  0x2734: 'ci0',
  0x2735: 'ci1',
  0x2736: 'ci2',
  0x2737: 'ci3',
  0x2738: 'difficulty',
  0x2739: 'rank',
  0x2741: 'hp',
  0x2743: 'maxHp',
  0x2744: 'shotType',
  0x2745: 'cxi0',
  0x2746: 'cxi1',
  0x2747: 'cxi2',
  0x2748: 'cxi3',
  0x274d: 'param0',
  0x274e: 'param1',
  0x274f: 'param2',
  0x2750: 'param3',
  0x276e: 'cf0i',
  0x276f: 'cf1i',
  // `EclOperandsInt.cpp:120-135`: the observed velocity triple, the four
  // life-bar thresholds, the last damage taken, and the boss marker seat.
  0x2763: 'lastDamage',
  0x2764: 'bossMarker',
  0x2765: 'velocityX',
  0x2766: 'velocityY',
  0x2767: 'velocityZ',
  0x2768: 'phase0',
  0x2769: 'phase1',
  0x276a: 'phase2',
  0x276b: 'phase3',
  // `EclOperandsInt.cpp:152-162`: three computed globals a script reads as if
  // they were registers. Naming them is what keeps `if (10099 < 600)` from
  // ever reaching the generated source.
  0x2770: 'parentChainCount',
  0x2771: 'playerIsYoukai',
  0x2772: 'timeOrbReady',
  0x2773: 'spellCardState',
  0x2774: 'spellCardTimer',
};

const FLOAT_VARS: Record<number, string> = {
  0x2720: 'f0',
  0x2721: 'f1',
  0x2722: 'f2',
  0x2723: 'f3',
  0x2724: 'f4',
  0x2725: 'f5',
  0x2726: 'f6',
  0x2727: 'f7',
  0x2728: 'ef0',
  0x2729: 'ef1',
  0x272a: 'ef2',
  0x272b: 'ef3',
  0x272c: 'ef4',
  0x272d: 'ef5',
  0x272e: 'ef6',
  0x272f: 'ef7',
  0x2730: 'randU31f',
  0x2731: 'randF32',
  0x2732: 'randU32f',
  0x2733: 'randF32S',
  0x2738: 'difficultyF',
  0x2739: 'rankF',
  0x273a: 'posX',
  0x273b: 'posY',
  0x273c: 'posZ',
  0x273d: 'playerX',
  0x273e: 'playerY',
  0x2741: 'hpF',
  0x2743: 'maxHpF',
  0x2744: 'shotTypeF',
  0x2749: 'cxf0',
  0x274a: 'cxf1',
  0x274b: 'cxf2',
  0x274c: 'cxf3',
  0x274d: 'param0f',
  0x274e: 'param1f',
  0x274f: 'param2f',
  0x2750: 'param3f',
  0x2751: 'fparam0',
  0x2752: 'fparam1',
  0x2753: 'fparam2',
  0x2754: 'fparam3',
  0x2762: 'randAngle',
  // `EclOperandsFloat.cpp:85-86` exposes the drop queue and the score as floats;
  // the old `enemyType`/`enemySlot` names here did not match either switch.
  0x276c: 'dropType',
  0x276d: 'scoreValue',
  0x273f: 'playerZ',
  0x2740: 'timer',
  0x2742: 'hpRatio',
  // `EclOperandsFloat.cpp:139-145`: 0x2755 is the movement heading
  // (`enemy+0x2D94`) the fan patterns are laid out around, 0x275d/0x275e drive the
  // orbit producer, and 0x275a..0x275c are the tween origin. Every one of them
  // needs real storage because the ECL keeps writing them as it moves.
  0x2755: 'moveAngle',
  0x2756: 'headingVel',
  0x2757: 'moveSpeed',
  0x2758: 'speedAccel',
  0x2759: 'orbitRadius',
  0x275a: 'originX',
  0x275b: 'originY',
  0x275c: 'originZ',
  0x275d: 'orbitAngle',
  0x275e: 'orbitAngleVel',
  0x275f: 'tweenDX',
  0x2760: 'tweenDY',
  // The rest of the `Enemy` vectors and scalars the shipped scripts read.
  // `0x2761` is the Z of the same tween-displacement vector as 0x275f/0x2760
  // (`enemy+0x2DC4/0x2DC8/0x2DCC`), `0x2765..0x2767` are the displacement the
  // integrator produced last frame (`enemy+0x2D64`, `Enemy::FUN_0042deb0`),
  // and `0x2768..0x276B` expose the op 133 life-bar thresholds as floats.
  0x2761: 'tweenDZ',
  0x2763: 'lastDamage',
  0x2764: 'bossMarker',
  0x2765: 'velocityX',
  0x2766: 'velocityY',
  0x2767: 'velocityZ',
  0x2768: 'phase0',
  0x2769: 'phase1',
  0x276a: 'phase2',
  0x276b: 'phase3',
  // `EclOperandsFloat.cpp:122-123`: a second context float pair at +0x68,
  // distinct from `cxf0..3` at +0x80. The int switch reads the same two
  // dwords truncated, which is why it names them `cf0i`/`cf1i`.
  0x276e: 'cf0',
  0x276f: 'cf1',
  // `EclOperandsFloat.cpp:149-154`: the float switch reads the attach chain too.
  // 0x2772 deliberately stays out -- `:167-168` lets it fall through to
  // `default: return operand`, so only the int switch resolves it, and naming it
  // here would have a float operand read the last-spell test retail hands back as
  // the raw 10098.0.
  0x2770: 'parentChainCount',
};

const CMP_NAMES: Record<number, string> = {
  40: '==',
  41: '==f',
  42: '!=',
  43: '!=f',
  44: '<',
  45: '<f',
  46: '<=',
  47: '<=f',
  48: '>',
  49: '>f',
  50: '>=',
  51: '>=f',
};

/** Resolve one operand to a variable ref or literal. */
function resolveOperand(raw: number, flags: number, index: number, sigType: string): VarRef {
  const isIndirect = (flags & (1 << index)) !== 0;
  const isWrite = sigType === 'Iw' || sigType === 'Fw';
  const isFloatSig = sigType === 'F' || sigType === 'Fw';
  const isIntSig = sigType === 'I' || sigType === 'Iw';

  // For float-typed operands, ZUN stores register IDs as their float
  // representation (e.g. register 0x2720 = 10016 is stored as 10016.0f =
  // 0x461C8000). So we reinterpret the raw i32 as f32 and check that.
  if (isFloatSig) {
    const asFloat = new Float32Array(new Int32Array([raw]).buffer)[0];
    const asId = Math.round(asFloat);
    if ((isIndirect || isWrite) && (FLOAT_VARS[asId] || INT_VARS[asId])) {
      const name = FLOAT_VARS[asId] ?? INT_VARS[asId];
      return { kind: FLOAT_VARS[asId] ? 'float' : 'int', id: asId, name };
    }
    // Plain float literal
    return { kind: 'literal', value: asFloat };
  }

  // For int-typed operands, the raw value IS the register ID directly.
  if (isIntSig) {
    if ((isIndirect || isWrite) && (INT_VARS[raw] || FLOAT_VARS[raw])) {
      const name = INT_VARS[raw] ?? FLOAT_VARS[raw];
      return { kind: INT_VARS[raw] ? 'int' : 'float', id: raw, name };
    }
    return { kind: 'literal', value: raw };
  }

  // Unknown / raw: try both tables then fall back to literal.
  //
  // An operand flag means the interpreter runs the value through
  // `ResolveInt`/`ResolveFloat` no matter what the opcode table happens to
  // record, and float register ids travel as their float representation
  // (`0x2720` arrives as `10016.0f` = `1176272896`). Without this the
  // undocumented signatures leaked a raw id into the script as a literal, so
  // `moveRelative` steered every stage enemy 10016 px away and the bounds cull
  // erased it a frame later.
  if (isIndirect) {
    if (INT_VARS[raw]) return { kind: 'int', id: raw, name: INT_VARS[raw] };
    if (FLOAT_VARS[raw]) return { kind: 'float', id: raw, name: FLOAT_VARS[raw] };
    const asFloat = new Float32Array(new Int32Array([raw]).buffer)[0];
    const asId = Math.round(asFloat);
    if (FLOAT_VARS[asId]) return { kind: 'float', id: asId, name: FLOAT_VARS[asId] };
    if (INT_VARS[asId]) return { kind: 'int', id: asId, name: INT_VARS[asId] };
  }
  if (INT_VARS[raw]) return { kind: 'int', id: raw, name: INT_VARS[raw] };
  if (FLOAT_VARS[raw]) return { kind: 'float', id: raw, name: FLOAT_VARS[raw] };
  return { kind: 'literal', value: raw };
}

function disasmInstruction(ins: EclInstruction): DisasmInstruction {
  const opInfo = ECL_OPCODES[ins.opcode] ?? { name: 'unk' + ins.opcode, sig: [], desc: '' };
  const args: VarRef[] = [];
  // `operandFlags` is numbered by declared parameter, so an opcode whose first
  // word carries two i16 parameters shifts every later bit one place up.
  const flags = ins.operandFlags >>> (opInfo.packedFirst ? 1 : 0);
  for (let i = 0; i < ins.operands.length; i++) {
    const sigType = opInfo.sig[i] ?? '?';
    args.push(resolveOperand(ins.operands[i], flags, i, sigType));
  }
  return {
    offset: ins.offset,
    time: ins.time,
    opcode: ins.opcode,
    opInfo,
    diffMask: ins.difficultyMask,
    operands: [...ins.operands],
    operandFlags: ins.operandFlags,
    args,
  };
}

/**
 * Absolute instruction offset a relative-jump opcode lands on, or null.
 *
 * Offsets in ECL are relative to the jump instruction itself, so they resolve
 * to a stable file position that survives re-blockification.
 */
function jumpTarget(ins: DisasmInstruction): number | null {
  if (ins.opcode < 40 && ins.opcode !== 4 && ins.opcode !== 5) return null;
  if (ins.opcode >= 40 && ins.opcode <= 51)
    return ins.operands.length > 3 ? ins.offset + ins.operands[3] : null;
  if (ins.opcode === 4 || ins.opcode === 5)
    return ins.operands.length > 1 ? ins.offset + ins.operands[1] : null;
  return null;
}

/** Loop opcode 5 counts down in an int register (always `ci0`-style in th08). */
function resolveLoopCounter(ins: DisasmInstruction): VarRef {
  const ref = ins.args[2];
  if (ref && ref.kind !== 'literal') return ref;
  const raw = ins.operands[2];
  if (raw !== undefined && (INT_VARS[raw] || FLOAT_VARS[raw])) {
    return { kind: INT_VARS[raw] ? 'int' : 'float', id: raw, name: INT_VARS[raw] ?? FLOAT_VARS[raw] };
  }
  return { kind: 'literal', value: Number.isFinite(raw) ? raw : 0 };
}

/**
 * Disassemble one sub into a linear instruction list + basic blocks.
 *
 * Blocks are cut at every control-flow opcode, every script-time boundary and
 * every jump target, so the emitter can dispatch on block id and keep the
 * original while / if-goto structure of the compiled ECL intact.
 */
export function disasmSub(sub: EclSub): DisasmSub {
  const instructions = sub.instructions.map(disasmInstruction);

  const targets = new Set<number>();
  for (const ins of instructions) {
    const t = jumpTarget(ins);
    if (t !== null) targets.add(t);
  }

  const blocks: Block[] = [];
  let current: DisasmInstruction[] = [];

  function flush(entryOffset: number, entryTime: number, exit: BlockExit) {
    blocks.push({ id: blocks.length, entryOffset, entryTime, instructions: current, exit });
    current = [];
  }

  for (let i = 0; i < instructions.length; i++) {
    const ins = instructions[i];
    const op = ins.opcode;
    const guard = diffGuard(ins);

    // A jump landing pad must be the first instruction of its own block.
    if (targets.has(ins.offset) && current.length > 0)
      flush(current[0].offset, current[0].time, { kind: 'fall', guard: null });

    const entryOffset = current.length > 0 ? current[0].offset : ins.offset;
    const entryTime = current.length > 0 ? current[0].time : ins.time;

    // Return: opcode 1 — the sub ends here, but later blocks may still be
    // reachable from a jump, so linearization continues.
    if (op === 1) {
      flush(entryOffset, entryTime, { kind: 'return', guard });
      continue;
    }

    current.push(ins);

    // Jump / counted loop / compare-branch: all three carry a relative offset.
    if (op === 4 || op === 5 || (op >= 40 && op <= 51)) {
      const targetOffset = jumpTarget(ins);
      if (targetOffset === null) {
        flush(entryOffset, entryTime, { kind: 'fall', guard: null });
        continue;
      }
      const exit: BlockExit =
        op === 4
          ? { kind: 'jump', targetOffset, targetBlock: -1, targetTime: ins.operands[0], waitBefore: 0, guard }
          : op === 5
            ? {
                kind: 'loop',
                counter: resolveLoopCounter(ins),
                targetOffset,
                targetBlock: -1,
                targetTime: ins.operands[0],
                waitBefore: 0,
                guard,
              }
            : {
                kind: 'branch',
                op: CMP_NAMES[op] ?? '==',
                lhs: ins.args[0] ?? { kind: 'literal', value: 0 },
                rhs: ins.args[1] ?? { kind: 'literal', value: 0 },
                targetOffset,
                targetBlock: -1,
                targetTime: ins.operands[2],
                waitBefore: 0,
                guard,
              };
      flush(entryOffset, entryTime, exit);
      continue;
    }

    // Call sub: opcode 52 — the callee runs inline, then we carry on.
    if (op === 52) {
      flush(entryOffset, entryTime, { kind: 'call', subId: ins.operands[0], guard });
      continue;
    }

    // Return from sub: opcode 53 — bookkeeping only, execution continues.
    if (op === 53) {
      flush(entryOffset, entryTime, { kind: 'fall', guard: null });
      continue;
    }

    // Time boundary: the VM idles until the frame counter reaches the next
    // instruction's time, which is the generator's natural yield point.
    const next = instructions[i + 1];
    if (next && next.time !== ins.time) {
      flush(entryOffset, entryTime, { kind: 'wait', frames: next.time - ins.time });
    }
  }

  if (current.length > 0) flush(current[0].offset, current[0].time, { kind: 'return', guard: null });

  // Resolve absolute jump targets to block ids, then turn the resume time into
  // the frame delay the generator has to insert before hopping.
  const entryAt = new Map<number, number>();
  const sortedEntries: Array<{ offset: number; id: number }> = [];
  for (const block of blocks) {
    if (!entryAt.has(block.entryOffset)) {
      entryAt.set(block.entryOffset, block.id);
      sortedEntries.push({ offset: block.entryOffset, id: block.id });
    }
  }
  sortedEntries.sort((a, b) => a.offset - b.offset);

  function blockForOffset(offset: number): number {
    const exact = entryAt.get(offset);
    if (exact !== undefined) return exact;
    let lo = 0;
    let hi = sortedEntries.length - 1;
    let best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (sortedEntries[mid].offset <= offset) {
        best = sortedEntries[mid].id;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    if (best >= 0) return best;
    return sortedEntries.length > 0 ? sortedEntries[0].id : -1;
  }

  for (const block of blocks) {
    const exit = block.exit;
    if (exit.kind !== 'jump' && exit.kind !== 'loop' && exit.kind !== 'branch') continue;
    exit.targetBlock = blockForOffset(exit.targetOffset);
    const target = blocks[exit.targetBlock];
    const here =
      block.instructions.length > 0
        ? block.instructions[block.instructions.length - 1].time
        : block.entryTime;
    exit.waitBefore = target ? Math.max(0, target.entryTime - here) : 0;
  }

  return { id: sub.id, blocks, instructions };
}

/** Disassemble an entire ECL file. */
export function disasmEcl(ecl: EclFile): DisasmSub[] {
  return ecl.subs.map(disasmSub);
}

/** Pretty-print one disassembled sub for debugging. */
export function formatSub(sub: DisasmSub): string {
  const lines: string[] = [`sub_${sub.id}:`];
  for (const block of sub.blocks) {
    lines.push(`  block_${block.id}:`);
    for (const ins of block.instructions) {
      const diff = ins.diffMask !== 0xff ? ` [diff:${ins.diffMask.toString(2).padStart(8, '0')}]` : '';
      const argStr = ins.args.map((a) => (a.kind === 'literal' ? String(a.value) : a.name)).join(', ');
      lines.push(`    @${ins.time} ${ins.opInfo.name}(${argStr})${diff}`);
    }
    const ex = block.exit;
    const guard = 'guard' in ex && ex.guard ? ` if ${ex.guard}` : '';
    if (ex.kind === 'wait') lines.push(`    ->${guard} wait ${ex.frames}`);
    else if (ex.kind === 'return') lines.push(`    ->${guard} return`);
    else if (ex.kind === 'fall') lines.push(`    ->${guard} fall`);
    else if (ex.kind === 'jump') lines.push(`    ->${guard} jump block_${ex.targetBlock} @${ex.targetTime}`);
    else if (ex.kind === 'loop') lines.push(`    ->${guard} loop block_${ex.targetBlock} @${ex.targetTime}`);
    else if (ex.kind === 'branch')
      lines.push(`    ->${guard} if ${ex.op} goto block_${ex.targetBlock} @${ex.targetTime}`);
    else if (ex.kind === 'call') lines.push(`    ->${guard} call sub_${ex.subId}`);
  }
  return lines.join('\n');
}
