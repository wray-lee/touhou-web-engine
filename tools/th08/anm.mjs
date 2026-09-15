/**
 * Reader for Touhou 8 `.anm` packs (animation scripts + raw texture pages).
 *
 * Layout recovered from th08web-ref/src/AnmManager.{hpp,cpp}: a file is a chain
 * of 0x40-byte AnmRawEntry records linked by `nextOffset`. Each record carries
 * width/height/format plus a `textureOffset` to a "THTX" header followed by raw
 * pixels, then u32 offset tables to AnmRawSprite rects and AnmRawScript blobs.
 *
 * TH08 never ships PNGs for gameplay art, so this is the only way to get the
 * real sprites out of th08.dat.
 */
import fs from 'fs';
import { encodePNG } from '../art/png.mjs';

/** AnmRawEntry is 0x40 bytes; version must be 3. */
const ENTRY_SIZE = 0x40;

/** ZUN texture format ids -> bytes per pixel (g_TextureFormatBytesPerPixel). */
const BPP = [4, 4, 2, 2, 3, 2];

/** Decode one raw texture page into an RGBA buffer. */
function decodeTexture(view, format, width, height) {
  const rgba = new Uint8Array(width * height * 4);
  const px = view;
  for (let i = 0; i < width * height; i++) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    if (format === 5) {
      const v = px.readUInt16LE(i * 2);
      const ar = (v >> 12) & 0xf;
      r = (ar ? (v >> 8) & 0xf : 0) * 17;
      g = ((v >> 4) & 0xf) * 17;
      b = (v & 0xf) * 17;
      a = ar * 17;
    } else if (format === 2) {
      const v = px.readUInt16LE(i * 2);
      r = ((v >> 10) & 0x1f) * 255 / 31;
      g = ((v >> 5) & 0x1f) * 255 / 31;
      b = (v & 0x1f) * 255 / 31;
      a = (v >> 15) ? 255 : 0;
    } else if (format === 3) {
      const v = px.readUInt16LE(i * 2);
      r = ((v >> 11) & 0x1f) * 255 / 31;
      g = ((v >> 5) & 0x3f) * 255 / 63;
      b = (v & 0x1f) * 255 / 31;
      a = 255;
    } else if (format === 4) {
      r = px[i * 3];
      g = px[i * 3 + 1];
      b = px[i * 3 + 2];
      a = 255;
    } else {
      // D3DFMT_A8R8G8B8: the u32 value is 0xAARRGGBB, so on disk the bytes sit in
      // B,G,R,A order. Reading them as A,R,G,B rotates every channel and turns
      // opaque art transparent, which is why the faces used to vanish.
      const v = px.readUInt32LE(i * 4);
      a = (v >>> 24) & 0xff;
      r = (v >> 16) & 0xff;
      g = (v >> 8) & 0xff;
      b = v & 0xff;
    }
    rgba[i * 4] = Math.round(r);
    rgba[i * 4 + 1] = Math.round(g);
    rgba[i * 4 + 2] = Math.round(b);
    rgba[i * 4 + 3] = Math.round(a);
  }
  return rgba;
}

/**
 * Parse an .anm buffer.
 * @returns {{textures: Array<{width:number,height:number,rgba:Uint8Array}>,
 *            sprites: Array<{entry:number,id:number,x:number,y:number,w:number,h:number,tex:number}>,
 *            entries: Array<object>}}
 *            scripts: Array<{entry:number,id:number,bytes:Buffer}>}}
 */
/**
 * Collect one animation script as a contiguous byte run.
 *
 * AnmRawInstr is {i16 opcode; u16 instructionSize; i16 time; u16 varMask; args[]} and
 * the VM advances by instructionSize, so a script ends at the first instruction that
 * does not sit directly behind its predecessor.
 */
function scriptBytes(buf, begin) {
  if (begin + 4 > buf.length) return Buffer.alloc(0);
  let cursor = begin;
  for (;;) {
    const size = buf.readUInt16LE(cursor + 2);
    if (!size || cursor + size > buf.length) break;
    cursor += size;
  }
  return buf.subarray(begin, cursor);
}

export function parseAnm(buf) {
  const textures = [];
  const sprites = [];
  const entries = [];
  const scripts = [];
  let off = 0;
  let index = 0;
  while (off + ENTRY_SIZE <= buf.length) {
    const e = buf.subarray(off);
    const dv = new DataView(e.buffer, e.byteOffset, e.length);
    const rec = {
      index,
      numSprites: dv.getInt32(0x00, true),
      numScripts: dv.getInt32(0x04, true),
      textureIdx: dv.getUint32(0x08, true),
      width: dv.getInt32(0x0c, true),
      height: dv.getInt32(0x10, true),
      format: dv.getUint32(0x14, true),
      colorKey: dv.getUint32(0x18, true),
      nameOffset: dv.getUint32(0x1c, true),
      version: dv.getUint32(0x28, true),
      textureOffset: dv.getUint32(0x30, true),
      hasData: e[0x34],
      nextOffset: dv.getUint32(0x38, true),
    };
    rec.name =
      rec.nameOffset && rec.nameOffset < e.length
        ? e.subarray(rec.nameOffset, e.indexOf(0, rec.nameOffset) < 0 ? e.length : e.indexOf(0, rec.nameOffset)).toString('latin1')
        : '';
    if (rec.hasData) {
      const tOff = off + rec.textureOffset;
      const magic = buf.subarray(tOff, tOff + 4).toString('latin1');
      if (magic === 'THTX') {
        const tdv = new DataView(buf.buffer, buf.byteOffset + tOff, 16);
        const tw = tdv.getInt16(8, true);
        const th = tdv.getInt16(10, true);
        const tfmt = tdv.getInt16(6, true);
        const bpp = BPP[tfmt] ?? 4;
        const pixels = buf.subarray(tOff + 16, tOff + 16 + tw * th * bpp);
        textures.push({
          width: tw,
          height: th,
          format: tfmt,
          entry: index,
          rgba: decodeTexture(pixels, tfmt, tw, th),
        });
      }
    }
    const table = new DataView(buf.buffer, buf.byteOffset + off + ENTRY_SIZE, rec.numSprites * 4);
    for (let i = 0; i < rec.numSprites; i++) {
      const so = off + ENTRY_SIZE + table.getUint32(i * 4, true) - ENTRY_SIZE;
      const sdv = new DataView(buf.buffer, buf.byteOffset + so, 20);
      sprites.push({
        entry: index,
        tex: textures.length - 1,
        id: sdv.getUint32(0, true),
        x: sdv.getFloat32(4, true),
        y: sdv.getFloat32(8, true),
        w: sdv.getFloat32(12, true),
        h: sdv.getFloat32(16, true),
      });
    }
    // After the sprite offsets sit numScripts AnmRawScript pairs {u32 id; u32 offset}.
    const tableStart = off + ENTRY_SIZE + rec.numSprites * 4;
    for (let s = 0; s < rec.numScripts; s++) {
      const id = buf.readUInt32LE(tableStart + s * 8);
      const begin = off + buf.readUInt32LE(tableStart + s * 8 + 4);
      scripts.push({ entry: index, id, bytes: scriptBytes(buf, begin) });
    }
    entries.push(rec);
    if (!rec.nextOffset) break;
    off += rec.nextOffset;
    index++;
  }
  return { textures, sprites, entries, scripts };
}

/** Crop one sprite rect out of a decoded texture page. */
export function cropSprite(tex, x, y, w, h) {
  const cw = Math.max(1, Math.round(w));
  const ch = Math.max(1, Math.round(h));
  const out = new Uint8Array(cw * ch * 4);
  for (let row = 0; row < ch; row++) {
    const sy = Math.round(y) + row;
    if (sy < 0 || sy >= tex.height) continue;
    for (let col = 0; col < cw; col++) {
      const sx = Math.round(x) + col;
      if (sx < 0 || sx >= tex.width) continue;
      const si = (sy * tex.width + sx) * 4;
      const di = (row * cw + col) * 4;
      out[di] = tex.rgba[si];
      out[di + 1] = tex.rgba[si + 1];
      out[di + 2] = tex.rgba[si + 2];
      out[di + 3] = tex.rgba[si + 3];
    }
  }
  return { width: cw, height: ch, rgba: out };
}

if (process.argv[1] && process.argv[1].includes('anm.mjs')) {
  const [file, outDir] = process.argv.slice(2);
  const parsed = parseAnm(fs.readFileSync(file));
  console.log(
    file,
    'entries=' + parsed.entries.length,
    'textures=' + parsed.textures.length,
    'sprites=' + parsed.sprites.length,
  );
  for (const t of parsed.textures) {
    console.log('  tex', t.entry, t.width + 'x' + t.height, 'fmt', t.format);
  }
  for (const s of parsed.sprites.slice(0, 24)) {
    console.log('  spr', s.entry, 'id', s.id, s.x + ',' + s.y, s.w + 'x' + s.h);
  }
  if (outDir) {
    fs.mkdirSync(outDir, { recursive: true });
    const base = file.split(/[\\/]/).pop().replace(/\.anm$/, '');
    parsed.textures.forEach((t, i) => {
      fs.writeFileSync(outDir + '/' + base + '_t' + i + '.png', encodePNG(t.width, t.height, t.rgba));
    });
    console.log('wrote ' + parsed.textures.length + ' texture pages');
  }
}
