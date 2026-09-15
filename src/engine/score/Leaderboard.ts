export interface ScoreEntry {
  name: string;
  score: number;
  stage: number;
  difficulty: string;
  character: string;
  createdAt: string;
  /** Continues used, which the HUD shows in the score row's tenth column. */
  numRetries?: number;
}

export interface LeaderboardStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class Leaderboard {
  private entries: ScoreEntry[] = [];
  private readonly storage?: LeaderboardStorage;

  constructor(
    private readonly key = 'touhou-web-engine:leaderboard',
    storage?: LeaderboardStorage,
  ) {
    this.storage = storage ?? (typeof localStorage !== 'undefined' ? localStorage : undefined);
    this.load();
  }

  submit(entry: Omit<ScoreEntry, 'createdAt'>): ScoreEntry[] {
    this.entries.push({ ...entry, createdAt: new Date().toISOString() });
    this.entries.sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt));
    this.entries = this.entries.slice(0, 10);
    this.save();
    return this.getEntries();
  }

  getEntries(): ScoreEntry[] {
    return this.entries.map((entry) => ({ ...entry }));
  }

  /**
   * The best entry stored for one shot type and difficulty. 永夜抄 keeps a
   * separate high score per character, and the row also reports how many
   * continues that run spent.
   */
  bestFor(difficulty: string, character: string): ScoreEntry | null {
    let best: ScoreEntry | null = null;
    for (const entry of this.entries) {
      if (entry.difficulty !== difficulty || entry.character !== character) continue;
      if (!best || entry.score > best.score) best = entry;
    }
    return best;
  }

  clear(): void {
    this.entries = [];
    this.storage?.removeItem(this.key);
  }

  private load(): void {
    const raw = this.storage?.getItem(this.key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as ScoreEntry[];
      if (Array.isArray(parsed)) this.entries = parsed.slice(0, 10);
    } catch {
      this.entries = [];
    }
  }

  private save(): void {
    this.storage?.setItem(this.key, JSON.stringify(this.entries));
  }
}
