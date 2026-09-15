// Auto-generated from ecldata2.ecl by tools/th08/ecl
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
// ecldata2.ecl: 65 subs, translated by tools/th08/ecl
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
        e.pauseEnemySpawns(0); // op 175
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
        e.setAnm(50);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.holdShots(); // op 107
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.7,
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
            rings: 2,
            speed: 3,
            speed2: 1.2,
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
          e.setShotRepeatRand(50);
        }
        e.setMisc160(8); // op 160
        e.setHeadingSpeed(0, 4.5);
        yield 35;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(-0.055556);
        e.setHeadingVel(-0.05236);
        yield 90;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingVel(0);
        e.setSpeedAccel(0.05);
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
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.holdShots(); // op 107
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.1,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.3,
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
            rings: 2,
            speed: 2.7,
            speed2: 1,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.releaseShots(); // op 108
        e.setMisc160(8); // op 160
        e.setHeadingSpeed(0, 4.5);
        yield 35;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(-0.055556);
        e.setHeadingVel(-0.05236);
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setShotRepeatRand(90);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeatRand(60);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeatRand(50);
        }
        yield 90;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingVel(0);
        e.setSpeedAccel(0.05);
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
        e.setAnm(51);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.holdShots(); // op 107
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 10,
            count: 1,
            rings: 1,
            speed: 1.4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 10,
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
            type: 1,
            color: 10,
            count: 1,
            rings: 2,
            speed: 2.6,
            speed2: 1.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        e.releaseShots(); // op 108
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setShotRepeatRand(60);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeatRand(50);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeatRand(30);
        }
        e.setMisc160(10); // op 160
        e.setHeadingSpeed(1.570796, 4.5);
        yield 35;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(-0.055556);
        e.setHeadingVel(-0.05236);
        yield 90;
        pc = 2;
        break;
      }
      case 2: {
        e.setHeadingVel(0);
        e.setSpeedAccel(0.05);
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
        e.setAnm(24);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.holdShots(); // op 107
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.1,
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
            speed: 1.7,
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
          e.setShotRepeatRand(50);
        }
        e.setMisc160(20); // op 160
        e.f0 = e.randF32 * 0.5;
        e.f0 += 1.8;
        e.movePolar(60, 4, 1.570796, e.f0);
        yield 35;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(5, 0, 0, 100, -2, 100);
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildRelative(5, 0, 0, 100, -2, 100);
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 2,
            speed: 1.4,
            speed2: 1,
            angle: 0,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 1,
            rings: 5,
            speed: 2.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.16534698,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 3,
            rings: 7,
            speed: 3,
            speed2: 1,
            angle: 0,
            angleStep: 0.16534698,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 3,
            rings: 7,
            speed: 4,
            speed2: 1,
            angle: 0,
            angleStep: 0.16534698,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 6,
            count: 8,
            rings: 1,
            speed: 1,
            speed2: 1.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 6,
            count: 20,
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
            type: 2,
            color: 6,
            count: 20,
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
            type: 2,
            color: 6,
            count: 32,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 70;
        pc = 4;
        break;
      }
      case 4: {
        e.setHeadingSpeed(-1.570796, 0.5);
        e.setSpeedAccel(0.016667);
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.setSpeedAccel(0);
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
        e.setAnm(58);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f0 = e.timer;
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.025);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
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
        e.setAnm(24);
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.holdShots(); // op 107
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.1,
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
            speed: 1.7,
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
          e.setShotRepeatRand(50);
        }
        e.setMisc160(20); // op 160
        e.f0 = e.randF32 * 0.5;
        e.f0 += 1.8;
        e.movePolar(60, 4, 1.570796, e.f0);
        yield 35;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(5, 0, 0, 100, -2, 100);
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildRelative(5, 0, 0, 100, -2, 100);
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 2,
            speed: 1.4,
            speed2: 1,
            angle: 0,
            angleStep: 0.2617994,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 1,
            rings: 5,
            speed: 2.2,
            speed2: 1,
            angle: 0,
            angleStep: 0.16534698,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 3,
            rings: 7,
            speed: 3,
            speed2: 1,
            angle: 0,
            angleStep: 0.16534698,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 2,
            count: 3,
            rings: 7,
            speed: 4,
            speed2: 1,
            angle: 0,
            angleStep: 0.16534698,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 2,
            count: 8,
            rings: 1,
            speed: 1,
            speed2: 0.5,
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
            count: 20,
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
            type: 2,
            color: 2,
            count: 20,
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
            type: 2,
            color: 2,
            count: 32,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x202,
          }); // op 98
        }
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.setHeadingSpeed(-1.570796, 0.5);
        e.setSpeedAccel(0.016667);
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.setSpeedAccel(0);
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
        e.setAnmScripts6(18);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(80); // op 160
        e.setMisc144(3, 2); // op 144
        e.pauseEnemySpawns(1); // op 175
        e.clearScriptFlags(2);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(0); // op 130
        e.movePolar(60, 4, 1.570796, 2);
        e.callSubAlloc(0, 8); // op 135
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 0;
        e.linkChildAttached(10, 0, 0, 100, 1, 100);
        e.f0 = 3.141593;
        e.linkChildAttached(10, 0, 0, 100, 1, 100);
        e.f0 = 1.570796;
        e.linkChildAttached(10, 0, 0, 100, 1, 100);
        e.f0 = -1.570796;
        e.linkChildAttached(10, 0, 0, 100, 1, 100);
        e.setHeadingSpeed(1.570796, 0.25);
        yield 600;
        pc = 2;
        break;
      }
      case 2: {
        e.movePolar(120, 1, -1.570796, 5);
        e.pauseEnemySpawns(0); // op 175
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
        e.ci0 = 24;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = 5 - e.parentChainCount;
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 6,
            count: reg(0x2710) /* i0 */,
            rings: 1,
            speed: 1.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 6,
            count: reg(0x2710) /* i0 */,
            rings: 2,
            speed: 2.3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 6,
            count: reg(0x2710) /* i0 */,
            rings: 3,
            speed: 2.8,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        yield 32;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 28;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 12;
        }
        e.ci0 = 24;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.i1 = e.ci0 % 8;
        if (e.i1 >= 4) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 1,
            speed: 1.5,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 2,
            speed: 2.2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.18479957,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 3,
            rings: 2,
            speed: 2.5,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.5235988,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 6,
            count: 5,
            rings: 3,
            speed: 3.2,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.44879895,
            transform: 0x203 /* BIRTH_PUSH */,
          }); // op 96
        }
        pc = 3;
        break;
      }
      case 3: {
        yield e.delay(e.i0);
        e.i0--;
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
        e.setAnm(53);
        e.setBounds(24, 24);
        e.setHitFlash(1);
        e.moveArc(100, e.f0, -0.05236, 0.64);
        yield 100;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, -0.05236, 0);
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
        e.setAnmScripts6(18);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setMisc144(3, 2); // op 144
        e.pauseEnemySpawns(1); // op 175
        e.clearScriptFlags(2);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(0); // op 130
        e.holdShots(); // op 107
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 6,
            count: 2,
            rings: 3,
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
            type: 6,
            color: 6,
            count: 2,
            rings: 3,
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
            type: 6,
            color: 6,
            count: 2,
            rings: 3,
            speed: 4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x202,
          }); // op 96
        }
        e.releaseShots(); // op 108
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeat(180);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeat(40);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeat(10);
        }
        e.movePolar(50, 4, 1.570796, 3);
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 20;
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 3,
          rings: 5,
          speed: 2.4,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 20;
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 20;
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 3,
          rings: 5,
          speed: 2.4,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 96
        e.pauseEnemySpawns(0); // op 175
        yield 20;
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 20;
        pc = 9;
        break;
      }
      case 9: {
        e.linkChildRelative(12, 0, 0, 100, 1, 100);
        yield 120;
        pc = 10;
        break;
      }
      case 10: {
        e.setHeadingSpeed(-1.570796, 1.7);
        yield 5000;
        pc = 11;
        break;
      }
      case 11: {
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f1 = e.randF32S * 0.19635;
        e.f0 = e.timer + e.f1;
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.05);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(2);
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
        e.setAnmScripts6(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(40); // op 160
        e.setMisc144(3, 2); // op 144
        e.clearScriptFlags(2);
        e.holdShots(); // op 107
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 2,
            count: 1,
            rings: 4,
            speed: 2.3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x2,
          }); // op 96
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 6,
            color: 2,
            count: 1,
            rings: 4,
            speed: 2.3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x2,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 6,
            color: 2,
            count: 32,
            rings: 1,
            speed: 2.3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.09817477,
            transform: 0x2,
          }); // op 98
        }
        e.releaseShots(); // op 108
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setShotRepeat(180);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeat(60);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeat(30);
        }
        e.movePolar(60, 4, 1.570796, 3);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 2,
          rings: 8,
          speed: 1.8,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 96
        yield 80;
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = -0.785398;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 5,
          rings: 1,
          speed: 2.4,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 5,
          rings: 1,
          speed: 2.4,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 5,
            rings: 1,
            speed: 2.4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 1,
            speed: 2.4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x202,
          }); // op 98
        }
        yield 120;
        pc = 6;
        break;
      }
      case 6: {
        e.setHeadingSpeed(-1.570796, 1.7);
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
        e.setAnmScripts6(30);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.setMisc160(40); // op 160
        e.setMisc144(3, 2); // op 144
        e.holdShots(); // op 107
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 6,
            color: 2,
            count: 2,
            rings: 5,
            speed: 3.3,
            speed2: 0.5,
            angle: 0,
            angleStep: 0,
            transform: 0x2,
          }); // op 98
        }
        e.releaseShots(); // op 108
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeat(30);
        }
        e.movePolar(60, 4, 1.570796, 3);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = -0.785398;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        e.f1 += 0.392699;
        e.linkChildRelative(15, 0, 0, 100, 1, 100);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 5,
          rings: 1,
          speed: 2.4,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 1,
          color: 6,
          count: 5,
          rings: 1,
          speed: 2.4,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 1,
            color: 6,
            count: 5,
            rings: 1,
            speed: 2.4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedRing', // aim 2 of 96..104
            type: 2,
            color: 6,
            count: 32,
            rings: 1,
            speed: 2.4,
            speed2: 0.5,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x202,
          }); // op 98
        }
        yield 120;
        pc = 5;
        break;
      }
      case 5: {
        e.setHeadingSpeed(-1.570796, 1.7);
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f0 = e.timer + e.f1;
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.028333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(-0.056667);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.timer + e.f1;
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.025);
        yield 1;
        pc = 3;
        break;
      }
      case 3: {
        e.setScriptFlags(2);
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(22);
        e.setBossPresent(0);
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.setLives(12000);
        e.setLifeBarSlice(0, 0, e.maxHp, -1);
        e.setSpellTimer(1980, 23); // op 134
        e.setPhase(0, 1500, 23); // op 133
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
        yield* sub_19(e);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 16;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.ci0 = 32;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 *= 2;
        }
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.091667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.116667;
        }
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f4 = 0.005833;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x22252 /* ACCELERATE | RAMP_TURN | HOLD | WAIT */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x22252 /* ACCELERATE | RAMP_TURN | HOLD | WAIT */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 4,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x22252 /* ACCELERATE | RAMP_TURN | HOLD | WAIT */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 7,
            speed: 5,
            speed2: 0.2,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x22252 /* ACCELERATE | RAMP_TURN | HOLD | WAIT */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 -= e.f4;
        e.f4 -= 0.000456;
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
        e.setScriptFlags(6);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(22); // op 130
        e.setMisc144(5, 3); // op 144
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.15708;
        e.autoAnm();
        e.callSubAlloc(0, 18); // op 135
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          yield e.delay(40);
        }
        e.moveBounce(60, 4, 1.5); // op 67
        yield 40;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.timer - 1.570796;
        e.f2 = 0.15708;
        e.autoAnm();
        e.callSubAlloc(1, 18); // op 135
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          yield e.delay(120);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          yield e.delay(60);
        }
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.15708;
        e.autoAnm();
        e.callSubAlloc(0, 18); // op 135
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          yield e.delay(20);
        }
        e.moveBounce(60, 4, 1.5); // op 67
        yield 40;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.timer - 1.570796;
        e.f2 = 0.15708;
        e.autoAnm();
        e.callSubAlloc(1, 18); // op 135
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = -0.785398;
        e.linkChildRelative(20, 0, 0, 400, -2, 100);
        e.f1 = -0.392699;
        e.linkChildRelative(20, 0, 0, 400, -2, 100);
        e.f1 = 0;
        e.linkChildRelative(20, 0, 0, 400, -2, 100);
        e.f1 = 0.392699;
        e.linkChildRelative(20, 0, 0, 400, -2, 100);
        e.f1 = 0.785398;
        e.linkChildRelative(20, 0, 0, 400, -2, 100);
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          yield e.delay(180);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          yield e.delay(60);
        }
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f0 = e.timer + e.f1;
        e.setShotRecord(0, 131072, 0, 300, -1, -1, -1); // op 111
        e.setShotRecord(1, 16, 0, 60, -1, 0.033333, -999.900024); // op 111
        e.holdShots(); // op 107
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 8,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x20212 /* ACCELERATE | WAIT */,
        }); // op 97
        e.releaseShots(); // op 108
        e.setShotRepeatRand(16);
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.028333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(0);
        e.setScriptFlags(2);
        e.setScriptFlags(1);
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
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(27, 1); // op 126
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(0);
        e.setLives(18200);
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
        e.endSpell();
        e.clearScriptFlags(3);
        e.moveRelative(60, 4, 192, 128); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setBossPresent(-1);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(21); // op 130
        e.setAnmAlt(0);
        e.setAnmScripts6Alt(0); // op 59
        e.setMisc126(27, 1); // op 126
        yield 1;
        pc = 2;
        break;
      }
      case 2: {
        e.setBossPresent(0);
        e.setLives(18200);
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1800, 29); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('声符「梟の夜鳴声」', 'ミスティア・ローレライ', 13, 0, 15000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('声符「梟の夜鳴声」', 'ミスティア・ローレライ', 14, 0, 15000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('声符「木菟咆哮」', 'ミスティア・ローレライ', 15, 0, 15000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('声符「木菟咆哮」', 'ミスティア・ローレライ', 16, 0, 15000000);
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
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.15708;
        e.autoAnm();
        e.callSubAlloc(0, 24); // op 135
        yield 40;
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.timer - 1.570796;
        e.f2 = 0.15708;
        e.autoAnm();
        e.callSubAlloc(1, 24); // op 135
        yield 120;
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.15708;
        e.autoAnm();
        e.callSubAlloc(0, 24); // op 135
        yield 20;
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1.5); // op 67
        yield 40;
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = e.timer - 1.570796;
        e.f2 = 0.15708;
        e.autoAnm();
        e.callSubAlloc(1, 24); // op 135
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 18;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.ci0 = 36;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 *= 2;
        }
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        e.f1 = 0.021667;
        e.f7 = 0.033333;
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f4 = 0.005556;
        e.f5 = 0.02618;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 2;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 131072, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(3, 32, 0, 60, -1, e.f1, e.f5); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 6,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x22262 /* CURL | RAMP_TURN | HOLD | WAIT */,
        }); // op 97
        e.setShotRecord(3, 32, 0, 60, -1, e.f7, e.f5); // op 111
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: reg(0x2710) /* i0 */,
            count: 1,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x22262 /* CURL | RAMP_TURN | HOLD | WAIT */,
          }); // op 97
        }
        e.f5 *= -1;
        e.setShotRecord(3, 32, 0, 60, -1, e.f1, e.f5); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 6,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x22262 /* CURL | RAMP_TURN | HOLD | WAIT */,
        }); // op 97
        e.setShotRecord(3, 32, 0, 60, -1, e.f7, e.f5); // op 111
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 6,
            color: reg(0x2711) /* i1 */,
            count: 1,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x22262 /* CURL | RAMP_TURN | HOLD | WAIT */,
          }); // op 97
        }
        e.f5 *= -1;
        e.f0 += e.f2;
        e.f4 -= 0.000347;
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
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setSpellTimer(180000, 33); // op 134
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setSpellTimer(180000, 44); // op 134
        }
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
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
        e.ci0 = e.i0;
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.111667;
        }
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f4 = 0.005833;
        e.f7 = e.f2 * 1.2;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 3,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 2,
            rings: 3,
            speed: 3.5,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2727) /* f7 */,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 3,
            rings: 4,
            speed: 4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2727) /* f7 */,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 -= e.f4;
        e.f4 -= 0.000456;
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
        e.ci0 = e.i0;
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 3,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 2,
            rings: 3,
            speed: 3.5,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2727) /* f7 */,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 3,
            rings: 4,
            speed: 4,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2727) /* f7 */,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 += e.f4;
        e.f4 += 0.000456;
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
        e.setScriptFlags(4);
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setScriptFlags(3);
        e.setMisc144(5, 3); // op 144
        e.setLives(18200);
        e.eclSetLives(1);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(29); // op 130
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setSpellTimer(1920, 33); // op 134
        }
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.setPhase(0, 1950, 33); // op 133
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setSpellTimer(1920, 38); // op 134
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.setPhase(0, 1800, 38); // op 133
        }
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
        e.setScriptFlags(4);
        e.i0 = 20;
        pc = 7;
        break;
      }
      case 7: {
        e.f0 = e.timer + 1.570796;
        e.f4 = e.i0 * 0.67;
        e.f2 = -3.141593 / e.f4;
        e.autoAnm();
        e.callSubAlloc(0, 26); // op 135
        yield 120;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1.5); // op 67
        e.f0 = e.timer - 1.570796;
        e.f2 = 3.141593 / e.f4;
        e.autoAnm();
        e.callSubAlloc(0, 26); // op 135
        yield 90;
        pc = 9;
        break;
      }
      case 9: {
        e.moveBounce(60, 4, 1.5); // op 67
        e.i0 += 4;
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.f1 = -0.785398;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        e.f1 = -0.392699;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        e.f1 = 0;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        e.f1 = 0.392699;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        e.f1 = 0.785398;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        e.f1 = -1.178097;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        e.f1 = 1.178097;
        e.linkChildRelative(28, 0, 0, 600, -2, 100);
        yield 180;
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f0 = e.timer + e.f1;
        e.setShotRecord(0, 131072, 0, 300, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 7, 3, -1, -1); // op 111
        e.setShotRecord(2, 16, 0, 60, -1, 0.033333, -999.900024); // op 111
        e.holdShots(); // op 107
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 4,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 97
        e.releaseShots(); // op 108
        e.setShotRepeatRand(16);
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.028333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(0);
        e.setScriptFlags(2);
        e.setScriptFlags(1);
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
        e.setScriptFlags(4);
        e.endSpell();
        e.setMisc144(8, 6); // op 144
        e.setMisc160(240); // op 160
        e.setLives(19000);
        e.eclSetLives(0);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(62); // op 130
        e.setSpellTimer(2280, 44); // op 134
        e.setPhase(1, 4100, 44); // op 133
        e.setPhase(0, 2100, 51); // op 133
        e.setLifeBarSlice(1, e.phase0, e.phase1, 16752800);
        e.setLifeBarSlice(0, 0, e.phase0, 16736352);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.setMotionClamp(32, 48, 352, 128);
        e.moveBounce(60, 4, 1.4); // op 67
        yield 140;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.autoAnm();
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 120;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 120;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 100;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 70;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 90;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 90;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 70;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 60;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.12083;
        e.autoAnm();
        e.callSubAlloc(0, 31); // op 135
        yield e.delay(e.ci1);
        e.moveBounce(60, 4, 1.5); // op 67
        e.f0 = e.timer - 1.570796;
        e.f2 = 0.12083;
        e.autoAnm();
        e.callSubAlloc(0, 31); // op 135
        yield e.delay(e.ci2);
        e.moveBounce(60, 4, 1.5); // op 67
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.f1 = 0;
        e.linkChildRelative(30, 0, 0, 100, -2, 100);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        e.f1 = 0;
        yield 10;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildRelative(30, 0, 0, 100, -2, 100);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        e.f1 = 0;
        yield 10;
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(30, 0, 0, 100, -2, 100);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        e.f1 = 0;
        yield 10;
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildRelative(30, 0, 0, 100, -2, 100);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        e.f1 = 0;
        yield 10;
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildRelative(30, 0, 0, 100, -2, 100);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        e.f1 = 0;
        yield 10;
        pc = 9;
        break;
      }
      case 9: {
        e.linkChildRelative(30, 0, 0, 100, -2, 100);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = e.randF32S * 0.523599;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.linkChildRelative(30, 0, 0, 100, -2, 100);
        }
        yield 180;
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f0 = e.timer + e.f1;
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 7, 3, -1, -1); // op 111
        e.setShotRecord(2, 16, 0, 60, -1, 0.033333, -999.900024); // op 111
        e.holdShots(); // op 107
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 7,
          color: 4,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 99
        e.releaseShots(); // op 108
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.setShotRepeatRand(40);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setShotRepeatRand(11);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeatRand(11);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeatRand(11);
        }
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.066667);
        yield 20;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(1);
        yield 40;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.ci0 = 30;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 *= 2;
        }
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.083333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.108333;
        }
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f4 = 0.005833;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        e.f7 = e.f2 * 1.2;
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 4,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2250 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2250 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 3,
            rings: 5,
            speed: 3.6,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2727) /* f7 */,
            transform: 0x2250 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 -= e.f4;
        e.f4 -= 0.000456;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.ci0 = 30;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 4,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2250 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2250 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.6,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2250 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 += e.f4;
        e.f4 += 0.000456;
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
        e.setLives(1900);
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
        e.setDeathCallbackSub(63); // op 130
        yield* sub_58(e);
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2160, 29); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('蛾符「天蛾の蠱道」', 'ミスティア・ローレライ', 17, 0, 15000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('蛾符「天蛾の蠱道」', 'ミスティア・ローレライ', 18, 0, 15000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('毒符「毒蛾の鱗粉」', 'ミスティア・ローレライ', 19, 0, 15000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('猛毒「毒蛾の暗闇演舞」', 'ミスティア・ローレライ', 20, 0, 15000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(29); // op 130
        e.callSubAlloc(0, 35); // op 135
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
        e.callSubAlloc(1, 34); // op 135
        yield 160;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 0.3); // op 67
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 6;
        break;
      }
      case 6: {
        e.callSubAlloc(2, 34); // op 135
        yield 160;
        pc = 7;
        break;
      }
      case 7: {
        e.moveBounce(60, 4, 0.3); // op 67
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 8;
        break;
      }
      case 8: {
        e.callSubAlloc(1, 34); // op 135
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 9;
        break;
      }
      case 9: {
        e.callSubAlloc(2, 34); // op 135
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        e.callSubAlloc(3, 34); // op 135
        yield 200;
        pc = 11;
        break;
      }
      case 11: {
        e.moveBounce(60, 4, 0.3); // op 67
        yield 60;
        pc = 12;
        break;
      }
      case 12: {
        pc = 2;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 15;
        }
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        e.f0 = e.timer;
        e.cf0 = e.playerX;
        e.cf1 = e.playerY;
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f1 = 1;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x208,
        }); // op 97
        e.f1 += 0.2;
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
        e.playSfx(15);
        e.ci0 = 10;
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
        e.i0 = 60;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 6;
        pc = 2;
        break;
      }
      case 2: {
        e.cf0 = e.randF32 * 32;
        e.cf1 = e.randF32 * 224;
        e.cf1 += 32;
        e.linkChildStandard(37, e.cf0, e.cf1, 50, -2, 100);
        yield e.delay(e.i0);
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.ci0 = 6;
        pc = 4;
        break;
      }
      case 4: {
        e.cf0 = e.randF32 * 32;
        e.cf0 = 384 - e.cf0;
        e.cf1 = e.randF32 * 224;
        e.cf1 += 32;
        e.linkChildStandard(37, e.cf0, e.cf1, 50, -2, 100);
        yield e.delay(e.i0);
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        pc = 1;
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
          e.ci0 = e.randU31 % 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = e.randU31 % 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 6;
        }
        e.ci0 += 1;
        e.f4 = e.randF32S * 0.024544;
        e.f5 = e.f4 + 1.570796;
        e.f6 = e.f4 + -1.570796;
        e.f7 = e.randF32 * 0.001667;
        e.f7 += 0.026667;
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 6, 4, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f7, e.f5); // op 111
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 5,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 98
        e.setShotRecord(2, 16, 0, 60, -1, e.f7, e.f6); // op 111
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 3,
          color: 5,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 98
        yield 15;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          yield e.delay(40);
        }
        yield 30;
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = e.posX + 320;
        pc = 3;
        break;
      }
      case 2: {
        e.cf0 = e.posX - 320;
        pc = 3;
        break;
      }
      case 3: {
        e.cf1 = e.randF32S * 64;
        e.cf1 += e.posY;
        e.moveRelative(240, 0, e.cf0, e.cf1); // op 64
        e.callSubAlloc(0, 36); // op 135
        e.clearScriptFlags(1);
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.setScriptFlags(2);
        e.setScriptFlags(1);
        yield 180;
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2280, 29); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('毒符「毒蛾の鱗粉」', 'ミスティア・ローレライ', 19, 0, 15000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('猛毒「毒蛾の暗闇演舞」', 'ミスティア・ローレライ', 20, 0, 15000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(29); // op 130
        e.callSubAlloc(0, 40); // op 135
        e.callSubAlloc(3, 41); // op 135
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
        e.callSubAlloc(1, 39); // op 135
        yield 160;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 0.9); // op 67
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 6;
        break;
      }
      case 6: {
        e.callSubAlloc(2, 39); // op 135
        yield 160;
        pc = 7;
        break;
      }
      case 7: {
        e.moveBounce(60, 4, 0.9); // op 67
        e.spawnEffectAt(40, 1, -16711681); // op 139
        yield 60;
        pc = 8;
        break;
      }
      case 8: {
        e.callSubAlloc(1, 39); // op 135
        yield 200;
        pc = 9;
        break;
      }
      case 9: {
        e.moveBounce(60, 4, 0.9); // op 67
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
          e.ci0 = 5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 15;
        }
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        e.f0 = e.timer;
        e.cf0 = e.playerX;
        e.cf1 = e.playerY;
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f1 = 1;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 2,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x208,
        }); // op 97
        e.f1 += 0.2;
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
        e.playSfx(15);
        e.ci0 = 10;
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
        e.i0 = 60;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 2;
        pc = 2;
        break;
      }
      case 2: {
        e.cf0 = e.randF32 * 32;
        e.cf1 = e.randF32 * 32;
        e.cf1 += 256;
        e.linkChildStandard(43, e.cf0, e.cf1, 50, -2, 100);
        yield e.delay(e.i0);
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.ci0 = 2;
        pc = 4;
        break;
      }
      case 4: {
        e.cf0 = e.randF32 * 32;
        e.cf0 = 384 - e.cf0;
        e.cf1 = e.randF32 * 32;
        e.cf1 += 256;
        e.linkChildStandard(43, e.cf0, e.cf1, 50, -2, 100);
        yield e.delay(e.i0);
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_41(e: EnemyCtx): Generator<number, void, void> {
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
        e.i0 = 60;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 4,
          count: 32,
          rings: 1,
          speed: 1.8,
          speed2: 1.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.03926991,
          transform: 0x202,
        }); // op 99
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
        e.i0 = e.randU31 % 2;
        e.f0 = e.randAngle;
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0.04;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0.04;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 0.033333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 0.033333;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci1 = 5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci1 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci1 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci1 = 4;
        }
        e.setShotRecord(0, 131072, 0, 50, -1, -1, -1); // op 111
        if (e.difficulty != 2) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(1, 16384, 0, 6, 4, -1, -1); // op 111
        pc = 3;
        break;
      }
      case 2: {
        e.setShotRecord(1, 16384, 0, 6, 2, -1, -1); // op 111
        pc = 3;
        break;
      }
      case 3: {
        e.ci0 = 6;
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f2, e.f0); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 5,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 99
        e.f0 += 2.094395;
        e.f0 = normalizeAngle(e.f0);
        e.setShotRecord(2, 16, 0, 60, -1, e.f2, e.f0); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 5,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 99
        e.f0 += 2.094395;
        e.f0 = normalizeAngle(e.f0);
        e.setShotRecord(2, 16, 0, 60, -1, e.f2, e.f0); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 5,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 99
        e.f0 += 2.094395;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.ci1);
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        if (e.isDiff(HARD | EXTRA)) {
          yield e.delay(30);
        }
        yield 10;
        pc = 6;
        break;
      }
      case 6: {
        pc = 3;
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        if (e.posX >= 192) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = e.posX + 320;
        e.f1 = 0.19635;
        pc = 3;
        break;
      }
      case 2: {
        e.cf0 = e.posX - 320;
        e.f1 = -0.19635;
        pc = 3;
        break;
      }
      case 3: {
        e.moveRelative(240, 0, e.cf0, 32); // op 64
        e.callSubAlloc(0, 42); // op 135
        e.clearScriptFlags(1);
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.setScriptFlags(2);
        e.setScriptFlags(1);
        yield 180;
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
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(51); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2220, 29); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('鷹符「イルスタードダイブ」', 'ミスティア・ローレライ', 21, 0, 15000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('鷹符「イルスタードダイブ」', 'ミスティア・ローレライ', 22, 0, 15000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('鷹符「イルスタードダイブ」', 'ミスティア・ローレライ', 23, 0, 15000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('鷹符「イルスタードダイブ」', 'ミスティア・ローレライ', 24, 0, 15000000);
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
        e.callSubAlloc(0, 45); // op 135
        e.ci2 = 1;
        pc = 2;
        break;
      }
      case 2: {
        e.autoAnm();
        e.f2 = -0.040277;
        e.f1 = 1.570796;
        e.linkChildRelative(47, 0, 0, 20, -1, 10);
        e.f1 = 2.094395;
        e.linkChildRelative(47, 0, 0, 20, -1, 10);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = 2.617994;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(47, 0, 0, 20, -1, 10);
        }
        e.f2 = 0.040277;
        e.f1 = -1.570796;
        e.linkChildRelative(47, 0, 0, 20, -1, 10);
        e.f1 = -2.094395;
        e.linkChildRelative(47, 0, 0, 20, -1, 10);
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f1 = -2.617994;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.linkChildRelative(47, 0, 0, 20, -1, 10);
        }
        if (e.ci2 != 1) {
          yield 60;
          pc = 6;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.playSfx(5);
        yield* sub_53(e);
        pc = 4;
        break;
      }
      case 4: {
        e.setMisc136(1, 0); // op 136
        e.playSfx(15);
        yield 30;
        pc = 5;
        break;
      }
      case 5: {
        e.callSubAlloc(0, 50); // op 135
        e.ci2 = 0;
        yield 60;
        pc = 7;
        break;
      }
      case 6: {
        yield e.delay(60);
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        e.moveBounce(60, 4, 0.8); // op 67
        if (e.parentChainCount >= 3) {
          yield 60;
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 3,
          color: 2,
          count: 11,
          rings: 2,
          speed: 2,
          speed2: 1.9,
          angle: 0,
          angleStep: 0.19634955,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 96
        yield 60;
        pc = 9;
        break;
      }
      case 9: {
        e.autoAnm();
        e.f2 = 0;
        e.f1 = 0.785398;
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.f1 = 0.392699;
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.f1 = 0;
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.f1 = -0.785398;
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.f1 = -0.392699;
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.ci3++;
        yield 180;
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
        if (e.hpRatio >= 128) {
          yield 30;
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 2,
            count: 11,
            rings: 2,
            speed: 2,
            speed2: 1.9,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 96
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 3,
            color: 2,
            count: 11,
            rings: 2,
            speed: 4,
            speed2: 1.9,
            angle: 0,
            angleStep: 0.19634955,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 96
        }
        yield 30;
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
        e.setShotRecord(0, 131072, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 6, 6, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
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
        e.setShotRecord(2, 16, 0, 60, -1, 0.016667, -999.900024); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 2,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 1.5707964,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 99
        e.setShotRecord(2, 16, 0, 60, -1, 0.033333, -999.900024); // op 111
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 3,
            color: 8,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
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
        e.setAnm(58);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.f0 = e.timer + e.f1;
        e.callSubAlloc(0, 46); // op 135
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 2.5);
        e.setHeadingVel(e.f2);
        e.setSpeedAccel(-0.008333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(0);
        e.setHeadingVel(0);
        e.setScriptFlags(1);
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(16);
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
        e.setShotRecord(0, 131072, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 6, 2, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 18;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 18;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, 0.016667, -999.900024); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 3,
          color: 8,
          count: 2,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 1.5707964,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 97
        e.setShotRecord(2, 16, 0, 60, -1, 0.025, -999.900024); // op 111
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 8,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
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
        e.setAnm(58);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.f0 = e.timer + e.f1;
        if (e.isDiff(EASY | EXTRA)) {
          e.callSubAlloc(0, 46); // op 135
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 48); // op 135
        }
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 2.5);
        e.setHeadingVel(e.f2);
        e.setSpeedAccel(-0.008333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(0);
        e.setHeadingVel(0);
        e.setScriptFlags(1);
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(16);
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
        e.interpSlot(10017 /* f1 */, 10, 4, 0, 0, 255, 0, 0);
        if (e.isDiff(EASY | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 440, 320, 0, 0);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 440, 288, 0, 0);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 440, 256, 0, 0);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 440, 224, 0, 0);
        }
        e.ci0 = 125;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = e.f1;
        e.setMisc136(0, 0); // op 136
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
        e.i0 = 255;
        pc = 4;
        break;
      }
      case 4: {
        e.setMisc136(0, 0); // op 136
        yield 1;
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
        e.setSpellTimer(99999, 62); // op 134
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(62); // op 130
        e.callSubAlloc(0, 57); // op 135
        e.setMisc160(120); // op 160
        e.endSpell();
        e.spawnItemRandom(8); // op 142
        e.spawnItemBatch(5); // op 168
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_52(e);
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2220, 29); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('夜盲「夜雀の歌」', 'ミスティア・ローレライ', 25, 0, 15000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('夜盲「夜雀の歌」', 'ミスティア・ローレライ', 26, 0, 15000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('夜盲「夜雀の歌」', 'ミスティア・ローレライ', 27, 0, 15000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('夜盲「夜雀の歌」', 'ミスティア・ローレライ', 28, 0, 15000000);
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
        e.f2 = 0;
        e.f1 = -3.141593;
        e.ci0 = 8;
        pc = 2;
        break;
      }
      case 2: {
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.f1 += 0.785398;
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        if (e.hpRatio >= 128) {
          yield 60;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 5,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 96
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.f2 = 0;
        e.f1 = -2.748893;
        e.ci0 = 8;
        pc = 6;
        break;
      }
      case 6: {
        e.linkChildRelative(49, 0, 0, 20, -1, 10);
        e.f1 += 0.785398;
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        if (e.hpRatio >= 128) {
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 4,
          rings: 2,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 96
        pc = 9;
        break;
      }
      case 9: {
        e.playSfx(5);
        yield* sub_53(e);
        pc = 10;
        break;
      }
      case 10: {
        e.setMisc136(1, 0); // op 136
        e.playSfx(15);
        yield 30;
        pc = 11;
        break;
      }
      case 11: {
        e.callSubAlloc(0, 56); // op 135
        yield 120;
        pc = 12;
        break;
      }
      case 12: {
        e.nop(); // op 0
        pc = 13;
        break;
      }
      case 13: {
        e.f2 = 0;
        e.f1 = -3.141593;
        e.ci0 = 8;
        pc = 14;
        break;
      }
      case 14: {
        e.linkChildRelative(55, 0, 0, 20, -1, 10);
        e.f1 += 0.785398;
        if (--e.ci0 > 0) {
          pc = 14;
          break;
        }
        pc = 15;
        break;
      }
      case 15: {
        if (e.hpRatio >= 128) {
          yield 60;
          pc = 17;
          break;
        }
        pc = 16;
        break;
      }
      case 16: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 5,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 96
        yield 60;
        pc = 17;
        break;
      }
      case 17: {
        e.f2 = 0;
        e.f1 = -2.748893;
        e.ci0 = 8;
        pc = 18;
        break;
      }
      case 18: {
        e.linkChildRelative(55, 0, 0, 20, -1, 10);
        e.f1 += 0.785398;
        if (--e.ci0 > 0) {
          pc = 18;
          break;
        }
        pc = 19;
        break;
      }
      case 19: {
        if (e.hpRatio >= 128) {
          yield 120;
          pc = 21;
          break;
        }
        pc = 20;
        break;
      }
      case 20: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 7,
          color: 1,
          count: 4,
          rings: 2,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 96
        yield 120;
        pc = 21;
        break;
      }
      case 21: {
        e.moveBounce(60, 4, 0.8); // op 67
        e.ci3++;
        yield 20;
        pc = 22;
        break;
      }
      case 22: {
        pc = 13;
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
        e.setShotRecord(0, 131072, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 6, 2, -1, -1); // op 111
        e.setShotRecord(2, 16, 0, 60, -1, 0.016667, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 23;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 24;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 22;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 18;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, 0.02, -999.900024); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
        }
        e.setShotRecord(2, 16, 0, 60, -1, 0.013333, -999.900024); // op 111
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 7,
            color: 4,
            count: 2,
            rings: 1,
            speed: 0,
            speed2: 0.5,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 1.5707964,
            transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
          }); // op 97
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
        e.setAnm(58);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.clearScriptFlags(16);
        e.f0 = e.timer + e.f1;
        e.callSubAlloc(0, 54); // op 135
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 2.5);
        e.setHeadingVel(e.f2);
        e.setSpeedAccel(-0.008333);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setSpeedAccel(0);
        e.setHeadingVel(0);
        e.setScriptFlags(1);
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(16);
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
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 320;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 288;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 256;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 224;
        }
        e.i0 = 255;
        if (e.isDiff(EASY | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 320, 192, 0, 0);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 288, 128, 0, 0);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 256, 96, 0, 0);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 224, 64, 0, 0);
        }
        e.ci0 = 125;
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc136(0, 0); // op 136
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
        if (e.isDiff(EASY | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 192, 128, 0, 0);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 128, 64, 0, 0);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 96, 56, 0, 0);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 64, 48, 0, 0);
        }
        e.i0 = 255;
        pc = 4;
        break;
      }
      case 4: {
        e.setMisc136(0, 0); // op 136
        yield 1;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 320;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 288;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 256;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 224;
        }
        e.i0 = 255;
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc136(0, 0); // op 136
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 63); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('夜雀「真夜中のコーラスマスター」', 'ミスティア・ローレライ', 29, 0, 15000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('夜雀「真夜中のコーラスマスター」', 'ミスティア・ローレライ', 30, 0, 15000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('夜雀「真夜中のコーラスマスター」', 'ミスティア・ローレライ', 31, 0, 15000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(120); // op 160
        e.setMisc136(1, 0); // op 136
        e.playSfx(15);
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(3, 60); // op 135
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 180;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 180;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 140;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 120;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.12083;
        e.autoAnm();
        e.callSubAlloc(0, 61); // op 135
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1.5); // op 67
        e.f0 = e.timer - 1.570796;
        e.f2 = 0.12083;
        e.autoAnm();
        e.callSubAlloc(0, 61); // op 135
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 4, 1.5); // op 67
        e.f0 = e.timer + 1.570796;
        e.f2 = -0.12083;
        e.autoAnm();
        e.callSubAlloc(0, 61); // op 135
        yield 60;
        pc = 6;
        break;
      }
      case 6: {
        e.moveBounce(60, 4, 1.5); // op 67
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        e.f1 = 0;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = e.randF32S * 0.392699;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = 0;
        yield 10;
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = e.randF32S * 0.392699;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = 0;
        yield 10;
        pc = 9;
        break;
      }
      case 9: {
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = e.randF32S * 0.392699;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = 0;
        yield 10;
        pc = 10;
        break;
      }
      case 10: {
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = e.randF32S * 0.392699;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = 0;
        yield 10;
        pc = 11;
        break;
      }
      case 11: {
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = e.randF32S * 0.392699;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = 0;
        yield 10;
        pc = 12;
        break;
      }
      case 12: {
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        e.f1 = e.randF32S * 0.392699;
        e.linkChildRelative(59, 0, 0, 100, -2, 100);
        yield e.delay(e.i0);
        pc = 3;
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
        e.setAnm(57);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.f0 = e.timer + e.f1;
        e.setShotRecord(0, 131072, 0, 320, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 7, 3, -1, -1); // op 111
        e.setShotRecord(2, 16, 0, 60, -1, 0.033333, -999.900024); // op 111
        e.holdShots(); // op 107
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 7,
          color: 4,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.2617994,
          transform: 0x24212 /* ACCELERATE | RESPRITE | WAIT */,
        }); // op 99
        e.releaseShots(); // op 108
        if (e.isDiff(EASY | EXTRA)) {
          e.setShotRepeatRand(40);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.setShotRepeatRand(11);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.setShotRepeatRand(11);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.setShotRepeatRand(11);
        }
        e.clearScriptFlags(1);
        e.setHeadingSpeed(e.f0, 0.5);
        e.setSpeedAccel(0.066667);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(1);
        yield 40;
        pc = 2;
        break;
      }
      case 2: {
        e.setSpeedAccel(0);
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
        e.interpSlot(10017 /* f1 */, 10, 4, 0, 0, 255, 0, 0);
        if (e.isDiff(NORMAL | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 320, 96, 0, 0);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 320, 64, 0, 0);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 120, 4, 0, 320, 64, 0, 0);
        }
        e.ci0 = 125;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = e.f1;
        e.setMisc136(0, 0); // op 136
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
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 96, 64, 0, 0);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 64, 56, 0, 0);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.interpSlot(10016 /* f0 */, 1800, 0, 0, 64, 48, 0, 0);
        }
        e.i0 = 255;
        pc = 4;
        break;
      }
      case 4: {
        e.setMisc136(0, 0); // op 136
        yield 1;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.ci0 = 30;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 *= 0.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 *= 0.8;
        }
        e.setShotRecord(0, 8192, 0, 60, -1, -1, -1); // op 111
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.091667;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.098214;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.098214;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.107143;
        }
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.f4 = 0.007292;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 4,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.6,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 -= e.f4;
        e.f4 -= 0.000456;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 15;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.ci0 = 30;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16, 0, 60, -1, e.f1, -999.900024); // op 111
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 4,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.2,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 10,
            count: 1,
            rings: 5,
            speed: 3.6,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.2617994,
            transform: 0x2252 /* ACCELERATE | RAMP_TURN | HOLD */,
          }); // op 97
        }
        e.f0 += e.f2;
        e.f1 += e.f4;
        e.f4 += 0.000456;
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
