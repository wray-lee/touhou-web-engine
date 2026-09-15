/**
 * The RIFF reader behind the sound bank.
 *
 * The shipped recordings are 22050 Hz mono 8-bit PCM, which is the one format
 * browsers disagree about handing to `decodeAudioData` - so the port reads the
 * chunks itself, and this checks the arithmetic, including the unsigned 8-bit
 * silence point and the odd-length chunk padding the spec requires.
 */

import { describe, expect, it } from 'vitest';
import { parseWav } from './Wav';

function chunk(tag: string, body: Uint8Array): number[] {
  const size = body.length;
  const out = [
    ...tag.split('').map((c) => c.charCodeAt(0)),
    size & 0xff,
    (size >> 8) & 0xff,
    (size >> 16) & 0xff,
    (size >> 24) & 0xff,
    ...body,
  ];
  // A chunk with an odd byte count is padded to keep the next one word-aligned.
  if (size % 2) out.push(0);
  return out;
}

function wav(fmt: Uint8Array, data: Uint8Array, extra: Uint8Array = new Uint8Array(0)): Uint8Array {
  const body = [...chunk('fmt ', fmt), ...chunk('fact', new Uint8Array(4)), ...chunk('data', data)];
  if (extra.length) body.push(...chunk('adtl', extra));
  const size = 4 + body.length;
  const head = [
    ...'RIFF'.split('').map((c) => c.charCodeAt(0)),
    size & 0xff,
    (size >> 8) & 0xff,
    (size >> 16) & 0xff,
    (size >> 24) & 0xff,
    ...'WAVE'.split('').map((c) => c.charCodeAt(0)),
  ];
  return new Uint8Array([...head, ...body]);
}

const fmt = (format: number, channels: number, rate: number, bits: number): Uint8Array => {
  const bytes = new Uint8Array(16);
  const view = new DataView(bytes.buffer);
  view.setUint16(0, format, true);
  view.setUint16(2, channels, true);
  view.setUint32(4, rate, true);
  view.setUint32(8, (rate * channels * bits) / 8, true);
  view.setUint16(12, (channels * bits) / 8, true);
  view.setUint16(14, bits, true);
  return bytes;
};

describe('parseWav', () => {
  it('reads the shipped 8-bit mono shape', () => {
    // 128 is silence, 0 and 255 are the two extremes either side of it.
    const parsed = parseWav(wav(fmt(1, 1, 22050, 8), new Uint8Array([128, 0, 255, 192])));
    expect(parsed).not.toBeNull();
    expect(parsed?.sampleRate).toBe(22050);
    expect(parsed?.channels).toBe(1);
    expect(Array.from(parsed!.samples)).toEqual([0, -1, 127 / 128, 0.5]);
  });

  it('reads 16-bit stereo as interleaved channels', () => {
    const data = new Uint8Array(8);
    const view = new DataView(data.buffer);
    view.setInt16(0, 16384, true);
    view.setInt16(2, -16384, true);
    view.setInt16(4, 32767, true);
    view.setInt16(6, -32768, true);
    const parsed = parseWav(wav(fmt(1, 2, 44100, 16), data));
    expect(parsed?.channels).toBe(2);
    expect(parsed?.samples.length).toBe(4);
    expect(parsed?.samples[0]).toBeCloseTo(0.5, 5);
    expect(parsed?.samples[1]).toBeCloseTo(-0.5, 5);
    expect(parsed?.samples[3]).toBeCloseTo(-1, 5);
  });

  it('walks past unknown chunks to find the samples', () => {
    const odd = new Uint8Array([1, 2, 3]); // three bytes, so the reader must skip the pad
    const parsed = parseWav(wav(fmt(1, 1, 22050, 8), new Uint8Array([128]), odd));
    expect(parsed?.samples).toEqual(new Float32Array([0]));
  });

  it('refuses anything it is not sure about', () => {
    expect(parseWav(new Uint8Array([1, 2, 3]))).toBeNull();
    expect(parseWav(new Uint8Array(0))).toBeNull();
    const noData = wav(fmt(1, 1, 22050, 8), new Uint8Array(0));
    expect(parseWav(noData)).toBeNull();
    const adpcm = wav(fmt(2, 1, 22050, 4), new Uint8Array([0, 0]));
    expect(parseWav(adpcm)).toBeNull();
  });
});
