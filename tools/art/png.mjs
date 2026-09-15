/**
 * Minimal software rasteriser + PNG codec used by the offline asset pipeline.
 *
 * Everything here is dependency-free (Node `zlib` only) so `bun run assets`
 * works on a clean checkout with no network access.
 */
import zlib from 'node:zlib';
import fs from 'node:fs';

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** CRC32 (PNG polynomial) over a byte range. */
function crc32(buf, start, end) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = start; i < end; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, body) {
  const out = Buffer.alloc(8 + body.length + 4);
  out.writeUInt32BE(body.length, 0);
  out.write(type, 4, 'ascii');
  body.copy(out, 8);
  out.writeUInt32BE(crc32(out, 4, 8 + body.length), 8 + body.length);
  return out;
}

/** Encode an RGBA byte buffer as a PNG file (adaptive filters for size). */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

export function encodePNG(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  const f = (x) => (x < 0 || x >= stride ? 0 : rgba[x]);
  for (let y = 0; y < height; y++) {
    const row = y * stride;
    const prev = y > 0 ? row - stride : -1;
    let best = 0;
    let bestScore = Infinity;
    for (let filter = 0; filter < 5; filter++) {
      let score = 0;
      for (let x = 0; x < stride; x++) {
        const a = x >= 4 ? rgba[row + x - 4] : 0;
        const b = prev >= 0 ? rgba[prev + x] : 0;
        const c = prev >= 0 && x >= 4 ? rgba[prev + x - 4] : 0;
        let pred;
        if (filter === 1) pred = a;
        else if (filter === 2) pred = b;
        else if (filter === 3) pred = (a + b) >> 1;
        else if (filter === 4) {
          const p = a + b - c;
          const pa = Math.abs(p - a);
          const pb = Math.abs(p - b);
          const pc = Math.abs(p - c);
          pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        } else pred = 0;
        const d = (rgba[row + x] - pred) & 0xff;
        score += d < 128 ? d : 256 - d;
      }
      if (score < bestScore) {
        bestScore = score;
        best = filter;
      }
    }
    const outRow = y * (stride + 1);
    raw[outRow] = best;
    for (let x = 0; x < stride; x++) {
      const a = x >= 4 ? rgba[row + x - 4] : 0;
      const b = prev >= 0 ? rgba[prev + x] : 0;
      const c = prev >= 0 && x >= 4 ? rgba[prev + x - 4] : 0;
      let pred;
      if (best === 1) pred = a;
      else if (best === 2) pred = b;
      else if (best === 3) pred = (a + b) >> 1;
      else if (best === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        pred = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else pred = 0;
      raw[outRow + 1 + x] = (rgba[row + x] - pred) & 0xff;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/** Decode a PNG file into an RGBA byte buffer (8-bit grey/RGB/RGBA, no interlace). */
export function decodePNG(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG: ' + file);
  let o = 8;
  let width = 0;
  let height = 0;
  let color = 0;
  let depth = 0;
  const idat = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      depth = data[8];
      color = data[9];
      if (data[12] !== 0) throw new Error('interlaced PNG unsupported: ' + file);
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (depth !== 8) throw new Error('only 8-bit PNG supported: ' + file);
  const channels = color === 6 ? 4 : color === 2 ? 3 : color === 4 ? 2 : 1;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
    const out = Buffer.alloc(height * stride);
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    const line = raw.subarray(rp, rp + stride);
    rp += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = y > 0 && x >= channels ? out[(y - 1) * stride + x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[y * stride + x] = v & 255;
    }
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = out[i * channels];
    rgba[i * 4 + 1] = channels >= 3 ? out[i * channels + 1] : out[i * channels];
    rgba[i * 4 + 2] = channels >= 3 ? out[i * channels + 2] : out[i * channels];
    rgba[i * 4 + 3] = channels === 4 ? out[i * channels + 3] : channels === 2 ? out[i * channels + 1] : 255;
  }
  return { width, height, rgba };
}

/** Floating-point RGBA canvas with anti-aliased primitives. */
export class Canvas {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Float32Array(width * height * 4);
  }

  get(x, y) {
    const i = (y * this.width + x) * 4;
    return [this.data[i], this.data[i + 1], this.data[i + 2], this.data[i + 3]];
  }

  /** Accept a 0xRRGGBB int or an [r,g,b,(a)] array with 0..255 channels. */
  static color(color) {
    if (typeof color === 'number') return [(color >> 16) & 255, (color >> 8) & 255, color & 255, 1];
    if (color.length === 3) return [color[0], color[1], color[2], 1];
    return color;
  }

  /** Source-over blend of a single pixel with fractional coverage. */
  set(x, y, rawColor, coverage = 1) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height || coverage <= 0) return;
    const color = Canvas.color(rawColor);
    const [r, g, b] = color;
    const a = (color[3] ?? 1) * Math.min(1, coverage);
    if (a <= 0) return;
    const i = (y * this.width + x) * 4;
    const d = this.data;
    const da = d[i + 3];
    const out = a + da * (1 - a);
    if (out <= 0) return;
    d[i] = (r * a + d[i] * da * (1 - a)) / out;
    d[i + 1] = (g * a + d[i + 1] * da * (1 - a)) / out;
    d[i + 2] = (b * a + d[i + 2] * da * (1 - a)) / out;
    d[i + 3] = out;
  }

  fillRect(x, y, w, h, color) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    for (let py = y0; py < y0 + h; py++) {
      for (let px = x0; px < x0 + w; px++) this.set(px, py, color);
    }
  }

  /** Axis-aligned rect with analytic edge anti-aliasing. */
  rectAA(x, y, w, h, color) {
    const x1 = x;
    const x2 = x + w;
    const y1 = y;
    const y2 = y + h;
    for (let py = Math.floor(y1); py < Math.ceil(y2); py++) {
      const vy = Math.min(1, Math.max(0, Math.min(py + 1, y2) - Math.max(py, y1)));
      if (vy <= 0) continue;
      for (let px = Math.floor(x1); px < Math.ceil(x2); px++) {
        const vx = Math.min(1, Math.max(0, Math.min(px + 1, x2) - Math.max(px, x1)));
        if (vx > 0) this.set(px, py, color, vx * vy);
      }
    }
  }

  strokeRect(x, y, w, h, lineWidth, color) {
    this.rectAA(x, y, w, lineWidth, color);
    this.rectAA(x, y + h - lineWidth, w, lineWidth, color);
    this.rectAA(x, y, lineWidth, h, color);
    this.rectAA(x + w - lineWidth, y, lineWidth, h, color);
  }

  fillCircle(cx, cy, r, color) {
    for (let py = Math.floor(cy - r - 1); py <= Math.ceil(cy + r + 1); py++) {
      for (let px = Math.floor(cx - r - 1); px <= Math.ceil(cx + r + 1); px++) {
        const d = Math.hypot(px + 0.5 - cx, py + 0.5 - cy);
        const cov = Math.min(1, Math.max(0, r - d + 0.5));
        if (cov > 0) this.set(px, py, color, cov);
      }
    }
  }

  strokeCircle(cx, cy, r, lineWidth, color) {
    const inner = Math.max(0, r - lineWidth / 2);
    const outer = r + lineWidth / 2;
    for (let py = Math.floor(cy - outer - 1); py <= Math.ceil(cy + outer + 1); py++) {
      for (let px = Math.floor(cx - outer - 1); px <= Math.ceil(cx + outer + 1); px++) {
        const d = Math.hypot(px + 0.5 - cx, py + 0.5 - cy);
        const cov = Math.min(1, Math.max(0, outer - d + 0.5)) * Math.min(1, Math.max(0, d - inner + 0.5));
        if (cov > 0) this.set(px, py, color, cov);
      }
    }
  }

  fillEllipse(cx, cy, rx, ry, color) {
    for (let py = Math.floor(cy - ry - 1); py <= Math.ceil(cy + ry + 1); py++) {
      for (let px = Math.floor(cx - rx - 1); px <= Math.ceil(cx + rx + 1); px++) {
        const nx = (px + 0.5 - cx) / rx;
        const ny = (py + 0.5 - cy) / ry;
        const d = Math.hypot(nx, ny);
        const rr = Math.min(rx, ry);
        const cov = Math.min(1, Math.max(0, (1 - d) * rr + 0.5));
        if (cov > 0) this.set(px, py, color, cov);
      }
    }
  }

  /** Punch a soft elliptical hole through whatever has already been painted. */
  eraseEllipse(cx, cy, rx, ry) {
    for (let py = Math.floor(cy - ry - 1); py <= Math.ceil(cy + ry + 1); py++) {
      if (py < 0 || py >= this.height) continue;
      for (let px = Math.floor(cx - rx - 1); px <= Math.ceil(cx + rx + 1); px++) {
        if (px < 0 || px >= this.width) continue;
        const nx = (px + 0.5 - cx) / rx;
        const ny = (py + 0.5 - cy) / ry;
        const rr = Math.min(rx, ry);
        const cov = Math.min(1, Math.max(0, (1 - Math.hypot(nx, ny)) * rr + 0.5));
        if (cov <= 0) continue;
        const i = (py * this.width + px) * 4;
        this.data[i + 3] *= 1 - cov;
      }
    }
    return this;
  }

  /**
   * Blend a previously captured snapshot back over an elliptical region using the
   * same soft coverage as eraseEllipse. This is how the character painter opens a
   * hairline in the hair cap: erasing would punch a transparent hole through the
   * face that was painted underneath, so the pre-hair pixels are restored instead.
   */
  restoreEllipse(src, cx, cy, rx, ry) {
    if (src.width !== this.width || src.height !== this.height) {
      throw new Error('restoreEllipse: snapshot size mismatch');
    }
    for (let py = Math.floor(cy - ry - 1); py <= Math.ceil(cy + ry + 1); py++) {
      if (py < 0 || py >= this.height) continue;
      for (let px = Math.floor(cx - rx - 1); px <= Math.ceil(cx + rx + 1); px++) {
        if (px < 0 || px >= this.width) continue;
        const nx = (px + 0.5 - cx) / rx;
        const ny = (py + 0.5 - cy) / ry;
        const rr = Math.min(rx, ry);
        const cov = Math.min(1, Math.max(0, (1 - Math.hypot(nx, ny)) * rr + 0.5));
        if (cov <= 0) continue;
        const i = (py * this.width + px) * 4;
        const sa = src.data[i + 3];
        if (sa <= 0) continue;
        this.set(px, py, [src.data[i], src.data[i + 1], src.data[i + 2], sa * cov]);
      }
    }
    return this;
  }

  strokeEllipse(cx, cy, rx, ry, lineWidth, color) {
    for (let py = Math.floor(cy - ry - 2); py <= Math.ceil(cy + ry + 2); py++) {
      for (let px = Math.floor(cx - rx - 2); px <= Math.ceil(cx + rx + 2); px++) {
        const nx = (px + 0.5 - cx) / rx;
        const ny = (py + 0.5 - cy) / ry;
        const d = Math.hypot(nx, ny);
        const rr = Math.min(rx, ry);
        const outer = Math.min(1, Math.max(0, (1 - d) * rr + 0.5));
        const inner = Math.min(1, Math.max(0, (d - (1 - lineWidth / 2 / rr)) * rr + 0.5));
        const cov = Math.min(outer, inner);
        if (cov > 0) this.set(px, py, color, cov);
      }
    }
  }

  /** Polygon fill with 3x supersampled edges. */
  fillPoly(points, color) {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const minX = Math.floor(Math.min(...xs));
    const maxX = Math.ceil(Math.max(...xs));
    const minY = Math.floor(Math.min(...ys));
    const maxY = Math.ceil(Math.max(...ys));
    const ss = 3;
    for (let py = minY; py <= maxY; py++) {
      for (let px = minX; px <= maxX; px++) {
        let hit = 0;
        for (let sy = 0; sy < ss; sy++) {
          for (let sx = 0; sx < ss; sx++) {
            const x = px + (sx + 0.5) / ss;
            const y = py + (sy + 0.5) / ss;
            let inside = false;
            for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
              const a = points[i];
              const b = points[j];
              if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
            }
            if (inside) hit++;
          }
        }
        if (hit) this.set(px, py, color, hit / (ss * ss));
      }
    }
  }

  strokePoly(points, lineWidth, color) {
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      this.strokeLine(a.x, a.y, b.x, b.y, lineWidth, color);
    }
    return this;
  }

  strokeRoundRect(x, y, w, h, radius, lineWidth, color) {
    const r = Math.min(radius, w / 2, h / 2);
    const inner = Math.max(0, r - lineWidth / 2);
    const outer = r + lineWidth / 2;
    this.rectAA(x + r, y, w - 2 * r, lineWidth, color);
    this.rectAA(x + r, y + h - lineWidth, w - 2 * r, lineWidth, color);
    this.rectAA(x, y + r, lineWidth, h - 2 * r, color);
    this.rectAA(x + w - lineWidth, y + r, lineWidth, h - 2 * r, color);
    for (const [cx, cy, a0, a1] of [
      [x + r, y + r, Math.PI, Math.PI * 1.5],
      [x + w - r, y + r, Math.PI * 1.5, Math.PI * 2],
      [x + r, y + h - r, Math.PI * 0.5, Math.PI],
      [x + w - r, y + h - r, 0, Math.PI * 0.5],
    ]) {
      for (let a = a0; a <= a1; a += 0.02) {
        this.fillCircle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, lineWidth / 2, color);
      }
    }
  }

  strokeLine(x0, y0, x1, y1, width, color) {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(len * 2));
    const r = width / 2;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      this.fillCircle(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r, color);
    }
  }

  line(x0, y0, x1, y1, width, color) {
    this.strokeLine(x0, y0, x1, y1, width, color);
  }

  fillRoundRect(x, y, w, h, radius, color) {
    const r = Math.min(radius, w / 2, h / 2);
    this.rectAA(x + r, y, w - 2 * r, h, color);
    this.rectAA(x, y + r, r, h - 2 * r, color);
    this.rectAA(x + w - r, y + r, r, h - 2 * r, color);
    for (const [cx, cy] of [[x + r, y + r], [x + w - r, y + r], [x + r, y + h - r], [x + w - r, y + h - r]]) {
      this.fillCircle(cx, cy, r, color);
    }
  }

  /** Radial gradient disc; stops are [t, [r,g,b,a]] with channels in 0..255. */
  radial(cx, cy, r0, r1, rawStops, opts = {}) {
    const stops = rawStops.map(([t, c]) => [t, Canvas.color(c)]);
    const { scaleX = 1, scaleY = 1 } = opts;
    const rx = r1 * scaleX;
    const ry = r1 * scaleY;
    for (let py = Math.floor(cy - ry - 1); py <= Math.ceil(cy + ry + 1); py++) {
      for (let px = Math.floor(cx - rx - 1); px <= Math.ceil(cx + rx + 1); px++) {
        const d = Math.hypot((px + 0.5 - cx) / scaleX, (py + 0.5 - cy) / scaleY);
        let t = (d - r0) / Math.max(1e-6, r1 - r0);
        if (t < 0) t = 0;
        if (t > 1) continue;
        let a = stops[0][1];
        let b = stops[stops.length - 1][1];
        let f = 0;
        for (let i = 0; i < stops.length - 1; i++) {
          if (t >= stops[i][0] && t <= stops[i + 1][0]) {
            a = stops[i][1];
            b = stops[i + 1][1];
            f = (t - stops[i][0]) / Math.max(1e-6, stops[i + 1][0] - stops[i][0]);
            break;
          }
        }
        const col = [
          a[0] + (b[0] - a[0]) * f,
          a[1] + (b[1] - a[1]) * f,
          a[2] + (b[2] - a[2]) * f,
          (a[3] ?? 1) + ((b[3] ?? 1) - (a[3] ?? 1)) * f,
        ];
        if (col[3] > 0) this.set(px, py, col, Math.min(1, Math.max(0, r1 - d + 0.5)));
      }
    }
  }

  /** Separable alpha-weighted box blur; 3 passes approximate a gaussian. */
  blur(radius) {
    if (radius <= 0) return this;
    this._blurRadius = Math.max(1, Math.round(radius));
    let src = this.data;
    let dst = new Float32Array(src.length);
    for (let pass = 0; pass < 3; pass++) {
      this.blurPass(src, dst, true);
      [src, dst] = [dst, src];
      this.blurPass(src, dst, false);
      [src, dst] = [dst, src];
    }
    this.data = src;
    return this;
  }
  blurPass(src, dst, horizontal) {
    const { width: w, height: h } = this;
    const r = this._blurRadius;
    for (let a = 0; a < (horizontal ? h : w); a++) {
      for (let b = 0; b < (horizontal ? w : h); b++) {
        let R = 0;
        let G = 0;
        let B = 0;
        let A = 0;
        for (let k = -r; k <= r; k++) {
          const c = Math.min((horizontal ? w : h) - 1, Math.max(0, b + k));
          const i = (horizontal ? (a * w + c) : (c * w + a)) * 4;
          const wt = src[i + 3];
          R += src[i] * wt;
          G += src[i + 1] * wt;
          B += src[i + 2] * wt;
          A += wt;
        }
        const n = 2 * r + 1;
        const o = (a * w + b) * 4;
        dst[o] = A > 0 ? R / A : 0;
        dst[o + 1] = A > 0 ? G / A : 0;
        dst[o + 2] = A > 0 ? B / A : 0;
        dst[o + 3] = A / n;
      }
    }
  }

  toRGBA() {
    const out = Buffer.alloc(this.width * this.height * 4);
    for (let i = 0; i < this.width * this.height; i++) {
      const a = this.data[i * 4 + 3];
      out[i * 4] = Math.round(Math.min(255, Math.max(0, this.data[i * 4])));
      out[i * 4 + 1] = Math.round(Math.min(255, Math.max(0, this.data[i * 4 + 1])));
      out[i * 4 + 2] = Math.round(Math.min(255, Math.max(0, this.data[i * 4 + 2])));
      out[i * 4 + 3] = Math.round(Math.min(255, Math.max(0, a * 255)));
    }
    return out;
  }

  clear() {
    this.data.fill(0);
    return this;
  }

  copy() {
    const c = new Canvas(this.width, this.height);
    c.data.set(this.data);
    return c;
  }

  /** Bilinear resample. */
  resize(width, height) {
    const out = new Canvas(width, height);
    const sx = this.width / width;
    const sy = this.height / height;
    for (let y = 0; y < height; y++) {
      const fy = (y + 0.5) * sy - 0.5;
      const y0 = Math.max(0, Math.min(this.height - 1, Math.floor(fy)));
      const y1 = Math.max(0, Math.min(this.height - 1, y0 + 1));
      const wy = Math.max(0, Math.min(1, fy - y0));
      for (let x = 0; x < width; x++) {
        const fx = (x + 0.5) * sx - 0.5;
        const x0 = Math.max(0, Math.min(this.width - 1, Math.floor(fx)));
        const x1 = Math.max(0, Math.min(this.width - 1, x0 + 1));
        const wx = Math.max(0, Math.min(1, fx - x0));
        for (let ch = 0; ch < 4; ch++) {
          const v0 = this.data[(y0 * this.width + x0) * 4 + ch] * (1 - wx) + this.data[(y0 * this.width + x1) * 4 + ch] * wx;
          const v1 = this.data[(y1 * this.width + x0) * 4 + ch] * (1 - wx) + this.data[(y1 * this.width + x1) * 4 + ch] * wx;
          out.data[(y * width + x) * 4 + ch] = v0 * (1 - wy) + v1 * wy;
        }
      }
    }
    return out;
  }

  /** Rotate about the centre with bilinear sampling; canvas grows to fit. */
  rotate(radians) {
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const corners = [[-this.width / 2, -this.height / 2], [this.width / 2, -this.height / 2], [-this.width / 2, this.height / 2], [this.width / 2, this.height / 2]];
    const xs = corners.map(([x, y]) => Math.abs(x * cos - y * sin));
    const ys = corners.map(([x, y]) => Math.abs(x * sin + y * cos));
    const width = Math.ceil(Math.max(...xs) * 2);
    const height = Math.ceil(Math.max(...ys) * 2);
    const out = new Canvas(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rx = x - width / 2;
        const ry = y - height / 2;
        const sx = (rx * cos + ry * sin) + this.width / 2;
        const sy = (-rx * sin + ry * cos) + this.height / 2;
        if (sx < 0 || sy < 0 || sx >= this.width - 1 || sy >= this.height - 1) continue;
        const fx = sx - Math.floor(sx);
        const fy = sy - Math.floor(sy);
        for (let ch = 0; ch < 4; ch++) {
          const p = (px, py) => this.data[(py * this.width + px) * 4 + ch];
          const v0 = p(Math.floor(sx), Math.floor(sy)) * (1 - fx) + p(Math.floor(sx) + 1, Math.floor(sy)) * fx;
          const v1 = p(Math.floor(sx), Math.floor(sy) + 1) * (1 - fx) + p(Math.floor(sx) + 1, Math.floor(sy) + 1) * fx;
          out.data[(y * width + x) * 4 + ch] = v0 * (1 - fy) + v1 * fy;
        }
      }
    }
    return out;
  }

  crop(x, y, w, h) {
    const out = new Canvas(w, h);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const sx = x + px;
        const sy = y + py;
        if (sx < 0 || sy < 0 || sx >= this.width || sy >= this.height) continue;
        for (let ch = 0; ch < 4; ch++) out.data[(py * w + px) * 4 + ch] = this.data[(sy * this.width + sx) * 4 + ch];
      }
    }
    return out;
  }

  /** Smallest rect containing pixels above an alpha threshold, plus padding. */
  trimAlpha(threshold = 0.02, pad = 0) {
    let minX = this.width;
    let minY = this.height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.data[(y * this.width + x) * 4 + 3] > threshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return this.copy();
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(this.width - 1, maxX + pad);
    maxY = Math.min(this.height - 1, maxY + pad);
    return this.crop(minX, minY, maxX - minX + 1, maxY - minY + 1);
  }

  /** Source-over composite of another canvas at an integer offset. */
  blit(src, ox, oy, alphaScale = 1) {
    for (let y = 0; y < src.height; y++) {
      for (let x = 0; x < src.width; x++) {
        const a = src.data[(y * src.width + x) * 4 + 3];
        if (a <= 0) continue;
        this.set(ox + x, oy + y, [
          src.data[(y * src.width + x) * 4],
          src.data[(y * src.width + x) * 4 + 1],
          src.data[(y * src.width + x) * 4 + 2],
          a * alphaScale,
        ]);
      }
    }
    return this;
  }
}

/** Lighten (amount > 0) or darken (amount < 0); accepts a hex int or an [r,g,b,(a)] array. */
export const shade = (color, amount) => {
  const [r, g, b, a] = Canvas.color(color);
  const f = (v) => Math.round(amount >= 0 ? v + (255 - v) * amount : v * (1 + amount));
  const out = [Math.min(255, f(r)), Math.min(255, f(g)), Math.min(255, f(b))];
  if (typeof color === 'number') return (out[0] << 16) | (out[1] << 8) | out[2];
  out.push(a ?? 1);
  return out;
};

export const mix = (a, b, t) => {
  // Accept hex ints as well as arrays: a raw number here used to yield NaN, which
  // encodePNG clamps to 0 and silently painted solid black shapes.
  const ca = Canvas.color(a);
  const cb = Canvas.color(b);
  return [
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t,
    ca[3] + (cb[3] - ca[3]) * t,
  ];
};

/** Same colour with an explicit alpha; accepts a hex int or an [r,g,b,(a)] array. */
export const alphaColor = (color, a) => {
  const [r, g, b] = Canvas.color(color);
  return [r, g, b, a];
};

export const rgb = (color) => {
  const [r, g, b] = Canvas.color(color);
  return [r, g, b];
};

export function savePng(file, canvas) {
  mkdirSync(file.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
  writeFileSync(file, encodePNG(canvas.width, canvas.height, canvas.toRGBA()));
  return file;
}

export function loadPngCanvas(file) {
  const { width, height, rgba } = decodePNG(file);
  const cv = new Canvas(width, height);
  for (let i = 0; i < width * height; i++) {
    cv.data[i * 4] = rgba[i * 4];
    cv.data[i * 4 + 1] = rgba[i * 4 + 1];
    cv.data[i * 4 + 2] = rgba[i * 4 + 2];
    cv.data[i * 4 + 3] = rgba[i * 4 + 3] / 255;
  }
  return cv;
}

/** Minimal 3x5 digit font so the generator can label contact sheets. */
const DIGITS = {
  0: '111101101101111',
  1: '010110010010111',
  2: '111001111100111',
  3: '111001111001111',
  4: '101101111001001',
  5: '111100111001111',
  6: '111100111101111',
  7: '111001001010010',
  8: '111101111101111',
  9: '111101111001111',
};

Canvas.prototype.text = function text(str, x, y, { size = 11, color = 0xffffff } = {}) {
  const col = rgb(color);
  const scale = Math.max(1, Math.floor(size / 5));
  let cx = x;
  for (const ch of String(str)) {
    const glyph = DIGITS[ch];
    if (glyph) {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 3; c++) {
          if (glyph[r * 3 + c] === '1') this.fillRect(cx + c * scale, y + r * scale, scale, scale, col);
        }
      }
    }
    cx += 4 * scale;
  }
  return this;
};

/**
 * Spine tilt of a sprite in degrees, measured from alpha-weighted row centroids.
 * Positive leans to the right as y grows; 0 means the body is upright.
 */
export function spineTilt(cv, threshold = 0.16) {
  const rows = [];
  for (let y = 0; y < cv.height; y++) {
    let w = 0;
    let sx = 0;
    for (let x = 0; x < cv.width; x++) {
      const a = cv.data[(y * cv.width + x) * 4 + 3];
      if (a > threshold) {
        w += a;
        sx += x * a;
      }
    }
    if (w > 0) rows.push([y, sx / w]);
  }
  if (rows.length < 8) return 0;
  const top = rows.slice(0, Math.round(rows.length * 0.7));
  const n = top.length;
  const my = top.reduce((s, r) => s + r[0], 0) / n;
  const mx = top.reduce((s, r) => s + r[1], 0) / n;
  let num = 0;
  let den = 0;
  for (const [y, x] of top) {
    num += (y - my) * (x - mx);
    den += (y - my) ** 2;
  }
  return (Math.atan2(num / den, 1) * 180) / Math.PI;
}

/** Rotate a sprite until its spine is vertical (two refinement passes). */
export function straighten(cv, maxDegrees = 45) {
  let out = cv;
  let deg = 0;
  for (let pass = 0; pass < 3; pass++) {
    const tilt = spineTilt(out);
    if (Math.abs(tilt) < 0.35) break;
    const step = Math.max(-maxDegrees, Math.min(maxDegrees, tilt / 0.91));
    out = out.rotate((step * Math.PI) / 180);
    deg += step;
  }
  return { canvas: out, degrees: deg };
}
