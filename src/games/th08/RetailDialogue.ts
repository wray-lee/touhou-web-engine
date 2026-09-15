/**
 * The retail stage conversation, wired into a running game.
 *
 * `Gui.cpp` owns one `GuiMessageStateOverlay` for the whole run: the message
 * interpreter reads `.dat` scripts, drives four ANM portraits, prints two text
 * lines, and switches the stage's music. Everything in that file needs either
 * the shipped data or the live `GameState`, and nothing needs to know about
 * menus, HUD, or how the stage ends - so it lives here rather than in `TH08Game`,
 * which only decides when to call it.
 */

import type { InputSystem } from '../../engine/core/InputSystem';
import type { AudioManager } from '../../engine/audio/AudioManager';
import { PLAYFIELD_W, PLAYFIELD_X, PLAYFIELD_Y } from '../../engine/core/PlayfieldLayout';
import { DialogueOverlay } from '../../engine/renderer/DialogueOverlay';
import { StageTitleOverlay } from '../../engine/renderer/StageTitleOverlay';
import type { PixiRenderer } from '../../engine/renderer/PixiRenderer';
import type { StageRunner } from '../../th08/sim/StageRunner';
import { RetailAnmCatalog } from './data/th08-face-anm';
import { stageTitleKey, stageTitlePackFor, stageTitleScript } from './data/th08-stgtxt-registration';
import {
  RetailMessageHost,
  RetailMessageSource,
  messageInputFrom,
  messagePackFor,
  remapMessageId,
  type RetailMessageEffects,
} from './RetailMessages';
import { stageSongTrack } from './StageSongs';
import { getCharacterProfile } from '../../touhou-common/player/CharacterProfile';
import type { CharacterId, StageNumber } from './types';
import type { StageRoute } from './StageRoute';

/** What the controller needs from the game, read lazily because routes change. */
export interface RetailDialogueHooks {
  /** The live renderer, or null before `init` and after a teardown. */
  renderer(): PixiRenderer | null;
  /** The stage that is now playing, or null before it loads and after a game over. */
  runner(): StageRunner | null;
  input: InputSystem;
  audio: AudioManager;
  /** `this.route`, which advances between stages. */
  route(): StageRoute;
  /** `this.stageNumber`, the display number the BGM fallback table is keyed by. */
  stageNumber(): StageNumber;
  /** `g_GameManager.shotType`: index into `g_GuiMessagePaths`' columns. */
  shotType(): number;
  /** Which `stageN.std` is playing, and therefore which four songs exist. */
  stdKey(): string | null;
  character(): CharacterId;
  /** `numRetries`: a continue rewrites the stage-5 message. */
  retries(): number;
  /** The QA `?autofire` hold, which has to advance dialogue like a real Z. */
  autoShoot(): boolean;
  /** The QA `?autoskip` hold, which fast-forwards a conversation like Ctrl does. */
  autoSkip(): boolean;
  /** True while the player is dying, which suspends the automatic item sweep. */
  dying(): boolean;
}

export class RetailDialogue {
  private box: DialogueOverlay | null = null;
  /** The `stgNNtxt` card that opens every stage (`Gui.cpp:2307`). */
  private title: StageTitleOverlay | null = null;
  private source: RetailMessageSource | null = null;
  private host: RetailMessageHost | null = null;
  private packName: string | undefined;
  /** Whether the stage's message pack is in hand, still fetching, or lost. */
  private packState: 'idle' | 'loading' | 'ready' | 'missing' = 'idle';
  /** How many timeline requests this controller has taken over. */
  private served = 0;
  /** Button state from the previous frame; retail samples edges, not levels. */
  private prev = { shoot: false, up: false, down: false };
  /** `flags.isGoingToFinalB` as op 22 published it, -1 until it fires. */
  routeChoice = -1;
  /**
   * File name of the recording currently asked for, so a slot can be requested
   * twice without restarting the song. Retail has no such guard because op 7 is
   * the only caller, but here the stage start and the boss approach both reach for
   * a slot as well.
   */
  private songFile: string | null | undefined;

  constructor(private readonly hooks: RetailDialogueHooks) {}

  /** The box is on screen, which is what the stage clock waits on. */
  get showing(): boolean {
    return this.box?.showing ?? false;
  }

  /** Frames the current message has been up, for the box reveal and the readout. */
  get frames(): number {
    return this.host?.messages.framesElapsed ?? 0;
  }

  /** The pack `Gui::LoadMsg` would have mapped for the stage now playing. */
  get pack(): string | undefined {
    return this.packName;
  }

  /** True once the manifest, the box, and the packs are all in hand. */
  get ready(): boolean {
    return this.box !== null && this.source !== null;
  }

  /**
   * True when this stage's conversations are playable, which is what decides
   * whether a song slot can wait for op 7 or has to be asked for directly.
   */
  get messagesAvailable(): boolean {
    return this.packState === 'ready';
  }

  /**
   * Build the box out of shipped data only.
   *
   * The two text lines sit wherever `text.anm` scripts 0 and 1 put them, the
   * portraits move because their own ANM scripts say so, and the only numbers
   * written in code are the arcade rect - which retail supplies itself, through
   * `g_GameManager.arcadeRegionTopLeftPos` (`GameManager.cpp:441-442`).
   */
  async setup(): Promise<void> {
    const renderer = this.hooks.renderer();
    if (!renderer || this.box) return;
    const catalog = await RetailAnmCatalog.load();
    // The title card needs only the lifted bytecode and the atlas page, so it is
    // built before the dialogue box: a checkout that lacks `text.anm` still opens
    // its stages with the retail banner.
    const title = new StageTitleOverlay({
      scriptFor: (pack, index) => stageTitleScript(pack, index),
      cellFor: (pack, sprite) => {
        const texture = renderer.assets.get(stageTitleKey(pack, sprite));
        return texture ? { texture } : null;
      },
    });
    title.mount(renderer.hudContainer);
    this.title = title;
    const lines = [0, 1]
      .map((index) => catalog.firstPos('text', index))
      .filter((pos): pos is { x: number; y: number } => pos !== null);
    if (lines.length < 2) return;
    const box = new DialogueOverlay({
      arcade: { x: PLAYFIELD_X, y: PLAYFIELD_Y, z: 0 },
      arcadeWidth: PLAYFIELD_W,
      lines,
      scriptFor: (pack, index) => catalog.scriptWords(pack, index),
      faceFor: async (pack, sprite) => {
        const texture = await catalog.texture(pack, sprite);
        return texture ? { texture, width: texture.width } : null;
      },
    });
    box.mount(renderer.hudContainer);
    this.box = box;
    this.source = RetailMessageSource.create(catalog);
    this.bindStage();
  }

  /**
   * Point the interpreter at the stage that is now playing.
   *
   * `Gui::LoadMsg` (`Gui.cpp:2351-2368`) runs once per stage and frees the old
   * pack, and the four face slots are chosen per run
   * (`Spellcard.cpp:487-593`), so a stage hand-off rebuilds both.
   */
  bindStage(): void {
    const runner = this.hooks.runner();
    const box = this.box;
    const source = this.source;
    if (!runner || !box || !source) return;
    this.packName = messagePackFor(this.hooks.route(), this.hooks.shotType());
    // `Gui.cpp:2281` preloads the stage's own `stgNNtxt.anm` and `:2307` runs its
    // four scripts as the stage takes the screen.
    this.title?.bind(stageTitlePackFor(this.hooks.route()));
    this.title?.start();
    // A fade that a message started on the previous stage must not carry over: the
    // retail chain is deleted with the stage, and `Gui.cpp:2329` re-arms the
    // counter at 16 on a stage load rather than leaving the old one running.
    this.hooks.renderer()?.clearScreenFade();
    // A new stage means a new `LoadMusic` pass over the std slots
    // (`GameManager.cpp:1087-1092`), so a song that repeats across two stages -
    // 6A and 6B both open on `th08_13` - restarts rather than carries over.
    this.songFile = undefined;
    const effects: RetailMessageEffects = {
      stageMusic: (track) => {
        // `Gui.cpp:766-770`: announcing a stage song also re-runs the card's boss
        // line, script 3 with sprite `arg + 3`, so the second boss gets the second
        // banner without needing a second script.
        if (track >= 0) {
          this.title?.executeScript(3, 3);
          this.title?.setSprite(3, track + 3);
        }
        this.requestStageSong(track);
      },
      fadeMusic: () => this.hooks.audio.fadeBGM(4),
      sound: (id) => {
        /*
         * The VM's argument is a `SoundIdx`, so it goes straight to the bank: no name
         * in between. The old mapping by guessed name covered 10/11/12, while the
         * route-choice menu actually asks for 0x10/0x11 (`MessageVm.ts:50-51`), which
         * fell through and said nothing at all.
         */
        this.hooks.audio.queueSe(id);
      },
      collectItems: () => runner.sweepItems(),
      routeChosen: (choice) => {
        this.routeChoice = choice;
      },
      // The runner's own boss-death protocol ends the stage and opens the result
      // screen, so ops 9 and 11 have nothing left to hand over.
      stageClear: () => {},
      stageResult: () => {},
      // Op 14 registers `ScreenEffect` chain 4 for 442 frames with a white tint
      // (`Gui.cpp:876-879`). Chain 4 is `SCREEN_EFFECT_FULL_FADE_OUT`
      // (`ScreenEffect.hpp:14-21`), so the whole picture washes to white over the
      // seven seconds the conversation takes to close.
      screenEffect: () => {
        this.hooks.renderer()?.startScreenFade(442, 0xffffff);
      },
    };
    this.host = new RetailMessageHost(source, box, effects, runner.gs, () => this.packName);
    const members = getCharacterProfile(this.hooks.character()).members;
    this.host.bindFaces([members[0].id, members[1].id], this.hooks.route());
    if (this.packName) {
      this.packState = 'loading';
      const packName = this.packName;
      void source.prefetch(this.packName).then((pack) => {
        // Only settle the flag if this stage is still the one being played; a fast
        // hand-off will have moved `packName` on.
        if (this.packName !== packName) return;
        this.packState = pack ? 'ready' : 'missing';
      });
    } else {
      this.packState = 'idle';
    }
  }

  /**
   * One `Gui::OnUpdate` (`Gui.cpp:185-196`): collect any message the stage script
   * asked for, run the interpreter, and publish the flag timeline op 7 waits on.
   */
  step(runner: StageRunner): void {
    const box = this.box;
    const host = this.host;
    // `Gui.cpp:1113` advances the title card on its own, outside the message box,
    // so it keeps running through a conversation and past its end.
    this.title?.step();
    if (!box || !host) {
      runner.gs.messagePending = false;
      return;
    }
    const requested = runner.gs.stageMessageRequest;
    // Retail has the pack resident before a stage can ask for a message; a browser
    // does not. While the fetch is still in the air the ask stays pending and the
    // timeline gate holds, which is what `Gui::MsgWait` would have done anyway.
    let waitingForPack = false;
    if (requested >= 0) {
      this.served++;
      if (this.playRequestedMessage(requested)) {
        runner.gs.stageMessageRequest = -1;
      } else if (this.packState === 'loading') {
        waitingForPack = true;
      } else {
        // No pack is coming: drop the request rather than hold the stage forever.
        runner.gs.stageMessageRequest = -1;
      }
    }
    const shoot = this.hooks.input.isKeyDown('shoot') || this.hooks.autoShoot();
    const up = this.hooks.input.isKeyDown('up');
    const down = this.hooks.input.isKeyDown('down');
    host.messages.tick(
      messageInputFrom({
        shoot,
        previousShoot: this.prev.shoot,
        skip: this.hooks.input.isKeyDown('skip') || this.hooks.autoSkip(),
        up,
        previousUp: this.prev.up,
        down,
        previousDown: this.prev.down,
        dying: this.hooks.dying(),
      }),
    );
    this.prev = { shoot, up, down };
    box.revealed = host.messages.framesElapsed;
    box.step();
    runner.gs.messagePending = host.pending || waitingForPack;
    if (!host.pending && box.showing) box.hide();
  }

  /** Tear the layer down, for a stage hand-off or a game restart. */
  detach(): void {
    this.box?.destroy();
    this.title?.destroy();
    this.title = null;
    this.box = null;
    this.host = null;
  }

  /** Pull the box off screen without dropping the loaded packs. */
  hide(): void {
    this.box?.hide();
    this.title?.hide();
  }

  /**
   * What a browser pass can read without pressing anything: whether the packs are
   * in, which script is running, the two lines as printed, and what each portrait
   * slot resolved to.
   */
  debugState(): {
    ready: boolean;
    pack: string | undefined;
    packState: string;
    served: number;
    id: number;
    frames: number;
    pending: boolean;
    lines: readonly string[];
    faces: string[];
    title: string[];
  } {
    return {
      ready: this.ready,
      pack: this.packName,
      packState: this.packState,
      served: this.served,
      id: this.host?.messages.messageId ?? -1,
      frames: this.frames,
      pending: this.host?.pending ?? false,
      lines: this.host?.messages.text ?? [],
      faces: this.box?.faceDebug() ?? [],
      title: this.title?.debugLines() ?? [],
    };
  }

  /**
   * `Gui::FUN_00435900` picks which script a request means - the stage-5 rewrite
   * at `Gui.cpp:256-283` is what `remapMessageId` models - then `FUN_00439810`
   * starts it with the per-message state cleared.
   */
  private playRequestedMessage(id: number): boolean {
    const host = this.host;
    const pack = this.packName ? this.source?.loaded(this.packName) : null;
    if (!host || !pack) return false;
    const remapped = remapMessageId(id, this.hooks.route(), {
      shotType: this.hooks.shotType(),
      retries: this.hooks.retries(),
      // The clock is live: ECL op 181 tolls it one hour at a time
      // (`EclRunHigh.inl:1111-1121` -> `EnemySlot.clockControl`), which is the same
      // i8 `Gui.cpp:316` compares against 12. Past midnight, 6B folds its later
      // conversations onto script 5, so this has to read the running value.
      clockHour: this.hooks.runner()?.gs.clockTime ?? 0,
    });
    const script = pack.script(remapped.id);
    if (!script) return true;
    host.messages.setRouteChoice(remapped.routeChoice);
    this.box?.show();
    host.messages.play(remapped.id, script);
    return true;
  }

  /**
   * Start retail song slot `track` of the stage now playing.
   *
   * Op 7 (`Gui.cpp:758-788`) is the usual caller, but the stage start reaches for
   * slot 0 the way `GameManager.cpp:417` does, so this is public. A negative slot
   * is op 7's stop: `Gui.cpp:762` calls `StopAudio()` rather than naming a song.
   */
  requestStageSong(track: number): void {
    if (track < 0) {
      this.songFile = undefined;
      this.hooks.audio.stopBGM();
      return;
    }
    const song = stageSongTrack(this.hooks.stdKey(), track, this.hooks.stageNumber());
    const file = song ? song.file : null;
    if (file === this.songFile) return;
    this.songFile = file;
    // No song at all means no shipped audio either, and silence on the title
    // screen reads as a broken build, so the synthesised stand-in takes over.
    this.hooks.audio.playBGM(file ?? undefined, {
      loop: true,
      fadeIn: 1000,
      loopFromSeconds: song?.introSeconds,
    });
  }
}
