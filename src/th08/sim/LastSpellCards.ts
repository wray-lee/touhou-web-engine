/**
 * Which spell-card ids are a boss's 符卡最后一张 (the "last spell").
 *
 * 永夜抄 distinguishes an ordinary card from a final one in exactly one place
 * that matters to the player: when a card times out, `Spellcard::EndSpell` raises
 * either "Spell Bonus Failed" or "Last Spell Failed" over the panel
 * (`Spellcard.cpp:1209`, `Gui.cpp:2075-2122`). The two banners read the same bit,
 * `Spellcard::flags` bit 5, and the only function on disk that can compute it is
 * `Spellcard::IsLastSpell` (`Spellcard.cpp:464-473`), which looks the card's id up
 * in `g_LastSpellNumbers`.
 *
 * That table is 43 `SpellcardNumber` literals (`Spellcard.cpp:379-406`), so the
 * whole question is a set membership test against a list the data files already
 * carry inside the op-122 blob -- `EclSpellCardInstructionArgs::spellCardNumber`
 * (`EclDependencies.cpp:21,30`) is handed to `StartSpell` verbatim
 * (`EclDependencies.cpp:39-45`), which is the same value our translated scripts
 * pass to `EnemySlot.startSpell`. Translating the enum names through
 * `Spellcard.hpp:15-230` gives the numbers below, so this is retail's own answer
 * rather than a guess at which card looks final.
 *
 * Two caveats kept honest:
 *  - No decompiled caller of `IsLastSpell` survives on disk, so "bit 5 is set
 *    exactly for these ids" is an inference from the only available predicate.
 *    It reproduces every banner a retail player can observe, and stages 1 to 3
 *    gate their boss's last-spell break on the matching 时符 register
 *    (`EclOperandsInt.cpp:153-158`), which is independent corroboration.
 *  - Mokou's id 204 is Extra, which this port does not run; it stays in the table
 *    so the set remains the shipped one.
 */

/** `g_LastSpellNumbers`, grouped the way the decompile comments it. */
const LAST_SPELL_NUMBERS: Readonly<Record<string, readonly number[]>> = {
  /** Wriggle Nightbug -- 隠蟲「永夜蟄居」. */
  stage1: [10, 11, 12],
  /** Mystia Lorelei. */
  stage2: [29, 30, 31],
  /** Keine Kamishirasawa. */
  stage3: [51, 52, 53],
  /** Reimu Hakurei (4A). */
  stage4a: [74, 75, 76],
  /** Marisa Kirisame (4B). */
  stage4b: [97, 98, 99],
  /** Reisen Udonge Inaba. */
  stage5: [116, 117, 118],
  /** Eirin Yagokoro -- four, because Lunatic adds 難破「永遠崩壊」. */
  stage6a: [143, 144, 145, 146],
  /** Kaguya Houraisan -- every card of hers is a last spell, five spells x 4. */
  stage6b: [
    171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190,
  ],
  /** Fujiwara no Mokou (Extra, not reachable here). */
  extra: [204],
};

const LAST_SPELL_IDS: ReadonlySet<number> = new Set(Object.values(LAST_SPELL_NUMBERS).flat());

/** Every id in the shipped table, for the test that pins the transcription. */
export const LAST_SPELL_NUMBER_COUNT = 43;

/**
 * Does this card id belong to a final spell? `Spellcard::IsLastSpell`.
 *
 * An unknown id -- including the `-1` a script can leave behind when it declares
 * a banner without a card -- is never a last spell, which is what the retail
 * linear search returns for anything outside the table.
 */
export function isLastSpellCard(spellCardNumber: number): boolean {
  return Number.isInteger(spellCardNumber) && LAST_SPELL_IDS.has(spellCardNumber);
}

/** The grouped table, exposed so a test can count it and a debug overlay can name it. */
export function lastSpellGroups(): ReadonlyArray<readonly [string, readonly number[]]> {
  return Object.entries(LAST_SPELL_NUMBERS);
}
