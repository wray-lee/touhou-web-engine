/**
 * Vendor Taisei art into the asset manifest.
 * Reads public/assets/taisei/** (populated by tools/fetch-taisei.mjs) and returns
 * texture URLs plus the animation groups declared in Taisei's own .ani files.
 *
 * Taisei art is CC-BY-SA 4.0 - attribution lives in public/assets/taisei/COPYING.txt.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, posix } from 'node:path';

const pad = (n) => String(n).padStart(4, '0');

/** Parse one Taisei .ani body into { group: { frames, delay, mirror } }. */
export function parseAni(text) {
  const groups = {};
  let spriteCount = 0;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const count = line.match(/^@sprite_count\s*=\s*(\d+)/);
    if (count) {
      spriteCount = Number(count[1]);
      continue;
    }
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const name = line.slice(0, eq).trim().replace(/[()]/g, '');
    if (!name) continue;
    let mirror = false;
    let delay = 6;
    const frames = [];
    for (const tok of line.slice(eq + 1).trim().split(/\s+/)) {
      if (tok === 'm') {
        mirror = true;
      } else if (/^d\d+$/.test(tok)) {
        if (!frames.length) delay = Number(tok.slice(1));
      } else if (/^\d+$/.test(tok)) {
        const f = Number(tok);
        if (!frames.length || frames[frames.length - 1] !== f) frames.push(f);
      }
    }
    if (frames.length) groups[name] = { frames, delay, mirror };
  }
  return { groups, spriteCount };
}

/**
 * Taisei mirrors the lean frames for left movement (`left = m d10 0 1 2 3`).
 * We bake the mirrored copies as their own frames so Pixi only has to swap textures.
 */
function withMirror(groups) {
  const out = {};
  for (const [name, g] of Object.entries(groups)) out[name] = g;
  return out;
}

function listFiles(dir) {
  return existsSync(dir) ? readdirSync(dir).filter((f) => !f.startsWith('.')) : [];
}

function frameFiles(dir, base) {
  const exts = ['.png', '.webp'];
  const found = [];
  for (const ext of exts) {
    for (let i = 0; i < 64; i++) {
      const file = base + '.frame' + pad(i) + ext;
      if (existsSync(join(dir, file))) found.push({ index: i, file, ext });
    }
    if (found.length) break;
  }
  return found.sort((a, b) => a.index - b.index);
}

export const TAISEI_URL_ROOT = '/assets/taisei';

/**
 * @param root project root
 * @returns {{ textures: Record<string,string>, anim: Record<string, object>,
 *            playerByName: Record<string,string>, enemyByName: Record<string,string>,
 *            bossByName: Record<string,string>, missing: string[] }}
 */
export function buildTaiseiAssets(root) {
  const dir = join(root, 'public', 'assets', 'taisei');
  const textures = {};
  const anim = {};
  const missing = [];


  /*
   * Taisei keeps the alpha of a few sprites (the focus circles, some portraits) in a
   * sibling .alphamap.webp, so the colour file on its own is fully opaque and renders
   * as a solid blob. tools/art/taisei-bake.mjs merges each pair into
   * baked/<name>.png, which is what the client should load. Returns null for the raw
   * mask half of a pair: greyscale data with no business in a texture manifest.
   */
  const resolveAlpha = (relPath) => {
    if (!relPath.endsWith('.webp')) return relPath;
    if (relPath.endsWith('.alphamap.webp')) return null;
    const baked = 'baked/' + relPath.replace(/\.webp$/, '.png');
    return existsSync(join(dir, baked)) ? baked : relPath;
  };

  const add = (key, relPath) => {
    const resolved = resolveAlpha(relPath);
    if (resolved === null) return false;
    if (!existsSync(join(dir, resolved))) {
      missing.push(resolved);
      return false;
    }
    textures[key] = TAISEI_URL_ROOT + '/' + resolved.split(/[\\/]/).join(posix.sep);
    return true;
  };

  const addSprite = (namespace, group, base) => {
    const frames = frameFiles(join(dir, group), base);
    if (!frames.length) {
      missing.push(group + '/' + base + '.frameNNNN');
      return [];
    }
    for (const f of frames) add('taisei:' + namespace + ':' + base + ':frame' + pad(f.index), group + '/' + f.file);
    const aniFile = join(dir, 'ani', group, base + '.ani');
    if (existsSync(aniFile)) {
      const parsed = parseAni(readFileSync(aniFile, 'utf8'));
      anim[namespace + '/' + base] = withMirror(parsed.groups);
    }
    return frames.map((f) => f.index);
  };

  const playerByName = {};
  for (const name of ['reimu', 'marisa', 'youmu', 'sanae', 'iyori']) {
    const idx = addSprite('player', 'player', name);
    if (idx.length) playerByName[name] = idx;
  }
  const enemyByName = {};
  for (const name of ['fairy_blue', 'fairy_red', 'bigfairy', 'hugefairy', 'superfairy', 'swirl']) {
    const idx = addSprite('enemy', 'enemy', name);
    if (idx.length) enemyByName[name] = idx;
  }
  const bossByName = {};
  for (const name of ['cirno', 'elly', 'hina', 'iku', 'iku_mid', 'kurumi', 'scuttle', 'wriggle', 'wriggleex']) {
    const idx = addSprite('boss', 'boss', name);
    if (idx.length) bossByName[name] = idx;
  }

  for (const f of listFiles(join(dir, 'proj'))) add('taisei:proj:' + f.replace(/\.[a-z]+$/, ''), 'proj/' + f);
  for (const f of listFiles(join(dir, 'item'))) add('taisei:item:' + f.replace(/\.[a-z]+$/, ''), 'item/' + f);
  for (const f of listFiles(join(dir, 'part'))) add('taisei:part:' + f.replace(/\.[a-z]+$/, ''), 'part/' + f);
  for (const f of listFiles(join(dir, 'ui'))) {
    if (f === 'difficulty' || f === 'hud' || f === 'menu') continue;
    add('taisei:ui:' + f.replace(/\.[a-z]+$/, ''), 'ui/' + f);
  }
  for (const f of listFiles(join(dir, 'ui', 'difficulty'))) add('taisei:difficulty:' + f.replace(/\.[a-z]+$/, ''), 'ui/difficulty/' + f);
  for (const f of listFiles(join(dir, 'ui', 'hud'))) add('taisei:ui:' + f.replace(/\.[a-z]+$/, ''), 'ui/hud/' + f);
  for (const f of listFiles(join(dir, 'ui', 'menu'))) add('taisei:ui:' + f.replace(/\.[a-z]+$/, ''), 'ui/menu/' + f);
  for (const f of listFiles(join(dir, 'huge'))) add('taisei:huge:' + f.replace(/\.[a-z]+$/, ''), 'huge/' + f);
  for (const f of listFiles(join(dir, 'portraits', 'dialog'))) {
    const key = f.replace(/\.(webp|png)$/, '');
    add('taisei:portrait:' + key.replace(/_face_normal$/, '').replace(/_face_angry$/, '_angry'), 'portraits/dialog/' + f);
  }
  for (const f of listFiles(join(dir, 'fire'))) add('taisei:fire:' + f.replace(/\.[a-z]+$/, ''), 'fire/' + f);
  for (const f of listFiles(dir)) {
    if (!/\.(png|webp)$/.test(f)) continue;
    add('taisei:fx:' + f.replace(/\.[a-z]+$/, ''), f);
  }

  return { textures, anim, playerByName, enemyByName, bossByName, missing };
}
