/**
 * Reader for ZUN's TH08 `th08.dat` (ZGBP) archive.
 *
 * Format recovered from the reference decompilation
 * (th08web-ref/src/pbg/{PbgArchive,Lzss}.cpp and src/Global.cpp):
 *
 *   u32 magic 'ZGBP' | 12-byte XOR-encrypted header | LZSS data | XOR+LZSS table
 *
 * The header holds entryCount / table offset / table size, each with a fixed
 * bias added. The table is XOR-de-interleaved and LZSS-decompressed into
 * `name\0 + u32 dataOffset + u32 size + u32 unk` records; a record's compressed
 * length is the gap to the next record. Entry payloads are LZSS too, and may
 * carry a further `edz` XOR wrapper.
 *
 * Usage: node tools/art/pbg.mjs <th08.dat> <outDir> [ext ...]
 *        node tools/art/pbg.mjs <th08.dat> --list
 */
import fs from 'fs';

/** [xorValue, xorIncrement, chunkSize, maxBytes] per key byte. */
const PARAMS = [
  [0x1b, 0x37, 0x40, 0x2800],
  [0x51, 0xe9, 0x40, 0x3000],
  [0xc1, 0x51, 0x1400, 0x2000],
  [0x03, 0x19, 0x1400, 0x7800],
  [0xab, 0xcd, 0x200, 0x1000],
  [0x12, 0x34, 0x400, 0x2800],
  [0x35, 0x97, 0x80, 0x2800],
  [0x99, 0x37, 0x400, 0x1000],
];
const KEYS = PARAMS.map((_, i) => (0x5d - (i << 4) - 0x10 + i * 0) & 0xff);

/** The game stores the per-file key byte obfuscated; recompute the table. */
const KEY_BYTES = [0x5d, 0x74, 0x71, 0x8a, 0x95, 0xb7, 0x9d, 0xaa].map(
  (k, i) => (k - (i << 4) - 0x10) & 0xff,
);

/**
 * ZUN's XOR + even/odd de-interleave. Mirrors FileSystem::Decrypt: the first
 * half of each chunk lands on the odd slots, the second half on the even ones.
 */
export function decrypt(buf, xorValue, xorInc, chunkSize, maxBytes) {
  const n = buf.length;
  let size = n;
  let tail = size % chunkSize < chunkSize / 4 ? size % chunkSize : 0;
  tail += size & 1;
  size -= tail;
  const out = Buffer.alloc(n);
  let ic = 0;
  let oc = 0;
  let xv = xorValue;
  let budget = maxBytes;
  let chunk = chunkSize;
  while (size > 0 && budget > 0) {
    if (size < chunk) chunk = size;
    const base = oc;
    let p = base + chunk - 1;
    for (let i = (chunk + 1) >> 1; i > 0; i--, ic++) {
      out[p] = buf[ic] ^ xv;
      p -= 2;
      xv = (xv + xorInc) & 0xff;
    }
    p = base + chunk - 2;
    for (let i = chunk >> 1; i > 0; i--, ic++) {
      out[p] = buf[ic] ^ xv;
      p -= 2;
      xv = (xv + xorInc) & 0xff;
    }
    oc = base + chunk;
    size -= chunk;
    budget -= chunk;
  }
  if (size + tail > 0) buf.copy(out, oc, ic, ic + size + tail);
  return out;
}

/** ZUN LZSS: 13-bit absolute ring offset, 4-bit length, 8192-byte window. */
export function lzssDecode(inp, outSize) {
  const MASK = 8191;
  const dict = new Uint8Array(8192);
  const out = Buffer.alloc(outSize);
  let o = 0;
  let ic = 0;
  let bit = 0x80;
  let cur = 0;
  let head = 1;
  let bits = 0;
  const fetch = () => {
    if (bit === 0x80) {
      cur = ic < inp.length ? inp[ic] : 0;
      ic++;
    }
  };
  const adv = () => {
    bit >>= 1;
    if (bit === 0) bit = 0x80;
  };
  const unpackBits = (count) => {
    let mask = 1 << (count - 1);
    bits = 0;
    while (mask !== 0) {
      fetch();
      if ((cur & bit) !== 0) bits |= mask;
      mask >>= 1;
      adv();
    }
  };
  const writeByte = (v) => {
    if (o < outSize) out[o] = v;
    o++;
    dict[head] = v;
    head = (head + 1) & MASK;
  };
  for (;;) {
    fetch();
    const flag = cur & bit;
    adv();
    if (flag !== 0) {
      unpackBits(8);
      writeByte(bits);
    } else {
      unpackBits(13);
      const matchOffset = bits;
      if (matchOffset === 0) break;
      unpackBits(4);
      const matchLength = bits + 2;
      for (let i = 0; i <= matchLength; i++) writeByte(dict[(matchOffset + i) & MASK]);
    }
    if (o > outSize + 4096) break;
  }
  return out;
}

/** Strip the optional `edz` per-file XOR wrapper. */
export function tryDecryptEntry(d) {
  if (!(d[0] === 0x65 && d[1] === 0x64 && d[2] === 0x7a)) return d;
  const i = KEY_BYTES.indexOf(d[3]);
  if (i < 0) return d;
  const [xv, inc, chunk, max] = PARAMS[i];
  return decrypt(d.subarray(4), xv, inc, chunk, max);
}

/** Open a ZGBP archive and expose its entry table. */
export function openArchive(path) {
  const all = fs.readFileSync(path);
  if (all.readUInt32LE(0) !== 0x5a474250) throw new Error('not a ZGBP archive');
  const h = decrypt(all.subarray(4, 16), 0x1b, 0x37, 12, 0x400);
  const count = h.readInt32LE(0) - 123456;
  const tableOffset = h.readInt32LE(4) - 345678;
  const tableSize = h.readInt32LE(8) - 567891;
  if (!(count > 0 && tableOffset > 0 && tableOffset < all.length)) {
    throw new Error('bad ZGBP header');
  }
  const raw = decrypt(all.subarray(tableOffset), 0x3e, 0x9b, 0x80, 0x400);
  const ent = lzssDecode(raw, tableSize);
  const entries = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    let e = p;
    while (e < ent.length && ent[e] !== 0) e++;
    const name = ent.subarray(p, e).toString('latin1');
    p = e + 1;
    const dataOffset = ent.readUInt32LE(p);
    const decompressedSize = ent.readUInt32LE(p + 4);
    p += 12;
    entries.push({ name, dataOffset, decompressedSize });
  }
  entries.push({ name: '<end>', dataOffset: tableOffset, decompressedSize: 0 });
  return {
    entries,
    /** Decompressed, de-wrappered payload of entry `i`. */
    read(i) {
      const a = entries[i];
      const b = entries[i + 1];
      return tryDecryptEntry(
        lzssDecode(all.subarray(a.dataOffset, b.dataOffset), a.decompressedSize),
      );
    },
    indexOf(name) {
      const want = name.toLowerCase();
      return entries.findIndex((e) => e.name.toLowerCase() === want);
    },
  };
}

if (process.argv[1] && process.argv[1].includes('pbg.mjs')) {
  const [dat, target, ...rest] = process.argv.slice(2);
  const arc = openArchive(dat);
  if (target === '--list') {
    for (const e of arc.entries) if (e.name !== '<end>') console.log(String(e.decompressedSize).padStart(9), e.name);
  } else {
    const out = target;
    const exts = rest.length ? rest : null;
    fs.mkdirSync(out, { recursive: true });
    let n = 0;
    arc.entries.forEach((e, i) => {
      if (e.name === '<end>') return;
      if (exts && !exts.some((x) => e.name.toLowerCase().endsWith('.' + x))) return;
      const p = out + '/' + e.name.replace(/[\\/:*?"<>|]/g, '_');
      fs.mkdirSync(p.slice(0, p.lastIndexOf('/')), { recursive: true });
      fs.writeFileSync(p, arc.read(i));
      n++;
    });
    console.log('wrote ' + n + ' files to ' + out);
  }
}
