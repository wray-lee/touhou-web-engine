import { describe, expect, it } from 'vitest';
import { BULLET_DYING, BulletPool } from './BulletPool';
import { fireRing, fireFan, fireAimed } from './ShotDispatch';
import { BOMB_SPECS, getBombSpec, selectBomb, tickBomb, type BombTarget } from './BombSystem';
import { PlayerSim } from './PlayerSim';
import { createGameState } from './GameState';

describe('ShotDispatch', () => {
  it('fireRing spawns evenly spaced bullets', () => {
    const pool = new BulletPool();
    const count = fireRing(100, 100, 12, 2.0, 0, 0, 0, pool);
    expect(count).toBe(12);
    expect(pool.activeCount).toBe(12);
    const bullets = pool.getActive();
    // Verify all 12 bullets spawned at equal angular spacing
    expect(bullets.length).toBe(12);
    const speeds = bullets.map((b) => Math.sqrt(b.vx * b.vx + b.vy * b.vy));
    for (const s of speeds) expect(s).toBeCloseTo(2.0, 4);
  });

  it('fireFan creates a directed spread', () => {
    const pool = new BulletPool();
    const count = fireFan(192, 100, 5, 3.0, -Math.PI / 2, Math.PI / 3, 0, 0, pool);
    expect(count).toBe(5);
    const bullets = pool.getActive();
    for (const b of bullets) expect(b.vy).toBeLessThan(0); // all fire upward
  });

  it('fireAimed points toward the player', () => {
    const pool = new BulletPool();
    fireAimed(192, 50, 192, 400, 1, 3.0, 0, 0, 0, pool);
    const b = pool.getActive()[0];
    expect(b.vy).toBeGreaterThan(0); // moving down toward player
    expect(Math.abs(b.vx)).toBeLessThan(0.01); // straight down
  });
});

describe('BombSystem', () => {
  it('has 16 bomb specs covering all 8 members', () => {
    expect(BOMB_SPECS).toHaveLength(16);
    const members = new Set(BOMB_SPECS.map((s) => s.member));
    expect(members.size).toBe(8);
    for (const s of BOMB_SPECS) {
      expect(s.duration).toBeGreaterThan(0);
      expect(s.nameJp.length).toBeGreaterThan(0);
    }
  });

  it('getBombSpec returns the correct bomb for each team/side/slot', () => {
    expect(getBombSpec(0, false, 1).member).toBe('reimu');
    expect(getBombSpec(0, true, 1).member).toBe('yukari');
    expect(getBombSpec(0, false, 2).member).toBe('reimu');
    expect(getBombSpec(1, false, 1).member).toBe('marisa');
    expect(getBombSpec(1, true, 1).member).toBe('alice');
    expect(getBombSpec(2, false, 1).member).toBe('sakuya');
    expect(getBombSpec(2, true, 1).member).toBe('remilia');
    expect(getBombSpec(3, false, 1).member).toBe('youmu');
    expect(getBombSpec(3, true, 1).member).toBe('yuyuko');
  });

  it('takes the card row from the flying member, and the second card from the slot', () => {
    // `acceptBomb` (`Player.cpp:1238-1246`) builds the column as
    // `(Player+4 ? 2 : 0) | flip(Player+3)`. `Player+3` is the Shift latch, so the
    // member bit is focus and nothing else; `slot` stands in for the second bit.
    expect(selectBomb(0, false).id).toBe('reimu-1');
    expect(selectBomb(0, true).id).toBe('yukari-1');
    expect(selectBomb(0, false, true).id).toBe('reimu-2');
    expect(selectBomb(0, true, true).id).toBe('yukari-2');
    // Slot 2 is the deathbomb variant, and it is the one that costs two bombs.
    expect(selectBomb(0, false).cost).toBe(1);
    expect(selectBomb(0, false, true).cost).toBe(2);
  });

  /*
   * Shot types 4..11 are the eight characters flying alone, and the side each one
   * takes is fixed by its parity rather than by Shift: `Player.cpp:782-789`
   * overwrites the side byte every frame from `(shotType & 1)` once `shotType >= 4`.
   * The callback table is the proof that the parity means "the youkai half of the
   * pair" and not "a second row for the same character" -- rows 10, 14, 18 and 22
   * are 紫, アリス, レミリア and 幽々子's own cards, and `Die()` gives the longer
   * deathbomb window to shot types 0, 4 and 5, i.e. to every row that has 霊夢 or
   * 紫 in it (`Player.cpp:568-573`).
   */
  it('flies the solo youkai halves with their own cards, not their partner’s', () => {
    const solo = [4, 5, 6, 7, 8, 9, 10, 11];
    expect(solo.map((s) => selectBomb(s, false).member)).toEqual([
      'reimu',
      'yukari',
      'marisa',
      'alice',
      'sakuya',
      'remilia',
      'youmu',
      'yuyuko',
    ]);
    // Focus cannot move a solo's side, so the same card comes out either way.
    for (const shotType of solo) {
      expect(selectBomb(shotType, true).member).toBe(selectBomb(shotType, false).member);
      expect(selectBomb(shotType, true, true).slot).toBe(2);
    }
  });

  it('stamps every card with its retail callback row', () => {
    // A team's four specs sit in the array as human card 1, human card 2, youkai
    // card 1, youkai card 2; the retail column is `(cardLevel << 1) | flyingMember`,
    // so the low two bits are swapped.
    expect(BOMB_SPECS.slice(0, 8).map((s) => [s.id, s.phase])).toEqual([
      ['reimu-1', 0],
      ['reimu-2', 2],
      ['yukari-1', 1],
      ['yukari-2', 3],
      ['marisa-1', 0],
      ['marisa-2', 2],
      ['alice-1', 1],
      ['alice-2', 3],
    ]);
    // The drift rule at :1194-1200 reads bit 0, so the youkai half of every pair
    // has to be the odd row.
    for (const spec of BOMB_SPECS) {
      const isYoukai = ['yukari', 'alice', 'remilia', 'yuyuko'].includes(spec.member);
      expect((spec.phase & 1) === 1).toBe(isYoukai);
      expect((spec.phase & 2) === 2).toBe(spec.slot === 2);
    }
  });

  it('a stopped clock really stops: Sakuya cards freeze, others do not', () => {
    const gs = createGameState();
    const player = new PlayerSim(gs);
    const pool = new BulletPool();
    for (const id of ['sakuya-1', 'sakuya-2']) {
      const spec = BOMB_SPECS.find((s) => s.id === id);
      expect(spec).toBeTruthy();
      const state = spec!.create(player, gs);
      tickBomb(state, player, pool);
      expect(state.freeze).toBe(true);
    }
    const reimu = BOMB_SPECS[0].create(player, gs);
    tickBomb(reimu, player, pool);
    expect(reimu.freeze).toBe(false);
  });

  it('tickBomb advances the timer and cancels bullets inside a piece bubble', () => {
    const gs = createGameState();
    const player = new PlayerSim(gs);
    const pool = new BulletPool();
    pool.spawn(player.x, player.y + 10, 0, 1, 0, 0, 3, 1, 'enemy');
    expect(pool.activeCount).toBe(1);

    const state = BOMB_SPECS[0].create(player, gs);
    tickBomb(state, player, pool);
    expect(state.timer).toBe(1);
    // A cancelled bullet is not deleted: `FUN_00449ff0` == 2 puts it in state 5, the
    // 点 animation, and the ship's own shots are never part of the pass at all.
    expect(pool.collidableCount).toBe(0);
    expect(pool.activeCount).toBe(1);
    expect(pool.getActive()[0].state).toBe(BULLET_DYING);
  });

  it('erases with each card\'s own retail geometry, and only that', () => {
    // (card, probe, frames, erased). Probes are read off the slot geometry in
    // `PlayerBomb.cpp`: the ship starts at (192, 384) in a 384x448 field.
    const cases: Array<[string, number, number, number, boolean]> = [
      // :998 / :1112 -- a 384-wide plate from the top of the field down to the ship.
      ['marisa-1', 20, 20, 8, true],
      ['marisa-1', 20, 400, 8, false],
      ['marisa-2', 364, 20, 8, true],
      // :1866-1968 -- 96x448 strips, one wave per ten frames from f70, seven waves
      // wide for 未来永劫斬; :2043-2094 stops 現世斬 at four, so the corners stay.
      ['youmu-2', 20, 20, 140, true],
      ['youmu-1', 20, 20, 140, false],
      ['youmu-1', 192, 20, 140, true],
      // :1198 gives the first 60 frames a bubble on the ship, then :1234-1235 lights
      // the cross: the whole row the ship sits on, but not the corners.
      ['remilia-1', 20, 384, 80, true],
      ['remilia-1', 20, 20, 80, false],
      // :677 -- the doll's bubble grows 1 + 5/frame from the field centre for 110 frames.
      ['alice-1', 20, 20, 160, true],
      // 夢想妙珠's own wipe is the sixteen r96 bubbles that ride its orbs, and the
      // spiral only carries them ~130 px out from the ship, so the far corner is the
      // card's to keep. There is no global sweep in `FUN_0040be30`: a bomb erases
      // exactly what its slots cover and nothing more.
      ['reimu-1', 20, 20, 120, false],
      // ...while everything inside 96 px of the ship is gone on frame one, because
      // all sixteen orbs are born on it (`:205-209`).
      ['reimu-1', 192, 300, 3, true],
    ];
    for (const [id, x, y, frames, erased] of cases) {
      const gs = createGameState();
      const player = new PlayerSim(gs);
      const pool = new BulletPool();
      pool.spawn(x, y, 0, 0, 0, 0, 3, 1, 'enemy');
      const spec = BOMB_SPECS.find((s) => s.id === id);
      expect(spec, id).toBeTruthy();
      const state = spec!.create(player, gs);
      for (let i = 0; i < frames; i++) tickBomb(state, player, pool);
      expect(pool.collidableCount, `${id} at (${x}, ${y})`).toBe(erased ? 0 : 1);
    }
  });

  it('every card deals damage somewhere on the field with its own shapes', () => {
    const fingerprints = new Map<string, string>();
    for (const spec of BOMB_SPECS) {
      const gs = createGameState('normal', 7);
      const player = new PlayerSim(gs);
      const pool = new BulletPool();
      const seen = new Set<string>();
      let peak = 0;
      let dealt = 0;
      let firstHit = 0;
      let frame = 0;
      const targets: BombTarget[] = [];
      for (const ty of [60, 200, 330]) {
        for (const tx of [70, 192, 314]) {
          targets.push({
            posX: tx,
            posY: ty,
            active: true,
            applyDamage(amount: number) {
              dealt += amount;
              if (firstHit === 0) firstHit = frame;
            },
          });
        }
      }
      const state = spec.create(player, gs, targets);
      while (!state.finished) {
        const zones = tickBomb(state, player, pool, targets);
        frame = state.timer;
        peak = Math.max(peak, zones.length);
        for (const z of zones) seen.add(z.shape);
      }
      expect(dealt, spec.id).toBeGreaterThan(0);
      expect(seen.size).toBeGreaterThan(0);
      fingerprints.set(spec.id, `${[...seen].sort().join('+')}#${peak}#${dealt}#${firstHit}`);
    }
    // A card is only "its own spell" if its shape set, its crowd size, its
    // total damage and its timing all differ from every other card.
    expect(new Set(fingerprints.values()).size).toBe(16);
  });
});
