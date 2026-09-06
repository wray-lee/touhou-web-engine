type Listener<T = any> = (payload: T) => void;

export class EventEmitter {
  private events = new Map<string, Set<Listener>>();

  on<T = any>(event: string, listener: Listener<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener as Listener);
    return () => this.off(event, listener);
  }

  off<T = any>(event: string, listener: Listener<T>): void {
    const set = this.events.get(event);
    if (set) {
      set.delete(listener as Listener);
      if (set.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit<T = any>(event: string, payload?: T): void {
    const set = this.events.get(event);
    if (set) {
      for (const listener of set) {
        listener(payload);
      }
    }
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}
