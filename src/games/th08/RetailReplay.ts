/**
 * Headless playback of retail `.rpy` replays.
 *
 * This is the P2 acceptance gate from `.scratch/PLAN-v3-th08-90.md`: take a
 * recording ZUN shipped inside `th08.dat`, restore the stage state it names,
 * feed its own input stream through the translated scripts, and read back what
 * the run scored. Everything the player can be wrong about -- bullet geometry,
 * collision boxes, damage, item drops, the score table -- shows up in that one
 * number, which is what makes it an objective yardstick rather than a taste
 * judgement.
 *
 * The playback contract is the retail one (`ReplayManager.cpp`):
 *
 *  - `AddedCallbackDemo:582-607` restores rank, lives, bombs, power, graze, the
 *    point-item value and threshold, the youkai gauge, the clock hour and the
 *    RNG seed from the stage block, then points the reader at `+0x24`.
 *  - `OnUpdateHighPrioDemo:329-330` consumes one `u16` of held buttons per
 *    frame. The recorder wrote a zero word at the stream head before its first
 *    frame, so stream index `i` *is* frame `i`; no offset is needed here.
 *  - Buttons are held state, but `bomb` is a press: the game asks
 *    `wasKeyPressed('bomb')`, so the driver edges the bit the way `Player.cpp`
 *    does. Shoot and focus stay held.
 *
 * The ship's own weapon is not in the sim -- retail keeps it in the player
 * object, and so does this repo -- so the driver borrows the game's exact wiring:
 * `Player.shoot()` into a `BulletSystem`, then `damageEnemiesAt()`. Anything else
 * would reconcile the replay against a weapon the shipped game never uses.
 */

import { parseReplay, replayButtons, TH_BUTTON } from '../../th08/format/ReplayFile';
import type { StageReplay } from '../../th08/format/ReplayFile';
import type { Difficulty } from '../../th08/sim/GameState';
import type { StageRunner } from '../../th08/sim/StageRunner';
import type { PlayerInput } from '../../th08/sim/PlayerSim';
import { drainSlotRefusals } from '../../th08/sim/EnemySlot';
import { Player } from '../../touhou-common/player/Player';
import { BulletSystem } from '../../engine/core/BulletSystem';
import type { Bullet } from '../../engine/core/Bullet';
import { loadEclStage } from './EclStageLoader';
import { ROUTE_ORDER, displayStage } from './StageRoute';
import type { StageRoute } from './StageRoute';
import type { CharacterId } from './types';

/** `ScoreDat.hpp:44-52`. */
const DIFFICULTY_BY_ID: readonly Difficulty[] = ['easy', 'normal', 'hard', 'lunatic', 'extra'];

/** `ScoreDat.hpp:54-69`: the four teams, then the eight solo characters. */
const TEAM_BY_SHOT: readonly CharacterId[] = [
  'reimu-yukari',
  'marisa-alice',
  'sakuya-remilia',
  'youmu-yuyuko',
];

/**
 * Which team a raw shot type flies.
 *
 * The reference lists four teams and then eight solos, two solos per team in
 * team order (`ScoreDat.hpp:56-67`), so a solo folds back onto its team with
 * `(shotType - 4) / 2`. This repo has one weapon table per team, so playback
 * needs the team and not the solo.
 */
export function teamForShotType(shotType: number): CharacterId {
  const team = shotType < 4 ? shotType : Math.floor((shotType - 4) / 2);
  return TEAM_BY_SHOT[Math.max(0, Math.min(3, team))];
}

/** The stage block a replay actually recorded, or `null` when it recorded none. */
export function recordedStage(
  raw: Uint8Array,
): { stage: StageReplay; shotType: number; difficulty: Difficulty } | null {
  const replay = parseReplay(raw);
  const stage = replay.stages.find((s): s is StageReplay => s !== null);
  if (!stage) return null;
  const difficulty = DIFFICULTY_BY_ID[replay.difficulty] ?? 'normal';
  return { stage, shotType: replay.shotType, difficulty };
}

/** One replayed stage, with everything the gate needs in order to judge it. */
export interface ReplayOutcome {
  /** Recording this came from, e.g. `demorpy0`. */
  demo: string;
  route: StageRoute;
  difficulty: Difficulty;
  character: CharacterId;
  /** Raw retail shot type, so a mis-mapped team is visible in the report. */
  shotType: number;
  /** Frames the recording holds. */
  frames: number;
  /** Frames the sim actually ran before the stage ended or the stream ran out. */
  ran: number;
  /** True when the script reached its own ending inside the recorded frames. */
  cleared: boolean;
  /** Message from the first tick that threw, or `''`. */
  thrown: string;
  /** First slot whose position or HP went non-finite, or `''`. */
  badSlot: string;
  /** Distinct ECL operands the sim refused to run. */
  refusals: string[];
  /** Our score at the last frame run. */
  score: number;
  /** Score the recording says the stage ended on. */
  recordedScore: number;
  /** ours / theirs, the single number the fidelity ladder is tracked by. */
  scoreRatio: number;
  /** ours - theirs, signed. */
  scoreDelta: number;
  /**
   * Score at the last frame the recording was still playing.
   *
   * `recordedScore` is one number: what the stage ended on. A run that outlives the
   * envelope is therefore not comparable to it any more -- past that frame the
   * recorded ship stops shooting and the stage cannot end, so every extra point is
   * earned in a tail ZUN never performed. This is the number the ladder reads.
   */
  scoreAtEnvelope: number;
  /** `scoreAtEnvelope / recordedScore`. */
  envelopeScoreRatio: number;
  /** Deaths spent inside the envelope, which is the window the ceiling is written for. */
  envelopeDeaths: number;
  graze: number;
  pointItems: number;
  /**
   * 时符 banked by the end of the run. The gate does not score it, but it is the number
   * four other systems compare against `g_TimeRequirementParams`, so the replay has to say
   * what it reached: that is what proves the threshold work is inert for these four runs.
   */
  timeOrbs: number;
  power: number;
  lives: number;
  bombs: number;
  /** Times the ship was hit, which is how a mis-scaled hitbox shows up. */
  deaths: number;
  /**
   * The frame of each hit. ZUN's own dodge line is a known quantity, so the
   * first frame where we take a hit is the first frame where one of our
   * patterns disagrees with his -- a location, not just a verdict.
   */
  deathFrames: number[];
  /**
   * Frames on which the engine's own collision test landed, with the geometry of
   * the deepest shot in each. Only collected when `immortal` is set, because the
   * live path retires the bullets that land and so cannot be measured afterwards.
   */
  hitLog: { f: number; type: number; radius: number; dx: number; dy: number; laser: boolean }[];
  /** Frames with at least one landed test. Equals `deaths` unless `immortal`. */
  hitFrames: number;
  /** Boss gauge at the last frame run, as `hp/max`, or `''` with no live boss. */
  bossEnd: string;
  /** Spell card running at the last frame run, or `''`. */
  spellEnd: string;
  bombsUsed: number;
  focusFrames: number;
  shootFrames: number;
  peakBullets: number;
  peakEnemies: number;
  /**
   * One past the last frame whose recorded word still carries the fire button.
   *
   * A recording does not stop when the playable part does: retail keeps walking the
   * stream through the result screen, and the demo's own Ctrl (TH_BUTTON_SKIP) is
   * held to hurry it along. Everything past this frame is a ship standing still
   * with the gun off, which is why the gate measures the dodge against the envelope
   * rather than against `frames`.
   */
  playableFrames: number;
  /** Frames on which a boss life bar was live. Zero means the run never fought. */
  bossFrames: number;
  /** Frame the script reached its own ending, or -1 when it never did. */
  clearFrame: number;
}

/** The `Player.shoot` path needs something to aim homing weapons at. */
function playableEnvelope(inputs: number[]): number {
  for (let i = inputs.length - 1; i >= 0; i--) {
    if (inputs[i] & TH_BUTTON.shoot) return i + 1;
  }
  return 0;
}

function aimAt(runner: StageRunner): { position: { x: number; y: number } } | null {
  let best: { position: { x: number; y: number } } | null = null;
  let bestDist = Infinity;
  for (const e of runner.enemies.getActive()) {
    if (!e.active) continue;
    const d = Math.abs(e.posX - runner.player.x) + Math.abs(e.posY - runner.player.y);
    if (d < bestDist) {
      bestDist = d;
      best = { position: { x: e.posX, y: e.posY } };
    }
  }
  return best;
}

/**
 * Replay one recorded stage against the translated script that owns it.
 *
 * `maxFrames` caps a run so a stage that ignores its ending cannot spin forever;
 * it defaults to the whole recording.
 */
export async function playReplay(
  demo: string,
  raw: Uint8Array,
  options: {
    maxFrames?: number;
    seedOverride?: number;
    bulletRadiusScale?: number;
    /** Run the collision test but never spend a life, so a whole stage can be measured. */
    immortal?: boolean;
  } = {},
): Promise<ReplayOutcome> {
  const decoded = recordedStage(raw);
  if (!decoded) throw new Error(`${demo}: no stage block recorded`);
  const { stage, shotType, difficulty } = decoded;
  const route = ROUTE_ORDER[stage.stageIndex];
  if (!route) throw new Error(`${demo}: stage index ${stage.stageIndex} has no route`);
  const character = teamForShotType(shotType);
  const h = stage.header;

  drainSlotRefusals();
  const runner = await loadEclStage({
    route,
    difficulty,
    character,
    // `AddedCallbackDemo:602` restores the stage's RNG from this exact field, so
    // replaying with any other seed would not be replaying the recording.
    seed: options.seedOverride ?? h.rngSeed,
    lives: h.lives,
    bombs: h.bombs,
    power: h.power,
    stageNumber: displayStage(route),
    bulletRadiusScale: options.bulletRadiusScale,
  });
  if (!runner) throw new Error(`${demo}: route ${route} failed to load`);

  // The rest of the snapshot, in the same order retail applies it. These are the
  // fields `loadEclStage` cannot know about because a normal run derives them
  // from the campaign rather than from a recording.
  const gs = runner.gs;
  gs.isReplay = true;
  gs.rank = h.rank;
  gs.graze = h.graze;
  gs.pointItemValue = h.pointItemValue;
  gs.pointItemsCollected = h.pointItemsCollected;
  gs.pointItemExtendsSoFar = h.pointItemExtends;
  gs.nextPointItemExtendThreshold = h.nextPointItemExtendThreshold;
  gs.youkaiGauge = h.youkaiGauge;
  gs.clockTime = h.clockTime;
  runner.player.graze = h.graze;

  const bullets = new BulletSystem();
  const ship = new Player(
    { x: runner.player.x, y: runner.player.y },
    {
      characterId: character,
      initialPower: h.power,
      initialLives: h.lives,
      initialBombs: h.bombs,
    },
  );
  ship.lives = h.lives;
  ship.bombs = h.bombs;
  ship.power = h.power;

  const outcome: ReplayOutcome = {
    demo,
    route,
    difficulty,
    character,
    shotType,
    frames: stage.frames,
    ran: 0,
    cleared: false,
    thrown: '',
    badSlot: '',
    refusals: [],
    score: 0,
    recordedScore: h.score,
    scoreRatio: 0,
    scoreDelta: 0,
    scoreAtEnvelope: 0,
    envelopeScoreRatio: 0,
    envelopeDeaths: 0,
    graze: 0,
    pointItems: 0,
    timeOrbs: 0,
    power: h.power,
    lives: h.lives,
    bombs: h.bombs,
    deaths: 0,
    deathFrames: [],
    hitLog: [],
    hitFrames: 0,
    bossEnd: '',
    spellEnd: '',
    bombsUsed: 0,
    focusFrames: 0,
    shootFrames: 0,
    peakBullets: 0,
    peakEnemies: 0,
    playableFrames: playableEnvelope(stage.inputs),
    bossFrames: 0,
    clearFrame: -1,
  };

  const limit = Math.min(options.maxFrames ?? stage.frames, stage.frames);
  // An immortal run is a measurement run: it keeps the collision test running but
  // declines the life loss, so a whole stage can be surveyed without the recorded
  // line collapsing at its first disagreement.
  runner.debugNoFail = options.immortal === true;
  let prevBomb = false;
  // The envelope is crossed once, and the frame it happens on is the only frame whose
  // score can be set against the recording's own total.
  let envelopeSeen = false;
  let scoreAtEnvelope = 0;
  let envelopeDeaths = 0;
  for (let i = 0; i < limit; i++) {
    const bits = stage.inputs[i];
    const b = replayButtons(bits);
    const bombPress = b.bomb && !prevBomb;
    prevBomb = b.bomb;
    const input: PlayerInput = {
      dx: (b.right ? 1 : 0) - (b.left ? 1 : 0),
      dy: (b.down ? 1 : 0) - (b.up ? 1 : 0),
      shoot: b.shoot,
      bomb: bombPress,
      slow: b.focus,
      // The recorded word goes through as well. `dx`/`dy` are the difference of two
      // held keys, which erases exactly the cases retail's eight-way priority chain
      // was written to resolve, so the sim reads the bits themselves.
      dirBits: bits,
    };
    if (b.focus) outcome.focusFrames++;
    if (b.shoot) outcome.shootFrames++;

    try {
      const before = runner.player.lives;
      runner.tick(input);
      if (options.immortal && (runner.lastHits.length > 0 || runner.lastLaserHits.length > 0)) {
        outcome.hitFrames++;
        if (outcome.hitLog.length < 60) {
          const pick = runner.lastHits[0];
          if (pick) {
            outcome.hitLog.push({
              f: i,
              type: pick.type,
              radius: pick.radius,
              dx: Math.abs(pick.x - runner.player.x),
              dy: Math.abs(pick.y - runner.player.y),
              laser: false,
            });
          } else {
            outcome.hitLog.push({ f: i, type: -1, radius: 0, dx: 0, dy: 0, laser: true });
          }
        }
      }
      if (runner.player.lives < before) {
        outcome.deaths++;
        outcome.deathFrames.push(i);
      }
      if (bombPress) outcome.bombsUsed++;

      // The presentation ship is a mirror of the sim's, exactly as in the game:
      // the sim owns where it is and what it holds, the weapon reads from it.
      ship.position.x = runner.player.x;
      ship.position.y = runner.player.y;
      ship.power = runner.player.power;
      ship.memberIndex = runner.player.memberIndex;
      ship.isSlowMode = runner.player.isSlow;
      ship.hitboxVisible = runner.player.hitboxVisible;
      ship.setAimTarget(aimAt(runner));
      ship.tickShootCooldown(1);
      if (input.shoot) {
        const fresh = ship.shoot(gs.frame);
        if (fresh.length) bullets.add(...fresh);
      }
      bullets.update(1);
      damageEnemiesWithShots(runner, bullets);
    } catch (e) {
      outcome.thrown = `f=${i} ${String((e as Error).message).slice(0, 200)}`;
      outcome.ran = i + 1;
      break;
    }

    outcome.ran = i + 1;
    if (!envelopeSeen && outcome.ran >= outcome.playableFrames) {
      scoreAtEnvelope = runner.player.score;
      envelopeDeaths = outcome.deaths;
      envelopeSeen = true;
    }
    outcome.peakBullets = Math.max(outcome.peakBullets, runner.bullets.activeCount);
    outcome.peakEnemies = Math.max(outcome.peakEnemies, runner.enemies.activeCount);
    if (runner.enemies.gaugeOwner()) outcome.bossFrames++;
    if (!outcome.badSlot) {
      for (const slot of runner.enemies.slots) {
        if (!slot.active) continue;
        if (!Number.isFinite(slot.posX) || !Number.isFinite(slot.posY) || !Number.isFinite(slot.hp)) {
          outcome.badSlot =
            `f=${i} slot=${slot.slotIndex} sub=${slot.subId}` +
            ` x=${slot.posX} y=${slot.posY} hp=${slot.hp}`;
          break;
        }
      }
    }
    if (runner.isFinished) {
      outcome.cleared = true;
      outcome.clearFrame = i;
      break;
    }
    if (gs.showRetryMenu) {
      outcome.thrown = outcome.thrown || `f=${i} game over (lives spent)`;
      break;
    }
  }

  const seen = new Set<string>();
  for (const refusal of drainSlotRefusals()) {
    const key = `${refusal.op}|${refusal.sub}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (outcome.refusals.length < 6) {
      outcome.refusals.push(`op${refusal.op} sub${refusal.sub} args=${JSON.stringify(refusal.args)}`);
    }
  }

  outcome.score = runner.player.score;
  // A run that ends before the envelope never crossed it, so its whole score *is* the
  // in-window score and its whole death count the in-window count.
  if (!envelopeSeen) {
    scoreAtEnvelope = outcome.score;
    envelopeDeaths = outcome.deaths;
  }
  outcome.scoreAtEnvelope = scoreAtEnvelope;
  outcome.envelopeDeaths = envelopeDeaths;
  outcome.envelopeScoreRatio = h.score > 0 ? scoreAtEnvelope / h.score : 0;
  outcome.graze = runner.player.graze;
  outcome.pointItems = gs.pointItemsCollected;
  outcome.timeOrbs = gs.timeOrbs;
  outcome.power = runner.player.power;
  outcome.lives = runner.player.lives;
  outcome.bombs = runner.player.bombs;
  const gauge = runner.bossGauge;
  outcome.bossEnd = gauge ? `${Math.max(0, Math.round(gauge.hp))}/${gauge.maxHp}` : '';
  outcome.spellEnd = gs.spellName ?? '';
  outcome.scoreRatio = h.score > 0 ? outcome.score / h.score : 0;
  outcome.scoreDelta = outcome.score - h.score;
  return outcome;
}

/** Feed the ship's live shots into the sim, the way `tickEclRunner` does. */
function damageEnemiesWithShots(runner: StageRunner, bullets: BulletSystem): void {
  const shots: Array<{ x: number; y: number; damage: number; active: boolean }> = [];
  for (const bullet of bullets.getBullets()) {
    if (bullet.tag !== 'player-bullet') continue;
    shots.push(watchShot(bullet));
  }
  if (shots.length) runner.damageEnemiesAt(shots);
}

/**
 * A live view of one player shot.
 *
 * The getters matter: `damageEnemiesAt` destroys a bullet when a hit lands, and a
 * copied snapshot would let one shot pierce every enemy it flies through.
 */
function watchShot(bullet: Bullet) {
  return {
    get x() {
      return bullet.position.x;
    },
    get y() {
      return bullet.position.y;
    },
    damage: bullet.damage,
    get active() {
      return bullet.isAlive;
    },
    set active(value: boolean) {
      if (!value) bullet.destroy();
    },
  };
}
