import { describe, expect, it } from 'vitest';
import { parseReplay } from './ReplayFile';
import fs from 'fs';
import path from 'path';

const RAW_DIR = path.join(process.cwd(), 'public', 'assets', 'th08', 'raw');
const hasAssets = fs.existsSync(path.join(RAW_DIR, 'demorpy0.rpy'));

describe.skipIf(!hasAssets)('ReplayFile parser (real th08.dat)', () => {
  const EXPECTED = [
    { file: 'demorpy0', shotType: 0, difficulty: 3, stageIdx: 5 },
    { file: 'demorpy1', shotType: 1, difficulty: 3, stageIdx: 3 },
    { file: 'demorpy2', shotType: 3, difficulty: 3, stageIdx: 2 },
    { file: 'demorpy3', shotType: 2, difficulty: 3, stageIdx: 1 },
  ];

  for (const exp of EXPECTED) {
    it('decodes ' + exp.file + '.rpy with correct metadata', () => {
      const buf = fs.readFileSync(path.join(RAW_DIR, exp.file + '.rpy'));
      const replay = parseReplay(new Uint8Array(buf));
      expect(replay.shotType).toBe(exp.shotType);
      expect(replay.difficulty).toBe(exp.difficulty);

      const stage = replay.stages[exp.stageIdx];
      expect(stage).toBeTruthy();
      if (stage) {
        expect(stage.header.lives).toBeLessThanOrEqual(8);
        expect(stage.header.bombs).toBeLessThanOrEqual(8);
        expect(stage.header.power).toBeLessThanOrEqual(128);
        expect(stage.inputs.length).toBeGreaterThan(50);
        expect(stage.header.rngSeed).toBeGreaterThan(0);
      }
    });
  }

  it('demorpy0 stage 5 has a valid score and input stream', () => {
    const buf = fs.readFileSync(path.join(RAW_DIR, 'demorpy0.rpy'));
    const replay = parseReplay(new Uint8Array(buf));
    const s = replay.stages[5];
    expect(s).toBeTruthy();
    if (s) {
      expect(s.header.score).toBeGreaterThan(0);
      expect(s.inputs.length).toBeGreaterThan(100);
    }
  });
});
