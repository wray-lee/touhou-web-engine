/**
 * Parser for Touhou 8 `.rpy` replay files.
 *
 * Every layout claim below is transcribed from the recompiled reference
 * (`th08web-ref/src/ReplayManager.{hpp,cpp}`) and then confirmed against the four
 * shipped title demos (`demo/demorpy0..3.rpy`, unpacked out of `th08.dat`).
 *
 * 1. **Obfuscation.** Every byte from `0x18` (`compressedSize`) to `fileSize` has
 *    a running key subtracted from it; the key starts at `header.value1` and
 *    grows by 7 per byte (`LoadReplayData:68-76`).
 * 2. **Checksum.** `0x3f000318` plus every byte from `value1` (0x15) to
 *    `fileSize`, compared with `header.checksum` (`LoadReplayData:78-89`). Retail
 *    treats a mismatch as fatal and so does this parser: it is the only in-file
 *    proof that the byte arithmetic above has not drifted.
 * 3. **Compression.** `Lzss::Decode` over `compressedSize` bytes at 0x68.
 * 4. **Stage blocks.** `stageReplayData[stage]` and `stageReplayData2[stage]`
 *    hold offsets that are absolute inside the *decoded* buffer, header included,
 *    which is why load adds the buffer base back (`AddedCallbackDemo:559-573`).
 *    `SaveReplay:735-757` writes every stage block in stage order and then every
 *    second block, so a block ends where the next recorded pointer starts.
 *
 * The input stream is one `u16` per frame, not a 6-byte record. `ReplayInputSync`
 * does exist, but only `OnUpdateHighPrioDemo2` reads it, and that reader is
 * installed only when `header.unk0x6 != 0` (`RegisterChain:176-179`). Every retail
 * demo carries `unk0x6 == 0`, so the live reader is `OnUpdateHighPrioDemo`, which
 * steps `replayInputs += sizeof(u16)` (`:329-330`). The data agrees: at stride 2
 * all four demos decode to a clean run of `TH_BUTTON_*` combinations and every
 * block size divides by 2, while at stride 6 two of the four do not even divide.
 */

/** `Global.hpp:97-126` - the bits `g_CurFrameInput` is built from. */
export const TH_BUTTON = {
  shoot: 1 << 0,
  bomb: 1 << 1,
  focus: 1 << 2,
  menu: 1 << 3,
  up: 1 << 4,
  down: 1 << 5,
  left: 1 << 6,
  right: 1 << 7,
  skip: 1 << 8,
  q: 1 << 9,
  s: 1 << 10,
  home: 1 << 11,
  enter: 1 << 12,
  d: 1 << 13,
  reset: 1 << 14,
} as const;

const DIRECTION_BITS = TH_BUTTON.up | TH_BUTTON.down | TH_BUTTON.left | TH_BUTTON.right;

/**
 * Every bit a recorded frame may carry. The gate asserts a decoded stream stays
 * inside this set, which is what proves the stride: one wrong byte of alignment
 * turns a run of legal button combinations into noise within a few frames.
 */
export const KNOWN_INPUT_BITS =
  TH_BUTTON.shoot |
  TH_BUTTON.bomb |
  TH_BUTTON.focus |
  TH_BUTTON.menu |
  DIRECTION_BITS |
  TH_BUTTON.skip |
  TH_BUTTON.q |
  TH_BUTTON.s |
  TH_BUTTON.home |
  TH_BUTTON.enter |
  TH_BUTTON.d |
  TH_BUTTON.reset;

/** One decoded frame of recorded input. */
export interface ReplayButtons {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  bomb: boolean;
  focus: boolean;
  menu: boolean;
  skip: boolean;
}

/** Decode one recorded `g_CurFrameInput`. */
export function replayButtons(bits: number): ReplayButtons {
  return {
    up: (bits & TH_BUTTON.up) !== 0,
    down: (bits & TH_BUTTON.down) !== 0,
    left: (bits & TH_BUTTON.left) !== 0,
    right: (bits & TH_BUTTON.right) !== 0,
    shoot: (bits & TH_BUTTON.shoot) !== 0,
    bomb: (bits & TH_BUTTON.bomb) !== 0,
    focus: (bits & TH_BUTTON.focus) !== 0,
    menu: (bits & TH_BUTTON.menu) !== 0,
    skip: (bits & TH_BUTTON.skip) !== 0,
  };
}

/** True when a recorded word only uses bits the retail input map defines. */
export function isKnownInput(bits: number): boolean {
  return (bits & ~KNOWN_INPUT_BITS) === 0;
}

/**
 * `StageReplayData` (`ReplayManager.hpp:22-40`). Everything in it is snapshotted
 * when the stage starts (`AddedCallback:510-523`) except `score`, which
 * `SaveReplay:730` overwrites with the score the run reached at the *end* of the
 * stage. That asymmetry is why the gate can reconcile score but never graze: the
 * recorded graze is what the stage began with, not what it produced.
 */
export interface StageReplayHeader {
  /** Cumulative score at the end of this stage. */
  score: number;
  pointItemsCollected: number;
  graze: number;
  pointItemExtends: number;
  nextPointItemExtendThreshold: number;
  pointItemValue: number;
  youkaiGauge: number;
  /** Seed playback restores through `g_Rng.SetSeed` (`AddedCallbackDemo:602`). */
  rngSeed: number;
  power: number;
  lives: number;
  bombs: number;
  rank: number;
  /** `g_GameManager.character`, the 0..3 team index. */
  character: number;
  /** `spellcardsCaptured`, stored at `+0x21` (`AddedCallbackDemo:603`). */
  spellcardsCaptured: number;
  /** The stage's clock hour at start: 0 = midnight, 12 = dawn. */
  clockTime: number;
}

export interface StageReplay {
  /** Index into the retail `Stage` enum (`ScoreDat.hpp:71-85`). */
  stageIndex: number;
  header: StageReplayHeader;
  /** One recorded `g_CurFrameInput` per frame, in play order. */
  inputs: number[];
  /**
   * The `stageReplayData2` block: the supervisor's pacing byte, one entry per 30
   * frames (`OnUpdateLowPrio:269-276`). Playback feeds it to
   * `g_Supervisor.unk198` and never to the simulation, so the gate reads it only
   * as an independent cross-check on the frame count.
   */
  pacing: number[];
  /** Recorded frame count, which is what retail's reader walks. */
  frames: number;
}

export interface ReplayFile {
  /** `header.unk0x6`: nonzero switches the demo reader to 6-byte records. */
  demoVariant: number;
  /**
   * Raw 0..11 shot type. The four teams come first and the eight solos follow
   * them in team order, two per team, so a solo folds back onto its team with
   * `(shotType - 4) / 2` (`ScoreDat.hpp:54-69`).
   */
  shotType: number;
  /** 0 easy, 1 normal, 2 hard, 3 lunatic, 4 extra (`ScoreDat.hpp:44-52`). */
  difficulty: number;
  date: string;
  playerName: string;
  isPractice: boolean;
  /** Spell-practice card number, or -1 for a stage recording. */
  spellcardNumber: number;
  spellcardName: string;
  /** Indexed by retail stage id; `null` where nothing was recorded. */
  stages: (StageReplay | null)[];
}

const HEADER_SIZE = 0x68;
/** `offsetof(StageReplayData, inputs)`: the 0x24 snapshot ahead of the stream. */
const STAGE_HEADER_SIZE = 0x24;
const REPLAY_MAGIC = 0x50523854; // "T8RP" little-endian
const REPLAY_OBFUSCATION_VALUE = 0x3f000318;
const MAX_STAGES = 9;

/** LZSS decode (same as pbg.mjs but in TypeScript). */
function lzssDecode(inp: Uint8Array, outSize: number): Uint8Array {
  const MASK = 0x1fff;
  const dict = new Uint8Array(8192);
  const out = new Uint8Array(outSize);
  let o = 0;
  let ic = 0;
  let bit = 0x80;
  let cur = 0;
  let head = 1;
  let bits = 0;
  const fetch = () => {
    if (bit === 0x80) cur = ic < inp.length ? inp[ic++] : 0;
  };
  const adv = () => {
    bit >>= 1;
    if (bit === 0) bit = 0x80;
  };
  const unpackBits = (n: number) => {
    let m = 1 << (n - 1);
    bits = 0;
    while (m) {
      fetch();
      if (cur & bit) bits |= m;
      m >>= 1;
      adv();
    }
  };
  const writeByte = (v: number) => {
    if (o < outSize) out[o] = v;
    o++;
    dict[head] = v;
    head = (head + 1) & MASK;
  };
  for (;;) {
    fetch();
    const flag = cur & bit;
    adv();
    if (flag) {
      unpackBits(8);
      writeByte(bits);
    } else {
      unpackBits(13);
      const off = bits;
      if (!off) break;
      unpackBits(4);
      const len = bits + 2;
      for (let i = 0; i <= len; i++) writeByte(dict[(off + i) & MASK]);
    }
  }
  return out;
}

/** ASCII field reader. Retail pads these with spaces, and NUL-terminates. */
function readAscii(buf: Uint8Array, off: number, len: number): string {
  let out = '';
  for (let i = 0; i < len; i++) {
    const c = buf[off + i];
    if (c === 0) break;
    out += String.fromCharCode(c);
  }
  return out.replace(/[\s\0]+$/, '');
}

/**
 * End of the block that starts at `ptr`: the nearest later pointer, or the end of
 * the decoded region. Stage blocks and second blocks share one address space, so
 * both lists are candidates for the boundary.
 */
function blockEnd(ptr: number, later: (number | null)[], regionEnd: number): number {
  let end = regionEnd;
  for (const p of later) if (p !== null && p > ptr && p < end) end = p;
  return end;
}

export function parseReplay(raw: Uint8Array): ReplayFile {
  const buf = Uint8Array.from(raw); // copy, so the caller's bytes stay intact
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  if (dv.getUint32(0, true) !== REPLAY_MAGIC) throw new Error('not a TH08 replay');
  if (dv.getUint16(4, true) !== 6) throw new Error('unsupported replay version');

  const fileSize = dv.getInt32(12, true);
  const demoVariant = buf[6];
  let key = buf[0x15];

  for (let i = 0x18; i < fileSize; i++) {
    buf[i] = (buf[i] - key) & 0xff;
    key = (key + 7) & 0xff;
  }

  let sum = REPLAY_OBFUSCATION_VALUE;
  for (let i = 0x15; i < fileSize; i++) sum = (sum + buf[i]) >>> 0;
  if (sum !== dv.getUint32(16, true) >>> 0) {
    throw new Error(`replay checksum mismatch: got 0x${sum.toString(16)}`);
  }

  const compressedSize = dv.getInt32(0x18, true);
  const decompressedSize = dv.getInt32(0x1c, true);
  const body = lzssDecode(buf.subarray(HEADER_SIZE, HEADER_SIZE + compressedSize), decompressedSize);

  // Header plus decompressed body is the region the stage pointers address. The
  // trailing "USER" block sits past `fileSize` and no pointer reaches it, so it
  // is carried along but never parsed as replay data.
  const trailing = Math.max(0, raw.length - fileSize);
  const full = new Uint8Array(HEADER_SIZE + decompressedSize + trailing);
  full.set(buf.subarray(0, HEADER_SIZE));
  full.set(body, HEADER_SIZE);
  if (trailing > 0) full.set(raw.subarray(fileSize), HEADER_SIZE + decompressedSize);
  const fdv = new DataView(full.buffer, full.byteOffset, full.byteLength);
  const regionEnd = HEADER_SIZE + decompressedSize;

  const shotType = full[0x6a];
  const difficulty = full[0x6b];
  const date = readAscii(full, 0x6c, 6);
  const playerName = readAscii(full, 0x72, 8);
  const isPractice = full[0x7b] !== 0;
  const spellcardNumber = fdv.getInt16(0x7c, true);
  const spellcardName = readAscii(full, 0x7e, 48);

  const stagePtrs: (number | null)[] = [];
  const pacingPtrs: (number | null)[] = [];
  for (let s = 0; s < MAX_STAGES; s++) {
    const a = fdv.getUint32(0x20 + s * 4, true);
    const b = fdv.getUint32(0x44 + s * 4, true);
    stagePtrs.push(a >= HEADER_SIZE && a < regionEnd ? a : null);
    pacingPtrs.push(b >= HEADER_SIZE && b < regionEnd ? b : null);
  }

  const stages: (StageReplay | null)[] = [];
  for (let s = 0; s < MAX_STAGES; s++) {
    const off = stagePtrs[s];
    if (off === null || off + STAGE_HEADER_SIZE > regionEnd) {
      stages.push(null);
      continue;
    }
    const end = blockEnd(off, stagePtrs.slice(s + 1).concat(pacingPtrs), regionEnd);
    const header: StageReplayHeader = {
      score: fdv.getUint32(off, true),
      pointItemsCollected: fdv.getInt32(off + 4, true),
      graze: fdv.getInt32(off + 8, true),
      pointItemExtends: fdv.getInt32(off + 12, true),
      nextPointItemExtendThreshold: fdv.getInt32(off + 16, true),
      pointItemValue: fdv.getInt32(off + 20, true),
      youkaiGauge: fdv.getInt16(off + 0x18, true),
      rngSeed: fdv.getUint16(off + 0x1a, true),
      power: full[off + 0x1c],
      lives: full[off + 0x1d],
      bombs: full[off + 0x1e],
      rank: full[off + 0x1f],
      character: full[off + 0x20],
      spellcardsCaptured: full[off + 0x21],
      clockTime: fdv.getInt8(off + 0x22),
    };

    // One u16 per frame (`OnUpdateHighPrioDemo:329-330`). `StopRecording:669-672`
    // closes the stream with one zero word and then a six-byte bookmark, so the
    // last four words of the block are the terminator and its slack, not recorded
    // input. Dropping exactly those four is what makes the pacing cross-check land:
    // all four retail demos then satisfy `pacing == floor(frames / 30) + 2`, the
    // 30-frame write cadence of `OnUpdateLowPrio:269-276` plus the two bytes the
    // bookmark stands over.
    const words = Math.max(0, Math.floor((end - off - STAGE_HEADER_SIZE) / 2));
    const frames = Math.max(0, words - 4);
    const inputs: number[] = [];
    for (let i = 0; i < frames; i++) {
      inputs.push(fdv.getUint16(off + STAGE_HEADER_SIZE + i * 2, true));
    }

    const pacingOff = pacingPtrs[s];
    const pacing =
      pacingOff === null
        ? []
        : Array.from(full.subarray(pacingOff, blockEnd(pacingOff, pacingPtrs.slice(s + 1), regionEnd)));

    stages.push({ stageIndex: s, header, inputs, pacing, frames });
  }

  return {
    demoVariant,
    shotType,
    difficulty,
    date,
    playerName,
    isPractice,
    spellcardNumber,
    spellcardName,
    stages,
  };
}
