import { EventEmitter } from './EventEmitter';

export interface StageTimelineEvent {
  frame: number;
  action: (stage: Stage) => void;
  executed?: boolean;
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

  reset(): void {
    this.currentFrame = 0;
    this.isPaused = false;
    this.isCompleted = false;
    for (const event of this.timeline) {
      event.executed = false;
    }
  }
}
