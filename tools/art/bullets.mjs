import { Canvas, shade, alphaColor, rgb } from './png.mjs';

/** Fixed bullet palette: textures are baked per colour so white cores survive. */
export const BULLET_PALETTE = {
  red: 0xff3366,
  blue: 0x5bb8ff,
  cyan: 0x66e8ff,
  green: 0x66dd88,
  yellow: 0xffe066,
  orange: 0xffa64d,
  purple: 0xb06ae0,
  pink: 0xff8fd0,
  white: 0xf2f0ff,
  teal: 0x4ad8c0,
  indigo: 0x7a7aff,
  rose: 0xff5f9e,
};

/** Near-white core derived from the body colour (keeps the classic look). */
function coreOf(c) {
  return [Math.min(255, c[0] * 0.45 + 150), Math.min(255, c[1] * 0.45 + 150), Math.min(255, c[2] * 0.45 + 150), 1];
}
const R = 15; // disc radius inside a 40x40 tile

function base(size = 40) {
  return new Canvas(size, size);
}

/** Classic glowing orb: soft halo, coloured body, white core, specular dot. */
function ball(cv, c) {
  cv.radial(cv.width / 2, cv.height / 2, R * 0.6, R * 1.55, [
    [0, alphaColor(c, 0.5)],
    [1, alphaColor(c, 0)],
  ]);
  cv.fillCircle(cv.width / 2, cv.height / 2, R, shade(c, -0.15));
  cv.radial(cv.width / 2, cv.height / 2 - 1, 0, R * 0.95, [
    [0, [255, 255, 255, 1]],
    [0.45, alphaColor(shade(c, 0.45), 0.95)],
    [0.8, alphaColor(c, 0.95)],
    [1, alphaColor(shade(c, -0.35), 1)],
  ]);
  cv.fillCircle(cv.width / 2 - R * 0.3, cv.height / 2 - R * 0.36, R * 0.22, alphaColor(0xffffff, 0.85));
}

/** Hollow ring bullet. */
function ring(cv, c) {
  cv.radial(cv.width / 2, cv.height / 2, R * 0.7, R * 1.5, [[0, alphaColor(c, 0.4)], [1, alphaColor(c, 0)]]);
  cv.fillCircle(cv.width / 2, cv.height / 2, R, shade(c, -0.2));
  cv.radial(cv.width / 2, cv.height / 2, 0, R, [
    [0, alphaColor(0x120e1a, 0)],
    [0.42, alphaColor(0x120e1a, 0.95)],
    [0.5, alphaColor(shade(c, 0.5), 1)],
    [0.72, alphaColor(c, 1)],
    [0.92, alphaColor(shade(c, -0.25), 1)],
    [1, alphaColor(shade(c, -0.45), 1)],
  ]);
  cv.strokeCircle(cv.width / 2, cv.height / 2, R * 0.62, 1.6, alphaColor(0xffffff, 0.5));
}

/** Elongated capsule ("rice") pointing along +x. */
function rice(cv, c) {
  const cy = cv.height / 2;
  const len = R * 1.7;
  const w = R * 0.62;
  cv.radial(cv.width / 2, cy, 0, len * 1.25, [[0, alphaColor(c, 0.35)], [1, alphaColor(c, 0)]], { clampY: true });
  for (const [r, col] of [[w, shade(c, -0.25)], [w * 0.78, c], [w * 0.42, alphaColor(0xffffff, 0.95)]]) {
    cv.fillCircle(cv.width / 2 - len + r, cy, r, col);
    cv.fillCircle(cv.width / 2 + len - r, cy, r, col);
    cv.rectAA(cv.width / 2 - len + r, cy - r, (len - r) * 2, r * 2, col);
  }
}

/** Sharp spindle with a bright tip, pointing along +x. */
function needle(cv, c) {
  const cy = cv.height / 2;
  const tip = cv.width / 2 + R * 1.5;
  const tail = cv.width / 2 - R * 1.2;
  const w = R * 0.42;
  cv.fillPoly([{ x: tip, y: cy }, { x: cv.width / 2, y: cy - w }, { x: tail, y: cy }, { x: cv.width / 2, y: cy + w }], shade(c, -0.3));
  cv.fillPoly([{ x: tip - 1, y: cy }, { x: cv.width / 2, y: cy - w * 0.62 }, { x: tail + 2, y: cy }, { x: cv.width / 2, y: cy + w * 0.62 }], c);
  cv.fillPoly([{ x: tip - 2, y: cy - 0.5 }, { x: cv.width / 2 + 1, y: cy - w * 0.3 }, { x: tail + 4, y: cy - 0.5 }], alphaColor(0xffffff, 0.9));
}

/** Five-point star. */
function star(cv, c) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? R * 1.25 : R * 0.5;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push({ x: cv.width / 2 + Math.cos(a) * rr, y: cv.height / 2 + Math.sin(a) * rr });
  }
  cv.fillPoly(pts, shade(c, -0.35));
  const inner = pts.map((p) => ({ x: cv.width / 2 + (p.x - cv.width / 2) * 0.86, y: cv.height / 2 + (p.y - cv.height / 2) * 0.86 }));
  cv.fillPoly(inner, c);
  cv.fillCircle(cv.width / 2, cv.height / 2, R * 0.4, alphaColor(0xffffff, 0.9));
}

/** Translucent bubble with a rim light. */
function orb(cv, c) {
  cv.radial(cv.width / 2, cv.height / 2, 0, R, [
    [0, alphaColor(shade(c, 0.5), 0.25)],
    [0.7, alphaColor(c, 0.35)],
    [0.92, alphaColor(shade(c, 0.3), 0.95)],
    [1, alphaColor(shade(c, -0.3), 0)],
  ]);
  cv.strokeCircle(cv.width / 2, cv.height / 2, R * 0.92, 1.8, alphaColor(shade(c, 0.55), 0.9));
  cv.fillCircle(cv.width / 2 - R * 0.34, cv.height / 2 - R * 0.38, R * 0.2, alphaColor(0xffffff, 0.8));
}

/** Almond "eye" bullet with a pupil. */
function eye(cv, c) {
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  cv.fillPoly([
    { x: cx - R * 1.3, y: cy },
    { x: cx - R * 0.2, y: cy - R * 0.95 },
    { x: cx + R * 0.9, y: cy - R * 0.35 },
    { x: cx + R * 1.3, y: cy },
    { x: cx + R * 0.9, y: cy + R * 0.35 },
    { x: cx - R * 0.2, y: cy + R * 0.95 },
  ], shade(c, -0.3));
  cv.fillPoly([
    { x: cx - R * 1.1, y: cy },
    { x: cx - R * 0.15, y: cy - R * 0.72 },
    { x: cx + R * 0.8, y: cy - R * 0.24 },
    { x: cx + R * 1.1, y: cy },
    { x: cx + R * 0.8, y: cy + R * 0.24 },
    { x: cx - R * 0.15, y: cy + R * 0.72 },
  ], alphaColor(0xfdf6ee, 0.95));
  cv.fillCircle(cx + R * 0.05, cy, R * 0.42, c);
  cv.fillCircle(cx + R * 0.05, cy, R * 0.2, 0x140f1a);
}

/** Paper charm ("ofuda") with a brush stroke. */
function seal(cv, c) {
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  cv.fillRoundRect(cx - R * 0.72, cy - R * 1.15, R * 1.44, R * 2.3, 3, shade(c, -0.35));
  cv.fillRoundRect(cx - R * 0.6, cy - R * 1.02, R * 1.2, R * 2.04, 2, 0xf7f1e4);
  cv.line(cx - R * 0.3, cy - R * 0.6, cx + R * 0.3, cy - R * 0.15, 2.2, c);
  cv.line(cx + R * 0.3, cy - R * 0.15, cx - R * 0.25, cy + R * 0.3, 2.2, c);
  cv.line(cx - R * 0.25, cy + R * 0.3, cx + R * 0.32, cy + R * 0.78, 2.2, c);
}

/** Four-point twinkle. */
function spark(cv, c) {
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  cv.radial(cx, cy, 0, R * 1.3, [[0, alphaColor(0xffffff, 0.9)], [0.35, alphaColor(c, 0.5)], [1, alphaColor(c, 0)]]);
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    cv.fillPoly([
      { x: cx, y: cy },
      { x: cx + dx * R * 1.45, y: cy + dy * R * 1.45 - (dx ? 0 : 0) },
      { x: cx + dy * 2.6, y: cy + dx * 2.6 },
    ], alphaColor(shade(c, 0.3), 0.95));
  }
  cv.fillCircle(cx, cy, R * 0.28, 0xffffff);
}

/** Almond "mouth" bullet (Reisen / Mystia flavour). */
function mouth(cv, c) {
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  cv.fillEllipse(cx, cy, R * 1.25, R * 0.72, alphaColor(c, 0.35));
  cv.fillEllipse(cx, cy, R * 1.05, R * 0.55, c);
  cv.fillEllipse(cx, cy - R * 0.12, R * 0.72, R * 0.26, coreOf(c));
  cv.fillCircle(cx, cy, R * 0.2, 0x1a1424);
}

/** Harp-spike bullet with two rounded caps. */
function koto(cv, c) {
  const cx = cv.width / 2;
  const cy = cv.height / 2;
  cv.fillRoundRect(cx - R * 1.15, cy - R * 0.5, R * 2.3, R, R * 0.5, alphaColor(c, 0.4));
  cv.fillRoundRect(cx - R, cy - R * 0.36, R * 2, R * 0.72, R * 0.36, c);
  cv.fillRoundRect(cx - R * 0.72, cy - R * 0.14, R * 1.44, R * 0.28, R * 0.14, coreOf(c));
  cv.fillCircle(cx - R, cy, R * 0.34, shade(c, 0.3));
  cv.fillCircle(cx + R, cy, R * 0.34, shade(c, 0.3));
}

/** Straight laser segment: a vertical beam pointing up, stretched along its axis.
 *  The renderer rotates it onto `heading`, so the core must run top-to-bottom.
 */
function laserBeam(cv, c) {
  const cx = cv.width / 2;
  const hw = cv.width / 2;
  cv.rectAA(0, 0, cv.width, cv.height, alphaColor(c, 0.16));
  cv.rectAA(cx - hw * 0.86, 0, hw * 1.72, cv.height, alphaColor(c, 0.34));
  cv.rectAA(cx - hw * 0.62, 0, hw * 1.24, cv.height, shade(c, -0.2));
  cv.rectAA(cx - hw * 0.46, 0, hw * 0.92, cv.height, c);
  cv.rectAA(cx - hw * 0.2, 0, hw * 0.4, cv.height, coreOf(c));
}
/** Shape key -> painter. Bullets carry a `sprite` key resolved here. */
export const BULLET_SHAPES = {
  ball: (cv, c) => ball(cv, c),
  ring: (cv, c) => ring(cv, c),
  rice: (cv, c) => rice(cv, c),
  needle: (cv, c) => needle(cv, c),
  star: (cv, c) => star(cv, c),
  orb: (cv, c) => orb(cv, c),
  eye: (cv, c) => eye(cv, c),
  seal: (cv, c) => seal(cv, c),
  spark: (cv, c) => spark(cv, c),
  koto: (cv, c) => koto(cv, c),
  mouth: (cv, c) => mouth(cv, c),
  laser: (cv, c) => laserBeam(cv, c),
};

export const BULLET_SHAPE_KEYS = Object.keys(BULLET_SHAPES);

/** Render one bullet texture at the canonical tile size. */
export function paintBullet(shape, color, size = 40) {
  const cv = new Canvas(size, size);
  const draw = BULLET_SHAPES[shape] ?? BULLET_SHAPES.ball;
  draw(cv, rgb(color));
  return cv;
}

export function paintLaser(width, height, color) {
  const cv = new Canvas(width, height);
  const c = rgb(color);
  const core = [255, 255, 255, 1];
  const mid = shade(color, 0.35);
  cv.radial(width / 2, height / 2, 0, height / 2, [
    [0, [...core, 0.95]],
    [0.28, [...rgb(mid), 0.9]],
    [0.6, [...c, 0.55]],
    [1, [...c, 0]],
  ], { clampY: true });
  cv.fillRect(0, height / 2 - 1.5, width, 3, core);
  return cv;
}

/** Per-team player shot sprites (drawn pointing up). */
export function paintPlayerShot(color, accent, style) {
  const cv = new Canvas(24, 34);
  const c = rgb(color);
  const a = rgb(accent);
  cv.radial(12, 20, 0, 16, [[0, [...a, 0.55]], [0.5, [...c, 0.3]], [1, [...c, 0]]]);
  if (style === 'laser') {
    cv.fillRoundRect(9, 2, 6, 30, 3, c);
    cv.fillRoundRect(10.2, 3, 3.6, 28, 1.8, a);
    cv.fillRect(11, 4, 2, 26, [255, 255, 255, 0.95]);
  } else if (style === 'fan') {
    for (const [dx, dy, rot] of [[-5, 4, -0.35], [0, 0, 0], [5, 4, 0.35]]) {
      cv.fillPoly([{ x: 12 + dx, y: 4 + dy }, { x: 16 + dx, y: 20 + dy }, { x: 12 + dx, y: 30 + dy }, { x: 8 + dx, y: 20 + dy }], c);
      cv.fillPoly([{ x: 12 + dx, y: 8 + dy }, { x: 14 + dx, y: 20 + dy }, { x: 12 + dx, y: 26 + dy }, { x: 10 + dx, y: 20 + dy }], a);
    }
  } else if (style === 'orb') {
    // Yin-yang charm: a two-tone disc with counter-rotated pupils, used by homing shots.
    cv.fillCircle(12, 17, 10, c);
    const half = [];
    for (let i = 0; i <= 20; i++) {
      const ang = -Math.PI / 2 + (i / 20) * Math.PI;
      half.push({ x: 12 + Math.cos(ang) * 10, y: 17 + Math.sin(ang) * 10 });
    }
    cv.fillPoly(half, a);
    cv.fillCircle(12, 12.5, 3.4, a);
    cv.fillCircle(12, 21.5, 3.4, c);
    cv.fillCircle(12, 12.5, 1.5, c);
    cv.fillCircle(12, 21.5, 1.5, a);
    cv.fillEllipse(8.6, 11.4, 2.8, 1.8, [255, 255, 255, 0.45]);
    cv.strokeCircle(12, 17, 10, 1.2, [40, 30, 46, 0.85]);
  } else if (style === 'lance') {
    cv.fillPoly([{ x: 12, y: 0 }, { x: 17, y: 16 }, { x: 12, y: 32 }, { x: 7, y: 16 }], c);
    cv.fillPoly([{ x: 12, y: 4 }, { x: 15, y: 16 }, { x: 12, y: 28 }, { x: 9, y: 16 }], a);
    cv.fillRect(11, 6, 2, 22, [255, 255, 255, 0.9]);
  } else {
    cv.fillRoundRect(8.5, 3, 7, 28, 3.5, c);
    cv.fillRoundRect(10, 5, 4, 24, 2, a);
    cv.fillRect(11, 6, 2, 22, [255, 255, 255, 0.92]);
    cv.fillCircle(12, 4, 3.4, a);
  }
  return cv;
}

/** Explosion / hit / bomb effect frames. */
export function paintExplosion(frame, total, size = 72) {
  const cv = new Canvas(size, size);
  const t = frame / (total - 1);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * (0.12 + t * 0.4);
  const hot = [255, 250, 226, Math.max(0, 1 - t * 1.25)];
  const mid = [255, 196, 92, Math.max(0, 0.9 - t)];
  const rim = [255, 96, 64, Math.max(0, 0.75 - t * 0.9)];
  cv.radial(cx, cy, 0, r, [[0, hot], [0.45, mid], [0.8, rim], [1, [255, 90, 60, 0]]]);
  const petals = 9;
  for (let i = 0; i < petals; i++) {
    const a = (Math.PI * 2 * i) / petals + frame * 0.24;
    const len = r * (0.75 + 0.45 * Math.sin(i * 2.3 + frame));
    cv.strokeLine(cx + Math.cos(a) * r * 0.35, cy + Math.sin(a) * r * 0.35, cx + Math.cos(a) * len, cy + Math.sin(a) * len, 3.4 * (1 - t), mid);
  }
  if (t < 0.5) cv.fillCircle(cx, cy, r * 0.42, [255, 255, 255, (0.5 - t) * 1.6]);
  return cv;
}

export function paintGlow(size = 64) {
  const cv = new Canvas(size, size);
  cv.radial(size / 2, size / 2, 0, size / 2, [[0, [255, 255, 255, 1]], [0.35, [255, 255, 255, 0.45]], [1, [255, 255, 255, 0]]]);
  return cv;
}

export function paintRing(size = 96) {
  const cv = new Canvas(size, size);
  cv.strokeCircle(size / 2, size / 2, size * 0.42, size * 0.1, [255, 255, 255, 0.9]);
  cv.strokeCircle(size / 2, size / 2, size * 0.34, size * 0.05, [255, 255, 255, 0.4]);
  return cv;
}


/** Full-screen last-second flash: white core, gold rim, transparent corners. */
export function paintBombFlash(size = 256) {
  const cv = new Canvas(size, size);
  const c = rgb(0xffe9b8);
  cv.radial(size / 2, size / 2, 0, size / 2, [
    [0, [255, 255, 255, 0.95]],
    [0.35, alphaColor(0xfff4d0, 0.7)],
    [0.62, alphaColor(c, 0.34)],
    [1, alphaColor(c, 0)],
  ]);
  cv.strokeCircle(size / 2, size / 2, size * 0.31, size * 0.035, alphaColor(0xffffff, 0.35));
  return cv;
}
