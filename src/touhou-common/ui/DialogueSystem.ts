/**
 * Stage-side dialogue box (EoSD 会話システム).
 *
 * Lives in the common layer so any game can drive it; the game supplies a
 * `faceResolver` that maps a speaker onto real artwork. While a script plays,
 * the caller freezes its stage timeline exactly like the original: bullets on
 * screen keep moving, but no new timeline events fire until the last line is
 * dismissed.
 */
export interface DialogueLine {
  /** Display name shown above the text, e.g. '霊夢'. */
  speaker: string;
  text: string;
  /** Face expression key handed to the game's faceResolver. */
  mood?: string;
}

export interface DialogueSystemOptions {
  /** Map (speaker, mood) onto an image URL, or undefined for no portrait. */
  faceResolver?: (speaker: string, mood?: string) => string | undefined;
  /** Frames spent revealing one character (typewriter speed). */
  charFrames?: number;
  /** Frames the finished line lingers before auto-advancing. */
  holdFrames?: number;
  /** Fired once the last line is dismissed or the script is stopped. */
  onComplete?: () => void;
}

const ADVANCE_KEYS = new Set(['Enter', 'z', 'Z', ' ', 'Space']);

export class DialogueSystem {
  private readonly root: HTMLElement;
  private readonly options: DialogueSystemOptions;
  private el?: HTMLElement;
  private nameEl?: HTMLElement;
  private textEl?: HTMLElement;
  private faceEl?: HTMLElement;
  private script: DialogueLine[] = [];
  private index = -1;
  private revealed = 0;
  private revealClock = 0;
  private hold = 0;
  private handler?: (event: KeyboardEvent) => void;

  constructor(root: HTMLElement, options: DialogueSystemOptions = {}) {
    this.root = root;
    this.options = options;
  }

  /** True while a script is on screen - the caller should freeze its timeline. */
  get isActive(): boolean {
    return this.script.length > 0;
  }

  /** The line being shown, or null between scripts. */
  get current(): DialogueLine | null {
    return this.index >= 0 && this.index < this.script.length ? this.script[this.index] : null;
  }

  get lineCount(): number {
    return this.script.length;
  }

  get lineIndex(): number {
    return this.index;
  }

  /** Start a script, replacing anything already playing. */
  play(lines: DialogueLine[]): void {
    if (lines.length === 0) return;
    this.script = lines.slice();
    this.index = -1;
    this.mount();
    this.advanceLine();
  }
  /** Skip the typing animation, then move to the next line (or end the script). */
  advance(): void {
    if (!this.isActive) return;
    const line = this.current;
    if (line && this.revealed < line.text.length) {
      this.revealed = line.text.length;
      this.revealClock = 0;
      this.hold = this.options.holdFrames ?? 70;
      this.render();
      return;
    }
    this.advanceLine();
  }

  /** Tear the box down without firing onComplete (stage reset, quit to menu). */
  stop(): void {
    this.script = [];
    this.index = -1;
    this.revealed = 0;
    this.revealClock = 0;
    this.hold = 0;
    this.unmount();
  }

  /** Per-frame clock: drives the typewriter and the auto-advance hold. */
  update(dtFrames: number): void {
    if (!this.isActive) return;
    const line = this.current;
    if (!line) return;
    const speed = Math.max(1, this.options.charFrames ?? 1);
    if (this.revealed < line.text.length) {
      this.revealClock += dtFrames;
      let changed = false;
      while (this.revealClock >= speed && this.revealed < line.text.length) {
        this.revealClock -= speed;
        this.revealed += 1;
        changed = true;
      }
      if (changed) this.render();
      return;
    }
    this.hold -= dtFrames;
    if (this.hold <= 0) this.advanceLine();
  }

  private advanceLine(): void {
    this.index += 1;
    this.revealed = 0;
    this.revealClock = 0;
    this.hold = this.options.holdFrames ?? 70;
    if (this.index >= this.script.length) {
      const done = this.options.onComplete;
      this.stop();
      done?.();
      return;
    }
    this.render();
  }

  private mount(): void {
    if (this.el) return;
    const el = document.createElement('div');
    el.className = 'th08-dialog';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = [
      '<div class="th08-dialog-face"></div>',
      '<div class="th08-dialog-main">',
      '<p class="th08-dialog-name"></p>',
      '<p class="th08-dialog-text"></p>',
      '</div>',
      '<p class="th08-dialog-hint">Z / Enter 次へ</p>',
    ].join('');
    el.addEventListener('click', () => this.advance());
    this.root.appendChild(el);
    this.el = el;
    this.faceEl = el.querySelector<HTMLElement>('.th08-dialog-face') ?? undefined;
    this.nameEl = el.querySelector<HTMLElement>('.th08-dialog-name') ?? undefined;
    this.textEl = el.querySelector<HTMLElement>('.th08-dialog-text') ?? undefined;
    this.handler = (event: KeyboardEvent) => {
      if (!this.el || !ADVANCE_KEYS.has(event.key)) return;
      event.preventDefault();
      this.advance();
    };
    window.addEventListener('keydown', this.handler);
  }

  private unmount(): void {
    if (this.handler) {
      window.removeEventListener('keydown', this.handler);
      this.handler = undefined;
    }
    this.el?.remove();
    this.el = undefined;
    this.faceEl = undefined;
    this.nameEl = undefined;
    this.textEl = undefined;
  }
  private render(): void {
    const line = this.current;
    const el = this.el;
    if (!line || !el) return;
    const typing = this.revealed < line.text.length;
    el.dataset.index = String(this.index);
    if (this.nameEl) this.nameEl.textContent = line.speaker;
    if (this.textEl) {
      this.textEl.textContent = line.text.slice(0, this.revealed);
      this.textEl.classList.toggle('is-typing', typing);
    }
    if (this.faceEl) {
      const url = this.options.faceResolver?.(line.speaker, line.mood);
      this.faceEl.style.backgroundImage = url ? 'url("' + url + '")' : 'none';
      this.faceEl.dataset.speaker = line.speaker;
      this.faceEl.classList.toggle('has-face', Boolean(url));
    }
  }
}
