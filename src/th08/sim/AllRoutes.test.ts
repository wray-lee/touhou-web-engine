/**
 * Every campaign route, driven with the hands off the controls.
 *
 * `docs/REQUIREMENTS.md` R-8 kept 二至六面 at 🐛 for one reason: the only
 * end-to-end evidence in the suite was stage 1. This closes that gap for the parts
 * that are objective — the translated script runs to its last instruction without
 * throwing, without inventing a non-finite slot, and without a single refused
 * operand — and it pins down *why* a route that does not clear fails to clear.
 *
 * What this deliberately does not claim: an untouched ship is not a dodged one.
 * The player here sits still and takes hits, so `lives` runs down and the run is
 * nothing like 全避. What it does prove is the structural half of that property:
 * the phase changes and the boss exits are driven by the script's own clocks, not
 * by the player's damage output, because nothing here ever fires. The ship's own
 * weapon lives in the presentation layer, so the damage-driven half is
 * `StageCompletion.test.ts` and `TH08Game.test.ts`.
 */
import { describe, expect, it } from 'vitest';
import { loadEclStage } from '../../games/th08/EclStageLoader';
import { drainSlotRefusals } from './EnemySlot';
import type { StageRoute } from '../../games/th08/StageRoute';

const ROUTES = ['stage1', 'stage2', 'stage3', 'stage4a', 'stage4b', 'stage5', 'stage6a', 'stage6b'] as const;

/** Hands off: no aim, no fire, no bomb, no focus. */
const DODGE = { dx: 0, dy: 0, shoot: false, bomb: false, slow: false } as never;

/** Hard stop for a route that ignores its own timeline. */
const FRAME_CAP = 60_000;
/** How long to wait for a scripted boss to leave once the timeline is spent. */
const EXIT_GRACE = 8_000;

interface Run {
  route: string;
  frames: number;
  timelineFrames: number;
  finished: boolean;
  timelineDone: boolean;
  thrown: string;
  badSlot: string;
  refusals: string[];
  peakBullets: number;
  peakEnemies: number;
  bossLeft: string;
  score: number;
  lives: number;
  /** Bullets that launched carrying a transform-record chain. */
  recordedBullets: number;
  /** Frames on which an armed transform handler ran. */
  handlerFrames: number;
  /** op 36 installs, and the frames the interpolator tail ran. */
  interpInstalls: number;
  interpFrames: number;
}

async function handsOff(route: StageRoute): Promise<Run> {
  drainSlotRefusals();
  const runner = await loadEclStage({
    route,
    difficulty: 'normal',
    character: 'reimu-yukari',
    seed: 7,
    power: 128,
  });
  if (!runner) throw new Error(route + ' failed to load');
  const run: Run = {
    route,
    frames: 0,
    timelineFrames: 0,
    finished: false,
    timelineDone: false,
    thrown: '',
    badSlot: '',
    refusals: [],
    peakBullets: 0,
    peakEnemies: 0,
    bossLeft: '',
    score: 0,
    lives: 0,
    recordedBullets: 0,
    handlerFrames: 0,
    interpInstalls: 0,
    interpFrames: 0,
  };
  for (let f = 0; f < FRAME_CAP; f++) {
    try {
      runner.tick(DODGE);
    } catch (e) {
      run.thrown = 'f=' + f + ' ' + String((e as Error).message).slice(0, 200);
      break;
    }
    run.peakBullets = Math.max(run.peakBullets, runner.bullets.activeCount);
    run.peakEnemies = Math.max(run.peakEnemies, runner.enemies.activeCount);
    if (!run.badSlot) {
      for (const slot of runner.enemies.slots) {
        if (!slot.active) continue;
        if (!Number.isFinite(slot.posX) || !Number.isFinite(slot.posY) || !Number.isFinite(slot.hp)) {
          run.badSlot =
            'f=' +
            f +
            ' slot=' +
            slot.slotIndex +
            ' sub=' +
            slot.subId +
            ' x=' +
            slot.posX +
            ' y=' +
            slot.posY +
            ' hp=' +
            slot.hp;
          break;
        }
      }
    }
    if (!run.timelineDone && runner.timeline.finished) {
      run.timelineDone = true;
      run.timelineFrames = f + 1;
    }
    if (runner.isFinished) {
      run.finished = true;
      run.frames = f + 1;
      break;
    }
    if (run.timelineDone && f > run.timelineFrames + EXIT_GRACE) {
      run.frames = f + 1;
      break;
    }
  }
  if (!run.frames) run.frames = runner.gs.frame;
  const bosses = runner.enemies.slots.filter((slot) => slot.active && slot.isBoss);
  run.bossLeft = bosses.map((slot) => 'sub' + slot.subId + ' hp' + slot.hp + '/' + slot.maxHp).join(', ');
  const seen = new Set<string>();
  for (const refusal of drainSlotRefusals()) {
    const key = refusal.op + '|' + refusal.sub;
    if (seen.has(key)) continue;
    seen.add(key);
    if (run.refusals.length < 5) {
      run.refusals.push(
        'op' +
          refusal.op +
          ' slot' +
          refusal.slot +
          ' sub' +
          refusal.sub +
          ' args=' +
          JSON.stringify(refusal.args),
      );
    }
  }
  run.score = runner.player.score;
  run.lives = runner.player.lives;
  run.recordedBullets = runner.bullets.stats.recorded;
  run.handlerFrames = runner.bullets.stats.handlerFrames;
  for (const slot of runner.enemies.slots) {
    run.interpInstalls += slot.interpInstalls;
    run.interpFrames += slot.interpSteps;
  }
  return run;
}

describe('all routes, hands off', () => {
  it('runs every translated script to its last instruction', async () => {
    const lines: string[] = [];
    const cleared: string[] = [];
    const held: string[] = [];
    for (const route of ROUTES) {
      const run = await handsOff(route);
      lines.push(
        run.route.padEnd(7) +
          ' f' +
          String(run.frames).padStart(6) +
          (run.finished ? ' CLEARED' : ' held   ') +
          ' tl@' +
          String(run.timelineFrames).padStart(6) +
          ' blt=' +
          run.peakBullets +
          ' en=' +
          run.peakEnemies +
          ' sc=' +
          run.score +
          ' rec=' +
          run.recordedBullets +
          ' hdl=' +
          run.handlerFrames +
          ' ip=' +
          run.interpInstalls +
          '/' +
          run.interpFrames +
          (run.bossLeft ? ' boss: ' + run.bossLeft : ''),
      );
      expect(run.thrown, route + ' threw: ' + run.thrown).toBe('');
      expect(run.badSlot, route + ' produced ' + run.badSlot).toBe('');
      expect(run.refusals, route + ' refused operands: ' + run.refusals.join('; ')).toEqual([]);
      expect(run.timelineDone, route + ' never reached the end of its timeline').toBe(true);
      // A route that never put a single bullet on screen is not a played stage.
      expect(run.peakBullets, route + ' spawned no enemy bullets at all').toBeGreaterThan(0);
      // Every stage script installs transform records, so a route where none of
      // them ever reached a bullet, or where a bullet carried one but never ran
      // a handler, means the machine is wired to the pool but not to the stage.
      expect(run.recordedBullets, route + ' launched no bullet carrying a record').toBeGreaterThan(0);
      expect(run.handlerFrames, route + ' never ran a transform handler').toBeGreaterThan(0);
      if (run.finished) cleared.push(route);
      else {
        // The only legitimate reason a scripted run cannot end is a boss that is
        // still standing: that is damage the hands-off player never dealt.
        expect(run.bossLeft, route + ' stalled with no boss left to kill').not.toBe('');
        held.push(route);
      }
    }
    console.log(lines.join('\n'));
    expect(
      cleared.length,
      'cleared: ' + cleared.join(',') + ' | held: ' + held.join(','),
    ).toBeGreaterThanOrEqual(6);
  }, 420_000);
});

describe('interpolator coverage', () => {
  it('drives an enemy with op 36 somewhere in the campaign', async () => {
    let best = 0;
    let where = '';
    for (const route of ROUTES) {
      const run = await handsOff(route);
      if (run.interpFrames > best) {
        best = run.interpFrames;
        where = route + ' installs=' + run.interpInstalls;
      }
    }
    console.log('busiest interpolator route:', where, 'frames=' + best);
    expect(best, 'no route ever installed an interpolator').toBeGreaterThan(0);
  }, 420_000);
});

describe('laser coverage', () => {
  it('lights at least one beam somewhere in the campaign', async () => {
    let beams = 0;
    let where = '';
    for (const route of ROUTES) {
      const runner = await loadEclStage({
        route,
        difficulty: 'normal',
        character: 'marisa-alice',
        seed: 3,
        power: 128,
      });
      if (!runner) continue;
      for (let f = 0; f < FRAME_CAP && !runner.isFinished; f++) {
        runner.tick(DODGE);
        if (runner.lasers.activeCount > 0) {
          beams = runner.lasers.activeCount;
          where = route + ' f' + f;
          break;
        }
      }
      if (beams > 0) break;
    }
    console.log('first laser:', where, 'beams=' + beams);
    expect(beams, 'no route ever raised a laser').toBeGreaterThan(0);
  }, 300_000);
});
