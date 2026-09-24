/**
 * Register original TH08 player sprites from the extracted anm atlas.
 * Uses canvas slicing to create individual frame textures compatible with PixiJS v8.
 */

import { Texture } from 'pixi.js';
import type { PixiRenderer, AnimatedSheet } from '../../../engine/renderer/PixiRenderer';
import type { TaiseiAnim, TaiseiAnimGroup } from '../../../engine/renderer/TaiseiAnim';
import { resolveAssetUrl } from '../../../engine/core/ResourceResolver';
import { TH08_PLAYER_SPRITES } from './th08-sprites';
import type { SpriteFrame } from './th08-sprites';

/**
 * Animation groups per flying-member bank, lifted mechanically out of the ANM
 * scripts that survive in `public/assets/th08/manifest.json`.
 *
 * Every `playerNN.anm` ships the same ten scripts, and `Player.cpp` drives them
 * directly (`FUN_0044aec0`), so this table is a transcription, not a design:
 *
 *   s0 upright / s1 lean-in / s2 lean-out / s3 = s1 mirrored / s4 = s2 mirrored
 *   s5 低速 upright / s6 低速 lean-in / s7 低速 lean-out / s8, s9 = mirrored
 *
 * The two script families are the two *members*: s0-s4 animate the human's frames
 * and s5-s9 animate the partner's own frames. That is Imperishable Night's
 * signature mechanic hiding in plain sight in the art -- holding Shift visibly
 * changes ship, which is also why `Global.hpp:97-126` defines no change key. Each
 * member is registered as its own sheet, sliced out of the family it owns and
 * renumbered from zero, so a single stance table drives all of them.
 *
 * A trailing opcode-4 instruction carries the loop start as a byte offset, which is
 * what splits each clip into a fast one-shot ramp plus the cycle it settles into:
 * `s1` ramps through 4,5,6 and then cycles the lean itself, and `s2` unwinds
 * 7,6,5,4 before cycling the upright bob.
 *
 * Bank lengths differ per pack, which is where the three shapes come from:
 *
 *  - stance11  player00 (Reimu 0-10 / Yukari 11-21), player01 (Marisa 0-10 /
 *              Alice 11-21) and Sakuya on player02 (0-10): four upright frames, a
 *              three-frame ramp, a four-frame lean.
 *  - stance9   Remilia on player02 (11-19): her 低速 bank is authored 46x46 to fit
 *              the wings, with a two-frame ramp and a three-frame lean.
 *  - stance8   player03 (Youmu 0-7 / Yuyuko 8-15): the compact variant, where the
 *              ramp is a single frame and the lean cycle is three.
 *  - portrait  The resting member's standing figure, which only bobs.
 */
const grp = (frames: number[], delay: number, mirror = false): TaiseiAnimGroup => ({
  frames,
  delay,
  mirror,
});

/** Which stance cycle a member's bank uses. */
export type BankKind = 'stance11' | 'stance9' | 'stance8' | 'portrait';

const TH08_PLAYER_ANIM = (kind: BankKind): TaiseiAnim => {
  if (kind === 'portrait') {
    return { main: grp([0, 1, 2, 3], 6) };
  }
  if (kind === 'stance9') {
    return {
      main: grp([0, 1, 2, 3], 6),
      left: grp([6, 7, 8], 6),
      right: grp([6, 7, 8], 6, true),
      main2left: grp([4, 5], 2),
      left2main: grp([5, 4], 1),
      main2right: grp([4, 5], 2, true),
      right2main: grp([5, 4], 1, true),
    };
  }
  if (kind === 'stance8') {
    return {
      main: grp([0, 1, 2, 3], 6),
      left: grp([5, 6, 7], 6),
      right: grp([5, 6, 7], 6, true),
      main2left: grp([4], 1),
      left2main: grp([5, 4], 1),
      main2right: grp([4], 1, true),
      right2main: grp([5, 4], 1, true),
    };
  }
  return {
    main: grp([0, 1, 2, 3], 6),
    left: grp([7, 8, 9, 10], 6),
    right: grp([7, 8, 9, 10], 6, true),
    main2left: grp([4, 5, 6], 1),
    left2main: grp([7, 6, 5, 4], 1),
    main2right: grp([4, 5, 6], 1, true),
    right2main: grp([7, 6, 5, 4], 1, true),
  };
};

/**
 * Which slice of which atlas page each of the eight members actually owns.
 *
 * Verified against the extracted pages and the ANM sprite lists, not guessed:
 * `playerNN_t0.png` holds the human's stance bank, then the partner's stance bank
 * in the order the 低速 scripts read it, then that team's standing portrait and
 * shot art. Pointing a member at the wrong slice is what made Sakuya's lean-out
 * flash a throwing knife and Remilia's portrait a magic circle.
 */
interface MemberBank {
  /** Key into TH08_PLAYER_SPRITES, which carries the rect table for that page. */
  page: string;
  /** Atlas sprite ids, in order; index 0 here is local frame 0. */
  ids: number[];
  kind: BankKind;
  /**
   * Standing figure used for the resting member in the status panel, where the
   * pack ships one. `player03` only has an orb loop in that slot, so Youmu and
   * Yuyuko fall back to their own stance frames.
   */
  portraitIds?: number[];
  /**
   * Retail draws the player bank 1:1 on the 384x448 field: a Reimu cell is 30x46
   * source pixels and occupies the same 30x46 on screen, so nothing here scales.
   */
  scale: number;
}

/**
 * The group table for a bank, trimmed to the frames that bank actually owns.
 * Remilia's portrait ships as a single still, so an unclamped group would name
 * frames that were never registered and the renderer would retire the whole slot.
 */
export function th08PlayerAnimFor(kind: BankKind, available: number): TaiseiAnim {
  const anim = TH08_PLAYER_ANIM(kind);
  for (const group of Object.values(anim)) {
    const kept = group.frames.filter((f) => f >= 0 && f < available);
    group.frames = kept.length ? kept : [0];
  }
  return anim;
}

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const TH08_MEMBER_BANKS: Record<string, MemberBank> = {
  // player00.anm -- 幻想封印队: Reimu flies upright, Yukari takes 低速.
  reimu: { page: 'reimu', ids: range(0, 10), kind: 'stance11', scale: 1 },
  yukari: {
    page: 'reimu',
    ids: range(11, 21),
    kind: 'stance11',
    portraitIds: range(22, 29),
    scale: 1,
  },
  // player01.anm -- 新梦想队.
  marisa: { page: 'marisa', ids: range(0, 10), kind: 'stance11', scale: 1 },
  alice: {
    page: 'marisa',
    ids: range(11, 21),
    kind: 'stance11',
    portraitIds: range(22, 25),
    scale: 1,
  },
  // player02.anm -- 完全飞翔队. Remilia's bank is 46x46 because of her wings.
  sakuya: { page: 'sakuya', ids: range(0, 10), kind: 'stance11', scale: 1 },
  remilia: {
    page: 'sakuya',
    ids: range(11, 19),
    kind: 'stance9',
    portraitIds: [20],
    scale: 1,
  },
  // player03.anm -- 六行定队. Both banks use the compact eight-frame shape.
  youmu: { page: 'youmu', ids: range(0, 7), kind: 'stance8', scale: 1 },
  yuyuko: { page: 'youmu', ids: range(8, 15), kind: 'stance8', scale: 1 },
};

/** Load an image and slice it into individual frame textures using canvas. */
export async function sliceAtlas(
  atlasUrl: string,
  frames: Array<{ id: number; x: number; y: number; w: number; h: number }>,
): Promise<Map<number, Texture>> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = resolveAssetUrl(atlasUrl);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load ' + atlasUrl));
  });

  const result = new Map<number, Texture>();
  for (const frame of frames) {
    const canvas = document.createElement('canvas');
    canvas.width = frame.w;
    canvas.height = frame.h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
    // Pixel-crisp upscaling: the retail sheets are 1x art, so bilinear turns them to mush.
    const tex = Texture.from(canvas);
    tex.source.style.scaleMode = 'nearest';
    result.set(frame.id, tex);
  }
  return result;
}

/**
 * Slice TH08 player atlas PNGs and register individual frames as animated
 * sheets. Returns the number of members successfully registered.
 */
export async function registerTH08PlayerSprites(renderer: PixiRenderer): Promise<number> {
  let count = 0;

  for (const [memberId, bank] of Object.entries(TH08_MEMBER_BANKS)) {
    const page = TH08_PLAYER_SPRITES[bank.page];
    if (!page) continue;
    const byId = new Map(page.frames.map((f) => [f.id, f]));
    // Only slice the ids this member actually owns, and renumber them from zero
    // so the animation groups above are shared by every bank.
    try {
      const slice = async (
        ids: number[],
        namespace: string,
        sheetId: string,
        kind: BankKind,
        steer: boolean,
      ): Promise<boolean> => {
        const wanted = ids.map((id) => byId.get(id)).filter((f): f is SpriteFrame => f !== undefined);
        if (wanted.length === 0) return false;
        const textures = await sliceAtlas(page.atlas, wanted);
        if (textures.size === 0) return false;
        wanted.forEach((frame, local) => {
          const texture = textures.get(frame.id);
          if (!texture) return;
          renderer.assets.register(namespace + ':frame' + String(local).padStart(4, '0'), texture);
        });
        renderer.registerSheet(sheetId, {
          frameKey: (idx: number) => namespace + ':frame' + String(idx).padStart(4, '0'),
          anim: th08PlayerAnimFor(kind, wanted.length),
          scale: bank.scale,
          // Only the member that actually flies leans into the stick.
          steer,
          // Retail compares the intended horizontal speed against zero with no
          // tolerance (`Player.cpp:823-871`), so a dead zone here would only ever
          // swallow real input; the idle sway comes from script 0's own cell cycle.
          deadZone: 0.08,
        } satisfies AnimatedSheet);
        return true;
      };

      // The stance bank is the member's own flying frames, renumbered from zero so
      // one stance table drives all eight of them.
      if (await slice(bank.ids, 'th08:player:' + memberId, 'player:' + memberId, bank.kind, true)) {
        count++;
      }
      // The resting half of the team gets its standing figure in the status panel.
      // Packs without one (player03's spare slot is an orb loop) reuse the stance
      // bank, which `drawMember` already falls back to.
      if (bank.portraitIds) {
        await slice(
          bank.portraitIds,
          'th08:portrait:' + memberId,
          'player-portrait:' + memberId,
          'portrait',
          false,
        );
      }
    } catch {
      // Atlas not available — Taisei fallback stays active
    }
  }

  return count;
}
