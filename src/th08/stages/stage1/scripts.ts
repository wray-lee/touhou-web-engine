// Auto-generated from ecldata1.ecl by tools/th08/ecl
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
// ecldata1.ecl: 53 subs, translated by tools/th08/ecl
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
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 0,
            color: 6,
            count: 1,
            rings: 1,
            speed: 2.2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.f2 = e.timer + 3.141593;
        e.setHeadingSpeed(e.f2, 0.1);
        e.setSpeedAccel(0.01);
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.holdShots(); // op 107
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.6,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 2.6,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.releaseShots(); // op 108
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeatRand(90);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeatRand(30);
        }
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
        e.setAnmScripts6(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.holdShots(); // op 107
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 3,
            rings: 2,
            speed: 1.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 3,
            speed: 3.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.releaseShots(); // op 108
        e.movePolar(60, 4, 1.570796, 2.2);
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 120;
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
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRepeat(e.i0);
        yield 29;
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.6,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 2,
            speed: 2.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = 0;
        e.linkChildAttached(2, 0, 0, 50, -2, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(2, 0, 0, 50, -2, 100);
        yield 120;
        pc = 4;
        break;
      }
      case 4: {
        e.setHeadingSpeed(0.392699, 0.7);
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
        e.setAnm(55);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.moveArc(100, e.f0, 0.05236, 0.64);
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, 0.05236, 0);
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
        e.setAnmScripts6(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.holdShots(); // op 107
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 3,
            rings: 2,
            speed: 1.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: 5,
            rings: 3,
            speed: 3.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.08975979,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.releaseShots(); // op 108
        e.movePolar(60, 4, 1.570796, 2.2);
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 120;
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
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRepeat(e.i0);
        yield 29;
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.6,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 2,
            count: 32,
            rings: 2,
            speed: 2.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = 0;
        e.linkChildAttached(4, 0, 0, 50, -2, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(4, 0, 0, 50, -2, 100);
        yield 120;
        pc = 4;
        break;
      }
      case 4: {
        e.setHeadingSpeed(0.392699, 0.7);
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
        e.setAnm(55);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.moveArc(100, e.f0, -0.05236, 0.64);
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, -0.05236, 0);
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
        e.setAnmScripts6(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.movePolar(60, 4, 1.570796, 2);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 1,
            speed: 1.5,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 2,
            speed: 2.1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        yield 40;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 0;
        e.linkChildAttached(10, 0, 0, 100, -2, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(10, 0, 0, 100, -2, 100);
        e.f0 = 1.570796;
        e.linkChildAttached(10, 0, 0, 100, -2, 100);
        e.f0 = -1.570796;
        e.linkChildAttached(10, 0, 0, 100, -2, 100);
        yield 230;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingSpeed(0, 0.7);
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

export function* sub_6(e: EnemyCtx): Generator<number, void, void> {
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: 1.3,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 128;
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

export function* sub_7(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 40; // the script starts at frame 40
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 32;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 96;
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

export function* sub_8(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 1; // the script starts at frame 1
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 16;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 16;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 2,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 96;
        pc = 4;
        break;
      }
      case 4: {
        pc = 1;
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

export function* sub_9(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 1; // the script starts at frame 1
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 2.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 8;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 2.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 8;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 2.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 8;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 2.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 8;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 6,
          count: 3,
          rings: 1,
          speed: 2.6,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x3 /* BIRTH_PUSH */,
        }); // op 98
        yield 96;
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
        e.setAnm(55);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.moveArc(100, e.f0, -0.05236, 0.64);
        if (e.isDiff(EASY | EXTRA)) {
          e.callSubAlloc(0, 6); // op 135
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.callSubAlloc(0, 7); // op 135
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.callSubAlloc(0, 8); // op 135
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 9); // op 135
        }
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, -0.05236, 0);
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
        e.setAnmScripts6(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.movePolar(60, 4, 1.570796, 2);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 1,
            speed: 1.5,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 2,
            speed: 2.1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 99
        }
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 0;
        e.linkChildAttached(12, 0, 0, 100, -2, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(12, 0, 0, 100, -2, 100);
        e.f0 = 1.570796;
        e.linkChildAttached(12, 0, 0, 100, -2, 100);
        e.f0 = -1.570796;
        e.linkChildAttached(12, 0, 0, 100, -2, 100);
        yield 240;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingSpeed(0, 0.7);
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
        e.setAnm(55);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.moveArc(100, e.f0, 0.05236, 0.64);
        if (e.isDiff(EASY | EXTRA)) {
          e.callSubAlloc(0, 6); // op 135
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.callSubAlloc(0, 7); // op 135
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.callSubAlloc(0, 8); // op 135
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 9); // op 135
        }
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, 0.05236, 0);
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
        e.setAnm(49);
        e.setBounds(24, 24);
        e.f0 = e.randF32S * 0.098175;
        e.f0 += 0;
        e.setHeadingSpeed(e.f0, 3.7);
        e.holdShots(); // op 107
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: 10,
          count: 1,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.18479957,
          transform: 0x208,
        }); // op 96
        e.releaseShots(); // op 108
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeatRand(500);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeatRand(100);
        }
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setLives(6000);
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setSpellTimer(1260, 18); // op 134
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setLives(7300);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setSpellTimer(1260, 22); // op 134
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setPhase(0, 1300, 22); // op 133
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setLifeBarSlice(0, 0, e.maxHp, -1);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setLifeBarSlice(0, e.phase0, e.maxHp, -1);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setLifeBarSlice(1, 0, e.phase0, 16752800);
        }
        e.setRelPos(96, -48);
        e.moveRelative(60, 4, 192, 128); // op 64
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
        yield* sub_16(e);
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
        e.setScriptFlags(4);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(18); // op 130
        e.setMisc144(5, 3); // op 144
        pc = 1;
        break;
      }
      case 1: {
        e.autoAnm();
        e.f0 = e.randAngle * 0.04;
        e.f0 -= 1.570796;
        if (e.difficulty != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(0, 64, 0, 40, 1, 1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 10,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, 1.4); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 10,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 8;
        break;
      }
      case 3: {
        if (e.difficulty != 1) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(0, 64, 0, 40, 1, 1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 10,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, 1.4); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 10,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, 1.570796, 1.3); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 10,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, 1.570796, 1.2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 10,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 8;
        break;
      }
      case 5: {
        if (e.difficulty != 2) {
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.setShotRecord(0, 64, 0, 40, 1, 1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 12,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, 1.4); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 12,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, 1.570796, 1.3); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 12,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, 1.570796, 1.2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 12,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 8;
        break;
      }
      case 7: {
        e.setShotRecord(0, 64, 0, 40, 1, 1.570796, 2.2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 20,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, 2.1); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 20,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, 1.570796, 2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 20,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, 1.570796, 1.9); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 20,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, 1.570796, 1.7); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 20,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, 1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: 20,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 8;
        break;
      }
      case 8: {
        e.f0 = e.randAngle * 0.04;
        e.f0 += 1.570796;
        if (e.difficulty != 0) {
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.setShotRecord(0, 64, 0, 40, 1, -1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 10,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, -1.570796, 1.4); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 10,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 15;
        break;
      }
      case 10: {
        if (e.difficulty != 1) {
          pc = 12;
          break;
        }
        pc = 11;
        break;
      }
      case 11: {
        e.setShotRecord(0, 64, 0, 40, 1, -1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 10,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, -1.570796, 1.4); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 10,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, -1.570796, 1.3); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 10,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, -1.570796, 1.2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 10,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.31415927,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 15;
        break;
      }
      case 12: {
        if (e.difficulty != 2) {
          pc = 14;
          break;
        }
        pc = 13;
        break;
      }
      case 13: {
        e.setShotRecord(0, 64, 0, 40, 1, -1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 12,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, -1.570796, 1.4); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 12,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, -1.570796, 1.3); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 12,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, -1.570796, 1.2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 12,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.22439948,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 15;
        break;
      }
      case 14: {
        e.setShotRecord(0, 64, 0, 40, 1, -1.570796, 2.2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 20,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 50, 1, -1.570796, 2.1); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 20,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, -1.570796, 2); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 20,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, -1.570796, 1.9); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 20,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 60, 1, -1.570796, 1.7); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 20,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, -1.570796, 1.5); // op 111
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: 20,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 96
        yield 60;
        pc = 15;
        break;
      }
      case 15: {
        e.moveRelative(50, 4, 288, 120); // op 64
        yield 120;
        pc = 16;
        break;
      }
      case 16: {
        e.nop(); // op 0
        e.setShotRecord(0, 32, 0, 60, -1, -0.016667, -0.003272); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 0.025;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 0.025;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.033333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 0.041667;
        }
        e.setShotRecord(1, 16, 0, 60, -1, e.f0, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 1,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.9634954,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 3,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.9634954,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 3,
            rings: 6,
            speed: 2,
            speed2: 0.9,
            angle: 1.9634954,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 3,
            rings: 6,
            speed: 3,
            speed2: 0.9,
            angle: 1.9634954,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 7,
          count: 2,
          rings: 6,
          speed: 2,
          speed2: 0.9,
          angle: 1.9634954,
          angleStep: 1.0471976,
          transform: 0x232 /* ACCELERATE | CURL */,
        }); // op 97
        e.setShotRecord(0, 32, 0, 60, -1, -0.016667, 0.003272); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 1,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 3,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 3,
            rings: 6,
            speed: 2,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 3,
            rings: 6,
            speed: 3,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 7,
          count: 2,
          rings: 6,
          speed: 2,
          speed2: 0.9,
          angle: 1.5707964,
          angleStep: 1.0471976,
          transform: 0x232 /* ACCELERATE | CURL */,
        }); // op 97
        yield 60;
        pc = 17;
        break;
      }
      case 17: {
        e.moveRelative(50, 4, 96, 120); // op 64
        yield 100;
        pc = 18;
        break;
      }
      case 18: {
        e.nop(); // op 0
        e.setShotRecord(0, 32, 0, 60, -1, -0.016667, 0.003272); // op 111
        e.setShotRecord(1, 16, 0, 60, -1, e.f0, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.1780972,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.1780972,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 6,
            speed: 2,
            speed2: 0.9,
            angle: 1.1780972,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 6,
            speed: 3,
            speed2: 0.9,
            angle: 1.1780972,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 5,
          count: 2,
          rings: 6,
          speed: 2,
          speed2: 0.9,
          angle: 1.1780972,
          angleStep: 1.0471976,
          transform: 0x232 /* ACCELERATE | CURL */,
        }); // op 97
        e.setShotRecord(0, 32, 0, 60, -1, -0.016667, -0.003272); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 5,
            speed: 2,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 6,
            speed: 2,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 6,
            speed: 3,
            speed2: 0.9,
            angle: 1.5707964,
            angleStep: 0.034906585,
            transform: 0x232 /* ACCELERATE | CURL */,
          }); // op 97
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 5,
          count: 2,
          rings: 6,
          speed: 2,
          speed2: 0.9,
          angle: 1.5707964,
          angleStep: 1.0471976,
          transform: 0x232 /* ACCELERATE | CURL */,
        }); // op 97
        yield 60;
        pc = 19;
        break;
      }
      case 19: {
        e.moveRelative(50, 4, 96, 120); // op 64
        yield 60;
        pc = 20;
        break;
      }
      case 20: {
        e.moveRelative(50, 4, 192, 120); // op 64
        e.f1 = 64;
        yield 80;
        pc = 21;
        break;
      }
      case 21: {
        e.f0 = 0;
        e.autoAnm();
        e.linkChildAttached(19, 0, 0, 100, 1, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(19, 0, 0, 100, 1, 100);
        e.f0 = 1.570796;
        e.linkChildAttached(19, 0, 0, 100, 1, 100);
        e.f0 = -1.570796;
        e.linkChildAttached(19, 0, 0, 100, 1, 100);
        e.f1 = 128;
        yield 80;
        pc = 22;
        break;
      }
      case 22: {
        e.f0 = 0;
        e.linkChildAttached(20, 0, 0, 100, 1, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(20, 0, 0, 100, 1, 100);
        e.f0 = 1.570796;
        e.linkChildAttached(20, 0, 0, 100, 1, 100);
        e.f0 = -1.570796;
        e.linkChildAttached(20, 0, 0, 100, 1, 100);
        e.callSubAlloc(0, 17); // op 135
        yield 6000;
        pc = 23;
        break;
      }
      case 23: {
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 300;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 100;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 40;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 16,
            rings: 1,
            speed: 2,
            speed2: 0.9,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0.034906585,
            transform: 0x200,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 32,
            rings: 1,
            speed: 2,
            speed2: 0.9,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0.034906585,
            transform: 0x200,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 32,
            rings: 1,
            speed: 2,
            speed2: 0.9,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0.034906585,
            transform: 0x200,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 6,
            count: 32,
            rings: 1,
            speed: 3,
            speed2: 0.9,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0.034906585,
            transform: 0x200,
          }); // op 99
        }
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearMotionClamp();
        e.endSpell();
        e.clearScriptFlags(3);
        e.setScriptFlags(16);
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        e.moveRelative(60, 4, 320, -32); // op 64
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.setBossPresent(-1);
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
        e.setAnm(56);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.holdShots(); // op 107
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
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
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 3,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 2,
            rings: 2,
            speed: 2,
            speed2: 1,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        e.releaseShots(); // op 108
        e.f1 /= 100;
        e.moveArc(100, e.f0, -0.02618, e.f1);
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, -0.02618, 0);
        if (e.isDiff(EASY | EXTRA)) {
          e.setShotRepeatRand(30);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setShotRepeatRand(10);
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
        e.setAnm(56);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.holdShots(); // op 107
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 2,
            rings: 1,
            speed: 1.4,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 2,
            count: 2,
            rings: 2,
            speed: 2,
            speed2: 1,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 97
        }
        e.releaseShots(); // op 108
        e.f1 /= 100;
        e.moveArc(100, e.f0, 0.02618, e.f1);
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, 0.02618, 0);
        if (e.isDiff(EASY | EXTRA)) {
          e.setShotRepeatRand(30);
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.setShotRepeatRand(10);
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

export function* sub_21(e: EnemyCtx): Generator<number, void, void> {
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
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 3,
            count: 7,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x200,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 7,
            color: 3,
            count: 9,
            rings: 3,
            speed: 3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x200,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 7,
            color: 3,
            count: 32,
            rings: 1,
            speed: 2.5,
            speed2: 1.5,
            angle: 3.1415927,
            angleStep: 0.14279966,
            transform: 0x200,
          }); // op 98
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 7,
            color: 3,
            count: 32,
            rings: 3,
            speed: 3,
            speed2: 1.5,
            angle: 3.1415927,
            angleStep: 0.14279966,
            transform: 0x200,
          }); // op 98
        }
        yield 100;
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2100, 18); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 144); // op 64
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('蛍符「地上の流星」', 'リグル・ナイトバグ', 0, 0, 10000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('蛍符「地上の彗星」', 'リグル・ナイトバグ', 1, 0, 10000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(18); // op 130
        e.f4 = 64;
        e.callSubAlloc(0, 21); // op 135
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 11;
        }
        e.f0 = 0;
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.005712;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.008976;
        }
        e.autoAnm();
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(24, 0, 0, 40, -2, 100);
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 += 0.785398;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 += 0.571199;
        }
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1); // op 67
        yield 100;
        pc = 5;
        break;
      }
      case 5: {
        e.ci0 = 8;
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 11;
        }
        e.f0 = 0;
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = -0.005712;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = -0.008976;
        }
        e.autoAnm();
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(24, 0, 0, 40, -2, 100);
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 += 0.785398;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 += 0.571199;
        }
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
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
        e.ci0 = 8;
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 13;
        }
        e.f0 = e.randAngle;
        e.f1 = 0;
        e.autoAnm();
        pc = 9;
        break;
      }
      case 9: {
        e.linkChildRelative(24, 0, 0, 40, -2, 100);
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 += 0.628319;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 += 0.483322;
        }
        if (--e.ci0 > 0) {
          pc = 9;
          break;
        }
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
        e.setShotRecord(0, 8192, 1, 400, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 1, 120, -1, -1, -1); // op 111
        e.setShotRecord(3, 16384, 1, 3, 6, -1, -1); // op 111
        e.setShotRecord(4, 524288, 0, 27, -1, -1, -1); // op 111
        e.setShotRecord(5, 262144, 0, -1, -1, -1, -1); // op 111
        e.f7 = e.randAngle;
        pc = 1;
        break;
      }
      case 1: {
        e.f7 += 0.523599;
        e.f7 = normalizeAngle(e.f7);
        e.f6 = Math.sin(e.f7);
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 *= 32;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 *= 32;
        }
        e.f5 = e.moveAngle + 1.570796;
        e.cf0 = Math.cos(e.f5) * e.f6;
        e.cf1 = Math.sin(e.f5) * e.f6;
        e.cf0 += e.posX;
        e.cf1 += e.posY;
        e.f6 = Math.atan2(e.posY - e.cf1, e.posX - e.cf0);
        e.f0 = Math.hypot(e.cf0 - e.posX, e.cf1 - e.posY);
        e.f0 *= 2;
        e.f0 /= 3600;
        e.setShotRecord(2, 16, 0, 60, -1, e.f0, -999); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 7,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2726) /* f6 */,
          angleStep: 0,
          transform: 0xe6214 /* ACCELERATE | HOLD | RESPRITE | FADE_OUT | SOUND | WAIT */,
        }); // op 99
        e.f7 += 0.19635;
        e.f7 = normalizeAngle(e.f7);
        yield 6;
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
        e.setAnm(56);
        e.setBounds(24, 24);
        e.setHitFlash(1);
        e.clearScriptFlags(3);
        e.setShotNoFireRadius(0);
        if (e.isDiff(HARD | EXTRA)) {
          e.setHeadingSpeed(e.f0, 2);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setHeadingSpeed(e.f0, 2.4);
        }
        e.setHeadingVel(e.f1);
        e.callSubAlloc(0, 23); // op 135
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingVel(0);
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.clearScriptFlags(3);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 38); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(26, 1); // op 126
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setMisc144(6, 4); // op 144
        e.setLives(13000);
        e.eclSetLives(1);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(33); // op 130
        e.setSpellTimer(1800, 38); // op 134
        e.setPhase(0, 1500, 38); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16752800);
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
        pc = 7;
        break;
      }
      case 7: {
        e.autoAnm();
        yield* sub_27(e);
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1.5); // op 67
        e.spawnEffectAt(40, 1, -16711681); // op 139
        e.autoAnm();
        yield 60;
        pc = 9;
        break;
      }
      case 9: {
        e.playSfx(15);
        e.f0 = e.randF32 * 128;
        e.f0 += 128;
        e.f1 = e.randF32 * 48;
        e.f1 += 192;
        e.fparam0 = 0;
        e.fparam1 = -0.05236;
        e.fparam2 = 96;
        e.fparam3 = e.f1;
        yield* sub_28(e);
        pc = 10;
        break;
      }
      case 10: {
        e.f0 = e.randF32 * 128;
        e.f0 += 128;
        e.f1 = e.randF32 * 48;
        e.f1 += 192;
        e.fparam0 = -3.141593;
        e.fparam1 = 0.05236;
        e.fparam2 = 160;
        e.fparam3 = e.f1;
        yield* sub_28(e);
        pc = 11;
        break;
      }
      case 11: {
        e.f0 = e.randF32 * 128;
        e.f0 += 128;
        e.f1 = e.randF32 * 48;
        e.f1 += 192;
        e.fparam0 = 2.356194;
        e.fparam1 = 0.05236;
        e.fparam2 = 224;
        e.fparam3 = e.f1;
        yield* sub_28(e);
        pc = 12;
        break;
      }
      case 12: {
        e.f0 = e.randF32 * 128;
        e.f0 += 128;
        e.f1 = e.randF32 * 48;
        e.f1 += 192;
        e.fparam0 = 0.785398;
        e.fparam1 = -0.05236;
        e.fparam2 = 288;
        e.fparam3 = e.f1;
        yield* sub_28(e);
        pc = 13;
        break;
      }
      case 13: {
        yield* sub_29(e);
        pc = 14;
        break;
      }
      case 14: {
        e.moveBounce(40, 4, 1.6); // op 67
        yield 50;
        pc = 15;
        break;
      }
      case 15: {
        yield* sub_29(e);
        pc = 16;
        break;
      }
      case 16: {
        e.moveBounce(40, 4, 1.6); // op 67
        yield 50;
        pc = 17;
        break;
      }
      case 17: {
        yield* sub_29(e);
        pc = 18;
        break;
      }
      case 18: {
        e.moveBounce(40, 4, 1.6); // op 67
        yield 50;
        pc = 19;
        break;
      }
      case 19: {
        pc = 7;
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
        e.playSfx(5);
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 30;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randAngle * 0.04;
        e.f0 += 1.047198;
        e.f1 = e.f0 + 1.047198;
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.026667;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.026667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.03;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.045;
        }
        e.setShotRecord(1, 16, 0, 60, -1, e.f7, -999); // op 111
        e.setShotRecord(0, 64, 0, 60, 1, -1.832596, 0.3); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 7;
        }
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.14279966,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.14279966,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, -1.832596, 0.2); // op 111
        yield 10;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.15707964,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.15707964,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 80, 1, -1.832596, 0.1); // op 111
        yield 10;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.17453292,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.17453292,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 90, 1, -1.832596, 0); // op 111
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.19634955,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        yield 40;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = e.randAngle * 0.04;
        e.f0 -= 0.897598;
        e.f1 = e.f0 - 1.047198;
        e.setShotRecord(0, 64, 0, 60, 1, 1.832596, 0.3); // op 111
        yield 10;
        pc = 7;
        break;
      }
      case 7: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.14279966,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.14279966,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, 1.832596, 0.2); // op 111
        yield 10;
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.15707964,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.15707964,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 80, 1, 1.832596, 0.1); // op 111
        yield 10;
        pc = 9;
        break;
      }
      case 9: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.17453292,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.17453292,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 90, 1, 1.832596, 0); // op 111
        yield 10;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 13,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.19634955,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        yield 30;
        pc = 11;
        break;
      }
      case 11: {
        e.f0 = e.randAngle * 0.04;
        e.f0 += 0.785398;
        e.f1 = e.f0 + 1.047198;
        e.setShotRecord(0, 64, 0, 60, 1, -1.832596, 0.3); // op 111
        yield 10;
        pc = 12;
        break;
      }
      case 12: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.14279966,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 0.8,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.14279966,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 70, 1, -1.832596, 0.2); // op 111
        yield 10;
        pc = 13;
        break;
      }
      case 13: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.15707964,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.15707964,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 80, 1, -1.832596, 0.1); // op 111
        yield 10;
        pc = 14;
        break;
      }
      case 14: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.17453292,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1.6,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.17453292,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.setShotRecord(0, 64, 0, 90, 1, -1.832596, 0); // op 111
        yield 10;
        pc = 15;
        break;
      }
      case 15: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 2,
          color: 8,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.19634955,
          transform: 0x252 /* ACCELERATE | RAMP_TURN */,
        }); // op 96
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
        e.autoAnm();
        // ECL op 7: e.cxf0 = e.cxf0 is a no-op
        // ECL op 7: e.cxf1 = e.cxf1 is a no-op
        // ECL op 7: e.cxf2 = e.cxf2 is a no-op
        // ECL op 7: e.cxf3 = e.cxf3 is a no-op
        e.linkChildStandard(32, e.posX, e.posY, 120, -2, 100);
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
        e.f0 = 1;
        e.ci0 = 10;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 13,
            count: 1,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 13,
            count: 3,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 13,
            count: 3,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.5235988,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 13,
            count: 5,
            rings: 1,
            speed: reg(0x2720) /* f0 */,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.3926991,
            transform: 0x202,
          }); // op 96
        }
        e.f0 += 0.2;
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
          e.i0 = 40;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 7;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 7;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 1.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 1.3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 1.7;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 10,
          count: 3,
          rings: 1,
          speed: reg(0x2722) /* f2 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 99
        e.f0 += 0.024544;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 8,
          count: 3,
          rings: 1,
          speed: reg(0x2722) /* f2 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 99
        e.f0 += 0.024544;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 6,
          count: 3,
          rings: 1,
          speed: reg(0x2722) /* f2 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 99
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
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 13,
          count: 5,
          rings: 1,
          speed: 1.5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.19634955,
          transform: 0x202,
        }); // op 99
        yield 10;
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
        e.setAnm(56);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.setMisc160(50); // op 160
        e.callSubAlloc(0, 31); // op 135
        e.moveArc(60, e.cxf0, e.cxf1, 1.066667);
        e.callSubAlloc(0, -1); // op 135
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.f2 = e.velocityX * 100;
        e.f3 = e.randSignF(400);
        e.interpSlot(10042 /* posX */, 180, 7, 0, e.posX, e.cxf2, e.f2, e.f3);
        e.f2 = e.velocityY * 100;
        e.f3 = e.randSignF(400);
        e.interpSlot(10043 /* posY */, 180, 7, 0, e.posY, e.cxf3, e.f2, e.f3);
        yield 120;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 30); // op 135
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
        e.setScriptFlags(4);
        e.endSpell();
        e.setMisc144(6, 5); // op 144
        e.setMisc160(150); // op 160
        e.setLives(13000);
        e.eclSetLives(0);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(50); // op 130
        e.setSpellTimer(1920, 44); // op 134
        e.setPhase(0, 1800, 44); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16752800);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.setMotionClamp(32, 48, 352, 128);
        e.moveBounce(60, 4, 1.4); // op 67
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.autoAnm();
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        e.callSubAlloc(0, 34); // op 135
        pc = 3;
        break;
      }
      case 3: {
        e.cxi0 = 180;
        e.cxf1 = 192;
        e.cxf0 = e.timer;
        e.linkChildRelative(36, 0, 0, 200, -1, 100);
        e.cxf0 += 0.785398;
        e.linkChildRelative(36, 0, 0, 200, -1, 100);
        e.cxf0 -= 1.570796;
        e.linkChildRelative(36, 0, 0, 200, -1, 100);
        yield 120;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(80, 4, 1); // op 67
        yield 120;
        pc = 5;
        break;
      }
      case 5: {
        e.nop(); // op 0
        e.autoAnm();
        e.cxi0 = 150;
        e.cxf1 = 160;
        e.cxf0 = e.timer;
        e.linkChildRelative(36, 0, 0, 200, -1, 100);
        e.cxf0 += 0.785398;
        e.linkChildRelative(36, 0, 0, 200, -1, 100);
        e.cxf0 -= 1.570796;
        e.linkChildRelative(36, 0, 0, 200, -1, 100);
        yield 120;
        pc = 6;
        break;
      }
      case 6: {
        e.moveBounce(80, 4, 1); // op 67
        yield 120;
        pc = 7;
        break;
      }
      case 7: {
        e.nop(); // op 0
        e.autoAnm();
        e.cxi0 = 120;
        e.cxf1 = 128;
        e.cxf0 = e.timer + e.f7;
        e.ci0 = 6;
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildRelative(36, 0, 0, 160, -1, 100);
        e.cxf0 -= e.f6;
        yield 10;
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
        e.f7 = -1 * e.f7;
        e.f6 = -1 * e.f6;
        yield 200;
        pc = 11;
        break;
      }
      case 11: {
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
  yield 260; // the script starts at frame 260
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
          e.i0 = 120;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 60;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 10,
            count: 16,
            rings: 1,
            speed: 1.5,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 98
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 10,
            count: 32,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 98
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 10,
            count: 32,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 98
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 10,
            count: 32,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 98
        }
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 2;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.i1 = e.parentChainCount;
        e.i2 = 0;
        if (e.i1 != 1) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.i2 = 1;
        pc = 9;
        break;
      }
      case 3: {
        if (e.i1 >= 3) {
          pc = 7;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.i3 = e.i0 % 2;
        if (e.i3 != 0) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.i2 = 1;
        pc = 6;
        break;
      }
      case 6: {
        pc = 9;
        break;
      }
      case 7: {
        e.i3 = e.i0 % 3;
        if (e.i3 != 0) {
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.i2 = 1;
        pc = 9;
        break;
      }
      case 9: {
        if (e.i2 == 0) {
          pc = 11;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.f0 = e.randF32 * 32;
        e.f0 -= 16;
        e.f1 = e.randF32 * 32;
        e.f1 -= 16;
        e.setShotOrigin(e.f0, e.f1); // op 110
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'randomAngleSpeed', // aim 8 of 96..104
            type: 3,
            color: 13,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 104
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'randomAngleSpeed', // aim 8 of 96..104
            type: 3,
            color: 13,
            count: 1,
            rings: 1,
            speed: 2,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 104
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'randomAngleSpeed', // aim 8 of 96..104
            type: 3,
            color: 13,
            count: 2,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 104
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'randomAngleSpeed', // aim 8 of 96..104
            type: 3,
            color: 13,
            count: 3,
            rings: 1,
            speed: 3.5,
            speed2: 0.5,
            angle: -3.1415927,
            angleStep: 3.1415927,
            transform: 0x209 /* BIRTH_PUSH */,
          }); // op 104
        }
        pc = 11;
        break;
      }
      case 11: {
        e.i0++;
        yield e.delay(e.ci1);
        pc = 1;
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
        e.setAnm(56);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.setMisc160(10); // op 160
        e.f0 = Math.cos(e.cxf0) * e.cxf1;
        e.f1 = Math.sin(e.cxf0) * e.cxf1;
        e.f0 += e.posX;
        e.f1 += e.posY;
        e.f2 = e.randSignF(40);
        e.f3 = e.randSignF(40);
        e.interpSlot(10042 /* posX */, e.cxi0, 7, 0, e.posX, e.f0, e.f2, e.f3);
        e.f2 = e.randSignF(40);
        e.f3 = e.randSignF(40);
        e.interpSlot(10043 /* posY */, e.cxi0, 7, 0, e.posY, e.f1, e.f2, e.f3);
        yield e.delay(e.cxi0);
        e.i0 = 0;
        e.callSubAlloc(0, 35); // op 135
        yield 120;
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
        e.setLives(1600);
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
        e.setMisc173(1); // op 173
        e.setScriptFlags(8);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(51); // op 130
        yield* sub_48(e);
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1920, 33); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('灯符「ファイヤフライフェノメノン」', 'リグル・ナイトバグ', 2, 0, 10000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('灯符「ファイヤフライフェノメノン」', 'リグル・ナイトバグ', 3, 0, 10000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('灯符「ファイヤフライフェノメノン」', 'リグル・ナイトバグ', 4, 0, 10000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('灯符「ファイヤフライフェノメノン」', 'リグル・ナイトバグ', 5, 0, 10000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(33); // op 130
        e.f4 = 64;
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
        e.param0 = 120;
        e.fparam0 = 0;
        e.fparam1 = 3.141593;
        e.fparam2 = e.f4;
        e.param1 = 10;
        yield* sub_39(e);
        pc = 4;
        break;
      }
      case 4: {
        e.param0 = 120;
        e.fparam0 = 1.570796;
        e.fparam1 = 3.141593;
        e.fparam2 = e.f4;
        e.param1 = 60;
        yield* sub_39(e);
        pc = 5;
        break;
      }
      case 5: {
        e.param0 = 120;
        e.fparam0 = 3.141593;
        e.fparam1 = 3.141593;
        e.fparam2 = e.f4;
        e.param1 = 10;
        yield* sub_39(e);
        pc = 6;
        break;
      }
      case 6: {
        e.param0 = 120;
        e.fparam0 = -1.570796;
        e.fparam1 = 3.141593;
        e.fparam2 = e.f4;
        e.param1 = 60;
        yield* sub_39(e);
        pc = 7;
        break;
      }
      case 7: {
        yield* sub_40(e);
        pc = 8;
        break;
      }
      case 8: {
        e.f4 += 24;
        e.moveBounce(60, 4, 2); // op 67
        yield 60;
        pc = 9;
        break;
      }
      case 9: {
        e.spawnEffectAt(40, 1, -16711681); // op 139
        e.autoAnm();
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.param0 = 120;
        e.fparam0 = 0;
        e.fparam1 = -3.141593;
        e.fparam2 = e.f4;
        e.param1 = 10;
        yield* sub_39(e);
        pc = 11;
        break;
      }
      case 11: {
        e.param0 = 120;
        e.fparam0 = 1.570796;
        e.fparam1 = -3.141593;
        e.fparam2 = e.f4;
        e.param1 = 60;
        yield* sub_39(e);
        pc = 12;
        break;
      }
      case 12: {
        e.param0 = 120;
        e.fparam0 = 3.141593;
        e.fparam1 = -3.141593;
        e.fparam2 = e.f4;
        e.param1 = 10;
        yield* sub_39(e);
        pc = 13;
        break;
      }
      case 13: {
        e.param0 = 120;
        e.fparam0 = -1.570796;
        e.fparam1 = -3.141593;
        e.fparam2 = e.f4;
        e.param1 = 60;
        yield* sub_39(e);
        pc = 14;
        break;
      }
      case 14: {
        yield* sub_41(e);
        pc = 15;
        break;
      }
      case 15: {
        e.f4 += 24;
        e.moveBounce(60, 4, 1.5); // op 67
        yield 60;
        pc = 16;
        break;
      }
      case 16: {
        pc = 2;
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
        // ECL op 6: e.cxi0 = e.cxi0 is a no-op
        // ECL op 7: e.cxf0 = e.cxf0 is a no-op
        e.cxf1 = e.cxf1 / e.cxi0;
        e.cxf2 = e.cxf2 / e.cxi0;
        e.linkChildAttached(43, 0, 0, e.cxi1, -2, 100);
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
        e.ci0 = 40;
        e.f0 = -1.570796;
        e.f1 = e.f0;
        e.f2 = 0.098175;
        e.setShotRecord(0, 8192, 1, 270, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(1, 64, 1, 90, 2, -1.570796, 1.4); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 4,
            rings: 1,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 4,
            rings: 2,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 2,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 2,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 3,
            rings: 1,
            speed: 2.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 3,
            rings: 1,
            speed: 2.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        e.setShotRecord(1, 64, 0, 90, 2, 1.570796, -999); // op 111
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 1,
            rings: 1,
            speed: 1.4,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 2,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 1.4,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 4,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 1.8,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 4,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 -= e.f2;
        e.f1 -= e.f2;
        e.f2 *= 1.03;
        yield 9;
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
        e.ci0 = 40;
        e.f0 = -1.570796;
        e.f1 = e.f0;
        e.f2 = 0.098175;
        e.setShotRecord(0, 8192, 1, 270, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(1, 64, 1, 90, 2, -1.570796, 1.4); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 4,
            rings: 1,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 2,
            color: 8,
            count: 4,
            rings: 2,
            speed: 3.4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 99
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 2,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 2,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 3,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 3,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        e.setShotRecord(1, 64, 1, 90, 2, 1.570796, -999); // op 111
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 1,
            rings: 1,
            speed: 1.4,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 2,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 1.4,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 4,
            rings: 1,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 8,
            count: 2,
            rings: 1,
            speed: 1.8,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.2617994,
            transform: 0x2242 /* RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 10,
            count: 4,
            rings: 2,
            speed: 2,
            speed2: 0.5,
            angle: reg(0x2721) /* f1 */,
            angleStep: 0.7853982,
            transform: 0x202,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f0 += e.f2;
        e.f1 -= e.f2;
        e.f2 *= 1.03;
        yield 9;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 100;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 80;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 50;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 20;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2.5;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 5,
            speed: 2.5,
            speed2: 1,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x208,
          }); // op 96
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 5,
            count: 1,
            rings: reg(0x2711) /* i1 */,
            speed: reg(0x2720) /* f0 */,
            speed2: 1,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x208,
          }); // op 96
        }
        yield e.delay(e.i0);
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 5,
            speed: 2.5,
            speed2: 1,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x208,
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
        e.setAnm(55);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.effectWithYoukai(1); // op 174
        e.setMisc160(10); // op 160
        e.f1 /= 100;
        e.moveArc(e.cxi0, e.cxf0, e.cxf1, e.cxf2);
        yield e.delay(e.cxi0);
        e.setAccel(0, e.cxf1, 0);
        e.callSubAlloc(0, 42); // op 135
        yield 960;
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2220, 33); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('蠢符「リトルバグ」', 'リグル・ナイトバグ', 6, 0, 10000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('蠢符「リトルバグストーム」', 'リグル・ナイトバグ', 7, 0, 10000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('蠢符「ナイトバグストーム」', 'リグル・ナイトバグ', 8, 0, 10000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('蠢符「ナイトバグトルネード」', 'リグル・ナイトバグ', 9, 0, 10000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 5;
        }
        e.f4 = 0.049087;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.fparam0 = e.f4;
        yield* sub_47(e);
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1.3); // op 67
        e.cxi0 = 130;
        e.cxf1 = 128;
        e.cxf0 = e.timer + e.f7;
        e.ci0 = 6;
        e.autoAnm();
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(46, 0, 0, 20, -2, 10);
        e.cxf0 -= e.f6;
        yield 10;
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
        e.f7 = -1 * e.f7;
        e.f6 = -1 * e.f6;
        e.f4 = -1 * e.f4;
        e.ci3++;
        yield 180;
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
        e.ci0 = 6;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 2;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32 * 32;
        e.f0 -= 16;
        e.f1 = e.randF32 * 32;
        e.f1 -= 16;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 3,
          color: 8,
          count: 1,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x208,
        }); // op 104
        yield e.delay(e.ci2);
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
        e.setAnm(55);
        e.setBounds(24, 24);
        e.writeScriptFlags(16);
        e.setHitFlash(1);
        e.setMisc160(60); // op 160
        e.f0 = Math.cos(e.cxf0) * e.cxf1;
        e.f1 = Math.sin(e.cxf0) * e.cxf1;
        e.f0 += e.posX;
        e.f1 += e.posY;
        e.f2 = e.randSignF(40);
        e.f3 = e.randSignF(40);
        e.interpSlot(10042 /* posX */, e.cxi0, 7, 0, e.posX, e.f0, e.f2, e.f3);
        e.f2 = e.randSignF(40);
        e.f3 = e.randSignF(40);
        e.interpSlot(10043 /* posY */, e.cxi0, 7, 0, e.posY, e.f1, e.f2, e.f3);
        yield e.delay(e.cxi0);
        e.callSubAlloc(0, 45); // op 135
        yield 84;
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
        e.ci0 = 8;
        e.f0 = -1.570796;
        e.f2 = e.cxf0;
        e.f1 = e.cxf0 * 0.1;
        e.f7 = e.ci3 * 0.2;
        e.f7 += 1;
        e.setShotRecord(0, 8192, 1, 400, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 1, 60, -1, -1, -1); // op 111
        if (e.cxf0 >= 0) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 64, 0, 60, 1, -1.570796, -999); // op 111
        pc = 3;
        break;
      }
      case 2: {
        e.setShotRecord(2, 64, 0, 60, 1, 1.570796, -999); // op 111
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(3, 16384, 0, 3, 0, -1, -1); // op 111
        e.setShotRecord(4, 64, 0, 60, 1, 3.141593, 0); // op 111
        e.setShotRecord(5, 16384, 0, 0, 13, -1, -1); // op 111
        e.setShotRecord(6, 131072, 1, 40, -1, -1, -1); // op 111
        e.setShotRecord(9, 524288, 0, 27, -1, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(7, 64, 0, 60, 1, 1.570796, 1.1); // op 111
        e.setShotRecord(8, 16384, 0, 2, 13, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 60, 1, 1.570796, 2); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 60, 1, 3.141593, 1.2); // op 111
        e.setShotRecord(8, 16384, 0, 2, 11, -1, -1); // op 111
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 60, 1, 3.141593, 2); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 60, 1, -1.570796, 1.3); // op 111
        e.setShotRecord(8, 16384, 0, 2, 10, -1, -1); // op 111
        yield 4;
        pc = 6;
        break;
      }
      case 6: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 60, 1, -1.570796, 2); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.f2 += e.f1;
        yield 4;
        pc = 7;
        break;
      }
      case 7: {
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.ci0 = 8;
        pc = 9;
        break;
      }
      case 9: {
        e.setShotRecord(7, 64, 0, 60, 1, 1.570796, 1.1); // op 111
        e.setShotRecord(8, 16384, 0, 2, 13, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 60, 1, 1.570796, 2); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 60, 1, 3.141593, 1.2); // op 111
        e.setShotRecord(8, 16384, 0, 2, 11, -1, -1); // op 111
        yield 4;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 60, 1, 3.141593, 2); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 60, 1, -1.570796, 1.3); // op 111
        e.setShotRecord(8, 16384, 0, 2, 10, -1, -1); // op 111
        yield 4;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 60, 1, -1.570796, 2); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.f2 -= e.f1;
        yield 4;
        pc = 12;
        break;
      }
      case 12: {
        if (--e.ci0 > 0) {
          pc = 9;
          break;
        }
        pc = 13;
        break;
      }
      case 13: {
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 51); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('隠蟲「永夜蟄居」', 'リグル・ナイトバグ', 10, 0, 10000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('隠蟲「永夜蟄居」', 'リグル・ナイトバグ', 11, 0, 10000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('隠蟲「永夜蟄居」', 'リグル・ナイトバグ', 12, 0, 10000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(120); // op 160
        e.ci3 = 6;
        e.f4 = 0.03927;
        e.f7 = 1.570796;
        e.f6 = e.f7 / 2.5;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.fparam0 = e.f4;
        yield* sub_49(e);
        pc = 3;
        break;
      }
      case 3: {
        e.moveBounce(60, 4, 1.3); // op 67
        e.cxi0 = 130;
        e.cxf1 = 128;
        e.cxf0 = e.timer + e.f7;
        e.ci0 = 6;
        e.autoAnm();
        e.f7 = -1 * e.f7;
        e.f6 = -1 * e.f6;
        e.f4 = -1 * e.f4;
        e.ci3++;
        yield 60;
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
        e.ci0 = 8;
        e.f0 = -1.570796;
        e.f2 = e.cxf0;
        e.f1 = e.cxf0 * 0.1;
        e.f7 = e.ci3 * 0.2;
        e.f7 += 1;
        e.setShotRecord(0, 8192, 1, 400, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 1, 60, -1, -1, -1); // op 111
        if (e.cxf0 >= 0) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 64, 0, 30, 1, -1.570796, -999); // op 111
        pc = 3;
        break;
      }
      case 2: {
        e.setShotRecord(2, 64, 0, 30, 1, 1.570796, -999); // op 111
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(3, 16384, 0, 3, 0, -1, -1); // op 111
        e.setShotRecord(4, 64, 0, 60, 1, 3.141593, 0); // op 111
        e.setShotRecord(5, 16384, 0, 0, 13, -1, -1); // op 111
        e.setShotRecord(6, 131072, 1, 10, -1, -1, -1); // op 111
        e.setShotRecord(9, 524288, 0, 27, -1, -1, -1); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(7, 64, 0, 10, 1, 2.094395, 1.8); // op 111
        e.setShotRecord(8, 16384, 0, 2, 13, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 10, 1, 2.094395, 2.4); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 10, 1, 3.141593, 1.9); // op 111
        e.setShotRecord(8, 16384, 0, 2, 11, -1, -1); // op 111
        yield 3;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 10, 1, 3.141593, 2.4); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 10, 1, -2.094395, 2); // op 111
        e.setShotRecord(8, 16384, 0, 2, 10, -1, -1); // op 111
        yield 2;
        pc = 6;
        break;
      }
      case 6: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 10, 1, -2.094395, 2.6); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.f2 += e.f1;
        yield 2;
        pc = 7;
        break;
      }
      case 7: {
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.ci0 = 8;
        pc = 9;
        break;
      }
      case 9: {
        e.setShotRecord(7, 64, 0, 10, 1, 2.094395, 1.8); // op 111
        e.setShotRecord(8, 16384, 0, 2, 13, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 10, 1, 2.094395, 2.4); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 10, 1, 3.141593, 1.9); // op 111
        e.setShotRecord(8, 16384, 0, 2, 11, -1, -1); // op 111
        yield 2;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 10, 1, 3.141593, 2.4); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.setShotRecord(7, 64, 0, 10, 1, -2.094395, 2); // op 111
        e.setShotRecord(8, 16384, 0, 2, 10, -1, -1); // op 111
        yield 3;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 0,
          color: 0,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
        }); // op 99
        e.setShotRecord(7, 64, 0, 10, 1, -2.094395, 2.6); // op 111
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 1,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 0,
            color: 0,
            count: reg(0x2737) /* ci3 */,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0xa6244 /* RAMP_TURN | HOLD | RESPRITE | SOUND | WAIT */,
          }); // op 99
        }
        e.f7 -= 0.006;
        e.f0 += e.f2;
        e.f2 -= e.f1;
        yield 2;
        pc = 12;
        break;
      }
      case 12: {
        if (--e.ci0 > 0) {
          pc = 9;
          break;
        }
        pc = 13;
        break;
      }
      case 13: {
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
