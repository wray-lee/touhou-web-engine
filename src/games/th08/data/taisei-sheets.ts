import { AnimatedSheet, taiseiFrameKey } from '../../../engine/renderer/PixiRenderer';
import type { PixiRenderer } from '../../../engine/renderer/PixiRenderer';
import type { TaiseiAnim } from '../../../engine/renderer/TaiseiAnim';
import {
  TAISEI_ANIM,
  TAISEI_BOSS_BY_SPRITEKEY,
  TAISEI_ENEMY_BY_SPRITEKEY,
  TAISEI_PLAYER_BY_CHARACTER,
  TAISEI_SCALE,
} from './taisei-assets';

/** Members Taisei has no sheet for; they use our own painted idle loop. */
const PROCEDURAL_MEMBERS = ['yukari', 'alice', 'sakuya', 'remilia', 'yuyuko'];

/** Six-frame idle bob, played straight through with no lean groups. */
const IDLE_ANIM: TaiseiAnim = {
  main: { frames: [0, 1, 2, 3, 4, 5], delay: 8, mirror: false },
};

/**
 * Hand the renderer the real Taisei sprite sheets.
 *
 * Keys follow the slots PixiRenderer looks up: 'player:<characterId>',
 * 'enemy:<spriteKey>' and 'boss:<spriteKey>'. Anything Taisei does not ship
 * (Sakuya's team, the TH08-only bosses) is simply left unregistered so the
 * procedural painter keeps working.
 */
export function registerTaiseiSheets(renderer: PixiRenderer): number {
  let count = 0;

  for (const [member, sheet] of Object.entries(TAISEI_PLAYER_BY_CHARACTER)) {
    const anim = TAISEI_ANIM['player/' + sheet];
    if (!anim) continue;
    renderer.registerSheet('player:' + member, {
      frameKey: taiseiFrameKey('taisei:player', sheet),
      anim,
      scale: TAISEI_SCALE,
      steer: true,
    } satisfies AnimatedSheet);
    count += 1;
  }

  // Members Taisei does not ship get our own six-frame idle loop, sized to the
  // same on-screen height so the focus switch never changes the ship scale.
  for (const member of PROCEDURAL_MEMBERS) {
    renderer.registerSheet('player:' + member, {
      frameKey: (frame: number) => 'player-frame:' + member + ':frame' + frame,
      anim: IDLE_ANIM,
      scale: TAISEI_SCALE,
      steer: false,
    } satisfies AnimatedSheet);
    count += 1;
  }

  for (const [spriteKey, sheet] of Object.entries(TAISEI_ENEMY_BY_SPRITEKEY)) {
    const anim = TAISEI_ANIM['enemy/' + sheet];
    if (!anim) continue;
    renderer.registerSheet('enemy:' + spriteKey, {
      frameKey: taiseiFrameKey('taisei:enemy', sheet),
      anim,
      scale: TAISEI_SCALE,
      steer: true,
    } satisfies AnimatedSheet);
    count += 1;
  }

  for (const [spriteKey, sheet] of Object.entries(TAISEI_BOSS_BY_SPRITEKEY)) {
    const anim = TAISEI_ANIM['boss/' + sheet];
    if (!anim) continue;
    renderer.registerSheet('boss:' + spriteKey, {
      frameKey: taiseiFrameKey('taisei:boss', sheet),
      anim,
      scale: TAISEI_SCALE,
      steer: false,
    } satisfies AnimatedSheet);
    count += 1;
  }

  return count;
}
