/**
 * Retail's effect pool, driven by the real template table.
 *
 * ECL never names a sprite. Ops 128/139/140/174 hand `EffectManager` an *effect id*,
 * `g_EffectTemplates[id]` turns that id into a script index in `etama.anm` plus the two
 * callbacks that move it, and the draw chain blits whatever sprite that script happens to
 * select (`EffectManager.cpp:121-190`, `:1061-1210`, `EclRunHigh.inl:667-680`,
 * `:793-812`). The scripts already animate sprite, scale, rotation and colour every
 * frame, so a faithful port is a slot pool, one ANM VM per slot, and the handful of
 * movers the shipped stages reach.
 *
 * Positions are kept the retail way round: the pool's own `x/y` (the decompile's
 * `vector0`) is what gets drawn, while the VM's own `pos` belongs to the script and is
 * re-overwritten by `Draw2D` each frame (`EffectManager.cpp:1195-1205`). That is why an
 * effect without a mover sits exactly where it was spawned and only its art moves.
 */
import { AnmVm, anmScriptFromBase64, type AnmRng } from '../../engine/anm/AnmVm';
import { normalizeAngle } from '../core/math';

/** One row of `g_EffectTemplates`, as the generator lifts it. */
export interface EffectTemplateRow {
  readonly scriptIdx: number;
  readonly update: string | null;
  readonly init: string | null;
}

export interface EffectPoolDeps {
  rng: AnmRng;
  templates: readonly EffectTemplateRow[];
  /** Base64 ANM words per script index; null when the pack is not available. */
  scriptBytes: readonly (string | null)[];
  /**
   * The `.std` camera, read fresh every frame, for the movers that live in the
   * backdrop's world rather than on the playfield. Absent, those movers fall back
   * to drifting where they were spawned, which is what the unit tests exercise.
   */
  camera?: () => EffectCamera | null;
}

/**
 * `g_Background.unk6394`, as far as an effect cares: the eye, the look-at offset,
 * the normalized direction the cull measures against, and the projection that turns
 * a backdrop-space point into playfield pixels.
 */
export interface EffectCamera {
  readonly eye: { x: number; y: number; z: number };
  readonly at: { x: number; y: number; z: number };
  readonly dir: { x: number; y: number; z: number };
  /** World point to playfield pixels, or null once it stops projecting. */
  project(x: number, y: number, z: number): { x: number; y: number; scale: number } | null;
}

/** Where one effect wants its sprite drawn, in field coordinates. */
export interface EffectView {
  /** Template id, so a host can special-case one effect if it has to. */
  readonly id: number;
  /** ANM script index, which is how a test names the art it expects. */
  readonly scriptIdx: number;
  /** Sprite cell the script currently selects, in `etama.anm` numbering. */
  readonly sprite: number;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
  /** 0..1, folded through the spawn colour's alpha. */
  readonly alpha: number;
  /** RGB: the vertex colour multiplied by the spawn colour. */
  readonly tint: number;
  readonly additive: boolean;
}

export interface SpawnOptions {
  /** How many slots one call fills, retail's `count` operand. */
  count?: number;
  /** Packed ARGB as ECL passes it, where -1 is white. */
  color?: number;
  /** Orbit axis, from op 128 operands 1..3. */
  axis?: { x: number; y: number; z: number };
  /** Radius the orbit grows out to, from op 128 operand 4. */
  radius?: number;
  /** `velocity` for ops 139/140: x is an angle, y/z carry the ember throw. */
  velocity?: { x: number; y: number; z: number };
  /**
   * Owner position for the orbit family. Retail advances each of an enemy's orbit
   * effects from that enemy's own update (`Enemy::FUN_0042e010`, `EnemyManager.cpp:1019-1049`).
   */
  ownerPos?: () => { x: number; y: number } | null;
  /** Op 174 uses the second, 128-slot pool and can arrive on an interrupt label. */
  secondary?: boolean;
  interrupt?: number;
}

/** Slots in the two retail pools: `0x200` scanned by the rotating cursor, `0x80` by the second spawner. */
export const EFFECT_MAIN_SLOTS = 512;
export const EFFECT_SECONDARY_SLOTS = 128;
/** `EnemyManager.cpp:1039`/`:1046`: an orbit grows 0.3 a frame and turns 2 degrees a frame. */
const ORBIT_GROW = 0.3;
const ORBIT_SPIN = 0.031415928;
/** `EffectManager.cpp:487-495`: the orbit fades out over 16 frames once it is told to die. */
const ORBIT_FADE_FRAMES = 16;

const TAU = Math.PI * 2;

/** `Rng::GetRandomF32SignedInRange` (`Global.hpp:214-217`): a symmetric draw. */
function signed(rng: AnmRng, range: number): number {
  return (rng.randomF32InRange(2) - 1) * range;
}

/** The pool-side state of one effect, named after the decompile's fields. */
interface EffectState {
  id: number;
  /** `vector0`: the drawn position. */
  x: number;
  y: number;
  z: number;
  /** `vector5`: the anchor a radial mover measures from. */
  ox: number;
  oy: number;
  /** `vector6`: unit direction, sometimes pre-scaled. */
  dx: number;
  dy: number;
  /**
   * `vector2`/`vector3`/`vector4`: velocity, acceleration, integrated position.
   *
   * The ember movers keep these in backdrop world units and only fold them into
   * `x/y` through the camera, because that is what retail does
   * (`EffectManager.cpp:511-521`, `:534-545`).
   */
  vx: number;
  vy: number;
  vz: number;
  ax: number;
  ay: number;
  az: number;
  sx: number;
  sy: number;
  sz: number;
  /** Pixels per backdrop unit at the ember's depth; 1 for everything on the field. */
  depthScale: number;
  /** `vector1`: the spawn velocity, whose x is an angle for three of the movers. */
  vAng: number;
  vY: number;
  vZ: number;
  /** Orbit axis, radius, phase, and the radius the owner is growing towards. */
  axisX: number;
  axisY: number;
  axisZ: number;
  radius: number;
  target: number;
  angle: number;
  /** `0x352`/`0x353`: the orbit's fade-out clock. */
  dying: boolean;
  fade: number;
  timer: number;
  color: number;
  ownerPos: (() => { x: number; y: number } | null) | null;
}

/** What a mover can ask the host for. Only the `.std` families need it. */
export interface EffectMoverContext {
  camera(): EffectCamera | null;
}

/**
 * A mover: `init` runs on the spawn frame, `update` runs before the script every frame.
 *
 * Both keep the decompile's convention, where `update` returning false retires the effect
 * and `init` returning false fails the spawn (`EffectManager.cpp:165-172`, `:1090-1096`).
 */
interface EffectBehaviorPort {
  init?(state: EffectState, vm: AnmVm, rng: AnmRng, fx: EffectMoverContext): boolean;
  update?(state: EffectState, vm: AnmVm, rng: AnmRng, fx: EffectMoverContext): boolean;
}

/**
 * Embers: `EffectManager.cpp:502-530` seeds the throw, `:534-578` integrates it.
 *
 * Both halves work in the backdrop's world rather than on the playfield. The seed
 * parks the particle a screen-full out along the view axis -- `vector1 + vector0`
 * of the camera -- and scatters it by up to 60x100x100 world units, and the update
 * retires it the moment it leaves a 20 degree cone around the view direction
 * (`dot < 0.94`). That cull *is* the lifetime: an ember is recycled once the camera
 * walks away from it. Stage 1 throws 16 of them every four frames for its whole
 * length as the fireflies of 蛍火の行方, and without the cull a 512-slot pool fills
 * up before the first fairy dies, which is where the missing death, bomb and
 * item effects in this port were all coming from.
 *
 * `rise` is the second seed (`:582-609`), which biases the scatter 200 units down
 * and gives the particle a fixed 0.4 upward drift instead of reading `vector1.y`.
 */
function emberInit(
  state: EffectState,
  _vm: AnmVm,
  rng: AnmRng,
  fx: EffectMoverContext,
  rise = false,
): boolean {
  const cam = fx.camera();
  state.depthScale = 1;
  if (!cam) {
    // No backdrop to live in: drift on the field from the spawn point instead.
    state.vx = signed(rng, 0.001) + state.vAng;
    state.vy = signed(rng, 0.03) + state.vY;
    state.ax = signed(rng, 0.0001);
    state.ay = signed(rng, 0.0001);
    state.sx = state.x;
    state.sy = state.y;
    return true;
  }
  // `backgroundOffset = -g_Background.unk6394.vector1`, folded into each axis.
  state.sx = cam.at.x + cam.eye.x + signed(rng, 60) - cam.at.x / 2;
  state.sy = cam.at.y + cam.eye.y + signed(rng, rise ? 200 : 100) + (rise ? -200 : -50) - cam.at.y / 2;
  state.sz = cam.at.z + cam.eye.z + rng.randomF32InRange(100) - 100 - cam.at.z / 2;
  state.vx = signed(rng, 0.001) + state.vAng;
  state.vy = rise ? signed(rng, 0.03) + 0.4 : signed(rng, 0.03) + state.vY;
  state.vz = -rng.randomF32InRange(0.1) - 0.3 + state.vZ;
  state.ax = signed(rng, 0.0001);
  state.ay = signed(rng, 0.0001);
  state.az = -0.0003;
  // `FUN_00426280` returns 0, which is "keep the slot"; the cull belongs to the
  // update, and the mover runs before the draw list is built, so a particle that
  // starts outside the cone is gone before it is ever blitted.
  return true;
}

/**
 * Integrate one ember and cull it against the camera cone, then put it on the field.
 *
 * Returning false is retail's `return 0` from the callback, which frees the slot.
 */
function emberUpdate(state: EffectState, _vm: AnmVm, _rng: AnmRng, fx: EffectMoverContext): boolean {
  state.vx += state.ax;
  state.vy += state.ay;
  state.vz += state.az;
  const cam = fx.camera();
  if (!cam) {
    state.sx += state.vx;
    state.sy += state.vy;
    state.x = state.sx;
    state.y = state.sy;
    return true;
  }
  state.sx += state.vx;
  state.sy += state.vy;
  state.sz += state.vz;
  return projectEmber(state, cam);
}

/** The `dot < 0.94` cull plus the backdrop-to-playfield projection. */
function projectEmber(state: EffectState, cam: EffectCamera): boolean {
  const dx = state.sx - cam.eye.x;
  const dy = state.sy - cam.eye.y;
  const dz = state.sz - cam.eye.z;
  const len = Math.hypot(dx, dy, dz);
  if (!(len > 0)) return false;
  const dot = (cam.dir.x * dx + cam.dir.y * dy + cam.dir.z * dz) / len;
  if (dot < EMBER_CULL_DOT) return false;
  const at = cam.project(state.sx, state.sy, state.sz);
  if (!at) return false;
  state.x = at.x;
  state.y = at.y;
  state.z = state.sz;
  state.depthScale = clampDepthScale(at.scale);
  return true;
}

/**
 * `EffectManager.cpp:551`: the cone the camera still considers an ember on screen.
 */
const EMBER_CULL_DOT = 0.94;

/**
 * A particle on the near plane would otherwise cover the field, and the authored
 * cells are already sized for the mid-band the stage camera actually holds still.
 */
const EMBER_SCALE_MIN = 0.25;
const EMBER_SCALE_MAX = 2;

function clampDepthScale(scale: number): number {
  if (!Number.isFinite(scale) || scale <= 0) return EMBER_SCALE_MIN;
  return Math.min(EMBER_SCALE_MAX, Math.max(EMBER_SCALE_MIN, scale));
}

/**
 * The movers the shipped stages reach, keyed by the decompile's own names.
 *
 * Two families are deliberately approximated, and the approximation is recorded rather
 * than hidden: `FUN_004272e0`/`FUN_00427450` (ids 40 and 51) tessellate their own ribbon
 * mesh instead of blitting a cell, and ids 51/63 place themselves in the `.std` world with
 * a camera-facing cull (`:534-578`). Both draw here as the retail sprite on the retail
 * motion curve, in field space.
 */
export const EFFECT_BEHAVIORS: Record<string, EffectBehaviorPort> = {
  // `EffectManager.cpp:445-453`: an orbit starts pinned to its axis with no radius.
  EffectOrbitInit: {
    init: (state) => {
      state.radius = 0;
      state.angle = 0;
      state.dying = false;
      state.fade = 0;
      return true;
    },
  },
  // `EffectManager.cpp:457-497` plus the owner step from `EnemyManager.cpp:1019-1049`.
  EffectOrbitUpdate: {
    update: (state, vm) => {
      const owner = state.ownerPos?.();
      if (owner) {
        state.ox = owner.x;
        state.oy = owner.y;
        state.radius = Math.min(state.target, state.radius + ORBIT_GROW);
        state.angle = normalizeAngle(state.angle + ORBIT_SPIN);
      }
      const n = normalize3(state.axisX, state.axisY, state.axisZ);
      const perp = normalize3(n.y, -n.x, 0);
      const offset = rotateAroundAxis(perp, state.radius, n, state.angle);
      state.x = state.ox + offset.x;
      state.y = state.oy + offset.y;
      state.z = offset.z * 6;
      if (state.dying) {
        state.fade++;
        if (state.fade >= ORBIT_FADE_FRAMES) return false;
        const alpha = 1 - state.fade / ORBIT_FADE_FRAMES;
        vm.scale.x = 2 - alpha;
        vm.scale.y = 2 - alpha;
        // `EffectManager.cpp:491-492` rewrites only the alpha byte of the vertex colour.
        vm.color1.a = Math.trunc(alpha * 255);
      }
      return true;
    },
  },
  // `EffectManager.cpp:652-663`/`:667-675`: start 256px out and run in over 60 frames.
  FUN_00426b20: {
    init: (state, _vm, rng) => {
      state.ox = state.x;
      state.oy = state.y;
      const a = rng.randomF32InRange(TAU) - Math.PI;
      state.dx = Math.cos(a);
      state.dy = Math.sin(a);
      return true;
    },
  },
  FUN_00426bb0: {
    update: (state) => {
      const alpha = 256 - (state.timer * 256) / 60;
      state.x = state.dx * alpha + state.ox;
      state.y = state.dy * alpha + state.oy;
      return true;
    },
  },
  // `EffectManager.cpp:766-781`: pick a heading, then `:786-794` throws 128px out on an
  // ease-out curve over 90 frames. This is the id every shipped launcher uses for its flare.
  FUN_004270c0: {
    init: (state, _vm, rng) => {
      const a = state.vAng > -990 ? normalizeAngle(state.vAng) : rng.randomF32InRange(TAU) - Math.PI;
      state.ox = state.x;
      state.oy = state.y;
      const magnitude = rng.randomF32InRange(1.5);
      state.dx = Math.cos(a) * magnitude;
      state.dy = Math.sin(a) * magnitude;
      return true;
    },
  },
  FUN_004271a0: {
    update: (state) => {
      const t = state.timer / 90;
      const eased = 1 - (1 - t) * (1 - t);
      state.x = state.dx * eased * 128 + state.ox;
      state.y = state.dy * eased * 128 + state.oy;
      return true;
    },
  },
  // `EffectManager.cpp:805-814`: stand 256px along the spawn heading, drawn sideways.
  FUN_00427260: {
    init: (state, vm) => {
      const a = state.vAng || 0;
      state.x += Math.cos(a) * 256;
      state.y += Math.sin(a) * 256;
      vm.rotation.z = normalizeAngle(a + Math.PI / 2);
      return true;
    },
  },
  FUN_00426280: { init: (state, vm, rng, fx) => emberInit(state, vm, rng, fx) },
  FUN_004264f0: { update: emberUpdate },
  // `EffectManager.cpp:582-609`: the rising variant, scattered 200 lower and
  // drifting 0.4 up on its own rather than off the spawn velocity.
  FUN_00426720: { init: (state, vm, rng, fx) => emberInit(state, vm, rng, fx, true) },
  FUN_00426990: { update: emberUpdate },
};

function normalize3(x: number, y: number, z: number): { x: number; y: number; z: number } {
  const len = Math.hypot(x, y, z);
  if (!Number.isFinite(len) || len < 1e-6) return { x: 1, y: 0, z: 0 };
  return { x: x / len, y: y / len, z: z / len };
}

/**
 * The vertex colour is the whole story: retail uploads `color1` per vertex
 * (`AnmManager::Draw2D`) and the blit has no other modulation. `color2` only
 * differentiates the inner ring of a ribbon, which this port does not tessellate.
 */
function vertexTint(color: { r: number; g: number; b: number }): number {
  return ((color.r & 0xff) << 16) | ((color.g & 0xff) << 8) | (color.b & 0xff);
}

/**
 * Rodrigues rotation of a scaled vector around a unit axis, which is what retail's
 * `D3DXMatrixRotationQuaternion` + `D3DXVec3TransformCoord` pair computes
 * (`EffectManager.cpp:470-483`).
 */
function rotateAroundAxis(
  v: { x: number; y: number; z: number },
  scale: number,
  axis: { x: number; y: number; z: number },
  angle: number,
): { x: number; y: number; z: number } {
  const p = { x: v.x * scale, y: v.y * scale, z: v.z * scale };
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dot = axis.x * p.x + axis.y * p.y + axis.z * p.z;
  return {
    x: p.x * cos + (axis.y * p.z - axis.z * p.y) * sin + axis.x * dot * (1 - cos),
    y: p.y * cos + (axis.z * p.x - axis.x * p.z) * sin + axis.y * dot * (1 - cos),
    z: p.z * cos + (axis.x * p.y - axis.y * p.x) * sin + axis.z * dot * (1 - cos),
  };
}

/** One pool slot: the retail 0x360-byte `Effect`, kept down to what a port can observe. */
interface EffectInstance {
  active: boolean;
  state: EffectState;
  vm: AnmVm;
  update: EffectBehaviorPort | null;
  attached: boolean;
  /**
   * Bumped on every spawn so a handle owned by one enemy cannot fade the effect that
   * later reused its slot.
   */
  generation: number;
}

/**
 * A live effect the spawner keeps a hold of.
 *
 * `EnemyManager.cpp:245-253` is the only place retail reaches back into an effect: when
 * the owner dies, each of its orbit effects is flagged to fade over 16 frames.
 */
export interface EffectHandle {
  /** `effect+0x352 = 1`: start the fade that retires the effect. */
  fade(): void;
  /**
   * `effect+0x350 = 0`: retire it on the spot, which is what ECL 174 does to the effect
   * it replaced before spawning the next one (`EclRunHigh.inl:1090-1092`).
   */
  stop(): void;
}

const BLANK_STATE: Omit<EffectState, 'id'> = {
  x: 0,
  y: 0,
  z: 0,
  ox: 0,
  oy: 0,
  dx: 0,
  dy: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  ax: 0,
  ay: 0,
  az: 0,
  sx: 0,
  sy: 0,
  sz: 0,
  depthScale: 1,
  // `SpawnEffect` does `memset(effect, 0, 0x360)` and only then writes the position,
  // so an effect arriving without a velocity really does have a zero one. The
  // random-heading sentinel is `-999`, and it comes in through `velocity.x` from
  // op 140; defaulting this to `-9999` handed it to the ember seed as a speed and
  // sent stage 1's fireflies off to x = -1.7e6.
  vAng: 0,
  vY: 0,
  vZ: 0,
  axisX: 0,
  axisY: 0,
  axisZ: 0,
  radius: 0,
  target: 0,
  angle: 0,
  dying: false,
  fade: 0,
  timer: 0,
  color: -1,
  ownerPos: null,
};

/**
 * The effect pool.
 *
 * `update()` belongs next to the bullet and laser ticks: retail runs effects on their own
 * calc chain, but the ordering that matters -- movers first, then the script, then the
 * timer -- is inside this class.
 */
export class EffectPool {
  private readonly rng: AnmRng;
  private readonly templates: readonly EffectTemplateRow[];
  private readonly scriptBytes: readonly (string | null)[];
  private readonly main: EffectInstance[];
  private readonly secondary: EffectInstance[];
  private readonly scriptCache = new Map<number, Int32Array | null>();
  private readonly viewList: EffectView[] = [];
  private cursor = 0;
  /** Handed to every mover, so the `.std` families can find the backdrop camera. */
  private readonly mover: EffectMoverContext;

  /** Effects started since the pool was built, for hosts that want a counter. */
  spawned = 0;
  /** Spawns that found every slot busy, which is retail's silent drop. */
  dropped = 0;
  /** Template ids whose script was not in the pack, which should stay empty. */
  missingScript = 0;

  constructor(deps: EffectPoolDeps) {
    this.rng = deps.rng;
    this.templates = deps.templates;
    this.scriptBytes = deps.scriptBytes;
    this.main = createSlots(deps, EFFECT_MAIN_SLOTS);
    this.secondary = createSlots(deps, EFFECT_SECONDARY_SLOTS);
    this.mover = { camera: deps.camera ?? (() => null) };
  }

  /** What to draw this frame, in pool order. */
  get views(): readonly EffectView[] {
    return this.viewList;
  }

  /** Live slots across both pools. */
  get live(): number {
    let n = 0;
    for (const slot of this.main) if (slot.active) n++;
    for (const slot of this.secondary) if (slot.active) n++;
    return n;
  }

  /**
   * Start `count` effects of one template at one position.
   *
   * Returns a handle for the last slot filled, or null when the pool had nothing free,
   * which is what `SpawnEffect` does when its 512-slot scan comes round (`:131-190`).
   */
  spawn(id: number, x: number, y: number, opts: SpawnOptions = {}): EffectHandle | null {
    const template = this.templates[id];
    if (!template) return null;
    const pool = opts.secondary ? this.secondary : this.main;
    const words = this.words(template.scriptIdx);
    if (!words) {
      this.missingScript++;
      return null;
    }
    let last: EffectInstance | null = null;
    const count = Math.max(1, Math.trunc(opts.count ?? 1));
    for (let n = 0; n < count; n++) {
      const slot = this.acquire(pool, opts.secondary === true);
      if (!slot) {
        this.dropped += count - n;
        break;
      }
      this.start(slot, id, template, x, y, opts, words);
      last = slot;
      this.spawned++;
    }
    return last ? handleFor(last, last.generation) : null;
  }

  /** Advance every live effect by one frame and rebuild the draw list. */
  update(): void {
    this.viewList.length = 0;
    for (const pool of [this.main, this.secondary]) {
      for (const slot of pool) {
        if (!slot.active) continue;
        const state = slot.state;
        if (slot.update && slot.update.update?.(state, slot.vm, this.rng, this.mover) === false) {
          slot.active = false;
          continue;
        }
        if (slot.vm.step(1)) {
          slot.active = false;
          continue;
        }
        state.timer++;
        const vm = slot.vm;
        if (!vm.visible) continue;
        this.viewList.push({
          id: state.id,
          scriptIdx: this.templates[state.id]?.scriptIdx ?? -1,
          sprite: vm.sprite,
          x: state.x,
          y: state.y,
          rotation: vm.rotation.z,
          // The `.std` movers carry a perspective factor; everything on the field
          // leaves it at 1 and is drawn at the size its own script asked for.
          scaleX: vm.scale.x * state.depthScale,
          scaleY: vm.scale.y * state.depthScale,
          alpha: vm.color1.a / 255,
          tint: vertexTint(vm.color1),
          additive: vm.blendMode !== 0,
        });
      }
    }
  }

  /** Empty the pool, as `ResetEffects` does between stages (`EffectManager.cpp:114-117`). */
  clear(): void {
    for (const pool of [this.main, this.secondary]) for (const slot of pool) slot.active = false;
    this.viewList.length = 0;
    this.cursor = 0;
  }

  /** Decode one script index once per session, the way `EclStageLoader` caches ANM packs. */
  private words(scriptIdx: number): Int32Array | null {
    if (this.scriptCache.has(scriptIdx)) return this.scriptCache.get(scriptIdx) ?? null;
    let words: Int32Array | null = null;
    const b64 = this.scriptBytes[scriptIdx];
    try {
      if (b64) words = anmScriptFromBase64(b64);
    } catch {
      words = null;
    }
    this.scriptCache.set(scriptIdx, words);
    return words;
  }

  /** Next free slot, walking the ring the way the retail cursor does. */
  private acquire(pool: EffectInstance[], rotating: boolean): EffectInstance | null {
    const size = pool.length;
    for (let i = 0; i < size; i++) {
      const index = rotating ? (this.cursor + i) % size : i;
      if (rotating) {
        this.cursor = (this.cursor + 1) % size;
        if (pool[index].active) continue;
        return pool[index];
      }
      if (pool[index].active) continue;
      return pool[index];
    }
    return null;
  }

  private start(
    slot: EffectInstance,
    id: number,
    template: EffectTemplateRow,
    x: number,
    y: number,
    opts: SpawnOptions,
    words: Int32Array,
  ): void {
    const state = Object.assign({}, BLANK_STATE, {
      id,
      x,
      y,
      color: opts.color ?? -1,
      ownerPos: opts.ownerPos ?? null,
      vAng: opts.velocity?.x ?? 0,
      vY: opts.velocity?.y ?? 0,
      vZ: opts.velocity?.z ?? 0,
      axisX: opts.axis?.x ?? 0,
      axisY: opts.axis?.y ?? 0,
      axisZ: opts.axis?.z ?? 0,
      target: opts.radius ?? 0,
    }) as EffectState;
    slot.state = state;
    slot.active = true;
    slot.generation++;
    slot.update = template.update ? (EFFECT_BEHAVIORS[template.update] ?? null) : null;
    // `attach` resets the VM, so the slot's own VM is reused exactly as retail reuses the
    // 0x360-byte effect record.
    const vm = slot.vm;
    vm.attach(words);
    // `*(i32 *)(effect + 0x1F0) = color` (`EffectManager.cpp:159`) writes straight over
    // the VM's `color1`, so the spawn colour *is* the vertex colour: a script that
    // never touches a channel inherits it, and a script that drives one — which is
    // what every `AlphaTime` does — replaces it outright. Multiplying the two, as this
    // file used to, is what made the 672 spawns that arrive with colour 0 invisible.
    vm.color1.r = (state.color >> 16) & 0xff;
    vm.color1.g = (state.color >> 8) & 0xff;
    vm.color1.b = state.color & 0xff;
    vm.color1.a = (state.color >>> 24) & 0xff;
    if (opts.interrupt) vm.setInterrupt(opts.interrupt);
    slot.vm = vm;
    slot.attached = true;
    const init = template.init ? EFFECT_BEHAVIORS[template.init] : null;
    if (init?.init?.(state, vm, this.rng, this.mover) === false) slot.active = false;
  }
}

function createSlots(deps: EffectPoolDeps, size: number): EffectInstance[] {
  const make = (): EffectInstance => ({
    active: false,
    state: { ...BLANK_STATE, id: 0 } as EffectState,
    vm: new AnmVm(deps.rng),
    update: null,
    attached: false,
    generation: 0,
  });
  return Array.from({ length: size }, make);
}

/**
 * Bind a handle to one generation of one slot.
 *
 * Retail hands out the raw pointer, so a dead enemy's bookkeeping can fade whatever
 * effect later reused the slot; checking the generation costs nothing and stops the
 * port from inheriting that aliasing bug.
 */
function handleFor(slot: EffectInstance, generation: number): EffectHandle {
  return {
    fade: () => {
      if (slot.active && slot.generation === generation) slot.state.dying = true;
    },
    stop: () => {
      if (slot.active && slot.generation === generation) slot.active = false;
    },
  };
}
