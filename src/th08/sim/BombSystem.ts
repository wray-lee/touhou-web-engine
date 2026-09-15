/**
 * Spell-card (bomb) system: the 16 retail cards, each with its own geometry.
 *
 * The selection rule is `acceptBomb` in `Player::FUN_0044c650`
 * (`th08web-ref/src/Player.cpp:1220-1296`), which builds one 0..4 variant index:
 *
 *     variant = field_3;                         // 0 upright, 1 focused
 *     if (field_4) variant = 1 - variant;        // a deathbomb belongs to the
 *     if (field_4) variant += 2;                 // member who is NOT flying
 *     updateCb = g_PlayerBombCallbackTable[shotType * 2][variant]
 *     drawCb   = g_PlayerBombCallbackTable[shotType * 2 + 1][variant]
 *
 * Each duo therefore owns four cards -- upright, focused, upright-deathbomb and
 * focused-deathbomb -- and the fifth row is the spell-practice special, which is
 * only reachable from `flags >> 7 & 3` and suppresses firing entirely. Eight
 * duos-worth of rows is 4 teams x 4 cards = the 16 specs below. Cost follows the
 * same split: one bomb normally, two for a deathbomb, or every bomb left if the
 * player is holding fewer than two (`:1254-1263`).
 *
 * `bombState.frameStop` — Sakuya's stopped clock, read by EnemyManager.cpp:302
 * and :423 to freeze enemy motion, damage numbers and graze — is mirrored by
 * `BombState.freeze`.
 */

import type { BulletPool } from './BulletPool';
import type { PlayerSim } from './PlayerSim';
import type { GameState } from './GameState';
import { soloCharacterIndex } from '../../touhou-common/player/DeathCycle';
import { PLAYFIELD_W, PLAYFIELD_H } from './Playfield';

/** How a zone is drawn and how its hit area is shaped. */
export type BombShape = 'orb' | 'beam' | 'slash' | 'knife' | 'butterfly' | 'barrier' | 'wave' | 'doll';

export interface BombZone {
  shape: BombShape;
  x: number;
  y: number;
  /** Facing for beams and blades, centre line for slash wedges (radians). */
  angle: number;
  /** Reach for beams/blades, radius for round shapes, y half-extent for barriers. */
  radius: number;
  /** Half thickness for beams/blades/rings, half-angle for slashes, x half-extent for barriers. */
  width: number;
  color: number;
  damage: number;
  hitsLeft: number;
  /** Frames between damage ticks. */
  interval: number;
  /** `BombState.timer` of the last tick that connected. */
  lastHit: number;
  vx: number;
  vy: number;
  /** Velocity rotation per frame (radians) — spirals and orbiting dolls. */
  curve: number;
  /** Facing rotation per frame (radians) — the sweeping slash fan. */
  turn: number;
  /** Visual roll. */
  spin: number;
  spinRate: number;
  age: number;
  /** Frames before the zone appears, so cards can stage their spawns. */
  delay: number;
  /** Frames of life left; negative means "until the card ends". */
  life: number;
  /** Homing strength in px/frame of course correction; 0 flies straight. */
  home: number;
  /** Pin the zone to the ship while the card runs (beams). */
  follow: boolean;
  /** Fade in / out multiplier for the renderer. */
  alpha: number;
}

/** Minimal view of an enemy so a card can lock on and deal damage. */
export interface BombTarget {
  readonly posX: number;
  readonly posY: number;
  readonly active: boolean;
  applyDamage(amount: number): void;
}

export interface BombCtx {
  player: PlayerSim;
  gs: GameState;
  bullets: BulletPool;
  targets: readonly BombTarget[];
}

export interface BombState {
  spec: BombSpec;
  timer: number;
  duration: number;
  /**
   * Frames left of the retail post-card state, `player->timer` while
   * `playerState == PLAYER_STATE_DEAD` (`PlayerBomb.cpp:171-172`). It starts
   * counting with the card, so it outlives `duration` by 30..60 frames; during
   * the whole window the ship tints red two frames out of every eight
   * (`Player.cpp:1457-1479`).
   */
  stateTimer: number;
  zones: BombZone[];
  finished: boolean;
  /** Clock stop: bullets and enemies hold still while this is set. */
  freeze: boolean;
  /** The backdrop the card paints behind the sprites this frame. */
  backdrop: BombBackdrop;
  /** Expanding cancel ring, 0 once the sweep has passed. */
  cancelRadius: number;
  /** Set for the frame the card actually connected with something. */
  connected: boolean;
  /**
   * Signed meter push this card wants applied for this frame. The card sweep is
   * `26000 / duration` per frame, which deliberately overshoots the `+-10000`
   * range so a full-length card can drive the meter to an extreme.
   */
  gaugeDrift: number;
  gs: GameState;
}

export interface BombSpec {
  id: string;
  name: string;
  nameJp: string;
  member: string;
  slot: 1 | 2;
  /**
   * The column this card sits in within its row of `g_PlayerBombCallbackTable`:
   * 0 and 2 are the human half of the pair, 1 and 3 the youkai half, and 4 is the
   * dissolve-only card. Drives the youkai-gauge drift, which retail withholds at
   * column 4 (`Player.cpp:1194`).
   */
  phase: 0 | 1 | 2 | 3 | 4;
  duration: number;
  /**
   * `player->timer` armed together with `duration` by `FUN_0040be30`, always
   * `duration` plus 30..60. This is the state the ship spends flashing red in
   * after the card banner comes down.
   */
  stateTimer: number;
  /**
   * Which portrait `CutInPlayer` puts next to the card name: `0` for the human
   * half of the pair, `1` for the youkai half. `FUN_0040be30`'s second argument.
   */
  face: -1 | 0 | 1;
  /** The retail update callback that arms this card, as a `th08.exe` address. */
  retailFn: string;
  /** Bombs spent: a normal card costs 1, a deathbomb variant costs 2 (`:1254-1270`). */
  cost: 1 | 2;
  /** Radius the cancel sweep reaches, in px. */
  cancelRadius: number;
  /** The sweep eats every enemy bullet on the field, not just a circle. */
  clearScreen: boolean;
  /** Sakuya's stopped clock. */
  freezes: boolean;
  /** Tint used by the renderer for the card's glow. */
  accent: number;
  /**
   * The card's own backdrop script, run on its frame clock. Straight off the *draw*
   * callback that sits next to this card in `g_PlayerBombCallbackTable`.
   */
  backdrop: (timer: number, duration: number) => BombBackdrop;
  create: (player: PlayerSim, gs: GameState, targets?: readonly BombTarget[]) => BombState;
  step: (state: BombState, ctx: BombCtx) => void;
}

const UP = -Math.PI / 2;
/** Frames the cancel ring needs to reach its full radius (retail is near-instant). */
const CANCEL_FRAMES = 5;
/** `Player.cpp:1197/1199`: a card walks the meter by this much per frame of its duration. */
const YOUKAI_FULL = 26000;
/** One rectangle of the card's backdrop: a colour and how hard it sits on screen. */
export interface BombWash {
  color: number;
  /** 0..1. Retail authorities these as `0x80`-ish bytes, so keep them as fractions. */
  alpha: number;
}

/**
 * What a card paints behind and in front of the sprites for one frame of its clock.
 *
 * The two layers are not the same thing in retail: `FUN_0040bc60` hands a colour to
 * `g_Background`, so the plate sits under every bullet, while `ScreenEffect::DrawSquare`
 * is a screen-space quad drawn with the ship, so the flash covers them.
 */
export interface BombBackdrop {
  plate: BombWash | null;
  flash: BombWash | null;
}

/** Frames a plate colour needs to arrive and leave (`PlayerBomb.cpp:48-59`). */
const WASH_RAMP_FRAMES = 60;
/** The neutral plate the ramp starts and ends at. */
const WASH_BASE = 0x808080;
/** `mixedColor.a = 0x80`: the plate never sits at more than half strength. */
const WASH_ALPHA = 0x80 / 255;

/** Channel-wise blend of two packed RGB colours, `k` from 0 to 1. */
function mixRgb(from: number, to: number, k: number): number {
  const t = Math.max(0, Math.min(1, k));
  const ch = (shift: number) => Math.round(((from >> shift) & 0xff) * (1 - t) + ((to >> shift) & 0xff) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/**
 * `FUN_0040bc60`'s envelope: grey at the ends, the card's own colour across the
 * middle of the card.
 */
export function plateRamp(color: number, timer: number, duration: number): BombWash {
  const k =
    timer < WASH_RAMP_FRAMES
      ? timer / WASH_RAMP_FRAMES
      : timer >= duration - WASH_RAMP_FRAMES
        ? (duration - timer) / WASH_RAMP_FRAMES
        : 1;
  return { color: mixRgb(WASH_BASE, color, k), alpha: WASH_ALPHA };
}

/** The backdrop script for the twelve cards that only ever flood one colour. */
function plainWash(color: number): (timer: number, duration: number) => BombBackdrop {
  return (timer, duration) => ({ plate: plateRamp(color, timer, duration), flash: null });
}

/**
 * 妖夢's two blades: the field goes ink blue from frame 70 (`FUN_00412300:2685-2688`)
 * under a white square that is solid for 30 frames and then fades over 60.
 */
function bladeWash(timer: number, duration: number): BombBackdrop {
  const plate = plateRamp(timer >= 70 ? 0x000030 : 0x404040, timer, duration);
  if (timer < 70) return { plate, flash: null };
  // `0xff - 0xff * (timer - 100) / 60`, integer division included.
  const alpha = timer < 100 ? 1 : (255 - Math.floor((255 * (timer - 100)) / 60)) / 255;
  return { plate, flash: alpha > 0 ? { color: 0xffffff, alpha } : null };
}

/**
 * 愛麗絲's dolls (`FUN_0040dee0:838-886`): blue plate, a blue-to-pink plate while a
 * white square opens over 30 frames, the field held white for a hundred, then the
 * plate back to blue with the square gone.
 */
function dollWash(timer: number, duration: number): BombBackdrop {
  if (timer >= 90 && timer <= 120) {
    // `fadeValue = 208 * (timer - 90) / 30`, then `color.r = fadeValue / 5 + 0xd0`
    // and `g = b = fadeValue + 0x20`. Every one of those divisions is integer
    // arithmetic in C, so the floors are part of the shape, not noise.
    const fade = Math.floor((208 * (timer - 90)) / 30);
    const rgb = ((Math.floor(fade / 5) + 0xd0) << 16) | ((fade + 0x20) << 8) | (fade + 0x20);
    return {
      plate: { color: rgb, alpha: WASH_ALPHA },
      flash: { color: 0xffffff, alpha: Math.floor((255 * (timer - 90)) / 30) / 255 },
    };
  }
  if (timer > 120 && timer <= 220) {
    return { plate: null, flash: { color: 0xffffff, alpha: 0x70 / 255 } };
  }
  return plainWash(0x2020d0)(timer, duration);
}
/** How far a bomb hit "reaches" into an enemy body. */
const TARGET_RADIUS = 18;

type ZoneInit = Partial<BombZone> & { shape: BombShape };

function zone(init: ZoneInit): BombZone {
  return {
    x: 0,
    y: 0,
    angle: UP,
    radius: 24,
    width: 10,
    color: 0xffffff,
    damage: 8,
    hitsLeft: 999,
    interval: 6,
    lastHit: -9999,
    vx: 0,
    vy: 0,
    curve: 0,
    turn: 0,
    spin: 0,
    spinRate: 0,
    age: 0,
    delay: 0,
    life: -1,
    home: 0,
    follow: false,
    alpha: 0,
    ...init,
  };
}

function norm2pi(a: number): number {
  let x = a;
  while (x > Math.PI) x -= Math.PI * 2;
  while (x < -Math.PI) x += Math.PI * 2;
  return x;
}

/** True when (x, y) is inside the zone's hit area. */
export function zoneHits(z: BombZone, x: number, y: number, r = TARGET_RADIUS): boolean {
  const dx = x - z.x;
  const dy = y - z.y;
  switch (z.shape) {
    case 'beam':
    case 'knife': {
      const c = Math.cos(z.angle);
      const s = Math.sin(z.angle);
      const along = dx * c + dy * s;
      const perp = Math.abs(-dx * s + dy * c);
      return along > -r && along <= z.radius && perp <= z.width + r * 0.5;
    }
    case 'slash': {
      const dist = Math.hypot(dx, dy);
      if (dist > z.radius + r) return false;
      return Math.abs(norm2pi(Math.atan2(dy, dx) - z.angle)) <= z.width;
    }
    case 'wave': {
      const band = z.width + r;
      const d = Math.abs(Math.hypot(dx, dy) - z.radius);
      return d <= band;
    }
    case 'barrier':
      return Math.abs(dx) <= z.width + r && Math.abs(dy) <= z.radius + r;
    default: {
      const rr = z.radius + r;
      return dx * dx + dy * dy <= rr * rr;
    }
  }
}

function nearestTarget(ctx: BombCtx, x: number, y: number): BombTarget | null {
  let best: BombTarget | null = null;
  let bd = Number.POSITIVE_INFINITY;
  for (const t of ctx.targets) {
    if (!t.active) continue;
    const d = (t.posX - x) * (t.posX - x) + (t.posY - y) * (t.posY - y);
    if (d < bd) {
      bd = d;
      best = t;
    }
  }
  return best;
}

/** Turn `z`'s velocity towards (tx, ty) by at most `rate` px/frame of drift. */
function steerTo(z: BombZone, tx: number, ty: number, rate: number): void {
  const speed = Math.hypot(z.vx, z.vy);
  if (speed < 0.001) return;
  const cur = Math.atan2(z.vy, z.vx);
  const diff = norm2pi(Math.atan2(ty - z.y, tx - z.x) - cur);
  const maxTurn = Math.atan2(rate, speed);
  const turn = Math.max(-maxTurn, Math.min(maxTurn, diff));
  const a = cur + turn;
  z.vx = Math.cos(a) * speed;
  z.vy = Math.sin(a) * speed;
  z.angle = a;
}

function fadeOf(z: BombZone): number {
  const fadeIn = Math.min(1, (z.age - z.delay) / 5);
  const fadeOut = z.life < 0 ? 1 : Math.min(1, z.life / 12);
  return Math.max(0, fadeIn) * Math.max(0, fadeOut);
}

/** Default motion: fly, curve, home, integrate, cull. */
function integrate(state: BombState, ctx: BombCtx): void {
  for (const z of state.zones) {
    if (z.follow) {
      z.x = ctx.player.x;
      z.y = ctx.player.y;
    }
    if (z.home > 0) {
      const t = nearestTarget(ctx, z.x, z.y);
      steerTo(z, t ? t.posX : ctx.player.x, t ? t.posY : 0, z.home);
    }
    z.x += z.vx;
    z.y += z.vy;
    if (z.curve !== 0) {
      const c = Math.cos(z.curve);
      const s = Math.sin(z.curve);
      const vx = z.vx * c - z.vy * s;
      const vy = z.vx * s + z.vy * c;
      z.vx = vx;
      z.vy = vy;
      z.angle += z.curve;
    }
    z.spin += z.spinRate;
    z.age++;
    if (z.life > 0) z.life--;
  }
  state.zones = state.zones.filter((z) => z.life !== 0 && z.hitsLeft > 0);
  for (const z of state.zones) z.alpha = fadeOf(z);
}

/** Ring of zones around the ship, fired outward on `spacing` frames. */
function ringOf(
  player: PlayerSim,
  count: number,
  init: ZoneInit,
  opts: { speed: number; spread?: number; spacing?: number; start?: number; radius?: number },
): BombZone[] {
  const out: BombZone[] = [];
  const spacing = opts.spacing ?? 0;
  const start = opts.start ?? 0;
  const ring = opts.radius ?? 0;
  for (let i = 0; i < count; i++) {
    const angle = UP + (i - (count - 1) / 2) * (opts.spread ?? 0);
    out.push(
      zone({
        ...init,
        x: player.x + Math.cos(angle) * ring,
        y: player.y + Math.sin(angle) * ring,
        angle,
        vx: Math.cos(angle) * opts.speed,
        vy: Math.sin(angle) * opts.speed,
        delay: start + i * spacing,
      }),
    );
  }
  return out;
}

interface BombOptions {
  id: string;
  name: string;
  nameJp: string;
  member: string;
  slot: 1 | 2;
  duration: number;
  stateTimer: number;
  face: -1 | 0 | 1;
  retailFn: string;
  backdrop?: (timer: number, duration: number) => BombBackdrop;
  cancelRadius: number;
  clearScreen?: boolean;
  freezes?: boolean;
  accent?: number;
  zones: (player: PlayerSim, gs: GameState) => BombZone[];
  step?: (state: BombState, ctx: BombCtx) => void;
}

function bomb(opts: BombOptions): BombSpec {
  const spec: BombSpec = {
    id: opts.id,
    name: opts.name,
    nameJp: opts.nameJp,
    member: opts.member,
    slot: opts.slot,
    // Stamped from the array position by `applyRetailVariantOrder` below, which is
    // the only place that knows how retail orders a team's callback rows.
    phase: 0,
    duration: opts.duration,
    stateTimer: opts.stateTimer,
    face: opts.face,
    retailFn: opts.retailFn,
    cost: opts.slot === 2 ? 2 : 1,
    cancelRadius: opts.cancelRadius,
    clearScreen: opts.clearScreen ?? false,
    freezes: opts.freezes ?? false,
    accent: opts.accent ?? 0xffffff,
    backdrop: opts.backdrop ?? plainWash(0x404040),
    step: opts.step ?? integrate,
    create: (player, gs) => ({
      spec,
      timer: 0,
      duration: opts.duration,
      stateTimer: opts.stateTimer,
      zones: opts.zones(player, gs),
      finished: false,
      freeze: false,
      backdrop: { plate: null, flash: null },
      cancelRadius: 0,
      connected: false,
      gaugeDrift: 0,
      gs,
    }),
  };
  return spec;
}

/** Every zone that should be on screen this frame. */
function visible(state: BombState): BombZone[] {
  return state.zones.filter((z) => z.age >= z.delay && z.alpha > 0.01);
}

/**
 * Advance a card by one frame: cancel sweep, clock stop, motion, damage, and
 * the youkai-gauge drift of `AddToYoukaiGauge(+-26000 / duration)`.
 */
export function tickBomb(
  state: BombState,
  player: PlayerSim,
  bullets: BulletPool,
  targets: readonly BombTarget[] = [],
): BombZone[] {
  if (state.finished) return [];
  state.timer++;
  state.connected = false;

  const live = targets.filter((t) => t.active);
  const ctx: BombCtx = { player, gs: state.gs, bullets, targets: live };

  // 1. Cancel sweep. The ring grows for a few frames, then the card keeps
  //    wiping bullets inside its full radius for as long as it runs.
  const grow = Math.min(1, state.timer / CANCEL_FRAMES);
  const radius = state.spec.cancelRadius * grow;
  bullets.clearInRadius(player.x, player.y, radius);
  state.cancelRadius = grow < 1 ? radius : 0;
  if (state.spec.clearScreen && state.timer === CANCEL_FRAMES) {
    bullets.clearByTag('enemy');
  }

  // 2. Sakuya's clock stop, released shortly before the card ends.
  state.freeze = state.spec.freezes && state.timer <= state.duration - 16;

  // 3. Card body: motion and any per-frame spawning.
  state.spec.step(state, ctx);

  // 4. Damage, resolved on the card's own frame clock.
  for (const z of state.zones) {
    if (z.age < z.delay || z.interval <= 0 || z.hitsLeft <= 0) continue;
    if (state.timer - z.lastHit < z.interval) continue;
    for (const t of live) {
      if (!t.active || !zoneHits(z, t.posX, t.posY)) continue;
      t.applyDamage(z.damage);
      z.hitsLeft--;
      z.lastHit = state.timer;
      state.connected = true;
      if (z.hitsLeft <= 0) break;
    }
  }

  // 5. Retail drifts the human/youkai meter across the card: odd columns fill
  //    it, even columns drain it, and the dissolve card leaves the meter alone
  //    because the whole block is gated on `phase < 4` (`Player.cpp:1194-1200`).
  const dir = (state.spec.phase & 1) === 1 ? 1 : -1;
  state.gaugeDrift = state.spec.phase < 4 ? (dir * YOUKAI_FULL) / state.duration : 0;
  // 6. Then the card's own backdrop script, which is what tells 紅魔's red flood
  //    from 妖夢's white flash.
  state.backdrop = state.spec.backdrop(state.timer, state.duration);

  if (state.timer >= state.duration) {
    state.finished = true;
    state.freeze = false;
    state.cancelRadius = 0;
    state.zones = [];
    return [];
  }
  return visible(state);
}

// ─── per-card motion helpers ────────────────────────────────────────────────

/**
 * Forward beam: zone 0 hugs the ship and reaches the top of the field, its
 * half-thickness breathing between `from` and `to` over `peak` frames.
 */
function beamStep(
  from: number,
  to: number,
  peak: number,
  holdLife: number,
): (s: BombState, c: BombCtx) => void {
  return (state, ctx) => {
    const beam = state.zones[0];
    const t = state.timer;
    if (beam) {
      if (t < peak) beam.width = from + (to - from) * (t / peak);
      else if (t < peak * 2) beam.width = to - (to - from) * ((t - peak) / peak);
      else beam.width = to;
      beam.life = t < holdLife ? -1 : holdLife - t + 12;
    }
    integrate(state, ctx);
    if (!beam || state.zones.indexOf(beam) < 0) return;
    beam.x = ctx.player.x;
    beam.y = ctx.player.y;
    beam.angle = UP;
    beam.radius = ctx.player.y + 40;
  };
}

/** Expanding shockwave rings shed off the ship every `every` frames. */
function waveStep(
  every: number,
  grow: number,
  maxRings: number,
  opts: { damage: number; width: number; color: number; rise: number },
) {
  return (state: BombState, ctx: BombCtx) => {
    integrate(state, ctx);
    const live = state.zones.reduce((n, z) => n + (z.shape === 'wave' ? 1 : 0), 0);
    if (state.timer % every === 0 && live < maxRings) {
      state.zones.push(
        zone({
          shape: 'wave',
          x: ctx.player.x,
          y: ctx.player.y,
          radius: 24,
          width: opts.width,
          color: opts.color,
          damage: opts.damage,
          hitsLeft: 999,
          interval: 6,
          life: 96,
          vy: opts.rise,
        }),
      );
    }
    for (const z of state.zones) if (z.shape === 'wave') z.radius += grow;
  };
}

/**
 * Sakuya's card: knives leave the hand one at a time, each one locking onto
 * whatever is nearest when it is thrown, and each one lands a single slash.
 */
function knifeStep(every: number, count: number, speed: number, damage: number, color: number) {
  return (state: BombState, ctx: BombCtx) => {
    if (state.timer % every === 1) {
      const thrown = Math.floor((state.timer - 1) / every);
      if (thrown < count) {
        const t = nearestTarget(ctx, ctx.player.x, ctx.player.y);
        const tx = t ? t.posX : ctx.player.x + ctx.gs.rng.randomF32SignedInRange(160);
        const ty = t ? t.posY : ctx.player.y - 200;
        const a = Math.atan2(ty - ctx.player.y, tx - ctx.player.x);
        state.zones.push(
          zone({
            shape: 'knife',
            x: ctx.player.x,
            y: ctx.player.y,
            angle: a,
            vx: Math.cos(a) * speed,
            vy: Math.sin(a) * speed,
            radius: 30,
            width: 4,
            damage,
            hitsLeft: 1,
            interval: 1,
            life: 140,
            home: 2.4,
            color,
          }),
        );
      }
    }
    integrate(state, ctx);
    for (const z of state.zones) {
      if (z.shape === 'knife') z.angle = Math.atan2(z.vy, z.vx);
    }
  };
}

/**
 * Yukari's barriers slide in from the edges and cut across the field. They hold
 * their full size; only the glow fades in so the sweep reads before it bites.
 */
function barrierStep(state: BombState, ctx: BombCtx): void {
  integrate(state, ctx);
  for (const z of state.zones) {
    z.angle = UP;
    z.alpha = Math.min(1, Math.max(0, (z.age - z.delay) / 18));
  }
}

/** Butterflies wander inside the field instead of flying off it. */
function flutterStep(state: BombState, ctx: BombCtx): void {
  for (const z of state.zones) {
    z.vx += ctx.gs.rng.randomF32SignedInRange(0.12);
    z.vy += ctx.gs.rng.randomF32SignedInRange(0.12);
    const sp = Math.hypot(z.vx, z.vy);
    if (sp > 1.5) {
      z.vx = (z.vx / sp) * 1.5;
      z.vy = (z.vy / sp) * 1.5;
    }
  }
  integrate(state, ctx);
  for (const z of state.zones) {
    if (z.x < 16 || z.x > PLAYFIELD_W - 16) z.vx *= -1;
    if (z.y < 24 || z.y > PLAYFIELD_H - 24) z.vy *= -1;
    z.angle = Math.atan2(z.vy, z.vx);
    z.spin = z.age * 0.35;
  }
}

/** Slashes propagate outward: their reach grows every frame until they expire. */
function slashStep(grow: number) {
  return (state: BombState, ctx: BombCtx) => {
    for (const z of state.zones) {
      z.radius += grow;
      z.angle += z.turn;
      z.x = ctx.player.x;
      z.y = ctx.player.y;
      z.age++;
      if (z.life > 0) z.life--;
    }
    state.zones = state.zones.filter((z) => z.life !== 0 && z.hitsLeft > 0);
    for (const z of state.zones) z.alpha = fadeOf(z);
  };
}

/** Alice's dolls sweep out, then wheel back in on the enemy. */
function dollStep(retire: number) {
  return (state: BombState, ctx: BombCtx) => {
    for (const z of state.zones) if (z.age > retire) z.home = 3.5;
    integrate(state, ctx);
  };
}

// ─── the 16 cards ───────────────────────────────────────────────────────────

export const BOMB_SPECS: BombSpec[] = [
  // 霊夢 — card 1: eight yin-yang orbs that chase the enemy down.
  bomb({
    id: 'reimu-1',
    name: 'Spirit Sign "Fantasy Seal"',
    nameJp: '霊符「夢想妙珠」',
    member: 'reimu',
    slot: 1,
    duration: 200,
    stateTimer: 260,
    face: 0 as 0 | 1,
    retailFn: '0040c010',
    cancelRadius: 96,
    accent: 0xffd8ec,
    zones: (p) =>
      ringOf(
        p,
        8,
        {
          shape: 'orb',
          radius: 26,
          width: 26,
          damage: 24,
          hitsLeft: 4,
          interval: 5,
          color: 0xffd8ec,
          home: 1.1,
          life: 200,
        },
        { speed: 3.2, spacing: 4, radius: 14 },
      ),
    step: integrate,
  }),
  // 霊夢 — card 2: twelve fast seals up the middle, wipes the screen.
  bomb({
    id: 'reimu-2',
    name: 'Divine Spirit "Fantasy Seal: Blink"',
    nameJp: '神霊「夢想封印　瞬」',
    member: 'reimu',
    slot: 2,
    duration: 200,
    stateTimer: 260,
    face: 0 as 0 | 1,
    retailFn: '0040c910',
    backdrop: plainWash(0x2020d0),
    cancelRadius: 128,
    clearScreen: true,
    accent: 0xfff4c0,
    zones: (p) =>
      ringOf(
        p,
        12,
        {
          shape: 'orb',
          radius: 22,
          width: 22,
          damage: 30,
          hitsLeft: 3,
          interval: 4,
          color: 0xfff4c0,
          home: 0.35,
          life: 240,
        },
        { speed: 9.5, spread: 0.075, spacing: 6 },
      ),
  }),
  // 紫 — card 1: four barriers walk across the field from the edges.
  bomb({
    id: 'yukari-1',
    name: 'Boundary Sign "Quadruple Barrier"',
    nameJp: '境符「四重結界」',
    member: 'yukari',
    slot: 1,
    duration: 150,
    stateTimer: 200,
    face: 1 as 0 | 1,
    retailFn: '00410c40',
    cancelRadius: 96,
    accent: 0xff9ad2,
    zones: () => edgeBarriers(4, { damage: 16, interval: 5, color: 0xff9ad2 }),
    step: barrierStep,
  }),
  // 紫 — card 2: eight barriers, both diagonals, and the field is cleared.
  bomb({
    id: 'yukari-2',
    name: 'Boundary "Eternal Night Quadruple Barrier"',
    nameJp: '境界「永夜四重結界」',
    member: 'yukari',
    slot: 2,
    duration: 250,
    stateTimer: 300,
    face: 1 as 0 | 1,
    retailFn: '00410fe0',
    backdrop: plainWash(0x2020d0),
    cancelRadius: 128,
    clearScreen: true,
    accent: 0xd9a6ff,
    zones: () => edgeBarriers(8, { damage: 10, interval: 5, color: 0xd9a6ff }),
    step: barrierStep,
  }),
  // 魔理沙 — card 1: Master Spark, a breathing pillar straight up.
  bomb({
    id: 'marisa-1',
    name: 'Love Sign "Master Spark"',
    nameJp: '恋符「マスタースパーク」',
    member: 'marisa',
    slot: 1,
    duration: 300,
    stateTimer: 350,
    face: 0 as 0 | 1,
    retailFn: '0040e3b0',
    cancelRadius: 64,
    accent: 0xfff08a,
    zones: (p) => [sparkBeam(p, 20, 9, 0xfff08a)],
    step: beamStep(14, 34, 44, 150),
  }),
  // 魔理沙 — card 2: Final Spark, twice the pillar for twice the bombs.
  bomb({
    id: 'marisa-2',
    name: 'Magic Cannon "Final Spark"',
    nameJp: '魔砲「ファイナルスパーク」',
    member: 'marisa',
    slot: 2,
    duration: 350,
    stateTimer: 380,
    face: 0 as 0 | 1,
    retailFn: '0040e780',
    cancelRadius: 96,
    clearScreen: true,
    accent: 0xbfe3ff,
    zones: (p) => [sparkBeam(p, 30, 13, 0xbfe3ff)],
    step: beamStep(26, 54, 55, 190),
  }),
  // アリス — card 1: dolls spiral outwards over the whole field.
  bomb({
    id: 'alice-1',
    name: 'Magic Sign "Artful Sacrifice"',
    nameJp: '魔符「アーティフルサクリファイス」',
    member: 'alice',
    slot: 1,
    duration: 210,
    stateTimer: 250,
    face: 1 as 0 | 1,
    retailFn: '0040d430',
    cancelRadius: 96,
    accent: 0x9be8ff,
    zones: (p) =>
      ringOf(
        p,
        16,
        {
          shape: 'doll',
          radius: 22,
          width: 22,
          damage: 24,
          hitsLeft: 2,
          interval: 5,
          color: 0x9be8ff,
          curve: 0.05,
          home: 2.0,
          life: 240,
          spinRate: 0.2,
        },
        { speed: 2.1, spacing: 3 },
      ),
  }),
  // アリス — card 2: the dolls sweep out and then come back to hit.
  bomb({
    id: 'alice-2',
    name: 'Magic Control "Return Inanimateness"',
    nameJp: '魔操「リターンイナニメトネス」',
    member: 'alice',
    slot: 2,
    duration: 230,
    stateTimer: 280,
    face: 1 as 0 | 1,
    retailFn: '0040d970',
    backdrop: dollWash,
    cancelRadius: 128,
    clearScreen: true,
    accent: 0xffd0f0,
    zones: (p) =>
      ringOf(
        p,
        20,
        {
          shape: 'doll',
          radius: 18,
          width: 18,
          damage: 26,
          hitsLeft: 2,
          interval: 5,
          color: 0xffd0f0,
          curve: 0.05,
          life: 250,
          spinRate: 0.2,
        },
        { speed: 2.4, spacing: 3 },
      ),
    step: dollStep(70),
  }),
  // 咲夜 — card 1: stop the clock and let 24 knives do the counting.
  bomb({
    id: 'sakuya-1',
    name: 'Illusion Sign "Killing Doll"',
    nameJp: '幻符「殺人ドール」',
    member: 'sakuya',
    slot: 1,
    duration: 250,
    stateTimer: 290,
    face: 0 as 0 | 1,
    retailFn: '0040fcd0',
    cancelRadius: 96,
    freezes: true,
    accent: 0xcfe8ff,
    zones: () => [],
    step: knifeStep(6, 24, 13, 26, 0xcfe8ff),
  }),
  // 咲夜 — card 2: a whole night-mist of knives, 40 of them.
  bomb({
    id: 'sakuya-2',
    name: 'Phantom Funeral "Night Mist Phantom Murderer"',
    nameJp: '幻葬「夜霧の幻影殺人鬼」',
    member: 'sakuya',
    slot: 2,
    duration: 320,
    stateTimer: 350,
    face: 0 as 0 | 1,
    retailFn: '004103f0',
    backdrop: plainWash(0x202080),
    cancelRadius: 128,
    clearScreen: true,
    freezes: true,
    accent: 0x9fd2ff,
    zones: () => [],
    step: knifeStep(5, 40, 15, 30, 0x9fd2ff),
  }),
  // レミリア — card 1: Gungnir down the centre, shockwaves off both sides.
  bomb({
    id: 'remilia-1',
    name: 'Scarlet Sign "Nightless Castle Red"',
    nameJp: '紅符「不夜城レッド」',
    member: 'remilia',
    slot: 1,
    duration: 240,
    stateTimer: 290,
    face: 1 as 0 | 1,
    retailFn: '0040ee10',
    backdrop: plainWash(0xd02020),
    cancelRadius: 96,
    accent: 0xff7a8c,
    zones: (p) => [sparkBeam(p, 22, 8, 0xff7a8c), ...waves(p)],
    step: waveStep(34, 9, 6, { damage: 12, width: 26, color: 0xff7a8c, rise: 1.1 }),
  }),
  // レミリア — card 2: the scarlet devil sweeps bands of crimson down the field.
  bomb({
    id: 'remilia-2',
    name: 'Scarlet Devil "Devil of the Night"',
    nameJp: '紅魔「スカーレットデビル」',
    member: 'remilia',
    slot: 2,
    duration: 280,
    stateTimer: 320,
    face: 1 as 0 | 1,
    retailFn: '0040f570',
    backdrop: plainWash(0xf00000),
    cancelRadius: 128,
    clearScreen: true,
    accent: 0xff4d6a,
    zones: (p) => [sparkBeam(p, 34, 10, 0xff4d6a), ...waves(p)],
    step: waveStep(26, 11, 9, { damage: 15, width: 32, color: 0xff4d6a, rise: 1.4 }),
  }),
  // 妖夢 — card 1: eight slashes of the present world, radial.
  bomb({
    id: 'youmu-1',
    name: 'Human Sign "Slash of the Present Life"',
    nameJp: '人符「現世斬」',
    member: 'youmu',
    slot: 1,
    duration: 220,
    stateTimer: 270,
    face: 0 as 0 | 1,
    retailFn: '00411b10',
    backdrop: bladeWash,
    cancelRadius: 96,
    accent: 0xa9ffd0,
    zones: (p) =>
      ringOf(
        p,
        8,
        {
          shape: 'slash',
          radius: 40,
          width: 0.3,
          damage: 52,
          hitsLeft: 6,
          interval: 6,
          color: 0xa9ffd0,
          life: 95,
          turn: 0.05,
        },
        { speed: 0, spread: 0.785, start: 0 },
      ),
    step: slashStep(11),
  }),
  // 妖夢 — card 2: twenty dense upward cuts, the eternity slash.
  bomb({
    id: 'youmu-2',
    name: 'Human Ghost "Slash of Eternity"',
    nameJp: '人鬼「未来永劫斬」',
    member: 'youmu',
    slot: 2,
    duration: 250,
    stateTimer: 300,
    face: 0 as 0 | 1,
    retailFn: '004123d0',
    backdrop: bladeWash,
    cancelRadius: 128,
    clearScreen: true,
    accent: 0xd6fff0,
    zones: (p) =>
      ringOf(
        p,
        20,
        {
          shape: 'slash',
          radius: 30,
          width: 0.16,
          damage: 60,
          hitsLeft: 6,
          interval: 5,
          color: 0xd6fff0,
          life: 105,
          turn: 0.03,
        },
        { speed: 0, spread: 0.11, start: 0 },
      ),
    step: slashStep(13),
  }),
  // 幽幽子 — card 1: butterflies settle over the field and reap in ticks.
  bomb({
    id: 'yuyuko-1',
    name: 'Death Sign "Ghastly Dream"',
    nameJp: '死符「ギャストリドリーム」',
    member: 'yuyuko',
    slot: 1,
    duration: 300,
    stateTimer: 350,
    face: 1 as 0 | 1,
    retailFn: '00413140',
    cancelRadius: 96,
    accent: 0x9fd8c8,
    zones: (_p, gs) =>
      scatterZones(gs, 14, {
        shape: 'butterfly',
        radius: 36,
        width: 24,
        damage: 10,
        hitsLeft: 999,
        interval: 8,
        color: 0x9fd8c8,
        life: 200,
        spinRate: 0.1,
      }),
    step: flutterStep,
  }),
  // 幽幽子 — card 2: a dense field of death butterflies, and the screen clears.
  bomb({
    id: 'yuyuko-2',
    name: 'Death Butterflies "Eternal Sleep Among Flowers"',
    nameJp: '死蝶「華胥の永眠」',
    member: 'yuyuko',
    slot: 2,
    duration: 300,
    stateTimer: 350,
    face: 1 as 0 | 1,
    retailFn: '00413990',
    backdrop: plainWash(0x802020),
    cancelRadius: 128,
    clearScreen: true,
    accent: 0xbfe8d8,
    zones: (_p, gs) =>
      scatterZones(gs, 22, {
        shape: 'butterfly',
        radius: 42,
        width: 26,
        damage: 12,
        hitsLeft: 999,
        interval: 7,
        color: 0xbfe8d8,
        life: 250,
        spinRate: 0.12,
      }),
    step: flutterStep,
  }),
];

/**
 * The fifth column of every row: 「ディゾルブスペル」, the card that only dissolves
 * bullets. `FUN_0040d100` has no work items and no damage slots at all -- it plays the
 * burst, stops the ship dead (`:569-570` zero both velocity axes), releases the enemy
 * stance lock, and hands the plate to `FUN_0040d310`, which greys out and then fades
 * the field to white over the last 60 frames of a 120-frame card.
 *
 * `acceptBomb` only selects it when the anti-tamper flags are set (`Player.cpp:1225`),
 * i.e. as the punishment for a tampered save, so it is data here rather than gameplay:
 * we do not model `IsTampered()`. Spell practice cuts it to 40 frames (`:544-546`).
 */
export const DISSOLVE_BOMB: BombSpec = bomb({
  id: 'dissolve',
  name: '"Dissolve Spell"',
  nameJp: '「ディゾルブスペル」',
  member: 'none',
  slot: 1,
  duration: 120,
  stateTimer: 200,
  face: -1,
  retailFn: '0040d100',
  backdrop: (timer, duration) => ({
    plate: timer < 60 ? plateRamp(0x404040, timer, duration) : plateRamp(0xf0f0f0, timer, duration),
    flash: null,
  }),
  cancelRadius: 96,
  clearScreen: true,
  accent: 0xf0f0f0,
  zones: () => [],
});

/** One of Marisa's / Remilia's pillars: a beam zone that hugs the ship. */
function sparkBeam(player: PlayerSim, width: number, damage: number, color: number): BombZone {
  return zone({
    shape: 'beam',
    x: player.x,
    y: player.y,
    angle: UP,
    radius: player.y + 40,
    width,
    damage,
    hitsLeft: 999,
    interval: 2,
    color,
    follow: true,
    life: -1,
  });
}

/** A starter ring for the Scarlet cards, so the card reads from frame one. */
function waves(player: PlayerSim): BombZone[] {
  return [
    zone({
      shape: 'wave',
      x: player.x,
      y: player.y,
      radius: 30,
      width: 26,
      damage: 11,
      hitsLeft: 999,
      interval: 6,
      color: 0xff7a8c,
      life: 96,
      vy: 1.1,
    }),
  ];
}

/**
 * Barriers hugging the field edges. `count` 4 uses the four sides, 8 adds the
 * two diagonals so the whole arcade region is covered twice over.
 */
function edgeBarriers(count: number, opts: { damage: number; interval: number; color: number }): BombZone[] {
  const cx = PLAYFIELD_W / 2;
  const cy = PLAYFIELD_H / 2;
  const half = (v: number) => v / 2;
  const sides: Array<{ x: number; y: number; w: number; h: number; vx: number; vy: number }> = [
    { x: cx, y: 34, w: cx, h: 34, vx: 0, vy: 1.6 },
    { x: cx, y: PLAYFIELD_H - 34, w: cx, h: 34, vx: 0, vy: -1.6 },
    { x: 34, y: cy, w: 34, h: cy, vx: 1.6, vy: 0 },
    { x: PLAYFIELD_W - 34, y: cy, w: 34, h: cy, vx: -1.6, vy: 0 },
    { x: cx, y: half(PLAYFIELD_H), w: half(PLAYFIELD_W), h: half(PLAYFIELD_H), vx: 0, vy: 0 },
    { x: 96, y: 112, w: 96, h: 112, vx: 0.9, vy: 1.1 },
    { x: PLAYFIELD_W - 96, y: PLAYFIELD_H - 112, w: 96, h: 112, vx: -0.9, vy: -1.1 },
    { x: cx, y: cy - 90, w: half(PLAYFIELD_W), h: 90, vx: 0, vy: 1.2 },
  ];
  return sides.slice(0, count).map((s, i) =>
    zone({
      shape: 'barrier',
      x: s.x,
      y: s.y,
      radius: s.h,
      width: s.w,
      damage: opts.damage,
      hitsLeft: 999,
      interval: opts.interval,
      color: opts.color,
      vx: s.vx,
      vy: s.vy,
      life: -1,
      delay: i * 3,
    }),
  );
}

/** Scatter `count` zones evenly over the arcade region. */
function scatterZones(gs: GameState, count: number, init: ZoneInit): BombZone[] {
  const out: BombZone[] = [];
  for (let i = 0; i < count; i++) {
    const x = 40 + gs.rng.randomF32InRange(PLAYFIELD_W - 80);
    const y = 60 + gs.rng.randomF32InRange(PLAYFIELD_H - 160);
    out.push(
      zone({
        ...init,
        x,
        y,
        vx: gs.rng.randomF32SignedInRange(1.2),
        vy: gs.rng.randomF32SignedInRange(1.2),
        delay: Math.floor(i * 3),
      }),
    );
  }
  return out;
}

/**
 * Raw accessor: the shot type's row, then the member half and which of that
 * member's two cards.
 *
 * Solos do not get to choose their half. `Player.cpp:782-789` overwrites the side
 * byte every frame from `(shotType & 1)` for `shotType >= 4`, and the odd solo rows
 * of the callback table really are the youkai halves' own cards (row 10 is
 * 境界「永夜四重結界」, 14 is 魔操「リターンイナニメトネス」, 18 is
 * 紅魔「スカーレットデビル」, 22 is 死蝶「華胥の永眠」), so 紫 / アリス /
 * レミリア / 幽々子 fly alone as shot types 5, 7, 9 and 11 and take their half of
 * the pair with them.
 */
export function getBombSpec(shotType: number, isYoukai: boolean, slot: 1 | 2): BombSpec {
  const solo = shotType >= 4;
  const teamIndex = solo ? soloCharacterIndex(shotType) : shotType;
  const base = teamIndex * 4;
  const side = solo ? (shotType & 1) === 1 : isYoukai;
  const offset = (side ? 2 : 0) + (slot - 1);
  return BOMB_SPECS[base + offset] ?? BOMB_SPECS[0];
}

/**
 * Which card actually goes off, straight from `acceptBomb` (`Player.cpp:1238-1246`).
 *
 * The column is two bytes wide. Bit 0 comes from `Player+3`, which only the focus
 * block ever writes (`Player.cpp:778`), so holding Shift really does swap which
 * half of the pair drops its card -- 永夜抄's most-quoted bomb rule, and the reason
 * `focused` is an argument here. Bit 1 comes from `Player+4`, which has no writer
 * anywhere in the reference set and is cleared right after the read (`:1275`), so
 * the second card of a member is not reachable from the decomp; the deathbomb is
 * the one signal we have that behaves like it, and `slot` stands in for it.
 *
 * Nothing about a deathbomb reaches the column, either: `acceptBomb` clears
 * `Player+4` and the forced-bomb byte `Player+6` and reads no other flag, so the
 * press comes out of the same column an upright press would (`Die()` only lengthens
 * the grace window). So `focused` is the member bit, full stop.
 *
 * A deathbomb is not a different card either: `Player.cpp:1648-1651` loads
 * `g_PlayerBombCallbackTable[shotType * 2]` into `Player+0x1000` for the update pass
 * and `[shotType * 2 + 1]` into `Player+0x1014` for the draw pass
 * (`Player.cpp:1189` versus `:1536-1541`), so the odd rows are the draw halves of
 * the same cards rather than a deathbomb set. That is also why only even-row
 * functions call `FUN_0040be30`, the one place that names a card.
 */
export function selectBomb(shotType: number, focused: boolean, deathbomb = false): BombSpec {
  const slot: 1 | 2 = deathbomb ? 2 : 1;
  return getBombSpec(shotType, focused, slot);
}

/**
 * The callback column for a card, derived from where it sits in `BOMB_SPECS`.
 *
 * The list is grouped by member (human card 1, human card 2, youkai card 1, youkai
 * card 2) because that is how the cards read, while `acceptBomb` indexes its row as
 * `(cardLevel << 1) | flyingMember`: columns 0 and 1 are the two members' first
 * cards, 2 and 3 their second. Swapping the low two bits converts one order into the
 * other, and the 妖率 drift at `:1194-1200` reads `phase & 1` off the result, which
 * is what makes the youkai half's cards fill the meter and the human half's drain it.
 */
function applyRetailVariantOrder(): void {
  for (let i = 0; i < BOMB_SPECS.length; i++) {
    const spec = BOMB_SPECS[i];
    if (spec) spec.phase = (((i & 1) << 1) | ((i >> 1) & 1)) as 0 | 1 | 2 | 3;
  }
}
applyRetailVariantOrder();

/** Stamp the fifth column, which no `BOMB_SPECS` entry occupies. */
DISSOLVE_BOMB.phase = 4;
