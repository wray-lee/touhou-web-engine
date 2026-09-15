/**
 * Pooled textured-quad layer for backdrops authored in 3D.
 *
 * The retail stage backdrop (`stageN.std`) puts sprites on projected quadrilaterals:
 * a ground tile is a trapezoid on screen, a tree is a billboard. `Sprite` only draws
 * axis-aligned rectangles and `Graphics` derives its UVs from the fill's own
 * bounding box, so neither can map a texture onto four arbitrary corners. A `Mesh`
 * can, and because a batched mesh keeps one tint/alpha for the whole element, this
 * layer merges every quad that shares a page *and* an opacity into a single geometry.
 * A whole stage backdrop then costs a handful of draw calls rather than one
 * renderable per quad.
 *
 * Mapping is affine per triangle: the two halves of a quad share their diagonal, so
 * neighbouring tiles still meet exactly at the corners the game projected.
 *
 * A quad may also carry a per-corner depth, which is how the backdrop's hardware fog
 * gets its ramp: the value rides along as a geometry attribute, the rasteriser
 * interpolates it across the sheet, and the shader mixes colour per pixel. Fogged
 * quads land in their own buckets because they need their own shader, and a mesh with
 * a custom shader is drawn one bucket per call rather than batched.
 */

import { Buffer, BufferUsage, Container, Mesh, MeshGeometry, Texture } from 'pixi.js';
import { FOG_DEPTH_ATTRIBUTE } from './FogShader';
import type { Shader } from 'pixi.js';

/** One projected quad, in the local space of the container this layer draws into. */
export interface QuadRequest {
  /** Page the quad samples from; quads sharing a page merge into one mesh. */
  texture: Texture;
  /** Identity for batching; usually the page asset key. */
  page: string;
  /** Eight numbers: x,y per corner, paired with `uv` in the same order. */
  screen: readonly number[];
  /** Eight numbers: u,v per corner in *page pixels*. */
  uv: readonly number[];
  /** Layer opacity (0..1), as the game authored it - the fog does not live here. */
  alpha: number;
  /** Additive instead of alpha blend; kept in its own bucket so blending stays uniform. */
  additive?: boolean;
  /**
   * Four view-space depths, one per corner, in the same order as `screen`.
   *
   * Present and the quad is fogged: it goes to a bucket wearing the fog shader, which
   * mixes the fragment toward the layer's current fog colour along `near`..`far`.
   * Absent and the quad is drawn as authored, which is how the additive layers stay -
   * hardware fog would have brightened them rather than fading them.
   */
  depth?: readonly number[];
}

/** How a fogged bucket gets its program. Supplied by the renderer that owns the fog. */
export interface QuadLayerOptions {
  /** Built once per sprite page, because the texture bind group lives inside it. */
  fogShader?: (texture: Texture) => Shader;
}

/** Opacity buckets: fine enough to read as a smooth fade, coarse enough to batch. */
const ALPHA_STEPS = 32;
/** Corner order for a quad: the two triangles are (0,1,2) and (0,2,3). */
const CORNER_ORDER = [0, 1, 2, 0, 2, 3];
/** Quads per bucket before it doubles; a stage backdrop fits in two or three buckets. */
const INITIAL_CAPACITY = 48;

interface QuadBucket {
  /** `Shader` rather than the default `TextureShader`, because a fogged bucket brings its own. */
  mesh: Mesh<MeshGeometry, Shader>;
  geometry: MeshGeometry;
  positions: Float32Array;
  uvs: Float32Array;
  indices: Uint32Array;
  /** The `aFogDepth` storage, or null for a bucket that never fogs. */
  depths: Float32Array | null;
  /** Held so `grow` can resize it and `end` can upload it. */
  depthBuffer: Buffer | null;
  /** Quads written this frame. */
  count: number;
  /** Slots that still carry indices from an earlier, longer frame. */
  written: number;
  capacity: number;
  /** Page pixels to 0..1, resolved when the page texture is known. */
  invU: number;
  invV: number;
}

export class QuadLayer {
  private readonly container: Container;
  private readonly options: QuadLayerOptions;
  /** Insertion order is draw order, so buckets appear in the order the stage emits them. */
  private readonly buckets = new Map<string, QuadBucket>();
  private readonly live = new Set<string>();

  constructor(container: Container, options: QuadLayerOptions = {}) {
    this.container = container;
    this.options = options;
  }

  /** Begin a frame: buffers are kept, only the fill counters reset. */
  begin(): void {
    this.live.clear();
    for (const bucket of this.buckets.values()) bucket.count = 0;
  }

  push(quad: QuadRequest): void {
    if (!(quad.alpha > 0)) return;
    const steps = Math.min(ALPHA_STEPS, Math.max(1, Math.round(quad.alpha * ALPHA_STEPS)));
    const fogged = !!quad.depth && !!this.options.fogShader;
    const key = quad.page + ':' + steps + ':' + (quad.additive ? 'a' : 'n') + (fogged ? ':f' : '');
    const bucket = this.ensure(key, quad.texture, steps / ALPHA_STEPS, !!quad.additive, fogged);
    this.live.add(key);
    if (bucket.count >= bucket.capacity) this.grow(bucket);

    const vertex = bucket.count * 4;
    for (let i = 0; i < 8; i += 2) {
      const off = vertex * 2 + (i / 2) * 2;
      bucket.positions[off] = quad.screen[i];
      bucket.positions[off + 1] = quad.screen[i + 1];
      bucket.uvs[off] = quad.uv[i] * bucket.invU;
      bucket.uvs[off + 1] = quad.uv[i + 1] * bucket.invV;
    }
    if (bucket.depths) {
      for (let i = 0; i < 4; i++) {
        bucket.depths[vertex + i] = quad.depth?.[i] ?? 0;
      }
    }
    for (let i = 0; i < 6; i++) {
      bucket.indices[bucket.count * 6 + i] = vertex + CORNER_ORDER[i];
    }
    bucket.count++;
  }

  /** Publish the frame: slots past the last quad collapse to zero area. */
  end(): void {
    for (const [key, bucket] of this.buckets) {
      const visible = bucket.count > 0 && this.live.has(key);
      bucket.mesh.visible = visible;
      if (bucket.count > bucket.written) bucket.written = bucket.count;
      for (let slot = bucket.count; slot < bucket.written; slot++) {
        const base = slot * 4;
        for (let i = 0; i < 6; i++) bucket.indices[slot * 6 + i] = base;
      }
      if (!visible) continue;
      bucket.geometry.attributes.aPosition.buffer.update();
      bucket.geometry.attributes.aUV.buffer.update();
      bucket.depthBuffer?.update();
      bucket.geometry.indexBuffer.update();
    }
  }

  /** Tear every mesh down; used when the stage pack changes. */
  clear(): void {
    for (const bucket of this.buckets.values()) {
      this.container.removeChild(bucket.mesh);
      bucket.geometry.destroy();
    }
    this.buckets.clear();
    this.live.clear();
  }

  get bucketCount(): number {
    return this.live.size;
  }

  get quadCount(): number {
    let total = 0;
    for (const key of this.live) total += this.buckets.get(key)?.count ?? 0;
    return total;
  }

  private ensure(
    key: string,
    texture: Texture,
    alpha: number,
    additive: boolean,
    fogged: boolean,
  ): QuadBucket {
    const existing = this.buckets.get(key);
    if (existing) return existing;
    const geometry = new MeshGeometry({
      positions: new Float32Array(INITIAL_CAPACITY * 8),
      uvs: new Float32Array(INITIAL_CAPACITY * 8),
      indices: this.degenerateIndices(INITIAL_CAPACITY),
    });
    // Merged backdrops blow past the "auto" batching limit, so ask for the batch. A
    // fogged bucket overrides this below: it cannot be batched at all.
    geometry.batchMode = 'batch';
    let depths: Float32Array | null = null;
    let depthBuffer: Buffer | null = null;
    let shader: Shader | undefined;
    if (fogged) {
      const factory = this.options.fogShader;
      if (!factory) throw new Error('QuadLayer: a fogged quad needs a fogShader');
      // One float per corner, in its own buffer: the batched path would have to pack
      // this into a vertex channel, and it cannot interpolate one either.
      depths = new Float32Array(INITIAL_CAPACITY * 4);
      depthBuffer = new Buffer({
        data: depths,
        label: 'quad-layer-fog-depth',
        usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
      });
      geometry.addAttribute(FOG_DEPTH_ATTRIBUTE, {
        buffer: depthBuffer,
        format: 'float32',
        stride: 4,
        offset: 0,
      });
      // A custom shader already takes the mesh out of Pixi's batch; say so out loud.
      geometry.batchMode = 'no-batch';
      shader = factory(texture);
    }
    const mesh = new Mesh<MeshGeometry, Shader>({ geometry, texture, shader, label: 'quad-layer' });
    mesh.alpha = alpha;
    mesh.blendMode = additive ? 'add' : 'normal';
    this.container.addChild(mesh);
    const bucket: QuadBucket = {
      mesh,
      geometry,
      positions: geometry.positions as Float32Array,
      uvs: geometry.uvs as Float32Array,
      indices: geometry.indices as Uint32Array,
      depths,
      depthBuffer,
      count: 0,
      written: 0,
      capacity: INITIAL_CAPACITY,
      invU: 1 / (texture.source.width || 1),
      invV: 1 / (texture.source.height || 1),
    };
    this.buckets.set(key, bucket);
    return bucket;
  }

  private grow(bucket: QuadBucket): void {
    const capacity = bucket.capacity * 2;
    const positions = new Float32Array(capacity * 8);
    positions.set(bucket.positions.subarray(0, bucket.count * 8));
    const uvs = new Float32Array(capacity * 8);
    uvs.set(bucket.uvs.subarray(0, bucket.count * 8));
    const indices = this.degenerateIndices(capacity);
    indices.set(bucket.indices.subarray(0, bucket.count * 6));
    bucket.geometry.positions = positions;
    bucket.geometry.uvs = uvs;
    bucket.geometry.indices = indices;
    bucket.positions = positions;
    bucket.uvs = uvs;
    bucket.indices = indices;
    if (bucket.depths && bucket.depthBuffer) {
      const depths = new Float32Array(capacity * 4);
      depths.set(bucket.depths.subarray(0, bucket.count * 4));
      // Assigning `data` re-keys the buffer's GPU copy, which is what tells the
      // cached bind groups to pick the new one up.
      bucket.depthBuffer.data = depths;
      bucket.depths = depths;
    }
    bucket.capacity = capacity;
    bucket.written = capacity;
  }

  /** Every slot starts as a zero-area triangle so unused room draws nothing. */
  private degenerateIndices(capacity: number): Uint32Array {
    const indices = new Uint32Array(capacity * 6);
    for (let slot = 0; slot < capacity; slot++) {
      for (let i = 0; i < 6; i++) indices[slot * 6 + i] = slot * 4;
    }
    return indices;
  }
}
