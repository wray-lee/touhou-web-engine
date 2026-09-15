import { describe, expect, it } from 'vitest';

import { decodeSpellCard } from './EclSpellCard';

/**
 * The op 122 blob for Mystia's last card, read verbatim out of
 * `public/assets/th08/raw/ecldata2.ecl` sub 58. Real bytes are the point: the
 * decoder is a build-time translator, so a regression here renames every card.
 */
const MYSTIA_LAST_WORD = [
  1900544, 15000000, 926565180, -197468373, 741884732, -131504600, 589951275, -685116887, -198577623,
  -601099989, -1431655766, -1431655766, -1431655766, -1431655766, -482818760, -113713608, -29689288,
  -533055944, 842544952, -1145309128, -1145324613, -1145324613, -1145324613, -1145324613, -1145324613,
  -1145324613, -2040754338, -2057415586, -2057396130, -2040757410, 274668383, 727165523, 291442515,
  -1621341357, -572662307, -572662307, -572662307, -572662307, -572662307, -572662307, -572662307, -572662307,
  594292320, -1234333587, -1402107027, 577548141, 728506983, 644621164, -1351662740, 1282181472, 1399614584,
  577524076, 1264675171, 1282156652, -1486009748, -1401975187, -286331154, -286331154,
];

describe('decodeSpellCard', () => {
  it('splits the packed word into the face script and the card id', () => {
    const card = decodeSpellCard(MYSTIA_LAST_WORD);
    // 0x001D0000: face script 0 in the low half, card 29 in the high half.
    expect(card.face).toBe(0);
    expect(card.number).toBe(29);
    expect(card.bonus).toBe(15000000);
  });

  it('un-obfuscates the Shift-JIS name and owner', () => {
    const card = decodeSpellCard(MYSTIA_LAST_WORD);
    expect(card.name).toBe('夜雀「真夜中のコーラスマスター」');
    expect(card.owner).toBe('ミスティア・ローレライ');
  });

  it('stops at the first NUL so the padding never leaks into the string', () => {
    const card = decodeSpellCard(MYSTIA_LAST_WORD);
    expect(card.name).not.toContain('\u0000');
    expect(card.name).not.toContain('\ufffd');
    expect(card.owner).not.toContain('\ufffd');
  });
});
