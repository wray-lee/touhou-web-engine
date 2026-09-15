import { describe, it, expect } from 'vitest';
import { HUD } from './HUD';
import { Player } from '../player/Player';

describe('HUD System', () => {
  it('raises and retires the boss-approach warning', () => {
    const hud = new HUD();
    hud.showBossWarning(30);
    expect(hud.bossWarning).toBe(true);
    expect(hud.centerMessage).toBe('ENEMY APPROACHING');
    expect(hud.centerMessageTimer).toBe(30);

    hud.update(29);
    expect(hud.bossWarning).toBe(true);
    hud.update(1);
    expect(hud.centerMessage).toBeNull();
    expect(hud.bossWarning).toBe(false);
  });

  it('clears the warning when a plain message replaces it', () => {
    const hud = new HUD();
    hud.showBossWarning(60);
    hud.showMessage('STAGE CLEAR!', 60);
    expect(hud.bossWarning).toBe(true);
    hud.update(61);
    expect(hud.bossWarning).toBe(false);
  });

  it('formats score, lives, bombs and power correctly', () => {
    const player = new Player();
    player.score = 125000;
    player.lives = 3;
    player.bombs = 2;
    player.power = 128;
    player.graze = 45;

    const hud = new HUD();
    hud.updateFromPlayer(player);

    // Retail prints the score as nine digits, then a tenth column of its own
    // holding the continues used (`Gui.cpp:1428-1433`).
    expect(hud.formattedScore).toBe('000125000 0');
    hud.retries = 12;
    expect(hud.formattedScore).toBe('000125000 9');
    hud.hiScore = 987654321;
    hud.hiScoreContinues = 2;
    expect(hud.formattedHiScore).toBe('987654321 2');
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
