import { Vector2, createVector2 } from './Vector2';

export type InputAction = 'up' | 'down' | 'left' | 'right' | 'shoot' | 'bomb' | 'slow' | 'pause' | 'debug';

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
  debug: ['F12', 'KeyP'],
};

export class InputSystem {
  private bindings: Record<InputAction, string[]>;
  private rawKeysDown = new Set<string>();
  private currentFrameDown = new Set<InputAction>();
  private prevFrameDown = new Set<InputAction>();
  private boundKeyDownHandler?: (e: KeyboardEvent) => void;
  private boundKeyUpHandler?: (e: KeyboardEvent) => void;
  private boundPointerDownHandler?: (e: PointerEvent) => void;
  private boundPointerMoveHandler?: (e: PointerEvent) => void;
  private boundPointerUpHandler?: (e: PointerEvent) => void;

  /** True while a touch/pointer is dragging the player ship. */
  public isDragging = false;
  /** Pointer position in canvas-local coordinates. */
  public pointerPos: Vector2 = { x: 0, y: 0 };
  /** Element used to map screen pointer coords -> canvas coords. */
  private attachTarget?: HTMLElement;

  constructor(bindings = DEFAULT_KEY_BINDINGS) {
    this.bindings = bindings;
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
   */
  attach(target?: Window | HTMLElement): void {
    const viewport = this.viewport;
    // 仅 HTMLElement 作为触摸坐标基准；window/undefined 走键盘-only 模式
    if (target && typeof (target as HTMLElement).addEventListener === 'function' && target !== viewport) {
      this.attachTarget = target as HTMLElement;
    }

    // Keyboard listeners always go on the viewport so they work regardless of focus
    this.boundKeyDownHandler = (e: KeyboardEvent) => {
      this.rawKeysDown.add(e.code);
    };
    this.boundKeyUpHandler = (e: KeyboardEvent) => {
      this.rawKeysDown.delete(e.code);
    };
    viewport?.addEventListener('keydown', this.boundKeyDownHandler as EventListener);
    viewport?.addEventListener('keyup', this.boundKeyUpHandler as EventListener);

    // Touch / pointer drag — pointerdown on the game element, move/up on the
    // viewport so the drag continues even when the finger leaves the canvas.
    if (viewport && typeof PointerEvent !== 'undefined' && this.attachTarget) {
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
      this.attachTarget.addEventListener('pointerdown', this.boundPointerDownHandler as EventListener);
      viewport.addEventListener('pointermove', this.boundPointerMoveHandler as EventListener);
      viewport.addEventListener('pointerup', this.boundPointerUpHandler as EventListener);
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
    this.attachTarget = undefined;
  }

  /** Simulate a key press (sampled by the next update() call, like real keydown events). */
  simulateKeyDown(code: string): void {
    this.rawKeysDown.add(code);
  }

  simulateKeyUp(code: string): void {
    this.rawKeysDown.delete(code);
  }

  /** Begin a drag at the given viewport coordinates. */
  pointerDown(clientX: number, clientY: number): void {
    this.isDragging = true;
    this.pointerMove(clientX, clientY);
  }

  pointerMove(clientX: number, clientY: number): void {
    if (!this.isDragging) return;
    const target = this.attachTarget;
    if (target) {
      const rect = target.getBoundingClientRect();
      this.pointerPos = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    } else {
      this.pointerPos = { x: clientX, y: clientY };
    }
  }

  pointerUp(): void {
    this.isDragging = false;
  }

  private refreshCurrentActions(): void {
    this.currentFrameDown.clear();
    for (const [action, codes] of Object.entries(this.bindings) as [InputAction, string[]][]) {
      if (codes.some((code) => this.rawKeysDown.has(code))) {
        this.currentFrameDown.add(action);
      }
    }
  }

  update(): void {
    this.prevFrameDown = new Set(this.currentFrameDown);
    this.refreshCurrentActions();
  }

  isKeyDown(action: InputAction): boolean {
    return this.currentFrameDown.has(action);
  }

  wasKeyPressed(action: InputAction): boolean {
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

}
