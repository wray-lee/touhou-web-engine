import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFS, loadPrefs, savePrefs, type PlayerPrefs } from './PlayerPrefs';

/**
 * The options screen is the only place a player can veto a presentation feature,
 * so the storage boundary carries more weight than it looks: an explicit `fog:
 * false` has to survive a reload, and a table saved before the flag existed has
 * to keep meaning "as shipped" instead of quietly switching the fog off.
 *
 * `PlayerPrefs` guards its access with `typeof localStorage !== 'undefined'`,
 * which is right for a pre-boot call but means a test environment without web
 * storage passes these assertions while reading nothing at all. So the storage is
 * installed here by hand -- the fake is what makes the assertions real.
 */

const KEY = 'touhou-web-engine:prefs';

/** Replace `localStorage` with a map the test can also read directly. */
function installStorage(): Map<string, string> {
  const table = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => (table.has(key) ? table.get(key) : null),
    setItem: (key: string, value: string) => {
      table.set(key, value);
    },
    removeItem: (key: string) => {
      table.delete(key);
    },
    clear: () => table.clear(),
  });
  return table;
}

/** Write storage the way an older build of the menu would have. */
function stored(table: Map<string, string>, prefs: unknown): void {
  table.set(KEY, JSON.stringify(prefs));
}

describe('player preferences', () => {
  let table: Map<string, string>;

  beforeEach(() => {
    table = installStorage();
  });

  it('falls back to the shipped defaults with nothing stored', () => {
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('round-trips every field through storage', () => {
    const prefs: PlayerPrefs = {
      mouseControl: true,
      fog: false,
      playerSkin: 'painted',
      touchControls: 'never',
      bgmVolume: 0.25,
    };
    savePrefs(prefs);
    expect(table.get(KEY)).toBeTruthy();
    expect(loadPrefs()).toEqual(prefs);
  });

  it('keeps an explicit fog:false instead of reading it as absent', () => {
    stored(table, { ...DEFAULT_PREFS, fog: false });
    expect(loadPrefs().fog).toBe(false);
    stored(table, { ...DEFAULT_PREFS, fog: true });
    expect(loadPrefs().fog).toBe(true);
  });

  it('reads a pre-fog save table as the shipped default', () => {
    const legacy = {
      mouseControl: false,
      playerSkin: 'taisei',
      touchControls: 'auto',
      bgmVolume: 0.4,
    };
    stored(table, legacy);
    expect(loadPrefs()).toEqual({ ...legacy, fog: true });
  });

  it('coerces junk instead of propagating it', () => {
    stored(table, { mouseControl: 1, playerSkin: 'lunatic', touchControls: 'sometimes', bgmVolume: 9 });
    expect(loadPrefs()).toEqual({ ...DEFAULT_PREFS, mouseControl: true, bgmVolume: 1 });
  });

  it('ignores an unparseable table', () => {
    table.set(KEY, '{not json');
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });
});
