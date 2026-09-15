/**
 * The original 永夜抄 conversation, end to end.
 *
 * Three jobs live here, each of them a table or a code path copied from the
 * decompile rather than invented:
 *
 * - which `.dat` a stage plays, from `g_GuiMessagePaths` (`Gui.cpp:74-85`);
 * - which script inside it, including the rewrites `FUN_0043396d` performs on
 *   the requested id (`Gui.cpp:222-320`);
 * - which face ANM owns each of the four portrait slots, from
 *   `Spellcard::Init` (`Spellcard.cpp:487-593`).
 *
 * Everything a script asks the screen to do goes into a `DialogueOverlay`, so
 * this file holds no drawing code, and the interpreter itself stays in `sim/`.
 */

import { parseMsg, type MsgFile, type MsgScript } from '../../th08/format/MsgFile';
import { MessageVm, type MessageInput, type MessageVmHost } from '../../th08/sim/MessageVm';
import type { GameState } from '../../th08/sim/GameState';
import type { DialogueOverlay } from '../../engine/renderer/DialogueOverlay';
import { ROUTE_ORDER, type StageRoute } from './StageRoute';
import { MEMBER_FACE_ANM, ROUTE_BOSS_FACE, ROUTE_MIDBOSS_FACE } from './data/th08-face-art';
import { RetailAnmCatalog } from './data/th08-face-anm';
import type { MemberId } from '../../touhou-common/player/CharacterProfile';

/** Where `extract.mjs` publishes the retail message streams. */
export const MSG_ASSET_DIR = '/assets/th08/raw';

/**
 * `g_GuiMessagePaths`, row = retail `Stage` (so 3 is 4A and 4 is 4B), column =
 * `ShotType` (`ScoreDat.hpp:54-69`). Verbatim from `Gui.cpp:74-85`; the `.dat`
 * suffix is added by `RetailMessageSource`.
 */
export const GUI_MESSAGE_PATHS: readonly (readonly string[])[] = [
  [
    'msg1a',
    'msg1b',
    'msg1c',
    'msg1d',
    'msg1a',
    'msg1a',
    'msg1b',
    'msg1b',
    'msg1c',
    'msg1c',
    'msg1d',
    'msg1d',
  ],
  [
    'msg2a',
    'msg2b',
    'msg2c',
    'msg2d',
    'msg2a',
    'msg2a',
    'msg2b',
    'msg2b',
    'msg2c',
    'msg2c',
    'msg2d',
    'msg2d',
  ],
  [
    'msg3a',
    'msg3b',
    'msg3c',
    'msg3d',
    'msg3a',
    'msg3a',
    'msg3b',
    'msg3b',
    'msg3c',
    'msg3c',
    'msg3d',
    'msg3d',
  ],
  [
    'msg4dm',
    'msg4ab',
    'msg4ac',
    'msg4dm',
    'msg4dm',
    'msg4dm',
    'msg4ab',
    'msg4ab',
    'msg4ac',
    'msg4ac',
    'msg4dm',
    'msg4dm',
  ],
  [
    'msg4ba',
    'msg4dm',
    'msg4dm',
    'msg4bd',
    'msg4ba',
    'msg4ba',
    'msg4dm',
    'msg4dm',
    'msg4dm',
    'msg4dm',
    'msg4bd',
    'msg4bd',
  ],
  [
    'msg5a',
    'msg5b',
    'msg5c',
    'msg5d',
    'msg5a',
    'msg5a',
    'msg5b',
    'msg5b',
    'msg5c',
    'msg5c',
    'msg5d',
    'msg5d',
  ],
  [
    'msg6a',
    'msg6b',
    'msg6c',
    'msg6d',
    'msg6a',
    'msg6a',
    'msg6b',
    'msg6b',
    'msg6c',
    'msg6c',
    'msg6d',
    'msg6d',
  ],
  [
    'msg7a',
    'msg7b',
    'msg7c',
    'msg7d',
    'msg7a',
    'msg7a',
    'msg7b',
    'msg7b',
    'msg7c',
    'msg7c',
    'msg7d',
    'msg7d',
  ],
  [
    'msg8a',
    'msg8b',
    'msg8c',
    'msg8d',
    'msg8a',
    'msg8a',
    'msg8b',
    'msg8b',
    'msg8c',
    'msg8c',
    'msg8d',
    'msg8d',
  ],
];

/** Retail `Stage` index for one of our routes, or -1 when unknown. */
export function stageIndexFor(route: StageRoute): number {
  return ROUTE_ORDER.indexOf(route);
}

/** The message pack a route plays for one shot type, without the `.dat`. */
export function messagePackFor(route: StageRoute, shotType: number): string | undefined {
  const row = GUI_MESSAGE_PATHS[stageIndexFor(route)];
  if (!row) return undefined;
  return row[shotType >= 0 && shotType < row.length ? shotType : 0];
}

/** What `remapMessageId` needs from the run, minus the catelog it cannot see. */
export interface MessageRouteFacts {
  shotType: number;
  retries: number;
  clockHour: number;
}

/**
 * The id rewrites at `Gui.cpp:222-320`.
 *
 * Only the arms this build can actually reach are modelled. `value == 10` in
 * stage 5 picks which of the four pack scripts the 鈴仙 conversation uses, and
 * `value >= 6` in 6B collapses onto script 5 once the clock is past midnight
 * (`:311-317`). The catelog and replay arms need save data this build does not
 * carry, so they fall through to the plain id.
 */
export function remapMessageId(
  id: number,
  route: StageRoute,
  facts: MessageRouteFacts,
): { id: number; routeChoice: number } {
  if (id === 10 && route === 'stage5') {
    // `:256-262` continuing forces the long route.
    if (facts.retries > 0) return { id: 1, routeChoice: 0 };
    // `:263-283` a solo ship is the one case that needs no save data to know.
    if (facts.shotType > 3) return { id: 3, routeChoice: 1 };
    return { id: 1, routeChoice: 0 };
  }
  if (id >= 6 && route === 'stage6b' && facts.clockHour >= 12) {
    return { id: 5, routeChoice: 0 };
  }
  return { id, routeChoice: 0 };
}

/** One loaded pack: every script it holds, addressable by retail message id. */
export class RetailMessagePack {
  private constructor(
    readonly pack: string,
    private readonly file: MsgFile,
  ) {}

  get scriptCount(): number {
    return this.file.scripts.length;
  }

  script(id: number): MsgScript | null {
    return this.file.scripts[id] ?? null;
  }

  /** Read a pack from the bytes `LoadMsg` (`Gui.cpp:2351-2368`) would map. */
  static fromBytes(pack: string, bytes: Uint8Array): RetailMessagePack {
    return new RetailMessagePack(pack, parseMsg(bytes));
  }
}

/** Loads and caches message packs, one per stage. */
export class RetailMessageSource {
  private readonly packs = new Map<string, RetailMessagePack>();
  private readonly pending = new Map<string, Promise<RetailMessagePack | null>>();

  private constructor(private readonly catalog: RetailAnmCatalog) {}

  static create(catalog: RetailAnmCatalog): RetailMessageSource {
    return new RetailMessageSource(catalog);
  }

  /** The ANM metadata behind the four portrait slots. */
  get anm(): RetailAnmCatalog {
    return this.catalog;
  }

  /** Start fetching a pack, if it is not already in hand. */
  prefetch(pack: string): Promise<RetailMessagePack | null> {
    const held = this.packs.get(pack);
    if (held) return Promise.resolve(held);
    const inflight = this.pending.get(pack);
    if (inflight) return inflight;
    const request = fetch(`${MSG_ASSET_DIR}/${pack}.dat`)
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .then((body) => {
        if (!body) return null;
        const loaded = RetailMessagePack.fromBytes(pack, new Uint8Array(body));
        this.packs.set(pack, loaded);
        this.pending.delete(pack);
        return loaded;
      })
      .catch(() => {
        this.pending.delete(pack);
        return null;
      });
    this.pending.set(pack, request);
    return request;
  }

  /** The pack only when already loaded, which is what op 22 needs. */
  loaded(pack: string): RetailMessagePack | null {
    return this.packs.get(pack) ?? null;
  }
}

/** What the host can ask the game to do beyond the box itself. */
export interface RetailMessageEffects {
  /** `g_Supervisor.PlayMusic` / `StopAudio` for the stage slot `track`. */
  stageMusic(track: number): void;
  /** `g_Supervisor.FadeOutMusic(4.0)` (`Gui.cpp:873-874`). */
  fadeMusic(): void;
  /** `g_SoundPlayer.PlaySoundByIdx` (`Gui.cpp:684`, `:689`, `:712`). */
  sound(id: number): void;
  /** `g_GameManager.flags.unk5_6 = 2` (`Gui.cpp:880-883`). */
  stageClear(): void;
  /** The stage-result snapshot armed by op 9 (`Gui.cpp:800-869`). */
  stageResult(): void;
  /** `g_GameManager.flags.isGoingToFinalB` (`Gui.cpp:716`). */
  routeChosen(choice: number): void;
  /** `:381-382` the field sweeps clean while a conversation runs. */
  collectItems(): void;
  /** `ScreenEffect::RegisterChain(4, 442, ...)` (`Gui.cpp:876-879`). */
  screenEffect(): void;
}

/**
 * `Gui::RunMsg` wired to the screen. The interpreter is pure, so every retail
 * side effect lands here, one method per decompiled call site.
 */
export class RetailMessageHost implements MessageVmHost {
  private readonly vm: MessageVm;

  constructor(
    private readonly source: RetailMessageSource,
    private readonly overlay: DialogueOverlay,
    private readonly effects: RetailMessageEffects,
    private readonly gs: GameState,
    private readonly pack: () => string | undefined,
  ) {
    this.vm = new MessageVm(this);
  }

  /** The interpreter this host drives. */
  get messages(): MessageVm {
    return this.vm;
  }

  /** `Gui::MsgWait` (`Gui.cpp:1024-1030`): the timeline waits while true. */
  get pending(): boolean {
    return this.vm.active;
  }

  portraitScript(slot: number, script: number): void {
    this.overlay.executeScript(slot, script);
  }

  portraitSprite(slot: number, sprite: number): void {
    this.overlay.setSprite(slot, sprite);
  }

  portraitInterrupt(slot: number, code: number): void {
    this.overlay.interrupt(slot, code);
  }

  drawLine(line: number, color: number, text: string): void {
    this.overlay.setLine(line, this.textColor(color), text);
  }

  clearLine(line: number): void {
    this.overlay.clearLine(line);
  }

  bgm(track: number): void {
    this.effects.stageMusic(track);
  }

  fadeBgm(): void {
    this.effects.fadeMusic();
  }

  faceCutIn(): void {
    // `Gui.cpp:791-799` re-arms the enemy cut-in VM off `enemyFaceAnm0`, which
    // is the same slot the box already owns; the interrupt is the observable half.
    this.overlay.interrupt(2, 1);
  }

  screenEffect(): void {
    this.effects.screenEffect();
  }

  stageResult(): void {
    this.effects.stageResult();
  }

  stageClear(): void {
    this.effects.stageClear();
  }

  sound(id: number): void {
    this.effects.sound(id);
  }

  routeChosen(choice: number): void {
    this.effects.routeChosen(choice);
  }

  requestMessage(id: number): void {
    // Op 22 always finds its branch in hand - `LoadMsg` maps the whole pack
    // before a stage can ask for a message - so this is the bookkeeping half of
    // `FUN_00439810`; `branchScript` below does the rest.
    this.gs.stageMessageRequest = id;
  }

  branchScript(id: number): MsgScript | null {
    const pack = this.pack();
    if (!pack) return null;
    return this.source.loaded(pack)?.script(id) ?? null;
  }

  autoCollectItems(): void {
    this.effects.collectItems();
  }

  /**
   * `textColors[colorIndex]`, copied per message from
   * `g_GuiMessageTextColors[g_GameManager.shotType].colors[colorIndex]`
   * (`Gui.cpp:332-335`) and passed untouched to Win32 `SetTextColor` by
   * `AnmManager::DrawTextLeft` -> `TextHelper::RenderTextToTexture`
   * (`AnmManager.cpp:2755`, `TextHelper.cpp:381`). A `COLORREF` is `0x00BBGGRR`,
   * which is why the numbers below are re-ordered from how the table is written.
   *
   * The table is twelve rows of four, one row per shot type, and every row is the
   * same: `00e8f0ff 00f0e8ff 00ffe8f0 00ffe8f0`. It reaches us through the
   * reference port's restored copy of the exe's `.data`, which writes exactly that
   * table to exactly that address (`linux_runtime.cpp:214-227` and `:248`, whose
   * target is `0x004c7180` - the address `Gui.cpp:332` reads).
   *
   * So side 0 prints warm cream, side 1 pink, and slots 2 and 3, which only the
   * enemy faces use, print pale lilac. `shadowColors[0..3]` is zeroed at the same
   * moment (`Gui.cpp:336-339`), so the text has no tinted outline either.
   */
  private textColor(index: number): number {
    const colors = [0xfff0e8, 0xffe8f0, 0xf0e8ff, 0xf0e8ff];
    return colors[index & 3] ?? 0xffffff;
  }

  /**
   * Bind the four slots for one team and route, exactly as `Spellcard::Init`
   * (`Spellcard.cpp:487-593`) picks the face ANMs: the two members on the left,
   * the boss and - where a route has one - the mid-boss on the right.
   */
  bindFaces(members: readonly [MemberId, MemberId], route: StageRoute): void {
    this.overlay.bind(0, MEMBER_FACE_ANM[members[0]]);
    this.overlay.bind(1, MEMBER_FACE_ANM[members[1]]);
    const boss = ROUTE_BOSS_FACE[route];
    const mid = ROUTE_MIDBOSS_FACE[route];
    this.overlay.bind(2, boss);
    this.overlay.bind(3, mid ?? boss);
  }
}

/** Build the per-frame input the interpreter samples from raw button state. */
export function messageInputFrom(buttons: {
  shoot: boolean;
  previousShoot: boolean;
  skip: boolean;
  up: boolean;
  previousUp: boolean;
  down: boolean;
  previousDown: boolean;
  dying: boolean;
}): MessageInput {
  return {
    shoot: buttons.shoot,
    shootPressed: buttons.shoot && !buttons.previousShoot,
    skip: buttons.skip,
    upPressed: buttons.up && !buttons.previousUp,
    downPressed: buttons.down && !buttons.previousDown,
    dying: buttons.dying,
  };
}
