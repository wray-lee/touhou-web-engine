import type { StageClearResult } from '../TH08Game';
import { TAISEI_DIFFICULTY_LOGO, partnerPortraitUrl, teamPortraitUrl } from '../data/taisei-ui';
import { resolveAssetUrl } from '../../../engine/core/ResourceResolver';
import { PlayerSkin, PlayerPrefs, loadPrefs, savePrefs, TouchMode } from './PlayerPrefs';
import { RetailResultScreen, RESULT_STATS_LAYOUT, pad9, resultStatRows } from './RetailResultScreen';
import { Leaderboard, ScoreEntry } from '../../../engine/score/Leaderboard';
import { CHARACTER_PROFILES, CharacterId, DIFFICULTY_MODIFIERS, Difficulty, StageNumber } from '../types';
import { ROUTE_ORDER, displayStage, routeLabel, type StageRoute } from '../StageRoute';

/**
 * What the player picked once every menu screen has been answered.
 *
 * `stage` is always 1: like the original, confirming a team and a difficulty
 * drops you straight into 第一面 and the campaign carries on from there.
 *
 * `route` is the one exception: a practice entry may name a branch (4A/4B/6A/6B)
 * directly, which the printed stage number cannot express.
 */
export interface GameSelection {
  stage: StageNumber;
  route?: StageRoute;
  difficulty: Difficulty;
  character: CharacterId;
  campaign?: boolean;
}

/** Extra facts the results screen needs beyond StageClearResult. */
export interface ResultsReport extends StageClearResult {
  spellBonus: number;
  livesLeft: number;
  bombsLeft: number;
  power: number;
  maxPower: number;
  replayJson?: string;
  campaignFinished?: boolean;
  /** The run ended in GAME OVER rather than a cleared stage. */
  gameOver?: boolean;
  /**
   * A stand-in report used to review the settlement screen. It is never written to
   * the score file, which is what lets `?resultscreen` be opened any number of
   * times without burying the player's own records.
   */
  demo?: boolean;
}

export interface TH08MenuCallbacks {
  onStart: (selection: GameSelection) => void;
  /** Ask the running game for its recorded replay (results screen export). */
  getReplay?: () => string | null;
  /** Live preference changes from the options / pause screens. */
  onPrefsChange?: (prefs: PlayerPrefs) => void;
  /** Load a replay file back into the engine for playback. */
  onReplayLoad?: (json: string) => void;
  onQuit?: () => void;
}

type Screen =
  'title' | 'practice' | 'options' | 'character' | 'difficulty' | 'ranking' | 'controls' | 'results';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard', 'lunatic'];

const DIFFICULTY_BRIEF: Record<Difficulty, string> = {
  easy: '弹幕稀疏 · 残机 4 · 灵击 5 —— 熟悉谱面的观光模式',
  normal: '标准谱面 · 残机 3 · 灵击 3 —— 原作平衡',
  hard: '高速高密度 · 残机 2 · 灵击 3 —— 需要背板',
  lunatic: '极限谱面 · 残机 2 · 灵击 2 —— 符卡全部强化',
};

const KEY_LABEL = '↑↓ 选择 · Enter 确认 · Esc 返回 · 亦可用鼠标 / 触屏';

const TOUCH_LABEL: Record<TouchMode, string> = {
  auto: '自动 AUTO',
  always: '始终显示 ALWAYS',
  never: '关闭 OFF',
};

const SKIN_LABEL: Record<PlayerSkin, string> = {
  taisei: '原作优先 TAISEI',
  painted: '统一手绘 PAINTED',
};

/** Touhou-style letter rank from score, stage depth and difficulty pressure. */
export function computeRank(score: number, stage: StageNumber, difficulty: Difficulty): string {
  const bar = [900000, 2200000, 4000000, 6400000, 9200000, 12800000][stage - 1] ?? 12000000;
  const ratio = score / (bar * DIFFICULTY_MODIFIERS[difficulty].bulletDensity);
  if (ratio >= 1.6) return 'SS';
  if (ratio >= 1.2) return 'S';
  if (ratio >= 0.95) return 'A';
  if (ratio >= 0.7) return 'B';
  if (ratio >= 0.45) return 'C';
  if (ratio >= 0.2) return 'D';
  return 'E';
}

/**
 * The `%5s` of `OnDraw:2540`: a record's date as MM/DD, which is how the original
 * prints it beside the score.
 */
function listingDate(createdAt: string): string {
  const at = new Date(createdAt);
  if (Number.isNaN(at.getTime())) return '     ';
  return String(at.getMonth() + 1).padStart(2, '0') + '/' + String(at.getDate()).padStart(2, '0');
}

/**
 * Full front-end flow: title -> team select -> difficulty -> game (第一面) -> results.
 *
 * Every screen is keyboard- and pointer-navigable, and is skinned with the baked
 * atlas (ui:title backdrop, ui:portrait frames, character + boss sprites).
 */
export class TH08Menu {
  private readonly root: HTMLElement;
  /** Every focusable row across all screens; one screen renders one kind. */
  private static readonly NAV_SELECTOR =
    '[data-menu="team"],[data-menu="diff"],[data-menu="stage"],[data-menu="opt"],[data-menu="item"]';
  private readonly callbacks: TH08MenuCallbacks;
  private readonly leaderboard: Leaderboard;
  private screen: Screen = 'title';
  private cursor = 0;
  private selection: GameSelection = { stage: 1, difficulty: 'normal', character: 'reimu-yukari' };
  private practiceMode = false;
  private report: ResultsReport | null = null;
  private prefs: PlayerPrefs = loadPrefs();
  private keyHandler?: (event: KeyboardEvent) => void;
  /** The live retail settlement screen, when the results page is up. */
  private resultScreen: RetailResultScreen | null = null;
  private resultRaf = 0;
  private resultObserver: ResizeObserver | null = null;

  constructor(root: HTMLElement, callbacks: TH08MenuCallbacks, leaderboard = new Leaderboard()) {
    this.root = root;
    this.callbacks = callbacks;
    this.leaderboard = leaderboard;
  }

  // ---------------------------------------------------------------- title ---
  showTitle(): void {
    this.screen = 'title';
    this.cursor = 0;
    const items = ['开始游戏 START', '练习 PRACTICE', '选项 OPTIONS', '排行榜 RANKING', '操作说明 CONTROLS'];
    const body = items.map(
      (label, i) =>
        `<button type="button" class="th08-menu-item${i === 0 ? ' is-active' : ''}" data-menu="item" data-index="${i}">${label}</button>`,
    );
    this.render(
      'title',
      [
        '<p class="th08-menu-kicker">東方永夜抄 ～ Imperishable Night</p>',
        '<h2 class="th08-title-logo">永夜抄</h2>',
        '<p class="th08-menu-subtitle">WEB ENGINE · TH08 全六面 · 可扩展弹幕引擎</p>',
        '<nav class="th08-menu-list">' + body.join('') + '</nav>',
        '<p class="th08-menu-hint">' + KEY_LABEL + '</p>',
      ].join(''),
    );
    this.root.querySelectorAll<HTMLElement>('[data-menu="item"]').forEach((el) => {
      el.addEventListener('click', () => this.activateTitle(Number(el.dataset.index ?? 0)));
    });
  }

  private activateTitle(index: number): void {
    // One branch per row of the title list, in the order they are rendered.
    // Off-by-one here silently remaps the whole menu, so keep this in sync
    // with `items` in showTitle().
    switch (index) {
      case 0:
        this.practiceMode = false;
        this.selection.stage = 1;
        this.showCharacter();
        break;
      case 1:
        this.showPractice();
        break;
      case 2:
        this.showOptions();
        break;
      case 3:
        this.showRanking();
        break;
      default:
        this.showControls();
    }
  }

  // ------------------------------------------------------------ practice ---
  private showPractice(): void {
    this.practiceMode = true;
    this.screen = 'practice';
    this.cursor = 0;
    const stageItems = ROUTE_ORDER.map(
      (route, i) =>
        `<button type="button" class="th08-menu-item${i === 0 ? ' is-active' : ''}" data-menu="stage" data-index="${i}">${routeLabel(route)}</button>`,
    );
    this.render(
      'title',
      [
        '<p class="th08-menu-kicker">PRACTICE · 选关练习</p>',
        '<h2 class="th08-title-small">选择关卡</h2>',
        '<nav class="th08-menu-list">' + stageItems.join('') + '</nav>',
        '<p class="th08-menu-hint">' + KEY_LABEL + '</p>',
      ].join(''),
    );
    this.root.querySelectorAll<HTMLElement>('[data-menu="stage"]').forEach((el) => {
      const index = Number(el.dataset.index ?? 0);
      el.addEventListener('click', () => {
        this.choosePracticeStage(index);
      });
      el.addEventListener('mouseenter', () => this.setCursor(index));
    });
  }

  /**
   * Practice rows walk `ROUTE_ORDER`, i.e. the retail `Stage` enum without Extra,
   * so the drill list offers both branches of 4 and 6 rather than one row per
   * printed stage number.
   */
  private choosePracticeStage(index: number): void {
    const route = ROUTE_ORDER[Math.max(0, Math.min(ROUTE_ORDER.length - 1, index))];
    this.selection.route = route;
    this.selection.stage = displayStage(route);
    this.showCharacter();
  }

  // ------------------------------------------------------------- options ---
  /** Input / art / audio / fog preferences. Mouse steering is opt-in here (and in the pause menu). */
  /**
   * @param keepCursor re-render in place after a change, so the highlight stays on the row
   * the player just moved. Opening the screen fresh still starts at row 1.
   */
  showOptions(keepCursor = false): void {
    this.screen = 'options';
    if (!keepCursor) this.cursor = 0;
    const rows = [
      { label: '鼠标操作 MOUSE STEERING', value: this.prefs.mouseControl ? '开启 ON' : '关闭 OFF' },
      { label: '触屏按钮 TOUCH BUTTONS', value: TOUCH_LABEL[this.prefs.touchControls] },
      { label: '自机画风 PLAYER ART', value: SKIN_LABEL[this.prefs.playerSkin] },
      // Retail's own graphics flag: `cfg.opts.disableFog` (`Supervisor.cpp:1462`).
      { label: '雾效 FOG', value: this.prefs.fog ? '开启 ON' : '关闭 OFF' },
      { label: 'BGM 音量', value: Math.round(this.prefs.bgmVolume * 100) + '%' },
      { label: '清空排行榜 CLEAR RANKING', value: '' },
      { label: '返回 BACK', value: '' },
    ];
    const items = rows
      .map(
        (row, i) =>
          '<button type="button" class="th08-menu-item' +
          (i === this.cursor ? ' is-active' : '') +
          '" data-menu="opt" data-index="' +
          i +
          '"><span>' +
          row.label +
          '</span><span class="th08-opt-value">' +
          row.value +
          '</span></button>',
      )
      .join('');
    this.render(
      'options',
      [
        '<p class="th08-menu-kicker">OPTIONS · 设置</p>',
        '<h2 class="th08-title-small">选项</h2>',
        '<nav class="th08-menu-list">' + items + '</nav>',
        '<p class="th08-menu-hint">鼠标操作默认关闭：开启后光标位置即自机目标并自动连射 · ↑↓ Enter 调整</p>',
      ].join(''),
    );
    this.root.querySelectorAll<HTMLElement>('[data-menu="opt"]').forEach((el) => {
      const index = Number(el.dataset.index ?? 0);
      el.addEventListener('click', () => {
        this.cursor = index;
        this.activateOption();
      });
      el.addEventListener('mouseenter', () => this.setCursor(index));
    });
  }

  private activateOption(): void {
    const cycleTouch: Record<TouchMode, TouchMode> = { auto: 'always', always: 'never', never: 'auto' };
    if (this.cursor === 0) this.prefs.mouseControl = !this.prefs.mouseControl;
    else if (this.cursor === 1) this.prefs.touchControls = cycleTouch[this.prefs.touchControls];
    else if (this.cursor === 2)
      this.prefs.playerSkin = this.prefs.playerSkin === 'taisei' ? 'painted' : 'taisei';
    else if (this.cursor === 3) this.prefs.fog = !this.prefs.fog;
    else if (this.cursor === 4)
      this.prefs.bgmVolume =
        this.prefs.bgmVolume >= 1 ? 0 : Math.round((this.prefs.bgmVolume + 0.1) * 10) / 10;
    else if (this.cursor === 5) {
      this.leaderboard.clear();
      this.showOptions(true);
      return;
    } else {
      this.showTitle();
      return;
    }
    savePrefs(this.prefs);
    this.callbacks.onPrefsChange?.(this.prefs);
    this.showOptions(true);
  }

  get prefsSnapshot(): PlayerPrefs {
    return { ...this.prefs };
  }

  private showRanking(): void {
    this.screen = 'ranking';
    const rows = this.leaderboard.getEntries();
    this.render(
      'title',
      [
        '<p class="th08-menu-kicker">RANKING · 上位 10</p>',
        '<h2 class="th08-title-small">排行榜</h2>',
        /*
         * The same columns the original's listing screen prints, which is where a
         * score table belongs: retail keeps the table off the settlement panel and
         * shows it here instead.
         */
        this.retailListing(rows),
        '<button type="button" class="th08-menu-item" data-menu="back">返回 BACK</button>',
      ].join(''),
    );
    this.root
      .querySelector<HTMLElement>('[data-menu="back"]')
      ?.addEventListener('click', () => this.showTitle());
  }

  private showControls(): void {
    this.screen = 'controls';
    this.render(
      'title',
      [
        '<p class="th08-menu-kicker">CONTROLS</p>',
        '<h2 class="th08-title-small">操作说明</h2>',
        '<ul class="th08-key-list">',
        '<li><b>方向键 / WASD</b><span>移动自机</span></li>',
        '<li><b>Z / Space</b><span>射击（触屏拖动时自动连射）</span></li>',
        '<li><b>X</b><span>灵击 Spell（清屏 + 无敌）</span></li>',
        '<li><b>Shift</b><span>低速模式 · 显示判定点</span></li>',
        '<li><b>ESC</b><span>暂停菜单</span></li>',
        '<li><b>F12</b><span>性能浮层 FPS / 实体 / 碰撞比较</span></li>',
        '</ul>',
        '<button type="button" class="th08-menu-item" data-menu="back">返回 BACK</button>',
      ].join(''),
    );
    this.root
      .querySelector<HTMLElement>('[data-menu="back"]')
      ?.addEventListener('click', () => this.showTitle());
  }

  // ------------------------------------------------------- team select ---
  showCharacter(): void {
    this.screen = 'character';
    const ids = Object.keys(CHARACTER_PROFILES) as CharacterId[];
    this.cursor = Math.max(0, ids.indexOf(this.selection.character));
    const cards = ids.map((id, i) => {
      const p = CHARACTER_PROFILES[id];
      return [
        `<button type="button" class="th08-team-card${i === this.cursor ? ' is-active' : ''}" data-menu="team" data-index="${i}">`,
        '<span class="th08-team-pairs">',
        ...p.members.map((m, seat) => {
          const src = seat === 0 ? teamPortraitUrl(id) : partnerPortraitUrl(id);
          return (
            '<span class="th08-team-seat">' +
            `<img class="th08-team-portrait" src="${src}" alt="${TH08Menu.escape(m.name)}" draggable="false">` +
            '<i>' +
            (seat === 0 ? 'A' : 'B · SHIFT') +
            '</i>' +
            '</span>'
          );
        }),
        '</span>',
        '<span class="th08-team-name">' + TH08Menu.escape(p.name) + '</span>',
        '<span class="th08-team-sub">' + TH08Menu.escape(p.subtitle) + '</span>',
        '<span class="th08-team-pair">' +
          p.members.map((m) => TH08Menu.escape(m.name + ' ' + m.label + '·' + m.blurb)).join(' ⇄ ') +
          '</span>',
        '<span class="th08-team-stats">火力 ' +
          p.members[0].shotDamage +
          ' / ' +
          p.members[1].shotDamage +
          ' · 灵击 ' +
          p.bombDamage +
          ' · 速度 ' +
          p.fastSpeed +
          '</span>',
        '</button>',
      ].join('');
    });
    this.render(
      'character',
      [
        '<p class="th08-menu-kicker">STEP 1 / 2 · SELECT TEAM</p>',
        '<h2 class="th08-title-small">自机组选择</h2>',
        '<div class="th08-team-grid">' + cards.join('') + '</div>',
        '<p class="th08-menu-hint">' + KEY_LABEL + '</p>',
      ].join(''),
    );
    this.root.querySelectorAll<HTMLElement>('[data-menu="team"]').forEach((el) => {
      const index = Number(el.dataset.index ?? 0);
      el.addEventListener('click', () => this.confirmCharacter(index));
      el.addEventListener('mouseenter', () => this.setCursor(index));
    });
  }

  /**
   * Commit the picked team. Re-rendering the screen first would reset the cursor
   * back to the previously committed selection, so the index is passed straight in.
   */
  private confirmCharacter(index = this.cursor): void {
    const ids = Object.keys(CHARACTER_PROFILES) as CharacterId[];
    this.selection.character = ids[index] ?? 'reimu-yukari';
    this.showDifficulty();
  }

  // ---------------------------------------------------- difficulty select --
  showDifficulty(): void {
    this.screen = 'difficulty';
    this.cursor = Math.max(0, DIFFICULTY_ORDER.indexOf(this.selection.difficulty));
    const items = DIFFICULTY_ORDER.map(
      (d, i) =>
        `<button type="button" class="th08-diff-row${i === this.cursor ? ' is-active' : ''}" data-menu="diff" data-index="${i}">` +
        `<img class="th08-diff-logo" src="${resolveAssetUrl(TAISEI_DIFFICULTY_LOGO[d])}" alt="${DIFFICULTY_MODIFIERS[d].label}" draggable="false">` +
        `<span class="th08-diff-name">${DIFFICULTY_MODIFIERS[d].label}</span>` +
        `<span class="th08-diff-brief">${DIFFICULTY_BRIEF[d]}</span></button>`,
    );
    this.render(
      'difficulty',
      [
        '<p class="th08-menu-kicker">STEP 2 / 2 · DIFFICULTY</p>',
        '<h2 class="th08-title-small">难度选择</h2>',
        '<nav class="th08-menu-list">' + items.join('') + '</nav>',
        '<p class="th08-menu-hint">' + KEY_LABEL + ' · 确认后从第一面开始攻略全六面</p>',
      ].join(''),
    );
    this.root.querySelectorAll<HTMLElement>('[data-menu="diff"]').forEach((el) => {
      const index = Number(el.dataset.index ?? 0);
      el.addEventListener('click', () => this.confirmDifficulty(index));
      el.addEventListener('mouseenter', () => this.setCursor(index));
    });
  }

  private confirmDifficulty(index = this.cursor): void {
    this.selection.difficulty = DIFFICULTY_ORDER[index] ?? 'normal';
    // No stage picker: the original starts every run at 第一面.
    this.callbacks.onStart({
      ...this.selection,
      stage: this.practiceMode ? this.selection.stage : 1,
      // A campaign always opens on stage 1, so a route chosen for an earlier drill
      // must not leak into it.
      route: this.practiceMode ? this.selection.route : undefined,
      campaign: !this.practiceMode,
    });
  }

  // ------------------------------------------------------------ results ---
  showResults(report: ResultsReport): void {
    this.screen = 'results';
    this.report = report;
    this.cursor = 0;
    const rank = computeRank(report.score, report.stage, report.difficulty);
    const profile = CHARACTER_PROFILES[report.character];
    /*
     * A demo report is a review fixture and not a run: submitting it would push the
     * player's own records out of the top ten, one screen refresh at a time.
     */
    if (!report.demo) {
      this.leaderboard.submit({
        name: profile.name,
        score: report.score,
        stage: report.stage,
        difficulty: report.difficulty,
        character: report.character,
      });
    }
    this.render(
      'results',
      [
        /*
         * The settlement picture first, exactly as retail puts it up: the JPEG
         * backdrop and every label on the panel come out of `result00.anm`, and
         * only the numbers are ours. When the extracted art is missing the canvas
         * stays blank and the rows below still carry the whole report.
         */
        '<div class="th08-result-stage">',
        '<canvas class="th08-result-anm" data-menu="result-canvas" width="640" height="480" aria-hidden="true"></canvas>',
        '<div class="th08-result-stats" data-menu="result-stats" hidden></div>',
        '</div>',
        /*
         * A run that ran out of lives used to land on this screen wearing the
         * stage-clear costume: same "MISSION COMPLETE" kicker, same "STAGE n CLEAR"
         * heading. Retail separates the two, so the report now carries which one
         * happened and the heading follows it.
         */
        '<p class="th08-result-banner">' +
          (report.gameOver
            ? 'GAME OVER · REACHED STAGE ' + report.stage
            : report.campaignFinished
              ? 'ALL STAGES CLEARED'
              : /*
                 * A practice drill is not a mission: retail closes one with
                 * `THANKS FOR PLAYING`, the same line the playfield banner just
                 * painted, and there is no next stage to report on.
                 */
                report.practice
                ? 'THANKS FOR PLAYING'
                : 'MISSION COMPLETE · STAGE ' + report.stage + ' CLEAR') +
          '</p>',
        /*
         * Everything the settlement panel has no row for. The panel already carries
         * the score, difficulty, completion, continues, deaths, bombs, cards and
         * slow rate, so repeating them here would only compete with the original's
         * own layout.
         */
        '<p class="th08-result-aux">',
        `<b>${TH08Menu.escape(profile.name)}</b>`,
        `<span>Spell Bonus ${report.spellBonus.toString().padStart(8, '0')}</span>`,
        `<span>Graze ${report.graze}</span>`,
        `<span>残机 / 灵击 ${report.livesLeft} / ${report.bombsLeft}</span>`,
        `<span>Power ${report.power} / ${report.maxPower}</span>`,
        `<span class="th08-rank">RANK ${rank}</span>`,
        '</p>',
        '<div class="th08-result-form">',
        '<label class="th08-name-entry">登记名称 <input data-menu="name" maxlength="12" value="' +
          TH08Menu.escape(profile.name) +
          '"></label>',
        '<div class="th08-replay-row">',
        '<button type="button" class="th08-mini-btn" data-menu="save-replay">导出录像 Replay</button>',
        '<label class="th08-mini-btn">导入录像<input type="file" accept="application/json" data-menu="load-replay" hidden></label>',
        '</div>',
        '</div>',
        '<nav class="th08-menu-list">',
        '<button type="button" class="th08-menu-item is-active" data-menu="item" data-index="0">再来一次 RETRY</button>',
        '<button type="button" class="th08-menu-item" data-menu="item" data-index="1">' +
          (report.gameOver
            ? '继续挑战 CONTINUE'
            : report.practice
              ? '返回选关 STAGE SELECT'
              : '继续下一面 NEXT STAGE') +
          '</button>',
        '<button type="button" class="th08-menu-item" data-menu="item" data-index="2">返回标题 TITLE</button>',
        '</nav>',
      ].join(''),
    );
    this.setupResultLayer(report);
    this.root.querySelectorAll<HTMLElement>('[data-menu="item"]').forEach((el) => {
      el.addEventListener('click', () => {
        this.cursor = Number(el.dataset.index ?? 0);
        this.activateResult();
      });
    });
    this.root
      .querySelector<HTMLElement>('[data-menu="save-replay"]')
      ?.addEventListener('click', () => this.exportReplay(report));
    const file = this.root.querySelector<HTMLInputElement>('[data-menu="load-replay"]');
    file?.addEventListener('change', () => {
      const picked = file.files?.[0];
      if (!picked) return;
      void picked.text().then((text) => this.callbacks.onReplayLoad?.(text));
    });
  }

  /**
   * The score table, in the original's columns.
   *
   * `OnDraw:2485` prints the header `No  Name       Score(Stage)   Date   Slow`
   * and then one row per record. The columns are a real table rather than printf
   * padding because the team names are CJK, which no monospace advance can line
   * up; the wording, the order and the row colours are the original's.
   */
  private retailListing(entries: ScoreEntry[]): string {
    const rows =
      entries.length === 0
        ? '<tr><td colspan="5">暂无记录</td></tr>'
        : entries
            .slice(0, 10)
            .map(
              (entry, i) =>
                `<tr${entry.score === this.report?.score ? ' class="is-new"' : ''}>` +
                `<td>${String(i + 1).padStart(2, ' ')}</td>` +
                `<td>${TH08Menu.escape(entry.name)}</td>` +
                `<td>${pad9(entry.score)}${Math.min(9, Math.max(0, entry.numRetries ?? 0))}(${entry.stage})</td>` +
                `<td>${listingDate(entry.createdAt)}</td>` +
                /*
                 * Retail keeps a per-record slow percentage in the score file. Ours
                 * does not, so the column reads `--` rather than inventing a number.
                 */
                `<td>--</td>` +
                `</tr>`,
            )
            .join('');
    return (
      '<table class="th08-score-table th08-result-listing">' +
      '<thead><tr><th>No</th><th>Name</th><th>Score(Stage)</th><th>Date</th><th>Slow</th></tr></thead>' +
      `<tbody>${rows}</tbody>` +
      '</table>'
    );
  }

  private exportReplay(report: ResultsReport): void {
    const json = report.replayJson ?? this.callbacks.getReplay?.() ?? null;
    if (!json) return;
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `th08-s${report.stage}-${report.difficulty}-${report.character}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private activateResult(): void {
    const report = this.report;
    if (!report) {
      this.showTitle();
      return;
    }
    if (this.cursor === 0) {
      this.callbacks.onStart({
        stage: report.stage,
        difficulty: report.difficulty,
        character: report.character,
      });
      return;
    }
    // A drill has no next stage at any stage number, so it is checked before the
    // campaign's "is there a stage 6?" guard.
    if (this.cursor === 1 && report.gameOver) {
      this.callbacks.onStart({
        stage: report.stage,
        difficulty: report.difficulty,
        character: report.character,
      });
      return;
    }
    if (this.cursor === 1 && report.practice) {
      this.showPractice();
      return;
    }
    if (this.cursor === 1 && report.stage < 6) {
      this.callbacks.onStart({
        stage: (report.stage + 1) as StageNumber,
        difficulty: report.difficulty,
        character: report.character,
      });
      return;
    }
    this.showTitle();
  }

  // ------------------------------------------------------- shared chrome ---
  private render(skin: Screen, html: string): void {
    // Replacing the card's children orphans whatever screen layer was running, so
    // the settlement canvas is torn down here rather than at each call site.
    this.teardownScreenLayer();
    this.root.style.display = 'grid';
    this.root.innerHTML = `<section class="th08-card th08-card-${skin}">${html}</section>`;
    this.bindKeys();
  }

  /** Stop the settlement screen's clock and release its art. */
  private teardownScreenLayer(): void {
    if (this.resultRaf) cancelAnimationFrame(this.resultRaf);
    this.resultRaf = 0;
    this.resultObserver?.disconnect();
    this.resultObserver = null;
    this.resultScreen?.destroy();
    this.resultScreen = null;
  }

  /**
   * Run the retail settlement screen behind the numbers.
   *
   * Two things here have to follow the animation rather than a stylesheet: the
   * panel arrives on an interrupt, and the stat column hangs off VM 71's own
   * position (`DrawFinalStats` adds 210/32 to it and steps 22 per row). So the
   * rows are placed from the live VM every frame, and the monospace advance is
   * measured once per resize to match the original's 13-pixel text cell.
   */
  private setupResultLayer(report: ResultsReport): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('[data-menu="result-canvas"]');
    const layer = this.root.querySelector<HTMLElement>('[data-menu="result-stats"]');
    if (!canvas || !layer || typeof RetailResultScreen === 'undefined') return;
    let discarded = false;
    void RetailResultScreen.mount(canvas).then((screen) => {
      if (!screen) return;
      if (discarded || this.resultScreen) {
        screen.destroy();
        return;
      }
      this.resultScreen = screen;
      screen.show();
      layer.hidden = false;
      layer.textContent = '';
      const cells = resultStatRows(report.stats).map((text) => {
        const row = document.createElement('span');
        row.className = 'th08-result-stat';
        row.textContent = text;
        layer.appendChild(row);
        return row;
      });

      const place = (): void => {
        const anchor = screen.statsAnchor();
        const first = cells[0];
        if (!anchor || !first || !canvas.clientWidth) return;
        const scale = canvas.clientWidth / anchor.width;
        // Measure the natural advance with no transform on, then scale it to the
        // original's cell width so `pad9` columns line up the retail way.
        first.style.transform = 'none';
        const length = first.textContent?.length || 1;
        const natural = first.getBoundingClientRect().width / length;
        const stretch = natural > 0 ? (RESULT_STATS_LAYOUT.spaceWidth * scale) / natural : 1;
        for (let i = 0; i < cells.length; i++) {
          const row = cells[i];
          row.style.left = `${anchor.x * scale}px`;
          row.style.top = `${(anchor.y + i * RESULT_STATS_LAYOUT.rowPitch) * scale}px`;
          row.style.transform = `scaleX(${stretch.toFixed(4)})`;
        }
      };

      const tick = (): void => {
        if (!this.resultScreen) return;
        this.resultScreen.frame();
        place();
        this.resultRaf = requestAnimationFrame(tick);
      };
      place();
      tick();
      if (typeof ResizeObserver !== 'undefined') {
        this.resultObserver = new ResizeObserver(place);
        this.resultObserver.observe(canvas);
      }
    });
  }

  private setCursor(next: number): void {
    const size = this.root.querySelectorAll(TH08Menu.NAV_SELECTOR).length;
    if (size === 0) return;
    this.cursor = (next + size) % size;
    this.root
      .querySelectorAll<HTMLElement>(TH08Menu.NAV_SELECTOR)
      .forEach((el, i) => el.classList.toggle('is-active', i === this.cursor));
  }

  private bindKeys(): void {
    if (this.keyHandler) window.removeEventListener('keydown', this.keyHandler);
    this.keyHandler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT')) return;
      // NAV_SELECTOR is the single source of truth: the options screen uses
      // data-menu="opt", and a hand-copied list here used to omit it, which made
      // every keyboard shortcut on that screen dead.
      const size = this.root.querySelectorAll(TH08Menu.NAV_SELECTOR).length;
      const forward: Record<string, number> = {
        ArrowDown: 1,
        ArrowRight: 1,
        s: 1,
        ArrowUp: -1,
        ArrowLeft: -1,
        w: -1,
      };
      if (event.key in forward) {
        if (size === 0) return;
        event.preventDefault();
        this.setCursor(this.cursor + forward[event.key]);
        return;
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.confirmCurrent();
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.goBack();
      }
    };
    window.addEventListener('keydown', this.keyHandler);
  }

  private confirmCurrent(): void {
    if (this.screen === 'title') {
      this.activateTitle(this.cursor);
    } else if (this.screen === 'practice') {
      this.choosePracticeStage(this.cursor);
    } else if (this.screen === 'options') {
      this.activateOption();
    } else if (this.screen === 'character') {
      this.confirmCharacter();
    } else if (this.screen === 'difficulty') {
      this.confirmDifficulty();
    } else if (this.screen === 'ranking' || this.screen === 'controls') {
      this.showTitle();
    } else {
      this.activateResult();
    }
  }

  private goBack(): void {
    if (this.screen === 'options') this.showTitle();
    else if (this.screen === 'practice') {
      this.practiceMode = false;
      this.showTitle();
    } else if (this.screen === 'character') {
      if (this.practiceMode) this.showPractice();
      else this.showTitle();
    } else if (this.screen === 'difficulty') this.showCharacter();
    else if (this.screen === 'results') this.showTitle();
    else if (this.screen === 'ranking' || this.screen === 'controls') this.showTitle();
    else this.callbacks.onQuit?.();
  }

  hide(): void {
    if (this.resultRaf) {
      cancelAnimationFrame(this.resultRaf);
      this.resultRaf = 0;
    }
    if (this.resultObserver) {
      this.resultObserver.disconnect();
      this.resultObserver = null;
    }
    if (this.resultScreen) {
      this.resultScreen.destroy();
      this.resultScreen = null;
    }
    this.root.style.display = 'none';
    this.root.innerHTML = '';
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = undefined;
    }
  }

  destroy(): void {
    this.hide();
  }

  private static escape(value: string): string {
    return value.replace(
      /[&<>"']/g,
      (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] ?? ch,
    );
  }
}
