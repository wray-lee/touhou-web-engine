import { describe, expect, it } from 'vitest';
import {
  CANVAS_H,
  CANVAS_W,
  PLAYFIELD_H,
  PLAYFIELD_W,
  PLAYFIELD_X,
  PLAYFIELD_Y,
  canvasToWorldX,
  canvasToWorldY,
  worldToCanvasX,
  worldToCanvasY,
} from './PlayfieldLayout';

/**
 * The pointer->world mapping is the one place a mouse user and the sim have to
 * agree exactly, so the offsets are pinned here rather than re-derived at each
 * call site.
 */
describe('PlayfieldLayout', () => {
  it('is the retail 384x448 field inside a 640x480 window', () => {
    expect([CANVAS_W, CANVAS_H]).toEqual([640, 480]);
    expect([PLAYFIELD_W, PLAYFIELD_H]).toEqual([384, 448]);
    // The HUD strip has to fit to the right of the field.
    expect(PLAYFIELD_X + PLAYFIELD_W).toBeLessThan(CANVAS_W);
    expect(PLAYFIELD_Y + PLAYFIELD_H).toBeLessThan(CANVAS_H);
  });

  it('lands the canvas centre where the running game reports it', () => {
    // Live check: clicking the middle of the canvas parked the ship at 288,224.
    expect(canvasToWorldX(CANVAS_W / 2)).toBe(288);
    expect(canvasToWorldY(CANVAS_H / 2)).toBe(224);
  });

  it('round-trips between canvas and world space', () => {
    for (const [x, y] of [
      [0, 0],
      [32, 16],
      [288, 224],
      [416, 464],
    ]) {
      expect(worldToCanvasX(canvasToWorldX(x))).toBe(x);
      expect(worldToCanvasY(canvasToWorldY(y))).toBe(y);
    }
  });
});
