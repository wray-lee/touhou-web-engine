/**
 * Reader for the `msg??.dat` dialogue scripts that `Gui::RunMsg` interprets.
 *
 * The archive layout is an offset table followed by one instruction stream per
 * entry. `Gui::FUN_00439810` (`Gui.cpp:327`) selects a stream with
 * `((u8 **)msgFile)[value + 1]`, i.e. message id `value` starts at table entry
 * `value`, once the loader has turned each entry into an absolute pointer.
 * Empirically the table is `i32 count` then `count` little-endian byte offsets
 * measured from the start of the file, and script `i` runs to script `i + 1`s
 * offset (or the end of the file for the last one) — every stream ends in an
 * opcode 0, which is the VMs own terminator (`Gui.cpp:391-393`).
 *
 * One instruction is `GuiRawMessageInstruction` (`Gui.cpp:97-103`):
 *
 *     u16 time;    frame at which the VM runs it, against a per-script timer
 *     u8  opcode;
 *     u8  argSize; operand byte count, so the footprint is 4 + argSize
 *     u8  args[];
 *
 * `Gui.cpp:897-902` advances with exactly that arithmetic, and `:384-390` runs
 * instructions while the timer has reached `time`, then ticks it once per frame
 * (`Gui.cpp:905`).
 *
 * Text is obfuscated: `FUN_004353ec` (`Gui.cpp:927-938`) copies bytes while
 * XOR-ing each one with 0x77, stopping at the NUL the XOR produces. The `wwww`
 * padding seen in a raw hex dump is therefore really NULs. What comes out is
 * Shift_JIS.
 */

/** `FUN_004353ec:933` — `decoded = *encoded ^ 0x77`. */
export const MSG_TEXT_XOR = 0x77;

/** Fixed instruction footprint: `u16 time`, `u8 opcode`, `u8 argSize`. */
export const MSG_HEADER_BYTES = 4;

/**
 * The opcodes of `Gui::RunMsg`, named after what the decompiled body does.
 * The values are the raw `u8` opcode field.
 */
export const MSG_OP = {
  /** `:391` end of script; the VM reports -1 and the message slot goes idle. */
  end: 0,
  /** `:499` `{i16 portrait, i16 scriptIdx}` — run an ANM script on a face. */
  portraitScript: 1,
  /** `:538` `{i16 portrait, i16 spriteIdx}` — pin a face to one sprite. */
  portraitSprite: 2,
  /** `:592` `{i16 colorIdx, i16 lineIdx, text}` — draw into an explicit line. */
  text: 3,
  /** `:719` `{i32 frames}` hold, skippable once shoot clears the threshold. */
  wait: 4,
  /** `:745` `{i16 portrait, u8 interrupt}` — queue a face transition. */
  portraitInterrupt: 5,
  /** `:754` bump `ignoreWaitCounter`, the allowance for auto-advancing waits. */
  ignoreWait: 6,
  /** `:758` `{i32 track}` stage BGM; negative stops the music. */
  bgm: 7,
  /** `:791` run the enemy face cut-in VM, the spell-card name flourish. */
  faceCutIn: 8,
  /** `:800` snapshot power, point items, time orbs, graze and the clock. */
  stageResult: 9,
  /** `:871` no-op that still re-enters the per-frame script pump. */
  nop: 10,
  /** `:880` arm the stage-clear flag (`flags.unk5_6 = 2`) on 6a/6b/Extra. */
  stageClear: 11,
  /** `:873` fade the music out over 4.0. */
  fadeMusic: 12,
  /** `:885` `{u8}` allow the whole dialogue to be skipped. */
  skippable: 13,
  /** `:876` register the white screen effect used by the final scripts. */
  screenEffect: 14,
  /** `:395` `{i32 side, i32 scripts[4]}` — set all four faces at once. */
  portraitScripts: 15,
  /** `:617` `{text}` append to the current line, then advance the line. */
  textAppend: 16,
  /** `:441` `{i32 side, i32 sprite}` — one face, by sprite id. */
  portraitOne: 17,
  /** `:890` `{u8}` set `messageFlag`. */
  messageFlag: 18,
  /** `:649` `{text}` rewrite line 0 in colour 0. */
  textLine0: 19,
  /** `:663` `{text}` rewrite line 1 in colour 0. */
  textLine1: 20,
  /** `:677` `{i32 minFrames}` up/down route selection, shoot to commit. */
  routeChoice: 21,
  /** `:715` store the route choice and jump to script `choice + 1`. */
  routeCommit: 22,
} as const;

export interface MsgInstruction {
  /** Frames since the script started, from the `u16 time` field. */
  time: number;
  opcode: number;
  /** The raw `argSize` operand bytes. */
  args: Uint8Array;
}

export interface MsgScript {
  /** Byte offset of the first instruction, straight out of the header table. */
  offset: number;
  instructions: MsgInstruction[];
  /** True when a truncated tail stopped the walk before an `end`. */
  truncated: boolean;
}

export interface MsgFile {
  scripts: MsgScript[];
}

const shiftJis = new TextDecoder('shift_jis');

/** Undo `FUN_004353ec`: XOR every byte back and decode the Shift_JIS run. */
export function msgText(args: Uint8Array, at = 0): string {
  const out: number[] = [];
  for (let i = at; i < args.length; i++) {
    const decoded = args[i] ^ MSG_TEXT_XOR;
    if (decoded === 0) break;
    out.push(decoded);
  }
  return shiftJis.decode(Uint8Array.from(out));
}

export function msgI16(args: Uint8Array, at: number): number {
  if (at + 1 >= args.length) return 0;
  return new DataView(args.buffer, args.byteOffset + at, 2).getInt16(0, true);
}

export function msgI32(args: Uint8Array, at: number): number {
  if (at + 3 >= args.length) return 0;
  return new DataView(args.buffer, args.byteOffset + at, 4).getInt32(0, true);
}

/** `{i16 colorIndex, i16 lineIndex, char text[]}` — `GuiMessageTextArgs`. */
export const msgTextColor = (args: Uint8Array): number => msgI16(args, 0);
export const msgTextLine = (args: Uint8Array): number => msgI16(args, 2);
export const msgTextBody = (args: Uint8Array): string => msgText(args, MSG_HEADER_BYTES);

function walk(buf: Uint8Array, start: number, end: number): MsgScript {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const instructions: MsgInstruction[] = [];
  let cursor = start;
  let truncated = false;
  while (cursor + MSG_HEADER_BYTES <= end) {
    const time = view.getUint16(cursor, true);
    const opcode = buf[cursor + 2];
    const argSize = buf[cursor + 3];
    if (cursor + MSG_HEADER_BYTES + argSize > end) {
      truncated = true;
      break;
    }
    instructions.push({
      time,
      opcode,
      args: buf.slice(cursor + MSG_HEADER_BYTES, cursor + MSG_HEADER_BYTES + argSize),
    });
    cursor += MSG_HEADER_BYTES + argSize;
    if (opcode === MSG_OP.end) break;
  }
  return { offset: start, instructions, truncated };
}

/** Split one `msg??.dat` into its scripts. Malformed headers yield no scripts. */
export function parseMsg(buf: Buffer | Uint8Array): MsgFile {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (bytes.length < 8) return { scripts: [] };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getInt32(0, true);
  if (count <= 0 || count > 4096 || 4 + count * 4 > bytes.length) return { scripts: [] };
  const offsets: number[] = [];
  for (let i = 0; i < count; i++) offsets.push(view.getInt32(4 + i * 4, true));
  const scripts: MsgScript[] = [];
  for (let i = 0; i < count; i++) {
    const start = offsets[i];
    const next = i + 1 < count ? offsets[i + 1] : bytes.length;
    if (start < 0 || start > bytes.length) continue;
    scripts.push(walk(bytes, start, Math.min(Math.max(next, start), bytes.length)));
  }
  return { scripts };
}
