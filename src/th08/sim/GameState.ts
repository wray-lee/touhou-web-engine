/**
 * Global mutable game state, mirroring g_GameManager from the reference.
 *
 * Every system reads from here; only the appropriate manager writes to it.
 * This is deliberately a plain object, not a class, so tests can snapshot it.
 */

import { Rng } from '../core/Rng';

export type Difficulty = 'easy' | 'normal' | 'hard' | 'lunatic' | 'extra';

export const DIFFICULTY_ID: Record<Difficulty, number> = {
  easy: 0,
  normal: 1,
  hard: 2,
  lunatic: 3,
  extra: 4,
};

export const DIFFICULTY_MASK: Record<Difficulty, number> = {
  easy: 0x01,
  normal: 0x02,
  hard: 0x04,
  lunatic: 0x08,
  extra: 0x10,
};

/**
 * The stage timeline's per-instruction filter, which is *not* the same encoding
 * the ECL instructions use: the timeline byte is shifted one bit up.
 *
 * The reading comes straight out of the retail data rather than a guess. Every
 * final boss spawn in `ecldata1..5` carries byte 0xFE, so bit 0 cannot mean
 * Easy or no difficulty would ever see a boss. With the shift, the five distinct
 * bytes in all nine scripts decode exactly as a difficulty ladder: 0xFE = every
 * difficulty, 0xFC = Normal and up, 0xF8 = Hard and up, and the 0xF3 at
 * `ecldata1` t=2630 is the Easy-only twin of the 0xFC pair at the same frame —
 * a difficulty fork, which is only coherent if Easy is bit 1.
 */
export const TIMELINE_DIFFICULTY_MASK: Record<Difficulty, number> = {
  easy: 0x02,
  normal: 0x04,
  hard: 0x08,
  lunatic: 0x10,
  extra: 0x20,
};

/**
 * `ZunGlobals::pointItemValue` seeded per difficulty (`GameManager.cpp:857-874`).
 * Every 点 popup reads this number, and time orbs push it up — so a run that grabs
 * 时符 pays more for points than one that ignores them.
 */
export const POINT_ITEM_VALUE_BY_DIFFICULTY = [60000, 100000, 200000, 300000, 300000] as const;

/**
 * `g_RankParams` (`GameManager.cpp:37-43`), indexed by `DIFFICULTY_ID`. Retail ships
 * six rows, in pairs: Easy/Normal start at 10 and may creep to 16, Hard/Lunatic start
 * at 8 inside a tighter 12 ceiling, and the two rows past that (Extra and the Phantasm
 * ladder) start pinned near the top at 16/15/16.
 */
export const RANK_PARAMS_BY_DIFFICULTY: ReadonlyArray<readonly [number, number, number]> = [
  [10, 8, 16],
  [10, 8, 16],
  [8, 8, 12],
  [8, 8, 12],
  [16, 15, 16],
];

/** One rank step is worth this much of `subRank` (`GameManager.cpp:1378, :1392`). */
export const SUBRANK_PER_RANK = 100;

/**
 * `GameManager::IncreaseSubrank` (`GameManager.cpp:1375-1387`): bank the carry and
 * walk rank up, one step at a time, stopping at the difficulty's ceiling.
 */
export function increaseSubrank(gs: GameState, amount: number): void {
  gs.subRank += amount;
  while (gs.subRank >= SUBRANK_PER_RANK) {
    gs.rank++;
    gs.subRank -= SUBRANK_PER_RANK;
  }
  if (gs.rank > gs.maxRank) gs.rank = gs.maxRank;
}

/**
 * `GameManager::DecreaseSubrank` (`:1389-1401`). The borrow runs the other way, and a
 * single death is sixteen rank steps: retail's -1600 is what buys back the density
 * that eleven minutes of grazing paid for.
 */
export function decreaseSubrank(gs: GameState, amount: number): void {
  gs.subRank -= amount;
  while (gs.subRank < 0) {
    gs.rank--;
    gs.subRank += SUBRANK_PER_RANK;
  }
  if (gs.rank < gs.minRank) gs.rank = gs.minRank;
}

/** `g_PointItemExtendThresholds` / `g_ExPointItemExtendThresholds` (`ItemManager.cpp:161-162`). */
export const POINT_EXTEND_THRESHOLDS = [100, 250, 500, 800, 1100, 9999] as const;
export const EXTRA_POINT_EXTEND_THRESHOLDS = [200, 666, 9999] as const;

/** Shot type IDs from ScoreDat.hpp. */
export const SHOT_TYPES = [
  'reimu-yukari',
  'marisa-alice',
  'sakuya-remilia',
  'youmu-yuyuko',
  'reimu',
  'yukari',
  'marisa',
  'alice',
  'sakuya',
  'remilia',
  'youmu',
  'yuyuko',
] as const;
export type ShotType = (typeof SHOT_TYPES)[number];

export interface GameState {
  rng: Rng;
  frame: number;
  difficulty: Difficulty;
  difficultyId: number;
  difficultyMask: number;
  shotType: number;
  character: ShotType;

  // Score / resources
  score: number;
  lives: number;
  bombs: number;
  power: number;
  maxPower: number;
  graze: number;

  // Rank (dynamic difficulty)
  rank: number;
  /**
   * `GameManager::subRank` -- the carry of the rank creep. Rank is what every
   * rank-scaled ECL operand reads, and retail moves it in hundredths: each 100
   * filed here walks `rank` up by one, and each shortfall walks it back down
   * (`GameManager.cpp:1375-1401`). Nine sites feed it, and they are the reason a
   * stage that is being dodged well gets *harder*: grazes +6 (`Player.cpp:501`),
   * 点 at full value +10 or +3 (`ItemManager.cpp:493-500`), a 小P +1
   * (`ItemManager.cpp:454-455`), a B item +5 (`:332-338`), a boss breathing +100 per
   * interval (`EnemyManager.cpp:919-931`), an item lost off the bottom -3
   * (`:301-303`), a card -200 (`Player.cpp:1287`) and a death -1600 (`:1369`).
   */
  subRank: number;
  /** `GameManager::minRank` / `maxRank`, the clamp the creep is held inside. */
  minRank: number;
  maxRank: number;

  // Youkai gauge (TH08 unique)
  youkaiGauge: number;
  /**
   * `Player::IsYoukai()`: the 妖化 form the stage scripts read through ECL
   * operand 0x2771, kept in step with `PlayerSim` once per frame.
   */
  playerIsYoukai: boolean;
  /**
   * `Player.bombState.frameStop` (`Player.hpp:99-102`, the int at `Player+0xFDC`).
   * The name is a misnomer inherited from the decomp: retail raises it in
   * `acceptBomb` (`Player.cpp:1277`) and drops it only when the card's own timer
   * reaches its duration (`Player.cpp:1165-1168`), so it means "a spell card is
   * playing" for the whole card, not "Sakuya's clock stopped". Six systems key off
   * that one byte: the forced stance (`Player.cpp:665-667`), the frozen 妖率计
   * (`Player.cpp:925`, `GameManager.cpp:1406`), the frozen graze count
   * (`Player.cpp:487`), the thirded kill bonus (`EnemyManager.cpp:302`), the
   * suppressed boss chip damage (`EnemyManager.cpp:423`) and the per-enemy script
   * pause (`EnemyManagerUpdate.cpp:466-472`).
   */
  bombRunning: boolean;
  /**
   * The value retail substitutes for the Shift button while {@link bombRunning}:
   * `bombState.unknown4 & 1`, the low bit of the card variant (`Player.cpp:666`).
   * The same bit decides which way the card walks the meter
   * (`Player.cpp:1194-1200`), so a deathbomb both swings the meter and hands the
   * ship to the partner who owns that card.
   */
  bombForcedFocus: boolean;
  timeOrbs: number;
  /** `globals->totalTimeOrbs`, the parity source for the point-value bump. */
  totalTimeOrbs: number;
  /**
   * `globals->lastSpellTimeOrbThreshold`, the 时符 count at which a death buys seven
   * extra frames of deathbomb window (`Player.cpp:555-556`). Read at that one site
   * and at `EclOperandsInt.cpp:152-158`, never assigned anywhere in the decompile,
   * so it stays an input: `Infinity` means "never take the bonus", and stage data
   * lowers it once the value is recovered.
   */
  lastSpellTimeOrbThreshold: number;

  // Point items
  pointItemValue: number;
  pointItemsCollected: number;
  pointItemsCollectedInStage: number;
  /** `g_MaxValuePointItemsCollected` — 点 items that paid full value. */
  maxValuePointItemsCollected: number;
  pointItemExtendsSoFar: number;
  nextPointItemExtendThreshold: number;

  // Stage
  currentStage: number;
  /**
   * `g_GameManager.globals->clockTime` (`GameManager.hpp:189-196`): the hour of
   * the night, 0 = midnight and 12 = dawn. ECL op 181 nudges it forward an hour
   * each time a stage-6 pattern says so, and the stage result pays
   * `2000000 * (12 - clockTime)` for the hours still left (`Gui.cpp:1210`).
   */
  clockTime: number;
  isReplay: boolean;
  isBossPresent: boolean;
  showRetryMenu: boolean;
  /**
   * `g_EclEnemyTableF54CC0[91]`, written by ECL op 175 (`EclRunHigh.inl:1104`): while
   * it is non-null every timeline spawn is skipped, which is how a boss sequence keeps
   * the background waves out of the arena. Stage 2 arms it twice and clears it twice.
   */
  spawnPaused: boolean;
  /**
   * The message sequence number the last timeline op 6 asked `Gui` to start
   * (`EnemyTimeline.cpp:236`, `Gui::FUN_00439810`). `-1` when nothing was requested;
   * the host may use it for the stage title card.
   */
  stageMessageRequest: number;
  /**
   * Set while `Gui`'s message box owns the screen, i.e. the `0x2181C >= 0` half of
   * `Gui::MsgWait()` (`Gui.cpp:1029-1036`) that timeline op 7 waits on. Nothing sets
   * it yet because the message VM is not ported, so op 7 advances.
   */
  messagePending: boolean;

  // Spell card
  /**
   * Card declared by the last op 122, cleared by op 123. `null` means no card is
   * up. The strings are the real ones: ZUN stores them in the instruction blob
   * Shift-JIS-XOR'd, and the translator decodes them at build time.
   */
  spellName: string | null;
  /** Card owner as the script spells it, e.g. 上白沢慧音. */
  spellOwner: string;
  /** Global card id, the index into the game's `Catk` capture history. */
  spellNumber: number;
  /** Script index of the boss's cut-in face (`face_stNN.anm`). */
  spellFace: number;
  /** Full-capture bonus this card pays. */
  spellBonus: number;
  /** Frames the current card has been up, for the cut-in's own timing. */
  spellFrames: number;
  /**
   * `globals->rng1[5]` and `rng4[3]`, the scratch the anti-tamper refresh writes
   * (`Player.cpp:1948-1955`). Kept for debug only — the checksum that reads them
   * is deliberately not modelled — but the draws themselves are, because they
   * shift the shared stream. See `randomizeAntiTamper`.
   */
  antiTamperRng1: number[];
  antiTamperRng4: number[];
}

/**
 * `ItemManager::UpdatePointItemExtendThreshold` — the next 残机 threshold from how
 * many extends have already been banked. Past the table the gap is a flat 500.
 */
export function updatePointItemExtendThreshold(gs: GameState): void {
  const n = gs.pointItemExtendsSoFar;
  if (gs.difficultyId >= 4) {
    gs.nextPointItemExtendThreshold =
      n < EXTRA_POINT_EXTEND_THRESHOLDS.length ? EXTRA_POINT_EXTEND_THRESHOLDS[n] : 99999;
    return;
  }
  gs.nextPointItemExtendThreshold =
    n < POINT_EXTEND_THRESHOLDS.length
      ? POINT_EXTEND_THRESHOLDS[n]
      : (n - 5) * 500 + POINT_EXTEND_THRESHOLDS[5];
}

/**
 * `GameManager::AddTimeOrbs`. A debit never takes the counter below zero, and a
 * credit is what raises `pointItemValue`: `+= 10 * ((amount + total & 1) / 2)`, so
 * orbs alternate between +10 and +0.
 */
export function addTimeOrbs(gs: GameState, amount: number): void {
  if (amount < 0 && gs.timeOrbs < -amount) {
    gs.timeOrbs = 0;
    return;
  }
  gs.timeOrbs += amount;
  gs.totalTimeOrbs += amount;
  if (amount > 0) {
    gs.pointItemValue += 10 * Math.floor((amount + (gs.totalTimeOrbs & 1)) / 2);
  }
}

export function createGameState(difficulty: Difficulty = 'normal', seed = 0): GameState {
  return {
    rng: new Rng(seed),
    frame: 0,
    difficulty,
    difficultyId: DIFFICULTY_ID[difficulty],
    difficultyMask: DIFFICULTY_MASK[difficulty],
    shotType: 0,
    character: 'reimu-yukari',
    score: 0,
    lives: 3,
    bombs: 3,
    power: 0,
    maxPower: 128,
    graze: 0,
    rank: RANK_PARAMS_BY_DIFFICULTY[DIFFICULTY_ID[difficulty]][0],
    subRank: 0,
    minRank: RANK_PARAMS_BY_DIFFICULTY[DIFFICULTY_ID[difficulty]][1],
    maxRank: RANK_PARAMS_BY_DIFFICULTY[DIFFICULTY_ID[difficulty]][2],
    youkaiGauge: 0,
    playerIsYoukai: false,
    bombRunning: false,
    bombForcedFocus: false,
    timeOrbs: 0,
    totalTimeOrbs: 0,
    lastSpellTimeOrbThreshold: Number.POSITIVE_INFINITY,
    pointItemValue: POINT_ITEM_VALUE_BY_DIFFICULTY[DIFFICULTY_ID[difficulty]],
    pointItemsCollected: 0,
    pointItemsCollectedInStage: 0,
    maxValuePointItemsCollected: 0,
    pointItemExtendsSoFar: 0,
    nextPointItemExtendThreshold: 100,
    currentStage: 1,
    clockTime: 0,
    isReplay: false,
    isBossPresent: false,
    showRetryMenu: false,
    spawnPaused: false,
    stageMessageRequest: -1,
    messagePending: false,
    spellName: null,
    spellOwner: '',
    spellNumber: -1,
    spellFace: 0,
    spellBonus: 0,
    spellFrames: 0,
    antiTamperRng1: [0, 0, 0, 0, 0],
    antiTamperRng4: [0, 0, 0],
  };
}

/** `ANTITAMPER_RNG_RANGE` / `ANTITAMPER_RNG_ADD` (`GameManager.hpp:19-20`). */
export const ANTITAMPER_RNG_RANGE = 100000;
export const ANTITAMPER_RNG_ADD = 6543;

/**
 * `GameManager::RandomizeAntiTamper` (`Player.cpp:1946-1956`).
 *
 * The retail body is eight draws — five `GetRandomU32InRange` into `rng1[0..4]`
 * and three `GetRandomF32InRange` into `rng4[0..2]` — and every one of them goes
 * through `GetRandomU32`, which is two `GetRandomU16` calls glued together
 * (`Global.hpp:204-207`, `Global.cpp:1208-1211`). So a single call advances the
 * shared 16-bit LCG by exactly sixteen steps.
 *
 * The values themselves only feed the `IsTampered()` checksum, which we do not
 * model, but the *stream* matters: the three call sites are all one line above
 * `Player::Die` (`Player.cpp:337`, `:364`, `:474`), each gated on
 * `playerState == PLAYER_STATE_ALIVE`, so every death shifts the generator that
 * the stage scripts draw their angles from. Skipping it is enough to move a
 * later bullet across the ship.
 */
export function randomizeAntiTamper(gs: GameState): void {
  for (let i = 0; i < 5; i++)
    gs.antiTamperRng1[i] = gs.rng.randomU32InRange(ANTITAMPER_RNG_RANGE) + ANTITAMPER_RNG_ADD;
  for (let i = 0; i < 3; i++)
    gs.antiTamperRng4[i] = gs.rng.randomF32InRange(ANTITAMPER_RNG_RANGE) + ANTITAMPER_RNG_ADD;
}
