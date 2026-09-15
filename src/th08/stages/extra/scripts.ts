// Auto-generated from ecldata8.ecl by tools/th08/ecl
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
// ecldata8.ecl: 156 subs, translated by tools/th08/ecl
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
        e.setAnm(50);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.callSubAlloc(0, 1); // op 135
        e.setHeadingSpeed(1.570796, 4);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingVel(-0.02618);
        e.setSpeedAccel(-0.033333);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0.033333);
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(0);
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

export function* sub_1(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 60; // the script starts at frame 60
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
        e.ci0 = 2;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 0,
          color: 2,
          count: 4,
          rings: 8,
          speed: 7,
          speed2: 2.8,
          angle: 0,
          angleStep: 0.009817477,
          transform: 0x200,
        }); // op 98
        yield 16;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 0,
          color: 6,
          count: 4,
          rings: 8,
          speed: 7,
          speed2: 2.8,
          angle: 0,
          angleStep: -0.009817477,
          transform: 0x200,
        }); // op 98
        yield 16;
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
        e.setAnm(50);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.callSubAlloc(0, 3); // op 135
        e.setHeadingSpeed(-1.570796, 4);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingVel(0.02618);
        e.setSpeedAccel(-0.033333);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0.033333);
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(0);
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

export function* sub_3(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 100; // the script starts at frame 100
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
        e.ci0 = 3;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 0,
          color: 2,
          count: 1,
          rings: 8,
          speed: 7,
          speed2: 2.8,
          angle: 0,
          angleStep: 0,
          transform: 0x200,
        }); // op 98
        yield 16;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 0,
          color: 6,
          count: 1,
          rings: 8,
          speed: 7,
          speed2: 2.8,
          angle: 0,
          angleStep: 0,
          transform: 0x200,
        }); // op 98
        yield 16;
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
        e.setAnm(50);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.callSubAlloc(0, 5); // op 135
        e.setHeadingSpeed(-1.570796, 4);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingVel(0.02618);
        e.setSpeedAccel(-0.033333);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0.033333);
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(0);
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

export function* sub_5(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 100; // the script starts at frame 100
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
        e.ci0 = 3;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 0,
          color: 2,
          count: 3,
          rings: 8,
          speed: 7,
          speed2: 2.8,
          angle: 0,
          angleStep: 1.0471976,
          transform: 0x200,
        }); // op 96
        yield 16;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 0,
          color: 6,
          count: 3,
          rings: 8,
          speed: 7,
          speed2: 2.8,
          angle: 0,
          angleStep: 1.0471976,
          transform: 0x200,
        }); // op 96
        yield 16;
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
        e.setAnm(52);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.callSubAlloc(0, 7); // op 135
        e.setHeadingSpeed(-1.570796, 4);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingVel(0.02618);
        e.setSpeedAccel(-0.05);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0);
        yield 120;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(0);
        e.setSpeedAccel(0.033333);
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

export function* sub_7(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 60; // the script starts at frame 60
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
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 16, 0, 120, -1, 0.0125, -999); // op 111
        e.ci0 = 64;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 2,
          count: 1,
          rings: 1,
          speed: 0.2,
          speed2: 0.4,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.009817477,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 98
        yield 3;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 6,
          count: 1,
          rings: 1,
          speed: 0.4,
          speed2: 2.8,
          angle: reg(0x2762) /* randAngle */,
          angleStep: -0.009817477,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 98
        yield 3;
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
        e.setAnm(50);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.callSubAlloc(0, 9); // op 135
        e.setHeadingSpeed(1.570796, 4);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingVel(-0.02618);
        e.setSpeedAccel(-0.033333);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0.033333);
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(0);
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

export function* sub_9(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 60; // the script starts at frame 60
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
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 16, 0, 120, -1, 0.0125, -999); // op 111
        e.ci0 = 5;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 4,
          count: 1,
          rings: 1,
          speed: 0.2,
          speed2: 0.4,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.009817477,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 98
        yield 6;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 1,
          color: 8,
          count: 1,
          rings: 1,
          speed: 0.4,
          speed2: 2.8,
          angle: reg(0x2762) /* randAngle */,
          angleStep: -0.009817477,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 98
        yield 6;
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
        e.setAnm(77);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc144(8, 4); // op 144
        e.setMisc160(20); // op 160
        e.f0 = e.randF32 * 0.5;
        e.f0 += 3.8;
        e.movePolar(40, 4, 1.570796, e.f0);
        e.ci2 = 10;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 4,
          count: 3,
          rings: 1,
          speed: 3.2,
          speed2: 0.4,
          angle: 0,
          angleStep: 0.09817477,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 96
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci2 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.timer;
        e.ci0 = 6;
        e.i7 = 6;
        e.f1 = 5;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        yield 5;
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
        e.setHeadingSpeed(-1.570796, 0.5);
        e.f1 = 2;
        e.f0 = e.timer - 0.785398;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.setSpeedAccel(0.016667);
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        e.setSpeedAccel(0);
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
        e.setAnm(83);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(20); // op 160
        e.f0 = e.randF32 * 0.5;
        e.f0 += 3.8;
        e.movePolar(40, 4, 1.570796, e.f0);
        e.ci2 = 10;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 4,
          count: 3,
          rings: 1,
          speed: 3.2,
          speed2: 0.4,
          angle: 0,
          angleStep: 0.09817477,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 96
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci2 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.timer;
        e.ci0 = 6;
        e.i7 = 2;
        e.f1 = 5;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        yield 5;
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
        e.setHeadingSpeed(-1.570796, 0.5);
        e.f1 = 2;
        e.f0 = e.timer - 0.785398;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(12, 0, 0, 100, -2, 100);
        e.setSpeedAccel(0.016667);
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        e.setSpeedAccel(0);
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
        e.setAnm(58);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
        if (e.ci0 != 6) {
          yield 5000;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 13); // op 135
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
        e.i0 = 60;
        e.ci0 = 7;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEnemyAlt(14, 0, 0, 0, 100, -2, 100);
        e.i0 -= 8;
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
        e.clearScriptFlags(8);
        yield e.delay(e.i0);
        e.ci0 = 16;
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = e.randF32S * 32;
        e.cf1 = e.randF32S * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 262144, 0, -1, -1, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: reg(0x2717) /* i7 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.09817477,
          transform: 0x60204 /* FADE_OUT | WAIT */,
        }); // op 99
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
        e.setMisc160(60); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(14, 6); // op 144
        e.movePolar(60, 4, 0.392699, 4);
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
        e.ci0 = 5;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(16, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        e.linkChildAttached(18, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        e.linkChildAttached(20, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 100;
        pc = 6;
        break;
      }
      case 6: {
        e.setHeadingSpeed(-2.356194, 0.6);
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
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
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
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, 2.2); // op 111
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = 6;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.moveAngle - 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: 1,
          rings: 1,
          speed: 1.4,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x240 /* RAMP_TURN */,
        }); // op 99
        yield e.delay(e.i0);
        pc = 2;
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
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 14;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 6,
          count: 2,
          rings: 3,
          speed: 2.6,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.3926991,
          transform: 0x200,
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
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
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
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 13;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 1,
          color: 2,
          count: 2,
          rings: 1,
          speed: 0.8,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.19634955,
          transform: 0x200,
        }); // op 99
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
        e.setMisc160(60); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(14, 6); // op 144
        e.movePolar(60, 4, 0.392699, 3);
        e.f0 = -3.141593;
        e.ci0 = 5;
        pc = 1;
        break;
      }
      case 1: {
        if (e.posX >= 192) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = 0.015708;
        pc = 4;
        break;
      }
      case 3: {
        e.f1 = -0.015708;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildAttached(23, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        if (e.posX >= 192) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f1 = -0.019635;
        pc = 7;
        break;
      }
      case 6: {
        e.f1 = 0.019635;
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildAttached(25, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        if (e.posX >= 192) {
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.f1 = 0.02618;
        pc = 10;
        break;
      }
      case 9: {
        e.f1 = -0.02618;
        pc = 10;
        break;
      }
      case 10: {
        e.linkChildAttached(27, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 11;
        break;
      }
      case 11: {
        e.setHeadingSpeed(0.392699, 0);
        e.f0 = 1.570796;
        e.f1 = 0.05236;
        yield 100;
        pc = 12;
        break;
      }
      case 12: {
        e.setHeadingSpeed(-2.356194, 0.6);
        yield 100;
        pc = 13;
        break;
      }
      case 13: {
        e.setHeadingSpeed(-2.356194, 2);
        yield 5000;
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
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 1.5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 24); // op 135
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
        e.f0 = e.orbitAngle + 1.570796;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
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
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 2);
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
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 5;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 1.570796;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 4,
          count: 2,
          rings: 1,
          speed: 1.3,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
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
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, 3);
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
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i0 = 4;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 1.570796;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: 2,
          rings: 1,
          speed: 1.6,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      case 2: {
        e.i0 = 13;
        return;
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
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(500); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(20, 20); // op 144
        e.movePolar(60, 4, 1.570796, 3);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(30); // op 130
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = -3.141593;
        e.setHeadingSpeed(0.392699, 0);
        e.ci0 = 5;
        yield* sub_85(e);
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        if (e.posX >= 192) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = 0.05236;
        pc = 6;
        break;
      }
      case 5: {
        e.f1 = -0.05236;
        pc = 6;
        break;
      }
      case 6: {
        e.f2 = 2;
        e.linkChildAttached(31, 0, 0, 2400, -2, 100);
        e.f0 += 0.251327;
        if (e.posX >= 192) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f1 = -0.05236;
        pc = 9;
        break;
      }
      case 8: {
        e.f1 = 0.05236;
        pc = 9;
        break;
      }
      case 9: {
        e.f2 = 4;
        e.linkChildAttached(33, 0, 0, 2600, -2, 100);
        e.f0 += 0.251327;
        if (e.posX >= 192) {
          pc = 11;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.f1 = 0.05236;
        pc = 12;
        break;
      }
      case 11: {
        e.f1 = -0.05236;
        pc = 12;
        break;
      }
      case 12: {
        e.f2 = 6;
        e.linkChildAttached(35, 0, 0, 2600, -2, 100);
        e.f0 += 0.251327;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 13;
        break;
      }
      case 13: {
        if (e.posX >= 192) {
          pc = 15;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        e.f1 = -0.05236;
        pc = 16;
        break;
      }
      case 15: {
        e.f1 = 0.05236;
        pc = 16;
        break;
      }
      case 16: {
        e.f2 = 8;
        e.linkChildAttached(37, 0, 0, 2600, -2, 100);
        e.f0 += 0.251327;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 17;
        break;
      }
      case 17: {
        if (e.posX >= 192) {
          pc = 19;
          break;
        }
        pc = 18;
        break;
      }
      case 18: {
        e.f1 = 0.05236;
        pc = 20;
        break;
      }
      case 19: {
        e.f1 = -0.05236;
        pc = 20;
        break;
      }
      case 20: {
        e.f2 = 10;
        e.linkChildAttached(39, 0, 0, 2600, -2, 100);
        e.f0 += 0.251327;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 21;
        break;
      }
      case 21: {
        e.setHeadingSpeed(-1.570796, 0.6);
        yield 5000;
        pc = 22;
        break;
      }
      case 22: {
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
        e.setMisc136(31, 0); // op 136
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, e.f2);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 32); // op 135
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
        e.i0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 1.570796;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.i0);
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, e.f2);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 34); // op 135
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
        e.i0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 4,
          count: 2,
          rings: 1,
          speed: 0.9,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.i0);
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, e.f2);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 36); // op 135
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
        e.i0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 1.570796;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: 2,
          rings: 1,
          speed: 1.1,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      case 2: {
        e.i0 = 13;
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, e.f2);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 38); // op 135
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
        e.i0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 8,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      case 2: {
        e.i0 = 13;
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        e.moveArc(20, e.f0, e.f1, e.f2);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 40); // op 135
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
        e.i0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.orbitAngle + 1.570796;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 10,
          count: 2,
          rings: 1,
          speed: 0.7,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 99
        yield e.delay(e.i0);
        pc = 1;
        break;
      }
      case 2: {
        e.i0 = 13;
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
        e.setAnm(77);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(18); // op 160
        e.movePolar(20, 4, 1.570796, 5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 18,
          color: 4,
          count: 7,
          rings: 1,
          speed: 6,
          speed2: 0.4,
          angle: 0,
          angleStep: 0.31415927,
          transform: 0x202,
        }); // op 96
        e.moveRelative(60, 4, e.playerX, -32); // op 64
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
        e.setAnm(89);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(17); // op 160
        e.movePolar(20, 4, 1.570796, 5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 18,
          color: 5,
          count: 3,
          rings: 5,
          speed: 1e1,
          speed2: 0.4,
          angle: 0,
          angleStep: 1.0471976,
          transform: 0x202,
        }); // op 96
        e.moveRelative(60, 4, e.playerX, -32); // op 64
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
        e.setAnm(77);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(20); // op 160
        e.movePolar(20, 4, 1.570796, 5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 18,
          color: 3,
          count: 1,
          rings: 7,
          speed: 7,
          speed2: 1,
          angle: 1.5707964,
          angleStep: 1.0471976,
          transform: 0x202,
        }); // op 97
        e.moveRelative(60, 4, e.playerX, -32); // op 64
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
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(18); // op 160
        e.movePolar(20, 4, 1.570796, 5);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 2,
          count: 20,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: 0,
          angleStep: 1.0471976,
          transform: 0x202,
        }); // op 98
        e.moveRelative(60, 4, e.playerX, -32); // op 64
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
        e.removeAllBullets();
        e.enemyFunc95(); // op 95
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
        e.clearScriptFlags(56);
        e.spawnEffectAt(63, 16, 0); // op 139
        yield 4;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(63, 16, 0); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(63, 16, 0); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(63, 16, 0); // op 139
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEffectAt(63, 16, 0); // op 139
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffectAt(63, 16, 0); // op 139
        pc = 6;
        break;
      }
      case 6: {
        e.spawnEffectAt(63, 4, 0); // op 139
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.setLives(1900);
        e.setSpellTimer(5940, 51); // op 134
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(51); // op 130
        e.eclSetLives(1);
        e.setRelPos(32, -32);
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
        e.setMisc126(51, 1); // op 126
        yield 30000;
        pc = 8;
        break;
      }
      case 8: {
        pc = 8;
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
        e.setScriptFlags(4);
        e.setMisc144(20, 10); // op 144
        e.setMisc160(320); // op 160
        e.setLives(1900);
        e.eclSetLives(2);
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(55); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3600, 64); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('旧史「旧秘境史　-オールドヒストリー-」', '上白沢慧音', 191, 0, 40000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.callSubAlloc(0, 52); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = 0.15708;
        e.linkChildStandard(54, 64, 128, 1350, -2, 100);
        e.f1 = -0.15708;
        e.linkChildStandard(54, 320, 128, 1350, -2, 100);
        e.f1 = -0.15708;
        e.linkChildStandard(54, 152, 220, 750, -2, 100);
        e.f1 = 0.15708;
        e.linkChildStandard(54, 232, 220, 750, -2, 100);
        yield 200;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        yield 240;
        pc = 4;
        break;
      }
      case 4: {
        e.autoAnm();
        e.f1 = -0.10472;
        e.linkChildStandard(54, 32, 188, 1350, -2, 100);
        e.f1 = 0.10472;
        e.linkChildStandard(54, 352, 188, 1350, -2, 100);
        e.f1 = 0.10472;
        e.linkChildStandard(54, 162, 150, 750, -2, 100);
        e.f1 = -0.10472;
        e.linkChildStandard(54, 222, 150, 750, -2, 100);
        yield 200;
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        yield 240;
        pc = 6;
        break;
      }
      case 6: {
        e.autoAnm();
        pc = 2;
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
        e.setShotRecord(1, 16, 0, 60, -1, 0.033333, -999); // op 111
        yield 200;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(0, 128, 0, 60, 1, 0, -999); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 0.392699, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 0.392699;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 0.785398, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 0.785398;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 1.178097, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 1.178097;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 1.570796, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 1.570796;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -0.392699, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 0.392699;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -0.785398, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 0.785398;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -1.178097, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 1.178097;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -1.570796, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 1.570796;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        yield 4;
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
        e.ci0 = 3;
        e.f0 = 1.570796;
        e.i7 = 4;
        e.f7 = 2;
        e.f6 = 2.5;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        e.ci0 = 12;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        if (--e.ci0 > 0) {
          pc = 3;
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
        e.callSubAlloc(0, 53); // op 135
        yield 200;
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
        e.setSpellTimer(99999, 46); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setScriptFlags(3);
        e.setBossPresent(0);
        e.setMotionClamp(32, 48, 352, 128);
        e.setLives(1900);
        e.eclSetLives(1);
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_56(e);
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
        e.setMisc144(20, 10); // op 144
        e.setMisc160(320); // op 160
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(59); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3600, 59); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('転世「一条戻り橋」', '上白沢慧音', 192, 0, 40000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 0;
        e.f0 = e.randAngle;
        e.f1 = 0.02618;
        e.i0 = 6;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f1 = -0.02244;
        e.i0 = 4;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = 0.02618;
        e.i0 = 6;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f1 = -0.02244;
        e.i0 = 4;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = 0.02618;
        e.i0 = 6;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f1 = -0.02244;
        e.i0 = 4;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = 0.02618;
        e.i0 = 6;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        e.f1 = -0.02244;
        e.i0 = 4;
        e.spawnEnemyAlt(57, 0, 0, 0, 1000, -2, 10);
        yield 400;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 1,
          speed2: 0.8,
          angle: 0,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 96
        yield 120;
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
        e.clearScriptFlags(8);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveOrbit(6000, e.posX, e.posY, e.f0, e.f1, 0, 3);
        e.callSubAlloc(0, 58); // op 135
        e.f1 /= 1.3;
        e.i6 = 60;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 8;
        e.f0 = 0;
        e.setShotRecord(0, 8192, 0, e.i6, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 1, e.i6, -1, -1, -1); // op 111
        e.setShotRecord(2, 262144, 0, -1, -1, -1, -1); // op 111
        pc = 2;
        break;
      }
      case 2: {
        e.f2 = e.orbitAngle + 3.141593;
        e.f2 += e.f0;
        e.f2 = normalizeAngle(e.f2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.1308997,
          transform: 0x62202 /* HOLD | FADE_OUT | WAIT */,
        }); // op 97
        e.f0 += e.f1;
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
        e.i6 += 8;
        if (e.i6 <= 200) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.i6 = 200;
        pc = 6;
        break;
      }
      case 6: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_58(e: EnemyCtx): Generator<number, void, void> {
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
        e.moveOrbit(6000, e.cf0, e.cf1, e.f0, e.f1, 380, 0);
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
        e.setSpellTimer(99999, 46); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setScriptFlags(3);
        e.setBossPresent(0);
        e.setMotionClamp(32, 48, 352, 128);
        e.setLives(1900);
        e.eclSetLives(0);
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_60(e);
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
        e.setScriptFlags(4);
        e.setMisc144(20, 10); // op 144
        e.setMisc160(320); // op 160
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(64); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3600, 64); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('新史「新幻想史　-ネクストヒストリー-」', '上白沢慧音', 193, 0, 40000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.ci3 = 0;
        e.callSubAlloc(0, 61); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = 0.15708;
        e.linkChildStandard(63, 64, 128, 1350, -2, 100);
        e.f1 = -0.15708;
        e.linkChildStandard(63, 320, 128, 1350, -2, 100);
        e.f1 = -0.15708;
        e.linkChildStandard(63, 152, 220, 750, -2, 100);
        e.f1 = 0.15708;
        e.linkChildStandard(63, 232, 220, 750, -2, 100);
        e.f1 = -0.10472;
        e.linkChildStandard(63, 32, 188, 1350, -2, 100);
        e.f1 = 0.10472;
        e.linkChildStandard(63, 352, 188, 1350, -2, 100);
        e.f1 = 0.10472;
        e.linkChildStandard(63, 162, 150, 750, -2, 100);
        e.f1 = -0.10472;
        e.linkChildStandard(63, 222, 150, 750, -2, 100);
        yield 200;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        yield 240;
        pc = 4;
        break;
      }
      case 4: {
        e.autoAnm();
        pc = 2;
        break;
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
        e.setShotRecord(1, 16, 0, 60, -1, 0.033333, -999); // op 111
        yield 200;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(0, 128, 0, 60, 1, 0, -999); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 0.392699, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 0.392699;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 0.785398, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 0.785398;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 1.178097, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 1.178097;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, 1.570796, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 += 1.570796;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -0.392699, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 0.392699;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -0.785398, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 0.785398;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -1.178097, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 1.178097;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        e.setShotRecord(0, 128, 0, 60, 1, -1.570796, 2.5); // op 111
        e.f0 = e.randF32S * 0.392699;
        e.f0 -= 1.570796;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x292 /* ACCELERATE | RAMP_HOME */,
        }); // op 98
        yield 4;
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
        pc = 1;
        break;
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
        e.ci0 = 2;
        e.f0 = 1.570796;
        e.i7 = 8;
        e.f7 = 0.8;
        e.f6 = 1.2;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        e.ci0 = 6;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
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
            type: 2,
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
        if (--e.ci0 > 0) {
          pc = 3;
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
        e.callSubAlloc(0, 62); // op 135
        yield 200;
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
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.clearScriptFlags(3);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.f0 = 0;
        e.ci0 = 6;
        e.playSfx(7);
        pc = 1;
        break;
      }
      case 1: {
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
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        e.endSpell();
        e.setBossPresent(-1);
        e.maxHp = 1;
        yield 2;
        pc = 3;
        break;
      }
      case 3: {
        e.maxHp = 0;
        e.spawnItem(5);
        yield 3000;
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
        e.setAnmScripts6Alt(6); // op 59
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 80);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 93); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(66, 1); // op 126
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setBossPresent(0);
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.eclSetLives(10);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(68); // op 130
        e.setSpellTimer(3600, 93); // op 134
        e.setPhase(0, 2200, 93); // op 133
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
        yield* sub_85(e);
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 67); // op 135
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
        pc = 8;
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 6,
          count: 3,
          rings: 1,
          speed: 2,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 3,
          rings: 1,
          speed: 1.8,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 3,
          rings: 1,
          speed: 1.6,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 3,
          rings: 1,
          speed: 1.4,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 6,
          count: 3,
          rings: 1,
          speed: 1.2,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.285599;
        e.f0 = normalizeAngle(e.f0);
        yield 4;
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.eclSetLives(8);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 68); // op 134
        e.setMisc183(0); // op 183
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(70); // op 130
        e.setSpellTimer(3600, 97); // op 134
        e.setPhase(0, 2200, 97); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setExtraAnmAlt(0, -1); // op 61
        e.setExtraAnmAlt(1, -1); // op 61
        e.setBoundsAlt(0, 0);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 69); // op 135
        yield 180;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1); // op 67
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 3,
          rings: 1,
          speed: 3,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 4,
          rings: 1,
          speed: 2.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 6,
          count: 5,
          rings: 1,
          speed: 2,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 6,
          rings: 1,
          speed: 1.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 7,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.285599;
        e.f0 = normalizeAngle(e.f0);
        yield 10;
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.eclSetLives(7);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 70); // op 134
        e.setMisc183(0); // op 183
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(72); // op 130
        e.setSpellTimer(3600, 100); // op 134
        e.setPhase(0, 2200, 100); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setExtraAnmAlt(0, -1); // op 61
        e.setExtraAnmAlt(1, -1); // op 61
        e.setBoundsAlt(0, 0);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 71); // op 135
        yield 180;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1); // op 67
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 13,
          rings: 1,
          speed: 3,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 14,
          rings: 1,
          speed: 2.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 6,
          count: 15,
          rings: 1,
          speed: 2,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 16,
          rings: 1,
          speed: 1.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 17,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.285599;
        e.f0 = normalizeAngle(e.f0);
        yield 25;
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc144(25, 20); // op 144
        e.spawnItem(3);
        e.setLives(15000);
        e.eclSetLives(6);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 72); // op 134
        e.setMisc183(0); // op 183
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(74); // op 130
        e.setSpellTimer(3600, 103); // op 134
        e.setPhase(0, 2500, 103); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setExtraAnmAlt(0, -1); // op 61
        e.setExtraAnmAlt(1, -1); // op 61
        e.setBoundsAlt(0, 0);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 73); // op 135
        yield 180;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1); // op 67
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 32,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 48,
          rings: 1,
          speed: 1.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 -= 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.f0 += 0.285599;
        e.f0 = normalizeAngle(e.f0);
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc183(0); // op 183
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.eclSetLives(5);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 74); // op 134
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(76); // op 130
        e.setSpellTimer(3600, 108); // op 134
        e.setPhase(0, 2500, 108); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setExtraAnmAlt(0, -1); // op 61
        e.setExtraAnmAlt(1, -1); // op 61
        e.setBoundsAlt(0, 0);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 75); // op 135
        yield 180;
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1); // op 67
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 32,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 48,
          rings: 1,
          speed: 2.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.f0 -= 0.285599;
        e.f0 = normalizeAngle(e.f0);
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc183(0); // op 183
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.eclSetLives(4);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 78); // op 134
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(78); // op 130
        e.setSpellTimer(3600, 113); // op 134
        e.setPhase(0, 2500, 113); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 15); // op 61
        e.setExtraAnmAlt(1, 16); // op 61
        e.setBoundsAlt(256, 32);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, 77); // op 135
        yield 180;
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
        pc = 4;
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = Math.cos(e.randAngle) * 64;
        e.cf1 = Math.sin(e.randAngle) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 32,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.cf0 = Math.cos(e.randAngle) * 64;
        e.cf1 = Math.sin(e.randAngle) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 48,
          rings: 1,
          speed: 2.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.f0 -= 0.285599;
        e.f0 = normalizeAngle(e.f0);
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc183(0); // op 183
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.spawnItem(3);
        e.eclSetLives(3);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 78); // op 134
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(80); // op 130
        e.setSpellTimer(3600, 118); // op 134
        e.setPhase(0, 3000, 118); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 15); // op 61
        e.setExtraAnmAlt(1, 16); // op 61
        e.setBoundsAlt(256, 32);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, 79); // op 135
        yield 180;
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
        pc = 4;
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = Math.cos(e.randAngle) * 64;
        e.cf1 = Math.sin(e.randAngle) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 2,
          count: 32,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.cf0 = Math.cos(e.randAngle) * 64;
        e.cf1 = Math.sin(e.randAngle) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 48,
          rings: 1,
          speed: 2.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x2,
        }); // op 99
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.f0 -= 0.285599;
        e.f0 = normalizeAngle(e.f0);
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc183(0); // op 183
        e.setMisc144(25, 20); // op 144
        e.setLives(15000);
        e.eclSetLives(2);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 80); // op 134
        yield* sub_88(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc160(240); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(82); // op 130
        e.setSpellTimer(3600, 126); // op 134
        e.setPhase(0, 2500, 126); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 15); // op 61
        e.setExtraAnmAlt(1, 16); // op 61
        e.setBoundsAlt(256, 32);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, 81); // op 135
        yield 180;
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
        pc = 4;
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
        e.f0 = -1.570796;
        e.setShotRecord(0, 16, 0, 180, -1, 0.025, -999); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = Math.cos(e.randAngle) * 64;
        e.cf1 = Math.sin(e.randAngle) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 4,
          count: 48,
          rings: 1,
          speed: 1.5,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x212 /* ACCELERATE */,
        }); // op 99
        e.f0 += 0.285599;
        e.f0 = normalizeAngle(e.f0);
        yield 10;
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc183(0); // op 183
        e.setMisc144(25, 20); // op 144
        e.setLives(6000);
        e.eclSetLives(1);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 82); // op 134
        yield* sub_91(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        e.setMisc160(240); // op 160
        yield* sub_131(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(83); // op 130
        e.setSpellTimer(4620, 131); // op 134
        e.setPhase(0, 6000, 131); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        yield 30;
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc183(0); // op 183
        e.setMisc144(25, 20); // op 144
        e.setLives(6000);
        e.eclSetLives(0);
        e.setMotionClamp(32, 48, 352, 128);
        e.setSpellTimer(60000, 80); // op 134
        yield* sub_92(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setLifeBarSlice(0, 0, e.maxHp, 16744576);
        e.setMisc160(240); // op 160
        yield* sub_143(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(86); // op 130
        e.setSpellTimer(5400, 143); // op 134
        e.setPhase(0, 6000, 143); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.ci3 = 0;
        yield 30;
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
        e.setMisc136(24, 0); // op 136
        if (e.i0 >= 7) {
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
        e.setAnmScripts6Alt(6); // op 59
        e.clearScriptFlags(8);
        e.eclSetLives(0);
        e.setBossPresent(0);
        e.setMisc159(1); // op 159
        e.setLives(6000);
        e.setLifeBarSlice(0, 0, e.maxHp, 16752800);
        e.complexSetup(1); // op 176
        e.setRelPos(192, 224);
        e.playSfx(5);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 6;
        break;
      }
      case 6: {
        e.setMisc173(1); // op 173
        e.setScriptFlags(8);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(86); // op 130
        yield* sub_149(e);
        return;
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
        e.complexBossInit(1); // op 184
        e.maxHp = 1;
        e.setMisc129(0); // op 129
        e.maxHp = 1;
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.setScriptFlags(48);
        e.clearScriptFlags(3);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.setMisc136(18, 4); // op 136
        e.f0 = 0;
        e.ci0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(7);
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
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        yield 1;
        pc = 11;
        break;
      }
      case 11: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        e.endSpell();
        e.setBossPresent(-1);
        e.setMisc136(18, 1); // op 136
        yield 2;
        pc = 13;
        break;
      }
      case 13: {
        e.maxHp = 0;
        e.maxHp = 0;
        yield 3000;
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
        e.maxHp = 1;
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.setScriptFlags(48);
        e.clearScriptFlags(3);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.f0 = 0;
        e.ci0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(7);
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
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        yield 1;
        pc = 11;
        break;
      }
      case 11: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        e.endSpell();
        e.setBossPresent(-1);
        yield 2;
        pc = 13;
        break;
      }
      case 13: {
        e.maxHp = 0;
        e.maxHp = 0;
        yield 3000;
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
        e.i7 = e.maxHp;
        e.maxHp = 1;
        e.clearScriptFlags(8);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.f0 = 0;
        e.ci0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(7);
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
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        yield 1;
        pc = 11;
        break;
      }
      case 11: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        yield 20;
        pc = 13;
        break;
      }
      case 13: {
        e.setMisc136(22, 0); // op 136
        e.setRelPos(192, 128);
        yield 50;
        pc = 14;
        break;
      }
      case 14: {
        e.playSfx(5);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 15;
        break;
      }
      case 15: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 16;
        break;
      }
      case 16: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 17;
        break;
      }
      case 17: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 20;
        pc = 18;
        break;
      }
      case 18: {
        e.playSfx(15);
        e.setLives(e.i7);
        e.callSubAlloc(3, 89); // op 135
        e.setScriptFlags(8);
        pc = 19;
        break;
      }
      case 19: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_89(e: EnemyCtx): Generator<number, void, void> {
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
        e.setMisc136(23, 0); // op 136
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_90(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setMisc147(1); // op 147
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_91(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i7 = e.maxHp;
        e.maxHp = 1;
        e.clearScriptFlags(8);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.f0 = 0;
        e.ci0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(7);
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
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        yield 1;
        pc = 11;
        break;
      }
      case 11: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        yield 120;
        pc = 13;
        break;
      }
      case 13: {
        e.setLives(e.i7);
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

export function* sub_92(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.i7 = e.maxHp;
        e.maxHp = 1;
        e.clearScriptFlags(8);
        e.f0 = e.randAngle;
        e.movePolar(60, 4, e.f0, 0.15);
        e.setMisc173(0); // op 173
        e.f0 = 0;
        e.ci0 = 6;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(7);
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
        e.spawnEffectAngle(26, 1, -1, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -32640, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8323200, e.f0, 0, 0); // op 140
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
        e.spawnEffectAngle(26, 1, -8355585, e.f0, 0, 0); // op 140
        yield 1;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        yield 1;
        pc = 11;
        break;
      }
      case 11: {
        e.f0 += 0.19635;
        e.f0 = normalizeAngle(e.f0);
        e.spawnEffectAngle(26, 1, -128, e.f0, 0, 0); // op 140
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.playSfx(18);
        e.spawnEffectAngle(26, 64, -8355585, -999, 0, 0); // op 140
        yield 20;
        pc = 13;
        break;
      }
      case 13: {
        e.setMisc136(22, 0); // op 136
        e.setRelPos(192, 128);
        yield 120;
        pc = 14;
        break;
      }
      case 14: {
        e.playSfx(5);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 15;
        break;
      }
      case 15: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 16;
        break;
      }
      case 16: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 17;
        break;
      }
      case 17: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 20;
        pc = 18;
        break;
      }
      case 18: {
        e.playSfx(15);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 19;
        break;
      }
      case 19: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 20;
        break;
      }
      case 20: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 21;
        break;
      }
      case 21: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 20;
        pc = 22;
        break;
      }
      case 22: {
        e.playSfx(15);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 23;
        break;
      }
      case 23: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 24;
        break;
      }
      case 24: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 25;
        break;
      }
      case 25: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 20;
        pc = 26;
        break;
      }
      case 26: {
        e.playSfx(15);
        e.setLives(e.i7);
        e.setMisc136(23, 0); // op 136
        e.setScriptFlags(8);
        pc = 27;
        break;
      }
      case 27: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_93(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(68); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3600, 68); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('時効「月のいはかさの呪い」', '藤原妹紅', 194, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(300); // op 160
        e.callSubAlloc(0, 94); // op 135
        e.callSubAlloc(1, 95); // op 135
        e.setMisc183(1); // op 183
        e.f0 = -1.570796;
        e.f1 = 0.05236;
        e.linkChildStandard(96, 96, 128, 13500, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(96, 96, 128, 13500, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(96, 96, 128, 13500, -2, 100);
        e.f0 = -1.570796;
        e.f1 = -0.05236;
        e.linkChildStandard(96, 288, 128, 13500, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(96, 288, 128, 13500, -2, 100);
        e.f0 += 2.094395;
        e.linkChildStandard(96, 288, 128, 13500, -2, 100);
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        yield 60;
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

export function* sub_94(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setShotRecord(0, 128, 0, 170, 1, 0, 0.6); // op 111
        e.setShotRecord(1, 16384, 0, 9, 1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 9,
          color: 3,
          count: 4,
          rings: 1,
          speed: 3.4,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x4282 /* RAMP_HOME | RESPRITE */,
        }); // op 99
        e.f1 = e.randAngle / 256;
        e.f0 += 0.125664;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield 15;
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

export function* sub_95(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f0 = 1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 10,
          count: 8,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x200,
        }); // op 99
        e.f0 -= 0.04488;
        e.f0 = normalizeAngle(e.f0);
        yield 10;
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

export function* sub_96(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc160(30); // op 160
        e.setMisc183(1); // op 183
        e.moveOrbit(80000, e.posX, e.posY, e.f0, e.f1, 64, 0);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        yield 80000;
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

export function* sub_97(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(70); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4620, 72); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('不死「火の鳥　-鳳翼天翔-」', '藤原妹紅', 195, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        e.i7 = 20;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = 3.141593;
        e.f1 = e.randF32S * 16;
        e.autoAnm();
        yield 20;
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = e.timer;
        yield* sub_98(e);
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 6;
        break;
      }
      case 6: {
        e.autoAnm();
        yield 20;
        pc = 7;
        break;
      }
      case 7: {
        e.f0 = e.timer;
        yield* sub_98(e);
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1); // op 67
        yield 50;
        pc = 9;
        break;
      }
      case 9: {
        e.autoAnm();
        yield 10;
        pc = 10;
        break;
      }
      case 10: {
        e.f0 = e.timer - 1.570796;
        yield* sub_98(e);
        pc = 11;
        break;
      }
      case 11: {
        e.f0 = e.timer - 1.178097;
        yield* sub_98(e);
        pc = 12;
        break;
      }
      case 12: {
        e.f0 = e.timer - 0.785398;
        yield* sub_98(e);
        pc = 13;
        break;
      }
      case 13: {
        e.f0 = e.timer;
        yield* sub_98(e);
        pc = 14;
        break;
      }
      case 14: {
        e.f0 = e.timer + 0.785398;
        yield* sub_98(e);
        pc = 15;
        break;
      }
      case 15: {
        e.f0 = e.timer + 1.178097;
        yield* sub_98(e);
        pc = 16;
        break;
      }
      case 16: {
        e.f0 = e.timer + 1.570796;
        yield* sub_98(e);
        pc = 17;
        break;
      }
      case 17: {
        if (e.i7 < 2) {
          pc = 19;
          break;
        }
        pc = 18;
        break;
      }
      case 18: {
        e.i7--;
        pc = 19;
        break;
      }
      case 19: {
        yield e.delay(e.i7);
        yield 150;
        pc = 20;
        break;
      }
      case 20: {
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_98(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 16, 0, 120, -1, 0.041667, -999.900024); // op 111
        e.spawnEnemyAlt(99, 0, 0, 0, 1000, -2, 0);
        e.cf0 = Math.cos(e.f0) * 32;
        e.cf1 = Math.sin(e.f0) * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 3.141593;
        e.cf0 = Math.cos(e.f1) * 32;
        e.cf1 = Math.sin(e.f1) * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.094395;
        e.cf0 = Math.cos(e.f1) * 32;
        e.cf1 = Math.sin(e.f1) * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.094395;
        e.cf0 = Math.cos(e.f1) * 32;
        e.cf1 = Math.sin(e.f1) * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.cf0 = Math.cos(e.f0) * 16;
        e.cf1 = Math.sin(e.f0) * 16;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 3.141593;
        e.cf0 = Math.cos(e.f1) * 16;
        e.cf1 = Math.sin(e.f1) * 16;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.094395;
        e.cf0 = Math.cos(e.f1) * 16;
        e.cf1 = Math.sin(e.f1) * 16;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.094395;
        e.cf0 = Math.cos(e.f1) * 16;
        e.cf1 = Math.sin(e.f1) * 16;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.356194;
        e.cf0 = Math.cos(e.f1) * 64;
        e.cf1 = Math.sin(e.f1) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.356194;
        e.cf0 = Math.cos(e.f1) * 64;
        e.cf1 = Math.sin(e.f1) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.094395;
        e.cf0 = Math.cos(e.f1) * 64;
        e.cf1 = Math.sin(e.f1) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.094395;
        e.cf0 = Math.cos(e.f1) * 64;
        e.cf1 = Math.sin(e.f1) * 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.513274;
        e.cf0 = Math.cos(e.f1) * 96;
        e.cf1 = Math.sin(e.f1) * 96;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.513274;
        e.cf0 = Math.cos(e.f1) * 96;
        e.cf1 = Math.sin(e.f1) * 96;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.356194;
        e.cf0 = Math.cos(e.f1) * 96;
        e.cf1 = Math.sin(e.f1) * 96;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.356194;
        e.cf0 = Math.cos(e.f1) * 96;
        e.cf1 = Math.sin(e.f1) * 96;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.356194;
        e.cf0 = Math.cos(e.f1) * 48;
        e.cf1 = Math.sin(e.f1) * 48;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.356194;
        e.cf0 = Math.cos(e.f1) * 48;
        e.cf1 = Math.sin(e.f1) * 48;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.094395;
        e.cf0 = Math.cos(e.f1) * 48;
        e.cf1 = Math.sin(e.f1) * 48;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.094395;
        e.cf0 = Math.cos(e.f1) * 48;
        e.cf1 = Math.sin(e.f1) * 48;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.513274;
        e.cf0 = Math.cos(e.f1) * 80;
        e.cf1 = Math.sin(e.f1) * 80;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.513274;
        e.cf0 = Math.cos(e.f1) * 80;
        e.cf1 = Math.sin(e.f1) * 80;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 + 2.356194;
        e.cf0 = Math.cos(e.f1) * 80;
        e.cf1 = Math.sin(e.f1) * 80;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.f1 = e.f0 - 2.356194;
        e.cf0 = Math.cos(e.f1) * 80;
        e.cf1 = Math.sin(e.f1) * 80;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.setShotOrigin(0, 0); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 1,
          speed: 0.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2212 /* ACCELERATE | HOLD */,
        }); // op 97
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 18,
          color: 1,
          count: 32,
          rings: 1,
          speed: 2.5,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_99(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.clearScriptFlags(8);
        e.setHeadingSpeed(e.f0, 0.3);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(0.025);
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(2, 16, 0, 120, -1, 0.041667, -999.900024); // op 111
        e.setShotSound(-1, -1); // op 113
        e.f1 = 32;
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 150;
        pc = 3;
        break;
      }
      case 3: {
        e.cf0 = Math.cos(e.randAngle) * e.f1;
        e.cf1 = Math.sin(e.randAngle) * e.f1;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 5,
          color: 2,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x22012 /* ACCELERATE | HOLD | WAIT */,
        }); // op 97
        if (e.f1 >= 64) {
          yield 1;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f1 += 1;
        yield 1;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci0 > 0) {
          pc = 3;
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

export function* sub_100(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(72); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3720, 70); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('藤原「滅罪寺院傷」', '藤原妹紅', 196, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(360); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = 3.141593;
        e.f1 = e.randF32S * 16;
        e.linkChildRelative(101, e.f1, 0, 13500, -2, 100);
        e.f0 = 0;
        e.linkChildRelative(101, e.f1, 0, 13500, -2, 100);
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1); // op 67
        yield 120;
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

export function* sub_101(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc160(30); // op 160
        e.setMisc183(1); // op 183
        e.setHeadingSpeed(e.f0, 1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        e.callSubAlloc(0, 102); // op 135
        yield 80000;
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

export function* sub_102(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 1024, 0, 0, -1, 2, 0); // op 111
        e.setShotRecord(1, 16384, 0, 11, 4, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 11,
          color: 6,
          count: 2,
          rings: 1,
          speed: 3.5,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0,
          transform: 0x4600 /* BOUNCE | RESPRITE */,
        }); // op 99
        yield 14;
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

export function* sub_103(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(74); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(5400, 74); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 192); // op 64
        e.startSpell('不死「徐福時空」', '藤原妹紅', 197, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(480); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        e.f2 = 3.141593;
        e.f3 = 1.570796;
        e.callSubAlloc(0, 106); // op 135
        e.callSubAlloc(1, 107); // op 135
        pc = 3;
        break;
      }
      case 3: {
        e.f1 = 1.570796;
        e.f0 = e.f2;
        e.i7 = 6;
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        yield 100;
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -1.570796;
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.i7 = 2;
        e.f3 += 3.141593;
        e.f3 = normalizeAngle(e.f3);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f0 += 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(104, 0, 0, 13500, -2, 100);
        e.f3 += 3.141593;
        e.f3 = normalizeAngle(e.f3);
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

export function* sub_104(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc160(30); // op 160
        e.setShotNoFireRadius(0);
        e.setMisc183(1); // op 183
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        e.i0 = 27;
        e.callSubAlloc(0, 105); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.movePolar(e.i0, 4, e.f0, 3);
        e.f0 += e.f1;
        yield e.delay(e.i0);
        e.i0 += 27;
        e.f0 = normalizeAngle(e.f0);
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

export function* sub_105(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 131072, 0, 70, -1, -1, -1); // op 111
        e.setShotRecord(1, 16, 0, 70, -1, 0.025, e.f3); // op 111
        e.setShotRecord(2, 262144, 0, -1, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 11,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2723) /* f3 */,
          angleStep: 0,
          transform: 0x60212 /* ACCELERATE | FADE_OUT | WAIT */,
        }); // op 97
        yield 4;
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

export function* sub_106(e: EnemyCtx): Generator<number, void, void> {
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.05236;
        e.f0 += -1.570796;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: 85,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.06544985,
          transform: 0x200,
        }); // op 97
        yield 60;
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

export function* sub_107(e: EnemyCtx): Generator<number, void, void> {
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
        e.f0 = -1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.05236;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 2,
          count: 1,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 96
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

export function* sub_108(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(76); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4200, 76); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('滅罪「正直者の死」', '藤原妹紅', 198, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        e.linkChildAttached(109, -96, -16, 13500, -2, 100);
        e.linkChildAttached(109, 96, -16, 13500, -2, 100);
        e.linkChildAttached(109, -64, 32, 13500, -2, 100);
        e.linkChildAttached(109, 64, 32, 13500, -2, 100);
        e.callSubAlloc(0, 111); // op 135
        e.callSubAlloc(1, 112); // op 135
        yield 180;
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

export function* sub_109(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc183(1); // op 183
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        e.callSubAlloc(0, 110); // op 135
        yield 80000;
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

export function* sub_110(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = Math.sin(e.f0);
        e.f1 *= 0.049087;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 6,
          count: 8,
          rings: 1,
          speed: 6.5,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.5235988,
          transform: 0x200,
        }); // op 96
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        yield 2;
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

export function* sub_111(e: EnemyCtx): Generator<number, void, void> {
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
        e.f1 = -0.484329;
        e.ci2 = 120;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.timer + e.f1;
        e.setMisc116(0); // op 116
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 0,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 512,
          startLength: 512,
          width: 16,
          startTime: 60,
          duration: 120,
          despawn: 20,
          hitboxStart: 60,
          hitboxEnd: 20,
          flags: 0x4,
        }); // op 114
        e.playSfx(16);
        e.ci0 = 180;
        pc = 2;
        break;
      }
      case 2: {
        if (e.f1 >= 0) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.setFloatField(0, 0.007854); // op 117
        pc = 5;
        break;
      }
      case 4: {
        e.setFloatField(0, -0.007854); // op 117
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = normalizeAngle(e.f0);
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
        e.f1 *= -1;
        if (e.ci2 <= 20) {
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.ci2 -= 10;
        pc = 9;
        break;
      }
      case 9: {
        yield e.delay(e.ci2);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_112(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 60; // the script starts at frame 60
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
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = Math.sin(e.f0);
        e.f1 *= 0.049087;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 17,
          color: 2,
          count: 15,
          rings: 1,
          speed: 2.5,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.09817477,
          transform: 0x200,
        }); // op 96
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        yield 10;
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

export function* sub_113(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(78); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4200, 78); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('虚人「ウー」', '藤原妹紅', 199, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield* sub_85(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        e.callSubAlloc(0, 117); // op 135
        yield 180;
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

export function* sub_114(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc183(1); // op 183
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        e.setHeadingSpeed(e.f1, 0.5);
        e.callSubAlloc(0, 115); // op 135
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0.116667);
        e.setShotNoFireRadius(0);
        yield 80000;
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

export function* sub_115(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(1, 16, 0, 60, -1, 0.028333, -999.900024); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: 0.05,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: reg(0x2762) /* randAngle */,
          transform: 0x20210 /* ACCELERATE | WAIT */,
        }); // op 96
        e.f0 = normalizeAngle(e.f0);
        yield 6;
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

export function* sub_116(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f0 = e.cxf0 + 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.f1 = e.cxf0;
        e.i7 = e.cxi0;
        e.cf0 = Math.cos(e.f0) * 50;
        e.cf1 = Math.sin(e.f0) * 50;
        e.linkChildRelative(114, e.cf0, e.cf1, 13500, -2, 100);
        e.cf0 *= -1;
        e.cf1 *= -1;
        e.linkChildRelative(114, e.cf0, e.cf1, 13500, -2, 100);
        e.linkChildRelative(114, 0, 0, 13500, -2, 100);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_117(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.fparam0 = 1.570796;
        e.param0 = 2;
        yield* sub_116(e);
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        if (e.playerX >= 192) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.moveRelative(60, 4, 64, e.posY); // op 64
        yield 60;
        pc = 4;
        break;
      }
      case 3: {
        e.moveRelative(60, 4, 320, e.posY); // op 64
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.fparam0 = e.timer;
        e.param0 = 4;
        yield* sub_116(e);
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        if (e.posX >= 192) {
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.moveRelative(200, 0, 320, e.posY); // op 64
        yield 50;
        pc = 8;
        break;
      }
      case 7: {
        e.moveRelative(200, 0, 64, e.posY); // op 64
        yield 50;
        pc = 8;
        break;
      }
      case 8: {
        e.fparam0 = e.timer;
        e.param0 = 2;
        yield* sub_116(e);
        pc = 9;
        break;
      }
      case 9: {
        e.fparam0 = e.timer;
        e.param0 = 4;
        yield* sub_116(e);
        pc = 10;
        break;
      }
      case 10: {
        e.fparam0 = e.timer;
        e.param0 = 6;
        yield* sub_116(e);
        pc = 11;
        break;
      }
      case 11: {
        e.fparam0 = e.timer;
        e.param0 = 8;
        yield* sub_116(e);
        pc = 12;
        break;
      }
      case 12: {
        e.moveRelative(60, 0, 192, e.posY); // op 64
        yield 60;
        pc = 13;
        break;
      }
      case 13: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_118(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(80); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4200, 80); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('不滅「フェニックスの尾」', '藤原妹紅', 200, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield* sub_85(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        e.callSubAlloc(1, 125); // op 135
        e.callSubAlloc(0, 124); // op 135
        yield 180;
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

export function* sub_119(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc183(1); // op 183
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        e.setShotNoFireRadius(0);
        e.setHeadingSpeed(e.f1, 2);
        e.setHeadingVel(e.f2);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 120); // op 135
        e.callSubAlloc(1, 121); // op 135
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(0);
        yield 80000;
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

export function* sub_120(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.008333;
        e.f0 += 0.029167;
        e.f2 = e.randAngle / 50;
        e.f2 += 1.570796;
        e.setShotRecord(0, 16, 0, 90, -1, e.f0, 1.570796); // op 111
        e.setShotRecord(1, 16, 0, 30, -1, e.f0, e.f2); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: -1.5707964,
          angleStep: 0,
          transform: 0x210 /* ACCELERATE */,
        }); // op 97
        e.f0 = normalizeAngle(e.f0);
        yield 12;
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

export function* sub_121(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 6; // the script starts at frame 6
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.008333;
        e.f0 += 0.029167;
        e.f2 = e.randAngle / 50;
        e.f2 += -1.570796;
        e.setShotRecord(0, 16, 0, 90, -1, e.f0, -1.570796); // op 111
        e.setShotRecord(1, 16, 0, 30, -1, e.f0, e.f2); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: 1.5707964,
          angleStep: 0,
          transform: 0x210 /* ACCELERATE */,
        }); // op 97
        e.f0 = normalizeAngle(e.f0);
        yield 12;
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

export function* sub_122(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f2 = -0.02856;
        e.f1 = 3.141593;
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f1 = -2.945243;
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f1 = -2.748893;
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f2 = -0.012083;
        e.f1 = -2.552544;
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f2 = -0.012083;
        e.f1 = -2.356194;
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_123(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f2 = 0.02856;
        e.f1 = 0;
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f1 = -0.19635;
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f1 = -0.392699;
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f2 = 0.012083;
        e.f1 = -0.589049;
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        e.f2 = 0.012083;
        e.f1 = -0.785398;
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(119, 0, 0, 13500, -2, 100);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_124(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.callSubAlloc(2, 122); // op 135
        e.callSubAlloc(3, 123); // op 135
        yield 180;
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

export function* sub_125(e: EnemyCtx): Generator<number, void, void> {
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
        e.nop(); // op 0
        e.i0 = 180;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 96
        if (e.i0 <= 60) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i0 -= 2;
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

export function* sub_126(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(82); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4200, 82); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('蓬莱「凱風快晴　-フジヤマヴォルケイノ-」', '藤原妹紅', 201, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 14); // op 61
        yield* sub_85(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setBoundsAlt(256, 32);
        yield* sub_130(e);
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, 128); // op 135
        e.moveBounce(60, 4, 1.2); // op 67
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield* sub_130(e);
        pc = 5;
        break;
      }
      case 5: {
        yield* sub_130(e);
        pc = 6;
        break;
      }
      case 6: {
        yield* sub_130(e);
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 128); // op 135
        e.moveBounce(60, 4, 1.2); // op 67
        yield 60;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield* sub_130(e);
        pc = 9;
        break;
      }
      case 9: {
        yield* sub_130(e);
        pc = 10;
        break;
      }
      case 10: {
        yield* sub_130(e);
        pc = 11;
        break;
      }
      case 11: {
        yield* sub_130(e);
        pc = 12;
        break;
      }
      case 12: {
        yield* sub_130(e);
        pc = 13;
        break;
      }
      case 13: {
        yield* sub_130(e);
        pc = 14;
        break;
      }
      case 14: {
        e.callSubAlloc(0, 129); // op 135
        e.moveBounce(60, 4, 1.2); // op 67
        yield 60;
        pc = 15;
        break;
      }
      case 15: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield* sub_130(e);
        pc = 16;
        break;
      }
      case 16: {
        e.callSubAlloc(0, 128); // op 135
        e.moveBounce(60, 4, 1.2); // op 67
        yield 60;
        pc = 17;
        break;
      }
      case 17: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield* sub_130(e);
        pc = 18;
        break;
      }
      case 18: {
        yield* sub_130(e);
        pc = 19;
        break;
      }
      case 19: {
        yield* sub_130(e);
        pc = 20;
        break;
      }
      case 20: {
        e.callSubAlloc(0, 128); // op 135
        e.moveBounce(60, 4, 1.2); // op 67
        yield 60;
        pc = 21;
        break;
      }
      case 21: {
        e.moveBounce(60, 4, 1.2); // op 67
        yield* sub_130(e);
        pc = 22;
        break;
      }
      case 22: {
        yield* sub_130(e);
        pc = 23;
        break;
      }
      case 23: {
        yield* sub_130(e);
        pc = 24;
        break;
      }
      case 24: {
        yield* sub_130(e);
        pc = 25;
        break;
      }
      case 25: {
        yield* sub_130(e);
        pc = 26;
        break;
      }
      case 26: {
        yield* sub_130(e);
        pc = 27;
        break;
      }
      case 27: {
        pc = 14;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_127(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(55);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setHitFlash(1);
        e.setShotNoFireRadius(0);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.f0 = Math.cos(e.f7) * 200;
        e.f1 = Math.sin(e.f7) * 200;
        e.interpSlot(10042 /* posX */, 120, 7, 0, e.cf0, e.playerX, e.f0, 0);
        e.interpSlot(10043 /* posY */, 120, 7, 0, e.cf1, e.playerY, e.f1, 0);
        e.setShotSound(15, -1); // op 113
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        e.f0 = e.f7 - 1.256637;
        e.f1 = e.f7 + 1.256637;
        e.setShotRecord(0, 131072, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(1, 16777216, 0, -2012806909, 4, 0.5, 4); // op 111
        e.setShotRecord(2, 33554432, 0, 1, 16908864, e.f0, e.f1); // op 111
        e.setShotRecord(3, 131072, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(4, 16777216, 0, -2013068794, 3, 2.5, 4); // op 111
        e.setShotRecord(5, 33554432, 0, 1, 16908864, e.f0, e.f1); // op 111
        e.setShotRecord(6, 131072, 0, 10, -1, -1, -1); // op 111
        e.setShotRecord(7, 16777216, 0, -2013265399, 2, 2.5, 4); // op 111
        e.setShotRecord(8, 33554432, 0, 1, 393728, e.f0, e.f1); // op 111
        e.setShotRecord(9, 131072, 0, 10, -1, -1, -1); // op 111
        e.setShotRecord(10, 262144, 0, -1, -1, -1, -1); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 0,
          count: 1,
          rings: 1,
          speed: 4,
          speed2: 0.5,
          angle: reg(0x2727) /* f7 */,
          angleStep: 0,
          transform: 0x1020200 /* WAIT | FORK */,
        }); // op 97
        e.playSfx(15);
        e.clearScriptFlags(8);
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.playSfx(7);
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(8);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_128(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci1 = 10;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 10;
        e.f0 = e.timer;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 6,
          color: 2,
          count: 3,
          rings: 1,
          speed: 6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 97
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
        if (--e.ci1 > 0) {
          pc = 1;
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

export function* sub_129(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 20;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 1,
          color: 2,
          count: 42,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 99
        yield 20;
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

export function* sub_130(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
          type: 1,
          color: 2,
          count: 24,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 99
        e.f7 = 1.570796;
        e.ci0 = 10;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(127, 0, 0, 13500, -2, 100);
        e.f7 += 0.628319;
        e.f7 = normalizeAngle(e.f7);
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

export function* sub_131(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.clearScriptFlags(8);
        e.setMotionClamp(96, 32, 288, 448);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(83); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4620, 83); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 224); // op 64
        e.startSpell('「パゼストバイフェニックス」', '藤原妹紅', 202, 0, 10000000);
        e.setMisc155(1); // op 155
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc183(1); // op 183
        yield 90;
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 32;
        pc = 3;
        break;
      }
      case 3: {
        e.posX = e.playerX;
        e.posY = e.playerY;
        e.spawnEffectAt(17, 4, -1); // op 139
        yield 1;
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
        e.playSfx(15);
        e.spawnEnemyAlt(138, 0, 0, 0, 10000, -2, 0);
        e.callSubAlloc(3, 132); // op 135
        pc = 6;
        break;
      }
      case 6: {
        e.callSubAlloc(0, 133); // op 135
        yield 900;
        pc = 7;
        break;
      }
      case 7: {
        e.nop(); // op 0
        e.callSubAlloc(0, -1); // op 135
        yield 180;
        pc = 8;
        break;
      }
      case 8: {
        e.removeAllBullets();
        e.playSfx(15);
        e.callSubAlloc(0, 135); // op 135
        yield 1200;
        pc = 9;
        break;
      }
      case 9: {
        e.nop(); // op 0
        e.callSubAlloc(0, -1); // op 135
        yield 180;
        pc = 10;
        break;
      }
      case 10: {
        e.removeAllBullets();
        e.playSfx(15);
        e.callSubAlloc(0, 136); // op 135
        yield 840;
        pc = 11;
        break;
      }
      case 11: {
        e.nop(); // op 0
        e.callSubAlloc(0, -1); // op 135
        yield 180;
        pc = 12;
        break;
      }
      case 12: {
        e.removeAllBullets();
        e.callSubAlloc(0, 137); // op 135
        e.callSubAlloc(1, 134); // op 135
        yield 10000;
        pc = 13;
        break;
      }
      case 13: {
        pc = 6;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_132(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.posX = e.playerX;
        e.posY = e.playerY;
        yield 1;
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

export function* sub_133(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(139, 88, -32, 13500, -2, 100);
        e.linkChildRelative(139, -88, -32, 13500, -2, 100);
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
        e.nop(); // op 0
        pc = 4;
        break;
      }
      case 4: {
        e.ci0 = 12;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildRelative(139, 88, -32, 13500, -2, 100);
        e.linkChildRelative(139, -88, -32, 13500, -2, 100);
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
        pc = 4;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_134(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(139, 88, -32, 13500, -2, 100);
        e.linkChildRelative(139, -88, -32, 13500, -2, 100);
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

export function* sub_135(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.linkChildRelative(140, 88, -32, 13500, -2, 100);
        e.linkChildRelative(140, -88, -32, 13500, -2, 100);
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

export function* sub_136(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 120;
        e.f6 = 2.5;
        e.i0 = 120;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(5);
        e.fparam0 = 88;
        yield* sub_142(e);
        pc = 2;
        break;
      }
      case 2: {
        e.fparam0 = -88;
        yield* sub_142(e);
        pc = 3;
        break;
      }
      case 3: {
        e.f6 += 0.1;
        yield e.delay(e.i0);
        if (e.i0 <= 30) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.i0 -= 10;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_137(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.f6 = 1.5;
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(5);
        e.fparam0 = 88;
        yield* sub_142(e);
        pc = 2;
        break;
      }
      case 2: {
        e.fparam0 = -88;
        yield* sub_142(e);
        pc = 3;
        break;
      }
      case 3: {
        e.f6 += 0.1;
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_138(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnmAlt(13);
        e.setExtraAnmAlt(1, 14); // op 61
        e.clearScriptFlags(16);
        e.clearScriptFlags(3);
        e.setMotionClamp(96, 0, 288, 448);
        pc = 1;
        break;
      }
      case 1: {
        e.posX = e.playerX;
        e.posY = e.playerY;
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

export function* sub_139(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc160(30); // op 160
        e.setMisc183(1); // op 183
        e.setShotNoFireRadius(0);
        e.setHeadingSpeed(e.timer, 0.01);
        yield 140;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 1,
          color: 4,
          count: 4,
          rings: 2,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.7853982,
          transform: 0x202,
        }); // op 99
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_140(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc160(30); // op 160
        e.setMisc183(1); // op 183
        e.setShotNoFireRadius(0);
        e.setHeadingSpeed(e.timer, 0.01);
        yield 140;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 6,
          color: 6,
          count: 5,
          rings: 4,
          speed: 5,
          speed2: 0.5,
          angle: 0,
          angleStep: 0,
          transform: 0x202,
        }); // op 98
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_141(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setMisc160(30); // op 160
        e.setMisc183(1); // op 183
        e.setShotNoFireRadius(0);
        e.clearScriptFlags(16);
        e.setHeadingSpeed(e.timer, 0.01);
        e.setShotSound(15, -1); // op 113
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        e.f0 = e.f7 - 1.256637;
        e.f1 = e.f7 + 1.256637;
        e.setShotRecord(0, 131072, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(1, 16777216, 0, -2012806909, 4, 0.5, e.f6); // op 111
        e.setShotRecord(2, 33554432, 0, 1, 16908864, e.f0, e.f1); // op 111
        e.setShotRecord(3, 131072, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(4, 16777216, 0, -2013068794, 3, 1.5, e.f6); // op 111
        e.setShotRecord(5, 33554432, 0, 1, 16908864, e.f0, e.f1); // op 111
        e.setShotRecord(6, 131072, 0, 10, -1, -1, -1); // op 111
        e.setShotRecord(7, 16777216, 0, -2013265399, 2, 1.5, e.f6); // op 111
        e.setShotRecord(8, 33554432, 0, 1, 393728, e.f0, e.f1); // op 111
        e.setShotRecord(9, 131072, 0, 10, -1, -1, -1); // op 111
        e.setShotRecord(10, 262144, 0, -1, -1, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 10,
          color: 0,
          count: 1,
          rings: 1,
          speed: reg(0x2726) /* f6 */,
          speed2: 0.5,
          angle: reg(0x2727) /* f7 */,
          angleStep: 0,
          transform: 0x1020200 /* WAIT | FORK */,
        }); // op 99
        e.playSfx(15);
        e.clearScriptFlags(8);
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.playSfx(7);
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(8);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_142(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.f7 = 1.570796;
        e.ci0 = 8;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(141, e.cxf0, -32, 13500, -2, 100);
        e.f7 += 0.785398;
        e.f7 = normalizeAngle(e.f7);
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

export function* sub_143(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setDeathCallbackSub(46); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(5400, 68); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 128); // op 64
        e.startSpell('「蓬莱人形」', '藤原妹紅', 203, 0, 45000000);
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc183(1); // op 183
        e.setMisc182(1); // op 182
        e.setExtraAnmAlt(0, 13); // op 61
        e.setExtraAnmAlt(1, 17); // op 61
        yield* sub_85(e);
        pc = 2;
        break;
      }
      case 2: {
        e.i7 = 6;
        e.linkChildStandard(144, 0, 448, 13500, -2, 100);
        e.i7 = 2;
        e.linkChildStandard(144, 384, 0, 13500, -2, 100);
        e.callSubAlloc(0, 147); // op 135
        e.callSubAlloc(1, 148); // op 135
        yield 60;
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

export function* sub_144(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setAnm(55);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setHitFlash(1);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.callSubAlloc(0, 145); // op 135
        e.callSubAlloc(1, 146); // op 135
        pc = 1;
        break;
      }
      case 1: {
        if (e.cf1 >= 224) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.cf1 = 448 - e.f0;
        pc = 4;
        break;
      }
      case 3: {
        e.cf1 = 0 + e.f0;
        pc = 4;
        break;
      }
      case 4: {
        e.moveRelative(180, 0, e.cf0, e.cf1); // op 64
        if (e.cf0 >= 192) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.cf0 = 384 - e.f0;
        pc = 7;
        break;
      }
      case 6: {
        e.cf0 = 0 + e.f0;
        pc = 7;
        break;
      }
      case 7: {
        e.f0 += 8;
        yield 170;
        pc = 8;
        break;
      }
      case 8: {
        e.moveRelative(120, 0, e.cf0, e.cf1); // op 64
        yield 110;
        pc = 9;
        break;
      }
      case 9: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_145(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.setShotRecord(0, 131072, 0, 60, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 30;
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(1, 16, 0, 60, -1, 0.033333, e.timer); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: reg(0x2717) /* i7 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0,
          transform: 0x20212 /* ACCELERATE | WAIT */,
        }); // op 96
        yield 4;
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
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_146(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 3000;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: reg(0x2717) /* i7 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0,
          transform: 0x1202,
        }); // op 96
        yield 30;
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

export function* sub_147(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 900; // the script starts at frame 900
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
        yield* sub_85(e);
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32 * 0.5;
        e.f0 += 1.5;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 13,
          count: 32,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        yield 40;
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

export function* sub_148(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 1800; // the script starts at frame 1800
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
        yield* sub_85(e);
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 30;
        e.f0 = e.timer;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 6,
          color: 2,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 97
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
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_149(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
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
        e.setSpellTimer(4740, 68); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 192); // op 64
        e.startSpell('「インペリシャブルシューティング」', '藤原妹紅', 204, 0, 10000000);
        e.setMisc155(1); // op 155
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setMisc173(1); // op 173
        e.clearScriptFlags(3);
        e.setMisc182(1); // op 182
        e.setAnmAlt(12);
        e.setExtraAnmAlt(0, 18); // op 61
        e.setExtraAnmAlt(1, 17); // op 61
        yield* sub_85(e);
        pc = 2;
        break;
      }
      case 2: {
        e.i1 = 160;
        e.f0 = 1.570796;
        e.f7 = 5;
        e.i0 = 6;
        e.ci1 = 60;
        e.ci2 = 10;
        yield* sub_152(e);
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.randAngle;
        e.i1 = 160;
        e.f7 = 5;
        e.ci1 = 60;
        e.ci2 = 70;
        e.cf0 = Math.cos(e.randAngle) * 8;
        e.cf1 = Math.sin(e.randAngle) * 8;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        yield* sub_152(e);
        pc = 4;
        break;
      }
      case 4: {
        e.f0 += 0.314159;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 3;
        e.ci2 = 10;
        e.i0 = 2;
        e.cf0 = Math.cos(e.randAngle) * 12;
        e.cf1 = Math.sin(e.randAngle) * 12;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        yield* sub_152(e);
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = e.timer;
        e.i1 = 112;
        yield* sub_85(e);
        pc = 6;
        break;
      }
      case 6: {
        e.setShotOrigin(-60, 60); // op 110
        e.f7 = 4;
        e.ci1 = 60;
        e.ci2 = 70;
        yield* sub_152(e);
        pc = 7;
        break;
      }
      case 7: {
        e.f0 = e.timer;
        e.f0 = normalizeAngle(e.f0);
        e.setShotOrigin(60, 60); // op 110
        e.f7 = 4;
        e.ci2 = 40;
        e.i0 = 4;
        yield* sub_152(e);
        pc = 8;
        break;
      }
      case 8: {
        e.f0 = e.timer;
        e.f0 = normalizeAngle(e.f0);
        e.setShotOrigin(0, -60); // op 110
        e.f7 = 4;
        e.ci2 = 10;
        e.i0 = 6;
        yield* sub_152(e);
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = e.timer;
        e.i0 = 2;
        e.i1 = 160;
        yield* sub_85(e);
        pc = 10;
        break;
      }
      case 10: {
        e.setShotOrigin(-128, 192); // op 110
        e.f7 = 2.7;
        e.ci1 = 60;
        e.ci2 = 1;
        yield* sub_152(e);
        pc = 11;
        break;
      }
      case 11: {
        e.f0 = e.timer;
        yield* sub_85(e);
        pc = 12;
        break;
      }
      case 12: {
        e.setShotOrigin(128, 128); // op 110
        e.f7 = 2.7;
        e.ci1 = 60;
        e.ci2 = 1;
        e.i0 = 6;
        yield* sub_152(e);
        pc = 13;
        break;
      }
      case 13: {
        e.f0 = e.timer;
        yield* sub_85(e);
        pc = 14;
        break;
      }
      case 14: {
        e.setShotOrigin(-128, 64); // op 110
        e.f7 = 2.7;
        e.ci1 = 60;
        e.ci2 = 1;
        e.i0 = 2;
        yield* sub_152(e);
        pc = 15;
        break;
      }
      case 15: {
        e.f0 += 0.07854;
        yield* sub_85(e);
        pc = 16;
        break;
      }
      case 16: {
        e.setShotOrigin(128, 0); // op 110
        e.f7 = 2.7;
        e.ci1 = 60;
        e.ci2 = 1;
        e.i0 = 6;
        yield* sub_152(e);
        pc = 17;
        break;
      }
      case 17: {
        e.f0 = e.timer;
        yield* sub_85(e);
        pc = 18;
        break;
      }
      case 18: {
        e.setShotOrigin(-128, -64); // op 110
        e.f7 = 2.5;
        e.ci1 = 60;
        e.ci2 = 1;
        e.i0 = 2;
        yield* sub_152(e);
        pc = 19;
        break;
      }
      case 19: {
        e.f0 = 1.570796;
        e.i1 = 144;
        yield* sub_85(e);
        pc = 20;
        break;
      }
      case 20: {
        e.f0 = e.timer;
        e.setShotOrigin(0, 0); // op 110
        e.f7 = 6;
        e.ci1 = 10;
        e.ci2 = 50;
        yield* sub_152(e);
        pc = 21;
        break;
      }
      case 21: {
        e.f0 += 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 5.2;
        e.ci1 = 10;
        e.ci2 = 40;
        e.i0 = 4;
        yield* sub_152(e);
        pc = 22;
        break;
      }
      case 22: {
        e.f0 += 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 4.6;
        e.ci2 = 30;
        e.i0 = 6;
        yield* sub_152(e);
        pc = 23;
        break;
      }
      case 23: {
        e.f0 += 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 3.8;
        e.ci2 = 20;
        e.i0 = 4;
        yield* sub_152(e);
        pc = 24;
        break;
      }
      case 24: {
        e.f0 += 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 3;
        e.ci2 = 10;
        e.i0 = 6;
        yield* sub_152(e);
        pc = 25;
        break;
      }
      case 25: {
        e.f0 = 1.570796;
        e.i1 = 144;
        yield* sub_85(e);
        pc = 26;
        break;
      }
      case 26: {
        e.f0 = e.timer;
        e.setShotOrigin(0, 0); // op 110
        e.f7 = 6;
        e.ci1 = 10;
        e.ci2 = 50;
        e.i0 = 6;
        yield* sub_152(e);
        pc = 27;
        break;
      }
      case 27: {
        e.f0 -= 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 5.2;
        e.ci1 = 10;
        e.ci2 = 40;
        e.i0 = 4;
        yield* sub_152(e);
        pc = 28;
        break;
      }
      case 28: {
        e.f0 -= 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 4.6;
        e.ci2 = 30;
        e.i0 = 2;
        yield* sub_152(e);
        pc = 29;
        break;
      }
      case 29: {
        e.f0 -= 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 3.8;
        e.ci2 = 20;
        e.i0 = 4;
        yield* sub_152(e);
        pc = 30;
        break;
      }
      case 30: {
        e.f0 -= 0.07854;
        e.f0 = normalizeAngle(e.f0);
        e.f7 = 3;
        e.ci2 = 10;
        e.i0 = 2;
        yield* sub_152(e);
        pc = 31;
        break;
      }
      case 31: {
        e.f0 = e.timer;
        e.i1 = 96;
        yield* sub_85(e);
        pc = 32;
        break;
      }
      case 32: {
        e.f0 = e.timer;
        e.setShotOrigin(0.0, 32); // op 110
        e.f7 = 5;
        e.ci1 = 10;
        e.ci2 = 50;
        e.i0 = 10;
        e.f6 = 6.283185 / e.i1;
        yield* sub_153(e);
        pc = 33;
        break;
      }
      case 33: {
        e.f0 += 0;
        e.f0 = normalizeAngle(e.f0);
        e.setShotOrigin(18.809128, -25.888544); // op 110
        e.ci1 = 10;
        e.ci2 = 40;
        e.i0 = 10;
        e.f6 = -6.283185 / e.i1;
        yield* sub_153(e);
        pc = 34;
        break;
      }
      case 34: {
        e.f0 += 0;
        e.f0 = normalizeAngle(e.f0);
        e.setShotOrigin(-30.433809, 9.888544); // op 110
        e.ci2 = 30;
        e.i0 = 10;
        e.f6 = -6.283185 / e.i1;
        yield* sub_153(e);
        pc = 35;
        break;
      }
      case 35: {
        e.f0 += 0;
        e.f0 = normalizeAngle(e.f0);
        e.setShotOrigin(30.433809, 9.888544); // op 110
        e.ci2 = 20;
        e.i0 = 10;
        e.f6 = 6.283185 / e.i1;
        yield* sub_153(e);
        pc = 36;
        break;
      }
      case 36: {
        e.f0 += 0;
        e.f0 = normalizeAngle(e.f0);
        e.setShotOrigin(-18.809128, -25.888544); // op 110
        e.ci2 = 10;
        e.i0 = 10;
        e.f6 = -6.283185 / e.i1;
        yield* sub_153(e);
        pc = 37;
        break;
      }
      case 37: {
        e.f0 = e.timer;
        e.i1 = 96;
        yield* sub_85(e);
        pc = 38;
        break;
      }
      case 38: {
        e.f0 = 0;
        e.setShotOrigin(0, 0); // op 110
        e.f7 = 5;
        e.ci1 = 10;
        e.ci2 = 50;
        e.i0 = 10;
        e.f6 = 6.283185 / e.i1;
        e.i1 = 64;
        yield* sub_85(e);
        pc = 39;
        break;
      }
      case 39: {
        e.f0 = 0;
        e.setShotOrigin(0, 0); // op 110
        e.f7 = 6;
        e.ci1 = 10;
        e.ci2 = 50;
        e.i0 = 6;
        e.f6 = 6.283185 / e.i1;
        e.callSubAlloc(0, 151); // op 135
        e.i1 = 64;
        e.f0 = 0;
        e.setShotOrigin(0, 0); // op 110
        e.f7 = 1;
        e.ci1 = 60;
        e.ci2 = 50;
        e.i0 = 2;
        e.f6 = 6.283185 / e.i1;
        yield 100;
        pc = 40;
        break;
      }
      case 40: {
        e.callSubAlloc(1, 150); // op 135
        yield 6000;
        pc = 41;
        break;
      }
      case 41: {
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_150(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        yield* sub_154(e);
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_154(e);
        pc = 2;
        break;
      }
      case 2: {
        yield* sub_154(e);
        pc = 3;
        break;
      }
      case 3: {
        yield* sub_154(e);
        pc = 4;
        break;
      }
      case 4: {
        yield* sub_154(e);
        pc = 5;
        break;
      }
      case 5: {
        yield* sub_154(e);
        pc = 6;
        break;
      }
      case 6: {
        yield* sub_154(e);
        pc = 7;
        break;
      }
      case 7: {
        yield* sub_154(e);
        pc = 8;
        break;
      }
      case 8: {
        yield* sub_154(e);
        pc = 9;
        break;
      }
      case 9: {
        yield* sub_154(e);
        pc = 10;
        break;
      }
      case 10: {
        yield* sub_154(e);
        pc = 11;
        break;
      }
      case 11: {
        yield* sub_154(e);
        pc = 12;
        break;
      }
      case 12: {
        yield* sub_154(e);
        pc = 13;
        break;
      }
      case 13: {
        yield* sub_154(e);
        pc = 14;
        break;
      }
      case 14: {
        yield* sub_154(e);
        pc = 15;
        break;
      }
      case 15: {
        yield* sub_154(e);
        pc = 16;
        break;
      }
      case 16: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_151(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        yield* sub_155(e);
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_155(e);
        pc = 2;
        break;
      }
      case 2: {
        yield* sub_155(e);
        pc = 3;
        break;
      }
      case 3: {
        yield* sub_155(e);
        pc = 4;
        break;
      }
      case 4: {
        yield* sub_155(e);
        pc = 5;
        break;
      }
      case 5: {
        yield* sub_155(e);
        pc = 6;
        break;
      }
      case 6: {
        yield* sub_155(e);
        pc = 7;
        break;
      }
      case 7: {
        yield* sub_155(e);
        pc = 8;
        break;
      }
      case 8: {
        yield* sub_155(e);
        pc = 9;
        break;
      }
      case 9: {
        yield* sub_155(e);
        pc = 10;
        break;
      }
      case 10: {
        yield* sub_155(e);
        pc = 11;
        break;
      }
      case 11: {
        yield* sub_155(e);
        pc = 12;
        break;
      }
      case 12: {
        yield* sub_155(e);
        pc = 13;
        break;
      }
      case 13: {
        yield* sub_155(e);
        pc = 14;
        break;
      }
      case 14: {
        yield* sub_155(e);
        pc = 15;
        break;
      }
      case 15: {
        yield* sub_155(e);
        pc = 16;
        break;
      }
      case 16: {
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_152(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 8;
        e.f1 = 0.025833;
        e.f2 = 0.025833;
        e.setShotRecord(0, 8192, 0, 500, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 0, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 524288, 0, 16, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 3.141593, 0); // op 111
        e.setShotRecord(7, 64, 0, 1, 1, 0, 0); // op 111
        e.setShotRecord(8, 131072, 0, e.ci2, -1, -1, -1); // op 111
        e.f5 = e.randAngle / 5;
        e.f5 += 3.141593;
        e.f5 = normalizeAngle(e.f5);
        e.setShotRecord(9, 524288, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(10, 64, 0, 1, 1, e.f5, 5); // op 111
        e.nop3(e.f0); // op 3
        e.f6 = 6.283185 / e.i1;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 -= 0.003229;
        e.f2 -= 0.003229;
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 8;
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 += 0.003229;
        e.f2 += 0.003229;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.setShotOrigin(0, 0); // op 110
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_153(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 8;
        e.f1 = 0.025833;
        e.f2 = 0.025833;
        e.setShotRecord(0, 8192, 0, 500, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 0, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 524288, 0, 16, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 3.141593, 0); // op 111
        e.setShotRecord(7, 64, 0, 1, 1, 0, 0); // op 111
        e.setShotRecord(8, 131072, 0, e.ci2, -1, -1, -1); // op 111
        e.f5 = e.randAngle / 5;
        e.f5 += 3.141593;
        e.f5 = normalizeAngle(e.f5);
        e.setShotRecord(9, 524288, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(10, 64, 0, 1, 1, e.f5, 5); // op 111
        e.nop3(e.f0); // op 3
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 -= 0.003229;
        e.f2 -= 0.003229;
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
        e.ci0 = 8;
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 += 0.003229;
        e.f2 += 0.003229;
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
        e.setShotOrigin(0, 0); // op 110
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_154(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 8;
        e.f1 = 0.025833;
        e.f2 = 0.025833;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 8192, 0, 500, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 0, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 524288, 0, 16, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 3.141593, 0); // op 111
        e.setShotRecord(7, 64, 0, 1, 1, 0, 0); // op 111
        e.setShotRecord(8, 131072, 0, e.ci2, -1, -1, -1); // op 111
        e.f5 = e.randAngle / 128;
        e.f5 = normalizeAngle(e.f5);
        e.setShotRecord(9, 524288, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(10, 64, 0, 1, 1, e.f5, 1.5); // op 111
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 6,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 -= 0.003229;
        e.f2 -= 0.003229;
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
        e.ci0 = 8;
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(0, 8192, 0, 500, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 0, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 524288, 0, 16, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 3.141593, 0); // op 111
        e.setShotRecord(7, 64, 0, 1, 1, 0, 0); // op 111
        e.setShotRecord(8, 131072, 0, e.ci2, -1, -1, -1); // op 111
        e.f5 = e.randAngle / 128;
        e.f5 = normalizeAngle(e.f5);
        e.setShotRecord(9, 524288, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(10, 64, 0, 1, 1, e.f5, 1.5); // op 111
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 6,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 += 0.003229;
        e.f2 += 0.003229;
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
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_155(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
        e.ci0 = 8;
        e.f1 = 0.025833;
        e.f2 = 0.025833;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 8192, 0, 500, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 0, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 524288, 0, 16, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 3.141593, 0); // op 111
        e.setShotRecord(7, 64, 0, 1, 1, 0, 0); // op 111
        e.setShotRecord(8, 131072, 0, e.ci2, -1, -1, -1); // op 111
        e.f5 = e.randAngle / 5;
        e.f5 += 3.141593;
        e.f5 = normalizeAngle(e.f5);
        e.setShotRecord(9, 524288, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(10, 64, 0, 1, 1, e.f5, 0.5); // op 111
        e.nop3(e.f0); // op 3
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 6,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 -= 0.003229;
        e.f2 -= 0.003229;
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
        e.ci0 = 8;
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(0, 8192, 0, 500, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 0, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 524288, 0, 16, -1, -1, -1); // op 111
        e.setShotRecord(5, 64, 0, 1, 1, 3.141593, 0); // op 111
        e.setShotRecord(7, 64, 0, 1, 1, 0, 0); // op 111
        e.setShotRecord(8, 131072, 0, e.ci2, -1, -1, -1); // op 111
        e.f5 = e.randAngle / 5;
        e.f5 += 3.141593;
        e.f5 = normalizeAngle(e.f5);
        e.setShotRecord(9, 524288, 0, 15, -1, -1, -1); // op 111
        e.setShotRecord(10, 64, 0, 1, 1, e.f5, 0.5); // op 111
        e.nop3(e.f0); // op 3
        e.setShotRecord(4, 16, 0, 120, -1, e.f1, -999.900024); // op 111
        e.setShotRecord(6, 16, 0, 120, -1, e.f2, -999.900024); // op 111
        e.i2 = e.i1 / 16;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 6,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa3252 /* ACCELERATE | RAMP_TURN | HOLD | SOUND | WAIT */,
        }); // op 99
        e.f0 += e.f6;
        e.f0 = normalizeAngle(e.f0);
        e.f1 += 0.003229;
        e.f2 += 0.003229;
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
        return;
      }
      default:
        return;
    }
  }
}
