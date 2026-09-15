/**
 * Parser for Touhou 8 .ecl enemy scripts.
 *
 * Binary layout from th08web-ref/src/EclManager.hpp:
 *   u32 version;  i16 subCount;  i16 unknown06;
 *   u32 timelineOffsets[16];              // +0x08, file-relative
 *   u32 subOffsets[subCount];             // +0x48, file-relative
 *   ...instruction stream...
 *
 * EclRawInstruction:
 *   i32 time;  i16 opcode;  i16 nextOffset;  u8 unknown08;  u8 difficultyMask;  u16 operandFlags;  u8 operands[];
 *
 * A sub ends when we reach an instruction with `time < 0`.
 * A timeline uses EclTimelineInstruction (different layout):
 *   i32 time;  i16 opcode;  u8 size;  u8 difficultyMask;  union { i32[7] / f32[7] } args;
 */

export interface EclInstruction {
  offset: number;
  time: number;
  opcode: number;
  nextOffset: number;
  difficultyMask: number;
  operandFlags: number;
  operands: Int32Array;
}

export interface EclSub {
  id: number;
  offset: number;
  instructions: EclInstruction[];
}

export interface EclTimelineInstruction {
  offset: number;
  time: number;
  opcode: number;
  size: number;
  difficultyMask: number;
  args: Int32Array;
}

export interface EclTimeline {
  index: number;
  offset: number;
  instructions: EclTimelineInstruction[];
}

export interface EclFile {
  version: number;
  subCount: number;
  subs: EclSub[];
  timelines: EclTimeline[];
}

/** Parse a raw .ecl buffer into structured data. */
export function parseEcl(buf: Buffer | Uint8Array): EclFile {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const version = dv.getUint32(0, true);
  const subCount = dv.getInt16(4, true);

  // unk06 holds the true timeline count; nonzero offsets past it are the file-size sentinel.
  const timelineCount = Math.max(0, Math.min(16, dv.getInt16(6, true)));
  const timelineOffsets: number[] = [];
  for (let i = 0; i < timelineCount; i++) {
    const off = dv.getUint32(8 + i * 4, true);
    if (off > 0 && off < buf.byteLength) timelineOffsets.push(off);
  }

  const subOffsets: number[] = [];
  for (let i = 0; i < subCount; i++) {
    subOffsets.push(dv.getUint32(0x48 + i * 4, true));
  }

  const subs: EclSub[] = [];
  for (let i = 0; i < subCount; i++) {
    subs.push(parseSub(buf, dv, i, subOffsets[i]));
  }

  const timelines: EclTimeline[] = [];
  for (let i = 0; i < timelineOffsets.length; i++) {
    timelines.push(parseTimeline(buf, dv, i, timelineOffsets[i]));
  }

  return { version, subCount, subs, timelines };
}

function parseSub(buf: Uint8Array, dv: DataView, id: number, offset: number): EclSub {
  const instructions: EclInstruction[] = [];
  let cursor = offset;
  for (;;) {
    if (cursor + 12 > buf.byteLength) break;
    const time = dv.getInt32(cursor, true);
    if (time < 0) break;
    const opcode = dv.getInt16(cursor + 4, true);
    const nextOffset = dv.getInt16(cursor + 6, true);
    const difficultyMask = buf[cursor + 9];
    const operandFlags = dv.getUint16(cursor + 10, true);
    const operandBytes = nextOffset - 12;
    const operandCount = Math.max(0, Math.floor(operandBytes / 4));
    const operands = new Int32Array(operandCount);
    for (let j = 0; j < operandCount; j++) {
      operands[j] = dv.getInt32(cursor + 12 + j * 4, true);
    }
    instructions.push({ offset: cursor, time, opcode, nextOffset, difficultyMask, operandFlags, operands });
    if (nextOffset <= 0) break;
    cursor += nextOffset;
  }
  return { id, offset, instructions };
}

function parseTimeline(buf: Uint8Array, dv: DataView, index: number, offset: number): EclTimeline {
  const instructions: EclTimelineInstruction[] = [];
  let cursor = offset;
  for (;;) {
    if (cursor + 8 > buf.byteLength) break;
    const time = dv.getInt32(cursor, true);
    if (time < 0) break;
    const opcode = dv.getInt16(cursor + 4, true);
    const size = buf[cursor + 6];
    const difficultyMask = buf[cursor + 7];
    const argCount = Math.min(7, Math.max(0, Math.floor((size - 8) / 4)));
    const args = new Int32Array(argCount);
    for (let j = 0; j < argCount; j++) {
      args[j] = dv.getInt32(cursor + 8 + j * 4, true);
    }
    instructions.push({ offset: cursor, time, opcode, size, difficultyMask, args });
    if (size <= 0) break;
    cursor += size;
  }
  return { index, offset, instructions };
}
