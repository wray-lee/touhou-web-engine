/**
 * Per-character stage-clear records, the local stand-in for `score.dat`.
 *
 * The retail stage router reads exactly two facts out of that file after stage
 * 5 (`Gui.cpp:264-292`): has this character ever cleared 6A (continues allowed),
 * and has it ever cleared 6B without continuing. Those two flags decide whether
 * the run plays the seven-stage route or skips 6A, so the record has to survive
 * a page reload. Difficulty is part of the retail query but the lookup is "any
 * difficulty", so storing per (route, shotType) is enough.
 */

import type { StageRoute } from './StageRoute';

const STORAGE_KEY = '***';

interface RouteFlag {
  /** Cleared at least once, continues included. */
  cleared: boolean;
  /** Cleared at least once without ever continuing. */
  noContinue: boolean;
}

/** The slice of `Storage` this module needs, so tests can pass a map. */
export interface ProgressStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function defaultStore(): ProgressStore | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function flagKey(route: StageRoute, shotType: number): string {
  return route + ':' + shotType;
}

export class StageProgress {
  private readonly store: ProgressStore | null;
  private readonly flags: Map<string, RouteFlag>;

  constructor(store: ProgressStore | null = defaultStore()) {
    this.store = store;
    this.flags = new Map(StageProgress.read(store));
  }

  private static read(store: ProgressStore | null): [string, RouteFlag][] {
    if (!store) return [];
    try {
      const raw = store.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Record<string, Partial<RouteFlag>>;
      const entries: [string, RouteFlag][] = [];
      for (const [key, value] of Object.entries(parsed)) {
        entries.push([key, { cleared: !!value?.cleared, noContinue: !!value?.noContinue }]);
      }
      return entries;
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (!this.store) return;
    try {
      const record: Record<string, RouteFlag> = {};
      for (const [key, value] of this.flags) record[key] = value;
      this.store.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Private mode / quota: routing still works for the session, it just
      // does not carry over. Never let a save failure break the run.
    }
  }

  private flag(route: StageRoute, shotType: number): RouteFlag {
    const key = flagKey(route, shotType);
    let flag = this.flags.get(key);
    if (!flag) {
      flag = { cleared: false, noContinue: false };
      this.flags.set(key, flag);
    }
    return flag;
  }

  /** Note that a route was cleared, and whether the run was continue-free. */
  record(route: StageRoute, shotType: number, continued: boolean): void {
    const flag = this.flag(route, shotType);
    flag.cleared = true;
    if (!continued) flag.noContinue = true;
    this.persist();
  }

  hasCleared(route: StageRoute, shotType: number): boolean {
    return this.flags.get(flagKey(route, shotType))?.cleared ?? false;
  }

  hasClearedNoContinue(route: StageRoute, shotType: number): boolean {
    return this.flags.get(flagKey(route, shotType))?.noContinue ?? false;
  }

  /** Wipe every record — the "reset progress" option. */
  reset(): void {
    this.flags.clear();
    this.persist();
  }
}
