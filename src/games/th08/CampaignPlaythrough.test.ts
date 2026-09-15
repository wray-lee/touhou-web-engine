/**
 * One sitting, stage 1 to stage 6-2.
 *
 * `docs/REQUIREMENTS.md` carried "a single unbroken 1 -> 6 run" as an open item for two
 * rounds: the sim had every route proven on its own (`AllRoutes.test.ts`), and the
 * browser had been walked as far as stage 4, but nobody had watched the campaign walk
 * itself from the opening frame to the all-clear report without a reload. That is the
 * difference between six stages and one game, and it is where the hand-off bugs live:
 * the run state that has to carry (lives, bombs, power, score), the route branch after
 * stages 3 and 5, the banner that has to finish before the next stage is built, and the
 * report the results screen gets at the end. Building this is what surfaced the frozen
 * beam at the stage boundary, now pinned by `StageClearSweep.test.ts`: nothing that early
 * version claimed to prove had ever actually been measured end to end.
 *
 * Two cases, because they prove different things:
 *
 *  - `flows every stage of the long route` drives the ship with the field armed but
 *    deaths taken off the table. That is not the test pretending the pilot is good; it is
 *    the only way to see the whole chain in one sitting, and the chain is what it
 *    measures: every one of the seven scripts hands off to the next in order, at the
 *    right branch, with the same run, ending in an all-clear report.
 *  - `a run that loses its lives keeps its place in the route` lets the pilot die for
 *    real and spend retail's own continues, which is what a player who is not good enough
 *    does. It asserts the continue comes back on the stage that ended and that the
 *    ordered prefix of the route still holds.
 *
 * The pilot itself is deliberately ordinary: three inputs a person uses. It rests the
 * cursor on the field, which is also what turns on auto-fire and turns the cursor into a
 * move target, and it picks that spot from bullet and laser geometry only, with no reads
 * of hidden state. Its skill shows up in the continues case as a count, and that count is
 * a ratchet: it may only go down.
 */

import { describe, expect, it } from 'vitest';
import fs from 'fs';
import path from 'path';
import { PLAYFIELD_W, PLAYFIELD_H, worldToCanvasX, worldToCanvasY } from '../../engine/core/PlayfieldLayout';
import { TH08Game, type StageClearResult } from './TH08Game';
import type { StageRoute } from './StageRoute';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = ['ecldata1', 'ecldata2', 'ecldata3', 'ecldata4b', 'ecldata5', 'ecldata6', 'ecldata7'].every(
  (name) => fs.existsSync(path.join(RAW_DIR, name + '.ecl')),
);

/** Reimu/Yukari takes the 4B branch, and a first clear goes the long way round 6A. */
const LONG_ROUTE: StageRoute[] = ['stage1', 'stage2', 'stage3', 'stage4b', 'stage5', 'stage6a', 'stage6b'];

/** Frames for a whole campaign: the seven scripts together are under 200k. */
const CAMPAIGN_CAP = 420_000;
/** Frames for the mortal case, which only has to show the chain holding under pressure. */
const MORTAL_CAP = 150_000;
/** Continues the mortal pilot is allowed to spend. Measured: it reaches stage 4 at 12. */
const MAX_CONTINUES = 12;

/** How far ahead the pilot looks, in frames, and how far it listens for hazards. */
const LOOKAHEAD = [0, 10, 22];
const LISTEN_RADIUS = 104;
/** A candidate has to clear this much room, or the pilot will not stand in it. */
const MIN_SAFE = 20;
/**
 * Where the pilot wants to be when nothing else decides it: low, but not against the
 * bottom wall. Two thirds down leaves room to step into whatever arrives, sits below
 * nearly everything the stage throws, and is still close enough to shoot the enemies.
 * Climbing to the item line is the exception, and only when drops are actually near.
 */
const HOME_Y = 330;

/** The room the last frame's best candidate had, and the bomb cooldown the pilot runs. */
const pilot = { room: 999, bombCooldown: 0 };

/**
 * Where the pilot puts the cursor for the next frame.
 *
 * Candidates are rings around the ship, scored by the *worst* of a few time slices: a
 * slot that is empty now but has a bullet walking into it is not a slot. Ties go to
 * whichever keeps the ship over the column it wants to shoot down, and near the top when
 * there are drops to sweep. Everything is read off the field as drawn, so the pilot has
 * no more information than a person watching the screen.
 */
function steer(game: TH08Game): void {
  const runner = game.eclRunner;
  if (!runner) return;
  const p = runner.player;

  const hx: number[] = [];
  const hy: number[] = [];
  const hvx: number[] = [];
  const hvy: number[] = [];
  const hr: number[] = [];
  for (const b of runner.bullets.getActive()) {
    if (b.tag !== 'enemy') continue;
    const dx = b.x - p.x;
    const dy = b.y - p.y;
    if (dx * dx + dy * dy > LISTEN_RADIUS * LISTEN_RADIUS) continue;
    hx.push(b.x);
    hy.push(b.y);
    hvx.push(b.vx);
    hvy.push(b.vy);
    hr.push(b.radius + 6);
  }
  for (const l of runner.lasers.getActive()) {
    const cos = Math.cos(l.angle);
    const sin = Math.sin(l.angle);
    const from = Math.min(l.tail, l.head);
    const to = Math.max(l.tail, l.head);
    const half = l.currentWidth / 2 + 6;
    for (let s = from; s <= to; s += 24) {
      const lx = l.x + cos * s - p.x;
      const ly = l.y + sin * s - p.y;
      if (lx * lx + ly * ly > LISTEN_RADIUS * LISTEN_RADIUS) continue;
      hx.push(l.x + cos * s);
      hy.push(l.y + sin * s);
      // Beams grow and shrink along their own heading rather than translating.
      hvx.push(cos * l.speed);
      hvy.push(sin * l.speed);
      hr.push(half);
    }
  }

  let bossX = PLAYFIELD_W / 2;
  let bossOnField = false;
  for (const slot of runner.enemies.slots) {
    if (!slot.active || !slot.isBoss) continue;
    bossOnField = true;
    bossX = slot.posX;
    break;
  }

  let nearItem = false;
  for (const item of runner.items.items) {
    if (!item.active || item.y > p.y - 100 || item.y < p.y - 320) continue;
    nearItem = true;
    break;
  }

  const wantY = nearItem ? 60 : HOME_Y;
  const wantX = bossOnField ? bossX : PLAYFIELD_W / 2;
  const reach = [0, 10, 22, 36];

  let bestX = p.x;
  let bestY = p.y;
  let bestScore = -Infinity;
  let bestClear = 0;
  for (const dist of reach) {
    const spokes = dist === 0 ? 1 : 12;
    for (let k = 0; k < spokes; k++) {
      const a = (Math.PI * 2 * k) / spokes;
      const cx = Math.min(PLAYFIELD_W - 5, Math.max(5, p.x + Math.cos(a) * dist));
      const cy = Math.min(PLAYFIELD_H - 5, Math.max(5, p.y + Math.sin(a) * dist));
      let clear = 999;
      for (const t of LOOKAHEAD) {
        for (let i = 0; i < hx.length; i++) {
          const bx = hx[i] + hvx[i] * t - cx;
          const by = hy[i] + hvy[i] * t - cy;
          const room = Math.sqrt(bx * bx + by * by) - hr[i];
          if (room < clear) clear = room;
          if (clear < MIN_SAFE) break;
        }
        if (clear < MIN_SAFE) break;
      }
      if (clear < MIN_SAFE) continue;
      const score =
        Math.min(clear, 55) - 0.02 * Math.abs(cx - wantX) - 0.04 * Math.abs(cy - wantY) - dist * 0.12;
      if (score > bestScore) {
        bestScore = score;
        bestClear = clear;
        bestX = cx;
        bestY = cy;
      }
    }
  }

  pilot.room = bestClear;
  game.input.mouseControl = true;
  game.input.pointerInside = true;
  game.input.pointerMove(worldToCanvasX(bestX), worldToCanvasY(bestY));
}

/** Rest the cursor where the ship already is, so the sim sees a held target. */
function park(game: TH08Game): void {
  game.input.mouseControl = true;
  game.input.pointerInside = true;
  game.input.pointerMove(worldToCanvasX(game.player.position.x), worldToCanvasY(game.player.position.y));
}

/** What one stage contributed to the record. */
interface StageRecord {
  route: StageRoute;
  frames: number;
  deaths: number;
  /** The run as the next stage received it, read at the hand-off. */
  carry: { lives: number; bombs: number; power: number; score: number };
}

/** A flight that ended, in one of the ways a flight can end. */
interface Landing {
  /** The results report the game handed over, when it handed one over. */
  report: StageClearResult | null;
  /** Stages completed in order, each one credited by a real clear. */
  cleared: StageRecord[];
  frames: number;
  continues: number;
  /** Routes the run resumed on after a game over. */
  continuedOn: StageRoute[];
  /** Continues that did not come back on the stage that ended. */
  wrongResume: number;
}

export interface FlightOptions {
  noFail: boolean;
  frameCap: number;
  maxContinues: number;
}

/**
 * Fly the campaign without reloading the page.
 *
 * The pilot may be allowed to lose, because retail is a game you can lose: when the lives
 * run out the run ends, and a player who wants the rest of the route continues. So the
 * loop watches for the game-over hand-off, spends a continue - which is retail's own
 * restart-the-stage rule: fresh lives and bombs, power back to zero, score replaced by the
 * continue count - and keeps flying. Every number the tests assert is then a count of real
 * transitions, not a scripted state.
 */
async function flyCampaign(options: FlightOptions): Promise<Landing> {
  const { noFail, frameCap, maxContinues } = options;
  const cleared: StageRecord[] = [];
  const continuedOn: StageRoute[] = [];
  let wrongResume = 0;
  // A holder object, because the only writer is the callback below and TypeScript's
  // flow analysis would otherwise decide the field never leaves `null`.
  const flight: { report: StageClearResult | null } = { report: null };
  let frames = 0;
  let continues = 0;

  const game = new TH08Game({
    headless: true,
    campaign: true,
    difficulty: 'normal',
    character: 'reimu-yukari',
    onStageClear: (result) => {
      flight.report = result;
    },
  });
  game.debugNoFail = noFail;

  /** Let the dynamically imported script for the stage on screen land. */
  async function settle(): Promise<void> {
    for (let i = 0; i < 600 && (!game.eclRunner || game.isPaused); i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      game.stepFrame(1);
      frames++;
    }
  }

  game.stepFrame(1);
  park(game);
  await settle();

  let current = game.route;
  let stageFrames = 0;
  let lastLives = game.player.lives;
  let deaths = 0;

  while (frames < frameCap && flight.report === null) {
    steer(game);
    pilot.bombCooldown--;
    if (pilot.room < 16 && game.player.bombs > 0 && pilot.bombCooldown <= 0) {
      game.input.simulateKeyDown('KeyX');
      pilot.bombCooldown = 180;
    } else {
      game.input.simulateKeyUp('KeyX');
    }
    game.stepFrame(1);
    frames++;
    stageFrames++;

    if (game.player.lives < lastLives) deaths++;
    lastLives = game.player.lives;

    if (game.route !== current) {
      cleared.push({ route: current, frames: stageFrames, deaths, carry: carryOf(game) });
      current = game.route;
      stageFrames = 0;
      deaths = 0;
      lastLives = game.player.lives;
      await settle();
      continue;
    }

    // The field is frozen and the banner is up: the run either finished or ended.
    if (flight.report === null && game.hud.centerMessage === 'GAME OVER') {
      // The game-over hand-off rides a timer, so pump the loop until it lands.
      for (let i = 0; i < 400 && flight.report === null; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
        game.stepFrame(1);
        frames++;
      }
      if (flight.report === null || continues >= maxContinues) break;
      continues++;
      continuedOn.push(current);
      // The banner outlives the retry it announced; left up, it reads as a second game
      // over on the next frame and cuts the run short.
      game.hud.centerMessage = null;
      game.hud.centerMessageTimer = 0;
      deaths = 0;
      stageFrames = 0;
      flight.report = null;
      game.continueGame();
      await settle();
      if (game.route !== current) wrongResume++;
      lastLives = game.player.lives;
    }
  }

  if (flight.report !== null && !flight.report.gameOver) {
    cleared.push({ route: current, frames: stageFrames, deaths, carry: carryOf(game) });
  }
  return {
    report: flight.report,
    cleared,
    frames,
    continues,
    continuedOn,
    wrongResume,
  };
}

/** The run state the next stage is being handed. */
function carryOf(game: TH08Game): StageRecord['carry'] {
  return {
    lives: game.player.lives,
    bombs: game.player.bombs,
    power: game.player.power,
    score: game.player.score,
  };
}

describe.skipIf(!hasAssets)('one-sitting campaign', () => {
  it('flows every stage of the long route in order', async () => {
    const run = await flyCampaign({ noFail: true, frameCap: CAMPAIGN_CAP, maxContinues: 0 });
    console.log(
      run.cleared.map((c) => `${c.route} f${c.frames} deaths=${c.deaths}`).join('\n') +
        `\ntotal frames ${run.frames} continues=${run.continues}`,
    );

    expect(run.cleared.map((c) => c.route)).toEqual(LONG_ROUTE);

    const report = run.report;
    expect(report, 'the run never reached a results report').not.toBeNull();
    expect(report!.campaignFinished, 'the report says the campaign was not finished').toBe(true);
    expect(report!.gameOver).toBeFalsy();
    expect(report!.practice, 'a campaign run is not a practice drill').toBeFalsy();
    expect(report!.stage).toBe(6);
    expect(run.continues).toBe(0);

    // One run, not seven: the score only ever climbs, and the power the previous stage
    // paid for is never taken back at the boundary.
    const scores = run.cleared.map((c) => c.carry.score);
    expect(scores.every((score, i) => i === 0 || score > scores[i - 1])).toBe(true);
    const powers = run.cleared.map((c) => c.carry.power);
    expect(powers.every((power, i) => i === 0 || power >= powers[i - 1])).toBe(true);
    // Nobody had to die for this, so the only way the stock of ships changes on the way
    // through is a 1UP item, which retail banks up to eight. Losing one anywhere in the
    // run would mean a hand-off paid a life the log never recorded.
    const lives = run.cleared.map((c) => c.carry.lives);
    expect(lives.every((count, i) => i === 0 || count >= lives[i - 1])).toBe(true);
    expect(lives[0]).toBeGreaterThanOrEqual(3);
    expect(lives.at(-1)).toBeLessThanOrEqual(8);
  }, 900_000);

  it('a run that loses its lives keeps its place in the route', async () => {
    const run = await flyCampaign({ noFail: false, frameCap: MORTAL_CAP, maxContinues: MAX_CONTINUES });
    const routes = run.cleared.map((c) => c.route);
    console.log(
      `mortal: ${routes.join(' > ')} continues=${run.continues} died on ${run.continuedOn.join(',')} frames=${run.frames}`,
    );

    // The chain holds under real pressure: at least two stages, in order, no skips.
    expect(routes.length).toBeGreaterThanOrEqual(2);
    expect(LONG_ROUTE.slice(0, routes.length)).toEqual(routes);
    // Losing all three lives is the expected outcome for a pilot this ordinary, and
    // every retry has to come back on the stage that ended.
    expect(run.continues).toBeGreaterThan(0);
    expect(run.wrongResume).toBe(0);
  }, 900_000);
});
