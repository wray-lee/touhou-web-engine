import { Player } from '../../touhou-common/player/Player';
import { BulletSystem } from '../../engine/core/BulletSystem';
import { CollisionSystem } from '../../engine/core/CollisionSystem';
import { InputSystem } from '../../engine/core/InputSystem';
import {
  PLAYFIELD_W,
  PLAYFIELD_H,
  PLAYFIELD_X,
  PLAYFIELD_Y,
  canvasToWorldX,
  canvasToWorldY,
} from '../../engine/core/PlayfieldLayout';
import { PixiRenderer } from '../../engine/renderer/PixiRenderer';
import {
  POPUP_COLOR_MAX,
  POPUP_COLOR_NORMAL,
  POPUP_COLOR_POWER_UP,
  ScorePopupSystem,
} from '../../engine/core/ScorePopupSystem';
import { AudioManager } from '../../engine/audio/AudioManager';
import { PerformanceMonitor } from '../../engine/debug/PerformanceMonitor';
import { HUD } from '../../touhou-common/ui/HUD';
import { Stage } from '../../engine/core/Stage';
import { Enemy } from '../../touhou-common/enemy/Enemy';
import { ItemSystem, ItemCollectResult, DropTier } from '../../touhou-common/item/ItemSystem';
import { Bullet } from '../../engine/core/Bullet';
import { BulletFactory } from '../../touhou-common/bullet-patterns/BulletPattern';
import { Boss } from '../../touhou-common/boss/Boss';
import { TH08_PROFILE } from './profile';
import { registerGame } from '../../touhou-common/game/registry';
import type { GameProfile, GameStageCallbacks } from '../../touhou-common/game/GameProfile';
import { registerTaiseiSheets } from './data/taisei-sheets';
import { registerTH08PlayerSprites } from './data/th08-player-registration';
import { registerTH08EnemySprites } from './data/th08-enemy-registration';
import { registerTH08BulletSprites } from './data/th08-bullet-registration';
import { TH08_ETAMA_CELLS } from './data/th08-etama-anm';
import { registerTH08Backgrounds } from './data/th08-bg-registration';
import { registerTH08HudArt } from './data/th08-hud-registration';
import { bossFaceKey, memberFaceKey, registerTH08Faces } from './data/th08-face-registration';
import { registerTH08StageTitles } from './data/th08-stgtxt-registration';
import { registerProceduralSheets } from './data/procedural-sheets';
import { DialogueSystem } from '../../touhou-common/ui/DialogueSystem';
import { HudBanners } from '../../touhou-common/ui/HudBanners';
import { dialogFaceUrl } from './data/taisei-ui';
import { TimeSystem } from './TimeSystem';
import { Leaderboard } from '../../engine/score/Leaderboard';
import { ReplayData, ReplayPlayer, ReplayRecorder } from '../../engine/replay/ReplaySystem';
import { stageSongTrack } from './StageSongs';
import { panFromPlayfieldX, RETAIL_SE_SOURCE, SE_IDX } from './data/RetailSound';
import { loadEclStage, hasEclData } from './EclStageLoader';
import type { EffectCamera } from '../../th08/sim/EffectPool';
import { StdBackground, STD_KEY_BY_ROUTE, stdClearColor, stdPages } from './StdBackground';
import type { BackdropView, LaserView } from '../../engine/renderer/PixiRenderer';
import { TH08_STD } from './data/th08-std';
import { SHOT_TYPES, type GameState } from '../../th08/sim/GameState';
import { powerLevel } from '../../th08/sim/ItemPool';
import { MOVE_BITS } from '../../th08/sim/PlayerSim';
import {
  displayStage,
  nextRoute,
  routeForDisplayStage,
  type RouteContext,
  type StageRoute,
} from './StageRoute';
import { StageProgress } from './StageProgress';
import type { StageRunner } from '../../th08/sim/StageRunner';
import { selectBomb } from '../../th08/sim/BombSystem';
import { adaptEclEnemies, adaptEclBullets, adaptEclLasers, resetEclAdapters } from './EclAdapter';
import {
  BOSS_GAUGE,
  MAX_BOSS_LIFEBAR_SEGMENTS,
  type BossGaugeState,
} from '../../touhou-common/boss/BossGauge';
import {
  CharacterId,
  Difficulty,
  getCharacterProfile,
  StageNumber,
  StageTheme,
  ASSET_MANIFEST,
  BULLET_PALETTE,
  BULLET_SHAPE_KEYS,
} from './types';
import { RetailDialogue } from './RetailDialogue';
import type { RetailDialogueHooks } from './RetailDialogue';
import type { ResultStats } from './ui/RetailResultScreen';

export interface StageClearResult {
  stage: StageNumber;
  difficulty: Difficulty;
  character: CharacterId;
  score: number;
  graze: number;
  /** Spell-card capture bonuses banked this stage. */
  spellBonus: number;
  livesLeft: number;
  bombsLeft: number;
  power: number;
  maxPower: number;
  /**
   * Run-lifetime tallies for the retail settlement panel, in the order
   * `DrawFinalStats` emits them. Built here so a headless run reports exactly
   * what the browser one would.
   */
  stats: ResultStats;
  /** True when stage 6 (the final one) was cleared. */
  campaignFinished?: boolean;
  /**
   * True when the run was a single-stage practice drill. A drill has no next
   * stage to advance to, so the results screen must not offer one; retail closes
   * it with `THANKS FOR PLAYING` and hands control back to the stage list.
   */
  practice?: boolean;
  /**
   * True when the report came from running out of lives rather than from clearing
   * the stage. The results screen has to say so: it used to print "STAGE n CLEAR"
   * over a game-over report, which read as if the run had succeeded.
   */
  gameOver?: boolean;
}

export interface TH08GameOptions {
  container?: HTMLElement;
  headless?: boolean;
  showPerformanceMonitor?: boolean;
  stage?: StageNumber;
  /** Route to open on. Wins over `stage`, which cannot name a branch. */
  route?: StageRoute;
  difficulty?: Difficulty;
  character?: CharacterId;
  timeCycleFrames?: number;
  campaign?: boolean;
  onStageClear?: (result: StageClearResult) => void;
  assetManifest?: Record<string, string>;
  /** Title to run. Defaults to TH08; register another profile to play TH06/TH07. */
  profile?: GameProfile;
  recordReplay?: boolean;
  /** Ship art style; see PlayerPrefs.PlayerSkin. Defaults to the upstream art. */
  playerSkin?: 'taisei' | 'painted';
  replayData?: ReplayData;
  leaderboard?: Leaderboard;
}

/** Retail GUI easing, reused for bosses whose life bar comes straight from ECL. */
const ECL_GAUGE_RISE = BOSS_GAUGE.riseStep;
const ECL_GAUGE_FALL = BOSS_GAUGE.fallStep;
const ECL_GAUGE_FADE = BOSS_GAUGE.opacityStep;
/**
 * Frames the card plate's pop-in animation runs for. The plate itself stays up
 * for the whole card; this only covers the slide and the portrait cut-in.
 */
const ECL_CARD_BANNER_FRAMES = 90;

/**
 * Frames the closing banner of a finished run holds before the results screen
 * takes over: `THANKS FOR PLAYING` for a practice drill, `ALL CLEAR!` for the
 * campaign. Same length as the inter-stage card so the two transitions feel alike.
 */
const CLEAR_BANNER_FRAMES = 180;

/**
 * Frames a captured card's reward animation runs before "Spell Card Bonus!" is
 * allowed on screen. `Spellcard::Update` ticks `rewardEffect` and only reaches
 * `gui_fun_00437edc(bonusAward)` at frame 130 (`Spellcard.cpp:1423-1428`); a card
 * that starts before then pays it early through the `flags` bit 8 branch at
 * `:802-807`, which is why the line never gets lost.
 */
const SPELL_BONUS_REWARD_FRAMES = 130;
/**
 * Bomb ceiling for the stage-clear payout: a Youmu/Yuyuko run only gets the free
 * 灵击 back while it is carrying fewer than this many (`Gui.cpp:858`).
 */
const STAGE_CLEAR_BOMB_PAYOUT_BELOW = 3;

export class TH08Game {
  public player: Player;
  public bulletSystem: BulletSystem;
  public collisionSystem: CollisionSystem;
  public input: InputSystem;
  public audio: AudioManager;
  public monitor: PerformanceMonitor;
  public hud: HUD;
  public stage: Stage;
  public boss: Boss | null = null;
  public enemies: Enemy[] = [];
  /** Collectible drops (P items, points, lives, bombs) using real Taisei art. */
  public itemSystem = new ItemSystem();
  public renderer?: PixiRenderer;
  public stageNumber: StageNumber;
  /**
   * Which of the nine retail stage scripts is playing. `stageNumber` is only the
   * HUD label; 4A/4B and 6A/6B share a label but not a script.
   */
  public route: StageRoute;
  public readonly difficulty: Difficulty;
  public readonly character: CharacterId;
  /** Which art the ship wears; switchable live from the options menu. */
  public playerSkin: 'taisei' | 'painted';
  public timeSystem: TimeSystem;
  public readonly replayRecorder = new ReplayRecorder();
  public readonly leaderboard: Leaderboard;
  /** Per-character clear flags, the stand-in for `score.dat`'s route fields. */
  private readonly progress = new StageProgress();
  /** Retail `numRetries`: any continue locks the campaign onto the long route. */
  private numRetries = 0;
  /**
   * Run-lifetime tallies for the retail settlement panel
   * (`ResultScreen::DrawFinalStats`). They are deliberately not per-stage: a
   * continue resets the score but retail keeps the deaths and bombs behind it,
   * and `restartStage` must not clear them either.
   */
  private numDeaths = 0;
  private numBombsUsed = 0;
  /** Simulated frames this run, the numerator retail keeps as `unk3de04`. */
  private runFrames = 0;
  /** Frames whose real interval overran the 60 Hz budget, `lagNumerator`. */
  private slowFrames = 0;

  /** Continues spent, which retail also prints as the tenth score column. */
  get retries(): number {
    return this.numRetries;
  }
  /** Route chosen at stage clear, applied when the transition finishes. */
  private pendingRoute: StageRoute | null = null;

  private isRunning = false;
  private animFrameId?: number;
  private headless: boolean;
  private bulletFactory: BulletFactory;
  /** Paused via ESC — freezes all gameplay logic while remaining renderable. */
  public isPaused = false;

  /**
   * How many simulation ticks one animation frame advances (QA only).
   *
   * A 200k-frame campaign is 55 real minutes, which is longer than a browser
   * evidence pass should take; this lets one page sit through every stage at
   * 8x without pausing or teleporting, so the seams are still the seams.
   */
  public simTicksPerFrame = 1;
  private audioUnlocked = false;
  private audioUnlockHandler?: () => void;
  private readonly onStageClear?: (result: StageClearResult) => void;
  private readonly campaign: boolean;
  private readonly assetManifest: Record<string, string>;
  /** Data contract for the running title: stages, charts and dialogue. */
  public readonly profile: GameProfile;
  private replayPlayer?: ReplayPlayer;
  private stageTransitionFrames = 0;
  /**
   * A finished run whose results screen is waiting for the closing banner to play
   * out. The results page is DOM chrome that replaces the canvas, so handing it
   * over in the same frame that queued `THANKS FOR PLAYING` meant that banner was
   * never on screen for a single frame.
   */
  private pendingClearReport: StageClearResult | null = null;
  /** Banked spell-card capture bonuses for the results screen. */
  public spellBonus = 0;
  /**
   * Which hour of the endless night the run has reached. Retail keeps this in
   * `g_GameManager.globals->clockTime`, which is allocated once per run and survives
   * every stage boundary, so the dial is run state rather than stage state. The
   * scripts toll it on the field with `clockControl` (op 181) and the stage-clear
   * message pushes it another one or two hours (`applyStageClearClock`).
   */
  public runClockTime = 0;
  /**
   * Every card the running scripts raised and how it ended, in order. Retail
   * keeps the same list per shot type in its `catkData` table; the results
   * screen and the QA probe both read this.
   */
  public readonly spellLog: { name: string; captured: boolean; bonus: number }[] = [];
  /** Notified whenever pause toggles so the host can show a pause menu. */
  public onPauseChange?: (paused: boolean) => void;
  /** How many real Taisei sprite sheets the renderer ended up with. */
  public taiseiSheets = 0;
  /** ECL-driven stage runner (null = use legacy hand-written stages). */
  public eclRunner: StageRunner | null = null;
  /**
   * The stage's own projected backdrop, rebuilt from `stageN.std`. Null until the
   * route's data is in, and stays null for a route with no authored backdrop.
   */
  private std: StdBackground | null = null;
  /** Which backdrop entry the current route maps to, `null` when it has none. */
  private stdKey: string | null = null;
  /**
   * Live ECL beams as the renderer wants them, rebuilt from the sim each frame.
   * Kept on the game because the render call reads one flat environment object.
   */
  private laserViews: LaserView[] = [];
  /**
   * Holds the shoot button down. Browsers will not let an automation context
   * synthesise a trusted key event, so a headless screenshot pass can otherwise
   * never reach the parts of the game that need firing: drops, spell timeouts,
   * score popups. Off unless `?autofire` is on the URL.
   */
  public debugAutoShoot = false;
  /**
   * Holds retail's SKIP button. A conversation then walks at one instruction per
   * frame (`Gui.cpp:373-379`), which is the only way to read a whole script in an
   * automation context that cannot synthesise key presses. Off unless the URL
   * carries `?autoskip`.
   */
  public debugAutoSkip = false;
  /**
   * Drops a card on a cadence, for the same reason as `debugAutoShoot`: an
   * automation context cannot press X, and a card's own backdrop plate and white
   * square are exactly the things that need watching on a real page rather than in
   * a unit test. Off unless `?autobomb` is on the URL.
   */
  public debugAutoBomb = false;
  /** One synthetic press, held for a couple of frames so the edge is never missed. */
  private autoBombHold = 0;
  /** Frames since the last synthetic press. */
  private autoBombClock = 0;
  /**
   * Holds the focus button down, for the same reason as `debugAutoShoot`: the hitbox
   * marker only exists in focus mode, and an automation context cannot press Shift.
   * Off unless `?slow=1` is on the URL.
   */
  public debugSlowMode = false;
  /**
   * Lets a scripted run survive being hit, for the same reason as the two above:
   * an automation context cannot dodge, so a deep link into a boss fight would
   * reach the game-over screen long before the card worth photographing. Off
   * unless `?nofail` is on the URL.
   */
  public debugNoFail = false;
  /**
   * Keeps dropping a full-power item on the ship, one every three seconds. Max power
   * is otherwise a farming result: the sweep lands once, very early, and is over in
   * 180 frames, which is not long enough for an automation context to notice it --
   * and it usually lands before the retail HUD art has even loaded, so the banner has
   * nothing to be drawn with. Inert unless `?maxpower` is on the URL.
   */
  public debugMaxPower = false;
  /**
   * Force a GPU backend, from `?renderer=webgl|webgpu`. Unset keeps Pixi's detection.
   * The backdrop's fog ships two shader languages, and this is how the WebGL half is
   * reached on a machine where WebGPU works.
   */
  public rendererBackend: 'webgl' | 'webgpu' | undefined;
  /**
   * Retail's 雾效 flag (`cfg.opts.disableFog`). Off hands the fog block a disabled
   * ramp, so every sheet draws as authored - the same thing the original does when
   * the player turns it off, not a different kind of fade.
   */
  public fogEnabled = true;
  /** Frames left until the QA full-power item drops again. */
  private debugMaxPowerCooldown = 0;
  /** Whether ECL loading is in progress. */
  private eclLoading = false;
  /** Latch so a stage can only end once, either in a clear or a game over. */
  private eclOutcome: 'run' | 'clear' | 'gameover' = 'run';
  /** Retail bossLifeBarMaxSize / bossUIOpacity easing for ECL-driven bosses. */
  private eclGaugeRatio = 0;
  private eclGaugeOpacity = 0;
  /** Power at the top of the frame, so a POWER UP can be announced once. */
  private eclPrevPower = 0;
  /**
   * Last card name the scripts declared, so op 122 raises the banner and the
   * card jingle once per card instead of once per frame.
   */
  private eclSpellName: string | null = null;
  /**
   * The floating pickup numbers. `AsciiManager::CreateScorePopup` anchors one over
   * every item as it is taken, so the sim owns the values and this owns the motion.
   */
  private readonly popups = new ScorePopupSystem();
  /** Live popup count, exposed so the DOM mirror can report it. */
  get activePopupCount(): number {
    return this.popups.activeCount;
  }
  /**
   * One entry per live popup: the bank its age selects, the opacity its distance
   * to the ship selects, and its scale flag. A screenshot cannot settle whether
   * the three-bank flicker and the distance fade actually run, because bank A and
   * bank C glyphs look alike at this size and a still frame holds one instant;
   * this reads the two channels straight out of the same `view()` call the
   * renderer consumes.
   */
  get popupDebug(): string[] {
    const runner = this.eclRunner;
    return this.popups
      .view(runner?.player.x ?? this.player.position.x, runner?.player.y ?? this.player.position.y, 0, 0)
      .map((view) => `b${view.bank} a${Math.round(view.alpha * 255)} s${view.scale} n${view.digits.length}`);
  }
  /**
   * The banner lines the HUD is being asked to draw right now, trimmed of the
   * leading spaces `%7d` pads with. QA reads this to tell "the banner never fired"
   * apart from "the banner fired and the renderer dropped it".
   */
  get bannerDebug(): string[] {
    return this.banners.views().map((view) => view.text.trim());
  }
  /**
   * The two text slots retail keeps inside `Gui`: `formatted1` slides a notice
   * across the panel ("Full Power Mode!", "Spell Bonus Failed", ...) and
   * `formatted2` centres the card reward over the playfield. The sim decides when
   * they fire, this decides how long they live.
   */
  private readonly banners = new HudBanners();
  /** The capture whose reward line is still waiting out its animation. */
  private pendingSpellBonus = 0;
  private pendingSpellBonusFrames = 0;
  /** Deferred results handoff after GAME OVER, cleared on any restart. */
  private gameOverTimer?: ReturnType<typeof setTimeout>;
  /** Animated sprite slots filled by the in-house idle loops. */
  public proceduralSheets = 0;
  /** Face pages the spell-card cut-in can ask for; 0 until the load settles. */
  public facePages = 0;
  /** Stage-side conversation box with real portraits; the script clock waits for it. */
  public dialogue?: DialogueSystem;
  private introPlayed = false;
  /**
   * A stage theme is owed as soon as the next route's script binds.
   *
   * `start()` plays slot 0 once for the run, and `RetailDialogue.bindStage()` drops
   * the song key because retail re-runs `LoadMusic` per stage
   * (`GameManager.cpp:1087-1092`). Without this the first stage's *boss* theme kept
   * running into the second stage, which is exactly what retail cannot do. The
   * request waits for the bind so `stdKey` already names the new route's std.
   */
  private pendingStageSong = false;
  /** Frame-advance explosion animations, drained by renderFrame(). */
  private explosions: { x: number; y: number; frame: number }[] = [];
  /** Taisei point-of-fade sparkles, drained by renderFrame(). */
  private pointOfFade: { x: number; y: number; frame: number }[] = [];
  /** Guards the once-only item sweep that fires when a boss is defeated. */
  private bossSweepDone = false;
  /**
   * The stage conversation, run by the decompiled message VM over real ANM
   * portraits. Null until `init` has the ANM manifest in hand.
   */
  private retail: RetailDialogue | null = null;

  constructor(options: TH08GameOptions = {}) {
    this.profile = options.profile ?? TH08_PROFILE;
    registerGame(this.profile);
    this.headless = options.headless ?? false;
    this.stageNumber = options.route ? displayStage(options.route) : (options.stage ?? 1);
    this.difficulty = options.difficulty ?? 'normal';
    this.character = options.character ?? 'reimu-yukari';
    // Field initialisers have run by now, so the saved clear flags are readable:
    // a Practice entry on stage 6 has to land on the same branch a campaign
    // would pick.
    this.route = options.route ?? routeForDisplayStage(this.stageNumber, this.routeContext());
    this.playerSkin = options.playerSkin ?? 'taisei';
    this.campaign = options.campaign ?? false;
    this.timeSystem = new TimeSystem(options.timeCycleFrames ?? this.profile.stages[0].cycleFrames);
    this.onStageClear = options.onStageClear;
    this.assetManifest = options.assetManifest ?? ASSET_MANIFEST;
    this.leaderboard = options.leaderboard ?? new Leaderboard();
    this.bulletSystem = new BulletSystem();
    // Player homing shots steer at the nearest live target, resolved once per frame.
    this.bulletSystem.homingAim = () => this.aimPoint;
    // Route every bullet creation through the object pool
    this.bulletFactory = (config) => this.bulletSystem.createBullet(config);
    this.player = new Player(
      { x: PLAYFIELD_W / 2, y: PLAYFIELD_H - 64 },
      { bulletFactory: this.bulletFactory, profile: getCharacterProfile(this.character) },
    );
    this.collisionSystem = new CollisionSystem(48);
    this.input = new InputSystem();
    this.audio = new AudioManager();
    /*
     * The sound bank is data, not code: the engine bus gets the shipped file list,
     * the per-index levels, and this game's name-to-index map. Until this runs - and
     * on any machine without the recordings - playSE stays on synthesised blips.
     */
    this.audio.configureSe(RETAIL_SE_SOURCE);
    this.monitor = new PerformanceMonitor();
    this.monitor.isVisible = options.showPerformanceMonitor ?? false;
    this.hud = new HUD();
    this.hud.setStageInfo(this.stageNumber, this.stageInfo.title, this.difficulty);
    this.hud.maxPower = this.player.maxPower;

    this.dialogue?.stop();
    this.introPlayed = false;
    this.stage = this.createStage();

    this.tryLoadEcl();
    if (options.recordReplay) this.startReplayRecording();
    if (options.replayData) this.loadReplay(options.replayData);

    this.setupListeners();
  }

  startReplayRecording(): void {
    this.replayRecorder.start({
      stage: this.stageNumber,
      difficulty: this.difficulty,
      character: this.character,
    });
  }

  stopReplayRecording(): ReplayData {
    return this.replayRecorder.stop();
  }

  loadReplay(data: ReplayData): void {
    this.replayPlayer = new ReplayPlayer(data);
  }

  /** Nearest live target for player homing shots, refreshed every frame. */
  private aimPoint: { x: number; y: number } | null = null;

  /**
   * Where a pointer device wants the ship, in world (script) coordinates, or
   * null when neither touch drag nor the mouse option is steering.
   */
  private pointerWorldTarget(): { x: number; y: number } | null {
    if (!this.input.isSteering) return null;
    const target = this.input.getPointerTarget();
    if (!target) return null;
    return {
      x: Math.max(0, Math.min(PLAYFIELD_W, canvasToWorldX(target.x))),
      y: Math.max(0, Math.min(PLAYFIELD_H, canvasToWorldY(target.y))),
    };
  }

  /** Metadata row for the stage currently loaded. */
  /** Retail shot index for this character: teams 0-3, solos 4-11. */
  private get shotType(): number {
    const index = SHOT_TYPES.indexOf(this.character as (typeof SHOT_TYPES)[number]);
    return index >= 0 ? index : 0;
  }

  /** Everything the stage router reads: the team, and how the run stands. */
  private routeContext(): RouteContext {
    const shotType = this.shotType;
    return {
      shotType,
      continued: this.numRetries > 0,
      clearedStage6A: this.progress.hasCleared('stage6a', shotType),
      clearedStage6BNoContinue: this.progress.hasClearedNoContinue('stage6b', shotType),
    };
  }

  /**
   * Fold this clear into the per-character record before routing onward, so a
   * player who finishes 6A can take the short route on their next run.
   */
  private advanceCampaign(): StageRoute | null {
    this.progress.record(this.route, this.shotType, this.numRetries > 0);
    if (!this.campaign) return null;
    return nextRoute(this.route, this.routeContext());
  }

  private get stageInfo() {
    return this.profile.stages[this.stageNumber - 1] ?? this.profile.stages[0];
  }

  private createStage(): Stage {
    // The retail backdrop belongs to the route, so it is rebuilt with the stage.
    this.setupBackdrop();
    const callbacks: GameStageCallbacks = {
      spawnEnemy: (enemy) => this.enemies.push(enemy),
      spawnBoss: (boss) => this.attachBoss(boss),
      onClear: () => this.handleStageClear(),
      showMessage: (text, frames) => this.hud.showMessage(text, frames),
      bulletFactory: this.bulletFactory,
      difficulty: this.difficulty,
    };
    return this.profile.buildStage(this.stageNumber, callbacks);
  }

  /**
   * The banner a stage end paints. `THANKS FOR PLAYING` is practice-only: retail
   * closes a single-stage drill with it, while a campaign run either rolls straight
   * into the next stage or finishes on the all-clear screen.
   */
  get clearBanner(): string {
    return this.campaign ? 'ALL CLEAR!' : 'THANKS FOR PLAYING';
  }

  private handleStageClear(): void {
    this.applyItems(this.itemSystem.collectAll());
    const upcoming = this.advanceCampaign();
    this.pendingRoute = upcoming;
    if (upcoming) {
      this.hud.showMessage('STAGE ' + this.stageNumber + ' CLEAR!', 300);
      this.stageTransitionFrames = 180;
      return;
    }
    this.hud.showMessage(this.clearBanner, CLEAR_BANNER_FRAMES);
    const result = this.buildReport(true);
    this.leaderboard.submit({
      name: this.player.characterName,
      score: result.score,
      stage: result.stage,
      difficulty: result.difficulty,
      character: result.character,
      numRetries: this.numRetries,
    });
    // Park the report behind the banner. `CLEAR_BANNER_FRAMES` matches the message
    // duration so the two end together, and the transition tick releases the hand-off.
    this.pendingClearReport = result;
    this.stageTransitionFrames = CLEAR_BANNER_FRAMES;
  }

  /** What the transition timer releases: the next stage, or the parked results. */
  private finishStageTransition(): void {
    const report = this.pendingClearReport;
    this.pendingClearReport = null;
    if (report) {
      this.onStageClear?.(report);
      return;
    }
    this.beginNextStage();
  }
  private attachBoss(boss: Boss): void {
    this.boss = boss;
    this.bossSweepDone = false;
    this.hud.showBossWarning();
    // Retail never changes the song because a boss appeared. The boss theme starts
    // on an op 7 inside the boss's first conversation, so every one of the 32
    // shipped `msg*.dat` switches to song slot 1 from there (`msg1a` at frame 136,
    // `msg5a` at 265). Only a stage whose conversations cannot be played at all
    // needs the change to happen here instead.
    if (!this.retail?.messagesAvailable) this.playStageSong(1);
    this.dialogue?.play(this.profile.bossDialogue(this.stageNumber, this.character));
    boss.withBulletFactory(this.bulletFactory);
    boss.on('spellcard-start', (spell) => {
      this.audio.playSE('spellcard');
      this.hud.showSpellCard(spell.name, spell.durationSeconds, spell.bonusScore);
      this.dialogue?.play(this.profile.spellDialogue(this.stageNumber));
    });
    boss.on('phase-clear', (payload: { spellCard?: { isCaptured: boolean; currentBonus: number } }) => {
      this.audio.playSE('enemy-hit');
      if (payload?.spellCard?.isCaptured) {
        this.spellBonus += payload.spellCard.currentBonus;
        this.player.score += payload.spellCard.currentBonus;
      }
      this.hud.hideSpellCard();
      this.bulletSystem.clearAll('enemy-bullet');
    });
    boss.on('defeat', () => {
      this.audio.playSE('enemy-hit');
      this.player.score += 500000;
      this.spawnDeathBurst(this.boss?.position.x ?? 224, this.boss?.position.y ?? 120, 1.6);
    });
  }

  /** Snapshot everything the results screen needs. */
  buildReport(campaignFinished = false, gameOver = false): StageClearResult {
    return {
      stage: this.stageNumber,
      difficulty: this.difficulty,
      character: this.character,
      score: this.player.score,
      graze: this.player.graze,
      spellBonus: this.spellBonus,
      livesLeft: this.player.lives,
      bombsLeft: this.player.bombs,
      power: this.player.power,
      maxPower: this.hud.maxPower,
      campaignFinished,
      gameOver,
      practice: !this.campaign,
      /**
       * The run tallies in `DrawFinalStats` order, so the screen never has to
       * reach back into the simulation after the run has already ended.
       */
      stats: {
        score: this.player.score,
        retries: this.numRetries,
        difficulty: this.difficulty,
        playFrames: this.runFrames,
        deaths: this.numDeaths,
        bombsUsed: this.numBombsUsed,
        cardsCaptured: this.spellLog.filter((card) => card.captured).length,
        lagFraction: this.runFrames > 0 ? this.slowFrames / this.runFrames : 0,
        fullCompletion: campaignFinished,
      },
    };
  }

  /** Serialized input recording for the results screen (null before any capture). */
  getReplayJson(): string | null {
    if (this.replayRecorder.frameCount === 0) return null;
    return ReplayRecorder.encode(this.replayRecorder.peek());
  }

  /**
   * Load the stored best for this character and difficulty into the HiScore row.
   * `Gui.cpp:1436-1442` prints it as nine digits plus the continues that record
   * spent, which is also the row that rises while a live run beats it.
   */
  private refreshHiScore(): void {
    const best = this.leaderboard.bestFor(this.difficulty, this.character);
    this.hud.hiScore = best ? best.score : 0;
    this.hud.hiScoreContinues = best?.numRetries ?? 0;
    this.hud.retries = this.numRetries;
  }

  /** Attempt to load ECL-driven stage data asynchronously. */
  private tryLoadEcl(): void {
    if (!hasEclData(this.route) || this.eclLoading) return;
    this.eclLoading = true;
    loadEclStage({
      route: this.route,
      stageNumber: this.stageNumber,
      difficulty: this.difficulty as any,
      character: this.character,
      lives: this.player.lives,
      bombs: this.player.bombs,
      power: this.player.power,
      carry: {
        score: this.player.score,
        graze: this.player.graze,
        timeOrbs: this.eclRunner?.gs.timeOrbs ?? 0,
        totalTimeOrbs: this.eclRunner?.gs.totalTimeOrbs ?? 0,
        pointItemValue: this.eclRunner?.gs.pointItemValue ?? 0,
        clockTime: this.runClockTime,
      },
      stdCamera: () => this.effectCamera(),
    })
      .then((runner) => {
        if (runner) {
          // Hand-off: anything the fallback stage had already fired would keep
          // flying on top of the scripted stage, so the field starts empty.
          this.bulletSystem.clearAll();
          this.eclRunner = runner;
          this.eclRunner.debugNoFail = this.debugNoFail;
          this.eclOutcome = 'run';
          this.eclGaugeRatio = 1;
          this.eclGaugeOpacity = 0;
          // Sync player position into the runner
          this.eclRunner.player.x = this.player.position.x;
          this.eclRunner.player.y = this.player.position.y;
          this.retail?.bindStage();
          if (this.pendingStageSong) {
            this.pendingStageSong = false;
            this.playStageSong(0);
          }
        }
        this.eclLoading = false;
      })
      .catch(() => {
        this.eclLoading = false;
      });
  }

  /**
   * Step until the translated script for the current route owns the field.
   *
   * `loadEclStage` pulls the route module with a dynamic `import`, so the runner
   * appears a few event-loop turns after the constructor returns. A synchronous
   * caller would only ever see the empty pre-script frames; this gives tests and
   * any embedder a way to wait for the real thing.
   */
  async waitForScript(polls = 200): Promise<boolean> {
    for (let i = 0; i < polls && !this.eclRunner; i++) {
      this.stepFrame(1);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    return this.eclRunner !== null;
  }

  /**
   * Build the route's projected backdrop and fetch the sprite pages it samples.
   *
   * Loading is fire-and-forget on purpose: the first frames are the title card, and
   * a page that has not arrived yet simply leaves its quads undrawn, which is what
   * the renderer already does for every other missing texture.
   */
  private setupBackdrop(): void {
    this.stdKey = STD_KEY_BY_ROUTE[this.route] ?? null;
    const key = this.stdKey;
    this.std = key && TH08_STD[key] ? new StdBackground({ key }) : null;
    this.ensureBackdropPages();
  }

  /**
   * Fetch the sprite pages the current backdrop samples, skipping those already in.
   *
   * The stage is built in the constructor while the renderer only arrives in `init`,
   * so both call this. A page that has not loaded yet leaves its quads undrawn, which
   * is how the renderer already treats any missing texture.
   */
  private ensureBackdropPages(): void {
    const assets = this.renderer?.assets;
    const key = this.stdKey;
    if (!assets || !key) return;
    for (const page of stdPages(key)) {
      if (assets.has(page)) continue;
      void assets.load(page, page).then((texture) => {
        // Backdrop art is magnified by the projection, so it wants a linear filter
        // rather than the crisp nearest-neighbour look that suits sprites.
        if (texture) texture.source.style.scaleMode = 'linear';
      });
    }
  }

  /** The backdrop for this frame, or nothing when the route has no authored one. */
  private backdropView(): BackdropView | undefined {
    const std = this.std;
    if (!std) return undefined;
    const view = std.view;
    return {
      quads: view.quads,
      clearColor: stdClearColor(view.clearColor),
      // The mix target and its ramp: stage 4's `(240,192,192)` and stage 8's
      // `(48,48,240)` are most of what those backdrops look like, and the shader
      // needs the two ramp floats beside the colour to place them.
      fog: this.fogEnabled ? view.fog : undefined,
      fade: view.fade,
    };
  }

  /**
   * `g_Background.unk6394` for the effect movers, or null off the backdrop.
   *
   * Read lazily because the runner is built asynchronously while the backdrop is
   * built in the constructor, and because a route with no authored `.std` has no
   * camera to cull against.
   */
  private effectCamera(): EffectCamera | null {
    const std = this.std;
    if (!std) return null;
    const cam = std.effectCamera;
    return {
      eye: cam.eye,
      at: cam.at,
      dir: cam.dir,
      project: (x, y, z) => std.projectEffect({ x, y, z }),
    };
  }

  /** Backdrop state for the debug mirror: how far the camera got, and what is missing. */
  get backdropDebug(): {
    frame: number;
    quads: number;
    offpage: number;
    clear: string;
    /** `D3DRS_FOGCOLOR/ramp`, and how many sheets have a corner inside that ramp. */
    fog: string;
    fogged: number;
  } {
    const std = this.std;
    if (!std) {
      return { frame: -1, quads: 0, offpage: 0, clear: '-', fog: '-', fogged: 0 };
    }
    const view = std.view;
    const assets = this.renderer?.assets;
    return {
      frame: std.currentFrame,
      quads: view.quads.length,
      offpage: assets ? view.quads.filter((quad) => !assets.has(quad.page)).length : -1,
      clear: view.clearColor.toString(16),
      fog: view.fog.color.toString(16) + '/' + Math.round(view.fog.near) + '-' + Math.round(view.fog.far),
      fogged: view.quads.filter((quad) => (quad.depth ?? []).some((along) => along > view.fog.near)).length,
    };
  }

  /** Where the stage conversation has got to, for the debug mirror in `main.ts`. */
  get dialogueDebug(): ReturnType<RetailDialogue['debugState']> {
    return (
      this.retail?.debugState() ?? {
        ready: false,
        pack: undefined,
        packState: 'idle',
        served: 0,
        id: -1,
        frames: 0,
        pending: false,
        lines: [],
        faces: [],
        title: [],
      }
    );
  }

  /** Tick the ECL runner and sync its state to the rendering layer. */
  private tickEclRunner(dtFrames = 1): void {
    const runner = this.eclRunner;
    if (!runner) return;

    this.popups.update();

    // After a clear or a game over the field freezes; only the HUD keeps going.
    if (this.eclOutcome !== 'run') {
      this.retail?.hide();
      this.hud.update(1);
      return;
    }

    // The stage clock belongs to the host, not the script: the replay recorder
    // stamps its frames from here, and `Stage.update` never runs once the
    // translated script owns the field, so without this the counter sits at zero
    // for a whole route.
    this.stage.currentFrame += dtFrames;
    this.retail?.step(runner);

    const input = {
      dx: this.input.isKeyDown('left') ? -1 : this.input.isKeyDown('right') ? 1 : 0,
      dy: this.input.isKeyDown('up') ? -1 : this.input.isKeyDown('down') ? 1 : 0,
      // The same keys as raw bits, so the sim resolves them with retail's
      // eight-way priority chain instead of a vector difference. Holding left and
      // right together is a real thing people do under pressure.
      dirBits:
        (this.input.isKeyDown('up') ? MOVE_BITS.up : 0) |
        (this.input.isKeyDown('down') ? MOVE_BITS.down : 0) |
        (this.input.isKeyDown('left') ? MOVE_BITS.left : 0) |
        (this.input.isKeyDown('right') ? MOVE_BITS.right : 0),
      shoot: this.input.isKeyDown('shoot') || this.debugAutoShoot,
      bomb: this.input.wasKeyPressed('bomb') || this.autoBombPress(),
      slow: this.input.isKeyDown('slow') || this.debugSlowMode,
      // Pointer steering (touch drag, or the opt-in mouse mode) drives the sim
      // directly. The pointer arrives in canvas space, so undo the playfield
      // offset before handing it to a 384x448 world.
      moveTarget: this.pointerWorldTarget(),
    };
    const previousPlayerState = runner.player.state;
    this.eclPrevPower = runner.player.power;
    if (this.debugMaxPower) {
      // Retail re-raises the notice on every maxing pickup (`ItemManager.cpp:347`),
      // so repeating the drop is the honest way to keep it observable.
      if (this.debugMaxPowerCooldown > 0) {
        this.debugMaxPowerCooldown--;
      } else {
        this.debugMaxPowerCooldown = 180;
        runner.player.power = 120;
        runner.items.spawn('powerFull', runner.player.x, runner.player.y);
      }
    }
    runner.tick(input);

    // Sync ECL player state back to the rendering Player
    const sp = runner.player;
    // Compute velocity from movement delta so the renderer leans the sprite correctly
    const prevX = this.player.position.x;
    const prevY = this.player.position.y;
    this.player.position.x = sp.x;
    this.player.position.y = sp.y;
    this.player.velocity.x = sp.x - prevX;
    this.player.velocity.y = sp.y - prevY;
    // The lean machine reads intent, not travel. See `PlayerSim.leanX`.
    this.player.leanX = sp.leanX;
    this.player.lives = sp.lives;
    this.player.bombs = sp.bombs;
    this.player.power = sp.power;
    this.player.score = sp.score;
    this.player.graze = sp.graze;
    this.player.isSlowMode = sp.isSlow;
    this.player.hitboxVisible = sp.hitboxVisible;
    this.player.memberIndex = sp.memberIndex;
    this.player.state = sp.state;
    this.player.stateTimer = sp.stateTimer;
    this.player.isAlive = sp.isFlying;
    this.player.isInvulnerable = sp.isInvulnerable;
    this.player.invulnerabilityTimer = sp.invulnTimer;
    this.player.bombStateFlash = sp.bombStateFlash;
    this.player.switchFlash = sp.switchFlash;
    this.player.powerLost = sp.powerLost;
    this.hud.setMember(this.player.member.name, this.player.member.label, this.player.isSlowMode);

    if (sp.bombTriggered) {
      // The ECL runner owns the player here, so the legacy `bomb` event below
      // never fires on this path; the two together count each spell once.
      this.numBombsUsed++;
      this.audio.playSE('bomb');
      this.renderer?.triggerBombFlash(this.bombAccent());
      this.spawnPointOfFade();
      // 永夜抄 flashes the flying member's art when a spell is spent.
      const playerFace = memberFaceKey(this.player.memberId);
      if (playerFace) this.hud.showCutIn(playerFace, 'player', 60);
    }
    if (previousPlayerState === 'alive' && sp.state === 'dying') {
      this.numDeaths++;
      this.audio.playSE('pldead');
      if (!this.retailDeathEffect(sp.x, sp.y, 6, 16)) {
        this.spawnExplosion(sp.x, sp.y);
        this.spawnDeathBurst(sp.x, sp.y, 1.1);
      }
      this.spawnPointOfFade();
    }

    // ECL owns collectible physics too; mirror its live pool into the common
    // renderer-facing item entities so drops are visible and collectible.
    this.syncEclItems();

    // Homing weapons need an aim point and the fire-rate gate needs decaying. The
    // legacy path gets both from `Player.update()`, which ECL mode never calls.
    const aim = this.findAimTarget();
    this.aimPoint = aim ? { x: aim.position.x, y: aim.position.y } : null;
    this.player.setAimTarget(aim);
    this.player.tickShootCooldown(1);

    // Auto-fire
    if (this.input.isKeyDown('shoot') || this.input.isSteering || this.debugAutoShoot) {
      const newShots = this.player.shoot(runner.gs.frame);
      if (newShots.length > 0) {
        this.audio.queueSe(SE_IDX.playerShot, panFromPlayfieldX(runner.player.x));
        this.bulletSystem.add(...newShots);
      }
    }

    // ECL owns enemy bullets and their physics; the presentation-layer player
    // shots still need one normal engine tick and a collision pass.
    this.bulletSystem.update(1);
    runner.damageEnemiesAt(
      this.bulletSystem
        .getBullets()
        .filter((bullet) => bullet.tag === 'player-bullet')
        .map((bullet) => ({
          get x() {
            return bullet.position.x;
          },
          get y() {
            return bullet.position.y;
          },
          damage: bullet.damage,
          get active() {
            return bullet.isAlive;
          },
          set active(value: boolean) {
            if (!value) bullet.destroy();
          },
        })),
    );

    // Sync ECL enemies to the renderer
    this.syncEclEnemies();

    // The card banner follows the scripts' own op 122/123, which is where the
    // real card names live.
    this.syncEclSpellCard();

    // Sound, particles and gauge feedback for everything the sim just did.
    this.tickEclFeedback();
    // Then the panel text the feedback raised, so a banner's first drawn frame is
    // already one step into its slide, exactly like `Gui`'s own calc order.
    this.tickHudBanners();
    this.tickRetailEffects();
    this.updateEclGauge();

    // Update HUD
    this.hud.updateFromPlayer(this.player);
    this.hud.update(1);

    /*
     * The debug overlay has to describe the field the scripts actually built.
     * The legacy path at the bottom of `update` reads the engine's own systems,
     * which an ECL stage leaves empty -- every line but `player:1` would report
     * zero while a hundred bullets are on screen -- so the runner's pools are the
     * only honest source here. The ship's shots still live in the presentation
     * pool, so they are added on top rather than counted twice.
     */
    const simBullets = runner.bullets.activeCount;
    const shots = this.bulletSystem.getCount();
    this.monitor.updateMetrics(
      simBullets +
        runner.lasers.activeCount +
        runner.enemies.activeCount +
        runner.items.activeCount +
        shots +
        1,
      runner.collisionStats.checks,
      {
        bullets: simBullets + shots,
        enemies: runner.enemies.activeCount,
        items: runner.items.activeCount,
        player: this.player.isAlive ? 1 : 0,
      },
    );

    // The stage ends when the script runs out and the field is clear; the
    // retry menu is the sim's own game-over signal.
    if (runner.gs.showRetryMenu) this.handleEclGameOver();
    else if (runner.isFinished) this.handleEclStageClear();
  }

  /**
   * Drive the spell-card banner from the scripts instead of from a hand-written
   * phase list: op 122 puts the real card name, owner and bonus on the game
   * state and op 123 takes them away, which is exactly retail's lifetime for the
   * plate. The cut-in art is the page 0 of the ANM retail preloads for this
   * stage's boss (`Spellcard::Init`), so name and portrait always agree.
   */
  private syncEclSpellCard(): void {
    const runner = this.eclRunner;
    if (!runner) return;
    const gs = runner.gs;
    const name = gs.spellName;
    const gauge = runner.bossGauge;
    if (name && this.eclSpellName !== name) {
      this.eclSpellName = name;
      this.audio.playSE('spellcard');
      // A new card cuts the previous reward animation short, and retail pays the
      // owed bonus on the spot (`Spellcard.cpp:802-807`).
      this.flushSpellBonus();
      const seconds = gauge && gauge.timerFrames > 0 ? gauge.timerFrames / 60 : 0;
      this.hud.showSpellCard(
        name,
        seconds,
        gs.spellBonus,
        ECL_CARD_BANNER_FRAMES,
        bossFaceKey(this.route),
        'boss',
      );
    } else if (name) {
      // The plate stays up for the whole card, so the countdown has to keep moving.
      if (gauge && gauge.timerFrames > 0) this.hud.spellCardTime = gauge.timerFrames / 60;
    } else if (this.eclSpellName) {
      this.eclSpellName = null;
      this.hud.hideSpellCard();
    }
  }

  /** Convert the sim's one-shot frame events into sound, sparks and text. */
  private tickEclFeedback(): void {
    const runner = this.eclRunner;
    if (!runner) return;

    /*
     * Retail queues every sound the scripts ask for - op 124, a bullet's spawn and
     * transform sounds, a familiar's death - and plays the frame's queue once, each
     * one panned to where it happened (SoundPlayer.cpp:516-545). The sim already
     * collected them; this is where they stop being dropped.
     *
     * It runs here rather than with the runner proper because the queue still holds
     * the last frame's requests once the field stops ticking: draining it after a
     * stage clear would replay those sounds through the whole result screen.
     */
    for (const sfx of runner.frameSfx) this.audio.queueSe(sfx.id, panFromPlayfieldX(sfx.x));
    for (const fx of runner.frameFx) {
      // With the retail pool wired up, the same opcodes already spawned a slot that this
      // method draws from the etama atlas; the notes are the fallback for builds and tests
      // that run without the lifted template table.
      if (runner.effectPool) continue;
      if (fx.kind === 'aura') {
        const size = Math.min(120, Math.max(18, fx.scale * 0.5));
        this.renderer?.spawnEffect(
          'taisei:part:stardust',
          fx.x,
          fx.y,
          size,
          0.5,
          Math.random() * Math.PI * 2,
          0x9fd8ff,
          true,
        );
      } else {
        this.renderer?.spawnEffect(
          'taisei:part:flare',
          fx.x,
          fx.y,
          9 * Math.max(1, fx.scale),
          0.75,
          fx.angle,
          fx.color >= 0 ? fx.color : 0xfff2c8,
          true,
        );
      }
    }

    for (const slot of runner.lastDeaths) {
      // `EnemySlot.resolveDeath` already paid retail's `effect 0 x1 + effect 4 x4`
      // through the pool (`EnemyManagerUpdate.cpp:884-888`); the 8-frame sheet and the
      // Taisei burst only stand in when a stage runs without one.
      const retail = runner.effectPool !== null && runner.effectPool !== undefined;
      if (!retail) this.spawnExplosion(slot.posX, slot.posY);
      if (slot.hasGauge) {
        this.audio.playSE('enemy-hit');
        if (!retail) this.spawnDeathBurst(slot.posX, slot.posY, 1.6);
      }
    }

    // `Spellcard::EndSpell` pays the card that is still standing when the bar
    // breaks; a card whose clock ran out is simply over.
    for (const card of runner.lastSpellResults) {
      this.spellLog.push({ name: card.name, captured: card.captured, bonus: card.bonus });
      if (!card.captured) {
        // `Spellcard.cpp:1209` leaves the panel notice when a card runs its clock
        // out, worded by whether the id was one of the 43 final spells.
        this.banners.showPanel(card.isLastSpell ? 'lastSpellFailed' : 'spellBonusFailed');
        continue;
      }
      if (card.bonus <= 0) continue;
      this.spellBonus += card.bonus;
      if (this.hud.spellCardName === card.name) this.hud.markSpellCaptured();
      this.popups.spawn(runner.player.x, 108, card.bonus, POPUP_COLOR_NORMAL);
      // The line itself waits for the reward animation, as it does retail.
      this.queueSpellBonus(card.bonus);
    }

    // `EnemyOverlay::FUN_0042adb0` raises one `CreateTimePopup` per captured familiar
    // carrying the chain length, then the summoner's total at double scale.
    for (const popup of runner.lastPopups) {
      this.popups.spawn(popup.x, popup.y, popup.value, popup.color >>> 0, popup.scale);
    }

    if (runner.lastGraze > 0) this.audio.playSE('graze');

    if (runner.lastCollected.length > 0) {
      this.audio.playSE('item');
      const gainedPower = runner.player.power > this.eclPrevPower;
      if (gainedPower) this.hud.showMessage('POWER UP!', 60);
      // The float carries the raw value, not the /10 the read-out gains, and turns
      // gold when the pickup paid its ceiling. A shot level going up replaces the
      // number with the 48x8 star, which is retail's only non-numeric popup.
      for (const c of runner.lastCollected) {
        if (c.popup <= 0) continue;
        this.popups.spawn(c.x, c.y, c.popup, c.maxValue ? POPUP_COLOR_MAX : POPUP_COLOR_NORMAL);
      }
      if (powerLevel(runner.player.power) > powerLevel(this.eclPrevPower)) {
        this.popups.spawn(runner.player.x, runner.player.y - 12, -1, POPUP_COLOR_POWER_UP);
      }
      const last = runner.lastCollected[runner.lastCollected.length - 1];
      this.renderer?.spawnEffect(
        'taisei:part:graze',
        runner.player.x,
        runner.player.y,
        14,
        0.8,
        Math.random() * Math.PI,
        last.fillsPower ? 0xb070ff : 0xffe080,
        true,
      );
    }

    /*
     * Full power is loud on purpose: `ItemManager.cpp:343-352`/`:425-434` raise
     * `FUN_00437e5d(0, 1)` on every maxing pickup, so the banner restarts and the
     * field of P items turns into point items with one sparkle each. The pool owns
     * the sparkles when it exists; the burst is only a stand-in for runs without it.
     */
    if (runner.fullPowerTriggered) {
      this.banners.showPanel('fullPower');
      if (!runner.effectPool && runner.fullPowerSparkles > 0) {
        this.renderer?.spawnEffect(
          'taisei:part:graze',
          runner.player.x,
          runner.player.y - 10,
          Math.min(24, runner.fullPowerSparkles * 2),
          0.9,
          Math.random() * Math.PI,
          0xb070ff,
          true,
        );
      }
    }
  }

  /**
   * Owe a spell-card reward line. A second capture while one is still queued pays
   * the first immediately, which is what retail's bit 8 shortcut does when a card
   * begins before the old reward animation ends.
   */
  private queueSpellBonus(bonus: number): void {
    this.flushSpellBonus();
    this.pendingSpellBonus = bonus;
    this.pendingSpellBonusFrames = 0;
  }

  /** Show the owed line now. */
  private flushSpellBonus(): void {
    if (this.pendingSpellBonus <= 0) return;
    this.banners.showSpellBonus(this.pendingSpellBonus);
    this.pendingSpellBonus = 0;
    this.pendingSpellBonusFrames = 0;
  }

  /** Advance the reward countdown and both banner lifetimes. */
  private tickHudBanners(): void {
    if (this.pendingSpellBonus > 0 && ++this.pendingSpellBonusFrames >= SPELL_BONUS_REWARD_FRAMES) {
      this.flushSpellBonus();
    }
    this.banners.tick();
  }

  /**
   * Draw the retail effect pool, one ANM atlas cell per live slot.
   *
   * `EffectManager::OnDraw` blits whatever sprite the slot's script currently selects, at
   * the pool's own position, with the script's scale, rotation and vertex colour multiplied
   * by the colour ECL passed in (`EffectManager.cpp:1158-1210`). The cells are the bullet
   * atlas's cells because retail's effect scripts live in `etama.anm` too.
   */
  private tickRetailEffects(): void {
    const pool = this.eclRunner?.effectPool;
    const renderer = this.renderer;
    if (!pool || !renderer) return;
    for (const view of pool.views) {
      const cell = TH08_ETAMA_CELLS[view.sprite];
      if (!cell || view.alpha <= 0) continue;
      renderer.spawnEffectRect(
        `th08:bullet:etama_t${cell.page}:${view.sprite}`,
        view.x,
        view.y,
        cell.w * view.scaleX,
        cell.h * view.scaleY,
        Math.min(1, view.alpha),
        view.rotation,
        view.tint,
        view.additive,
      );
    }
  }

  /** Ease the ECL boss gauge the way retail's GUI does, frame by frame. */
  private updateEclGauge(): void {
    const gauge = this.eclRunner?.bossGauge;
    const target = gauge && gauge.maxHp > 0 ? gauge.hp / gauge.maxHp : 0;
    const wanted = gauge ? 1 : 0;
    if (this.eclGaugeRatio < target) {
      this.eclGaugeRatio = Math.min(target, this.eclGaugeRatio + ECL_GAUGE_RISE);
    } else if (this.eclGaugeRatio > target) {
      this.eclGaugeRatio = Math.max(target, this.eclGaugeRatio - ECL_GAUGE_FALL);
    }
    if (this.eclGaugeOpacity < wanted) {
      this.eclGaugeOpacity = Math.min(wanted, this.eclGaugeOpacity + ECL_GAUGE_FADE);
    } else if (this.eclGaugeOpacity > wanted) {
      this.eclGaugeOpacity = Math.max(wanted, this.eclGaugeOpacity - ECL_GAUGE_FADE);
    }
  }

  /** Gauge view for the renderer, or null while nothing owns a life bar. */
  private eclGaugeState(): BossGaugeState | null {
    const runner = this.eclRunner;
    const gauge = runner?.bossGauge;
    if (!runner || !gauge || this.eclGaugeOpacity <= 0) return null;
    const bars = Math.max(1, Math.min(MAX_BOSS_LIFEBAR_SEGMENTS, gauge.pips + 1));
    return {
      gaugeOpacity: this.eclGaugeOpacity,
      gaugeDisplayRatio: this.eclGaugeRatio,
      lifeBars: bars,
      remainingBars: Math.max(gauge.pips, gauge.hp > 0 ? 1 : 0),
      isSpellCardActive: gauge.timerFrames > 0,
      spellcardSecondsRemaining: gauge.timerFrames / 60,
    };
  }

  /** Retail stage end inside the sim: sweep the field, then advance or report. */
  private handleEclStageClear(): void {
    const runner = this.eclRunner;
    if (!runner) return;
    this.eclOutcome = 'clear';
    runner.sweepItems();
    runner.bullets.clearByTag('enemy');
    this.bulletSystem.clearAll('enemy-bullet');
    // Beams have to go with the bullets. The outcome is latched from here, so
    // `tickEclRunner` stops driving collisions -- which is exactly why a leftover beam
    // is worse than it looks: it stays painted at whatever geometry it had on the clear
    // frame for the whole 180-frame banner, welded to the screen instead of finishing
    // its sweep. On the laser-heavy stage ends (stage 3 closes with two hundred of them)
    // that is the last thing the player sees. Nothing armed survives a stage boundary.
    runner.lasers.clearAll();
    this.applyStageClearBombPayout();
    this.applyStageClearClock(runner.gs);
    this.hud.updateFromPlayer(this.player);
    const upcoming = this.advanceCampaign();
    this.pendingRoute = upcoming;
    if (upcoming) {
      this.hud.showMessage('STAGE ' + displayStage(this.route) + ' CLEAR!', 300);
      this.stageTransitionFrames = 180;
      return;
    }
    this.hud.showMessage(this.clearBanner, 600);
    const result = this.buildReport(this.campaign);
    this.leaderboard.submit({
      name: this.player.characterName,
      score: result.score,
      stage: result.stage,
      difficulty: result.difficulty,
      character: result.character,
      numRetries: this.numRetries,
    });
    this.onStageClear?.(result);
  }

  /**
   * 妖怪名乗り pays one 灵击 back at the end of every stage. Retail arms the payout
   * inside the stage-clear message script -- message op 9, `Gui.cpp:858-868` -- so it
   * fires once per cleared stage, before the next one loads. Below 6A, a Youmu/Yuyuko
   * run carrying fewer than three bombs gains one and hears the card-capture chime.
   * The two solo ids the same guard names are not selectable in this build, so the
   * team test collapses to the one id. Callers place it before the HUD sync so the
   * new count is what gets painted.
   */
  private applyStageClearBombPayout(): void {
    if (this.route === 'stage6a' || this.route === 'stage6b') return;
    if (this.character !== 'youmu-yuyuko') return;
    if (this.player.bombs >= STAGE_CLEAR_BOMB_PAYOUT_BELOW) return;
    this.player.bombs += 1;
    this.audio.queueSe(SE_IDX.spellCapture);
  }

  /**
   * The night clock moves at the end of every stage. Retail does it in the same place
   * as the bomb payout -- message op 9, `Gui.cpp:806-807` -- by calling
   * `GameManager::AddToClockTime(GetClockTimeIncrement())`, and the increment is a
   * straight read of the Last Spell test: **one hour** if the run banked the time orbs
   * the boss's Last Spell cost, **two** if it did not (`GameManager.cpp:1471-1560`).
   * Stages 6A and 6B return zero; their hours come from `clockControl` on the field.
   *
   * The point of the whole thing is that slop costs you night. `GameManager.cpp:346-352`
   * reads the dial at the hand-off and, once it says 12, stops the run instead of
   * loading the next stage -- dawn has come, and 永夜抄's premise is that you were
   * supposed to prevent it. That branch is not reachable on this data yet: five stages
   * at two hours is ten, and the 6B chimes only land after the last hand-off. It is
   * recorded in `docs/REQUIREMENTS.md` rather than half-wired to a banner no retail
   * script ever draws.
   */
  private applyStageClearClock(gs: GameState): void {
    if (this.route === 'stage6a' || this.route === 'stage6b') return;
    const paidLastSpell = gs.timeOrbs >= gs.lastSpellTimeOrbThreshold;
    gs.clockTime += paidLastSpell ? 1 : 2;
    this.runClockTime = gs.clockTime;
  }

  /** Out of lives: show GAME OVER over the frozen field, then hand off. */
  private handleEclGameOver(): void {
    const runner = this.eclRunner;
    if (!runner || this.eclOutcome !== 'run') return;
    this.eclOutcome = 'gameover';
    this.hud.showMessage('GAME OVER', 600);
    this.audio.stopBGM();
    clearTimeout(this.gameOverTimer);
    this.gameOverTimer = setTimeout(() => {
      const result = this.buildReport(false, true);
      this.leaderboard.submit({
        name: this.player.characterName,
        score: result.score,
        stage: result.stage,
        difficulty: result.difficulty,
        character: result.character,
        numRetries: this.numRetries,
      });
      this.onStageClear?.(result);
    }, 3000);
  }

  /** Sync ECL enemies/bullets into the legacy entity arrays for rendering. */
  private syncEclEnemies(): void {
    if (!this.eclRunner) return;
    // Adapt ECL enemies into engine Enemy wrappers
    const eclEnemies = adaptEclEnemies(this.eclRunner.enemies.getActive());
    // Replace the enemies array with adapted ECL enemies
    this.enemies.length = 0;
    for (const e of eclEnemies) this.enemies.push(e as any);
    // Adapt ECL bullets and add them to the bullet system
    const eclBullets = adaptEclBullets(this.eclRunner.bullets.getActive());
    // The renderer will pick these up via getBullets()
    this.bulletSystem.syncFromEcl(eclBullets);
    this.laserViews = adaptEclLasers(this.eclRunner.lasers.getActive());
  }

  private syncEclItems(): void {
    if (!this.eclRunner) return;
    this.itemSystem.clear();
    for (const item of this.eclRunner.items.items) {
      if (!item.active) continue;
      const kind =
        item.kind === 'powerBig'
          ? 'power'
          : item.kind === 'powerFull'
            ? 'fullpower'
            : item.kind === 'pointSmall' || item.kind === 'timeOrb'
              ? 'point'
              : item.kind === 'extend'
                ? 'life'
                : item.kind;
      const entity = this.itemSystem.spawn(kind, item.x, item.y);
      if (!entity) continue;
      entity.velocity.x = item.vx;
      entity.velocity.y = item.vy;
      entity.magnetized = item.magnetized;
    }
  }

  /** Play back a recorded run: input snapshots drive the game, AI stays live. */
  loadReplayJson(json: string): void {
    this.loadReplay(ReplayRecorder.decode(json));
  }

  /** Rebuild the current stage from scratch, keeping score and lives. */
  restartStage(): void {
    this.enemies.length = 0;
    this.boss = null;
    this.bulletSystem.clearAll();
    this.itemSystem.clear();
    this.bossSweepDone = false;
    this.explosions.length = 0;
    this.pointOfFade.length = 0;
    this.stageTransitionFrames = 0;
    this.popups.reset();
    this.spellBonus = 0;
    // A new stage owns its banners: a notice from the last one must not slide in
    // over the stage title, and an unpaid reward line does not carry across either.
    this.banners.clear();
    this.pendingSpellBonus = 0;
    this.pendingSpellBonusFrames = 0;
    // A restart replays the current route; it must not inherit a queued advance.
    this.pendingRoute = null;
    this.pendingClearReport = null;
    this.eclRunner = null;
    this.eclOutcome = 'run';
    this.eclGaugeRatio = 0;
    this.eclGaugeOpacity = 0;
    clearTimeout(this.gameOverTimer);
    resetEclAdapters();
    this.timeSystem = new TimeSystem(this.stageInfo.cycleFrames);
    this.hud.setStageInfo(this.stageNumber, this.stageInfo.title, this.difficulty);
    this.hud.hideSpellCard();
    this.refreshHiScore();
    this.dialogue?.stop();
    this.introPlayed = false;
    this.pendingStageSong = true;
    this.stage = this.createStage();
    this.tryLoadEcl();
    this.resume();
  }

  private beginNextStage(): void {
    const upcoming = this.pendingRoute ?? nextRoute(this.route, this.routeContext());
    this.pendingRoute = null;
    if (!upcoming) return;
    this.route = upcoming;
    this.stageNumber = displayStage(upcoming);
    this.enemies.length = 0;
    this.boss = null;
    this.bulletSystem.clearAll();
    this.itemSystem.clear();
    this.bossSweepDone = false;
    this.explosions.length = 0;
    this.popups.reset();
    this.spellBonus = 0;
    // A new stage never resets the run: lives, bombs and power carry straight
    // over, and so does the ECL runner that owns them.
    this.eclRunner = null;
    this.eclOutcome = 'run';
    this.eclGaugeRatio = 0;
    this.eclGaugeOpacity = 0;
    resetEclAdapters();
    this.player.resetForStage(true);
    this.hud.maxPower = this.player.maxPower;
    this.timeSystem = new TimeSystem(this.stageInfo.cycleFrames);
    this.hud.setStageInfo(this.stageNumber, this.stageInfo.title, this.difficulty);
    this.refreshHiScore();
    this.dialogue?.stop();
    this.introPlayed = false;
    this.pendingStageSong = true;
    this.stage = this.createStage();
    this.hud.showMessage('STAGE ' + this.stageNumber + ': ' + this.stageInfo.title, 180);
    this.tryLoadEcl();
  }

  /**
   * Roll and spawn the drop set for a killed enemy, returning how many items
   * hit the playfield. The tier comes from the script when it declares one and
   * falls back to an HP heuristic so existing waves keep working.
   */
  private spawnEnemyDrops(enemy: Enemy): number {
    const tier: DropTier = enemy.dropTier ?? (enemy.maxHp > 100 ? 'elite' : 'fairy');
    const { x, y } = enemy.position;
    return this.itemSystem.spawnDrops(x, y, tier).length;
  }

  /** Apply a batch of pickups to the player and play the TH08 grab feedback. */
  private applyItems(picked: ItemCollectResult[]): void {
    if (picked.length === 0) return;
    let powerUp = false;
    for (const item of picked) {
      if (item.fillsPower) this.player.fillPower();
      else if (item.power > 0) powerUp = this.player.addPower(item.power) > 0 || powerUp;
      if (item.score > 0) this.player.score += item.score;
      if (item.lives > 0) this.player.lives = Math.min(8, this.player.lives + item.lives);
      if (item.bombs > 0) this.player.bombs = Math.min(9, this.player.bombs + item.bombs);
    }
    this.audio.playSE('item');
    if (powerUp) this.hud.showMessage('POWER UP!', 60);
    const last = picked[picked.length - 1];
    this.renderer?.spawnEffect(
      'taisei:part:graze',
      this.player.position.x,
      this.player.position.y,
      20,
      0.9,
      Math.random() * Math.PI,
      last.fillsPower ? 0xb070ff : 0xffe080,
      true,
    );
  }

  /**
   * Scatter the power the player just lost back onto the playfield, the way
   * TH08 drops it as collectable P items instead of silently deleting it.
   */
  private spawnPowerLoss(): void {
    const lost = this.player.powerLost;
    if (lost <= 0) return;
    this.player.powerLost = 0;
    const { x, y } = this.player.position;
    const count = Math.min(12, Math.max(1, Math.round(lost / 4)));
    for (let i = 0; i < count; i++) {
      this.itemSystem.spawn('powerSmall', x + (Math.random() - 0.5) * 28, y + (Math.random() - 0.5) * 18);
    }
  }

  private bossAlpha(boss: Boss): number {
    return boss.alpha;
  }

  private setupListeners(): void {
    this.player.on('hit', () => {
      this.audio.playSE('pldead');
      if (!this.retailDeathEffect(this.player.position.x, this.player.position.y, 6, 16)) {
        this.spawnExplosion(this.player.position.x, this.player.position.y);
        this.spawnDeathBurst(this.player.position.x, this.player.position.y, 1.1);
      }
      this.spawnPointOfFade();
      this.bulletSystem.clearAll('enemy-bullet');
      if (this.boss?.isSpellCardActive) {
        this.boss.currentSpellCard?.failCapture();
      }
    });

    // The power bill is paid when the window closes, and the drop pile with it.
    this.player.on('deathSettled', () => {
      this.numDeaths++;
      this.spawnPowerLoss();
    });

    this.player.on('gameover', () => {
      this.hud.showMessage('GAME OVER', 600);
      this.audio.stopBGM();
      // Show results after a short delay
      setTimeout(() => {
        const result = this.buildReport(false, true);
        this.leaderboard.submit({
          name: this.player.characterName,
          score: result.score,
          stage: result.stage,
          difficulty: result.difficulty,
          character: result.character,
        });
        this.onStageClear?.(result);
      }, 3000);
    });

    this.player.on('bomb', () => {
      this.numBombsUsed++;
      this.audio.playSE('bomb');
      this.renderer?.triggerBombFlash(this.bombAccent());
      this.spawnPointOfFade();
      this.bulletSystem.clearAll('enemy-bullet');
      if (this.boss?.isSpellCardActive) {
        this.boss.currentSpellCard?.failCapture();
      }
      if (this.boss && this.boss.isAlive) {
        // Retail spends a bomb as a run of per-hit-capped hits, not one lump sum.
        this.boss.applyBurst(this.player.bombDamage);
      }
      for (const e of this.enemies) {
        e.takeDamage(Math.round(this.player.bombDamage * 0.55));
      }
    });
  }

  async init(container: HTMLElement): Promise<void> {
    if (this.headless) return;
    this.renderer = new PixiRenderer();
    await this.renderer.init({
      container,
      assetManifest: this.assetManifest,
      theme: this.stageInfo.bgTheme as StageTheme,
      playerSkin: this.playerSkin,
      backend: this.rendererBackend,
    });
    this.ensureBackdropPages();
    // Danmaku art is baked per shape x palette colour; snap live colours to the ramp.
    this.renderer.sprites.setBulletTextures({
      palette: BULLET_PALETTE,
      shapes: BULLET_SHAPE_KEYS,
    });
    // Idle loops for the cast Taisei has no art for, then the real sheets on top so
    // upstream animation always wins the shared slot.
    this.proceduralSheets = registerProceduralSheets(this.renderer);
    this.taiseiSheets = registerTaiseiSheets(this.renderer);
    // Original TH08 sprites override Taisei placeholders when atlas PNGs are present
    void registerTH08PlayerSprites(this.renderer).then((n) => {
      if (n > 0) console.log('[th08] Registered', n, 'original player sprites');
    });
    void registerTH08EnemySprites(this.renderer!).then((n) => {
      if (n > 0) console.log('[th08]', n, 'enemy/boss sprites');
    });
    void registerTH08BulletSprites(this.renderer!).then((n) => {
      if (n > 0) console.log('[th08]', n, 'bullet sprites');
    });
    void registerTH08Backgrounds(this.renderer!).then((n) => {
      if (n > 0) console.log('[th08]', n, 'background textures');
    });
    void registerTH08HudArt(this.renderer!).then((n) => {
      if (n > 0) console.log('[th08]', n, 'hud textures');
    });
    void registerTH08Faces(this.renderer!).then((n) => {
      this.facePages = n;
      if (n > 0) console.log('[th08]', n, 'face pages');
    });
    void registerTH08StageTitles(this.renderer!).then((n) => {
      if (n > 0) console.log('[th08]', n, 'stage-title cells');
    });
    // The stage conversation needs the ANM manifest before it can be built, and
    // that is one fetch, so it runs beside the sprite registration above instead
    // of holding frame one.
    this.retail = new RetailDialogue(this.retailHooks());
    void this.retail.setup();
    this.dialogue = new DialogueSystem(container, {
      faceResolver: (speaker, mood) => dialogFaceUrl(speaker, mood),
      charFrames: 1,
      holdFrames: 70,
    });
    // Attach to the container so pointer/touch coords map to canvas-local space;
    // pass the game resolution so CSS-scaled canvases map back to game coords.
    this.input.attach(container, { width: 640, height: 480 });
  }

  /**
   * Everything `RetailDialogue` reads back out of the game. Each value is a
   * getter because a stage hand-off changes the route, the runner, and the std
   * while the box itself stays alive for the whole run.
   */
  private retailHooks(): RetailDialogueHooks {
    return {
      renderer: () => this.renderer ?? null,
      runner: () => this.eclRunner,
      input: this.input,
      audio: this.audio,
      route: () => this.route,
      stageNumber: () => this.stageNumber,
      shotType: () => this.shotType,
      stdKey: () => this.stdKey,
      character: () => this.character as CharacterId,
      retries: () => this.numRetries,
      autoShoot: () => this.debugAutoShoot,
      autoSkip: () => this.debugAutoSkip,
      // `Gui.cpp:381-382` stops sweeping the field while the player is dying.
      dying: () => this.eclRunner?.player.state === 'dying',
    };
  }

  /**
   * Swap the ship art at once. The renderer keeps both the upstream sheets and
   * our own idle loops registered, so this is a lookup change, not a reload.
   */
  setPlayerSkin(skin: 'taisei' | 'painted'): void {
    if (this.playerSkin === skin) return;
    this.playerSkin = skin;
    this.renderer?.setPlayerSkin(skin);
  }

  /**
   * Start retail song slot `track` of the stage now playing.
   *
   * A stage's four songs are bound to slots 0 to 2 out of its own std header when
   * it finishes loading (`GameManager.cpp:1087-1092`, offsets `+0x290`/`+0x310`/
   * `+0x390`), and `:417` plays slot 0 as the loading chain hands over - so the
   * stage theme is whatever that std names, not a picked playlist. The dialogue
   * layer owns the same call for op 7; `requestStageSong` makes a repeat a no-op.
   *
   * Passing nothing to `playBGM` is the synthesised stand-in, which keeps every
   * environment audible. A browser that blocks autoplay unlocks on the first
   * gesture instead (see `setupAudioUnlock`).
   */
  private playStageSong(track: number): void {
    const retail = this.retail;
    if (retail?.ready) {
      retail.requestStageSong(track);
      return;
    }
    const song = stageSongTrack(this.stdKey, track, this.stageNumber);
    /*
     * No `volume`: `AudioManager` falls back to the global BGM level, which is what
     * the 音量 slider owns. A hard-coded number here would squash it on every song
     * change.
     */
    this.audio.playBGM(song?.file, {
      loop: true,
      fadeIn: 1000,
      loopFromSeconds: song?.introSeconds,
    });
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    /*
     * A new run starts its tallies over. `restartStage` and a continue do not,
     * which is what lets the settlement rows describe the run rather than the
     * last stage.
     */
    this.numDeaths = 0;
    this.numBombsUsed = 0;
    this.runFrames = 0;
    this.slowFrames = 0;
    this.refreshHiScore();

    this.playStageSong(0);
    this.setupAudioUnlock();

    if (!this.headless) {
      let lastFrameAt = 0;
      const loop = () => {
        if (!this.isRunning) return;
        const now = performance.now();
        /*
         * Retail's slow meter counts frames that overran their budget. A browser
         * compositor lands a little past 16.7 ms even when healthy, so the test
         * uses ~55 fps: still a real drop, but not measurement jitter.
         */
        if (lastFrameAt && now - lastFrameAt > 1000 / 55) this.slowFrames++;
        lastFrameAt = now;
        for (let i = 0; i < this.simTicksPerFrame; i++) this.stepFrame(1);
        this.renderFrame();
        this.animFrameId = requestAnimationFrame(loop);
      };
      this.animFrameId = requestAnimationFrame(loop);
    }
  }

  stop(): void {
    this.isRunning = false;
    this.retail?.hide();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.input.detach();
  }

  /** Freeze gameplay (ESC pause menu state). */
  pause(): void {
    this.isPaused = true;
    this.audio.pauseBGM();
    this.onPauseChange?.(true);
  }

  resume(): void {
    this.isPaused = false;
    this.audio.resumeBGM();
    this.onPauseChange?.(false);
  }

  /** Toggle pause (ESC edge). */
  togglePause(): void {
    if (this.isPaused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  /** Browsers block audio until the first user gesture — unlock then. */
  private setupAudioUnlock(): void {
    if (typeof window === 'undefined' || this.audioUnlocked) return;
    this.audioUnlockHandler = () => {
      this.audioUnlocked = true;
      this.audio.resumeBGM();
      this.removeAudioUnlockListeners();
    };
    window.addEventListener('pointerdown', this.audioUnlockHandler);
    window.addEventListener('keydown', this.audioUnlockHandler);
  }

  private removeAudioUnlockListeners(): void {
    if (typeof window === 'undefined' || !this.audioUnlockHandler) return;
    window.removeEventListener('pointerdown', this.audioUnlockHandler);
    window.removeEventListener('keydown', this.audioUnlockHandler);
    this.audioUnlockHandler = undefined;
  }

  /**
   * Full teardown: stop the loop, detach input, release audio + renderer.
   * Call from framework hosts (e.g. React `useEffect` cleanup).
   */

  /**
   * TH08 Continue: reset score to numRetries, lives/bombs/power to defaults,
   * but keep the player at the current stage. This is the arcade-style
   * "insert coin" mechanic.
   */
  continueGame(): void {
    // Retail `numRetries > 0` is what locks a continued run onto the long
    // stage-6 route, so it has to be counted before the stage restarts.
    this.numRetries += 1;
    // Retail arms a continued run at a score of exactly the continue count, which is
    // the same number the tenth HUD column prints.
    this.player.score = this.numRetries;
    this.player.lives = 3;
    this.player.bombs = 3;
    this.player.power = 0;
    // Retail's continue reallocates `ZunGlobals` (`GameManagerSetup.cpp:97-107`), so the
    // night clock goes back to the top of the hour along with the score and the stock.
    this.runClockTime = 0;
    this.player.isAlive = true;
    this.player.state = 'alive';
    this.player.isInvulnerable = true;
    this.player.invulnerabilityTimer = 300;
    // 384-wide playfield: the ship comes back at the same spot `PlayerSim` respawns
    // to. 224/380 was the pre-layout 448-wide centre and left the ship off-centre.
    this.player.position.x = 192;
    this.player.position.y = 384;
    this.hud.updateFromPlayer(this.player);
    this.restartStage();
  }

  destroy(): void {
    this.dialogue?.stop();
    this.stop();
    clearTimeout(this.gameOverTimer);
    this.removeAudioUnlockListeners();
    this.audio.destroy();
    this.renderer?.destroy();
    this.renderer = undefined;
    this.std = null;
    this.stdKey = null;
  }

  /**
   * Drain the Stage context queues (票据 08 StageContext API):
   * spawnEntity → enemies, showDialogue → hud.showMessage, startBossPhase → boss phase.
   */
  private consumeStageQueues(): void {
    if (this.stage.spawnedEntities.length > 0) {
      for (const entity of this.stage.spawnedEntities.splice(0)) {
        if (entity instanceof Enemy) {
          this.enemies.push(entity);
        }
      }
    }
    if (this.stage.dialogueQueue.length > 0) {
      for (const line of this.stage.dialogueQueue.splice(0)) {
        this.hud.showMessage(line.text, line.frames);
      }
    }
    if (this.stage.bossPhaseRequests.length > 0) {
      for (const req of this.stage.bossPhaseRequests.splice(0)) {
        const boss = this.boss;
        if (boss && req.boss === boss) {
          while (boss.currentPhaseIndex < req.index && !boss.isDefeated) {
            boss.nextPhase();
          }
        }
      }
    }
  }

  /** Closest living target for homing shot styles (Reimu team). */
  findAimTarget(): { position: { x: number; y: number } } | null {
    let best: { position: { x: number; y: number } } | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    const consider = (candidate: { position: { x: number; y: number }; isAlive?: boolean } | null) => {
      if (!candidate) return;
      if (candidate.isAlive === false) return;
      const d = Math.hypot(
        candidate.position.x - this.player.position.x,
        candidate.position.y - this.player.position.y,
      );
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
      }
    };
    for (const enemy of this.enemies) consider(enemy);
    if (this.boss && this.boss.isAlive) consider(this.boss);
    return best;
  }

  stepFrame(dtFrames = 1): void {
    // The settlement panel's completion row reads the run's total, not this stage's.
    this.runFrames += dtFrames;
    this.monitor.updateFrame();
    if (this.replayPlayer && !this.replayPlayer.isFinished) {
      const replayFrame = this.replayPlayer.next();
      if (replayFrame) this.input.applySnapshot(replayFrame.snapshot);
    } else {
      this.input.update();
      if (this.replayRecorder.isRecording) {
        this.replayRecorder.capture(this.stage.currentFrame, this.input.getSnapshot());
      }
    }

    if (this.input.wasKeyPressed('debug')) {
      this.monitor.toggle();
    }

    // ESC toggles pause; no other gameplay when paused
    if (this.input.wasKeyPressed('pause')) {
      this.togglePause();
    }
    if (this.isPaused) return;

    // The camera corridor runs on stage frames, including across a stage card.
    this.std?.tick();
    this.timeSystem.advance(dtFrames);
    this.hud.setTimePhase(this.timeSystem.phase);

    if (this.stageTransitionFrames > 0) {
      this.stageTransitionFrames = Math.max(0, this.stageTransitionFrames - dtFrames);
      this.hud.update(dtFrames);
      if (this.stageTransitionFrames === 0) this.finishStageTransition();
      return;
    }

    // ECL-driven mode: delegate to StageRunner
    if (this.eclRunner) {
      this.tickEclRunner(dtFrames);
      return;
    }

    // The translated script arrives on a microtask, and the stage clock does not
    // wait for it. Retrying here closes the gap: without it a route whose import
    // lost the race would sit on an empty field forever, because the hand-authored
    // fallback chart that used to cover this no longer exists.
    this.tryLoadEcl();

    if (this.input.wasKeyPressed('bomb')) {
      this.player.useBomb();
    }

    // 1. Update Player Input & Movement
    // Same converted point the ECL sim is steered with, so the two movement
    // writers cannot disagree about where the cursor is.
    this.player.handleInput(this.input, this.pointerWorldTarget());
    this.player.update(dtFrames);
    // The power bill lands on the frame the grace window closes, not on the hit
    // (`Player.cpp:1343-1352`), so the drop pile is scattered from the clock.
    this.spawnPowerLoss();
    const aim = this.findAimTarget();
    this.aimPoint = aim ? { x: aim.position.x, y: aim.position.y } : null;
    this.player.setAimTarget(aim);
    this.hud.setMember(this.player.member.name, this.player.member.label, this.player.isSlowMode);

    // Auto-fire while pointer-steering (touch drag, or mouse if that option is on).
    if (this.input.isKeyDown('shoot') || this.input.isSteering) {
      const newShots = this.player.shoot(this.stage.currentFrame);
      if (newShots.length > 0) {
        this.audio.playSE('shoot');
        this.bulletSystem.add(...newShots);
      }
    }

    // 2. Stage timeline. The opening script holds the clock (bullets keep
    // moving) exactly like the original: nothing new spawns until it is read.
    if (!this.introPlayed) {
      this.introPlayed = true;
      this.dialogue?.play(this.profile.introDialogue(this.stageNumber, this.character));
    }
    if (this.dialogue?.isActive) {
      this.dialogue.update(dtFrames);
    } else {
      this.stage.update(dtFrames);
    }
    this.consumeStageQueues();

    // 3. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.isAlive) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(dtFrames);
      const enemyBullets = enemy.updateAI(dtFrames, this.player);
      if (enemyBullets.length > 0) {
        this.bulletSystem.add(...enemyBullets);
      }

      // Offscreen culling
      if (enemy.position.y > 550 || enemy.position.x < -60 || enemy.position.x > 500) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    // 4. Update Boss AI（死亡后保留至 alpha 淡出结束，渲染消费由任务 D 负责）
    if (this.boss && (this.boss.isAlive || this.bossAlpha(this.boss) > 0)) {
      this.boss.update(dtFrames);
      if (this.boss.isAlive) {
        const bossBullets = this.boss.updateAI(dtFrames, this.player);
        if (bossBullets.length > 0) {
          this.bulletSystem.add(...bossBullets);
        }
      }
      if (this.boss.isDefeated) {
        // TH08 sweeps the whole screen into the player the moment a boss falls.
        if (!this.bossSweepDone) {
          this.bossSweepDone = true;
          this.applyItems(this.itemSystem.collectAll());
        }
        if (this.bossAlpha(this.boss) <= 0) {
          this.boss = null;
        }
      }
    }

    // 5. Update Bullets
    this.bulletSystem.update(dtFrames);

    // 6. Collision Resolution (all through the spatial hash grid)
    const allEntities = [
      ...(this.player.isAlive ? [this.player] : []),
      ...this.enemies,
      ...(this.boss && this.boss.isAlive ? [this.boss] : []),
      ...this.bulletSystem.getBullets(),
    ];
    this.collisionSystem.update(allEntities);

    // Player bullets vs enemies/boss — spatial hash neighbourhood queries
    const bullets = this.bulletSystem.getBullets();
    for (const b of bullets) {
      if (!b.isAlive || b.tag !== 'player-bullet') continue;

      const hits = this.collisionSystem.checkCollisions(b, ['enemy', 'boss']);
      for (const hit of hits) {
        const target = hit.entity;
        if (target.tag === 'boss') {
          (target as Boss).takeDamage(b.damage);
          b.destroy();
          this.player.score += 200;
          this.audio.playSE('enemy-hit');
          break;
        }
        // enemy
        if (target.isAlive) {
          const killed = (target as Enemy).takeDamage(b.damage);
          b.destroy();
          this.audio.playSE('enemy-hit');
          if (killed) {
            const dropped = this.spawnEnemyDrops(target as Enemy);
            this.player.score += dropped * 10;
            this.spawnExplosion(target.position.x, target.position.y);
            this.spawnDeathBurst(
              target.position.x,
              target.position.y,
              (target as Enemy).maxHp > 100 ? 1.25 : 0.8,
            );
          }
          this.player.score += killed ? (target as Enemy).scoreValue : 100;
          break;
        }
      }
    }

    // 6b. Collectibles — arc, fall, magnetise, then apply whatever was picked up.
    this.applyItems(this.itemSystem.update(dtFrames, this.player, this.player.playfield));

    // Enemy bullets vs player (hit + graze within 16px)
    if (this.player.isAlive) {
      if (!this.player.isInvulnerable) {
        const hits = this.collisionSystem.checkCollisions(this.player, 'enemy-bullet');
        for (const hit of hits) {
          if (hit.entity.isAlive) {
            this.player.hit();
            hit.entity.destroy();
            break;
          }
        }
      }

      const grazes = this.collisionSystem.queryNearby(this.player, 16, 'enemy-bullet');
      for (const g of grazes) {
        const bullet = g.entity as Bullet;
        if (bullet.isAlive && !bullet.grazed) {
          bullet.grazed = true;
          // Real Taisei graze spark, recoloured to the bullet that brushed past.
          this.renderer?.spawnEffect(
            'taisei:part:graze',
            bullet.position.x,
            bullet.position.y,
            26,
            0.9,
            Math.random() * Math.PI,
            bullet.color,
            true,
          );
          // Stardust drifts off the spark on top-grazes, like upstream.
          if (Math.random() < 0.35) {
            this.renderer?.spawnEffect(
              Math.random() < 0.5 ? 'taisei:part:stardust' : 'taisei:part:stardust_green',
              bullet.position.x,
              bullet.position.y - 4,
              18,
              0.8,
              Math.random() * Math.PI * 2,
              undefined,
              true,
            );
          }
          this.player.graze++;
          this.player.score += 500;
          this.audio.playSE('graze');
        }
      }
    }

    // 7. Update HUD & Monitor
    this.hud.updateFromPlayer(this.player);
    this.hud.update(dtFrames);
    if (this.boss?.isSpellCardActive && this.boss.currentSpellCard) {
      this.hud.spellCardTime = this.boss.currentSpellCard.timeRemaining;
    }

    this.monitor.updateMetrics(allEntities.length, this.collisionSystem.totalChecks, {
      bullets: this.bulletSystem.getCount(),
      enemies: this.enemies.length + (this.boss && this.boss.isAlive ? 1 : 0),
      items: this.itemSystem.count,
      player: this.player.isAlive ? 1 : 0,
    });
  }

  /**
   * Colour of the full-screen bomb flash.
   *
   * `BombSpec.accent` is per card, so the flash says which half of the pair
   * spent the bomb. `StageRunner` has already created `activeBomb` by the time
   * the snapshot reports the trigger, so the live spec is the answer; the
   * re-resolve is only for the legacy (non-ECL) bomb path, where no spec object
   * exists yet. `selectBomb` takes the same three arguments as
   * `StageRunner.ts:342`, so both routes agree.
   */
  private bombAccent(): number {
    const runner = this.eclRunner;
    const live = runner?.activeBomb?.spec.accent;
    if (live !== undefined) return live;
    if (runner) {
      return selectBomb(runner.gs.shotType, runner.player.isSlow, runner.player.deathbomb).accent;
    }
    return 0xffffff;
  }

  /**
   * The QA auto-bomb's one-frame press. Fires every four seconds, and never on top
   * of a card that is still running, so a walk through `?autobomb` shows the cards
   * in order instead of stacking them.
   */
  private autoBombPress(): boolean {
    if (!this.debugAutoBomb) return false;
    if (this.autoBombHold > 0) {
      this.autoBombHold--;
      return true;
    }
    this.autoBombClock++;
    if (this.autoBombClock < 240 || this.eclRunner?.gs.bombRunning) return false;
    this.autoBombClock = 0;
    this.autoBombHold = 2;
    return true;
  }

  /**
   * Taisei's point-of-fade: bullets that get erased by a bomb or a death burst
   * sparkle out in place instead of blinking off. Capped so a lunatic screen-full
   * of danmaku cannot flood the FX pool.
   */
  private spawnPointOfFade(limit = 120): void {
    if (!this.renderer) return;
    for (const bullet of this.bulletSystem.getBullets()) {
      if (this.pointOfFade.length >= limit) break;
      if (bullet.tag !== 'enemy-bullet' || !bullet.isAlive) continue;
      this.pointOfFade.push({ x: bullet.position.x, y: bullet.position.y, frame: 0 });
    }
  }

  /** Queue an 8-frame explosion at a playfield position. */
  private spawnExplosion(x: number, y: number): void {
    this.explosions.push({ x, y, frame: 0 });
  }

  /**
   * The retail death pass for a life: `Player::Die` (`Player.cpp:528-536`) pays one
   * spawn of effect template 6 sixteen times wide at the ship, on `etama.anm`. Answer
   * false when the stage has no pool — the placeholder sheet and the Taisei burst are
   * then still reachable, which is what the engine demo runs on.
   */
  private retailDeathEffect(x: number, y: number, id: number, count: number): boolean {
    const pool = this.eclRunner?.effectPool;
    if (!pool) return false;
    pool.spawn(id, x, y, { count, color: -1 });
    return true;
  }

  /**
   * One-shot Taisei particle burst: a bright flash, an expanding smoke puff and
   * a couple of drifting petals. Used for enemy and boss deaths so the moment
   * reads as the upstream games' "fwoom" instead of a generated ring.
   */
  private spawnDeathBurst(x: number, y: number, scale = 1): void {
    if (!this.renderer) return;
    this.renderer.spawnEffect('taisei:part:flare', x, y, 46 * scale, 0.95, 0, 0xfff2c8, true);
    // blast is the upstream shock ring; smoke drifts over it with normal blending.
    this.renderer.spawnEffect(
      'taisei:part:blast',
      x,
      y,
      60 * scale,
      0.9,
      Math.random() * Math.PI,
      undefined,
      true,
    );
    this.renderer.spawnEffect('taisei:part:smoke', x, y + 6, 74 * scale, 0.6, Math.random() * Math.PI);
    for (let i = 0; i < 3; i++) {
      const a = Math.random() * Math.PI * 2;
      this.renderer.spawnEffect(
        'taisei:part:petal',
        x + Math.cos(a) * 14,
        y + Math.sin(a) * 14,
        16 * scale,
        0.85,
        a,
        0xffd6e8,
      );
    }
  }

  renderFrame(): void {
    if (!this.renderer) return;
    for (const fx of this.explosions) {
      this.renderer.spawnEffect(
        'fx:explosion:' + fx.frame,
        fx.x,
        fx.y,
        34 + fx.frame * 5,
        Math.max(0.12, 1 - fx.frame / 9),
      );
      if (fx.frame === 2) {
        this.renderer.spawnEffect('taisei:part:blast', fx.x, fx.y, 78, 0.8, 0, undefined, true);
        this.renderer.spawnEffect('taisei:part:smoke', fx.x, fx.y + 8, 96, 0.55);
      }
      fx.frame += 1;
    }
    this.explosions = this.explosions.filter((fx) => fx.frame < 8);

    // Point-of-fade runs the 33-frame upstream sparkle, two game frames per cell.
    for (const pof of this.pointOfFade) {
      this.renderer.spawnEffect(
        'taisei:part:bullet_clear.frame' + String(Math.min(32, pof.frame * 2)).padStart(4, '0'),
        pof.x,
        pof.y,
        22,
        1,
        0,
        undefined,
        true,
      );
      pof.frame += 1;
    }
    this.pointOfFade = this.pointOfFade.filter((pof) => pof.frame <= 16);

    // The panel's Point/Time rows read the sim's counters, which only the stage
    // runner owns (`Gui.cpp:1453-1469` pairs them the same way).
    const gs = this.eclRunner?.gs;
    if (gs) {
      this.hud.pointItems = gs.pointItemsCollected;
      this.hud.nextPointExtend = gs.nextPointItemExtendThreshold;
      this.hud.timeOrbs = gs.timeOrbs;
      // The second Time column is the run-lifetime counter (`Gui.cpp:1491` reads
      // `g_GameManager + 0x3054`), which `addTimeOrbs` keeps in step with the stage
      // counter. It was never fed, so the panel printed `1056/ 0`.
      this.hud.timeOrbTotal = gs.totalTimeOrbs;
      // The night clock. `clockControl` (ECL op 181) advances this once per
      // chime and the run ends the night at 12, so the dial is the only place
      // a player can read how much of it is left.
      this.hud.clockTime = gs.clockTime;
      // The scripts toll the dial on the field, so the run-level copy has to follow it
      // frame by frame -- otherwise the hours a stage rang are lost at its boundary, and
      // 6B's four chimes (the ones `Gui.cpp:311-324` routes the final script on) would
      // never be visible anywhere but the dial itself.
      this.runClockTime = gs.clockTime;
    }

    const meta = this.stageInfo;
    this.renderer.render(
      this.player,
      this.boss,
      this.enemies,
      this.bulletSystem.getBullets(),
      this.hud,
      this.monitor,
      this.isPaused,
      this.input,
      {
        ...this.timeSystem.snapshot(),
        // A stage keeps one mood for its whole length, so the backdrop light and
        // scroll rate come from the stage, not from a day/night cycle.
        brightness: meta.bgBrightness ?? this.timeSystem.brightness,
        theme: meta.bgTheme,
        scrollSpeed: meta.bgScroll ?? 1.1,
        backdrop: this.backdropView(),
        lasers: this.laserViews,
        bombZones: this.eclRunner?.lastBombZones,
        bombCancel: this.eclRunner?.bombCancel ?? null,
        bombWash: this.eclRunner?.bombBackdrop ?? null,
        youkaiMeter: this.eclRunner?.youkaiMeter,
        banners: this.banners.views(),
        // The popup pool speaks playfield space; the panel offset is applied here so
        // the distance-to-ship fade stays a playfield measurement.
        scorePopups: this.popups.view(
          this.eclRunner?.player.x ?? this.player.position.x,
          this.eclRunner?.player.y ?? this.player.position.y,
          PLAYFIELD_X,
          PLAYFIELD_Y,
        ),
        playerPose: this.player.isSlowMode ? 'slow' : 'normal',
        bossGauge: this.eclGaugeState(),
      },
      this.itemSystem.items,
    );
  }
}
