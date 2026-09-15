import { describe, it, expect } from 'vitest';
import { remapMessageId, messagePackFor, stageIndexFor, GUI_MESSAGE_PATHS } from './RetailMessages';

/** `Gui.cpp:222-320` reads one field, so every case here only moves that one. */
const facts = (over: Partial<{ shotType: number; retries: number; clockHour: number }> = {}) => ({
  shotType: 0,
  retries: 0,
  clockHour: 0,
  ...over,
});

describe('message id rewrites', () => {
  it('keeps a plain request plain on routes with no arm', () => {
    for (const route of ['stage1', 'stage2', 'stage3', 'stage4a', 'stage4b', 'stage6a'] as const) {
      expect(remapMessageId(4, route, facts())).toEqual({ id: 4, routeChoice: 0 });
      expect(remapMessageId(10, route, facts())).toEqual({ id: 10, routeChoice: 0 });
    }
  });

  it('sends the stage-5 request 10 to the short script after a continue', () => {
    // `Gui.cpp:257-261`: retries win before any save-data or shot-type test.
    expect(remapMessageId(10, 'stage5', facts({ retries: 1, shotType: 7 }))).toEqual({
      id: 1,
      routeChoice: 0,
    });
  });

  it('sends a solo ship to the long script', () => {
    // `Gui.cpp:268-272`: `shotType > SHOT_YOUMU_YUYUKO` is the one test that needs
    // no save data, so it is the one this build can honour.
    expect(remapMessageId(10, 'stage5', facts({ shotType: 4 }))).toEqual({
      id: 3,
      routeChoice: 1,
    });
  });

  it('falls back to the short script when no save data is in reach', () => {
    // `Gui.cpp:281-285`: the two `IsStageCleared*` arms would pick 3 or 2 from the
    // catelog, which this build does not carry, so the else wins.
    expect(remapMessageId(10, 'stage5', facts({ shotType: 0 }))).toEqual({
      id: 1,
      routeChoice: 0,
    });
  });

  it('folds 6B conversations onto script 5 only once the clock passes midnight', () => {
    // `Gui.cpp:311-320` is an `else if`, so the fold only sees requests it owns:
    // anything from 6 up, and only on the true final stage.
    for (const id of [6, 7, 8, 9, 10, 11]) {
      expect(remapMessageId(id, 'stage6b', facts({ clockHour: 11 }))).toEqual({
        id,
        routeChoice: 0,
      });
      expect(remapMessageId(id, 'stage6b', facts({ clockHour: 12 }))).toEqual({
        id: 5,
        routeChoice: 0,
      });
    }
  });

  it('leaves early 6B conversations alone before midnight and after it', () => {
    // The arm tests `value >= 6` after the rewrite, so the opening talk (0-5) is
    // never folded, at any hour.
    for (const id of [0, 1, 2, 3, 4, 5]) {
      expect(remapMessageId(id, 'stage6b', facts({ clockHour: 12 }))).toEqual({
        id,
        routeChoice: 0,
      });
    }
  });

  it('keeps the midnight fold on 6B alone', () => {
    // `switch (currentStage)` has one case, so 6A never folds.
    expect(remapMessageId(8, 'stage6a', facts({ clockHour: 12 }))).toEqual({
      id: 8,
      routeChoice: 0,
    });
    expect(remapMessageId(8, 'stage5', facts({ clockHour: 12 }))).toEqual({
      id: 8,
      routeChoice: 0,
    });
  });
});

describe('message pack table', () => {
  it('indexes rows by the retail stage order, not the display number', () => {
    // `Gui.cpp:74-85` rows are `Stage`, so 4A is 3 and 4B is 4; the routes are
    // 1-based on screen, which is the trap this pins.
    expect(stageIndexFor('stage1')).toBe(0);
    expect(stageIndexFor('stage4a')).toBe(3);
    expect(stageIndexFor('stage4b')).toBe(4);
    expect(stageIndexFor('stage6b')).toBe(7);
    expect(GUI_MESSAGE_PATHS.length).toBe(9);
  });

  it('picks the per-member column for a stage', () => {
    expect(messagePackFor('stage1', 0)).toBe('msg1a');
    expect(messagePackFor('stage1', 3)).toBe('msg1d');
    // 6A and 6B sit on `msg6` and `msg7`: the split is a stage-enum fact, not a
    // message-file naming one, and it is the reason the rows cannot be read off
    // the displayed stage number.
    expect(messagePackFor('stage6a', 1)).toBe('msg6b');
    expect(messagePackFor('stage6b', 1)).toBe('msg7b');
    expect(messagePackFor('stage6b', 5)).toBe('msg7a');
  });

  it('keeps 4A and 4B on their shared and split scripts', () => {
    // The 4A row is `msg4dm, msg4ab, msg4ac, msg4dm` and the 4B row starts
    // `msg4ba`, which is how the original gives the mid-boss talk to Reimu only.
    expect(messagePackFor('stage4a', 0)).toBe('msg4dm');
    expect(messagePackFor('stage4a', 1)).toBe('msg4ab');
    expect(messagePackFor('stage4b', 0)).toBe('msg4ba');
    expect(messagePackFor('stage4b', 1)).toBe('msg4dm');
  });

  it('falls back to the first column for an out-of-range shot type', () => {
    expect(messagePackFor('stage3', 99)).toBe('msg3a');
    expect(messagePackFor('stage3', -1)).toBe('msg3a');
  });
});
