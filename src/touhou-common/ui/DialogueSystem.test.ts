// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { DialogueSystem, type DialogueLine } from './DialogueSystem';

const LINES: DialogueLine[] = [
  { speaker: '霊夢', text: '暗闇ね。', mood: 'puzzled' },
  { speaker: '紫', text: '自然の夜じゃないわ。' },
];

/** Each case gets its own host so leaked boxes can never cross-contaminate. */
const setup = (options = {}) => {
  const root = document.createElement('div');
  document.body.appendChild(root);
  return { root, d: new DialogueSystem(root, options) };
};

const text = (root: HTMLElement) => root.querySelector('.th08-dialog-text')?.textContent ?? '';

describe('DialogueSystem', () => {
  it('mounts a box and shows the first speaker', () => {
    const { root, d } = setup();
    d.play(LINES);
    expect(d.isActive).toBe(true);
    expect(d.lineCount).toBe(2);
    expect(root.querySelector('.th08-dialog-name')?.textContent).toBe('霊夢');
    expect(text(root)).toBe('');
    d.stop();
  });

  it('types the line out one character per charFrames', () => {
    const { root, d } = setup({ charFrames: 2 });
    d.play([{ speaker: 'A', text: 'abcd' }]);
    d.update(1);
    expect(text(root)).toBe('');
    d.update(1);
    expect(text(root)).toBe('a');
    d.update(4);
    expect(text(root)).toBe('abc');
    d.stop();
  });

  it('advance() reveals the whole line first, then moves on', () => {
    const { root, d } = setup({ charFrames: 3 });
    d.play(LINES);
    d.update(1);
    d.advance();
    expect(d.lineIndex).toBe(0);
    expect(text(root)).toBe('暗闇ね。');
    d.advance();
    expect(d.lineIndex).toBe(1);
    expect(root.querySelector('.th08-dialog-name')?.textContent).toBe('紫');
    d.stop();
  });
  it('auto-advances once the hold runs out and fires onComplete', () => {
    let done = 0;
    const { d } = setup({
      charFrames: 1,
      holdFrames: 5,
      onComplete: () => {
        done += 1;
      },
    });
    d.play(LINES);
    for (let i = 0; i < 80; i++) d.update(1);
    expect(d.isActive).toBe(false);
    expect(done).toBe(1);
  });

  it('resolves a portrait per speaker and marks the face box', () => {
    const { root, d } = setup({ faceResolver: (s: string) => (s === '霊夢' ? '/reimu.webp' : undefined) });
    d.play(LINES);
    const face = () => root.querySelector<HTMLElement>('.th08-dialog-face');
    expect(face()?.classList.contains('has-face')).toBe(true);
    expect(face()?.style.backgroundImage).toContain('/reimu.webp');
    d.advance();
    d.advance();
    expect(face()?.classList.contains('has-face')).toBe(false);
    expect(face()?.dataset.speaker).toBe('紫');
    d.stop();
  });

  it('stop() unmounts without reporting completion', () => {
    let done = 0;
    const { root, d } = setup({
      onComplete: () => {
        done += 1;
      },
    });
    d.play(LINES);
    d.stop();
    expect(root.querySelector('.th08-dialog')).toBeNull();
    expect(done).toBe(0);
  });

  it('ignores an empty script so a stage without lines never blocks', () => {
    const { root, d } = setup();
    d.play([]);
    expect(d.isActive).toBe(false);
    expect(root.querySelector('.th08-dialog')).toBeNull();
  });
});
