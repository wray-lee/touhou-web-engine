/**
 * Bridge between generated ECL coroutines and TH08Game.
 *
 * Loads one route's translated `StageScript` -- the ECL subs and the spawn
 * timeline behind a single façade -- and builds the StageRunner that drives
 * authentic TH08 gameplay from them.
 *
 * All eight campaign routes are wired, including the stage 4 and stage 6
 * branches, so a run can actually diverge the way the retail game does.
 */

import {
  createGameState,
  lastSpellTimeOrbThreshold,
  SHOT_TYPES,
  type Difficulty,
} from '../../th08/sim/GameState';
import { StageRunner } from '../../th08/sim/StageRunner';
import { createEclSubFactory, collectEclSubs } from '../../th08/sim/EclBridge';
import { EffectPool } from '../../th08/sim/EffectPool';
import type { EffectCamera } from '../../th08/sim/EffectPool';
import { EFFECT_TEMPLATES, TH08_EFFECT_SCRIPT_BYTES } from './data/th08-effect-anm';
import { getCharacterProfile } from '../../touhou-common/player/CharacterProfile';
import type { StageScript } from '../../th08/stages/StageScript';
import { anmScriptFromBase64 } from '../../engine/anm/AnmVm';
import type { AnmPack } from '../../engine/anm/AnmPack';
import { enemyAnmBytes } from './data/th08-enemy-anm';
import { TH08_STGENM, stgenmBytes } from './data/th08-stgenm-anm';
import { getBulletDrawRadius, getBulletHitRadius } from './data/th08-bullet-types';
import { routeIndex, type StageRoute } from './StageRoute';
import type { CharacterId } from './types';

/**
 * Route -> its translated script façade.
 *
 * Dynamic imports keep each route in its own chunk: the whole campaign is over
 * a megabyte of translated script and a run only ever needs one route at a time.
 * Nothing downstream has to know the translator's file names or retail's
 * `ecldataN` numbering; the façade is the whole contract.
 */
const ECL_MODULES: Record<StageRoute, () => Promise<StageScript>> = {
  stage1: () => import('../../th08/stages/stage1').then((m) => m.STAGE1_SCRIPT),
  stage2: () => import('../../th08/stages/stage2').then((m) => m.STAGE2_SCRIPT),
  stage3: () => import('../../th08/stages/stage3').then((m) => m.STAGE3_SCRIPT),
  stage4a: () => import('../../th08/stages/stage4a').then((m) => m.STAGE4A_SCRIPT),
  stage4b: () => import('../../th08/stages/stage4b').then((m) => m.STAGE4B_SCRIPT),
  stage5: () => import('../../th08/stages/stage5').then((m) => m.STAGE5_SCRIPT),
  // 6A is ecldata6, the true final 6B is ecldata7 -- the facade hides that, which is
  // exactly the point: nothing downstream has to know retail's file numbering.
  stage6a: () => import('../../th08/stages/stage6a').then((m) => m.STAGE6A_SCRIPT),
  stage6b: () => import('../../th08/stages/stage6b').then((m) => m.STAGE6B_SCRIPT),
};

export interface EclStageConfig {
  route: StageRoute;
  difficulty: Difficulty;
  character: CharacterId;
  seed?: number;
  lives?: number;
  bombs?: number;
  power?: number;
  /** Where the run stands: carried in so a mid-run reload routes the same way. */
  stageNumber?: number;
  /**
   * What a stage keeps from the run that played before it. Retail never zeroes
   * these between stages, and neither does the sim: the score, the graze count,
   * the time orbs and the point-item value all ride the whole campaign.
   */
  carry?: {
    score: number;
    graze: number;
    timeOrbs: number;
    totalTimeOrbs: number;
    pointItemValue: number;
    /** Which hour of the endless night the run is on. See `TH08Game.runClockTime`. */
    clockTime: number;
  };
  /**
   * Multiplier applied to the per-type collision radius. The retail bullet size
   * lives in a blob the recompiler cannot name, so `getBulletHitRadius` is
   * calibrated instead of read; this hook is what the calibration sweep against
   * ZUN's own recordings varies. Production leaves it at 1.
   */
  bulletRadiusScale?: number;
  /**
   * The route's `.std` camera, read once per effect frame.
   *
   * Three effect families live in the backdrop's world rather than on the
   * playfield and retire themselves when the camera walks away from them; without
   * this they have nothing to measure against. See `EffectPool`'s `camera` dep.
   */
  stdCamera?: () => EffectCamera | null;
}

/**
 * `enemy.anm` decoded once per script id and kept for the whole session.
 *
 * The base64 blobs live in a generated module, so decoding is a one-off cost
 * per animation rather than per enemy spawn; a stage reuses the same handful of
 * scripts hundreds of times.
 */
/**
 * `stgNNenm.anm` per stage, decoded once per script id like `enemy.anm`.
 *
 * Ops 58-61 address their script ids against this pack rather than against the
 * shared `enemy.anm`, so without it every boss would draw the wrong cells out of
 * the wrong atlas - which is what made the boss faces read as transparent.
 */
const stageWordCaches = new Map<string, Map<number, Int32Array | null>>();
function stageAnmPack(name: string | null): AnmPack | null {
  if (!name || !(name in TH08_STGENM)) return null;
  let cache = stageWordCaches.get(name);
  if (!cache) stageWordCaches.set(name, (cache = new Map()));
  return {
    words(script: number): Int32Array | null {
      if (cache!.has(script)) return cache!.get(script) ?? null;
      let words: Int32Array | null = null;
      try {
        const b64 = stgenmBytes(name, script);
        if (b64) words = anmScriptFromBase64(b64);
      } catch {
        words = null;
      }
      cache!.set(script, words);
      return words;
    },
  };
}

/** Route -> the stage enemy pack it loads, following the ecldata numbering. */
const STGENM_BY_ROUTE: Readonly<Record<string, string>> = {
  stage1: 'stg1enm',
  stage2: 'stg2enm',
  stage3: 'stg3enm',
  stage4a: 'stg4aenm',
  stage4b: 'stg4benm',
  stage5: 'stg5enm',
  stage6a: 'stg6enm',
  stage6b: 'stg7enm',
};

const anmWordCache = new Map<number, Int32Array | null>();
const enemyAnmPack: AnmPack = {
  words(script: number): Int32Array | null {
    if (anmWordCache.has(script)) return anmWordCache.get(script) ?? null;
    let words: Int32Array | null = null;
    try {
      const b64 = enemyAnmBytes(script);
      if (b64) words = anmScriptFromBase64(b64);
    } catch {
      words = null;
    }
    anmWordCache.set(script, words);
    return words;
  },
};

/**
 * Load ECL data for a stage. Returns null if not available.
 */
export async function loadEclStage(config: EclStageConfig): Promise<StageRunner | null> {
  const load = ECL_MODULES[config.route];
  if (!load) return null;

  try {
    const script = await load();
    const subs = collectEclSubs(script.scripts);
    if (subs.length === 0) return null;

    const subFactory = createEclSubFactory(subs);
    const gs = createGameState(config.difficulty, config.seed ?? 0);
    gs.lives = config.lives ?? 3;
    gs.bombs = config.bombs ?? 3;
    gs.power = config.power ?? 0;
    gs.currentStage = config.stageNumber ?? 1;
    /*
     * `GameManagerSetup.cpp:250-253` sets this once per stage from
     * `g_TimeRequirementParams[currentStage][difficulty]`, and four separate systems read
     * it back: the ECL register `0x2772` a mid-boss breaks its last-spell sequence on, the
     * seven extra deathbomb frames a paid last spell buys (`Player.cpp:555`), the warm
     * white the HUD's Time row turns (`Gui.cpp:1462-1471`), and how many hours the stage
     * clear costs on the 夜時計 (`GameManager.cpp:1487-1556`). Keyed by *route*, because
     * `stageNumber` is the display label and 4A/4B and 6A/6B share theirs.
     */
    gs.lastSpellTimeOrbThreshold = lastSpellTimeOrbThreshold(routeIndex(config.route), config.difficulty);
    const carry = config.carry;
    if (carry) {
      gs.score = carry.score;
      gs.graze = carry.graze;
      gs.timeOrbs = carry.timeOrbs;
      gs.totalTimeOrbs = carry.totalTimeOrbs;
      gs.pointItemValue = carry.pointItemValue;
      gs.clockTime = carry.clockTime;
    }
    const shotType = SHOT_TYPES.indexOf(config.character as (typeof SHOT_TYPES)[number]);
    gs.shotType = shotType >= 0 ? shotType : 0;
    gs.character = config.character as (typeof SHOT_TYPES)[number];

    const eclFile = script.waves;
    // ECL spawns effects by template id, and the table says which `etama.anm` script each
    // id runs (`EffectManager.cpp:157`). One pool per stage, the way retail registers its
    // effect chain per stage and releases it on the way out (`EffectManager.cpp:1344-1372`).
    const effectPool = new EffectPool({
      rng: gs.rng,
      templates: EFFECT_TEMPLATES,
      scriptBytes: TH08_EFFECT_SCRIPT_BYTES,
      camera: config.stdCamera,
    });
    // The team's `plyNNa.sht` block owns the collection line, the pickup box and
    // the two move speeds, so the sim runs off the same numbers the retail game
    // loads rather than engine defaults.
    const team = getCharacterProfile(config.character);
    const runner = new StageRunner({
      gs,
      ecl: eclFile,
      subFactory,
      pointItemValueLine: team.pointItemValueLine,
      itemPickupHalfExtent: team.itemPickupHalfExtent,
      hitboxHalfExtent: team.hitboxHalfExtent,
      grazeHalfExtent: team.grazeHalfExtent,
      fastSpeed: team.fastSpeed,
      slowSpeed: team.slowSpeed,
      fastDiagonalSpeed: team.fastDiagonalSpeed,
      slowDiagonalSpeed: team.slowDiagonalSpeed,
      itemGrabSpeed: team.itemGrabSpeed,
      itemTimeScale: team.itemTimeScale,
      itemTimeScaleFocused: team.itemTimeScaleFocused,
      anmPack: enemyAnmPack,
      effectPool,
      anmPackAlt: stageAnmPack(STGENM_BY_ROUTE[config.route] ?? null) ?? undefined,
      anmStageName: STGENM_BY_ROUTE[config.route] ?? '',
      bulletRadiusFor: (type: number) => getBulletHitRadius(type) * (config.bulletRadiusScale ?? 1),
      bulletSizeFor: getBulletDrawRadius,
    });
    return runner;
  } catch (e) {
    console.warn('Failed to load ECL stage', config.route, e);
    return null;
  }
}

/**
 * Check whether ECL data is available for a given stage.
 */
export function hasEclData(route: StageRoute): boolean {
  return route in ECL_MODULES;
}
