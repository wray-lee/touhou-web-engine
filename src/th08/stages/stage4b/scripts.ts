// Auto-generated from ecldata4b.ecl by tools/th08/ecl
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
// ecldata4b.ecl: 78 subs, translated by tools/th08/ecl
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
        e.setSpellTimer(180000, 36); // op 134
        e.setRelPos(32, -32);
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
        e.setMisc160(180); // op 160
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(4);
        e.setMisc136(5, 0); // op 136
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(22); // op 130
        e.setSpellTimer(2400, 36); // op 134
        e.setPhase(0, 2300, 36); // op 133
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
        e.f0 = 3.141593;
        e.f1 = -0.02618;
        e.f2 = 1.066667;
        e.ci2 = 0;
        e.i0 = 69;
        e.autoAnm();
        e.i1 = 2;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        e.i1 = 4;
        e.i0 = 73;
        e.linkChildAttached(21, 0, 0, 900, -2, 100);
        e.i1 = 6;
        e.i0 = 69;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        e.i1 = 10;
        e.i0 = 73;
        e.linkChildAttached(21, 0, 0, 900, -2, 100);
        e.i1 = 13;
        e.i0 = 73;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        e.callSubAlloc(0, 18); // op 135
        e.callSubAlloc(0, 19); // op 135
        yield 120;
        pc = 7;
        break;
      }
      case 7: {
        e.nop(); // op 0
        yield 300;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(80, 4, 1.5); // op 67
        yield 80;
        pc = 9;
        break;
      }
      case 9: {
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
        if (e.hpRatio >= 128) {
          yield 8;
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 6,
          count: 16,
          rings: 1,
          speed: 3.4,
          speed2: 0.9,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 6,
          count: 16,
          rings: 1,
          speed: 2.4,
          speed2: 0.9,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield 8;
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
        e.i0 = 71;
        pc = 1;
        break;
      }
      case 1: {
        if (e.parentChainCount >= 5) {
          yield 120;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i1 = 13;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        yield 120;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        if (e.parentChainCount >= 5) {
          yield 120;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.i1 = 13;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        yield 120;
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        if (e.parentChainCount >= 5) {
          yield 120;
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.i1 = 13;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        yield 120;
        pc = 7;
        break;
      }
      case 7: {
        e.nop(); // op 0
        if (e.parentChainCount >= 5) {
          yield 120;
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.i1 = 13;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        yield 120;
        pc = 9;
        break;
      }
      case 9: {
        e.nop(); // op 0
        if (e.parentChainCount >= 5) {
          yield 120;
          pc = 11;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.i1 = 13;
        e.linkChildAttached(21, 0, 0, 700, -2, 100);
        yield 120;
        pc = 11;
        break;
      }
      case 11: {
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
        e.ci0 = 15;
        e.f3 = 2.094395;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2.1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.1;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 1.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 1.6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 1.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 1.6;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.orbitAngle + e.f3;
        e.f2 = e.orbitAngle - e.f3;
        e.f1 = normalizeAngle(e.f1);
        e.f2 = normalizeAngle(e.f2);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: 1.4,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 12,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: reg(0x2716) /* i6 */,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.9,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.049087387,
            transform: 0x2,
          }); // op 99
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: reg(0x2716) /* i6 */,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.9,
            angle: reg(0x2722) /* f2 */,
            angleStep: 0.049087387,
            transform: 0x2,
          }); // op 99
        }
        yield 7;
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = e.orbitAngle + e.f3;
        e.f2 = e.orbitAngle - e.f3;
        e.f1 = normalizeAngle(e.f1);
        e.f2 = normalizeAngle(e.f2);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: 1.4,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: reg(0x2716) /* i6 */,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.9,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.049087387,
            transform: 0x2,
          }); // op 99
        }
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: reg(0x2716) /* i6 */,
          speed: reg(0x2726) /* f6 */,
          speed2: 0.9,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.049087387,
          transform: 0x2,
        }); // op 99
        yield 7;
        pc = 3;
        break;
      }
      case 3: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f3 = 2.094395;
        pc = 5;
        break;
      }
      case 5: {
        e.f1 = e.orbitAngle + e.f3;
        e.f2 = e.orbitAngle - e.f3;
        e.f3 += 0.031416;
        e.f1 = normalizeAngle(e.f1);
        e.f2 = normalizeAngle(e.f2);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: 1.4,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 12,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: reg(0x2716) /* i6 */,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.9,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.049087387,
            transform: 0x2,
          }); // op 99
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: reg(0x2716) /* i6 */,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.9,
            angle: reg(0x2722) /* f2 */,
            angleStep: 0.049087387,
            transform: 0x2,
          }); // op 99
        }
        yield 7;
        pc = 6;
        break;
      }
      case 6: {
        e.f1 = e.orbitAngle + e.f3;
        e.f2 = e.orbitAngle - e.f3;
        e.f3 += 0.031416;
        e.f1 = normalizeAngle(e.f1);
        e.f2 = normalizeAngle(e.f2);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: reg(0x2717) /* i7 */,
          speed: 1.4,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: reg(0x2716) /* i6 */,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.9,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.049087387,
            transform: 0x2,
          }); // op 99
        }
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: reg(0x2716) /* i6 */,
          speed: reg(0x2726) /* f6 */,
          speed2: 0.9,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.049087387,
          transform: 0x2,
        }); // op 99
        yield 7;
        pc = 7;
        break;
      }
      case 7: {
        pc = 5;
        break;
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
        e.setAnm(e.i0);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.moveArc(120, e.f0, e.f1, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f1, 0);
        e.f0 = e.orbitAngle;
        e.callSubAlloc(0, 20); // op 135
        yield 30000;
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
        e.setMisc136(5, 0); // op 136
        e.setTimeout(-1);
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        e.setLives(18000);
        e.eclSetLives(3);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(28); // op 130
        e.setSpellTimer(2400, 41); // op 134
        e.setPhase(0, 2400, 41); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.setMotionClamp(32, 48, 352, 160);
        e.i0 = 20;
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 3.141593;
        e.f1 = -0.006283;
        e.f2 = 1.066667;
        e.ci2 = 0;
        e.i0 = 70;
        e.autoAnm();
        e.i1 = 2;
        e.linkChildAttached(24, 0, 0, 4000, -2, 100);
        e.i1 = 4;
        e.linkChildAttached(24, 0, 0, 6000, -2, 100);
        e.i1 = 6;
        e.linkChildAttached(24, 0, 0, 4000, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(24, 0, 0, 7000, -2, 100);
        e.i1 = 13;
        e.linkChildAttached(24, 0, 0, 4000, -2, 100);
        e.f0 = 0;
        e.f1 = 0.006981;
        e.f2 = 0.533333;
        e.ci2 = 1;
        e.i0 = 74;
        e.autoAnm();
        e.i1 = 2;
        e.linkChildAttached(24, 0, 0, 4000, -2, 100);
        e.i1 = 4;
        e.linkChildAttached(24, 0, 0, 6000, -2, 100);
        e.i1 = 6;
        e.linkChildAttached(24, 0, 0, 4000, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(24, 0, 0, 7000, -2, 100);
        e.i1 = 13;
        e.linkChildAttached(24, 0, 0, 4000, -2, 100);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        yield 300;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(80, 4, 1); // op 67
        yield 80;
        pc = 4;
        break;
      }
      case 4: {
        pc = 2;
        break;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 14;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 10;
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
          e.i7 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f4 = 1.1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f4 = 1.1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f4 = 1.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f4 = 1.3;
        }
        e.f3 = 2.094395;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2711) /* i1 */,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f3 = 0;
        pc = 3;
        break;
      }
      case 3: {
        e.f1 = e.orbitAngle + e.f3;
        e.f3 -= 0.031416;
        e.f1 = normalizeAngle(e.f1);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2711) /* i1 */,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.f1 = e.orbitAngle + e.f3;
        e.f3 -= 0.031416;
        e.f1 = normalizeAngle(e.f1);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        pc = 3;
        break;
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
        e.setAnm(e.i0);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.moveArc(120, e.f0, e.f1, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f1, 0);
        e.f0 = e.orbitAngle;
        e.callSubAlloc(0, 23); // op 135
        yield 30000;
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 36); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_28(e);
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
        e.setScriptFlags(4);
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc136(5, 0); // op 136
        e.setTimeout(-1);
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        e.setLives(18000);
        e.eclSetLives(2);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(53); // op 130
        e.setSpellTimer(2400, 53); // op 134
        e.setPhase(0, 2500, 53); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.setMotionClamp(32, 48, 352, 160);
        e.setSpellHP(5, 15, 0, 1); // op 157
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 3.141593;
        e.f1 = -0.062832;
        e.f2 = 0.8;
        e.ci2 = 0;
        e.i0 = 71;
        e.i1 = 4;
        e.linkChildAttached(30, 0, 0, 6000, -2, 100);
        e.i1 = 6;
        e.linkChildAttached(30, 0, 0, 4000, -2, 100);
        e.i1 = 8;
        e.linkChildAttached(30, 0, 0, 7000, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(30, 0, 0, 7000, -2, 100);
        e.f0 = 0;
        e.f1 = 0.02618;
        e.f2 = 1.066667;
        e.ci2 = 1;
        e.i0 = 72;
        e.i1 = 13;
        e.linkChildAttached(30, 0, 0, 4000, -2, 100);
        e.i1 = 14;
        e.linkChildAttached(30, 0, 0, 4000, -2, 100);
        e.i1 = 2;
        e.linkChildAttached(30, 0, 0, 4000, -2, 100);
        e.i1 = 4;
        e.linkChildAttached(30, 0, 0, 6000, -2, 100);
        e.f0 = 0;
        e.f1 = -0.03927;
        e.f2 = 1.333333;
        e.ci2 = 2;
        e.i0 = 75;
        e.i1 = 6;
        e.linkChildAttached(30, 0, 0, 4000, -2, 100);
        e.i1 = 8;
        e.linkChildAttached(30, 0, 0, 7000, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(30, 0, 0, 7000, -2, 100);
        e.i1 = 13;
        e.linkChildAttached(30, 0, 0, 4000, -2, 100);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        yield 300;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(80, 4, 1); // op 67
        yield 80;
        pc = 4;
        break;
      }
      case 4: {
        pc = 2;
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
        e.f3 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 30;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 6;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.orbitAngle + e.f3;
        e.f3 -= 0.10472;
        e.f1 = normalizeAngle(e.f1);
        e.f3 = normalizeAngle(e.f3);
        e.f4 = e.randAngle / 300;
        e.f5 = e.randF32S * 0.001;
        e.setShotRecord(0, 32, 0, 300, -1, e.f5, e.f4); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 1.1,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x222 /* CURL */,
        }); // op 99
        yield e.delay(e.ci1);
        e.f1 = e.orbitAngle + e.f3;
        e.f3 -= 0.10472;
        e.f1 = normalizeAngle(e.f1);
        e.f3 = normalizeAngle(e.f3);
        e.f4 = e.randAngle / 300;
        e.f5 = e.randF32S * 0.001;
        e.setShotRecord(0, 32, 0, 300, -1, e.f5, e.f4); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 1.1,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x222 /* CURL */,
        }); // op 99
        yield e.delay(e.ci1);
        pc = 1;
        break;
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
        e.setAnm(e.i0);
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.moveArc(120, e.f0, e.f1, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f1, 0);
        e.f0 = e.orbitAngle;
        e.callSubAlloc(0, 29); // op 135
        yield 30000;
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
        e.setScriptFlags(4);
        e.clearScriptFlags(16);
        e.endSpell();
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        e.setMisc147(2); // op 147
        e.setLives(18000);
        e.eclSetLives(1);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(55); // op 130
        e.setSpellTimer(2400, 55); // op 134
        e.setPhase(0, 2000, 55); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.setMotionClamp(32, 48, 352, 160);
        e.setSpellHP(5, 15, 0, 1); // op 157
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 3.141593;
        e.f1 = -0.10472;
        e.f2 = 0.666667;
        e.ci2 = 0;
        e.i0 = 69;
        e.i1 = 4;
        e.linkChildAttached(33, 0, 0, 1000, -2, 100);
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        e.i1 = 6;
        e.linkChildAttached(33, 0, 0, 3000, -2, 100);
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        e.i1 = 8;
        e.linkChildAttached(33, 0, 0, 1000, -2, 100);
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        e.i1 = 10;
        e.linkChildAttached(33, 0, 0, 3000, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.523599;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 = normalizeAngle(e.f0);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i1 = 13;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(33, 0, 0, 1000, -2, 100);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.523599;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 = normalizeAngle(e.f0);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i1 = 14;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(33, 0, 0, 3000, -2, 100);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.523599;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 = normalizeAngle(e.f0);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(33, 0, 0, 1000, -2, 100);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = normalizeAngle(e.f0);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i1 = 4;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(33, 0, 0, 3000, -2, 100);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = normalizeAngle(e.f0);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i1 = 6;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(33, 0, 0, 1000, -2, 100);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = normalizeAngle(e.f0);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i1 = 8;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(33, 0, 0, 3000, -2, 100);
        }
        e.callSubAlloc(0, 34); // op 135
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        yield 300;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(80, 4, 1); // op 67
        yield 80;
        pc = 4;
        break;
      }
      case 4: {
        pc = 2;
        break;
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
        e.f3 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1.1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 1.7;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.orbitAngle + e.f3;
        e.f3 -= 0.10472;
        e.f1 = normalizeAngle(e.f1);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 5;
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = e.orbitAngle + e.f3;
        e.f3 -= 0.10472;
        e.f1 = normalizeAngle(e.f1);
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.9,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 5;
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
        e.setAnm(e.i0);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.moveArc(120, e.f0, e.f1, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f1, 0);
        e.f0 = e.orbitAngle;
        e.callSubAlloc(0, 32); // op 135
        yield 30000;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 7;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 12;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 14;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 14;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i1 = 13;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.i1 = 4;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.i1 = 8;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 7;
        break;
      }
      case 7: {
        e.nop(); // op 0
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.i1 = 2;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 9;
        break;
      }
      case 9: {
        e.nop(); // op 0
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 11;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.i1 = 6;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 11;
        break;
      }
      case 11: {
        e.nop(); // op 0
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 13;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.i1 = 8;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 13;
        break;
      }
      case 13: {
        e.nop(); // op 0
        if (e.parentChainCount >= e.ci1) {
          yield 120;
          pc = 15;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        e.i1 = 10;
        e.linkChildAttached(33, 0, 0, 700, -2, 100);
        yield 120;
        pc = 15;
        break;
      }
      case 15: {
        pc = 1;
        break;
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
        e.setLives(2500);
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
        e.setDeathCallbackSub(76); // op 130
        yield* sub_67(e);
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
        e.setMotionClamp(32, 48, 352, 192);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(22); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 22); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('魔符「ミルキーウェイ」', '霧雨魔理沙', 77, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('魔符「ミルキーウェイ」', '霧雨魔理沙', 78, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('魔空「アステロイドベルト」', '霧雨魔理沙', 79, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('魔空「アステロイドベルト」', '霧雨魔理沙', 80, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.f0 = 0;
        e.callSubAlloc(0, 38); // op 135
        e.callSubAlloc(1, 37); // op 135
        e.f0 = 3.141593;
        e.f1 = 0.006545;
        e.f2 = 0.8;
        e.ci2 = 0;
        e.i0 = 73;
        e.autoAnm();
        e.i1 = 2;
        e.linkChildAttached(40, 0, 0, 600, -2, 100);
        e.i1 = 4;
        e.linkChildAttached(40, 0, 0, 1000, -2, 100);
        e.i1 = 6;
        e.linkChildAttached(40, 0, 0, 600, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(40, 0, 0, 1000, -2, 100);
        e.i1 = 13;
        e.linkChildAttached(40, 0, 0, 600, -2, 100);
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
        e.f0 = e.randAngle;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 9;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 21;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 1.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 1.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2.1;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 15;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 13;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 12;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0.1309;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0.1309;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = -0.1309;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = -0.1309;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 1,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        e.f0 -= e.f2;
        yield e.delay(e.i1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 3,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        e.f0 -= e.f2;
        yield e.delay(e.i1);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_38(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 180; // the script starts at frame 180
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 60;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 4;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = -7;
        e.f1 = e.randF32 * 224;
        e.cf0 = e.f0 - e.posX;
        e.cf1 = e.f1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.f2 = e.randF32S * 0.098175;
        e.f2 += 0.392699;
        e.f3 = e.randF32 * 0.5;
        e.f3 += 0.8;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 12,
          color: 13,
          count: 1,
          rings: 1,
          speed: reg(0x2723) /* f3 */,
          speed2: 0.9,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        e.setShotOrigin(0, 0); // op 110
        yield e.delay(e.i7);
        e.f0 = -7;
        e.f1 = e.randF32 * 224;
        e.f1 += 224;
        e.f2 = e.randF32S * 0.098175;
        e.f2 += 0.392699;
        e.f3 = e.randF32 * 0.5;
        e.f3 += 0.8;
        e.cf0 = e.f0 - e.posX;
        e.cf1 = e.f1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 12,
          color: 13,
          count: 1,
          rings: 1,
          speed: reg(0x2723) /* f3 */,
          speed2: 0.9,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        e.setShotOrigin(0, 0); // op 110
        yield e.delay(e.i7);
        e.f0 = 391;
        e.f1 = e.randF32 * 224;
        e.f2 = e.randF32S * 0.098175;
        e.f2 += 2.748893;
        e.f3 = e.randF32 * 0.5;
        e.f3 += 0.8;
        e.cf0 = e.f0 - e.posX;
        e.cf1 = e.f1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 13,
          color: 10,
          count: 1,
          rings: 1,
          speed: reg(0x2723) /* f3 */,
          speed2: 0.9,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        e.setShotOrigin(0, 0); // op 110
        yield e.delay(e.i7);
        e.f0 = 391;
        e.f1 = e.randF32 * 224;
        e.f1 += 224;
        e.f2 = e.randF32S * 0.098175;
        e.f2 += 2.748893;
        e.f3 = e.randF32 * 0.5;
        e.f3 += 0.8;
        e.cf0 = e.f0 - e.posX;
        e.cf1 = e.f1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 13,
          color: 10,
          count: 1,
          rings: 1,
          speed: reg(0x2723) /* f3 */,
          speed2: 0.9,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
        e.setShotOrigin(0, 0); // op 110
        yield e.delay(e.i7);
        pc = 1;
        break;
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
        e.ci0 = 4;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 12,
          color: reg(0x2711) /* i1 */,
          count: 3,
          rings: 1,
          speed: 2.3,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 97
        yield 10;
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
        pc = 0;
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
        e.setAnm(e.i0);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.moveArc(120, e.f0, e.f1, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f1, 0);
        e.f0 = e.orbitAngle;
        e.callSubAlloc(0, 39); // op 135
        yield 30000;
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
        e.setMotionClamp(32, 48, 352, 256);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(25); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3900, 25); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('魔符「スターダストレヴァリエ」', '霧雨魔理沙', 81, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('魔符「スターダストレヴァリエ」', '霧雨魔理沙', 82, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('黒魔「イベントホライズン」', '霧雨魔理沙', 83, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('黒魔「イベントホライズン」', '霧雨魔理沙', 84, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(600); // op 160
        e.setSpellTimer(3900, 26); // op 134
        e.f0 = 0;
        e.f0 = e.randAngle;
        e.i0 = e.randU31 % 2;
        if (e.i0 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = -0.009817;
        pc = 4;
        break;
      }
      case 3: {
        e.f1 = -0.009817;
        pc = 4;
        break;
      }
      case 4: {
        e.f2 = 0.8;
        e.ci2 = 0;
        e.i0 = 70;
        e.autoAnm();
        e.i1 = 2;
        e.i2 = 12;
        e.linkChildAttached(46, 0, 0, 600, -2, 100);
        e.i1 = 4;
        e.i2 = 13;
        e.linkChildAttached(46, 0, 0, 1000, -2, 100);
        e.i1 = 8;
        e.i2 = 12;
        e.linkChildAttached(46, 0, 0, 600, -2, 100);
        e.i1 = 6;
        e.i2 = 13;
        e.linkChildAttached(46, 0, 0, 600, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i1 = 10;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i2 = 12;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(46, 0, 0, 1000, -2, 100);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i1 = 13;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i2 = 13;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(46, 0, 0, 600, -2, 100);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i1 = 14;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.i2 = 12;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(46, 0, 0, 600, -2, 100);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i1 = 10;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i2 = 12;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(46, 0, 0, 1000, -2, 100);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i1 = 13;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.i2 = 13;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildAttached(46, 0, 0, 600, -2, 100);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 14;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i2 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.linkChildAttached(46, 0, 0, 600, -2, 100);
        }
        yield 100;
        pc = 5;
        break;
      }
      case 5: {
        pc = 5;
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
        e.setShotRecord(0, 131072, 0, 280, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 9;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.moveAngle - 1.570796;
        e.setShotRecord(1, 16, 0, 60, -1, 0.016667, e.f1); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: reg(0x2712) /* i2 */,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.9,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.049087387,
          transform: 0x21218 /* ACCELERATE | WAIT */,
        }); // op 97
        yield e.delay(e.ci1);
        pc = 1;
        break;
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
        e.setShotRecord(0, 131072, 0, 200, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 9;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.moveAngle + 1.570796;
        e.setShotRecord(1, 16, 0, 90, -1, 0.016667, e.f1); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: reg(0x2712) /* i2 */,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.9,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.049087387,
          transform: 0x21218 /* ACCELERATE | WAIT */,
        }); // op 97
        yield e.delay(e.ci1);
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
        e.setShotRecord(0, 131072, 0, 200, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 9;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.moveAngle - 1.570796;
        e.setShotRecord(1, 16, 0, 90, -1, 0.016667, e.f1); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: reg(0x2712) /* i2 */,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.9,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.049087387,
          transform: 0x21218 /* ACCELERATE | WAIT */,
        }); // op 97
        yield e.delay(e.ci1);
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
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: reg(0x2712) /* i2 */,
          color: reg(0x2711) /* i1 */,
          count: 7,
          rings: 1,
          speed: 1,
          speed2: 0.9,
          angle: reg(0x275d) /* orbitAngle */,
          angleStep: 0.5235988,
          transform: 0x202,
        }); // op 97
        yield 4;
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
        e.setAnm(e.i0);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.f3 = e.f1 * 4;
        e.moveArc(120, e.f0, e.f3, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f3, 0);
        e.callSubAlloc(0, 42); // op 135
        e.interpSlot(10078 /* orbitAngleVel */, 60, 0, 0, e.f3, e.f1, 0, 0);
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.setAccel(240, e.f1, 0.533333);
        yield 240;
        pc = 4;
        break;
      }
      case 4: {
        e.nop(); // op 0
        e.setAccel(30000, e.f1, 0);
        e.f3 = e.f1 * 1.4;
        e.interpSlot(10078 /* orbitAngleVel */, 60, 0, 0, e.f1, e.f3, 0, 0);
        e.f1 = e.f3;
        e.callSubAlloc(0, 45); // op 135
        yield 300;
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        pc = 6;
        break;
      }
      case 6: {
        e.setAccel(240, e.f1, -0.9);
        if (e.f1 >= 0) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 43); // op 135
        yield 240;
        pc = 9;
        break;
      }
      case 8: {
        e.callSubAlloc(0, 44); // op 135
        yield 240;
        pc = 9;
        break;
      }
      case 9: {
        e.setAccel(30000, e.f1, 0);
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.setAccel(120, e.f1, 1.8);
        e.callSubAlloc(0, -1); // op 135
        yield 120;
        pc = 11;
        break;
      }
      case 11: {
        e.setAccel(30000, e.f1, 0);
        e.f4 = e.f1 * 1.04;
        e.f4 *= -1;
        e.interpSlot(10078 /* orbitAngleVel */, 60, 0, 0, e.f1, e.f4, 0, 0);
        e.f1 = e.f4;
        e.callSubAlloc(0, 45); // op 135
        yield 60;
        pc = 12;
        break;
      }
      case 12: {
        pc = 6;
        break;
      }
      case 13: {
        e.f0 = e.orbitAngle;
        yield 30000;
        pc = 14;
        break;
      }
      case 14: {
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
        e.setScriptFlags(3);
        e.setMisc177(e.maxHp); // op 177
        e.setMotionClamp(-128, 48, 512, 128);
        e.setSpellHP(0, 15, 0, 1); // op 157
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(31); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2700, 31); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('恋符「ノンディレクショナルレーザー」', '霧雨魔理沙', 85, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('恋符「ノンディレクショナルレーザー」', '霧雨魔理沙', 86, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('恋風「スターライトタイフーン」', '霧雨魔理沙', 87, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('恋風「スターライトタイフーン」', '霧雨魔理沙', 88, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.f0 = 0;
        e.callSubAlloc(0, 51); // op 135
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f0 = 2.748893;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = 2.356194;
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f1 = 0.003808;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = 0.003808;
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f2 = 0.533333;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f2 = 2.133333;
        }
        e.ci2 = 0;
        e.i0 = 75;
        e.autoAnm();
        e.i4 = 0;
        e.i1 = 2;
        e.linkChildAttached(52, 0, 0, 6000, -2, 100);
        e.i1 = 4;
        e.linkChildAttached(52, 0, 0, 10000, -2, 100);
        e.i1 = 6;
        e.linkChildAttached(52, 0, 0, 6000, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(52, 0, 0, 10000, -2, 100);
        e.i1 = 13;
        e.linkChildAttached(52, 0, 0, 6000, -2, 100);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f0 = 0.785398;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = 0.392699;
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f1 = -0.003808;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = -0.003808;
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f2 = 0.533333;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f2 = 2.133333;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i4 = 120;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i4 = 120;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i4 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i4 = 60;
        }
        e.ci2 = 1;
        e.i0 = 71;
        e.autoAnm();
        e.i1 = 13;
        e.linkChildAttached(52, 0, 0, 6000, -2, 100);
        e.i1 = 10;
        e.linkChildAttached(52, 0, 0, 10000, -2, 100);
        e.i1 = 6;
        e.linkChildAttached(52, 0, 0, 6000, -2, 100);
        e.i1 = 4;
        e.linkChildAttached(52, 0, 0, 10000, -2, 100);
        e.i1 = 2;
        e.linkChildAttached(52, 0, 0, 6000, -2, 100);
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
        yield e.delay(e.i4);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc116(0); // op 116
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnLaser({
            aimed: false, // op 114 keeps the absolute angle
            type: 1,
            color: reg(0x2711) /* i1 */,
            angle: reg(0x275d) /* orbitAngle */,
            speed: 0,
            tail: 0,
            head: 3.2e2,
            startLength: 3.2e2,
            width: 16,
            startTime: 60,
            duration: 150,
            despawn: 20,
            hitboxStart: 60,
            hitboxEnd: 20,
            flags: 0x6,
          }); // op 114
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnLaser({
            aimed: false, // op 114 keeps the absolute angle
            type: 1,
            color: reg(0x2711) /* i1 */,
            angle: reg(0x275d) /* orbitAngle */,
            speed: 0,
            tail: 0,
            head: 3.2e2,
            startLength: 3.2e2,
            width: 16,
            startTime: 60,
            duration: 200,
            despawn: 10,
            hitboxStart: 60,
            hitboxEnd: 10,
            flags: 0x6,
          }); // op 114
        }
        e.playSfx(16);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.ci0 = 230;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.ci0 = 270;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc167(0, e.orbitAngle); // op 167
        e.setIntFields(0, 0, 0, 0); // op 119
        yield 1;
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
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          yield e.delay(100);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          yield e.delay(30);
        }
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 33;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 28;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 18;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 2,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 3,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 4,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 5,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 6,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 33;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 28;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 18;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 2,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 3,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 4,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 5,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.ci1);
        e.f0 = e.orbitAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 6,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.ci1);
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
  yield 300; // the script starts at frame 300
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 120;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 60;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 60;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 0.9;
        }
        if (e.playerY >= 128) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 3.5;
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(0, 128, 0, 60, 1, 0, e.f0); // op 111
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: 2,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 99
        e.f0 += 1.047198;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: 4,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 99
        e.f0 += 1.047198;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 99
        e.f0 += 1.047198;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: 8,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 99
        e.f0 += 1.047198;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: 10,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 99
        e.f0 += 1.047198;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: 13,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 99
        yield e.delay(e.ci1);
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
        e.setAnm(e.i0);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setMisc160(200); // op 160
        e.clearScriptFlags(16);
        e.setShotNoFireRadius(0);
        e.ci1 = 255;
        e.i7 = 0;
        e.setTimeout(8);
        e.moveArc(120, e.f0, e.f1, e.f2);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        yield 119;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(30000, e.f1, 0);
        e.f0 = e.orbitAngle;
        e.callSubAlloc(0, 48); // op 135
        yield 200;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.callSubAlloc(1, 49); // op 135
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(1, 50); // op 135
        }
        yield 30000;
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
        e.setMisc126(47, 1); // op 126
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(54); // op 130
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(47, 1); // op 126
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
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(47, 1); // op 126
        e.setLives(18000);
        e.maxHp = 2500;
        e.setLifeBarSlice(0, 0, 2500, 16752800);
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
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(61); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3000, 61); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('恋符「マスタースパーク」', '霧雨魔理沙', 89, 0, 22000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('恋符「マスタースパーク」', '霧雨魔理沙', 90, 0, 22000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('恋心「ダブルスパーク」', '霧雨魔理沙', 91, 0, 22000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('恋心「ダブルスパーク」', '霧雨魔理沙', 92, 0, 22000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.playSfx(13);
        e.moveBounce(80, 0, 1); // op 67
        yield* sub_74(e);
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(19);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.cf0 = 1.570796;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.cf0 = 1.374447;
        }
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.spawnEnemyAlt(57, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(58, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(59, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(60, 0, 0, 0, 500, -2, 100);
        e.setMisc136(10, 0); // op 136
        if (e.difficulty < 2) {
          yield 100;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.cf0 = 1.767146;
        e.cf0 = 1.767146;
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.spawnEnemyAlt(57, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(58, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(59, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(60, 0, 0, 0, 500, -2, 100);
        yield 100;
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        e.callSubAlloc(0, 56); // op 135
        yield 300;
        pc = 6;
        break;
      }
      case 6: {
        pc = 7;
        break;
      }
      case 7: {
        e.moveBounce(80, 0, 0.5); // op 67
        yield* sub_74(e);
        pc = 8;
        break;
      }
      case 8: {
        e.nop(); // op 0
        yield 30;
        pc = 9;
        break;
      }
      case 9: {
        e.playSfx(19);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.cf0 = e.timer;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.cf0 = e.timer - 0.1309;
        }
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.spawnEnemyAlt(57, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(58, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(59, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(60, 0, 0, 0, 500, -2, 100);
        e.setMisc136(10, 0); // op 136
        if (e.difficulty < 2) {
          yield 400;
          pc = 11;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.cf0 = e.timer + 0.1309;
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.spawnEnemyAlt(57, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(58, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(59, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(60, 0, 0, 0, 500, -2, 100);
        yield 400;
        pc = 11;
        break;
      }
      case 11: {
        pc = 7;
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
        e.setShotRecord(0, 16, 0, 60, -1, 0.016667, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 60;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 24;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 24;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 24;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 15;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 1,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 1,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 3,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 3,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 4,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 4,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 5,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 5,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 6,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2.5,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 6,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci1);
        pc = 1;
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
        e.setAnmAlt(6);
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.setTimeout(9);
        yield 190;
        pc = 2;
        break;
      }
      case 2: {
        e.setTimeout(-1);
        yield 60;
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
        e.setAnmAlt(7);
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 370;
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
        e.setAnmAlt(8);
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 370;
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
        e.setAnmAlt(9);
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 370;
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
        e.setSpellHP(5, 15, 0, 1); // op 157
        e.setLives(2500);
        e.eclSetLives(0);
        e.spawnItemRandom(8); // op 142
        e.spawnItemBatch(5); // op 168
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        e.setSpellTimer(99999, 66); // op 134
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(66); // op 130
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setMisc136(30, 1); // op 136
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.setMisc136(30, 0); // op 136
        yield* sub_62(e);
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
        e.clearMotionClamp();
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3300, 66); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('光符「アースライトレイ」', '霧雨魔理沙', 93, 0, 25000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('光符「アースライトレイ」', '霧雨魔理沙', 94, 0, 25000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('光撃「シュート・ザ・ムーン」', '霧雨魔理沙', 95, 0, 25000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('光撃「シュート・ザ・ムーン」', '霧雨魔理沙', 96, 0, 25000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.setMotionClamp(62, 32, 322, 192);
        e.i0 = 71;
        e.i1 = 6;
        e.cf0 = 64;
        e.f0 = -1.570796;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.i0 = 75;
        e.i1 = 6;
        e.cf0 = 320;
        e.f0 = -1.570796;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.i0 = 69;
        e.i1 = 2;
        e.cf0 = 32;
        e.f0 = -1.570796;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.i0 = 73;
        e.i1 = 2;
        e.cf0 = 352;
        e.f0 = -1.570796;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.callSubAlloc(0, 63); // op 135
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 64); // op 135
        }
        e.moveBounce(80, 0, 0.5); // op 67
        yield 80;
        pc = 3;
        break;
      }
      case 3: {
        e.i0 = 71;
        e.i1 = 6;
        e.ci0 = 5;
        e.cf0 = 32;
        e.f7 = e.randF32S * 28;
        e.cf0 += e.f7;
        pc = 4;
        break;
      }
      case 4: {
        e.f7 = 0;
        e.f0 = -1.570796 + e.f7;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.cf0 += 80;
        yield 8;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 200;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 200;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 50;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 20;
        }
        yield e.delay(e.ci1);
        e.i0 = 73;
        e.i1 = 2;
        e.ci0 = 5;
        e.cf0 = 352;
        e.f7 = e.randF32S * 28;
        e.cf0 += e.f7;
        pc = 7;
        break;
      }
      case 7: {
        e.f7 = 0;
        e.f0 = -1.570796 + e.f7;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.cf0 -= 80;
        yield 8;
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
        e.moveBounce(80, 0, 0.5); // op 67
        yield e.delay(e.ci1);
        e.i0 = 71;
        e.i1 = 6;
        e.ci0 = 6;
        e.cf0 = 32;
        e.f7 = e.randF32S * 28;
        e.cf0 += e.f7;
        pc = 10;
        break;
      }
      case 10: {
        e.f7 = e.randAngle / 64;
        e.f0 = -1.570796 + e.f7;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.cf0 += 64;
        yield 8;
        pc = 11;
        break;
      }
      case 11: {
        if (--e.ci0 > 0) {
          pc = 10;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.moveBounce(80, 0, 0.5); // op 67
        yield e.delay(e.ci1);
        e.i0 = 73;
        e.i1 = 2;
        e.ci0 = 6;
        e.cf0 = 352;
        e.f7 = e.randF32S * 28;
        e.cf0 += e.f7;
        pc = 13;
        break;
      }
      case 13: {
        e.f7 = e.randAngle / 64;
        e.f0 = -1.570796 + e.f7;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.cf0 -= 64;
        yield 8;
        pc = 14;
        break;
      }
      case 14: {
        if (--e.ci0 > 0) {
          pc = 13;
          break;
        }
        pc = 15;
        break;
      }
      case 15: {
        e.moveBounce(80, 0, 0.5); // op 67
        yield e.delay(e.ci1);
        e.i0 = 71;
        e.i1 = 6;
        e.ci0 = 7;
        e.cf0 = 32;
        e.f7 = e.randF32S * 28;
        e.cf0 += e.f7;
        pc = 16;
        break;
      }
      case 16: {
        e.f7 = e.randAngle / 32;
        e.f0 = -1.570796 + e.f7;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.cf0 += 53;
        yield 8;
        pc = 17;
        break;
      }
      case 17: {
        if (--e.ci0 > 0) {
          pc = 16;
          break;
        }
        pc = 18;
        break;
      }
      case 18: {
        e.moveBounce(80, 0, 0.5); // op 67
        yield e.delay(e.ci1);
        e.i0 = 73;
        e.i1 = 2;
        e.ci0 = 7;
        e.cf0 = 352;
        e.f7 = e.randF32S * 28;
        e.cf0 += e.f7;
        pc = 19;
        break;
      }
      case 19: {
        e.f7 = e.randAngle / 32;
        e.f0 = -1.570796 + e.f7;
        e.linkChildRelative(65, 0, 0, 5000, 1, 100);
        e.cf0 -= 53;
        yield 8;
        pc = 20;
        break;
      }
      case 20: {
        if (--e.ci0 > 0) {
          pc = 19;
          break;
        }
        pc = 21;
        break;
      }
      case 21: {
        pc = 15;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 0.224399;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 0.15708;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.15708;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 0.15708;
        }
        e.f1 = 0 - e.f0;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 12,
          color: 13,
          count: 1,
          rings: 32,
          speed: 3.5,
          speed2: 0.5,
          angle: -2.0943952,
          angleStep: reg(0x2720) /* f0 */,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 12,
          color: 13,
          count: 1,
          rings: 32,
          speed: 2.5,
          speed2: 0.5,
          angle: -2.0943952,
          angleStep: reg(0x2720) /* f0 */,
          transform: 0x202,
        }); // op 98
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 13,
          color: 13,
          count: 1,
          rings: 32,
          speed: 3.5,
          speed2: 0.5,
          angle: 2.0943952,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 98
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 13,
          color: 13,
          count: 1,
          rings: 32,
          speed: 2.5,
          speed2: 0.5,
          angle: 2.0943952,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 98
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 12,
            color: 13,
            count: 3,
            rings: 3,
            speed: 2.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.07479983,
            transform: 0x202,
          }); // op 96
        }
        yield 16;
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 13,
            color: 13,
            count: 3,
            rings: 3,
            speed: 2.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.07479983,
            transform: 0x202,
          }); // op 96
        }
        yield 16;
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 12,
            color: 13,
            count: 3,
            rings: 3,
            speed: 2.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.07479983,
            transform: 0x202,
          }); // op 96
        }
        yield 16;
        pc = 6;
        break;
      }
      case 6: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 13,
            color: 13,
            count: 3,
            rings: 3,
            speed: 2.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.07479983,
            transform: 0x202,
          }); // op 96
        }
        yield 16;
        pc = 7;
        break;
      }
      case 7: {
        pc = 1;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 0.224399;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 0.15708;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.15708;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 0.15708;
        }
        e.f1 = 0 - e.f0;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 12,
          color: 13,
          count: 5,
          rings: 2,
          speed: 1.5,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.5235988,
          transform: 0x202,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 12,
          color: 13,
          count: 5,
          rings: 2,
          speed: 1,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.5235988,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 13,
          color: 13,
          count: 5,
          rings: 2,
          speed: 1.5,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.5235988,
          transform: 0x202,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 13,
          color: 13,
          count: 5,
          rings: 2,
          speed: 1,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.5235988,
          transform: 0x202,
        }); // op 96
        yield 20;
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
        e.setAnm(e.i0);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(18);
        e.setHitFlash(1);
        e.moveRelative(120, 2, e.cf0, 448); // op 64
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.spawnEffectAngle(60, 1, -1, e.f0, 0, 0); // op 140
        e.spawnEffectAngle(61, 1, -8355585, e.f0, 0, 0); // op 140
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: reg(0x2711) /* i1 */,
          angle: reg(0x2720) /* f0 */,
          speed: 3e1,
          tail: 0,
          head: 0,
          startLength: 2.4e3,
          width: 16,
          startTime: 1,
          duration: 40,
          despawn: 40,
          hitboxStart: 1,
          hitboxEnd: 20,
          flags: 0x6,
        }); // op 114
        e.playSfx(16);
        yield 80;
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
        e.setTimeout(-1);
        e.setMisc136(30, 1); // op 136
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc136(30, 0); // op 136
        yield* sub_75(e);
        return;
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
        e.setSpellHP(5, 15, 0, 1); // op 157
        e.clearMotionClamp();
        e.setMotionClamp(32, 48, 352, 128);
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3900, 76); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 160); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('魔砲「ファイナルスパーク」', '霧雨魔理沙', 97, 0, 25000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('魔砲「ファイナルスパーク」', '霧雨魔理沙', 98, 0, 25000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('魔砲「ファイナルマスタースパーク」', '霧雨魔理沙', 99, 0, 25000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        pc = 2;
        break;
      }
      case 2: {
        e.moveBounce(80, 0, 0.5); // op 67
        yield* sub_74(e);
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        yield 30;
        pc = 4;
        break;
      }
      case 4: {
        e.playSfx(19);
        e.cf0 = e.timer;
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.spawnEnemyAlt(70, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(71, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(72, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(73, 0, 0, 0, 500, -2, 100);
        e.setMisc136(10, 0); // op 136
        e.callSubAlloc(0, 68); // op 135
        if (e.isDiff(NORMAL | EXTRA)) {
          yield e.delay(400);
        }
        if (e.isDiff(HARD | EXTRA)) {
          yield e.delay(360);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          yield e.delay(330);
        }
        e.moveBounce(80, 4, 2.5); // op 67
        yield* sub_74(e);
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        yield 30;
        pc = 6;
        break;
      }
      case 6: {
        e.playSfx(19);
        e.cf0 = e.timer;
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.spawnEnemyAlt(70, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(71, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(72, 0, 0, 0, 500, -2, 100);
        e.spawnEnemyAlt(73, 0, 0, 0, 500, -2, 100);
        e.setMisc136(10, 0); // op 136
        e.callSubAlloc(0, 69); // op 135
        if (e.isDiff(NORMAL | EXTRA)) {
          yield e.delay(400);
        }
        if (e.isDiff(HARD | EXTRA)) {
          yield e.delay(360);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          yield e.delay(330);
        }
        pc = 2;
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
        e.ci0 = 18;
        e.f0 = e.randAngle;
        e.setShotRecord(0, 64, 0, 60, 1, -999.900024, 0); // op 111
        e.setShotRecord(1, 131072, 0, 180, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.015;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.015;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.015833;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.018333;
        }
        e.setShotRecord(2, 16, 0, 240, -1, e.f7, -999.900024); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 1,
          count: 8,
          rings: 1,
          speed: 1.8,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x20252 /* ACCELERATE | RAMP_TURN | WAIT */,
        }); // op 99
        e.f0 -= 0.1309;
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 3,
          count: 8,
          rings: 1,
          speed: 1.8,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x20252 /* ACCELERATE | RAMP_TURN | WAIT */,
        }); // op 99
        e.f0 -= 0.1309;
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
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
        e.ci0 = 18;
        e.f0 = e.randAngle;
        e.setShotRecord(0, 64, 0, 60, 1, -999.900024, 0); // op 111
        e.setShotRecord(1, 131072, 0, 180, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.015;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.015;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.015833;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.018333;
        }
        e.setShotRecord(2, 16, 0, 240, -1, e.f7, -999.900024); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 14,
          color: 1,
          count: 8,
          rings: 1,
          speed: 1.8,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x20252 /* ACCELERATE | RAMP_TURN | WAIT */,
        }); // op 99
        e.f0 += 0.1309;
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 15,
          color: 3,
          count: 8,
          rings: 1,
          speed: 1.8,
          speed2: 0.9,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x20252 /* ACCELERATE | RAMP_TURN | WAIT */,
        }); // op 99
        e.f0 += 0.1309;
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
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
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setAnmAlt(10);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setAnmAlt(14);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setAnmAlt(18);
        }
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f4 = e.posX;
        e.f5 = e.posY;
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.setTimeout(11);
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 150;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 120;
        }
        e.ci0 = e.ci2;
        pc = 2;
        break;
      }
      case 2: {
        e.f6 = e.posX - e.f4;
        e.f7 = e.posY - e.f5;
        e.f2 = e.playerX - e.f4;
        e.f3 = e.playerY - e.f5;
        e.f2 = e.f2 * e.f7;
        e.f3 = e.f3 * e.f6;
        e.f2 = e.f2 - e.f3;
        if (e.f2 >= 0) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 += 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 += 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 += 0.005652;
        }
        pc = 5;
        break;
      }
      case 4: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 -= 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 -= 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 -= 0.005652;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setMisc165(e.cf0); // op 165
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.f6 = e.f0 + e.f4;
        e.f7 = e.f1 + e.f5;
        e.setRelPos(e.f6, e.f7);
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.setTimeout(-1);
        yield 60;
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
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setAnmAlt(11);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setAnmAlt(15);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setAnmAlt(19);
        }
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f4 = e.posX;
        e.f5 = e.posY;
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 150;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 120;
        }
        e.ci0 = e.ci2;
        pc = 2;
        break;
      }
      case 2: {
        e.f6 = e.posX - e.f4;
        e.f7 = e.posY - e.f5;
        e.f2 = e.playerX - e.f4;
        e.f3 = e.playerY - e.f5;
        e.f2 = e.f2 * e.f7;
        e.f3 = e.f3 * e.f6;
        e.f2 = e.f2 - e.f3;
        if (e.f2 >= 0) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 += 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 += 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 += 0.005652;
        }
        pc = 5;
        break;
      }
      case 4: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 -= 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 -= 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 -= 0.005652;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setMisc165(e.cf0); // op 165
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.f6 = e.f0 + e.f4;
        e.f7 = e.f1 + e.f5;
        e.setRelPos(e.f6, e.f7);
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 2;
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
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setAnmAlt(12);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setAnmAlt(16);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setAnmAlt(20);
        }
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f4 = e.posX;
        e.f5 = e.posY;
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 150;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 120;
        }
        e.ci0 = e.ci2;
        pc = 2;
        break;
      }
      case 2: {
        e.f6 = e.posX - e.f4;
        e.f7 = e.posY - e.f5;
        e.f2 = e.playerX - e.f4;
        e.f3 = e.playerY - e.f5;
        e.f2 = e.f2 * e.f7;
        e.f3 = e.f3 * e.f6;
        e.f2 = e.f2 - e.f3;
        if (e.f2 >= 0) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 += 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 += 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 += 0.005652;
        }
        pc = 5;
        break;
      }
      case 4: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 -= 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 -= 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 -= 0.005652;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setMisc165(e.cf0); // op 165
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.f6 = e.f0 + e.f4;
        e.f7 = e.f1 + e.f5;
        e.setRelPos(e.f6, e.f7);
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 2;
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
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setAnmAlt(13);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setAnmAlt(17);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setAnmAlt(21);
        }
        e.setMisc159(3); // op 159
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMisc165(e.cf0); // op 165
        e.f4 = e.posX;
        e.f5 = e.posY;
        e.f2 = e.posX + e.f0;
        e.f3 = e.posY + e.f1;
        e.moveRelative(60, 1, e.f2, e.f3); // op 64
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 190;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 150;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 120;
        }
        e.ci0 = e.ci2;
        pc = 2;
        break;
      }
      case 2: {
        e.f6 = e.posX - e.f4;
        e.f7 = e.posY - e.f5;
        e.f2 = e.playerX - e.f4;
        e.f3 = e.playerY - e.f5;
        e.f2 = e.f2 * e.f7;
        e.f3 = e.f3 * e.f6;
        e.f2 = e.f2 - e.f3;
        if (e.f2 >= 0) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 += 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 += 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 += 0.005652;
        }
        pc = 5;
        break;
      }
      case 4: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.cf0 -= 0.00357;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.cf0 -= 0.004522;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.cf0 -= 0.005652;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setMisc165(e.cf0); // op 165
        e.f0 = Math.cos(e.cf0);
        e.f0 *= 295;
        e.f1 = Math.sin(e.cf0);
        e.f1 *= 295;
        e.f6 = e.f0 + e.f4;
        e.f7 = e.f1 + e.f5;
        e.setRelPos(e.f6, e.f7);
        yield 1;
        pc = 6;
        break;
      }
      case 6: {
        if (--e.ci0 > 0) {
          pc = 2;
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
