/**
 * Original Imperishable Night face art, straight out of `face_*.anm`.
 *
 * Every playable member and every stage boss ships as a stack of texture pages
 * inside its own face ANM: page 0 is the full-body art, and the pages after it
 * are the dialogue busts, one per expression. The page order below is copied
 * from the ANM texture tables in `public/assets/th08/manifest.json`, which the
 * extractor fills from the entry names ZUN wrote into each archive
 * (`data/face/reimu/face_rm01hp.png` and friends), so the suffixes are the
 * retail ones rather than a guess.
 *
 * Which face ANM belongs to which stage is not guessed either: it is the
 * preload table in `Spellcard::Init` (`Spellcard.cpp:548-596`), which also
 * shows that stages 5 and 6B load a second ANM for their mid-boss.
 */

import type { MemberId } from '../../../touhou-common/player/CharacterProfile';
import type { StageRoute } from '../StageRoute';

/** Where the extractor writes the per-page face PNGs. */
export const FACE_ASSET_DIR = '/assets/th08/anm';

/** Expression suffixes per face ANM, in page order (index === page number). */
const FACE_PAGES: Record<string, readonly string[]> = {
  face_rm00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_yk00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_mr00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_al00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_sk00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_rs00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_ym00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_yy00: ['00', 'no', 'n2', 'hp', 'dp', 'an', 'sw', 'pr', 'sp'],
  face_st01: ['00', 'name', 'no', 'n2', 'an'],
  face_st02: ['a', 'name', 'no', 'n2', 'an', 'sp'],
  face_st03: ['a', 'name', 'no', 'n2', 'an', 'pr', 'sp', 'lo'],
  face_st04a: ['00', 'name', 'no', 'n2', 'dp', 'an', 'sw', 'ls'],
  face_st04b: ['00', 'name', 'no', 'n2', 'dp', 'an', 'sw', 'pr', 'ls'],
  face_st05: ['a', 'name', 'no', 'dp', 'an', 'sw', 'ls'],
  face_st05b: ['no'],
  face_st06: ['a', 'name', 'no', 'hp', 'dp', 'an', 'sw'],
  face_st07: ['a', 'name', 'no', 'n2', 'dp', 'sw'],
  face_st08: ['a', 'name', 'no', 'n2', 'dp', 'an', 'sw', 'ls'],
};

/** The eight members, keyed by `MemberId` so the profile needs no translation. */
export const MEMBER_FACE_ANM: Record<MemberId, string> = {
  reimu: 'face_rm00',
  yukari: 'face_yk00',
  marisa: 'face_mr00',
  alice: 'face_al00',
  sakuya: 'face_sk00',
  remilia: 'face_rs00',
  youmu: 'face_ym00',
  yuyuko: 'face_yy00',
};

/** Primary boss face ANM per route (`Spellcard::Init`, `enemyFaceAnm0`). */
export const ROUTE_BOSS_FACE: Record<StageRoute, string> = {
  stage1: 'face_st01',
  stage2: 'face_st02',
  stage3: 'face_st03',
  stage4a: 'face_st04a',
  stage4b: 'face_st04b',
  stage5: 'face_st05',
  stage6a: 'face_st06',
  stage6b: 'face_st06',
};

/** Mid-boss face ANM, loaded as `enemyFaceAnm1` by the two routes that have one. */
export const ROUTE_MIDBOSS_FACE: Partial<Record<StageRoute, string>> = {
  stage5: 'face_st05b',
  stage6b: 'face_st07',
};

/**
 * Dialogue moods used by `StageDialogue`, as fallback chains.
 *
 * ZUN's suffixes are `no` normal, `n2` a second normal take, `hp` happy,
 * `dp` dejected, `an` angry, `sw` nervous, `pr` smug, `sp` startled, `lo`
 * lovelorn, `ls` last-word. Not every ANM carries all ten, so the lookup walks
 * the chain and takes the first page that exists.
 */
const MOOD_PAGES: Record<string, readonly string[]> = {
  normal: ['no', 'n2'],
  neutral: ['no', 'n2'],
  happy: ['hp', 'sp', 'no'],
  amused: ['hp', 'pr', 'no'],
  smug: ['pr', 'hp', 'no'],
  puzzled: ['dp', 'sw', 'no'],
  sad: ['dp', 'lo', 'no'],
  annoyed: ['an', 'dp', 'no'],
  angry: ['an', 'dp', 'no'],
  surprised: ['sp', 'sw', 'pr', 'no'],
  nervous: ['sw', 'dp', 'no'],
  lastword: ['ls', 'an', 'no'],
};

/**
 * Speaker name (JP or romaji) -> face ANM.
 *
 * The six boss keys are the names `StageDialogue` prints; `face_st05` and
 * `face_st06` are confirmed by the name plates packed inside them (鈴仙 and
 * 八意永琳), and `face_st01` by the stage preload table.
 */
export const SPEAKER_FACE_ANM: Record<string, string> = {
  霊夢: 'face_rm00',
  博麗霊夢: 'face_rm00',
  reimu: 'face_rm00',
  魔理沙: 'face_mr00',
  霧雨魔理沙: 'face_mr00',
  marisa: 'face_mr00',
  咲夜: 'face_sk00',
  十六夜咲夜: 'face_sk00',
  sakuya: 'face_sk00',
  妖夢: 'face_ym00',
  魂魄妖夢: 'face_ym00',
  youmu: 'face_ym00',
  紫: 'face_yk00',
  八雲紫: 'face_yk00',
  yukari: 'face_yk00',
  アリス: 'face_al00',
  アリス・マーガトロイド: 'face_al00',
  alice: 'face_al00',
  レミリア: 'face_rs00',
  レミリア・スカーレット: 'face_rs00',
  remilia: 'face_rs00',
  幽々子: 'face_yy00',
  西行寺幽々子: 'face_yy00',
  yuyuko: 'face_yy00',
  ルミア: 'face_st01',
  rumia: 'face_st01',
  リグル: 'face_st02',
  リグル・ナイトバグ: 'face_st02',
  リコリス: 'face_st02',
  lycoris: 'face_st02',
  ミスティア: 'face_st03',
  ミスティア・ローレライ: 'face_st03',
  mistia: 'face_st03',
  慧音: 'face_st04a',
  上白沢慧音: 'face_st04a',
  eiki: 'face_st04a',
  ゆめこ: 'face_st04b',
  関ゆめこ: 'face_st04b',
  yumeko: 'face_st04b',
  鈴仙: 'face_st05',
  鈴仙・優曇華院・イナバ: 'face_st05',
  reisen: 'face_st05',
  永琳: 'face_st06',
  八意永琳: 'face_st06',
  eirin: 'face_st06',
};

/** URL for one page of a face ANM, or undefined when that ANM is unknown. */
export function facePageUrl(anm: string, page: number): string | undefined {
  const pages = FACE_PAGES[anm];
  if (!pages || page < 0 || page >= pages.length) return undefined;
  return FACE_ASSET_DIR + '/' + anm + '_t' + page + '.png';
}

/** Page index of `suffix` inside `anm`, or -1 when that ANM has no such page. */
export function facePageOf(anm: string, suffix: string): number {
  const pages = FACE_PAGES[anm];
  return pages ? pages.indexOf(suffix) : -1;
}

/**
 * Bust art for a speaker, walking the mood's fallback chain so an ANM that only
 * carries three expressions still gets a face instead of nothing.
 */
export function speakerFaceUrl(speaker: string, mood?: string): string | undefined {
  const anm = SPEAKER_FACE_ANM[speaker] ?? SPEAKER_FACE_ANM[speaker.toLowerCase()];
  if (!anm) return undefined;
  const chain = (mood && MOOD_PAGES[mood]) || MOOD_PAGES.normal;
  for (const suffix of chain) {
    const page = facePageOf(anm, suffix);
    // Page 0 is the full-body art, which is not a bust: only accept it last.
    if (page > 0) return facePageUrl(anm, page);
  }
  return facePageUrl(anm, 0);
}

/** Full-body art for one playable member — the select-screen portrait. */
export function memberPortraitUrl(member: MemberId): string | undefined {
  return facePageUrl(MEMBER_FACE_ANM[member], 0);
}

/** Full-body art for a route's boss, used by the spell-card cut-in. */
export function bossPortraitUrl(route: StageRoute, mid = false): string | undefined {
  const anm = mid ? ROUTE_MIDBOSS_FACE[route] : ROUTE_BOSS_FACE[route];
  return anm ? facePageUrl(anm, 0) : undefined;
}
