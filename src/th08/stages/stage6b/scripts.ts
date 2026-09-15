// Auto-generated from ecldata7.ecl by tools/th08/ecl
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
// ecldata7.ecl: 89 subs, translated by tools/th08/ecl
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
        e.setAnm(83);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(48, 48);
        e.setMisc160(140); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(8, 4); // op 144
        e.movePolar(60, 4, 0.392699, 5);
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
        e.linkChildAttached(1, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        e.linkChildAttached(3, 0, 0, 600, -2, 100);
        e.f0 += 0.418879;
        e.linkChildAttached(5, 0, 0, 600, -2, 100);
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
        yield 180;
        pc = 6;
        break;
      }
      case 6: {
        e.setHeadingSpeed(-1.570796, 0.6);
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
        e.callSubAlloc(0, 2); // op 135
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
          e.f0 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3;
        }
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, e.f0); // op 111
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 11;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 7;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.moveAngle - 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: 2,
          rings: 1,
          speed: 2,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
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
        e.moveArc(20, e.f0, e.f1, 3);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.setAccel(6000, e.f1, 0);
        e.callSubAlloc(0, 4); // op 135
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
        e.i0 = 14;
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
          e.i1 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 2.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2.3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2.7;
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
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
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
        e.i0 = 13;
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 3;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 1,
          color: 2,
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: 0.8,
          speed2: 1.2,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0,
          transform: 0x200,
        }); // op 99
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
        e.setAnm(94);
        e.setExtraAnm(0, 48); // op 57
        e.setBounds(24, 24);
        e.clearScriptFlags(2);
        e.setMisc160(20); // op 160
        e.playSfx(36);
        e.setMisc144(2, 2); // op 144
        e.i0 = e.randU31 % 7;
        e.f0 = e.i0 * 48;
        e.f1 = e.randF32 * 96;
        e.f0 += e.f1;
        e.setRelPos(e.f0, e.posY);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.i0 = 7 - e.i0;
        e.ci0 = 7;
        if (e.i0 >= 3) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f7 = 0.069813;
        pc = 4;
        break;
      }
      case 3: {
        e.f7 = -0.069813;
        pc = 4;
        break;
      }
      case 4: {
        if (e.ci0 == e.i0) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildStandard(9, e.f1, e.posY, 400, -2, 100);
        pc = 6;
        break;
      }
      case 6: {
        e.f1 += 48;
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 8); // op 135
        yield 800;
        pc = 8;
        break;
      }
      case 8: {
        e.moveRelative(40, 4, e.posX, -32); // op 64
        yield 40;
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
        e.ci0 = 12;
        e.f0 = e.timer;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 5;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 6,
          color: 6,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.3926991,
          transform: 0x203 /* BIRTH_PUSH */,
        }); // op 97
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
        pc = 0;
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
        e.setAnm(54);
        e.setMisc144(2, 2); // op 144
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setScriptFlags(3);
        e.setHitFlash(1);
        yield 20;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 10); // op 135
        yield 800;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 60;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 16;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 10;
        }
        e.f0 = 0.785398;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 1.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 2.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 3.3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 3.8;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 5,
          color: 2,
          count: 2,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.8,
          angle: 1.5707964,
          angleStep: 0.7853982,
          transform: 0x202,
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.setLives(16000);
        e.setSpellTimer(5940, 19); // op 134
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(19); // op 130
        e.eclSetLives(1);
        e.setRelPos(352, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(15, 1); // op 126
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
        e.setScriptFlags(7);
        e.setMisc160(120); // op 160
        e.setBossPresent(0);
        e.setMisc144(10, 5); // op 144
        e.setLives(16000);
        e.eclSetLives(0);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(24); // op 130
        e.setSpellTimer(2400, 19); // op 134
        e.setPhase(0, 1900, 19); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.ci3 = 0;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_16(e);
        pc = 2;
        break;
      }
      case 2: {
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 16;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 20;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 20;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0.785398;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0.392699;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 0.314159;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 0.314159;
        }
        e.f0 = e.randAngle;
        e.f1 = 1;
        e.autoAnm();
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(17, 0, 0, 300, -2, 100);
        e.f0 += e.f2;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1); // op 67
        e.ci3++;
        yield 60;
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
        e.f2 = e.randAngle;
        e.ci0 = 32;
        if (e.isDiff(EASY | EXTRA)) {
          e.f3 = 1.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f3 = 1.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f3 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f3 = 2.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i2 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i2 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i2 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i2 = 14;
        }
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
        e.setShotRecord(1, 64, 1, 60, 1, -2.513274, e.f3); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 2.513274, e.f3); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 16384, 0, 2, 4, -1, -1); // op 111
        e.f2 += 0.19635;
        e.f2 = normalizeAngle(e.f2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2712) /* i2 */,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: 0.24543692,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
        }); // op 97
        if (--e.ci0 > 0) {
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
        e.setAnm(54);
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.setHitFlash(1);
        e.setHeadingSpeed(e.f0, e.f1);
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(3);
        e.callSubAlloc(0, 18); // op 135
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
        e.f0 += 3.141593;
        e.f0 = normalizeAngle(e.f0);
        e.ci0 = 10;
        e.setShotRecord(0, 128, 0, 60, 1, 0, 1.5); // op 111
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.5,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(EASY | NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 3,
            color: 6,
            count: 1,
            rings: 1,
            speed: 3,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x282 /* RAMP_HOME */,
          }); // op 97
        }
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
        e.setMisc144(10, 5); // op 144
        e.setMisc160(320); // op 160
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setSpellTimer(2400, 24); // op 134
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(24); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 24); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('薬符「壺中の大銀河」', '八意永琳', 147, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('薬符「壺中の大銀河」', '八意永琳', 148, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('薬符「壺中の大銀河」', '八意永琳', 149, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('薬符「壺中の大銀河」', '八意永琳', 150, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        e.setSpellTimer(2400, 24); // op 134
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(25); // op 130
        e.eclSetLives(0);
        e.ci3 = 0;
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 16;
        e.f2 = 1.570796;
        e.f3 = 400;
        e.ci1 = 68;
        e.f5 = 0.05236;
        e.f6 = e.playerX;
        e.f7 = e.playerY;
        if (e.f6 >= 88) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f6 = 88;
        pc = 6;
        break;
      }
      case 4: {
        if (e.f6 <= 296) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f6 = 296;
        pc = 6;
        break;
      }
      case 6: {
        if (e.f7 >= 88) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f7 = 88;
        pc = 10;
        break;
      }
      case 8: {
        if (e.f7 <= 360) {
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.f7 = 360;
        pc = 10;
        break;
      }
      case 10: {
        e.f4 = 0 - e.f2;
        e.f0 = Math.cos(e.f4);
        e.f0 *= 80;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 80;
        e.f0 += e.f6;
        e.f1 += e.f7;
        e.linkChildRelative(23, 0, 0, 100, -2, 100);
        e.f2 += 0.392699;
        e.f2 = normalizeAngle(e.f2);
        e.ci1 -= 4;
        yield 4;
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
        e.moveBounce(60, 4, 1); // op 67
        e.ci3++;
        yield 120;
        pc = 13;
        break;
      }
      case 13: {
        pc = 2;
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
        e.f1 = Math.atan2(e.posY - e.f7, e.posX - e.f6);
        e.f0 = e.f1 + 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 6,
          count: 2,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 97
        e.f0 = e.f1 - 1.570796;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 2,
          count: 2,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x2,
        }); // op 97
        e.f0 = e.f1;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 2,
          color: 4,
          count: 2,
          rings: 1,
          speed: 3,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x2,
        }); // op 97
        yield 8;
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
        e.ci1 *= 3;
        yield e.delay(e.ci1);
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 90;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 30;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 25;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 17;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.098175;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 0,
          color: 6,
          count: 1,
          rings: 3,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x202,
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
        e.f1 = Math.atan2(e.playerY - e.ef7, e.playerX - e.ef6);
        e.setHeadingSpeed(e.f1, 0.2);
        e.f2 = Math.cos(e.f1);
        e.f2 *= 0.2;
        e.f3 = Math.sin(e.f1);
        e.f3 *= 0.2;
        e.ef6 += e.f2;
        e.ef7 += e.f3;
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
        e.effectWithYoukai(1); // op 174
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setHitFlash(1);
        e.cxf2 = Math.cos(e.f2);
        e.cxf2 *= e.f3;
        e.cxf3 = Math.sin(e.f2);
        e.cxf3 *= e.f3;
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.f2 = e.randSignF(400);
        e.interpSlot(10042 /* posX */, 120, 7, 0, e.cf0, e.f0, e.cxf2, e.f2);
        e.f2 = e.randSignF(400);
        e.interpSlot(10043 /* posY */, 120, 7, 0, e.cf1, e.f1, e.cxf3, e.f2);
        e.ef6 = e.f6;
        e.ef7 = e.f7;
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        yield e.delay(e.ci1);
        e.callSubAlloc(2, 22); // op 135
        e.callSubAlloc(0, 20); // op 135
        e.callSubAlloc(1, 21); // op 135
        e.moveOrbit(6000, e.ef6, e.ef7, e.f4, e.f5, 80, 1);
        e.callSubAlloc(2, -1); // op 135
        yield 120;
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
        e.setMisc147(1); // op 147
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
        e.setMisc147(1); // op 147
        e.setMisc129(0); // op 129
        e.spawnItem(3);
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
        e.setAnmAlt(6);
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 50); // op 134
        e.setRelPos(192, 128);
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
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setBossPresent(0);
        e.setAnmScripts6Alt(7); // op 59
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(4);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(31); // op 130
        e.setSpellTimer(3600, 50); // op 134
        e.setPhase(0, 2200, 50); // op 133
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
        yield* sub_43(e);
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 28); // op 135
        e.callSubAlloc(1, 29); // op 135
        e.callSubAlloc(2, 30); // op 135
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
        e.f2 = e.randAngle;
        e.ci0 = 32;
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 9;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 3;
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
        e.f2 = e.randF32 * 64;
        e.f3 = e.randAngle;
        e.f0 = Math.cos(e.f3);
        e.f0 *= e.f2;
        e.f1 = Math.sin(e.f3);
        e.f1 *= e.f2;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        e.setShotRecord(1, 64, 1, 60, 1, -2.513274, e.f7); // op 111
        e.setShotRecord(2, 16384, 0, 2, 6, -1, -1); // op 111
        e.f2 = e.randF32S * 0.785398;
        e.f3 += e.f2;
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 5,
          count: 5,
          rings: 1,
          speed: 3.5,
          speed2: 0.8,
          angle: reg(0x2723) /* f3 */,
          angleStep: 0.024543693,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
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
        e.autoAnm();
        e.f2 = e.randAngle;
        yield 1;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 32;
        e.setShotRecord(0, 8192, 0, 120, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 9;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 2;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f2 = e.randF32 * 64;
        e.f3 = e.randAngle;
        e.f0 = Math.cos(e.f3);
        e.f0 *= e.f2;
        e.f1 = Math.sin(e.f3);
        e.f1 *= e.f2;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        e.setShotRecord(1, 64, 1, 60, 1, 2.513274, e.f7); // op 111
        e.setShotRecord(2, 16384, 0, 2, 2, -1, -1); // op 111
        e.f2 = e.randF32S * 0.785398;
        e.f3 += e.f2;
        e.f3 = normalizeAngle(e.f3);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: 5,
          rings: 1,
          speed: 3.5,
          speed2: 0.8,
          angle: reg(0x2723) /* f3 */,
          angleStep: 0.024543693,
          transform: 0x6242 /* RAMP_TURN | HOLD | RESPRITE */,
        }); // op 97
        yield e.delay(e.ci2);
        pc = 2;
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
        e.autoAnm();
        yield 300;
        pc = 1;
        break;
      }
      case 1: {
        e.f2 = e.randAngle;
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 8;
        e.f0 = e.timer;
        e.f1 = 1.5;
        e.playSfx(15);
        pc = 3;
        break;
      }
      case 3: {
        e.setShotOrigin(0, 0); // op 110
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 18,
          color: 1,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.24543692,
          transform: 0x202,
        }); // op 97
        e.f1 += 0.2;
        yield 2;
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(240); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setAnmScripts6Alt(7); // op 59
        e.setMisc144(10, 5); // op 144
        e.setLives(27000);
        e.eclSetLives(3);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(34); // op 130
        e.setSpellTimer(3600, 55); // op 134
        e.setPhase(0, 2500, 55); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.i0 = 20;
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc136(15, 0); // op 136
        e.setMisc147(2); // op 147
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        e.ci3 = 0;
        e.f0 = 0;
        e.f1 = 1;
        e.ci0 = 9;
        pc = 4;
        break;
      }
      case 4: {
        e.i0 = e.ci0 % 2;
        if (e.i0 != 0) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f7 = e.timer - 1.570796;
        e.f7 = normalizeAngle(e.f7);
        e.f6 = 0.10472;
        pc = 7;
        break;
      }
      case 6: {
        e.f7 = e.timer + 1.570796;
        e.f7 = normalizeAngle(e.f7);
        e.f6 = -0.10472;
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildAttached(33, 0, 0, 3500, 1, 100000);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 4;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        if (e.isDiff(EASY | EXTRA)) {
          yield 30;
          pc = 14;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = 0;
        e.f1 = 2;
        e.ci0 = 11;
        pc = 10;
        break;
      }
      case 10: {
        e.i0 = e.ci0 % 2;
        if (e.i0 != 1) {
          pc = 12;
          break;
        }
        pc = 11;
        break;
      }
      case 11: {
        e.f7 = e.timer - 1.570796;
        e.f7 = normalizeAngle(e.f7);
        e.f6 = -0.314159;
        pc = 13;
        break;
      }
      case 12: {
        e.f7 = e.timer + 1.570796;
        e.f7 = normalizeAngle(e.f7);
        e.f6 = 0.314159;
        pc = 13;
        break;
      }
      case 13: {
        e.linkChildAttached(33, 0, 0, 3500, 1, 100000);
        e.f0 += 0.314159;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 10;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        pc = 14;
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
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 16;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 16;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 12;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = e.posX + 16;
        e.cf1 = e.posY + 16;
        e.f0 = e.randF32S * 32;
        e.cf0 += e.f0;
        e.f0 = e.randF32S * 32;
        e.cf1 += e.f0;
        e.i0 = e.cf0i;
        e.i1 = e.cf1i;
        e.i0 = Math.trunc(e.i0 / 16);
        e.i1 = Math.trunc(e.i1 / 16);
        e.i0 *= 16;
        e.i1 *= 16;
        e.cf0 = e.i0;
        e.cf1 = e.i1;
        e.cf0 = e.cf0 - e.posX;
        e.cf1 = e.cf1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.setShotRecord(0, 131072, 0, 60, -1, -1, -1); // op 111
        e.f5 = e.randF32S * 0.5;
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 += 1.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 += 1.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 += 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 += 1.8;
        }
        e.f5 /= 60;
        e.setShotRecord(1, 16, 0, 60, -1, e.f5, e.f7); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.2617994,
          transform: 0x20218 /* ACCELERATE | WAIT */,
        }); // op 99
        e.f7 += e.f6;
        e.f0 = normalizeAngle(e.f0);
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
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.movePolar(60, 4, e.f0, e.f1);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(420); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setAnmScripts6Alt(7); // op 59
        e.setMisc147(3); // op 147
        e.setShotOrigin(0, 0); // op 110
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(2);
        e.setMotionClamp(32, 48, 352, 128);
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(38); // op 130
        e.setSpellTimer(3600, 61); // op 134
        e.setPhase(0, 2500, 61); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.i0 = 20;
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc136(15, 0); // op 136
        yield 30;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        e.ci3 = 0;
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = e.randAngle;
        e.f1 = 0.010472;
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
        e.i0 = 1;
        e.i1 = 6;
        e.i2 = 3;
        e.f2 = 0.785398;
        e.autoAnm();
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildRelative(37, 0, 0, 1500, -2, 100000);
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 2.094395;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 1.047198;
        }
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = e.randAngle;
        e.f1 = -0.010472;
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
        e.i0 = 2;
        e.i1 = 10;
        e.i2 = 5;
        e.f2 = -0.785398;
        e.autoAnm();
        pc = 7;
        break;
      }
      case 7: {
        e.linkChildRelative(37, 0, 0, 1500, -2, 100000);
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 2.094395;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 1.047198;
        }
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 7;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.ci3++;
        yield 160;
        pc = 9;
        break;
      }
      case 9: {
        e.moveBounce(60, 4, 1); // op 67
        e.callSubAlloc(0, 35); // op 135
        yield 60;
        pc = 10;
        break;
      }
      case 10: {
        pc = 4;
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
          e.i0 = 24;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 48;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 48;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 48;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
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
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.cf0 = e.cf0 - e.posX;
        e.cf1 = e.cf1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.setShotRecord(0, 8192, 0, 300, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 1, 30, -1, -1, -1); // op 111
        e.setShotRecord(2, 524288, 0, 27, -1, -1, -1); // op 111
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 6;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randF32 * 0.5;
        e.f0 += 1.3;
        e.f0 /= 240;
        e.setShotRecord(3, 32, 0, 240, -1, e.f0, e.f1); // op 111
        e.cf0 = e.randF32S * 32;
        e.cf1 = e.randF32S * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.f0 = e.orbitAngle + e.f2;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 10,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa2222 /* CURL | HOLD | SOUND | WAIT */,
        }); // op 99
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.cf0 = e.randF32S * 32;
        e.cf1 = e.randF32S * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: reg(0x2711) /* i1 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa2222 /* CURL | HOLD | SOUND | WAIT */,
        }); // op 99
        yield 4;
        pc = 4;
        break;
      }
      case 4: {
        e.cf0 = e.randF32S * 32;
        e.cf1 = e.randF32S * 32;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 7,
          color: reg(0x2712) /* i2 */,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0xa2222 /* CURL | HOLD | SOUND | WAIT */,
        }); // op 99
        yield 4;
        pc = 5;
        break;
      }
      case 5: {
        if (--e.ci0 > 0) {
          pc = 2;
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
        e.clearScriptFlags(16);
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.moveOrbit(600, e.posX, e.posY, e.f0, e.f1, 0, 2);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 36); // op 135
        yield 200;
        pc = 2;
        break;
      }
      case 2: {
        e.setScriptFlags(16);
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
        e.setScriptFlags(3);
        e.setAnmScripts6Alt(7); // op 59
        e.setMisc160(320); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc147(4); // op 147
        e.setShotOrigin(0, 0); // op 110
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.setMisc144(10, 5); // op 144
        e.setLives(30000);
        e.eclSetLives(1);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(38); // op 130
        e.setSpellTimer(3600, 67); // op 134
        e.setPhase(0, 2500, 67); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.i0 = 20;
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc136(15, 0); // op 136
        yield 50;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        e.ci3 = 0;
        e.callSubAlloc(0, 39); // op 135
        e.callSubAlloc(1, 41); // op 135
        yield 30;
        pc = 4;
        break;
      }
      case 4: {
        pc = 4;
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
        e.f0 = e.randAngle;
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
          e.i0 = 6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0.3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 0.35;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 0.4;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 64, 0, 170, 1, e.randAngle, e.f2); // op 111
        e.setShotRecord(1, 16384, 0, 18, 1, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 18,
          color: 3,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 3.4,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x4242 /* RAMP_TURN | RESPRITE */,
        }); // op 99
        e.f1 = e.randAngle / 256;
        e.f0 += 0.20944;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
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
        e.f0 = 1.570796;
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 8192, 0, 240, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 1, 120, -1, -0.016667, -0.02618); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 18,
          color: 5,
          count: 4,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2220 /* CURL | HOLD */,
        }); // op 99
        e.f0 -= 0.1496;
        e.f0 = normalizeAngle(e.f0);
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

export function* sub_41(e: EnemyCtx): Generator<number, void, void> {
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
        if (e.hpRatio >= 48) {
          yield 8;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 7,
          count: 52,
          rings: 1,
          speed: 2,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        yield 8;
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
        e.setAnmScripts6Alt(7); // op 59
        e.clearScriptFlags(8);
        e.eclSetLives(0);
        e.setBossPresent(0);
        e.setMisc159(1); // op 159
        e.setLives(6000);
        e.setLifeBarSlice(0, 0, e.maxHp, 16752800);
        e.complexSetup(1); // op 176
        e.setRelPos(192, 224);
        e.startStageBg();
        e.playSfx(5);
        e.spawnEffectAt(40, 1, -1); // op 139
        yield 4;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 4;
        break;
      }
      case 4: {
        e.playSfx(15);
        e.setScriptFlags(8);
        e.setMisc173(1); // op 173
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(45); // op 130
        yield* sub_77(e);
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
        if (e.spellCardState != 0) {
          yield 60;
          pc = 15;
          break;
        }
        pc = 13;
        break;
      }
      case 13: {
        e.clockControl(); // op 181
        if (e.spellCardTimer < 600) {
          yield 30;
          pc = 15;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        e.clockControl(); // op 181
        pc = 15;
        break;
      }
      case 15: {
        e.setBossPresent(-1);
        e.setMisc136(18, 1); // op 136
        yield 2;
        pc = 16;
        break;
      }
      case 16: {
        e.maxHp = 0;
        e.maxHp = 0;
        yield 3000;
        pc = 17;
        break;
      }
      case 17: {
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
        if (e.spellCardState != 0) {
          yield 80;
          pc = 7;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.clockControl(); // op 181
        if (e.spellCardTimer < 420) {
          yield 30;
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.clockControl(); // op 181
        pc = 7;
        break;
      }
      case 7: {
        e.setBossPresent(-1);
        e.maxHp = 1;
        yield 2;
        pc = 8;
        break;
      }
      case 8: {
        e.maxHp = 0;
        yield 3000;
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
        e.setAnmScripts6Alt(7); // op 59
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
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 4;
        break;
      }
      case 4: {
        e.playSfx(15);
        e.setScriptFlags(8);
        e.setMisc173(1); // op 173
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(45); // op 130
        yield* sub_80(e);
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
        e.setAnmScripts6Alt(7); // op 59
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
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 4;
        break;
      }
      case 4: {
        e.playSfx(15);
        e.setScriptFlags(8);
        e.setMisc173(1); // op 173
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(45); // op 130
        yield* sub_82(e);
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
        e.setAnmScripts6Alt(7); // op 59
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
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 4;
        break;
      }
      case 4: {
        e.playSfx(15);
        e.setScriptFlags(8);
        e.setMisc173(1); // op 173
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(45); // op 130
        yield* sub_84(e);
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
        e.setAnmScripts6Alt(7); // op 59
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
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEffectAt(40, 1, -12080); // op 139
        yield 4;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEffectAt(40, 1, -32640); // op 139
        yield 4;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnEffectAt(40, 1, -49088); // op 139
        yield 50;
        pc = 4;
        break;
      }
      case 4: {
        e.playSfx(15);
        e.setScriptFlags(8);
        e.setMisc173(1); // op 173
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(44); // op 130
        yield* sub_87(e);
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
        e.setDeathCallbackSub(31); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3600, 31); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('難題「龍の頸の玉  -五色の弾丸-」', '蓬莱山輝夜', 151, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('難題「龍の頸の玉  -五色の弾丸-」', '蓬莱山輝夜', 152, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神宝「ブリリアントドラゴンバレッタ」', '蓬莱山輝夜', 153, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神宝「ブリリアントドラゴンバレッタ」', '蓬莱山輝夜', 154, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(180); // op 160
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          yield 240;
          pc = 7;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 0;
        e.f0 = e.timer + 3.141593;
        e.f1 = 1.5;
        e.f2 = 0.043633;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(51, 0, 0, 3600, -2, 10);
        yield 60;
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
        e.f0 = e.timer + 3.141593;
        e.f1 = 1.5;
        e.f2 = -0.043633;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(51, 0, 0, 3600, -2, 10);
        yield 60;
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
        pc = 2;
        break;
      }
      case 7: {
        e.ci0 = 0;
        e.f0 = e.timer + 3.141593;
        e.f1 = 2;
        e.f2 = 0.0561;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(51, 0, 0, 3600, -2, 10);
        e.f0 = e.timer + 3.141593;
        e.f1 = 2;
        e.f2 = -0.0561;
        e.f0 = normalizeAngle(e.f0);
        e.linkChildRelative(51, 0, 0, 3600, -2, 10);
        yield 60;
        pc = 8;
        break;
      }
      case 8: {
        e.moveBounce(60, 4, 1); // op 67
        e.f0 = e.timer + 3.141593;
        e.f1 = 2;
        e.f2 = -0.043633;
        e.f0 = normalizeAngle(e.f0);
        yield 60;
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
        pc = 7;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.setHeadingSpeed(e.f0, e.f1);
        e.setHeadingVel(e.f2);
        e.callSubAlloc(0, 52); // op 135
        e.callSubAlloc(1, 53); // op 135
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          yield e.delay(90);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          yield e.delay(80);
        }
        e.setHeadingVel(0);
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

export function* sub_52(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 5; // the script starts at frame 5
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
          e.f1 = 2.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 3.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 4.4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 50;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 100;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 120;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 180;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 20;
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
        e.playSfx(16);
        e.f0 = Math.atan2(e.posY - e.cf1, e.posX - e.cf0);
        e.setShotOrigin(0, 0); // op 110
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 4,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: reg(0x2721) /* f1 */,
          tail: 0,
          head: 0,
          startLength: reg(0x2722) /* f2 */,
          width: 1e1,
          startTime: 0,
          duration: 800,
          despawn: 0,
          hitboxStart: 0,
          hitboxEnd: 0,
          flags: 0x0,
        }); // op 114
        e.f3 = e.f0;
        e.f4 = Math.cos(e.f3);
        e.f4 *= 32;
        e.f5 = Math.sin(e.f3);
        e.f5 *= 32;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 4,
          color: 2,
          angle: reg(0x2720) /* f0 */,
          speed: reg(0x2721) /* f1 */,
          tail: 0,
          head: 0,
          startLength: reg(0x2722) /* f2 */,
          width: 1e1,
          startTime: 0,
          duration: 800,
          despawn: 0,
          hitboxStart: 0,
          hitboxEnd: 0,
          flags: 0x0,
        }); // op 114
        e.f3 += 1.570796;
        e.f3 = normalizeAngle(e.f3);
        e.f4 = Math.cos(e.f3);
        e.f4 *= 32;
        e.f5 = Math.sin(e.f3);
        e.f5 *= 32;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 4,
          color: 4,
          angle: reg(0x2720) /* f0 */,
          speed: reg(0x2721) /* f1 */,
          tail: 0,
          head: 0,
          startLength: reg(0x2722) /* f2 */,
          width: 1e1,
          startTime: 0,
          duration: 800,
          despawn: 0,
          hitboxStart: 0,
          hitboxEnd: 0,
          flags: 0x0,
        }); // op 114
        e.f3 += 1.570796;
        e.f3 = normalizeAngle(e.f3);
        e.f4 = Math.cos(e.f3);
        e.f4 *= 32;
        e.f5 = Math.sin(e.f3);
        e.f5 *= 32;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 4,
          color: 8,
          angle: reg(0x2720) /* f0 */,
          speed: reg(0x2721) /* f1 */,
          tail: 0,
          head: 0,
          startLength: reg(0x2722) /* f2 */,
          width: 1e1,
          startTime: 0,
          duration: 800,
          despawn: 0,
          hitboxStart: 0,
          hitboxEnd: 0,
          flags: 0x0,
        }); // op 114
        e.f3 += 1.570796;
        e.f3 = normalizeAngle(e.f3);
        e.f4 = Math.cos(e.f3);
        e.f4 *= 32;
        e.f5 = Math.sin(e.f3);
        e.f5 *= 32;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 4,
          color: 13,
          angle: reg(0x2720) /* f0 */,
          speed: reg(0x2721) /* f1 */,
          tail: 0,
          head: 0,
          startLength: reg(0x2722) /* f2 */,
          width: 1e1,
          startTime: 0,
          duration: 800,
          despawn: 0,
          hitboxStart: 0,
          hitboxEnd: 0,
          flags: 0x0,
        }); // op 114
        yield e.delay(e.ci2);
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
        e.setShotRecord(0, 16, 0, 120, -1, 0.019167, 1.570796); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 60;
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
        e.f7 = e.randF32S * 32;
        e.f4 = Math.cos(e.randAngle);
        e.f4 *= e.f7;
        e.f5 = Math.sin(e.randAngle);
        e.f5 *= e.f7;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 6,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 0,
          transform: 0x212 /* ACCELERATE */,
        }); // op 104
        yield e.delay(e.ci2);
        e.f7 = e.randF32S * 32;
        e.f4 = Math.cos(e.randAngle);
        e.f4 *= e.f7;
        e.f5 = Math.sin(e.randAngle);
        e.f5 *= e.f7;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 8,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 0,
          transform: 0x212 /* ACCELERATE */,
        }); // op 104
        yield e.delay(e.ci2);
        e.f7 = e.randF32S * 32;
        e.f4 = Math.cos(e.randAngle);
        e.f4 *= e.f7;
        e.f5 = Math.sin(e.randAngle);
        e.f5 *= e.f7;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 13,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 0,
          transform: 0x212 /* ACCELERATE */,
        }); // op 104
        yield e.delay(e.ci2);
        e.f7 = e.randF32S * 32;
        e.f4 = Math.cos(e.randAngle);
        e.f4 *= e.f7;
        e.f5 = Math.sin(e.randAngle);
        e.f5 *= e.f7;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 2,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 0,
          transform: 0x212 /* ACCELERATE */,
        }); // op 104
        yield e.delay(e.ci2);
        e.f7 = e.randF32S * 32;
        e.f4 = Math.cos(e.randAngle);
        e.f4 *= e.f7;
        e.f5 = Math.sin(e.randAngle);
        e.f5 *= e.f7;
        e.setShotOrigin(e.f4, e.f5); // op 110
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 1,
          color: 4,
          count: 2,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 0,
          transform: 0x212 /* ACCELERATE */,
        }); // op 104
        yield e.delay(e.ci2);
        pc = 1;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_54(e: EnemyCtx): Generator<number, void, void> {
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
        e.setShotOrigin(0, 0); // op 110
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: 32,
          rings: 1,
          speed: 1.1,
          speed2: 0.8,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 6,
          count: 32,
          rings: 1,
          speed: 1.5,
          speed2: 0.8,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        yield 50;
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(34); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4620, 34); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('難題「仏の御石の鉢  -砕けぬ意思-」', '蓬莱山輝夜', 155, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('難題「仏の御石の鉢  -砕けぬ意思-」', '蓬莱山輝夜', 156, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神宝「ブディストダイアモンド」', '蓬莱山輝夜', 157, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神宝「ブディストダイアモンド」', '蓬莱山輝夜', 158, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(360); // op 160
        yield 100;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 0;
        e.f1 = 1;
        e.ci0 = 9;
        e.callSubAlloc(0, 58); // op 135
        e.callSubAlloc(1, 59); // op 135
        e.callSubAlloc(2, 60); // op 135
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildAttached(56, 0, 0, 3500, 1, 100000);
        e.f0 += 0.392699;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = 0;
        e.f1 = 2;
        e.ci0 = 11;
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildAttached(56, 0, 0, 3500, 1, 100000);
        e.f0 += 0.314159;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        if (e.isDiff(EASY | EXTRA)) {
          yield 200;
          pc = 9;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f0 = 0;
        e.f1 = 3;
        e.ci0 = 13;
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildAttached(56, 0, 0, 3500, 1, 100000);
        e.f0 += 0.261799;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 8;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        pc = 9;
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
        e.movePolar(60, 4, e.f0, e.f1);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 57); // op 135
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
        e.playSfx(16);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 4e2,
          startLength: 4e2,
          width: 1e1,
          startTime: 60,
          duration: 120,
          despawn: 20,
          hitboxStart: 60,
          hitboxEnd: 20,
          flags: 0x0,
        }); // op 114
        yield 200;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        pc = 2;
        break;
      }
      case 2: {
        e.playSfx(16);
        e.f2 = e.randF32S * 0.392699;
        e.f2 += e.f0;
        e.f2 = normalizeAngle(e.f2);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: 6,
          angle: reg(0x2722) /* f2 */,
          speed: 0,
          tail: 0,
          head: 4e2,
          startLength: 4e2,
          width: 1e1,
          startTime: 60,
          duration: 120,
          despawn: 20,
          hitboxStart: 60,
          hitboxEnd: 20,
          flags: 0x0,
        }); // op 114
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          yield e.delay(230);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          yield e.delay(180);
        }
        pc = 2;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_58(e: EnemyCtx): Generator<number, void, void> {
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
          e.i7 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 2;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = e.randF32S * 0.003333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = e.randF32S * 0.003333;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = e.randF32S * 0.005236;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = e.randF32S * 0.005236;
        }
        e.setShotRecord(0, 32, 0, 60, -1, e.f6, e.f0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = e.randF32S * 0.005;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = e.randF32S * 0.005;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = e.randF32S * 0.006283;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = e.randF32S * 0.006283;
        }
        e.setShotRecord(1, 32, 0, 60, -1, e.f6, e.f0); // op 111
        e.f0 = e.randF32S * 0.04488;
        e.f0 += 1.570796;
        e.cf0 = e.randF32 * 384;
        e.cf1 = e.randF32 * 128;
        e.cf0 = e.cf0 - e.posX;
        e.cf1 = e.cf1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.f1 = e.randF32 * 1;
        e.f1 += 0.6;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 12,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.7,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x222 /* CURL */,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          yield e.delay(4);
        }
        yield 2;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = e.randF32S * 0.003333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = e.randF32S * 0.003333;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = e.randF32S * 0.005236;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = e.randF32S * 0.005236;
        }
        e.setShotRecord(0, 32, 0, 60, -1, e.f6, e.f0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = e.randF32S * 0.001667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = e.randF32S * 0.005;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = e.randF32S * 0.005;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = e.randF32S * 0.001963;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = e.randF32S * 0.006283;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = e.randF32S * 0.006283;
        }
        e.setShotRecord(1, 32, 0, 60, -1, e.f6, e.f0); // op 111
        e.cf0 = e.randF32 * 384;
        e.cf1 = e.randF32 * 128;
        e.f0 = e.randF32S * 0.04488;
        e.f0 += 1.570796;
        e.cf0 = e.cf0 - e.posX;
        e.cf1 = e.cf1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.f1 = e.randF32 * 1;
        e.f1 += 0.6;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 13,
          color: reg(0x2717) /* i7 */,
          count: 2,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.7,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x222 /* CURL */,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          yield e.delay(3);
        }
        yield 2;
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

export function* sub_59(e: EnemyCtx): Generator<number, void, void> {
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
        if (e.hpRatio >= 128) {
          yield 30;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotOrigin(0, 0); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 6,
          color: 8,
          count: 64,
          rings: 1,
          speed: 4,
          speed2: 0.8,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        yield 30;
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

export function* sub_60(e: EnemyCtx): Generator<number, void, void> {
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
        e.f0 = e.timer;
        e.ci0 = 8;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 2.5;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotOrigin(0, 0); // op 110
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 6,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2721) /* f1 */,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        yield 8;
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(38); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3720, 38); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('難題「火鼠の皮衣  -焦れぬ心-」', '蓬莱山輝夜', 159, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('難題「火鼠の皮衣  -焦れぬ心-」', '蓬莱山輝夜', 160, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神宝「サラマンダーシールド」', '蓬莱山輝夜', 161, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神宝「サラマンダーシールド」', '蓬莱山輝夜', 162, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(240); // op 160
        e.ci3 = 0;
        e.callSubAlloc(0, 62); // op 135
        e.callSubAlloc(1, 63); // op 135
        e.f0 = -0.392699;
        e.f1 = 3;
        e.linkChildAttached(64, 0, 0, 500, 1, 100000);
        e.f0 = 0.392699;
        e.f1 = 3;
        e.linkChildAttached(64, 0, 0, 500, 1, 100000);
        e.f0 = 2.748893;
        e.f1 = 3;
        e.linkChildAttached(64, 0, 0, 500, 1, 100000);
        e.f0 = -2.748893;
        e.f1 = 3;
        e.linkChildAttached(64, 0, 0, 500, 1, 100000);
        yield 800;
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
        e.f0 = 0;
        e.setShotRecord(0, 8192, 0, 320, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 0, 100, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f3 = 0.330694;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f3 = 0.1904;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f3 = 0.1904;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f3 = 0.1904;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 = 0.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 = 0.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 = 0.6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 = 0.6;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = Math.cos(e.f0);
        e.cf0 *= 128;
        e.cf1 = Math.sin(e.f0);
        e.cf1 *= 128;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.setShotRecord(2, 16, 0, 120, -1, 0.008333, -999.900024); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 3,
          rings: 1,
          speed: reg(0x2725) /* f5 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: reg(0x2724) /* f4 */,
          transform: 0x20212 /* ACCELERATE | WAIT */,
        }); // op 97
        e.setShotRecord(2, 16, 0, 120, -1, -0.025, -999.900024); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 2,
          rings: 1,
          speed: reg(0x2725) /* f5 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: reg(0x2724) /* f4 */,
          transform: 0x20212 /* ACCELERATE | WAIT */,
        }); // op 97
        e.f0 += e.f3;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.ci2);
        pc = 1;
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
        e.f0 = -3.141593;
        e.setShotRecord(0, 8192, 0, 320, -1, -1, -1); // op 111
        e.setShotRecord(1, 131072, 0, 100, -1, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f3 = 0.330694;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f3 = 0.1904;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f3 = 0.1904;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f3 = 0.1904;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f4 = 0.314159;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 4;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 = 0.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 = 0.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 = 0.6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 = 0.6;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.cf0 = Math.cos(e.f0);
        e.cf0 *= 128;
        e.cf1 = Math.sin(e.f0);
        e.cf1 *= 128;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.setShotRecord(2, 16, 0, 120, -1, 0.008333, -999.900024); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 3,
          rings: 1,
          speed: reg(0x2725) /* f5 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: reg(0x2724) /* f4 */,
          transform: 0x20212 /* ACCELERATE | WAIT */,
        }); // op 97
        e.setShotRecord(2, 16, 0, 120, -1, -0.025, -999.900024); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 19,
          color: 1,
          count: 2,
          rings: 1,
          speed: reg(0x2725) /* f5 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: reg(0x2724) /* f4 */,
          transform: 0x20212 /* ACCELERATE | WAIT */,
        }); // op 97
        e.f0 -= e.f3;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.ci2);
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.movePolar(60, 4, e.f0, e.f1);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        yield 10;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 65); // op 135
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.callSubAlloc(1, 66); // op 135
        }
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

export function* sub_65(e: EnemyCtx): Generator<number, void, void> {
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
          e.f0 = 1.7;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 2.7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 3.7;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3.7;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.playSfx(17);
        if (e.isDiff(EASY | NORMAL | HARD | EXTRA)) {
          e.spawnLaser({
            aimed: false, // op 114 keeps the absolute angle
            type: 3,
            color: 1,
            angle: reg(0x2740) /* angleToPlayer */,
            speed: reg(0x2720) /* f0 */,
            tail: 0,
            head: 0,
            startLength: 8e1,
            width: 1e1,
            startTime: 0,
            duration: 400,
            despawn: 0,
            hitboxStart: 0,
            hitboxEnd: 0,
            flags: 0x0,
          }); // op 114
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnLaser({
            aimed: false, // op 114 keeps the absolute angle
            type: 3,
            color: 1,
            angle: reg(0x2740) /* angleToPlayer */,
            speed: reg(0x2720) /* f0 */,
            tail: 0,
            head: 0,
            startLength: 8e1,
            width: 1e1,
            startTime: 0,
            duration: 400,
            despawn: 0,
            hitboxStart: 0,
            hitboxEnd: 0,
            flags: 0x0,
          }); // op 114
        }
        if (e.isDiff(EASY | EXTRA)) {
          yield e.delay(120);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          yield e.delay(60);
        }
        if (e.isDiff(HARD | EXTRA)) {
          yield e.delay(30);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
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

export function* sub_66(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 380; // the script starts at frame 380
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
        e.playSfx(17);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 2,
          color: 2,
          angle: reg(0x2740) /* angleToPlayer */,
          speed: 0,
          tail: 0,
          head: 5.4e2,
          startLength: 5.4e2,
          width: 1e1,
          startTime: 40,
          duration: 20,
          despawn: 20,
          hitboxStart: 40,
          hitboxEnd: 20,
          flags: 0x0,
        }); // op 114
        yield e.delay(120);
        pc = 1;
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
        e.setSpellTimer(99999, 11); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setScriptFlags(3);
        e.setBossPresent(0);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(70); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4200, 70); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('難題「燕の子安貝  -永命線-」', '蓬莱山輝夜', 163, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('難題「燕の子安貝  -永命線-」', '蓬莱山輝夜', 164, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神宝「ライフスプリングインフィニティ」', '蓬莱山輝夜', 165, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神宝「ライフスプリングインフィニティ」', '蓬莱山輝夜', 166, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(240); // op 160
        e.autoAnm();
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        e.linkChildRelative(68, 0, 0, 1500, -2, 1000);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 2,
          count: 80,
          rings: 2,
          speed: 3,
          speed2: 1.5,
          angle: -1.5707964,
          angleStep: 0.05609987,
          transform: 0x202,
        }); // op 97
        e.moveBounce(60, 4, 1); // op 67
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          yield e.delay(140);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          yield e.delay(140);
        }
        pc = 3;
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
        e.f0 = e.timer;
        if (e.f0 >= 1.047198) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = 1.570796;
        pc = 2;
        break;
      }
      case 2: {
        if (e.f0 <= 2.094395) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = 1.570796;
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.movePolar(60, 4, e.f0, 2);
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.movePolar(90, 4, e.f0, 2.9);
        }
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.setHeadingSpeed(0, 0);
        yield* sub_69(e);
        pc = 6;
        break;
      }
      case 6: {
        e.nop(); // op 0
        e.setShotOrigin(0, 0); // op 110
        e.f0 = e.randAngle;
        e.setShotRecord(0, 64, 0, 60, 1, 1.570796, 1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: 2,
            count: 8,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: 2,
            count: 32,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.5,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 13,
            color: 2,
            count: 32,
            rings: 2,
            speed: 1.5,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        e.setShotRecord(0, 64, 0, 60, 1, -1.570796, 1); // op 111
        e.f0 += 0.098175;
        e.f0 = normalizeAngle(e.f0);
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 12,
            color: 2,
            count: 8,
            rings: 1,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 12,
            color: 2,
            count: 32,
            rings: 2,
            speed: 3,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 12,
            color: 2,
            count: 32,
            rings: 1,
            speed: 1.5,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 12,
            color: 2,
            count: 32,
            rings: 2,
            speed: 1.5,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.049087387,
            transform: 0x242 /* RAMP_TURN */,
          }); // op 99
        }
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
        e.f0 = e.randAngle;
        e.ci0 = 26;
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = e.f0 + 2.748893;
        e.f1 = normalizeAngle(e.f1);
        e.cf0 = Math.cos(e.f1);
        e.cf0 *= 64;
        e.cf1 = Math.sin(e.f1);
        e.cf1 *= 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.playSfx(17);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: 4,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 4e2,
          startLength: 4e2,
          width: 8,
          startTime: 90,
          duration: 40,
          despawn: 20,
          hitboxStart: 90,
          hitboxEnd: 20,
          flags: 0x4,
        }); // op 114
        e.f0 += 0.241661;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randAngle;
        e.ci0 = 26;
        pc = 3;
        break;
      }
      case 3: {
        e.f1 = e.f0 - 2.748893;
        e.f1 = normalizeAngle(e.f1);
        e.cf0 = Math.cos(e.f1);
        e.cf0 *= 64;
        e.cf1 = Math.sin(e.f1);
        e.cf1 *= 64;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.playSfx(17);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: 8,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 4e2,
          startLength: 4e2,
          width: 8,
          startTime: 90,
          duration: 40,
          despawn: 20,
          hitboxStart: 90,
          hitboxEnd: 20,
          flags: 0x4,
        }); // op 114
        e.f0 -= 0.241661;
        e.f0 = normalizeAngle(e.f0);
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
        e.setSpellTimer(99999, 11); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.spawnItemRandom(10); // op 142
        e.spawnItemBatch(5); // op 168
        e.setScriptFlags(3);
        e.setBossPresent(0);
        e.setMisc147(5); // op 147
        e.setMotionClamp(32, 48, 352, 128);
        e.setAnmScripts6Alt(7); // op 59
        e.setLives(2500);
        e.eclSetLives(0);
        e.setLifeBarSlice(0, 0, 2500, 16744576);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_71(e);
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
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(11); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(5400, 31); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('難題「蓬莱の弾の枝  -虹色の弾幕-」', '蓬莱山輝夜', 167, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('難題「蓬莱の弾の枝  -虹色の弾幕-」', '蓬莱山輝夜', 168, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神宝「蓬莱の玉の枝  -夢色の郷-」', '蓬莱山輝夜', 169, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神宝「蓬莱の玉の枝  -夢色の郷-」', '蓬莱山輝夜', 170, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(2400); // op 160
        e.setMisc183(1); // op 183
        e.autoAnm();
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 12;
        e.moveRelative(240, 0, e.posX, 64); // op 64
        e.i7 = 5;
        e.f4 = -2.199115;
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192.059998;
        e.f1 += 280;
        e.f2 = 0;
        e.f3 = 400;
        e.i0 = 2;
        e.linkChildRelative(72, 0, 0, 4000, -2, 100);
        e.f4 += 0.20944;
        e.f4 = normalizeAngle(e.f4);
        e.f2 -= 0.897598;
        e.f2 = normalizeAngle(e.f2);
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192;
        e.f1 += 280;
        e.f3 = 400;
        e.i0 = 4;
        e.linkChildRelative(72, 0, 0, 2100, -2, 100);
        e.f4 += 0.20944;
        e.f4 = normalizeAngle(e.f4);
        e.f2 -= 0.897598;
        e.f2 = normalizeAngle(e.f2);
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192;
        e.f1 += 280;
        e.f3 = 400;
        e.i0 = 6;
        e.linkChildRelative(72, 0, 0, 1000, -2, 100);
        e.f4 += 0.20944;
        e.f4 = normalizeAngle(e.f4);
        e.f2 -= 0.897598;
        e.f2 = normalizeAngle(e.f2);
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192;
        e.f1 += 280;
        e.f3 = 400;
        e.i0 = 8;
        e.linkChildRelative(72, 0, 0, 1000, -2, 100);
        e.f4 += 0.20944;
        e.f4 = normalizeAngle(e.f4);
        e.f2 -= 0.897598;
        e.f2 = normalizeAngle(e.f2);
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192;
        e.f1 += 280;
        e.f3 = 400;
        e.i0 = 10;
        e.linkChildRelative(72, 0, 0, 1000, -2, 100);
        e.f4 += 0.20944;
        e.f4 = normalizeAngle(e.f4);
        e.f2 -= 0.897598;
        e.f2 = normalizeAngle(e.f2);
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192;
        e.f1 += 280;
        e.f3 = 400;
        e.i0 = 13;
        e.linkChildRelative(72, 0, 0, 2100, -2, 100);
        e.f4 += 0.20944;
        e.f4 = normalizeAngle(e.f4);
        e.f2 -= 0.897598;
        e.f2 = normalizeAngle(e.f2);
        e.f0 = Math.cos(e.f4);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f4);
        e.f1 *= 96;
        e.f0 += 192;
        e.f1 += 280;
        e.f2 = 0;
        e.f3 = 400;
        e.i0 = 14;
        e.linkChildRelative(72, 0, 0, 4000, -2, 100);
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(0, 73); // op 135
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.callSubAlloc(0, 74); // op 135
        }
        yield 160;
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setHitFlash(1);
        e.clearScriptFlags(3);
        e.setShotNoFireRadius(0);
        e.cxf2 = Math.cos(e.f2);
        e.cxf2 *= e.f3;
        e.cxf3 = Math.sin(e.f2);
        e.cxf3 *= e.f3;
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.f2 = e.randSignF(400);
        e.interpSlot(10042 /* posX */, 120, 7, 0, e.cf0, e.f0, e.cxf2, e.f2);
        e.f2 = e.randSignF(400);
        e.interpSlot(10043 /* posY */, 120, 7, 0, e.cf1, e.f1, e.cxf3, e.f2);
        e.ef6 = e.f6;
        e.ef7 = e.f7;
        yield 120;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(0, 0);
        e.setHitFlash(0);
        yield e.delay(e.ci1);
        e.setScriptFlags(3);
        e.setShotRecord(0, 2048, 0, 0, -1, -999.900024, 0); // op 111
        e.setShotRecord(1, 128, 0, 1, 1, 0, -999.900024); // op 111
        e.setShotRecord(2, 16384, 0, 2, e.i0, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 32;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 48;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 48;
        }
        e.f0 = 1.2;
        e.ci0 = 1;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 2,
          color: reg(0x2710) /* i0 */,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0xa82 /* RAMP_HOME | BOUNCE_X */,
        }); // op 98
        yield e.delay(360);
        e.ci3 += 2;
        if (--e.ci0 > 0) {
          pc = 2;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, 75); // op 135
        e.callSubAlloc(1, 76); // op 135
        yield 30000;
        pc = 4;
        break;
      }
      case 4: {
        pc = 4;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_73(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 600; // the script starts at frame 600
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
        e.f0 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 1;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 1.5;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 16;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 2,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 4,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 10,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 13,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 14,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = 0;
        e.f1 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 10;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 8;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 2,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 4,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 10,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 13,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 14,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 2,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 4,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 10,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 13,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 14,
          count: 16,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        pc = 3;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_74(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 600; // the script starts at frame 600
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
        e.f0 = 0;
        e.ci0 = 5;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 2,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 4,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 3;
        break;
      }
      case 3: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 5;
        break;
      }
      case 5: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 10,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 6;
        break;
      }
      case 6: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 13,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 7;
        break;
      }
      case 7: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 14,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 40;
        pc = 8;
        break;
      }
      case 8: {
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.f0 = 0;
        e.f1 = 0;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 2,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 11;
        break;
      }
      case 11: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 4,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 12;
        break;
      }
      case 12: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 13;
        break;
      }
      case 13: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 14;
        break;
      }
      case 14: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 10,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 15;
        break;
      }
      case 15: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 13,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 16;
        break;
      }
      case 16: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 14,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 17;
        break;
      }
      case 17: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 2,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 18;
        break;
      }
      case 18: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 4,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 19;
        break;
      }
      case 19: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 20;
        break;
      }
      case 20: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 8,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 21;
        break;
      }
      case 21: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 10,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 22;
        break;
      }
      case 22: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 13,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 23;
        break;
      }
      case 23: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 14,
          count: 16,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.024544;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 -= 0.024544;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f0 += 0.012272;
        }
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.f1 -= 0.012272;
        }
        e.f0 = normalizeAngle(e.f0);
        e.f1 = normalizeAngle(e.f1);
        yield 20;
        pc = 24;
        break;
      }
      case 24: {
        pc = 10;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_75(e: EnemyCtx): Generator<number, void, void> {
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
        e.f1 = 3.141593;
        e.f2 = 0.05236;
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 = 2.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 = 2.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 = 3.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 = 3.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 300;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 200;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 30;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.09817477,
          transform: 0x4a82 /* RAMP_HOME | BOUNCE_X | RESPRITE */,
        }); // op 97
        e.f0 += 0.2;
        if (e.f0 < e.f5) {
          pc = 5;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = 3.141593;
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2;
        }
        yield e.delay(e.ci3);
        e.f2 *= -1;
        if (e.f5 >= 4) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        pc = 5;
        break;
      }
      case 4: {
        yield 128;
        pc = 7;
        break;
      }
      case 5: {
        e.f1 += e.f2;
        e.f1 = normalizeAngle(e.f1);
        yield 8;
        pc = 6;
        break;
      }
      case 6: {
        pc = 1;
        break;
      }
      case 7: {
        e.nop(); // op 0
        e.f0 = 2.1;
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.09817477,
          transform: 0x4a82 /* RAMP_HOME | BOUNCE_X | RESPRITE */,
        }); // op 97
        e.f1 += e.f2;
        e.f1 = normalizeAngle(e.f1);
        yield 8;
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

export function* sub_76(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 64; // the script starts at frame 64
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
        e.f1 = 0;
        e.f2 = 0.05236;
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1.3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2.3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 = 2.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 = 2.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 = 3.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 = 3.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 300;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 200;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 30;
        }
        e.ci0 = 10;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.09817477,
          transform: 0x4a82 /* RAMP_HOME | BOUNCE_X | RESPRITE */,
        }); // op 97
        e.f0 += 0.2;
        if (e.f0 < e.f5) {
          pc = 5;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = 0;
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 2;
        }
        yield e.delay(e.ci3);
        e.f2 *= -1;
        if (e.f5 >= 4) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        pc = 5;
        break;
      }
      case 4: {
        yield 128;
        pc = 7;
        break;
      }
      case 5: {
        e.f1 += e.f2;
        e.f1 = normalizeAngle(e.f1);
        yield 8;
        pc = 6;
        break;
      }
      case 6: {
        pc = 1;
        break;
      }
      case 7: {
        e.nop(); // op 0
        e.f0 = 2.1;
        pc = 8;
        break;
      }
      case 8: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: reg(0x2710) /* i0 */,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.09817477,
          transform: 0x4a82 /* RAMP_HOME | BOUNCE_X | RESPRITE */,
        }); // op 97
        e.f1 += e.f2;
        e.f1 = normalizeAngle(e.f1);
        yield 8;
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(3);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1200, 12); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('「永夜返し  -初月-」', '蓬莱山輝夜', 171, 0, 33000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('「永夜返し  -三日月-」', '蓬莱山輝夜', 172, 0, 33000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('「永夜返し  -上つ弓張-」', '蓬莱山輝夜', 173, 0, 33000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('「永夜返し  -待宵-」', '蓬莱山輝夜', 174, 0, 33000000);
        }
        e.setMisc155(1); // op 155
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.setMisc160(120); // op 160
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 78); // op 135
        e.callSubAlloc(1, 79); // op 135
        e.setShotNoFireRadius(0);
        yield 300;
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
        e.f0 = e.timer;
        e.f0 += 0.049087;
        e.ci0 = 28;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: 56,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 99
        yield 12;
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

export function* sub_79(e: EnemyCtx): Generator<number, void, void> {
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
          e.f0 = 1.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 1.6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 1.8;
        }
        e.setShotRecord(0, 128, 0, 60, 1, 0, e.f0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 40;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 16;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 13;
        }
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
          speed: 3,
          speed2: 0.5,
          angle: 3.1415927,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 97
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 7,
          color: 1,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.049087387,
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(3);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1200, 12); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('「永夜返し  -子の刻-」', '蓬莱山輝夜', 175, 0, 33000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('「永夜返し  -子の二つ-」', '蓬莱山輝夜', 176, 0, 33000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('「永夜返し  -子の三つ-」', '蓬莱山輝夜', 177, 0, 33000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('「永夜返し  -子の四つ-」', '蓬莱山輝夜', 178, 0, 33000000);
        }
        e.setMisc155(1); // op 155
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.setMisc160(120); // op 160
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 81); // op 135
        e.setShotNoFireRadius(0);
        yield 300;
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
        e.f0 = e.randAngle;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f4 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f4 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f4 = 1.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f4 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i4 = 48;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i4 = 64;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i4 = 64;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i4 = 64;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 12;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 12;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 8;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 32, 0, 640, -1, 0, 0.005236); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2714) /* i4 */,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x222 /* CURL */,
        }); // op 99
        e.setShotRecord(0, 32, 0, 640, -1, 0, -0.005236); // op 111
        yield e.delay(e.ci2);
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2714) /* i4 */,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x222 /* CURL */,
        }); // op 99
        yield e.delay(e.ci2);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        e.spawnShot({
          mode: 'aimedRing', // aim 2 of 96..104
          type: 10,
          color: 0,
          count: 1,
          rings: 1,
          speed: reg(0x2724) /* f4 */,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.049087387,
          transform: 0x202,
        }); // op 98
        pc = 0;
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(3);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1200, 12); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('「永夜返し  -丑の刻-」', '蓬莱山輝夜', 179, 0, 33000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('「永夜返し  -丑の二つ-」', '蓬莱山輝夜', 180, 0, 33000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('「永夜返し  -丑三つ時-」', '蓬莱山輝夜', 181, 0, 33000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('「永夜返し  -丑の四つ-」', '蓬莱山輝夜', 182, 0, 33000000);
        }
        e.setMisc155(1); // op 155
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.setMisc160(120); // op 160
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 83); // op 135
        e.setShotNoFireRadius(0);
        yield 300;
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
        e.f0 = e.randAngle;
        e.f1 = e.randAngle;
        e.ci0 = 120;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 15;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 11;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 11;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 12;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 14;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 15;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 32, 0, 640, -1, 0.02, 0.016111); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.049087387,
          transform: 0x222 /* CURL */,
        }); // op 99
        e.f0 -= 0.03927;
        e.f0 = normalizeAngle(e.f0);
        e.setShotRecord(0, 32, 0, 640, -1, 0.02, -0.016111); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 0.5,
          angle: reg(0x2721) /* f1 */,
          angleStep: 0.049087387,
          transform: 0x222 /* CURL */,
        }); // op 99
        e.f1 += 0.03927;
        e.f1 = normalizeAngle(e.f1);
        yield e.delay(e.ci2);
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(3);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1200, 12); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('「永夜返し  -寅の刻-」', '蓬莱山輝夜', 183, 0, 33000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('「永夜返し  -寅の二つ-」', '蓬莱山輝夜', 184, 0, 33000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('「永夜返し  -寅の三つ-」', '蓬莱山輝夜', 185, 0, 33000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('「永夜返し  -寅の四つ-」', '蓬莱山輝夜', 186, 0, 33000000);
        }
        e.setMisc155(1); // op 155
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.setMisc160(120); // op 160
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 85); // op 135
        e.callSubAlloc(1, 86); // op 135
        e.setShotNoFireRadius(0);
        yield 300;
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
        e.f0 = e.timer;
        e.f0 += 0.049087;
        e.ci0 = 12;
        e.f1 = 0.009817;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 48;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 56;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 64;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 64, 0, 30, 1, 3.043418, 3.8); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 99
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
        e.f0 = e.timer;
        e.f0 += 0.049087;
        e.ci0 = 12;
        e.f1 = 0.009817;
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(0, 64, 0, 30, 1, -3.043418, 3.8); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 6,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 5,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x242 /* RAMP_TURN */,
        }); // op 99
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
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_86(e: EnemyCtx): Generator<number, void, void> {
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
          e.ci2 = 30;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 22;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 18;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 15;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 2.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 2.6;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 128, 0, 60, 1, 0, e.f2); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 0,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: 3.1415927,
          angleStep: 0.049087387,
          transform: 0x282 /* RAMP_HOME */,
        }); // op 97
        yield e.delay(e.ci2);
        e.setShotRecord(0, 128, 0, 60, 1, 0, e.f2); // op 111
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 0,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: 0,
          angleStep: 0.049087387,
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(3);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(1800, 12); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 144); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('「永夜返し  -朝靄-」', '蓬莱山輝夜', 187, 0, 33000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('「永夜返し  -夜明け-」', '蓬莱山輝夜', 188, 0, 33000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('「永夜返し  -明けの明星-」', '蓬莱山輝夜', 189, 0, 33000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('「永夜返し  -世明け-」', '蓬莱山輝夜', 190, 0, 33000000);
        }
        e.setMisc155(1); // op 155
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        e.setMisc160(120); // op 160
        yield* sub_43(e);
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 88); // op 135
        e.setShotNoFireRadius(0);
        yield 300;
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
        e.ci0 = 50;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.8;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 8,
          color: 3,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
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
        e.ci0 = 50;
        e.setShotRecord(0, 32, 0, 120, -1, 0, 0.009817); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 7;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2.3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.8;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 7,
          color: 4,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x222 /* CURL */,
        }); // op 104
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
        e.ci0 = 50;
        e.setShotRecord(0, 32, 0, 120, -1, 0, -0.009817); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 7;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 2.6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 2.8;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 9,
          color: 5,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 1,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x222 /* CURL */,
        }); // op 104
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
        e.ci0 = 50;
        e.setShotRecord(0, 32, 0, 120, -1, 0, 0.009817); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 9;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2.6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 2.8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 3.2;
        }
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 13,
          color: 13,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 1,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x222 /* CURL */,
        }); // op 104
        yield 4;
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
        e.ci0 = 50;
        e.setShotRecord(0, 32, 0, 120, -1, 0, -0.009817); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 3.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 3.4;
        }
        pc = 13;
        break;
      }
      case 13: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 18,
          color: 1,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 1.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x222 /* CURL */,
        }); // op 104
        yield 4;
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
        e.ci0 = 50;
        e.setShotRecord(0, 32, 0, 120, -1, 0, 0.009817); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 6;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 2.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 3;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 3.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 3.4;
        }
        pc = 16;
        break;
      }
      case 16: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 11,
          color: 4,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 1.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x222 /* CURL */,
        }); // op 104
        yield 4;
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
        e.ci0 = 600;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 9;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 3.5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 4.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 5;
        }
        pc = 19;
        break;
      }
      case 19: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 7,
          color: 1,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
        yield 2;
        pc = 20;
        break;
      }
      case 20: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 8,
          color: 2,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
        yield 2;
        pc = 21;
        break;
      }
      case 21: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 9,
          color: 3,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
        yield 2;
        pc = 22;
        break;
      }
      case 22: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 18,
          color: 4,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
        yield 2;
        pc = 23;
        break;
      }
      case 23: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 12,
          color: 10,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
        yield 2;
        pc = 24;
        break;
      }
      case 24: {
        e.spawnShot({
          mode: 'randomAngleSpeed', // aim 8 of 96..104
          type: 11,
          color: 13,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 0.5,
          angle: -3.1415927,
          angleStep: 3.1415927,
          transform: 0x202,
        }); // op 104
        yield 2;
        pc = 25;
        break;
      }
      case 25: {
        if (--e.ci0 > 0) {
          pc = 19;
          break;
        }
        pc = 26;
        break;
      }
      case 26: {
        pc = 0;
        break;
      }
      default:
        return;
    }
  }
}
