import { describe, it, expect, vi } from 'vitest';
import { EventEmitter } from './EventEmitter';

describe('EventEmitter', () => {
  it('invokes listeners registered via on() for each emit', () => {
    const emitter = new EventEmitter<{ ping: number }>();
    const listener = vi.fn();
    emitter.on('ping', listener);

    emitter.emit('ping', 1);
    emitter.emit('ping', 2);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenNthCalledWith(1, 1);
    expect(listener).toHaveBeenNthCalledWith(2, 2);
  });

  it('supports multiple listeners per event and other events stay silent', () => {
    const emitter = new EventEmitter<{ a: string; b: string }>();
    const a1 = vi.fn();
    const a2 = vi.fn();
    const b = vi.fn();
    emitter.on('a', a1);
    emitter.on('a', a2);
    emitter.on('b', b);

    emitter.emit('a', 'x');

    expect(a1).toHaveBeenCalledWith('x');
    expect(a2).toHaveBeenCalledWith('x');
    expect(b).not.toHaveBeenCalled();
  });

  it('removes a listener via off() and via the on() unsubscribe handle', () => {
    const emitter = new EventEmitter<{ ping: void }>();
    const viaOff = vi.fn();
    const viaHandle = vi.fn();
    const offHandle = emitter.on('ping', viaHandle);

    emitter.on('ping', viaOff);
    emitter.off('ping', viaOff);
    offHandle();

    emitter.emit('ping');

    expect(viaOff).not.toHaveBeenCalled();
    expect(viaHandle).not.toHaveBeenCalled();
  });

  it('off() on an unknown event or unknown listener is a no-op', () => {
    const emitter = new EventEmitter<{ ping: void }>();
    expect(() => emitter.off('ping', () => {})).not.toThrow();
  });

  it('once() fires exactly once and auto-unsubscribes', () => {
    const emitter = new EventEmitter<{ ping: number }>();
    const listener = vi.fn();
    emitter.once('ping', listener);

    emitter.emit('ping', 1);
    emitter.emit('ping', 2);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);
  });

  it('once() unsubscribe handle removes it before it ever fires', () => {
    const emitter = new EventEmitter<{ ping: void }>();
    const listener = vi.fn();
    const off = emitter.once('ping', listener);

    off();
    emitter.emit('ping');

    expect(listener).not.toHaveBeenCalled();
  });

  it('removeAllListeners() clears every event', () => {
    const emitter = new EventEmitter<{ a: void; b: void }>();
    const a = vi.fn();
    const b = vi.fn();
    emitter.on('a', a);
    emitter.on('b', b);

    emitter.removeAllListeners();
    emitter.emit('a');
    emitter.emit('b');

    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('emitting an event without listeners does not throw', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit('nobody-listening', 42)).not.toThrow();
  });
});
