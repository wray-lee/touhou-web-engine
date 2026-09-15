import { shade, alphaColor, mix } from './png.mjs';

/**
 * Facial recipe for the procedural chibi painter.
 *
 * The single biggest reason the roster used to read as one character wearing
 * fourteen wigs is that every face shared one eye/mouth recipe. A spec's `face`
 * block now drives eye shape, lid coverage, lash weight, brow, mouth and blush,
 * so a sleepy Reisen and a sharp-eyed Yukari are built from different parts
 * rather than the same parts in different colours.
 *
 * Lives in its own module (rather than characters.mjs) because it is the piece
 * the preview tool and future art tests want to exercise on its own.
 */

const FACE_DEFAULTS = {
  eyes: 'round',
  eyeScale: 0.86,
  eyeSpacing: 0.385,
  eyeHeight: 0.335,
  lash: 1,
  lid: 0,
  brow: 'thin',
  browAngle: 0,
  mouth: 'smile',
  mouthWidth: 0.26,
  blush: 0.18,
};

/** Per-shape overrides applied on top of the spec's own numbers. */
const EYE_SHAPES = {
  round: {},
  wide: { eyeScale: 1.12, eyeHeight: 0.365, lid: -0.04 },
  narrow: { eyeScale: 1.1, eyeHeight: 0.265, lash: 1.1 },
  sharp: { eyeScale: 1.06, eyeHeight: 0.3, lash: 1.45, lid: 0.12 },
  sleepy: { eyeScale: 1.0, eyeHeight: 0.3, lid: 0.34 },
  gentle: { eyeScale: 1.02, eyeHeight: 0.32, lid: 0.18, lash: 0.85 },
  happy: { eyeScale: 1.04, eyeHeight: 0.3, lid: 0.22 },
};

export function faceOf(spec) {
  const shape = EYE_SHAPES[spec.face && spec.face.eyes] || {};
  return Object.assign({}, FACE_DEFAULTS, shape, spec.face || {});
}

/** Vertical gradient inside an ellipse, used for the iris so it has depth. */
function gradientEllipse(cv, x, y, rx, ry, top, bottom, alpha) {
  for (let py = Math.floor(y - ry); py <= Math.ceil(y + ry); py++) {
    const ny = (py + 0.5 - y) / ry;
    const half = rx * Math.sqrt(Math.max(0, 1 - ny * ny));
    const col = alphaColor(mix(top, bottom, (Math.max(-1, Math.min(1, ny)) + 1) / 2), alpha);
    cv.rectAA(x - half, py, half * 2, 1, col);
  }
}

/**
 * One eye: warm sclera, tall gradient iris, pupil, rim-light, two speculars and
 * a lash arc whose weight and lid coverage come from the recipe. `lid` slides
 * the lash down over the iris, which is what turns a wide innocent eye into a
 * sharp or sleepy one without touching the outline.
 */
function drawEye(cv, f, ex, ey, rw, rh, u, dir, eyeColor, eyeTint) {
  if (f.eyes === 'happy') {
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      pts.push({ x: ex + (t - 0.5) * rw * 2.1, y: ey + rh * 0.5 - Math.sin(t * Math.PI) * rh * 1.15 });
    }
    for (let k = 0; k < pts.length - 1; k++) {
      cv.line(pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y, 2.3 * u, alphaColor(0x1c1524, 0.95));
    }
    return;
  }

  cv.fillEllipse(ex, ey, rw * 1.04, rh * 1.02, alphaColor(0xf6f0f4, 0.96));
  gradientEllipse(cv, ex, ey + rh * 0.05, rw * 0.9, rh * 0.95, eyeTint, shade(eyeColor, -0.1), 1);
  cv.fillEllipse(ex, ey + rh * 0.16, rw * 0.3, rh * 0.38, alphaColor(shade(eyeColor, -0.66), 0.94));
  cv.fillEllipse(ex, ey + rh * 0.62, rw * 0.66, rh * 0.22, alphaColor(shade(eyeTint, 0.3), 0.66));
  cv.fillEllipse(ex - rw * 0.32, ey - rh * 0.42, rw * 0.32, rh * 0.24, alphaColor(0xffffff, 0.95));
  cv.fillEllipse(ex + rw * 0.36, ey + rh * 0.42, rw * 0.18, rh * 0.15, alphaColor(0xffffff, 0.7));

  const lidDrop = f.lid * rh;
  const lash = [];
  for (let k = 0; k <= 8; k++) {
    const a = Math.PI * (1.04 + (k / 8) * 0.92);
    const lift = f.eyes === 'sharp' ? Math.max(0, k / 8 - 0.5) * 0.34 * dir : 0;
    lash.push({
      x: ex + Math.cos(a) * rw * 1.16,
      y: ey + Math.sin(a) * rh * 1.12 + lidDrop - lift * rh,
    });
  }
  for (let k = 0; k < lash.length - 1; k++) {
    const w = (1.5 + 1.5 * Math.sin(((k + 0.5) / lash.length) * Math.PI)) * f.lash;
    cv.line(lash[k].x, lash[k].y, lash[k + 1].x, lash[k + 1].y, w * u, alphaColor(0x18121e, 0.96));
  }
  if (f.eyes === 'sharp') {
    const tip = lash[lash.length - 1];
    cv.line(tip.x, tip.y, tip.x + dir * rw * 0.5, tip.y - rh * 0.34, 1.9 * u * f.lash, alphaColor(0x18121e, 0.95));
  }
  cv.line(
    ex - rw * 0.72,
    ey + rh * (0.98 - f.lid * 0.5),
    ex + rw * 0.72,
    ey + rh * (0.94 - f.lid * 0.5),
    1.05 * u,
    alphaColor(0x2a2030, 0.5),
  );
}

/** Brow band above the eye; browAngle walks from worried to determined. */
function drawBrow(cv, f, ex, ey, rw, rh, u, dir, color) {
  if (f.brow === 'none') return;
  const thick = f.brow === 'thick' ? 1.7 : 1.15;
  const tilt = f.browAngle * rh * 0.42;
  const inner = { x: ex - dir * rw * 0.9, y: ey - rh * (1.14 - tilt) };
  const outer = { x: ex + dir * rw * 1.02, y: ey - rh * (1.28 + tilt * 0.4) };
  const mid = { x: (inner.x + outer.x) / 2, y: Math.min(inner.y, outer.y) - rh * 0.12 };
  cv.line(inner.x, inner.y, mid.x, mid.y, thick * u, alphaColor(color, 0.9));
  cv.line(mid.x, mid.y, outer.x, outer.y, thick * u, alphaColor(color, 0.9));
}

/** Mouth recipe. Everything except open/grin is a line, not a filled red blob. */
function drawMouth(cv, f, mx, my, hr, u, skinDark) {
  const half = hr * f.mouthWidth * 0.5;
  const curve = (span, depth, weight, color, samples) => {
    const pts = [];
    for (let k = 0; k <= samples; k++) {
      const t = k / samples;
      pts.push({ x: mx + (t - 0.5) * span, y: my + Math.sin(t * Math.PI) * depth });
    }
    for (let k = 0; k < pts.length - 1; k++) {
      cv.line(pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y, weight * u, alphaColor(color, 0.88));
    }
    return pts;
  };

  switch (f.mouth) {
    case 'flat':
      cv.line(mx - half * 0.7, my, mx + half * 0.7, my, 1.35 * u, alphaColor(0x8c3d47, 0.85));
      break;
    case 'small':
      curve(hr * 0.14, hr * 0.03, 1.3, 0x9c4351, 5);
      break;
    case 'grin': {
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        pts.push({
          x: mx + (t - 0.5) * half * 2.2,
          y: my + Math.sin(t * Math.PI) * hr * 0.075 - Math.abs(t - 0.5) * hr * 0.03,
        });
      }
      cv.fillPoly([pts[1], pts[pts.length - 2], { x: mx, y: my + hr * 0.08 }], alphaColor(0x6d2230, 0.8));
      for (let k = 0; k < pts.length - 1; k++) {
        cv.line(pts[k].x, pts[k].y, pts[k + 1].x, pts[k + 1].y, 1.55 * u, alphaColor(0x8c3340, 0.95));
      }
      break;
    }
    case 'open':
      cv.fillEllipse(mx, my + hr * 0.03, half * 0.92, hr * 0.062, alphaColor(0x6d2230, 0.92));
      cv.fillEllipse(mx, my + hr * 0.055, half * 0.6, hr * 0.03, alphaColor(0xd8707f, 0.85));

      break;
    case 'oh':
      cv.fillEllipse(mx, my + hr * 0.02, half * 0.34, hr * 0.045, alphaColor(0x7d2a37, 0.9));
      break;
    default:
      curve(half * 2, hr * 0.05, 1.45, 0x9c4351, 6);
  }
}

/**
 * Eyes, brows, nose, mouth and blush. Painted last so nothing can bury them:
 * at 124px on screen the face is the only thing a player actually resolves.
 */
export function drawFace(cv, s, cx, hy, hr, u, sway) {
  const f = faceOf(s);
  const skin = s.skin;
  const skinDark = s.skinShade || shade(skin, -0.22);
  const eyeColor = s.eyeColor || 0x3a2a44;
  const eyeTint = s.eyeTint || shade(eyeColor, 0.55);
  const browColor = shade(s.hair.color, -0.42);
  const lean = sway * hr * 0.02;
  const ey = hy + hr * f.eyeHeight;
  const rw = hr * 0.19 * f.eyeScale;
  const rh = hr * 0.3 * f.eyeScale;

  for (const dir of [-1, 1]) {
    const ex = cx + dir * hr * f.eyeSpacing + lean;
    drawBrow(cv, f, ex, ey, rw, rh, u, dir, browColor);
    drawEye(cv, f, ex, ey, rw, rh, u, dir, eyeColor, eyeTint);
  }
  cv.fillEllipse(cx + lean, ey + hr * 0.2, hr * 0.032, hr * 0.022, alphaColor(skinDark, 0.4));
  drawMouth(cv, f, cx + lean, ey + hr * 0.33, hr, u, skinDark);
  if (f.blush > 0) {
    for (const dir of [-1, 1]) {
      cv.fillEllipse(
        cx + dir * hr * 0.6 + lean,
        ey + hr * 0.23,
        hr * 0.15,
        hr * 0.075,
        alphaColor(0xff9aa8, f.blush),
      );
    }
  }
}
