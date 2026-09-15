export type TimePhase = 'dawn' | 'day' | 'dusk' | 'night';

export interface TimeSnapshot {
  frame: number;
  progress: number;
  phase: TimePhase;
  isNight: boolean;
  brightness: number;
  backgroundColor: number;
}

export class TimeSystem {
  public frame = 0;
  public readonly cycleFrames: number;

  constructor(cycleFrames = 3600) {
    this.cycleFrames = Math.max(1, cycleFrames);
  }

  advance(dtFrames = 1): void {
    this.frame = Math.max(0, this.frame + dtFrames);
  }

  reset(): void {
    this.frame = 0;
  }

  get progress(): number {
    return (this.frame % this.cycleFrames) / this.cycleFrames;
  }

  get phase(): TimePhase {
    const progress = this.progress;
    if (progress < 0.2) return 'dawn';
    if (progress < 0.5) return 'day';
    if (progress < 0.7) return 'dusk';
    return 'night';
  }

  get isNight(): boolean {
    return this.phase === 'dusk' || this.phase === 'night';
  }

  get brightness(): number {
    switch (this.phase) {
      case 'dawn':
        return 0.72 + this.progress * 0.8;
      case 'day':
        return 1;
      case 'dusk':
        return 0.9;
      case 'night':
        return 0.58;
    }
    return 1;
  }

  get backgroundColor(): number {
    switch (this.phase) {
      case 'dawn':
        return 0x211b32;
      case 'day':
        return 0x182a3a;
      case 'dusk':
        return 0x2d1b38;
      case 'night':
        return 0x0d0d16;
    }
    return 0x0d0d16;
  }

  snapshot(): TimeSnapshot {
    return {
      frame: this.frame,
      progress: this.progress,
      phase: this.phase,
      isNight: this.isNight,
      brightness: this.brightness,
      backgroundColor: this.backgroundColor,
    };
  }
}
