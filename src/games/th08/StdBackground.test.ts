import { describe, expect, it } from 'vitest';
import {
  STD_KEY_BY_ROUTE,
  STD_VIEW_H,
  STD_VIEW_W,
  StdBackground,
  stdClearColor,
  stdPages,
} from './StdBackground';
import { TH08_STD } from './data/th08-std';

/**
 * A sanity bound, not a viewport test. A corner just in front of the near plane is
 * meant to land far outside the playfield — the layer clips it — so this only catches
 * a projection that has come unstuck.
 */
const SCREEN_LIMIT = 1_000_000;

function backdrop(key: string): StdBackground {
  return new StdBackground({ key });
}

function run(key: string, frames: number): StdBackground {
  const std = backdrop(key);
  for (let i = 0; i < frames; i++) std.tick();
  return std;
}

describe('StdBackground', () => {
  it('draws the authored quads of the first stage and counts its own frames', () => {
    const std = run('stage1', 120);
    expect(std.currentFrame).toBe(120);
    expect(std.quadCount).toBeGreaterThan(0);
  });

  it('keeps every projected corner finite, on-page and within the view envelope', () => {
    const std = run('stage1', 600);
    const pages = new Set(stdPages('stage1'));
    expect(pages.size).toBeGreaterThan(0);
    for (const quad of std.view.quads) {
      expect(pages.has(quad.page)).toBe(true);
      expect(quad.screen).toHaveLength(8);
      expect(quad.uv).toHaveLength(8);
      expect(quad.alpha).toBeGreaterThanOrEqual(0);
      expect(quad.alpha).toBeLessThanOrEqual(1);
      for (const value of [...quad.screen, ...quad.uv]) {
        expect(Number.isFinite(value)).toBe(true);
        expect(Math.abs(value)).toBeLessThan(SCREEN_LIMIT);
      }
      for (let i = 0; i < 8; i += 2) {
        const u = quad.uv[i];
        const v = quad.uv[i + 1];
        expect(u).toBeGreaterThanOrEqual(0);
        expect(v).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('moves the camera down the corridor instead of holding one viewpoint', () => {
    const early = run('stage1', 30).view.quads;
    const late = run('stage1', 540).view.quads;
    expect(early.length).toBeGreaterThan(0);
    const first = early[0];
    const moved = late.find((quad) => quad.page === first.page && quad.uv[0] === first.uv[0]);
    expect(moved).toBeDefined();
    // Either the same sheet is gone (culled behind the camera) or it has slid along.
    const dx = Math.abs((moved?.screen[0] ?? 0) - first.screen[0]);
    const dy = Math.abs((moved?.screen[1] ?? 0) - first.screen[1]);
    expect(Math.max(dx, dy)).toBeGreaterThan(0.5);
  });

  it('ticks every shipped backdrop without producing a single NaN corner', () => {
    for (const key of Object.keys(TH08_STD)) {
      const std = run(key, 90);
      expect(std.currentFrame).toBe(90);
      for (const quad of std.view.quads) {
        for (const value of [...quad.screen, ...quad.uv]) {
          if (!Number.isFinite(value)) throw new Error(`${key} projected a non-finite corner`);
        }
      }
    }
  });

  it('maps each campaign route onto backdrop data that exists', () => {
    expect(Object.keys(STD_KEY_BY_ROUTE).length).toBeGreaterThanOrEqual(8);
    for (const key of Object.values(STD_KEY_BY_ROUTE)) {
      expect(TH08_STD[key]).toBeDefined();
    }
  });

  it('wipes the backdrop out when a spell card takes over', () => {
    const std = backdrop('stage1');
    std.tick();
    expect(std.view.fade).toBe(0);
    std.spellBackgroundState = 1;
    for (let i = 0; i < 62; i++) std.tick();
    expect(std.spellBackgroundState).toBe(2);
    expect(std.view.fade).toBe(1);
  });

  it('renders into the 384x448 playfield the projection is authored for', () => {
    expect(STD_VIEW_W).toBe(384);
    expect(STD_VIEW_H).toBe(448);
    expect(stdClearColor(0xff123456)).toBe(0x123456);
  });

  it('spans the fog ramp across each sheet with a depth per corner', () => {
    // The fog is a colour mix the shader does per pixel, so what this layer owes it
    // is one camera-space depth per corner - in the ramp's own units, and wide
    // enough that a single ground sheet carries a visible gradient across its face.
    const std = run('stage4a', 700);
    const { quads, fog } = std.view;
    expect(quads.length).toBeGreaterThan(0);
    expect(fog.far).toBeGreaterThan(fog.near);
    let inside = 0;
    let straddling = 0;
    for (const quad of quads) {
      if (quad.additive) {
        // Additive layers are left out of the mix on purpose: fog would brighten them.
        expect(quad.depth).toBeUndefined();
        continue;
      }
      expect(quad.alpha).toBeGreaterThan(0);
      const depth = quad.depth ?? [];
      expect(depth).toHaveLength(4);
      for (const along of depth) expect(Number.isFinite(along)).toBe(true);
      if (depth.some((along) => along > fog.near)) inside++;
      if (Math.max(...depth) - Math.min(...depth) > (fog.far - fog.near) / 4) straddling++;
    }
    expect(inside, 'a corridor 700 frames in is deep inside the ramp').toBeGreaterThan(0);
    expect(straddling, 'a sheet wide enough to show the gradient on its own face').toBeGreaterThan(0);
  });

  it('names a fog that is not the page background for most of the campaign', () => {
    // Why the mix matters rather than being a rounding error: the shipped `.std`
    // files push colour into the distance - stage 4 runs `(240,192,192)` and
    // `(240,48,48)`, stage 8 `(48,48,240)` - and a fade toward a black clear loses
    // all of it. These are the settings the fog block is handed every frame.
    const fogs: { key: string; rgb: number }[] = [];
    for (const [key, stage] of Object.entries(TH08_STD)) {
      for (const ins of stage.script) {
        if (ins.opcode === 1) fogs.push({ key, rgb: stdClearColor(ins.args[0]) });
      }
    }
    expect(fogs.length).toBeGreaterThan(0);
    const coloured = fogs.filter(({ rgb }) => rgb !== 0);
    expect(coloured.length / fogs.length).toBeGreaterThan(0.5);
    const bright = fogs.filter(({ rgb }) => ((rgb >> 16) & 0xff) + ((rgb >> 8) & 0xff) + (rgb & 0xff) > 240);
    expect(bright.length, 'a fog bright enough to see').toBeGreaterThan(0);
  });
});
