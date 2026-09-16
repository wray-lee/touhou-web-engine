/**
 * 紫's 式神, end to end.
 *
 * The complaint this file exists to answer is "shifting to 紫 has no homing
 * attack", and the honest answer turned out to be three separate things, each of
 * which is checked here against the retail reading rather than against a picture:
 *
 * 1. `PlayerOptionHomingToPlayer` (`Player.cpp:2123-2129`) sends `SetInterrupt(3)`
 *    when it hands the slot over to the chase. `player00.anm` script 18 - the body
 *    the route arms itself with (`:2005`) - declares interrupt labels 1, 2, 3, 4 and
 *    5, and 3 is the only one no other line in the route ever asks for. A port that
 *    moves the body without sending it has a 式神 that flies at the enemy and never
 *    attacks it, which is exactly what it looks like.
 * 2. `EnemyManagerUpdate.cpp:747-758` excludes an enemy whose `+0x2DA4` is set, and
 *    `EclRunLow.inl:1069` writes that pointer onto the *child*, so the exclusion is
 *    "not a launched familiar" rather than "not a parent". Read the other way round
 *    the 式神 spends its time after a limb that is flying off screen.
 * 3. Retail holds the target as a pointer and clears it when the enemy behind it
 *    stops being active (`EnemyManagerUpdate.cpp:448-452`, `EnemyManager.cpp:803-804`).
 *    A value copy needs the slot index to say the same thing.
 */
import { describe, expect, it, vi } from 'vitest';
import { StageRunner } from './StageRunner';
import { createGameState } from './GameState';
import type { EnemySlot } from './EnemySlot';
import type { PlayerShot } from './PlayerShots';

/** An empty stage: the enemies these tests need are placed by hand. */
const NO_ECL = {
  version: 2048,
  subCount: 1,
  subs: [{ id: 0, offset: 0, instructions: [] }],
  timelines: [{ index: 0, offset: 0, instructions: [] }],
} as never;
const STAY = () => (_e: EnemySlot) =>
  (function* () {
    yield 99999;
  })();

/** Wrap to (-pi, pi], the same range the routes keep their angles in. */
const wrap = (a: number): number => {
  let v = a % (Math.PI * 2);
  if (v > Math.PI) v -= Math.PI * 2;
  else if (v < -Math.PI) v += Math.PI * 2;
  return v;
};

/** The buttons for "hold Shift and hold fire", which is the whole of 紫's stance. */
const FOCUS_FIRE = { dx: 0, dy: 0, shoot: true, bomb: false, slow: true };

function runnerFor(shotType: number): StageRunner {
  const gs = createGameState('normal', 42);
  gs.shotType = shotType;
  gs.power = gs.maxPower;
  return new StageRunner({ gs, ecl: NO_ECL, subFactory: STAY });
}

/** Tick until `done` holds, or give up and report the frame the rule failed at. */
function runUntil(runner: StageRunner, frames: number, input: typeof FOCUS_FIRE, done: () => boolean) {
  for (let i = 0; i < frames; i++) {
    runner.tick(input);
    if (done()) return i;
  }
  return -1;
}

describe('the 式神 route, from the ship that arms it to the shot that lands', () => {
  it('arms slot 0 above the ship and gives it the body script of its own', () => {
    const runner = runnerFor(0);
    runUntil(runner, 12, FOCUS_FIRE, () => runner.options.options[0].state === 2);
    const option = runner.options.options[0];
    expect(option.state).toBe(2);
    expect(option.x).toBeCloseTo(runner.player.x, 0);
    expect(option.y).toBeCloseTo(runner.player.y - 96, 0);
    // `:2005` arms script 18 out of `player00.anm`, and that script is what makes it
    // a 式神 rather than an invisible position.
    expect(option.vm.visible).toBe(true);
    expect(option.vm.sprite).toBeGreaterThan(0);
  });

  it('asks the body script for its attack label when it breaks for the target', () => {
    const runner = runnerFor(0);
    runner.enemies.spawn(0, 180, 200, 100000);
    runUntil(runner, 12, FOCUS_FIRE, () => runner.options.options[0].state === 2);
    const option = runner.options.options[0];
    const interrupts = vi.spyOn(option.vm, 'setInterrupt');
    const frame = runUntil(runner, 240, FOCUS_FIRE, () => option.substate === 3);
    expect(frame, 'the 式神 never took the chase').toBeGreaterThanOrEqual(0);
    expect(interrupts).toHaveBeenCalledWith(3);
  });

  it('flies at the target instead of riding with the ship', () => {
    const runner = runnerFor(0);
    runner.enemies.spawn(0, 180, 200, 100000);
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.options[0].substate === 3);
    const option = runner.options.options[0];
    const startY = option.y;
    for (let i = 0; i < 60; i++) runner.tick(FOCUS_FIRE);
    // `PlayerOptionHomingToTarget:2143-2147` aims thirty-two below the enemy and no
    // higher than the top of the field, so the settle point is 232 for a y of 200.
    expect(option.y).toBeLessThan(startY);
    expect(option.y).toBeCloseTo(232, 0);
    expect(option.x).toBeCloseTo(180, 0);
  });

  it('turns its own shots onto the target at one and a half times the table speed', () => {
    const runner = runnerFor(0);
    runner.enemies.spawn(0, 180, 200, 100000);
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.homingTarget !== null);
    let homed: PlayerShot | null = null;
    for (let i = 0; i < 120 && !homed; i++) {
      runner.tick(FOCUS_FIRE);
      homed =
        runner.shots
          .live()
          .find(
            (shot) =>
              shot.entry !== null &&
              shot.entry.option > 0 &&
              Math.abs(shot.speed - shot.entry.speed * 1.5) < 1e-4,
          ) ?? null;
    }
    expect(homed, 'no 式神 shot ever took the homing rewrite').not.toBeNull();
    // `FUN_00450240:2854-2859`, recomputed the same way: the table angle is added to
    // the bearing to the target plus a quarter turn, so a shot that left the body
    // pointing up leaves pointing at the enemy instead.
    const target = runner.options.homingTarget as { x: number; y: number };
    const bearing = Math.atan2(target.y - homed!.y, target.x - homed!.x);
    expect(Math.cos(bearing) * homed!.vx + Math.sin(bearing) * homed!.vy).toBeGreaterThan(0);
  });

  it('takes the body rather than the familiar it launched', () => {
    const runner = runnerFor(0);
    const head = runner.enemies.spawn(0, 192, 220, 100000);
    expect(head).not.toBeNull();
    // A familiar is both higher on screen and nearer the aim column, so a rule that
    // read `HasAttachedEnemy` as a child count would pick it every time.
    const child = runner.enemies.spawnLinkedChild({
      subId: 1,
      x: 196,
      y: 90,
      hp: 100,
      dropType: 0,
      score: 0,
      parentIndex: head!.slotIndex,
      followParent: false,
    });
    expect(child?.linkedChild).toBe(true);
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.homingTarget !== null);
    const target = runner.options.homingTarget;
    expect(target).not.toBeNull();
    expect(target!.id).toBe(head!.slotIndex);
    expect(target!.y).toBeCloseTo(220, 0);
  });

  it('loses the target when the enemy behind it goes', () => {
    const runner = runnerFor(0);
    const head = runner.enemies.spawn(0, 192, 220, 100000);
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.homingTarget !== null);
    expect(runner.options.homingTarget!.id).toBe(head!.slotIndex);
    head!.applyDamage(999999);
    // The slot stays live through its own death script, as it does in retail, so the
    // rule being tested is "gone with the slot" rather than "gone with the life bar".
    let guard = 0;
    while (head!.active && guard++ < 600) runner.tick(FOCUS_FIRE);
    expect(head!.active).toBe(false);
    // One more frame: the pass that clears the pointer runs in the enemy walk, and
    // the frame that released the slot had already chosen its target by then.
    runner.tick(FOCUS_FIRE);
    const target = runner.options.homingTarget;
    expect(target === null || target.id !== head!.slotIndex).toBe(true);
  });

  it('does not hand the lock to an enemy that was never allowed to win it', () => {
    // The candidate list is a reused view array (`StageRunner.candidateViews`), so a
    // held target that *points into* it stops meaning "that enemy" the moment the
    // active order shifts. Retail holds a slot pointer and clears it in the frame the
    // enemy goes inactive (`EnemyManagerUpdate.cpp:448-452`), so a lock can never be
    // inherited by whoever arrives next. The measurable difference: an enemy parked at
    // x=-20 is outside the ±64 acquisition window (`:747-749`) and must never become the
    // target, not now and not after the real one dies.
    const runner = runnerFor(0);
    const near = runner.enemies.spawn(0, 192, 220, 100000)!;
    runner.enemies.spawn(0, -20, 60, 100000)!;
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.homingTarget !== null);
    expect(runner.options.homingTarget!.id).toBe(near.slotIndex);

    near.applyDamage(999999);
    let guard = 0;
    while (near.active && guard++ < 600) runner.tick(FOCUS_FIRE);
    runner.tick(FOCUS_FIRE);
    expect(runner.options.homingTarget).toBeNull();
    for (let i = 0; i < 180; i++) runner.tick(FOCUS_FIRE);
    expect(runner.options.homingTarget).toBeNull();
  });

  it('will not acquire an enemy the combat pass refuses to walk', () => {
    // The chooser is nested twice deeper than its own headline rule suggests:
    // `EnemyManagerUpdate.cpp:747-758` sits inside `if (acceptsDamage)` (`:641`), which
    // sits inside `if (!noSprite && !skipCombatA && !skipCombatB && …)` (`:614-617`). So
    // a slot that has left the combat pass - a disabled damage flag, a sprite-less
    // script - is not acquirable at all. It matters because the rule prefers the
    // *smallest* y: one invisible body parked above the field would win every frame and
    // spend the 式神's whole volley on something that cannot be hurt.
    const runner = runnerFor(0);
    // Both decoys are further up the screen than the body, so both would win the
    // smallest-y rule if the gate were missing.
    const invisible = runner.enemies.spawn(0, 192, 40, 100000)!;
    const untouchable = runner.enemies.spawn(0, 192, 60, 100000)!;
    const solid = runner.enemies.spawn(0, 192, 220, 100000)!;
    // `EMUF1_NO_SPRITE`, bit 4 of `enemy+0x3324` - the same bit ops 80/81 move.
    invisible.flags |= 0x10;
    // `EMUF1_ACCEPTS_DAMAGE`, bit 6, which op 80 clears and a death mode clears too.
    untouchable.disableDamage();
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.homingTarget !== null);
    expect(runner.options.homingTarget!.id).toBe(solid.slotIndex);

    // Acquisition only: the clause that replaces a held target compares y and nothing
    // else (`:751-754`), and the locks only go away with the enemy itself
    // (`:448-452`). So leaving the combat pass does not revoke a lock already held.
    solid.disableDamage();
    for (let i = 0; i < 120; i++) runner.tick(FOCUS_FIRE);
    expect(runner.options.homingTarget!.id).toBe(solid.slotIndex);
  });

  it('rebuilds the charm aim point from this frame, so a lock never outlives its enemy', () => {
    // The aim half of the same machinery: `Player::Update` calls `FUN_0044d420` right
    // after the firing chain (`Player.cpp:1100`, `:1493-1497`), which writes `-999` back
    // over `tailPosition0` and clears the valid bit. Carrying the point forward instead
    // left 霊夢's charms bending at the spot where the last boss stood for the rest of the
    // stage, which is the "追踪不对" the browser showed after a phase ended.
    const runner = runnerFor(0);
    const boss = runner.enemies.spawn(0, 120, 160, 100000)!;
    boss.setBossPresent(0);
    const locked = runUntil(runner, 30, FOCUS_FIRE, () => runner.tailPosition.valid);
    expect(locked, 'the charms never found the boss').toBeGreaterThanOrEqual(0);
    expect(runner.tailPosition.x).toBeCloseTo(120, 0);
    boss.applyDamage(999999);
    let guard = 0;
    while (runner.enemies.activeCount > 0 && guard++ < 900) runner.tick(FOCUS_FIRE);
    runner.tick(FOCUS_FIRE);
    expect(runner.tailPosition.x).toBe(-999);
    expect(runner.tailPosition.valid).toBe(false);
    expect(runner.options.homingTarget).toBeNull();
  });

  it('keeps the 式神 home when the fire button is let go', () => {
    const runner = runnerFor(0);
    runner.enemies.spawn(0, 180, 200, 100000);
    runUntil(runner, 240, FOCUS_FIRE, () => runner.options.options[0].substate === 3);
    const option = runner.options.options[0];
    for (let i = 0; i < 40; i++) runner.tick({ ...FOCUS_FIRE, shoot: false });
    // `:2074-2080` gives up the chase into label 1, and the very next frame the
    // facing machine is free to bank it again on the way home, so what has to be
    // true is that it is no longer attacking and no longer holding a target.
    expect(option.substate).not.toBe(3);
    expect(runner.options.homingTarget).toBeNull();
    expect(option.y).toBeGreaterThan(232);
  });
});

describe('妖梦&妖妖, whose weapon is made of options rather than of the ship', () => {
  /** The same stance, held long enough for the history to have something in it. */
  const FOCUS_AND_FLY = { ...FOCUS_FIRE, dx: 1 };
  const FLY = { ...FOCUS_AND_FLY, slow: false };

  it('fires from both blades while focus is held', () => {
    const runner = runnerFor(3);
    for (let i = 0; i < 90; i++) runner.tick(FOCUS_AND_FLY);
    const fromBlades = runner.shots.live().filter((shot) => shot.entry !== null && shot.entry.option > 0);
    // `ply03as` puts five of its nine max-power entries behind options 1 and 2, so a
    // pair with nothing installed in those slots still looks like it is shooting.
    expect(new Set(fromBlades.map((shot) => shot.entry?.option))).toEqual(new Set([1, 2]));
  });

  it('throws the release blade along where the ship was sixteen frames ago', () => {
    const runner = runnerFor(3);
    for (let i = 0; i < 40; i++) runner.tick(FOCUS_AND_FLY);
    const shipAtRelease = { x: runner.player.x, y: runner.player.y };
    // `:749-750` hands slot 2 to the exit route on the falling edge, and it never
    // leaves: `ply03a`'s option-3 entries are 妖梦's *normal* shot.
    const blade = runner.options.options[2];
    let fresh: PlayerShot | null = null;
    for (let i = 0; i < 200 && !fresh; i++) {
      runner.tick(FLY);
      fresh = runner.shots.live().find((shot) => shot.entry?.option === 3 && shot.timer === 0) ?? null;
    }
    if (!fresh?.entry) throw new Error('no shot ever left the trailing blade');
    // The slot is still out once the blade has fired: the exit route never walks away,
    // which is what makes 妖梦's blade a permanent part of her normal shot.
    expect(blade.state).toBe(2);
    const shot = fresh;
    const entry = fresh.entry;
    // The muzzle is the blade, not the ship - and the ship has flown away by now.
    expect(Math.hypot(shot.x - blade.x, shot.y - blade.y)).toBeLessThan(8);
    expect(Math.hypot(shot.x - shipAtRelease.x, shot.y - shipAtRelease.y)).toBeGreaterThan(8);
    // `FUN_00450110:2817`: the heading is the blade's own facing plus the table angle,
    // which is the only reader `facingAngle` has anywhere in the binary.
    expect(shot.angle).toBeCloseTo(wrap(blade.facingAngle + entry.angle), 9);
  });
});
