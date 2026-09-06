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
    hud.showSpellCard('夜符「Night Bird」', 40, 1000000);

    expect(hud.spellCardName).toBe('夜符「Night Bird」');
    expect(hud.spellCardTime).toBe(40);
    expect(hud.spellCardBonus).toBe(1000000);
  });

  it('auto-hides spellcard banner after display duration', () => {
    const hud = new HUD();
    hud.showSpellCard('闇符「Demarcation」', 45, 1500000, 0); // no display window

    expect(hud.spellCardName).toBe('闇符「Demarcation」');
    // display window (animation) elapses — banner text remains until hideSpellCard
    hud.update(1);
    expect(hud.spellCardName).toBe('闇符「Demarcation」');
    expect(hud.spellCardDisplayTimer).toBe(0);

    hud.hideSpellCard();
    expect(hud.spellCardName).toBeNull();
    expect(hud.spellCardDisplayTimer).toBe(0);
  });

  it('keeps banner visible during the display window', () => {
    const hud = new HUD();
    hud.showSpellCard('闇符「Demarcation」', 45, 1500000, 3); // 3-frame window

    hud.update(1);
    expect(hud.spellCardName).toBe('闇符「Demarcation」');
    expect(hud.spellCardDisplayTimer).toBe(2);

    hud.update(3); // window elapsed
    expect(hud.spellCardDisplayTimer).toBe(0);
    expect(hud.spellCardName).toBe('闇符「Demarcation」');
  });
});
