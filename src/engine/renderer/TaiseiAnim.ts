/** One animation group as declared in a Taisei .ani file. */
export interface TaiseiAnimGroup {
  /** Texture indices to play, in order. */
  frames: number[];
  /** Game frames each texture stays on screen. */
  delay: number;
  /** Taisei marks mirrored groups with a leading `m`. */
  mirror: boolean;
}

/** Group name -> definition, straight from the .ani body. */
export type TaiseiAnim = Record<string, TaiseiAnimGroup>;

const STEADY = ['main', 'left', 'right'] as const;
export type SteadyGroup = (typeof STEADY)[number];

/**
 * The two stances a Touhou ship is drawn in.
 *
 * 永夜抄 gives every player bank two complete animation families in one ANM file:
 * scripts 0-4 are the free-flight stance and scripts 5-9 the focused one, and
 * `Player.cpp:696-703` / `760-767` switch between them by running script 5 on the
 * slow-key edge and script 0 on the release edge. The lean clips are duplicated per
 * family, so a bank needs a name namespace to hold both.
 */
export type AnimPose = 'normal' | 'slow';

/** Group-name prefix for each stance; the normal one keeps the bare names. */
const POSE_PREFIX: Record<AnimPose, string> = { normal: '', slow: 's:' };

/**
 * Frame player for vendored Taisei sprites.
 *
 * Taisei bakes the character's bank into the lean frames and mirrors them for the
 * other direction (`left = m d10 0 1 2 3`), so the on-screen character tips toward
 * the way it is travelling. This class replays those groups, including the short
 * non-looping transition clips (main2left / left2main) that aniplayer.c uses, so
 * the lean ramps in and out instead of snapping.
 */
export class TaiseiAnimPlayer {
  private group: string;
  private index = 0;
  private timer = 0;
  private loop = true;
  private steady: SteadyGroup = 'main';
  private pending: SteadyGroup | null = null;
  private transition: string | null = null;
  private frame = 0;
  private mirror = false;
  private pose: AnimPose = 'normal';

  constructor(
    private readonly anim: TaiseiAnim,
    start: string = 'main',
  ) {
    this.group = anim[start] ? start : 'main';
    this.loop = STEADY.includes(this.group as SteadyGroup);
    this.transition = this.loop ? null : this.group;
    const def = this.def(this.group);
    this.frame = def?.frames[0] ?? 0;
    this.mirror = def?.mirror ?? false;
  }

  /** Current texture frame index inside the group. */
  get frameIndex(): number {
    return this.frame;
  }

  /** True when the frame must be drawn horizontally flipped. */
  get flipped(): boolean {
    return this.mirror;
  }

  /** Name of the group currently playing. */
  get currentGroup(): string {
    return this.group;
  }

  /** True while a one-shot transition clip is running. */
  get isTransitioning(): boolean {
    return this.transition !== null;
  }

  /** Force a group, clearing any queued direction change. */
  setGroup(name: string): void {
    if (!this.def(name) || name === this.group) return;
    this.pending = null;
    this.play(name, STEADY.includes(name as SteadyGroup));
  }

  /**
   * Switch between the upright and the 低速 stance.
   *
   * Retail answers a focus press with `SetAndExecuteScriptIdx(vm, 5)` and a release
   * with `SetAndExecuteScriptIdx(vm, 0)` (`Player.cpp:696-703, 760-767`): the ship
   * jumps straight to the other stance's *upright* clip and keeps it until the
   * horizontal velocity changes again, because lean clips are only ever armed on a
   * velocity edge. That is why sliding sideways while pressing Shift starts upright.
   */
  setPose(pose: AnimPose): void {
    if (pose === this.pose) return;
    this.pose = pose;
    this.steady = 'main';
    this.pending = null;
    this.play('main', true);
  }

  /**
   * Aim at a horizontal velocity. Dead zone keeps an idle character on the
   * upright bob instead of flickering between lean frames.
   */
  setDirection(vx: number, deadZone = 0.08): void {
    const wanted: SteadyGroup = vx > deadZone ? 'right' : vx < -deadZone ? 'left' : 'main';
    if (wanted === this.steady) return;
    if (this.transition) this.pending = wanted;
    else this.startTransition(this.steady, wanted);
  }

  private startTransition(from: SteadyGroup, to: SteadyGroup): void {
    this.steady = to;
    this.pending = null;
    // Returning upright plays the bank's own lean-out clip (`left2main`); a
    // `main2main` group does not exist anywhere. A side-to-side change still has
    // to pass back through the upright pose first, so it uses the same clip.
    if (to === 'main') this.play(from + '2main', false);
    else if (from === 'main') this.play('main2' + to, false);
    else this.play(from + '2main', false);
  }

  private play(group: string, loop: boolean): void {
    const def = this.def(group);
    if (!def || !def.frames.length) {
      // This bank has no such clip (trimmed atlases, Remilia's single still).
      // Recover onto the steady pose the transition was aiming at rather than
      // always snapping upright, which is what made ships twitch while held sideways.
      this.recover(this.steady);
      return;
    }
    this.group = group;
    this.index = 0;
    this.timer = 0;
    this.loop = loop;
    this.transition = loop ? null : group;
    this.frame = def.frames[0];
    this.mirror = def.mirror;
  }

  /**
   * Park the player on a looping pose after a missing or degenerate clip.
   *
   * `wanted` keeps the visual facing the direction the ship is actually
   * travelling; without it a bank that lacks lean clips would flicker back to
   * upright on every frame that the missing group got selected.
   */
  private recover(wanted: SteadyGroup = 'main'): void {
    const group: SteadyGroup = this.def(wanted)?.frames.length ? wanted : 'main';
    this.group = group;
    this.steady = group;
    this.index = 0;
    this.timer = 0;
    this.loop = true;
    this.transition = null;
    this.pending = null;
    const def = this.def(group);
    this.frame = def?.frames[0] ?? 0;
    this.mirror = def?.mirror ?? false;
  }

  /** Advance by whole game frames (Taisei's animator is frame based, not time based). */
  update(dt = 1): void {
    const def = this.def(this.group);
    if (!def || def.frames.length === 0) {
      this.recover(this.steady);
      return;
    }
    this.frame = def.frames[Math.min(this.index, def.frames.length - 1)];
    this.mirror = def.mirror;
    if (def.frames.length < 2) {
      // A one-frame clip has nothing left to advance, so it is already over.
      // Leaving a transition parked on it freezes the sprite on that single
      // frame forever, and every later direction change just piles up in
      // `pending` behind it -- which is what reads as a stuck texture.
      if (this.transition) this.onTransitionEnd();
      return;
    }
    this.timer += dt;
    while (this.timer >= def.delay) {
      this.timer -= def.delay;
      this.index += 1;
      if (this.index >= def.frames.length) {
        if (this.loop) {
          this.index = 0;
        } else {
          this.index = def.frames.length - 1;
          this.onTransitionEnd();
          return;
        }
      }
      this.frame = def.frames[this.index];
      this.mirror = def.mirror;
    }
  }

  private onTransitionEnd(): void {
    const ended = this.transition;
    this.transition = null;
    if (this.pending && this.pending !== this.steady) this.steady = this.pending;
    this.pending = null;
    if (this.steady === 'main') {
      this.play('main', true);
      return;
    }
    // Arriving upright from a side switch still needs the lean-out clip.
    if (ended !== 'main2' + this.steady && this.def('main2' + this.steady)) {
      this.play('main2' + this.steady, false);
      return;
    }
    this.play(this.steady, true);
  }

  /**
   * Resolve a group name against the current stance.
   *
   * Banks that never authored a 低速 family fall back to the plain names, so the
   * vendored Taisei ships keep animating exactly as before.
   */
  private key(name: string): string {
    const prefix = POSE_PREFIX[this.pose];
    return prefix && this.anim[prefix + name] ? prefix + name : name;
  }

  /** Definition for a group name, honouring the current stance. */
  private def(name: string): TaiseiAnimGroup | undefined {
    return this.anim[this.key(name)];
  }
}
