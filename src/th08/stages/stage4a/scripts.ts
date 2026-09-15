// Auto-generated from ecldata4a.ecl by tools/th08/ecl
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
// ecldata4a.ecl: 61 subs, translated by tools/th08/ecl
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
        e.setAnm(0);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(8); // op 160
        e.callSubAlloc(0, 2); // op 135
        e.movePolar(30, 4, 0, 3);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 4);
        e.callSubAlloc(0, 1); // op 135
        e.ci1 = 3;
        e.setHeadingVel(0.001571);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 33;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 33;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 18;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 3.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 4.6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2.3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2.4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 2.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f3 = 0;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f3 = 0;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f3 = 0;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f3 = 1.8;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 6,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 2,
          angle: 0,
          angleStep: 0.28559932,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 2,
            rings: 1,
            speed: reg(0x2721) /* f1 */,
            speed2: 1,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 3,
            rings: 1,
            speed: reg(0x2722) /* f2 */,
            speed2: 1,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 4,
            rings: 1,
            speed: reg(0x2723) /* f3 */,
            speed2: 1,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        yield e.delay(e.i0);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 30;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 4.6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 1.6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0;
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
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 6,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 2,
          angle: 0,
          angleStep: 0.28559932,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 1,
            rings: 1,
            speed: reg(0x2721) /* f1 */,
            speed2: 0.5,
            angle: 3.1415927,
            angleStep: 0.28559932,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 2,
            rings: 1,
            speed: reg(0x2722) /* f2 */,
            speed2: 0.5,
            angle: 3.1415927,
            angleStep: 0.28559932,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        yield e.delay(e.i0);
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
        e.setAnm(0);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(30); // op 160
        e.movePolar(30, 4, 1.570796, 2);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(1.570796, 2.5);
        e.callSubAlloc(0, 4); // op 135
        e.ci1 = 3;
        e.setHeadingVel(0.001571);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 3;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 1,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.28559932,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 6,
          color: 6,
          count: 1,
          rings: 1,
          speed: 1.5,
          speed2: 0.5,
          angle: 3.1415927,
          angleStep: 0.28559932,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        yield 4;
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
        e.setAnm(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(2);
        e.movePolar(50, 4, 1.570796, 2);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 2,
            count: 8,
            rings: 1,
            speed: 1,
            speed2: 0.8,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.5,
            speed2: 0.8,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 2,
            speed: 2,
            speed2: 0.8,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 2,
            count: 48,
            rings: 3,
            speed: 2.5,
            speed2: 0.8,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingSpeed(1.570796, 0.5);
        e.f0 = 1.570796;
        e.f1 = -0.05236;
        e.linkChildAttached(6, 0, 0, 180, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(6, 0, 0, 180, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(6, 0, 0, 180, -2, 100);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildAttached(6, 0, 0, 180, -2, 100);
        yield 600;
        pc = 6;
        break;
      }
      case 6: {
        e.setSpeedAccel(-0.02);
        yield 5000;
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(60, e.f0, e.f1, 0.833333);
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
        e.setAnm(18);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(50); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(5, 4); // op 144
        e.movePolar(30, 4, 1.570796, 4);
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
        e.linkChildAttached(8, 0, 0, 300, -2, 100);
        e.f0 = -1.047198;
        e.linkChildAttached(8, 0, 0, 200, -2, 100);
        e.f0 = 1.047198;
        e.linkChildAttached(8, 0, 0, 300, -2, 100);
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
        e.linkChildAttached(10, 0, 0, 300, -2, 100);
        e.f0 = -1.884956;
        e.linkChildAttached(10, 0, 0, 200, -2, 100);
        e.f0 = -0.628319;
        e.linkChildAttached(10, 0, 0, 300, -2, 100);
        e.f0 = 0.628319;
        e.linkChildAttached(10, 0, 0, 200, -2, 100);
        e.f0 = 1.884956;
        e.linkChildAttached(10, 0, 0, 200, -2, 100);
        yield 30;
        pc = 7;
        break;
      }
      case 7: {
        e.setHeadingSpeed(0.392699, 0.7);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 5000;
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
        e.callSubAlloc(0, 9); // op 135
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
        e.setShotRecord(0, 128, 0, 50, 1, 0, 2.5); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 51;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 21;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 9;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 1.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 1.8;
        }
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
          speed: reg(0x2721) /* f1 */,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x282 /* RAMP_HOME */,
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 2.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 11); // op 135
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 2.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 3;
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
          rings: reg(0x2711) /* i1 */,
          speed: reg(0x2721) /* f1 */,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        if (e.i0 <= 8) {
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
        e.setAnm(0);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(8); // op 160
        e.movePolar(30, 4, 0, 3);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 2);
        e.callSubAlloc(0, 13); // op 135
        e.ci1 = 3;
        e.setHeadingVel(0.001571);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 61;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 21;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 19;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 15;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 1.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.174533;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.349066;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.392699;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.448799;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 1,
          angle: 0,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        yield e.delay(e.i0);
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
        e.removeAllBullets();
        e.enemyFunc95(); // op 95
        return;
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 28); // op 134
        e.setRelPos(416, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(17, 1); // op 126
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

export function* sub_17(e: EnemyCtx): Generator<number, void, void> {
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
        e.clearScriptFlags(16);
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setMisc144(10, 5); // op 144
        e.setLives(15900);
        e.eclSetLives(4);
        e.setMisc136(5, 0); // op 136
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(19); // op 130
        e.setSpellTimer(2400, 28); // op 134
        e.setPhase(0, 2000, 28); // op 133
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
        pc = 7;
        break;
      }
      case 7: {
        e.autoAnm();
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 4;
        }
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 1,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedTurnedRing', // aim 4 of 96..104
          type: 11,
          color: 15,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.3,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 100
        e.ci0 = 24;
        e.f0 = 3.141593;
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildRelative(18, 0, 0, 600, -2, 100);
        e.f1 = e.randF32S * 0.024544;
        e.f0 += 0.19635;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield 4;
        pc = 9;
        break;
      }
      case 9: {
        if (--e.ci0 > 0) {
          pc = 8;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.moveBounce(80, 4, 1); // op 67
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
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
          e.f0 = 6;
        }
        yield 60;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: 0.19634955,
          angleStep: -0.012566371,
          transform: 0x202,
        }); // op 98
        yield 8;
        pc = 12;
        break;
      }
      case 12: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: 0.09817477,
          angleStep: -0.012566371,
          transform: 0x202,
        }); // op 98
        yield 8;
        pc = 13;
        break;
      }
      case 13: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: 0,
          angleStep: -0.012566371,
          transform: 0x202,
        }); // op 98
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 4;
        }
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 1,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedTurnedRing', // aim 4 of 96..104
          type: 11,
          color: 15,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.3,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 100
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 3.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 28;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 4;
        }
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 2,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 98
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedTurnedRing', // aim 4 of 96..104
            type: 11,
            color: 15,
            count: reg(0x2710) /* i0 */,
            rings: reg(0x2711) /* i1 */,
            speed: reg(0x2720) /* f0 */,
            speed2: 1.3,
            angle: 0,
            angleStep: 0.049087387,
            transform: 0x202,
          }); // op 100
        }
        yield 2;
        pc = 14;
        break;
      }
      case 14: {
        e.autoAnm();
        e.ci0 = 24;
        e.f0 = 0;
        pc = 15;
        break;
      }
      case 15: {
        e.linkChildRelative(18, 0, 0, 600, -2, 100);
        e.f1 = e.randF32S * 0.024544;
        e.f0 -= 0.19635;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield 4;
        pc = 16;
        break;
      }
      case 16: {
        if (--e.ci0 > 0) {
          pc = 15;
          break;
        }
        pc = 17;
        break;
      }
      case 17: {
        e.moveBounce(80, 4, 1); // op 67
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
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
          e.f0 = 6;
        }
        yield 200;
        pc = 18;
        break;
      }
      case 18: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: -0.19634955,
          angleStep: 0.012566371,
          transform: 0x202,
        }); // op 98
        yield 8;
        pc = 19;
        break;
      }
      case 19: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: -0.09817477,
          angleStep: 0.012566371,
          transform: 0x202,
        }); // op 98
        yield 8;
        pc = 20;
        break;
      }
      case 20: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2710) /* i0 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: 0,
          angleStep: 0.012566371,
          transform: 0x202,
        }); // op 98
        yield 2;
        pc = 21;
        break;
      }
      case 21: {
        pc = 7;
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
        e.setAnm(61);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.f6 = 0.033333;
        e.f7 = 5.5;
        e.setHeadingSpeed(e.f0, 3.2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        e.setTimeout(2);
        yield 6000;
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
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc136(5, 0); // op 136
        e.setTimeout(-1);
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        if (e.playerX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.i7 = 1;
        e.moveRelative(90, 4, 288, 128); // op 64
        pc = 3;
        break;
      }
      case 2: {
        e.i7 = 0;
        e.moveRelative(90, 4, 96, 128); // op 64
        pc = 3;
        break;
      }
      case 3: {
        e.setLives(15000);
        e.eclSetLives(3);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(25); // op 130
        e.setSpellTimer(2700, 30); // op 134
        e.setPhase(0, 2000, 30); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.callSubAlloc(3, 21); // op 135
        yield 120;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 20;
        pc = 5;
        break;
      }
      case 5: {
        e.setMotionClamp(-128, 48, 512, 128);
        e.setMisc178(80, 0, 1067030938); // op 178
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 4;
        }
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 1,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedTurnedRing', // aim 4 of 96..104
          type: 11,
          color: 15,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.3,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 100
        e.ci0 = 10;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -1.570796;
        e.f4 = e.randF32S * 0.03927;
        e.f0 += e.f4;
        e.f1 = e.randF32S * 0.4;
        e.f1 += 1.7;
        if (e.posX <= 16) {
          pc = 10;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        if (e.posX >= 368) {
          pc = 10;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.ci1 = e.ci0 % 3;
        if (e.ci1 != 0) {
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.linkChildRelative(20, 0, 0, 300, -2, 100);
        pc = 10;
        break;
      }
      case 10: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 1.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 1.5;
        }
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: reg(0x2721) /* f1 */,
          angle: 3.1415927,
          angleStep: -3.1415927,
          transform: 0x2,
        }); // op 104
        yield 8;
        pc = 11;
        break;
      }
      case 11: {
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 2;
        }
        yield 80;
        pc = 13;
        break;
      }
      case 13: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 1,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedTurnedRing', // aim 4 of 96..104
          type: 11,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.3,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 100
        e.setMisc178(120, 0, 1065353216); // op 178
        e.ci0 = 15;
        pc = 14;
        break;
      }
      case 14: {
        e.f0 = -1.570796;
        e.f4 = e.randF32S * 0.03927;
        e.f0 += e.f4;
        e.f1 = e.randF32S * 0.4;
        e.f1 += 1.7;
        if (e.posX <= 16) {
          pc = 18;
          break;
        }
        pc = 15;
        break;
      }
      case 15: {
        if (e.posX >= 368) {
          pc = 18;
          break;
        }
        pc = 16;
        break;
      }
      case 16: {
        e.ci1 = e.ci0 % 3;
        if (e.ci1 != 0) {
          pc = 18;
          break;
        }
        pc = 17;
        break;
      }
      case 17: {
        e.linkChildRelative(20, 0, 0, 300, -2, 100);
        pc = 18;
        break;
      }
      case 18: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 1.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 1.5;
        }
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: reg(0x2721) /* f1 */,
          angle: 3.1415927,
          angleStep: -3.1415927,
          transform: 0x2,
        }); // op 104
        yield 8;
        pc = 19;
        break;
      }
      case 19: {
        if (--e.ci0 > 0) {
          pc = 14;
          break;
        }
        pc = 20;
        break;
      }
      case 20: {
        pc = 5;
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
        e.setAnm(64);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.f6 = 0.066667;
        e.f7 = 8;
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        e.setTimeout(2);
        yield 6000;
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
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        if (e.posX > -32) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.posX += 448;
        e.originX += 448;
        yield e.delay(4);
        yield 1;
        pc = 4;
        break;
      }
      case 2: {
        if (e.posX < 416) {
          yield 1;
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.originX -= 448;
        e.posX -= 448;
        yield e.delay(4);
        yield 1;
        pc = 4;
        break;
      }
      case 4: {
        pc = 0;
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
        e.setScriptFlags(4);
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc147(1); // op 147
        e.setBossPresent(-1);
        e.moveRelative(60, 1, 256, -32); // op 64
        e.spawnItemRandom(10); // op 142
        e.spawnItemBatch(7); // op 168
        e.clearMotionClamp();
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(-1);
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
        e.setScriptFlags(4);
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc147(1); // op 147
        e.moveRelative(60, 1, 256, -32); // op 64
        e.clearMotionClamp();
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(-1);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_24(e: EnemyCtx): Generator<number, void, void> {
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
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 28); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_25(e);
        pc = 2;
        break;
      }
      case 2: {
        pc = 2;
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
        e.setScriptFlags(4);
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc136(5, 0); // op 136
        e.setTimeout(-1);
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        e.moveRelative(90, 4, 288, 128); // op 64
        e.setLives(14000);
        e.eclSetLives(2);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(39); // op 130
        e.setSpellTimer(3000, 39); // op 134
        e.setPhase(0, 2000, 39); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.callSubAlloc(3, 21); // op 135
        e.setMotionClamp(-128, 48, 512, 164);
        e.setSpellHP(5, 15, 0, 1); // op 157
        yield 180;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = 20;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randF32S * 0.261799;
        e.f1 = 8.2;
        e.i0 = 90;
        e.movePolar(90, 4, e.f0, 8);
        yield 90;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        if (e.posX >= 64) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.moveRelative(20, 4, 64, e.posY); // op 64
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 14;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f4 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f4 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f4 = 4.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f4 = 5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.017453;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.05236;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.05712;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.062832;
        }
        e.f6 = 0;
        e.f5 = 0;
        yield 20;
        pc = 6;
        break;
      }
      case 6: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 2,
          count: reg(0x2716) /* i6 */,
          rings: 2,
          speed: 2,
          speed2: 0.9,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 5,
          speed: 5,
          speed2: 0.9,
          angle: 0,
          angleStep: 0.007853982,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 5,
          speed: 5,
          speed2: 0.9,
          angle: 0,
          angleStep: -0.007853982,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 7;
        break;
      }
      case 7: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 9;
        break;
      }
      case 9: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f0 = e.randF32S * 0.261799;
        e.f0 += 3.141593;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = 8.2;
        e.i0 = 120;
        e.movePolar(90, 4, e.f0, 8);
        yield 90;
        pc = 12;
        break;
      }
      case 12: {
        e.nop(); // op 0
        if (e.posX <= 320) {
          pc = 14;
          break;
        }
        pc = 13;
        break;
      }
      case 13: {
        e.moveRelative(20, 4, 320, e.posY); // op 64
        pc = 14;
        break;
      }
      case 14: {
        e.f6 = 0;
        e.f5 = 0;
        yield 20;
        pc = 15;
        break;
      }
      case 15: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 15,
          count: reg(0x2716) /* i6 */,
          rings: 2,
          speed: 2,
          speed2: 0.9,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 7,
          color: 7,
          count: 1,
          rings: 5,
          speed: 5,
          speed2: 0.9,
          angle: 0,
          angleStep: 0.007853982,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 7,
          color: 7,
          count: 1,
          rings: 5,
          speed: 5,
          speed2: 0.9,
          angle: 0,
          angleStep: -0.007853982,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 16;
        break;
      }
      case 16: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 17;
        break;
      }
      case 17: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 18;
        break;
      }
      case 18: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 19;
        break;
      }
      case 19: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 20;
        break;
      }
      case 20: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_26(e: EnemyCtx): Generator<number, void, void> {
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
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc136(5, 0); // op 136
        e.setTimeout(-1);
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        e.setMisc147(2); // op 147
        e.moveRelative(90, 4, 288, 128); // op 64
        e.setLives(14000);
        e.eclSetLives(1);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(41); // op 130
        e.setSpellTimer(3120, 41); // op 134
        e.setPhase(0, 2000, 41); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.callSubAlloc(3, 21); // op 135
        e.setMotionClamp(-128, 48, 512, 164);
        e.setSpellHP(5, 15, 0, 1); // op 157
        yield 180;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = 20;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 12;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 28;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 36;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randF32S * 0.261799;
        e.f1 = 8.2;
        e.i0 = 90;
        e.movePolar(90, 4, e.f0, 8);
        yield 90;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        if (e.posX >= 64) {
          yield 20;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.moveRelative(20, 4, 64, e.posY); // op 64
        yield 20;
        pc = 5;
        break;
      }
      case 5: {
        e.ci0 = 12;
        e.f0 = e.randAngle;
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(18, 0, 0, 300, -2, 100);
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 14;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f4 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f4 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f4 = 4.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f4 = 5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.017453;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.05236;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.05712;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.062832;
        }
        e.f6 = 0;
        e.f5 = 0;
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 2,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: 3.1415927,
          angleStep: -3.1415927,
          transform: 0x202,
        }); // op 104
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 5,
          speed: 5,
          speed2: 0.9,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 96
        e.f6 += e.f7;
        e.f5 -= e.f7;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 9;
        break;
      }
      case 9: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 12;
        break;
      }
      case 12: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 2,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f0 = e.randF32S * 0.261799;
        e.f0 += 3.141593;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = 8.2;
        e.i0 = 120;
        e.movePolar(90, 4, e.f0, 8);
        e.ci3 += 2;
        yield 90;
        pc = 13;
        break;
      }
      case 13: {
        e.nop(); // op 0
        if (e.posX <= 320) {
          yield 20;
          pc = 15;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        e.moveRelative(20, 4, 320, e.posY); // op 64
        yield 20;
        pc = 15;
        break;
      }
      case 15: {
        e.ci0 = 12;
        e.f0 = e.randAngle;
        pc = 16;
        break;
      }
      case 16: {
        e.linkChildRelative(18, 0, 0, 300, -2, 100);
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 16;
          break;
        }
        pc = 17;
        break;
      }
      case 17: {
        e.f6 = 0;
        e.f5 = 0;
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 2,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: 3.1415927,
          angleStep: -3.1415927,
          transform: 0x202,
        }); // op 104
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 7,
          count: 1,
          rings: 5,
          speed: 5,
          speed2: 0.9,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 96
        e.f6 += e.f7;
        e.f5 -= e.f7;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 18;
        break;
      }
      case 18: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 19;
        break;
      }
      case 19: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 20;
        break;
      }
      case 20: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.f6 += e.f7;
        e.f5 -= e.f7;
        yield 10;
        pc = 21;
        break;
      }
      case 21: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x202,
        }); // op 98
        yield 10;
        pc = 22;
        break;
      }
      case 22: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2725) /* f5 */,
          transform: 0x202,
        }); // op 98
        e.ci3 += 2;
        pc = 2;
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(8);
        e.eclSetLives(0);
        e.setBossPresent(0);
        e.setLives(400);
        e.setLifeBarSlice(0, 0, e.maxHp, 16752800);
        e.complexSetup(1); // op 176
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
        e.setDeathCallbackSub(59); // op 130
        yield* sub_54(e);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_28(e: EnemyCtx): Generator<number, void, void> {
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
        e.setMotionClamp(32, 48, 352, 416);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(19); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 19); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 208); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('夢符「二重結界」', '博麗霊夢', 54, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('夢符「二重結界」', '博麗霊夢', 55, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('夢境「二重大結界」', '博麗霊夢', 56, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('夢境「二重大結界」', '博麗霊夢', 57, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setMisc136(3, 0); // op 136
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setTimeout(4);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setMisc136(20, 0); // op 136
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setTimeout(21);
        }
        e.playSfx(13);
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.setAnmScripts6Alt(0); // op 59
        e.f0 = 0;
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 29); // op 135
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 1.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 1.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 1.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 1.06;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 1.06;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 1.06;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 1.06;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.ci0 = 7;
        e.ci1 = e.randU31 % 5;
        e.ci0 += e.ci1;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 2,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.034907;
        e.f0 = normalizeAngle(e.f0);
        yield 1;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.ci0 = 4;
        e.ci1 = e.randU31 % 4;
        e.ci0 += e.ci1;
        pc = 7;
        break;
      }
      case 7: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 1,
          count: 2,
          rings: 1,
          speed: reg(0x2722) /* f2 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.034907;
        e.f0 = normalizeAngle(e.f0);
        yield 1;
        pc = 8;
        break;
      }
      case 8: {
        if (--e.ci0 > 0) {
          pc = 7;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_29(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 400; // the script starts at frame 400
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
          e.i0 = 60;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 30;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 7;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 10;
        pc = 2;
        break;
      }
      case 2: {
        e.playSfx(25);
        e.f0 = e.randF32 * 0.785398;
        e.f0 += 0.392699;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 11,
          color: 15,
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: 0,
          angleStep: reg(0x2720) /* f0 */,
          transform: 0x2,
        }); // op 96
        yield 3;
        pc = 3;
        break;
      }
      case 3: {
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        yield e.delay(e.i0);
        if (e.i0 >= 30) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.i0--;
        pc = 6;
        break;
      }
      case 6: {
        pc = 1;
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
        e.setMotionClamp(-128, 48, 512, 128);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(22); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2700, 22); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('霊符「夢想封印　散」', '博麗霊夢', 58, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('霊符「夢想封印　散」', '博麗霊夢', 59, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('散霊「夢想封印　寂」', '博麗霊夢', 60, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('散霊「夢想封印　寂」', '博麗霊夢', 61, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.setSpellTimer(2700, 23); // op 134
        e.callSubAlloc(3, 21); // op 135
        e.nop(); // op 0
        e.f0 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 16;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 16;
        }
        pc = 2;
        break;
      }
      case 2: {
        yield* sub_31(e);
        pc = 3;
        break;
      }
      case 3: {
        e.autoAnm();
        e.ci0 = 16;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 35;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 11,
          color: 15,
          count: reg(0x2710) /* i0 */,
          rings: 4,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.8,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 98
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = e.randAngle;
        e.f1 = e.randF32 * 3;
        e.f1 += 3;
        e.linkChildRelative(32, 0, 0, 30, 1, 100);
        e.f0 -= 0.19635;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 11,
          color: 2,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 5.5,
          speed2: 0.8,
          angle: 3.1415927,
          angleStep: -3.1415927,
          transform: 0x202,
        }); // op 104
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 7,
          color: 1,
          count: reg(0x2736) /* ci2 */,
          rings: 1,
          speed: 5,
          speed2: 0.8,
          angle: 3.1415927,
          angleStep: -3.1415927,
          transform: 0x2,
        }); // op 104
        yield 2;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.moveBounce(80, 4, 1); // op 67
        e.ci3 += 1;
        yield 60;
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
        e.setAnm(63);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 6000;
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
        e.setScriptFlags(3);
        e.setMisc177(e.maxHp); // op 177
        e.setMotionClamp(-128, 48, 512, 128);
        e.setSpellHP(0, 15, 0, 1); // op 157
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(26); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2700, 26); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('夢符「封魔陣」', '博麗霊夢', 62, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('夢符「封魔陣」', '博麗霊夢', 63, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神技「八方鬼縛陣」', '博麗霊夢', 64, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神技「八方龍殺陣」', '博麗霊夢', 65, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.callSubAlloc(3, 21); // op 135
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 0.19635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 0.19635;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.392699;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 0.392699;
        }
        e.callSubAlloc(0, 36); // op 135
        yield 240;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        yield 2;
        pc = 3;
        break;
      }
      case 3: {
        e.autoAnm();
        e.ci0 = 12;
        e.f0 = 0;
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = 2;
        e.linkChildRelative(38, 0, 0, 30, 1, 100);
        e.f1 = e.randF32S * 0.024544;
        e.f0 -= 0.261799;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield 2;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.f5 = 7;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 15;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 5;
        }
        yield e.delay(e.ci2);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) yield* sub_37(e);
        pc = 7;
        break;
      }
      case 7: {
        e.f5 = 6.5;
        yield e.delay(e.ci2);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) yield* sub_37(e);
        pc = 8;
        break;
      }
      case 8: {
        e.f5 = 6;
        yield e.delay(e.ci2);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) yield* sub_37(e);
        pc = 9;
        break;
      }
      case 9: {
        e.f5 = 5.5;
        yield e.delay(e.ci2);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) yield* sub_37(e);
        pc = 10;
        break;
      }
      case 10: {
        e.f5 = 5;
        yield e.delay(e.ci2);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) yield* sub_37(e);
        pc = 11;
        break;
      }
      case 11: {
        e.f5 = 4.5;
        yield e.delay(e.ci2);
        yield* sub_37(e);
        pc = 12;
        break;
      }
      case 12: {
        pc = 3;
        break;
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
        e.setShotRecord(4, 524288, 0, 25, -1, -1, -1); // op 111
        e.setShotRecord(0, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.5, 0.698132); // op 111
        e.setShotRecord(2, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.5, 0.698132); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 3,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20222 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.5, 0.349066); // op 111
        e.setShotRecord(2, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.5, 0.349066); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 3,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.5, 0); // op 111
        e.setShotRecord(2, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.5, 0); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 3,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.5, -0.349066); // op 111
        e.setShotRecord(2, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.5, -0.349066); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 3,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.5, -0.698132); // op 111
        e.setShotRecord(2, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.5, -0.698132); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 3,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
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
        e.setShotRecord(4, 524288, 0, 25, -1, -1, -1); // op 111
        e.setShotRecord(0, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.4, 2.094395); // op 111
        e.setShotRecord(2, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.4, 2.094395); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 5.2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20222 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.4, 1.047198); // op 111
        e.setShotRecord(2, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.4, 1.047198); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 13,
          count: 8,
          rings: 1,
          speed: 5.2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.4, 0); // op 111
        e.setShotRecord(2, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.4, 0); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 5.2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.4, -1.047198); // op 111
        e.setShotRecord(2, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.4, -1.047198); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 13,
          count: 8,
          rings: 1,
          speed: 5.2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
        e.setShotRecord(0, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 0, 1, -1, -0.4, -2.094395); // op 111
        e.setShotRecord(2, 131072, 0, 18, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 1, -1, -0.4, -2.094395); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 8,
          rings: 1,
          speed: 5.2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0x20022 /* CURL | WAIT */,
        }); // op 99
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
        e.f1 = 0;
        e.ci0 = 20;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 12;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 12;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 8;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) yield* sub_34(e);
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(HARD | LUNATIC | EXTRA)) yield* sub_35(e);
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.ci1);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.ci0 = 20;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.019635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.019635;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = -0.019635;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = -0.019635;
        }
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) yield* sub_34(e);
        pc = 6;
        break;
      }
      case 6: {
        if (e.isDiff(HARD | LUNATIC | EXTRA)) yield* sub_35(e);
        pc = 7;
        break;
      }
      case 7: {
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.ci1);
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.ci0 = 40;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = -0.019635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = -0.019635;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.019635;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.019635;
        }
        pc = 9;
        break;
      }
      case 9: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) yield* sub_34(e);
        pc = 10;
        break;
      }
      case 10: {
        if (e.isDiff(HARD | LUNATIC | EXTRA)) yield* sub_35(e);
        pc = 11;
        break;
      }
      case 11: {
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.ci1);
        if (--e.ci0 > 0) {
          pc = 9;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.ci0 = 20;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.019635;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.019635;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = -0.019635;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = -0.019635;
        }
        pc = 13;
        break;
      }
      case 13: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) yield* sub_34(e);
        pc = 14;
        break;
      }
      case 14: {
        if (e.isDiff(HARD | LUNATIC | EXTRA)) yield* sub_35(e);
        pc = 15;
        break;
      }
      case 15: {
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.ci1);
        if (--e.ci0 > 0) {
          pc = 13;
          break;
        }
        pc = 16;
        break;
      }
      case 16: {
        pc = 4;
        break;
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
        e.setShotRecord(0, 64, 0, 50, 1, 0, 0); // op 111
        e.setShotRecord(2, 16384, 0, 6, 2, -1, -1); // op 111
        if (e.difficulty > 242) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(3, 131072, 0, 60, -1, -1, -1); // op 111
        pc = 3;
        break;
      }
      case 2: {
        e.setShotRecord(3, 131072, 0, 20, -1, -1, -1); // op 111
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(4, 524288, 0, 25, -1, -1, -1); // op 111
        e.f0 = e.timer;
        e.f1 = e.randF32S * 0.05236;
        e.f0 += e.f1;
        e.f1 = e.f0;
        e.f0 += 0.05236;
        e.f1 -= 0.05236;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 50;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 50;
        }
        e.ci0 = 15;
        if (e.isDiff(EASY | EXTRA)) {
          e.f3 = 1.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f3 = 1.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f3 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f3 = 1.8;
        }
        e.playSfx(15);
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(1, 131072, 0, e.i0, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 0, e.f3); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 15,
          count: 2,
          rings: 1,
          speed: reg(0x2725) /* f5 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: -3.1415927,
          transform: 0xa4042 /* RAMP_TURN | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 15,
          count: 2,
          rings: 1,
          speed: reg(0x2725) /* f5 */,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: -3.1415927,
          transform: 0xa4042 /* RAMP_TURN | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.i0 += 3;
        e.f0 += 0.10472;
        e.f1 -= 0.10472;
        e.f3 -= 0.053333;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
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
        e.setAnm(61);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.f6 = 0.038333;
        e.f7 = 4;
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        e.setTimeout(2);
        yield 6000;
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearAllBullets();
        e.clearScriptFlags(3);
        e.i0 = e.maxHp;
        yield 40;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(-1);
        e.setMisc126(33, 1); // op 126
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(40); // op 130
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(33, 1); // op 126
        yield 1;
        pc = 2;
        break;
      }
      case 2: {
        e.setBossPresent(0);
        yield 100;
        pc = 3;
        break;
      }
      case 3: {
        pc = 3;
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
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(33, 1); // op 126
        e.setLives(14000);
        e.maxHp = 2000;
        e.setLifeBarSlice(0, 0, 2000, 16752800);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(0);
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        pc = 2;
        break;
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
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(45); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 45); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('霊符「夢想封印　集」', '博麗霊夢', 66, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('霊符「夢想封印　集」', '博麗霊夢', 67, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('回霊「夢想封印　侘」', '博麗霊夢', 68, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('回霊「夢想封印　侘」', '博麗霊夢', 69, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.playSfx(13);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.i1 = 0;
        e.f0 = 1.570796;
        e.i0 = 61;
        e.linkChildAttached(42, 0, 0, 5000, 1, 100);
        if (e.isDiff(EASY | EXTRA)) {
          e.i2 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i2 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i2 = 16;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i2 = 20;
        }
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 65;
        e.linkChildAttached(42, 0, 0, 3000, 1, 100);
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 64;
        e.linkChildAttached(42, 0, 0, 5000, 1, 100);
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 68;
        e.linkChildAttached(42, 0, 0, 3000, 1, 100);
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 63;
        e.linkChildAttached(42, 0, 0, 5000, 1, 100);
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 67;
        e.linkChildAttached(42, 0, 0, 3000, 1, 100);
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 62;
        e.linkChildAttached(42, 0, 0, 5000, 1, 100);
        e.i1 += e.i2;
        e.f0 += 0.785398;
        e.i0 = 62;
        e.linkChildAttached(42, 0, 0, 3000, 1, 100);
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(120, 0, 0.5); // op 67
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 7,
            color: 7,
            count: 32,
            rings: 1,
            speed: 1.5,
            speed2: 0.8,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 7,
            color: 7,
            count: 36,
            rings: 1,
            speed: 2,
            speed2: 0.8,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 7,
            color: 7,
            count: 48,
            rings: 1,
            speed: 2.5,
            speed2: 0.8,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 60;
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
        e.setAnm(e.i0);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.moveArc(100, e.f0, -0.15708, 0.64);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 99;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(6000, -0.07854, 0);
        e.callSubAlloc(0, 43); // op 135
        e.callSubAlloc(1, 44); // op 135
        yield 6000;
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
        e.f0 = -0.07854;
        e.f1 = 0;
        pc = 1;
        break;
      }
      case 1: {
        e.f2 = Math.cos(e.f1);
        e.orbitAngleVel = e.f2 * -0.07854;
        e.f1 += 0.01309;
        e.f1 = normalizeAngle(e.f1);
        yield 1;
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
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.i1 += 60;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 += 10;
        }
        yield e.delay(e.i1);
        e.setShotRecord(0, 8192, 1, 200, -1, -1, -1); // op 111
        e.setShotRecord(1, 128, 1, 50, 1, 0, 0); // op 111
        e.setShotRecord(2, 16384, 0, 3, 15, -1, -1); // op 111
        e.setShotRecord(3, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(4, 16384, 0, 3, 2, -1, -1); // op 111
        e.setShotRecord(5, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(6, 524288, 0, 25, -1, -1, -1); // op 111
        e.setShotRecord(7, 16384, 0, 11, 2, -1, -1); // op 111
        e.setShotRecord(8, 128, 0, 1, 1, 0, 5.5); // op 111
        e.setShotRecord(9, 128, 0, 50, 1, 0, 0); // op 111
        e.setShotRecord(10, 16384, 0, 3, 2, -1, -1); // op 111
        e.setShotRecord(11, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(12, 16384, 0, 3, 4, -1, -1); // op 111
        e.setShotRecord(13, 524288, 0, 25, -1, -1, -1); // op 111
        e.setShotRecord(14, 131072, 0, 30, -1, -1, -1); // op 111
        e.setShotRecord(15, 16384, 0, 11, 4, -1, -1); // op 111
        e.setShotRecord(16, 128, 0, 1, 1, 0, 2); // op 111
        e.i1 = 200;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 11,
            color: 15,
            count: 5,
            rings: 5,
            speed: 7,
            speed2: 0.8,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.049087387,
            transform: 0xa6282 /* RAMP_HOME | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 97
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 11,
            color: 15,
            count: 1,
            rings: 5,
            speed: 6.6,
            speed2: 0.8,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.049087387,
            transform: 0xa6282 /* RAMP_HOME | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 97
        }
        yield e.delay(e.i1);
        if (e.i1 <= 130) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i1 -= 10;
        pc = 3;
        break;
      }
      case 3: {
        pc = 1;
        break;
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
        e.setSpellHP(5, 15, 0, 1); // op 157
        e.setLives(2700);
        e.eclSetLives(0);
        e.spawnItemRandom(8); // op 142
        e.spawnItemBatch(5); // op 168
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        e.callSubAlloc(3, 21); // op 135
        e.setSpellTimer(99999, 53); // op 134
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(53); // op 130
        e.setMisc160(120); // op 160
        e.endSpell();
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_46(e);
        return;
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
        e.clearMotionClamp();
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 53); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('境界「二重弾幕結界」', '博麗霊夢', 70, 0, 25000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('境界「二重弾幕結界」', '博麗霊夢', 71, 0, 25000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('大結界「博麗弾幕結界」', '博麗霊夢', 72, 0, 25000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('大結界「博麗弾幕結界」', '博麗霊夢', 73, 0, 25000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(480); // op 160
        e.setMisc136(6, 0); // op 136
        e.setTimeout(7);
        e.playSfx(13);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.setMotionClamp(62, 30, 322, 290);
        e.i1 = 0;
        e.f0 = 2.159845;
        e.i0 = 61;
        e.linkChildRelative(47, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 65;
        e.linkChildRelative(48, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 64;
        e.linkChildRelative(47, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 68;
        e.linkChildRelative(48, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 63;
        e.linkChildRelative(47, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 67;
        e.linkChildRelative(48, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 62;
        e.linkChildRelative(47, 0, 0, 5000, 1, 100);
        e.f0 += 0.785398;
        e.i0 = 66;
        e.linkChildRelative(48, 0, 0, 5000, 1, 100);
        e.f0 = 0;
        yield 250;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(120, 0, 0.5); // op 67
        if (e.hpRatio >= 64) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 11,
          color: 2,
          count: 5,
          rings: 1,
          speed: 2.2,
          speed2: 0.9,
          angle: 0,
          angleStep: 0.09817477,
          transform: 0x2202 /* HOLD */,
        }); // op 96
        pc = 6;
        break;
      }
      case 6: {
        yield e.delay(120);
        pc = 4;
        break;
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
        e.setAnm(e.i0);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.moveArc(100, e.f0, -0.031416, 0.24);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 99;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(6000, 0, 0);
        e.callSubAlloc(1, 49); // op 135
        yield 180;
        pc = 3;
        break;
      }
      case 3: {
        e.setAccel(6000, -0.004189, 0);
        e.callSubAlloc(2, 52); // op 135
        yield 6000;
        pc = 4;
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
        e.setAnm(e.i0);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.moveArc(100, e.f0, 0.031416, 0.32);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 99;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(6000, 0, 0);
        e.callSubAlloc(1, 50); // op 135
        yield 280;
        pc = 3;
        break;
      }
      case 3: {
        e.setAccel(6000, 0.004488, 0);
        e.callSubAlloc(2, 51); // op 135
        yield 6000;
        pc = 4;
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
        e.i1 += 60;
        yield e.delay(e.i1);
        e.setShotRecord(0, 8192, 1, 240, -1, -1, -1); // op 111
        e.i1 = 200;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f0 = e.orbitAngle + 3.141593;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = e.orbitAngle + 3.141593;
        }
        e.f0 = normalizeAngle(e.f0);
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 15,
            count: 1,
            rings: 1,
            speed: 1.2,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 15,
            count: 1,
            rings: 1,
            speed: 1.5,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 15,
            count: 2,
            rings: 1,
            speed: 1.6,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 15,
            count: 2,
            rings: 1,
            speed: 1.7,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        yield 5;
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
        e.i1 += 60;
        yield e.delay(e.i1);
        e.setShotRecord(0, 8192, 1, 240, -1, -1, -1); // op 111
        e.i1 = 200;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 3.141593;
        e.f0 = normalizeAngle(e.f0);
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.2,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 2,
            count: 2,
            rings: 1,
            speed: 1.5,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 2,
            count: 2,
            rings: 1,
            speed: 1.6,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: 2,
            count: 3,
            rings: 1,
            speed: 1.7,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        yield 5;
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
        e.setShotRecord(0, 8192, 1, 300, -1, -1, -1); // op 111
        yield e.delay(360);
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 3.141593;
        e.f0 = normalizeAngle(e.f0);
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 1,
            color: 15,
            count: 2,
            rings: 1,
            speed: 1,
            speed2: 0.8,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 1.0471976,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 1,
            color: 15,
            count: 2,
            rings: 1,
            speed: 1,
            speed2: 0.8,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 1.0471976,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 1,
            color: 15,
            count: 4,
            rings: 1,
            speed: 1,
            speed2: 0.8,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 1.0471976,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        yield 90;
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
        e.setShotRecord(0, 8192, 1, 300, -1, -1, -1); // op 111
        yield e.delay(1200);
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 3.141593;
        e.f0 = normalizeAngle(e.f0);
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 1,
            color: 2,
            count: 2,
            rings: 1,
            speed: 0.8,
            speed2: 0.8,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 1,
            color: 2,
            count: 3,
            rings: 1,
            speed: 0.8,
            speed2: 0.8,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0.62831855,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 1,
            color: 2,
            count: 4,
            rings: 1,
            speed: 0.8,
            speed2: 0.8,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 1.0471976,
            transform: 0x2202 /* HOLD */,
          }); // op 97
        }
        yield 120;
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
        e.setMisc136(5, 0); // op 136
        e.setTimeout(-1);
        yield* sub_58(e);
        return;
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
        e.setSpellHP(5, 15, 0, 1); // op 157
        e.clearMotionClamp();
        e.clearScriptFlags(18);
        e.callSubAlloc(3, 57); // op 135
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3900, 59); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('神霊「夢想封印　瞬」', '博麗霊夢', 74, 0, 25000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神霊「夢想封印　瞬」', '博麗霊夢', 75, 0, 25000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神霊「夢想封印　瞬」', '博麗霊夢', 76, 0, 25000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(2100); // op 160
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = -2.748893;
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        e.movePolar(200, 4, e.f0, 6.5);
        e.callSubAlloc(0, 55); // op 135
        yield 200;
        pc = 4;
        break;
      }
      case 4: {
        e.movePolar(30, 4, e.randAngle, 3);
        e.callSubAlloc(0, -1); // op 135
        yield 30;
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = -0.392699;
        yield 30;
        pc = 6;
        break;
      }
      case 6: {
        e.movePolar(250, 4, e.f0, 7.5);
        e.callSubAlloc(0, 55); // op 135
        yield 250;
        pc = 7;
        break;
      }
      case 7: {
        e.movePolar(30, 4, e.randAngle, 3);
        e.callSubAlloc(0, -1); // op 135
        yield 30;
        pc = 8;
        break;
      }
      case 8: {
        e.f0 = 0.392699;
        yield* sub_31(e);
        pc = 9;
        break;
      }
      case 9: {
        e.movePolar(200, 4, e.timer, 3);
        e.callSubAlloc(0, 56); // op 135
        yield 200;
        pc = 10;
        break;
      }
      case 10: {
        e.movePolar(30, 4, e.randAngle, 3);
        e.callSubAlloc(0, -1); // op 135
        pc = 2;
        break;
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
        e.setShotRecord(0, 8192, 1, 200, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, 160, -1, -1, -1); // op 111
        e.setShotRecord(3, 16384, 0, 11, 2, -1, -1); // op 111
        e.setShotRecord(4, 128, 0, 1, 1, 0, 1.6); // op 111
        e.ci0 = 10;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 11,
            color: 15,
            count: 6,
            rings: 2,
            speed: 2,
            speed2: 0.8,
            angle: 3.1415927,
            angleStep: 0.19634955,
            transform: 0x262c2 /* RAMP_TURN | RAMP_HOME | HOLD | RESPRITE | WAIT */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 11,
            color: 15,
            count: 8,
            rings: 2,
            speed: 2,
            speed2: 0.8,
            angle: 3.1415927,
            angleStep: 0.19634955,
            transform: 0x262c2 /* RAMP_TURN | RAMP_HOME | HOLD | RESPRITE | WAIT */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 11,
            color: 15,
            count: 8,
            rings: 3,
            speed: 2,
            speed2: 0.8,
            angle: 3.1415927,
            angleStep: 0.19634955,
            transform: 0x262c2 /* RAMP_TURN | RAMP_HOME | HOLD | RESPRITE | WAIT */,
          }); // op 96
        }
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
        e.ci0 = 10;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 2,
            count: 2,
            rings: 4,
            speed: 5,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.028049935,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 2,
            count: 2,
            rings: 4,
            speed: 6,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.028049935,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 2,
            count: 2,
            rings: 4,
            speed: 7,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.028049935,
            transform: 0x202,
          }); // op 96
        }
        yield 8;
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
        if (e.posX > -32) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.posX += 448;
        e.originX += 448;
        yield e.delay(3);
        pc = 4;
        break;
      }
      case 2: {
        if (e.posX < 416) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.posX -= 448;
        e.originX -= 448;
        yield e.delay(3);
        pc = 4;
        break;
      }
      case 4: {
        if (e.posY > -32) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.posY += 512;
        e.originY += 512;
        yield e.delay(3);
        yield 1;
        pc = 8;
        break;
      }
      case 6: {
        if (e.posY < 480) {
          yield 1;
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.posY -= 512;
        e.originY -= 512;
        yield e.delay(3);
        yield 1;
        pc = 8;
        break;
      }
      case 8: {
        pc = 0;
        break;
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
