/**
 * The shot layer checked against the shipped `.sht` files.
 *
 * The point of these tests is not that the pool fires - it is that what comes out
 * is the retail weapon and not a shape this file invented. So the assertions quote
 * the numbers the shipped tables carry (霊夢 at max power is three charms at
 * 22/32/22 damage, two at ±60° for 11, two at ±45° for 10, on a five- and
 * ten-frame cadence) and then check the pool reproduces exactly that set, from the
 * parsed bytes. If someone replaces the table walk with a hand-written formation
 * the counts stop matching, which is how the previous layer passed every test it
 * ever had while being nobody's weapon.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import {
  canAttemptShot,
  PlayerShotPool,
  SHOT_LIVE,
  trackedAimPoint,
  type PlayerShotWorld,
} from './PlayerShots';
import { shtTableForPower, parseShtTables, type ShtPowerTable } from '../format/ShtFile';
import { anmScriptFromBase64 } from '../../engine/anm/AnmVm';
import type { AnmPack } from '../../engine/anm/AnmPack';
import { TH08_PLAYER_ANM_PACKS } from '../data/th08-player-anm';

const RAW_DIR = join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const SHT_FILES = ['ply00a', 'ply00as', 'ply01a', 'ply01as', 'ply02a', 'ply02as', 'ply03a', 'ply03as'];
const hasAssets = SHT_FILES.every((f) => existsSync(join(RAW_DIR, `${f}.sht`)));

/** `g_PlayerAnmFilenames` (`Player.cpp:44-47`), which pack each shot type animates from. */
const ANM_PACK_BY_SHOT_TYPE = [0, 1, 2, 3, 0, 0, 1, 1, 2, 2, 3, 3] as const;

const tableCache = new Map<string, ShtPowerTable[]>();
function tables(file: string): ShtPowerTable[] {
  const hit = tableCache.get(file);
  if (hit) return hit;
  const parsed = parseShtTables(new Uint8Array(readFileSync(join(RAW_DIR, `${file}.sht`))));
  tableCache.set(file, parsed);
  return parsed;
}

/** A stable rng so the jitter callback's draws are repeatable. */
const rng = {
  randomU32InRange: (bound: number) => (bound > 0 ? bound - 1 : 0),
  randomF32InRange: (bound: number) => bound / 2,
};

/** The real `player00.anm`, decoded from the generated pack data. */
function playerPack(index: number): AnmPack {
  const pack = TH08_PLAYER_ANM_PACKS[index];
  const cache = new Map<number, Int32Array | null>();
  return {
    words(script: number): Int32Array | null {
      if (cache.has(script)) return cache.get(script) ?? null;
      const b64 = pack?.bytes[script] ?? null;
      let words: Int32Array | null = null;
      try {
        if (b64) words = anmScriptFromBase64(b64);
      } catch {
        words = null;
      }
      cache.set(script, words);
      return words;
    },
  };
}

const pack0 = playerPack(0);

function world(over: Partial<PlayerShotWorld> = {}): PlayerShotWorld {
  const primary = tables('ply00a');
  return {
    primary,
    secondary: tables('ply00as'),
    focusByte: 0,
    power: 128,
    shotType: 0,
    cardRunning: false,
    cardPhase: 0,
    cardFrames: 0,
    shotWindow: 0,
    shotWindowAdvanced: true,
    shootHeld: true,
    dialogPresent: false,
    frameStop: false,
    extremelyYoukai: false,
    aimX: 192,
    aimY: 384,
    optionPositions: () => [{ x: 150, y: 300 }, null, null, null],
    homingTarget: null,
    tailX: -999,
    tailY: -999,
    bladeAngle: -Math.PI / 2,
    bounds: { left: 0, right: 384, top: 0, bottom: 448 },
    timeScale: 1,
    anmPack: pack0,
    spriteSize: () => ({ x: 20, y: 20 }),
    rng,
    ...over,
  };
}

/** Every live shot, as the flat values the tables carry. */
function volley(pool: PlayerShotPool) {
  return pool
    .live()
    .map((s) => ({
      x: Math.round(s.x * 1000) / 1000,
      y: Math.round(s.y * 1000) / 1000,
      damage: s.damage,
      speed: Math.round(s.speed * 1000) / 1000,
      angle: Math.round(s.angle * 1000) / 1000,
      hitboxWidth: s.hitboxWidth,
      hitboxHeight: s.hitboxHeight,
      updateCb: s.updateCb,
      type: s.type,
      option: s.entry?.option ?? -1,
      youkaiMark: s.youkaiMark,
    }))
    .sort((a, b) => a.x - b.x);
}

const damages = (pool: PlayerShotPool) =>
  volley(pool)
    .map((s) => s.damage)
    .sort((a, b) => a - b);

describe.skipIf(!hasAssets)('the top power tier of 霊夢&紫', () => {
  it('reproduces the seven-entry max-power volley from the shipped bytes', () => {
    const top = shtTableForPower(tables('ply00a'), 128);
    // The table the file itself selects, not one this test picked.
    expect(top.powerGate).toBe(999);
    expect(top.entries.length).toBe(7);

    const pool = new PlayerShotPool(rng);
    pool.fire(world({ shotWindow: 0 }));
    expect(damages(pool)).toEqual([10, 10, 11, 11, 22, 22, 32]);
    // The three centre charms carry the entry's own x offsets.
    expect(volley(pool).map((s) => s.x)).toEqual([188, 192, 192, 192, 192, 192, 196]);
    // ... and the retail hitboxes are 18x48 for the charms and 18x18 for the wings —
    // `entry+0x0C`/`entry+0x10`, which is why a wide shot type covers lanes.
    expect([...new Set(volley(pool).map((s) => `${s.hitboxWidth}x${s.hitboxHeight}`))].sort()).toEqual([
      '18x18',
      '18x48',
    ]);
  });

  it('holds the ten-frame entries back to every other volley', () => {
    const pool = new PlayerShotPool(rng);
    pool.fire(world({ shotWindow: 5 }));
    // `value % 10 == 0` fails at five, so only the five-frame entries speak.
    expect(damages(pool)).toEqual([11, 11, 22, 22, 32]);
  });

  it('drops to a single 48-damage charm below the first gate', () => {
    // `FUN_00450f60:3116-3119` walks *past* every tier the power already covers,
    // so the tier in play is the first gate above the bar: power 7 is the only
    // reading that reaches the one-entry table.
    const pool = new PlayerShotPool(rng);
    const tier = shtTableForPower(tables('ply00a'), 7);
    expect(tier.powerGate).toBe(8);
    expect(tier.entries.length).toBe(1);
    pool.fire(world({ power: 7, shotWindow: 0 }));
    expect(damages(pool)).toEqual([48]);
    expect(pool.live()[0].angle).toBeCloseTo(-Math.PI / 2, 4);
    expect(shtTableForPower(tables('ply00a'), 8).powerGate).toBe(24);
  });
});

describe.skipIf(!hasAssets)('the focused table and the 式神', () => {
  it('fires from the option when the entry says option 1', () => {
    const pool = new PlayerShotPool(rng);
    pool.fire(world({ focusByte: 1, power: 7, shotWindow: 0 }));
    const shots = volley(pool);
    // `ply00as`' first tier is the ship's charm plus the 式神's, and only the
    // second one carries `entry+0x20 == 1`.
    // Sorted by x, and the 式神 sits left of the ship here, so its shots come first.
    expect(shots.map((s) => s.option)).toEqual([1, 0]);
    const shikigami = pool.live().find((s) => s.entry?.option === 1);
    expect(shikigami).toBeDefined();
    expect(shikigami?.x).toBe(150);
    expect(shikigami?.y).toBe(300);
    expect(shikigami?.damage).toBe(24);
    // The homing is the *fire* callback (`entry+0x28` -> `FUN_00450240`); the
    // slot's own per-frame behaviour (`entry+0x2C`) stays plain.
    expect(shikigami?.updateCb).toBe(0);
    expect(shikigami?.entry?.updateCb).toBe(1);
  });

  it('turns the 式神 shot on the field target and buys half again the speed', () => {
    const plain = new PlayerShotPool(rng);
    plain.fire(world({ focusByte: 1, power: 7 }));
    const straight = plain.live().find((s) => s.entry?.option === 1);
    expect(straight?.speed).toBeCloseTo(10, 6);

    const aimed = new PlayerShotPool(rng);
    aimed.fire(world({ focusByte: 1, power: 7, homingTarget: { x: 150, y: 100 } }));
    const shot = aimed.live().find((s) => s.entry?.option === 1);
    expect(shot?.speed).toBeCloseTo(15, 6);
    // Straight up from (150,300) to (150,100): the entry's own -pi/2 plus the
    // pi/2 the callback adds cancels back to vertical.
    expect(shot?.vx).toBeCloseTo(0, 5);
    expect(shot?.vy).toBeCloseTo(-15, 5);
  });

  it('marks the shot 妖怪-tinted only on the extreme youkai side', () => {
    const plain = new PlayerShotPool(rng);
    plain.fire(world({ focusByte: 1, power: 7 }));
    expect(plain.live().every((s) => s.youkaiMark === 0)).toBe(true);
    const youkai = new PlayerShotPool(rng);
    youkai.fire(world({ focusByte: 1, power: 7, extremelyYoukai: true }));
    // `ply00as` carries `entry+0x1E` positive, which is what the marker reads.
    expect(youkai.live().every((s) => s.youkaiMark === 1)).toBe(true);
  });
});

describe.skipIf(!hasAssets)('the rest of the eight files', () => {
  const cases: [string, number, number][] = [
    ['ply00a', 0, 128],
    ['ply00as', 5, 128],
    ['ply01a', 6, 128],
    ['ply01as', 7, 128],
    ['ply02a', 8, 128],
    ['ply02as', 9, 128],
    ['ply03a', 10, 128],
    ['ply03as', 11, 128],
  ];

  it("fires something for every character, on that team's own animation pack", () => {
    for (const [file, shotType, power] of cases) {
      const pool = new PlayerShotPool(rng);
      pool.fire(
        world({
          primary: tables(file),
          secondary: tables(file),
          shotType,
          power,
          focusByte: shotType % 2,
          anmPack: playerPack(ANM_PACK_BY_SHOT_TYPE[shotType]),
        }),
      );
      expect(pool.live().length, `${file} fires`).toBeGreaterThan(0);
    }
  });

  it('holds 魔理沙 silent while a card scripts the ship', () => {
    // `ply01a` is all `g_PlayerShotUpdateCallbacks` 2 and 3, and both are
    // `FUN_0044fdd0`, which refuses while `Player+0xFDC` is up.
    const pool = new PlayerShotPool(rng);
    pool.fire(world({ primary: tables('ply01a'), secondary: tables('ply01a'), cardRunning: true }));
    expect(pool.live().length).toBe(0);
  });

  it('counts the entries it cannot model instead of inventing them', () => {
    // Every tier of `ply01as` carries exactly one doll-anchor entry, the `4` in
    // `g_PlayerShotUpdateCallbacks` (`FUN_0044fe20`), which reserves a slot against
    // `player->timelines[]` instead of firing a shot. This layer declines those and
    // says so, rather than letting them out as ordinary bullets.
    for (const tier of tables('ply01as')) {
      expect(tier.entries.filter((e) => e.updateCb === 4).length, `gate ${tier.powerGate}`).toBe(1);
    }
    const pool = new PlayerShotPool(rng);
    pool.fire(world({ primary: tables('ply01as'), secondary: tables('ply01as'), focusByte: 1 }));
    expect(pool.skipped).toBe(1);
    expect(pool.live().length).toBe(1);
    expect(pool.live()[0].damage).toBe(10);
  });
});

describe('the frame rules around the volley', () => {
  it('silences 魔理沙 and 爱丽丝 under a stopped clock, and nobody else', () => {
    for (const shotType of [1, 6, 7]) {
      expect(
        canAttemptShot(world({ shotType, frameStop: true, shotWindowAdvanced: true }) as PlayerShotWorld),
      ).toBe(false);
    }
    expect(canAttemptShot(world({ shotType: 0, frameStop: true, shotWindowAdvanced: true }))).toBe(true);
  });

  it('holds fire while a card whose variant is 4 is opening', () => {
    expect(canAttemptShot(world({ cardRunning: true, cardPhase: 4, shotWindowAdvanced: true }))).toBe(false);
    expect(canAttemptShot(world({ cardRunning: true, cardPhase: 1, shotWindowAdvanced: true }))).toBe(true);
  });

  it('culls a shot that leaves the field, but not the kinds retail exempts', () => {
    const pool = new PlayerShotPool(rng);
    pool.fire(world({ shotWindow: 0 }));
    const live = pool.live();
    expect(live.length).toBeGreaterThan(0);
    live[0].x = -400;
    live[1].type = 4;
    live[1].x = -400;
    const w = world({ anmPack: null });
    pool.update(w);
    expect(pool.live().some((s) => s === live[0])).toBe(false);
    expect(pool.live().some((s) => s === live[1])).toBe(true);
  });

  it('lets the animation, not a constant, decide how long a shot lives', () => {
    const pool = new PlayerShotPool(rng);
    pool.fire(world({ shotWindow: 0 }));
    expect(pool.live().length).toBeGreaterThan(0);
    const w = world();
    for (let f = 0; f < 900; f++) pool.update(w);
    // Every one of 霊夢's shot scripts ends, and a finished script frees the slot
    // the way `ExecuteScript` failing does in `FUN_00451150:3211`.
    expect(pool.live().length).toBe(0);
  });
});

describe('the aim point the charms steer to', () => {
  const open = { x: -999, y: -999, valid: false };

  it('takes the lowest enemy while nothing is locked', () => {
    const picked = trackedAimPoint(open, 192, [
      { x: 40, y: 100, boss: false },
      { x: 300, y: 180, boss: false },
      { x: 190, y: 140, boss: false },
    ]);
    expect(picked).toEqual({ x: 300, y: 180, valid: false });
  });

  it('prefers the boss closest to the muzzle once a boss is on screen', () => {
    // One call is one frame: `Player::Update` wipes the point after the firing chain
    // reads it (`Player.cpp:1100`), so every frame starts from {@link UNTRACKED_AIM} and
    // the two bosses below are competitors inside a single pass, not locks handed down.
    const picked = trackedAimPoint(open, 192, [
      { x: 60, y: 200, boss: false },
      { x: 250, y: 120, boss: true },
    ]);
    expect(picked.valid).toBe(true);
    expect(picked.x).toBe(250);
    const nearer = trackedAimPoint(open, 192, [
      { x: 250, y: 120, boss: true },
      { x: 200, y: 300, boss: true },
    ]);
    expect(nearer.x).toBe(200);
    // A farther boss does not steal it, and a plain enemy cannot outbid a boss.
    const held = trackedAimPoint(open, 192, [
      { x: 200, y: 300, boss: true },
      { x: 20, y: 310, boss: true },
      { x: 192, y: 400, boss: false },
    ]);
    expect(held.x).toBe(200);
  });

  it('leaves the marker alone with nothing on the field', () => {
    expect(trackedAimPoint(open, 192, [])).toEqual(open);
  });
});

describe('the pool itself', () => {
  it('walks the chain one entry per free slot, like the original loop', () => {
    const pool = new PlayerShotPool(rng);
    const w = world({ shotWindow: 0 });
    expect(pool.fire(w)).toBe(7);
    // The slots are taken in order, so the first seven are live and the rest idle.
    expect(pool.shots.filter((s) => s.state === SHOT_LIVE).map((_, i) => i)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    pool.clear();
    expect(pool.live().length).toBe(0);
  });
});
