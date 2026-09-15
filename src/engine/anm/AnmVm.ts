/**
 * The animation VM that drives every sprite in the Windows-era games.
 *
 * A `.anm` pack is a sprite atlas plus a pile of bytecode scripts. One `AnmVm`
 * owns one script and one transform, and the host steps it exactly once per game
 * frame. This is a faithful port of `AnmManager::ExecuteScript` and the
 * interpolation tail that follows it, down to the quirks that matter:
 *
 * - Instructions carry a `time`, and the script runs *every* instruction whose
 *   time has come round before the frame ends, so a burst of setup lands at once.
 * - `Wait` rewinds the script clock and stops, which is how a script paces itself.
 * - Position, colour, alpha, rotation and scale each have their own interpolator
 *   with a chosen easing, and they advance after the script, not inside it.
 * - `pos` is shared storage: the game logic writes the same numbers the script
 *   interpolates, which is why an enemy can be yanked sideways mid-flight.
 *
 * Nothing here knows about Touhou. Bullets, HUD panels, backgrounds and enemies
 * are all just hosts that read the transform back out.
 */
import { ANM_HEADER_BYTES, ANM_INTERP, ANM_INTERP_MODE, ANM_OPCODE, ANM_VARIABLE } from './AnmOpcode';

export interface AnmVec3 {
  x: number;
  y: number;
  z: number;
}

export interface AnmVec2 {
  x: number;
  y: number;
}

export interface AnmColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Random sources the two `*SetRand` instructions need.
 *
 * The names match `Rng` from the game's own core so the ZUN generator satisfies
 * this without an adapter: the draws have to come off the same sequence the ECL
 * uses, or a script that randomises an entry angle desynchronises.
 */
export interface AnmRng {
  /** Uniform integer in `[0, bound)`, on the original's modulo. */
  randomU32InRange(bound: number): number;
  /** Uniform float in `[0, bound)`. */
  randomF32InRange(bound: number): number;
}

const { POS, RGB1, ALPHA1, ROTATE, SCALE, RGB2, ALPHA2, LAST } = ANM_INTERP;

const v3 = (x = 0, y = 0, z = 0): AnmVec3 => ({ x, y, z });
const v2 = (x = 0, y = 0): AnmVec2 => ({ x, y });
const rgba = (r = 255, g = 255, b = 255, a = 255): AnmColor => ({ r, g, b, a });

/**
 * `AddNormalizeAngle` keeps a rotation inside one turn without wrapping hard.
 *
 * Arithmetic rather than a subtract loop: a script can feed this a rotation built out of a
 * register the host never initialised, and stepping by 2*PI from there would burn a billion
 * iterations inside a single frame. Non-finite input is not an angle, so it normalises to 0.
 */
const normalizeAngle = (angle: number): number => {
  if (!Number.isFinite(angle)) return 0;
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  else if (a < -Math.PI) a += Math.PI * 2;
  return a;
};

const addNormalizeAngle = (lhs: number, rhs: number): number => normalizeAngle(lhs + rhs);

/**
 * Read the i16 in the low half of a packed word, sign-extended.
 *
 * The header packs `{opcode, instructionSize}` into one word and
 * `{time, varMask}` into the next, so both halves need their own accessor.
 */
const low16 = (word: number): number => (word << 16) >> 16;
const high16 = (word: number): number => word >>> 16;

export class AnmVm {
  /** The script this VM is running, as 4-byte words. Shared, never copied. */
  private script: Int32Array | null = null;
  /** Word index of the next instruction, or -1 once the script has ended. */
  private pc = -1;
  private rng: AnmRng;

  /** Frames this VM has been alive; every instruction time is measured against it. */
  timeInScript = 0;
  /** Non-zero while a `Wait` is still counting down. */
  waitTimer = 0;

  pos: AnmVec3 = v3();
  /** The offset position, used when `PosMode` redirects writes away from `pos`. */
  pos2: AnmVec3 = v3();
  private posInitial: AnmVec3 = v3();
  private posFinal: AnmVec3 = v3();

  rotation: AnmVec3 = v3();
  angleVel: AnmVec3 = v3();
  private rotateInitial: AnmVec3 = v3();
  private rotateFinal: AnmVec3 = v3();

  scale: AnmVec2 = v2(1, 1);
  scaleGrowth: AnmVec2 = v2();
  private scaleInitial: AnmVec2 = v2(1, 1);
  private scaleFinal: AnmVec2 = v2(1, 1);

  color1: AnmColor = rgba();
  color2: AnmColor = rgba();
  private color1Initial: AnmColor = rgba();
  private color1Final: AnmColor = rgba();
  private color2Initial: AnmColor = rgba();
  private color2Final: AnmColor = rgba();

  uvScrollPos: AnmVec2 = v2();
  uvScrollVel: AnmVec2 = v2();

  /** Sprite cell the script last asked for, and the box it draws into. */
  sprite = 0;
  spriteSize: AnmVec2 = v2(32, 32);
  /** Frame the sprite last changed, so a host can tell an idle cycle from a live one. */
  timeOfLastSpriteSet = 0;

  visible = false;
  stopped = false;
  usePosOffset = false;
  blendMode = 0;
  anchor = 0;
  flip = 0;
  zWriteDisabled = 0;
  /**
   * `AnmOpcode_Ins25`: how the host draws this VM. The stage backdrop reads the
   * low nibble, where 2 means "billboard the sprite at its projected centre" and
   * anything else means "a real quad in the XY plane"; bit 4 asks for the sparkle
   * anchors that `Background::RenderObjects` hands to the effect manager.
   * (`AnmManager.cpp:436`)
   */
  renderType = 0;
  /** `AnmOpcode_Ins31`: backdrop flag byte, 1 for every layer the stage uses. */
  flag15 = 0;
  updateRotation = false;
  updateScale = false;
  /** Set by `Delete`/end-of-script: the host should retire whatever this VM drives. */
  deleted = false;
  /** True once the instruction pointer has run out. */
  finished = true;
  /**
   * `AnmVm::pendingInterrupt` (`AnmManager.hpp:365`), set through
   * `AnmVm::SetInterrupt` (`AnmManager.hpp:309`). Non-zero makes the next
   * `ExecuteScript` hop to the matching `InterruptLabel` instead of walking the
   * base timeline, which is how the dialogue faces enter, dim, and leave.
   */
  pendingInterrupt = 0;
  /** `interruptReturnTime` / `interruptReturnInstruction` (`:388-389`). */
  private interruptReturnTime = 0;
  private interruptReturnPc = -1;

  private intVar = [0, 0, 0, 0];
  private floatVar = [0, 0, 0, 0];
  private counterVar = [0, 0];
  private interpCurrentTimers = new Array<number>(LAST).fill(0);
  private interpEndTimers = new Array<number>(LAST).fill(0);
  private interpModes = new Array<number>(LAST).fill(0);
  /**
   * Scratch for the rare instruction that writes an argument slot that is not a
   * register. The original pokes the shared script bytes directly, which would
   * corrupt every other VM on the same script; keying by word index keeps the
   * behaviour local to this instance.
   */
  private argScratch = new Map<number, number>();

  constructor(rng: AnmRng) {
    this.rng = rng;
  }

  /**
   * Start `script` from instruction zero and run it immediately, the way
   * `SetAndExecuteScript` does: the setup block lands on the spawn frame rather
   * than a frame later.
   */
  attach(script: Int32Array, spriteSize?: AnmVec2): void {
    this.reset();
    this.script = script;
    this.finished = false;
    this.pc = 0;
    this.timeInScript = 0;
    if (spriteSize) this.spriteSize = { ...spriteSize };
    this.execute();
  }

  /** Put every field back the way `AnmVm::Initialize` leaves it. */
  reset(): void {
    this.script = null;
    this.pc = -1;
    this.finished = true;
    this.deleted = false;
    this.timeInScript = 0;
    this.waitTimer = 0;
    this.pos = v3();
    this.pos2 = v3();
    this.posInitial = v3();
    this.posFinal = v3();
    this.rotation = v3();
    this.angleVel = v3();
    this.rotateInitial = v3();
    this.rotateFinal = v3();
    this.scale = v2(1, 1);
    this.scaleGrowth = v2();
    this.scaleInitial = v2(1, 1);
    this.scaleFinal = v2(1, 1);
    this.color1 = rgba();
    this.color2 = rgba();
    this.color1Initial = rgba();
    this.color1Final = rgba();
    this.color2Initial = rgba();
    this.color2Final = rgba();
    this.uvScrollPos = v2();
    this.uvScrollVel = v2();
    this.sprite = 0;
    this.timeOfLastSpriteSet = 0;
    this.visible = false;
    this.stopped = false;
    this.usePosOffset = false;
    this.blendMode = 0;
    this.anchor = 0;
    this.flip = 0;
    this.zWriteDisabled = 0;
    this.renderType = 0;
    this.flag15 = 0;
    this.updateRotation = false;
    this.updateScale = false;
    this.intVar = [0, 0, 0, 0];
    this.pendingInterrupt = 0;
    this.interruptReturnTime = 0;
    this.interruptReturnPc = -1;
    this.floatVar = [0, 0, 0, 0];
    this.counterVar = [0, 0];
    this.interpCurrentTimers.fill(0);
    this.interpEndTimers.fill(0);
    this.interpModes.fill(0);
    this.argScratch.clear();
  }

  /**
   * Advance one frame. Returns true once the script is over, mirroring the
   * `ZunBool` that `ExecuteScript` hands its callers.
   */
  step(framerateMultiplier = 1): boolean {
    if (this.finished) return true;
    // `:208-211` a pending interrupt is serviced even when the base timeline is
    // parked on `Stop`, which is the whole point of the mechanism.
    if (this.stopped && this.pendingInterrupt === 0) {
      this.advanceTail(framerateMultiplier);
      return false;
    }
    this.execute();
    this.advanceTail(framerateMultiplier);
    this.timeInScript++;
    return this.finished;
  }

  /**
   * `AnmVm::SetInterrupt` (`AnmManager.hpp:309-312`): ask the running script to
   * jump to its `InterruptLabel` with this id. A label the base timeline walks
   * through normally stays inert - `InterruptLabel` has no case in the retail
   * dispatch switch, so only `pendingInterrupt` ever reads it.
   */
  setInterrupt(code: number): void {
    this.pendingInterrupt = code;
  }

  /**
   * `AnmManager.cpp:392-424`. Scan the script from the top for the
   * `InterruptLabel` carrying `pendingInterrupt`, remember where the base
   * timeline was interrupted, and restart the clock at the instruction after
   * the label. A script with neither a matching label nor the `-1` catch-all
   * stays parked, which is what `goto stop` means upstream.
   */
  private handleInterrupt(): boolean {
    const script = this.script;
    if (!script) return false;
    const wanted = this.pendingInterrupt;
    this.pendingInterrupt = 0;
    let match = -1;
    let fallback = -1;
    for (let pc = 0; pc < script.length;) {
      const head = script[pc];
      const opcode = low16(head);
      if (opcode === ANM_OPCODE.END_OF_SCRIPT || opcode === ANM_OPCODE.DELETE) break;
      if (opcode === ANM_OPCODE.INTERRUPT_LABEL) {
        const label = script[pc + 2] ?? 0;
        if (label === wanted) {
          match = pc;
          break;
        }
        if (label === -1 && fallback < 0) fallback = pc;
      }
      pc += Math.max(2, high16(head) / 4);
    }
    const target = match >= 0 ? match : fallback;
    if (target < 0) {
      this.timeInScript--;
      return false;
    }
    this.interruptReturnTime = this.timeInScript;
    this.interruptReturnPc = this.pc;
    const next = target + Math.max(2, high16(script[target]) / 4);
    this.pc = next;
    this.timeInScript = low16(script[next + 1] ?? 0);
    this.visible = true;
    this.stopped = false;
    return true;
  }

  /** Run every instruction whose time has come. */
  private execute(): void {
    const script = this.script;
    if (!script) return;
    if (this.pendingInterrupt !== 0 && !this.handleInterrupt()) return;
    let guard = 0;
    while (this.pc >= 0 && this.pc * 4 < script.length * 4) {
      if (++guard > 4000) {
        // A script that never advances would hang the frame. Retail cannot reach
        // this because every loop goes through a Wait; bail out instead of locking.
        this.finished = true;
        this.pc = -1;
        return;
      }
      const base = this.pc;
      const opcode = low16(script[base]);
      const sizeBytes = high16(script[base]);
      const time = low16(script[base + 1]);
      const varMask = high16(script[base + 1]);
      if (time > this.timeInScript) return;
      const sizeWords = Math.max(2, sizeBytes / 4);
      // Arguments live in the instruction, but a `*Set` whose target is not a named
      // register writes back into the same slot, so every read goes through `argWord`.
      // Float arguments are f32s: a variable reference such as `F0` is stored as the
      // bits of `10004.0`, so reading the raw word would hand back 1176260608 instead.
      const arg = (n: number): number => this.argWord(base, n);
      const argF = (n: number): number => this.argFloat(base, n);
      const intVarOf = (n: number): number =>
        varMask & (1 << n) ? this.intVarById(arg(n)) : this.argInt(base, n);
      const floatVarOf = (n: number): number =>
        varMask & (1 << n) ? this.floatVarById(argF(n)) : this.argFloat(base, n);
      /** Where a `*Set` writes: the named register, else the instruction's own slot. */
      const intTarget = (n: number): ((value: number) => void) | null => {
        const slot = (value: number): void => {
          this.argScratch.set(base + 2 + n, value | 0);
        };
        return varMask & (1 << n) ? (this.setIntById(arg(n)) ?? slot) : slot;
      };
      const floatTarget = (n: number): ((value: number) => void) | null => {
        const slot = (value: number): void => {
          this.argScratch.set(base + 2 + n, i32Of(f32(value)));
        };
        return varMask & (1 << n) ? (this.setFloatById(argF(n)) ?? slot) : slot;
      };
      const jump = (offsetWord: number, atTime: number): void => {
        this.timeInScript = atTime;
        this.pc = offsetWord;
      };

      switch (opcode) {
        case ANM_OPCODE.END_OF_SCRIPT:
        case ANM_OPCODE.DELETE:
          this.visible = false;
          this.deleted = true;
          this.finished = true;
          this.pc = -1;
          return;
        case ANM_OPCODE.STATIC:
          this.finished = true;
          this.pc = -1;
          return;
        case ANM_OPCODE.SPRITE:
          this.visible = true;
          this.sprite = intVarOf(0);
          this.timeOfLastSpriteSet = this.timeInScript;
          break;
        case ANM_OPCODE.SCALE:
          this.scale.x = floatVarOf(0);
          this.scale.y = floatVarOf(1);
          this.updateScale = true;
          break;
        case ANM_OPCODE.ALPHA:
          this.color1.a = intVarOf(0);
          break;
        case ANM_OPCODE.COLOR:
          this.color1.r = intVarOf(0);
          this.color1.g = intVarOf(1);
          this.color1.b = intVarOf(2);
          break;
        case ANM_OPCODE.ALPHA2:
          this.color2.a = intVarOf(0);
          break;
        case ANM_OPCODE.COLOR2:
          this.color2.r = intVarOf(0);
          this.color2.g = intVarOf(1);
          this.color2.b = intVarOf(2);
          break;
        case ANM_OPCODE.JMP:
          jump(arg(0) / 4, arg(1));
          continue;
        case ANM_OPCODE.JMP_DEC: {
          const dec = intTarget(0);
          const next = intVarOf(0) - 1;
          if (dec) dec(next);
          if (next > 0) {
            this.setIntByIdRaw(arg(0), next);
            jump(arg(1) / 4, arg(2));
            continue;
          }
          break;
        }
        case ANM_OPCODE.FLIP_X:
          this.flip ^= 1 << 0;
          this.scale.x *= -1;
          this.updateScale = true;
          break;
        case ANM_OPCODE.FLIP_Y:
          this.flip ^= 1 << 1;
          this.scale.y *= -1;
          this.updateScale = true;
          break;
        case ANM_OPCODE.POS_MODE:
          this.usePosOffset = arg(0) !== 0;
          break;
        case ANM_OPCODE.ROTATE:
          this.rotation.x = floatVarOf(0);
          this.rotation.y = floatVarOf(1);
          this.rotation.z = floatVarOf(2);
          this.updateRotation = true;
          break;
        case ANM_OPCODE.ANGULAR_VELOCITY:
          this.angleVel.x = floatVarOf(0);
          this.angleVel.y = floatVarOf(1);
          this.angleVel.z = floatVarOf(2);
          this.updateRotation = true;
          break;
        case ANM_OPCODE.SCALE_GROWTH:
          this.scaleGrowth.x = floatVarOf(0);
          this.scaleGrowth.y = floatVarOf(1);
          break;
        case ANM_OPCODE.SCALE_TIME_LINEAR:
          this.interpCurrentTimers[SCALE] = 0;
          this.interpEndTimers[SCALE] = intVarOf(2);
          this.interpModes[SCALE] = ANM_INTERP_MODE.LINEAR;
          this.scaleInitial = { ...this.scale };
          this.scaleFinal.x = floatVarOf(0);
          this.scaleFinal.y = floatVarOf(1);
          break;
        case ANM_OPCODE.ALPHA_TIME_LINEAR:
          this.color1Initial.a = this.color1.a;
          this.color1Final.a = arg(0);
          this.interpCurrentTimers[ALPHA1] = 0;
          this.interpEndTimers[ALPHA1] = intVarOf(1);
          this.interpModes[ALPHA1] = ANM_INTERP_MODE.LINEAR;
          break;
        case ANM_OPCODE.ADDITIVE_BLEND_MODE:
          // Retail coerces this op to a bool (`AnmManager.cpp:326-327`), so the only
          // values a VM can hold are 0 (normal) and 1 (additive).
          this.blendMode = arg(0) !== 0 ? 1 : 0;
          break;
        case ANM_OPCODE.BLEND_MODE:
          this.blendMode = arg(0);
          break;
        case ANM_OPCODE.POS: {
          const target = this.usePosOffset ? this.pos2 : this.pos;
          target.x = floatVarOf(0);
          target.y = floatVarOf(1);
          target.z = floatVarOf(2);
          break;
        }
        case ANM_OPCODE.POS_TIME_DECEL2:
          this.interpModes[POS] = ANM_INTERP_MODE.EASE_OUT_QUARTIC;
          this.posTime(floatVarOf, intVarOf);
          break;
        case ANM_OPCODE.POS_TIME_DECEL:
          this.interpModes[POS] = ANM_INTERP_MODE.EASE_OUT;
          this.posTime(floatVarOf, intVarOf);
          break;
        case ANM_OPCODE.POS_TIME_LINEAR:
          this.interpModes[POS] = ANM_INTERP_MODE.LINEAR;
          this.posTime(floatVarOf, intVarOf);
          break;
        case ANM_OPCODE.POS_TIME:
          this.interpCurrentTimers[POS] = 0;
          this.interpEndTimers[POS] = intVarOf(0);
          this.interpModes[POS] = arg(1);
          this.posInitial = { ...(this.usePosOffset ? this.pos2 : this.pos) };
          this.posFinal.x = floatVarOf(2);
          this.posFinal.y = floatVarOf(3);
          this.posFinal.z = floatVarOf(4);
          break;
        case ANM_OPCODE.COLOR_TIME:
          this.interpCurrentTimers[RGB1] = 0;
          this.interpEndTimers[RGB1] = intVarOf(0);
          this.interpModes[RGB1] = arg(1);
          this.color1Initial.r = this.color1.r;
          this.color1Initial.g = this.color1.g;
          this.color1Initial.b = this.color1.b;
          this.color1Final.r = intVarOf(2);
          this.color1Final.g = intVarOf(3);
          this.color1Final.b = intVarOf(4);
          break;
        case ANM_OPCODE.ALPHA_TIME:
          this.interpCurrentTimers[ALPHA1] = 0;
          this.interpEndTimers[ALPHA1] = intVarOf(0);
          this.interpModes[ALPHA1] = arg(1);
          this.color1Initial.a = this.color1.a;
          this.color1Final.a = intVarOf(2);
          break;
        case ANM_OPCODE.COLOR2_TIME:
          this.interpCurrentTimers[RGB2] = 0;
          this.interpEndTimers[RGB2] = intVarOf(0);
          this.interpModes[RGB2] = arg(1);
          this.color2Initial.r = this.color2.r;
          this.color2Initial.g = this.color2.g;
          this.color2Initial.b = this.color2.b;
          this.color2Final.r = intVarOf(2);
          this.color2Final.g = intVarOf(3);
          this.color2Final.b = intVarOf(4);
          break;
        case ANM_OPCODE.ALPHA2_TIME:
          this.interpCurrentTimers[ALPHA2] = 0;
          this.interpEndTimers[ALPHA2] = intVarOf(0);
          this.interpModes[ALPHA2] = arg(1);
          this.color2Initial.a = this.color2.a;
          this.color2Final.a = intVarOf(2);
          break;
        case ANM_OPCODE.ROTATE_TIME:
          this.interpCurrentTimers[ROTATE] = 0;
          this.interpEndTimers[ROTATE] = intVarOf(0);
          this.interpModes[ROTATE] = arg(1);
          this.rotateInitial = { ...this.rotation };
          this.rotateFinal.x = floatVarOf(2);
          this.rotateFinal.y = floatVarOf(3);
          this.rotateFinal.z = floatVarOf(4);
          this.updateRotation = true;
          break;
        case ANM_OPCODE.SCALE_TIME:
          this.interpCurrentTimers[SCALE] = 0;
          this.interpEndTimers[SCALE] = intVarOf(0);
          this.interpModes[SCALE] = arg(1);
          this.scaleInitial = { ...this.scale };
          this.scaleFinal.x = floatVarOf(2);
          this.scaleFinal.y = floatVarOf(3);
          this.updateScale = true;
          break;
        case ANM_OPCODE.VISIBLE:
          this.visible = arg(0) !== 0;
          break;
        case ANM_OPCODE.ANCHOR_TOP_LEFT:
          this.anchor = 3;
          break;
        case ANM_OPCODE.INS25:
          this.renderType = arg(0);
          break;
        case ANM_OPCODE.INS31:
          this.flag15 = arg(0);
          break;
        case ANM_OPCODE.Z_WRITE_DISABLE:
          this.zWriteDisabled = arg(0);
          break;
        case ANM_OPCODE.ADD_U:
          this.uvScrollPos.x = wrapUnit(this.uvScrollPos.x + floatVarOf(0));
          break;
        case ANM_OPCODE.ADD_V:
          this.uvScrollPos.y = wrapUnit(this.uvScrollPos.y + floatVarOf(0));
          break;
        case ANM_OPCODE.U_SCROLL:
          this.uvScrollVel.x = floatVarOf(0);
          break;
        case ANM_OPCODE.V_SCROLL:
          this.uvScrollVel.y = floatVarOf(0);
          break;
        case ANM_OPCODE.WAIT: {
          if (this.waitTimer === 0) {
            this.waitTimer = intVarOf(0);
          } else {
            this.waitTimer--;
          }
          if (this.waitTimer <= 0) {
            this.waitTimer = 0;
            break;
          }
          // Rewind the script clock so the same instruction is re-read next frame.
          this.timeInScript--;
          this.pc = base;
          return;
        }
        // `:383-390` `StopHide` is `Stop` with the sprite put away first, and
        // `Stop` only parks the VM while no interrupt is waiting; with one
        // pending it falls straight into the interrupt handler.
        case ANM_OPCODE.STOP_HIDE:
        case ANM_OPCODE.STOP:
          if (opcode === ANM_OPCODE.STOP_HIDE) this.visible = false;
          if (this.pendingInterrupt === 0) {
            this.stopped = true;
            this.pc = base;
            return;
          }
          if (!this.handleInterrupt()) {
            this.pc = base;
            return;
          }
          continue;
        case ANM_OPCODE.RETURN_FROM_INTERRUPT:
          // `:426-429` hand the clock back to the base timeline and re-read the
          // instruction that was interrupted, which parks us on its `Stop`.
          this.timeInScript = this.interruptReturnTime;
          this.pc = this.interruptReturnPc;
          continue;
        case ANM_OPCODE.I_SET: {
          const t = intTarget(0);
          if (t) t(intVarOf(1));
          break;
        }
        case ANM_OPCODE.F_SET: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(1));
          break;
        }
        case ANM_OPCODE.I_SET_ADD: {
          const t = intTarget(0);
          if (t) t(intVarOf(1) + intVarOf(2));
          break;
        }
        case ANM_OPCODE.F_SET_ADD: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(1) + floatVarOf(2));
          break;
        }
        case ANM_OPCODE.I_SET_SUB: {
          const t = intTarget(0);
          if (t) t(intVarOf(1) - intVarOf(2));
          break;
        }
        case ANM_OPCODE.F_SET_SUB: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(1) - floatVarOf(2));
          break;
        }
        case ANM_OPCODE.I_SET_MUL: {
          const t = intTarget(0);
          if (t) t(intVarOf(1) * intVarOf(2));
          break;
        }
        case ANM_OPCODE.F_SET_MUL: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(1) * floatVarOf(2));
          break;
        }
        case ANM_OPCODE.I_SET_DIV: {
          const t = intTarget(0);
          if (t) t(Math.trunc(intVarOf(1) / intVarOf(2)));
          break;
        }
        case ANM_OPCODE.F_SET_DIV: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(1) / floatVarOf(2));
          break;
        }
        case ANM_OPCODE.I_SET_MOD: {
          const t = intTarget(0);
          if (t) t(intVarOf(1) % intVarOf(2));
          break;
        }
        case ANM_OPCODE.F_SET_MOD: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(1) % floatVarOf(2));
          break;
        }
        case ANM_OPCODE.I_ADD: {
          const t = intTarget(0);
          if (t) t(intVarOf(0) + intVarOf(1));
          break;
        }
        case ANM_OPCODE.F_ADD: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(0) + floatVarOf(1));
          break;
        }
        case ANM_OPCODE.I_SUB: {
          const t = intTarget(0);
          if (t) t(intVarOf(0) - intVarOf(1));
          break;
        }
        case ANM_OPCODE.F_SUB: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(0) - floatVarOf(1));
          break;
        }
        case ANM_OPCODE.I_MUL: {
          const t = intTarget(0);
          if (t) t(intVarOf(0) * intVarOf(1));
          break;
        }
        case ANM_OPCODE.F_MUL: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(0) * floatVarOf(1));
          break;
        }
        case ANM_OPCODE.I_DIV: {
          const t = intTarget(0);
          if (t) t(Math.trunc(intVarOf(0) / intVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_DIV: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(0) / floatVarOf(1));
          break;
        }
        case ANM_OPCODE.I_MOD: {
          const t = intTarget(0);
          if (t) t(intVarOf(0) % intVarOf(1));
          break;
        }
        case ANM_OPCODE.F_MOD: {
          const t = floatTarget(0);
          if (t) t(floatVarOf(0) % floatVarOf(1));
          break;
        }
        case ANM_OPCODE.I_SET_RAND: {
          const t = intTarget(0);
          if (t) t(this.rng.randomU32InRange(intVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_SET_RAND: {
          const t = floatTarget(0);
          if (t) t(this.rng.randomF32InRange(floatVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_SIN: {
          const t = floatTarget(0);
          if (t) t(Math.sin(floatVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_COS: {
          const t = floatTarget(0);
          if (t) t(Math.cos(floatVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_TAN: {
          const t = floatTarget(0);
          if (t) t(Math.tan(floatVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_ACOS: {
          const t = floatTarget(0);
          if (t) t(Math.acos(floatVarOf(1)));
          break;
        }
        case ANM_OPCODE.F_ATAN: {
          const t = floatTarget(0);
          if (t) t(Math.atan(floatVarOf(1)));
          break;
        }
        case ANM_OPCODE.NORMALIZE_ANGLE: {
          const t = floatTarget(0);
          if (t) t(normalizeAngle(floatVarOf(0)));
          break;
        }
        case ANM_OPCODE.I_JMP_EQ:
          if (intVarOf(0) === intVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.F_JMP_EQ:
          if (floatVarOf(0) === floatVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.I_JMP_NEQ:
          if (intVarOf(0) !== intVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.F_JMP_NEQ:
          if (floatVarOf(0) !== floatVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.I_JMP_LESS:
          if (intVarOf(0) < intVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.F_JMP_LESS:
          if (floatVarOf(0) < floatVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.I_JMP_LESS_OR_EQ:
          if (intVarOf(0) <= intVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.F_JMP_LESS_OR_EQ:
          if (floatVarOf(0) <= floatVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.I_JMP_GREATER:
          if (intVarOf(0) > intVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.F_JMP_GREATER:
          if (floatVarOf(0) > floatVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.I_JMP_GREATER_OR_EQ:
          if (intVarOf(0) >= intVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.F_JMP_GREATER_OR_EQ:
          if (floatVarOf(0) >= floatVarOf(1)) {
            jump(arg(2) / 4, arg(3));
            continue;
          }
          break;
        case ANM_OPCODE.NOP:
        case ANM_OPCODE.INTERRUPT_LABEL:
        default:
          break;
      }

      if (sizeWords < 2) return;
      this.pc = base + sizeWords;
    }
    // Ran off the end of the instruction array: the script is over.
    this.finished = true;
    this.pc = -1;
  }

  /** `PosTimeLinear/Decel/Decel2` all share this body. */
  private posTime(floatVarOf: (n: number) => number, intVarOf: (n: number) => number): void {
    this.posInitial = { ...(this.usePosOffset ? this.pos2 : this.pos) };
    this.posFinal.x = floatVarOf(0);
    this.posFinal.y = floatVarOf(1);
    this.posFinal.z = floatVarOf(2);
    this.interpEndTimers[POS] = intVarOf(3);
    this.interpCurrentTimers[POS] = 0;
  }

  /** The per-frame easing pass that runs after the script, exactly as the original orders it. */
  private advanceTail(framerateMultiplier: number): void {
    for (const axis of ['x', 'y', 'z'] as const) {
      const vel = this.angleVel[axis];
      if (vel !== 0) {
        this.rotation[axis] = addNormalizeAngle(this.rotation[axis], framerateMultiplier * vel);
        this.updateRotation = true;
      }
    }

    for (let channel = 0; channel < LAST; channel++) {
      const end = this.interpEndTimers[channel];
      if (end <= 0) continue;
      this.interpCurrentTimers[channel]++;
      let done = false;
      let t = this.interpCurrentTimers[channel] / end;
      if (this.interpCurrentTimers[channel] >= end) {
        t = 1;
        this.interpEndTimers[channel] = 0;
        done = true;
      }
      const eased = ease(t, this.interpModes[channel]);
      this.applyInterp(channel, eased);
      if (done) this.interpCurrentTimers[channel] = 0;
    }

    if (this.scaleGrowth.y !== 0) {
      this.scale.y += framerateMultiplier * this.scaleGrowth.y;
      this.updateScale = true;
    }
    if (this.scaleGrowth.x !== 0) {
      this.scale.x += framerateMultiplier * this.scaleGrowth.x;
      this.updateScale = true;
      this.updateRotation = true;
    }

    this.uvScrollPos.x = wrapUnit(this.uvScrollPos.x + this.uvScrollVel.x);
    this.uvScrollPos.y = wrapUnit(this.uvScrollPos.y + this.uvScrollVel.y);
  }

  private applyInterp(channel: number, t: number): void {
    switch (channel) {
      case POS: {
        const target = this.usePosOffset ? this.pos2 : this.pos;
        target.x = t * (this.posFinal.x - this.posInitial.x) + this.posInitial.x;
        target.y = t * (this.posFinal.y - this.posInitial.y) + this.posInitial.y;
        target.z = t * (this.posFinal.z - this.posInitial.z) + this.posInitial.z;
        break;
      }
      case RGB1:
        this.color1.r = t * (this.color1Final.r - this.color1Initial.r) + this.color1Initial.r;
        this.color1.g = t * (this.color1Final.g - this.color1Initial.g) + this.color1Initial.g;
        this.color1.b = t * (this.color1Final.b - this.color1Initial.b) + this.color1Initial.b;
        break;
      case ALPHA1:
        this.color1.a = t * (this.color1Final.a - this.color1Initial.a) + this.color1Initial.a;
        break;
      case RGB2:
        this.color2.r = t * (this.color2Final.r - this.color2Initial.r) + this.color2Initial.r;
        this.color2.g = t * (this.color2Final.g - this.color2Initial.g) + this.color2Initial.g;
        this.color2.b = t * (this.color2Final.b - this.color2Initial.b) + this.color2Initial.b;
        break;
      case ALPHA2:
        this.color2.a = t * (this.color2Final.a - this.color2Initial.a) + this.color2Initial.a;
        break;
      case ROTATE:
        this.rotation.x = addNormalizeAngle(
          (this.rotateFinal.x - this.rotateInitial.x) * t,
          this.rotateInitial.x,
        );
        this.rotation.y = addNormalizeAngle(
          (this.rotateFinal.y - this.rotateInitial.y) * t,
          this.rotateInitial.y,
        );
        this.rotation.z = addNormalizeAngle(
          (this.rotateFinal.z - this.rotateInitial.z) * t,
          this.rotateInitial.z,
        );
        this.updateRotation = true;
        break;
      case SCALE:
        this.scale.x = t * (this.scaleFinal.x - this.scaleInitial.x) + this.scaleInitial.x;
        this.scale.y = t * (this.scaleFinal.y - this.scaleInitial.y) + this.scaleInitial.y;
        this.updateScale = true;
        break;
    }
  }

  /** The position the host should draw at, folding in the offset channel. */
  get worldPos(): AnmVec3 {
    return this.usePosOffset
      ? { x: this.pos.x + this.pos2.x, y: this.pos.y + this.pos2.y, z: this.pos.z }
      : this.pos;
  }

  /** Raw 32-bit view of an argument, honouring this VM's write-back scratch. */
  private argWord(base: number, n: number): number {
    const key = base + 2 + n;
    const scratch = this.argScratch.get(key);
    return scratch === undefined ? (this.script?.[key] ?? 0) : scratch;
  }

  private argInt(base: number, n: number): number {
    return this.argWord(base, n) | 0;
  }

  private argFloat(base: number, n: number): number {
    return f32Of(this.argWord(base, n));
  }

  private intVarById(id: number): number {
    switch (id) {
      case ANM_VARIABLE.I0:
        return this.intVar[0];
      case ANM_VARIABLE.I1:
        return this.intVar[1];
      case ANM_VARIABLE.I2:
        return this.intVar[2];
      case ANM_VARIABLE.I3:
        return this.intVar[3];
      case ANM_VARIABLE.F0:
        return this.floatVar[0];
      case ANM_VARIABLE.F1:
        return this.floatVar[1];
      case ANM_VARIABLE.F2:
        return this.floatVar[2];
      case ANM_VARIABLE.F3:
        return this.floatVar[3];
      case ANM_VARIABLE.IC0:
        return this.counterVar[0];
      case ANM_VARIABLE.IC1:
        return this.counterVar[1];
      default:
        return id;
    }
  }

  private floatVarById(id: number): number {
    switch (id) {
      case ANM_VARIABLE.I0:
        return this.intVar[0];
      case ANM_VARIABLE.I1:
        return this.intVar[1];
      case ANM_VARIABLE.I2:
        return this.intVar[2];
      case ANM_VARIABLE.I3:
        return this.intVar[3];
      case ANM_VARIABLE.F0:
        return this.floatVar[0];
      case ANM_VARIABLE.F1:
        return this.floatVar[1];
      case ANM_VARIABLE.F2:
        return this.floatVar[2];
      case ANM_VARIABLE.F3:
        return this.floatVar[3];
      case ANM_VARIABLE.IC0:
        return this.counterVar[0];
      case ANM_VARIABLE.IC1:
        return this.counterVar[1];
      default:
        return id;
    }
  }

  private setIntById(id: number): ((value: number) => void) | null {
    switch (id) {
      case ANM_VARIABLE.I0:
        return (v) => {
          this.intVar[0] = v | 0;
        };
      case ANM_VARIABLE.I1:
        return (v) => {
          this.intVar[1] = v | 0;
        };
      case ANM_VARIABLE.I2:
        return (v) => {
          this.intVar[2] = v | 0;
        };
      case ANM_VARIABLE.I3:
        return (v) => {
          this.intVar[3] = v | 0;
        };
      case ANM_VARIABLE.F0:
        return (v) => {
          this.floatVar[0] = f32(v);
        };
      case ANM_VARIABLE.F1:
        return (v) => {
          this.floatVar[1] = f32(v);
        };
      case ANM_VARIABLE.F2:
        return (v) => {
          this.floatVar[2] = f32(v);
        };
      case ANM_VARIABLE.F3:
        return (v) => {
          this.floatVar[3] = f32(v);
        };
      case ANM_VARIABLE.IC0:
        return (v) => {
          this.counterVar[0] = v | 0;
        };
      case ANM_VARIABLE.IC1:
        return (v) => {
          this.counterVar[1] = v | 0;
        };
      default:
        return null;
    }
  }

  private setFloatById(id: number): ((value: number) => void) | null {
    switch (id) {
      case ANM_VARIABLE.F0:
        return (v) => {
          this.floatVar[0] = f32(v);
        };
      case ANM_VARIABLE.F1:
        return (v) => {
          this.floatVar[1] = f32(v);
        };
      case ANM_VARIABLE.F2:
        return (v) => {
          this.floatVar[2] = f32(v);
        };
      case ANM_VARIABLE.F3:
        return (v) => {
          this.floatVar[3] = f32(v);
        };
      case ANM_VARIABLE.I0:
        return (v) => {
          this.intVar[0] = v | 0;
        };
      case ANM_VARIABLE.I1:
        return (v) => {
          this.intVar[1] = v | 0;
        };
      case ANM_VARIABLE.I2:
        return (v) => {
          this.intVar[2] = v | 0;
        };
      case ANM_VARIABLE.I3:
        return (v) => {
          this.intVar[3] = v | 0;
        };
      case ANM_VARIABLE.IC0:
        return (v) => {
          this.counterVar[0] = v | 0;
        };
      case ANM_VARIABLE.IC1:
        return (v) => {
          this.counterVar[1] = v | 0;
        };
      default:
        return null;
    }
  }

  /** `JmpDec` needs the decrement to land even when the target is an inline literal. */
  private setIntByIdRaw(id: number, value: number): void {
    const set = this.setIntById(id);
    if (set) set(value);
  }
}

/** Keep a UV offset inside one texture page, the way the original wraps it. */
const wrapUnit = (value: number): number => {
  let v = value;
  if (v >= 1) v -= 1;
  else if (v < 0) v += 1;
  return v;
};

/** Round-trip a number through f32, so integer/float aliasing matches the original. */
const F32_BOX = new Float32Array(1);
const I32_BOX = new Int32Array(F32_BOX.buffer);
const f32 = (value: number): number => {
  F32_BOX[0] = value;
  return F32_BOX[0];
};
const f32Of = (bits: number): number => {
  I32_BOX[0] = bits | 0;
  return F32_BOX[0];
};
const i32Of = (value: number): number => {
  F32_BOX[0] = value;
  return I32_BOX[0];
};

/** The seven easing curves `AnmInterpMode` picks between. */
const ease = (t: number, mode: number): number => {
  switch (mode) {
    case ANM_INTERP_MODE.EASE_IN:
      return t * t;
    case ANM_INTERP_MODE.EASE_IN_CUBIC:
      return t * t * t;
    case ANM_INTERP_MODE.EASE_IN_QUARTIC: {
      const s = t * t;
      return s * s;
    }
    case ANM_INTERP_MODE.EASE_OUT: {
      const s = 1 - t;
      return 1 - s * s;
    }
    case ANM_INTERP_MODE.EASE_OUT_CUBIC: {
      const s = 1 - t;
      return 1 - s * s * s;
    }
    case ANM_INTERP_MODE.EASE_OUT_QUARTIC: {
      const s = 1 - t;
      const q = s * s;
      return 1 - q * q;
    }
    default:
      return t;
  }
};

/** Decode a base64 script blob out of the extracted asset pack into VM words. */
export const anmScriptFromBase64 = (b64: string): Int32Array => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const words = new Int32Array(Math.ceil(bytes.length / 4));
  new Uint8Array(words.buffer).set(bytes);
  return words;
};

export { ANM_HEADER_BYTES };
