import { Canvas, mix, shade, alphaColor, rgb } from './png.mjs';
import { drawFace } from './face.mjs';

/**
 * Character painter.
 *
 * Everything is derived from a declarative spec (see specs.mjs) and a single
 * unit multiplier `u`, so the same description renders at any resolution. The
 * generator paints at SS=3 and the renderer scales by texture width, which is
 * what gives the sprites their anti-aliased edges on screen.
 *
 * `phase` (0..1) drives the idle loop: body bob, hair sway, skirt swing and
 * wing flap, so bosses animate the same way the vendored Taisei sheets do.
 */

/** Supersample factor: the painter works in 1x units and emits SS x SS pixels. */
export const SS = 3;
/** Key light comes from the upper left, like every other sprite in the pack. */
const LIGHT = { x: -0.55, y: -0.72 };

/** Shade a colour by the surface normal's alignment with the key light. */
function lit(color, nx = 0, ny = 0, strength = 0.22) {
  const d = Math.max(-1, Math.min(1, nx * LIGHT.x + ny * LIGHT.y));
  return shade(color, d * strength);
}

const OUTLINE = 0x14101c;
/** Outlines pick up the local hue instead of flat black, which reads as cheaper. */
const edgeOf = (color, amount = -0.72) => shade(color, amount);

/** Draw a polygon slightly enlarged about its centroid to fake an outline. */
function outlined(cv, pts, fill, color, grow = 1.1) {
  const c = color ?? edgeOf(fill);
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  const outer = pts.map((p) => ({ x: cx + (p.x - cx) * grow + (p.ox ?? 0), y: cy + (p.y - cy) * grow }));
  cv.fillPoly(outer, c);
  cv.fillPoly(pts, fill);
}

function ellipsePair(cv, x, y, rx, ry, fill, color, grow = 1.09) {
  cv.fillEllipse(x, y, rx * grow, ry * grow, color ?? edgeOf(fill));
  cv.fillEllipse(x, y, rx, ry, fill);
}

/**
 * Vertical gradient fill inside a whole ellipse - hair masses, skirts and irises
 * use it. The row half-width is the ellipse equation measured from the centre, so
 * the silhouette closes at both poles instead of ending in a flat top.
 */
function gradientEllipse(cv, x, y, rx, ry, top, bottom, alpha = 1) {
  for (let py = Math.floor(y - ry); py <= Math.ceil(y + ry); py++) {
    const ny = (py + 0.5 - y) / ry;
    const half = rx * Math.sqrt(Math.max(0, 1 - ny * ny));
    const col = alphaColor(mix(top, bottom, (Math.max(-1, Math.min(1, ny)) + 1) / 2), alpha);
    cv.rectAA(x - half, py, half * 2, 1, col);
  }
}

/** Back hair mass behind the head/body, swayed by the idle phase. */
function backHair(cv, s, cx, hy, hr, u, sway) {
  const { hair } = s;
  const c = hair.color;
  const d = shade(c, -0.3);
  const l = shade(c, 0.18);
  switch (hair.style) {
    case 'twin': {
      cv.fillEllipse(cx, hy + hr * 0.5, hr * 1.05, hr * 1.5, d);
      for (const dir of [-1, 1]) {
        const off = sway * hr * 0.16 * dir;
        cv.fillEllipse(cx + dir * hr * 1.15 + off, hy + hr * 1.5, hr * 0.5, hr * 1.5, c);
        cv.fillEllipse(cx + dir * hr * 1.15 + off * 1.6, hy + hr * 2.6, hr * 0.34, hr * 0.7, d);
        cv.fillEllipse(cx + dir * hr * 1.05 + off, hy + hr * 1.2, hr * 0.16, hr * 0.9, alphaColor(l, 0.5));
      }
      break;
    }
    case 'long': {
      gradientEllipse(cv, cx, hy + hr * 0.35, hr * 1.12, hr * 1.35, l, d);
      cv.fillRoundRect(cx - hr * 1.1 + sway * hr * 0.1, hy + hr * 0.2, hr * 2.2, hr * 2.6, hr * 0.5, c);
      cv.fillEllipse(cx + sway * hr * 0.22, hy + hr * 2.7, hr * 1.0, hr * 0.55, d);
      for (let i = -2; i <= 2; i++) {
        cv.line(cx + i * hr * 0.42, hy + hr * 0.4, cx + i * hr * 0.5 + sway * hr * 0.3, hy + hr * 2.6, 1.2 * u, alphaColor(d, 0.5));
      }
      break;
    }
    case 'ponytail': {
      cv.fillEllipse(cx, hy, hr * 1.08, hr * 1.15, d);
      const off = sway * hr * 0.3;
      cv.fillEllipse(cx + hr * 1.25 + off, hy + hr * 1.2, hr * 0.42, hr * 1.25, c);
      cv.fillEllipse(cx + hr * 1.3 + off * 1.4, hy + hr * 2.1, hr * 0.26, hr * 0.6, d);
      break;
    }
    case 'bob': {
      gradientEllipse(cv, cx, hy + hr * 0.2, hr * 1.1, hr * 1.2, l, d);
      break;
    }
    default: {
      cv.fillEllipse(cx, hy, hr * 1.02, hr * 1.08, d);
    }
  }
}

function wings(cv, s, cx, cy, hr, u, sway) {
  if (!s.wings || s.wings.type === 'none') return;
  const c = s.wings.color;
  const d = shade(c, -0.35);
  const l = shade(c, 0.35);
  const flap = sway * 0.16;
  const span = hr * (s.wings.span ?? 2.1);
  if (s.wings.type === 'bat') {
    for (const dir of [-1, 1]) {
      const pts = [
        { x: cx + dir * hr * 0.3, y: cy - hr * 0.4 },
        { x: cx + dir * span * (1 - flap * 0.1), y: cy - hr * (1.5 - flap * 1.2) },
        { x: cx + dir * span * 1.02, y: cy - hr * (0.2 + flap * 0.5) },
        { x: cx + dir * span * 0.6, y: cy + hr * 0.5 },
      ];
      outlined(cv, pts, c, OUTLINE, 1.07);
      cv.fillPoly([
        { x: cx + dir * hr * 0.5, y: cy - hr * 0.3 },
        { x: cx + dir * span * 0.95, y: cy - hr * (1.15 - flap) },
        { x: cx + dir * span * 0.75, y: cy - hr * 0.1 },
      ], d);
      for (let f = 1; f <= 3; f++) {
        const t = f / 4;
        cv.line(cx + dir * hr * 0.45, cy - hr * 0.25, cx + dir * span * (0.55 + t * 0.45), cy - hr * (1.2 - t * 0.9), 1.1 * u, alphaColor(l, 0.45));
      }
    }
  } else if (s.wings.type === 'bird') {
    for (const dir of [-1, 1]) {
      const pts = [
        { x: cx + dir * hr * 0.3, y: cy - hr * 0.5 },
        { x: cx + dir * span * 0.75, y: cy - hr * (1.35 - flap * 1.4) },
        { x: cx + dir * span, y: cy - hr * (0.35 - flap * 0.4) },
        { x: cx + dir * span * 0.55, y: cy + hr * 0.55 },
      ];
      outlined(cv, pts, c, OUTLINE, 1.06);
      for (let f = 0; f < 4; f++) {
        const t = 0.22 + f * 0.2;
        cv.line(cx + dir * hr * 0.5, cy - hr * 0.25, cx + dir * span * t, cy - hr * (1.15 - t * 0.85) + flap * hr * 0.3, 1.3 * u, d);
      }
      cv.line(cx + dir * hr * 0.4, cy - hr * 0.45, cx + dir * span * 0.8, cy - hr * (1.25 - flap), 1.6 * u, alphaColor(l, 0.6));
    }
  } else {
    // fairy / insect: translucent lobes with a rim light
    for (const dir of [-1, 1]) {
      for (const [ox, oy, rx, ry] of [[0.9, -0.7, 0.62, 0.4], [0.75, 0.25, 0.44, 0.3]]) {
        const wob = 1 + sway * 0.06;
        cv.fillEllipse(cx + dir * hr * ox, cy + hr * oy, hr * rx * wob, hr * ry, alphaColor(c, 0.55));
        cv.strokeEllipse(cx + dir * hr * ox, cy + hr * oy, hr * rx * wob, hr * ry, 1.2 * u, alphaColor(l, 0.85));
        cv.fillEllipse(cx + dir * hr * (ox - 0.16), cy + hr * (oy - 0.12), hr * rx * 0.4, hr * ry * 0.4, alphaColor(0xffffff, 0.3));
      }
    }
  }
}

function dress(cv, s, cx, top, bottom, halfTop, halfBottom, u, sway) {
  const d = s.dress;
  const main = d.color;
  const dark = shade(main, -0.32);
  const light = shade(main, 0.22);
  const hem = sway * halfBottom * 0.07;
  const pts = [
    { x: cx - halfTop, y: top },
    { x: cx + halfTop, y: top },
    { x: cx + halfBottom + hem, y: bottom },
    { x: cx - halfBottom + hem, y: bottom },
  ];
  outlined(cv, pts, main, OUTLINE, 1.06);
  // form shadow down the right side, light band on the left
  cv.fillPoly([
    { x: cx + halfTop * 0.3, y: top + 1 },
    { x: cx + halfTop, y: top + 1 },
    { x: cx + halfBottom + hem, y: bottom - 1 },
    { x: cx + halfBottom * 0.42 + hem, y: bottom - 1 },
  ], alphaColor(dark, 0.55));
  cv.fillPoly([
    { x: cx - halfTop * 0.95, y: top + 2 },
    { x: cx - halfTop * 0.45, y: top + 2 },
    { x: cx - halfBottom * 0.62 + hem, y: bottom - 3 },
    { x: cx - halfBottom * 0.98 + hem, y: bottom - 3 },
  ], alphaColor(light, 0.4));
  // skirt folds
  const folds = 4;
  for (let i = 0; i < folds; i++) {
    const t = (i + 0.5) / folds;
    const xt = cx - halfTop + t * halfTop * 2;
    const xb = cx - halfBottom + hem + t * (halfBottom * 2);
    cv.line(xt, top + (bottom - top) * 0.35, xb, bottom - 2, 1.2 * u, alphaColor(dark, 0.5));
  }
  // hem shading + petticoat
  cv.fillPoly([
    { x: pts[3].x, y: bottom },
    { x: pts[2].x, y: bottom },
    { x: cx + halfBottom * 0.94 + hem, y: bottom - (bottom - top) * 0.16 },
    { x: cx - halfBottom * 0.94 + hem, y: bottom - (bottom - top) * 0.16 },
  ], alphaColor(dark, 0.7));

  if (d.style === 'apron') {
    cv.fillPoly([
      { x: cx - halfTop * 0.6, y: top + 3 },
      { x: cx + halfTop * 0.6, y: top + 3 },
      { x: cx + halfBottom * 0.72 + hem * 0.6, y: bottom - 3 },
      { x: cx - halfBottom * 0.72 + hem * 0.6, y: bottom - 3 },
    ], d.accent ?? 0xf3f0ea);
    cv.fillPoly([
      { x: cx + halfTop * 0.2, y: top + 3 },
      { x: cx + halfTop * 0.6, y: top + 3 },
      { x: cx + halfBottom * 0.72 + hem * 0.6, y: bottom - 3 },
      { x: cx + halfBottom * 0.4 + hem * 0.6, y: bottom - 3 },
    ], alphaColor(shade(d.accent ?? 0xf3f0ea, -0.2), 0.5));
  } else if (d.style === 'kimono') {
    cv.fillPoly([{ x: cx - halfTop * 0.8, y: top }, { x: cx, y: top }, { x: cx - halfBottom * 0.15, y: bottom }], d.accent ?? light);
    cv.fillPoly([{ x: cx + halfTop * 0.8, y: top }, { x: cx, y: top }, { x: cx + halfBottom * 0.15, y: bottom }], dark);
    cv.line(cx - halfTop * 0.5, top + 4, cx + halfTop * 0.1, top + 26, 1.6 * u, alphaColor(0xffffff, 0.25));
  } else if (d.style === 'military') {
    cv.line(cx, top + 2, cx, bottom - 2, 1.6 * u, dark);
    for (let i = 0; i < 3; i++) cv.fillCircle(cx - halfTop * 0.45, top + 8 + i * 9, 1.7 * u, d.accent ?? 0xf5d76e);
  } else {
    // wide skirt: petticoat frill
    const frill = d.accent ?? 0xffffff;
    cv.fillEllipse(cx + hem, bottom, halfBottom * 1.02, (bottom - top) * 0.13, frill);
    // scallops: five half-ellipses along the hem, shaded where they overlap
    const scallops = 5;
    for (let i = 0; i < scallops; i++) {
      const t = (i + 0.5) / scallops;
      const sx = cx - halfBottom + t * halfBottom * 2 + hem;
      const sr = (halfBottom * 2) / scallops / 2;
      cv.fillEllipse(sx, bottom + (bottom - top) * 0.015, sr * 0.92, (bottom - top) * 0.075, shade(frill, -0.12));
      cv.fillEllipse(sx, bottom + (bottom - top) * 0.005, sr * 0.7, (bottom - top) * 0.055, frill);
    }
  }
  // waist ribbon / belt
  const wy = top + (bottom - top) * 0.42;
  const sash = s.sash ?? shade(main, -0.5);
  cv.fillRoundRect(cx - halfTop * 1.02, wy, halfTop * 2.04, (bottom - top) * 0.12, 2 * u, lit(sash, 0.4, 0.3, 0.3));
  cv.fillRoundRect(cx - halfTop * 1.02, wy + (bottom - top) * 0.08, halfTop * 2.04, (bottom - top) * 0.04, 1, alphaColor(shade(sash, -0.45), 0.7));
  // collar
  cv.fillPoly([
    { x: cx - halfTop * 0.55, y: top },
    { x: cx + halfTop * 0.55, y: top },
    { x: cx + halfTop * 0.3, y: top + 9 * u },
    { x: cx - halfTop * 0.3, y: top + 9 * u },
  ], alphaColor(d.accent ?? light, 0.85));
}
/**
 * Face, hair and eyes. The head is the readability anchor of the whole sprite,
 * so the eyes are painted last and the bangs never cover them.
 */
function head(cv, s, cx, hy, hr, u, sway) {
  const { hair } = s;
  const hc = hair.color;
  const hd = shade(hc, -0.3);
  const hl = shade(hc, 0.28);
  const skin = s.skin;
  const skinDark = s.skinShade ?? shade(skin, -0.22);

  // skull + face, shaded toward the light
  ellipsePair(cv, cx, hy, hr * 0.92, hr, lit(skin, -0.35, -0.2, 0.14), OUTLINE);
  cv.fillEllipse(cx + hr * 0.45, hy + hr * 0.3, hr * 0.3, hr * 0.36, alphaColor(skinDark, 0.45));
  // neck shadow under the chin
  cv.fillEllipse(cx, hy + hr * 0.92, hr * 0.42, hr * 0.2, alphaColor(shade(skin, -0.45), 0.5));
  // chin highlight
  cv.fillEllipse(cx - hr * 0.18, hy + hr * 0.6, hr * 0.24, hr * 0.14, alphaColor(shade(skin, 0.2), 0.5));

  // Hair cap: a gradient dome over the skull, then the face is restored through a
  // curved hairline so the forehead and eyes always stay readable. Restoring the
  // pre-hair pixels keeps the hair rim beside the face; erasing the dome instead
  // punched a soft hole through the skin underneath, which is what made every
  // procedurally painted face read as translucent.
  const capY = hy - hr * 0.3;
  const underHair = cv.copy();
  cv.fillEllipse(cx, capY, hr * 1.04, hr * 0.98, hd);
  gradientEllipse(cv, cx, capY - hr * 0.04, hr * 1.0, hr * 0.94, hl, hc);
  cv.fillEllipse(cx - hr * 0.36, capY - hr * 0.44, hr * 0.42, hr * 0.17, alphaColor(0xffffff, 0.4));
  cv.restoreEllipse(underHair, cx, hy + hr * 0.74, hr * 0.94, hr * 0.86);

  // bangs
  const tip = hy - hr * 0.02;
  const lean = sway * hr * 0.06;
  switch (hair.bangs) {
    case 'straight': {
      cv.fillRoundRect(cx - hr * 0.96 + lean, hy - hr * 0.78, hr * 1.92, tip - (hy - hr * 0.78), hr * 0.34, hc);
      cv.fillEllipse(cx + lean, tip, hr * 0.94, hr * 0.2, hd);
      for (let i = -2; i <= 2; i++) {
        cv.line(cx + i * hr * 0.36 + lean, hy - hr * 0.7, cx + i * hr * 0.36 + lean, tip - hr * 0.05, 1.1 * u, alphaColor(hd, 0.55));
      }
      break;
    }
    case 'pointed': {
      for (let i = -2; i <= 2; i++) {
        const bx = cx + i * hr * 0.4 + lean;
        cv.fillPoly([{ x: bx - hr * 0.24, y: hy - hr * 0.72 }, { x: bx + hr * 0.24, y: hy - hr * 0.72 }, { x: bx + lean * 0.5, y: tip + hr * 0.06 }], i % 2 ? hc : shade(hc, -0.08));
      }
      break;
    }
    case 'side': {
      cv.fillPoly([
        { x: cx - hr * 0.98, y: hy - hr * 0.8 },
        { x: cx + hr * 0.98, y: hy - hr * 0.8 },
        { x: cx + hr * 0.2 + lean, y: tip },
        { x: cx - hr * 0.98, y: tip - hr * 0.1 },
      ], hc);
      cv.fillPoly([
        { x: cx - hr * 0.98, y: hy - hr * 0.5 },
        { x: cx - hr * 0.34, y: hy - hr * 0.6 },
        { x: cx - hr * 0.66 + lean, y: tip + hr * 0.5 },
        { x: cx - hr * 0.99, y: tip + hr * 0.1 },
      ], hd);
      cv.line(cx - hr * 0.6, hy - hr * 0.72, cx + hr * 0.1 + lean, tip - hr * 0.15, 1.4 * u, alphaColor(hl, 0.5));
      break;
    }
    default: {
      cv.fillPoly([
        { x: cx - hr * 0.98, y: hy - hr * 0.6 },
        { x: cx + hr * 0.98, y: hy - hr * 0.6 },
        { x: cx + hr * 0.7, y: tip - hr * 0.1 },
        { x: cx, y: hy - hr * 0.28 },
        { x: cx - hr * 0.7, y: tip - hr * 0.1 },
      ], hc);
    }
  }
  // side locks frame the face without covering it
  for (const dir of [-1, 1]) {
    const lockLen = hair.style === 'long' ? hr * 2.2 : hr * 1.25;
    const off = sway * hr * 0.1 * dir;
    const topX = cx + dir * hr * 0.9 + off;
    const topY = hy - hr * 0.56;
    // Tapered lock: wide at the temple and narrowing to a soft point. The
    // rounded rect this replaces hung off every head in the roster like a
    // plastic strap, which was most of why the hair read as one helmet.
    cv.fillPoly(
      [
        { x: topX - hr * 0.17, y: topY },
        { x: topX + hr * 0.17, y: topY },
        { x: topX + dir * hr * 0.12 + hr * 0.09, y: topY + lockLen * 0.6 },
        { x: topX + dir * hr * 0.1, y: topY + lockLen },
        { x: topX - dir * hr * 0.12 - hr * 0.05, y: topY + lockLen * 0.58 },
      ],
      hc,
    );
    cv.line(
      topX - dir * hr * 0.05,
      topY + hr * 0.06,
      topX + dir * hr * 0.02,
      topY + lockLen * 0.86,
      1.6 * u,
      alphaColor(hl, 0.4),
    );
  }

  //
  // Face. Eyes, brows and mouth are per-character (see face.mjs) and painted
  // last, because at 124px on screen the face is the only thing a player reads.
  //
  drawFace(cv, s, cx, hy, hr, u, sway);
}

function hat(cv, s, cx, hy, hr, u) {
  if (!s.hat || s.hat.type === 'none') return;
  const c = s.hat.color;
  const d = shade(c, -0.32);
  const l = shade(c, 0.25);
  switch (s.hat.type) {
    case 'mobcap': {
      cv.fillEllipse(cx, hy - hr * 0.72, hr * 1.16, hr * 0.62, c);
      cv.fillEllipse(cx, hy - hr * 0.5, hr * 1.24, hr * 0.34, d);
      cv.fillEllipse(cx - hr * 0.4, hy - hr * 0.95, hr * 0.4, hr * 0.2, alphaColor(l, 0.6));
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.08 + (i / 8) * 0.84);
        cv.fillEllipse(cx - Math.cos(a) * hr * 1.24, hy - hr * 0.5 + Math.sin(a) * hr * 0.16, hr * 0.07, hr * 0.12, alphaColor(l, 0.7));
      }
      break;
    }
    case 'witch': {
      cv.fillEllipse(cx, hy - hr * 0.95, hr * 1.5, hr * 0.34, d);
      cv.fillPoly([{ x: cx - hr * 0.72, y: hy - hr * 0.98 }, { x: cx + hr * 0.72, y: hy - hr * 0.98 }, { x: cx + hr * 0.3, y: hy - hr * 2.1 }, { x: cx - hr * 0.15, y: hy - hr * 2.35 }], c);
      cv.fillPoly([{ x: cx - hr * 0.72, y: hy - hr * 0.98 }, { x: cx - hr * 0.3, y: hy - hr * 0.98 }, { x: cx - hr * 0.05, y: hy - hr * 2.2 }, { x: cx - hr * 0.15, y: hy - hr * 2.35 }], alphaColor(l, 0.4));
      cv.fillRoundRect(cx - hr * 0.66, hy - hr * 1.16, hr * 1.32, hr * 0.26, 3 * u, s.hat.accent ?? 0xf5d76e);
      break;
    }
    case 'cap': {
      cv.fillEllipse(cx, hy - hr * 0.95, hr * 1.02, hr * 0.5, c);
      cv.fillPoly([{ x: cx - hr * 1.05, y: hy - hr * 0.95 }, { x: cx + hr * 1.05, y: hy - hr * 0.95 }, { x: cx + hr * 0.8, y: hy - hr * 0.62 }, { x: cx - hr * 0.8, y: hy - hr * 0.62 }], d);
      cv.fillCircle(cx, hy - hr * 1.3, hr * 0.16, s.hat.accent ?? l);
      cv.line(cx - hr * 0.9, hy - hr * 0.72, cx + hr * 0.9, hy - hr * 0.72, 1.3 * u, alphaColor(l, 0.5));
      break;
    }
    case 'ribbon': {
      const rx = hr * 0.55;
      for (const dir of [-1, 1]) {
        cv.fillPoly([
          { x: cx + dir * hr * 0.18, y: hy - hr * 1.0 },
          { x: cx + dir * (hr * 0.18 + rx), y: hy - hr * 1.35 },
          { x: cx + dir * (hr * 0.18 + rx), y: hy - hr * 0.7 },
          { x: cx + dir * hr * 0.18, y: hy - hr * 0.92 },
        ], c);
        cv.fillPoly([
          { x: cx + dir * hr * 0.22, y: hy - hr * 0.98 },
          { x: cx + dir * (hr * 0.18 + rx * 0.7), y: hy - hr * 1.22 },
          { x: cx + dir * (hr * 0.18 + rx * 0.7), y: hy - hr * 0.86 },
        ], alphaColor(l, 0.5));
      }
      cv.fillCircle(cx, hy - hr * 1.0, hr * 0.2, d);
      cv.fillCircle(cx - hr * 0.05, hy - hr * 1.05, hr * 0.08, alphaColor(l, 0.8));
      break;
    }
    case 'hood': {
      cv.fillEllipse(cx, hy - hr * 0.74, hr * 1.2, hr * 0.6, c);
      for (const dir of [-1, 1]) cv.fillEllipse(cx + dir * hr * 1.04, hy + hr * 0.16, hr * 0.24, hr * 0.86, c);
      cv.fillEllipse(cx, hy - hr * 0.74, hr * 0.96, hr * 0.4, d);
      cv.fillEllipse(cx - hr * 0.34, hy - hr * 1.0, hr * 0.34, hr * 0.16, alphaColor(l, 0.55));
      break;
    }
    case 'ears': {
      for (const dir of [-1, 1]) {
        cv.fillEllipse(cx + dir * hr * 0.55, hy - hr * 1.75, hr * 0.3, hr * 0.95, c);
        cv.fillEllipse(cx + dir * hr * 0.55, hy - hr * 1.7, hr * 0.16, hr * 0.68, s.hat.accent ?? shade(c, -0.5));
        cv.fillEllipse(cx + dir * hr * 0.48, hy - hr * 2.1, hr * 0.07, hr * 0.3, alphaColor(0xffffff, 0.5));
      }
      break;
    }
    case 'halo': {
      cv.strokeEllipse(cx, hy - hr * 1.5, hr * 1.1, hr * 0.3, 3.2 * u, c);
      cv.strokeEllipse(cx, hy - hr * 1.5, hr * 1.1, hr * 0.3, 1.4 * u, alphaColor(l, 0.9));
      break;
    }
  }
}
/** Hand-held props and accessories, all expressed in `u` units. */
function extras(cv, s, cx, hy, hr, top, bottom, u, sway) {
  for (const item of s.extras ?? []) {
    const c = item.color ?? 0xffffff;
    switch (item.type) {
      case 'glasses': {
        for (const dir of [-1, 1]) cv.strokeEllipse(cx + dir * hr * 0.36, hy + hr * 0.2, hr * 0.24, hr * 0.22, 1.4 * u, c);
        cv.line(cx - hr * 0.12, hy + hr * 0.2, cx + hr * 0.12, hy + hr * 0.2, 1.4 * u, c);
        for (const dir of [-1, 1]) cv.fillEllipse(cx + dir * hr * 0.36 - hr * 0.08, hy + hr * 0.12, hr * 0.07, hr * 0.05, alphaColor(0xffffff, 0.5));
        break;
      }
      case 'scarf': {
        cv.fillRoundRect(cx - hr * 0.95, top - 6 * u, hr * 1.9, 9 * u, 4 * u, c);
        cv.fillPoly([
          { x: cx + hr * 0.3, y: top },
          { x: cx + hr * 0.85, y: top },
          { x: cx + hr * 0.6 + sway * hr * 0.2, y: top + 26 * u },
          { x: cx + hr * 0.15 + sway * hr * 0.12, y: top + 24 * u },
        ], shade(c, -0.2));
        break;
      }
      case 'necktie': {
        cv.fillPoly([{ x: cx, y: top - 2 * u }, { x: cx + hr * 0.2, y: top + 4 * u }, { x: cx, y: top + 24 * u }, { x: cx - hr * 0.2, y: top + 4 * u }], c);
        cv.fillPoly([{ x: cx, y: top - 2 * u }, { x: cx + hr * 0.2, y: top + 4 * u }, { x: cx + hr * 0.04, y: top + 12 * u }], alphaColor(shade(c, 0.3), 0.6));
        break;
      }
      case 'knife': {
        const bx = cx + hr * 1.5;
        const by = top + 14 * u;
        for (let i = -1; i <= 1; i++) {
          cv.fillPoly([
            { x: bx + i * 7 * u, y: by - 12 * u },
            { x: bx + i * 7 * u + 3 * u, y: by - 2 * u },
            { x: bx + i * 7 * u, y: by + 10 * u },
            { x: bx + i * 7 * u - 3 * u, y: by - 2 * u },
          ], c);
          cv.fillPoly([
            { x: bx + i * 7 * u, y: by - 12 * u },
            { x: bx + i * 7 * u + 1.2 * u, y: by - 2 * u },
            { x: bx + i * 7 * u, y: by + 4 * u },
          ], alphaColor(0xffffff, 0.55));
        }
        break;
      }
      case 'lantern': {
        const lx = cx - hr * 1.6;
        const ly = top + 16 * u + sway * 2 * u;
        cv.line(cx - hr * 0.9, top + 6 * u, lx, ly - 10 * u, 1.4 * u, 0x5a4a3a);
        cv.radial(lx, ly, 2 * u, 22 * u, [[0, alphaColor(0xfff0b0, 0.5)], [1, alphaColor(0xffd27a, 0)]]);
        cv.fillRoundRect(lx - 7 * u, ly - 10 * u, 14 * u, 20 * u, 5 * u, alphaColor(c, 0.85));
        cv.fillCircle(lx, ly, 5 * u, alphaColor(0xfff4c0, 0.95));
        cv.fillRoundRect(lx - 8 * u, ly - 12 * u, 16 * u, 4 * u, 2 * u, 0x4a3a2a);
        cv.fillRoundRect(lx - 8 * u, ly + 9 * u, 16 * u, 4 * u, 2 * u, 0x4a3a2a);
        break;
      }
      case 'broom': {
        cv.line(cx + hr * 1.2, top - 14 * u, cx + hr * 1.7, bottom - 6 * u, 2.6 * u, 0x8a6a3a);
        cv.fillPoly([
          { x: cx + hr * 1.6, y: bottom - 10 * u },
          { x: cx + hr * 1.95, y: bottom + 4 * u },
          { x: cx + hr * 1.35, y: bottom + 4 * u },
        ], c);
        break;
      }
      case 'moon': {
        cv.fillCircle(cx + hr * 1.55, top + 6 * u, 9 * u, c);
        cv.fillCircle(cx + hr * 1.55 + 3.5 * u, top + 4 * u, 8 * u, [0, 0, 0, 0]);
        break;
      }
      case 'staff': {
        cv.line(cx + hr * 1.35, top - 16 * u, cx + hr * 1.35, bottom - 4 * u, 2.4 * u, 0xd8c48a);
        cv.fillCircle(cx + hr * 1.35, top - 18 * u, 6 * u, c);
        cv.fillCircle(cx + hr * 1.35, top - 18 * u, 3 * u, 0xffffff);
        break;
      }
      case 'gun': {
        cv.fillRoundRect(cx + hr * 1.1, top + 10 * u, 16 * u, 6 * u, 2 * u, c);
        cv.fillRoundRect(cx + hr * 1.15, top + 15 * u, 5 * u, 8 * u, 2 * u, shade(c, -0.3));
        cv.fillRect(cx + hr * 1.1 + 12 * u, top + 11.5 * u, 4 * u, 2 * u, alphaColor(0xffffff, 0.4));
        break;
      }
      case 'sunflower': {
        const fx = cx + hr * 1.5;
        const fy = top + 10 * u;
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 * i) / 12 + sway * 0.2;
          cv.fillEllipse(fx + Math.cos(a) * 8 * u, fy + Math.sin(a) * 8 * u, 4 * u, 2.4 * u, c);
        }
        cv.fillCircle(fx, fy, 5 * u, 0x6b4423);
        cv.fillCircle(fx - 1.5 * u, fy - 1.5 * u, 2 * u, alphaColor(0x8a5c30, 0.9));
        break;
      }
      case 'ice': {
        for (let i = 0; i < 3; i++) {
          const ix = cx + hr * 1.45;
          const iy = top + (4 + i * 9) * u;
          cv.fillPoly([
            { x: ix, y: iy - 5 * u },
            { x: ix + 4 * u, y: iy },
            { x: ix, y: iy + 5 * u },
            { x: ix - 4 * u, y: iy },
          ], alphaColor(c, 0.9));
          cv.fillPoly([
            { x: ix, y: iy - 5 * u },
            { x: ix + 1.4 * u, y: iy - 1 * u },
            { x: ix, y: iy + 2 * u },
          ], alphaColor(0xffffff, 0.6));
        }
        break;
      }
      case 'bell': {
        const bx = cx + hr * 1.45;
        const by = top + 12 * u;
        cv.fillRoundRect(bx - 6 * u, by - 7 * u, 12 * u, 12 * u, 5 * u, c);
        cv.fillCircle(bx, by + 6 * u, 2.6 * u, shade(c, -0.35));
        cv.fillEllipse(bx - 2 * u, by - 3 * u, 2 * u, 1.4 * u, alphaColor(0xffffff, 0.55));
        break;
      }
      case 'bottle': {
        const bx = cx + hr * 1.45;
        const by = top + 12 * u;
        cv.fillRoundRect(bx - 5 * u, by - 6 * u, 10 * u, 14 * u, 4 * u, alphaColor(c, 0.85));
        cv.fillRoundRect(bx - 2 * u, by - 11 * u, 4 * u, 6 * u, 1.5 * u, 0xd8c48a);
        cv.fillRect(bx - 3.5 * u, by - 1 * u, 7 * u, 1.4 * u, alphaColor(0xffffff, 0.5));
        break;
      }
      case 'sword': {
        const bx = cx + hr * 1.3;
        cv.line(bx, top - 18 * u, bx + 4 * u, bottom - 16 * u, 3 * u, 0x8a7a5a);
        cv.fillPoly([
          { x: bx - 1 * u, y: top - 30 * u },
          { x: bx + 3 * u, y: top - 16 * u },
          { x: bx + 1 * u, y: top - 12 * u },
          { x: bx - 3 * u, y: top - 18 * u },
        ], c);
        cv.fillRect(bx - 6 * u, top - 18 * u, 12 * u, 3 * u, 0xd8b23a);
        break;
      }
      case 'ofuda': {
        for (let i = 0; i < 3; i++) {
          cv.fillRoundRect(cx + hr * 1.15 + i * 4 * u, top + (6 + i * 3) * u, 9 * u, 16 * u, 2 * u, c);
          cv.line(cx + hr * 1.19 + i * 4 * u, top + 9 * u + i * 3 * u, cx + hr * 1.19 + i * 4 * u, top + 19 * u + i * 3 * u, 1.2 * u, 0xc41e3a);
        }
        break;
      }
      case 'book': {
        cv.fillRoundRect(cx + hr * 1.15, top + 8 * u, 15 * u, 11 * u, 2 * u, c);
        cv.fillRoundRect(cx + hr * 1.2, top + 10 * u, 12 * u, 7 * u, 1 * u, 0xf6f1e2);
        cv.line(cx + hr * 1.8, top + 10 * u, cx + hr * 1.8, top + 17 * u, 1 * u, alphaColor(0x8a7a5a, 0.8));
        break;
      }
      case 'fan': {
        const fx = cx - hr * 1.35;
        const fy = top + 12 * u;
        for (let i = 0; i < 7; i++) {
          const a = -Math.PI * 0.75 + (i / 6) * Math.PI * 0.5;
          cv.line(fx, fy, fx + Math.cos(a) * 13 * u, fy + Math.sin(a) * 13 * u, 2.2 * u, alphaColor(c, 0.9));
        }
        cv.fillCircle(fx, fy, 2.4 * u, shade(c, -0.4));
        break;
      }
    }
  }
}

/**
 * Paint one pose of a chibi character from a declarative spec.
 * `phase` is 0..1 around the idle loop; pass 0 for the still portrait.
 */
export function paintCharacter(spec, phase = 0, scale = SS) {
  const u = scale;
  const w = (spec.w ?? 96) * u;
  const h = (spec.h ?? 112) * u;
  const cv = new Canvas(w, h);
  const cx = w / 2;
  const wave = Math.sin(phase * Math.PI * 2);
  const sway = Math.cos(phase * Math.PI * 2);
  const bob = wave * 1.1 * u;

  // build lets a spec change silhouette without changing its palette:
  // head size, shoulder width, skirt flare and leg length.
  const build = { headR: 1, shoulders: 1, flare: 1, legLen: 1, ...(spec.build ?? {}) };
  const hr = (spec.headRadius ?? w * 0.175) * build.headR;
  const hy = h * (spec.headY ?? 0.275) + bob;
  const shoulder = hy + hr * 1.12;
  const bottom = h - (spec.footGap ?? 6) * u;

  wings(cv, spec, cx, shoulder + 6 * u, hr, u, sway);

  // legs / feet
  for (const dir of [-1, 1]) {
    const lx = cx + dir * hr * 0.5;
    cv.fillRoundRect(
      lx - 4 * u,
      bottom - 16 * u * build.legLen,
      8 * u,
      16 * u * build.legLen,
      3 * u, lit(spec.legColor ?? shade(spec.dress.color, -0.45), dir * 0.4, 0.2, 0.2));
    const shoe = spec.shoeColor ?? 0x2a2230;
    cv.fillRoundRect(lx - 5.6 * u, bottom - 5.2 * u, 11.2 * u, 5.6 * u, 2.4 * u, lit(shoe, dir * 0.5, -0.4, 0.2));
    cv.fillRoundRect(lx - 5.6 * u, bottom - 1.4 * u, 11.2 * u, 1.8 * u, 0.8 * u, shade(shoe, -0.5));
    cv.fillEllipse(lx - 2.2 * u, bottom - 4 * u, 2.2 * u, 1.1 * u, alphaColor(0xffffff, 0.24));
  }

  backHair(cv, spec, cx, hy, hr, u, sway);
  const halfTop = hr * 0.74 * build.shoulders;
  const halfBottom =
    hr * (spec.dress.style === 'wide' ? 1.5 : spec.dress.style === 'kimono' ? 1.3 : 1.12) * build.flare;
  dress(cv, spec, cx, shoulder, bottom - 12 * u * build.legLen, halfTop, halfBottom, u, sway);

  // arms with a sleeve cuff and a hand
  for (const dir of [-1, 1]) {
    const swing = sway * 1.2 * u * dir;
    const pts = [
      { x: cx + dir * halfTop * 0.85, y: shoulder + 2 * u },
      { x: cx + dir * (halfTop * 0.85 + 7 * u), y: shoulder + 4 * u },
      { x: cx + dir * (halfTop * 0.7 + 6 * u) + swing, y: shoulder + 26 * u },
      { x: cx + dir * (halfTop * 0.7 - 1 * u) + swing, y: shoulder + 25 * u },
    ];
    outlined(cv, pts, spec.dress.color, OUTLINE, 1.12);
    cv.fillPoly(pts.map((p) => ({ x: p.x, y: p.y })), alphaColor(shade(spec.dress.color, dir < 0 ? 0.16 : -0.2), 0.5));
    // Hands sit in front of the skirt, not on top of it: a mitten angled
    // inward with a sleeve cuff above. Two pale circles on the hips was the
    // single cheapest thing in the whole pack.
    const hx = cx + dir * halfTop * 0.5 + swing;
    const hy2 = shoulder + 25 * u;
    cv.fillRoundRect(hx - dir * 3.4 * u - 2.7 * u, hy2 - 7.4 * u, 5.4 * u, 7.6 * u, 2.2 * u,
      lit(spec.dress.color, dir * 0.4, -0.3, 0.26));
    cv.fillEllipse(hx, hy2, 3.0 * u, 3.5 * u, OUTLINE);
    cv.fillEllipse(hx, hy2, 2.5 * u, 3.0 * u, lit(shade(spec.skin, -0.1), dir * 0.4, 0.5, 0.16));
    // thumb
    cv.fillEllipse(hx - dir * 2.1 * u, hy2 - 1.1 * u, 1.2 * u, 1.6 * u, lit(shade(spec.skin, -0.16), dir * 0.4, 0.5, 0.16));
    cv.fillEllipse(hx + dir * 0.6 * u, hy2 - 1.4 * u, 1.1 * u, 0.8 * u, alphaColor(0xffffff, 0.2));
  }

  head(cv, spec, cx, hy, hr, u, sway);
  hat(cv, spec, cx, hy, hr, u);
  extras(cv, spec, cx, hy, hr, shoulder, bottom, u, sway);

  // soft contact shadow under the sprite
  for (let i = 4; i >= 1; i--) {
    cv.fillEllipse(cx, bottom + 2 * u, halfBottom * (0.6 + i * 0.12), (1.6 + i * 0.7) * u, alphaColor(0x000000, 0.07));
  }
  return cv;
}

/**
 * Render a whole idle loop for a spec. Frame 0 is the canonical still used for
 * portraits and the static fallback; the rest feed the animated sheet slots.
 */
export function paintCharacterFrames(spec, frames = 6) {
  const out = [];
  for (let i = 0; i < frames; i++) out.push(paintCharacter(spec, i / frames));
  return out;
}