import { InputSystem } from '../../../engine/core/InputSystem';

/** Virtual action buttons for touch play, skinned with the baked ui:touch atlas. */
export type TouchAction = 'shoot' | 'bomb' | 'focus' | 'pause';

const CODE_FOR_ACTION: Record<TouchAction, string> = {
  shoot: 'KeyZ',
  bomb: 'KeyX',
  focus: 'ShiftLeft',
  pause: 'Escape',
};

const LABEL: Record<TouchAction, string> = {
  shoot: '射击',
  bomb: '灵击',
  focus: '低速',
  pause: '暂停',
};

/**
 * On-screen buttons that feed InputSystem through the same code path as a
 * keyboard, so bindings, the 3-frame press buffer and replays all keep working.
 * Dragging the playfield still steers the ship (and auto-fires) — see US#9.
 */
export class TouchControls {
  private readonly root: HTMLElement;
  private readonly input: InputSystem;
  private el?: HTMLElement;
  private readonly held = new Map<TouchAction, boolean>();
  private readonly disposers: (() => void)[] = [];

  constructor(root: HTMLElement, input: InputSystem) {
    this.root = root;
    this.input = input;
  }

  /** Show the pad; `auto` only mounts it on coarse-pointer (touch) devices. */
  show(mode: 'always' | 'auto' | 'never' = 'auto'): void {
    if (this.el || mode === 'never') return;
    if (mode === 'auto' && !TouchControls.isTouch()) return;
    const el = document.createElement('div');
    el.className = 'th08-touch';
    el.innerHTML = (Object.keys(CODE_FOR_ACTION) as TouchAction[])
      .map(
        (action) =>
          `<button type="button" class="th08-touch-btn th08-touch-${action}" data-touch="${action}" aria-label="${LABEL[action]}">` +
          `<img src="/assets/ui/touch-${action}.png" alt="" draggable="false"><span>${LABEL[action]}</span></button>`,
      )
      .join('');
    this.root.appendChild(el);
    this.el = el;

    el.querySelectorAll<HTMLElement>('[data-touch]').forEach((btn) => {
      const action = btn.dataset.touch as TouchAction;
      const press = (event: Event) => {
        event.preventDefault();
        this.press(action);
        btn.classList.add('is-down');
      };
      const release = (event: Event) => {
        event.preventDefault();
        this.release(action);
        btn.classList.remove('is-down');
      };
      btn.addEventListener('pointerdown', press);
      btn.addEventListener('pointerup', release);
      btn.addEventListener('pointercancel', release);
      btn.addEventListener('pointerleave', release);
      this.disposers.push(() => {
        btn.removeEventListener('pointerdown', press);
        btn.removeEventListener('pointerup', release);
        btn.removeEventListener('pointercancel', release);
        btn.removeEventListener('pointerleave', release);
      });
    });
  }

  hide(): void {
    for (const dispose of this.disposers.splice(0)) dispose();
    for (const action of this.held.keys()) this.release(action);
    this.el?.remove();
    this.el = undefined;
  }

  private press(action: TouchAction): void {
    this.held.set(action, true);
    this.input.simulateKeyDown(CODE_FOR_ACTION[action]);
  }

  private release(action: TouchAction): void {
    if (!this.held.get(action)) return;
    this.held.set(action, false);
    this.input.simulateKeyUp(CODE_FOR_ACTION[action]);
  }

  static isTouch(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(window.matchMedia?.('(pointer: coarse)').matches) || 'ontouchstart' in window;
  }
}
