// Auto-generated from ecldata5.ecl by tools/th08/ecl
// Do not edit directly; change the translator and run `npm run ecl:th08`.
//
// Each sub is a generator that yields frame counts (wait N frames).
// The runtime calls .next() once per game frame.

import type { EnemyCtx } from '../../danmaku/EnemyCtx';
import { normalizeAngle } from '../../core/math';
import { reg } from '../../danmaku/ShotDescriptor';

// Difficulty bitmasks (from GameState.ts)
const EASY = 0x01;
const NORMAL = 0x02;
const HARD = 0x04;
const LUNATIC = 0x08;
const EXTRA = 0x10;
// ecldata5.ecl: 90 subs, translated by tools/th08/ecl
// Each sub is a generator whose body is the original ECL control-flow graph
// replayed as a block dispatcher: `pc` is a block id, `yield n` waits n
// frames, and jumps/loops/gotos keep the exact structure ZUN compiled.

export function* sub_0(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnmScripts6(77);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(30); // op 160
        e.movePolar(50, 4, 0, 2.5);
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 12;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 5.5;
        }
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 96
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingSpeed(0, 0);
        e.setSpeedAccel(0.066667);
        e.callSubAlloc(0, 1); // op 135
        yield 5000;
        pc = 3;
        break;
      }
      case 3: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_1(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 6,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.28559932,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_2(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(5, 4); // op 144
        e.movePolar(60, 4, 1.570796, 3);
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = 0.10472;
        pc = 3;
        break;
      }
      case 2: {
        e.f1 = -0.10472;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = -3.141593;
        e.linkChildAttached(3, 0, 0, 300, -2, 100);
        e.f0 = -1.047198;
        e.linkChildAttached(3, 0, 0, 200, -2, 100);
        e.f0 = 1.047198;
        e.linkChildAttached(3, 0, 0, 300, -2, 100);
        if (e.posX >= 192) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -0.07854;
        pc = 6;
        break;
      }
      case 5: {
        e.f1 = 0.07854;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -3.141593;
        e.linkChildAttached(5, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(5, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(5, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(5, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(5, 0, 0, 200, -2, 100);
        if (e.posX >= 192) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f1 = 0.05236;
        pc = 9;
        break;
      }
      case 8: {
        e.f1 = -0.05236;
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = -3.141593;
        e.linkChildAttached(7, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(7, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(7, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(7, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(7, 0, 0, 200, -2, 100);
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 120;
        pc = 11;
        break;
      }
      case 11: {
        e.setHeadingSpeed(-1.570796, 0.6);
        yield 5000;
        pc = 12;
        break;
      }
      case 12: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_3(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 1.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 4); // op 135
        }
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_4(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, 2.5); // op 111
        e.i0 = 8;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle - 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: 1,
          rings: 1,
          speed: 1.5,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 97
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_5(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 6); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_6(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 4;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 6,
          count: 1,
          rings: 2,
          speed: 2.2,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_7(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 4.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 8); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_8(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 5;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 2,
          count: 1,
          rings: 2,
          speed: 2.2,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_9(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(5, 4); // op 144
        e.movePolar(60, 4, 1.570796, 3);
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = 0.10472;
        pc = 3;
        break;
      }
      case 2: {
        e.f1 = -0.10472;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = -3.141593;
        e.linkChildAttached(3, 0, 0, 300, -2, 100);
        e.f0 = -1.047198;
        e.linkChildAttached(3, 0, 0, 200, -2, 100);
        e.f0 = 1.047198;
        e.linkChildAttached(3, 0, 0, 300, -2, 100);
        if (e.posX >= 192) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -0.07854;
        pc = 6;
        break;
      }
      case 5: {
        e.f1 = 0.07854;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -3.141593;
        e.linkChildAttached(5, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(5, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(5, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(5, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(5, 0, 0, 200, -2, 100);
        if (e.posX >= 192) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f1 = 0.05236;
        pc = 9;
        break;
      }
      case 8: {
        e.f1 = -0.05236;
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = -3.141593;
        e.linkChildAttached(7, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(7, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(7, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(7, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(7, 0, 0, 200, -2, 100);
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 120;
        pc = 11;
        break;
      }
      case 11: {
        e.setHeadingSpeed(-1.570796, 0.6);
        yield 5000;
        pc = 12;
        break;
      }
      case 12: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_10(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(5, 4); // op 144
        e.movePolar(60, 4, 1.570796, 3);
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = 0.10472;
        pc = 3;
        break;
      }
      case 2: {
        e.f1 = -0.10472;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = -3.141593;
        e.linkChildAttached(11, 0, 0, 300, -2, 100);
        e.f0 = -1.047198;
        e.linkChildAttached(11, 0, 0, 200, -2, 100);
        e.f0 = 1.047198;
        e.linkChildAttached(11, 0, 0, 300, -2, 100);
        if (e.posX >= 192) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -0.07854;
        pc = 6;
        break;
      }
      case 5: {
        e.f1 = 0.07854;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -3.141593;
        e.linkChildAttached(13, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(13, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(13, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(13, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(13, 0, 0, 200, -2, 100);
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 120;
        pc = 8;
        break;
      }
      case 8: {
        e.setHeadingSpeed(-1.570796, 0.6);
        yield 5000;
        pc = 9;
        break;
      }
      case 9: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_11(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 1.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 12); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_12(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 48;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle - 3.141593;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.8,
          angle: 0,
          angleStep: 0,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_13(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 14); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_14(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 9;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 3;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 3,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: 1.6,
          speed2: 1.2,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x200,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_15(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(120); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(7, 4); // op 144
        e.movePolar(60, 4, 1.570796, 3);
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = 0.10472;
        pc = 3;
        break;
      }
      case 2: {
        e.f1 = -0.10472;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = -3.141593;
        e.linkChildAttached(16, 0, 0, 300, -2, 100);
        e.f0 = -1.047198;
        e.linkChildAttached(16, 0, 0, 200, -2, 100);
        e.f0 = 1.047198;
        e.linkChildAttached(16, 0, 0, 300, -2, 100);
        if (e.posX >= 192) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -0.07854;
        pc = 6;
        break;
      }
      case 5: {
        e.f1 = 0.07854;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -3.141593;
        e.linkChildAttached(18, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(18, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(18, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(18, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(18, 0, 0, 200, -2, 100);
        if (e.posX >= 192) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f1 = 0.05236;
        pc = 9;
        break;
      }
      case 8: {
        e.f1 = -0.05236;
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = -3.141593;
        e.linkChildAttached(20, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(20, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(20, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(20, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(20, 0, 0, 200, -2, 100);
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 340;
        pc = 11;
        break;
      }
      case 11: {
        e.setHeadingSpeed(-1.570796, 0.6);
        yield 5000;
        pc = 12;
        break;
      }
      case 12: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_16(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setMisc160(120); // op 160
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 1.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 17); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_17(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 120; // the script starts at frame 120
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 8;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle - 1.570796;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 2,
          count: 1,
          rings: 1,
          speed: 1.6,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 97
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_18(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setMisc160(120); // op 160
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 19); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_19(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 120; // the script starts at frame 120
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 11;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 1.570796;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 3,
          count: 1,
          rings: 2,
          speed: 1.6,
          speed2: 1.2,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x200,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_20(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 4.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 21); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_21(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 120; // the script starts at frame 120
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 30;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 9;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 9;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 2,
          count: 1,
          rings: 2,
          speed: 2.2,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_22(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(120); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(7, 4); // op 144
        e.movePolar(60, 4, 1.570796, 3);
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = 0.10472;
        pc = 3;
        break;
      }
      case 2: {
        e.f1 = -0.10472;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = -3.141593;
        e.linkChildAttached(23, 0, 0, 300, -2, 100);
        e.f0 = -1.047198;
        e.linkChildAttached(23, 0, 0, 200, -2, 100);
        e.f0 = 1.047198;
        e.linkChildAttached(23, 0, 0, 300, -2, 100);
        if (e.posX >= 192) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -0.07854;
        pc = 6;
        break;
      }
      case 5: {
        e.f1 = 0.07854;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -3.141593;
        e.linkChildAttached(25, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(25, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(25, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(25, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(25, 0, 0, 200, -2, 100);
        if (e.posX >= 192) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f1 = 0.05236;
        pc = 9;
        break;
      }
      case 8: {
        e.f1 = -0.05236;
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = -3.141593;
        e.linkChildAttached(27, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(27, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(27, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(27, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(27, 0, 0, 200, -2, 100);
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 340;
        pc = 11;
        break;
      }
      case 11: {
        e.setHeadingSpeed(-1.570796, 0.6);
        yield 5000;
        pc = 12;
        break;
      }
      case 12: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_23(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setMisc160(120); // op 160
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 1.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 24); // op 135
        }
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_24(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 120; // the script starts at frame 120
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 9;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle - 1.570796;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 2,
          count: 1,
          rings: 1,
          speed: 1.6,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 97
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_25(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setMisc160(120); // op 160
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 26); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_26(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 120; // the script starts at frame 120
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 37;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1.6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.1;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 1.570796;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 3,
          count: 1,
          rings: 2,
          speed: reg(0x2727) /* f7 */,
          speed2: 1.2,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x200,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_27(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setMisc160(120); // op 160
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 4.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 28); // op 135
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_28(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 120; // the script starts at frame 120
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 51;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 23;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 23;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 23;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2.1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 3;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 2,
          count: 1,
          rings: 2,
          speed: reg(0x2727) /* f7 */,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        if (e.i0 <= 16) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0--;
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_29(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(94);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(20); // op 160
        e.playSfx(36);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 30); // op 135
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingSpeed(-0.785398, 0);
        e.setSpeedAccel(0.033333);
        yield 5000;
        pc = 3;
        break;
      }
      case 3: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_30(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 0.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 1;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.785398;
        e.f0 += e.timer;
        e.f1 = e.randF32 * 1;
        e.f1 += e.f2;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 97
        yield e.delay(e.ci2);
        e.f0 = e.randF32S * 1.570796;
        e.f0 += e.timer;
        e.f1 = e.randF32 * 1;
        e.f1 += e.f2;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 4,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 97
        yield e.delay(e.ci2);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_31(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(94);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(20); // op 160
        e.playSfx(36);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 32); // op 135
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingSpeed(-0.785398, 0);
        e.setSpeedAccel(0.033333);
        yield 5000;
        pc = 3;
        break;
      }
      case 3: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_32(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 28;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 9;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 7;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 1.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 1.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 2.5;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 128, 0, 60, 1, 0, 1.4); // op 111
        e.f0 = e.randF32S * 0.785398;
        e.f0 += e.timer;
        e.f1 = e.randF32 * 1;
        e.f1 += e.f2;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 97
        yield e.delay(e.ci2);
        e.f0 = e.randF32S * 1.570796;
        e.setShotRecord(0, 128, 0, 60, 1, 0, 2); // op 111
        e.f0 += e.timer;
        e.f1 = e.randF32 * 1;
        e.f1 += e.f2;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 4,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 97
        yield e.delay(e.ci2);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_33(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.removeAllBullets();
        e.enemyFunc95(); // op 95
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_34(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(95);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(2);
        e.movePolar(50, 4, 1.570796, 2);
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(1.570796, 1);
        e.f0 = 1.570796;
        e.f1 = -0.05236;
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 5000;
        pc = 5;
        break;
      }
      case 5: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_35(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(56);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(100, e.f0, e.f1, 0.833333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_36(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(95);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(2);
        e.movePolar(50, 4, 1.570796, 3);
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(1.570796, 1);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(35, 0, 0, 100, -2, 100);
        yield 5000;
        pc = 5;
        break;
      }
      case 5: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_37(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.clearScriptFlags(56);
        e.spawnEffectAt(51, 16, 0); // op 139
        yield 4;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(51, 16, 0); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(51, 16, 0); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(51, 16, 0); // op 139
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEffectAt(51, 16, 0); // op 139
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffectAt(51, 16, 0); // op 139
        pc = 6;
        break;
      }
      case 6: {
        e.spawnEffectAt(51, 4, 0); // op 139
        yield 4;
        pc = 7;
        break;
      }
      case 7: {
        pc = 6;
        break;
      }
      case 8: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_38(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.setLives(14000);
        e.setSpellTimer(2040, 45); // op 134
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(45); // op 130
        e.eclSetLives(1);
        e.setRelPos(416, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffect(6, 1050253722, 1060320051, 1050253722, 1124073472);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffect(6, -1097229926, 1060320051, 1050253722, 1124073472);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffect(6, 1050253722, 1060320051, -1097229926, 1124073472);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEffect(6, -1097229926, -1087163597, -1097229926, 1119879168);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffect(6, 1050253722, -1087163597, -1097229926, 1119879168);
        yield 10;
        pc = 6;
        break;
      }
      case 6: {
        e.spawnEffect(6, -1097229926, -1087163597, 1050253722, 1119879168);
        yield 10;
        pc = 7;
        break;
      }
      case 7: {
        e.setMotionClamp(32, 48, 352, 128);
        yield* sub_39(e);
        pc = 8;
        break;
      }
      case 8: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_39(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setScriptFlags(4);
        e.setMisc144(10, 5); // op 144
        e.ci3 = 0;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_40(e);
        pc = 2;
        break;
      }
      case 2: {
        e.moveBounce(60, 4, 1); // op 67
        e.ci0 = 16;
        e.f0 = e.timer - 1.570796;
        e.f1 = 1;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(42, 0, 0, 300, -2, 100);
        e.setShotOrigin(0, 0); // op 110
        if (e.ci3 <= 0) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 6,
            speed: 2,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.014024967,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 12,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.016362462,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 12,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.016362462,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 12,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.016362462,
            transform: 0x202,
          }); // op 99
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f0 += 0.19635;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        yield* sub_41(e);
        pc = 7;
        break;
      }
      case 7: {
        e.moveBounce(60, 4, 1); // op 67
        e.ci0 = 16;
        e.f1 = 1;
        e.f0 = e.timer - 1.570796;
        pc = 8;
        break;
      }
      case 8: {
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(42, 0, 0, 300, -2, 100);
        e.setShotOrigin(0, 0); // op 110
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 6,
            speed: 2,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: -0.014024967,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 12,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: -0.016362462,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 12,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: -0.016362462,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 12,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: -0.016362462,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += 0.19635;
        if (--e.ci0 > 0) {
          pc = 8;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.ci3++;
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_40(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f2 = e.randAngle;
        e.ci0 = 64;
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.cos(e.f2);
        e.f0 *= 64;
        e.f1 = Math.sin(e.f2);
        e.f1 *= 64;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 1.8;
        }
        if (e.i0 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(1, 64, 1, 60, 1, -1.570796, e.f7); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 1.570796, e.f7); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16384, 0, 2, 4, -1, -1); // op 111
        e.f2 += 0.19635;
        e.f2 = normalizeAngle(e.f2);
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.19635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.098175;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.098175;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.098175;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 9;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
        }); // op 97
        if (e.hpRatio >= 96) {
          yield 1;
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x202,
        }); // op 96
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_41(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f2 = e.randAngle;
        e.ci0 = 64;
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.cos(e.f2);
        e.f0 *= 64;
        e.f1 = Math.sin(e.f2);
        e.f1 *= 64;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 1.4;
        }
        if (e.i0 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(1, 64, 1, 60, 1, -1.570796, e.f7); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 1.570796, e.f7); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16384, 0, 2, 8, -1, -1); // op 111
        e.f2 -= 0.19635;
        e.f2 = normalizeAngle(e.f2);
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.19635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.098175;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.098175;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.098175;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 7;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
        }); // op 97
        if (e.hpRatio >= 96) {
          yield 1;
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 4,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x202,
        }); // op 96
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_42(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(54);
        e.setBounds(24, 24);
        e.setHitFlash(1);
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        yield 5000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_43(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setBossPresent(-1);
        e.moveRelative(60, 1, 256, -32); // op 64
        e.clearMotionClamp();
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_44(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setBossPresent(-1);
        e.moveRelative(60, 1, 256, -32); // op 64
        e.spawnItem(5);
        e.clearMotionClamp();
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_45(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setScriptFlags(4);
        e.setMisc144(10, 5); // op 144
        e.setMisc160(320); // op 160
        e.setLives(11000);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setSpellTimer(1560, 43); // op 134
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(44); // op 130
        e.eclSetLives(0);
        yield 180;
        pc = 1;
        break;
      }
      case 1: {
        e.ci3 = 0;
        e.callSubAlloc(0, 46); // op 135
        e.callSubAlloc(1, 47); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 16;
        e.f0 = e.timer - 1.570796;
        e.f1 = 1;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(42, 0, 0, 300, -2, 100);
        e.setShotOrigin(0, 0); // op 110
        e.f0 += 0.19635;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.ci0 = 16;
        e.f1 = 1;
        e.f0 = e.timer - 1.570796;
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(42, 0, 0, 300, -2, 100);
        e.setShotOrigin(0, 0); // op 110
        e.f0 += 0.19635;
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.ci3++;
        yield 170;
        pc = 7;
        break;
      }
      case 7: {
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_46(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f2 = 0;
        e.ci0 = 64;
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.cos(e.f2);
        e.f0 *= 64;
        e.f1 = Math.sin(e.f2);
        e.f1 *= 64;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        if (e.i0 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(1, 64, 1, 60, 1, -1.570796, 1.1); // op 111
        e.setShotRecord(2, 16384, 0, 2, 4, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 1.570796, 1.1); // op 111
        e.setShotRecord(2, 16384, 0, 2, 3, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.f2 += 0.1848;
        e.f2 = normalizeAngle(e.f2);
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.19635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.1309;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.1309;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.1309;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 7;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
        }); // op 97
        if (e.hpRatio >= 96) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 4,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 96
        pc = 6;
        break;
      }
      case 6: {
        e.ci0++;
        yield 4;
        pc = 7;
        break;
      }
      case 7: {
        pc = 1;
        break;
      }
      case 8: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_47(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f2 = 1.570796;
        e.ci0 = 64;
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.cos(e.f2);
        e.f0 *= 64;
        e.f1 = Math.sin(e.f2);
        e.f1 *= 64;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        if (e.i0 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(1, 64, 1, 60, 1, -1.570796, 1.1); // op 111
        e.setShotRecord(2, 16384, 0, 2, 8, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 1.570796, 1.1); // op 111
        e.setShotRecord(2, 16384, 0, 2, 7, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.f2 -= 0.1848;
        e.f2 = normalizeAngle(e.f2);
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.19635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.1309;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.1309;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.1309;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 9;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
        }); // op 97
        if (e.hpRatio >= 96) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 4,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 96
        pc = 6;
        break;
      }
      case 6: {
        e.ci0++;
        yield 4;
        pc = 7;
        break;
      }
      case 7: {
        pc = 1;
        break;
      }
      case 8: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_48(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnmScripts6Alt(12); // op 59
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 62); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(51, 1); // op 126
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_49(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnmScripts6Alt(6); // op 59
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBossPresent(1);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 62); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 128, 128); // op 64
        e.setMisc126(50, 1); // op 126
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_50(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.moveRelative(60, 0, 128, -32); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_51(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setBossPresent(0);
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(2);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(53); // op 130
        e.setSpellTimer(2400, 62); // op 134
        e.setPhase(0, 2200, 62); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.spawnEffect(6, 1050253722, 1060320051, 1050253722, 1124073472);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffect(6, -1097229926, 1060320051, 1050253722, 1124073472);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffect(6, 1050253722, 1060320051, -1097229926, 1124073472);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffect(6, -1097229926, -1087163597, -1097229926, 1119879168);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEffect(6, 1050253722, -1087163597, -1097229926, 1119879168);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffect(6, -1097229926, -1087163597, 1050253722, 1119879168);
        yield 10;
        pc = 6;
        break;
      }
      case 6: {
        e.setMotionClamp(32, 48, 352, 128);
        e.i0 = 20;
        yield* sub_61(e);
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 52); // op 135
        yield 200;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1); // op 67
        yield 30;
        pc = 9;
        break;
      }
      case 9: {
        pc = 8;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_52(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 8.1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 8.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 48;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 64;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 70;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 80;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 64, 0, 60, 1, 0.1122, 1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.2617994,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 99
        e.setShotRecord(0, 64, 0, 60, 1, -0.1122, 1); // op 111
        yield 26;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 4,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.2617994,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 99
        yield 18;
        pc = 3;
        break;
      }
      case 3: {
        pc = 1;
        break;
      }
      case 4: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_53(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(160); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(1);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(56); // op 130
        e.setSpellTimer(3000, 66); // op 134
        e.setPhase(0, 2200, 66); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 112); // op 64
        e.i0 = 20;
        yield* sub_61(e);
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 0.785398;
        e.f1 = 0.098175;
        e.linkChildAttached(55, 56, 56, 3000, 1, 100000);
        e.f0 = 2.356194;
        e.f1 = -0.098175;
        e.linkChildAttached(55, -56, 56, 3000, 1, 100000);
        e.f0 = 1.570796;
        e.f1 = -0.098175;
        e.linkChildAttached(55, 56, -56, 8000, 1, 100000);
        e.f0 = 1.570796;
        e.f1 = 0.098175;
        e.linkChildAttached(55, -56, -56, 8000, 1, 100000);
        yield 200;
        pc = 2;
        break;
      }
      case 2: {
        e.moveBounce(60, 4, 1); // op 67
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_54(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 7.3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 7.6;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 64, 0, 55, 1, 0.174533, 1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 99
        e.setShotRecord(0, 64, 0, 55, 1, -0.174533, 1); // op 111
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield 2;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 4,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 99
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield 2;
        pc = 3;
        break;
      }
      case 3: {
        pc = 1;
        break;
      }
      case 4: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_55(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.effectWithYoukai(1); // op 174
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 54); // op 135
        yield 30000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_56(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(160); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc144(10, 5); // op 144
        e.setLives(20000);
        e.eclSetLives(0);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(56); // op 130
        e.setSpellTimer(3600, 63); // op 134
        e.setPhase(0, 6200, 63); // op 133
        e.setPhase(1, 3200, 74); // op 133
        e.setLifeBarSlice(0, 0, e.phase1, 16736352);
        e.setLifeBarSlice(1, e.phase1, e.phase0, 16752800);
        e.moveRelative(60, 4, 192, 112); // op 64
        e.i0 = 20;
        yield* sub_61(e);
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 0.785398;
        e.f1 = 0.098175;
        e.linkChildAttached(59, 24, 32, 3000, 1, 100000);
        e.f0 = 2.356194;
        e.f1 = -0.098175;
        e.linkChildAttached(59, 8, 32, 3000, 1, 100000);
        e.f0 = 2.356194;
        e.f1 = -0.098175;
        e.linkChildAttached(59, -8, 32, 3000, 1, 100000);
        e.f0 = 2.356194;
        e.f1 = -0.098175;
        e.linkChildAttached(59, -24, 32, 3000, 1, 100000);
        if (e.difficulty < 1) {
          yield 200;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 1.570796;
        e.f1 = -0.098175;
        e.linkChildAttached(59, 40, 32, 8000, 1, 100000);
        e.f0 = 1.570796;
        e.f1 = 0.098175;
        e.linkChildAttached(59, -40, 32, 8000, 1, 100000);
        yield 200;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1); // op 67
        yield 30;
        pc = 4;
        break;
      }
      case 4: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_57(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f1 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 6.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 8.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 8.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 8.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 10;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 += 0.392699;
        e.f1 = normalizeAngle(e.f1);
        e.f0 = Math.sin(e.f1);
        e.f0 *= 0.392699;
        e.setShotRecord(0, 64, 0, 60, 1, 0, 1); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 16,
          color: 2,
          count: 3,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield e.delay(e.ci2);
        pc = 1;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_58(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f1 = 0;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 16,
          color: 1,
          count: 12,
          rings: 1,
          speed: 1.5,
          speed2: 0.5,
          angle: 3.1415927,
          angleStep: 0.3926991,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 80;
        pc = 2;
        break;
      }
      case 2: {
        pc = 1;
        break;
      }
      case 3: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_59(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.effectWithYoukai(1); // op 174
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setShotNoFireRadius(0);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 57); // op 135
        e.callSubAlloc(1, 58); // op 135
        yield 30000;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_60(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = e.timeOrbReady;
        if (e.i0 >= 2) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      case 2: {
        e.setAnmScripts6Alt(12); // op 59
        e.clearScriptFlags(8);
        e.eclSetLives(0);
        e.setBossPresent(0);
        e.setLives(1700);
        e.setLifeBarSlice(0, 0, e.maxHp, 16752800);
        e.complexSetup(1); // op 176
        e.setMotionClamp(32, 48, 352, 128);
        yield 70;
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(5);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 6;
        break;
      }
      case 6: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 7;
        break;
      }
      case 7: {
        e.playSfx(15);
        e.setScriptFlags(8);
        e.setMisc173(1); // op 173
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(88); // op 130
        yield* sub_78(e);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_61(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 32;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(17, 4, -1); // op 139
        yield 1;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_62(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(53); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 53); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('波符「赤眼催眠(マインドシェイカー)」', '鈴仙・Ｕ・イナバ', 100, 0, 26000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('波符「赤眼催眠(マインドシェイカー)」', '鈴仙・Ｕ・イナバ', 101, 0, 26000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('幻波「赤眼催眠(マインドブローイング)」', '鈴仙・Ｕ・イナバ', 102, 0, 26000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('幻波「赤眼催眠(マインドブローイング)」', '鈴仙・Ｕ・イナバ', 103, 0, 26000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: 48,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x104210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        e.f0 += 0.06545;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: 48,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x204210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        yield 50;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        e.ci0 = 50;
        e.cf0 = 192;
        e.cf1 = 244;
        e.callSubAlloc(0, 85); // op 135
        e.i0 = 1048576;
        e.f0 = 2.356194;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 1;
        }
        e.i1 = 0;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.f0 = 0.785398;
        e.setMisc136(12, 0); // op 136
        yield 100;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 1048576;
        e.i1 = 1;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.setMisc136(12, 0); // op 136
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 24;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 48;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 64;
        }
        yield 20;
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.4,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x104210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        e.f0 += 0.06545;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.4,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x204210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        yield 20;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.2,
          speed2: 0.6,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x104210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        e.f0 += 0.06545;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.2,
          speed2: 0.6,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x204210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        yield 20;
        pc = 7;
        break;
      }
      case 7: {
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_63(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(74); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 87); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('懶符「生神停止(アイドリングウェーブ」', '鈴仙・Ｕ・イナバ', 108, 0, 26000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('懶符「生神停止(アイドリングウェーブ)」', '鈴仙・Ｕ・イナバ', 109, 0, 26000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('懶惰「生神停止(マインドストッパー)」', '鈴仙・Ｕ・イナバ', 110, 0, 26000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('懶惰「生神停止(マインドストッパー)」', '鈴仙・Ｕ・イナバ', 111, 0, 26000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(360); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.i7 = 8;
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 16, 368, 1200, -2, 100);
        }
        e.linkChildStandard(64, 16, 432, 1200, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 80, 432, 1200, -2, 100);
        }
        e.i7 = 6;
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 368, 368, 1200, -2, 100);
        }
        e.linkChildStandard(64, 368, 432, 1200, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 304, 432, 1200, -2, 100);
        }
        e.i7 = 10;
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 16, 80, 1200, -2, 100);
        }
        e.linkChildStandard(64, 16, 16, 1200, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 80, 16, 1200, -2, 100);
        }
        e.i7 = 4;
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 368, 80, 1200, -2, 100);
        }
        e.linkChildStandard(64, 368, 16, 1200, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildStandard(64, 304, 16, 1200, -2, 100);
        }
        yield 260;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        e.ci0 = 50;
        e.cf0 = 192;
        e.cf1 = 244;
        e.callSubAlloc(0, 85); // op 135
        e.i0 = 1048576;
        e.f0 = 2.356194;
        e.f1 = 0;
        e.i1 = 0;
        e.setMisc136(12, 0); // op 136
        yield 100;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 1048576;
        e.i1 = 1;
        e.setMisc136(12, 0); // op 136
        e.moveBounce(60, 4, 1); // op 67
        e.ci3++;
        yield 260;
        pc = 5;
        break;
      }
      case 5: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_64(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 65); // op 135
        yield 4200;
        pc = 2;
        break;
      }
      case 2: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_65(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 1;
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 56;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 56;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 48;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 64;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: reg(0x2717) /* i7 */,
          count: reg(0x2716) /* i6 */,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 1.0471976,
          transform: 0x100202,
        }); // op 99
        yield 260;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: reg(0x2717) /* i7 */,
          count: reg(0x2716) /* i6 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 1.0471976,
          transform: 0x100202,
        }); // op 99
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.ci0 = 8;
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 16,
            color: 3,
            count: 1,
            rings: 1,
            speed: 2.2,
            speed2: 0.5,
            angle: 0,
            angleStep: 1.0471976,
            transform: 0x100202,
          }); // op 96
        }
        yield 10;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_66(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(56); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4620, 56); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('狂符「幻視調律(ビジョナリチューニング)」', '鈴仙・Ｕ・イナバ', 104, 0, 26000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('狂符「幻視調律(ビジョナリチューニング)」', '鈴仙・Ｕ・イナバ', 105, 0, 26000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('狂視「狂視調律(イリュージョンシーカー)」', '鈴仙・Ｕ・イナバ', 106, 0, 26000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('狂視「狂視調律(イリュージョンシーカー)」', '鈴仙・Ｕ・イナバ', 107, 0, 26000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(600); // op 160
        e.callSubAlloc(0, 67); // op 135
        yield 250;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, -1); // op 135
        e.ci0 = 50;
        e.cf0 = 192;
        e.cf1 = 244;
        e.callSubAlloc(1, 85); // op 135
        e.i0 = 1048576;
        e.f0 = 0;
        e.f1 = 0.6;
        e.i1 = 0;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.f0 = 3.141593;
        e.setMisc136(12, 0); // op 136
        yield 100;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 1048576;
        e.callSubAlloc(0, 67); // op 135
        e.i1 = 1;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.setMisc136(12, 0); // op 136
        e.moveBounce(60, 0, 1); // op 67
        yield 100;
        pc = 5;
        break;
      }
      case 5: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_67(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 50;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 25;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 25;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 25;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.i7 = 6;
        e.ci1 = 0;
        e.f0 = 3.141593;
        e.cf0 = e.randF32S * 16;
        e.cf0 += 380;
        e.cf1 = e.randF32S * 32;
        e.cf1 += 224;
        e.linkChildStandard(68, e.cf0, e.cf1, 200, -2, 100);
        yield e.delay(e.ci2);
        e.ci1 = 0;
        e.f0 = 0;
        e.i7 = 2;
        e.cf0 = e.randF32S * 16;
        e.cf0 += 4;
        e.cf1 = e.randF32S * 32;
        e.cf1 += 224;
        e.linkChildStandard(71, e.cf0, e.cf1, 200, -2, 100);
        yield e.delay(e.ci2);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_68(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setShotNoFireRadius(0);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.callSubAlloc(0, 69); // op 135
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(1, 73); // op 135
        }
        e.setHeadingSpeed(e.f0, 1);
        yield 4200;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_69(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 4194304, 1, 900, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: 1.3,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0,
          transform: 0x501202 /* WRAP_X */,
        }); // op 99
        yield 8;
        pc = 2;
        break;
      }
      case 2: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_70(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 4194304, 1, 900, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0,
          transform: 0x501202 /* WRAP_X */,
        }); // op 99
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_71(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.setShotNoFireRadius(0);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.callSubAlloc(0, 72); // op 135
        e.setHeadingSpeed(e.f0, 1);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(1, 73); // op 135
        }
        yield 4200;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_72(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 4194304, 1, 900, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: 1.3,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0,
          transform: 0x601202 /* WRAP_X */,
        }); // op 99
        yield 8;
        pc = 2;
        break;
      }
      case 2: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_73(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 4194304, 1, 900, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0,
          transform: 0x601202 /* WRAP_X */,
        }); // op 99
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_74(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setSpellTimer(99999, 87); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.spawnItemRandom(10); // op 142
        e.spawnItemBatch(5); // op 168
        e.setScriptFlags(3);
        e.setBossPresent(0);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_75(e);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_75(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(87); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 53); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('散符「真実の月(インビジブルフルムーン)」', '鈴仙・Ｕ・イナバ', 112, 0, 26000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('散符「真実の月(インビジブルフルムーン)」', '鈴仙・Ｕ・イナバ', 113, 0, 26000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('散符「真実の月(インビジブルフルムーン)」', '鈴仙・Ｕ・イナバ', 114, 0, 26000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('散符「真実の月(インビジブルフルムーン)」', '鈴仙・Ｕ・イナバ', 115, 0, 26000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(600); // op 160
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randAngle;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 80;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 128;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 130;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 144;
        }
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x100200,
        }); // op 99
        yield 50;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        e.ci0 = 50;
        e.cf0 = 192;
        e.cf1 = 244;
        e.callSubAlloc(0, 85); // op 135
        e.i0 = 1048576;
        e.f0 = 2.356194;
        e.f1 = 0.3;
        e.i1 = 0;
        e.setMisc136(14, 0); // op 136
        e.i0 = 2097152;
        e.f0 = 0.785398;
        e.setMisc136(14, 0); // op 136
        yield 80;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 1048576;
        e.setMisc136(14, 0); // op 136
        e.i0 = 2097152;
        e.setMisc136(14, 0); // op 136
        yield 20;
        pc = 5;
        break;
      }
      case 5: {
        e.i0 = 1048576;
        e.i1 = 1;
        e.setMisc136(14, 0); // op 136
        e.i0 = 2097152;
        e.setMisc136(14, 0); // op 136
        yield 20;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = e.randAngle;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 32;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 44;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 48;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 56;
        }
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.4,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x100200,
        }); // op 99
        e.f0 += 0.06545;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.4,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200200,
        }); // op 99
        yield 20;
        pc = 7;
        break;
      }
      case 7: {
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.2,
          speed2: 0.6,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x100200,
        }); // op 99
        e.f0 += 0.06545;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 16,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: 1.2,
          speed2: 0.6,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200200,
        }); // op 99
        e.ci0 = 16;
        e.f0 = e.randAngle;
        e.f1 = 2;
        pc = 8;
        break;
      }
      case 8: {
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(77, 0, 0, 200, -2, 100);
        }
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 8;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_76(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 131072, 0, 300, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 3, 6, -1, -1); // op 111
        e.setShotRecord(2, 16, 0, 60, -1, 0.033333, -999); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 5,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.6,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.09817477,
          transform: 0x24210 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 97
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_77(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.callSubAlloc(0, 76); // op 135
        e.setHeadingSpeed(e.f0, e.f1);
        yield 30000;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_78(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2640, 88); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('月眼「月兎遠隔催眠術(テレメスメリズム)」', '鈴仙・Ｕ・イナバ', 116, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('月眼「月兎遠隔催眠術(テレメスメリズム)」', '鈴仙・Ｕ・イナバ', 117, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('月眼「月兎遠隔催眠術(テレメスメリズム)」', '鈴仙・Ｕ・イナバ', 118, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(120); // op 160
        e.callSubAlloc(0, 79); // op 135
        yield 150;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, -1); // op 135
        e.ci0 = 50;
        e.cf0 = 192;
        e.cf1 = 244;
        e.callSubAlloc(1, 85); // op 135
        e.i0 = 1048576;
        e.f0 = 1.570796;
        e.f1 = 0.6;
        e.i1 = 0;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.f0 = -1.570796;
        e.setMisc136(12, 0); // op 136
        yield 100;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 1048576;
        e.callSubAlloc(0, 80); // op 135
        e.i1 = 1;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.setMisc136(12, 0); // op 136
        e.moveBounce(60, 0, 1); // op 67
        yield 100;
        pc = 5;
        break;
      }
      case 5: {
        e.callSubAlloc(0, -1); // op 135
        e.ci0 = 50;
        e.cf0 = 192;
        e.cf1 = 244;
        e.callSubAlloc(1, 85); // op 135
        e.i0 = 1048576;
        e.f0 = 1.570796;
        e.f1 = 0.6;
        e.i1 = 0;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.f0 = -1.570796;
        e.setMisc136(12, 0); // op 136
        yield 100;
        pc = 6;
        break;
      }
      case 6: {
        e.i0 = 1048576;
        e.callSubAlloc(0, 79); // op 135
        e.i1 = 1;
        e.setMisc136(12, 0); // op 136
        e.i0 = 2097152;
        e.setMisc136(12, 0); // op 136
        e.moveBounce(60, 0, 1); // op 67
        yield 100;
        pc = 7;
        break;
      }
      case 7: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_79(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i7 = 6;
        e.ci1 = 0;
        e.f0 = 1.570796;
        e.f1 = e.randF32 * 1;
        e.f1 += 2;
        e.cf0 = e.randF32S * 8;
        e.cf1 = 0;
        e.linkChildStandard(81, e.cf0, e.cf1, 300, -2, 100);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.ci1 = 0;
        e.f0 = -1.570796;
        e.f1 = e.randF32 * 1;
        e.f1 += 2;
        e.i7 = 2;
        e.cf0 = e.randF32S * 16;
        e.cf0 += 384;
        e.cf1 = 448;
        e.linkChildStandard(83, e.cf0, e.cf1, 300, -2, 100);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_80(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i7 = 6;
        e.ci1 = 0;
        e.f0 = 1.570796;
        e.f1 = e.randF32 * 1;
        e.f1 += 2;
        e.cf0 = e.randF32S * 8;
        e.cf0 += 384;
        e.cf1 = 0;
        e.linkChildStandard(81, e.cf0, e.cf1, 300, -2, 100);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.ci1 = 0;
        e.f0 = -1.570796;
        e.f1 = e.randF32 * 1;
        e.f1 += 2;
        e.i7 = 2;
        e.cf0 = e.randF32S * 8;
        e.cf1 = 448;
        e.linkChildStandard(83, e.cf0, e.cf1, 300, -2, 100);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_81(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setShotNoFireRadius(0);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.callSubAlloc(0, 82); // op 135
        e.setHeadingSpeed(e.f0, e.f1);
        yield 4200;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_82(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 8388608, 1, 900, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 1.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 18;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 16,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: 0,
          angleStep: 0,
          transform: 0x900202 /* WRAP_Y */,
        }); // op 97
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 16,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: 0,
          angleStep: 0,
          transform: 0xa00202 /* WRAP_Y */,
        }); // op 97
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_83(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setShotNoFireRadius(0);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.callSubAlloc(0, 84); // op 135
        e.setHeadingSpeed(e.f0, e.f1);
        yield 4200;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_84(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 8388608, 1, 900, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 1.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 18;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 16,
          color: 2,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: 3.1415927,
          angleStep: 0,
          transform: 0xa00202 /* WRAP_Y */,
        }); // op 97
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 16,
          color: 2,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: 3.1415927,
          angleStep: 0,
          transform: 0x900202 /* WRAP_Y */,
        }); // op 97
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_85(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 -= 25;
        e.playSfx(42);
        e.setTimeout(13);
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEnemy(86, 1176352768, 1176353792, 0, 10, -2, 10);
        yield 2;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.setTimeout(-1);
        e.playSfx(25);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_86(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.clearScriptFlags(3);
        e.setAnmAlt(5);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_87(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.complexBossInit(1); // op 184
        e.maxHp = 1;
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.clearScriptFlags(3);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.f0 = 0;
        e.ci0 = 6;
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
        yield 1;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
        yield 1;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
        yield 1;
        pc = 4;
        break;
      }
      case 4: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
        yield 1;
        pc = 5;
        break;
      }
      case 5: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
        yield 1;
        pc = 7;
        break;
      }
      case 7: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 8;
        break;
      }
      case 8: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 9;
        break;
      }
      case 9: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        yield 1;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        e.playSfx(7);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 11;
        break;
      }
      case 11: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        e.endSpell();
        e.setBossPresent(-1);
        e.maxHp = 0;
        yield 3000;
        pc = 12;
        break;
      }
      case 12: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_88(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.complexBossInit(1); // op 184
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.clearScriptFlags(3);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        if (e.spellCardState == 0) {
          pc = 4;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 0;
        e.ci0 = 6;
        e.playSfx(7);
        pc = 2;
        break;
      }
      case 2: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        pc = 4;
        break;
      }
      case 4: {
        e.endSpell();
        e.setBossPresent(-1);
        e.maxHp = 1;
        yield 2;
        pc = 5;
        break;
      }
      case 5: {
        e.maxHp = 0;
        yield 3000;
        pc = 6;
        break;
      }
      case 6: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_89(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.complexBossInit(1); // op 184
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.clearScriptFlags(3);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.ci3 = 0;
        if (e.spellCardState == 0) {
          pc = 4;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 0;
        e.ci0 = 6;
        e.playSfx(7);
        pc = 2;
        break;
      }
      case 2: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        e.ci3 = 1;
        pc = 4;
        break;
      }
      case 4: {
        e.endSpell();
        if (e.ci3 == 0) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        yield e.delay(120);
        pc = 6;
        break;
      }
      case 6: {
        e.setBossPresent(-1);
        e.maxHp = 1;
        yield 2;
        pc = 7;
        break;
      }
      case 7: {
        e.maxHp = 0;
        yield 3000;
        pc = 8;
        break;
      }
      case 8: {
        return;
      }
      default:
        return;
    }
  }
}
