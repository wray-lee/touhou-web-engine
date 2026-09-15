/**
 * The settlement screen's copy of the original's layout constants.
 *
 * Every number here is quoted from `ResultScreen.cpp`, which is the point of the
 * test: the screen should read like the original, and a edit that "tidies" a
 * constant into a rounder one silently changes what the player sees.
 */
import { describe, expect, it } from 'vitest';
import { anmScriptFromBase64 } from '../../../engine/anm/AnmVm';
import {
  RESULT_BACKDROP,
  RESULT_SCRIPT,
  TH08_RESULT_CELLS,
  TH08_RESULT_PAGES,
  TH08_RESULT_SCRIPTS,
} from '../data/th08-result-anm';
import {
  RESULT_INTERRUPT,
  RESULT_STATS_LAYOUT,
  RESULT_STATS_VM,
  RESULT_TEXT_COLOR,
  RESULT_TIMING,
  completionPercent,
  pad9,
  padPercent,
  resultScriptWords,
  resultStatRows,
  slowdownPercent,
  type ResultStats,
} from './RetailResultScreen';

function stats(over: Partial<ResultStats> = {}): ResultStats {
  return {
    score: 123456,
    retries: 2,
    difficulty: 'normal',
    playFrames: 195559,
    deaths: 1,
    bombsUsed: 3,
    cardsCaptured: 5,
    lagFraction: 0,
    ...over,
  };
}

describe('retail settlement pack', () => {
  it('lifts the whole pack the original hands to the VM', () => {
    // `AddedCallback:2840` loops 72 VMs, so a short lift would leave the panel mute.
    expect(TH08_RESULT_SCRIPTS).toHaveLength(72);
    expect(TH08_RESULT_SCRIPTS.filter(Boolean)).toHaveLength(72);
    expect(TH08_RESULT_CELLS).toHaveLength(41);
    expect(TH08_RESULT_PAGES).toHaveLength(4);
    expect(RESULT_BACKDROP).toBe('/assets/th08/raw/result.jpg');
  });

  it('keeps the stats anchor on the VM the original uses', () => {
    expect(RESULT_STATS_VM).toBe(71);
    expect(RESULT_SCRIPT.PLAYER_RESULTS).toBe(71);
    expect(RESULT_SCRIPT.LISTING).toBe(40);
    expect(TH08_RESULT_SCRIPTS[71]).not.toBeNull();
  });

  it('decodes every script without a trap', () => {
    for (let index = 0; index < TH08_RESULT_SCRIPTS.length; index++) {
      expect(resultScriptWords(index), `script ${index}`).not.toBeNull();
      expect(() => anmScriptFromBase64(TH08_RESULT_SCRIPTS[index]!.base64)).not.toThrow();
    }
  });

  it('names the interrupt codes the scripts branch on', () => {
    expect(RESULT_INTERRUPT.PLAYER_RESULTS_SHOW).toBe(18);
    expect(RESULT_INTERRUPT.EXITING).toBe(2);
    expect(RESULT_INTERRUPT.SPRITE_SELECTED).toBe(20);
    expect(RESULT_INTERRUPT.CHARACTER_APPEAR).toBe(25);
  });
});

describe('settlement layout', () => {
  it('carries the offsets DrawFinalStats adds to VM 71', () => {
    expect(RESULT_STATS_LAYOUT).toMatchObject({ textOffsetX: 210, textOffsetY: 32, rowPitch: 22 });
    // `AsciiManager.cpp:275`, and the settlement screen never overrides it.
    expect(RESULT_STATS_LAYOUT.spaceWidth).toBe(13);
    expect(RESULT_TIMING.confirmAfterFrames).toBe(90);
    expect(RESULT_TIMING.showHoldFrames).toBe(30);
  });

  it('uses the colours the original sets while drawing', () => {
    expect(RESULT_TEXT_COLOR.row).toBe('#ffffc0'); // 0xffffc0c0
    expect(RESULT_TEXT_COLOR.header).toBe('#e0e0ef'); // 0xffe0e0ef
    expect(RESULT_TEXT_COLOR.highlight).toBe('#fff0f0'); // 0xfff0f0ff
  });
});

describe('stat rows', () => {
  it('prints the eight rows in on-screen order', () => {
    expect(resultStatRows(stats())).toEqual([
      '   1234562', // "%9d" plus the continue column
      '    Normal',
      '    99.00%',
      '        2',
      '        1',
      '        3',
      '        5',
      '    100.00%',
    ]);
  });

  it('caps completion below a hundred percent', () => {
    // `if (completion >= 1.0f) completion = 0.99f;`
    expect(completionPercent(stats({ playFrames: 400000 }))).toBe(99);
    expect(completionPercent(stats({ playFrames: 97779 }))).toBeCloseTo(50, 3);
  });

  it('spells a full clear the way the original does', () => {
    // The 100 branch is `"      100%%"`, six spaces and no decimals.
    expect(resultStatRows(stats({ fullCompletion: true }))[2]).toBe('      100%');
  });

  it('maps the slow meter through the original bias', () => {
    // `((lag - 0.5) * 2)` means a run that only grazed the budget still reads 100.
    expect(slowdownPercent(0)).toBe(100);
    expect(slowdownPercent(0.5)).toBe(100);
    expect(slowdownPercent(0.75)).toBe(50);
    expect(slowdownPercent(1)).toBe(0);
    expect(resultStatRows(stats({ lagFraction: 0.75 }))[7]).toBe('    50.00%');
  });

  it('clamps the continue column at nine but not the continue row', () => {
    const rows = resultStatRows(stats({ retries: 12 }));
    expect(rows[0]).toBe('   1234569');
    expect(rows[3]).toBe('       12');
  });

  it('keeps right alignment out of the helpers', () => {
    expect(pad9(0)).toBe('        0');
    expect(pad9(1234567890)).toBe('234567890');
    expect(padPercent(7)).toBe('    7.00%');
  });
});
