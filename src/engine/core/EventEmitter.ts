type Listener<T = any> = (payload: T) => void;

/**
 * emit() argument list for a payload type.
 * `void` events keep an optional payload so legacy call sites (`emit('destroy', this)`)
 * stay valid without widening the declared event type.
 */
type EventArgs<T> = T extends void ? [payload?: any] : [payload: T];

/**
 * Minimal typed pub/sub. `EventMap` maps event name -> payload type; the default
 * (fully open) map keeps untyped usage source-compatible.
 */
export class EventEmitter<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  private events = new Map<string, Set<Listener>>();

  on<K extends keyof EventMap & string>(event: K, listener: Listener<EventMap[K]>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener as Listener);
    return () => this.off(event, listener);
  }

  /** Subscribe for the next emission only; auto-unsubscribes before invoking the listener. */
  once<K extends keyof EventMap & string>(event: K, listener: Listener<EventMap[K]>): () => void {
    const off = this.on(event, (payload) => {
      off();
      listener(payload);
    });
    return off;
  }

  off<K extends keyof EventMap & string>(event: K, listener: Listener<EventMap[K]>): void {
    const set = this.events.get(event);
    if (set) {
      set.delete(listener as Listener);
      if (set.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit<K extends keyof EventMap & string>(event: K, ...args: EventArgs<EventMap[K]>): void {
    const set = this.events.get(event);
    if (set) {
      for (const listener of set) {
        listener(args[0]);
      }
    }
  }

  removeAllListeners(): void {
    this.events.clear();
  }
}
