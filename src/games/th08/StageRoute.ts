/**
 * Retail stage routing for 東方永夜抄.
 *
 * `stageNumber` is only what the HUD prints. What actually plays is one of the
 * nine `ecldataN.ecl` scripts, indexed by the retail `Stage` enum
 * (`th08web-ref/src/ScoreDat.hpp:70-83`, table at `Background.cpp:123-125`):
 *
 *   0 stage1  1 stage2  2 stage3  3 stage4a 4 stage4b
 *   5 stage5  6 stage6a 7 stage6b 8 extra
 *
 * Two of those nine are branches, and both branches come from
 * `GameManager::AdvanceToNextStage` (`GameManager.cpp:1563-1610`):
 *
 * - After stage 3 the team decides: Marisa/Alice and Sakuya/Remilia go to 4A,
 *   Reimu/Yukari and Youmu/Yuyuko go to 4B. Solo characters follow their team.
 * - After stage 5 the save data decides: a solo character, or a player who has
 *   already cleared 6A (even with continues), or already cleared 6B without
 *   continuing, skips straight to the true final 6B. Otherwise 6A plays first
 *   and 6A always hands off to 6B, so that route is seven stages long.
 * - Continuing at any point (`numRetries > 0`) forces the long route.
 *
 * Extra (index 8) is out of scope for this reproduction.
 */

import type { StageNumber } from './types';

/** The eight campaign routes; `extra` is deliberately not represented. */
export type StageRoute =
  'stage1' | 'stage2' | 'stage3' | 'stage4a' | 'stage4b' | 'stage5' | 'stage6a' | 'stage6b';

/** Retail enum order, which is also the `g_StageEclFiles` index order. */
export const ROUTE_ORDER: readonly StageRoute[] = [
  'stage1',
  'stage2',
  'stage3',
  'stage4a',
  'stage4b',
  'stage5',
  'stage6a',
  'stage6b',
];

/** Base name of the translated ECL module backing each route. */
const ECL_NAME: Record<StageRoute, string> = {
  stage1: 'ecldata1',
  stage2: 'ecldata2',
  stage3: 'ecldata3',
  stage4a: 'ecldata4a',
  stage4b: 'ecldata4b',
  stage5: 'ecldata5',
  stage6a: 'ecldata6',
  stage6b: 'ecldata7',
};

/**
 * Label for menus and the results screen.
 *
 * Deliberately just the retail route letter: the Japanese stage subtitles are
 * not present in any of the unpacked data we parse, and inventing them here
 * would put unverified text on screen. `docs/REQUIREMENTS.md` tracks filling
 * these in from `stg*Ntxt.anm` once that sheet is decoded.
 */
const ROUTE_LABEL: Record<StageRoute, string> = {
  stage1: 'STAGE 1',
  stage2: 'STAGE 2',
  stage3: 'STAGE 3',
  stage4a: 'STAGE 4-1',
  stage4b: 'STAGE 4-2',
  stage5: 'STAGE 5',
  stage6a: 'STAGE 6-1',
  stage6b: 'STAGE 6-2',
};

export function eclName(route: StageRoute): string {
  return ECL_NAME[route];
}

export function routeLabel(route: StageRoute): string {
  return ROUTE_LABEL[route];
}

/** Index into the retail stage tables (0-based, Extra excluded). */
export function routeIndex(route: StageRoute): number {
  return ROUTE_ORDER.indexOf(route);
}

/** The number the HUD prints: both 4A/4B read "4", both 6A/6B read "6". */
export function displayStage(route: StageRoute): StageNumber {
  const index = routeIndex(route);
  // stage1..3 -> 1..3, 4a/4b -> 4, stage5 -> 5, 6a/6b -> 6
  return (index <= 2 ? index + 1 : index <= 4 ? 4 : index === 5 ? 5 : 6) as StageNumber;
}

export function isFinalRoute(route: StageRoute): boolean {
  return route === 'stage6b';
}

/**
 * Stage 4 branch, straight from `AdvanceToNextStage`.
 *
 * The retail `Shot` enum (`ScoreDat.hpp:52-67`) lists the four teams first and
 * then the eight solos, two per team and in the same team order, so a solo maps
 * back to its team with `(shotType - 4) / 2`. Reimu/Yukari and Youmu/Yuyuko take
 * 4B; Marisa/Alice and Sakuya/Remilia take 4A.
 */
export function stage4RouteForShotType(shotType: number): StageRoute {
  const team = shotType < 4 ? shotType : Math.floor((shotType - 4) / 2);
  return team === 1 || team === 2 ? 'stage4a' : 'stage4b';
}

/** A solo character is `shotType >= 4` (`SHOT_YOUMU_YUYUKO === 3`). */
export function isSoloShotType(shotType: number): boolean {
  return shotType >= 4;
}

/** Everything the router needs that is not the current route. */
export interface RouteContext {
  /** Retail shot type, 0..11. */
  shotType: number;
  /** True once the player has used a continue; forces the long route. */
  continued: boolean;
  /** Has this character ever cleared 6A, on any difficulty, with continues. */
  clearedStage6A: boolean;
  /** Has this character ever cleared 6B without continuing, on any difficulty. */
  clearedStage6BNoContinue: boolean;
}

/**
 * Which of the two stage-6 variants to play after stage 5 (`Gui.cpp:252-306`).
 *
 * The retail condition reads "you have seen 6A before, or you are flying solo,
 * or you already own a no-continue 6B clear" — a shortcut for players who have
 * beaten the game. A continue takes it away.
 */
export function finalRoute(ctx: RouteContext): StageRoute {
  if (ctx.continued) return 'stage6a';
  if (isSoloShotType(ctx.shotType)) return 'stage6b';
  if (ctx.clearedStage6BNoContinue) return 'stage6b';
  if (ctx.clearedStage6A) return 'stage6b';
  return 'stage6a';
}

/**
 * `GameManager::AdvanceToNextStage`, as a pure function.
 *
 * Returns `null` when the campaign is over, which happens only after 6B.
 */
export function nextRoute(route: StageRoute, ctx: RouteContext): StageRoute | null {
  switch (route) {
    case 'stage1':
      return 'stage2';
    case 'stage2':
      return 'stage3';
    case 'stage3':
      return stage4RouteForShotType(ctx.shotType);
    case 'stage4a':
    case 'stage4b':
      return 'stage5';
    case 'stage5':
      return finalRoute(ctx);
    case 'stage6a':
      return 'stage6b';
    case 'stage6b':
      return null;
  }
}

/** Entry point for a fresh run, and for Practice's stage picker. */
export function routeForDisplayStage(stage: StageNumber, ctx: RouteContext): StageRoute {
  switch (stage) {
    case 1:
      return 'stage1';
    case 2:
      return 'stage2';
    case 3:
      return 'stage3';
    case 4:
      return stage4RouteForShotType(ctx.shotType);
    case 5:
      return 'stage5';
    case 6:
      return finalRoute(ctx);
  }
}
