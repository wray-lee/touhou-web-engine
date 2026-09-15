/**
 * Minimal RIFF/WAVE reader.
 *
 * The shipped sound bank stores its effects as plain PCM wav (the extraction tool
 * only strips the container, so `se_tan00.wav` is 22050 Hz / mono / 8-bit), and
 * `decodeAudioData` is asynchronous and browser-specific about 8-bit samples.
 * Reading the chunks directly keeps the audio path deterministic and lets the same
 * bytes be inspected in a unit test.
 */

export interface WavData {
  sampleRate: number;
  /** One channel, or two interleaved. */
  channels: number;
  /** Normalised to [-1, 1), one sample per channel. */
  samples: Float32Array;
}

/** `wFormatTag` values this reader understands. */
const PCM = 1;
const IEEE_FLOAT = 3;

function tag(bytes: Uint8Array, at: number): string {
  return String.fromCharCode(bytes[at], bytes[at + 1], bytes[at + 2], bytes[at + 3]);
}

function u16(bytes: Uint8Array, at: number): number {
  return bytes[at] | (bytes[at + 1] << 8);
}

function u32(bytes: Uint8Array, at: number): number {
  return (bytes[at] | (bytes[at + 1] << 8) | (bytes[at + 2] << 16) | (bytes[at + 3] << 24)) >>> 0;
}

/**
 * Read a wav blob, or `null` when the format is one this reader cannot handle.
 *
 * Unknown chunk types are skipped in pairs (a chunk may be odd-length, in which
 * case the spec pads it with one byte), which is what the shipped files need:
 * they carry an `adtl`/`LIST` tail after `data`.
 */
export function parseWav(bytes: Uint8Array): WavData | null {
  if (bytes.length < 12 || tag(bytes, 0) !== 'RIFF' || tag(bytes, 8) !== 'WAVE') return null;
  let format = 0;
  let channels = 0;
  let sampleRate = 0;
  let bits = 0;
  let data: Uint8Array | null = null;
  for (let at = 12; at + 8 <= bytes.length;) {
    const name = tag(bytes, at);
    const size = u32(bytes, at + 4);
    const body = at + 8;
    if (name === 'fmt ') {
      format = u16(bytes, body);
      channels = u16(bytes, body + 2);
      sampleRate = u32(bytes, body + 4);
      bits = u16(bytes, body + 14);
    } else if (name === 'data') {
      data = bytes.subarray(body, Math.min(body + size, bytes.length));
    }
    at = body + size + (size % 2);
  }
  // An empty `data` chunk is not a recording: it would make a zero-length buffer,
  // which `createBuffer` rejects.
  if (!data?.length || !channels || !sampleRate || !bits) return null;
  if (format !== PCM && format !== IEEE_FLOAT) return null;
  const perSample = bits / 8;
  const count = Math.floor(data.length / perSample);
  const samples = new Float32Array(count);
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  for (let i = 0; i < count; i++) {
    const at = i * perSample;
    if (format === IEEE_FLOAT) {
      samples[i] = bits === 32 ? view.getFloat32(at, true) : view.getFloat64(at, true);
    } else if (bits === 8) {
      // 8-bit PCM is unsigned, so the silence point is 128 rather than 0.
      samples[i] = (data[at] - 128) / 128;
    } else if (bits === 16) {
      samples[i] = view.getInt16(at, true) / 32768;
    } else if (bits === 24) {
      const v = (data[at] | (data[at + 1] << 8) | (data[at + 2] << 16)) << 8;
      samples[i] = v / 2147483648;
    } else {
      return null;
    }
  }
  return { sampleRate, channels, samples };
}
