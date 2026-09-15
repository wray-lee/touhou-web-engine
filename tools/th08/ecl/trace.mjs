/**
 * Headless play-through harness: drive a translated stage with an invisible
 * player that deletes everything, so the whole timeline (every boss bar, the
 * death drops and the stage end) can be checked without a browser.
 *
 *   node --import ./tools/th08/ecl/register.mjs tools/th08/ecl/trace.mjs [stage] [dps]
 *
 * `dps` is damage per frame applied to every enemy; 0 disables the auto-kill
 * so the run instead measures how long the stage survives untouched.
 */
import { loadEclStage } from '../../../src/games/th08/EclStageLoader.ts';

const stage = Number(process.argv[2] ?? 1);
const dps = Number(process.argv[3] ?? 60);
const maxFrames = Number(process.argv[4] ?? 40000);
const runner = await loadEclStage({ stageNumber: stage, difficulty: 'normal', character: 'reimu' });
if (!runner) {
  console.log('no runner');
  process.exit(1);
}

const events = [];
const shots = [];
let maxBullets = 0;
let maxEnemies = 0;
let bulletFrames = 0;
let bossUpFrame = -1;
let finishedFrame = -1;
const errors = [];

for (let f = 0; f < maxFrames; f++) {
  try {
    runner.tick({ up: false, down: false, left: false, right: false, shoot: true, bomb: false, shift: false, focus: false });
  } catch (err) {
    errors.push(`frame ${f}: ${(err && err.message) || err}`);
    if (errors.length > 2) break;
  }

  if (dps > 0) {
    shots.length = 0;
    for (const enemy of runner.enemies.getActive()) {
      shots.push({ x: enemy.posX, y: enemy.posY, damage: dps, active: true });
    }
    runner.damageEnemiesAt(shots);
  }

  const live = runner.enemies.getActive();
  if (live.length > maxEnemies) maxEnemies = live.length;
  const bl = runner.bullets.activeCount;
  if (bl > maxBullets) maxBullets = bl;
  if (bl > 0) bulletFrames++;

  const gauge = runner.bossGauge;
  if (gauge && bossUpFrame < 0) {
    bossUpFrame = f;
    events.push(`f=${f} boss up sub=${live.find((s) => s.hasGauge)?.subId} hp=${Math.round(gauge.maxHp)}`);
  }
  if (!gauge && bossUpFrame >= 0 && events.length > 0 && !events.some((e) => e.includes('boss down'))) {
    events.push(`f=${f} boss down`);
  }
  for (const dead of runner.lastDeaths) {
    if (dead.hasGauge) events.push(`f=${f} gauge enemy died sub=${dead.subId}`);
  }
  if (runner.isFinished) { finishedFrame = f; break; }
}

console.log(JSON.stringify({
  stage,
  dps,
  maxEnemies,
  maxBullets,
  bulletFrames,
  bossUpFrame,
  finishedFrame,
  frames: events.length ? undefined : undefined,
  lives: runner.gs.lives,
  bombs: runner.gs.bombs,
  power: runner.gs.power,
  score: runner.gs.score,
  errors: errors.slice(0, 3),
}, null, 1));
console.log('events:', events.join(' | ') || 'none');
