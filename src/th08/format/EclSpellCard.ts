/**
 * Decode the spell-card blob that ECL op 122 carries.
 *
 * `StartEnemySpell` (`EclDependencies.cpp:17-47`) reads a variable-length
 * instruction whose operands are not the usual 4-byte scalars but two strings:
 *
 *   +0x00  i16 face | u16 number   +0x04  i32 bonus
 *   +0x08  u8 name[0x30]            +0x38  u8 owner[0x30]
 *   +0x68  char comment1[0x40]      +0xA8  char comment2[0x40]
 *
 * (offsets relative to the first operand word; the retail struct is relative to
 * the instruction, which is 12 bytes further back). `Spellcard::StartSpell`
 * un-obfuscates them one byte at a time — the card name is XOR 0xAA and the
 * owner XOR 0xBB (`Spellcard.cpp:786-851`) — and the result is Shift-JIS.
 *
 * The translator runs this at build time so the generated TypeScript carries
 * readable string literals and the runtime never needs a Shift-JIS decoder.
 */

/**
 * Operand-word offsets inside the blob. The first word packs two halves: the low
 * i16 is the face script index (`enemyFace` at +0x0C) and the high u16 is the
 * card id (`spellCardNumber` at +0x0E).
 */
const WORD_PACKED = 0;
const WORD_BONUS = 1;
const WORD_NAME = 2;
const WORD_OWNER = 14;
/** 0x30 bytes of each string, i.e. twelve operand words. */
const STRING_WORDS = 12;

/** Name bytes are XOR 0xAA, owner bytes XOR 0xBB. */
const NAME_KEY = 0xaa;
const OWNER_KEY = 0xbb;

export interface EclSpellCard {
  /** Global card id — retail's index into the `Catk` capture history. */
  number: number;
  /** Script index into the boss's `face_stNN.anm` for the cut-in. */
  face: number;
  /** Bonus paid for capturing the card. */
  bonus: number;
  /** Card name, decoded, e.g. 夜雀「真夜中のコーラスマスター」. */
  name: string;
  /** Card owner, decoded, e.g. ミスティア・ローレライ. */
  owner: string;
}

/** Reassemble one 0x30-byte string out of twelve little-endian operand words. */
function unobfuscate(operands: ArrayLike<number>, start: number, key: number): Uint8Array {
  const bytes = new Uint8Array(STRING_WORDS * 4);
  for (let w = 0; w < STRING_WORDS; w++) {
    const word = (operands[start + w] | 0) >>> 0;
    bytes[w * 4] = (word & 0xff) ^ key;
    bytes[w * 4 + 1] = ((word >>> 8) & 0xff) ^ key;
    bytes[w * 4 + 2] = ((word >>> 16) & 0xff) ^ key;
    bytes[w * 4 + 3] = ((word >>> 24) & 0xff) ^ key;
  }
  return bytes;
}

const SHIFT_JIS = new TextDecoder('shift_jis');

/** Cut the decoded string at its NUL terminator. */
function decodeString(bytes: Uint8Array): string {
  let end = bytes.indexOf(0);
  if (end < 0) end = bytes.length;
  return SHIFT_JIS.decode(bytes.subarray(0, end));
}

/** Turn op 122's operand words into the card's readable fields. */
export function decodeSpellCard(operands: ArrayLike<number>): EclSpellCard {
  const packed = operands[WORD_PACKED] | 0;
  return {
    face: (packed << 16) >> 16,
    number: packed >>> 16,
    bonus: operands[WORD_BONUS] | 0,
    name: decodeString(unobfuscate(operands, WORD_NAME, NAME_KEY)),
    owner: decodeString(unobfuscate(operands, WORD_OWNER, OWNER_KEY)),
  };
}
