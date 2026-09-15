import { describe, expect, it } from 'vitest';
import { TaiseiAnim, TaiseiAnimPlayer } from './TaiseiAnim';
import { TAISEI_ANIM, TAISEI_PLAYER_BY_CHARACTER } from '../../games/th08/data/taisei-assets';

/** The real upstream group table for Reimu, parsed from Taisei's reimu.ani. */
const reimu = TAISEI_ANIM['player/reimu'];

const run = (player: TaiseiAnimPlayer, frames: number): number[] => {
  const seen: number[] = [];
  for (let i = 0; i < frames; i++) {
    player.update(1);
    seen.push(player.frameIndex);
  }
  return seen;
};

describe('TaiseiAnimPlayer', () => {
  it('idles on the upright bob group', () => {
    const player = new TaiseiAnimPlayer(reimu);
    expect(player.currentGroup).toBe('main');
    expect(reimu.main.frames.every((f) => f >= 4 && f <= 7)).toBe(true);
    const seen = run(player, 40);
    expect(new Set(seen).size).toBeGreaterThan(1);
    expect(seen.every((f) => reimu.main.frames.includes(f))).toBe(true);
    expect(player.flipped).toBe(false);
  });

  it('leans right through the lean-in clip and holds the right frames', () => {
    const player = new TaiseiAnimPlayer(reimu);
    player.setDirection(1);
    expect(player.currentGroup).toBe('main2right');
    expect(player.isTransitioning).toBe(true);
    run(player, 12);
    expect(player.currentGroup).toBe('right');
    expect(reimu.right.frames).toContain(player.frameIndex);
    expect(player.flipped).toBe(false);
  });

  it('mirrors the same lean frames when moving left', () => {
    const player = new TaiseiAnimPlayer(reimu);
    player.setDirection(-1);
    run(player, 12);
    expect(player.currentGroup).toBe('left');
    expect(reimu.left.frames).toContain(player.frameIndex);
    expect(player.flipped).toBe(true);
  });

  it('routes a side switch back through the upright pose', () => {
    const player = new TaiseiAnimPlayer(reimu);
    player.setDirection(-1);
    run(player, 12);
    expect(player.currentGroup).toBe('left');
    player.setDirection(1);
    expect(player.currentGroup).toBe('left2main');
    run(player, 8);
    expect(player.currentGroup).toBe('main2right');
    run(player, 8);
    expect(player.currentGroup).toBe('right');
    expect(player.flipped).toBe(false);
  });

  it('returns to upright when the character stops mid lean-in', () => {
    const player = new TaiseiAnimPlayer(reimu);
    player.setDirection(1);
    player.update(1);
    player.setDirection(0);
    run(player, 20);
    expect(player.currentGroup).toBe('main');
    expect(player.flipped).toBe(false);
  });

  it('keeps small jitter inside the dead zone upright', () => {
    const player = new TaiseiAnimPlayer(reimu);
    player.setDirection(0.1, 0.2);
    expect(player.currentGroup).toBe('main');
  });
  it('falls back to the idle group when a clip is missing', () => {
    const sparse: TaiseiAnim = { main: { frames: [0, 1], delay: 2, mirror: false } };
    const player = new TaiseiAnimPlayer(sparse);
    player.setDirection(1);
    expect(player.currentGroup).toBe('main');
    expect(player.frameIndex).toBeGreaterThanOrEqual(0);
  });

  /**
   * A trimmed bank can leave a transition clip holding a single frame. The
   * player used to bail out of `update()` before checking whether that clip had
   * finished, so the sprite sat on one texture forever and every later direction
   * change piled up in `pending` — the ship looked frozen to the player.
   */
  it('finishes a one-frame transition clip instead of freezing on it', () => {
    const anim: TaiseiAnim = {
      main: { frames: [0, 1], delay: 2, mirror: false },
      right: { frames: [8, 9], delay: 2, mirror: false },
      main2right: { frames: [12], delay: 4, mirror: false },
    };
    const player = new TaiseiAnimPlayer(anim);
    player.setDirection(1);
    expect(player.currentGroup).toBe('main2right');
    expect(player.frameIndex).toBe(12);
    run(player, 2);
    expect(player.currentGroup).toBe('right');
    expect(player.isTransitioning).toBe(false);
  });

  /** Remilia ships one still: every group clamps to a single frame. */
  it('settles on the steady pose for a bank made only of single frames', () => {
    const still: TaiseiAnim = {
      main: { frames: [0], delay: 6, mirror: false },
      left: { frames: [0], delay: 6, mirror: false },
      right: { frames: [0], delay: 6, mirror: true },
      main2left: { frames: [0], delay: 4, mirror: false },
      left2main: { frames: [0], delay: 4, mirror: false },
      main2right: { frames: [0], delay: 4, mirror: true },
      right2main: { frames: [0], delay: 4, mirror: true },
    };
    const player = new TaiseiAnimPlayer(still);
    player.setDirection(1);
    run(player, 4);
    expect(player.currentGroup).toBe('right');
    expect(player.isTransitioning).toBe(false);
    expect(player.flipped).toBe(true);
    player.setDirection(0);
    run(player, 4);
    expect(player.currentGroup).toBe('main');
    expect(player.flipped).toBe(false);
  });

  it('plays the bank lean-out clip when the ship stops leaning', () => {
    const anim: TaiseiAnim = {
      main: { frames: [0, 1], delay: 2, mirror: false },
      left: { frames: [8, 9], delay: 2, mirror: false },
      main2left: { frames: [4, 5], delay: 2, mirror: false },
      left2main: { frames: [5, 4], delay: 2, mirror: false },
    };
    const player = new TaiseiAnimPlayer(anim);
    player.setDirection(-1);
    run(player, 6);
    expect(player.currentGroup).toBe('left');
    player.setDirection(0);
    // `main2main` does not exist; the upright return must use `left2main`.
    expect(player.currentGroup).toBe('left2main');
    run(player, 6);
    expect(player.currentGroup).toBe('main');
  });

  it('every playable team with upstream art has left/right lean groups', () => {
    const sheets = Object.values(TAISEI_PLAYER_BY_CHARACTER);
    expect(sheets.length).toBeGreaterThan(0);
    for (const sheet of sheets) {
      const anim = TAISEI_ANIM['player/' + sheet];
      expect(anim, sheet).toBeTruthy();
      expect(anim.right.frames.length).toBeGreaterThan(0);
      expect(anim.left.mirror).toBe(true);
      expect(anim.left.frames).toEqual(anim.right.frames);
    }
  });
});
