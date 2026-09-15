import { describe, it, expect } from 'vitest';
import { LAST_SPELL_NUMBER_COUNT, isLastSpellCard, lastSpellGroups } from './LastSpellCards';
import { decodeSpellCard } from '../format/EclSpellCard';

/**
 * The table is transcribed out of `g_LastSpellNumbers` (`Spellcard.cpp:379-406`),
 * so the checks worth having are the ones that tie it back to observable retail:
 * the shipped size, and the ids the stage 1 `.ecl` actually declares for its final
 * card. `EclSpellCardInstructionArgs::spellCardNumber` (`EclDependencies.cpp:21,30`)
 * is handed to `StartSpell` untouched, which is what makes the id usable here.
 */
describe('g_LastSpellNumbers', () => {
  it('holds the 43 ids the shipped array has', () => {
    const ids = lastSpellGroups().flatMap(([, group]) => group);
    expect(ids).toHaveLength(LAST_SPELL_NUMBER_COUNT);
    expect(new Set(ids).size).toBe(LAST_SPELL_NUMBER_COUNT);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('names the three final-spell ids of stage 1', () => {
    // 隠蟲「永夜蟄居」 is what op 122 declares as numbers 10/11/12 in ecldata1,
    // and it is the card that ends the stage-1 boss fight.
    expect(lastSpellGroups()[0]?.[1]).toEqual([10, 11, 12]);
    for (const id of [10, 11, 12]) expect(isLastSpellCard(id)).toBe(true);
  });

  it('leaves the ordinary cards out', () => {
    // Stage 1's first two cards and the mid-boss entries are not finals.
    for (const id of [0, 1, 2, 5, 9]) expect(isLastSpellCard(id)).toBe(false);
    // Neither is an id from outside the game's own range.
    expect(isLastSpellCard(230)).toBe(false);
    expect(isLastSpellCard(-1)).toBe(false);
    expect(isLastSpellCard(Number.NaN)).toBe(false);
  });

  it('follows the word a translated script really emits', () => {
    const operands = new Int32Array(34);
    // Operand word 0 packs the face in the low i16 and the id in the high u16,
    // here 12 = `SPELLCARD_ST1_BOSS_LSL`.
    operands[0] = (0 & 0xffff) | (12 << 16);
    const card = decodeSpellCard(operands);
    expect(card.face).toBe(0);
    expect(card.number).toBe(12);
    expect(isLastSpellCard(card.number)).toBe(true);
  });
});
