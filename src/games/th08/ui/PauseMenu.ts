/** In-game ESC menu: resume / restart / quit / audio toggle. */
export interface PauseMenuOptions {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  /** Toggle mouse steering; returns the new state for the row label. */
  onToggleMouse?: () => boolean;
  onToggleBgm?: () => boolean;
  isMouseControl?: () => boolean;
}

export class PauseMenu {
  private readonly root: HTMLElement;
  private readonly options: PauseMenuOptions;
  private el?: HTMLElement;
  private cursor = 0;
  private static readonly ITEM_COUNT = 5;
  private handler?: (event: KeyboardEvent) => void;

  constructor(root: HTMLElement, options: PauseMenuOptions) {
    this.root = root;
    this.options = options;
  }

  get isVisible(): boolean {
    return Boolean(this.el);
  }

  show(): void {
    if (this.el) return;
    this.cursor = 0;
    const el = document.createElement('div');
    el.className = 'th08-pause';
    el.innerHTML = [
      '<div class="th08-pause-card">',
      '<p class="th08-pause-kicker">PAUSED</p>',
      '<h3>暂停</h3>',
      '<nav class="th08-pause-list">',
      '<button type="button" data-pause="0">继续 RESUME</button>',
      '<button type="button" data-pause="1">重新开始 RESTART</button>',
      '<button type="button" data-pause="2">返回标题 QUIT</button>',
      '<button type="button" data-pause="3">鼠标操作 <span data-pause-mouse></span></button>',
      '<button type="button" data-pause="4">BGM 开关</button>',
      '</nav>',
      '<p class="th08-pause-hint">↑↓ Enter · 或直接按 ESC 继续</p>',
      '</div>',
    ].join('');
    this.root.appendChild(el);
    this.el = el;
    this.mark();

    el.querySelectorAll<HTMLElement>('[data-pause]').forEach((btn) => {
      btn.addEventListener('click', () => this.activate(Number(btn.dataset.pause ?? 0)));
    });
    this.handler = (event: KeyboardEvent) => {
      if (!this.el) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        this.move(1);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        this.move(-1);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        this.activate(this.cursor);
      }
    };
    window.addEventListener('keydown', this.handler);
  }

  hide(): void {
    if (this.handler) window.removeEventListener('keydown', this.handler);
    this.handler = undefined;
    this.el?.remove();
    this.el = undefined;
  }

  private move(delta: number): void {
    const n = PauseMenu.ITEM_COUNT;
    this.cursor = (this.cursor + delta + n) % n;
    this.mark();
  }

  private mark(): void {
    this.el?.querySelectorAll<HTMLElement>('[data-pause]').forEach((btn, i) => {
      btn.classList.toggle('is-active', i === this.cursor);
    });
    const label = this.el?.querySelector<HTMLElement>('[data-pause-mouse]');
    if (label) label.textContent = this.options.isMouseControl?.() ? '开启 ON' : '关闭 OFF';
  }

  private activate(index: number): void {
    if (index === 0) this.options.onResume();
    else if (index === 1) {
      this.hide();
      this.options.onRestart();
    } else if (index === 2) {
      this.hide();
      this.options.onQuit();
    } else if (index === 3) {
      this.options.onToggleMouse?.();
      this.mark();
    } else {
      this.options.onToggleBgm?.();
    }
  }
}
