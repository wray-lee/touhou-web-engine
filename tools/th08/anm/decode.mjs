/**
 * Offline ANM -> declarative animation translator.
 *
 * TH08 ships .anm packs whose scripts are VM bytecode. We do not run that VM at
 * runtime: this tool walks each script's instruction stream and lifts the sprite
 * animation into plain data (ordered sprite ids + per-frame durations), which the
 * engine replays directly.
 */
import fs from 'fs';
import path from 'path';

const HEADER = 8; // {u16 opcode; u16 size; i16 time; u16 varMask}

/** Opcode that selects the displayed sprite; its i32 arg sits at byte 8. */
const OP_SET_SPRITE = 3;
/** Relative/unconditional jump — followed once so loops are not unrolled. */
const OP_JUMP = 4;

/**
 * Lift one ANM script into an ordered sprite cycle.
 * @param {Buffer} bytes
 * @param {number} spriteCount
 */
export function decodeSpriteCycle(bytes, spriteCount) {
  const frames = [];
  const durations = [];
  /** Raw start ticks, the i32 that sits ahead of the sprite id. */
  const starts = [];
  const seen = new Set();
  let cursor = 0;
  let guard = 0;
  while (cursor + HEADER <= bytes.length && guard++ < 512) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    const opcode = bytes.readInt16LE(cursor);
    const size = bytes.readUInt16LE(cursor + 2);
    const time = bytes.readInt16LE(cursor + 4);
    if (!size || cursor + size > bytes.length) break;
    if (opcode === OP_SET_SPRITE && size >= HEADER + 4) {
      const id = bytes.readInt32LE(cursor + 8);
      if (id >= 0 && id < spriteCount) {
        frames.push(id);
        starts.push(bytes.readInt32LE(cursor + 4));
        durations.push(Math.max(1, time));
      }
    } else if (opcode === OP_JUMP && size >= HEADER + 4) {
      const target = cursor + size + bytes.readInt32LE(cursor + 8);
      if (target >= 0 && target < bytes.length && target < cursor) {
        // Loops back: the frames collected so far are the cycle.
        cursor = target;
        continue;
      }
      if (target >= 0 && target < bytes.length) {
        cursor = target;
        continue;
      }
    }
    cursor += size;
  }
  return { frames, durations, starts };
}

/**
 * Rebuild a contiguous script byte run from the base64 blob stored in the manifest.
 * @param {string} b64
 */
export function scriptBuffer(b64) {
  return Buffer.from(b64, 'base64');
}
