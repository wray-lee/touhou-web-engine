/**
 * TH08 永夜抄 roster: four teams of two, eight playable members.
 *
 * The signature mechanic of Imperishable Night is that the *focus key is the
 * character switch*: with Shift released team member A flies and shoots, and
 * holding Shift swaps in member B with a completely different weapon and half
 * the movement speed. The two shot types are deliberately not interchangeable,
 * so every member carries its own weapon block below.
 */

/** Team ids, in menu order. */
export type CharacterId = 'reimu-yukari' | 'marisa-alice' | 'sakuya-remilia' | 'youmu-yuyuko';

/** The eight individual members. A members fly unfocused, B members focused. */
export type MemberId = 'reimu' | 'yukari' | 'marisa' | 'alice' | 'sakuya' | 'remilia' | 'youmu' | 'yuyuko';

/**
 * Weapon families. Each one is a distinct firing algorithm in Player.shoot():
 * homing steers toward the aim target, needle flies straight and fast,
 * spread fans out across a wide arc, laser concentrates a few heavy beams.
 */
export type ShotStyle = 'homing' | 'needle' | 'spread' | 'laser';

export interface MemberProfile {
  id: MemberId;
  /** Display name used by the HUD and the switch flash. */
  name: string;
  /** Romanised name plus team letter, e.g. 'Reimu A'. */
  label: string;
  /** 'A' fires while unfocused, 'B' takes over while Shift (focus) is held. */
  role: 'A' | 'B';
  shotStyle: ShotStyle;
  /** Projectiles per volley before the power bonus. */
  shotCount: number;
  /** Total fan angle in radians across the volley. */
  spread: number;
  /** Frames between volleys (lower = faster firing). */
  shotRate: number;
  shotDamage: number;
  /** Shot hitbox radius in playfield pixels. */
  shotRadius: number;
  /** Muzzle speed in pixels/frame. */
  shotSpeed: number;
  bulletColor: number;
  accentColor: number;
  /** Asset-manifest key of this member's shot sprite. */
  shotSprite: string;
  /** Max radians a homing shot may turn per frame; 0 = flies straight. */
  homingTurn: number;
  /** Frames a homing shot keeps steering before it straightens out. */
  homingFrames: number;
  /**
   * Radians a homing shot may stray from the heading it left the muzzle on.
   * Caps the curve so charms bend toward their mark instead of circling the ship.
   */
  homingMaxTurn: number;
  /** Visual-only sprite spin in radians/frame. Never touches the trajectory. */
  spin: number;
  /** Close-range side shots fired per side. */
  /** One-line weapon description for the select screen. */
  blurb: string;
}

export interface CharacterProfile {
  id: CharacterId;
  /** Both members, e.g. '灵梦 / 紫'. */
  name: string;
  subtitle: string;
  /**
   * Highest power the team can hold. Touhou 8 stores power as an integer 0..128
   * and draws it as value/64, so 128 reads as 2.00 (verified against the
   * reference: SetPower(128) is full and g_PowerUpThresholds tops out at 128).
   */
  maxPower: number;
  /**
   * Point-of-collection line in playfield pixels (plyNNa.sht + 0x1c). Above it
   * the whole field flies to the ship, subject to the team gate in ItemSystem.
   */
  pointItemValueLine: number;
  /** Homing speed applied to items once they are grabbed (sht + 0x14). */
  itemGrabSpeed: number;
  /**
   * Half of the item box (`plyNNa.sht + 0x18 / 2`, `Player.cpp:1629-1632`). The
   * item itself carries the same box (`ItemManager.cpp:203`), so the reach of a
   * grab is twice this number along each axis.
   */
  itemPickupHalfExtent: number;
  /**
   * Time scale for items that are still falling freely (`plyNNa.sht + 0x34`).
   *
   * `ItemManager::Update:207-209` reads it from the secondary table while the
   * ship is focused and from the primary otherwise, then multiplies both the
   * position step and the gravity term by it. It is not a cosmetic dial: at 0.65
   * a fairy's power chunk takes a third longer to cross the screen, which is a
   * real reason to stay unfocused while farming.
   */
  itemTimeScale: number;
  /** Focused partner's copy of the same float (`plyNNas.sht + 0x34`). */
  itemTimeScaleFocused: number;
  /**
   * Half of the hit box (`plyNNa.sht + 0x0C / 2`, `Player.cpp:1619-1622`). Retail
   * tests this as an axis-aligned square against the bullet's own box
   * (`Player::FUN_0044a230`, `Player.cpp:314-340`), so it is a half-extent and not
   * a radius.
   */
  hitboxHalfExtent: number;
  /**
   * Half of the graze box (`plyNNa.sht + 0x10 / 2`, `Player.cpp:1624-1627`). The
   * graze test is the same square against a bullet box grown by 20px per side
   * (`Player::FUN_0044a470`, `Player.cpp:380-383`).
   */
  grazeHalfExtent: number;
  bombDamage: number;
  /** Team accent colour for the HUD and bomb flash. */
  color: number;
  accentColor: number;
  /**
   * Unfocused move speed along one axis, `plyNNa.sht + 0x24`. The four teams
   * really do differ -- Marisa's and Youmu's ships are a quarter faster than
   * Reimu's and Sakuya's -- so this is per team and not a global.
   */
  fastSpeed: number;
  /**
   * Focused move speed along one axis, read from the *partner's* table at
   * `plyNNas.sht + 0x28` (`Player.cpp:795-798`). It is not half of `fastSpeed`
   * for any team except Reimu's.
   */
  slowSpeed: number;
  /**
   * Per-axis speed on a diagonal, unfocused: `plyNNa.sht + 0x2C`. Retail stores
   * this as its own float rather than dividing at runtime, and every shipped
   * value is the axial figure over sqrt(2), so a diagonal crosses the same
   * distance per frame as a straight line.
   */
  fastDiagonalSpeed: number;
  /** Per-axis speed on a diagonal, focused: `plyNNas.sht + 0x30`. */
  slowDiagonalSpeed: number;
  members: readonly [MemberProfile, MemberProfile];
}

const member = (m: MemberProfile): MemberProfile => m;

const MEMBERS = {
  reimu: member({
    id: 'reimu',
    name: '灵梦',
    label: 'Reimu A',
    role: 'A',
    shotStyle: 'homing',
    shotCount: 3,
    spread: 0.3,
    shotRate: 5,
    shotDamage: 15,
    shotRadius: 3.2,
    shotSpeed: 12,
    bulletColor: 0xff3344,
    accentColor: 0xfff0e6,
    shotSprite: 'shot:reimu',
    homingTurn: 0.05,
    homingFrames: 34,
    homingMaxTurn: 0.62,
    spin: 0.05,
    blurb: '阴阳玉 · 追踪符咒',
  }),
  yukari: member({
    id: 'yukari',
    name: '紫',
    label: 'Yukari B',
    role: 'B',
    shotStyle: 'spread',
    shotCount: 7,
    spread: 0.95,
    shotRate: 7,
    shotDamage: 11,
    shotRadius: 2.6,
    shotSpeed: 13,
    bulletColor: 0xb98bff,
    accentColor: 0xf3e8ff,
    shotSprite: 'shot:yukari',
    homingTurn: 0,
    homingFrames: 0,
    homingMaxTurn: 0,
    spin: 0,
    blurb: '境界 · 扇形针刺',
  }),
  marisa: member({
    id: 'marisa',
    name: '魔理沙',
    label: 'Marisa A',
    role: 'A',
    shotStyle: 'laser',
    shotCount: 3,
    spread: 0.16,
    shotRate: 6,
    shotDamage: 22,
    shotRadius: 4.2,
    shotSpeed: 20,
    bulletColor: 0xffd447,
    accentColor: 0xfff1a8,
    shotSprite: 'shot:marisa',
    homingTurn: 0,
    homingFrames: 0,
    homingMaxTurn: 0,
    spin: 0,
    blurb: '魔导 · 集中激光',
  }),
  alice: member({
    id: 'alice',
    name: '爱丽丝',
    label: 'Alice B',
    role: 'B',
    shotStyle: 'homing',
    shotCount: 4,
    spread: 0.55,
    shotRate: 7,
    shotDamage: 13,
    shotRadius: 3,
    shotSpeed: 10,
    bulletColor: 0xff7ad0,
    accentColor: 0xfff0f8,
    shotSprite: 'shot:alice',
    homingTurn: 0.055,
    homingFrames: 46,
    homingMaxTurn: 0.7,
    spin: 0.08,
    blurb: '上海人形 · 强追踪',
  }),
  sakuya: member({
    id: 'sakuya',
    name: '咲夜',
    label: 'Sakuya A',
    role: 'A',
    shotStyle: 'needle',
    shotCount: 6,
    spread: 0.14,
    shotRate: 2,
    shotDamage: 8,
    shotRadius: 2.4,
    shotSpeed: 22,
    bulletColor: 0x9ee8ff,
    accentColor: 0xe8f7ff,
    shotSprite: 'shot:sakuya',
    homingTurn: 0,
    homingFrames: 0,
    homingMaxTurn: 0,
    spin: 0,
    blurb: '时停小刀 · 高射速',
  }),
  remilia: member({
    id: 'remilia',
    name: '蕾米莉亚',
    label: 'Remilia B',
    role: 'B',
    shotStyle: 'spread',
    shotCount: 9,
    spread: 1.25,
    shotRate: 6,
    shotDamage: 9,
    shotRadius: 3.4,
    shotSpeed: 11,
    bulletColor: 0xff5470,
    accentColor: 0xffe0e8,
    shotSprite: 'shot:remilia',
    homingTurn: 0,
    homingFrames: 0,
    homingMaxTurn: 0,
    spin: 0.02,
    blurb: '红雾 · 广角弹幕',
  }),
  youmu: member({
    id: 'youmu',
    name: '妖梦',
    label: 'Youmu A',
    role: 'A',
    shotStyle: 'spread',
    shotCount: 5,
    spread: 0.72,
    shotRate: 5,
    shotDamage: 14,
    shotRadius: 5,
    shotSpeed: 14,
    bulletColor: 0x8fe8c0,
    accentColor: 0xf2fff8,
    shotSprite: 'shot:youmu',
    homingTurn: 0,
    homingFrames: 0,
    homingMaxTurn: 0,
    spin: 0.12,
    blurb: '灵刃 · 宽幅扇面',
  }),
  yuyuko: member({
    id: 'yuyuko',
    name: '幽幽子',
    label: 'Yuyuko B',
    role: 'B',
    shotStyle: 'homing',
    shotCount: 3,
    spread: 0.85,
    shotRate: 8,
    shotDamage: 12,
    shotRadius: 3.6,
    shotSpeed: 8,
    bulletColor: 0xc7a8ff,
    accentColor: 0xf8f3ff,
    shotSprite: 'shot:yuyuko',
    homingTurn: 0.045,
    homingFrames: 52,
    homingMaxTurn: 0.8,
    spin: 0.03,
    blurb: '亡灵 · 缓速追踪',
  }),
} satisfies Record<MemberId, MemberProfile>;

export { MEMBERS };

/** Touhou 8 power ceiling: 128 units, drawn as 2.00. */
export const MAX_POWER = 128;

/** Shot-level breakpoints, straight from g_PowerUpThresholds. */
export const POWER_THRESHOLDS = [8, 24, 48, 80, 128, Infinity] as const;

/** plyNNa.sht defaults shared by every team but Marisa's. */
export const ITEM_LINE_DEFAULT = 128;
export const ITEM_GRAB_DEFAULT = 10;
/** `ply00a.sht + 0x18 = 24`, halved the way the retail loader halves it. */
export const ITEM_BOX_DEFAULT = 12;

/** Small / big P item power, and the 電 item's fill-to-max behaviour. */
export const POWER_PER_SMALL_ITEM = 1;
export const POWER_PER_BIG_ITEM = 8;

/** Death costs 0.25 power, and anything at or below 16 goes straight to 0. */
export const DEATH_POWER_COST = 16;
export const DEATH_POWER_FLOOR = 16;

/**
 * Fallback hit box half-extent for ships with no `.sht` profile yet. Retail's real
 * values are 0.825 (Reimu) and 1.0 for the other three teams; the on-screen dot is
 * drawn larger than the box either way.
 */
export const HITBOX_RADIUS = 1.0;
/** Normalised |dir| below which the ship stays upright, matching upstream. */
export const PLAYER_LEAN_DEAD_ZONE = 0.16;
/** Maximum visible lean in radians at full speed. */
export const PLAYER_LEAN_MAX = 0.3;
/** Frames the swap flourish stays on screen after a focus switch. */
export const SWITCH_FLASH_FRAMES = 14;

/**
 * The four move speeds, read out of the shipped `ply0Na.sht` / `ply0Nas.sht`.
 *
 * `Player.cpp:791-820` reads four separate floats per frame: the axial speed at
 * +0x24, the focus axial speed at +0x28, and the per-axis diagonal components at
 * +0x2C and +0x30. The fast pair comes from the primary table and the focus pair
 * from the secondary one -- the partner's file governs slow travel, which is why
 * `ply00a` and `ply00as` are read together rather than one of them.
 *
 * The four figures are measured, not derived: every diagonal is its own team's
 * axial speed over sqrt(2), so a diagonal crosses the same ground per frame as a
 * straight line and there is no diagonal penalty in the original.
 *
 * The teams genuinely differ. Marisa and Youmu fly at 5.0 px/frame, Reimu and
 * Sakuya at 4.0; focused, the four are 2.0, 2.2, 2.3 and 1.9. One shared constant
 * is therefore 20-56 % off for three of the four teams, and that is exactly the
 * size of error that puts a recorded dodge line into a bullet -- the replay gate
 * caught all four ZUN demos dying every 300-600 frames while this table was a
 * guess.
 */
const TEAM_SPEEDS: Record<
  CharacterId,
  {
    fastSpeed: number;
    fastDiagonalSpeed: number;
    slowSpeed: number;
    slowDiagonalSpeed: number;
  }
> = {
  'reimu-yukari': {
    fastSpeed: 4.0,
    fastDiagonalSpeed: 4.0 / Math.SQRT2,
    slowSpeed: 2.0,
    slowDiagonalSpeed: 2.0 / Math.SQRT2,
  },
  'marisa-alice': {
    fastSpeed: 5.0,
    fastDiagonalSpeed: 5.0 / Math.SQRT2,
    slowSpeed: 2.2,
    slowDiagonalSpeed: 2.2 / Math.SQRT2,
  },
  'sakuya-remilia': {
    fastSpeed: 4.0,
    fastDiagonalSpeed: 4.0 / Math.SQRT2,
    slowSpeed: 2.3,
    slowDiagonalSpeed: 2.3 / Math.SQRT2,
  },
  'youmu-yuyuko': {
    fastSpeed: 5.0,
    fastDiagonalSpeed: 5.0 / Math.SQRT2,
    slowSpeed: 1.9,
    slowDiagonalSpeed: 1.9 / Math.SQRT2,
  },
};

/**
 * Kept for callers that only ever ask for a default: Reimu's numbers, which are
 * the ones a fresh `Player` gets before a team is applied.
 */
export const FAST_SPEED = TEAM_SPEEDS['reimu-yukari'].fastSpeed;
export const SLOW_SPEED = TEAM_SPEEDS['reimu-yukari'].slowSpeed;

/**
 * Item fall time scales, `+0x34` of the same two tables.
 *
 * Seven of the eight shipped files say 0.9. `ply02a` is the odd one out at 0.65,
 * so Sakuya's own team leaves items hanging in the air until Shift brings
 * Remilia forward — the only difference in the whole table set a player can
 * actually feel.
 */
const TEAM_ITEM_FALL: Record<CharacterId, { itemTimeScale: number; itemTimeScaleFocused: number }> = {
  'reimu-yukari': { itemTimeScale: 0.9, itemTimeScaleFocused: 0.9 },
  'marisa-alice': { itemTimeScale: 0.9, itemTimeScaleFocused: 0.9 },
  'sakuya-remilia': { itemTimeScale: 0.65, itemTimeScaleFocused: 0.9 },
  'youmu-yuyuko': { itemTimeScale: 0.9, itemTimeScaleFocused: 0.9 },
};

export const CHARACTER_PROFILES: Record<CharacterId, CharacterProfile> = {
  'reimu-yukari': {
    id: 'reimu-yukari',
    name: '灵梦 / 紫',
    subtitle: '平衡型 · 追踪阴阳玉',
    maxPower: MAX_POWER,
    pointItemValueLine: ITEM_LINE_DEFAULT,
    itemGrabSpeed: ITEM_GRAB_DEFAULT,
    itemPickupHalfExtent: ITEM_BOX_DEFAULT,
    hitboxHalfExtent: 0.825,
    grazeHalfExtent: 1.4,
    bombDamage: 150,
    color: 0xc41e3a,
    accentColor: 0xfff0e6,
    ...TEAM_SPEEDS['reimu-yukari'],
    ...TEAM_ITEM_FALL['reimu-yukari'],
    members: [MEMBERS.reimu, MEMBERS.yukari],
  },
  'marisa-alice': {
    id: 'marisa-alice',
    name: '魔理沙 / 爱丽丝',
    subtitle: '高火力 · 集中激光',
    maxPower: MAX_POWER,
    // Marisa's team owns the lower line and the wider box: the farming ship.
    pointItemValueLine: 160,
    itemGrabSpeed: 12,
    itemPickupHalfExtent: 16,
    hitboxHalfExtent: 1.0,
    grazeHalfExtent: 1.4,
    bombDamage: 220,
    color: 0x9b59ff,
    accentColor: 0xfff1a8,
    ...TEAM_SPEEDS['marisa-alice'],
    ...TEAM_ITEM_FALL['marisa-alice'],
    members: [MEMBERS.marisa, MEMBERS.alice],
  },
  'sakuya-remilia': {
    id: 'sakuya-remilia',
    name: '咲夜 / 蕾米莉亚',
    subtitle: '精准型 · 时停刀刃',
    maxPower: MAX_POWER,
    pointItemValueLine: ITEM_LINE_DEFAULT,
    itemGrabSpeed: ITEM_GRAB_DEFAULT,
    itemPickupHalfExtent: ITEM_BOX_DEFAULT,
    hitboxHalfExtent: 1.0,
    grazeHalfExtent: 3.0,
    bombDamage: 180,
    color: 0x5bb8b3,
    accentColor: 0xe8f7ff,
    ...TEAM_SPEEDS['sakuya-remilia'],
    ...TEAM_ITEM_FALL['sakuya-remilia'],
    members: [MEMBERS.sakuya, MEMBERS.remilia],
  },
  'youmu-yuyuko': {
    id: 'youmu-yuyuko',
    name: '妖梦 / 幽幽子',
    subtitle: '近战型 · 宽幅灵刃',
    maxPower: MAX_POWER,
    pointItemValueLine: ITEM_LINE_DEFAULT,
    itemGrabSpeed: ITEM_GRAB_DEFAULT,
    itemPickupHalfExtent: ITEM_BOX_DEFAULT,
    hitboxHalfExtent: 1.0,
    grazeHalfExtent: 1.5,
    bombDamage: 190,
    color: 0x9bd4d0,
    accentColor: 0xf8f3ff,
    ...TEAM_SPEEDS['youmu-yuyuko'],
    ...TEAM_ITEM_FALL['youmu-yuyuko'],
    members: [MEMBERS.youmu, MEMBERS.yuyuko],
  },
};

export const getCharacterProfile = (id: CharacterId): CharacterProfile =>
  CHARACTER_PROFILES[id] ?? CHARACTER_PROFILES['reimu-yukari'];

/** The member that flies while Shift is held (index 1), and while released (0). */
export const memberForFocus = (profile: CharacterProfile, focused: boolean): MemberProfile =>
  profile.members[focused ? 1 : 0];

/** Every member id, for asset and sheet registration. */
export const MEMBER_IDS = Object.keys(MEMBERS) as MemberId[];
