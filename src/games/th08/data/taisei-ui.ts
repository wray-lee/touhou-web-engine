import type { CharacterId, MemberId } from '../../../touhou-common/player/CharacterProfile';
import type { Difficulty } from '../types';
import { resolveAssetUrl } from '../../../engine/core/ResourceResolver';

import { memberPortraitUrl, speakerFaceUrl } from './th08-face-art';

/**
 * Real Taisei artwork used by the menus and the HUD.
 *
 * Everything here is vendored upstream art (CC-BY-SA 4.0, see
 * public/assets/taisei/COPYING.txt); the helpers fall back to the procedural
 * atlas for the few slots Taisei does not ship.
 */
export const TAISEI_TEAM_PORTRAIT: Partial<Record<CharacterId, string>> = {
  'reimu-yukari': '/assets/taisei/portraits/dialog/reimu.webp',
  'marisa-alice': '/assets/taisei/portraits/dialog/marisa.webp',
  'youmu-yuyuko': '/assets/taisei/portraits/dialog/youmu.webp',
};

export const TAISEI_DIFFICULTY_LOGO: Record<Difficulty, string> = {
  easy: '/assets/taisei/ui/difficulty/easy.webp',
  normal: '/assets/taisei/ui/difficulty/normal.webp',
  hard: '/assets/taisei/ui/difficulty/hard.webp',
  lunatic: '/assets/taisei/ui/difficulty/lunatic.webp',
};

/**
 * Dialogue portraits. Taisei ships each speaker as a full-body portrait plus
 * separate eye/expression overlays; the overlays carry no alignment metadata
 * and do not share the portrait canvas, so we render the portrait itself and
 * keep `mood` in the API for games that do have aligned face art.
 */
export const TAISEI_DIALOG_FACE: Record<string, string> = {
  reimu: '/assets/taisei/portraits/dialog/reimu.webp',
  marisa: '/assets/taisei/portraits/dialog/marisa.webp',
  youmu: '/assets/taisei/portraits/dialog/youmu.webp',
  cirno: '/assets/taisei/portraits/dialog/cirno.webp',
  elly: '/assets/taisei/portraits/dialog/elly.webp',
  hina: '/assets/taisei/portraits/dialog/hina.webp',
  iku: '/assets/taisei/portraits/dialog/iku.webp',
  kurumi: '/assets/taisei/portraits/dialog/kurumi.webp',
  scuttle: '/assets/taisei/portraits/dialog/scuttle.webp',
  wriggle: '/assets/taisei/portraits/dialog/wriggle.webp',
  yumemi: '/assets/taisei/portraits/dialog/yumemi.webp',
};

/** Display name (JP, romaji or spriteKey) -> Taisei portrait id. */
export const DIALOG_SPEAKER_KEY: Record<string, string> = {
  霊夢: 'reimu',
  reimu: 'reimu',
  魔理沙: 'marisa',
  marisa: 'marisa',
  妖夢: 'youmu',
  youmu: 'youmu',
  チルノ: 'cirno',
  cirno: 'cirno',
  エリー: 'elly',
  elly: 'elly',
  雛: 'hina',
  hina: 'hina',
  伊吹: 'iku',
  iku: 'iku',
  黒燐蟲: 'kurumi',
  kurumi: 'kurumi',
  スカットル: 'scuttle',
  scuttle: 'scuttle',
  文々: 'wriggle',
  wriggle: 'wriggle',
  ゆめみ: 'yumemi',
  yumemi: 'yumemi',
  紫: 'yukari',
  yukari: 'yukari',
  アリス: 'alice',
  alice: 'alice',
  レミリア: 'remilia',
  remilia: 'remilia',
  幽々子: 'yuyuko',
  yuyuko: 'yuyuko',
};

export const TAISEI_ITEM_ICON: Record<string, string> = {
  power: '/assets/taisei/item/power.png',
  bomb: '/assets/taisei/item/bomb.png',
  point: '/assets/taisei/item/point.png',
  life: '/assets/taisei/item/life.webp',
  fullpower: '/assets/taisei/item/voltage.webp',
  surge: '/assets/taisei/item/surge.webp',
};

export const TAISEI_HUD_HEART = '/assets/taisei/ui/hud/heart.webp';
export const TAISEI_HUD_STAR = '/assets/taisei/ui/star.png';
export const TAISEI_BOSS_INDICATOR = '/assets/taisei/ui/boss_indicator.png';
export const TAISEI_SPELL_BANNER = '/assets/taisei/ui/spell.webp';
export const TAISEI_FOCUS_CIRCLE = '/assets/taisei/fairy_circle.webp';

/** Which member of a team its portrait shows: the A seat, i.e. the one you fly. */
function teamMember(id: CharacterId): MemberId {
  return id.split('-')[0] as MemberId;
}

/**
 * Portrait for a playable team. Page 0 of `face_XX00.anm` is the retail
 * full-body art, so all eight members are covered; the Taisei set is only a
 * fallback for a checkout without the extracted originals.
 */
export function teamPortraitUrl(id: CharacterId): string {
  const url =
    memberPortraitUrl(teamMember(id)) ??
    TAISEI_TEAM_PORTRAIT[id] ??
    '/assets/player/' + id.split('-')[0] + '.png';
  return resolveAssetUrl(url);
}

/** Portrait for the team's B seat — the member Shift switches you into. */
export function partnerPortraitUrl(id: CharacterId): string {
  return memberPortraitUrl(id.split('-')[1] as MemberId) ?? teamPortraitUrl(id);
}

/**
 * Portrait for a speaker name (JP, romaji or spriteKey), or undefined if
 * unmapped. Original expression busts first, then the Taisei set.
 */
export function dialogFaceUrl(speaker: string, mood?: string): string | undefined {
  const original = speakerFaceUrl(speaker, mood);
  if (original) return resolveAssetUrl(original);
  const id = DIALOG_SPEAKER_KEY[speaker] ?? DIALOG_SPEAKER_KEY[speaker.toLowerCase()];
  return id && TAISEI_DIALOG_FACE[id] ? resolveAssetUrl(TAISEI_DIALOG_FACE[id]) : undefined;
}
