/**
 * Hardware fog for the backdrop's mesh layer, as a self-supplied shader bit.
 *
 * The original renders its backdrop through fixed-function Direct3D 8 and sets
 * `D3DRS_FOGSTART` / `D3DRS_FOGEND` / `D3DRS_FOGCOLOR` (`Background.cpp:833-839`)
 * while leaving `D3DRS_FOGVERTEXMODE` and `D3DRS_FOGPIXELMODE` at their defaults.
 * That combination means three things, and each is a place where a cheap
 * approximation visibly disagrees:
 *
 * 1. the ramp is measured along **camera-space depth**, not distance to the eye;
 * 2. it is evaluated **per pixel**, from a depth the rasteriser interpolates
 *    across the face - so one big ground sheet carries the whole gradient;
 * 3. fog mixes the shaded **colour toward the fog colour** and leaves the
 *    fragment's alpha alone. It is not a dissolve into the background.
 *
 * Point 3 is the expensive one to fake from outside a shader. Laying a flat
 * fog-coloured quad under each slice was tried and reverted: the underlay has no
 * way to know the texel's alpha, so it paints fog into the transparent holes of
 * every sheet and the backdrop comes back as grey rectangles with hard quad
 * edges. Re-drawing the *same* geometry tinted was considered and dropped for a
 * subtler reason - a tint multiplies the texel, so the fog colour would arrive
 * shaded by the scenery it is supposed to replace. Point at the fragment instead
 * and the mix is exact, which is what this bit does - together with 1 and 2, by
 * taking a per-vertex depth and letting the rasteriser interpolate it.
 *
 * Pixi's stock mesh shader has neither a fog term nor a vertex-colour channel, so
 * the bit is supplied here in both languages: WGSL for the WebGPU renderer and
 * GLSL for the WebGL one. `compileHighShader*Program` assembles them around the
 * same template the built-in mesh shader uses, so the texture sample, the local
 * transform and the pixel rounding still come from Pixi's own bits. The fog is
 * applied last, which is why `createFogMeshShader` appends this bit rather than
 * leading with it: the bits write into one `outColor` in list order.
 */

import {
  Shader,
  UniformGroup,
  compileHighShaderGlProgram,
  compileHighShaderGpuProgram,
  localUniformBit,
  localUniformBitGl,
  roundPixelsBit,
  roundPixelsBitGl,
  textureBit,
  textureBitGl,
} from 'pixi.js';
import type { Texture } from 'pixi.js';

/** The geometry attribute this bit reads: view-space depth, one per vertex. */
export const FOG_DEPTH_ATTRIBUTE = 'aFogDepth';

/** One frame's `D3DRS_FOGCOLOR` plus the linear ramp, in backdrop world units. */
export interface FogRamp {
  /** `D3DRS_FOGCOLOR` as 0xRRGGBB. */
  color: number;
  /** `D3DRS_FOGSTART`. */
  near: number;
  /** `D3DRS_FOGEND`. */
  far: number;
}

/**
 * Both uniforms are `vec4` so the block is a multiple of its own alignment: a
 * `vec4` followed by three `f32`s would need trailing padding that WGSL's
 * uniform layout does not insert for us. `uFogRange.z` is the enable flag, which
 * lets a frame with no fog in force leave the fragment untouched.
 */
const FOG_UNIFORMS_WGSL = /* wgsl */ `
            struct FogUniforms {
                uFogColor:vec4<f32>,
                uFogRange:vec4<f32>,
            }

            @group(3) @binding(0) var<uniform> fogUniforms : FogUniforms;
        `;

const FOG_MIX_WGSL = /* wgsl */ `
            let fogSpan = max(fogUniforms.uFogRange.y - fogUniforms.uFogRange.x, 0.0001);
            let fogAmount = clamp((vFogDepth - fogUniforms.uFogRange.x) / fogSpan, 0.0, 1.0)
                * fogUniforms.uFogRange.z;
            // Premultiplied space, so the fog term has to carry the fragment alpha
            // the same way the texel already does: a hole in a sheet must not fog
            // brighter than the scenery around it.
            outColor = vec4(
                mix(outColor.rgb, fogUniforms.uFogColor.rgb * outColor.a, fogAmount),
                outColor.a
            );
        `;

const FOG_MIX_GLSL = /* glsl */ `
            float fogSpan = max(uFogRange.y - uFogRange.x, 0.0001);
            float fogAmount = clamp((vFogDepth - uFogRange.x) / fogSpan, 0.0, 1.0) * uFogRange.z;
            outColor = vec4(mix(outColor.rgb, uFogColor.rgb * outColor.a, fogAmount), outColor.a);
        `;

/** WGSL half of the fog bit, for the WebGPU renderer. */
export const fogBit = {
  name: 'fog-bit',
  vertex: {
    header: /* wgsl */ `
            ${FOG_UNIFORMS_WGSL}
            @in ${FOG_DEPTH_ATTRIBUTE}: f32;
            @out vFogDepth: f32;
        `,
    main: /* wgsl */ `
            vFogDepth = ${FOG_DEPTH_ATTRIBUTE};
        `,
  },
  fragment: {
    header: /* wgsl */ `
            ${FOG_UNIFORMS_WGSL}
            @in vFogDepth: f32;
        `,
    main: /* wgsl */ FOG_MIX_WGSL,
  },
};

/** GLSL half of the fog bit, for the WebGL renderer. */
export const fogBitGl = {
  name: 'fog-bit',
  vertex: {
    header: /* glsl */ `
            in float ${FOG_DEPTH_ATTRIBUTE};
            out float vFogDepth;
        `,
    main: /* glsl */ `
            vFogDepth = ${FOG_DEPTH_ATTRIBUTE};
        `,
  },
  fragment: {
    header: /* glsl */ `
            in float vFogDepth;
            uniform vec4 uFogColor;
            uniform vec4 uFogRange;
        `,
    main: /* glsl */ FOG_MIX_GLSL,
  },
};

/** The two `vec4`s, typed the way `UniformGroup` wants its structures. */
interface FogUniformStructures {
  // The index signature is what `UniformGroup` constrains its parameter to; the
  // named members below are what `uniforms` then reads as.
  [key: string]: { value: Float32Array; type: 'vec4<f32>' };
  uFogColor: { value: Float32Array; type: 'vec4<f32>' };
  uFogRange: { value: Float32Array; type: 'vec4<f32>' };
}

/** So callers read `uniforms.uniforms.uFogColor` as a typed array, not an `any`. */
export type FogUniforms = UniformGroup<FogUniformStructures>;

/**
 * The fog uniforms, shared by reference across every fogged bucket so one
 * `applyFog` per frame reaches the whole backdrop.
 *
 * Left non-static: the group holds two `vec4`s, and letting Pixi sync it on
 * demand keeps this on the same code path as its own mesh uniforms.
 */
export function createFogUniforms(): FogUniforms {
  return new UniformGroup<FogUniformStructures>({
    uFogColor: { value: new Float32Array([0, 0, 0, 1]), type: 'vec4<f32>' },
    uFogRange: { value: new Float32Array([0, 0, 0, 0]), type: 'vec4<f32>' },
  });
}

/** Publish this frame's fog. Pass `null` to leave the fragments as authored. */
export function applyFog(uniforms: FogUniforms, ramp: FogRamp | null): void {
  const range = uniforms.uniforms.uFogRange;
  // A ramp that never opens - `far <= near`, which some `.std` files really do
  // ask for - has no linear answer: D3D would have stepped across it inside one
  // float. Leaving the scenery unfogged is the honest reading of that.
  if (!ramp || !(ramp.far > ramp.near)) {
    range[0] = 0;
    range[1] = 0;
    range[2] = 0;
    uniforms.update();
    return;
  }
  const color = uniforms.uniforms.uFogColor;
  color[0] = ((ramp.color >> 16) & 0xff) / 255;
  color[1] = ((ramp.color >> 8) & 0xff) / 255;
  color[2] = (ramp.color & 0xff) / 255;
  color[3] = 1;
  range[0] = ramp.near;
  range[1] = ramp.far;
  range[2] = 1;
  uniforms.update();
}

/**
 * The fogged mesh shader, built once per sprite page.
 *
 * One shader per bucket rather than one shared shader, because the texture bind
 * group travels inside the shader and each bucket samples a different page. With
 * a custom shader attached Pixi stops batching the mesh - `Mesh.batched` is false
 * the moment `_shader` is set - and routes it through its native mesh pipeline,
 * which is what lets `aFogDepth` be a real geometry attribute.
 */
export function createFogMeshShader(texture: Texture, fog: FogUniforms): Shader {
  return new Shader({
    gpuProgram: compileHighShaderGpuProgram({
      name: 'fog-mesh-gpu',
      bits: [localUniformBit, textureBit, roundPixelsBit, fogBit],
    }),
    glProgram: compileHighShaderGlProgram({
      name: 'fog-mesh-gl',
      bits: [localUniformBitGl, textureBitGl, roundPixelsBitGl, fogBitGl],
    }),
    // The keys are the WGSL binding names, which is how `Shader` sorts each
    // resource into its group. `textureUniforms` is the page's pixel-to-0..1
    // matrix, normally applied by the mesh adaptor that a custom shader replaces.
    resources: {
      fogUniforms: fog,
      uTexture: texture.source,
      uSampler: texture.source.style,
      textureUniforms: {
        uTextureMatrix: { type: 'mat3x3<f32>', value: texture.textureMatrix.mapCoord },
      },
    },
  });
}
