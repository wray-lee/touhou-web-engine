import { describe, expect, it } from 'vitest';
import { Leaderboard, LeaderboardStorage } from './Leaderboard';

class MemoryStorage implements LeaderboardStorage {
  private values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('Leaderboard', () => {
  it('sorts and persists the top ten scores', () => {
    const storage = new MemoryStorage();
    const leaderboard = new Leaderboard('scores', storage);
    for (let i = 0; i < 12; i++)
      leaderboard.submit({
        name: 'P' + i,
        score: i,
        stage: 6,
        difficulty: 'normal',
        character: 'reimu-yukari',
      });
    expect(leaderboard.getEntries()).toHaveLength(10);
    expect(leaderboard.getEntries()[0].score).toBe(11);
    expect(new Leaderboard('scores', storage).getEntries()[0].name).toBe('P11');
  });
});
