import { Application, Container, Graphics, Sprite, Text, TextStyle, Texture } from 'pixi.js';
import { RendererType } from 'pixi.js';
import { SpriteManager } from './SpriteManager';
import {
  BOSS_GAUGE,
  BOSS_GAUGE_TRACK_DARK,
  GaugeRect,
  gaugePips,
  gaugeSlices,
  gaugeTimerText,
  gaugeTrack,
  type BossGaugeState,
} from '../../touhou-common/boss/BossGauge';
import { AssetManager, AssetManifest } from './AssetManager';
import { SpriteLayer } from './SpriteLayer';
import { QuadLayer } from './QuadLayer';
import { applyFog, createFogMeshShader, createFogUniforms } from './FogShader';
import type { FogRamp, FogUniforms } from './FogShader';
import { AnimPose, TaiseiAnim, TaiseiAnimPlayer } from './TaiseiAnim';

import { Bullet } from '../core/Bullet';
import { Player } from '../../touhou-common/player/Player';
import { Boss } from '../../touhou-common/boss/Boss';
import { Enemy } from '../../touhou-common/enemy/Enemy';
import { Item } from '../../touhou-common/item/Item';
import { HUD } from '../../touhou-common/ui/HUD';
import type { HudBannerView } from '../../touhou-common/ui/HudBanners';
import { PerformanceMonitor } from '../debug/PerformanceMonitor';
import { InputSystem } from '../core/InputSystem';
import type { ScorePopupView } from '../core/ScorePopupSystem';
import { popupCell } from '../core/ScorePopupSystem';
import {
  CANVAS_W,
  CANVAS_H,
  PLAYFIELD_W,
  PLAYFIELD_H,
  PLAYFIELD_X,
  PLAYFIELD_Y,
} from '../core/PlayfieldLayout';
import {
  HUD_BORDER_STRIP,
  HUD_DIFFICULTY_BADGE,
  HUD_GAUGE,
  HUD_LABEL_X,
  HUD_LOGO,
  HUD_PANEL_TILE_X,
  HUD_PIP_STEP,
  HUD_POWER_BAR,
  HUD_POPUP_ADVANCE,
  HUD_ROWS,
  HUD_TILE,
  HUD_TEXT_ADVANCE,
  HUD_VALUE_X,
  HUD_ART_PROBE,
  hudBadgeKey,
  hudGaugeKey,
  hudGlyphKey,
  hudLabelKey,
  hudPopupKey,
  hudPipKey,
  hudPlateKey,
  HUD_NIGHT_CLOCK,
  nightClockAngle,
  nightClockLabel,
  NIGHT_CLOCK_SPAN,
} from '../core/HudLayout';

export interface PixiRendererConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  assetManifest?: AssetManifest;
  /** Parallax background theme id (see tools/art/backgrounds.mjs). */
  theme?: string;
  /** 'taisei' = straightened select art, 'ship' = chibi fleet. */
  playerSkin?: 'taisei' | 'painted';
  /**
   * Which GPU backend to try first. Unset leaves Pixi's own detection, which prefers
   * WebGPU. Both shader languages the backdrop uses are real code paths, so a way to
   * reach the WebGL one from a URL is how the GLSL half ever gets verified.
   */
  backend?: 'webgl' | 'webgpu';
}

export interface RenderEnvironment {
  backgroundColor?: number;
  brightness?: number;
  /** Parallax theme for this frame; falls back to the configured default. */
  theme?: string;
  /** Playfield scroll speed in px/frame. */
  scrollSpeed?: number;
  /**
   * Which stance the ship is in. 永夜抄 authors a second, complete animation group
   * for 低速 (`playerNN.anm` scripts 5-9) and swaps to it with a hard script change,
   * so the pose has to reach the animator rather than just the speed.
   */
  playerPose?: AnimPose;
  /** Live pieces of the spell card that is running, one entry per shape. */
  bombZones?: ReadonlyArray<BombZoneView>;
  /** The card's expanding bullet-cancel ring. */
  bombCancel?: { x: number; y: number; radius: number; alpha: number } | null;
  /**
   * What the running card paints over the backdrop: `plate` goes under every sprite,
   * the way a stage's own background colour would, and `flash` is a screen-space
   * square over them. Both are absent the moment the card comes down.
   */
  bombWash?: { plate?: WashView | null; flash?: WashView | null } | null;
  /**
   * Floating score numbers in canvas space, already risen and banked by the game's
   * `ScorePopupSystem`. Absent simply means nothing is on screen.
   */
  scorePopups?: ReadonlyArray<ScorePopupView>;
  /**
   * 0 = pinned human, 0.5 = neutral, 1 = pinned youkai. Absent hides the panel
   * meter, which is what a title without a 妖率计 needs.
   */
  youkaiMeter?: number;
  /**
   * Life bar declared by an ECL script rather than a `Boss` object. Used when
   * the sim layer drives the stage, so those bosses get the same retail gauge.
   */
  bossGauge?: BossGaugeState | null;
  /**
   * A projected 3D backdrop supplied by the game, in playfield pixels. When the
   * pages it names are loaded it replaces the parallax sheets entirely; when they
   * are not, the parallax placeholder keeps drawing so the stage never goes blank.
   */
  backdrop?: BackdropView;
  /**
   * Live ECL lasers, in playfield pixels. Retail draws the beam body as one
   * `etama` cell stretched along its heading, so a beam is a rotated rect rather
   * than a chain of bullets.
   */
  lasers?: ReadonlyArray<LaserView>;
  /**
   * The panel banners the original raises over the side panel and the playfield:
   * "Full Power Mode!", the spell-card bonus. Absent means nothing to announce.
   */
  banners?: ReadonlyArray<HudBannerView>;
}

/**
 * One laser as the renderer needs it: a rotated rectangle plus the cell to
 * stretch across it. The game layer does the beam-space maths.
 */
export interface LaserView {
  /** Beam centre in playfield pixels. */
  x: number;
  y: number;
  /** Beam heading in radians; the long axis points along it. */
  angle: number;
  /** Length along the heading. */
  length: number;
  /** Width across the heading. */
  width: number;
  /** Asset key of the body cell. */
  sprite: string;
  /** 0..1 body alpha from the `transformFlags & 1` ramp. */
  alpha: number;
}

/**
 * One authored quad of a 3D backdrop. The game does the projecting; the renderer
 * only maps the page key to a texture and puts four corners on the GPU.
 */
export interface BackdropQuadView {
  /** Asset key of the sprite page this quad samples, registered like any other art. */
  page: string;
  /** Eight numbers: screen x,y per corner. */
  screen: readonly number[];
  /** Eight numbers: u,v per corner in page pixels, same order as `screen`. */
  uv: readonly number[];
  alpha: number;
  additive?: boolean;
  /** Four view-space depths, one per corner; present means the quad is fogged. */
  depth?: readonly number[];
}

/** A frame of a game-authored backdrop. */
export interface BackdropView {
  quads: readonly BackdropQuadView[];
  /** Playfield clear colour, 0xRRGGBB. */
  clearColor?: number;
  /** 0..1 wipe laid over the backdrop while a spell card takes it off screen. */
  fade?: number;
  /**
   * `D3DRS_FOGCOLOR` and its ramp for this frame. Omitted, the fog bit is switched
   * off and every quad draws as authored.
   */
  fog?: FogRamp;
}

/**
 * One drawable piece of an active spell card. Mirrors the sim's `BombZone`, but
 * the renderer stays independent of the game it draws.
 */
export interface BombZoneView {
  shape: string;
  x: number;
  y: number;
  angle: number;
  radius: number;
  width: number;
  color: number;
  alpha: number;
  spin: number;
}

/**
 * One rectangle of a card's backdrop: a packed RGB colour and 0..1 coverage.
 * Mirrors the sim's `BombWash`.
 */
export interface WashView {
  color: number;
  alpha: number;
}

/** One-shot effect request queued through spawnEffect() and drained next frame. */
interface FxRequest {
  texture: string;
  x: number;
  y: number;
  size: number;
  alpha: number;
  rotation?: number;
  /** Optional multiply tint, used to recolour the white Taisei spark art. */
  tint?: number;
  /** Draw with additive blending so glows stack instead of occluding. */
  additive?: boolean;
  /**
   * Non-square footprint for art whose cell is not as wide as it is tall. `size` stays
   * the square case; retail's ANM cells are mostly rectangles.
   */
  width?: number;
  height?: number;
  /**
   * Mirror the quad about its own vertical axis, in local (pre-rotation) space.
   * Retail's `AnmVmBase::flags.flip` bits do the same to the sprite's uvs, which is
   * how a 式神 turns to face the way it is travelling without the script knowing.
   */
  flipX?: boolean;
}

/**
 * Optional per-entity opacity (0..1) - e.g. Boss death fade-out sets `alpha`.
 * Entities without the field render fully opaque (behavior unchanged).
 */
const entityAlpha = (e: object): number => (e as { alpha?: number }).alpha ?? 1;

const STAR = '★';

/**
 * Retail places every panel piece with `AnmOpcode_AnchorTopLeft`, which sets
 * `vm->anchor = 3` (`AnmManager.cpp:433-435`); the `anchor & 1` / `anchor & 2`
 * branches (`AnmManager.cpp:1300-1323`) then build the quad from `vm->pos` as
 * the *top-left* corner. `SpriteLayer` defaults to a centred anchor, so the HUD
 * has to opt into the corner explicitly or every piece drifts up-left by half
 * its own size -- which is what put the 東方永夜抄 plate over the label rows.
 */
const HUD_TOP_LEFT = { anchorX: 0, anchorY: 0 } as const;

/**
 * The panel's "a Last Spell can be paid for" colour. `Gui.cpp:1463` hands the ascii
 * manager `0xfffff0c0` -- ARGB, so the RGB is a warm off-white -- for the whole Time row
 * and puts `0xffffffff` back at `:1471`.
 */
const HUD_TIME_ROW_PAID = 0xfff0c0;

export class PixiRenderer {
  public app: Application;
  public gameContainer: Container;
  public hudContainer: Container;
  public debugContainer: Container;

  private bulletGraphics: Graphics;
  private entityGraphics: Graphics;
  /** Named procedural sprites; renderer draws bullets by `Bullet.sprite` key. */
  public readonly sprites = new SpriteManager();
  public readonly assets = new AssetManager();
  private hudGraphics: Graphics;
  private debugGraphics: Graphics;
  private backgroundGraphics: Graphics;
  private playerSprite: Sprite;

  private scoreText: Text;
  private hiScoreText: Text;
  private livesText: Text;
  private bombsText: Text;
  private powerText: Text;
  private grazeText: Text;
  private stageText: Text;
  private timeText: Text;
  /** Which half of the team is flying right now (永夜抄 focus switch). */
  private memberText: Text;
  private spellNameText: Text;
  private spellTimerText: Text;
  private spellCapturedText: Text;
  private centerBannerText: Text;
  private debugText: Text;

  /** HUD.showSpellCard display window (frames); the first slice is the pop-in. */
  private static readonly DISPLAY_WINDOW = 90;
  private static readonly DISPLAY_ANIM_FRAMES = 30;

  private width: number;
  private height: number;
  private pauseOverlay: Graphics;
  private pauseText: Text;

  /**
   * Playfield rect inside the 640x480 canvas; everything else is furniture.
   *
   * 永夜抄 runs its logic on a 384x448 field centred in the left of a 640x480
   * window, so `gameContainer` is translated by (x, y) and every world entity
   * draws in raw 0..384 / 0..448 script coordinates.
   */
  private playfield = {
    x: PLAYFIELD_X,
    y: PLAYFIELD_Y,
    width: PLAYFIELD_W,
    height: PLAYFIELD_H,
  };
  private rightPanelX = 460;
  private entityLayer: Container;
  /** ECL 114/115 beams, drawn under the bullets that fly over them. */
  private laserLayer: SpriteLayer;
  private bullets: SpriteLayer;
  private playerShots: SpriteLayer;
  private fx: SpriteLayer;
  /** Additive layer the spell cards paint their art into. */
  private bombGraphics: Graphics;
  private bgSky: SpriteLayer;
  private bgMid: SpriteLayer;
  private bgNear: SpriteLayer;
  /** Meshes for a game-authored 3D backdrop, plus the wipe that hides it. */
  private backdropLayer: Container;
  private readonly backdropQuads: QuadLayer;
  private backdropFade: Graphics;
  /**
   * The two halves of a game's screen wash: a colour plate under every sprite, and a
   * square over them. Danmaku games drive these from their bomb cards, where the
   * plate floods the backdrop and the square whites out the field, but nothing about
   * them is game-specific.
   */
  private washPlate: Graphics;
  private washFlash: Graphics;
  /**
   * One fog block for the whole layer, shared by reference with every fogged bucket,
   * so `drawBackdrop` publishes a frame's ramp once. Built on demand: a game with no
   * 3D backdrop never allocates one, and a renderer under test never has to mock it.
   */
  private fogBlock: FogUniforms | null = null;
  private frameSprite: Sprite;
  private panelSprite: Sprite;
  /** Panel-native status art (portrait, 妖率計) drawn above the panel plate. */
  private statusGraphics: Graphics;
  /** Stance the ship is drawn in; `render` refreshes it from the environment. */
  private playerPose: AnimPose = 'normal';
  private bannerSprite: Sprite;
  /**
   * Card-owner portrait for the 永夜抄 cut-in: the boss's art slides in from the
   * left when it declares a card, the player's from the right when a spell is
   * spent. The texture is whatever key the game put on `hud.spellCutIn`.
   */
  private cutInSprite: Sprite;
  /** Upstream 'Enemy' banner shown when a boss enters. */
  private bossWarningSprite: Sprite;
  /** Retail-style boss life gauge: shaded rects plus a two-digit timer. */
  private bossGaugeGraphics: Graphics;
  private bossTimerText: Text;
  private bossSprite: Sprite;
  /** Rotating spell-card circle + ground shadow, both real Taisei art. */
  private spellCircle: Sprite;
  private bossShadow: Sprite;
  /** Hitbox dot and swap flourish: always composited above every sprite. */
  private hitboxGraphics: Graphics;
  /** The retail 判定点光环 (effect template 22), painted just below `hitboxGraphics`. */
  private hitboxMarker: Sprite;
  /** The live glow handed in by the game layer, or null while none is on screen. */
  private hitboxGlow: HitboxGlow | null = null;
  private playfieldMask: Graphics;
  /**
   * The standing-down team member, drawn as a portrait in the right panel.
   * Retail never puts the sub-character on the playfield, and stacking it under
   * the flying ship is what turned the two into one muddy silhouette.
   */
  private partnerSprite: Sprite;
  /** Pooled heart / star icons for the lives and spell rows. */
  private hudIcons: SpriteLayer;
  /**
   * Pooled sprites for the original bitmap HUD: `front.anm` panel plates and labels,
   * `ascii.anm` digits, the 残机/灵击 stars and the 妖率計. Drawn last in the HUD so
   * nothing of the placeholder layer can bleed through it.
   */
  private hudBitmap: SpriteLayer;
  /**
   * Floating score digits. Kept in a layer of their own above `hudBitmap` because
   * `AsciiManager::DrawPopups` runs after `Gui::DrawGameScene`'s panel strips, and the
   * numbers have to read over the plate rather than under it.
   */
  private hudPopups: SpriteLayer;
  /** The power meter's fill, printed under the bitmap digits. */
  private powerBar: Graphics;
  /** The 夜時計: its dial and its hand are redrawn every frame. */
  private nightClockFace: Graphics;
  private nightClockHand: Graphics;
  /**
   * Latched once the original panel art lands. The registration is asynchronous, so a
   * negative probe must never stick -- caching `false` on frame 0 would keep the
   * placeholder panel on screen forever.
   */
  private hudArtReady = false;
  private spellCircleAngle = 0;

  private enemySprites = new Map<Enemy, Sprite>();
  private itemLayer: Container;
  private itemSprites = new Map<Item, Sprite>();
  /** How many sprites the last frame actually drew, for `spriteAudit`. */
  private drawnEnemies = 0;
  private drawnItems = 0;
  private theme: string;
  private scroll = 0;
  /** Animated sprite sheets supplied by the game layer (real Taisei art). */
  private readonly sheets = new Map<string, AnimatedSheet>();
  /**
   * Animation clocks are keyed per sprite *and* per slot. Keeping one player
   * instance per (sprite, slot) pair is what stops a fallback swap from
   * restarting the clock: the old single-slot-per-sprite map re-created the
   * player every time a sheet missed a frame, which made the ship snap back to
   * frame 0 and read as a twitch.
   */
  private readonly anims = new WeakMap<
    Sprite,
    Map<string, { sheet: AnimatedSheet; player: TaiseiAnimPlayer }>
  >();
  /** Slot most recently drawn by each sprite, for the debug overlay. */
  private readonly lastSlot = new WeakMap<Sprite, string>();
  /** Slots that failed a frame lookup; retired so fallback art stays stable. */
  private readonly brokenSheets = new Set<string>();
  /**
   * Last frame's ship animation choice, kept for the dev mirror only. It is the
   * one place that can say which group the lean machine actually settled on, so
   * a "the ship twitches by itself" report can be read instead of guessed at.
   */
  private playerAnimDebug = '';
  private playerLean = 0;

  /** Target ship width in playfield pixels. */
  private playerScale = 46;
  private playerSkin: 'taisei' | 'painted';
  private bombFlash = 0;
  /**
   * Tint of the running bomb flash. 永夜抄 gives every spell card its own
   * colour (`BombSpec.accent`), and the flash is the one cue that reads as
   * "whose card this was" before the cut-in finishes; a fixed white made all
   * sixteen cards look like the same effect.
   */
  private bombFlashTint = 0xffffff;
  /**
   * `ScreenEffect::RegisterChain(FULL_FADE_OUT, ticks, colour, …)`
   * (`Gui.cpp:876-879`): a full-screen quad whose alpha climbs from 0 to 1 as the
   * countdown runs, washing the whole picture into `screenFadeTint`.
   */
  private screenFadeFrames = 0;
  private screenFadeTotal = 0;
  private screenFadeTint = 0xffffff;
  private screenFade: Graphics;
  private pendingFx: FxRequest[] = [];

  constructor() {
    this.app = new Application();
    this.gameContainer = new Container();
    this.hudContainer = new Container();
    this.debugContainer = new Container();
    this.theme = 'forestNight';
    this.playerSkin = 'taisei';

    // --- playfield scene graph, painted bottom to top --------------------
    this.backgroundGraphics = new Graphics();
    this.gameContainer.addChild(this.backgroundGraphics);
    this.bgSky = new SpriteLayer(this.gameContainer, 'bg-sky');
    this.bgMid = new SpriteLayer(this.gameContainer, 'bg-mid');
    this.bgNear = new SpriteLayer(this.gameContainer, 'bg-near');
    // A game-supplied 3D backdrop sits above the parallax placeholder sheets, which
    // it replaces, and below the playfield furniture, which always stays in front.
    this.backdropLayer = new Container();
    this.gameContainer.addChild(this.backdropLayer);
    this.backdropQuads = new QuadLayer(this.backdropLayer, {
      fogShader: (texture) => createFogMeshShader(texture, this.fog()),
    });
    this.backdropFade = new Graphics();
    this.gameContainer.addChild(this.backdropFade);
    // The plate belongs where a stage's own backdrop colour belongs: over the
    // scrolling sheets, under the playfield furniture.
    this.washPlate = new Graphics();
    this.gameContainer.addChild(this.washPlate);

    this.frameSprite = makeSprite(0, 0);
    this.gameContainer.addChild(this.frameSprite);
    // Auras are centred on the boss, so they need the default middle anchor.
    this.spellCircle = makeSprite();
    this.bossShadow = makeSprite();
    this.gameContainer.addChild(this.spellCircle);
    this.gameContainer.addChild(this.bossShadow);
    this.entityLayer = new Container();
    this.gameContainer.addChild(this.entityLayer);
    this.itemLayer = new Container();
    this.gameContainer.addChild(this.itemLayer);
    this.entityGraphics = new Graphics();
    this.gameContainer.addChild(this.entityGraphics);
    this.bulletGraphics = new Graphics();
    this.gameContainer.addChild(this.bulletGraphics);

    this.partnerSprite = makeSprite();
    this.playerSprite = makeSprite();
    this.gameContainer.addChild(this.playerSprite);
    this.bossSprite = makeSprite();
    this.gameContainer.addChild(this.bossSprite);
    this.laserLayer = new SpriteLayer(this.gameContainer, 'lasers');
    this.bullets = new SpriteLayer(this.gameContainer, 'bullets');
    this.playerShots = new SpriteLayer(this.gameContainer, 'shots');
    this.fx = new SpriteLayer(this.gameContainer, 'fx');
    // Cards glow over the field but under the hitbox dot, which must stay
    // readable at any cost.
    this.bombGraphics = new Graphics();
    this.bombGraphics.blendMode = 'add';
    this.gameContainer.addChild(this.bombGraphics);
    // The retail ring is a 64 px red-and-white mark that fills most of the ship, so it
    // is a glow and never a point. It goes down first and the dot goes over it: adding
    // the two in the other order buries a 7 px bead under a 64 px ring, which is exactly
    // why slow mode read as "somewhere in this red haze". Script 54 never touches
    // `ADDITIVE_BLEND_MODE`, so the cell keeps retail's normal compositing.
    // The dot still has to survive the ship sprite, the partner ghost and every
    // bullet on top of it, so it stays the last thing painted in the playfield.
    this.hitboxMarker = makeSprite();
    this.hitboxMarker.blendMode = 'normal';
    this.gameContainer.addChild(this.hitboxMarker);
    this.hitboxGraphics = new Graphics();
    this.gameContainer.addChild(this.hitboxGraphics);
    // The square is the retail screen effect, which really does bury the field, but
    // the hitbox dot above it stays legible: 永夜抄's own bomb whites the screen out
    // without ever hiding where the ship is.
    this.washFlash = new Graphics();
    this.gameContainer.addChild(this.washFlash);
    // World art stops at the playfield edge. Enemies fly in from above and bullets
    // leave downward, and retail clips both instead of letting them walk across the
    // HUD panel; without this the off-field spawn points are plainly visible.
    this.playfieldMask = new Graphics().rect(0, 0, PLAYFIELD_W, PLAYFIELD_H).fill({ color: 0xffffff });
    this.gameContainer.addChild(this.playfieldMask);
    this.gameContainer.mask = this.playfieldMask as unknown as Container;

    // --- HUD furniture ---------------------------------------------------
    this.hudGraphics = new Graphics();
    this.hudContainer.addChild(this.hudGraphics);
    this.panelSprite = makeSprite(0, 0);
    this.bossGaugeGraphics = new Graphics();
    this.bossTimerText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xa0d0ff,
      }),
    });
    this.hudContainer.addChild(this.panelSprite);
    // The sub-character portrait belongs to the panel, and has to parent after the
    // panel plate or the plate paints straight over it.
    this.hudContainer.addChild(this.partnerSprite);
    this.statusGraphics = new Graphics();
    this.hudContainer.addChild(this.statusGraphics);
    this.hudContainer.addChild(this.bossGaugeGraphics);
    this.hudContainer.addChild(this.bossTimerText);

    const hudStyle = new TextStyle({
      fontFamily: 'Consolas, monospace',
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold',
      dropShadow: { alpha: 0.8, angle: 45, blur: 2, color: 0x000000, distance: 2 },
    });

    this.scoreText = new Text({ text: 'Score: 0000000000', style: hudStyle });
    this.hiScoreText = new Text({ text: 'HiScore: 000000000 0', style: hudStyle });
    this.livesText = new Text({ text: 'Player: ' + STAR + STAR + STAR, style: hudStyle });
    this.bombsText = new Text({ text: 'Spell:  ' + STAR + STAR + STAR, style: hudStyle });
    this.powerText = new Text({ text: 'Power:  128 / 128', style: hudStyle });
    this.grazeText = new Text({ text: 'Graze:  0', style: hudStyle });
    this.stageText = new Text({ text: 'Stage 1 - Normal', style: hudStyle });
    this.timeText = new Text({ text: 'Time: night', style: hudStyle });
    this.memberText = new Text({ text: 'Member: Reimu A', style: hudStyle });
    for (const t of [
      this.scoreText,
      this.hiScoreText,
      this.livesText,
      this.bombsText,
      this.powerText,
      this.grazeText,
      this.stageText,
      this.timeText,
      this.memberText,
    ]) {
      this.hudContainer.addChild(t);
    }
    // Icons live above the panel skin, otherwise the HUD backdrop hides them.
    this.hudIcons = new SpriteLayer(this.hudContainer, 'hud-icons');
    // The power bar belongs under the digits that print over it, so it is parented
    // before the bitmap layer that carries them.
    this.powerBar = new Graphics();
    this.hudContainer.addChild(this.powerBar);
    // The night clock sits in the same band as the power bar: under the digits,
    // over the panel skin.
    this.nightClockFace = new Graphics();
    this.nightClockHand = new Graphics();
    this.hudContainer.addChild(this.nightClockFace);
    this.hudContainer.addChild(this.nightClockHand);
    // The bitmap HUD is the topmost HUD layer: retail composites its panel strips
    // last, and anything procedural left in the frame must not show through.
    this.hudBitmap = new SpriteLayer(this.hudContainer, 'hud-bitmap');
    // Score popups ride above every other HUD sprite, matching the retail draw order.
    this.hudPopups = new SpriteLayer(this.hudContainer, 'hud-popups');
    // ...except the standing-down member, who rides in the panel's left gutter and
    // must sit above the 永夜抄 plate rather than under it.
    this.hudContainer.addChild(this.partnerSprite);

    this.spellNameText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'serif, sans-serif',
        fontSize: 18,
        fill: 0xffd700,
        fontWeight: 'bold',
        stroke: { color: 0x220000, width: 3 },
      }),
    });
    this.spellTimerText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'Consolas, monospace',
        fontSize: 22,
        fill: 0xff4444,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 3 },
      }),
    });
    this.centerBannerText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'sans-serif',
        fontSize: 24,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0xc41e3a, width: 4 },
      }),
    });
    this.spellCapturedText = new Text({
      text: 'CAPTURED',
      style: new TextStyle({
        fontFamily: 'sans-serif',
        fontSize: 15,
        fill: 0x6cff8a,
        fontWeight: 'bold',
        stroke: { color: 0x00220a, width: 3 },
      }),
    });
    this.bannerSprite = makeSprite();
    this.hudContainer.addChild(this.bannerSprite);
    this.cutInSprite = makeSprite();
    this.hudContainer.addChild(this.cutInSprite);
    this.bossWarningSprite = makeSprite();
    this.hudContainer.addChild(this.bossWarningSprite);
    this.hudContainer.addChild(this.spellNameText);
    this.hudContainer.addChild(this.spellTimerText);
    this.hudContainer.addChild(this.spellCapturedText);
    this.hudContainer.addChild(this.centerBannerText);

    this.debugGraphics = new Graphics();
    this.debugText = new Text({
      text: '',
      style: new TextStyle({ fontFamily: 'Consolas, monospace', fontSize: 12, fill: 0x00ff88 }),
    });
    this.debugContainer.addChild(this.debugGraphics);
    this.debugContainer.addChild(this.debugText);

    this.pauseOverlay = new Graphics();
    this.screenFade = new Graphics();
    this.screenFade.visible = false;
    this.pauseText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: 0xffffff,
        fontWeight: 'bold',
        stroke: { color: 0x000000, width: 4 },
      }),
    });
    this.pauseOverlay.visible = false;
    this.pauseText.visible = false;
    this.pauseText.anchor.set(0.5, 0.5);

    this.width = CANVAS_W;
    this.height = CANVAS_H;
  }

  async init(config: PixiRendererConfig): Promise<void> {
    this.width = config.width ?? CANVAS_W;
    this.height = config.height ?? CANVAS_H;
    this.theme = config.theme ?? this.theme;
    this.playerSkin = config.playerSkin ?? this.playerSkin;

    await this.assets.loadManifest(config.assetManifest);

    await this.app.init({
      width: this.width,
      height: this.height,
      backgroundColor: 0x0d0d16,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      preference: config.backend,
    });

    config.container.appendChild(this.app.canvas);

    this.app.stage.addChild(this.gameContainer);
    this.app.stage.addChild(this.hudContainer);
    this.app.stage.addChild(this.screenFade);
    this.app.stage.addChild(this.debugContainer);
    this.app.stage.addChild(this.pauseOverlay);
    this.app.stage.addChild(this.pauseText);

    // Layout: the 384x448 field sits at (32, 16), info panel down the right side.
    this.playfield = {
      x: PLAYFIELD_X,
      y: PLAYFIELD_Y,
      width: PLAYFIELD_W,
      height: PLAYFIELD_H,
    };
    this.rightPanelX = 460;
    this.gameContainer.position.set(this.playfield.x, this.playfield.y);
    // The frame is furniture drawn in world space, so it sits at the origin.
    this.frameSprite.position.set(0, 0);
    this.panelSprite.position.set(this.rightPanelX - 12, 32);

    const row = (i: number): number => 40 + i * 21;
    this.scoreText.position.set(this.rightPanelX, row(0));
    this.hiScoreText.position.set(this.rightPanelX, row(1));
    this.livesText.position.set(this.rightPanelX, row(2));
    this.bombsText.position.set(this.rightPanelX, row(3));
    this.powerText.position.set(this.rightPanelX, row(4));
    this.grazeText.position.set(this.rightPanelX, row(5));
    this.memberText.position.set(this.rightPanelX, row(6));
    this.stageText.position.set(this.rightPanelX, row(7));
    this.timeText.position.set(this.rightPanelX, row(8));

    this.spellNameText.anchor.set(0.5);
    this.spellNameText.position.set(
      this.playfield.x + this.playfield.width / 2,
      this.playfield.y + this.playfield.height / 2,
    );
    this.spellTimerText.position.set(
      this.playfield.x + this.playfield.width - 8,
      this.playfield.y + this.playfield.height / 2 - 10,
    );
    this.spellTimerText.anchor.set(1, 0);
    this.spellCapturedText.anchor.set(0.5, 0);
    this.centerBannerText.position.set(224, 240);
    this.centerBannerText.anchor.set(0.5, 0.5);
    this.bossTimerText.position.set(BOSS_GAUGE.timerX, BOSS_GAUGE.timerY);
    this.debugText.position.set(10, 10);
  }

  render(
    player: Player,
    boss: Boss | null,
    enemies: Enemy[],
    bullets: Bullet[],
    hud: HUD,
    monitor: PerformanceMonitor,
    isPaused = false,
    input: InputSystem | null = null,
    environment: RenderEnvironment = {},
    items: Item[] = [],
  ): void {
    this.playerPose = environment.playerPose ?? 'normal';
    this.hitboxMarker.visible = false;
    this.entityGraphics.clear();
    this.bulletGraphics.clear();
    this.hitboxGraphics.clear();
    this.bombGraphics.clear();
    this.washPlate.clear();
    this.washFlash.clear();
    this.hudGraphics.clear();
    this.statusGraphics.clear();
    this.debugGraphics.clear();
    this.bullets.begin();
    this.laserLayer.begin();
    this.playerShots.begin();
    this.fx.begin();

    this.drawBombArt(environment.bombZones, environment.bombCancel);
    this.drawWash(environment.bombWash);

    // 1. Parallax background: far sheet drifts, near sheet carries the scroll.
    // A projected backdrop wins outright: it paints the whole field itself, so the
    // clear colour comes from the stage's own camera script rather than a mood.
    const backdrop = this.drawBackdrop(environment.backdrop);
    const bg = backdrop
      ? (environment.backdrop?.clearColor ?? 0x000000)
      : (environment.backgroundColor ?? 0x0d0d16);
    this.backgroundGraphics.clear();
    // Drawn inside the translated world container, so the canvas backdrop has to
    // reach back by the playfield offset to cover the letterbox band.
    this.backgroundGraphics
      .rect(-this.playfield.x, -this.playfield.y, this.width, this.height)
      .fill({ color: bg });
    const theme = environment.theme ?? this.theme;
    if (theme !== this.theme) {
      this.theme = theme;
      this.scroll = 0;
    }
    if (!isPaused) this.scroll += environment.scrollSpeed ?? 1.1;
    const sky = this.assets.get('bg:' + theme + ':sky');
    const mid = this.assets.get('bg:' + theme + ':mid');
    const near = this.assets.get('bg:' + theme + ':near');
    const shade = Math.max(0.42, Math.min(1, environment.brightness ?? 1));
    // Most stage packs ship one painted backdrop rather than a depth stack. Driving
    // that sheet at the full scroll rate keeps the scene moving; when a pack does
    // ship several sheets they split into the usual three-plane parallax.
    const planes = [sky, mid, near].filter(Boolean).length;
    const rate = planes > 1 ? 0.34 : 1;
    this.placeLayer(this.bgSky, backdrop ? undefined : sky, this.scroll * rate, shade);
    this.placeLayer(this.bgMid, backdrop ? undefined : mid, this.scroll * 0.68, shade * 0.96);
    this.placeLayer(this.bgNear, backdrop ? undefined : near, this.scroll, shade * 0.92);

    // 2. Playfield furniture (frame + HUD skin) — textures when present.
    const frame = this.assets.get('ui:frame');
    const bitmapHud = this.usingBitmapHud();
    if (bitmapHud) {
      // The retail plate tiles the whole window, so the placeholder frame and panel
      // have to be taken down rather than merely skipped: they are persistent sprites
      // and would otherwise stay up from the frames before the art landed.
      this.frameSprite.visible = false;
      this.panelSprite.visible = false;
      this.hudGraphics.clear();
    } else if (frame) {
      this.frameSprite.visible = true;
      this.frameSprite.texture = frame;
      this.frameSprite.position.set(0, 0);
    } else {
      this.frameSprite.visible = false;
      this.hudGraphics
        .rect(this.playfield.x, this.playfield.y, this.playfield.width, this.playfield.height)
        .stroke({ width: 2, color: 0x5bb8b3 });
    }
    const panel = this.assets.get('ui:hudPanel');
    if (panel && !bitmapHud) {
      this.panelSprite.visible = true;
      this.panelSprite.texture = panel;
      this.panelSprite.position.set(this.rightPanelX - 12, 32);
    } else if (!bitmapHud) {
      this.panelSprite.visible = false;
      this.hudGraphics.rect(this.rightPanelX - 12, 32, 180, 416).stroke({ width: 2, color: 0xc41e3a });
    }

    // 3. Player: the active member flies upright and only leans toward the
    //    direction of travel. The standing-down member sits in the panel below.
    this.playerSprite.visible = false;

    // A dying ship still draws: 永夜抄 holds it white through the deathbomb
    // window and then dissolves it, and none of that happens with the sprite off.
    if (player.isAlive || player.state === 'dying') {
      const px = player.position.x;
      const py = player.position.y;
      const pa = entityAlpha(player);
      // `leanX` is the intended horizontal velocity; the measured delta is only a
      // stand-in for games that do not track intent. See `Player.leanX`.
      const dirX = (player.leanX ?? player.velocity.x) / Math.max(0.001, player.fastSpeed);

      const blink = !player.isInvulnerable || Math.floor(player.invulnerabilityTimer / 6) % 2 === 0;
      this.playerSprite.blendMode = 'normal';
      if (blink) this.drawMember(this.playerSprite, player.member.id, px, py, pa, dirX);
      // A card's own state clock reads red for two frames of every eight, which is
      // how retail marks the ship while `PLAYER_STATE_DEAD` holds it
      // (`Player.cpp:1457-1479`); the colour it writes is 0xf02020.
      this.playerSprite.tint = player.bombStateFlash ? 0xf02020 : 0xffffff;

      /*
       * The 判定点光环, drawn from the live effect the sim spawned.
       *
       * This is retail's own template 22 (`Player.cpp:704-707`), whose script 54 in
       * `etama.anm` selects cell 218 - a 64x64 red-and-white radial mark with a white
       * core - ramps alpha 0 → 255 over 20 frames, and spins at a random angular
       * velocity. Cell, alpha and rotation all come off the script; the node it lands on
       * is chosen here because this renderer's effect batch sits under the ship sprite,
       * and a ring the ship covers is a ring with a bite out of it. It is deliberately
       * not gated on `hitboxVisible`: the script's own fade is the authority on when the
       * ring is on screen, and retail starts it on the frame Shift goes down.
       *
       * What used to be here was an invented 4-cell additive coil (`etama_t5` 326..329,
       * the only additive loop in the pack), chosen when the template table at
       * `0x004c6d30` could not be read. The table has since been read out of the shipped
       * `th08.exe`, no template anywhere in those 66 rows names script 114, and the
       * script the table does name for template 22 draws a different cell entirely.
       */
      const glow = this.hitboxGlow;
      const glowArt = glow ? this.assets.get(glow.key) : undefined;
      if (glow && glowArt && glow.alpha > 0) {
        this.hitboxMarker.visible = true;
        this.hitboxMarker.texture = glowArt;
        this.hitboxMarker.position.set(px, py);
        this.hitboxMarker.alpha = pa * glow.alpha;
        this.hitboxMarker.rotation = glow.rotation;
        this.hitboxMarker.scale.set(
          glow.width / Math.max(1, glowArt.width),
          glow.height / Math.max(1, glowArt.height),
        );
      }
      if (player.hitboxVisible) {
        // The bead itself, on top of the glow and drawn whether or not the pack
        // loaded. Retail draws nothing at the centre of that ring - cell 218 carries its
        // own white core - so this is a stated addition rather than a reconstruction: the
        // real hit box is `plyNNa.sht + 0x0C / 2`, under a playfield unit across, which at
        // any window size is one pixel, and a 64 px ring does not pin a point that small.
        // The bead is the honest extent, clamped up to the smallest thing the eye can fix.
        const hb = this.hitboxGraphics;
        const bead = Math.max(HITBOX_DOT, player.hitbox.radius);
        // The dark pocket is what separates the bead from the red ring it sits in: both
        // are red, so without a hole punched in the glow the "point" is just a brighter
        // patch of the same colour and the eye cannot fix it.
        hb.circle(px, py, bead + HITBOX_BEZEL).fill({ color: 0x06121f, alpha: 0.82 * pa });
        hb.circle(px, py, bead).fill({ color: 0xff5a6e, alpha: 0.95 * pa });
        hb.circle(px, py, Math.max(1.4, bead - HITBOX_CORE)).fill({ color: 0xffffff, alpha: pa });
      }

      // Swap flourish: a ring that snaps out when focus changes the flying member.
      if (player.switchFlash > 0) {
        const t = 1 - player.switchFlash / SWITCH_FLASH_FRAMES;
        const span = 14 + t * 30;
        this.hitboxGraphics.circle(px, py, span).stroke({
          width: 2.4 * (1 - t) + 0.4,
          color: player.member.accentColor,
          alpha: (1 - t) * 0.9 * pa,
        });
      }
    }
    // 4. Enemies — sprite when the atlas has one, fairy silhouette otherwise.
    const liveEnemies = new Set<Enemy>();
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      liveEnemies.add(enemy);
      const ex = enemy.position.x;
      const ey = enemy.position.y;
      const ea = entityAlpha(enemy);
      const key = this.sprites.textureKey(enemy.spriteKey ?? 'enemy') ?? enemy.spriteKey ?? 'enemy';
      const sprite = this.enemySpriteFor(enemy);
      if (this.drawSheet('enemy:' + key, sprite, ex, ey, ea, 0, enemy.rotation, enemy.hitbox.radius * 3.4)) {
        continue;
      }
      // Original .anm cells are 1x art sized for the 384x448 field, so real
      // textures draw at native size and only ever rotate when the script says
      // so — no synthetic bob and no velocity lean.
      const texture =
        this.assets.get(key) ?? this.assets.get('enemy:' + key) ?? this.assets.get('sprite:enemy:' + key);
      if (texture) {
        // Signed: a negative X scale is the script mirroring the cell, which is how
        // retail draws the left and right turn cycles off one sprite.
        const scale = Number.isFinite(enemy.drawScale) && enemy.drawScale !== 0 ? enemy.drawScale : 1;
        sprite.visible = true;
        sprite.texture = texture;
        sprite.position.set(ex, ey);
        sprite.rotation = enemy.rotation;
        sprite.alpha = ea;
        sprite.scale.set(scale);
      } else {
        this.entityGraphics.ellipse(ex - 8, ey - 4, 10, 5).fill({ color: 0xffffff, alpha: 0.6 * ea });
        this.entityGraphics.ellipse(ex + 8, ey - 4, 10, 5).fill({ color: 0xffffff, alpha: 0.6 * ea });
        this.entityGraphics.circle(ex, ey, enemy.hitbox.radius).fill({ color: enemy.color, alpha: ea });
      }
    }

    // Every enemy that left the field this frame has to give its sprite back:
    // the map is keyed by the Enemy object, so a killed fairy otherwise keeps
    // its sprite parented to entityLayer and frozen at its last position.
    for (const [enemy, sprite] of this.enemySprites) {
      if (liveEnemies.has(enemy)) continue;
      sprite.visible = false;
      if (typeof (this.entityLayer as any).removeChild === 'function') {
        this.entityLayer.removeChild(sprite);
      }
      sprite.destroy();
      this.enemySprites.delete(enemy);
    }
    this.drawnEnemies = liveEnemies.size;

    // 4b. Collectible drops — real Taisei item art over a soft glow so the
    // pile reads against the scrolling background.
    this.drawItems(items);

    // 5. Boss — sprite with entrance bob, HP bar, and death fade.
    const bossFadeAlpha = boss && 'alpha' in boss ? entityAlpha(boss) : 0;
    if (boss && (boss.isAlive || (boss.isDefeated && bossFadeAlpha > 0))) {
      const bx = boss.position.x;
      const by = boss.position.y;
      const ba = entityAlpha(boss);
      this.bossSprite.visible = false;
      const bossKey = this.sprites.textureKey(boss.spriteKey ?? boss.name) ?? boss.spriteKey ?? boss.name;
      this.drawBossAura(bx, by, ba, boss.isSpellCardActive, bossColor(boss));
      const usedBossSheet =
        boss.isAlive &&
        this.drawSheet(
          'boss:' + bossKey,
          this.bossSprite,
          bx,
          by,
          ba,
          0,
          boss.rotation,
          boss.hitbox.radius * 3.6,
        );
      const texture = usedBossSheet
        ? undefined
        : (this.assets.get(bossKey) ??
          this.assets.get('boss:' + bossKey) ??
          this.assets.get('enemy:' + bossKey));
      if (texture && boss.isAlive) {
        this.bossSprite.visible = true;
        this.bossSprite.texture = texture;
        this.bossSprite.position.set(bx, by);
        this.bossSprite.alpha = ba;
        this.bossSprite.rotation = boss.rotation;
        this.bossSprite.scale.set(1);
      } else if (!usedBossSheet) {
        const auraAlpha = (0.2 + 0.1 * Math.sin(boss.timer * 0.1)) * ba;
        this.entityGraphics.circle(bx, by, 32).fill({ color: bossColor(boss), alpha: auraAlpha });
        this.entityGraphics.circle(bx, by - 6, 12).fill({ color: bossAccent(boss), alpha: ba });
        this.entityGraphics
          .poly([
            { x: bx, y: by },
            { x: bx - 14, y: by + 20 },
            { x: bx + 14, y: by + 20 },
          ])
          .fill({ color: 0x1a1a24, alpha: ba });
      }

      this.drawBossGauge(boss);
    } else {
      this.bossSprite.visible = false;
      this.spellCircle.visible = false;
      this.bossShadow.visible = false;
      // ECL-driven bosses have no `Boss` object, only a scripted life bar.
      if (environment.bossGauge) {
        this.drawBossGauge(environment.bossGauge);
      } else {
        this.bossGaugeGraphics.clear();
        this.bossTimerText.visible = false;
      }
    }
    // 5b. Lasers. One `etama` cell stretched along the beam heading, then the same
    // cell again additively: retail drives two ANM VMs per beam and the second one
    // runs with `blendMode = 1`, which is what gives an EoSD laser its hot core.
    for (const laser of environment.lasers ?? []) {
      const texture = this.assets.get(laser.sprite);
      if (!texture) continue;
      const length = Math.max(1, laser.length);
      const width = Math.max(1, laser.width);
      // `scale.x` carries the beam length, so the sprite's own +x is its long axis
      // and the heading needs no quarter turn.
      const rotation = laser.angle;
      for (const additive of [false, true]) {
        const s = this.laserLayer.acquire();
        s.visible = true;
        s.texture = texture;
        s.position.set(laser.x, laser.y);
        s.rotation = rotation;
        s.blendMode = additive ? 'add' : 'normal';
        s.alpha = laser.alpha * (additive ? 0.75 : 1);
        const drawnWidth = additive ? width * 0.5 : width;
        s.scale.set(length / texture.width, drawnWidth / texture.height);
      }
    }
    this.laserLayer.end();
    // 6. Bullets - baked textures (white core preserved), Graphics fallback.
    for (const b of bullets) {
      if (!b.isAlive) continue;
      // Static laser segments have no velocity, so orient them from their heading.
      const speed = Math.hypot(b.velocity.x, b.velocity.y);
      const rotation = speed > 0.01 ? Math.atan2(b.velocity.y, b.velocity.x) : b.heading;
      const isPlayer = b.tag === 'player-bullet';
      const layer = isPlayer ? this.playerShots : this.bullets;
      const key = isPlayer
        ? (this.sprites.textureKey(b.sprite) ?? 'shot:' + player.memberId)
        : (this.sprites.bulletTextureKey(b.sprite, b.color) ??
          // Games that ship their own sliced bullet art name the bullet's `sprite`
          // after the texture itself, so the name is usable as a key directly.
          (this.assets.has(b.sprite) ? b.sprite : undefined));
      const texture = key ? this.assets.get(key) : undefined;
      if (texture) {
        const size = b.drawRadius > 0 ? b.drawRadius * 2 : b.hitbox.radius * (isPlayer ? 4.2 : 3.1);
        const s = layer.acquire();
        s.visible = true;
        s.texture = texture;
        s.position.set(b.position.x, b.position.y);
        // Player shots only ever spin visually; their heading stays the launch line.
        s.rotation = isPlayer ? b.spin * b.lifetime : rotation + Math.PI / 2;
        s.alpha = entityAlpha(b);
        s.scale.set(size / Math.max(1, texture.width));
      } else {
        this.sprites.draw(this.bulletGraphics, b.sprite, b.position.x, b.position.y, {
          color: b.color,
          radius: b.hitbox.radius,
          rotation,
          alpha: entityAlpha(b),
        });
      }
    }
    this.bullets.end();
    this.playerShots.end();

    // 7. Effects: bomb flash and one-shot sparks.
    if (this.bombFlash > 0) {
      const cx = this.playfield.width / 2;
      const cy = this.playfield.height / 2;
      const t = this.bombFlash / 18;
      for (const [key, span] of [
        ['taisei:part:blast_huge_rays', 620],
        ['taisei:part:blast_huge_halo', 520],
      ] as const) {
        const art = this.assets.get(key);
        if (!art) continue;
        const s = this.fx.acquire();
        s.visible = true;
        s.texture = art;
        s.position.set(cx, cy);
        s.rotation = key.endsWith('rays') ? (1 - t) * 0.7 : 0;
        s.alpha = Math.min(1, t * (key.endsWith('rays') ? 0.9 : 0.7));
        s.tint = this.bombFlashTint;
        s.blendMode = 'add';
        s.scale.set(span / Math.max(1, art.width));
      }
      const glow = this.assets.get('fx:bombFlash') ?? this.assets.get('fx:glow');
      if (glow) {
        const s = this.fx.acquire();
        s.visible = true;
        s.texture = glow;
        s.position.set(cx, cy);
        s.alpha = Math.min(1, this.bombFlash / 18);
        s.tint = this.bombFlashTint;
        s.scale.set((this.width * 1.4) / Math.max(1, glow.width));
      }
      this.bombFlash = Math.max(0, this.bombFlash - 1);
    }
    for (const fx of this.pendingFx.splice(0)) {
      const texture = this.assets.get(fx.texture);
      if (!texture) continue;
      const s = this.fx.acquire();
      s.visible = true;
      s.texture = texture;
      s.position.set(fx.x, fx.y);
      s.alpha = fx.alpha;
      s.rotation = fx.rotation ?? 0;
      if (fx.tint !== undefined) s.tint = fx.tint;
      s.blendMode = fx.additive ? 'add' : 'normal';
      const w = fx.width ?? fx.size;
      const h = fx.height ?? fx.size;
      s.scale.set(
        (fx.flipX ? -w : w) / Math.max(1, texture.width),
        h / Math.max(1, texture.height),
      );
    }
    this.fx.end();

    // 8. HUD read-outs.
    if (bitmapHud) {
      this.drawBitmapHud(hud, environment.youkaiMeter, environment.banners);
    } else {
      // The text read-outs fall back to `Text` objects above, but the dial is
      // vector art, so it belongs on screen either way.
      this.drawNightClock(hud.clockTime, !bitmapHud);
      this.hudBitmap.begin();
      this.hudBitmap.end();
      this.scoreText.text = 'Score:  ' + hud.formattedScore;
      this.hiScoreText.text = 'HiScore:' + hud.formattedHiScore;
      const iconArt = Boolean(this.assets.get('taisei:ui:heart') && this.assets.get('taisei:ui:star'));
      this.livesText.text =
        'Player: ' + (iconArt ? '' : hud.lives > 0 ? STAR.repeat(Math.min(8, hud.lives)) : '-');
      this.bombsText.text = 'Spell:  ' + (iconArt ? '' : STAR.repeat(Math.max(0, hud.bombs)));
      this.drawHudIcons(hud.lives, hud.bombs, (i) => 40 + i * 21);
      this.powerText.text = 'Power:  ' + hud.power + ' / ' + hud.maxPower;
      this.grazeText.text = 'Graze:  ' + hud.graze;
      this.stageText.text = 'Stage ' + hud.stageNumber + ' - ' + hud.difficulty;
      this.timeText.text = 'Time: ' + hud.timePhase;
      this.memberText.text = 'Member: ' + hud.memberLabel + (hud.focusActive ? ' *' : '');
    }
    this.drawTeamStatus(player, environment.youkaiMeter);
    this.drawScorePopups(environment.scorePopups);

    // Spell-card banner: pop in from the right, settle centred (US#6).
    const streak = this.assets.get('taisei:ui:spell');
    const banner = this.assets.get('ui:spellBanner');
    const cutInTex = hud.spellCutIn ? this.assets.get(hud.spellCutIn) : undefined;
    if (hud.spellCardName) {
      this.spellNameText.text = hud.spellCardName;
      this.spellTimerText.text = Math.ceil(hud.spellCardTime).toString();
      this.spellNameText.visible = true;
      this.spellTimerText.visible = true;
      const elapsedFrames = PixiRenderer.DISPLAY_WINDOW - Math.max(0, hud.spellCardDisplayTimer);
      const progress = Math.min(1, elapsedFrames / PixiRenderer.DISPLAY_ANIM_FRAMES);
      const eased = 1 - Math.pow(1 - progress, 3);
      const centerX = this.width / 2;
      const bannerX = centerX + (1 - eased) * (this.width - centerX);
      // A taken card keeps its green CAPTURED for as long as the plate is up.
      this.spellCapturedText.visible = hud.spellCaptured;
      this.spellCapturedText.position.set(this.spellNameText.position.x, this.spellNameText.position.y + 14);
      this.spellNameText.alpha = Math.min(1, 0.2 + eased * 0.8);
      this.spellNameText.scale.set(1.6 - 0.6 * eased);
      this.spellNameText.position.set(bannerX, this.height / 2 - 14);
      const bannerTex = banner ?? streak;
      if (bannerTex) {
        this.bannerSprite.visible = true;
        this.bannerSprite.texture = bannerTex;
        this.bannerSprite.position.set(bannerX, this.height / 2 - 14);
        this.bannerSprite.alpha = this.spellNameText.alpha;
        this.bannerSprite.blendMode = bannerTex === streak ? 'add' : 'normal';
        this.bannerSprite.scale.set((bannerTex === streak ? 430 : 420) / Math.max(1, bannerTex.width));
      } else {
        this.bannerSprite.visible = false;
      }
    } else {
      this.spellNameText.visible = false;
      this.spellTimerText.visible = false;
      this.spellCapturedText.visible = false;
      this.bannerSprite.visible = false;
      this.spellNameText.scale.set(1);
      this.spellNameText.alpha = 1;
    }

    // Card-owner cut-in. It rides the same display window as the banner but keeps
    // its own slide, from the declaring side, and fades out over the last frames.
    if (cutInTex && hud.spellCardDisplayTimer > 0) {
      const remaining = hud.spellCardDisplayTimer;
      const entered = (PixiRenderer.DISPLAY_WINDOW - remaining) / PixiRenderer.DISPLAY_ANIM_FRAMES;
      const eased = 1 - Math.pow(1 - Math.min(1, entered), 3);
      const fromRight = hud.spellCutInSide === 'player';
      const height = 210;
      const anchorX = fromRight ? this.playfield.x + this.playfield.width - 6 : this.playfield.x + 6;
      this.cutInSprite.visible = true;
      this.cutInSprite.texture = cutInTex;
      this.cutInSprite.scale.set(height / Math.max(1, cutInTex.height));
      this.cutInSprite.anchor.set(fromRight ? 1 : 0, 0.5);
      this.cutInSprite.position.set(
        anchorX + (fromRight ? 1 : -1) * (1 - eased) * (height * 0.8),
        this.playfield.y + this.playfield.height - height / 2 - 10,
      );
      this.cutInSprite.alpha = Math.min(1, remaining / 18) * 0.96;
    } else {
      this.cutInSprite.visible = false;
    }

    // Boss-approach warning: the real upstream banner slides in over the text.
    const warningTex = hud.bossWarning ? this.assets.get('taisei:ui:boss_indicator') : undefined;
    if (warningTex) {
      const remaining = hud.centerMessageTimer;
      const slide = Math.min(1, (BOSS_WARNING_FRAMES - remaining) / BOSS_WARNING_SLIDE_FRAMES);
      const eased = 1 - Math.pow(1 - slide, 3);
      const w = 210;
      const cx = this.playfield.x + this.playfield.width / 2;
      // Enter from off the left edge of the playfield, park centred, then fade.
      const fromX = this.playfield.x - w;
      this.bossWarningSprite.visible = true;
      this.bossWarningSprite.texture = warningTex;
      this.bossWarningSprite.anchor.set(0.5, 0.5);
      this.bossWarningSprite.scale.set(w / Math.max(1, warningTex.width));
      this.bossWarningSprite.position.set(
        fromX + (cx - fromX) * eased,
        this.playfield.y + this.playfield.height * 0.3,
      );
      this.bossWarningSprite.alpha = Math.min(1, remaining / 24);
      this.centerBannerText.visible = false;
    } else {
      this.bossWarningSprite.visible = false;
      this.centerBannerText.visible = Boolean(hud.centerMessage);
      if (hud.centerMessage) this.centerBannerText.text = hud.centerMessage;
    }

    // 9. Debug overlay (metrics + live input).
    //
    // The screen fade sits under the debug read-out on purpose: `ScreenEffect`
    // draws over the picture in retail, but a QA overlay that disappears under
    // white is a QA overlay that cannot be read during the effect.
    if (this.screenFadeTotal > 0) {
      this.screenFade.visible = true;
      this.screenFade.clear();
      this.screenFade
        .rect(0, 0, this.width, this.height)
        .fill({ color: this.screenFadeTint, alpha: this.screenFadeAlpha });
      // The countdown is inclusive at both ends, so the ramp is drawn `frames + 1`
      // times and full coverage actually reaches the screen before the chain retires.
      if (this.screenFadeFrames > 0) this.screenFadeFrames--;
      else this.screenFadeTotal = 0;
    } else {
      this.screenFade.visible = false;
      this.screenFade.clear();
    }
    if (monitor.isVisible) {
      this.debugContainer.visible = true;
      const lines = monitor.getMetricsText();
      if (input) {
        const active = input.getActiveActions();
        lines.push('Input: ' + (active.length > 0 ? active.join(' ') : '-'));
      }
      this.debugText.text = lines.join('\n');
      this.debugGraphics.rect(5, 5, 230, lines.length * 15 + 10).fill({ color: 0x000000, alpha: 0.7 });
    } else {
      this.debugContainer.visible = false;
    }

    // 10. Pause overlay.
    if (isPaused) {
      this.pauseOverlay.clear();
      this.pauseOverlay.rect(0, 0, this.width, this.height).fill({ color: 0x000000, alpha: 0.55 });
      this.pauseText.text = 'PAUSED - press ESC to resume';
      this.pauseText.position.set(this.width / 2, this.height / 2);
      this.pauseOverlay.visible = true;
      this.pauseText.visible = true;
    } else {
      this.pauseOverlay.visible = false;
      this.pauseText.visible = false;
    }
  }

  /**
   * Paint the spell card that is currently running. Each shape gets its own
   * geometry so the 16 cards read differently, the way the retail ANM scripts
   * do: pillars for Marisa, wedges for Youmu, orbs for Reimu, knives for Sakuya,
   * edge barriers for Yukari, rings for Remilia, dolls and butterflies.
   */
  /**
   * Paint a card's backdrop. The plate belongs with the stage's own background
   * colour, under every sprite; the square belongs over them, because retail's
   * `ScreenEffect::DrawSquare` goes down with the ship's high-priority draw. The
   * hitbox dot still sits above both: Eternal Night whites the field out without
   * ever hiding where the ship is.
   */
  private drawWash(wash: RenderEnvironment['bombWash']): void {
    const layers: readonly [Graphics, WashView | null | undefined][] = [
      [this.washPlate, wash?.plate],
      [this.washFlash, wash?.flash],
    ];
    for (const [layer, view] of layers) {
      if (!view || view.alpha <= 0) continue;
      layer.rect(0, 0, PLAYFIELD_W, PLAYFIELD_H).fill({ color: view.color, alpha: Math.min(1, view.alpha) });
    }
  }

  private drawBombArt(
    zones: ReadonlyArray<BombZoneView> | undefined,
    cancel: RenderEnvironment['bombCancel'],
  ): void {
    const g = this.bombGraphics;
    if (cancel) {
      g.circle(cancel.x, cancel.y, cancel.radius).stroke({
        width: 14,
        color: 0xffffff,
        alpha: 0.3 * cancel.alpha,
      });
      g.circle(cancel.x, cancel.y, cancel.radius).stroke({
        width: 3,
        color: 0x9fe8ff,
        alpha: 0.85 * cancel.alpha,
      });
    }
    if (!zones) return;
    for (const z of zones) {
      const a = z.alpha;
      switch (z.shape) {
        case 'beam': {
          const c = Math.cos(z.angle);
          const s = Math.sin(z.angle);
          const nx = -s;
          const ny = c;
          const tx = z.x + c * z.radius;
          const ty = z.y + s * z.radius;
          const band = (mult: number, color: number, alpha: number): void => {
            const hw = z.width * mult;
            g.moveTo(z.x + nx * hw, z.y + ny * hw)
              .lineTo(tx + nx * hw * 0.6, ty + ny * hw * 0.6)
              .lineTo(tx - nx * hw * 0.6, ty - ny * hw * 0.6)
              .lineTo(z.x - nx * hw, z.y - ny * hw)
              .closePath()
              .fill({ color, alpha });
          };
          band(2.1, z.color, 0.16 * a);
          band(1.25, z.color, 0.4 * a);
          band(0.55, 0xffffff, 0.92 * a);
          for (let i = -1; i <= 1; i++) {
            const off = i * z.width * 0.8;
            g.moveTo(z.x + nx * off, z.y + ny * off)
              .lineTo(tx + nx * off * 0.4, ty + ny * off * 0.4)
              .stroke({ width: 1.5, color: 0xffffff, alpha: 0.35 * a });
          }
          g.circle(z.x, z.y, z.width * 1.5).fill({ color: 0xffffff, alpha: 0.55 * a });
          break;
        }
        case 'slash': {
          const steps = 10;
          g.moveTo(z.x, z.y);
          for (let i = 0; i <= steps; i++) {
            const ang = z.angle - z.width + (2 * z.width * i) / steps;
            g.lineTo(z.x + Math.cos(ang) * z.radius, z.y + Math.sin(ang) * z.radius);
          }
          g.closePath().fill({ color: z.color, alpha: 0.22 * a });
          g.stroke({ width: 2.5, color: 0xffffff, alpha: 0.7 * a });
          break;
        }
        case 'knife': {
          const c = Math.cos(z.angle);
          const s = Math.sin(z.angle);
          const nx = -s;
          const ny = c;
          const half = Math.max(6, z.radius * 0.5);
          g.moveTo(z.x + c * half, z.y + s * half)
            .lineTo(z.x + nx * z.width, z.y + ny * z.width)
            .lineTo(z.x - c * half, z.y - s * half)
            .lineTo(z.x - nx * z.width, z.y - ny * z.width)
            .closePath()
            .fill({ color: 0xf2f8ff, alpha: 0.9 * a })
            .stroke({ width: 1, color: z.color, alpha: 0.9 * a });
          break;
        }
        case 'butterfly': {
          const flap = 0.45 + 0.55 * Math.abs(Math.sin(z.spin * 2));
          const c = Math.cos(z.angle + Math.PI / 2);
          const s = Math.sin(z.angle + Math.PI / 2);
          const spread = 10 * flap;
          g.ellipse(z.x + c * spread, z.y + s * spread, 9, 6).fill({
            color: z.color,
            alpha: 0.5 * a,
          });
          g.ellipse(z.x - c * spread, z.y - s * spread, 9, 6).fill({
            color: z.color,
            alpha: 0.5 * a,
          });
          g.circle(z.x, z.y, 2.4).fill({ color: 0xffffff, alpha: 0.8 * a });
          break;
        }
        case 'barrier': {
          g.rect(z.x - z.width, z.y - z.radius, z.width * 2, z.radius * 2)
            .fill({ color: z.color, alpha: 0.13 * a })
            .stroke({ width: 3, color: z.color, alpha: 0.7 * a });
          g.rect(z.x - z.width + 7, z.y - z.radius + 7, (z.width - 7) * 2, (z.radius - 7) * 2).stroke({
            width: 1,
            color: 0xffffff,
            alpha: 0.4 * a,
          });
          break;
        }
        case 'wave': {
          g.circle(z.x, z.y, z.radius).stroke({
            width: z.width * 0.55,
            color: z.color,
            alpha: 0.3 * a,
          });
          g.circle(z.x, z.y, z.radius).stroke({ width: 2, color: 0xffffff, alpha: 0.6 * a });
          break;
        }
        case 'doll': {
          g.circle(z.x, z.y, z.radius * 0.7).fill({ color: z.color, alpha: 0.55 * a });
          g.rect(z.x - z.radius * 0.28, z.y, z.radius * 0.56, z.radius * 0.9).fill({
            color: 0xffffff,
            alpha: 0.6 * a,
          });
          break;
        }
        default: {
          // Yin-yang orb: two stacked spheres, the 夢想玉 silhouette.
          g.circle(z.x, z.y - z.radius * 0.42, z.radius * 0.64).fill({
            color: z.color,
            alpha: 0.92 * a,
          });
          g.circle(z.x, z.y + z.radius * 0.42, z.radius * 0.64).fill({
            color: 0xffffff,
            alpha: 0.92 * a,
          });
          g.circle(z.x, z.y, z.radius).stroke({ width: 1.5, color: 0xffffff, alpha: 0.35 * a });
          break;
        }
      }
    }
  }

  /**
   * Spell-card circle and ground shadow behind the boss, straight from the
   * vendored Taisei pack. The circle spins faster while a spell card is live,
   * which is the visual cue players read as "card active".
   */
  /**
   * Retail boss gauge (Gui::DrawBossGauge): a shaded 320x4 track at (64,19),
   * one coloured slice per remaining life bar, a 26px life-pip row to its left
   * and the two-digit spell-card timer at (384,16), all faded by bossUIOpacity.
   */
  private drawBossGauge(boss: BossGaugeState): void {
    const g = this.bossGaugeGraphics;
    g.clear();
    const opacity = boss.gaugeOpacity;
    if (opacity <= 0) {
      this.bossTimerText.visible = false;
      return;
    }
    const height = BOSS_GAUGE.height;
    const half = height / 2;
    // DrawSquareShaded is a top-lit quad, so split every rect into a bright
    // upper band and its quarter-bright underside.
    const shade = (rect: GaugeRect) => {
      if (rect.width <= 0) return;
      g.rect(rect.x, rect.y, rect.width, half).fill({ color: rect.color, alpha: opacity });
      g.rect(rect.x, rect.y + half, rect.width, height - half).fill({ color: rect.shade, alpha: opacity });
    };
    // Empty-slot outline stands in for the retail gauge frame sprite.
    g.rect(BOSS_GAUGE.left, BOSS_GAUGE.top, BOSS_GAUGE.width, height).stroke({
      width: 1,
      color: BOSS_GAUGE_TRACK_DARK,
      alpha: opacity * 0.9,
    });
    shade(gaugeTrack(boss.gaugeDisplayRatio));
    for (const segment of gaugeSlices(boss.lifeBars, boss.gaugeDisplayRatio, boss.isSpellCardActive)) {
      shade(segment);
    }
    for (const pip of gaugePips(boss.remainingBars)) {
      shade(pip);
    }
    const timer = gaugeTimerText(boss.spellcardSecondsRemaining);
    this.bossTimerText.visible = boss.isSpellCardActive && timer.text !== '00';
    this.bossTimerText.text = timer.text;
    this.bossTimerText.style.fill = timer.color;
    this.bossTimerText.alpha = opacity;
  }

  private drawBossAura(x: number, y: number, alpha: number, spellActive: boolean, tint: number): void {
    this.spellCircleAngle += spellActive ? 0.014 : 0.004;
    const circle = this.assets.get(spellActive ? 'taisei:huge:boss_spellcircle0' : 'taisei:huge:boss_circle');
    if (circle) {
      const span = spellActive ? 250 : 190;
      this.spellCircle.visible = true;
      this.spellCircle.texture = circle;
      this.spellCircle.position.set(x, y);
      this.spellCircle.rotation = this.spellCircleAngle * (spellActive ? 1 : -1);
      this.spellCircle.alpha = (spellActive ? 0.85 : 0.4) * alpha;
      this.spellCircle.tint = spellActive ? tint : 0xffffff;
      this.spellCircle.blendMode = 'add';
      this.spellCircle.scale.set(span / Math.max(1, circle.width));
    } else {
      this.spellCircle.visible = false;
    }
    // Upstream draws boss_shadow as a soft halo behind the sprite, so it sits
    // larger than the character and well below full opacity; centred on the hitbox
    // it reads as a bubble instead.
    const halo = this.assets.get('taisei:part:boss_shadow');
    if (halo) {
      this.bossShadow.visible = true;
      this.bossShadow.texture = halo;
      this.bossShadow.position.set(x, y - 10);
      this.bossShadow.alpha = (spellActive ? 0.34 : 0.2) * alpha;
      this.bossShadow.blendMode = 'add';
      this.bossShadow.tint = tint;
      // Size off the height: the art is a tall arch, so a width-based fit
      // stretches it into a balloon.
      this.bossShadow.scale.set(BOSS_HALO_SPAN / Math.max(1, halo.height));
    } else {
      this.bossShadow.visible = false;
    }
  }

  /**
   * Lives and bombs as real heart/star art instead of the text glyph, falling
   * back to the star character when the vendored pack is missing.
   */
  private drawHudIcons(lives: number, bombs: number, rowY: (i: number) => number): void {
    const heart = this.assets.get('taisei:ui:heart');
    const star = this.assets.get('taisei:ui:star');
    this.hudIcons.begin();
    if (heart && star) {
      const startX = this.rightPanelX + 62;
      for (let i = 0; i < Math.min(8, Math.max(0, lives)); i++) {
        this.hudIcons.draw({ texture: heart, x: startX + i * 15, y: rowY(2) + 8, width: 13 });
      }
      for (let i = 0; i < Math.min(8, Math.max(0, bombs)); i++) {
        this.hudIcons.draw({ texture: star, x: startX + i * 15, y: rowY(3) + 8, width: 13 });
      }
    }
    this.hudIcons.end();
  }

  /**
   * True when the original panel sheets are live. The digit '0' is the probe: the
   * registration pass slices the whole font in one go, so one glyph standing for all
   * of them is a fair bet, and it keeps the monospace read-out on screens that were
   * started without the asset pack.
   */
  private usingBitmapHud(): boolean {
    if (!this.hudArtReady) this.hudArtReady = Boolean(this.assets.get(HUD_ART_PROBE));
    return this.hudArtReady;
  }

  /** Blit `text` in the retail 16x16 font from (x, y) and return the advance. */
  private drawHudText(
    text: string,
    x: number,
    y: number,
    scale = 1,
    align: 'left' | 'right' = 'left',
    options: { advance?: number; tint?: number; alpha?: number } = {},
  ): number {
    const advance = options.advance ?? HUD_TEXT_ADVANCE;
    const width = text.length * advance * scale;
    let cursor = align === 'right' ? x - width : x;
    for (const char of text) {
      // `ascii.anm` carries the whole 0x20..0x7F run, so the literal code point is
      // what retail blits. The old `toUpperCase()` used to stand in for a missing
      // font; it also turned "Full Power Mode!" into a shout, which retail never does.
      const texture = this.assets.get(hudGlyphKey(char.charCodeAt(0)));
      if (texture) {
        this.hudBitmap.draw({
          texture,
          x: cursor,
          y,
          width: 16 * scale,
          height: 16 * scale,
          alpha: options.alpha ?? 1,
          tint: options.tint ?? 0xffffff,
          ...HUD_TOP_LEFT,
        });
      }
      cursor += advance * scale;
    }
    return width;
  }

  /**
   * `AsciiManager::DrawPopups`. Each pickup is a run of 8x8 digit cells, centred on the
   * spawn point: retail offsets the run by `4 * digitCount` and then advances eight
   * pixels per character, printing the most significant digit first.
   */
  private drawScorePopups(popups: ReadonlyArray<ScorePopupView> | undefined): void {
    const layer = this.hudPopups;
    layer.begin();
    if (popups) {
      for (const popup of popups) {
        const count = popup.digits.length;
        if (!count) continue;
        const scale = popup.scale > 0 ? popup.scale : 1;
        let x = popup.x - (HUD_POPUP_ADVANCE * scale * count) / 2;
        for (let i = count - 1; i >= 0; i--) {
          const texture = this.assets.get(hudPopupKey(popupCell(popup.digits[i], popup.bank)));
          if (texture) {
            layer.draw({
              texture,
              x,
              y: popup.y,
              width: 8 * scale,
              height: 8 * scale,
              alpha: popup.alpha,
              tint: popup.color & 0xffffff,
              ...HUD_TOP_LEFT,
            });
          }
          x += HUD_POPUP_ADVANCE * scale;
        }
      }
    }
    layer.end();
  }

  /**
   * The whole right panel, drawn the way retail draws it.
   *
   * Order matters and mirrors `Gui::DrawGameScene`: backdrop tiles, then the top and
   * bottom border strips, then the 永夜抄 plate, then the eight labels, then their
   * values. The 妖率計 belongs to this layer too because it overlaps the playfield's
   * bottom-left corner rather than sitting in the panel.
   */
  private drawBitmapHud(hud: HUD, meter: number | undefined, banners?: ReadonlyArray<HudBannerView>): void {
    const layer = this.hudBitmap;
    layer.begin();

    for (const text of [
      this.scoreText,
      this.hiScoreText,
      this.livesText,
      this.bombsText,
      this.powerText,
      this.grazeText,
      this.stageText,
      this.timeText,
      this.memberText,
    ]) {
      text.visible = false;
    }
    this.hudIcons.begin();
    this.hudIcons.end();

    const tile = this.assets.get(hudPlateKey('tile'));
    if (tile) {
      // `Gui.cpp:1357-1369`: the left gutter tiles the full height, the panel grid
      // starts under the top border and stops one tile short of the right edge.
      for (let y = 0; y < CANVAS_H - HUD_BORDER_STRIP.h; y += HUD_TILE) {
        layer.draw({ texture: tile, x: 0, y, ...HUD_TOP_LEFT });
      }
      for (let x = HUD_PANEL_TILE_X; x < CANVAS_W - HUD_TILE / 2; x += HUD_TILE) {
        for (let y = HUD_BORDER_STRIP.h; y < CANVAS_H - HUD_BORDER_STRIP.h; y += HUD_TILE) {
          layer.draw({ texture: tile, x, y, ...HUD_TOP_LEFT });
        }
      }
    }
    const border = this.assets.get(hudPlateKey('border'));
    if (border) {
      for (let x = 0; x < CANVAS_W - HUD_BORDER_STRIP.w / 2; x += HUD_BORDER_STRIP.w) {
        layer.draw({ texture: border, x, y: 0, ...HUD_TOP_LEFT });
        layer.draw({ texture: border, x, y: CANVAS_H - HUD_BORDER_STRIP.h, ...HUD_TOP_LEFT });
      }
    }
    const plate = this.assets.get(hudPlateKey('panel'));
    if (plate) layer.draw({ texture: plate, x: HUD_LOGO.x, y: HUD_LOGO.y, ...HUD_TOP_LEFT });

    for (const label of ['hiscore', 'score', 'player', 'spell', 'power', 'graze', 'point', 'time']) {
      const texture = this.assets.get(hudLabelKey(label));
      const row = HUD_ROWS[label as keyof typeof HUD_ROWS];
      if (texture) layer.draw({ texture, x: HUD_LABEL_X, y: row, ...HUD_TOP_LEFT });
    }

    this.drawHudText(hud.formattedHiScore, HUD_VALUE_X, HUD_ROWS.hiscore);
    this.drawHudText(hud.formattedScore, HUD_VALUE_X, HUD_ROWS.score);

    const lifePip = this.assets.get(hudPipKey('life'));
    if (lifePip) {
      for (let i = 0; i < Math.max(0, hud.lives); i++) {
        layer.draw({
          texture: lifePip,
          x: HUD_VALUE_X + i * HUD_PIP_STEP,
          y: HUD_ROWS.player,
          ...HUD_TOP_LEFT,
        });
      }
    }
    const bombPip = this.assets.get(hudPipKey('bomb'));
    if (bombPip) {
      for (let i = 0; i < Math.max(0, hud.bombs); i++) {
        layer.draw({
          texture: bombPip,
          x: HUD_VALUE_X + i * HUD_PIP_STEP,
          y: HUD_ROWS.spell,
          ...HUD_TOP_LEFT,
        });
      }
    }

    // Power: one pixel of width per point, shaded from alpha 0xe0 at the left edge to
    // 0x80 at the tip (`Gui.cpp:1478-1500` builds it as a two-vertex gradient). The
    // number -- or MAX once the bar is full -- prints over it.
    this.powerBar.clear();
    if (hud.power > 0) {
      const steps = Math.min(8, Math.max(1, Math.round(hud.power / 8)));
      const step = hud.power / steps;
      for (let i = 0; i < steps; i++) {
        const t = steps === 1 ? 0 : i / (steps - 1);
        this.powerBar
          .rect(HUD_POWER_BAR.x + i * step, HUD_POWER_BAR.y, step + 0.5, HUD_POWER_BAR.h)
          .fill({ color: 0xe0e0ff, alpha: 0.875 - 0.375 * t });
      }
    }
    /*
     * `Gui.cpp:1512-1519`: the power read-out is a `%d` below 128 and the word MAX at
     * 128 -- both branches print, at the same (488, 136). Dropping the else arm made a
     * maxed-out run look like the HUD had lost its power row entirely.
     */
    this.drawHudText(hud.power < hud.maxPower ? String(hud.power) : 'MAX', HUD_VALUE_X, HUD_ROWS.power);

    this.drawHudText(String(hud.graze), HUD_VALUE_X, HUD_ROWS.graze);
    this.drawPointRow(String(hud.pointItems), String(hud.nextPointExtend), HUD_ROWS.point);
    /*
     * `Gui.cpp:1462-1471`: the Time row is `currentTimeOrbs / lastSpellTimeOrbThreshold`,
     * and retail's `SetColor(0xfffff0c0)` covers the whole row -- both numbers *and* the
     * slash between them -- from the frame the orbs on hand can pay for a Last Spell, back
     * to white on the way out. That right-hand number is
     * `g_TimeRequirementParams[stage][difficulty]` (`GameManager.cpp:46-57`), which the
     * stage setup now loads, so this is retail's own row. A host that models no threshold
     * (`null`) keeps the older substitution -- run-lifetime count, untinted -- because
     * lighting the row on a stand-in would make it read as retail for a reason retail
     * never does.
     */
    if (hud.timeOrbThreshold === null) {
      this.drawPointRow(String(hud.timeOrbs), String(hud.timeOrbTotal), HUD_ROWS.time);
    } else {
      const paid = hud.timeOrbs >= hud.timeOrbThreshold;
      this.drawPointRow(
        String(hud.timeOrbs),
        String(hud.timeOrbThreshold),
        HUD_ROWS.time,
        paid ? HUD_TIME_ROW_PAID : undefined,
      );
    }

    // The difficulty badge closes the panel (`ascii.anm` script 25 at (552, 200)).
    // Retail prints nothing else here: the 永夜抄 plate owns the rest of the panel,
    // and the stage name rides the entrance banner instead.
    const difficulty = this.assets.get(hudBadgeKey(hud.difficulty));
    if (difficulty) {
      layer.draw({
        texture: difficulty,
        x: HUD_DIFFICULTY_BADGE.x,
        y: HUD_DIFFICULTY_BADGE.y,
        ...HUD_TOP_LEFT,
      });
    }

    this.drawYoukaiGauge(meter);
    this.drawGuiBanners(banners);
    layer.end();
  }

  /**
   * `Gui.cpp:2075-2138`: the two panel text slots, blit last so a banner can
   * cross from the panel over the playfield without either clipping it.
   */
  private drawGuiBanners(banners: ReadonlyArray<HudBannerView> | undefined): void {
    if (!banners) return;
    for (const banner of banners) {
      this.drawHudText(banner.text, banner.x, banner.y, banner.scale, 'left', {
        advance: banner.advance,
        tint: banner.color & 0xffffff,
        alpha: banner.alpha,
      });
    }
  }

  /**
   * Point/Time rows: `count`, a half-width slash, then the extend threshold. The tint is
   * retail's whole-row `SetColor`, so it has to cover the slash as well as the digits.
   */
  private drawPointRow(count: string, limit: string, y: number, tint?: number): void {
    const advance = this.drawHudText(count, HUD_VALUE_X, y, 1, 'left', { tint });
    const slashX = HUD_VALUE_X + advance;
    const slash = this.assets.get(hudGlyphKey(0x2f));
    if (slash) {
      this.hudBitmap.draw({
        texture: slash,
        x: slashX,
        y,
        width: 8,
        height: 16,
        tint: tint ?? 0xffffff,
        ...HUD_TOP_LEFT,
      });
    }
    this.drawHudText(limit, slashX + 8 + 6, y, 1, 'left', { tint });
  }

  /**
   * The 夜時計. Midnight has the hand pointing down and dawn brings it back to
   * the top, one full turn for the 12 steps `GetClockTime()` counts, so the
   * remaining night is readable as the arc still to run -- which is the same
   * quantity the `2000000 * (12 - clock)` bonus is paid on.
   *
   * The retail art for the dial never reached the vendored pack and no
   * decompiled function draws it, so this is vector art in the panel's own
   * colours. `hud:clock:dial` lets a real sheet take it over unchanged.
   */
  private drawNightClock(clock: number, labelWithFont = true): void {
    const { x, y, r } = HUD_NIGHT_CLOCK;
    const hand = nightClockAngle(clock);
    const dial = this.assets.get('hud:clock:dial');
    // Both vector layers are persistent display objects, so each one has to be
    // cleared even on the frame the other is standing in for.
    this.nightClockFace.clear();
    if (dial) {
      this.hudBitmap.draw({
        texture: dial,
        x: x - r,
        y: y - r,
        width: r * 2,
        height: r * 2,
        ...HUD_TOP_LEFT,
      });
    } else {
      this.nightClockFace
        .circle(x, y, r)
        .fill({ color: 0x101018, alpha: 0.72 })
        .stroke({ width: 2, color: 0xc8b46a, alpha: 0.9 });
      // Hour marks are the even steps; the half-hour ticks stay thin so the six
      // hours of the night read at a glance.
      for (let step = 0; step < NIGHT_CLOCK_SPAN; step++) {
        const a = nightClockAngle(step);
        const long = step % 2 === 0;
        const inner = r - (long ? 9 : 5);
        this.nightClockFace
          .moveTo(x + Math.sin(a) * inner, y - Math.cos(a) * inner)
          .lineTo(x + Math.sin(a) * r, y - Math.cos(a) * r)
          .stroke({ width: long ? 2 : 1, color: 0xc8b46a, alpha: long ? 0.95 : 0.55 });
      }
    }
    // Dawn closes the night: the whole dial goes gold for the last reading.
    const atDawn = clock >= NIGHT_CLOCK_SPAN;
    this.nightClockHand
      .clear()
      .moveTo(x - Math.sin(hand) * 5, y + Math.cos(hand) * 5)
      .lineTo(x + Math.sin(hand) * (r - 6), y - Math.cos(hand) * (r - 6))
      .stroke({ width: 2.5, color: atDawn ? 0xffd24a : 0xf0f0ff, alpha: 0.95 });
    if (labelWithFont) this.drawHudText(nightClockLabel(clock), x - 20, y + r + 4);
  }

  /**
   * The 妖率計 at the bottom of the playfield: the ornate 128x16 track, the 人 and 妖
   * limit icons at its stops, and the cursor between them (`AsciiManager.cpp:280-289`
   * runs `ascii.anm` scripts 5..8 to place exactly these four pieces).
   */
  private drawYoukaiGauge(meter: number | undefined): void {
    if (meter === undefined) return;
    const track = this.assets.get(hudGaugeKey('track'));
    if (!track) return;
    const layer = this.hudBitmap;
    layer.draw({ texture: track, x: HUD_GAUGE.x, y: HUD_GAUGE.y, ...HUD_TOP_LEFT });

    // The 人/妖 stops sit at the two ends of the track at full limits and creep
    // inward for a solo character (`AsciiManager.cpp:287-288`).
    const human = this.assets.get(hudGaugeKey('human'));
    if (human) {
      layer.draw({
        texture: human,
        x: HUD_GAUGE.x,
        y: HUD_GAUGE.y,
        width: HUD_GAUGE.iconSize,
        height: HUD_GAUGE.iconSize,
        ...HUD_TOP_LEFT,
      });
    }
    const youkai = this.assets.get(hudGaugeKey('youkai'));
    if (youkai) {
      layer.draw({
        texture: youkai,
        x: HUD_GAUGE.x + HUD_GAUGE.w - HUD_GAUGE.iconSize,
        y: HUD_GAUGE.y,
        width: HUD_GAUGE.iconSize,
        height: HUD_GAUGE.iconSize,
        ...HUD_TOP_LEFT,
      });
    }
    const cursor = this.assets.get(hudGaugeKey('cursor'));
    const centre = HUD_GAUGE.x + HUD_GAUGE.w / 2;
    const pos = centre + (Math.max(0, Math.min(1, meter)) - 0.5) * HUD_GAUGE.span * 2;
    if (cursor) {
      layer.draw({
        texture: cursor,
        x: pos - HUD_GAUGE.cursorW / 2,
        y: HUD_GAUGE.cursorY,
        width: HUD_GAUGE.cursorW,
        height: HUD_GAUGE.cursorH,
        ...HUD_TOP_LEFT,
      });
    }
  }

  /** Queue a one-shot effect sprite for the next frame. */
  spawnEffect(
    texture: string,
    x: number,
    y: number,
    size = 64,
    alpha = 1,
    rotation = 0,
    tint?: number,
    additive = false,
  ): void {
    this.pendingFx.push({ texture, x, y, size, alpha, rotation, tint, additive });
  }

  /**
   * Queue a one-shot sprite at its own rectangular footprint.
   *
   * The retail effect pool blits ANM atlas cells, and those cells are rectangles: a needle
   * is 8x32 and a scale is 24x16, so forcing one size for both axes stretches the art.
   */
  spawnEffectRect(
    texture: string,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha = 1,
    rotation = 0,
    tint?: number,
    additive = false,
    flipX = false,
  ): void {
    this.pendingFx.push({
      texture,
      x,
      y,
      size: width,
      width,
      height,
      alpha,
      rotation,
      tint,
      additive,
      flipX,
    });
  }

  /**
   * Trigger the full-screen bomb flash. `accent` is the card's own colour, so
   * the flash separates 霊夢's pink from 魔理沙's gold the way the retail
   * spell art does.
   */
  triggerBombFlash(accent = 0xffffff): void {
    this.bombFlash = 18;
    this.bombFlashTint = accent;
  }

  /** Colour the running bomb flash is using, or `null` when nothing is flashing. */
  get bombFlashColor(): number | null {
    return this.bombFlash > 0 ? this.bombFlashTint : null;
  }

  /**
   * Take the ship's 判定点光环 for this frame, or null when the script has none live.
   *
   * Called once per frame by the game layer out of the effect pool, before `render`.
   * Holding it here rather than pushing it through the ordinary effect batch is the only
   * liberty taken, and it is a layering one: the batch composites under the ship sprite,
   * and retail's ring is unmistakably drawn over the ship's own art.
   */
  setHitboxGlow(glow: HitboxGlow | null): void {
    this.hitboxGlow = glow;
  }

  /**
   * Wash the whole picture into `color` over `frames` frames.
   *
   * `Gui.cpp:876-879` asks for exactly this from stage message op 14:
   * `ScreenEffect::RegisterChain(FULL_FADE_OUT, 442, 0xffffff, 0, 0, 21)`. The
   * ramp is linear because `ScreenEffect.cpp` is not in the decompilation, and a
   * linear climb is the only reading of `CalcFadeOut`/`DrawFullFade` that reaches
   * full coverage exactly when the countdown does.
   */
  startScreenFade(frames: number, color = 0xffffff): void {
    this.screenFadeFrames = Math.max(0, Math.round(frames));
    this.screenFadeTotal = this.screenFadeFrames;
    this.screenFadeTint = color;
  }

  /** Coverage of the running screen fade, 0 (nothing) to 1 (solid). */
  get screenFadeAlpha(): number {
    if (this.screenFadeTotal <= 0) return 0;
    return 1 - this.screenFadeFrames / this.screenFadeTotal;
  }

  /** Frames left on the screen fade, for a browser pass to read. */
  get screenFadeRemaining(): number {
    return this.screenFadeFrames;
  }

  /** Cancel a fade that is still running, e.g. when a run leaves the stage. */
  clearScreenFade(): void {
    this.screenFadeFrames = 0;
    this.screenFadeTotal = 0;
  }

  /**
   * Register an animated sprite sheet under a logical slot name. Slots are
   * 'player:<characterId>', 'enemy:<spriteKey>' and 'boss:<spriteKey>'; the game
   * layer fills them from the vendored Taisei atlases so the engine stays
   * title-agnostic.
   */
  registerSheet(slot: string, sheet: AnimatedSheet): void {
    this.sheets.set(slot, sheet);
    this.brokenSheets.delete(slot);
  }

  /** Which sheet slot a sprite is currently animating, if any (used by tests and the debug overlay). */
  sheetState(sprite: Sprite): { slot: string; group: string; frame: number; flipped: boolean } | null {
    const slot = this.lastSlot.get(sprite);
    if (!slot) return null;
    const anim = this.anims.get(sprite)?.get(slot);
    if (!anim) return null;
    return {
      slot,
      group: anim.player.currentGroup,
      frame: anim.player.frameIndex,
      flipped: anim.player.flipped,
    };
  }

  /** True when a slot has a real animated sheet registered. */
  hasSheet(slot: string): boolean {
    return this.sheets.has(slot) && !this.brokenSheets.has(slot);
  }

  /**
   * Point a sprite at the next frame of its sheet. Taisei bakes the bank into
   * the lean frames and mirrors them for the opposite direction, so the only
   * rotation here is the one the caller asks for. Returns false when the slot is
   * unknown, letting callers fall back to the procedural painter.
   */
  private drawSheet(
    slot: string,
    sprite: Sprite,
    x: number,
    y: number,
    alpha: number,
    dirX = 0,
    rotation = 0,
    fitWidth = 0,
  ): boolean {
    const sheet = this.sheets.get(slot);
    if (!sheet || this.brokenSheets.has(slot)) return false;
    let bySlot = this.anims.get(sprite);
    if (!bySlot) {
      bySlot = new Map();
      this.anims.set(sprite, bySlot);
    }
    let anim = bySlot.get(slot);
    if (!anim || anim.sheet !== sheet) {
      anim = { sheet, player: new TaiseiAnimPlayer(sheet.anim) };
      bySlot.set(slot, anim);
    }
    this.lastSlot.set(sprite, slot);
    // Only the ship owns a 低速 stance; every other sheet keeps its one pose set.
    if (sprite === this.playerSprite) anim.player.setPose(this.playerPose);
    if (sheet.steer) anim.player.setDirection(dirX, sheet.deadZone ?? 0.2);
    anim.player.update(1);
    if (sprite === this.playerSprite) {
      this.playerAnimDebug =
        slot +
        ' ' +
        anim.player.currentGroup +
        '#' +
        anim.player.frameIndex +
        ' dir=' +
        dirX.toFixed(2) +
        ' pose=' +
        this.playerPose;
    }
    const texture = this.assets.get(sheet.frameKey(anim.player.frameIndex));
    if (!texture) {
      // A missing frame is a registration bug, not a per-frame accident. Retire
      // the slot so the fallback art renders consistently instead of the two
      // sheets fighting over one sprite.
      this.brokenSheets.add(slot);
      return false;
    }
    // 'fit' sheets are our own art, so match the static path and size them off the
    // hitbox instead of a fixed factor; upstream art keeps its authored scale.
    const scale =
      sheet.fit && fitWidth > 0 ? fitWidth / Math.max(1, texture.width) : (sheet.scale ?? TAISEI_SCALE);
    sprite.visible = true;
    sprite.texture = texture;
    sprite.position.set(x, y);
    sprite.rotation = rotation;
    sprite.alpha = alpha;
    sprite.scale.set(anim.player.flipped ? -scale : scale, scale);
    return true;
  }
  /**
   * Draw one team member. The registered sheet wins (real Taisei frames for
   * Reimu/Marisa/Youmu, our own idle loop for the rest); the static still is the
   * fallback. Returns false when nothing matched so callers can paint a shape.
   */
  private drawMember(
    sprite: Sprite,
    memberId: string,
    x: number,
    y: number,
    alpha: number,
    dirX = 0,
    sizeScale = 1,
    portrait = false,
  ): boolean {
    // 'painted' routes every member through our own loop so a focus switch never
    // jumps between two art styles; 'taisei' takes upstream art where it exists.
    const base = this.playerSkin === 'painted' ? 'player-painted:' : 'player:';
    // The resting half of the team is drawn from its standing figure when the pack
    // ships one (`playerNN` ids after the two stance banks), not from the flying
    // sprite, which is authored top-down and reads as a smudge at panel size.
    const slots = portrait
      ? ['player-portrait:' + memberId, base + memberId, 'player-painted:' + memberId]
      : [base + memberId, 'player-painted:' + memberId];
    for (const slot of new Set(slots)) {
      if (this.drawSheet(slot, sprite, x, y, alpha, dirX)) {
        if (sizeScale !== 1) sprite.scale.set(sprite.scale.x * sizeScale, sprite.scale.y * sizeScale);
        return true;
      }
    }
    const still = 'player:' + memberId;
    const texture =
      this.playerSkin === 'taisei'
        ? (this.assets.get('player-taisei:' + memberId) ?? this.assets.get(still))
        : (this.assets.get(still) ?? this.assets.get('player-taisei:' + memberId));
    if (!texture) {
      if (sprite === this.playerSprite) this.drawMemberFallback(x, y, alpha);
      return false;
    }
    if (sprite === this.playerSprite) {
      const lean = Math.max(-1, Math.min(1, dirX));
      this.playerLean += (lean - this.playerLean) * 0.22;
      sprite.rotation = this.playerLean * PLAYER_MAX_LEAN;
      sprite.position.set(x, y + Math.abs(this.playerLean) * 1.6);
    } else {
      sprite.rotation = 0;
      sprite.position.set(x, y);
    }
    sprite.visible = true;
    sprite.texture = texture;
    sprite.alpha = alpha;
    sprite.scale.set((this.playerScale / Math.max(1, texture.width)) * sizeScale);
    return true;
  }

  /**
   * The 永夜抄 status block: the standing-down member as a panel portrait, plus
   * the human/youkai meter under it. The meter is centred, because retail parks
   * neutral in the middle and slides the cursor left for 人 and right for 妖
   * (`AsciiManager.cpp:1764-1813`).
   */
  private drawTeamStatus(player: Player, meter: number | undefined): void {
    this.partnerSprite.visible = false;
    // In the bitmap panel the plate owns x >= 480, so the portrait rides in the
    // 64-pixel gutter between the playfield and it. Without the plate there is room
    // anywhere, and the old spot keeps the fallback layout unchanged.
    const bitmap = this.usingBitmapHud();
    const portraitX = bitmap ? HUD_PANEL_TILE_X + 2 : this.rightPanelX + 16;
    const portraitY = bitmap ? 210 : 250;
    // `Gui::DrawGameScene` never puts a portrait in the panel -- the 永夜抄 plate owns
    // that space -- so the partner only shows on screens without the original art.
    if (!bitmap && player.isAlive && player.partner) {
      this.drawMember(
        this.partnerSprite,
        player.partner.id,
        portraitX,
        portraitY,
        1,
        0,
        PORTRAIT_SCALE,
        true,
      );
    }
    if (meter === undefined) return;
    // The original 妖率計 art replaces every rect below it; drawing both would put a
    // procedural bar on top of the retail track.
    if (bitmap) {
      this.statusGraphics.clear();
      return;
    }
    // Retail parks neutral in the middle and paints outwards toward 人 or 妖, with
    // the end labels outside the track (`AsciiManager.cpp:1764-1813`).
    const barX = this.rightPanelX + 26;
    const barW = 128;
    const barY = 300;
    const centre = barX + barW / 2;
    const pos = barX + barW * Math.max(0, Math.min(1, meter));
    const g = this.statusGraphics;
    g.rect(barX, barY - 5, barW, 10).fill({ color: 0x14101c, alpha: 0.75 });
    g.rect(Math.min(centre, pos), barY - 4, Math.abs(pos - centre), 8).fill({
      color: meter >= 0.5 ? 0xff4d6d : 0x7fd3ff,
      alpha: 0.9,
    });
    g.rect(pos - 1, barY - 8, 2, 16).fill({ color: 0xffffff, alpha: 0.95 });
    g.rect(barX, barY - 5, barW, 10).stroke({ width: 1, color: 0x8a7fb8, alpha: 0.8 });
    // Extreme states are worth a readable cue: the shell lights up at either stop.
    if (this.extremeMeter(meter)) {
      g.rect(barX - 2, barY - 7, barW + 4, 14).stroke({
        width: 1.5,
        color: meter >= 0.5 ? 0xffd166 : 0x9be7ff,
        alpha: 0.85,
      });
    }
    g.rect(barX - 12, barY - 6, 9, 12).fill({ color: 0x7fd3ff, alpha: 0.5 });
    g.rect(barX + barW + 3, barY - 6, 9, 12).fill({ color: 0xff4d6d, alpha: 0.5 });
  }

  /** True when the meter sits in one of the two extreme wells. */
  private extremeMeter(meter: number): boolean {
    return meter <= 0.1 || meter >= 0.9;
  }

  /** Last-resort silhouette so the ship is never invisible if art is missing. */
  private drawMemberFallback(x: number, y: number, alpha: number): void {
    this.playerLean = 0;
    const body = 0xc41e3a;
    const accent = 0xfff0e6;
    this.entityGraphics.circle(x, y - 4, 8).fill({ color: accent, alpha });
    this.entityGraphics
      .poly([
        { x, y: y - 4 },
        { x: x - 12, y: y + 14 },
        { x: x + 12, y: y + 14 },
      ])
      .fill({ color: body, alpha });
    this.entityGraphics.rect(x - 10, y - 10, 20, 6).fill({ color: body, alpha });
  }
  /** 'taisei' prefers upstream animation; 'painted' forces one in-house look. */

  setPlayerSkin(skin: 'taisei' | 'painted'): void {
    this.playerSkin = skin;
  }

  /** Which ship animation the last rendered frame settled on (dev mirror only). */
  get playerAnimState(): string {
    return this.playerAnimDebug;
  }

  /**
   * `[held, drawn]` entity sprite counts for one kind, from the last frame.
   *
   * The sprite maps are keyed by the entity object, so a picture only leaves when
   * its owner stops being drawn -- which is exactly the "killed fairy left its
   * sprite on screen" bug class. Held has to equal drawn; a gap that widens over a
   * stage is a leak, not a frame of lag.
   */
  get spriteAudit(): { enemies: [number, number]; items: [number, number] } {
    return {
      enemies: [this.enemySprites.size, this.drawnEnemies],
      items: [this.itemSprites.size, this.drawnItems],
    };
  }

  /**
   * Scroll one parallax sheet across the playfield.
   *
   * Night lighting is a multiply rather than a fade: alpha let the backdrop fill
   * bleed through the sheet and turned the art to mud. Because opaque tiles are
   * idempotent under normal blending, the rows can overlap by a couple of pixels
   * to hide filtering gaps without leaving a bright band behind.
   *
   * Every other tile is mirrored. The retail sheets are painted backdrops, not
   * authored tileables, so a plain repeat puts the sheet's bottom edge against its
   * own top edge and draws a hard line straight across the stage. Mirroring makes
   * the wrap edge continuous (same pixels meet) and doubles the visible period,
   * which is the difference between "scrolling scene" and "wallpaper".
   */
  private placeLayer(layer: SpriteLayer, texture: Texture | undefined, scroll: number, shade: number): void {
    if (!texture || !texture.width || !texture.height) {
      layer.begin();
      layer.end();
      return;
    }
    // A sheet that already covers most of the playfield is the authored backdrop
    // and stretches to fit; narrow strips repeat at native size instead of blurring.
    const scale = texture.width >= this.playfield.width / 2 ? this.playfield.width / texture.width : 1;
    const tileW = texture.width * scale;
    const tileH = texture.height * scale;
    const cols = Math.ceil(this.playfield.width / tileW);
    const overlap = Math.min(4, Math.round(2 * scale));
    const step = Math.max(1, tileH - overlap);
    const rows = Math.ceil(this.playfield.height / step) + 1;
    const offset = ((scroll % step) + step) % step;
    const tint = shadeColor(shade);
    layer.begin();
    // Bottom tile first: the sheet's own top edge is the one that loses a texel to
    // the fractional scale, so each tile has to be overpainted by the one above it.
    for (let row = rows; row >= -1; row--) {
      for (let col = 0; col < cols; col++) {
        const mirrorY = Math.abs(row % 2) === 1;
        const mirrorX = Math.abs(col % 2) === 1;
        const s = layer.acquire();
        s.visible = true;
        s.anchor.set(0, 0);
        s.texture = texture;
        // A negative scale grows up/left from the origin, so a mirrored tile is
        // anchored at the far edge of the band it is meant to fill.
        s.position.set(
          col * tileW + (mirrorX ? tileW : 0),
          row * step + offset - tileH + (mirrorY ? tileH : 0),
        );
        s.alpha = 1;
        s.tint = tint;
        s.scale.set(mirrorX ? -scale : scale, mirrorY ? -scale : scale);
      }
    }
    layer.end();
  }

  /**
   * The backend Pixi actually settled on, for the debug mirror. `'pending'` until
   * `init` has run; a forced `'webgl'` that fell back is visible here as `'webgpu'`.
   */
  get backend(): 'webgpu' | 'webgl' | 'other' | 'pending' {
    if (!this.app.renderer) return 'pending';
    const type = this.app.renderer.type;
    if (type & RendererType.WEBGPU) return 'webgpu';
    if (type & RendererType.WEBGL) return 'webgl';
    return 'other';
  }

  /** The backdrop layer's fog block, made on first fogged quad. */
  private fog(): FogUniforms {
    this.fogBlock ??= createFogUniforms();
    return this.fogBlock;
  }

  /**
   * Put a game-authored 3D backdrop onto the GPU.
   *
   * Each quad names a page, so the layer only goes up once every page it needs is
   * registered: a stage whose art pack is still unpacking falls back to the parallax
   * placeholder rather than showing holes in the scenery.
   */
  private drawBackdrop(view: BackdropView | undefined): boolean {
    this.backdropQuads.begin();
    this.backdropFade.clear();
    if (!view) {
      this.backdropQuads.end();
      return false;
    }
    // Publish the ramp before anything is laid down: the block is shared, so a stale
    // one would tint this frame's scenery with last frame's distance.
    if (view.quads.some((quad) => quad.depth)) applyFog(this.fog(), view.fog ?? null);
    // A page that has not been unpacked yet is the only reason to fall back: an empty
    // quad list is a real state, and is how a spell card takes the scenery off screen.
    if (view.quads.some((quad) => !this.assets.has(quad.page))) {
      this.backdropQuads.end();
      return false;
    }
    for (const quad of view.quads) {
      const texture = this.assets.get(quad.page);
      if (!texture) continue;
      this.backdropQuads.push({
        texture,
        page: quad.page,
        screen: quad.screen,
        uv: quad.uv,
        alpha: quad.alpha,
        additive: quad.additive,
        depth: quad.depth,
      });
    }
    this.backdropQuads.end();
    if ((view.fade ?? 0) > 0) {
      this.backdropFade
        .rect(0, 0, PLAYFIELD_W, PLAYFIELD_H)
        .fill({ color: 0x000000, alpha: Math.min(1, view.fade ?? 0) });
    }
    return true;
  }

  /**
   * Draw every live drop. Items pop in over their first frames and scale up to
   * their authored size, which is what sells the 'plop' of a fresh drop.
   */
  private drawItems(items: Item[]): void {
    const seen = new Set<Item>();
    for (const item of items) {
      if (!item.isAlive) continue;
      seen.add(item);
      const x = item.position.x;
      const y = item.position.y;
      const pop = Math.min(1, item.timer / 5);
      const scale = 0.72 + 0.28 * pop;
      const size = item.spec.size * scale;
      const sprite = this.itemSpriteFor(item);
      const texture = this.assets.get(item.spec.sprite);
      if (texture) {
        sprite.visible = true;
        sprite.texture = texture;
        sprite.position.set(x, y);
        sprite.alpha = item.alpha * pop;
        sprite.scale.set(size / Math.max(1, texture.width));
      } else {
        sprite.visible = false;
        this.entityGraphics
          .rect(x - size / 2, y - size / 2, size, size)
          .fill({ color: item.spec.color, alpha: item.alpha * pop });
        this.entityGraphics
          .rect(x - size / 2, y - size / 2, size, size)
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.85 * item.alpha * pop });
      }
    }
    for (const [item, sprite] of this.itemSprites) {
      if (seen.has(item)) continue;
      sprite.destroy();
      this.itemSprites.delete(item);
    }
    this.drawnItems = seen.size;
  }

  private itemSpriteFor(item: Item): Sprite {
    let sprite = this.itemSprites.get(item);
    if (!sprite) {
      sprite = new Sprite();
      sprite.anchor.set(0.5, 0.5);
      this.itemSprites.set(item, sprite);
      this.itemLayer.addChild(sprite);
    }
    return sprite;
  }

  private enemySpriteFor(enemy: Enemy): Sprite {
    let sprite = this.enemySprites.get(enemy);
    if (!sprite) {
      sprite = new Sprite();
      sprite.anchor.set(0.5, 0.5);
      this.enemySprites.set(enemy, sprite);
      this.entityLayer.addChild(sprite);
    }
    return sprite;
  }

  destroy(): void {
    this.assets.clear();
    this.app.destroy(true, { children: true, texture: true });
  }
}

/**
 * Both player skins are baked upright (tools/art/png.mjs straighten()), so the only
 * rotation the renderer applies is the lean toward the direction of travel.
 */
export const TAISEI_BASE_TILT = 0;
export const PLAYER_BASE_TILT = 0;
/**
 * A frame-animated texture set. `frameKey` maps a Taisei frame index onto the
 * asset-manifest key, `anim` carries the group table from the upstream .ani file.
 */
export interface AnimatedSheet {
  frameKey: (frame: number) => string;
  anim: TaiseiAnim;
  /** Uniform scale applied to the native texture size (defaults to TAISEI_SCALE). */
  scale?: number;
  /** Pick main/left/right from horizontal velocity. False = loop the main group. */
  steer?: boolean;
  /** Normalised |dir| below which the sprite stays upright. */
  deadZone?: number;
  /** Size the frame from the caller's fitWidth instead of a fixed scale. */
  fit?: boolean;
}

/** Matches Taisei's atlas naming: frame indices are zero padded to four digits. */
export const taiseiFrameKey =
  (namespace: string, name: string) =>
  (frame: number): string =>
    namespace + ':' + name + ':frame' + String(frame).padStart(4, '0');

/** On-screen height of the halo behind a boss, in playfield units. */
export const BOSS_HALO_SPAN = 96;
/** Default length of the boss-approach banner, in game frames. */
export const BOSS_WARNING_FRAMES = 150;
/** Frames the boss-approach banner takes to slide into place. */
export const BOSS_WARNING_SLIDE_FRAMES = 18;

/** Panel portraits are drawn a little larger than the 1:1 field art. */
export const PORTRAIT_SCALE = 1.5;
/**
 * Minimum radius of the 判定点 bead, in playfield units. The real box is smaller
 * than this for every team, so the number is a legibility floor and not a
 * measurement.
 */
export const HITBOX_DOT = 3.4;
/**
 * How far the dark pocket under the bead reaches past it, in playfield units. The
 * retail ring is red and 64 px across, so the bead needs a hole in that colour to
 * read as a point at all.
 */
export const HITBOX_BEZEL = 2.6;
/** Radial inset of the white core from the bead edge, leaving the red rim. */
export const HITBOX_CORE = 1.4;
/**
 * One frame of the ship's 判定点光环, as the effect script produced it.
 *
 * The sim owns the ring - `StageRunner` spawns template 22 on the focus edge and the ANM
 * VM runs its fade-in, spin and release fade - and the game layer hands the resulting
 * cell here instead of into the ordinary effect batch, which is composited under the
 * ship. Nothing about the picture is invented at this end: `key`, `alpha` and `rotation`
 * are read off the live view.
 */
export interface HitboxGlow {
  /** Asset key of the cell the script currently selects, e.g. `th08:bullet:etama_t1:218`. */
  key: string;
  width: number;
  height: number;
  alpha: number;
  rotation: number;
}
/** Frames the swap flourish runs; mirrors Player.switchFlash. */
const SWITCH_FLASH_FRAMES = 14;

/** Native Taisei sprites are drawn ~1.7x larger than our playfield needs. */
export const TAISEI_SCALE = 0.6;

export const PLAYER_MAX_LEAN = 0.26;

const bossColor = (boss: Boss): number =>
  (boss as Boss & { displayColor?: number }).displayColor ?? (boss.isSpellCardActive ? 0xff2255 : 0x4488ff);

const bossAccent = (boss: Boss): number => (boss as Boss & { accentColor?: number }).accentColor ?? 0xffe066;

/** A hidden-by-default sprite ready to be pointed at a texture. */
function makeSprite(anchorX = 0.5, anchorY = anchorX): Sprite {
  const sprite = new Sprite();
  sprite.anchor.set(anchorX, anchorY);
  sprite.visible = false;
  return sprite;
}

function shadeColor(shade: number): number {
  const level = Math.max(0, Math.min(1, shade)) * 0xff;
  const byte = Math.round(level);
  return (byte << 16) | (byte << 8) | byte;
}
