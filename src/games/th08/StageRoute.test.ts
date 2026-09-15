import { describe, expect, it } from 'vitest';
import type { StageRoute } from './StageRoute';
import {
  displayStage,
  eclName,
  finalRoute,
  nextRoute,
  routeForDisplayStage,
  stage4RouteForShotType,
  type RouteContext,
} from './StageRoute';

/** A first-time player on the given team: no clears, no continues. */
function fresh(shotType: number): RouteContext {
  return { shotType, continued: false, clearedStage6A: false, clearedStage6BNoContinue: false };
}

/** Every route a campaign visits, from stage 1 until the router stops. */
function campaign(ctx: RouteContext): string[] {
  const seen: StageRoute[] = ['stage1'];
  let route: StageRoute | null = 'stage1';
  while (route) {
    route = nextRoute(route, ctx);
    if (route) seen.push(route);
  }
  return seen;
}

describe('retail stage routing', () => {
  it('splits stage 4 by team, solos following their own team', () => {
    // Reimu&Yukari 0, Youmu&Yuyuko 3 and their solos go to 4B.
    for (const shotType of [0, 3, 4, 5, 10, 11]) {
      expect(stage4RouteForShotType(shotType)).toBe('stage4b');
    }
    // Marisa&Alice 1, Sakuya&Remilia 2 and their solos go to 4A.
    for (const shotType of [1, 2, 6, 7, 8, 9]) {
      expect(stage4RouteForShotType(shotType)).toBe('stage4a');
    }
  });

  it('maps both branches onto the stage number the HUD prints', () => {
    expect(displayStage('stage4a')).toBe(4);
    expect(displayStage('stage4b')).toBe(4);
    expect(displayStage('stage6a')).toBe(6);
    expect(displayStage('stage6b')).toBe(6);
    expect(displayStage('stage5')).toBe(5);
  });

  it('indexes the translated ecl modules in retail enum order', () => {
    expect(eclName('stage4a')).toBe('ecldata4a');
    expect(eclName('stage4b')).toBe('ecldata4b');
    // 6A is ecldata6 and the true final 6B is ecldata7, not ecldata8 (Extra).
    expect(eclName('stage6a')).toBe('ecldata6');
    expect(eclName('stage6b')).toBe('ecldata7');
  });

  it('runs a new player through all seven stages', () => {
    expect(campaign(fresh(0))).toEqual([
      'stage1',
      'stage2',
      'stage3',
      'stage4b',
      'stage5',
      'stage6a',
      'stage6b',
    ]);
    expect(campaign(fresh(1))).toEqual([
      'stage1',
      'stage2',
      'stage3',
      'stage4a',
      'stage5',
      'stage6a',
      'stage6b',
    ]);
  });

  it('ends the campaign after 6B', () => {
    expect(nextRoute('stage6b', fresh(0))).toBeNull();
  });

  it('lets a veteran skip 6A, and takes the shortcut away after a continue', () => {
    expect(finalRoute(fresh(0))).toBe('stage6a');
    expect(finalRoute({ ...fresh(0), clearedStage6A: true })).toBe('stage6b');
    expect(finalRoute({ ...fresh(0), clearedStage6BNoContinue: true })).toBe('stage6b');
    expect(finalRoute({ ...fresh(0), continued: true, clearedStage6A: true })).toBe('stage6a');
  });

  it('sends a solo character straight to the true final', () => {
    // Six stages instead of seven.
    expect(campaign(fresh(4))).toEqual(['stage1', 'stage2', 'stage3', 'stage4b', 'stage5', 'stage6b']);
  });

  it('resolves the practice picker to a concrete route', () => {
    expect(routeForDisplayStage(4, fresh(1))).toBe('stage4a');
    expect(routeForDisplayStage(4, fresh(0))).toBe('stage4b');
    expect(routeForDisplayStage(6, { ...fresh(2), clearedStage6A: true })).toBe('stage6b');
    expect(routeForDisplayStage(3, fresh(0))).toBe('stage3');
  });
});
