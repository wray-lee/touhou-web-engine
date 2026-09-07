import { EventEmitter } from './EventEmitter';
import { Entity } from './Entity';

export interface StageTimelineEvent {
  frame: number;
  action: (stage: Stage) => void;
  executed?: boolean;
}

/** Queued dialogue line produced by `Stage.showDialogue` (ticket 08 StageContext API). */
export interface StageDialogue {
  text: string;
  frames: number;
}

/** Queued boss phase request produced by `Stage.startBossPhase`. */
export interface StageBossPhaseRequest {
  boss: Entity;
  index: number;
}

export interface StageConfig {
  timeline: StageTimelineEvent[];
  name?: string;
  stageNumber?: number;
}

export class Stage extends EventEmitter {
  public name: string;
  public stageNumber: number;
  public currentFrame = 0;
  public isPaused = false;
  public isCompleted = false;

  /** StageContext API (ticket 08): timeline-produced entities, drained by the host game. */
  public readonly spawnedEntities: Entity[] = [];
  /** Pending boss phase requests, drained by the host game. */
  public readonly bossPhaseRequests: StageBossPhaseRequest[] = [];
  /** Pending dialogue lines, drained by the host game. */
  public readonly dialogueQueue: StageDialogue[] = [];

  private timeline: StageTimelineEvent[];

  constructor(config: StageConfig) {
    super();
    this.name = config.name ?? 'Stage';
    this.stageNumber = config.stageNumber ?? 1;
    this.timeline = [...config.timeline].sort((a, b) => a.frame - b.frame);
  }

  update(dtFrames = 1): void {
    if (this.isPaused || this.isCompleted) return;

    const previousFrame = this.currentFrame;
    this.currentFrame += dtFrames;

    for (const event of this.timeline) {
      if (!event.executed && event.frame > previousFrame && event.frame <= this.currentFrame) {
        event.executed = true;
        event.action(this);
      }
    }
  }

  complete(): void {
    this.isCompleted = true;
    this.emit('complete', this);
  }

  /** StageContext API (ticket 08): enqueue an entity for the host game to spawn. */
  spawnEntity(entity: Entity): void {
    this.spawnedEntities.push(entity);
  }

  /** StageContext API (ticket 08): request the host game to switch `boss` to phase `index`. */
  startBossPhase(boss: Entity, index: number): void {
    this.bossPhaseRequests.push({ boss, index });
  }

  /** StageContext API (ticket 08): enqueue a dialogue/message line for the host HUD. */
  showDialogue(text: string, frames = 180): void {
    this.dialogueQueue.push({ text, frames });
  }

  reset(): void {
    this.currentFrame = 0;
    this.isPaused = false;
    this.isCompleted = false;
    this.spawnedEntities.length = 0;
    this.bossPhaseRequests.length = 0;
    this.dialogueQueue.length = 0;
    for (const event of this.timeline) {
      event.executed = false;
    }
  }
}
