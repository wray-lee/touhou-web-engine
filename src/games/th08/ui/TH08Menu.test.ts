// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Leaderboard, type LeaderboardStorage } from '../../../engine/score/Leaderboard';
import { TH08Menu } from './TH08Menu';
import { DEFAULT_PREFS, savePrefs } from './PlayerPrefs';

/**
 * The whole front door of the game is keyboard first: the options screen is where
 * mouse steering gets turned on, so if its rows ever fall out of the navigation
 * selector there is no way to reach the setting without a mouse. That happened
 * once already -- `NAV_SELECTOR` listed `opt` while `bindKeys` kept its own copy
 * that did not -- and these tests are the tripwire.
 */

/** The menu listens on `window`, exactly like a real keyboard does. */
function press(key: string): void {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

function activeRow(root: HTMLElement, kind: string): number {
  const rows = [...root.querySelectorAll<HTMLElement>(`[data-menu="${kind}"]`)];
  return rows.findIndex((el) => el.classList.contains('is-active'));
}

function rowText(root: HTMLElement, kind: string, index: number): string {
  return root.querySelectorAll<HTMLElement>(`[data-menu="${kind}"]`)[index]?.textContent ?? '';
}

interface Harness {
  menu: TH08Menu;
  root: HTMLElement;
  started: ReturnType<typeof vi.fn>;
  prefs: ReturnType<typeof vi.fn>;
}

function mount(): Harness {
  document.body.innerHTML = '';
  const root = document.createElement('div');
  document.body.appendChild(root);
  const started = vi.fn();
  const prefs = vi.fn();
  const menu = new TH08Menu(
    root,
    {
      onStart: started,
      onPrefsChange: prefs,
      onQuit: () => menu.showTitle(),
    },
    new Leaderboard('test:leaderboard'),
  );
  menu.showTitle();
  return { menu, root, started, prefs };
}

/** Title -> Options, the same three keystrokes a player makes. */
function openOptions(h: Harness): void {
  press('ArrowDown');
  press('ArrowDown');
  press('Enter');
  expect(rowText(h.root, 'opt', 0)).toContain('MOUSE STEERING');
}

describe('TH08Menu keyboard navigation', () => {
  let h: Harness;
  beforeEach(() => {
    // Options are persisted, so a previous run's settings would decide what the
    // first assertion sees. Pin them before every case.
    savePrefs({ ...DEFAULT_PREFS });
    h = mount();
  });

  it('walks the title list and opens the screen the cursor sits on', () => {
    expect(activeRow(h.root, 'item')).toBe(0);
    press('ArrowDown');
    press('ArrowDown');
    expect(activeRow(h.root, 'item')).toBe(2);
    press('Enter');
    expect(activeRow(h.root, 'opt')).toBe(0);
  });

  it('toggles mouse steering from the options screen with the keyboard', () => {
    openOptions(h);
    expect(rowText(h.root, 'opt', 0)).toContain('关闭 OFF');

    press('Enter');
    expect(rowText(h.root, 'opt', 0)).toContain('开启 ON');
    expect(h.prefs).toHaveBeenCalledTimes(1);
    expect(h.prefs.mock.calls[0][0].mouseControl).toBe(true);

    press('Enter');
    expect(rowText(h.root, 'opt', 0)).toContain('关闭 OFF');
    expect(h.prefs).toHaveBeenCalledTimes(2);
    expect(h.prefs.mock.calls[1][0].mouseControl).toBe(false);
  });

  it('moves between options rows and cycles the other settings', () => {
    openOptions(h);
    press('ArrowDown');
    expect(activeRow(h.root, 'opt')).toBe(1);
    press('Enter');
    // Default is off, so the first press lands on the guess mode, not always-on.
    expect(rowText(h.root, 'opt', 1)).toContain('自动 AUTO');
    // The highlight must stay put: an options screen that jumps back to row 1
    // after every change forces a re-traverse for each setting.
    expect(activeRow(h.root, 'opt')).toBe(1);

    press('ArrowDown');
    expect(activeRow(h.root, 'opt')).toBe(2);
    press('Enter');
    expect(rowText(h.root, 'opt', 2)).toContain('统一手绘 PAINTED');
    expect(activeRow(h.root, 'opt')).toBe(2);

    // The fog flag sits after the art row and before the volume row, and it is the
    // only graphics switch retail ever offered for the backdrop.
    press('ArrowDown');
    expect(rowText(h.root, 'opt', 3)).toContain('雾效 FOG');
    expect(rowText(h.root, 'opt', 3)).toContain('开启 ON');
    press('Enter');
    expect(rowText(h.root, 'opt', 3)).toContain('关闭 OFF');
    expect(activeRow(h.root, 'opt')).toBe(3);
  });

  it('leaves the options screen with Escape and the last row with Enter', () => {
    openOptions(h);
    press('Escape');
    expect(activeRow(h.root, 'item')).toBe(0);

    openOptions(h);
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    expect(activeRow(h.root, 'opt')).toBe(6);
    press('Enter');
    expect(activeRow(h.root, 'item')).toBe(0);
  });

  it('returns from screens that have no cursor rows at all', () => {
    // Ranking is the fourth title row and draws no cursor rows at all: only a
    // handler that still runs with nothing to move can get the player out.
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    press('Enter');
    expect(rowText(h.root, 'back', 0)).toContain('BACK');
    press('Escape');
    expect(activeRow(h.root, 'item')).toBe(0);

    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    press('ArrowDown');
    press('Enter');
    expect(rowText(h.root, 'back', 0)).toContain('BACK');
    press('Enter');
    expect(activeRow(h.root, 'item')).toBe(0);
  });

  it('keeps typing in the results name field out of the menu', () => {
    h.menu.showResults({
      stage: 1,
      difficulty: 'normal',
      character: 'reimu-yukari',
      score: 1000,
      graze: 10,
      spellBonus: 0,
      livesLeft: 2,
      bombsLeft: 1,
      power: 1.5,
      maxPower: 4,
      stats: {
        score: 1000,
        retries: 0,
        difficulty: 'normal',
        playFrames: 12000,
        deaths: 1,
        bombsUsed: 2,
        cardsCaptured: 3,
        lagFraction: 0,
      },
    });
    const input = h.root.querySelector<HTMLInputElement>('input[data-menu="name"]');
    expect(input).not.toBeNull();
    input?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(h.started).not.toHaveBeenCalled();
  });

  it('keeps a review fixture out of the score file', () => {
    /*
     * `?resultscreen` opens the settlement screen without a run behind it, and it
     * gets opened over and over while the panel is being reviewed. Submitting each
     * of those buried the player's own records, one refresh at a time.
     */
    const store = new Map<string, string>();
    const storage: LeaderboardStorage = {
      getItem: (key) => store.get(key) ?? null,
      setItem: (key, value) => void store.set(key, value),
      removeItem: (key) => void store.delete(key),
    };
    const board = new Leaderboard('fixture-key', storage);
    board.submit({
      name: 'record',
      score: 999,
      stage: 1,
      difficulty: 'normal',
      character: 'reimu-yukari',
    });

    document.body.innerHTML = '';
    const root = document.createElement('div');
    document.body.appendChild(root);
    const menu = new TH08Menu(root, { onStart: () => {} }, board);
    const report = (demo: boolean) => ({
      stage: 6 as const,
      difficulty: 'lunatic' as const,
      character: 'youmu-yuyuko' as const,
      score: 4242,
      graze: 100,
      spellBonus: 0,
      livesLeft: 1,
      bombsLeft: 1,
      power: 128,
      maxPower: 128,
      stats: {
        score: 4242,
        retries: 0,
        difficulty: 'lunatic',
        playFrames: 1000,
        deaths: 0,
        bombsUsed: 0,
        cardsCaptured: 0,
        lagFraction: 0,
      },
      demo,
    });

    menu.showResults(report(true));
    expect(new Leaderboard('fixture-key', storage).getEntries().map((e) => e.name)).toEqual(['record']);

    menu.showResults(report(false));
    expect(new Leaderboard('fixture-key', storage).getEntries()).toHaveLength(2);
  });
});
