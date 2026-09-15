/**
 * Attribute retail's 18 bomb durations to a (shotType, variant, phase) slot.
 *
 * `g_PlayerBombCallbackTable` (`Player.cpp:99-124`) is 24 rows of five callbacks,
 * indexed `g_GameManager.shotType * 2 + variant` -- variant 0 being the ordinary
 * spell and 1 the death bomb, exactly as `acceptBomb` (`Player.cpp:1238-1246`)
 * computes it. Each of the five entries is one `Player+0xFE0` phase, which is the
 * sub-state the shot-window gate also reads.
 *
 * The durations themselves are the fourth argument of `FUN_0040be30` at 18 sites in
 * `PlayerBomb.cpp`. This script walks that file, tracks which function each call sits
 * in, and prints the cross-reference, which is the piece that was missing when the
 * row was filed as "the numbers are known but cannot be attributed".
 *
 * Run: node tools/th08/ecl/bombtable.cjs [path-to-PlayerBomb.cpp]
 */
const fs = require('fs');

const SRC = process.argv[2] || 'D:/Projects/th08web-ref/src/PlayerBomb.cpp';
const lines = fs.readFileSync(SRC, 'utf8').split(/\r?\n/);

/** `Player.cpp:99-124`, transcribed literally so this file is self-contained. */
const TABLE = [
  ['FUN_0040c010', 'FUN_00410c40', 'FUN_0040c910', 'FUN_00410fe0', 'FUN_0040d100'],
  ['FUN_0040c820', 'FUN_0040d950', 'FUN_0040d010', 'FUN_004113a0', 'FUN_0040d310'],
  ['FUN_0040e3b0', 'FUN_0040d430', 'FUN_0040e780', 'FUN_0040d970', 'FUN_0040d100'],
  ['FUN_0040e610', 'FUN_0040d950', 'FUN_0040e610', 'FUN_0040dee0', 'FUN_0040d310'],
  ['FUN_0040fcd0', 'FUN_0040ee10', 'FUN_004103f0', 'FUN_0040f570', 'FUN_0040d100'],
  ['FUN_00410300', 'FUN_0040f550', 'FUN_00410ac0', 'FUN_0040fcb0', 'FUN_0040d310'],
  ['FUN_00411b10', 'FUN_00413140', 'FUN_004123d0', 'FUN_00413990', 'FUN_0040d100'],
  ['FUN_00412300', 'FUN_00413890', 'FUN_00412fa0', 'FUN_004142c0', 'FUN_0040d310'],
  ['FUN_0040c010', 'FUN_0040c010', 'FUN_0040c910', 'FUN_0040c910', 'FUN_0040d100'],
  ['FUN_0040c820', 'FUN_0040c820', 'FUN_0040d010', 'FUN_0040d010', 'FUN_0040d310'],
  ['FUN_00410c40', 'FUN_00410c40', 'FUN_00410fe0', 'FUN_00410fe0', 'FUN_0040d100'],
  ['FUN_0040d950', 'FUN_0040d950', 'FUN_004113a0', 'FUN_004113a0', 'FUN_0040d310'],
  ['FUN_0040e3b0', 'FUN_0040e3b0', 'FUN_0040e780', 'FUN_0040e780', 'FUN_0040d100'],
  ['FUN_0040e610', 'FUN_0040e610', 'FUN_0040e610', 'FUN_0040e610', 'FUN_0040d310'],
  ['FUN_0040d430', 'FUN_0040d430', 'FUN_0040d970', 'FUN_0040d970', 'FUN_0040d100'],
  ['FUN_0040d950', 'FUN_0040d950', 'FUN_0040dee0', 'FUN_0040dee0', 'FUN_0040d310'],
  ['FUN_0040fcd0', 'FUN_0040fcd0', 'FUN_004103f0', 'FUN_004103f0', 'FUN_0040d100'],
  ['FUN_00410300', 'FUN_00410300', 'FUN_00410ac0', 'FUN_00410ac0', 'FUN_0040d310'],
  ['FUN_0040ee10', 'FUN_0040ee10', 'FUN_0040f570', 'FUN_0040f570', 'FUN_0040d100'],
  ['FUN_0040f550', 'FUN_0040f550', 'FUN_0040fcb0', 'FUN_0040fcb0', 'FUN_0040d310'],
  ['FUN_00411b10', 'FUN_00411b10', 'FUN_004123d0', 'FUN_004123d0', 'FUN_0040d100'],
  ['FUN_00412300', 'FUN_00412300', 'FUN_00412fa0', 'FUN_00412fa0', 'FUN_0040d310'],
  ['FUN_00413140', 'FUN_00413140', 'FUN_00413990', 'FUN_00413990', 'FUN_0040d100'],
  ['FUN_00413890', 'FUN_00413890', 'FUN_004142c0', 'FUN_004142c0', 'FUN_0040d310'],
];

/* --- which function is each line inside, and what does it arm --- */
const byFn = new Map();
let fn = null;
let lastArgBlock = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m = line.match(/^(?:static\s+)?(?:i32|void|f32|u8)?\s*__fastcall\s+(\w+)\s*\(/);
  if (!m) m = line.match(/^(?:i32|void|f32)\s+Player::(\w+)\s*\(/);
  if (!m) m = line.match(/^(?:i32|void|f32)\s+(\w+)\s*\(/);
  if (m && !/;/.test(line)) {
    fn = m[1];
    continue;
  }
  if (!fn) continue;
  /* Collect the whole call so a wrapped argument list still parses. */
  if (line.includes('FUN_0040be30(')) lastArgBlock = [line];
  if (lastArgBlock.length) {
    if (!lastArgBlock.includes(line)) lastArgBlock.push(line);
    const joined = lastArgBlock.join(' ');
    const call = joined.match(/FUN_0040be30\(([^)]*)\)/);
    if (call) {
      const args = call[1].split(',').map((a) => a.trim());
      if (!byFn.has(fn)) byFn.set(fn, []);
      byFn.get(fn).push({ line: i + 1, args });
      lastArgBlock = [];
    } else if (lastArgBlock.length > 8) {
      lastArgBlock = [];
    }
  }
}

console.log('FUN_0040be30 sites found: ' + [...byFn.values()].reduce((n, a) => n + a.length, 0));
for (const [name, sites] of byFn) {
  for (const s of sites) {
    console.log(
      '  ' + name.padEnd(14) + ' PlayerBomb.cpp:' + String(s.line).padStart(5) + '  args=' + JSON.stringify(s.args),
    );
  }
}

/* --- cross-reference against the table --- */
console.log('\nslot map (shotType, variant, phase) -> fn : duration');
const TEAM = ['reimu-yukari', 'marisa-alice', 'sakuya-remilia', 'youmu-yuyuko'];
const SOLO = ['reimu', 'yukari', 'marisa', 'alice', 'sakuya', 'remilia', 'youmu', 'yuyuko'];
for (let idx = 0; idx < TABLE.length; idx++) {
  const shotType = Math.floor(idx / 2);
  const variant = idx % 2;
  const who = shotType < 4 ? TEAM[shotType] : SOLO[(shotType - 4) * 2] ?? '?' + shotType;
  const rows = [];
  TABLE[idx].forEach((f, phase) => {
    const sites = byFn.get(f);
    const dur = sites && sites.length ? sites[0].args[3] : sites ? '?' : '-';
    rows.push('p' + phase + ' ' + f.slice(8) + '=' + dur);
  });
  console.log(
    '  st' + String(shotType).padStart(2) + ' ' + who.padEnd(14) + (variant ? 'death' : 'norm ') + '  ' + rows.join('  '),
  );
}
