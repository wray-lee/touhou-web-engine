import { describe, it, expect } from 'vitest';
import { HUD } from './HUD';
import { Player } from '../player/Player';

describe('HUD System', () => {
  it('formats score, lives, bombs and power correctly', () => {
    const player = new Player();
    player.score = 125000;
    player.lives = 3;
    player.bombs = 2;
    player.power = 128;
    player.graze = 45;

    const hud = new HUD();
    hud.updateFromPlayer(player);

    expect(hud.formattedScore).toBe('0000125000');
    expect(hud.lives).toBe(3);
    expect(hud.bombs).toBe(2);
    expect(hud.power).toBe(128);
    expect(hud.graze).toBe(45);
  });

  it('displays active spellcard banner with timer', () => {
    const hud = new HUD();
    hud.showSpellCard('夜符「Night Bird」', 40);

    expect(hud.spellCardName).toBe('夜符「Night Bird」');
    expect(hud.spellCardTime).toBe(40);
  });
});
