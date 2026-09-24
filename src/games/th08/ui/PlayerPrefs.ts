/** Persisted player preferences (options menu + pause menu write these). */
export type TouchMode = 'auto' | 'always' | 'never';

/**
 * Which art the ship wears. 'taisei' takes the vendored upstream sheets for the
 * three members Taisei covers; 'painted' uses our own loop for all eight so a
 * focus switch never jumps between two drawing styles.
 */
export type PlayerSkin = 'taisei' | 'painted';

export interface PlayerPrefs {
  /** Steer the ship with the mouse cursor. Off by default so keyboard play is untouched. */
  mouseControl: boolean;
  /**
   * Hardware fog on the 3D backdrop. Retail's own graphics flag (`cfg.opts.disableFog`,
   * `Supervisor.cpp:1462`), and on by default here too: the `.std` backdrops are
   * authored around a colour mix, and 38 of the 52 fog settings are not black.
   */
  fog: boolean;
  /** Ship art style. */
  playerSkin: PlayerSkin;
  /**
   * Virtual button layer. Off unless the player turns it on: steering on a phone
   * is the playfield drag, and a PC plays with the keyboard, so the pad never
   * guesses from the pointer or the UA.
   */
  touchControls: TouchMode;
  /** Background music volume, 0..1. */
  bgmVolume: number;
}

export const DEFAULT_PREFS: PlayerPrefs = {
  mouseControl: false,
  fog: true,
  playerSkin: 'taisei',
  touchControls: 'never',
  bgmVolume: 0.7,
};

const KEY = 'touhou-web-engine:prefs';

interface PrefsStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const storage = (): PrefsStorage | undefined =>
  typeof localStorage !== 'undefined' ? (localStorage as unknown as PrefsStorage) : undefined;

export function loadPrefs(): PlayerPrefs {
  const raw = storage()?.getItem(KEY);
  if (!raw) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(raw) as Partial<PlayerPrefs>;
    return {
      mouseControl: Boolean(parsed.mouseControl),
      // Absent in tables saved before the flag existed, which means "as shipped".
      fog: parsed.fog === undefined ? DEFAULT_PREFS.fog : Boolean(parsed.fog),
      playerSkin: parsed.playerSkin === 'painted' ? 'painted' : 'taisei',
      // Anything but an explicit 'always' stays off, including tables saved while
      // the default was 'auto': that value only ever meant "guess", never a choice.
      touchControls: parsed.touchControls === 'always' ? 'always' : 'never',
      bgmVolume:
        typeof parsed.bgmVolume === 'number'
          ? Math.min(1, Math.max(0, parsed.bgmVolume))
          : DEFAULT_PREFS.bgmVolume,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: PlayerPrefs): void {
  storage()?.setItem(KEY, JSON.stringify(prefs));
}
