/**
 * Drives EclTimeline instructions: spawns enemies at the scripted frame.
 *
 * Each timeline instruction is {time, opcode, args}. The runner advances one frame at
 * a time and walks every instruction whose `time` has arrived, freezing in place when
 * an instruction says to wait, which is exactly `EclTimeline::Run`'s
 * `timer--; goto done` at `EnemyTimeline.cpp:243`/`:263`/`:282`.
 */

import type { EclTimeline, EclTimelineInstruction } from '../format/EclFile';
import { TIMELINE_DIFFICULTY_MASK, type GameState } from './GameState';
import { EnemyManager } from './EnemyManager';
import { PLAYFIELD_W } from './Playfield';

/**
 * `reinterpret_cast<f32 *>(args)[n]`: the timeline stores spawn coordinates as the raw
 * bits of a float inside an `Int32Array`, so every read has to reinterpret them.
 */
const f32 = (bits: number): number => new Float32Array(new Int32Array([bits]).buffer)[0];

export class TimelineRunner {
  private timeline: EclTimeline;
  private cursor = 0;
  private timer = 0;

  /**
   * The script's own clock. It stops while a waiting case holds, so it drifts
   * behind `GameState.frame`, which keeps running: retail rewinds `timer--` at
   * `EnemyTimeline.cpp:243`/`:263`/`:282` for exactly this reason.
   */
  get scriptTimer(): number {
    return this.timer;
  }
  private gs: GameState;
  private enemies: EnemyManager;
  /**
   * Bit for the active difficulty in the *timeline* encoding, which is shifted one
   * place up from the ECL sub-instruction encoding. Using `gs.difficultyMask` here
   * silently drops every final boss spawn, because those all carry byte 0xFE.
   */
  private timelineMask: number;
  public finished = false;
  /**
   * `g_EclEnemyTableF54CC0[87..90]`: the four message slots ops 13 and 14 negotiate
   * over. The table is zero-initialised in the executable, so a slot holding `-1` is
   * the only state `op 14` will write into, and `op 13` consumes every match at once.
   */
  private readonly messageSlots = [0, 0, 0, 0];

  constructor(timeline: EclTimeline, gs: GameState, enemies: EnemyManager) {
    this.timeline = timeline;
    this.gs = gs;
    this.enemies = enemies;
    this.timelineMask = TIMELINE_DIFFICULTY_MASK[gs.difficulty];
  }

  /** Advance one game frame. */
  tick(): void {
    if (this.finished) return;

    const instructions = this.timeline.instructions;

    while (this.cursor < instructions.length) {
      const ins = instructions[this.cursor];

      if (ins.time > this.timer) break;
      if (ins.time === this.timer) {
        // Difficulty filter
        if ((ins.difficultyMask & this.timelineMask) === 0) {
          this.cursor++;
          continue;
        }

        if (!this.dispatch(ins)) {
          // dispatch returned false = waiting (e.g. for boss to die)
          return;
        }
        this.cursor++;
      } else {
        this.cursor++;
      }
    }

    if (this.cursor >= instructions.length) {
      this.finished = true;
    }

    this.timer++;
  }

  /**
   * Execute one timeline instruction. `false` means "stay here for another frame",
   * which is how the four retail waiting cases (`7`, `10`, `13` and the message box)
   * hold the script without burning its frame counter.
   */
  private dispatch(ins: EclTimelineInstruction): boolean {
    const args = ins.args;

    switch (ins.opcode) {
      // Op 15 has no boss gate (`EnemyTimeline.cpp:169-177`); the others all sit
      // behind `!g_Gui.IsBossPresent() && table[91] == NULL` (`:158`, `:205`, `:222`).
      case 0: // spawn
      case 1: // spawn, mirrored
      case 15: {
        if (ins.opcode !== 15 && this.spawnBlocked()) return true;
        this.enemies.spawnFromTimeline(args[0], f32(args[1]), f32(args[2]), args[3] ?? 0, {
          dropType: args[4],
          score: args[5],
          mirror: ins.opcode === 1,
        });
        return true;
      }

      // `[sub, xMin, xMax, y, hp, dropType, score]`: the first two floats bound a
      // random column, they are not a position (`EnemyTimeline.cpp:202-215`).
      case 2: // spawn in an x range
      case 4: {
        if (this.spawnBlocked()) return true;
        const lo = f32(args[1]);
        const hi = f32(args[2]);
        const x = this.gs.rng.randomF32InRange(hi - lo) + lo;
        this.enemies.spawnFromTimeline(args[0], x, f32(args[3]), args[4] ?? 0, {
          dropType: args[5],
          score: args[6],
          mirror: ins.opcode === 4,
        });
        return true;
      }

      // `[sub, y, hp, dropType, score]` at a random playfield column (`:219-233`).
      case 3: // spawn anywhere across the playfield
      case 5: {
        if (this.spawnBlocked()) return true;
        this.enemies.spawnFromTimeline(
          args[0],
          this.gs.rng.randomF32InRange(PLAYFIELD_W),
          f32(args[1]),
          args[2] ?? 0,
          { dropType: args[3], score: args[4], mirror: ins.opcode === 5 },
        );
        return true;
      }

      // `[sub, x, y, hp, points, power, score]` with the drop type forced to -1, so
      // the enemy itself draws from the global schedule while `points` and `power`
      // are queued on top of it (`EnemyTimeline.cpp:180-199`).
      case 11:
      case 12: {
        if (this.spawnBlocked()) return true;
        this.enemies.spawnFromTimeline(args[0], f32(args[1]), f32(args[2]), args[3] ?? 0, {
          dropType: -1,
          score: args[6],
          pointDrops: args[4],
          powerDrops: args[5],
          mirror: ins.opcode === 12,
        });
        return true;
      }

      // Op 6 starts one of `Gui`'s message sequences — stage title, boss intro,
      // dialogue. It is not a wait, which is what the old case 6 got wrong: it stalled
      // the whole timeline until the boss marker went away.
      case 6:
        this.gs.stageMessageRequest = args[0];
        return true;

      // `Gui::MsgWait()` (`Gui.cpp:1029-1036`): hold while a message owns the screen.
      // Nothing owns the screen until the message VM exists, so this advances.
      case 7:
        return !this.gs.messagePending;

      // `table[args[0]]->0x2D30 = (i16)args[1]`: ask the enemy holding marker slot
      // `args[0]` to switch into its armed lane at its next dispatch
      // (`EnemyTimeline.cpp:248-252`). Every shipped call site passes lane 1, and op
      // 126 already starts that lane eagerly, so there is nothing left to do here.
      case 8:
        return true;

      case 9:
        this.gs.power = args[0];
        return true;

      // Wait while the enemy that claimed marker slot `args[0]` is still alive
      // (`EnemyTimeline.cpp:258-266`). This is the real "wait for the boss".
      case 10: {
        const marker = args[0];
        for (const slot of this.enemies.slots) {
          if (!slot.active || !slot.isBoss || slot.bossMarker !== marker) continue;
          return false;
        }
        return true;
      }

      // Consume a message token: every slot that already holds `args[0]` is cleared,
      // and the timeline waits if none did (`EnemyTimeline.cpp:268-286`).
      case 13: {
        let matched = 0;
        for (let i = 0; i < this.messageSlots.length; i++) {
          if (this.messageSlots[i] !== args[0]) continue;
          matched++;
          this.messageSlots[i] = -1;
        }
        return matched > 0;
      }

      // Refill every spent slot with `args[0]`. The retail loop has no break, so one
      // instruction arms all four (`EnemyTimeline.cpp:288-298`).
      case 14:
        for (let i = 0; i < this.messageSlots.length; i++) {
          if (this.messageSlots[i] >= 0) continue;
          this.messageSlots[i] = args[0];
        }
        return true;

      case 16:
        this.gs.showRetryMenu = true;
        return true;

      default:
        return true;
    }
  }

  /** `!g_Gui.IsBossPresent() && g_EclEnemyTableF54CC0[91] == NULL`. */
  private spawnBlocked(): boolean {
    return this.gs.isBossPresent || this.gs.spawnPaused;
  }
}
