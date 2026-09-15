/**
 * Turn a legally owned Touhou 8 install into the assets this engine runs on.
 *
 *   node tools/th08/extract.mjs <th08.dat> <thbgm.dat> [outDir]
 *
 * Everything lands under public/assets/th08/ and is git-ignored: the retail
 * archives and anything decoded out of them never enter the repository. Output
 * is split deliberately:
 *
 *   anm/    texture pages as RGBA PNG plus a manifest carrying every sprite
 *           rect and the raw animation-script bytes, which the translators turn
 *           into TypeScript while the browser only ever loads the PNGs.
 *   raw/    the script blobs verbatim (ecl / std / sht / msg / wav / mid).
 *   bgm/    each track as an ogg with intro and loop points in seconds.
 *
 * Formats come from th08web-ref: PbgArchive.cpp (ZGBP), Lzss.cpp,
 * AnmManager.hpp (AnmRawEntry / AnmTextureHeader) and zwave.hpp (ThBgmFormat).
 */
import fs from 'fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { openArchive } from './pbg.mjs';
import { parseAnm } from './anm.mjs';
import { encodePNG } from '../art/png.mjs';

/**
 * ThBgmFormat, packed: char name[16]; i32 startOffset; u32 preloadAllocSize;
 * i32 introLength; i32 totalLength; then a 20-byte WAVEFORMATEX
 * {u16 tag; u16 channels; u32 rate; u32 avgBytes; u16 blockAlign; u16 bits; u16 cbSize}.
 */
const BGM_FMT_SIZE = 52;
const BGM_FMT_MAX = 64;

/** Extensions copied out of the archive untouched, for the translators. */
const RAW_EXTENSIONS = [
  '.ecl',
  '.std',
  '.sht',
  '.dat',
  '.wav',
  '.mid',
  '.rpy',
  '.end',
  '.txt',
  /* Full-frame backdrops ship as JPEG rather than ANM pages; the settlement
   * screen draws result.jpg as one unscaled quad, so it stays verbatim. */
  '.jpg',
  '.png',
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Read a NUL-terminated ASCII field. */
function cstr(buf, off, max) {
  const slice = buf.subarray(off, off + max);
  const end = slice.indexOf(0);
  return slice.subarray(0, end < 0 ? slice.length : end).toString('latin1');
}

/** Decode every .anm into PNG pages plus sprite rects and script bytes. */
function extractAnms(arc, outRoot, manifest) {
  const dir = ensureDir(path.join(outRoot, 'anm'));
  for (let i = 0; i < arc.entries.length; i++) {
    const entry = arc.entries[i];
    if (!entry.name.toLowerCase().endsWith('.anm')) continue;
    const parsed = parseAnm(arc.read(i));
    const base = entry.name.replace(/\.anm$/i, '');
    const textures = [];
    parsed.textures.forEach((t, index) => {
      const file = base + '_t' + index + '.png';
      fs.writeFileSync(path.join(dir, file), encodePNG(t.width, t.height, t.rgba));
      textures.push({ file, width: t.width, height: t.height, format: t.format, entry: t.entry });
    });
    manifest.anm[base] = {
      textures,
      entries: parsed.entries.map((e) => ({
        index: e.index,
        name: e.name,
        numSprites: e.numSprites,
        numScripts: e.numScripts,
        width: e.width,
        height: e.height,
        format: e.format,
        hasData: e.hasData,
      })),
      sprites: parsed.sprites.map((s) => ({
        entry: s.entry,
        tex: s.tex,
        id: s.id,
        x: Math.round(s.x),
        y: Math.round(s.y),
        w: Math.round(s.w),
        h: Math.round(s.h),
      })),
      scripts: parsed.scripts.map((s) => ({
        entry: s.entry,
        id: s.id,
        base64: s.bytes.toString('base64'),
      })),
    };
  }
}

/** Copy the script blobs the translators and the runtime read verbatim. */
function extractRaw(arc, outRoot, manifest) {
  const dir = ensureDir(path.join(outRoot, 'raw'));
  for (let i = 0; i < arc.entries.length; i++) {
    const name = arc.entries[i].name;
    const lower = name.toLowerCase();
    if (!lower || lower === '<end>') continue;
    if (lower.endsWith('.anm')) continue; // decomposed above
    if (!RAW_EXTENSIONS.some((ext) => lower.endsWith(ext))) continue;
    const buf = arc.read(i);
    const safe = name.replace(/[\\/:*?"<>|]/g, '_');
    fs.writeFileSync(path.join(dir, safe), buf);
    manifest.raw[name] = { file: 'raw/' + safe, size: buf.length };
  }
}

/**
 * Slice thbgm.dat into per-track files.
 *
 * thbgm.dat is one long 44.1 kHz stereo PCM stream indexed by thbgm.fmt; each
 * record gives the byte offset, the intro length and the loop length, which are
 * exactly the three numbers Web Audio needs for bufferSource.loopStart/loopEnd.
 * ffmpeg turns the sliced wav into ogg; without it the wav is kept.
 */
function extractBgm(arc, bgmPath, outRoot, manifest) {
  const fmtIndex = arc.entries.findIndex((e) => e.name.toLowerCase() === 'thbgm.fmt');
  if (fmtIndex < 0 || !fs.existsSync(bgmPath)) return;
  const fmt = arc.read(fmtIndex);
  const dir = ensureDir(path.join(outRoot, 'bgm'));
  const pcm = fs.readFileSync(bgmPath);
  for (let k = 0; k + BGM_FMT_SIZE <= fmt.length && k < BGM_FMT_MAX; k++) {
    const off = k * BGM_FMT_SIZE;
    const name = cstr(fmt, off, 16);
    if (!/^th\d/.test(name)) continue;
    const view = new DataView(fmt.buffer, fmt.byteOffset + off, BGM_FMT_SIZE);
    const start = view.getInt32(16, true);
    const intro = view.getInt32(24, true);
    const total = view.getInt32(28, true);
    const rate = view.getUint32(36, true);
    // The final track overruns the file slightly, so clamp instead of dropping it.
    const end = Math.min(pcm.length, start + intro + total);
    const blockAlign = view.getUint16(44, true) || 4;
    if (!start || !total || !rate || end <= start) continue;
    const stem = name.replace(/\.wav$/i, '');
    const data = pcm.subarray(start, end);
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + data.length, 4);
    header.write('WAVEfmt ', 8);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(2, 22);
    header.writeUInt32LE(rate, 24);
    header.writeUInt32LE(rate * blockAlign, 28);
    header.writeUInt16LE(blockAlign, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(data.length, 40);
    const wavFile = path.join(dir, stem + '.wav');
    fs.writeFileSync(wavFile, Buffer.concat([header, data]));
    const oggFile = path.join(dir, stem + '.ogg');
    const encoded =
      spawnSync('ffmpeg', [
        '-y',
        '-loglevel',
        'error',
        '-i',
        wavFile,
        '-c:a',
        'libvorbis',
        '-q:a',
        '5',
        oggFile,
      ]).status === 0;
    if (encoded) fs.rmSync(wavFile);
    const seconds = (bytes) => Number((bytes / blockAlign / rate).toFixed(4));
    manifest.bgm[stem] = {
      file: 'bgm/' + stem + (encoded ? '.ogg' : '.wav'),
      sampleRate: rate,
      introSeconds: seconds(intro),
      loopSeconds: seconds(intro + total),
    };
  }
}

export function extract(datPath, bgmPath, outRoot) {
  const arc = openArchive(datPath);
  fs.rmSync(outRoot, { recursive: true, force: true });
  ensureDir(outRoot);
  const manifest = { source: path.basename(datPath), entries: arc.entries.length, anm: {}, raw: {}, bgm: {} };
  extractAnms(arc, outRoot, manifest);
  extractRaw(arc, outRoot, manifest);
  extractBgm(arc, bgmPath, outRoot, manifest);
  manifest.anmCount = Object.keys(manifest.anm).length;
  manifest.rawCount = Object.keys(manifest.raw).length;
  manifest.bgmCount = Object.keys(manifest.bgm).length;
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  return manifest;
}

if (process.argv[1] && process.argv[1].endsWith('extract.mjs')) {
  const [dat, bgm, out] = process.argv.slice(2);
  if (!dat || !bgm) {
    console.error('usage: node tools/th08/extract.mjs <th08.dat> <thbgm.dat> [outDir]');
    process.exit(2);
  }
  const outRoot = out ?? path.join(process.cwd(), 'public', 'assets', 'th08');
  const result = extract(dat, bgm, outRoot);
  console.log(
    'entries',
    result.entries,
    '| anm',
    result.anmCount,
    '| raw',
    result.rawCount,
    '| bgm',
    result.bgmCount,
    '->',
    outRoot,
  );
}
