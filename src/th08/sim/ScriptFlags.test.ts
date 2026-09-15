/**
 * ECL ops 79/80/81 are a bit address bus over `enemy+0x3324`/`+0x3328`, not three
 * flavours of "assign the flag word". They used to be, which silently dropped the
 * two bits the renderer and the bounds check read: `EMUF1_NO_SPRITE` (bit 4) and
 * `EMUF1_ALLOW_OFFSCREEN` (bit 28). 620 call sites across the nine stage scripts
 * drive them, so this is the widest flag surface in the game.
 */
import { describe, expect, it } from 'vitest';
import { EnemySlot } from './EnemySlot';
import { createGameState } from './GameState';

const slot = () => {
  const s = new EnemySlot(createGameState());
  s.reset(100, 100, 500, createGameState());
  return s;
};

describe('script flag bus (ECL ops 79..81)', () => {
  it('op 79 stores three of its six selectors inverted', () => {
    const s = slot();
    s.writeScriptFlags(16);
    // `v & 0x10` keeps polarity into bit 28; `!(v&1)`, `!(v&2)`, `!(v&4)` land on
    // bits 6, 2 and 3; `v & 8` was 0 so bit 4 stays clear.
    expect(s.allowOffscreen).toBe(true);
    expect(s.noSprite).toBe(false);
    expect(s.flags & 0x40).not.toBe(0);
    expect(s.flags & 0x04).not.toBe(0);
    expect(s.flags & 0x08).not.toBe(0);
    // Writing the word must not disturb the bits no selector addressed.
    expect(s.flags & 0x01).toBe(0);
  });

  it('op 79 with an all-clear operand lights the three inverted bits and nothing else', () => {
    const s = slot();
    s.writeScriptFlags(0);
    expect(s.flags).toBe(0x40 | 0x04 | 0x08);
    expect(s.noSprite).toBe(false);
    expect(s.allowOffscreen).toBe(false);
  });

  it('op 80 sets NO_SPRITE and ALLOW_OFFSCREEN but clears the three low selectors', () => {
    const s = slot();
    s.writeScriptFlags(0);
    const before = s.flags;
    s.clearScriptFlags(8 | 16);
    expect(s.noSprite).toBe(true);
    expect(s.allowOffscreen).toBe(true);
    // The inverted bits were not addressed, so they survive.
    expect(s.flags & 0x4c).toBe(before & 0x4c);
  });

  it('op 81 is the mirror image: it clears NO_SPRITE and ALLOW_OFFSCREEN', () => {
    const s = slot();
    s.clearScriptFlags(8 | 16);
    expect(s.noSprite).toBe(true);
    s.setScriptFlags(8 | 16);
    expect(s.noSprite).toBe(false);
    expect(s.allowOffscreen).toBe(false);
  });

  it('the hide/unhide pair a familiar uses round-trips without touching active', () => {
    const s = slot();
    s.clearScriptFlags(2);
    expect(s.flags & 0x04).toBe(0);
    s.setScriptFlags(2);
    expect(s.flags & 0x04).not.toBe(0);
    // `active` is bit 0 of the same word; an assignment-based op 80 would clear it.
    expect(s.flags & 0x01).toBe(0);
    expect(s.active).toBe(true);
  });

  it('op 79 reaches the second flag word without clobbering the first', () => {
    const s = slot();
    s.writeScriptFlags(0x20);
    expect(s.flags2 & 0x40).not.toBe(0);
    s.setScriptFlags(0x20);
    expect(s.flags2 & 0x40).toBe(0);
  });

  it('reset clears both flag words so a recycled slot starts visible', () => {
    const s = slot();
    s.clearScriptFlags(8 | 16 | 0x20);
    const gs = createGameState();
    s.reset(10, 20, 300, gs);
    expect(s.flags).toBe(0);
    expect(s.flags2).toBe(0);
    expect(s.noSprite).toBe(false);
    expect(s.allowOffscreen).toBe(false);
  });

  it('allowOffscreen keeps a helper alive past the top edge and without it it retires', () => {
    const s = slot();
    s.setBounds(24, 24);
    // Walk it in, then straight off the top of the playfield.
    s.posX = 192;
    s.posY = 100;
    s.tick();
    expect(s.active).toBe(true);
    s.clearScriptFlags(16);
    s.posY = -400;
    s.tick();
    expect(s.active).toBe(true);
    s.setScriptFlags(16);
    s.posY = -400;
    s.tick();
    expect(s.active).toBe(false);
  });
});
