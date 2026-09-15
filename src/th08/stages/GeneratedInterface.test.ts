/**
 * Guard for the hole the compiler cannot see from a declaration alone.
 *
 * `src/th08/stages/<route>/scripts.ts` is emitted by `npm run ecl:th08`, and the
 * translator names the runtime methods through `ECL_OPCODES`. `tsc --noEmit`
 * already covers those files, but a member can exist on `EnemyCtx` and still be
 * missing from the `EnemySlot` the sim actually instantiates; renaming or
 * dropping an `EnemyCtx` member would otherwise surface as
 * `e.linkChildStandard is not a function` thrown from inside a boss fight,
 * hundreds of frames in, where nothing points back at the rename.
 *
 * This test closes that gap statically: every `e.method(...)` the scripts call has
 * to exist on `EnemySlot`, and every `e.field` they read or write has to be a real
 * member. It reads the committed source rather than importing it so a syntax error
 * in one generated file cannot hide the drift it is meant to catch.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EnemySlot } from '../sim/EnemySlot';
import { createGameState } from '../sim/GameState';

const STAGES_DIR = __dirname;

/** One throwaway slot: the instance fields are the register bank the scripts use. */
function probeSlot(): EnemySlot {
  const gs = createGameState('hard', 1);
  const slot = new EnemySlot(gs);
  slot.reset(0, 0, 0, gs);
  return slot;
}

/**
 * Every translated script file, as absolute paths. A route directory is discovered
 * rather than listed, so the next stage the emitter learns is checked for free.
 */
function generatedFiles(): string[] {
  return readdirSync(STAGES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(STAGES_DIR, entry.name, 'scripts.ts'))
    .filter((file) => existsSync(file))
    .sort();
}

function label(file: string): string {
  return file.slice(STAGES_DIR.length + 1).replace(/\\/g, '/');
}

describe('generated ECL scripts match the sim interface', () => {
  const slot = probeSlot();
  const files = generatedFiles();

  it('covers every route the translator emits', () => {
    expect(files.map(label)).toEqual([
      'extra/scripts.ts',
      'stage1/scripts.ts',
      'stage2/scripts.ts',
      'stage3/scripts.ts',
      'stage4a/scripts.ts',
      'stage4b/scripts.ts',
      'stage5/scripts.ts',
      'stage6a/scripts.ts',
      'stage6b/scripts.ts',
    ]);
  });

  it('actually finds the calls it is checking, so the two cases below cannot pass vacuously', () => {
    const names = new Set<string>();
    for (const file of files) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/\be\.([A-Za-z_$][\w$]*)\s*\(/g)) names.add(match[1]);
    }
    // Ops 90..92 alone contribute three; the shot, movement and spell families add
    // the rest. Anything much smaller means the regex stopped matching.
    expect(names.size).toBeGreaterThan(60);
    expect(names.has('linkChildStandard')).toBe(true);
  });

  it.each(files.map(label))('%s calls only methods EnemySlot implements', (name) => {
    const source = readFileSync(join(STAGES_DIR, ...name.split('/')), 'utf8');
    const missing = new Set<string>();
    for (const match of source.matchAll(/\be\.([A-Za-z_$][\w$]*)\s*\(/g)) {
      const method = match[1];
      if (typeof (slot as unknown as Record<string, unknown>)[method] !== 'function') {
        missing.add(method);
      }
    }
    expect([...missing].sort(), `${name} calls members EnemySlot does not have`).toEqual([]);
  });

  it.each(files.map(label))('%s touches only real register fields', (name) => {
    const source = readFileSync(join(STAGES_DIR, ...name.split('/')), 'utf8');
    const methods = new Set<string>();
    for (const match of source.matchAll(/\be\.([A-Za-z_$][\w$]*)\s*\(/g)) methods.add(match[1]);
    const missing = new Set<string>();
    for (const match of source.matchAll(/\be\.([A-Za-z_$][\w$]*)\s*(?:=|[-+*/]=|\.|\?\?|\|\||&&|[,);\]])/g)) {
      const field = match[1];
      if (methods.has(field)) continue;
      if (!(field in (slot as unknown as Record<string, unknown>))) missing.add(field);
    }
    expect([...missing].sort(), `${name} reads or writes unknown fields`).toEqual([]);
  });
});
