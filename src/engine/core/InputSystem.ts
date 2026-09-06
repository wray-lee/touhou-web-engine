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

  constructor(bindings = DEFAULT_KEY_BINDINGS) {
    this.bindings = bindings;
  }

  attach(target: Window | HTMLElement = window): void {
    this.boundKeyDownHandler = (e: KeyboardEvent) => {
      this.rawKeysDown.add(e.code);
    };
    this.boundKeyUpHandler = (e: KeyboardEvent) => {
      this.rawKeysDown.delete(e.code);
    };
    target.addEventListener('keydown', this.boundKeyDownHandler as EventListener);
    target.addEventListener('keyup', this.boundKeyUpHandler as EventListener);
  }

  detach(target: Window | HTMLElement = window): void {
    if (this.boundKeyDownHandler) {
      target.removeEventListener('keydown', this.boundKeyDownHandler as EventListener);
    }
    if (this.boundKeyUpHandler) {
      target.removeEventListener('keyup', this.boundKeyUpHandler as EventListener);
    }
  }

  simulateKeyDown(code: string): void {
    this.rawKeysDown.add(code);
    this.refreshCurrentActions();
  }

  simulateKeyUp(code: string): void {
    this.rawKeysDown.delete(code);
    this.refreshCurrentActions();
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
