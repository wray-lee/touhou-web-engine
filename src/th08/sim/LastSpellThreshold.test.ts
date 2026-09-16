/**
 * The number a Last Spell costs, straight out of the shipped table.
 *
 * For a long time this looked unsourceable: `globals->lastSpellTimeOrbThreshold` is read
 * in eleven places (`Player.cpp:555`, `ItemManager.cpp:630`, `Gui.cpp:1462` and `:1470`,
 * `GameManager.cpp:228`, and the six `GetClockTimeIncrement` arms for stages 1, 2, 3, 4A,
 * 4B and 5) and assigned in none of
 * them, because the assignment is a table read in the stage-setup function. It is worth
 * having its own file because four separate behaviours hang off it: the ECL register
 * `0x2772` a mid-boss branches its last-spell sequence on, the seven extra deathbomb
 * frames, the hours a stage clear costs on the 夜時計, and the HUD's warm-white Time row.
 */
import { describe, expect, it } from 'vitest';
import { TIME_REQUIREMENT_BY_STAGE, createGameState, lastSpellTimeOrbThreshold } from './GameState';

describe('g_TimeRequirementParams (GameManager.cpp:46-57)', () => {
  it('is the nine rows of four the shipped table has', () => {
    expect(TIME_REQUIREMENT_BY_STAGE).toHaveLength(9);
    for (const row of TIME_REQUIREMENT_BY_STAGE) expect(row).toHaveLength(4);
    // Verbatim, because a typo here silently changes which bosses can show a Last Spell.
    expect(TIME_REQUIREMENT_BY_STAGE.map((row) => row.join('/')).join(' ')).toBe(
      [
        '2000/2500/2700/3000',
        '6500/7200/7200/7200',
        '7500/8500/8800/8800',
        '9999/9999/9999/9999',
        '7500/8500/8500/8500',
        '9999/9999/9999/9999',
        '0/0/0/0',
        '0/0/0/0',
        '0/0/0/0',
      ].join(' '),
    );
  });

  it('picks the cell retail picks for one stage and difficulty', () => {
    // Rows are the retail `Stage` enum (`ScoreDat.hpp:71-85`), so stage 1 is index 0.
    expect(lastSpellTimeOrbThreshold(0, 'easy')).toBe(2000);
    expect(lastSpellTimeOrbThreshold(0, 'normal')).toBe(2500);
    expect(lastSpellTimeOrbThreshold(0, 'hard')).toBe(2700);
    expect(lastSpellTimeOrbThreshold(0, 'lunatic')).toBe(3000);
    expect(lastSpellTimeOrbThreshold(2, 'normal')).toBe(8500);
  });

  it('keeps the two unreachable rows unreachable and the final ones free', () => {
    // 4A and 5 are not missing data: `9999` is what makes their `0x2772` a permanent 0.
    expect(lastSpellTimeOrbThreshold(3, 'easy')).toBe(9999);
    expect(lastSpellTimeOrbThreshold(5, 'lunatic')).toBe(9999);
    // 6A/6B ask for nothing, which is the same fact as `GetClockTimeIncrement` returning
    // 0 there: the night is over, so the clock stops gating anything.
    expect(lastSpellTimeOrbThreshold(6, 'lunatic')).toBe(0);
    expect(lastSpellTimeOrbThreshold(7, 'easy')).toBe(0);
  });

  it('clamps the Extra column instead of walking into the next row', () => {
    // Retail indexes a four-wide row with a difficulty that can be EXTRA (4), which reads
    // the following stage's Easy cell. Out-of-scope Extra gets the row's last column here,
    // and the difference is written down rather than hidden.
    expect(lastSpellTimeOrbThreshold(0, 'extra')).toBe(3000);
  });

  it('falls back to "never payable" for a stage the table does not carry', () => {
    expect(lastSpellTimeOrbThreshold(9, 'normal')).toBe(Number.POSITIVE_INFINITY);
    // Which is also the value a state with no stage loaded keeps: nothing buys the grace.
    const gs = createGameState('normal', 1);
    expect(gs.lastSpellTimeOrbThreshold).toBe(Number.POSITIVE_INFINITY);
  });
});
