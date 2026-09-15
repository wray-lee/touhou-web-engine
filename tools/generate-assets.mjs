import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Canvas, savePng, loadPngCanvas, rgb, alphaColor, shade, straighten } from './art/png.mjs';
import { paintCharacter, paintCharacterFrames } from './art/characters.mjs';
import { BOSSES, ENEMIES, PLAYERS } from './art/specs.mjs';
import { BULLET_SHAPES, BULLET_SHAPE_KEYS, BULLET_PALETTE, paintBullet, paintLaser, paintPlayerShot, paintExplosion, paintGlow, paintRing, paintBombFlash } from './art/bullets.mjs';
import { paintStageLayers, STAGE_THEMES } from './art/backgrounds.mjs';
import { paintHudPanel, paintSpellBanner, paintHpFrame, paintHpFill, paintPlayfieldFrame, paintTitleBackdrop, paintTouchButton, paintPortraitFrame } from './art/ui.mjs';
import { buildTaiseiAssets } from './art/taisei.mjs';
import { bakeTaiseiBullet, TAISEI_EXTRA_SHAPE_KEYS, BULLET_TILE, BULLET_FILL } from './art/taisei-bullets.mjs';
import { bakeTaiseiWebp } from './art/taisei-bake.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/assets');
const entries = [];
let bytes = 0;

function emit(key, canvas, relPath) {
  const file = resolve(OUT, relPath);
  savePng(file, canvas);
  bytes += existsSync(file) ? 0 : 0;
  entries.push([key, `/assets/${relPath.replace(/\\\\/g, '/')}`]);
  return file;
}

/**
 * Taisei select art is posed leaning off vertical; straighten() measures the
 * painted spine and rotates it upright so the renderer only adds movement lean.
 */
const TAISEI_FIX = [
  ['reimu-yukari', 'public/assets/taisei/player/reimu.png'],
  ['marisa-alice', 'public/assets/taisei/player/marisa.png'],
  ['youmu-yuyuko', 'public/assets/taisei/player/youmu.png'],
];

const PLAYER_FRAMES = 6;

function playerSprites() {
  let frames = 0;
  for (const [id, spec] of Object.entries(PLAYERS)) {
    const loop = paintCharacterFrames(spec, PLAYER_FRAMES);
    const still = loop[0].trimAlpha(0.03, 2);
    const s = 124 / still.height;
    const scaled = still.resize(Math.max(1, Math.round(still.width * s)), 124);
    const cv = new Canvas(112, 132);
    cv.blit(scaled, Math.round((112 - scaled.width) / 2), 4);
    emit('player:' + id, cv, 'player/' + id + '.png');
    // Idle loop so every member breathes on screen, matching the upstream sheets.
    loop.forEach((frame, index) => {
      const t = frame.trimAlpha(0.03, 2);
      const sc = 124 / t.height;
      const big = t.resize(Math.max(1, Math.round(t.width * sc)), 124);
      const sheet = new Canvas(112, 132);
      sheet.blit(big, Math.round((112 - big.width) / 2), 4);
      emit(`player-frame:${id}:frame${index}`, sheet, `player/${id}-f${index}.png`);
      frames += 1;
    });
  }
  return frames;
  for (const [id, rel] of TAISEI_FIX) {
    const src = loadPngCanvas(resolve(ROOT, rel));
    const upright = straighten(src).canvas.trimAlpha(0.04, 2);
    const target = 120;
    const scaled = upright.resize(Math.max(1, Math.round((upright.width * target) / upright.height)), target);
    const cv = new Canvas(120, 128);
    cv.blit(scaled, Math.round((120 - scaled.width) / 2), 128 - scaled.height);
    emit('player-taisei:' + id, cv, 'player/taisei-' + id + '.png');
  }
}

/** Frames per idle loop. Frame 0 doubles as the portrait / static fallback. */
const CHAR_FRAMES = 6;

/**
 * The in-house painter covers every character Taisei does not ship. Each spec
 * gets a full idle loop (bob, hair sway, skirt swing, wing flap) so bosses and
 * fairies breathe on screen exactly like the vendored upstream sheets.
 */
function characterSprites() {
  let frames = 0;
  const tables = [
    ['boss', BOSSES, CHAR_FRAMES],
    ['enemy', ENEMIES, CHAR_FRAMES],
  ];
  for (const [kind, table, count] of tables) {
    for (const [key, spec] of Object.entries(table)) {
      const loop = paintCharacterFrames(spec, count);
      emit(`sprite:${kind}:${key}`, loop[0], `sprites/${kind}-${key}.png`);
      loop.forEach((frame, index) => {
        emit(`sprite:${kind}:${key}:frame${index}`, frame, `sprites/${kind}-${key}-f${index}.png`);
        frames += 1;
      });
    }
  }
  return frames;
}

/**
 * Danmaku art comes from the vendored Taisei bullet masks whenever they exist:
 * upstream ships R/G/B channel masks plus full-colour charms, and
 * tools/art/taisei-bullets.mjs replays Taisei's own sprite_bullet shader to bake
 * one PNG per shape x palette colour. The procedural painters stay as the
 * fallback for shapes Taisei does not have.
 */
function bulletSprites() {
  const shapes = [...BULLET_SHAPE_KEYS, ...TAISEI_EXTRA_SHAPE_KEYS.filter((s) => !BULLET_SHAPE_KEYS.includes(s))];
  let vendored = 0;
  for (const shape of shapes) {
    const master = bakeTaiseiBullet(ROOT, shape, 0xffffff, BULLET_TILE, BULLET_FILL);
    for (const [name, hex] of Object.entries(BULLET_PALETTE)) {
      const taisei = bakeTaiseiBullet(ROOT, shape, hex, BULLET_TILE, BULLET_FILL);
      if (taisei) {
        vendored += 1;
        emit(`bullet:${shape}:${name}`, taisei, `bullets/${shape}-${name}.png`);
      } else {
        emit(`bullet:${shape}:${name}`, paintBullet(shape, hex), `bullets/${shape}-${name}.png`);
      }
    }
    if (master) emit(`bullet:${shape}:master`, master, `bullets/${shape}-master.png`);
    else emit(`bullet:${shape}:master`, paintBullet(shape, 0xffffff), `bullets/${shape}-master.png`);
  }
  emit('bullet:laser', paintLaser(48, 48, 0xffffff), 'bullets/laser.png');
  return { shapes, vendored };
}

/** One shot sprite per playable member, so the focus switch changes the weapon look. */
const MEMBER_SHOTS = {
  reimu: ['orb', [0xff3344, 0xfff0e6]],
  yukari: ['lance', [0xb98bff, 0xf3e8ff]],
  marisa: ['laser', [0xffd447, 0xfff1a8]],
  alice: ['orb', [0xff7ad0, 0xfff0f8]],
  sakuya: ['lance', [0x9ee8ff, 0xe8f7ff]],
  remilia: ['fan', [0xff5470, 0xffe0e8]],
  youmu: ['fan', [0x8fe8c0, 0xf2fff8]],
  yuyuko: ['orb', [0xc7a8ff, 0xf8f3ff]],
};

function shotSprites() {
  for (const [id, [style, [c, a]]] of Object.entries(MEMBER_SHOTS)) {
    emit(`shot:${id}`, paintPlayerShot(c, a, style), `shots/${id}.png`);
  }
}

function fxSprites() {
  const frames = 8;
  for (let i = 0; i < frames; i++) emit(`fx:explosion:${i}`, paintExplosion(i, frames), `fx/explosion-${i}.png`);
  emit('fx:glow', paintGlow(64), 'fx/glow.png');
  emit('fx:ring', paintRing(96), 'fx/ring.png');
  emit('fx:bombFlash', paintBombFlash(256), 'fx/bomb-flash.png');
}

function backgroundSprites() {
  for (const theme of STAGE_THEMES) {
    const { sky, mid, near } = paintStageLayers(theme);
    emit(`bg:${theme}:sky`, sky, `bg/${theme}-sky.png`);
    emit(`bg:${theme}:mid`, mid, `bg/${theme}-mid.png`);
    emit(`bg:${theme}:near`, near, `bg/${theme}-near.png`);
  }
}

function uiSprites() {
  emit('ui:hudPanel', paintHudPanel(), 'ui/hud-panel.png');
  emit('ui:spellBanner', paintSpellBanner(), 'ui/spell-banner.png');
  emit('ui:hpFrame', paintHpFrame(), 'ui/hp-frame.png');
  emit('ui:hpFill', paintHpFill(), 'ui/hp-fill.png');
  emit('ui:frame', paintPlayfieldFrame(), 'ui/playfield-frame.png');
  emit('ui:title', paintTitleBackdrop(), 'ui/title-backdrop.png');
  emit('ui:portrait', paintPortraitFrame(), 'ui/portrait-frame.png');
  for (const g of ['bomb', 'focus', 'pause', 'shoot']) emit(`ui:touch:${g}`, paintTouchButton(g), `ui/touch-${g}.png`);
}

function writeManifest() {
  mkdirSync(resolve(ROOT, 'src/games/th08/data'), { recursive: true });
  const lines = [
    '/* AUTO-GENERATED by tools/generate-assets.mjs - do not edit by hand. */',
    '',
    '/** Every texture the client can request, keyed by logical name. */',
    'export const ASSET_MANIFEST: Record<string, string> = {',
  ];
  for (const [key, url] of entries.sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(url)},`);
  }
  lines.push('};', '');
  lines.push('/** Bullet colours are baked into textures; runtime snaps to the nearest name. */');
  lines.push('export const BULLET_PALETTE: Record<string, number> = {');
  for (const [name, hex] of Object.entries(BULLET_PALETTE)) lines.push(`  ${JSON.stringify(name)}: ${hex},`);
  lines.push('};', '');
  lines.push('export const BULLET_SHAPE_KEYS = ' + JSON.stringify(bulletStats.shapes) + ';');
  lines.push('');
  lines.push('export const ASSET_KEYS = Object.keys(ASSET_MANIFEST);');
  lines.push('');
  writeFileSync(resolve(ROOT, 'src/games/th08/data/asset-manifest.ts'), lines.join('\n'));
  return entries.length;
}

/**
 * Vendored Taisei art (CC-BY-SA 4.0, see public/assets/taisei/COPYING.txt) is merged
 * into the same manifest under the taisei:* namespace; procedural textures stay as the
 * fallback for every sprite Taisei does not ship.
 */
function taiseiSprites() {
  const taisei = buildTaiseiAssets(ROOT);
  for (const [key, url] of Object.entries(taisei.textures)) entries.push([key, url]);
  if (taisei.missing.length) console.log('taisei: ' + taisei.missing.length + ' optional sprites absent (procedural fallback in use)');
  return Object.keys(taisei.textures).length;
}

// Merge Taisei's split alpha channels and re-encode the bullet masks before
// anything reads them; a no-op (with a warning) when ffmpeg is unavailable.
const bake = bakeTaiseiWebp(ROOT);
if (!bake.bin) console.log('taisei: ffmpeg not found - raw webp kept, split-alpha sprites may look wrong');
else if (bake.failures.length) console.log('taisei: ' + bake.failures.length + ' webp files failed to bake');

const playerFrames = playerSprites();
characterSprites();
const bulletStats = bulletSprites();
shotSprites();
fxSprites();
backgroundSprites();
uiSprites();
const taiseiCount = taiseiSprites();
const count = writeManifest();
console.log(`bullets: ${bulletStats.vendored} baked from real Taisei art`);
console.log(`player idle frames: ${playerFrames}`);
console.log(`generated ${count - taiseiCount} procedural + ${taiseiCount} vendored Taisei textures -> public/assets + src/games/th08/data/asset-manifest.ts`);


