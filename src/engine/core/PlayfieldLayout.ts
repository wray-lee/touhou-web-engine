/**
 * The one layout the whole product agrees on.
 *
 * Touhou 8 draws a 384x448 playfield inside a 640x480 window and keeps the
 * right-hand strip for the HUD. Every layer that has to place something on
 * screen — the Pixi renderer, the pointer->world mapping, the sim clip box —
 * reads these numbers, so the ship cannot end up a different place from its
 * own hitbox.
 */

export const CANVAS_W = 640;
export const CANVAS_H = 480;

/** Logical (script / ECL) field size. */
export const PLAYFIELD_W = 384;
export const PLAYFIELD_H = 448;

/** Where the field sits inside the canvas. */
export const PLAYFIELD_X = 32;
export const PLAYFIELD_Y = 16;

/** Canvas space -> world (script) space. */
export function canvasToWorldX(x: number): number {
  return x - PLAYFIELD_X;
}

export function canvasToWorldY(y: number): number {
  return y - PLAYFIELD_Y;
}

/** World (script) space -> canvas space. */
export function worldToCanvasX(x: number): number {
  return x + PLAYFIELD_X;
}

export function worldToCanvasY(y: number): number {
  return y + PLAYFIELD_Y;
}
