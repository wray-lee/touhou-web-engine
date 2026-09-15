/**
 * Parser for Touhou 8 .std stage background scripts.
 *
 * RawStageHeader: i16 nbObjects; i16 nbFaces; i32 facesOffset; i32 scriptOffset;
 *   i32 unkC; char stageName[128]; char songNames[4][128]; char songPaths[4][128];
 * Total = 0x490.
 *
 * After the header: nbObjects * RawStageObject, then faces, then the camera script.
 */

export interface StdObject {
  id: number;
  zLevel: number;
  flags: number;
  position: [number, number, number];
  size: [number, number, number];
  quads: StdQuad[];
}

export interface StdQuad {
  type: number;
  anmScript: number;
  vmIdx: number;
  position: [number, number, number];
  size: [number, number];
}

export interface StdInstruction {
  frame: number;
  opcode: number;
  args: number[];
}

export interface StdFile {
  stageName: string;
  songNames: string[];
  songPaths: string[];
  objects: StdObject[];
  script: StdInstruction[];
}

function cstr(buf: Uint8Array, off: number, max: number): string {
  const slice = buf.subarray(off, off + max);
  const end = slice.indexOf(0);
  const raw = slice.subarray(0, end < 0 ? slice.length : end);
  try {
    return new TextDecoder('shift_jis').decode(raw);
  } catch {
    return String.fromCharCode(...raw);
  }
}

export function parseStd(buf: Buffer | Uint8Array): StdFile {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const nbObjects = dv.getInt16(0, true);
  const scriptOffset = dv.getInt32(8, true);

  const HEADER_SIZE = 0x490;
  const stageName = cstr(buf, 16, 128);
  const songNames: string[] = [];
  const songPaths: string[] = [];
  for (let i = 0; i < 4; i++) {
    songNames.push(cstr(buf, 16 + 128 + i * 128, 128));
    songPaths.push(cstr(buf, 16 + 128 + 4 * 128 + i * 128, 128));
  }

  const objects: StdObject[] = [];
  let cursor = HEADER_SIZE;
  for (let i = 0; i < nbObjects && cursor + 0x38 <= buf.byteLength; i++) {
    const id = dv.getInt16(cursor, true);
    const zLevel = buf[cursor + 2];
    const flags = buf[cursor + 3];
    const pos: [number, number, number] = [
      dv.getFloat32(cursor + 4, true),
      dv.getFloat32(cursor + 8, true),
      dv.getFloat32(cursor + 12, true),
    ];
    const size: [number, number, number] = [
      dv.getFloat32(cursor + 16, true),
      dv.getFloat32(cursor + 20, true),
      dv.getFloat32(cursor + 24, true),
    ];
    const quads: StdQuad[] = [];
    let qc = cursor + 28;
    while (qc + 0x1c <= buf.byteLength) {
      const type = dv.getInt16(qc, true);
      const byteSize = dv.getInt16(qc + 2, true);
      if (type < 0 || byteSize <= 0) break;
      quads.push({
        type,
        anmScript: dv.getInt16(qc + 4, true),
        vmIdx: dv.getInt16(qc + 6, true),
        position: [dv.getFloat32(qc + 8, true), dv.getFloat32(qc + 12, true), dv.getFloat32(qc + 16, true)],
        size: [dv.getFloat32(qc + 20, true), dv.getFloat32(qc + 24, true)],
      });
      qc += byteSize;
    }
    objects.push({ id, zLevel, flags, position: pos, size, quads });
    cursor = qc;
  }

  const script: StdInstruction[] = [];
  cursor = scriptOffset;
  while (cursor + 8 <= buf.byteLength) {
    const frame = dv.getInt32(cursor, true);
    if (frame < 0) break;
    const opcode = dv.getInt16(cursor + 4, true);
    const size = dv.getInt16(cursor + 6, true);
    const argCount = Math.max(0, Math.min(3, Math.floor((size - 8) / 4)));
    const args: number[] = [];
    for (let j = 0; j < argCount; j++) args.push(dv.getInt32(cursor + 8 + j * 4, true));
    script.push({ frame, opcode, args });
    if (size <= 0) break;
    cursor += size;
  }

  return { stageName, songNames, songPaths, objects, script };
}
