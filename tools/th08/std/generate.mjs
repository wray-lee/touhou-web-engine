/**
 * Translate the retail `stage*.std` background files into TypeScript data.
 *
 * A `.std` is not a mesh: it is three tables -- object templates holding billboard
 * quads, a list of placements for those templates along the camera corridor, and a
 * fixed-stride instruction stream that drives the camera. All three are lifted here
 * verbatim so the runtime replays the original camera move instead of approximating
 * it, which is what makes the parallax read as the real stage rather than a tiled
 * backdrop.
 *
 * Layout comes from `Background.cpp:18-86` of the reference decompile:
 *   RawStageHeader        0x490  nbObjects, nbFaces, facesOffset, scriptOffset, names
 *                                 stageName at +0x10, songNames at +0x90, songPaths at
 *                                 +0x290, each four `char[128]` slots for the songs
 *   object pointer table   0x490  nbObjects file offsets
 *   RawStageObject          0x38  id, zLevel, flags, position, size, then quads
 *   RawStageQuadBasic       0x1c  type, byteSize, anmScript, vmIdx, position, size
 *   RawStageQuadType1       0x24  ... position1, position2, width
 *   RawStageObjectInstance  0x10  id, unk2, position   (terminated by id < 0)
 *   RawStageInstr           0x14  frame, opcode, size, args[3]
 *
 * Usage: node tools/th08/std/generate.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const RAW = path.join(ROOT, 'public/assets/th08/raw');
const MANIFEST = path.join(ROOT, 'public/assets/th08/manifest.json');
const OUT = path.join(ROOT, 'src/games/th08/data/th08-std.ts');

const HEADER = 0x490;
const QUAD_BASIC = 0x1c;
const QUAD_TYPE1 = 0x24;
const INSTANCE = 0x10;
const INSTRUCTION = 0x14;

/** `g_StageStdFiles` + `g_StageStdFilesSpell`, minus the `.std` suffix. */
const STAGE_FILES = [
  'stage1', 'stage2', 'stage3', 'stage4a', 'stage4b', 'stage5', 'stage6', 'stage7', 'stage8',
  'stage1_s', 'stage2_s', 'stage3_s', 'stage4a_s', 'stage4b_s', 'stage5_s', 'stage6_s',
  'stage7_s', 'stage8_s',
];

/** Round to the precision the f32 data actually carries, to keep the file readable. */
const f = (value) => Math.round(value * 1000) / 1000;

/** One `char[128]` header string, trimmed; retail pads an unused slot with a space. */
function headerString(dv, offset) {
  let text = '';
  for (let i = 0; i < 128; i++) {
    const code = dv.getUint8(offset + i);
    if (!code) break;
    text += String.fromCharCode(code);
  }
  return text.trim();
}

function parseStd(file) {
  const buf = fs.readFileSync(path.join(RAW, file + '.std'));
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const nbObjects = dv.getInt16(0, true);
  const facesOffset = dv.getInt32(4, true);
  const scriptOffset = dv.getInt32(8, true);
  // The four songs this stage registers as music slots 0 to 2, in header order.
  // `GameManager.cpp:1088-1092` reads the very same three offsets off the loaded
  // archive when it calls `LoadMusic`, and `:417` plays slot 0 as the stage starts.
  const songPaths = [0x290, 0x310, 0x390, 0x410].map((offset) => headerString(dv, offset));

  const objects = [];
  for (let i = 0; i < nbObjects; i++) {
    const off = dv.getInt32(HEADER + i * 4, true);
    const id = dv.getInt16(off, true);
    const zLevel = dv.getInt8(off + 2);
    const read3 = (base) => [f(dv.getFloat32(base, true)), f(dv.getFloat32(base + 4, true)), f(dv.getFloat32(base + 8, true))];
    const position = read3(off + 4);
    const size = read3(off + 16);
    const quads = [];
    let cursor = off + QUAD_BASIC;
    while (cursor + QUAD_TYPE1 <= buf.byteLength) {
      const type = dv.getInt16(cursor, true);
      if (type < 0) break;
      const byteSize = dv.getInt16(cursor + 2, true);
      if (byteSize <= 0) break;
      const quad = {
        type,
        anmScript: dv.getInt16(cursor + 4, true),
        position: read3(cursor + 8),
      };
      if (type === 0) {
        quad.size = [f(dv.getFloat32(cursor + 20, true)), f(dv.getFloat32(cursor + 24, true))];
      } else {
        quad.position2 = read3(cursor + 20);
        quad.width = f(dv.getFloat32(cursor + 32, true));
      }
      quads.push(quad);
      cursor += byteSize;
    }
    objects.push({ id, zLevel, position, size, quads });
  }

  const instances = [];
  let cursor = facesOffset;
  while (cursor + INSTANCE <= buf.byteLength) {
    const id = dv.getInt16(cursor, true);
    if (id < 0) break;
    instances.push({
      objectId: id,
      position: [f(dv.getFloat32(cursor + 4, true)), f(dv.getFloat32(cursor + 8, true)), f(dv.getFloat32(cursor + 12, true))],
    });
    cursor += INSTANCE;
  }

  const script = [];
  cursor = scriptOffset;
  while (cursor + INSTRUCTION <= buf.byteLength) {
    const frame = dv.getInt32(cursor, true);
    const opcode = dv.getInt16(cursor + 4, true);
    const args = [dv.getInt32(cursor + 8, true), dv.getInt32(cursor + 12, true), dv.getInt32(cursor + 16, true)];
    script.push({ frame, opcode, args });
    if (frame < 0) break;
    cursor += INSTRUCTION;
  }

  return { objects, instances, script, songPaths };
}

/**
 * The ANM pack each `.std` selects its sprites from (`g_StageAnmFiles`).
 * Stage 4b reuses `stg4abg`, matching the retail table.
 */
const ANM_BY_STAGE = {
  stage1: 'stg1bg', stage2: 'stg2bg', stage3: 'stg3bg', stage4a: 'stg4abg', stage4b: 'stg4abg',
  stage5: 'stg5bg', stage6: 'stg6bg', stage7: 'stg7bg', stage8: 'stg8bg',
};

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

/** Per-ANM-pack sprite rects and script bytecode, shared by the normal and spell files. */
function bgPack(anmName) {
  const anm = manifest.anm[anmName];
  if (!anm) return null;
/** Manifest stores bare page names; the runtime addresses them under the extract dir. */
const PAGE_URL = '/assets/th08/anm/';

  const maxId = Math.max(...anm.sprites.map((s) => s.id), 0);
  const rects = new Array(maxId + 1).fill(null);
  for (const s of anm.sprites) {
    rects[s.id] = {
      page: PAGE_URL + (anm.textures[s.tex]?.file ?? anm.textures[0].file),
      x: Math.round(s.x), y: Math.round(s.y), w: Math.round(s.w), h: Math.round(s.h),
    };
  }
  const maxScript = Math.max(...anm.scripts.map((s) => s.id), 0);
  const scripts = new Array(maxScript + 1).fill(null);
  for (const s of anm.scripts) scripts[s.id] = s.base64;
  return { rects, scripts };
}

const packs = [];
const seenPacks = new Map();
function packIndex(anmName) {
  if (!seenPacks.has(anmName)) {
    seenPacks.set(anmName, packs.length);
    packs.push(bgPack(anmName));
  }
  return seenPacks.get(anmName);
}

const stages = [];
for (const name of STAGE_FILES) {
  if (!fs.existsSync(path.join(RAW, name + '.std'))) continue;
  const parsed = parseStd(name);
  const base = name.replace(/_s$/, '');
  const anmName = ANM_BY_STAGE[base];
  parsed.pack = anmName ? packIndex(anmName) : -1;
  stages.push({ name, ...parsed });
}

const json = (value) => JSON.stringify(value);
const lines = [];
lines.push('/**');
lines.push(' * Generated from public/assets/th08/raw/stage*.std by tools/th08/std/generate.mjs.');
lines.push(' * Do not edit by hand.');
lines.push(' *');
lines.push(' * The retail stage backdrop, lifted whole: object templates of billboard quads,');
lines.push(' * their placements along the camera corridor, and the camera instruction stream that');
lines.push(' * `Background::OnUpdate` walks one entry per frame. Coordinates are the original');
lines.push(' * world units, so the runtime only has to reproduce the projection to match.');
lines.push(' */');
lines.push('');
lines.push('/** One atlas cell of a stage backdrop, with the page that holds it. */');
lines.push('export interface StdSpriteRect {');
lines.push('  readonly page: string;');
lines.push('  readonly x: number;');
lines.push('  readonly y: number;');
lines.push('  readonly w: number;');
lines.push('  readonly h: number;');
lines.push('}');
lines.push('');
lines.push('/** Sprite geometry plus the ANM bytecode that animates a quad. */');
lines.push('export interface StdAnmPack {');
lines.push('  readonly rects: readonly (StdSpriteRect | null)[];');
lines.push('  /** ANM script per quad `anmScript`, as base64 little-endian words. */');
lines.push('  readonly scripts: readonly (string | null)[];');
lines.push('}');
lines.push('');
lines.push('export const TH08_STD_PACKS: readonly (StdAnmPack | null)[] = [');
for (const pack of packs) {
  if (!pack) {
    lines.push('  null,');
    continue;
  }
  lines.push('  {');
  lines.push('    rects: [' + pack.rects.map((r) => (r ? json(r) : 'null')).join(', ') + '],');
  lines.push('    scripts: [' + pack.scripts.map((s) => (s ? JSON.stringify(s) : 'null')).join(', ') + '],');
  lines.push('  },');
}
lines.push('];');
lines.push('');
lines.push('/** A billboard quad inside an object template. */');
lines.push('export interface StdQuad {');
lines.push('  readonly type: number;');
lines.push('  readonly anmScript: number;');
lines.push('  readonly position: readonly [number, number, number];');
lines.push('  /** Type 0 only: the world size the quad is stretched to. */');
lines.push('  readonly size?: readonly [number, number];');
lines.push('  /** Type 1 only: the far end of the ribbon, and its width. */');
lines.push('  readonly position2?: readonly [number, number, number];');
lines.push('  readonly width?: number;');
lines.push('}');
lines.push('');
lines.push('/** An object template: quads that share a position and a draw layer. */');
lines.push('export interface StdObject {');
lines.push('  readonly id: number;');
lines.push('  /** Draw pass, 0..3. Passes 2 and 3 render behind 0 and 1. */');
lines.push('  readonly zLevel: number;');
lines.push('  readonly position: readonly [number, number, number];');
lines.push('  readonly size: readonly [number, number, number];');
lines.push('  readonly quads: readonly StdQuad[];');
lines.push('}');
lines.push('');
lines.push('/** One placement of an object template in the corridor. */');
lines.push('export interface StdInstance {');
lines.push('  readonly objectId: number;');
lines.push('  readonly position: readonly [number, number, number];');
lines.push('}');
lines.push('');
lines.push('/** One camera instruction; `args` are raw and read as int or float per opcode. */');
lines.push('export interface StdInstr {');
lines.push('  readonly frame: number;');
lines.push('  readonly opcode: number;');
lines.push('  readonly args: readonly [number, number, number];');
lines.push('}');
lines.push('');
lines.push('/** Everything one `.std` carries. */');
lines.push('export interface StdStage {');
lines.push('  readonly objects: readonly StdObject[];');
lines.push('  readonly instances: readonly StdInstance[];');
lines.push('  readonly script: readonly StdInstr[];');
lines.push('  /**');
lines.push('   * The header\'s four `songPaths` slots, `+0x290` to `+0x410`. Slot 0 is the');
lines.push('   * stage theme, and an unused slot is a single space, which `trim` folds to');
lines.push('   * `\'\'`. See `StageSongs.ts` for what the retail loader does with them.');
lines.push('   */');
lines.push('  readonly songPaths: readonly string[];');
lines.push('  /** Index into `TH08_STD_PACKS`, or -1 when the backdrop ANM is missing. */');
lines.push('  readonly pack: number;');
lines.push('}');
lines.push('');
lines.push('/** Keyed by the retail file stem, so `stage1_s` is the spell-card variant. */');
lines.push('export const TH08_STD: Readonly<Record<string, StdStage>> = {');
for (const stage of stages) {
  lines.push('  ' + JSON.stringify(stage.name) + ': {');
  lines.push('    objects: ' + json(stage.objects) + ',');
  lines.push('    instances: ' + json(stage.instances) + ',');
  lines.push('    script: ' + json(stage.script) + ',');
  lines.push('    songPaths: ' + json(stage.songPaths) + ',');
  lines.push('    pack: ' + stage.pack + ',');
  lines.push('  },');
}
lines.push('};');
lines.push('');

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log(
  'wrote', path.relative(ROOT, OUT),
  '| stages=' + stages.length,
  'packs=' + packs.length,
  stages.map((s) => `${s.name}:${s.objects.length}o/${s.instances.length}i/${s.script.length}s`).join(' '),
);
