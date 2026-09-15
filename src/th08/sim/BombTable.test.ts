import { describe, expect, it } from 'vitest';

import { BOMB_SPECS, DISSOLVE_BOMB, plateRamp, selectBomb } from './BombSystem';

/*
 * Every number here is a transcription of the retail bomb table, and the point of
 * the file is that the transcription cannot drift silently.
 *
 * `g_PlayerBombCallbackTable` (`Player.cpp:99-124`) is 24 rows of five callbacks,
 * loaded two rows at a time per shot type: `Player.cpp:1648-1651` puts row
 * `shotType * 2` at `Player+0x1000`, which `Player.cpp:1189` runs every update
 * frame, and row `shotType * 2 + 1` at `Player+0x1014`, which `Player.cpp:1536-1541`
 * runs every draw frame. So the odd rows are the *draw* halves of the same sixteen
 * cards, not a deathbomb set, and `FUN_0040be30(player, face, name, duration,
 * stateTimer, sprite)` -- the only call in the game that names a player card --
 * appears in even-row functions and in none of the odd ones.
 *
 * `node tools/th08/ecl/bombtable.cjs` re-derives the durations and names from the
 * decomp. The plate colour comes from the `FUN_0040bc60(player, 0x80rrggbb)` inside
 * each card's own draw function, and is left `null` for the three cards whose draw
 * function drives the field through a sequence instead of one colour.
 */

/** `retailFn`, `nameJp`, `duration`, `stateTimer`, `face`, plateau colour. */
const RETAIL: readonly (readonly [string, string, number, number, number, number | null])[] = [
  ['0040c010', '霊符「夢想妙珠」', 200, 260, 0, 0x404040],
  ['0040c910', '神霊「夢想封印　瞬」', 200, 260, 0, 0x2020d0],
  ['00410c40', '境符「四重結界」', 150, 200, 1, 0x404040],
  ['00410fe0', '境界「永夜四重結界」', 250, 300, 1, 0x2020d0],
  ['0040e3b0', '恋符「マスタースパーク」', 300, 350, 0, 0x404040],
  ['0040e780', '魔砲「ファイナルスパーク」', 350, 380, 0, 0x404040],
  ['0040d430', '魔符「アーティフルサクリファイス」', 210, 250, 1, 0x404040],
  ['0040d970', '魔操「リターンイナニメトネス」', 230, 280, 1, null],
  ['0040fcd0', '幻符「殺人ドール」', 250, 290, 0, 0x404040],
  ['004103f0', '幻葬「夜霧の幻影殺人鬼」', 320, 350, 0, 0x202080],
  ['0040ee10', '紅符「不夜城レッド」', 240, 290, 1, 0xd02020],
  ['0040f570', '紅魔「スカーレットデビル」', 280, 320, 1, 0xf00000],
  ['00411b10', '人符「現世斬」', 220, 270, 0, null],
  ['004123d0', '人鬼「未来永劫斬」', 250, 300, 0, null],
  ['00413140', '死符「ギャストリドリーム」', 300, 350, 1, 0x404040],
  ['00413990', '死蝶「華胥の永眠」', 300, 350, 1, 0x802020],
];

const byFn = (fn: string) => {
  const spec = BOMB_SPECS.find((s) => s.retailFn === fn);
  expect(spec, `no card is armed by FUN_${fn}`).toBeTruthy();
  return spec!;
};

describe('the retail bomb table', () => {
  it('carries one row per card, and no card is invented', () => {
    expect(BOMB_SPECS).toHaveLength(RETAIL.length);
    for (const [fn, name, duration, stateTimer, face] of RETAIL) {
      const spec = byFn(fn);
      expect(spec.nameJp, `FUN_${fn} names itself differently here`).toBe(name);
      expect(spec.duration, `FUN_${fn} duration`).toBe(duration);
      expect(spec.stateTimer, `FUN_${fn} state timer`).toBe(stateTimer);
      expect(spec.face, `FUN_${fn} cut-in portrait`).toBe(face);
    }
  });

  it('never lets the state clock run short of the card it was armed with', () => {
    for (const [fn] of RETAIL) {
      const spec = byFn(fn);
      expect(spec.stateTimer, `FUN_${fn}`).toBeGreaterThan(spec.duration);
      // Retail never leaves more than a minute of flash after the banner drops.
      expect(spec.stateTimer - spec.duration, `FUN_${fn} tail`).toBeLessThanOrEqual(60);
    }
  });

  it('floods the backdrop in the colour its own draw callback picks', () => {
    // The wash is what separates 紅魔 from 霊夢 once the shapes are off screen, so
    // a card that lost its colour would read as a plain grey flash again.
    for (const [fn, , duration, , , wash] of RETAIL) {
      if (wash === null) continue;
      const plate = byFn(fn).backdrop(duration / 2, duration).plate;
      expect(plate, `FUN_${fn} has no plate at all`).toBeTruthy();
      expect(plate!.color, `FUN_${fn} wash plateau`).toBe(wash);
      expect(plate!.alpha, `FUN_${fn} wash authority`).toBeCloseTo(0x80 / 255, 6);
    }
  });

  it('opens and closes the plate through grey, 60 frames each way', () => {
    expect(plateRamp(0xf00000, 0, 300).color).toBe(0x808080);
    expect(plateRamp(0xf00000, 60, 300).color).toBe(0xf00000);
    expect(plateRamp(0xf00000, 240, 300).color).toBe(0xf00000);
    expect(plateRamp(0xf00000, 300, 300).color).toBe(0x808080);
    // Half way in is half way up each channel, which is what the ramp looks like.
    expect(plateRamp(0xf00000, 30, 300).color).toBe(0xb84040);
  });

  it('white-outs 妖夢 blades and 愛麗絲 dolls the way their draw fns do', () => {
    const youmu = selectBomb(3, false);
    expect(youmu.id).toBe('youmu-1');
    // `FUN_00412300:2685-2710`: the field goes ink blue from frame 70 under a white
    // square that is solid to 100 and fades away by 160.
    expect(youmu.backdrop(69, 220).plate?.color).toBe(0x404040);
    expect(youmu.backdrop(70, 220).plate?.color).toBe(0x000030);
    expect(youmu.backdrop(80, 220).flash?.alpha).toBe(1);
    expect(youmu.backdrop(130, 220).flash?.alpha).toBe(128 / 255);
    expect(youmu.backdrop(161, 220).flash).toBeNull();
    // Her second blade runs the same script (`FUN_00412fa0:2716-2744`).
    expect(selectBomb(3, false, true).backdrop(70, 250).plate?.color).toBe(0x000030);

    const dolls = selectBomb(1, true, true);
    expect(dolls.id).toBe('alice-2');
    // `FUN_0040dee0:847-886`: blue, then red lifting to white as the square opens,
    // then a held white field with no plate, then blue again. The arithmetic is
    // integer division in C, which is why `floor` is part of the contract.
    expect(dolls.backdrop(89, 230).plate?.color).toBe(0x2020d0);
    expect(dolls.backdrop(90, 230).plate?.color).toBe(0xd02020);
    expect(dolls.backdrop(105, 230).plate?.color).toBe(0xe48888);
    expect(dolls.backdrop(120, 230).plate?.color).toBe(0xf9f0f0);
    expect(dolls.backdrop(120, 230).flash?.alpha).toBe(1);
    expect(dolls.backdrop(170, 230).plate).toBeNull();
    expect(dolls.backdrop(170, 230).flash?.alpha).toBe(0x70 / 255);
    expect(dolls.backdrop(221, 230).flash).toBeNull();
    expect(dolls.backdrop(221, 230).plate).toBeTruthy();
  });

  it('keeps the dissolve card in column 4, and it never moves the meter', () => {
    // `FUN_0040d100`: 120 frames, 40 in spell practice, and no work items at all.
    expect(DISSOLVE_BOMB.phase).toBe(4);
    expect(DISSOLVE_BOMB.nameJp).toBe('「ディゾルブスペル」');
    expect(DISSOLVE_BOMB.duration).toBe(120);
    expect(DISSOLVE_BOMB.stateTimer).toBe(200);
    expect(DISSOLVE_BOMB.face).toBe(-1);
    expect(DISSOLVE_BOMB.clearScreen).toBe(true);
    expect(DISSOLVE_BOMB.backdrop(30, 120).plate?.color).not.toBe(0x808080);
    // Column 4 is the one the `phase < 4` gate at `Player.cpp:1194` withholds the
    // 妖率 drift from, so a meter never swings for a card that has no shapes in it.
    expect(DISSOLVE_BOMB.phase).toBeGreaterThan(3);
  });
});
