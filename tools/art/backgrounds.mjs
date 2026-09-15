import { Canvas, rgb, shade, alphaColor } from './png.mjs';

export const PW = 448;
export const PH = 448;

/** Deterministic PRNG so every regeneration is byte-identical. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function sky(cv, top, bottom, glowColor) {
  for (let y = 0; y < cv.height; y++) {
    const t = y / (cv.height - 1);
    const a = rgb(top);
    const b = rgb(bottom);
    cv.fillRect(0, y, cv.width, 1, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
  }
  if (glowColor !== undefined) {
    cv.radial(cv.width * 0.5, cv.height * 0.18, 0, cv.height * 0.55, [
      [0, alphaColor(glowColor, 0.3)],
      [1, alphaColor(glowColor, 0)],
    ]);
  }
}

function stars(cv, count, seed, maxR = 1.6) {
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const x = rand() * cv.width;
    const y = rand() * cv.height * 0.8;
    const r = 0.4 + rand() * maxR;
    const a = 0.25 + rand() * 0.75;
    cv.fillCircle(x, y, r, alphaColor(0xffffff, a));
    if (r > 1.2) {
      cv.line(x - r * 3, y, x + r * 3, y, 0.7, alphaColor(0xffffff, a * 0.3));
      cv.line(x, y - r * 3, x, y + r * 3, 0.7, alphaColor(0xffffff, a * 0.3));
    }
  }
}

function moon(cv, x, y, r, color = 0xf6f2df) {
  cv.radial(x, y, 0, r * 3.2, [[0, alphaColor(color, 0.35)], [0.35, alphaColor(color, 0.12)], [1, alphaColor(color, 0)]]);
  cv.fillCircle(x, y, r, color);
  cv.fillCircle(x, y, r * 0.98, shade(color, -0.05));
  const rand = rng(99);
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 0.72;
    cv.fillCircle(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.06 + rand() * 0.16), alphaColor(shade(color, -0.28), 0.5));
  }
  cv.fillCircle(x - r * 0.35, y - r * 0.35, r * 0.5, alphaColor(0xffffff, 0.18));
}

/**
 * Ramp a scrolling layer's alpha to zero across its top and bottom edges.
 *
 * Parallax layers are tiled end to end by the renderer, so anything that paints a
 * solid band down to the last row (grass, hill silhouettes, rooftops) shows up as
 * a hard seam that crawls up the screen. Fading the edges turns that join into a
 * soft depth haze instead.
 */
function fadeEdges(cv, bottom = 0, top = 0) {
  if (bottom <= 0 && top <= 0) return cv;
  for (let y = 0; y < cv.height; y++) {
    const fromBottom = cv.height - 1 - y;
    let k = 1;
    if (bottom > 0 && fromBottom < bottom) k = fromBottom / bottom;
    if (top > 0 && y < top) k = Math.min(k, y / top);
    if (k >= 1) continue;
    const ease = k * k * (3 - 2 * k);
    for (let x = 0; x < cv.width; x++) cv.data[(y * cv.width + x) * 4 + 3] *= ease;
  }
  return cv;
}

/** Repeat a draw callback with vertical wraps so the layer tiles seamlessly. */
function tileY(cv, draw, period = cv.height) {
  for (let k = -1; k <= 1; k++) draw(k * period);
}

function hills(cv, baseY, amp, color, seed, points = 7) {
  const rand = rng(seed);
  const pts = [{ x: -20, y: baseY }];
  for (let i = 0; i <= points; i++) {
    pts.push({ x: (cv.width + 40) * (i / points) - 20, y: baseY - rand() * amp });
  }
  pts.push({ x: cv.width + 20, y: baseY });
  pts.push({ x: cv.width + 20, y: cv.height + 40 }, { x: -20, y: cv.height + 40 });
  cv.fillPoly(pts, color);
}

function pines(cv, count, baseY, color, seed, scale = 1) {
  const rand = rng(seed);
  tileY(cv, (off) => {
    for (let i = 0; i < count; i++) {
      const x = rand() * (cv.width + 60) - 30;
      const y = baseY + off + rand() * 26;
      const h = (26 + rand() * 34) * scale;
      const w = h * 0.42;
      cv.fillPoly([{ x, y: y - h }, { x: x + w, y }, { x: x - w, y }], color);
      cv.fillPoly([{ x, y: y - h * 0.72 }, { x: x + w * 0.78, y: y - h * 0.12 }, { x: x - w * 0.78, y: y - h * 0.12 }], shade(color, 0.08));
      cv.fillRect(x - 1.5, y - 2, 3, 6, shade(color, -0.3));
    }
  });
}

function grass(cv, baseY, color, seed, blades = 260) {
  const rand = rng(seed);
  cv.fillRect(0, baseY, cv.width, cv.height - baseY, shade(color, -0.35));
  tileY(cv, (off) => {
    for (let i = 0; i < blades; i++) {
      const x = rand() * cv.width;
      const y = baseY + off + rand() * (cv.height - baseY);
      const h = 4 + rand() * 12;
      cv.line(x, y, x + (rand() - 0.5) * 5, y - h, 1.2, alphaColor(color, 0.5 + rand() * 0.5));
    }
  });
}

function clouds(cv, count, color, seed, band = [0.15, 0.7]) {
  const rand = rng(seed);
  tileY(cv, (off) => {
    for (let i = 0; i < count; i++) {
      const x = rand() * cv.width;
      const y = cv.height * (band[0] + rand() * (band[1] - band[0])) + off;
      const w = 30 + rand() * 70;
      const a = 0.12 + rand() * 0.22;
      for (let p = 0; p < 5; p++) {
        cv.fillEllipse(x + (p - 2) * w * 0.22, y + (rand() - 0.5) * 8, w * (0.22 + rand() * 0.16), 8 + rand() * 8, alphaColor(color, a));
      }
    }
  });
}
function bamboo(cv, color, seed, density = 12, width = 9) {
  const rand = rng(seed);
  tileY(cv, (off) => {
    for (let i = 0; i < density; i++) {
      const x = rand() * cv.width;
      const w = width * (0.6 + rand() * 0.9);
      const c = shade(color, (rand() - 0.5) * 0.25);
      cv.fillRect(x, -40 + off, w, cv.height + 80, c);
      cv.fillRect(x, -40 + off, w * 0.28, cv.height + 80, alphaColor(shade(c, 0.3), 0.5));
      for (let y = rand() * 40; y < cv.height + 40; y += 42 + rand() * 26) {
        cv.fillRect(x - 1, y + off, w + 2, 3, shade(c, -0.35));
      }
      for (let l = 0; l < 3; l++) {
        const ly = rand() * cv.height + off;
        cv.fillEllipse(x + w + 8, ly, 10, 2.6, alphaColor(shade(c, 0.2), 0.7));
        cv.fillEllipse(x - 8, ly + 6, 10, 2.6, alphaColor(shade(c, 0.2), 0.7));
      }
    }
  });
}

function water(cv, topY, color, seed) {
  cv.fillRect(0, topY, cv.width, cv.height - topY, shade(color, -0.4));
  const rand = rng(seed);
  for (let y = topY + 4; y < cv.height; y += 5) {
    const a = 0.05 + rand() * 0.16;
    const w = 20 + rand() * 90;
    cv.fillRect(rand() * cv.width, y, w, 1.6, alphaColor(shade(color, 0.4), a));
  }
}

function roofs(cv, baseY, color, seed, count = 7) {
  const rand = rng(seed);
  let x = -30;
  for (let i = 0; i < count; i++) {
    const w = 46 + rand() * 40;
    const h = 22 + rand() * 16;
    cv.fillPoly([{ x: x - 8, y: baseY }, { x: x + w / 2, y: baseY - h }, { x: x + w + 8, y: baseY }], color);
    cv.fillRect(x, baseY, w, 26, shade(color, -0.35));
    cv.fillPoly([{ x: x + w * 0.2, y: baseY }, { x: x + w * 0.5, y: baseY - h * 0.6 }, { x: x + w * 0.8, y: baseY }], shade(color, 0.12));
    if (rand() > 0.5) cv.fillCircle(x + w * 0.5, baseY + 12, 3, alphaColor(0xffd27a, 0.85));
    x += w + 8 + rand() * 18;
    if (x > cv.width) break;
  }
}

function palace(cv, seed) {
  const rand = rng(seed);
  for (let i = 0; i < 6; i++) {
    const x = 20 + i * 62 + rand() * 10;
    const h = 120 + rand() * 90;
    cv.fillRect(x, cv.height - h, 16, h, alphaColor(0xe8e6f2, 0.16));
    cv.fillRect(x - 5, cv.height - h, 26, 7, alphaColor(0xf2f0ff, 0.22));
  }
  for (let i = 0; i < 26; i++) {
    cv.fillCircle(rand() * cv.width, cv.height - rand() * 150, 1 + rand() * 2, alphaColor(0xbfe6ff, 0.5));
  }
}

function fireflies(cv, count, seed, color = 0xffe58a) {
  const rand = rng(seed);
  tileY(cv, (off) => {
    for (let i = 0; i < count; i++) {
      const x = rand() * cv.width;
      const y = rand() * cv.height + off;
      const r = 1 + rand() * 2.2;
      cv.radial(x, y, 0, r * 5, [[0, alphaColor(color, 0.85)], [0.4, alphaColor(color, 0.28)], [1, alphaColor(color, 0)]]);
    }
  });
}

/** Per-stage layer recipes: sky + parallax mid + parallax near. */
const THEMES = {
  forestNight: {
    sky: (cv) => { sky(cv, 0x070915, 0x142436, 0x2a4a7a); stars(cv, 150, 11); moon(cv, 300, 74, 40); },
    mid: (cv) => { cv.clear(); hills(cv, 250, 70, 0x101a2a, 21); pines(cv, 16, 300, 0x0d1622, 22, 1.1); },
    near: (cv) => { cv.clear(); pines(cv, 9, 400, 0x070c14, 23, 1.9); grass(cv, 356, 0x1d3a24, 24); },
  },
  lake: {
    sky: (cv) => { sky(cv, 0x08131f, 0x123244, 0x2f6a7a); stars(cv, 90, 31); moon(cv, 70, 60, 26, 0xdff2e6); },
    mid: (cv) => { cv.clear(); clouds(cv, 7, 0x9fd8e8, 32, [0.1, 0.4]); hills(cv, 250, 46, 0x0e2430, 33); water(cv, 250, 0x1b4a5c, 34); },
    near: (cv) => { cv.clear(); fireflies(cv, 26, 35); bamboo(cv, 0x123a24, 36, 7, 12); },
  },
  nightSky: {
    sky: (cv) => { sky(cv, 0x05060f, 0x171033, 0x4a2f7a); stars(cv, 210, 41); moon(cv, 190, 96, 52, 0xf2e6ff); },
    mid: (cv) => { cv.clear(); clouds(cv, 12, 0xb9a6e8, 42, [0.2, 0.85]); },
    near: (cv) => { cv.clear(); clouds(cv, 6, 0x6f5a9a, 43, [0.55, 1]); },
  },
  village: {
    sky: (cv) => { sky(cv, 0x2a1636, 0x7a3a2c, 0xff9a4a); stars(cv, 40, 51, 0.9); },
    mid: (cv) => { cv.clear(); clouds(cv, 8, 0xffc48a, 52, [0.1, 0.5]); hills(cv, 262, 54, 0x2a1c30, 53); roofs(cv, 268, 0x3a2a34, 54); },
    near: (cv) => { cv.clear(); roofs(cv, 372, 0x1d1420, 55, 5); fireflies(cv, 10, 56, 0xffc46a); },
  },
  bambooMoon: {
    sky: (cv) => { sky(cv, 0x04120c, 0x0e2a20, 0x2f6a4a); stars(cv, 120, 61); moon(cv, 296, 88, 44, 0xe8f6e0); },
    mid: (cv) => { cv.clear(); bamboo(cv, 0x14401f, 62, 16, 8); clouds(cv, 6, 0x9fd8b8, 63, [0.1, 0.4]); },
    near: (cv) => { cv.clear(); bamboo(cv, 0x0a2412, 64, 8, 20); grass(cv, 386, 0x143a1f, 65); },
  },
  moonCity: {
    sky: (cv) => { sky(cv, 0x02030a, 0x0a1030, 0x3a5aa0); stars(cv, 260, 71, 2); },
    mid: (cv) => { cv.clear(); moon(cv, 120, 120, 66, 0xdfe6f2); palace(cv, 72); },
    near: (cv) => { cv.clear(); hills(cv, 372, 40, 0x141a30, 73, 5); for (let i = 0; i < 40; i++) cv.fillCircle((i * 97) % PW, 380 + ((i * 53) % 30), 3 + (i % 4), alphaColor(0x2a3458, 0.8)); },
  },
};

export const STAGE_THEMES = Object.keys(THEMES);

/** Paint the three parallax layers for a stage theme. */
export function paintStageLayers(themeName) {
  const theme = THEMES[themeName] ?? THEMES.forestNight;
  const skyC = new Canvas(PW, PH);
  const midC = new Canvas(PW, PH);
  const nearC = new Canvas(PW, PH);
  theme.sky(skyC);
  theme.mid(midC);
  theme.near(nearC);
  fadeEdges(midC, 34);
  fadeEdges(nearC, 74, 26);
  return { sky: skyC, mid: midC, near: nearC };
}
