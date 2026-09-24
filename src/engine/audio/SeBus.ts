/**
 * A sound-effect bus shaped like the shipped game's own.
 *
 * The retail player does not fire a sound when gameplay asks for one: it writes the
 * requested index into a 12-slot queue (`SoundPlayer.cpp:487-514`, `SFX_QUEUE_LENGTH`
 * at `SoundPlayer.hpp:85`) and plays the whole queue once per frame. Two consequences
 * are audible and neither is decoration:
 *
 *   - Requests for the same index inside one frame collapse into a single voice, so a
 *     60-bullet ring spawns one shot sound, not sixty. Anything else sounds like a
 *     wall of noise, which is exactly how an unmimicked port reads.
 *   - There is one voice per index (`Stop()` + `SetCurrentPosition(0)` + `Play()` at
 *     `:826-844`), so a sound retriggers itself instead of stacking with itself.
 *
 * Per-index gain is not a free parameter either: `g_SoundBufferIdxVol` carries a
 * millibel level for every index (`SoundPlayer.cpp:20-29`), and the volume slider
 * moves each of them with a cubic taper on the mB scale (`:830-839`). Both laws are
 * here as pure functions so they can be tested without a browser.
 *
 * Nothing in this file knows about Touhou: the sound table and the index names come
 * in from the game through `SeBusSource`.
 */
import { parseWav } from './Wav';
import { resolveAssetUrl } from '../core/ResourceResolver';

/** One row of `g_SoundBufferIdxVol`: which file, and how loud. */
export interface SeBusEntry {
  /** Index into `SeBusSource.files`. */
  buffer: number;
  /** Base level in millibels, as DirectSound takes it (0 is full scale). */
  mb: number;
}

export interface SeBusSource {
  /** One path per `SeBusEntry.buffer`. */
  files: readonly string[];
  /** One entry per logical sound index, in index order. */
  entries: readonly SeBusEntry[];
}

/** `SFX_QUEUE_LENGTH` (`SoundPlayer.hpp:85`). */
export const SE_QUEUE_LENGTH = 12;

/**
 * How many frames a request waits for its recording to arrive.
 *
 * Retail has every sample resident before the first frame; the port streams the bank
 * from the hosting server, so the very first shot of a session would otherwise be the
 * one that goes missing. Twenty frames is a third of a second - long enough for a
 * local fetch, short enough that a file which never arrives cannot hold the queue.
 */
export const SE_RETRY_FRAMES = 20;

/** DirectSound takes volume in tenths of a decibel. */
export function millibelsToGain(mb: number): number {
  return 10 ** (mb / 2000);
}

/**
 * `SoundPlayer.cpp:830-836`: the 0-100 slider becomes `1 - (1 - f)^3`.
 *
 * The taper is why the low end of the retail slider is so gentle: half the slider is
 * still only -1.25 dB short of full.
 */
export function sfxVolumeFactor(slider: number): number {
  const f = Math.max(0, Math.min(1, slider));
  if (f <= 0) return 0;
  const inv = 1 - f;
  return 1 - inv * inv * inv;
}

/**
 * The gain one index ends up with: `:837-838` maps `(base + 5000) * factor - 5000`
 * millibels onto the slider, so the whole bank slides down together and the slider
 * at zero is silence rather than a muffled mix.
 */
export function seGain(mb: number, slider: number): number {
  const factor = sfxVolumeFactor(slider);
  if (factor <= 0) return 0;
  return millibelsToGain(Math.round((mb + 5000) * factor) - 5000);
}

/** A queued request: the index, and the pan submissions gathered for it. */
export interface SeRequest {
  idx: number;
  panSum: number;
  panCount: number;
  /** Frames this request has already waited for its recording. */
  tries: number;
}

/**
 * Push one request into a frame queue with the retail merge rules.
 *
 * An index already waiting gets its pan averaged in (`:816-820`) instead of a second
 * voice; a full queue drops the request (`:507-508`). Returns whether it was taken.
 */
export function seQueuePush(slots: SeRequest[], idx: number, pan: number): boolean {
  for (const slot of slots) {
    if (slot.idx === idx) {
      slot.panSum += pan;
      slot.panCount += 1;
      return false;
    }
  }
  if (slots.length >= SE_QUEUE_LENGTH) return false;
  slots.push({ idx, panSum: pan, panCount: 1, tries: 0 });
  return true;
}

const defaultLoad = (path: string): Promise<ArrayBuffer> =>
  fetch(resolveAssetUrl(path)).then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(`HTTP ${res.status}`))));

export class SeBus {
  private slots: SeRequest[] = [];
  /** Decoded audio, keyed by file path so indices sharing a recording share it too. */
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Set<string>();
  private failed = new Set<string>();
  /** One live voice per index, which is what makes a retrigger cut the old one. */
  private voices = new Map<number, AudioBufferSourceNode>();
  private volume = 1;
  private frameHandle = 0;

  constructor(
    private readonly source: SeBusSource,
    private readonly context: () => AudioContext | undefined,
    private readonly load: (path: string) => Promise<ArrayBuffer> = defaultLoad,
  ) {}

  /** How many requests are waiting for this frame's flush. Debug aid. */
  get pending(): number {
    return this.slots.length;
  }

  /**
   * How many of the bank's recordings are decoded and ready. Debug aid: it is the
   * difference between "the table is wired up" and "the sound is actually there".
   */
  get loaded(): number {
    return this.buffers.size;
  }

  /** A name for the slider: it changes every gain through `seGain`. */
  setVolume(slider: number): void {
    this.volume = Math.max(0, Math.min(1, slider));
  }

  /**
   * Ask for sound `idx`. `pan` is -1..1 (`PlaySoundByIdx` passes 0, which is why an
   * unpositioned request lands dead centre).
   */
  queue(idx: number, pan = 0): void {
    const entry = this.source.entries[idx];
    if (!entry) return;
    this.ensure(entry);
    seQueuePush(this.slots, idx, Math.max(-1, Math.min(1, pan)));
    this.schedule();
  }

  /** Fetch and decode every file in the table, so the first hit is not late. */
  preload(): void {
    for (const entry of this.source.entries) this.ensure(entry);
  }

  /** Cut everything. Used when the run stops mid-frame. */
  stopAll(): void {
    for (const voice of this.voices.values()) {
      try {
        voice.stop();
      } catch {
        // already finished
      }
    }
    this.voices.clear();
    this.slots.length = 0;
  }

  /**
   * Kick off one load. A file that fails is remembered as missing so a busy frame
   * does not keep re-requesting it.
   */
  private ensure(entry: SeBusEntry): void {
    const path = this.source.files[entry.buffer];
    if (!path || this.buffers.has(path) || this.loading.has(path) || this.failed.has(path)) return;
    const ctx = this.context();
    if (!ctx) return;
    this.loading.add(path);
    this.load(path)
      .then((bytes) => {
        const wav = parseWav(new Uint8Array(bytes));
        if (!wav) throw new Error('unparsable wav');
        const buffer = ctx.createBuffer(
          wav.channels,
          Math.floor(wav.samples.length / wav.channels),
          wav.sampleRate,
        );
        for (let ch = 0; ch < wav.channels; ch++) {
          buffer.copyToChannel(
            wav.samples.filter((_, i) => i % wav.channels === ch),
            ch,
          );
        }
        this.buffers.set(path, buffer);
      })
      .catch(() => {
        this.failed.add(path);
      })
      .finally(() => {
        this.loading.delete(path);
      });
  }

  private schedule(): void {
    if (this.frameHandle) return;
    if (typeof requestAnimationFrame !== 'function') {
      this.flush();
      return;
    }
    this.frameHandle = requestAnimationFrame(() => {
      this.frameHandle = 0;
      this.flush();
    });
  }

  /** Play the frame's queue, then empty it. */
  flush(): void {
    const ctx = this.context();
    const slots = this.slots;
    this.slots = [];
    if (!ctx) {
      return;
    }
    for (const slot of slots) {
      const entry = this.source.entries[slot.idx];
      if (!entry) continue;
      const path = this.source.files[entry.buffer];
      const buffer = path ? this.buffers.get(path) : undefined;
      if (!buffer) {
        const waiting = path && !this.failed.has(path) && slot.tries < SE_RETRY_FRAMES;
        if (waiting) {
          slot.tries += 1;
          seQueuePush(this.slots, slot.idx, slot.panSum / slot.panCount);
        }
        continue;
      }
      const gain = seGain(entry.mb, this.volume);
      if (gain <= 0) continue;
      this.voices.get(slot.idx)?.stop();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const volume = ctx.createGain();
      volume.gain.value = gain;
      const pan = ctx.createStereoPanner();
      pan.pan.value = slot.panSum / slot.panCount;
      source.connect(volume).connect(pan).connect(ctx.destination);
      this.voices.set(slot.idx, source);
      source.onended = () => {
        if (this.voices.get(slot.idx) === source) this.voices.delete(slot.idx);
      };
      source.start();
    }
  }
}
