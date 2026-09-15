import { InputAction, InputSnapshot } from '../core/InputSystem';

export interface ReplayMetadata {
  stage: number;
  difficulty: string;
  character: string;
}

export interface ReplayFrame {
  frame: number;
  snapshot: InputSnapshot;
}

export interface ReplayData {
  version: 1;
  metadata: ReplayMetadata;
  frames: ReplayFrame[];
}

export class ReplayRecorder {
  private frames: ReplayFrame[] = [];
  private recording = false;
  private metadata: ReplayMetadata = { stage: 1, difficulty: 'normal', character: 'reimu-yukari' };

  start(metadata: ReplayMetadata): void {
    this.metadata = { ...metadata };
    this.frames = [];
    this.recording = true;
  }

  capture(frame: number, snapshot: InputSnapshot): void {
    if (!this.recording) return;
    this.frames.push({
      frame,
      snapshot: {
        actions: [...snapshot.actions],
        pointerPos: { ...snapshot.pointerPos },
        isDragging: snapshot.isDragging,
      },
    });
  }

  stop(): ReplayData {
    this.recording = false;
    return this.stopSnapshot();
  }

  private stopSnapshot(): ReplayData {
    return {
      version: 1,
      metadata: { ...this.metadata },
      frames: this.frames.map((frame) => ({
        ...frame,
        snapshot: {
          ...frame.snapshot,
          actions: [...frame.snapshot.actions],
          pointerPos: { ...frame.snapshot.pointerPos },
        },
      })),
    };
  }

  /** Current recording without stopping it (safe to call every frame). */
  peek(): ReplayData {
    return this.stopSnapshot();
  }

  get frameCount(): number {
    return this.frames.length;
  }

  get isRecording(): boolean {
    return this.recording;
  }

  static encode(data: ReplayData): string {
    return JSON.stringify(data);
  }

  static decode(serialized: string): ReplayData {
    const parsed = JSON.parse(serialized) as ReplayData;
    if (parsed.version !== 1 || !Array.isArray(parsed.frames)) throw new Error('Unsupported replay format');
    return parsed;
  }
}

export class ReplayPlayer {
  private cursor = 0;

  constructor(public readonly data: ReplayData) {}

  reset(): void {
    this.cursor = 0;
  }

  next(): ReplayFrame | undefined {
    const frame = this.data.frames[this.cursor];
    if (frame) this.cursor++;
    return frame;
  }

  get isFinished(): boolean {
    return this.cursor >= this.data.frames.length;
  }
}

export function normalizeReplayActions(actions: string[]): InputAction[] {
  const known: InputAction[] = [
    'up',
    'down',
    'left',
    'right',
    'shoot',
    'bomb',
    'slow',
    'pause',
    'skip',
    'debug',
    'debug-collision',
  ];
  return actions.filter((action): action is InputAction => known.includes(action as InputAction));
}
