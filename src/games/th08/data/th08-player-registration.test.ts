/**
 * The ship banks are transcription data, so they need a contract test: every id a
 * member claims must exist on the atlas page it points at, and every animation
 * group must stay inside the member's own frame count. Both invariants were
 * violated before this landed, which is what made the ship flicker.
 */
import { describe, expect, it } from 'vitest';
import { TH08_MEMBER_BANKS, th08PlayerAnimFor } from './th08-player-registration';
import { TH08_PLAYER_SPRITES } from './th08-sprites';

describe('TH08 member ship banks', () => {
  const members = Object.keys(TH08_MEMBER_BANKS);

  it('covers all eight playable members', () => {
    expect(members.sort()).toEqual(
      ['alice', 'marisa', 'reimu', 'remilia', 'sakuya', 'yukari', 'youmu', 'yuyuko'].sort(),
    );
  });

  it('points every id at a rect that exists on its page', () => {
    for (const member of members) {
      const bank = TH08_MEMBER_BANKS[member];
      const page = TH08_PLAYER_SPRITES[bank.page];
      expect(page, `${member} page`).toBeTruthy();
      const ids = new Set(page.frames.map((f) => f.id));
      for (const id of bank.ids) {
        expect(ids.has(id), `${member} id ${id} on ${bank.page}`).toBe(true);
      }
    }
  });

  it('keeps the human banks and the youkai banks on disjoint slices', () => {
    for (const [team, [human, youkai]] of Object.entries({
      reimu: ['reimu', 'yukari'],
      marisa: ['marisa', 'alice'],
      sakuya: ['sakuya', 'remilia'],
      youmu: ['youmu', 'yuyuko'],
    })) {
      const a = new Set(TH08_MEMBER_BANKS[human].ids);
      for (const id of TH08_MEMBER_BANKS[youkai].ids) {
        expect(a.has(id), `${team}: ${youkai} steals ${human} frame ${id}`).toBe(false);
      }
    }
  });

  it('never animates a frame the bank does not own', () => {
    for (const member of members) {
      const bank = TH08_MEMBER_BANKS[member];
      const anim = th08PlayerAnimFor(bank.kind, bank.ids.length);
      for (const [group, def] of Object.entries(anim)) {
        for (const frame of def.frames) {
          expect(frame, `${member}.${group}`).toBeLessThan(bank.ids.length);
          expect(frame).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('points every standing portrait at a rect that exists on its page', () => {
    for (const member of members) {
      const bank = TH08_MEMBER_BANKS[member];
      if (!bank.portraitIds) continue;
      const ids = new Set(TH08_PLAYER_SPRITES[bank.page].frames.map((f) => f.id));
      for (const id of bank.portraitIds) {
        expect(ids.has(id), `${member} portrait id ${id}`).toBe(true);
      }
    }
  });

  it('mirrors the right bank instead of shipping a second copy', () => {
    const reimu = th08PlayerAnimFor('stance11', 11);
    expect(reimu.right.mirror).toBe(true);
    expect(reimu.right.frames).toEqual(reimu.left.frames);
    expect(reimu.main.mirror).toBe(false);
  });
});
