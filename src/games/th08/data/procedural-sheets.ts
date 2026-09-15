import type { AnimatedSheet, PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import type { TaiseiAnim } from '../../../engine/renderer/TaiseiAnim';
import { ASSET_KEYS } from './asset-manifest';

/**
 * Bring the in-house characters to life.
 *
 * Taisei only ships animation for three players, five fairies and eight boss
 * sprites, so the TH08-exclusive cast (Rumia, Mystia, Keine, Tewi, Reisen,
 * Eirin, ...) falls back to the procedural painter in tools/art/characters.mjs.
 * That painter emits a whole idle loop, and this module hands those loops to the
 * renderer through the same sheet slots the real Taisei art uses, so every
 * character breathes, sways and flaps instead of standing frozen.
 *
 * The roster is read back out of the generated manifest rather than hardcoded, so
 * a new boss in tools/art/specs.mjs animates as soon as assets are regenerated.
 * registerTaiseiSheets() runs afterwards and overwrites these slots, which is
 * why real upstream art always wins wherever it exists.
 */

/** Idle loops shorter than this are not worth animating. */
const MIN_FRAMES = 2;

/** Our member art is painted taller than a Taisei frame, so it needs its own fit. */
export const PLAYER_PAINTED_SCALE = 0.6;

/** Slow enough to read at 60fps, fast enough to look alive. */
const FRAME_DELAY = 7;

const idleAnim = (frames: number): TaiseiAnim => ({
  main: { frames: Array.from({ length: frames }, (_, i) => i), delay: FRAME_DELAY, mirror: false },
});

/** How many loop frames the manifest holds for each 'boss:<key>' / 'enemy:<key>'. */
export function proceduralFrameCounts(keys: string[] = ASSET_KEYS): Map<string, number> {
  const found = new Map<string, number>();
  for (const key of keys) {
    const match = /^sprite:(boss|enemy):(.+?):frame(\d+)$/.exec(key);
    if (!match) continue;
    const slot = match[1] + ':' + match[2];
    found.set(slot, (found.get(slot) ?? 0) + 1);
  }
  return found;
}

/** Every sprite key of one kind that has a usable frame loop in the manifest. */
export function proceduralSpriteKeys(kind: 'boss' | 'enemy', keys: string[] = ASSET_KEYS): string[] {
  const prefix = kind + ':';
  return [...proceduralFrameCounts(keys)]
    .filter(([slot, count]) => slot.startsWith(prefix) && count >= MIN_FRAMES)
    .map(([slot]) => slot.slice(prefix.length))
    .sort();
}

/** Build the sheet for one procedural sprite; frame 0 doubles as the static art. */
export function proceduralSheet(
  kind: 'boss' | 'enemy',
  spriteKey: string,
  frames = proceduralFrameCounts().get(kind + ':' + spriteKey) ?? 1,
): AnimatedSheet {
  return {
    frameKey: (frame) => `sprite:${kind}:${spriteKey}:frame${frame}`,
    anim: idleAnim(frames),
    fit: true,
    steer: false,
  };
}

/** How many idle frames the manifest holds for each procedurally painted member. */
export function proceduralPlayerFrames(keys: string[] = ASSET_KEYS): Map<string, number> {
  const found = new Map<string, number>();
  for (const key of keys) {
    const match = /^player-frame:(\w+):frame(\d+)$/.exec(key);
    if (!match) continue;
    found.set(match[1], (found.get(match[1]) ?? 0) + 1);
  }
  return found;
}

/**
 * Register the procedural idle loops. Returns how many slots were filled so a
 * test can catch the asset generator and the client drifting apart.
 *
 * Members also get a 'player-painted:<id>' slot holding our own loop even where
 * Taisei ships art. That is what the 自机画风 option switches between: upstream
 * animation for the three characters Taisei covers, or one consistent in-house
 * look for all eight.
 */
export function registerProceduralSheets(renderer: PixiRenderer): number {
  const counts = proceduralFrameCounts();
  let count = 0;
  for (const kind of ['boss', 'enemy'] as const) {
    for (const spriteKey of proceduralSpriteKeys(kind)) {
      renderer.registerSheet(
        `${kind}:${spriteKey}`,
        proceduralSheet(kind, spriteKey, counts.get(`${kind}:${spriteKey}`)),
      );
      count += 1;
    }
  }
  for (const [member, frames] of proceduralPlayerFrames()) {
    if (frames < MIN_FRAMES) continue;
    renderer.registerSheet('player-painted:' + member, {
      frameKey: (frame) => `player-frame:${member}:frame${frame}`,
      anim: idleAnim(frames),
      scale: PLAYER_PAINTED_SCALE,
      steer: false,
    });
    count += 1;
  }
  return count;
}
