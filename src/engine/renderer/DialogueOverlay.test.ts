/**
 * The width tiers that decide where a dialogue face stands, checked against the
 * face art that actually ships.
 *
 * Two of the message ops write `AnmVm::pos2` straight from C++, and they
 * disagree on purpose: `Gui.cpp:527-537` (op 1, run-script) has one test at
 * 128 px, while `Gui.cpp:566-590` (op 2, set-sprite) has two breaks, at 128 px
 * and 256 px, and only the widest tier gets a vertical lift. `PortraitOffsets`
 * holds those branches; this file holds the proof that the extracted sheets
 * straddle all three tiers, so the branches are not dead code, and that the box
 * ends up with the offset each branch prescribes.
 *
 * Pixi is mocked because the subject is a position machine, not a renderer: the
 * ANM VM, the resolvers, the tier tests and the fall-through between them all
 * run for real.
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('pixi.js', () => {
  class Vec2 {
    x = 0;
    y = 0;
    set(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  }
  class Container {
    visible = true;
    children: unknown[] = [];
    addChild(child: unknown) {
      this.children.push(child);
      return child;
    }
    destroy() {
      this.children = [];
    }
  }
  class Graphics {
    clear() {
      return this;
    }
    beginFill() {
      return this;
    }
    drawRect() {
      return this;
    }
    endFill() {
      return this;
    }
  }
  class Sprite extends Container {
    anchor = new Vec2();
    position = new Vec2();
    texture: { width: number; height: number } = { width: 0, height: 0 };
    x = 0;
    y = 0;
    alpha = 1;
    tint = 0xffffff;
  }
  class Text extends Container {
    text = '';
    anchor = new Vec2();
    position = new Vec2();
    style: Record<string, unknown> = {};
  }
  class TextStyle {
    constructor(options: Record<string, unknown>) {
      Object.assign(this, options);
    }
  }
  return { Container, Graphics, Sprite, Text, TextStyle };
});

const { DialogueOverlay } = await import('./DialogueOverlay');
const { anmScriptFromBase64 } = await import('../anm/AnmVm');
const { PORTRAIT_SCRIPT_WIDTH, PORTRAIT_TALL_SPRITE_WIDTH } = await import('../core/PortraitOffsets');

interface SpriteRecord {
  id: number;
  w: number;
}

interface Pack {
  sprites: SpriteRecord[];
  scripts: { base64: string }[];
}

/** Extracted with `npm run assets:th08`; absent on a source-only checkout. */
const MANIFEST = join(process.cwd(), 'public', 'assets', 'th08', 'manifest.json');

const packs: Record<string, Pack> = (() => {
  if (!existsSync(MANIFEST)) return {};
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, 'utf8')) as { anm?: Record<string, Pack> };
    return parsed.anm ?? {};
  } catch {
    return {};
  }
})();

const hasArt = Object.keys(packs).length > 0;

/** One `{pack, sprite, width}` triple taken from the real face sheets. */
interface Witness {
  pack: string;
  sprite: number;
  width: number;
  script: number;
}

function witness(tier: (width: number) => boolean): Witness | null {
  for (const [name, pack] of Object.entries(packs)) {
    if (!/^face_/.test(name) || pack.scripts.length === 0) continue;
    const hit = pack.sprites.find((entry) => tier(entry.w));
    if (hit) return { pack: name, sprite: hit.id, width: hit.w, script: 0 };
  }
  return null;
}

const NARROW = witness((width) => width <= PORTRAIT_SCRIPT_WIDTH);
const WIDE = witness((width) => width > PORTRAIT_SCRIPT_WIDTH && width <= PORTRAIT_TALL_SPRITE_WIDTH);
const TALLEST = witness((width) => width > PORTRAIT_TALL_SPRITE_WIDTH);

/** The `off x,y` channel of one `faceDebug()` line. */
function offsetOf(line: string | undefined): string {
  const match = /\soff (-?\d+),(-?\d+)\s/.exec(line ?? '');
  return match ? `${match[1]},${match[2]}` : 'none';
}

function makeOverlay(widths: Map<string, number>) {
  const scripts = new Map<string, Int32Array[]>();
  for (const [name, pack] of Object.entries(packs)) {
    scripts.set(
      name,
      pack.scripts.map((entry) => anmScriptFromBase64(entry.base64)),
    );
  }
  return new DialogueOverlay({
    arcade: { x: 0, y: 0, z: 0 },
    arcadeWidth: 384,
    lines: [
      { x: 8, y: 400 },
      { x: 8, y: 420 },
    ],
    slots: 4,
    scriptFor: (pack, index) => scripts.get(pack)?.[index] ?? null,
    faceFor: async (pack, sprite) => {
      const width = widths.get(`${pack}#${sprite}`);
      if (width === undefined) return null;
      return { texture: { width, height: width }, width };
    },
  });
}

/** Let the resolver promise inside `setSprite` land. */
async function settle(): Promise<void> {
  for (let pass = 0; pass < 4; pass++) await Promise.resolve();
}

function overlayFor(...held: Witness[]) {
  const widths = new Map<string, number>();
  for (const entry of held) widths.set(`${entry.pack}#${entry.sprite}`, entry.width);
  const overlay = makeOverlay(widths);
  held.forEach((entry, slot) => {
    overlay.bind(slot, entry.pack);
    overlay.setSprite(slot, entry.sprite);
  });
  return { overlay, held };
}

describe.skipIf(!hasArt)('shipped face art', () => {
  it('straddles every tier both width tests branch on', () => {
    expect(hasArt, MANIFEST).toBe(true);
    expect(NARROW, 'a bust at or under 128 px').not.toBeNull();
    expect(WIDE, 'a page between 129 and 256 px').not.toBeNull();
    expect(TALLEST, 'a spread wider than 256 px').not.toBeNull();
    // The witnesses are chosen by scanning the manifest, so the ledger can name
    // the art each tier is really standing on rather than a made-up number.
    expect(`${NARROW?.pack}=${NARROW?.width}`).toMatch(/^face_/);
    expect(WIDE!.width).toBeGreaterThan(PORTRAIT_SCRIPT_WIDTH);
    expect(TALLEST!.width).toBeGreaterThan(PORTRAIT_TALL_SPRITE_WIDTH);
  });
});

describe('op 2 (set-sprite) tiers', () => {
  it('shifts only sideways for a page wider than 128 px', async () => {
    if (!WIDE) return;
    const { overlay, held } = overlayFor(WIDE);
    await settle();
    expect(offsetOf(overlay.faceDebug()[0])).toBe('-80,0');
    expect(overlay.faceDebug()[0]).toContain(`w${held[0].width}`);
    overlay.destroy();
  });

  it('lifts as well for a spread wider than 256 px', async () => {
    if (!TALLEST) return;
    const { overlay } = overlayFor(TALLEST);
    await settle();
    expect(offsetOf(overlay.faceDebug()[0])).toBe('-208,-50');
    overlay.destroy();
  });

  it('leaves a bust at or under 128 px where its script put it', async () => {
    if (!NARROW) return;
    const { overlay } = overlayFor(NARROW);
    await settle();
    expect(offsetOf(overlay.faceDebug()[0])).toBe('0,0');
    overlay.destroy();
  });

  it('keeps the lift after narrowing, because the lower branches skip pos2.y', async () => {
    if (!TALLEST || !NARROW) return;
    // Retail writes `pos2.y` on the widest branch only, so a slot that once held
    // a 510 px spread stays raised after swapping back to a bust. Reproducing
    // that fall-through is why `applySpriteOffset` tests for `null`.
    const widths = new Map<string, number>([
      [`${TALLEST.pack}#${TALLEST.sprite}`, TALLEST.width],
      [`${NARROW.pack}#${NARROW.sprite}`, NARROW.width],
    ]);
    const overlay = makeOverlay(widths);
    overlay.bind(0, TALLEST.pack);
    overlay.setSprite(0, TALLEST.sprite);
    await settle();
    expect(offsetOf(overlay.faceDebug()[0])).toBe('-208,-50');

    overlay.bind(0, NARROW.pack);
    overlay.setSprite(0, NARROW.sprite);
    await settle();
    expect(offsetOf(overlay.faceDebug()[0])).toBe(`0,-50`);
    overlay.destroy();
  });
});

describe('op 1 (run-script) tier', () => {
  it('moves by one fixed amount for anything over 128 px', async () => {
    if (!NARROW || !TALLEST) return;
    // A single test, so the 254 px page and the 510 px spread move the same
    // 112 px: the two ops disagreeing about the same bitmap is the point.
    const { overlay } = overlayFor(NARROW, TALLEST);
    await settle();
    overlay.executeScript(0, 0);
    overlay.executeScript(1, 0);
    expect(offsetOf(overlay.faceDebug()[0])).toBe('0,0');
    expect(offsetOf(overlay.faceDebug()[1])).toBe('-112,-50');
    overlay.destroy();
  });

  it('does nothing when the slot has no bitmap yet', async () => {
    if (!WIDE) return;
    const overlay = makeOverlay(new Map());
    overlay.bind(0, WIDE.pack);
    overlay.executeScript(0, WIDE.script);
    expect(offsetOf(overlay.faceDebug()[0])).toBe('0,0');
    overlay.destroy();
  });
});
