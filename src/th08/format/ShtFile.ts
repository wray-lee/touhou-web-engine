/**
 * Parser for Touhou 8 ply0?a.sht player shot data files.
 *
 * PlayerRawShtFile layout (from Player.hpp):
 *   i32 bombCount @ 0x04; i32 maxPower @ 0x08; f32 hitboxExtent @ 0x0C;
 *   f32 grazeExtent @ 0x10; f32 itemGrabSpeed @ 0x14; f32 itemBoxExtent @ 0x18;
 *   f32 pointItemValueLine @ 0x1c
 * `Player::AddedCallback` (`Player.cpp:1619-1633`) copies +0x0C, +0x10 and +0x18 into
 * the ship's three boxes *halved*, so the values below are half-extents.
 * We extract the known fields needed by the game.
 */

export interface ShtFile {
  /** Bomb count given when respawning. Offset +0x04, stored as f32. */
  bombCount: number;
  /** Maximum power (int field, offset +0x08). */
  maxPowerOps: number;
  /**
   * Half of the hit box's x/y extent. Offset +0x0C, stored as f32 and halved by
   * the loader (`Player.cpp:1619-1622`).
   */
  hitboxHalfExtent: number;
  /**
   * Half of the graze box. Offset +0x10, halved by the loader
   * (`Player.cpp:1624-1627`).
   */
  grazeHalfExtent: number;
  /** Homing speed for item collection. Offset +0x14, f32. */
  itemGrabSpeed: number;
  /**
   * Half of the item box. Offset +0x18, halved by the loader
   * (`Player.cpp:1629-1632`).
   */
  itemPickupHalfExtent: number;
  /** Point-of-collection line (y coordinate). Offset +0x1c, f32. */
  pointItemValueLine: number;
  /**
   * Axial move speed with focus released. Offset +0x24, f32.
   *
   * `Player.cpp:810-813` reads this off the *primary* table.
   */
  fastSpeed: number;
  /**
   * Axial move speed with focus held. Offset +0x28, f32.
   *
   * `Player.cpp:795-798` reads this off the *secondary* table, so the partner's
   * file decides how slowly the pair creeps.
   */
  slowSpeed: number;
  /** Per-axis diagonal speed, unfocused. Offset +0x2C, f32 (`:814-817`). */
  fastDiagonalSpeed: number;
  /** Per-axis diagonal speed, focused. Offset +0x30, f32 (`:799-802`). */
  slowDiagonalSpeed: number;
  /**
   * Time scale for free-falling items. Offset +0x34, f32.
   *
   * `ItemManager::Update:207-209` picks the secondary table's copy while the ship
   * is focused and the primary's otherwise, then multiplies both the item
   * position step and the gravity term by it (`:301`, `:313-316`). Seven of the
   * eight tables are 0.9; `ply02a` alone is 0.65, so Sakuya's unfocused items
   * hang in the air longer and Remilia's, flown while focused, do not.
   */
  itemTimeScale: number;
}

export function parseSht(buf: Buffer | Uint8Array): ShtFile {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return {
    bombCount: Math.round(dv.getFloat32(4, true)),
    maxPowerOps: dv.getInt32(8, true),
    hitboxHalfExtent: dv.getFloat32(0x0c, true) / 2,
    grazeHalfExtent: dv.getFloat32(0x10, true) / 2,
    itemGrabSpeed: dv.getFloat32(0x14, true),
    itemPickupHalfExtent: dv.getFloat32(0x18, true) / 2,
    pointItemValueLine: dv.getFloat32(0x1c, true),
    fastSpeed: dv.getFloat32(0x24, true),
    slowSpeed: dv.getFloat32(0x28, true),
    fastDiagonalSpeed: dv.getFloat32(0x2c, true),
    slowDiagonalSpeed: dv.getFloat32(0x30, true),
    itemTimeScale: dv.getFloat32(0x34, true),
  };
}
