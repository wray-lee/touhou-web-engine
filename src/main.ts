import { TH08Game } from './games/th08/TH08Game';
import { enemySpriteKey } from './games/th08/EclAdapter';
import { GameSelection, ResultsReport, TH08Menu } from './games/th08/ui/TH08Menu';
import { PauseMenu } from './games/th08/ui/PauseMenu';
import { TouchControls } from './games/th08/ui/TouchControls';
import { PlayerPrefs, loadPrefs, savePrefs } from './games/th08/ui/PlayerPrefs';
import type { CharacterId } from './touhou-common/player/CharacterProfile';
import type { Difficulty } from './games/th08/types';
import { ROUTE_ORDER, type StageRoute } from './games/th08/StageRoute';
import type { StageRunner } from './th08/sim/StageRunner';

declare global {
  interface Window {
    __TOUHOU_GAME__?: TH08Game;
  }
}

/** Simulation frames `?warp` steps per macrotask, so the page stays responsive. */
const WARP_CHUNK = 400;

/**
 * A finished run for `?resultscreen`, shaped like a Lunatic stage-6 clear so the
 * settlement panel shows its widest score field and all eight stat rows at once.
 */
function settlementDemoReport(): ResultsReport {
  return {
    stage: 6,
    difficulty: 'lunatic',
    character: 'sakuya-remilia',
    score: 1845732,
    graze: 3121,
    spellBonus: 240000,
    livesLeft: 2,
    bombsLeft: 3,
    power: 128,
    maxPower: 128,
    campaignFinished: true,
    // A review fixture, so it never reaches the score file.
    demo: true,
    stats: {
      score: 1845732,
      retries: 1,
      difficulty: 'lunatic',
      playFrames: 152000,
      deaths: 4,
      bombsUsed: 9,
      cardsCaptured: 11,
      lagFraction: 0.12,
      fullCompletion: true,
    },
  };
}

/**
 * Host shell: owns the front-end menu flow, the pause menu and the touch pad,
 * and mirrors player preferences into the running game.
 */
class TH08Shell {
  private readonly container: HTMLElement;
  private readonly prefs: PlayerPrefs = loadPrefs();
  private game?: TH08Game;
  private menu: TH08Menu;
  private stopMirror?: () => void;
  private pause?: PauseMenu;
  private touch?: TouchControls;

  constructor(container: HTMLElement, menuRoot: HTMLElement) {
    this.container = container;
    this.menu = new TH08Menu(menuRoot, {
      onStart: (selection) => void this.launch(selection),
      getReplay: () => this.game?.getReplayJson() ?? null,
      onReplayLoad: (json) => this.playReplay(json),
      onPrefsChange: (prefs) => this.applyPrefs(prefs),
    });
  }

  boot(): void {
    /*
     * `?resultscreen` lands straight on the settlement screen. Every other screen
     * can be reached from a URL, but this one needed a cleared stage, which makes
     * it the only one nobody can review without playing a round.
     */
    if (new URLSearchParams(window.location.search).has('resultscreen')) {
      this.menu.showResults(settlementDemoReport());
      return;
    }
    const deepLink = selectionFromUrl();
    if (deepLink) {
      void this.launch(deepLink);
      return;
    }
    this.menu.showTitle();
  }

  private async launch(selection: GameSelection): Promise<void> {
    this.teardownRun();
    this.container.replaceChildren();
    this.menu.hide();
    this.setPlaying(true);
    const game = new TH08Game({
      ...selection,
      campaign: selection.campaign !== false,
      recordReplay: true,
      showPerformanceMonitor: false,
      onStageClear: (report) => this.finishRun(report),
    });
    this.game = game;
    window.__TOUHOU_GAME__ = game;
    this.applyPrefs(this.prefs);
    // Before `init()`: loading a stage can hand back its `StageRunner` inside the
    // await, and the runner copies these flags as it is created. Setting them
    // afterwards left `?nofail` off for exactly the run it was meant to protect.
    this.applyUrlDebugFlags(game);
    await game.init(this.container);
    this.mountOverlays(game);
    await this.warpFrames(game);
    game.start();
    this.mirrorState(game);
  }

  /**
   * QA-only URL switches. `?autofire` holds the shoot button down, which is the only
   * way an automation context can reach the parts of the game that need firing:
   * browsers refuse to let it synthesise a trusted key event. `?slow=1` does the same
   * for focus mode, so the hitbox marker can be screenshotted.
   * `?nofail` declines the life loss without declining the collision, so a scripted
   * run can sit in front of a spell card long enough to draw it.
   */
  private applyUrlDebugFlags(game: TH08Game): void {
    const params = new URLSearchParams(window.location.search);
    game.debugAutoShoot = params.has('autofire');
    // `?autobomb` drops a card every four seconds, which is how a bomb's own
    // backdrop plate gets checked on a live page.
    game.debugAutoBomb = params.has('autobomb');
    // `?autoskip` holds retail's SKIP button (VK_CONTROL, `Global.cpp:742`), which
    // walks a conversation at one instruction per frame (`Gui.cpp:373-379`) and is
    // the only way to read a whole script without synthesising key presses.
    game.debugAutoSkip = params.has('autoskip');
    game.debugSlowMode = params.has('slow');
    game.debugNoFail = params.has('nofail');
    // `?maxpower` parks a full-power item on the ship on the next frame, which is
    // the only cheap way to look at the max-power sweep and its banner.
    game.debugMaxPower = params.has('maxpower');
    // `?renderer=webgl` pins the GPU backend. The backdrop's fog is written twice -
    // WGSL for WebGPU and GLSL for WebGL - and on a machine where WebGPU works, this
    // is the only way to get the second one on screen. `data-dbg.gpu` reports which
    // one Pixi actually took, so a forced-but-unavailable backend shows up too.
    const backend = params.get('renderer');
    game.rendererBackend = backend === 'webgl' || backend === 'webgpu' ? backend : undefined;
    // `?nofog` is the same switch the options screen offers (`cfg.opts.disableFog` in
    // retail). QA uses it to shoot a backdrop with and without the colour mix.
    if (params.has('nofog')) game.fogEnabled = false;
    // `?ticks=N` advances the simulation N times per animation frame. A full campaign
    // is around 200k frames, which is more than an hour at 60 fps; eight times gets a
    // single page through every stage in minutes without pausing or warping, so a
    // stage seam is still seen passing rather than skipped over.
    game.simTicksPerFrame = Math.max(1, Math.min(12, Number(params.get('ticks')) || 1));
  }

  /**
   * `?warp=N` runs N simulation frames before the first render.
   *
   * Walking to a stage boss costs about a minute of wall clock, which makes every
   * visual check on a card or a cut-in expensive enough to skip. Warping replays
   * those frames with nothing drawn, so the screenshot lands in seconds instead of
   * a minute. Inert without the parameter.
   *
   * The warp has to be asynchronous. The route script arrives on a later event-loop
   * turn (`tryLoadEcl` resolves a dynamic import), so a synchronous spin burned the
   * whole warp on empty pre-script frames and every deep link landed back at frame
   * ~1100. Waiting for the runner and then stepping in yielded chunks fixes that, and
   * the yields are also what lets sprite pages and the next stage's chunk resolve
   * while a 40 000-frame warp is in flight.
   */
  private async warpFrames(game: TH08Game): Promise<void> {
    const raw = Number(new URLSearchParams(window.location.search).get('warp'));
    if (!Number.isFinite(raw) || raw <= 0) return;
    const frames = Math.min(60000, Math.floor(raw));
    await game.waitForScript(400);
    for (let done = 0; done < frames; done += WARP_CHUNK) {
      const stop = Math.min(frames, done + WARP_CHUNK);
      for (let i = done; i < stop; i++) game.stepFrame(1);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  /**
   * Mirror a compact run snapshot onto the DOM.
   *
   * The canvas keeps every number to itself, so automation and the devtools
   * console need one place to read the live sim from. `#game-root[data-dbg]`
   * is that place; it costs one attribute write per frame.
   */
  private mirrorState(game: TH08Game): void {
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const p = game.player;
      const r = game.eclRunner;
      // Art coverage: how many live enemies actually resolved to original .anm
      // cells this frame. Anything below the active count is falling back to the
      // procedural silhouette, which is the first thing to check when the field
      // looks wrong.
      const assets = game.renderer?.assets;
      let artDrawn = 0;
      let artLive = 0;
      // Bullet accounting is split three ways because the presentation pool and the
      // ECL sim pool are separate objects: a full screen with `blt` at 0 means the
      // sprites are not coming from the ECL enemy pool.
      const pool = game.bulletSystem.getBullets();
      let playerShots = 0;
      let enemyBullets = 0;
      for (const b of pool) {
        if (!b.isAlive) continue;
        if (b.tag === 'player-bullet') playerShots++;
        else enemyBullets++;
      }
      if (r && assets) {
        for (const slot of r.enemies.slots) {
          if (!slot.active) continue;
          artLive++;
          if (assets.has(enemySpriteKey(slot))) artDrawn++;
        }
      }
      const gauge = r?.bossGauge ?? null;
      this.container.dataset.dbg = JSON.stringify({
        st: game.stageNumber,
        // Which of the nine retail scripts is actually driving the field. Stage 4
        // and stage 6 each have two routes behind the same printed number.
        route: game.route,
        ecl: r ? 1 : 0,
        f: r ? r.gs.frame : game.stage.currentFrame,
        // The rank ladder and the card flag are what the 妖率/难度 systems actually
        // run on, and both were invisible until now: `rank` scales the ECL operands,
        // `sub` is its carry, `fstop` is retail's `Player+0xFDC`. It is not the same
        // thing as `card` below, which carries the card's name: a name can be on the
        // plate while the flag is down, and the flag is the one the rules read.
        rank: r ? r.gs.rank : 0,
        sub: r ? r.gs.subRank : 0,
        fstop: r ? (r.gs.bombRunning ? 1 : 0) : 0,
        /**
         * A conversation owns the screen, which is retail's `Gui::IsDialogPresent`.
         * While this reads 1 the field is frozen on `g_EclScriptedGlobalUpdateFreeze`:
         * bullets and enemy scripts hang in the air, the stage timeline feeds the
         * field nothing, and the shot and bomb keys read as unpressed.
         */
        dlg: game.dialogPresent ? 1 : 0,
        lives: p.lives,
        bombs: p.bombs,
        pow: Math.round(p.power),
        graze: p.graze,
        score: p.score,
        x: Math.round(p.position.x),
        y: Math.round(p.position.y),
        member: p.member.id,
        slow: p.isSlowMode ? 1 : 0,
        state: p.state,
        blt: r ? r.bullets.activeCount : game.bulletSystem.getCount(),
        laz: r ? r.lasers.activeCount : 0,
        pb: playerShots,
        eb: enemyBullets,
        en: r ? r.enemies.activeCount : game.enemies.length,
        mouse: game.input.mouseControl ? 1 : 0,
        /** Which hour of the endless night the run is on (`globals->clockTime`). */
        clk: game.runClockTime,
        art: r ? artDrawn + '/' + artLive : '-',
        /** Renderer sprite ledger: [held, drawn] for enemies then items. Held must equal drawn. */
        spr: game.renderer?.spriteAudit ?? null,
        /** Item-state census as [free, grabbed, rising, gliding]. */
        itm: r ? itemStateCensus(r) : null,
        /**
         * The live card's backdrop as [id, plateColour, plate%·100, flash%·100, redShip].
         * This is the only way to see the bomb wash from outside the page's own world.
         */
        wash: r
          ? [
              r.activeBomb?.spec.id ?? '-',
              r.bombBackdrop.plate?.color ?? -1,
              Math.round((r.bombBackdrop.plate?.alpha ?? 0) * 100),
              Math.round((r.bombBackdrop.flash?.alpha ?? 0) * 100),
              r.player.bombStateFlash ? 1 : 0,
            ]
          : null,
        anim: game.renderer?.playerAnimState ?? '',
        /** Which GPU backend is drawing: 'webgpu' or 'webgl'. */
        gpu: game.renderer?.backend ?? '-',
        pop: game.activePopupCount,
        /** Live popups as `b<bank> a<alpha> s<scale> n<digits>`: the two retail
         *  channels a still frame cannot separate - bank flicker and distance fade. */
        popd: game.popupDebug,
        /** Panel/reward text the HUD is being asked to draw this frame. */
        bnr: game.bannerDebug,
        /** Card the scripts have up right now, straight from op 122. */
        card: r?.gs.spellName ?? null,
        /**
         * The player's own card while it flies, and the frames left on the death
         * bomb window. QA reads these to tell a spell card apart from a deathbomb,
         * and `grc` is the only proof the grace period is real.
         */
        pbm: r?.activeBomb?.spec.nameJp ?? null,
        grc: r ? r.player.graceTimer : p.graceTimer,
        /** Cut-in art key the banner asked for, its live window, and loaded faces. */
        cin: game.hud.spellCutIn,
        cdt: game.hud.spellCardDisplayTimer,
        faces: game.facePages,
        /** Boss life bar as the scripts own it: [hp, maxHp, spare pips, card clock]. */
        b: gauge ? [Math.round(gauge.hp), Math.round(gauge.maxHp), gauge.pips, gauge.timerFrames] : null,
        /** Run totals the cards feed: time orbs, banked spell bonus, cards ended. */
        to: r ? Math.round(r.gs.timeOrbs) : 0,
        sb: game.spellBonus,
        cl: game.spellLog.length,
        cap: game.hud.spellCaptured ? 1 : 0,
        std: game.backdropDebug,
        /** The retail message box: script id, printed lines, and the four faces. */
        msg: game.dialogueDebug,
        /** The raw request slot timeline op 6 writes, so a stall is diagnosable. */
        req: r ? r.gs.stageMessageRequest : -99,
        /** The script's own clock, which stops while a wait holds and so lags `f`. */
        tl: r ? r.timeline.scriptTimer : -99,
        /** The music slot actually on the channel, so a QA pass can tell op 7's
         *  boss switch from the stage-start one. */
        bgm: game.audio.bgmName,
        /** [recordings decoded, requests waiting]: proves the SE bank is really there. */
        se: [game.audio.seLoaded, game.audio.sePending],
        /** Where the player's own shots actually are. A ring that never leaves the
         *  ship is the signature of shots that stopped integrating. */
        pbf: playerShotDebug(game),
        /** The partner's option slots and the field's aim target, which together are
         *  the difference between a 式神 that hovers and one that attacks. */
        opt: r ? optionDebug(r) : null,
        /** `Player.tailPosition0`, the point 霊夢's charms bend toward. Retail rebuilds it
         *  from this frame's enemies (`Player.cpp:1100`), and the suffix says which rule owns
         *  it: `b` = a boss is up, `w` = hunting the lowest enemy. An aim that sits still
         *  while the waves below move is the carry-forward bug this field was added for. */
        aim: r
          ? `${Math.round(r.tailPosition.x)},${Math.round(r.tailPosition.y)}${
              r.tailPosition.valid ? 'b' : 'w'
            }`
          : null,
        /** The live enemy slots, nearest the ship first: where danmaku comes from. */
        enm: enemyDebug(game),
      });
      if (sceneDebug) {
        this.container.dataset.scene = describeHudSprites(game);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    this.stopMirror = () => {
      alive = false;
    };
  }

  private mountOverlays(game: TH08Game): void {
    this.pause = new PauseMenu(this.container, {
      onResume: () => game.resume(),
      onRestart: () => {
        game.restartStage();
        game.start();
      },
      onQuit: () => this.returnToTitle(),
      onToggleMouse: () => {
        this.prefs.mouseControl = !this.prefs.mouseControl;
        this.persist();
        game.input.setMouseControl(this.prefs.mouseControl);
        return this.prefs.mouseControl;
      },
      isMouseControl: () => this.prefs.mouseControl,
      onToggleBgm: () => {
        this.toggleBgm(game);
        return true;
      },
    });
    game.onPauseChange = (paused) => {
      if (paused) this.pause?.show();
      else this.pause?.hide();
    };
    this.touch = new TouchControls(this.container, game.input);
    this.touch.show(this.prefs.touchControls);
  }

  private finishRun(report: ResultsReport): void {
    const game = this.game;
    if (game) {
      report.replayJson = game.getReplayJson() ?? undefined;
      game.stop();
    }
    this.pause?.hide();
    this.touch?.hide();
    this.setPlaying(false);
    this.menu.showResults(report);
  }

  /** Feed a recorded run back through the engine: input replays, AI stays live. */
  private playReplay(json: string): void {
    try {
      const parsed = JSON.parse(json) as {
        metadata?: { stage?: number; difficulty?: string; character?: string };
      };
      const meta = parsed.metadata ?? {};
      void this.launch({
        stage: (Number(meta.stage) || 1) as GameSelection['stage'],
        difficulty: (meta.difficulty ?? 'normal') as GameSelection['difficulty'],
        character: (meta.character ?? 'reimu-yukari') as GameSelection['character'],
      }).then(() => {
        this.game?.stop();
        this.game?.loadReplayJson(json);
        this.game?.start();
        this.menu.hide();
      });
    } catch (error) {
      console.error('Replay load failed', error);
    }
  }

  private returnToTitle(): void {
    this.teardownRun();
    this.setPlaying(false);
    this.menu.showTitle();
  }

  /**
   * A run owns the page: the header and the engine-harness links fade out so the
   * browser tab reads as a game rather than a demo scaffold.
   */
  private setPlaying(playing: boolean): void {
    document.body.classList.toggle('is-playing', playing);
  }

  private teardownRun(): void {
    this.stopMirror?.();
    this.stopMirror = undefined;
    this.pause?.hide();
    this.touch?.hide();
    this.pause = undefined;
    this.touch = undefined;
    this.game?.destroy();
    this.game = undefined;
    window.__TOUHOU_GAME__ = undefined;
  }

  private applyPrefs(prefs: PlayerPrefs): void {
    Object.assign(this.prefs, prefs);
    this.persist();
    const game = this.game;
    if (!game) return;
    game.input.setMouseControl(this.prefs.mouseControl);
    game.audio.setBgmVolume(this.prefs.bgmVolume);
    game.setPlayerSkin(this.prefs.playerSkin);
    game.fogEnabled = this.prefs.fog;
    this.touch?.hide();
    this.touch = new TouchControls(this.container, game.input);
    this.touch.show(this.prefs.touchControls);
  }

  private persist(): void {
    savePrefs(this.prefs);
  }

  private toggleBgm(game: TH08Game): void {
    /*
     * Pause and resume rather than start over: a fresh `playBGM(undefined, ...)`
     * would replace whatever stage theme is running with the synthesised stand-in.
     */
    if (game.audio.isBgmPlaying) game.audio.pauseBGM();
    else game.audio.resumeBGM();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-root');
  const menuRoot = document.getElementById('menu-root');
  if (!container || !menuRoot) return;
  new TH08Shell(container, menuRoot).boot();
});

/**
 * Flatten the HUD layer for QA: label, texture and world bounds of every visible
 * sprite, including the 32x32 panel tiles. Gated on `?dbgscene` because it walks
 * the graph every frame. Read it back from `#game-root.dataset.scene`.
 */
function describeHudSprites(game: TH08Game): string {
  const stage = game.renderer?.app?.stage;
  if (!stage) return '';
  const parts: string[] = [];
  const walk = (node: { children?: unknown[]; label?: string }, layer: string): void => {
    for (const child of node.children ?? []) {
      const c = child as {
        visible?: boolean;
        label?: string;
        x?: number;
        y?: number;
        texture?: { width?: number; height?: number; label?: string };
        scale?: { x?: number; y?: number };
        alpha?: number;
        rotation?: number;
        children?: unknown[];
        text?: unknown;
        getBounds?: () => { x: number; y: number; width: number; height: number };
      };
      if (c.visible === false || (c.alpha ?? 1) < 0.05) continue;
      const name = c.label || layer || 'node';
      const b = c.getBounds?.();
      if (c.texture || c.text !== undefined) {
        const sx = c.scale?.x ?? 1;
        const sy = c.scale?.y ?? 1;
        parts.push(
          layer +
            '/' +
            name +
            (c.texture
              ? ' ' + c.texture.width + 'x' + c.texture.height
              : ' TXT"' + String(c.text).slice(0, 14) + '"') +
            (b
              ? ' box=' +
                Math.round(b.x) +
                ',' +
                Math.round(b.y) +
                ' ' +
                Math.round(b.width) +
                'x' +
                Math.round(b.height)
              : '') +
            '@' +
            Math.round(c.x ?? 0) +
            ',' +
            Math.round(c.y ?? 0) +
            (sx !== 1 || sy !== 1 ? ' s=' + sx.toFixed(2) + ',' + sy.toFixed(2) : '') +
            (c.rotation ? ' r=' + c.rotation.toFixed(2) : ''),
        );
      }
      walk(c, c.label ? c.label : layer);
    }
  };
  walk(stage, 'stage');
  return parts.slice(0, 400).join(' | ');
}
/** Set with `?dbgscene`; makes the mirror also flatten the HUD sprite list. */
const sceneDebug = new URLSearchParams(window.location.search).has('dbgscene');

/**
 * A short text dump of the live enemy slots, for QA.
 *
 * Danmaku belongs to an enemy, so a stream that appears out of nowhere is only
 * explainable by the slot that fired it. Nearest the ship first, because that is
 * the one that can actually hit, and the sub id names which script is running.
 */
function enemyDebug(game: TH08Game): string {
  const runner = game.eclRunner;
  if (!runner) return '-';
  const px = game.player.position.x;
  const py = game.player.position.y;
  const live = runner.enemies.slots.filter((slot) => slot.active);
  live.sort((a, b) => Math.hypot(a.posX - px, a.posY - py) - Math.hypot(b.posX - px, b.posY - py));
  return (
    live
      .slice(0, 5)
      .map(
        (slot) =>
          slot.posX.toFixed(0) +
          ',' +
          slot.posY.toFixed(0) +
          ' h' +
          slot.hp +
          ' s' +
          slot.subId +
          ' d' +
          Math.hypot(slot.posX - px, slot.posY - py).toFixed(0) +
          // Which atlas the adapter will ask for, and which script armed it.
          ' cell' +
          (slot.anmSprite ?? -1) +
          '/scr' +
          slot.anmScript +
          (slot.anmUseStagePack ? 'S' : 'E') +
          (slot.anmFlipX ? 'F' : '') +
          (slot.isBoss ? ' B' : '') +
          (slot.linkedChild ? ' C' : ''),
      )
      .join(' | ') +
    ' (n=' +
    live.length +
    ')'
  );
}

/**
 * A short text dump of the live player shots, for QA.
 *
 * The `.sht` pool owns the ship's weapon now - `Player::FUN_004512f0` walks those
 * 128 slots and the presentation pool has nothing left to report - so a weapon that
 * stops integrating looks identical to one that never existed. The header counts the
 * ring (`n` live, `o` of them fired by an option) because the two are different
 * failures - a 式神 that is out but silent has `o0` - and the rows put the option's
 * own shots first, since they are the ones a three-slot window used to hide. `@o2`
 * names the slot they left from; a trailing `*` marks one that has already spent
 * itself on a hit.
 */
function playerShotDebug(game: TH08Game): string {
  const runner = game.eclRunner;
  if (!runner) return '-';
  const live = runner.shots.shots.filter((shot) => shot.state !== 0);
  const row = (shot: (typeof live)[number]) =>
    shot.x.toFixed(0) +
    ',' +
    shot.y.toFixed(0) +
    ' v' +
    Math.hypot(shot.vx, shot.vy).toFixed(2) +
    ' h' +
    shot.angle.toFixed(2) +
    (shot.entry && shot.entry.option > 0 ? '@o' + shot.entry.option : '') +
    (shot.state === 2 ? '*' : '');
  const byOption = live.filter((shot) => shot.entry && shot.entry.option > 0);
  const rest = live.filter((shot) => !shot.entry || shot.entry.option === 0);
  return `n${live.length} o${byOption.length} ` + [...byOption, ...rest].slice(0, 4).map(row).join(' | ');
}

/**
 * The four option slots - 僚机 / 式神 / 分身 - as `state.substate x,y:sprite/alpha`.
 *
 * Every partner weapon lives here: 紫's 式神, 爱丽丝's doll, 蕾米莉亚's four
 * familiars, 妖梦's blades. A slot that never leaves state 0 is the whole of a
 * missing weapon, and the trailing target is `g_Player.optionHomingTarget`, which
 * is what turns a hovering 式神 into a chasing one.
 */
function optionDebug(runner: StageRunner): string {
  const slots = runner.options.options
    .map(
      (o, i) =>
        `${i}:${o.state}.${o.substate} ${Math.round(o.x)},${Math.round(o.y)}` +
        ` s${o.vm.sprite}/${Math.round(o.vm.color1.a)}${o.vm.visible ? '' : '!'}`,
    )
    .join(' ');
  const target = runner.options.homingTarget;
  return slots + (target ? ` tgt ${Math.round(target.x)},${Math.round(target.y)}` : ' tgt -');
}

/**
 * Item-state census for QA, as `[free, grabbed, rising, gliding]`.
 *
 * The three retail `ItemState`s are invisible in a still frame: a rising 时符 shares
 * its sprite with a plain one, and a death pile mid-glide looks like anything else
 * that is falling. Four counts make the difference readable, and the last column is
 * the one that catches a pile that never stopped gliding.
 */
function itemStateCensus(runner: StageRunner): number[] {
  const census = [0, 0, 0, 0];
  for (const item of runner.items.items) {
    if (!item.active) continue;
    if (item.rise === 'hover' || item.rise === 'hoverDouble') census[2]++;
    else if (item.rise === 'scatter') census[3]++;
    else if (item.magnetized) census[1]++;
    else census[0]++;
  }
  return census;
}

/**
 * Deep link for QA and automation: `?autostart[&team=&diff=&stage=&practice=1]`.
 *
 * Clicking through title → team → difficulty costs ~20 s per screenshot, which
 * makes the visual matrix in the plan impractical to run. Landing straight in
 * combat keeps that matrix honest. Inert without `?autostart`.
 */
function selectionFromUrl(): GameSelection | null {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('autostart')) return null;
  const characters: CharacterId[] = ['reimu-yukari', 'marisa-alice', 'sakuya-remilia', 'youmu-yuyuko'];
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'lunatic'];
  const team = params.get('team') ?? '';
  const diff = params.get('diff') ?? '';
  const stage = Number(params.get('stage'));
  // Practice may also name a branch directly, which is how QA reaches 4B and 6B.
  const route = params.get('route') ?? '';
  const knownRoute = (ROUTE_ORDER as readonly string[]).includes(route) ? (route as StageRoute) : undefined;
  return {
    character: (characters as string[]).includes(team) ? (team as CharacterId) : 'reimu-yukari',
    difficulty: (difficulties as string[]).includes(diff) ? (diff as Difficulty) : 'normal',
    stage: (stage >= 1 && stage <= 6 ? Math.floor(stage) : 1) as GameSelection['stage'],
    route: knownRoute,
    campaign: params.get('practice') !== '1' && !knownRoute,
  };
}
