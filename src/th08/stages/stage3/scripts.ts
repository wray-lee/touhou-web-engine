// Auto-generated from ecldata3.ecl by tools/th08/ecl
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
// ecldata3.ecl: 78 subs, translated by tools/th08/ecl
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
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc144(3, 2); // op 144
        e.setMisc160(30); // op 160
        e.movePolar(50, 4, 1.570796, 2.5);
        e.callSubAlloc(0, 1); // op 135
        e.ci1 = 3;
        yield 65;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 8;
        e.f2 = e.timer;
        e.f0 = e.f2 + 0.785398;
        e.f1 = e.f2 + 0.392699;
        e.f3 = e.f2 - 0.392699;
        e.f4 = e.f2 - 0.785398;
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 3,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 3,
            rings: 3,
            speed: 3,
            speed2: 1,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(0, 32, 0, 40, -1, 0, -0.02618); // op 111
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.28559932,
            transform: 0x222 /* CURL */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.28559932,
            transform: 0x222 /* CURL */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.28559932,
            transform: 0x222 /* CURL */,
          }); // op 97
        }
        e.setShotRecord(0, 32, 0, 40, -1, 0, -0.01309); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.28559932,
          transform: 0x22 /* CURL */,
        }); // op 97
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.18479957,
          transform: 0x2,
        }); // op 97
        e.setShotRecord(0, 32, 0, 40, -1, 0, 0.01309); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2723) /* f3 */,
          angleStep: 0.28559932,
          transform: 0x22 /* CURL */,
        }); // op 97
        e.setShotRecord(0, 32, 0, 40, -1, 0, 0.02618); // op 111
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2724) /* f4 */,
            angleStep: 0.28559932,
            transform: 0x22 /* CURL */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2724) /* f4 */,
            angleStep: 0.28559932,
            transform: 0x22 /* CURL */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2724) /* f4 */,
            angleStep: 0.28559932,
            transform: 0x22 /* CURL */,
          }); // op 97
        }
        yield 2;
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
        e.setHeadingSpeed(0, 1);
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci1 > 0) {
          pc = 1;
          break;
        }
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
        e.ci0 = 12;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.28559932,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
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
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 2,
            speed: 4,
            speed2: 2,
            angle: 0,
            angleStep: 0.28559932,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
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
        e.setHeadingSpeed(1.570796, 1);
        e.f0 = 1.570796;
        e.f1 = -0.05236;
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 5000;
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
        e.setHeadingSpeed(1.570796, 1);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 5000;
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
        e.setHeadingSpeed(1.570796, 0.4);
        e.f0 = 1.570796;
        e.f1 = -0.05236;
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 5000;
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
        e.setHeadingSpeed(1.570796, 0.4);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 5000;
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
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc144(3, 2); // op 144
        e.linkChildAttached(9, -32, 0, 100, -2, 100);
        e.linkChildAttached(9, 32, 0, 100, -2, 100);
        e.movePolar(60, 4, 1.570796, 2.1);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.movePolar(60, 4, 0.392699, 2);
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 2,
            count: 16,
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
            rings: 2,
            speed: 2,
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
            rings: 3,
            speed: 2.6,
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
            rings: 4,
            speed: 3.3,
            speed2: 0.8,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingSpeed(0.392699, 0);
        e.setSpeedAccel(0.03);
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.setSpeedAccel(0);
        yield 5000;
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
        e.f1 = 1.6;
        e.setShotRecord(1, 16384, 0, 6, 6, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 2,
            speed: 1.6,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 2,
            speed: 1.6,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 3,
            speed: 2.2,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 4,
            speed: 3.5,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2;
        }
        e.ci0 = 10;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0.28559932,
          transform: 0x202,
        }); // op 97
        e.f0 += 0.15;
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
        e.f0 = 1;
        e.ci0 = 10;
        e.setShotRecord(0, 128, 0, 30, 1, 0, e.f1); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 3,
            speed: 2.2,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 4,
            speed: 3.5,
            speed2: 0.8,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 2,
            count: 1,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 1.5707964,
            angleStep: 0.28559932,
            transform: 0x4282 /* RAMP_HOME | RESPRITE */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 2,
            count: 1,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 1.5707964,
            angleStep: 0.28559932,
            transform: 0x4282 /* RAMP_HOME | RESPRITE */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 2,
            count: 1,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 1.5707964,
            angleStep: 0.28559932,
            transform: 0x4282 /* RAMP_HOME | RESPRITE */,
          }); // op 97
        }
        e.f0 += 0.15;
        yield 3;
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
        e.setAnm(53);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setHitFlash(1);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
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
        e.setAnm(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(2);
        e.movePolar(60, 4, 1.570796, 2);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(1.570796, 1);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 200;
        pc = 5;
        break;
      }
      case 5: {
        e.callSubAlloc(0, 11); // op 135
        yield 5000;
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
        e.ci0 = 5;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 6,
          count: 8,
          rings: 2,
          speed: 2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        yield 60;
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
        e.setAnm(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(2);
        e.movePolar(60, 4, 1.570796, 2);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(1.570796, 1);
        e.f0 = 1.570796;
        e.f1 = -0.05236;
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(3, 0, 0, 100, -2, 100);
        yield 120;
        pc = 5;
        break;
      }
      case 5: {
        e.callSubAlloc(0, 11); // op 135
        yield 5000;
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
        e.setAnm(42);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc144(5, 3); // op 144
        e.setMisc160(180); // op 160
        e.movePolar(60, 4, 1.570796, 1.2);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 50;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = -0.02618;
        e.linkChildRelative(16, 0, 0, 100, -2, 100);
        e.i0 = e.ci0 % 3;
        if (e.i0 != 0) {
          yield 30;
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 1,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 1,
            color: 2,
            count: 32,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 1,
            color: 2,
            count: 32,
            rings: 3,
            speed: 3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 30;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setHeadingSpeed(-1.570796, 0);
        e.setSpeedAccel(0.04);
        yield 5000;
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
        e.setAnm(42);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc144(5, 3); // op 144
        e.setMisc160(180); // op 160
        e.movePolar(60, 4, 1.570796, 1.2);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 50;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 0.02618;
        e.linkChildRelative(16, 0, 0, 100, -2, 100);
        e.i0 = e.ci0 % 3;
        if (e.i0 != 0) {
          yield 30;
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 1,
            color: 6,
            count: 32,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 1,
            color: 6,
            count: 32,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 1,
            color: 6,
            count: 32,
            rings: 3,
            speed: 3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 30;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setHeadingSpeed(-1.570796, 0);
        e.setSpeedAccel(0.04);
        yield 5000;
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
        e.i0 = e.randU31 % 30;
        e.i0 += 10;
        yield e.delay(e.i0);
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 300;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 120;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        e.ci0 = 20;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1.6,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.034906585,
            transform: 0x3 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.034906585,
            transform: 0x3 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 1,
            speed: 2.2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.034906585,
            transform: 0x3 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 2,
            speed: 2.9,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.034906585,
            transform: 0x3 /* BIRTH_PUSH */,
          }); // op 96
        }
        yield e.delay(e.i0);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
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
        e.setAnm(56);
        e.setBounds(24, 24);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.callSubAlloc(0, 15); // op 135
        e.setHeadingSpeed(1.570796, 2);
        yield 40;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingVel(e.f0);
        yield 40;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingVel(0);
        yield 40;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(e.f0);
        yield 20;
        pc = 4;
        break;
      }
      case 4: {
        e.setHeadingVel(0);
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
        e.setAnmScripts6(0);
        e.setBounds(24, 24);
        e.f2 = e.posX;
        e.f3 = e.posY;
        e.f0 = e.playerX - e.posX;
        e.f1 = e.playerY - e.posY;
        e.f0 *= 0.6;
        e.f1 *= 0.6;
        e.f0 += e.posX;
        e.f1 += e.posY;
        e.moveRelative(100, 4, e.f0, e.f1); // op 64
        e.ci0 = 90;
        e.holdShots(); // op 107
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1.6,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 1,
            speed: 2.4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 1,
            speed: 4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x202,
          }); // op 96
        }
        e.releaseShots(); // op 108
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeat(60);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeat(20);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeat(10);
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.playerX - e.f2;
        e.f1 = e.playerY - e.f3;
        e.f0 *= 0.6;
        e.f1 *= 0.6;
        e.f4 = e.f0 - e.tweenDX;
        e.f5 = e.f1 - e.tweenDY;
        e.f4 *= 0.002;
        e.f5 *= 0.002;
        e.tweenDX += e.f4;
        e.tweenDY += e.f5;
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
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 3,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.f2 = e.timer + 3.141593;
        e.setHeadingSpeed(e.f2, 0.1);
        e.setSpeedAccel(0.01);
        yield 5000;
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
        e.setAnm(50);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(8); // op 160
        e.f0 = e.randF32 * 1;
        e.f0 += 1;
        e.setHeadingSpeed(1.570796, e.f0);
        yield 5000;
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.setLives(16000);
        e.setLifeBarSlice(0, 0, e.maxHp, -1);
        e.setSpellTimer(2220, 29); // op 134
        e.setPhase(0, 2100, 29); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16752800);
        e.setRelPos(-32, 256);
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
        yield* sub_21(e);
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
        e.setScriptFlags(4);
        e.setMisc144(7, 4); // op 144
        e.callSubAlloc(0, 22); // op 135
        pc = 1;
        break;
      }
      case 1: {
        e.autoAnm();
        e.f1 = 0.15708;
        e.linkChildStandard(24, 64, 128, 1350, -2, 100);
        e.f1 = -0.15708;
        e.linkChildStandard(24, 320, 128, 1350, -2, 100);
        e.f1 = -0.15708;
        e.linkChildStandard(24, 152, 220, 750, -2, 100);
        e.f1 = 0.15708;
        e.linkChildStandard(24, 232, 220, 750, -2, 100);
        yield 180;
        pc = 2;
        break;
      }
      case 2: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 2,
          count: 5,
          rings: 5,
          speed: 2.2,
          speed2: 1,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 96
        e.autoAnm();
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 2,
          count: 5,
          rings: 5,
          speed: 2.2,
          speed2: 1,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 96
        e.autoAnm();
        yield 160;
        pc = 6;
        break;
      }
      case 6: {
        e.playSfx(5);
        yield 40;
        pc = 7;
        break;
      }
      case 7: {
        e.autoAnm();
        e.f1 = -0.10472;
        e.linkChildStandard(24, 32, 188, 1350, -2, 100);
        e.f1 = 0.10472;
        e.linkChildStandard(24, 352, 188, 1350, -2, 100);
        e.f1 = 0.10472;
        e.linkChildStandard(24, 162, 150, 750, -2, 100);
        e.f1 = -0.10472;
        e.linkChildStandard(24, 222, 150, 750, -2, 100);
        yield 180;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 9;
        break;
      }
      case 9: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 2,
          count: 5,
          rings: 5,
          speed: 2.2,
          speed2: 1,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 96
        e.autoAnm();
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 2,
          count: 5,
          rings: 5,
          speed: 2.2,
          speed2: 1,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 96
        e.autoAnm();
        yield 160;
        pc = 12;
        break;
      }
      case 12: {
        e.playSfx(5);
        yield 40;
        pc = 13;
        break;
      }
      case 13: {
        e.autoAnm();
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 300;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 120;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 90;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 24;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 32;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: 2,
          speed2: 1,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 98
        yield e.delay(e.i0);
        pc = 1;
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
        e.ci0 = 3;
        e.f0 = 1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 1.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 1.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 2.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 18;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 18;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 14;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 6,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 8,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i7);
        if (e.isDiff(NORMAL | HARD | LUNATIC)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 6,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 8,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i7);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 6,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 8,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        yield e.delay(e.i7);
        if (e.isDiff(NORMAL | HARD | LUNATIC)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 6,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 8,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.i7);
        pc = 2;
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
        e.callSubAlloc(0, 23); // op 135
        yield 1200;
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
        e.setBossPresent(0);
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(27, 1); // op 126
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
        e.endSpell();
        e.clearScriptFlags(3);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(25); // op 130
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(-1);
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(25, 1); // op 126
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
        e.setBossPresent(-1);
        e.moveRelative(60, 1, 256, -32); // op 64
        e.spawnItemRandom(5); // op 142
        e.spawnItemBatch(3); // op 168
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
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(30, 1); // op 126
        e.setLives(16000);
        e.maxHp = 2100;
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
        e.clearAllBullets();
        e.clearScriptFlags(3);
        e.moveRelative(60, 4, 192, 128); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(-1);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(28); // op 130
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(30, 1); // op 126
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
        e.setScriptFlags(3);
        e.setMisc177(e.maxHp); // op 177
        e.setMotionClamp(32, 48, 352, 224);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(26); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2280, 26); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 192); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('産霊「ファーストピラミッド」', '上白沢慧音', 32, 0, 20000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('産霊「ファーストピラミッド」', '上白沢慧音', 33, 0, 20000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('産霊「ファーストピラミッド」', '上白沢慧音', 34, 0, 20000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('産霊「ファーストピラミッド」', '上白沢慧音', 35, 0, 20000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = -0.07854;
        e.f2 = 1.6;
        e.linkChildStandard(33, e.posX, e.posY, 1500, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 1500, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 1500, -2, 100);
        if (e.difficulty == 0) {
          yield 100;
          pc = 6;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = 1.570796;
        e.f1 = 0.07854;
        e.f2 = 2.4;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        if (e.difficulty == 1) {
          yield 100;
          pc = 6;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = 3.141593;
        e.f1 = -0.07854;
        e.f2 = 3.2;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        if (e.difficulty == 2) {
          yield 100;
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = 0;
        e.f1 = 0.07854;
        e.f2 = 3.6;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(33, e.posX, e.posY, 150, -2, 100);
        yield 100;
        pc = 6;
        break;
      }
      case 6: {
        e.callSubAlloc(0, 31); // op 135
        yield 1000;
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
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 10,
          color: 1,
          count: 3,
          rings: 3,
          speed: 3,
          speed2: 1.5,
          angle: 0,
          angleStep: 0,
          transform: 0x4,
        }); // op 98
        e.playSfx(15);
        yield 200;
        pc = 1;
        break;
      }
      case 1: {
        pc = 0;
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
          e.i0 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 14;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 12;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 1.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2.2;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 1.0471976,
          transform: 0x202,
        }); // op 97
        yield e.delay(e.i0);
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 1.0471976,
          transform: 0x202,
        }); // op 97
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.effectWithYoukai(1); // op 174
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(41, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 40;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 32); // op 135
        e.setAccel(3600, 0, 0);
        e.f1 /= 7;
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(3600, e.f1, 0);
        yield 1200;
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 44); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(35, 1); // op 126
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setMisc144(10, 5); // op 144
        if (e.isDiff(EASY | EXTRA)) {
          e.setLives(15100);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setLives(16800);
        }
        e.eclSetLives(1);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(38); // op 130
        if (e.isDiff(EASY | EXTRA)) {
          e.setSpellTimer(2340, 47); // op 134
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setSpellTimer(2220, 44); // op 134
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.setPhase(0, 2000, 47); // op 133
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setPhase(0, 2000, 46); // op 133
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setPhase(1, 3700, 44); // op 133
        }
        e.setLifeBarSlice(0, 0, e.phase0, 16736352);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setLifeBarSlice(1, e.phase0, e.phase1, 16752800);
        }
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
        e.i0 = 8;
        e.i1 = 6;
        e.i2 = 2;
        e.f1 = 0.15708;
        e.linkChildAttached(37, 16, 32, 1000, -2, 100);
        e.f1 = -0.15708;
        e.linkChildAttached(37, -16, 32, 1000, -2, 100);
        e.i0 = 8;
        e.i1 = 2;
        e.f1 = -0.15708;
        e.linkChildAttached(37, 32, 0, 1900, -2, 100);
        e.f1 = 0.15708;
        e.linkChildAttached(37, -32, 0, 1900, -2, 100);
        e.i0 = 8;
        e.i1 = 6;
        e.f1 = -0.15708;
        e.linkChildAttached(37, 16, -32, 1500, 1, 100);
        e.f1 = 0.15708;
        e.linkChildAttached(37, -16, -32, 1500, 1, 100);
        yield 200;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 9;
        break;
      }
      case 9: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 10;
        break;
      }
      case 10: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 11;
        break;
      }
      case 11: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 12;
        break;
      }
      case 12: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 13;
        break;
      }
      case 13: {
        pc = 7;
        break;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 3;
        }
        e.f0 = 1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 30;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 15;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 13;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 2.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 3.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 3.5;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i0);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i0);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        yield e.delay(e.i0);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        e.f1 *= 0.96;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.i0);
        pc = 2;
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
        e.callSubAlloc(0, 36); // op 135
        yield 660;
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
        e.setScriptFlags(4);
        e.endSpell();
        e.setMisc144(10, 5); // op 144
        e.setMisc160(240); // op 160
        e.setLives(17000);
        e.eclSetLives(0);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(75); // op 130
        if (e.isDiff(EASY | EXTRA)) {
          e.setSpellTimer(2280, 50); // op 134
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.setPhase(1, 4300, 50); // op 133
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setSpellTimer(2280, 54); // op 134
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setPhase(1, 4300, 54); // op 133
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setSpellTimer(2280, 58); // op 134
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setPhase(1, 4300, 58); // op 133
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setSpellTimer(2280, 62); // op 134
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setPhase(1, 4300, 62); // op 133
        }
        e.setPhase(0, 2400, 66); // op 133
        e.setLifeBarSlice(1, e.phase0, e.phase1, 16752800);
        e.setLifeBarSlice(0, 0, e.phase0, 16736352);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.setMotionClamp(32, 48, 352, 128);
        e.moveBounce(60, 4, 1.4); // op 67
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.autoAnm();
        e.i0 = 20;
        e.i2 = 2;
        pc = 3;
        break;
      }
      case 3: {
        e.autoAnm();
        e.i0 = 8;
        e.i1 = 6;
        e.f1 = 0.15708;
        e.linkChildAttached(40, 16, 32, 1000, -2, 100);
        e.f1 = -0.15708;
        e.linkChildAttached(40, -16, 32, 1000, -2, 100);
        e.i0 = 8;
        e.i1 = 2;
        e.f1 = -0.15708;
        e.linkChildAttached(40, 32, 0, 1900, -2, 100);
        e.f1 = 0.15708;
        e.linkChildAttached(40, -32, 0, 1900, -2, 100);
        e.i0 = 8;
        e.i1 = 6;
        e.f1 = -0.15708;
        e.linkChildAttached(40, 16, -32, 1500, 1, 100);
        e.f1 = 0.15708;
        e.linkChildAttached(40, -16, -32, 1500, 1, 100);
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 8;
        e.i1 = 6;
        e.f1 = 0.15708;
        e.linkChildAttached(42, 32, 64, 900, -2, 100);
        e.f1 = -0.15708;
        e.linkChildAttached(42, -32, 64, 900, -2, 100);
        e.i0 = 8;
        e.i1 = 2;
        e.f1 = -0.15708;
        e.linkChildAttached(42, 64, 0, 1600, -2, 100);
        e.f1 = 0.15708;
        e.linkChildAttached(42, -64, 0, 1600, -2, 100);
        e.i0 = 8;
        e.i1 = 6;
        e.f1 = -0.15708;
        e.linkChildAttached(42, 32, -64, 1600, 1, 100);
        e.f1 = 0.15708;
        e.linkChildAttached(42, -32, -64, 1600, 1, 100);
        yield 200;
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 6;
        break;
      }
      case 6: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 7;
        break;
      }
      case 7: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 9;
        break;
      }
      case 9: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        pc = 3;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 3;
        }
        e.f0 = 1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 45;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 18;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 15;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 2.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 2.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 3;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i7);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i7);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        yield e.delay(e.i7);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 4,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 4,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        e.f1 *= 0.96;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.i7);
        pc = 2;
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
        e.callSubAlloc(0, 39); // op 135
        yield 620;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 3;
        }
        e.f0 = 1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 45;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 18;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 15;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1.8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 2.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 2.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 3.6;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i7);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        yield e.delay(e.i7);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        yield e.delay(e.i7);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2712) /* i2 */,
            count: 8,
            rings: 1,
            speed: reg(0x2726) /* f6 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: reg(0x2711) /* i1 */,
            count: 8,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 99
        }
        e.f0 += e.f1;
        e.f1 *= 0.96;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.i7);
        pc = 2;
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
        e.callSubAlloc(0, 41); // op 135
        yield 520;
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
        if (e.timeOrbReady >= 2) {
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
        e.setLives(1800);
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
        e.setDeathCallbackSub(76); // op 130
        yield* sub_71(e);
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(46); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2040, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('始符「エフェメラリティ137」', '上白沢慧音', 36, 0, 20000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('始符「エフェメラリティ137」', '上白沢慧音', 37, 0, 20000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('始符「エフェメラリティ137」', '上白沢慧音', 38, 0, 20000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 0.785398;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 0.785398;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.916298;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 1.047198;
        }
        e.f1 = 1.7;
        e.i1 = 40;
        e.i2 = 40;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 4;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = 2;
        e.linkChildStandard(45, e.posX, e.posY, e.i2, -2, 100);
        e.f0 -= 0.1309;
        e.f1 += 0.3;
        yield e.delay(e.i7);
        e.i0 = 1;
        e.linkChildStandard(45, e.posX, e.posY, e.i1, -2, 100);
        e.f1 += 0.3;
        e.f0 -= 0.1309;
        e.i1 += 50;
        e.i2 += 50;
        yield e.delay(e.i7);
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1.3); // op 67
        yield 60;
        pc = 6;
        break;
      }
      case 6: {
        e.autoAnm();
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 5;
        }
        e.f0 = 2.356194;
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2.356194;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2.356194;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.225295;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2.094395;
        }
        e.f1 = 1.7;
        e.i1 = 40;
        e.i2 = 40;
        pc = 8;
        break;
      }
      case 8: {
        e.i0 = 5;
        e.linkChildStandard(45, e.posX, e.posY, e.i2, -2, 100);
        e.f1 += 0.3;
        e.f0 += 0.1309;
        yield e.delay(e.i7);
        e.i0 = 6;
        e.linkChildStandard(45, e.posX, e.posY, e.i1, -2, 100);
        e.f1 += 0.3;
        e.f0 += 0.1309;
        e.i1 += 50;
        e.i2 += 50;
        yield e.delay(e.i7);
        if (--e.ci0 > 0) {
          pc = 8;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.moveBounce(60, 4, 1.3); // op 67
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        pc = 2;
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        pc = 2;
        break;
      }
      case 2: {
        if (e.posX >= 16) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        yield 1;
        pc = 11;
        break;
      }
      case 4: {
        if (e.posX <= 368) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        yield 1;
        pc = 11;
        break;
      }
      case 6: {
        if (e.posY >= 16) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        yield 1;
        pc = 11;
        break;
      }
      case 8: {
        if (e.posY <= 432) {
          yield 1;
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        yield 1;
        pc = 11;
        break;
      }
      case 10: {
        pc = 2;
        break;
      }
      case 11: {
        e.setShotRecord(0, 16, 0, 40, -1, -0.045, -999.900024); // op 111
        e.setShotRecord(1, 16384, 0, 3, e.i0, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 1.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 2.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 3.4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 3.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 9;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 11;
        }
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 7,
          color: 7,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: reg(0x2726) /* f6 */,
          speed2: 2.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x4210 /* ACCELERATE | RESPRITE */,
        }); // op 99
        e.f0 += 0.392699;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 7,
          color: 7,
          count: reg(0x2717) /* i7 */,
          rings: 2,
          speed: reg(0x2727) /* f7 */,
          speed2: 3,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x4210 /* ACCELERATE | RESPRITE */,
        }); // op 99
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
        e.setSpellTimer(99999, 75); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.spawnItemRandom(10); // op 142
        e.spawnItemBatch(5); // op 168
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_47(e);
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(38); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2040, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('野符「武烈クライシス」', '上白沢慧音', 39, 0, 20000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('野符「将門クライシス」', '上白沢慧音', 40, 0, 20000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('野符「義満クライシス」', '上白沢慧音', 41, 0, 20000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('野符「GHQクライシス」', '上白沢慧音', 42, 0, 20000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(48, 96, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(48, 96, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(48, 96, 128, 1200, -2, 100);
        e.f0 = -1.570796;
        e.f1 = -0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(48, 288, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(48, 288, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(48, 288, 128, 1200, -2, 100);
        if (e.difficulty == 0) {
          yield 180;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = -1.570796;
        e.f1 = -0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(48, 192, 224, 550, -2, 100);
        e.f0 += 3.141593;
        e.linkChildStandard(48, 192, 224, 550, -2, 100);
        e.f1 = 0.07854;
        e.f0 = 3.141593;
        e.linkChildStandard(48, 192, 224, 400, -2, 100);
        e.f0 += 3.141593;
        e.linkChildStandard(48, 192, 224, 400, -2, 100);
        yield 180;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 4,
            count: 1,
            rings: 1,
            speed: 0.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 4,
            count: 1,
            rings: 1,
            speed: 0.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 4,
            count: 1,
            rings: 1,
            speed: 0.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 4,
            count: 1,
            rings: 1,
            speed: 0.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 96
        }
        e.ci3++;
        yield 180;
        pc = 5;
        break;
      }
      case 5: {
        pc = 4;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(41, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 40;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 49); // op 135
        e.setAccel(3600, 0, 0);
        e.f1 /= 7;
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(3600, e.f1, 0);
        yield 3600;
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
          e.i0 = 13;
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
        e.f1 /= -7;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.0125;
        }
        e.setShotRecord(0, 131072, 0, 40, -1, -1, -1); // op 111
        if (e.difficulty != 2) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(1, 16384, 0, 4, 6, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 2: {
        if (e.difficulty != 3) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(1, 16384, 0, 6, 2, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 32, 0, 40, -1, e.f7, e.f1); // op 111
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 1,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 2,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 3,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x24222 /* CURL | RESPRITE | WAIT */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 3,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x24222 /* CURL | RESPRITE | WAIT */,
          }); // op 97
        }
        yield e.delay(e.i0);
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 1,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 2,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 3,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x24222 /* CURL | RESPRITE | WAIT */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 3,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 1.0471976,
            transform: 0x24222 /* CURL | RESPRITE | WAIT */,
          }); // op 97
        }
        yield e.delay(e.i0);
        pc = 5;
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(66); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('国符「三種の神器　剣」', '上白沢慧音', 43, 0, 20000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.ci1 = 0;
        e.callSubAlloc(0, 51); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.062832;
        e.f2 = 0.8;
        e.i0 = 6;
        e.ci0 = 8;
        e.i1 = 80;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(52, 0, 0, e.i1, -2, 100);
        e.f0 -= 0.392699;
        e.i1 += 80;
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield 100;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -1.570796;
        e.f1 = -0.062832;
        e.f2 = 0.8;
        e.i0 = 2;
        e.ci0 = 8;
        e.i1 = 80;
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildRelative(52, 0, 0, e.i1, -2, 100);
        e.f0 += 0.392699;
        e.i1 += 80;
        yield 4;
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
        e.moveBounce(60, 4, 1.2); // op 67
        e.ci3++;
        yield 160;
        pc = 10;
        break;
      }
      case 10: {
        pc = 2;
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
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 32,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.3926991,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 99
        if (e.hpRatio >= 128) {
          yield 180;
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 10,
          count: 32,
          rings: 2,
          speed: 2.2,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        yield 180;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(51, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 53); // op 135
        e.setAccel(180, e.f1, 0);
        yield 180;
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
        e.f1 = e.f2 / 3;
        e.ci0 = 16;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 4,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.7853982,
          transform: 0x202,
        }); // op 97
        yield 8;
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(66); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('国符「三種の神器　玉」', '上白沢慧音', 44, 0, 20000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.ci1 = 0;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.034907;
        e.f2 = 0.8;
        e.i0 = 6;
        e.ci0 = 8;
        e.i1 = 120;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(56, 0, 0, e.i1, -2, 100);
        e.f0 -= 0.19635;
        e.i1 += 40;
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = -1.570796;
        e.f1 = -0.034907;
        e.f2 = 0.8;
        e.i0 = 2;
        e.ci0 = 8;
        e.i1 = 120;
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(56, 0, 0, e.i1, -2, 100);
        e.f0 += 0.19635;
        e.i1 += 40;
        yield 4;
        pc = 7;
        break;
      }
      case 7: {
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        if (e.ci1 != 0) {
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.callSubAlloc(0, 55); // op 135
        e.ci1 = 1;
        pc = 10;
        break;
      }
      case 10: {
        e.moveBounce(60, 4, 1.2); // op 67
        e.ci3++;
        yield 180;
        pc = 11;
        break;
      }
      case 11: {
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = -0.034907;
        e.f2 = 0.8;
        e.i0 = 6;
        e.ci0 = 8;
        e.i1 = 80;
        pc = 12;
        break;
      }
      case 12: {
        e.linkChildRelative(56, 0, 0, e.i1, -2, 100);
        e.f0 += 0.19635;
        e.i1 += 40;
        yield 4;
        pc = 13;
        break;
      }
      case 13: {
        if (--e.ci0 > 0) {
          pc = 12;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        e.f0 = -1.570796;
        e.f1 = 0.034907;
        e.f2 = 0.8;
        e.i0 = 2;
        e.ci0 = 8;
        e.i1 = 80;
        pc = 15;
        break;
      }
      case 15: {
        e.linkChildRelative(56, 0, 0, 40, -2, 100);
        e.f0 -= 0.19635;
        e.i1 += 40;
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
        if (e.ci1 != 0) {
          pc = 19;
          break;
        }
        pc = 18;
        break;
      }
      case 18: {
        e.callSubAlloc(0, 55); // op 135
        e.ci1 = 1;
        pc = 19;
        break;
      }
      case 19: {
        e.moveBounce(60, 4, 1.2); // op 67
        e.ci3++;
        yield 180;
        pc = 20;
        break;
      }
      case 20: {
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
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 0,
          count: 3,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.3926991,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        if (e.hpRatio >= 128) {
          yield 180;
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 4,
          count: 32,
          rings: 2,
          speed: 2.2,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        yield 180;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(91, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 57); // op 135
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(8192);
        yield 3600;
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
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.f1 = e.f2 / 3;
        e.ci0 = 16;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.7853982,
          transform: 0x202,
        }); // op 97
        e.f0 += e.f1;
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(66); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('国符「三種の神器　鏡」', '上白沢慧音', 45, 0, 20000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.ci1 = 0;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.034907;
        e.f2 = 0.8;
        e.i0 = 6;
        e.ci0 = 8;
        e.i1 = 200;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(60, 0, 0, e.i1, -2, 100);
        e.f0 -= 0.19635;
        e.i1 += 20;
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = -1.570796;
        e.f1 = -0.034907;
        e.f2 = 0.8;
        e.i0 = 2;
        e.ci0 = 8;
        e.i1 = 200;
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(60, 0, 0, e.i1, -2, 100);
        e.f0 += 0.19635;
        e.i1 += 20;
        yield 4;
        pc = 7;
        break;
      }
      case 7: {
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        if (e.ci1 != 0) {
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.callSubAlloc(0, 59); // op 135
        e.ci1 = 1;
        pc = 10;
        break;
      }
      case 10: {
        e.moveBounce(60, 4, 1.2); // op 67
        e.ci3++;
        yield 180;
        pc = 11;
        break;
      }
      case 11: {
        pc = 2;
        break;
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
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 2,
          count: 7,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.2617994,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 96
        if (e.hpRatio >= 128) {
          yield 180;
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 10,
          count: 32,
          rings: 2,
          speed: 2.2,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        yield 180;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(91, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 61); // op 135
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(8192);
        yield 3600;
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
        if (e.f1 >= 0) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 0;
        pc = 3;
        break;
      }
      case 2: {
        e.f0 = -3.141593;
        pc = 3;
        break;
      }
      case 3: {
        e.f1 = e.f1 * 5;
        e.ci0 = 21;
        e.setShotRecord(0, 2048, 0, 0, -1, 1.3, 0); // op 111
        e.setShotRecord(1, 16384, 0, 4, e.i0, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.7853982,
          transform: 0x4a02 /* BOUNCE_X | RESPRITE */,
        }); // op 97
        e.f0 += e.f1;
        yield 4;
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
        e.setDeathCallbackSub(66); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('国体「三種の神器　郷」', '上白沢慧音', 46, 0, 20000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 5;
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.ci1 = 0;
        e.callSubAlloc(0, 63); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.015708;
        e.f2 = 0.8;
        e.i0 = 6;
        e.ci0 = 8;
        e.i1 = 800;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(64, 0, 0, e.i1, -2, 100);
        e.f0 -= 0.392699;
        e.i1 += 20;
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield 100;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = -1.570796;
        e.f1 = -0.015708;
        e.f2 = 0.8;
        e.i0 = 2;
        e.ci0 = 8;
        e.i1 = 200;
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildRelative(64, 0, 0, 40, -2, 100);
        e.f0 += 0.392699;
        e.i1 += 80;
        yield 4;
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
        e.moveBounce(60, 4, 1.2); // op 67
        e.ci3++;
        yield 160;
        pc = 10;
        break;
      }
      case 10: {
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
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 7,
          color: 3,
          count: 32,
          rings: 2,
          speed: 2,
          speed2: 1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.3926991,
          transform: 0x201 /* BIRTH_PUSH */,
        }); // op 99
        if (e.hpRatio >= 128) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 10,
          count: 32,
          rings: 2,
          speed: 2.2,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        pc = 2;
        break;
      }
      case 2: {
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
        e.moveOrbit(51, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 65); // op 135
        e.setAccel(180, e.f1, 0);
        yield 180;
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
        e.f1 = e.f2 / 3;
        e.ci0 = 16;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 5,
          color: reg(0x2710) /* i0 */,
          count: 2,
          rings: 2,
          speed: 2.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.7853982,
          transform: 0x200,
        }); // op 97
        yield 8;
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
        e.setSpellTimer(99999, 75); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.spawnItemRandom(10); // op 142
        e.spawnItemBatch(5); // op 168
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_67(e);
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
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(75); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1920, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('終符「幻想天皇」', '上白沢慧音', 47, 0, 20000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('終符「幻想天皇」', '上白沢慧音', 48, 0, 20000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('虚史「幻想郷伝説」', '上白沢慧音', 49, 0, 20000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('虚史「幻想郷伝説」', '上白沢慧音', 50, 0, 20000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(69, 96, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(69, 96, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(69, 96, 128, 1200, -2, 100);
        e.f0 = -1.570796;
        e.f1 = -0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(69, 288, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(69, 288, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(69, 288, 128, 1200, -2, 100);
        e.f0 = 0;
        e.f1 = -0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(69, 192, 224, 500, -2, 100);
        e.f0 += 3.141593;
        e.linkChildStandard(69, 192, 224, 500, -2, 100);
        e.f1 = 0.07854;
        e.f0 = 3.141593;
        e.linkChildStandard(69, 192, 224, 300, -2, 100);
        e.f0 += 3.141593;
        e.linkChildStandard(69, 192, 224, 300, -2, 100);
        e.callSubAlloc(0, 68); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.ci3++;
        yield 180;
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

export function* sub_68(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 200; // the script starts at frame 200
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
          e.f0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 1.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 1.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2.8;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 300;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i2 = 32;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i2 = 48;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i2 = 56;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i2 = 56;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: reg(0x2711) /* i1 */,
          count: reg(0x2712) /* i2 */,
          rings: 2,
          speed: reg(0x2721) /* f1 */,
          speed2: reg(0x2720) /* f0 */,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        yield e.delay(e.i0);
        pc = 1;
        break;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(41, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 40;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 70); // op 135
        e.setAccel(3600, 0, 0);
        e.f1 /= 7;
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(3600, e.f1, 0);
        yield 3600;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 1.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 1.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 2.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 2.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 100;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 100;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 100;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 150;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i2 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i2 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i2 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i2 = 2;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.playSfx(17);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnLaser({
            aimed: false, // op 114 keeps the absolute angle
            type: 4,
            color: reg(0x2712) /* i2 */,
            angle: reg(0x2720) /* f0 */,
            speed: reg(0x2722) /* f2 */,
            tail: 0,
            head: 0,
            startLength: reg(0x2721) /* f1 */,
            width: 8,
            startTime: 0,
            duration: 2560,
            despawn: 0,
            hitboxStart: 0,
            hitboxEnd: 0,
            flags: 0x0,
          }); // op 114
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnLaser({
            aimed: false, // op 114 keeps the absolute angle
            type: 4,
            color: reg(0x2712) /* i2 */,
            angle: reg(0x2720) /* f0 */,
            speed: reg(0x2722) /* f2 */,
            tail: 0,
            head: 0,
            startLength: reg(0x2721) /* f1 */,
            width: 8,
            startTime: 0,
            duration: 2560,
            despawn: 0,
            hitboxStart: 0,
            hitboxEnd: 0,
            flags: 0x0,
          }); // op 114
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2100, 76); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('未来「高天原」', '上白沢慧音', 51, 0, 20000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('未来「高天原」', '上白沢慧音', 52, 0, 20000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('未来「高天原」', '上白沢慧音', 53, 0, 20000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(120); // op 160
        e.autoAnm();
        e.f0 = -1.570796;
        e.f1 = 0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(73, 96, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(73, 96, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(73, 96, 128, 1200, -2, 100);
        e.f0 = -1.570796;
        e.f1 = -0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(73, 288, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(73, 288, 128, 1200, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(73, 288, 128, 1200, -2, 100);
        e.f0 = 0;
        e.f1 = -0.07854;
        e.f2 = 0.8;
        e.linkChildStandard(73, 192, 224, 500, -2, 100);
        e.f0 += 3.141593;
        e.linkChildStandard(73, 192, 224, 500, -2, 100);
        e.f1 = 0.07854;
        e.f0 = 3.141593;
        e.linkChildStandard(73, 192, 224, 500, -2, 100);
        e.f0 += 3.141593;
        e.linkChildStandard(73, 192, 224, 500, -2, 100);
        e.callSubAlloc(0, 72); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.ci3++;
        yield 180;
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

export function* sub_72(e: EnemyCtx): Generator<number, void, void> {
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
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 30;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 40;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 30;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 32;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 36;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 42;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i2 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i2 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i2 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i2 = 3;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2711) /* i1 */,
          rings: reg(0x2712) /* i2 */,
          speed: reg(0x2720) /* f0 */,
          speed2: 1.2,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 98
        yield e.delay(e.i0);
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(8192);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(41, e.posX, e.posY, e.f0, e.f1, 0, e.f2);
        yield 40;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 74); // op 135
        e.setAccel(3600, 0, 0);
        e.f1 /= 16;
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setAccel(3600, e.f1, 0);
        yield 3600;
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
        e.f0 = Math.atan2(e.cf1 - e.posY, e.cf0 - e.posX);
        e.playSfx(17);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 0,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 6.4e2,
          startLength: 6.4e2,
          width: 12,
          startTime: 120,
          duration: 20,
          despawn: 10,
          hitboxStart: 90,
          hitboxEnd: 10,
          flags: 0x0,
        }); // op 114
        yield 32;
        pc = 1;
        break;
      }
      case 1: {
        pc = 0;
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
