/**
 * Touhou 8 playfield constants.
 *
 * The original runs at 384x448 (arcadeRegionSize) inside a 640x480 window,
 * with the HUD panel occupying the right 256px.
 */

// Single source of truth lives in the engine so the renderer and the sim can
// never disagree about how big the field is.
import { PLAYFIELD_W as W, PLAYFIELD_H as H, CANVAS_W, CANVAS_H } from '../../engine/core/PlayfieldLayout';

export const PLAYFIELD_W = W;
export const PLAYFIELD_H = H;
export const PLAYFIELD_CENTER_X = PLAYFIELD_W / 2; // 192
export const PLAYFIELD_CENTER_Y = PLAYFIELD_H / 2; // 224
export const WINDOW_W = CANVAS_W;
export const WINDOW_H = CANVAS_H;

/** Respawn point: center-x, height - 64. */
export const RESPAWN_X = PLAYFIELD_CENTER_X;
export const RESPAWN_Y = PLAYFIELD_H - 64; // 384

/**
 * `GameManager::IsWithinPlayfield`, inverted. The original measures the drawn
 * sprite box rather than the bullet's centre, so a 48px eyeball is still on
 * screen when a pellet fired from the same spot has already been culled. Both
 * the cull in `BulletPool` and the bounce handler ask this one question.
 */
export function outsidePlayfield(x: number, y: number, width: number, height: number): boolean {
  return (
    width / 2 + x < 0 || x - width / 2 > PLAYFIELD_W || height / 2 + y < 0 || y - height / 2 > PLAYFIELD_H
  );
}
