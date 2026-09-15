/**
 * Runtime access to the retail data the ship's weapon is made of.
 *
 * Two generated tables back this: the eight `plyNN*.sht` firing files and the four
 * `playerNN.anm` packs. Both are carried as bytes and decoded once per process,
 * because `Player::LoadShtFile` and `AnmManager::LoadAnmFile` each do the same for
 * the whole game session - a stage that re-parsed them per shot would be doing work
 * the original never does, and a stage that re-decoded base64 per frame would show
 * it in the frame graph.
 */
import { parseShtTables, type ShtPowerTable } from '../format/ShtFile';
import { anmScriptFromBase64 } from '../../engine/anm/AnmVm';
import type { AnmPack } from '../../engine/anm/AnmPack';
import { TH08_PLAYER_ANM_PACKS } from './th08-player-anm';
import { TH08_PRIMARY_SHT, TH08_SECONDARY_SHT, TH08_SHT_FILES } from './th08-player-sht';

/** Decode a base64 blob into bytes, on whichever of the two hosts is running. */
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const shtCache = new Map<string, ShtPowerTable[]>();

/** The firing chains of one `plyNN*.sht`, parsed once and shared. */
export function shtTables(file: string): ShtPowerTable[] {
  const hit = shtCache.get(file);
  if (hit) return hit;
  const b64 = TH08_SHT_FILES[file];
  const tables = b64 ? parseShtTables(bytesFromBase64(b64)) : [];
  shtCache.set(file, tables);
  return tables;
}

export interface PlayerWeaponTables {
  /** `Player.primaryShtFile`, the unfocused table set. */
  primary: ShtPowerTable[];
  /** `Player.secondaryShtFile`, the focused one. */
  secondary: ShtPowerTable[];
}

/**
 * The two `.sht` files a shot type loads (`g_Player1ShtFiles` /
 * `g_Player2ShtFile`, `Player.cpp:49-61`).
 */
export function weaponTablesFor(shotType: number): PlayerWeaponTables {
  const index = Math.max(0, Math.min(11, shotType | 0));
  return {
    primary: shtTables(TH08_PRIMARY_SHT[index]),
    secondary: shtTables(TH08_SECONDARY_SHT[index]),
  };
}

export interface PlayerAnmRuntime {
  /** The team's `playerNN.anm`, as the VM's script store. */
  pack: AnmPack;
  /** The atlas cell a sprite id occupies, which is what sizes a shot's draw. */
  spriteSize(sprite: number): { x: number; y: number } | null;
}

const anmCache = new Map<number, PlayerAnmRuntime>();

/** The animation pack for a team number, i.e. `TH08_PLAYER_ANM_BY_SHOT_TYPE[shotType]`. */
export function playerAnmRuntime(team: number): PlayerAnmRuntime | null {
  const cached = anmCache.get(team);
  if (cached) return cached;
  const data = TH08_PLAYER_ANM_PACKS[team];
  if (!data) return null;
  const decoded = new Map<number, Int32Array | null>();
  const runtime: PlayerAnmRuntime = {
    pack: {
      words(script: number): Int32Array | null {
        if (decoded.has(script)) return decoded.get(script) ?? null;
        const b64 = data.bytes[script] ?? null;
        let words: Int32Array | null = null;
        try {
          if (b64) words = anmScriptFromBase64(b64);
        } catch {
          words = null;
        }
        decoded.set(script, words);
        return words;
      },
    },
    spriteSize(sprite: number) {
      const rect = data.rects[sprite];
      return rect ? { x: rect.w, y: rect.h } : null;
    },
  };
  anmCache.set(team, runtime);
  return runtime;
}

/** `g_PlayerAnmFilenames` (`Player.cpp:44-47`), the pack per shot type. */
export const PLAYER_ANM_TEAM_BY_SHOT_TYPE: readonly number[] = [0, 1, 2, 3, 0, 0, 1, 1, 2, 2, 3, 3];
