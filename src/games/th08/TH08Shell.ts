import { TH08Game } from './TH08Game';
import { enemySpriteKey } from './EclAdapter';
import { GameSelection, ResultsReport, TH08Menu } from './ui/TH08Menu';
import { PauseMenu } from './ui/PauseMenu';
import { TouchControls } from './ui/TouchControls';
import { PlayerPrefs, loadPrefs, savePrefs } from './ui/PlayerPrefs';
import type { CharacterId } from '../../touhou-common/player/CharacterProfile';
import type { Difficulty } from './types';
import { ROUTE_ORDER, type StageRoute } from './StageRoute';
import type { StageRunner } from '../../th08/sim/StageRunner';
import { PLAYFIELD_H, PLAYFIELD_W } from '../../th08/sim/Playfield';

declare global {
  interface Window {
    __TOUHOU_GAME__?: TH08Game;
  }
}

/** Simulation frames `?warp` steps per macrotask, so the page stays responsive. */
const WARP_CHUNK = 400;

export interface TH08ShellOptions {
  /** Whether to listen to URL search params (?resultscreen, ?autostart, ?warp, debug flags). */
  listenUrlParams?: boolean;
  /** Whether to toggle document.body.classList 'is-playing' */
  toggleBodyClass?: boolean;
  /** Callback when stage or campaign completes. */
  onStageClear?: (report: ResultsReport) => void;
  /** Callback when initialization or launch fails. */
  onError?: (error: Error) => void;
}

/**
 * A finished run for `?resultscreen`, shaped like a Lunatic stage-6 clear so the
 * settlement panel shows its widest score field and all eight stat rows at once.
 */
export function settlementDemoReport(): ResultsReport {
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
export class TH08Shell {
  private readonly container: HTMLElement;
  public readonly menuRoot: HTMLElement;
  private readonly options: TH08ShellOptions;
  private readonly prefs: PlayerPrefs = loadPrefs();
  private game?: TH08Game;
  private menu: TH08Menu;
  private stopMirror?: () => void;
  private pause?: PauseMenu;
  private touch?: TouchControls;
  private destroyed = false;

  constructor(container: HTMLElement, menuRoot: HTMLElement, options: TH08ShellOptions = {}) {
    this.container = container;
    this.menuRoot = menuRoot;
    this.options = options;
    this.menu = new TH08Menu(menuRoot, {
      onStart: (selection) => {
        void this.launch(selection).catch((err) => {
          this.options.onError?.(err instanceof Error ? err : new Error(String(err)));
        });
      },
      getReplay: () => this.game?.getReplayJson() ?? null,
      onReplayLoad: (json) => this.playReplay(json),
      onPrefsChange: (prefs) => this.applyPrefs(prefs),
    });
  }

  public getGame(): TH08Game | undefined {
    return this.game;
  }

  public async boot(): Promise<void> {
    if (this.destroyed) return;
    if (this.options.listenUrlParams && typeof window !== 'undefined') {
      if (new URLSearchParams(window.location.search).has('resultscreen')) {
        this.menu.showResults(settlementDemoReport());
        return;
      }
      const deepLink = selectionFromUrl();
      if (deepLink) {
        await this.launch(deepLink);
        return;
      }
    }
    this.menu.showTitle();
  }

  public async launch(selection: GameSelection): Promise<void> {
    if (this.destroyed) return;
    this.teardownRun();
    this.container.replaceChildren();
    this.menu.hide();
    this.setPlaying(true);

    const game = new TH08Game({
      ...selection,
      campaign: selection.campaign !== false,
      recordReplay: true,
      showPerformanceMonitor: false,
      onStageClear: (report) => {
        this.options.onStageClear?.(report);
        this.finishRun(report);
      },
    });
    this.game = game;
    if (typeof window !== 'undefined') {
      window.__TOUHOU_GAME__ = game;
    }
    this.applyPrefs(this.prefs);
    if (this.options.listenUrlParams) {
      this.applyUrlDebugFlags(game);
    }

    try {
      await game.init(this.container);
      if (this.destroyed || this.game !== game) {
        game.destroy();
        return;
      }
      this.mountOverlays(game);
      if (this.options.listenUrlParams) {
        await this.warpFrames(game);
        if (this.destroyed || this.game !== game) {
          game.destroy();
          return;
        }
      }
      game.start();
      this.mirrorState(game);
    } catch (err) {
      if (this.destroyed) {
        game.destroy();
        return;
      }
      throw err;
    }
  }

  private applyUrlDebugFlags(game: TH08Game): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    game.debugAutoShoot = params.has('autofire');
    game.debugAutoBomb = params.has('autobomb');
    game.debugAutoSkip = params.has('autoskip');
    game.debugSlowMode = params.has('slow');
    game.debugNoFail = params.has('nofail');
    game.debugMaxPower = params.has('maxpower');
    const backend = params.get('renderer');
    game.rendererBackend = backend === 'webgl' || backend === 'webgpu' ? backend : undefined;
    if (params.has('nofog')) game.fogEnabled = false;
    game.simTicksPerFrame = Math.max(1, Math.min(12, Number(params.get('ticks')) || 1));
  }

  private async warpFrames(game: TH08Game): Promise<void> {
    if (typeof window === 'undefined') return;
    const raw = Number(new URLSearchParams(window.location.search).get('warp'));
    if (!Number.isFinite(raw) || raw <= 0) return;
    const frames = Math.min(60000, Math.floor(raw));
    await game.waitForScript(400);
    for (let done = 0; done < frames; done += WARP_CHUNK) {
      if (this.destroyed || this.game !== game) return;
      const stop = Math.min(frames, done + WARP_CHUNK);
      for (let i = done; i < stop; i++) game.stepFrame(1);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  private mirrorState(game: TH08Game): void {
    let alive = true;
    const sceneDebug =
      this.options.listenUrlParams && typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).has('dbgscene')
        : false;

    const tick = () => {
      if (!alive) return;
      const p = game.player;
      const r = game.eclRunner;
      const assets = game.renderer?.assets;
      let artDrawn = 0;
      let artLive = 0;
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
        route: game.route,
        ecl: r ? 1 : 0,
        f: r ? r.gs.frame : game.stage.currentFrame,
        rank: r ? r.gs.rank : 0,
        sub: r ? r.gs.subRank : 0,
        fstop: r ? (r.gs.bombRunning ? 1 : 0) : 0,
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
        clk: game.runClockTime,
        art: r ? artDrawn + '/' + artLive : '-',
        spr: game.renderer?.spriteAudit ?? null,
        itm: r ? itemStateCensus(r) : null,
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
        gpu: game.renderer?.backend ?? '-',
        pop: game.activePopupCount,
        popd: game.popupDebug,
        fx: game.effectDebug,
        bnr: game.bannerDebug,
        card: r?.gs.spellName ?? null,
        pbm: r?.activeBomb?.spec.nameJp ?? null,
        grc: r ? r.player.graceTimer : p.graceTimer,
        cin: game.hud.spellCutIn,
        cdt: game.hud.spellCardDisplayTimer,
        faces: game.facePages,
        b: gauge ? [Math.round(gauge.hp), Math.round(gauge.maxHp), gauge.pips, gauge.timerFrames] : null,
        to: r ? Math.round(r.gs.timeOrbs) : 0,
        thr: game.hud.timeOrbThreshold,
        sb: game.spellBonus,
        cl: game.spellLog.length,
        cap: game.hud.spellCaptured ? 1 : 0,
        std: game.backdropDebug,
        msg: game.dialogueDebug,
        req: r ? r.gs.stageMessageRequest : -99,
        tl: r ? r.timeline.scriptTimer : -99,
        bgm: game.audio.bgmName,
        se: [game.audio.seLoaded, game.audio.sePending],
        pbf: playerShotDebug(game),
        pdr: game.playerWeaponDebug,
        opt: r ? optionDebug(r) : null,
        aim: r
          ? `${Math.round(r.tailPosition.x)},${Math.round(r.tailPosition.y)}${
              r.tailPosition.valid ? 'b' : 'w'
            }`
          : null,
        enm: enemyDebug(game),
      });
      if (sceneDebug) {
        this.container.dataset.scene = describeHudSprites(game);
      }
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(tick);
      }
    };
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(tick);
    }
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

  private setPlaying(playing: boolean): void {
    if (this.options.toggleBodyClass && typeof document !== 'undefined') {
      document.body.classList.toggle('is-playing', playing);
    }
  }

  public teardownRun(): void {
    this.stopMirror?.();
    this.stopMirror = undefined;
    this.pause?.hide();
    this.touch?.hide();
    this.pause = undefined;
    this.touch = undefined;
    this.game?.destroy();
    this.game = undefined;
    if (typeof window !== 'undefined' && window.__TOUHOU_GAME__) {
      window.__TOUHOU_GAME__ = undefined;
    }
  }

  public destroy(): void {
    this.destroyed = true;
    this.teardownRun();
    this.menu.hide();
    this.setPlaying(false);
  }

  public applyPrefs(prefs: Partial<PlayerPrefs>): void {
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
    if (game.audio.isBgmPlaying) game.audio.pauseBGM();
    else game.audio.resumeBGM();
  }
}

export function describeHudSprites(game: TH08Game): string {
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

export function enemyDebug(game: TH08Game): string {
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

export function playerShotDebug(game: TH08Game): string {
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

export function optionDebug(runner: StageRunner): string {
  const slots = runner.options.options
    .map(
      (o, i) =>
        `${i}:${o.state}.${o.substate} ${Math.round(o.x)},${Math.round(o.y)}` +
        ` s${o.vm.sprite}/${Math.round(o.vm.color1.a)}${o.vm.visible ? '' : '!'}`,
    )
    .join(' ');
  const target = runner.options.homingTarget;
  const off =
    target && (target.x < 0 || target.x > PLAYFIELD_W || target.y < 0 || target.y > PLAYFIELD_H) ? '!' : '';
  return slots + (target ? ` tgt ${Math.round(target.x)},${Math.round(target.y)}${off}` : ' tgt -');
}

export function itemStateCensus(runner: StageRunner): number[] {
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

export function selectionFromUrl(): GameSelection | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  if (!params.has('autostart')) return null;
  const characters: CharacterId[] = ['reimu-yukari', 'marisa-alice', 'sakuya-remilia', 'youmu-yuyuko'];
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'lunatic'];
  const team = params.get('team') ?? '';
  const diff = params.get('diff') ?? '';
  const stage = Number(params.get('stage'));
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
