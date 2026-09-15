/**
 * Headless ECL smoke test: run a stage through StageRunner and report whether
 * the translated scripts actually spawn enemies, fire bullets and raise a boss
 * life bar. Temporary development tool, not part of the build.
 *
 *   node --import ./tools/th08/ecl/register.mjs tools/th08/ecl/probe.mjs [stage] [frames]
 */
import { loadEclStage } from '../../../src/games/th08/EclStageLoader.ts';

const stage = Number(process.argv[2] ?? 1);
const frames = Number(process.argv[3] ?? 6000);
const runner = await loadEclStage({ stageNumber: stage, difficulty: 'normal', character: 'reimu' });
if (!runner) {
  console.log('no runner');
  process.exit(1);
}

// Instrumentation: which subs ran, which primitives fired.
const ranSubs = new Map();
const calls = { shotSetup: 0, setBossPresent: 0, spawnEnemy: 0, moveInterp: 0, setInterpEntry: 0, kill: 0 };
const { EnemySlot } = await import('../../../src/th08/sim/EnemySlot.ts');
for (const key of Object.keys(calls)) {
  const original = EnemySlot.prototype[key];
  if (typeof original !== 'function') { console.log('missing method', key); continue; }
  EnemySlot.prototype[key] = function (...args) {
    calls[key]++;
    if (key === 'shotSetup' && calls.shotSetup < 3) console.log('shotSetup', JSON.stringify(args));
    return original.apply(this, args);
  };
}
const origSpawn = runner.enemies.constructor.prototype.spawn;
const spawned = [];
runner.enemies.spawn = function (subId, x, y, hp) {
  spawned.push([this.gs.frame, subId]);
  ranSubs.set(subId, (ranSubs.get(subId) ?? 0) + 1);
  return origSpawn.call(this, subId, x, y, hp);
};

// Static reachability: which subs can the timeline actually get to?
const { parseEcl: pe } = await import('../../../src/th08/format/EclFile.ts');
const fsmod = await import('node:fs');
const eclRaw = pe(fsmod.readFileSync(`public/assets/th08/raw/ecldata${stage}.ecl`));
const edges = new Map();
const hasShot = new Set();
for (const sub of eclRaw.subs) {
  const list = [];
  for (const ins of sub.instructions) {
    if (ins.opcode === 52) list.push(ins.operands[0]);
    else if (ins.opcode === 135) list.push(ins.operands[1]);
    else if (ins.opcode === 93 || ins.opcode === 94) list.push(ins.operands[0]);
    if (ins.opcode === 104) hasShot.add(sub.id);
  }
  edges.set(sub.id, list);
}
const tlSpawns = new Set();
for (const i of eclRaw.timelines[0].instructions) {
  if ([0, 1, 2, 4, 11, 12, 15].includes(i.opcode) && i.args[0] !== undefined) tlSpawns.add(i.args[0]);
}
const seen = new Set();
const stack = [...tlSpawns];
while (stack.length) {
  const s = stack.pop();
  if (seen.has(s) || s < 0) continue;
  seen.add(s);
  for (const t of edges.get(s) ?? []) stack.push(t);
}
console.log('timeline spawns:', [...tlSpawns].sort((a, b) => a - b).join(','));
console.log('reachable subs:', [...seen].sort((a, b) => a - b).join(','));
console.log('subs with shotSetup:', [...hasShot].join(','), '| reachable+shoot:', [...hasShot].filter((s) => seen.has(s)).join(',') || 'NONE');
console.log('unreachable shooters:', [...hasShot].filter((s) => !seen.has(s)).join(','));

const noInput = { up: false, down: false, left: false, right: false, shoot: true, bomb: false, shift: false, focus: false };
let maxEnemies = 0;
let maxBullets = 0;
let enemyBulletFrames = 0;
let bossFrame = -1;
let gaugeFrame = -1;
let finishedFrame = -1;
const errors = [];

for (let f = 0; f < frames; f++) {
  try {
    runner.tick(noInput);
  } catch (err) {
    errors.push(`frame ${f}: ${(err && err.message) || err}`);
    if (errors.length > 3) break;
    // Stop the offending lane so the run can continue reporting.
    for (const s of runner.enemies.getActive()) { if (s.generator) s.generator.return(); }
  }
  const live = runner.enemies.getActive().length;
  if (live > maxEnemies) maxEnemies = live;
  const bl = runner.bullets.activeCount;
  if (bl > maxBullets) maxBullets = bl;
  if (bl > 0) enemyBulletFrames++;
  if (bossFrame < 0 && runner.gs.isBossPresent) bossFrame = f;
  if (gaugeFrame < 0 && runner.bossGauge) gaugeFrame = f;
  if (finishedFrame < 0 && runner.isFinished) { finishedFrame = f; break; }
}

console.log(JSON.stringify({
  stage,
  maxEnemies,
  maxBullets,
  enemyBulletFrames,
  bossFrame,
  gaugeFrame,
  finishedFrame,
  score: runner.gs.score,
  errors: errors.slice(0, 4),
}, null, 1));
console.log('subs spawned:', [...ranSubs.entries()].map(([k, v]) => `${k}x${v}`).join(' '));
console.log('calls:', JSON.stringify(calls));
console.log('first 40 spawns:', JSON.stringify(spawned.slice(0, 40)));
