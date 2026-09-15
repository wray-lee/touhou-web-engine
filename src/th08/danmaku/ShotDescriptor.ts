/**
 * Structured form of the two ECL operand blobs that used to reach the runtime as
 * raw words: the shot launchers (ops 96..104) and the lasers (ops 114/115).
 *
 * Both instructions pack their parameters into i32 words and mark, one bit per
 * parameter in `operandFlags`, whether that word is a literal or a register id
 * that has to be read out of the enemy's register file at fire time. Handing that
 * blob straight through is what made 1 064 generated call sites read as
 * `e.spawnShot(0, 393216, 1, 1, 1065353216, ...)`, where `1065353216` is really
 * `1.0f` and `393216` is really "bullet 6, colour 6".
 *
 * A `Descriptor` is the same instruction after register elimination: every field
 * is either a decoded literal or a `reg(id)` marker. `pack` turns it back into
 * exactly the word array the interpreter used to see, and `unpack` goes the other
 * way, so `ShotDescriptor.test.ts` can prove the two are inverses over every
 * instruction in all nine retail `.ecl` files. That is what lets the generated
 * source change shape without changing behaviour by one bit.
 *
 * Flag numbering follows the *declared parameter list*, not the word list, and
 * both instructions pack two i16s into word 0. So bit 0 is the low half of word 0,
 * bit 1 its high half, and word N (N >= 1) is bit N+1.
 */

/** An operand read out of the enemy's register file when the instruction fires. */
export interface RegRef {
  readonly reg: number;
}

/** A descriptor field: a decoded literal, or a register to resolve at fire time. */
export type Operand = number | RegRef;

/** Wrap a register id (0x2710.. for ints, 0x2720.. for floats) as an operand. */
export const reg = (id: number): RegRef => ({ reg: id });

export const isReg = (operand: Operand): operand is RegRef => typeof operand === 'object' && operand !== null;

/** Reinterpret an i32 as the IEEE-754 single it was stored as. */
export function bitsToF32(bits: number): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setInt32(0, bits | 0, true);
  return view.getFloat32(0, true);
}

/**
 * "Is this id actually a register?" — the caller supplies the register table.
 *
 * `ResolveInt`/`ResolveFloat` only redirect when the id names a field, and fall
 * through to the operand's own value otherwise (`EnemySlot.resolveIntOperand`,
 * `resolveFloatOperand`). So an indirect operand whose id is not in the table is
 * a literal wearing an indirect flag, and decoding it as a literal is exactly
 * what the interpreter would have done. Keeping the table on the caller's side
 * also stops this module from importing the sim layer.
 */
export type RegisterLookup = (id: number) => boolean;

/** Everything is a register: the structural default, used by the round-trip test. */
export const ALL_REGISTERS: RegisterLookup = () => true;

/** The inverse: the i32 word ZUN would have written for this single. */
export function f32ToBits(value: number): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat32(0, value, true);
  return view.getInt32(0, true);
}

/** Splice a signed i16 into the high half of an i32 word. */
const hi = (value: number) => (value & 0xffff) * 0x10000;
/** The signed i16 sitting in the low half of an i32 word. */
const lo = (word: number) => (word << 16) >> 16;
/** The signed i16 sitting in the high half of an i32 word. */
const top = (word: number) => word >> 16;

/**
 * The ten words ops 96..104 hand the interpreter: the aim mode derived from the
 * opcode, the eight instruction words, then the flag mask.
 *
 * Shared by the translator and by `ShotDescriptor.test.ts` so the two can never
 * disagree about what "the instruction" is.
 */
export function shotWords(opcode: number, operands: ReadonlyArray<number>, operandFlags: number): number[] {
  const words = [opcode - 96];
  for (let i = 0; i < 8; i++) words.push(operands[i] ?? 0);
  words.push(operandFlags);
  return words;
}

/** The fifteen words ops 114/115 hand the interpreter: opcode, 13 words, flags. */
export function laserWords(opcode: number, operands: ReadonlyArray<number>, operandFlags: number): number[] {
  const words = [opcode];
  for (let i = 0; i < 13; i++) words.push(operands[i] ?? 0);
  words.push(operandFlags);
  return words;
}

/** Ops 96..104 in order: the nine ways a launcher lays out its rings. */
export const SHOT_AIM_MODES = [
  'aimedFan',
  'fixedFan',
  'aimedRing',
  'evenRing',
  'aimedTurnedRing',
  'turnedRing',
  'randomBand',
  'ringRandomSpeed',
  'randomAngleSpeed',
] as const;

export type ShotAimMode = (typeof SHOT_AIM_MODES)[number];

/** Bit positions in a shot instruction's `operandFlags`. */
export const SHOT_FLAGS = {
  type: 0x001,
  color: 0x002,
  count: 0x004,
  rings: 0x008,
  speed: 0x010,
  speed2: 0x020,
  angle: 0x040,
  angleStep: 0x080,
} as const;

/**
 * Op 96..104 after decoding. `count` bullets per ring, `rings` rings, the two
 * speeds bracket a per-ring acceleration, and `angleStep` fans the rings apart.
 *
 * `transform` is the eighth word: a bitfield the launcher consults for the
 * youkai-only / human-only gates and the muzzle sound, never register-indirect.
 */
export interface ShotDescriptor {
  mode: ShotAimMode;
  /** `etama.anm` sprite group, the low i16 of word 0. */
  type: Operand;
  /** Palette row within that group, the high i16 of word 0. */
  color: Operand;
  /** Bullets in one ring. */
  count: Operand;
  /** Rings, laid out along `angleStep`. */
  rings: Operand;
  /** Speed on spawn, in px/frame. */
  speed: Operand;
  /** Terminal speed the bullet accelerates or decelerates toward. */
  speed2: Operand;
  /** Base angle, in radians, interpreted under `mode`. */
  angle: Operand;
  /** Angle between consecutive rings, in radians. */
  angleStep: Operand;
  transform: number;
}

/** The ten words `EnemySlot.dispatchShot` consumes, in its own order. */
export type ShotWords = [number, number, number, number, number, number, number, number, number, number];

/** Turn a decoded launcher back into the interpreter's word array. */
export function packShot(desc: ShotDescriptor): ShotWords {
  let flags = 0;
  const intOperand = (value: Operand, bit: number): number => {
    if (isReg(value)) {
      flags |= bit;
      return value.reg;
    }
    return value | 0;
  };
  const floatOperand = (value: Operand, bit: number): number => {
    if (isReg(value)) {
      flags |= bit;
      return f32ToBits(value.reg);
    }
    return f32ToBits(value);
  };

  const type = intOperand(desc.type, SHOT_FLAGS.type);
  const color = intOperand(desc.color, SHOT_FLAGS.color);
  return [
    SHOT_AIM_MODES.indexOf(desc.mode),
    (type & 0xffff) | hi(color),
    intOperand(desc.count, SHOT_FLAGS.count),
    intOperand(desc.rings, SHOT_FLAGS.rings),
    floatOperand(desc.speed, SHOT_FLAGS.speed),
    floatOperand(desc.speed2, SHOT_FLAGS.speed2),
    floatOperand(desc.angle, SHOT_FLAGS.angle),
    floatOperand(desc.angleStep, SHOT_FLAGS.angleStep),
    desc.transform | 0,
    flags,
  ];
}

/**
 * Decode the interpreter's word array. The inverse of `packShot`, up to operands
 * that carry an indirect flag but name no register — those decode as literals, and
 * `packShot` then clears the bit, which is what the interpreter was going to do
 * with them anyway. Pass a lookup that accepts every id to get strict equality.
 */
export function unpackShot(
  words: ReadonlyArray<number>,
  isRegister: RegisterLookup = ALL_REGISTERS,
): ShotDescriptor {
  const [mode, packed, count, rings, speed, speed2, angle, angleStep, transform, flags] = words;
  const intOperand = (raw: number, bit: number): Operand =>
    (flags & bit) !== 0 && isRegister(raw | 0) ? reg(raw | 0) : raw | 0;
  // A register-indirect float carries its id as a single, so the id is the
  // integer part of that float — exactly what `resolveFloatOperand` truncates.
  const floatOperand = (raw: number, bit: number): Operand =>
    (flags & bit) !== 0 && isRegister(Math.trunc(bitsToF32(raw)))
      ? reg(Math.trunc(bitsToF32(raw)))
      : bitsToF32(raw);
  return {
    mode: SHOT_AIM_MODES[mode],
    type: intOperand(lo(packed), SHOT_FLAGS.type),
    color: intOperand(top(packed), SHOT_FLAGS.color),
    count: intOperand(count, SHOT_FLAGS.count),
    rings: intOperand(rings, SHOT_FLAGS.rings),
    speed: floatOperand(speed, SHOT_FLAGS.speed),
    speed2: floatOperand(speed2, SHOT_FLAGS.speed2),
    angle: floatOperand(angle, SHOT_FLAGS.angle),
    angleStep: floatOperand(angleStep, SHOT_FLAGS.angleStep),
    transform: transform | 0,
  };
}

/** Bit positions in a laser instruction's `operandFlags`. */
export const LASER_FLAGS = {
  color: 0x002,
  angle: 0x004,
  speed: 0x008,
  tail: 0x010,
  head: 0x020,
  startLength: 0x040,
  width: 0x080,
  startTime: 0x100,
  duration: 0x200,
  despawn: 0x400,
} as const;

/**
 * Ops 114/115 after decoding. A beam is a segment from `tail` to `head` measured
 * along `angle`, `width` thick, that grows in over `startLength` frames, holds for
 * `duration`, then retracts over `despawn`. `startTime` delays the whole thing and
 * the two hitbox fields open and close the lethal window inside it, which is what
 * lets a laser telegraph before it can kill.
 */
export interface LaserDescriptor {
  /** Op 115 tracks the ship; op 114 keeps the operand angle absolute. */
  aimed: boolean;
  type: number;
  color: Operand;
  angle: Operand;
  speed: Operand;
  tail: Operand;
  head: Operand;
  startLength: Operand;
  width: Operand;
  startTime: Operand;
  duration: Operand;
  despawn: Operand;
  hitboxStart: number;
  hitboxEnd: number;
  flags: number;
}

/** The fifteen words `EnemySlot.spawnLaser` consumes, in its own order. */
export type LaserWords = number[];

/** Turn a decoded laser back into the interpreter's word array. */
export function packLaser(desc: LaserDescriptor): LaserWords {
  let flags = 0;
  const intOperand = (value: Operand, bit: number): number => {
    if (isReg(value)) {
      flags |= bit;
      return value.reg | 0;
    }
    return value | 0;
  };
  const floatOperand = (value: Operand, bit: number): number => {
    if (isReg(value)) {
      flags |= bit;
      return f32ToBits(value.reg);
    }
    return f32ToBits(value);
  };

  return [
    desc.aimed ? 115 : 114,
    (desc.type & 0xffff) | hi(intOperand(desc.color, LASER_FLAGS.color)),
    floatOperand(desc.angle, LASER_FLAGS.angle),
    floatOperand(desc.speed, LASER_FLAGS.speed),
    floatOperand(desc.tail, LASER_FLAGS.tail),
    floatOperand(desc.head, LASER_FLAGS.head),
    floatOperand(desc.startLength, LASER_FLAGS.startLength),
    floatOperand(desc.width, LASER_FLAGS.width),
    intOperand(desc.startTime, LASER_FLAGS.startTime),
    intOperand(desc.duration, LASER_FLAGS.duration),
    intOperand(desc.despawn, LASER_FLAGS.despawn),
    desc.hitboxStart | 0,
    desc.hitboxEnd | 0,
    desc.flags | 0,
    flags,
  ];
}

/** Decode the interpreter's word array. The inverse of `packLaser`. */
export function unpackLaser(
  words: ReadonlyArray<number>,
  isRegister: RegisterLookup = ALL_REGISTERS,
): LaserDescriptor {
  const [
    opcode,
    packed,
    angle,
    speed,
    tail,
    head,
    startLength,
    width,
    startTime,
    duration,
    despawn,
    hitboxStart,
    hitboxEnd,
    flags,
    operandFlags,
  ] = words;
  const intOperand = (raw: number, bit: number): Operand =>
    (operandFlags & bit) !== 0 && isRegister(raw | 0) ? reg(raw | 0) : raw | 0;
  const floatOperand = (raw: number, bit: number): Operand =>
    (operandFlags & bit) !== 0 && isRegister(Math.trunc(bitsToF32(raw)))
      ? reg(Math.trunc(bitsToF32(raw)))
      : bitsToF32(raw);
  return {
    aimed: opcode === 115,
    type: lo(packed),
    color: intOperand(top(packed), LASER_FLAGS.color),
    angle: floatOperand(angle, LASER_FLAGS.angle),
    speed: floatOperand(speed, LASER_FLAGS.speed),
    tail: floatOperand(tail, LASER_FLAGS.tail),
    head: floatOperand(head, LASER_FLAGS.head),
    startLength: floatOperand(startLength, LASER_FLAGS.startLength),
    width: floatOperand(width, LASER_FLAGS.width),
    startTime: intOperand(startTime, LASER_FLAGS.startTime),
    duration: intOperand(duration, LASER_FLAGS.duration),
    despawn: intOperand(despawn, LASER_FLAGS.despawn),
    hitboxStart: hitboxStart | 0,
    hitboxEnd: hitboxEnd | 0,
    flags: flags | 0,
  };
}
