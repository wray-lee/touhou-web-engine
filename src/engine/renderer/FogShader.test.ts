import { compileHighShaderGpuProgram, localUniformBit, roundPixelsBit, textureBit } from 'pixi.js';
import { describe, expect, it } from 'vitest';
import { FOG_DEPTH_ATTRIBUTE, applyFog, createFogUniforms, fogBit, fogBitGl } from './FogShader';

/**
 * The WGSL half of the backdrop's fog, compiled the way the renderer assembles it.
 *
 * Pixi builds a mesh program by sorting every `@in` and `@out` it finds and handing
 * each one a `@location`, so the vertex's outputs and the fragment's inputs only line
 * up because both lists sort the same way. That is a contract worth pinning: a second
 * bit with a `vA…`-shaped varying, or a bit reordered, could feed the fragment
 * someone else's data without any compiler noticing. The WebGL half is not testable
 * here - `GlProgram` wants a live GL context for its precision probe - so what these
 * tests check about GLSL is the one thing that has to agree by name.
 */
const program = () =>
  compileHighShaderGpuProgram({
    name: 'fog-mesh-test',
    bits: [localUniformBit, textureBit, roundPixelsBit, fogBit],
  });

/** `@location(1) vFogDepth: f32` -> 1, in whichever of the two lists is asked for. */
function locationOf(source: string, name: string): number {
  const match = new RegExp(`@location\\((\\d+)\\)\\s+${name}\\s*:`).exec(source);
  return match ? Number(match[1]) : -1;
}

/** The two compiled stage sources, as plain strings (`GpuProgram` types them optional). */
function sources(): { vertex: string; fragment: string } {
  const gpu = program();
  return { vertex: gpu.vertex?.source ?? '', fragment: gpu.fragment?.source ?? '' };
}

describe('FogShader', () => {
  it('takes the fog depth as a real per-vertex attribute', () => {
    const attribute = program().attributeData[FOG_DEPTH_ATTRIBUTE];
    expect(attribute, 'the ramp needs one depth per corner, not one per batch').toBeDefined();
    expect(attribute.format).toBe('float32');
  });

  it('binds the fog block at group 3 binding 0', () => {
    const gpu = program();
    const fog = gpu.structsAndGroups.groups.find((group) => group.name === 'fogUniforms');
    expect(fog).toMatchObject({ group: 3, binding: 0, accessMode: 'uniform' });
    // Group 3 is this file's own: Pixi keeps 0 for globals, 1 for the local transform
    // and 2 for the texture, and a collision would show up as a wrong-coloured fog.
    expect(
      gpu.structsAndGroups.groups
        .filter((group) => group.group === 3)
        .map((group) => group.name)
        .sort()
        .join(','),
    ).toBe('fogUniforms');
    const struct = gpu.structsAndGroups.structs.find((entry) => entry.name === 'FogUniforms');
    expect(struct?.members).toMatchObject({ uFogColor: 'vec4<f32>', uFogRange: 'vec4<f32>' });
  });

  it('hands the fragment the same varying slot the vertex wrote', () => {
    const { vertex, fragment } = sources();
    const written = locationOf(vertex, 'vFogDepth');
    const read = locationOf(fragment, 'vFogDepth');
    expect(written).toBeGreaterThan(-1);
    expect(read, 'the fragment reads a depth the vertex never wrote').toBe(written);
    // The two stock varyings have to keep matching too, or the texture sample breaks.
    for (const varying of ['vUV', 'vColor']) {
      expect(locationOf(fragment, varying)).toBe(locationOf(vertex, varying));
    }
  });

  it('mixes toward the stage’s fog colour at the ramp’s own depth', () => {
    const uniforms = createFogUniforms();
    // `stage4a` runs `(224,192,192)` over 400..600 world units at one point.
    applyFog(uniforms, { color: 0xe0c0c0, near: 400, far: 600 });
    // Read back through `Float32Array`, so compare at f32 precision, not f64.
    const [r, g, b] = Array.from(uniforms.uniforms.uFogColor);
    expect(r).toBeCloseTo(224 / 255, 6);
    expect(g).toBeCloseTo(192 / 255, 6);
    expect(b).toBeCloseTo(192 / 255, 6);
    expect(uniforms.uniforms.uFogColor[3]).toBe(1);
    // `near`, `far`, enable - and a fourth lane the block needs for alignment, which
    // stays zero because nothing reads it.
    expect(Array.from(uniforms.uniforms.uFogRange)).toEqual([400, 600, 1, 0]);
  });

  it('leaves every fragment alone when there is no ramp to apply', () => {
    const uniforms = createFogUniforms();
    applyFog(uniforms, { color: 0xff0000, near: 400, far: 600 });
    expect(uniforms.uniforms.uFogRange[2]).toBe(1);
    // No fog in force, and the degenerate ramp a `.std` file can ask for with
    // `far <= near`: both have to reach the same no-op rather than a step function.
    applyFog(uniforms, null);
    expect(uniforms.uniforms.uFogRange[2]).toBe(0);
    applyFog(uniforms, { color: 0x00ff00, near: 500, far: 500 });
    expect(uniforms.uniforms.uFogRange[2]).toBe(0);
    applyFog(uniforms, { color: 0x00ff00, near: 600, far: 400 });
    expect(uniforms.uniforms.uFogRange[2]).toBe(0);
  });

  it('names the GLSL uniforms exactly what the WGSL block declares', () => {
    // WebGL has no struct to bind, so Pixi matches a `UniformGroup`'s members against
    // the program's flat uniform names. A rename on one side would silently drop the
    // fog on the other backend, which is precisely the bug this file exists to avoid.
    const wgsl = (fogBit.fragment.header ?? '').match(/\w+:(?:vec4|f32)/g)?.map((line) => line.split(':')[0]);
    const glsl = (fogBitGl.fragment.header ?? '')
      .match(/uniform\s+\w+\s+(\w+);/g)
      ?.map((line) => /uniform\s+\w+\s+(\w+);/.exec(line)?.[1]);
    expect(wgsl).toContain('uFogColor');
    expect([...new Set(wgsl)].sort()).toEqual([...new Set(glsl)].sort());
  });

  it('mixes after the sample, and never touches the alpha', () => {
    // Both halves have to read the varying, and the mix has to be the last thing done
    // to `outColor`: Pixi's bits write into one variable in list order, so a fog that
    // ran before `textureBit` would be mixing a value that never existed.
    const { vertex, fragment } = sources();
    expect(vertex).toContain('vFogDepth = aFogDepth;');
    expect(fragment.indexOf('textureSample')).toBeLessThan(fragment.indexOf('uFogColor.rgb'));
    expect(fragment.indexOf('uFogColor.rgb')).toBeLessThan(fragment.indexOf('finalColor'));
    // Alpha stays out of the mix on the way in and untouched on the way out: fog tints
    // the colour and leaves the sheet's holes transparent, which is the whole reason
    // this is a shader rather than an underlay quad.
    expect(fragment).toMatch(
      /mix\(outColor\.rgb,\s*fogUniforms\.uFogColor\.rgb \* outColor\.a,\s*fogAmount\)/,
    );
    expect(fragment).toMatch(/vec4\(\s*mix\([\s\S]*?\),\s*outColor\.a\s*\)/);
  });
});
