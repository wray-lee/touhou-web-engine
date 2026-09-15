import type { GameId, GameProfile } from './GameProfile';

/**
 * Registry of playable games. The engine ships one profile per Touhou title;
 * adding TH09+ is a new profile plus a `registerGame` call, with no changes to
 * the core loop, renderer or menus.
 */
const profiles = new Map<GameId, GameProfile>();

export function registerGame(profile: GameProfile): GameProfile {
  profiles.set(profile.id, profile);
  return profile;
}

export function getGameProfile(id: GameId): GameProfile | undefined {
  return profiles.get(id);
}

/** Every registered game, in registration order. */
export function listGames(): GameProfile[] {
  return Array.from(profiles.values());
}

export function requireGameProfile(id: GameId): GameProfile {
  const profile = profiles.get(id);
  if (!profile) throw new Error('Unknown game: ' + id);
  return profile;
}

/** Guard for values that arrived from a URL, a save file or the DOM. */
export function isGameId(value: unknown): value is GameId {
  return value === 'th06' || value === 'th07' || value === 'th08';
}
