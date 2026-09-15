import { Canvas, rgb, shade, alphaColor } from './png.mjs';

const GOLD = 0xd4a94e;
const TEAL = 0x5bb8b3;
const CRIMSON = 0xc41e3a;

function bevel(cv, x, y, w, h, r, fill, edge, inner) {
  cv.fillRoundRect(x, y, w, h, r, fill);
  cv.strokeRoundRect(x, y, w, h, r, 1.5, edge);
  if (inner) cv.fillRoundRect(x + 3, y + 3, w - 6, h - 6, Math.max(1, r - 3), inner);
}

/** Ornate right-hand HUD panel skin. */
export function paintHudPanel(w = 180, h = 448) {
  const cv = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    const t = y / h;
    cv.fillRect(0, y, w, 1, [0x14 + t * 6, 0x12 + t * 5, 0x20 + t * 8]);
  }
  cv.fillRoundRect(1, 1, w - 2, h - 2, 8, alphaColor(0x1b1830, 0.92));
  cv.strokeRect(1, 1, w - 2, h - 2, 2, TEAL);
  cv.strokeRect(4, 4, w - 8, h - 8, 1, alphaColor(GOLD, 0.55));
  for (const [cx, cy] of [[6, 6], [w - 6, 6], [6, h - 6], [w - 6, h - 6]]) {
    cv.fillCircle(cx, cy, 4, GOLD);
    cv.fillCircle(cx, cy, 1.8, 0x1b1830);
  }
  cv.line(10, 30, w - 10, 30, 1.5, alphaColor(GOLD, 0.7));
  cv.line(10, 112, w - 10, 112, 1, alphaColor(TEAL, 0.45));
  cv.line(10, 196, w - 10, 196, 1, alphaColor(TEAL, 0.45));
  cv.line(10, 268, w - 10, 268, 1, alphaColor(TEAL, 0.45));
  cv.radial(w / 2, 0, 0, w * 0.8, [[0, alphaColor(TEAL, 0.16)], [1, alphaColor(TEAL, 0)]]);
  cv.radial(w / 2, h, 0, w * 0.8, [[0, alphaColor(CRIMSON, 0.14)], [1, alphaColor(CRIMSON, 0)]]);
  return cv;
}

/** Spell-card nameplate: gold frame, dark glass, side flourishes. */
export function paintSpellBanner(w = 400, h = 46) {
  const cv = new Canvas(w, h);
  cv.fillRoundRect(2, 2, w - 4, h - 4, 10, alphaColor(0x0a0812, 0.72));
  cv.radial(w / 2, h / 2, 0, w * 0.55, [[0, alphaColor(0x3a2a58, 0.55)], [1, alphaColor(0x120c1e, 0)]], { scaleX: 1.6 });
  for (const [x, y, ww, hh] of [[3, 3, w - 6, 2], [3, h - 5, w - 6, 2], [3, 3, 2, h - 6], [w - 5, 3, 2, h - 6]]) cv.fillRect(x, y, ww, hh, GOLD);
  cv.fillRect(6, 6, w - 12, 1, alphaColor(shade(GOLD, 0.35), 0.8));
  cv.fillRect(6, h - 7, w - 12, 1, alphaColor(shade(GOLD, -0.3), 0.8));
  for (const dir of [-1, 1]) {
    const cx = w / 2 + dir * (w / 2 - 22);
    cv.fillPoly([{ x: cx, y: h / 2 - 9 }, { x: cx + dir * 14, y: h / 2 }, { x: cx, y: h / 2 + 9 }], GOLD);
    cv.fillCircle(cx + dir * 18, h / 2, 3, alphaColor(0xfff0c0, 0.9));
  }
  cv.line(28, 8, w - 28, 8, 1, alphaColor(TEAL, 0.5));
  return cv;
}

/** Boss HP bar frame + fill. */
export function paintHpFrame(w = 432, h = 14) {
  const cv = new Canvas(w, h);
  cv.fillRoundRect(0, 0, w, h, 5, alphaColor(0x0a0812, 0.85));
  cv.strokeRect(0.5, 0.5, w - 1, h - 1, 1.5, alphaColor(GOLD, 0.8));
  return cv;
}

export function paintHpFill(w = 432, h = 14, color = 0x33cc88) {
  const cv = new Canvas(w, h);
  cv.fillRoundRect(1, 1, w - 2, h - 2, 4, color);
  cv.fillRoundRect(1, 1, w - 2, (h - 2) * 0.45, 4, alphaColor(shade(color, 0.4), 0.75));
  return cv;
}

/** Playfield border frame (transparent centre). */
export function paintPlayfieldFrame(w = 448, h = 448, thickness = 3, color = TEAL) {
  const cv = new Canvas(w, h);
  cv.fillRoundRect(0, 0, w, h, 4, alphaColor(color, 0.9));
  cv.fillRect(thickness, thickness, w - thickness * 2, h - thickness * 2, [0, 0, 0, 0]);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inside = x >= thickness && x < w - thickness && y >= thickness && y < h - thickness;
      if (inside) {
        const i = (y * w + x) * 4;
        cv.data[i + 3] = 0;
      }
    }
  }
  cv.strokeRect(0, 0, w, h, 1, alphaColor(GOLD, 0.5));
  return cv;
}

/** Title screen backdrop: giant moon, hills, foreground silhouettes. */
export function paintTitleBackdrop(w = 640, h = 480) {
  const cv = new Canvas(w, h);
  for (let y = 0; y < h; y++) {
    const t = y / (h - 1);
    const a = rgb(0x05060f);
    const b = rgb(0x241a3a);
    cv.fillRect(0, y, w, 1, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
  }
  let s = 12345;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967296);
  for (let i = 0; i < 320; i++) {
    const x = rand() * w;
    const y = rand() * h * 0.85;
    const r = 0.4 + rand() * 1.7;
    cv.fillCircle(x, y, r, alphaColor(0xffffff, 0.2 + rand() * 0.7));
  }
  const mx = w * 0.68;
  const my = h * 0.3;
  const mr = 128;
  cv.radial(mx, my, 0, mr * 2.6, [[0, alphaColor(0xf6f2df, 0.32)], [0.4, alphaColor(0xf6f2df, 0.1)], [1, alphaColor(0xf6f2df, 0)]]);
  cv.fillCircle(mx, my, mr, 0xf3efdc);
  for (let i = 0; i < 14; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * mr * 0.75;
    cv.fillCircle(mx + Math.cos(a) * d, my + Math.sin(a) * d, mr * (0.05 + rand() * 0.14), alphaColor(0xcfc9ae, 0.55));
  }
  cv.radial(mx - mr * 0.3, my - mr * 0.3, 0, mr * 0.6, [[0, alphaColor(0xffffff, 0.35)], [1, alphaColor(0xffffff, 0)]]);
  const hill = (baseY, amp, color, seed) => {
    let q = seed;
    const r2 = () => ((q = (q * 1664525 + 1013904223) >>> 0), q / 4294967296);
    const pts = [{ x: -20, y: baseY }];
    for (let i = 0; i <= 9; i++) pts.push({ x: (w + 40) * (i / 9) - 20, y: baseY - r2() * amp });
    pts.push({ x: w + 20, y: baseY }, { x: w + 20, y: h + 40 }, { x: -20, y: h + 40 });
    cv.fillPoly(pts, color);
  };
  hill(h * 0.78, 60, 0x141024, 7);
  hill(h * 0.88, 40, 0x0d0a18, 13);
  for (let i = 0; i < 14; i++) {
    const x = 20 + i * 46 + rand() * 20;
    const y = h * 0.9 + rand() * 20;
    const hh = 40 + rand() * 60;
    cv.fillPoly([{ x, y: y - hh }, { x: x + 14, y }, { x: x - 14, y }], 0x070510);
  }
  cv.radial(w / 2, h, 0, h * 0.6, [[0, alphaColor(CRIMSON, 0.16)], [1, alphaColor(CRIMSON, 0)]]);
  return cv;
}

/** Circular touch-control button with a glyph drawn from primitives. */
export function paintTouchButton(glyph, size = 96, ring = GOLD, core = 0x141024) {
  const cv = new Canvas(size, size);
  const c = size / 2;
  cv.radial(c, c, 0, c, [[0, alphaColor(core, 0.85)], [0.72, alphaColor(core, 0.7)], [1, alphaColor(core, 0)]]);
  cv.strokeCircle(c, c, c * 0.74, 3, alphaColor(ring, 0.9));
  cv.strokeCircle(c, c, c * 0.86, 1.2, alphaColor(ring, 0.4));
  const w = alphaColor(0xffffff, 0.92);
  if (glyph === 'bomb') {
    cv.fillCircle(c, c + 4, 12, w);
    cv.strokeLine(c + 8, c - 4, c + 14, c - 14, 3, w);
    cv.fillCircle(c + 15, c - 16, 3.4, alphaColor(0xffd27a, 1));
  } else if (glyph === 'focus') {
    cv.strokeCircle(c, c, 13, 2.4, w);
    cv.fillCircle(c, c, 4, w);
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) cv.strokeLine(c + dx * 18, c + dy * 18, c + dx * 24, c + dy * 24, 2.4, w);
  } else if (glyph === 'pause') {
    cv.fillRect(c - 9, c - 12, 6, 24, w);
    cv.fillRect(c + 3, c - 12, 6, 24, w);
  } else {
    cv.fillPoly([{ x: c, y: c - 14 }, { x: c + 13, y: c + 10 }, { x: c - 13, y: c + 10 }], w);
  }
  return cv;
}

/** Framed portrait card used by the character-select screen. */
export function paintPortraitFrame(w = 132, h = 168, accent = TEAL) {
  const cv = new Canvas(w, h);
  cv.fillRoundRect(0, 0, w, h, 10, alphaColor(0x120f1e, 0.9));
  cv.radial(w / 2, h * 0.35, 0, w * 0.8, [[0, alphaColor(accent, 0.22)], [1, alphaColor(accent, 0)]]);
  cv.strokeRect(1, 1, w - 2, h - 2, 2, accent);
  cv.strokeRect(5, 5, w - 10, h - 10, 1, alphaColor(GOLD, 0.6));
  for (const [cx, cy] of [[5, 5], [w - 5, 5], [5, h - 5], [w - 5, h - 5]]) cv.fillCircle(cx, cy, 3, GOLD);
  cv.fillRect(6, h - 30, w - 12, 24, alphaColor(0x000000, 0.45));
  return cv;
}
