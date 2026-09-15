/**
 * `Gui::RunMsg` as a frame-stepped interpreter (`Gui.cpp:384-905`).
 *
 * The retail VM holds one script at a time, runs every instruction whose frame
 * mark has come due, and stops on instructions that ask to wait. Three details
 * are load-bearing and easy to get wrong:
 *
 * - The advance at `:897-902` is `4 + argSize`, and the loop at `:384-390` keeps
 *   running while `timer >= time`, so `time` is an absolute mark counted in
 *   *played* frames. `timer++` sits at `:905`, past the loop, which means a
 *   `goto run_scripts` (`:711`, `:738`, `:872`, `:884`) skips it: a waiting
 *   instruction does not age the script, and stays where it is for next frame.
 * - A wait is re-entered every frame and only steps past itself once its clock
 *   is up (`:729-738`), so the pause is interruptible by the shoot button only
 *   after `waitThreshold` frames have already elapsed in it (`:723-727`).
 * - `textPending` is the "next line starts a new paragraph" flag. Waits set it
 *   when they finish (`:733`), and op 16 consumes it by rewinding to line 0
 *   (`:621-630`), which is what makes retail dialogue two lines per page.
 *
 * Everything the VM cannot reach from a script - textures, audio, the game
 * manager - goes through `MessageVmHost`, so the interpreter stays testable.
 */
import {
  MSG_OP,
  msgI16,
  msgI32,
  msgText,
  msgTextColor,
  msgTextBody,
  msgTextLine,
  type MsgInstruction,
  type MsgScript,
} from '../format/MsgFile';

/** `portraits[4]`: slots 0/1 are the player pair, 2/3 the enemy pair. */
export const MSG_FACE_SLOTS = 4;
/** `dialogueLines[2]`. */
export const MSG_TEXT_LINES = 2;
/** `:700` the route prompt will not accept a commit before this many frames. */
export const MSG_ROUTE_MIN_FRAMES = 60;
/** `:917` the first second a held skip cannot get a script inside of. */
export const MSG_ONE_SECOND = 60;
/** `:707` / `:734` the threshold a finished wait leaves behind. */
export const MSG_THRESHOLD_AFTER_WAIT = 30;
/** `:741` the threshold a shoot-skipped wait leaves behind. */
export const MSG_THRESHOLD_AFTER_SKIP = 8;
/** `:341` the threshold a freshly started message begins with. */
export const MSG_THRESHOLD_INITIAL = 6;
/** `SOUND_SELECT` and `SOUND_MOVE_MENU`, as the VM names them. */
export const MSG_SOUND_SELECT = 0x11;
export const MSG_SOUND_MOVE_MENU = 0x10;

/** The buttons `g_GuiMessageInputCurrent` samples, with the edges the VM needs. */
export interface MessageInput {
  shoot: boolean;
  /** Rising edge of `shoot`, i.e. `current && current != previous`. */
  shootPressed: boolean;
  skip: boolean;
  upPressed: boolean;
  downPressed: boolean;
  /** `g_Player.playerState == PLAYER_STATE_DYING`, which suspends item collection. */
  dying: boolean;
}

export const idleMessageInput = (): MessageInput => ({
  shoot: false,
  shootPressed: false,
  skip: false,
  upPressed: false,
  downPressed: false,
  dying: false,
});

/**
 * What a script asks the presentation layer to do. Each member names the retail
 * call it stands in for, so a gap here is a gap against the decompile.
 */
export interface MessageVmHost {
  /** `AnmManager::SetAndExecuteScript` on one face VM (op 1). */
  portraitScript(slot: number, script: number): void;
  /** `AnmManager::SetSprite` on one face VM (ops 2, 15, 17). */
  portraitSprite(slot: number, sprite: number): void;
  /** `AnmVm::pendingInterrupt` (ops 5, 15, 17): 3 show, 4 hide, 6 cross-side hide. */
  portraitInterrupt(slot: number, code: number): void;
  /** `AnmManager::DrawTextLeft` on one dialogue line (ops 3, 16, 19, 20). */
  drawLine(line: number, color: number, text: string): void;
  /** The `" "` draw that wipes a line (`:601`, `:627`). */
  clearLine(line: number): void;
  /** `g_Supervisor.PlayMusic` / `StopAudio` (op 7). */
  bgm(track: number): void;
  /** `g_Supervisor.FadeOutMusic(4.0)` (op 12). */
  fadeBgm(): void;
  /** `g_Spellcard.enemyFaceAnm0` cut-in VM (op 8). */
  faceCutIn(): void;
  /** `ScreenEffect::RegisterChain(4, 442, ...)` (op 14). */
  screenEffect(): void;
  /** The stage-result snapshot of power, points, orbs, graze and clock (op 9). */
  stageResult(): void;
  /** `g_GameManager.flags.unk5_6 = 2`, the stage-clear hand-off (op 11). */
  stageClear(): void;
  /** `g_SoundPlayer.PlaySoundByIdx` (op 21). */
  sound(id: number): void;
  /** Publish the route choice; `isGoingToFinalB` is what op 22 stores. */
  routeChosen(choice: number): void;
  /** `g_Gui.FUN_00439810(id)` from op 22: jump to another script. */
  requestMessage(id: number): void;
  /**
   * Optional synchronous form of the same jump. Op 22 keeps running inside the
   * retail `continue`, so a host that already has the script in hand can hand it
   * straight back and the branch starts on the very next frame.
   */
  branchScript?(id: number): MsgScript | null;
  /**
   * `:381-382` `g_ItemManager.AutoCollectAllItems()` runs every frame a message
   * is up, unless the ship is dying — which is why walking into a dialogue in the
   * original sweeps the field of items.
   */
  autoCollectItems(): void;
}

/** The three outcomes the main loop distinguishes. */
const ADVANCE = 0;
const YIELD = 1;
const HALT = 2;
/** Op 22 handed the VM a new script; the loop must not advance or age. */
const SWITCH = 3;

export class MessageVm {
  private script: MsgScript | null = null;
  private cursor = 0;
  private timer = 0;
  private framesInPause = 0;
  private waitThreshold = MSG_THRESHOLD_INITIAL;
  private textPending = false;
  private currentLine = 0;
  private skippable = true;
  private ignoreWaitCounter = 0;
  private messageFlag = 1;
  private route = 0;
  private currentSide = 0;
  private currentPortrait = -1;
  private readonly lines: string[] = ['', ''];

  /** `currentMsgIdx`, -1 while idle. This is what timeline op 7 waits on. */
  messageId = -1;

  constructor(private readonly host: MessageVmHost) {}

  get active(): boolean {
    return this.script !== null;
  }

  /**
   * `currentSide` (`Gui.cpp:146`): the speaking slot, and therefore the index
   * into `textColors[]` that op 16 colours its line with. Ops 15 and 17 write
   * it, and `:342` clears it back to 0 with every new message.
   */
  get side(): number {
    return this.currentSide;
  }

  get text(): readonly string[] {
    return this.lines;
  }

  get routeChoice(): number {
    return this.route;
  }

  /**
   * `FUN_00439810` is not the only writer: the stage-5 id rewrite at
   * `Gui.cpp:263-283` sets `routeChoice` alongside the script it picks, so a host
   * that remaps a message has to be able to arm the choice before it starts.
   */
  setRouteChoice(value: number): void {
    this.route = value;
  }

  get framesElapsed(): number {
    return this.timer;
  }

  get instructionIndex(): number {
    return this.cursor;
  }

  /** `FUN_00439810`: start a script and reset the per-message VM state. */
  play(id: number, script: MsgScript): void {
    this.playKeepingTimer(id, script);
  }

  /**
   * The body of `FUN_0043396d` (`:211-350`).
   *
   * `timer` is deliberately not part of this reset. The decompile never writes
   * it outside the skip at `:376` and the box slide-in read at `:949`, so a
   * nested start - which is exactly what op 22 does - keeps running from the
   * current mark, while the outer `play()` zeroes it because every shipped
   * script is authored from frame 0.
   */
  private playKeepingTimer(id: number, script: MsgScript, resetTimer = true): void {
    this.messageId = id;
    this.script = script;
    this.cursor = 0;
    if (resetTimer) this.timer = 0;
    this.framesInPause = 0;
    this.waitThreshold = MSG_THRESHOLD_INITIAL;
    this.textPending = true;
    this.currentLine = 0;
    this.skippable = true;
    this.ignoreWaitCounter = 0;
    this.messageFlag = 1;
    this.currentSide = 0;
    this.route = 0;
    this.currentPortrait = -1;
    this.lines[0] = '';
    this.lines[1] = '';
    // `:328-329` detaches both lines from their ANM scripts on entry.
    this.host.clearLine(0);
    this.host.clearLine(1);
  }

  /** `:392-393` the VM going idle, whether by op 0 or by the host. */
  stop(): void {
    this.script = null;
    this.messageId = -1;
    this.cursor = 0;
    this.lines[0] = '';
    this.lines[1] = '';
  }

  /** One frame of `Gui::RunMsg`. */
  tick(input: MessageInput): void {
    const script = this.script;
    if (!script) return;
    const instructions = script.instructions;
    // `:370-371` op 6 buys frames during which the VM ignores its own waits.
    if (this.ignoreWaitCounter > 0) this.ignoreWaitCounter--;
    // `:381-382` a live message vacuum-collects the field unless the ship is dying.
    if (!input.dying) this.host.autoCollectItems();
    // `:373-379` holding skip while the script allows it teleports the timer onto
    // the pending instruction, so the whole script runs out in a few frames.
    if (this.cursor < instructions.length && this.skippable && input.skip) {
      this.timer = instructions[this.cursor].time;
    }
    while (this.cursor < instructions.length && this.timer >= instructions[this.cursor].time) {
      const ins = instructions[this.cursor];
      const action = this.exec(ins, input);
      if (action === HALT) {
        this.stop();
        return;
      }
      // `goto run_scripts` skips both the advance and `timer++`.
      if (action === YIELD) return;
      // Op 22 replaced the script underneath us; `continue` in retail re-enters
      // the loop with the *new* instruction pointer, so the next frame picks up
      // the branch instead of walking off the end of the old script.
      if (action === SWITCH) return;
      this.cursor++;
    }
    if (this.cursor >= instructions.length) {
      this.stop();
      return;
    }
    this.timer++;
    // `:917-920` skip also refuses to let a script be dismissed inside its first
    // second, so the portraits and the first line always get drawn.
    if (this.timer < MSG_ONE_SECOND && this.skippable && input.skip) {
      this.timer = MSG_ONE_SECOND;
    }
  }

  /** True when a line currently holds text, i.e. `dialogueLines[i].scriptIndex >= 0`. */
  private lineActive(line: number): boolean {
    return this.lines[line] !== '';
  }

  /**
   * `:399-414` the previous speaker hides, and every other slot is reset.
   * Crossing the player/enemy divide sends interrupt code 6 instead of 4,
   * which is the different flourish. The retail test is on the *integer*
   * halves, so slots 0/1 are one side and 2/3 are the other.
   */
  private armPortraits(side: number): void {
    if (this.currentPortrait === side) return;
    for (let slot = 0; slot < MSG_FACE_SLOTS; slot++) {
      if (this.currentPortrait === slot) {
        const crossed = Math.trunc(this.currentPortrait / 2) !== Math.trunc(side / 2);
        this.host.portraitInterrupt(slot, crossed ? 6 : 4);
      } else {
        this.host.portraitInterrupt(slot, 4);
      }
    }
  }

  private draw(line: number, color: number, text: string): void {
    const slot = line < MSG_TEXT_LINES ? line : MSG_TEXT_LINES - 1;
    this.lines[slot] = text;
    this.host.drawLine(slot, color, text);
  }

  private wipe(line: number): void {
    if (line >= MSG_TEXT_LINES) return;
    if (this.lines[line] === '') return;
    this.lines[line] = '';
    this.host.clearLine(line);
  }

  /**
   * The shared body of the two pausing opcodes. `minFrames` is the operand, and
   * `commitEarly` is the shoot-button escape that only opens once
   * `waitThreshold` frames have passed inside this same pause.
   */
  private pause(input: MessageInput, minFrames: number, gate: number): number {
    if (this.skippable && input.skip) return ADVANCE;
    const escaped = input.shootPressed && this.framesInPause >= gate;
    if (!escaped) {
      if (this.framesInPause >= minFrames) {
        this.textPending = true;
        this.waitThreshold = MSG_THRESHOLD_AFTER_WAIT;
        return ADVANCE;
      }
      this.framesInPause++;
      return YIELD;
    }
    this.textPending = true;
    this.waitThreshold = MSG_THRESHOLD_AFTER_SKIP;
    return ADVANCE;
  }

  /** One `case` of the retail switch. */
  private exec(ins: MsgInstruction, input: MessageInput): number {
    const host = this.host;
    switch (ins.opcode) {
      case MSG_OP.end:
        return HALT;

      case MSG_OP.portraitScript:
        host.portraitScript(msgI16(ins.args, 0), msgI16(ins.args, 2));
        return ADVANCE;

      case MSG_OP.portraitSprite:
        host.portraitSprite(msgI16(ins.args, 0), msgI16(ins.args, 2));
        return ADVANCE;

      case MSG_OP.portraitInterrupt:
        host.portraitInterrupt(msgI16(ins.args, 0), ins.args[2] ?? 0);
        return ADVANCE;

      case MSG_OP.portraitScripts: {
        const side = msgI32(ins.args, 0);
        this.armPortraits(side);
        host.portraitInterrupt(side, 3);
        for (let slot = 0; slot < MSG_FACE_SLOTS; slot++) {
          const sprite = msgI32(ins.args, 4 + slot * 4);
          if (sprite >= 0) host.portraitSprite(slot, sprite);
        }
        this.currentPortrait = side;
        this.currentSide = side;
        this.textPending = true;
        return ADVANCE;
      }

      case MSG_OP.portraitOne: {
        const side = msgI32(ins.args, 0);
        const sprite = msgI32(ins.args, 4);
        this.armPortraits(side);
        host.portraitInterrupt(side, 3);
        if (sprite >= 0) host.portraitSprite(side, sprite);
        this.currentPortrait = side;
        this.currentSide = side;
        this.textPending = true;
        return ADVANCE;
      }

      case MSG_OP.text: {
        const color = msgTextColor(ins.args);
        const line = msgTextLine(ins.args);
        // `:596-602` a new page-0 line takes the second line down with it.
        if (line === 0 && this.lineActive(1)) this.wipe(1);
        this.draw(line, color, msgTextBody(ins.args));
        this.framesInPause = 0;
        return ADVANCE;
      }

      case MSG_OP.textAppend: {
        // `:621-630` a paragraph boundary reclaims both lines.
        if (this.textPending) {
          if (this.lineActive(1)) this.wipe(1);
          this.currentLine = 0;
        }
        this.draw(this.currentLine, this.side, msgText(ins.args));
        this.currentLine++;
        this.framesInPause = 0;
        this.textPending = false;
        return ADVANCE;
      }

      case MSG_OP.textLine0:
        this.draw(0, 0, msgText(ins.args));
        this.framesInPause = 0;
        return ADVANCE;

      case MSG_OP.textLine1:
        this.draw(1, 0, msgText(ins.args));
        this.framesInPause = 0;
        return ADVANCE;

      case MSG_OP.wait:
        return this.pause(input, msgI32(ins.args, 0), this.waitThreshold);

      case MSG_OP.routeChoice: {
        if (input.upPressed && this.route === 1) host.sound(MSG_SOUND_MOVE_MENU);
        if (input.downPressed && this.route === 0) host.sound(MSG_SOUND_MOVE_MENU);
        if (input.upPressed) this.route = 0;
        if (input.downPressed) this.route = 1;
        // `:689-714` Unlike op 4 this prompt has no held-skip escape: only a
        // shoot edge past `:700`'s sixty frames commits it, and the shot count
        // (`:715`'s operand) is a plain timeout that stays silent.
        const minFrames = msgI32(ins.args, 0);
        if (!input.shootPressed || this.framesInPause < MSG_ROUTE_MIN_FRAMES) {
          if (this.framesInPause >= minFrames) {
            this.textPending = true;
            this.waitThreshold = MSG_THRESHOLD_AFTER_WAIT;
            return ADVANCE;
          }
          this.framesInPause++;
          return YIELD;
        }
        host.sound(MSG_SOUND_SELECT);
        return ADVANCE;
      }

      case MSG_OP.routeCommit: {
        // `:715-719` publish the choice, start the branch script, then `continue`
        // so the new instruction pointer runs in the same pass.
        const branch = this.route + 1;
        host.routeChosen(this.route);
        host.requestMessage(branch);
        const script = host.branchScript?.(branch);
        if (!script) {
          // The retail `msgFile` is loaded whole before a stage message can be
          // requested, so a missing branch means the host has nothing to hand
          // over. Retrying would re-run this instruction forever - `:392`'s
          // teardown is the honest fallback.
          return HALT;
        }
        this.playKeepingTimer(branch, script, false);
        return SWITCH;
      }

      case MSG_OP.bgm: {
        const track = msgI32(ins.args, 0);
        if (track < 0) host.bgm(-1);
        else host.bgm(track);
        return ADVANCE;
      }

      case MSG_OP.fadeMusic:
        host.fadeBgm();
        return ADVANCE;

      case MSG_OP.faceCutIn:
        host.faceCutIn();
        this.framesInPause = 0;
        return ADVANCE;

      case MSG_OP.screenEffect:
        host.screenEffect();
        return ADVANCE;

      case MSG_OP.stageResult:
        host.stageResult();
        return ADVANCE;

      case MSG_OP.stageClear:
        // `:880-884` reads `goto run_scripts`, which taken literally would re-arm
        // the flag on the same instruction forever. The flag tears the VM down from
        // `GameManager::OnUpdate`, so the observable behaviour is a one-shot; the
        // same reading applies to op 10, and advance-semantics is what lets every
        // one of the 144 shipped scripts run to its terminator (see the test).
        host.stageClear();
        return ADVANCE;

      case MSG_OP.skippable:
        this.skippable = (ins.args[0] ?? 0) !== 0;
        return ADVANCE;

      case MSG_OP.messageFlag:
        this.messageFlag = ins.args[0] ?? 0;
        return ADVANCE;

      case MSG_OP.ignoreWait:
        this.ignoreWaitCounter++;
        return ADVANCE;

      case MSG_OP.nop:
        return ADVANCE;

      default:
        return ADVANCE;
    }
  }

  get flag(): number {
    return this.messageFlag;
  }

  get waitsIgnored(): number {
    return this.ignoreWaitCounter;
  }
}
