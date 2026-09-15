/**
 * The shipped game's sound-effect bank, transcribed.
 *
 * Two arrays in `SoundPlayer.cpp` decide every sound the game can make:
 * `g_SFXList` (`:30-37`) names the 36 recordings, and `g_SoundBufferIdxVol`
 * (`:20-29`) turns a `SoundIdx` (`SoundPlayer.hpp:17-66`) into one of those
 * recordings plus a level in millibels. Together they are the whole sound design:
 * which file, how loud, and - because the player queues by index - which sounds can
 * never overlap themselves.
 *
 * Everything here is data, so `RETAIL_SE_FILES.length` and the entry count are
 * asserted in `RetailSound.test.ts` against the decompilation rather than trusted.
 */

import type { SeSource, SoundEffectType } from '../../../engine/audio/AudioManager';

const SE = '/assets/th08/raw';

/** `g_SFXList` (`SoundPlayer.cpp:30-37`), in buffer order. */
export const RETAIL_SE_FILES: readonly string[] = [
  `${SE}/se_plst00.wav`,
  `${SE}/se_enep00.wav`,
  `${SE}/se_pldead00.wav`,
  `${SE}/se_power0.wav`,
  `${SE}/se_power1.wav`,
  `${SE}/se_tan00.wav`,
  `${SE}/se_tan01.wav`,
  `${SE}/se_tan02.wav`,
  `${SE}/se_ok00.wav`,
  `${SE}/se_cancel00.wav`,
  `${SE}/se_select00.wav`,
  `${SE}/se_gun00.wav`,
  `${SE}/se_cat00.wav`,
  `${SE}/se_lazer00.wav`,
  `${SE}/se_lazer01.wav`,
  `${SE}/se_enep01.wav`,
  `${SE}/se_nep00.wav`,
  `${SE}/se_damage00.wav`,
  `${SE}/se_item00.wav`,
  `${SE}/se_kira00.wav`,
  `${SE}/se_kira01.wav`,
  `${SE}/se_kira02.wav`,
  `${SE}/se_extend.wav`,
  `${SE}/se_timeout.wav`,
  `${SE}/se_graze.wav`,
  `${SE}/se_powerup.wav`,
  `${SE}/se_pause.wav`,
  `${SE}/se_cardget.wav`,
  `${SE}/se_option.wav`,
  `${SE}/se_damage01.wav`,
  `${SE}/se_timeout2.wav`,
  `${SE}/se_opshow.wav`,
  `${SE}/se_ophide.wav`,
  `${SE}/se_invalid.wav`,
  `${SE}/se_slash.wav`,
  `${SE}/se_item01.wav`,
  // The two rows below are ours, not the retail table: `se_bonus.wav` and
  // `se_border.wav` are in `th08.dat` but no `SoundIdx` names them, so the port
  // hangs them off the end of the range instead of inventing retail indices.
  `${SE}/se_bonus.wav`,
  `${SE}/se_border.wav`,
];

/**
 * `g_SoundBufferIdxVol` (`SoundPlayer.cpp:20-29`), one row per `SoundIdx`.
 *
 * The `unk` column of the struct is left out: it is written to `unk408[]` and never
 * read on any path in the decompilation.
 */
export const RETAIL_SE_VOL: readonly { buffer: number; mb: number }[] = [
  { buffer: 0, mb: -1900 }, //  0 SOUND_SHOOT - also the pause-menu cursor
  { buffer: 0, mb: -2100 }, //  1 SOUND_1
  { buffer: 1, mb: -1200 }, //  2 SOUND_2 - familiar/enemy energy
  { buffer: 1, mb: -1500 }, //  3 SOUND_3
  { buffer: 2, mb: -1100 }, //  4 SOUND_PICHUN - player death
  { buffer: 3, mb: -700 }, //   5 SOUND_5
  { buffer: 4, mb: -700 }, //   6 SOUND_6
  { buffer: 5, mb: -1900 }, //  7 SOUND_7 - shot, quiet
  { buffer: 6, mb: -2200 }, //  8 SOUND_8 - shot, quieter
  { buffer: 7, mb: -2400 }, //  9 SOUND_9 - shot, quietest
  { buffer: 8, mb: -1100 }, // 10 SOUND_SELECT - confirm
  { buffer: 9, mb: -1100 }, // 11 SOUND_BACK
  { buffer: 10, mb: -1500 }, // 12 SOUND_MOVE_MENU - cursor tick
  { buffer: 11, mb: -1500 }, // 13 SOUND_D - bomb
  { buffer: 12, mb: -1000 }, // 14 SOUND_E - spell declaration
  { buffer: 5, mb: -1100 }, // 15 SOUND_F - the player's own shot
  { buffer: 13, mb: -1300 }, // 16 SOUND_10 - laser
  { buffer: 14, mb: -1400 }, // 17 SOUND_11 - laser / bomb beam
  { buffer: 15, mb: -900 }, //  18 SOUND_TOTAL_BOSS_DEATH
  { buffer: 16, mb: -400 }, //  19 SOUND_13 - loud, bombs
  { buffer: 17, mb: -880 }, //  20 SOUND_DAMAGE - hit something with a gauge
  { buffer: 18, mb: -1500 }, // 21 SOUND_ITEM
  { buffer: 5, mb: -300 }, //  22 SOUND_16 - shot, very loud
  { buffer: 6, mb: -1800 }, // 23 SOUND_17
  { buffer: 7, mb: -1800 }, // 24 SOUND_18
  { buffer: 19, mb: -1100 }, // 25 SOUND_19 - sparkle
  { buffer: 20, mb: -1300 }, // 26 SOUND_1A
  { buffer: 21, mb: -1500 }, // 27 SOUND_1B
  { buffer: 22, mb: -500 }, //  28 SOUND_1UP - extend
  { buffer: 23, mb: -500 }, //  29 SOUND_TIMEOUT - stage clock out
  { buffer: 24, mb: -1100 }, // 30 SOUND_GRAZE
  { buffer: 25, mb: -800 }, //  31 SOUND_POWERUP
  { buffer: 24, mb: -1200 }, // 32 SOUND_20
  { buffer: 19, mb: -500 }, //  33 SOUND_21 - sparkle, loud
  { buffer: 26, mb: -800 }, //  34 SOUND_PAUSE
  { buffer: 27, mb: -800 }, //  35 SOUND_SPELL_CAPTURE - card broken
  { buffer: 28, mb: -800 }, //  36 SOUND_FAMILIAR_SPAWN - option deploy
  { buffer: 29, mb: -700 }, //  37 SOUND_DAMAGE_LOW_HEALTH
  { buffer: 30, mb: -300 }, //  38 SOUND_TIMEOUT_2
  { buffer: 31, mb: -800 }, //  39 SOUND_FAMILIAR_UNHIDE - option show
  { buffer: 32, mb: -800 }, //  40 SOUND_FAMILIAR_HIDE - option hide
  { buffer: 33, mb: -200 }, //  41 SOUND_INVALID_ACTION - bomb with none left
  { buffer: 34, mb: 0 }, //     42 SOUND_2A - slash, full scale
  { buffer: 34, mb: -600 }, //  43 SOUND_2B
  { buffer: 35, mb: -800 }, //  44 SOUND_2C
  { buffer: 8, mb: -100 }, //   45 SOUND_2D
  // Ours: the two recordings the retail table does not name.
  { buffer: 36, mb: -800 }, // 46 spell-bonus chime
  { buffer: 37, mb: -1200 }, // 47 pushed against the playfield edge
];

/**
 * The indices gameplay reaches for, with the call site that proves the meaning.
 *
 * The decompilation only has the enum's placeholder names, so each of these is
 * anchored to the code that plays it.
 */
export const SE_IDX = {
  /** `Player.cpp:1327`, panned by the player's x. Not `SOUND_SHOOT`, which the
   * pause menu reuses as a cursor tick (`AsciiManager.cpp:925`). */
  playerShot: 15,
  /** `PlayerBomb.cpp:215` and eleven siblings: every team's bomb opens with this. */
  bomb: 13,
  /** `Player.cpp:539`. */
  playerDeath: 4,
  /** `Player.cpp:503`, panned by where the graze happened. */
  graze: 30,
  /** `EnemyManagerUpdate.cpp:924/926` - the second one is the low-health variant. */
  enemyDamage: 20,
  enemyDamageLow: 37,
  /** `EnemyManager.cpp:328`: `chainIndex % 2 + 2`, so a familiar's death alternates. */
  enemyDeath: 2,
  /** `Spellcard.cpp:981/1019` and `:1248`. */
  spellDeclare: 14,
  spellCapture: 35,
  /** `PlayerBomb.cpp:1101/1228/1359` and `BulletManager.cpp` laser paths. */
  laser: 17,
  /** `ItemManager.cpp:393` picks between these two by item type. */
  item: 21,
  itemAlt: 44,
  /** `ItemManager.cpp:348/447/594` and `GameManager.cpp:255`. */
  powerUp: 31,
  extend: 28,
  /** `GameManager.cpp:447`. */
  pause: 34,
  /** `Gui.cpp:682` (move), `:1648` + `AsciiManager.cpp:793` (confirm), back. */
  menuMove: 12,
  menuConfirm: 10,
  menuBack: 11,
  /** `Player.cpp:1215`: trying to bomb with zero bombs left. */
  invalid: 41,
  /** `TitleScreen.cpp:1082` and `Gui.cpp:1646`. */
  timeout: 29,
  timeout2: 38,
  /** Our own two, above the retail range. */
  bonus: 46,
  border: 47,
} as const;

/**
 * The engine's legacy sound names, expressed as retail indices.
 *
 * `playSE('shoot')` used to pick a file by guesswork; this is where the guess got
 * replaced by the table. `'pldead'` is the engine's name for index 4.
 */
export const SE_BY_NAME: Partial<Record<SoundEffectType, number>> = {
  shoot: SE_IDX.playerShot,
  bomb: SE_IDX.bomb,
  pldead: SE_IDX.playerDeath,
  'enemy-hit': SE_IDX.enemyDamage,
  graze: SE_IDX.graze,
  spellcard: SE_IDX.spellDeclare,
  item: SE_IDX.item,
  bonus: SE_IDX.bonus,
  cardget: SE_IDX.spellCapture,
  border: SE_IDX.border,
  timeout: SE_IDX.timeout,
  cancel: SE_IDX.menuBack,
  ok: SE_IDX.menuConfirm,
  select: SE_IDX.menuMove,
  pause: SE_IDX.pause,
  powerup: SE_IDX.powerUp,
  extend: SE_IDX.extend,
};

/**
 * `SoundPlayer::PlaySoundPositionedByIdx` maps the 384-wide playfield onto the
 * DirectSound pan range: `((x - 192) * 1000) / 192` (`SoundPlayer.cpp:523`). The
 * same law in -1..1 units is what the bus wants.
 */
export function panFromPlayfieldX(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(-1, Math.min(1, (x - 192) / 192));
}
/** Everything the engine's SE bus needs to speak this game's sounds. */
export const RETAIL_SE_SOURCE: SeSource = {
  files: RETAIL_SE_FILES,
  entries: RETAIL_SE_VOL,
  names: SE_BY_NAME,
};
