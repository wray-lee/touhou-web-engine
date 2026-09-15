/**
 * The retail .std stage backdrop, rebuilt on the engine's own 3D path.
 *
 * `stageN.std` is not a picture: it is a small 3D scene plus a camera script.
 * Object templates hold quads (a ground tile, a tree sprite, a ribbon of water),
 * instances place those templates along a corridor measured in world units, and an
 * instruction stream drives a chase camera down it, one entry per frame. This file
 * replays all three: `tick()` advances the camera script exactly as
 * `Background::OnUpdate`, and `quads()` reproduces `Background::RenderObjects`
 * projection math so each quad arrives in playfield pixels for the renderer to put
 * on a mesh. Nothing here draws: the layer stays a pure function from frame number
 * to geometry, which is what makes it testable.
 *
 * Distances are the originals; the playfield is the 384x448 viewport the game sets
 * at `Background.cpp:728`, given here in playfield-local pixels.
 */

import { AnmVm, anmScriptFromBase64 } from '../../engine/anm/AnmVm';
import type { AnmRng } from '../../engine/anm/AnmVm';
import type { StdAnmPack, StdStage } from './data/th08-std';
import { TH08_STD, TH08_STD_PACKS } from './data/th08-std';

export const STD_VIEW_W = 384;
export const STD_VIEW_H = 448;

/** The projection band, as `Background::Initialize` sets it up. */
const NEAR_PLANE = 30;
const FAR_PLANE = 1800;
/** How far an authored quad may be quartered before the leftovers are given up on. */
const MAX_QUAD_SPLITS = 5;

/** One projected backdrop quad, ready for the renderer's mesh layer. */
export interface StdQuadView {
  /** Page the sprite lives on, as shipped in the pack (`/assets/.../stg1bg_t0.png`). */
  page: string;
  /** Eight numbers: screen x,y per corner, in playfield pixels. */
  screen: number[];
  /** Eight numbers: u,v per corner in page pixels, in the same order as `screen`. */
  uv: number[];
  /** Opacity the ANM script asked for (0..1); the fog does not live here. */
  alpha: number;
  /**
   * Four view-space depths, one per corner, in the same order as `screen`.
   *
   * This is the hardware fog's input, not a fade: `D3DRS_FOGSTART`/`FOGEND` make a
   * linear ramp out of camera-space depth, the rasteriser interpolates it across the
   * sheet, and the fragment gets mixed toward `D3DRS_FOGCOLOR` per pixel. So one big
   * ground tile carries its own whole gradient, and `alpha` stays what the ANM script
   * asked for instead of standing in for the fog.
   *
   * The colour mix is the reason this channel exists. 38 of the 52 fog settings in
   * the shipped `.std` files name a fog that is not black - stage 4 alone runs
   * `(240,192,192)`, `(240,48,48)` and `(224,192,192)`, stage 8 `(48,48,240)` - and
   * fading alpha toward a black clear threw all of it away. Two ways of faking it
   * from outside a shader were tried and are gone: a flat fog-coloured underlay
   * painted fog into every sheet's transparent holes, and a tinted re-draw could not
   * work either, because a tint multiplies the texel and so arrives shaded by the
   * scenery it was supposed to replace. See `engine/renderer/FogShader.ts`.
   *
   * Additive layers get no depth: hardware fog would mix them *toward* the fog
   * colour, which brightens the frame rather than receding the layer.
   */
  depth?: readonly number[];
  /** The ANM script asked for additive blending. */
  additive: boolean;
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface CamSet {
  v0: Vec3;
  v1: Vec3;
  v2: Vec3;
  v3: Vec3;
  v5: Vec3;
  fov: number;
}

const v3 = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z });

/** `Float3` reinterpretation: the script stores camera numbers as raw words. */
const f32 = (word: number): number => {
  const buf = new Int32Array([word | 0]);
  return new Float32Array(buf.buffer)[0];
};

const initialSet = (): CamSet => ({
  v0: v3(0, 0, 1000),
  v1: v3(0, 0, 0),
  v2: v3(0, 1, 0),
  v3: v3(0, 0, 0),
  v5: v3(0, 0, 0),
  fov: 0.5235987901687622,
});

/** `Background + 0xAEC..0xAF4`: the linear ramp plus the colour it mixes toward. */
export interface Fog {
  color: number;
  near: number;
  far: number;
}

/** Backdrop scripts get their own stream: touching the sim's generator would desync it. */
let localState = 0x12345678;

/** A deterministic local generator: backdrop scripts must not touch the sim's RNG. */
const localRng: AnmRng = {
  randomU32InRange: (bound) =>
    bound > 0 ? (localState = (localState * 1103515245 + 12345) >>> 0) % bound : 0,
  randomF32InRange: (bound) => (localRng.randomU32InRange(65536) / 65536) * bound,
};

/** `Background::FUN_00408fc0`: one component of a hermite segment. */
const hermite = (p0: number, p1: number, m0: number, m1: number, t: number): number => {
  const w0 = (t - 1) * (t - 1) * (2 * t + 1);
  const w1 = t * t * (3 - 2 * t);
  const w2 = (1 - t) * (1 - t) * t;
  const w3 = (t - 1) * t * t;
  return w0 * p0 + w1 * p1 + w2 * m0 + w3 * m1;
};

/** `Background::FUN_00408d60`: the six authored easings plus the hermite path. */
const ease = (mode: number, t: number): number => {
  switch (mode) {
    case 1:
      return 1 - (1 - t) * (1 - t);
    case 2:
      return 1 - (1 - t) ** 3;
    case 3:
      return 1 - (1 - t) ** 4;
    case 4:
      return t * t;
    case 5:
      return t ** 3;
    case 6:
      return t ** 4;
    default:
      return t;
  }
};

const readVec = (args: readonly number[]): Vec3 => v3(f32(args[0]), f32(args[1]), f32(args[2]));

/** Row-major 4x4 helpers, in D3DX's row-vector convention (`p * M`). */
type Mat4 = Float64Array;

const mulPoint = (m: Mat4, x: number, y: number, z: number, out: number[]): number[] => {
  out[0] = x * m[0] + y * m[4] + z * m[8] + m[12];
  out[1] = x * m[1] + y * m[5] + z * m[9] + m[13];
  out[2] = x * m[2] + y * m[6] + z * m[10] + m[14];
  out[3] = x * m[3] + y * m[7] + z * m[11] + m[15];
  return out;
};

const mulMat = (a: Mat4, b: Mat4, out: Mat4): Mat4 => {
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[row * 4 + k] * b[k * 4 + col];
      out[row * 4 + col] = sum;
    }
  }
  return out;
};

/** `D3DXMatrixLookAtLH`. */
const lookAtLH = (eye: Vec3, at: Vec3, up: Vec3, out: Mat4): Mat4 => {
  let zx = at.x - eye.x;
  let zy = at.y - eye.y;
  let zz = at.z - eye.z;
  const zl = Math.hypot(zx, zy, zz) || 1;
  zx /= zl;
  zy /= zl;
  zz /= zl;
  // x = normalize(cross(up, z))
  let xx = up.y * zz - up.z * zy;
  let xy = up.z * zx - up.x * zz;
  let xz = up.x * zy - up.y * zx;
  const xl = Math.hypot(xx, xy, xz) || 1;
  xx /= xl;
  xy /= xl;
  xz /= xl;
  // y = cross(z, x)
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  // D3DX keeps the basis vectors in the columns: `_11|_12|_13` are the x-components of
  // the x, y and z axes, which is also why `RenderObjects` reads the first three floats
  // of the view matrix as its billboard axis.
  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;
  out[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
  out[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
  out[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
  out[15] = 1;
  return out;
};

/** `D3DXMatrixPerspectiveFovLH`. */
const perspectiveFovLH = (fovY: number, aspect: number, zn: number, zf: number, out: Mat4): Mat4 => {
  const f = 1 / Math.tan(fovY / 2);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = zf / (zf - zn);
  // Row-vector convention: the view depth becomes w, so the z row feeds the divisor.
  out[11] = 1;
  out[14] = (-zn * zf) / (zf - zn);
  return out;
};

export interface StdBackgroundOptions {
  /** `stage1`, `stage4a`, `stage6_s`. */
  key: string;
  /** Width/height of the playfield in the space the quads are written for. */
  viewWidth?: number;
  viewHeight?: number;
}

/**
 * One stage backdrop: camera script, object instances, and the quads they make.
 *
 * Frames are the stage's own 60 Hz count, so `tick()` belongs next to the sim tick
 * rather than to the renderer.
 */
export class StdBackground {
  private readonly stage: StdStage;
  private readonly pack: StdAnmPack | null;
  private readonly viewW: number;
  private readonly viewH: number;
  private readonly cullDistSq: number;

  /** Current, target, start and the two hermite control sets, as in the original. */
  private cur: CamSet = initialSet();
  private target: CamSet = initialSet();
  private start: CamSet = initialSet();
  private ctrl2: CamSet = initialSet();
  private ctrl3: CamSet = initialSet();
  private duration = [0, 0, 0, 0, 0];
  private timers = [0, 0, 0, 0, 0];
  private modes = [0, 0, 0, 0, 0];

  private fog: Fog = { color: 0xff000000, near: 200, far: 500 };
  private fogFrom: Fog = { ...this.fog };
  private fogTo: Fog = { ...this.fog };
  private fogDuration = 0;
  private fogTimer = 0;

  /** The clear colour the game paints behind the backdrop (`Background + 0x830`). */
  private clearColor = 0;
  /** Scroll offset: how far down the corridor this frame's camera has travelled. */
  private scroll: Vec3 = v3();
  private swayMode = 0;
  private insn = 0;
  private frame = 0;
  /** One VM per authored quad; the scripts animate sprite, scale, colour, anchor. */
  private readonly vms: (AnmVm | null)[] = [];

  private readonly viewMatrix = new Float64Array(16);
  private readonly proj = new Float64Array(16);
  private readonly viewProj = new Float64Array(16);
  private quads: StdQuadView[] = [];
  /** Where each object's quads sit in the flat VM list, in `LoadStageData`'s order. */
  private readonly quadBase: number[] = [];

  /** 1 = a spell card is fading the backdrop out, 2 = its own backdrop is up. */
  spellBackgroundState = 0;
  private spellTimer = 0;

  constructor(options: StdBackgroundOptions) {
    const stage = TH08_STD[options.key];
    if (!stage) throw new Error(`no .std data for ${options.key}`);
    this.stage = stage;
    this.pack = stage.pack >= 0 ? (TH08_STD_PACKS[stage.pack] ?? null) : null;
    this.viewW = options.viewWidth ?? STD_VIEW_W;
    this.viewH = options.viewHeight ?? STD_VIEW_H;
    this.cullDistSq = cullDistanceFor(options.key);
    let vmIndex = 0;
    for (const object of this.stage.objects) {
      this.quadBase.push(vmIndex);
      vmIndex += object.quads.length;
    }
    this.attachScripts();
  }

  /** Frames this backdrop has been running, for tests and the debug line. */
  get currentFrame(): number {
    return this.frame;
  }

  get quadCount(): number {
    return this.quads.length;
  }

  /**
   * Bind one VM per authored quad, the way `LoadStageData` does: the script comes
   * from the stage's own `.anm`, and the sprite size is the cell it draws.
   */
  private attachScripts(): void {
    const pack = this.pack;
    if (!pack) return;
    let index = 0;
    for (const object of this.stage.objects) {
      for (const quad of object.quads) {
        const script = pack.scripts[quad.anmScript];
        if (script) {
          const vm = new AnmVm(localRng);
          const rect = pack.rects[quad.anmScript] ?? null;
          vm.attach(anmScriptFromBase64(script), rect ? { x: rect.w, y: rect.h } : undefined);
          this.vms[index] = vm;
        }
        index++;
      }
    }
  }

  /** Advance one frame: camera script first, then the per-quad animation, then geometry. */
  tick(): void {
    this.runScript();
    this.interpolate();
    this.tickSway();
    this.tickFog();
    if (this.spellBackgroundState === 1) {
      this.spellTimer++;
      if (this.spellTimer > 60) {
        this.spellTimer = 60;
        this.spellBackgroundState = 2;
      }
    }
    this.tickQuads();
    this.build();
  }

  /** The geometry to draw this frame, in retail draw order (far passes first). */
  get view(): {
    quads: readonly StdQuadView[];
    clearColor: number;
    fade: number;
    /**
     * This frame's fog, already in the form the shader wants: `D3DRS_FOGCOLOR` as
     * 0xRRGGBB plus the linear ramp in the same world units as `StdQuadView.depth`.
     */
    fog: Fog;
  } {
    return {
      quads: this.quads,
      clearColor: this.clearColor >>> 0,
      fade: this.spellBackgroundState >= 1 ? this.spellTimer / 60 : 0,
      fog: { color: stdClearColor(this.fog.color), near: this.fog.near, far: this.fog.far },
    };
  }

  /**
   * `g_Background.unk6394` as the `.std`-space effect movers read it.
   *
   * The cull in `FUN_004264f0` measures the ember against the raw `vector0` and
   * against `vector3`, which `Background.cpp:496-497` sets to `normalize(vector1)`
   * -- the look direction as an offset, not as `target - eye`. Copy that rather
   * than tidying it.
   */
  get effectCamera(): { eye: Vec3; at: Vec3; dir: Vec3; fov: number } {
    const at = this.cur.v1;
    const len = Math.hypot(at.x, at.y, at.z) || 1;
    return {
      eye: { ...this.cur.v0 },
      at: { ...at },
      dir: { x: at.x / len, y: at.y / len, z: at.z / len },
      fov: this.cur.fov,
    };
  }

  /**
   * Project one backdrop-space point into playfield pixels and report the pixel
   * size of a one-unit world quad there.
   *
   * Returns null past the far plane, which is how the `.std` movers retire a
   * particle the camera has already walked away from.
   */
  projectEffect(point: Vec3): { x: number; y: number; scale: number } | null {
    const m = [0, 0, 0, 0];
    mulPoint(this.viewProj, point.x, point.y, point.z, m);
    const w = m[3];
    if (!(w > 0)) return null;
    const x = (m[0] / w + 1) * 0.5 * this.viewW;
    const y = (1 - m[1] / w) * 0.5 * this.viewH;
    // A unit vector along world x is a stable yardstick: it needs no second
    // matrix, and the backdrop's own billboards measure their width the same way.
    const side = [0, 0, 0, 0];
    mulPoint(this.viewProj, point.x + 1, point.y, point.z, side);
    const scale = side[3] > 0 ? Math.abs((side[0] / side[3] - m[0] / w) * 0.5 * this.viewW) : 0;
    return { x, y, scale };
  }

  /** `OnUpdate`'s instruction walk: consume everything whose frame has come. */
  private runScript(): void {
    const script = this.stage.script;
    for (;;) {
      const insn = script[this.insn];
      if (!insn || this.frame < insn.frame) break;
      if (insn.frame < 0) break;
      const args = insn.args;
      switch (insn.opcode) {
        case 0: {
          const next = script[this.insn + 1];
          this.scroll = readVec(args);
          // The script stores the corridor's other end right after this one; retail
          // consumes it here without acting on it, so the walk has to skip it.
          if (next && next.frame >= 0) this.insn++;
          break;
        }
        case 1:
          this.fog = { color: args[0] >>> 0, near: f32(args[1]), far: f32(args[2]) };
          this.fogTo = { ...this.fog };
          break;
        case 2:
          this.fogFrom = { ...this.fog };
          this.fogTo = { ...this.fog };
          this.fogDuration = args[0];
          this.fogTimer = 0;
          break;
        case 3:
          return;
        case 4:
          this.insn = args[0];
          this.frame = args[1];
          this.duration[0] = 0;
          continue;
        case 5:
          this.setTarget('v0', args);
          break;
        case 7:
          this.setTarget('v1', args);
          break;
        case 9:
          this.setTarget('v2', args);
          break;
        case 11:
          this.start.fov = this.target.fov;
          this.target.fov = f32(args[0]);
          if (this.duration[3] === 0) this.cur.fov = this.target.fov;
          break;
        case 6:
          this.setInterp(0, args);
          break;
        case 8:
          this.setInterp(1, args);
          break;
        case 10:
          this.setInterp(2, args);
          break;
        case 12:
          this.setInterp(3, args);
          break;
        case 13:
          this.clearColor = args[0] >>> 0;
          break;
        case 14:
          this.start.v0 = readVec(args);
          break;
        case 15:
          this.target.v0 = readVec(args);
          break;
        case 16:
          this.ctrl2.v0 = readVec(args);
          break;
        case 17:
          this.ctrl3.v0 = readVec(args);
          break;
        case 18:
          this.duration[0] = args[0];
          this.timers[0] = 0;
          this.modes[0] = 7;
          break;
        case 19:
          this.start.v1 = readVec(args);
          break;
        case 20:
          this.target.v1 = readVec(args);
          break;
        case 21:
          this.ctrl2.v1 = readVec(args);
          break;
        case 22:
          this.ctrl3.v1 = readVec(args);
          break;
        case 23:
          this.duration[1] = args[0];
          this.timers[1] = 0;
          this.modes[1] = 7;
          break;
        case 24:
          this.start.v2 = readVec(args);
          break;
        case 25:
          this.target.v2 = readVec(args);
          break;
        case 26:
          this.ctrl2.v2 = readVec(args);
          break;
        case 27:
          this.ctrl3.v2 = readVec(args);
          break;
        case 28:
          this.duration[2] = args[0];
          this.timers[2] = 0;
          this.modes[2] = 7;
          break;
        case 32:
          this.cur.v5 = readVec(args);
          break;
        case 33:
          this.swayMode = args[0] & 0xff;
          this.duration[4] = 0;
          this.timers[4] = 0;
          this.modes[4] = 0;
          break;
        default:
          break;
      }
      this.insn++;
    }
    if ((this.stage.script[this.insn]?.opcode ?? 3) !== 3) this.frame++;
  }

  private setTarget(field: 'v0' | 'v1' | 'v2', args: readonly number[]): void {
    const index = field === 'v0' ? 0 : field === 'v1' ? 1 : 2;
    this.start[field] = { ...this.target[field] };
    this.target[field] = readVec(args);
    if (this.duration[index] === 0) this.cur[field] = readVec(args);
  }

  private setInterp(index: number, args: readonly number[]): void {
    this.duration[index] = args[0];
    this.timers[index] = 0;
    this.modes[index] = args[1];
  }

  /** `FUN_00408d60` for the three vectors, then the inline version for the fov. */
  private interpolate(): void {
    const fields = ['v0', 'v1', 'v2'] as const;
    for (let index = 0; index < 3; index++) {
      if (this.duration[index] === 0) continue;
      const field = fields[index];
      const raw = this.advance(index);
      const t = this.modes[index] === 7 ? raw : ease(this.modes[index], raw);
      const from = this.start[field];
      const to = this.target[field];
      const out = this.cur[field];
      if (this.modes[index] === 7) {
        out.x = hermite(from.x, to.x, this.ctrl2[field].x, this.ctrl3[field].x, t);
        out.y = hermite(from.y, to.y, this.ctrl2[field].y, this.ctrl3[field].y, t);
        out.z = hermite(from.z, to.z, this.ctrl2[field].z, this.ctrl3[field].z, t);
      } else {
        out.x = (to.x - from.x) * t + from.x;
        out.y = (to.y - from.y) * t + from.y;
        out.z = (to.z - from.z) * t + from.z;
      }
    }
    if (this.duration[3] !== 0) {
      const t = ease(this.modes[3], this.advance(3));
      this.cur.fov = (this.target.fov - this.start.fov) * t + this.start.fov;
    }
    // `vector3` is the view direction, which the object cull measures against.
    const dx = this.cur.v1.x;
    const dy = this.cur.v1.y;
    const dz = this.cur.v1.z;
    const len = Math.hypot(dx, dy, dz) || 1;
    this.cur.v3 = v3(dx / len, dy / len, dz / len);
  }

  private advance(index: number): number {
    if (this.timers[index] < this.duration[index]) {
      this.timers[index]++;
      return this.timers[index] / this.duration[index];
    }
    this.timers[index] = this.duration[index];
    this.duration[index] = 0;
    return 1;
  }

  /** Modes 1-3: the authored camera shake, on its own free-running clock. */
  private tickSway(): void {
    if (this.swayMode === 0) return;
    const period = this.swayMode === 3 ? 4800 : 480;
    const angle = (this.timers[4] * Math.PI * 2) / period - Math.PI;
    if (this.swayMode === 1) {
      this.cur.v5.x = Math.sin(angle) * 40;
    } else if (this.swayMode === 2) {
      this.cur.v5.x = Math.sin(angle) * 70;
      this.cur.v2.x = -Math.sin(angle) * 0.1;
    } else {
      this.cur.v2.x = Math.sin(angle);
      this.cur.v2.z = Math.cos(angle);
    }
    this.timers[4]++;
    if (this.timers[4] >= period) this.timers[4] = 0;
  }

  /** `OnUpdate`'s fog block: a linear ramp between the two snapshots op 2 took. */
  private tickFog(): void {
    if (this.fogDuration === 0) return;
    this.fogTimer++;
    const t = Math.min(1, this.fogTimer / this.fogDuration);
    const channel = (from: number, to: number): number => from + (to - from) * t;
    const mix = (a: number, b: number): number => {
      const out = channel((a >>> 0) & 0xff, (b >>> 0) & 0xff);
      return Math.round(out) & 0xff;
    };
    this.fog = {
      color:
        (((this.fog.color >>> 24) << 24) |
          (mix((this.fogFrom.color >> 16) & 0xff, (this.fogTo.color >> 16) & 0xff) << 16) |
          (mix((this.fogFrom.color >> 8) & 0xff, (this.fogTo.color >> 8) & 0xff) << 8) |
          mix(this.fogFrom.color & 0xff, this.fogTo.color & 0xff)) >>>
        0,
      near: channel(this.fogFrom.near, this.fogTo.near),
      far: channel(this.fogFrom.far, this.fogTo.far),
    };
    if (this.fogTimer >= this.fogDuration) this.fogDuration = 0;
  }

  /** One `ExecuteScript` per authored quad, as `FUN_00409f40` does. */
  private tickQuads(): void {
    for (const vm of this.vms) vm?.step();
  }

  /** `RenderObjects` for all four passes, far to near, in one list. */
  private build(): void {
    this.quads.length = 0;
    const pack = this.pack;
    if (!pack) return;
    const eye = v3(
      this.cur.v0.x + this.cur.v5.x,
      this.cur.v0.y + this.cur.v5.y,
      this.cur.v0.z + this.cur.v5.z,
    );
    const at = v3(
      this.cur.v0.x + this.cur.v1.x,
      this.cur.v0.y + this.cur.v1.y,
      this.cur.v0.z + this.cur.v1.z,
    );
    lookAtLH(eye, at, this.cur.v2, this.viewMatrix);
    perspectiveFovLH(this.cur.fov, this.viewW / this.viewH, NEAR_PLANE, FAR_PLANE, this.proj);
    mulMat(this.viewMatrix, this.proj, this.viewProj);
    // `RenderObjects` reads the view matrix's first three floats as a Float3 and
    // normalizes it, which is the x-components of the three basis vectors. That is
    // the camera's right axis whenever the camera has no roll, and it is what the
    // billboard edge is walked along, so copy the read rather than clean it up.
    const axis = v3(this.viewMatrix[0], this.viewMatrix[1], this.viewMatrix[2]);
    const axisLength = Math.hypot(axis.x, axis.y, axis.z) || 1;
    const right = v3(axis.x / axisLength, axis.y / axisLength, axis.z / axisLength);

    for (const pass of [2, 3, 0, 1]) {
      for (const instance of this.stage.instances) {
        const objectIndex = this.objectIndexOf(instance.objectId);
        if (objectIndex < 0) continue;
        const object = this.stage.objects[objectIndex];
        if (object.zLevel !== pass) continue;
        const base = this.quadBase[objectIndex];
        const centre = v3(
          object.position[0] + instance.position[0] - this.scroll.x + object.size[0] / 2,
          object.position[1] + instance.position[1] - this.scroll.y + object.size[1] / 2,
          object.position[2] + instance.position[2] - this.scroll.z + object.size[2] / 2,
        );
        centre.x -= eye.x;
        centre.y -= eye.y;
        centre.z -= eye.z;
        if (this.cullDistSq < centre.x ** 2 + centre.y ** 2 + centre.z ** 2) continue;
        const along = centre.x * this.cur.v3.x + centre.y * this.cur.v3.y + centre.z * this.cur.v3.z;
        const radius = Math.hypot(object.size[0], object.size[1], object.size[2]) / 2 + 960;
        if (along > radius || along < 80) continue;

        for (let q = 0; q < object.quads.length; q++) {
          const quad = object.quads[q];
          const vm = this.vms[base + q];
          if (!vm || !vm.visible) continue;
          const rect = this.rectFor(vm, quad.anmScript);
          if (!rect) continue;
          this.emitQuad(vm, quad, instance, rect, right, eye);
        }
      }
    }
  }

  /** The cell a quad currently shows: scripts do swap sprites mid-flight. */
  private rectFor(
    vm: AnmVm,
    anmScript: number,
  ): { page: string; x: number; y: number; w: number; h: number } | null {
    const pack = this.pack;
    if (!pack) return null;
    const rect = pack.rects[vm.sprite] ?? pack.rects[anmScript] ?? null;
    if (rect && vm.spriteSize.x !== rect.w) {
      vm.spriteSize = { x: rect.w, y: rect.h };
    }
    return rect;
  }

  /** Instances name objects by id; the file keeps them in id order, so trust that first. */
  private objectIndexOf(id: number): number {
    const direct = this.stage.objects[id];
    if (direct && direct.id === id) return id;
    return this.stage.objects.findIndex((candidate) => candidate.id === id);
  }

  private emitQuad(
    vm: AnmVm,
    quad: StdStage['objects'][number]['quads'][number],
    instance: { position: readonly [number, number, number] },
    rect: { page: string; x: number; y: number; h: number; w: number },
    right: Vec3,
    eye: Vec3,
  ): void {
    const world = v3(
      vm.pos2.x + quad.position[0] + instance.position[0] - this.scroll.x,
      vm.pos2.y + quad.position[1] + instance.position[1] - this.scroll.y,
      vm.pos2.z + quad.position[2] + instance.position[2] - this.scroll.z,
    );
    const scale = {
      x: quad.size && quad.size[0] !== 0 ? quad.size[0] / rect.w : vm.scale.x,
      y: quad.size && quad.size[1] !== 0 ? quad.size[1] / rect.h : vm.scale.y,
    };
    const uv = [
      rect.x,
      rect.y,
      rect.x + rect.w,
      rect.y,
      rect.x + rect.w,
      rect.y + rect.h,
      rect.x,
      rect.y + rect.h,
    ];
    // `AddNormalizeAngle`-driven texture scroll, in the sprite's own UV square.
    const page = rect.page;
    if (vm.uvScrollPos.x || vm.uvScrollPos.y) {
      for (let i = 0; i < 8; i += 2) {
        uv[i] += vm.uvScrollPos.x * rect.w;
        uv[i + 1] += vm.uvScrollPos.y * rect.h;
      }
    }
    const alpha = vm.color1.a / 255;
    // Retail enum is `AnmBlendMode_Normal = 0, AnmBlendMode_Additive = 1`
    // (`AnmManager.hpp:57-61`), and additive is the only non-zero value the ops can set
    // (`AnmManager.cpp:326-330`). Value 2 never exists, so `=== 2` left every `.std`
    // plane alpha-blended — the additive fog/light layers came out as opaque white clouds.
    const additive = vm.blendMode !== 0;

    if (quad.type === 1 && quad.position2) {
      this.emitRibbon(vm, quad, instance, rect, alpha, additive, right, eye);
      return;
    }
    if ((vm.renderType & 0xf) === 2) {
      this.emitBillboard(vm, world, rect, scale, uv, page, alpha, additive, right, eye, quad);
      return;
    }
    const halfX = (rect.w * scale.x) / 2;
    const halfY = (rect.h * scale.y) / 2;
    const left = vm.anchor & 1 ? world.x : world.x - halfX;
    const top = vm.anchor & 2 ? world.y : world.y - halfY;
    const corners = [
      v3(left, top, world.z),
      v3(left + halfX * 2, top, world.z),
      v3(left + halfX * 2, top + halfY * 2, world.z),
      v3(left, top + halfY * 2, world.z),
    ];
    this.pushAuthoredQuad(
      corners,
      [
        [uv[0], uv[1]],
        [uv[2], uv[3]],
        [uv[4], uv[5]],
        [uv[6], uv[7]],
      ],
      page,
      alpha,
      additive,
      eye,
      0,
    );
  }

  /**
   * `RenderObjects`' plain quad, cut against the projection band first.
   *
   * The hardware clips these for free, and a ground sheet routinely runs from under
   * the camera out past the far plane, so a quad with one bad corner cannot simply be
   * dropped without tearing a hole in the floor. Straddling quads are quartered until
   * each piece fits the band, which also keeps the layer's screen-affine UVs close to
   * what perspective division would have given.
   */
  private pushAuthoredQuad(
    corners: readonly Vec3[],
    cornerUv: readonly (readonly number[])[],
    page: string,
    alpha: number,
    additive: boolean,
    _eye: Vec3,
    depth: number,
  ): void {
    const depths = corners.map((corner) => this.viewDepth(corner));
    const nearest = Math.min(...depths);
    const furthest = Math.max(...depths);
    if (furthest < NEAR_PLANE || nearest > FAR_PLANE) return;
    const inBand = nearest >= NEAR_PLANE && furthest <= FAR_PLANE;
    if (inBand) {
      this.pushProjectedQuad(corners, cornerUv, page, alpha, additive, depths);
      return;
    }
    if (depth >= MAX_QUAD_SPLITS) return;
    // Nothing but the band needs cutting any more: the fog rides along as one depth
    // per corner and the shader ramps between them, so a sheet that fades across its
    // own face no longer has to be sliced to carry that gradient. Bisect along
    // whichever pair of edges runs deepest, which is where the straddle lives.
    const uSpread = Math.abs(depths[1] - depths[0]) + Math.abs(depths[2] - depths[3]);
    const vSpread = Math.abs(depths[3] - depths[0]) + Math.abs(depths[2] - depths[1]);
    // Two halves, and recurse: the straddle is all that needs resolving here, and
    // halving the depth range each level converges on pieces that fit the band.
    const halves = 2;
    const mix = (a: Vec3, b: Vec3, t: number): Vec3 =>
      v3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
    const mixUv = (a: readonly number[], b: readonly number[], t: number): number[] => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
    ];
    for (let i = 0; i < halves; i++) {
      const from = i / halves;
      const to = (i + 1) / halves;
      let piece: Vec3[];
      let pieceUv: number[][];
      if (uSpread >= vSpread) {
        piece = [
          mix(corners[0], corners[1], from),
          mix(corners[0], corners[1], to),
          mix(corners[3], corners[2], to),
          mix(corners[3], corners[2], from),
        ];
        pieceUv = [
          mixUv(cornerUv[0], cornerUv[1], from),
          mixUv(cornerUv[0], cornerUv[1], to),
          mixUv(cornerUv[3], cornerUv[2], to),
          mixUv(cornerUv[3], cornerUv[2], from),
        ];
      } else {
        piece = [
          mix(corners[0], corners[3], from),
          mix(corners[1], corners[2], from),
          mix(corners[1], corners[2], to),
          mix(corners[0], corners[3], to),
        ];
        pieceUv = [
          mixUv(cornerUv[0], cornerUv[3], from),
          mixUv(cornerUv[1], cornerUv[2], from),
          mixUv(cornerUv[1], cornerUv[2], to),
          mixUv(cornerUv[0], cornerUv[3], to),
        ];
      }
      this.pushAuthoredQuad(piece, pieceUv, page, alpha, additive, _eye, depth + 1);
    }
  }

  /** One band-clean quad: project its corners and lay it into the frame list. */
  private pushProjectedQuad(
    corners: readonly Vec3[],
    cornerUv: readonly (readonly number[])[],
    page: string,
    alpha: number,
    additive: boolean,
    depths?: readonly number[],
  ): void {
    const screen: number[] = [];
    for (const corner of corners) {
      const projected = this.project(corner);
      if (!projected) return;
      screen.push(projected[0], projected[1]);
    }
    this.quads.push({
      page,
      screen,
      uv: [
        cornerUv[0][0],
        cornerUv[0][1],
        cornerUv[1][0],
        cornerUv[1][1],
        cornerUv[2][0],
        cornerUv[2][1],
        cornerUv[3][0],
        cornerUv[3][1],
      ],
      alpha,
      depth: additive ? undefined : depths,
      additive,
    });
  }

  /**
   * `RenderObjects`' billboard branch: the sprite is placed at the projected centre
   * and scaled by how wide its authored world size looks from here, so a 96-unit
   * tree keeps its size in the scene rather than on the screen.
   */
  private emitBillboard(
    vm: AnmVm,
    world: Vec3,
    rect: { h: number; w: number },
    scale: { x: number; y: number },
    uv: number[],
    page: string,
    alpha: number,
    additive: boolean,
    right: Vec3,
    _eye: Vec3,
    quad: StdStage['objects'][number]['quads'][number],
  ): void {
    const centre = this.project(world);
    if (!centre || centre[2] < 0 || centre[2] > 1) return;
    const width = quad.size && quad.size[0] !== 0 ? quad.size[0] : rect.w;
    const edge = this.project(
      v3(
        world.x + right.x * width * scale.x,
        world.y + right.y * width * scale.x,
        world.z + right.z * width * scale.x,
      ),
    );
    if (!edge) return;
    const perWorld = Math.hypot(edge[0] - centre[0], edge[1] - centre[1]) / width;
    const wide = rect.w * perWorld;
    const tall = rect.h * (width < 0 ? -perWorld : perWorld);
    const x0 = vm.anchor & 1 ? centre[0] : centre[0] - wide / 2;
    const y0 = vm.anchor & 2 ? centre[1] : centre[1] - tall / 2;
    // A billboard is one point in the world, so all four corners share its depth and
    // the sheet arrives uniformly fogged - which is right: it has no depth to span.
    const along = this.viewDepth(world);
    this.quads.push({
      page,
      screen: [x0, y0, x0 + wide, y0, x0 + wide, y0 + tall, x0, y0 + tall],
      uv,
      alpha,
      depth: additive ? undefined : [along, along, along, along],
      additive,
    });
  }

  /**
   * Type 1 quads: ribbons of water and rows of fence, one authored strip stretched
   * between two world points. Retail derives each end's screen width by projecting
   * the same `width` along the camera's right vector, then offsets perpendicular to
   * the projected centre line, so a ribbon keeps its pixel width in the scene.
   */
  private emitRibbon(
    vm: AnmVm,
    quad: StdStage['objects'][number]['quads'][number],
    instance: { position: readonly [number, number, number] },
    rect: { page: string; x: number; y: number; w: number; h: number },
    alpha: number,
    additive: boolean,
    right: Vec3,
    _eye: Vec3,
  ): void {
    const second = quad.position2 ?? quad.position;
    const first = this.ribbonEnd(vm, quad.position, instance);
    const far = this.ribbonEnd(vm, second, instance);
    const p1 = this.project(first);
    const p2 = this.project(far);
    if (!p1 || !p2) return;
    if (p1[2] < 0 || p1[2] > 1 || p2[2] < 0 || p2[2] > 1) return;
    const width = quad.width || rect.w;
    const half = (world: Vec3, screen: number[]): number => {
      const side = this.project(
        v3(world.x + right.x * width, world.y + right.y * width, world.z + right.z * width),
      );
      if (!side) return 0;
      return Math.hypot(side[0] - screen[0], side[1] - screen[1]) / 2;
    };
    const halfFirst = half(first, p1);
    const halfSecond = half(far, p2);
    let dx = p2[0] - p1[0];
    let dy = p2[1] - p1[1];
    const length = Math.hypot(dx, dy);
    if (length < 0.00001) return;
    dx /= length;
    dy /= length;
    const depthFirst = this.viewDepth(first);
    const depthSecond = this.viewDepth(far);
    if (Math.max(depthFirst, depthSecond) < NEAR_PLANE) return;
    if (Math.min(depthFirst, depthSecond) > FAR_PLANE) return;
    // Corner order follows the layer's (0,1,2)(0,2,3) winding: near edge, then the
    // far edge back along the other side. UVs run across then along the strip, which
    // is how the authored sheet is drawn: narrow sideways, long down the ribbon.
    const u0 = rect.x;
    const u1 = rect.x + rect.w;
    const v0 = rect.y;
    const v1 = rect.y + rect.h;
    const nearA = [p1[0] + dy * halfFirst, p1[1] - dx * halfFirst];
    const nearB = [p1[0] - dy * halfFirst, p1[1] + dx * halfFirst];
    const farB = [p2[0] - dy * halfSecond, p2[1] + dx * halfSecond];
    const farA = [p2[0] + dy * halfSecond, p2[1] - dx * halfSecond];
    // A ribbon runs along the corridor, so its two ends sit at two different depths.
    // That used to need cutting: one alpha for the whole strip drew a fence row that
    // simply stopped mid-distance. The depth channel carries the ramp itself now, so
    // the strip goes out as the single quad it was authored as.
    this.quads.push({
      page: rect.page,
      screen: [nearA[0], nearA[1], nearB[0], nearB[1], farB[0], farB[1], farA[0], farA[1]],
      uv: [u0, v0, u1, v0, u1, v1, u0, v1],
      alpha,
      depth: additive ? undefined : [depthFirst, depthFirst, depthSecond, depthSecond],
      additive,
    });
  }

  private ribbonEnd(
    vm: AnmVm,
    position: readonly number[],
    instance: { position: readonly [number, number, number] },
  ): Vec3 {
    return v3(
      vm.pos2.x + position[0] + instance.position[0] - this.scroll.x,
      vm.pos2.y + position[1] + instance.position[1] - this.scroll.y,
      vm.pos2.z + position[2] + instance.position[2] - this.scroll.z,
    );
  }

  /**
   * `Background::OnDraw`'s fog, as the hardware applied it: `D3DRS_FOGSTART` and
   * `D3DRS_FOGEND` take the two floats at `+0xAEC`/`+0xAF0` and `FOGVERTEXMODE`
   * stays at its default, so the ramp runs on **camera-space depth** per pixel
   * (`Background.cpp:833-839`). Range from the eye was close enough to read as
   * right on a corridor that runs straight away from the camera, but it fogs the
   * sides of a wide sheet harder than its middle, which is what put the bend in
   * the horizon.
   *
   * This is the number the ramp is measured on: the view matrix's third *column*,
   * because rows hold the basis vectors in D3DX's row-vector layout, so a coordinate
   * is read down a column, across the rows. The fog colour travels beside it; see
   * `engine/renderer/FogShader.ts` for why the mix has to happen on the fragment and
   * not on the alpha.
   */
  private viewDepth(point: Vec3): number {
    return (
      point.x * this.viewMatrix[2] +
      point.y * this.viewMatrix[6] +
      point.z * this.viewMatrix[10] +
      this.viewMatrix[14]
    );
  }

  private readonly scratch = [0, 0, 0, 0];

  /** World point to playfield pixels, with the projected depth for the near/far test. */
  private project(point: Vec3): number[] | null {
    const m = mulPoint(this.viewProj, point.x, point.y, point.z, this.scratch);
    const w = m[3];
    if (!(w > 0)) return null;
    return [(m[0] / w + 1) * 0.5 * this.viewW, (1 - m[1] / w) * 0.5 * this.viewH, m[2] / w];
  }
}

/** `Background::RegisterChain`'s per-stage draw radius, keyed by the .std file name. */
function cullDistanceFor(key: string): number {
  const stage = key.replace(/_s$/, '');
  if (stage === 'stage5') return 1822500;
  if (stage === 'stage6' || stage === 'stage7') return 3240000;
  return 1322500;
}

/**
 * Which backdrop each campaign route plays on.
 *
 * The routes are named after the ECL they run, and stage 6 splits: 6A is `ecldata6`
 * on `stage6.std`, the true finale 6B is `ecldata7` on `stage7.std`. The `_s`
 * variants are spell-practice files (`Background.cpp:957`) and stay unused here.
 */
export const STD_KEY_BY_ROUTE: Readonly<Record<string, string>> = {
  stage1: 'stage1',
  stage2: 'stage2',
  stage3: 'stage3',
  stage4a: 'stage4a',
  stage4b: 'stage4b',
  stage5: 'stage5',
  stage6a: 'stage6',
  stage6b: 'stage7',
};

/** Every sprite page a backdrop samples, so the game can fetch them before frame one. */
export function stdPages(key: string): string[] {
  const stage = TH08_STD[key];
  const pack = stage && stage.pack >= 0 ? TH08_STD_PACKS[stage.pack] : null;
  if (!pack) return [];
  const pages = new Set<string>();
  for (const rect of pack.rects) if (rect) pages.add(rect.page);
  return [...pages];
}

/**
 * The clear colour as the camera script stores it (`Background + 0x830`) is a
 * `D3DCOLOR`, which is already 0xAARRGGBB numerically.
 */
export const stdClearColor = (argb: number): number => (argb >>> 0) & 0xffffff;
