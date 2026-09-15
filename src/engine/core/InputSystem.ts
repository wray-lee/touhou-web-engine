import { Vector2, createVector2 } from './Vector2';
import { MOVE_BITS } from './Movement';

export type InputAction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'shoot'
  | 'bomb'
  | 'slow'
  | 'pause'
  // Retail `TH_BUTTON_SKIP` (`Global.hpp:107`), bound to VK_CONTROL
  // (`Global.cpp:742`). The message box consumes it to fast-forward dialogue
  // waits (`Gui.cpp:373-379`, `:732`, `:917-920`).
  | 'skip'
  | 'debug'
  | 'debug-collision';

export interface InputSnapshot {
  actions: InputAction[];
  pointerPos: Vector2;
  isDragging: boolean;
}

export interface KeyBindings {
  [action: string]: string[];
}

export const DEFAULT_KEY_BINDINGS: Record<InputAction, string[]> = {
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  shoot: ['KeyZ', 'Space'],
  bomb: ['KeyX'],
  slow: ['ShiftLeft', 'ShiftRight'],
  pause: ['Escape'],
  skip: ['ControlLeft', 'ControlRight'],
  debug: ['F12', 'KeyP'],
  /** 碰撞网格可视化开关（票据 04 的 "D" 与 WASD 右移冲突，改用 G） */
  'debug-collision': ['KeyG'],
};

/**
 * Gamepad mapping for one action, using the W3C standard gamepad layout:
 * buttons 0=A,1=B,2=X,3=Y,4..7=shoulders/triggers,9=Start,12..15=D-pad U/D/L/R;
 * axes 0=x(-left/+right), 1=y(-up/+down).
 */
export interface GamepadActionBinding {
  /** Standard button indices that trigger this action. */
  buttons?: number[];
  /** Axis triggers: fire when `axes[index]` exceeds `threshold` toward `direction`. */
  axes?: { index: number; direction: -1 | 1 }[];
  /** Axis magnitude needed to count as pressed (default 0.5). */
  threshold?: number;
}

/** Minimal structural view of a Gamepad so tests can feed fake states. */
export interface GamepadLike {
  buttons: readonly { pressed: boolean }[];
  axes: readonly number[];
}

export const DEFAULT_GAMEPAD_BINDINGS: Partial<Record<InputAction, GamepadActionBinding>> = {
  up: { axes: [{ index: 1, direction: -1 }], buttons: [12] },
  down: { axes: [{ index: 1, direction: 1 }], buttons: [13] },
  left: { axes: [{ index: 0, direction: -1 }], buttons: [14] },
  right: { axes: [{ index: 0, direction: 1 }], buttons: [15] },
  shoot: { buttons: [0] }, // A
  bomb: { buttons: [1, 2] }, // B / X
  slow: { buttons: [4, 6] }, // LB / LT
  pause: { buttons: [9] }, // Start
};

/** Frames a tap that fell between samples stays actionable (Touhou input buffer). */
const PRESS_BUFFER_FRAMES = 3;

export class InputSystem {
  private bindings: Record<InputAction, string[]>;
  private gamepadBindings: Partial<Record<InputAction, GamepadActionBinding>>;
  private gamepadProvider?: () => (GamepadLike | null | undefined)[];
  private rawKeysDown = new Set<string>();
  /** Codes pressed but never sampled as held (quick taps), expiring after PRESS_BUFFER_FRAMES. */
  private pressBuffer = new Map<string, number>();
  /** Actions whose buffered tap is being reported as a press this frame. */
  private bufferedPresses = new Set<InputAction>();
  private frame = 0;
  private currentFrameDown = new Set<InputAction>();
  private prevFrameDown = new Set<InputAction>();
  private boundKeyDownHandler?: (e: KeyboardEvent) => void;
  private boundKeyUpHandler?: (e: KeyboardEvent) => void;
  private boundPointerDownHandler?: (e: PointerEvent) => void;
  private boundPointerMoveHandler?: (e: PointerEvent) => void;
  private boundPointerUpHandler?: (e: PointerEvent) => void;
  private boundPointerEnterHandler?: (e: PointerEvent) => void;
  private boundPointerLeaveHandler?: (e: PointerEvent) => void;

  /** True while a touch/pointer is dragging the player ship. */
  public isDragging = false;
  /**
   * Opt-in mouse steering (US: 鼠标操作可通过选项开启). When enabled the ship
   * tracks the cursor without holding a button; when disabled only touch drag
   * steers, which is the default so desktop keyboard play is never hijacked.
   */
  public mouseControl = false;
  /** True while the cursor is over the game element (only meaningful with mouseControl). */
  public pointerInside = false;
  /** Pointer position in game coordinates (canvas-local, CSS-scale corrected). */
  public pointerPos: Vector2 = { x: 0, y: 0 };
  /** Element used to map screen pointer coords -> canvas coords. */
  private attachTarget?: HTMLElement;
  /** Game resolution — needed to undo the CSS scaling of the canvas (US#9). */
  private gameSize?: { width: number; height: number };

  constructor(
    bindings = DEFAULT_KEY_BINDINGS,
    gamepadBindings: Partial<Record<InputAction, GamepadActionBinding>> = DEFAULT_GAMEPAD_BINDINGS,
  ) {
    this.bindings = { ...bindings };
    this.gamepadBindings = gamepadBindings;
  }

  /**
   * Enable gamepad polling. By default reads `navigator.getGamepads()` each
   * `update()`; pass a provider to inject states (e.g. in tests).
   */
  enableGamepad(provider?: () => (GamepadLike | null | undefined)[]): void {
    this.gamepadProvider =
      provider ??
      (typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function'
        ? () => Array.from(navigator.getGamepads())
        : undefined);
  }

  /** Rebind a keyboard action at runtime (e.g. from a settings menu). */
  setKeyBinding(action: InputAction, codes: string[]): void {
    this.bindings[action] = [...codes];
  }

  /** Rebind a gamepad action at runtime. */
  setGamepadBinding(action: InputAction, binding: GamepadActionBinding | undefined): void {
    if (binding) this.gamepadBindings[action] = binding;
    else delete this.gamepadBindings[action];
  }

  /** Current keyboard bindings (deep copy) — for rendering a settings screen. */
  getBindings(): Record<InputAction, string[]> {
    const out = {} as Record<InputAction, string[]>;
    for (const [action, codes] of Object.entries(this.bindings) as [InputAction, string[]][]) {
      out[action] = [...codes];
    }
    return out;
  }

  /** Safe viewport reference (undefined outside browsers, e.g. Vitest). */
  private get viewport(): Window | undefined {
    return typeof window !== 'undefined' ? window : undefined;
  }

  /**
   * 绑定输入监听。
   * - 传 `HTMLElement`（推荐：游戏容器/canvas）：键盘监听在 window 上生效，
   *   pointer/touch 拖动以该元素为坐标基准并启用。
   * - 传 `window` 或省略：仅键盘监听（兼容旧 API `attach(window)`）。
   * - `gameSize`：游戏内部分辨率（默认 640×480）。canvas 被 CSS 缩放时，
   *   指针坐标会按 rect/gameSize 比例换算回游戏坐标（US#9）。
   */
  attach(target?: Window | HTMLElement, gameSize?: { width: number; height: number }): void {
    const viewport = this.viewport;
    this.gameSize = gameSize;
    // 仅 HTMLElement 作为触摸坐标基准；window/undefined 走键盘-only 模式
    if (target && typeof (target as HTMLElement).addEventListener === 'function' && target !== viewport) {
      this.attachTarget = target as HTMLElement;
    }

    // Keyboard listeners always go on the viewport so they work regardless of focus
    this.boundKeyDownHandler = (e: KeyboardEvent) => {
      this.rawKeysDown.add(e.code);
      // Buffer the press so a tap shorter than one frame is still detected.
      this.pressBuffer.set(e.code, this.frame);
    };
    this.boundKeyUpHandler = (e: KeyboardEvent) => {
      this.rawKeysDown.delete(e.code);
    };
    viewport?.addEventListener('keydown', this.boundKeyDownHandler as EventListener);
    viewport?.addEventListener('keyup', this.boundKeyUpHandler as EventListener);

    // Gamepads are polled in update() — no listeners needed.
    this.enableGamepad();

    // Touch / pointer drag — pointerdown on the game element, move/up on the
    // viewport so the drag continues even when the finger leaves the canvas.
    if (this.attachTarget) {
      this.boundPointerDownHandler = (e: PointerEvent) => {
        if (e.pointerType === 'touch' || e.button === 0) {
          this.pointerDown(e.clientX, e.clientY);
        }
      };
      this.boundPointerMoveHandler = (e: PointerEvent) => {
        this.pointerMove(e.clientX, e.clientY);
      };
      this.boundPointerUpHandler = () => {
        this.pointerUp();
      };
      this.boundPointerEnterHandler = (e: PointerEvent) => {
        if (this.mouseControl) {
          this.pointerInside = true;
          this.pointerMove(e.clientX, e.clientY);
        }
      };
      this.boundPointerLeaveHandler = () => {
        this.pointerInside = false;
      };
      this.attachTarget.addEventListener('pointerdown', this.boundPointerDownHandler as EventListener);
      this.attachTarget.addEventListener('pointerenter', this.boundPointerEnterHandler as EventListener);
      this.attachTarget.addEventListener('pointerleave', this.boundPointerLeaveHandler as EventListener);
      viewport?.addEventListener('pointermove', this.boundPointerMoveHandler as EventListener);
      viewport?.addEventListener('pointerup', this.boundPointerUpHandler as EventListener);
    }
  }

  /**
   * 解绑输入监听。参数保留仅为兼容旧 API `detach(window)`。
   */
  detach(_target?: Window | HTMLElement): void {
    const viewport = this.viewport;
    if (this.boundKeyDownHandler) {
      viewport?.removeEventListener('keydown', this.boundKeyDownHandler as EventListener);
    }
    if (this.boundKeyUpHandler) {
      viewport?.removeEventListener('keyup', this.boundKeyUpHandler as EventListener);
    }
    if (this.boundPointerDownHandler && this.attachTarget) {
      this.attachTarget.removeEventListener('pointerdown', this.boundPointerDownHandler as EventListener);
    }
    if (this.boundPointerMoveHandler) {
      viewport?.removeEventListener('pointermove', this.boundPointerMoveHandler as EventListener);
    }
    if (this.boundPointerUpHandler) {
      viewport?.removeEventListener('pointerup', this.boundPointerUpHandler as EventListener);
    }
    if (this.boundPointerEnterHandler && this.attachTarget) {
      this.attachTarget.removeEventListener('pointerenter', this.boundPointerEnterHandler as EventListener);
    }
    if (this.boundPointerLeaveHandler && this.attachTarget) {
      this.attachTarget.removeEventListener('pointerleave', this.boundPointerLeaveHandler as EventListener);
    }
    this.pointerInside = false;
    this.attachTarget = undefined;
  }

  /** Simulate a key press (sampled by the next update() call, like real keydown events). */
  simulateKeyDown(code: string): void {
    this.rawKeysDown.add(code);
    this.pressBuffer.set(code, this.frame);
  }

  simulateKeyUp(code: string): void {
    this.rawKeysDown.delete(code);
  }

  /** Begin a drag at the given viewport coordinates. */
  pointerDown(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.pointerMove(clientX, clientY);
  }

  /** Toggle cursor steering on/off (driven by the in-game options menu). */
  setMouseControl(enabled: boolean): void {
    this.mouseControl = enabled;
    if (!enabled) this.pointerInside = false;
  }

  pointerMove(clientX: number, clientY: number): void {
    if (!this.isDragging && !this.mouseControl) return;
    const target = this.attachTarget;
    if (target) {
      const rect = target.getBoundingClientRect();
      // The canvas is CSS-scaled (e.g. 100vw on mobile) — map back to game coords.
      const sx = this.gameSize && rect.width > 0 ? this.gameSize.width / rect.width : 1;
      const sy = this.gameSize && rect.height > 0 ? this.gameSize.height / rect.height : 1;
      this.pointerPos = {
        x: (clientX - rect.left) * sx,
        y: (clientY - rect.top) * sy,
      };
    } else {
      this.pointerPos = { x: clientX, y: clientY };
    }
  }

  pointerUp(): void {
    this.isDragging = false;
  }

  /** True when a pointer device (touch drag or opt-in mouse) is steering the ship. */
  get isSteering(): boolean {
    return this.isDragging || (this.mouseControl && this.pointerInside);
  }

  /** Current steering target in game coordinates, or null when no pointer is driving. */
  getPointerTarget(): Vector2 | null {
    return this.isSteering ? { ...this.pointerPos } : null;
  }

  private refreshCurrentActions(): void {
    this.currentFrameDown.clear();
    this.bufferedPresses.clear();
    for (const [action, codes] of Object.entries(this.bindings) as [InputAction, string[]][]) {
      if (codes.some((code) => this.rawKeysDown.has(code))) {
        this.currentFrameDown.add(action);
        // Held state supersedes any buffered tap for this action.
        for (const code of codes) this.pressBuffer.delete(code);
      } else if (codes.some((code) => this.pressBuffer.has(code))) {
        // Report the buffered tap once, then consume it.
        this.bufferedPresses.add(action);
        for (const code of codes) this.pressBuffer.delete(code);
      }
    }
    // Poll gamepads and merge — reuses the same edge-detection as keyboard.
    this.pollGamepad();
  }

  /**
   * Sample connected gamepads (via `navigator.getGamepads()` or an injected
   * provider) and merge pressed actions into the current frame state.
   * No-op when no provider is available (e.g. Node, or gamepad unsupported).
   */
  pollGamepad(): void {
    if (!this.gamepadProvider) return;
    for (const action of Object.keys(this.gamepadBindings) as InputAction[]) {
      if (this.isGamepadActionPressed(action)) {
        this.currentFrameDown.add(action);
      }
    }
  }

  private isGamepadActionPressed(action: InputAction): boolean {
    const binding = this.gamepadBindings[action];
    if (!binding) return false;
    const threshold = binding.threshold ?? 0.5;
    for (const pad of this.gamepadProvider!()) {
      if (!pad) continue;
      if (binding.buttons?.some((b) => pad.buttons[b]?.pressed)) return true;
      if (binding.axes?.some(({ index, direction }) => direction * (pad.axes[index] ?? 0) >= threshold)) {
        return true;
      }
    }
    return false;
  }

  update(): void {
    this.prevFrameDown = new Set(this.currentFrameDown);
    this.refreshCurrentActions();
    this.frame++;
    // Expire buffered taps older than the input-buffer window.
    for (const [code, pressedAt] of this.pressBuffer) {
      if (this.frame - pressedAt >= PRESS_BUFFER_FRAMES) this.pressBuffer.delete(code);
    }
  }

  isKeyDown(action: InputAction): boolean {
    return this.currentFrameDown.has(action);
  }

  /** Currently-held actions (keyboard or gamepad) — for real-time input display. */
  getActiveActions(): InputAction[] {
    return [...this.currentFrameDown];
  }

  getSnapshot(): InputSnapshot {
    return {
      actions: this.getActiveActions(),
      pointerPos: { ...this.pointerPos },
      isDragging: this.isDragging,
    };
  }

  applySnapshot(snapshot: InputSnapshot): void {
    this.prevFrameDown = new Set(this.currentFrameDown);
    this.currentFrameDown = new Set(snapshot.actions);
    this.pointerPos = { ...snapshot.pointerPos };
    this.isDragging = snapshot.isDragging;
    this.bufferedPresses.clear();
    this.frame++;
  }

  wasKeyPressed(action: InputAction): boolean {
    // A buffered tap (pressed & released between samples) counts as a press.
    if (this.bufferedPresses.has(action)) return true;
    return this.currentFrameDown.has(action) && !this.prevFrameDown.has(action);
  }

  wasKeyReleased(action: InputAction): boolean {
    return !this.currentFrameDown.has(action) && this.prevFrameDown.has(action);
  }

  getMovementVector(): Vector2 {
    let dx = 0;
    let dy = 0;

    if (this.isKeyDown('left')) dx -= 1;
    if (this.isKeyDown('right')) dx += 1;
    if (this.isKeyDown('up')) dy -= 1;
    if (this.isKeyDown('down')) dy += 1;

    if (dx !== 0 && dy !== 0) {
      const invLen = Math.SQRT1_2;
      return createVector2(dx * invLen, dy * invLen);
    }

    return createVector2(dx, dy);
  }

  /**
   * The four direction actions as the bit set `core/Movement` resolves.
   *
   * `getMovementVector` cancels opposite keys, which is the right answer for an
   * analogue stick and the wrong one for a keyboard: a player pinched against a
   * wall holds both horizontals, and a game that reads a grid wants a decision,
   * not a zero. This keeps the four keys visible.
   */
  get movementBits(): number {
    return (
      (this.isKeyDown('up') ? MOVE_BITS.up : 0) |
      (this.isKeyDown('down') ? MOVE_BITS.down : 0) |
      (this.isKeyDown('left') ? MOVE_BITS.left : 0) |
      (this.isKeyDown('right') ? MOVE_BITS.right : 0)
    );
  }
}
