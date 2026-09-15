// Auto-generated from ecldata6.ecl by tools/th08/ecl
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
// ecldata6.ecl: 88 subs, translated by tools/th08/ecl
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
        e.setMisc160(200); // op 160
        e.clearScriptFlags(2);
        e.setMisc144(8, 4); // op 144
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
          e.f0 = 2.5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 2.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 3;
        }
        e.setShotRecord(0, 64, 0, 50, 1, 1.570796, e.f0); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 8;
        }
        e.i0 = 8;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle - 3.141593;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x240 /* RAMP_TURN */,
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
        e.i0 = 4;
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 1,
          color: 6,
          count: 4,
          rings: 1,
          speed: 1.4,
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
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.moveAngle + 3.141593;
        if (e.isDiff(NORMAL | HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 1,
            color: 2,
            count: 3,
            rings: 1,
            speed: 0.8,
            speed2: 1.2,
            angle: reg(0x2755) /* moveAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 99
        }
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
        e.linkChildStandard(9, e.f1, e.posY, 600, -2, 100);
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
          e.i0 = 7;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 9;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 3;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 4.5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 5.5;
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
          speed: reg(0x2721) /* f1 */,
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
        e.setShotRecord(0, 8192, 0, 180, -1, -1, -1); // op 111
        if (e.i0 >= 3) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(1, 64, 1, 40, 1, 1.570796, 2.8); // op 111
        e.setShotRecord(2, 64, 0, 40, 1, -1.570796, 1.5); // op 111
        pc = 3;
        break;
      }
      case 2: {
        e.setShotRecord(1, 64, 1, 40, 1, -1.570796, 2.8); // op 111
        e.setShotRecord(2, 64, 0, 40, 1, 1.570796, 1.5); // op 111
        pc = 3;
        break;
      }
      case 3: {
        e.i0 = 14;
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 = 1.570796;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 = 0.785398;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 = 0.785398;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 = 0.785398;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 5;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 6;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 5,
          color: 2,
          count: reg(0x2711) /* i1 */,
          rings: 1,
          speed: 3.2,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2240 /* RAMP_TURN | HOLD */,
        }); // op 99
        e.f0 += e.f7;
        e.f0 = normalizeAngle(e.f0);
        yield e.delay(e.i0);
        pc = 4;
        break;
      }
      default:
        return;
    }
  }
}

export function* sub_11(e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  yield 3; // the script starts at frame 3
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
        e.setBounds(48, 48);
        e.setMisc160(60); // op 160
        e.setLives(13000);
        e.setSpellTimer(5940, 21); // op 134
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(21); // op 130
        e.eclSetLives(1);
        e.setRelPos(32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(17, 1); // op 126
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
        e.setScriptFlags(7);
        e.setMisc160(120); // op 160
        e.setBossPresent(0);
        e.setMisc144(10, 5); // op 144
        e.setLives(13000);
        e.eclSetLives(0);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(26); // op 130
        e.setSpellTimer(2100, 21); // op 134
        e.setPhase(0, 1600, 21); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.ci3 = 0;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_18(e);
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
        e.linkChildRelative(19, 0, 0, 300, -2, 100);
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
        e.callSubAlloc(0, 20); // op 135
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
        e.setMisc144(10, 5); // op 144
        e.setMisc160(320); // op 160
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setSpellTimer(2400, 26); // op 134
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(27); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3600, 26); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('天丸「壺中の天地」', '八意永琳', 119, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('天丸「壺中の天地」', '八意永琳', 120, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('天丸「壺中の天地」', '八意永琳', 121, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('天丸「壺中の天地」', '八意永琳', 122, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(420); // op 160
        e.setSpellTimer(2400, 26); // op 134
        e.setMisc129(1); // op 129
        e.setDeathCallbackSub(27); // op 130
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
        e.linkChildRelative(25, 0, 0, 100, -2, 100);
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
        yield 240;
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
        e.ci1 *= 3;
        yield e.delay(e.ci1);
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 200;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.f2 = 0.7;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f2 = 0.7;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f2 = 0.9;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f2 = 1.2;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f1 = Math.atan2(e.f7 - e.posY, e.f6 - e.posX);
        e.f0 = e.randF32S * 0.392699;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 0,
          color: 6,
          count: 1,
          rings: 1,
          speed: reg(0x2722) /* f2 */,
          speed2: 0.8,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 97
        yield e.delay(e.ci2);
        e.f0 = e.randF32S * 0.19635;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 0,
          color: 2,
          count: 1,
          rings: 1,
          speed: reg(0x2722) /* f2 */,
          speed2: 0.8,
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
        e.f6 = e.playerX;
        e.f7 = e.playerY;
        if (e.f6 >= 88) {
          pc = 2;
          break;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f6 = 88;
        pc = 4;
        break;
      }
      case 2: {
        if (e.f6 <= 296) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f6 = 296;
        pc = 4;
        break;
      }
      case 4: {
        if (e.f7 >= 88) {
          pc = 6;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f7 = 88;
        pc = 8;
        break;
      }
      case 6: {
        if (e.f7 <= 360) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.f7 = 360;
        pc = 8;
        break;
      }
      case 8: {
        e.f1 = Math.atan2(e.f7 - e.ef7, e.f6 - e.ef6);
        e.setHeadingSpeed(e.f1, 0.2);
        e.f2 = Math.cos(e.f1);
        e.f2 *= 0.2;
        e.f3 = Math.sin(e.f1);
        e.f3 *= 0.2;
        e.ef6 += e.f2;
        e.ef7 += e.f3;
        yield 1;
        pc = 9;
        break;
      }
      case 9: {
        pc = 0;
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
        e.callSubAlloc(2, 24); // op 135
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 22); // op 135
        e.callSubAlloc(1, 23); // op 135
        yield 200;
        pc = 3;
        break;
      }
      case 3: {
        e.moveOrbit(6000, e.ef6, e.ef7, e.f4, e.f5, 80, 1);
        e.callSubAlloc(2, -1); // op 135
        yield 120;
        pc = 4;
        break;
      }
      case 4: {
        e.setScriptFlags(16);
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
        e.setMisc147(1); // op 147
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
        e.endSpell();
        e.spawnItem(3);
        e.setMisc147(1); // op 147
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
        e.setAnmScripts6Alt(0); // op 59
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBossPresent(0);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 52); // op 134
        e.setRelPos(-32, -32);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.setMisc126(33, 1); // op 126
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
        e.setAnmAlt(6);
        e.setBossPresent(1);
        e.setMisc159(0); // op 159
        e.setRelPos(192, 96);
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 52); // op 134
        yield* sub_49(e);
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc126(30, 1); // op 126
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
        e.setBossPresent(-1);
        e.clearScriptFlags(48);
        e.setMisc160(120); // op 160
        e.setMisc144(10, 5); // op 144
        e.setLives(20000);
        e.eclSetLives(2);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(51); // op 130
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
        yield* sub_49(e);
        pc = 7;
        break;
      }
      case 7: {
        e.setBossPresent(-1);
        e.setMisc136(17, 0); // op 136
        yield 200;
        pc = 8;
        break;
      }
      case 8: {
        e.setBossPresent(1);
        e.setScriptFlags(3);
        yield 800;
        pc = 9;
        break;
      }
      case 9: {
        e.nop(); // op 0
        pc = 10;
        break;
      }
      case 10: {
        e.spawnItem(1);
        yield 60;
        pc = 11;
        break;
      }
      case 11: {
        pc = 10;
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
        e.setAnmAlt(6);
        e.setBossPresent(1);
        e.setMisc159(0); // op 159
        e.setRelPos(192, 96);
        e.clearScriptFlags(3);
        e.clearScriptFlags(20);
        e.setBounds(48, 32);
        e.setMisc160(60); // op 160
        e.eclSetLives(0);
        e.setSpellTimer(180000, 52); // op 134
        yield* sub_49(e);
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_32(e);
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
        e.clearScriptFlags(48);
        e.setMisc160(120); // op 160
        e.setMisc144(10, 5); // op 144
        e.setLives(20000);
        e.eclSetLives(2);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(51); // op 130
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
        e.setScriptFlags(3);
        yield 800;
        pc = 7;
        break;
      }
      case 7: {
        e.nop(); // op 0
        pc = 8;
        break;
      }
      case 8: {
        e.spawnItem(1);
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
        e.setScriptFlags(3);
        e.setMisc160(120); // op 160
        e.setBossPresent(0);
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(4);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(36); // op 130
        e.setSpellTimer(2400, 52); // op 134
        e.setPhase(0, 2200, 52); // op 133
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
        yield* sub_49(e);
        pc = 7;
        break;
      }
      case 7: {
        yield* sub_34(e);
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
        yield* sub_35(e);
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
        pc = 7;
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
        e.autoAnm();
        e.f2 = e.randAngle;
        e.ci0 = 32;
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 15;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 22;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 1.3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.490874;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.245437;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.245437;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.245437;
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
        e.setShotRecord(1, 64, 1, 60, 1, -2.513274, e.f6); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 2.513274, e.f6); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 131072, 0, e.ci0, -1, -1, -1); // op 111
        e.setShotRecord(3, 16384, 0, 2, 6, -1, -1); // op 111
        e.f2 += 0.19635;
        e.f2 = normalizeAngle(e.f2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2716) /* i6 */,
          rings: 1,
          speed: 3.5,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x26240 /* RAMP_TURN | HOLD | RESPRITE | WAIT */,
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
        e.autoAnm();
        e.f2 = e.randAngle;
        e.ci0 = 32;
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 10;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 15;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 22;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 1.2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 1.3;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.490874;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.245437;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.245437;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.245437;
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
        e.setShotRecord(1, 64, 1, 60, 1, -2.513274, e.f6); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(1, 64, 1, 60, 1, 2.513274, e.f6); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.setShotRecord(2, 131072, 0, e.ci0, -1, -1, -1); // op 111
        e.setShotRecord(3, 16384, 0, 2, 2, -1, -1); // op 111
        e.f2 -= 0.19635;
        e.f2 = normalizeAngle(e.f2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: reg(0x2716) /* i6 */,
          rings: 1,
          speed: 3.5,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2727) /* f7 */,
          transform: 0x26240 /* RAMP_TURN | HOLD | RESPRITE | WAIT */,
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(240); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc147(2); // op 147
        e.setMisc144(10, 5); // op 144
        e.setLives(18000);
        e.eclSetLives(3);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(40); // op 130
        e.setSpellTimer(2400, 56); // op 134
        e.setPhase(0, 2200, 56); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.i0 = 20;
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_49(e);
        pc = 2;
        break;
      }
      case 2: {
        e.setMisc136(15, 0); // op 136
        e.spawnEnemy(15, 0, 0, 0, 1000, -2, 10);
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
        e.f1 = 2;
        e.ci0 = 12;
        e.autoAnm();
        pc = 5;
        break;
      }
      case 5: {
        e.linkChildRelative(39, 0, 0, 1500, 1, 100000);
        e.f0 += 0.523599;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.moveBounce(60, 4, 1); // op 67
        if (e.ci3 != 0) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.callSubAlloc(0, 37); // op 135
        pc = 8;
        break;
      }
      case 8: {
        e.ci3++;
        yield 30;
        pc = 9;
        break;
      }
      case 9: {
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 3;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 4;
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
        e.f0 = e.randAngle;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 2.2,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.03927;
        e.f0 = normalizeAngle(e.f0);
        yield 2;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 2,
          color: 2,
          count: reg(0x2710) /* i0 */,
          rings: reg(0x2711) /* i1 */,
          speed: 1.2,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.1308997,
          transform: 0x202,
        }); // op 99
        e.f0 += 0.03927;
        e.f0 = normalizeAngle(e.f0);
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
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
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
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 524288, 0, 27, -1, -1, -1); // op 111
        e.setShotRecord(2, 262144, 0, -1, -1, -1, -1); // op 111
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
          transform: 0xe0208 /* FADE_OUT | SOUND | WAIT */,
        }); // op 99
        yield 4;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setHeadingSpeed(e.f0, e.f1);
        yield 10;
        pc = 1;
        break;
      }
      case 1: {
        e.callSubAlloc(0, 38); // op 135
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(420); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc147(3); // op 147
        e.setMisc144(10, 5); // op 144
        e.setLives(20000);
        e.eclSetLives(2);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(44); // op 130
        e.setSpellTimer(3600, 63); // op 134
        e.setPhase(0, 2200, 63); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.i0 = 20;
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_49(e);
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
          e.ci0 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 12;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 12;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1.047198;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.523599;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.523599;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.523599;
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
        e.linkChildRelative(43, 0, 0, 1500, -2, 100000);
        e.f0 += e.f7;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 5;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.moveBounce(60, 4, 1); // op 67
        yield 60;
        pc = 7;
        break;
      }
      case 7: {
        e.f0 = e.randAngle;
        e.f1 = -0.010472;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci0 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci0 = 12;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci0 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci0 = 12;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1.047198;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.523599;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.523599;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.523599;
        }
        e.i0 = 0;
        e.i1 = 2;
        e.i2 = 1;
        e.f2 = -0.785398;
        e.autoAnm();
        pc = 8;
        break;
      }
      case 8: {
        e.linkChildRelative(43, 0, 0, 1500, -2, 100000);
        e.f0 += e.f7;
        e.f0 = normalizeAngle(e.f0);
        if (--e.ci0 > 0) {
          pc = 8;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.ci3++;
        yield 160;
        pc = 10;
        break;
      }
      case 10: {
        e.moveBounce(60, 4, 1); // op 67
        e.callSubAlloc(0, 41); // op 135
        yield 60;
        pc = 11;
        break;
      }
      case 11: {
        pc = 4;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 5,
            count: 36,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 5,
            count: 56,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 5,
            count: 56,
            rings: 2,
            speed: 1.2,
            speed2: 0.5,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 5,
            count: 64,
            rings: 2,
            speed: 1.8,
            speed2: 1,
            angle: reg(0x2762) /* randAngle */,
            angleStep: 0,
            transform: 0x202,
          }); // op 99
        }
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
        e.setGaugeTimer(0, 0, 0, 0, 0, 0); // op 152
        e.cf0 = e.cf0 - e.posX;
        e.cf1 = e.cf1 - e.posY;
        e.setShotOrigin(e.cf0, e.cf1); // op 110
        e.setShotRecord(0, 131072, 0, 200, -1, -1, -1); // op 111
        e.setShotRecord(1, 524288, 0, 27, -1, -1, -1); // op 111
        yield 50;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 8;
        pc = 2;
        break;
      }
      case 2: {
        e.f0 = e.randF32 * 0.5;
        e.f0 += 1;
        e.f0 /= 120;
        e.setShotRecord(2, 16, 0, 120, -1, e.f0, -999); // op 111
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
          transform: 0xa0212 /* ACCELERATE | SOUND | WAIT */,
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
        e.callSubAlloc(0, 42); // op 135
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
        e.setScriptFlags(4);
        e.setScriptFlags(3);
        e.setMisc160(320); // op 160
        e.setTimeout(-1);
        e.endSpell();
        e.setBossPresent(0);
        e.setMisc147(4); // op 147
        e.setMisc144(10, 5); // op 144
        e.setLives(20000);
        e.eclSetLives(1);
        e.setMotionClamp(32, 48, 352, 128);
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(44); // op 130
        e.setSpellTimer(3600, 68); // op 134
        e.setPhase(0, 2200, 68); // op 133
        e.setLifeBarSlice(0, 0, e.phase0, 16744576);
        e.moveRelative(60, 4, 192, 128); // op 64
        e.i0 = 20;
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        yield* sub_49(e);
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
        e.callSubAlloc(0, 45); // op 135
        e.callSubAlloc(1, 46); // op 135
        e.callSubAlloc(2, 47); // op 135
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
        e.f0 = 1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 4;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 8192, 0, 240, -1, -1, -1); // op 111
        e.setShotRecord(1, 32, 1, 120, -1, -0.016667, 0.02618); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 18,
          color: 3,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 3,
          speed2: 0.5,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0,
          transform: 0x2220 /* CURL | HOLD */,
        }); // op 99
        e.f0 += 0.1496;
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
        e.f0 = 1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 4;
        }
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
          count: reg(0x2710) /* i0 */,
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

export function* sub_47(e: EnemyCtx): Generator<number, void, void> {
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
          e.i0 = 16;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 52;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 64;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 64;
        }
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
          e.f0 = 1.2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 60;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 60;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 60;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 30;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 7,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.5,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        pc = 1;
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
        e.setAnmScripts6Alt(0); // op 59
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
        e.setDeathCallbackSub(50); // op 130
        yield* sub_78(e);
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
        e.setMisc147(6); // op 147
        e.maxHp = 1;
        e.setMisc129(0); // op 129
        e.maxHp = 1;
        e.setMisc129(0); // op 129
        e.setDeathCallbackSub(-1); // op 130
        e.callSubRemote(1, 51);
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(36); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(2400, 36); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('覚神「神代の記憶」', '八意永琳', 123, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('覚神「神代の記憶」', '八意永琳', 124, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神符「天人の系譜」', '八意永琳', 125, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神符「天人の系譜」', '八意永琳', 126, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(240); // op 160
        e.callSubAlloc(0, 53); // op 135
        e.callSubAlloc(1, 54); // op 135
        pc = 2;
        break;
      }
      case 2: {
        e.playSfx(16);
        e.f0 = e.timer;
        e.ci0 = 0;
        e.spawnEnemyAlt(55, 0, 0, 0, 10, -2, 10);
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
        pc = 2;
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
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 0,
          count: 10,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: 3.1415927,
          angleStep: 0.3926991,
          transform: 0x202,
        }); // op 96
        yield 50;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 7;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 13;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 17;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 21;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 0.20944;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 0.116355;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 0.101342;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 0.076624;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 = 1.4;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 = 1.4;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 = 1.8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 = 2;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 20;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 17;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = e.randF32S * 0.19635;
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 2,
            count: reg(0x2716) /* i6 */,
            rings: 1,
            speed: reg(0x2725) /* f5 */,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2726) /* f6 */,
            transform: 0x202,
          }); // op 96
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'aimedFan', // aim 0 of 96..104
            type: 2,
            color: 6,
            count: reg(0x2716) /* i6 */,
            rings: 1,
            speed: reg(0x2725) /* f5 */,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: reg(0x2726) /* f6 */,
            transform: 0x202,
          }); // op 96
        }
        yield e.delay(e.ci2);
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
        e.setAnm(53);
        e.clearScriptFlags(8);
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 2;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 2;
        }
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: reg(0x2717) /* i7 */,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 7e1,
          startLength: 7e1,
          width: 1e1,
          startTime: 60,
          duration: 60,
          despawn: 20,
          hitboxStart: 60,
          hitboxEnd: 20,
          flags: 0x4,
        }); // op 114
        e.cf0 = Math.cos(e.f0);
        e.cf0 *= 70;
        e.cf1 = Math.sin(e.f0);
        e.cf1 *= 70;
        e.cf0 += e.posX;
        e.cf1 += e.posY;
        e.f1 = e.f0;
        e.moveRelative(14, 0, e.cf0, e.cf1); // op 64
        e.setShotRecord(0, 262144, 0, -1, -1, -1, -1); // op 111
        e.ci1 = 7;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: reg(0x2717) /* i7 */,
          count: 1,
          rings: 1,
          speed: 0.1,
          speed2: 1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.09817477,
          transform: 0x40204 /* FADE_OUT */,
        }); // op 99
        yield 2;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci1 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.ci0++;
        if (e.posX >= 0) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        return;
      }
      case 5: {
        if (e.posX <= 384) {
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        return;
      }
      case 7: {
        if (e.posY >= 0) {
          pc = 9;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        return;
      }
      case 9: {
        if (e.posY <= 448) {
          pc = 11;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
        return;
      }
      case 11: {
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 7;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 7;
        }
        if (e.ci0 < e.i7) {
          pc = 13;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        return;
      }
      case 13: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f0 = e.f1 + 0.698132;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = e.f1 + 0.766242;
        }
        e.spawnEnemyAlt(55, 0, 0, 0, 10, -2, 10);
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f0 = e.f1 - 0.698132;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f0 = e.f1 - 0.766242;
        }
        e.spawnEnemyAlt(55, 0, 0, 0, 10, -2, 10);
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(40); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4620, 40); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('蘇活「生命遊戯　-ライフゲーム-」', '八意永琳', 127, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('蘇活「生命遊戯　-ライフゲーム-」', '八意永琳', 128, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('蘇生「ライジングゲーム」', '八意永琳', 129, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('蘇生「ライジングゲーム」', '八意永琳', 130, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(240); // op 160
        e.linkChildRelative(60, 0, 0, 400, 1, 100000);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.moveBounce(60, 0, 1); // op 67
        yield 200;
        pc = 3;
        break;
      }
      case 3: {
        e.callSubAlloc(0, 57); // op 135
        e.callSubAlloc(1, 58); // op 135
        e.callSubAlloc(2, 59); // op 135
        pc = 4;
        break;
      }
      case 4: {
        e.linkChildRelative(60, 0, 0, 400, 1, 100000);
        yield 60;
        pc = 5;
        break;
      }
      case 5: {
        e.moveBounce(60, 0, 1); // op 67
        yield 200;
        pc = 6;
        break;
      }
      case 6: {
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
        e.f0 = e.randAngle;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 10,
            color: 2,
            count: 1,
            rings: 1,
            speed: 1.2,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 10,
            color: 2,
            count: 4,
            rings: 1,
            speed: 1.5,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 10,
            color: 2,
            count: 6,
            rings: 1,
            speed: 2,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 10,
            color: 0,
            count: 6,
            rings: 1,
            speed: 2,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f0 += 0.224399;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f0 += 0.224399;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f0 += 0.224399;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f0 += 0.224399;
        }
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
        e.f0 = e.randAngle;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 7,
            color: 5,
            count: 3,
            rings: 1,
            speed: 1.1,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 7,
            color: 5,
            count: 5,
            rings: 1,
            speed: 1.1,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 7,
            color: 5,
            count: 5,
            rings: 1,
            speed: 1.1,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 7,
            color: 1,
            count: 5,
            rings: 1,
            speed: 1.1,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        e.f0 -= 0.1848;
        e.f0 = normalizeAngle(e.f0);
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
        e.f0 = e.randAngle;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 9,
            count: 3,
            rings: 1,
            speed: 0.9,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 9,
            count: 6,
            rings: 1,
            speed: 0.9,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 9,
            count: 6,
            rings: 1,
            speed: 1.2,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'evenRing', // aim 3 of 96..104
            type: 17,
            color: 1,
            count: 9,
            rings: 1,
            speed: 1.2,
            speed2: 1,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.09817477,
            transform: 0x204,
          }); // op 99
        }
        e.f0 += 0.0748;
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
        e.setShotNoFireRadius(0);
        e.movePolar(60, 4, e.timer, 3.2);
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEnemyAlt(62, 0, 0, 0, 10, -2, 10);
        e.movePolar(60, 4, e.timer, 2);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.spawnEnemyAlt(62, 0, 0, 0, 10, -2, 10);
        if (e.isDiff(EASY | NORMAL | EXTRA)) return;
        pc = 3;
        break;
      }
      case 3: {
        e.movePolar(60, 4, e.timer, 2);
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.spawnEnemyAlt(62, 0, 0, 0, 10, -2, 10);
        return;
      }
      default:
        return;
    }
  }
}

export function* sub_61(_e: EnemyCtx): Generator<number, void, void> {
  let pc = 0;
  let steps = 0;
  while (pc >= 0) {
    // A loop body with no waits would otherwise spin inside one frame.
    if (++steps > 2000) {
      steps = 0;
      yield 1;
    }
    switch (pc) {
      case 0: {
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
        e.setAnm(53);
        e.clearScriptFlags(16);
        e.clearScriptFlags(8);
        e.setShotNoFireRadius(48);
        e.setShotRecord(0, 131072, 0, 120, -1, -1, -1); // op 111
        e.setShotRecord(1, 262144, 0, -1, -1, -1, -1); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 1,
          rings: 1,
          speed: 0,
          speed2: 1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.09817477,
          transform: 0x60204 /* FADE_OUT | WAIT */,
        }); // op 99
        e.ci1++;
        if (e.ci1 < 9) {
          yield 4;
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
        e.i2 = e.i0 + 3;
        if (e.i2 < 6) {
          pc = 4;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.i2 -= 6;
        pc = 4;
        break;
      }
      case 4: {
        e.i1 = e.randU31 % 6;
        if (e.i1 != e.i2) {
          pc = 7;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.i1++;
        if (e.i1 < 6) {
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.i1 = 0;
        pc = 7;
        break;
      }
      case 7: {
        e.i0 = e.i1;
        e.f0 = e.i1 * 1.047198;
        e.f0 += -2.094395;
        e.cf0 = Math.cos(e.f0);
        e.cf0 *= 24;
        e.cf1 = Math.sin(e.f0);
        e.cf1 *= 24;
        e.spawnEnemyAlt(62, 1176352768, 1176353792, 0, 10, -2, 10);
        e.i1 = e.randU31 % 6;
        if (e.i1 != e.i2) {
          pc = 10;
          break;
        }
        pc = 8;
        break;
      }
      case 8: {
        e.i1--;
        if (e.i1 >= 0) {
          pc = 10;
          break;
        }
        pc = 9;
        break;
      }
      case 9: {
        e.i1 = 5;
        pc = 10;
        break;
      }
      case 10: {
        if (e.i1 != e.i0) {
          pc = 16;
          break;
        }
        pc = 11;
        break;
      }
      case 11: {
        e.i1--;
        if (e.i1 >= 0) {
          pc = 13;
          break;
        }
        pc = 12;
        break;
      }
      case 12: {
        e.i1 = 5;
        pc = 13;
        break;
      }
      case 13: {
        if (e.i1 != e.i2) {
          pc = 16;
          break;
        }
        pc = 14;
        break;
      }
      case 14: {
        e.i1--;
        if (e.i1 >= 0) {
          pc = 16;
          break;
        }
        pc = 15;
        break;
      }
      case 15: {
        e.i1 = 5;
        pc = 16;
        break;
      }
      case 16: {
        e.i0 = e.i1;
        e.f0 = e.i1 * 1.047198;
        e.f0 += -2.094395;
        e.cf0 = Math.cos(e.f0);
        e.cf0 *= 24;
        e.cf1 = Math.sin(e.f0);
        e.cf1 *= 24;
        e.spawnEnemyAlt(62, 1176352768, 1176353792, 0, 10, -2, 10);
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
        e.setMisc129(2); // op 129
        e.setDeathCallbackSub(44); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(3720, 44); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('操神「オモイカネディバイス」', '八意永琳', 131, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('操神「オモイカネディバイス」', '八意永琳', 132, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('神脳「オモイカネブレイン」', '八意永琳', 133, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('神脳「オモイカネブレイン」', '八意永琳', 134, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(480); // op 160
        e.ci3 = 0;
        pc = 2;
        break;
      }
      case 2: {
        e.f1 = 0.007306;
        e.linkChildRelative(65, 0, 0, 4000, 1, 100000);
        yield 400;
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        if (e.ci3 != 0) {
          yield 400;
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.autoAnm();
        e.setShotOrigin(-16, -32); // op 110
        e.callSubAlloc(0, 64); // op 135
        yield 400;
        pc = 5;
        break;
      }
      case 5: {
        e.f1 = -0.007306;
        e.linkChildRelative(65, 0, 0, 4000, 1, 100000);
        e.ci3++;
        yield 800;
        pc = 6;
        break;
      }
      case 6: {
        pc = 2;
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
        e.f0 = e.randAngle;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.273182;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.1904;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.1904;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.1904;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 1.4;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 2,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.03141593,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 4,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.03141593,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 4,
            rings: 1,
            speed: 1,
            speed2: 0.5,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.03141593,
            transform: 0x202,
          }); // op 97
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.spawnShot({
            mode: 'fixedFan', // aim 1 of 96..104
            type: 2,
            color: 6,
            count: 4,
            rings: 2,
            speed: reg(0x2727) /* f7 */,
            speed2: 0.8,
            angle: reg(0x2720) /* f0 */,
            angleStep: 0.03141593,
            transform: 0x202,
          }); // op 97
        }
        e.f0 += e.f1;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.setShotNoFireRadius(0);
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        e.moveRelative(60, 4, 192, 320); // op 64
        yield 60;
        pc = 1;
        break;
      }
      case 1: {
        e.setHeadingSpeed(-1.570796, 0.1);
        yield 60;
        pc = 2;
        break;
      }
      case 2: {
        e.callSubAlloc(0, 66); // op 135
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.callSubAlloc(1, 67); // op 135
        }
        yield 60;
        pc = 3;
        break;
      }
      case 3: {
        e.setHeadingVel(e.f1);
        yield 200;
        pc = 4;
        break;
      }
      case 4: {
        e.setSpeedAccel(0.0025);
        yield 400;
        pc = 5;
        break;
      }
      case 5: {
        e.setHeadingVel(0);
        yield 4200;
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
        if (e.isDiff(EASY | EXTRA)) {
          e.i0 = 22;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i0 = 28;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i0 = 26;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i1 = 5;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i1 = 5;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i1 = 1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i1 = 1;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: reg(0x2711) /* i1 */,
          count: reg(0x2710) /* i0 */,
          rings: 1,
          speed: 4,
          speed2: 0.5,
          angle: reg(0x2755) /* moveAngle */,
          angleStep: 0.20943952,
          transform: 0x202,
        }); // op 97
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
        e.setMisc116(0); // op 116
        e.f0 = e.moveAngle - 2.748893;
        e.f0 = normalizeAngle(e.f0);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 0,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 6.4e2,
          startLength: 6.4e2,
          width: 8,
          startTime: 60,
          duration: 540,
          despawn: 60,
          hitboxStart: 60,
          hitboxEnd: 60,
          flags: 0x0,
        }); // op 114
        e.setMisc116(1); // op 116
        e.f0 = e.moveAngle + 2.748893;
        e.f0 = normalizeAngle(e.f0);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 0,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 6.4e2,
          startLength: 6.4e2,
          width: 8,
          startTime: 60,
          duration: 540,
          despawn: 60,
          hitboxStart: 60,
          hitboxEnd: 60,
          flags: 0x0,
        }); // op 114
        e.setMisc116(2); // op 116
        e.f0 = e.moveAngle - 2.356194;
        e.f0 = normalizeAngle(e.f0);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 0,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 6.4e2,
          startLength: 6.4e2,
          width: 8,
          startTime: 60,
          duration: 540,
          despawn: 60,
          hitboxStart: 60,
          hitboxEnd: 60,
          flags: 0x0,
        }); // op 114
        e.setMisc116(3); // op 116
        e.f0 = e.moveAngle + 2.356194;
        e.f0 = normalizeAngle(e.f0);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 0,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 6.4e2,
          startLength: 6.4e2,
          width: 8,
          startTime: 60,
          duration: 540,
          despawn: 60,
          hitboxStart: 60,
          hitboxEnd: 60,
          flags: 0x0,
        }); // op 114
        pc = 1;
        break;
      }
      case 1: {
        e.setMisc120(0); // op 120
        if (e.ci2 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.moveAngle - 2.748893;
        e.f0 = normalizeAngle(e.f0);
        e.setMisc167(0, e.f0); // op 167
        e.setIntFields(0, 0, 0, 0); // op 119
        e.f0 = e.moveAngle + 2.748893;
        e.f0 = normalizeAngle(e.f0);
        e.setMisc167(1, e.f0); // op 167
        e.setIntFields(1, 0, 0, 0); // op 119
        e.f0 = e.moveAngle - 2.356194;
        e.f0 = normalizeAngle(e.f0);
        e.setMisc167(2, e.f0); // op 167
        e.setIntFields(2, 0, 0, 0); // op 119
        e.f0 = e.moveAngle + 2.356194;
        e.f0 = normalizeAngle(e.f0);
        e.setMisc167(3, e.f0); // op 167
        e.setIntFields(3, 0, 0, 0); // op 119
        yield 1;
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
        e.setSpellTimer(99999, 12); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.setScriptFlags(3);
        e.setBossPresent(0);
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(72); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(4200, 72); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('天呪「アポロ１３」', '八意永琳', 135, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('天呪「アポロ１３」', '八意永琳', 136, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('天呪「アポロ１３」', '八意永琳', 137, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('天呪「アポロ１３」', '八意永琳', 138, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(600); // op 160
        e.autoAnm();
        yield* sub_49(e);
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        pc = 3;
        break;
      }
      case 3: {
        yield* sub_71(e);
        pc = 4;
        break;
      }
      case 4: {
        e.moveBounce(60, 4, 1); // op 67
        yield 320;
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
        e.setAnm(53);
        e.setHitFlash(1);
        e.setMisc145(1); // op 145
        e.setBounds(24, 24);
        e.setMisc160(30); // op 160
        e.callSubAlloc(0, 69); // op 135
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
        e.autoAnm();
        e.f2 = e.randAngle;
        e.ci0 = 32;
        e.ci1 = 64;
        e.ci2 = 30;
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 6;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 11;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 13;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 15;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 0.490874;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 0.245437;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 0.245437;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 0.245437;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f5 = 1.2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f5 = 1.2;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f5 = 1.4;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f5 = 1.5;
        }
        e.setShotRecord(0, 8192, 0, 240, -1, -1, -1); // op 111
        pc = 1;
        break;
      }
      case 1: {
        e.f0 = Math.cos(e.f2);
        e.f0 *= 48;
        e.f1 = Math.sin(e.f2);
        e.f1 *= 48;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 16384, 0, 2, 2, -1, -1); // op 111
        e.setShotRecord(4, 131072, 0, e.ci2, -1, -1, -1); // op 111
        if (e.i0 != 0) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.setShotRecord(5, 64, 0, 1, 1, -2.513274, e.f5); // op 111
        pc = 4;
        break;
      }
      case 3: {
        e.setShotRecord(5, 64, 0, 1, 1, 2.513274, e.f5); // op 111
        pc = 4;
        break;
      }
      case 4: {
        e.f2 += 0.19635;
        e.f2 = normalizeAngle(e.f2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2716) /* i6 */,
          rings: 1,
          speed: 3.5,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x27240 /* RAMP_TURN | HOLD | RESPRITE | WAIT */,
        }); // op 97
        e.ci1 -= 2;
        e.ci2 += 2;
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f2 = e.randAngle;
        e.ci0 = 32;
        e.ci1 = 64;
        e.ci2 = 30;
        e.setShotRecord(0, 8192, 0, 240, -1, -1, -1); // op 111
        pc = 6;
        break;
      }
      case 6: {
        e.f0 = Math.cos(e.f2);
        e.f0 *= 96;
        e.f1 = Math.sin(e.f2);
        e.f1 *= 96;
        e.setShotOrigin(e.f0, e.f1); // op 110
        e.i0 = e.ci0 % 2;
        e.setShotRecord(1, 64, 1, 60, 1, 0, 0); // op 111
        e.setShotRecord(2, 131072, 0, e.ci1, -1, -1, -1); // op 111
        e.setShotRecord(3, 16384, 0, 2, 6, -1, -1); // op 111
        e.setShotRecord(4, 131072, 0, e.ci2, -1, -1, -1); // op 111
        if (e.i0 != 0) {
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.setShotRecord(5, 64, 0, 1, 1, -2.513274, 1.2); // op 111
        pc = 9;
        break;
      }
      case 8: {
        e.setShotRecord(5, 64, 0, 1, 1, 2.513274, 1.2); // op 111
        pc = 9;
        break;
      }
      case 9: {
        e.f2 -= 0.19635;
        e.f2 = normalizeAngle(e.f2);
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: reg(0x2716) /* i6 */,
          rings: 1,
          speed: 3.5,
          speed2: 0.8,
          angle: reg(0x2722) /* f2 */,
          angleStep: reg(0x2726) /* f6 */,
          transform: 0x27240 /* RAMP_TURN | HOLD | RESPRITE | WAIT */,
        }); // op 97
        e.ci1 -= 2;
        e.ci2 += 2;
        if (--e.ci0 > 0) {
          pc = 6;
          break;
        }
        pc = 10;
        break;
      }
      case 10: {
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
        e.setSpellTimer(99999, 12); // op 134
        e.setMisc160(120); // op 160
        e.endSpell();
        e.spawnItemRandom(10); // op 142
        e.spawnItemBatch(5); // op 168
        e.setScriptFlags(3);
        e.setBossPresent(0);
        e.setMisc147(5); // op 147
        e.setMotionClamp(32, 48, 352, 128);
        e.setLives(6000);
        e.eclSetLives(0);
        e.setLifeBarSlice(0, 0, 6000, 16744576);
        yield 80;
        pc = 1;
        break;
      }
      case 1: {
        e.nop(); // op 0
        yield* sub_73(e);
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
        e.setMisc129(3); // op 129
        e.setDeathCallbackSub(12); // op 130
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(7200, 36); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(90, 4, 192, 128); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('秘術「天文密葬法」', '八意永琳', 139, 0, 30000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('秘術「天文密葬法」', '八意永琳', 140, 0, 30000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('秘術「天文密葬法」', '八意永琳', 141, 0, 30000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('秘術「天文密葬法」', '八意永琳', 142, 0, 30000000);
        }
        yield 90;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(600); // op 160
        e.setMisc183(1); // op 183
        e.autoAnm();
        e.callSubAlloc(3, 74); // op 135
        yield 160;
        pc = 2;
        break;
      }
      case 2: {
        yield* sub_49(e);
        pc = 3;
        break;
      }
      case 3: {
        e.ci0 = 12;
        e.moveRelative(240, 0, e.posX, 64); // op 64
        e.i7 = 5;
        e.fparam0 = 0.1309;
        e.fparam1 = 0.261799;
        e.fparam2 = 160;
        yield* sub_75(e);
        pc = 4;
        break;
      }
      case 4: {
        e.ci0 = 10;
        e.i7 = 1;
        e.fparam0 = 0.560999;
        e.fparam1 = 0.224399;
        e.fparam2 = 192;
        yield* sub_75(e);
        pc = 5;
        break;
      }
      case 5: {
        e.ci0 = 8;
        e.i7 = 3;
        e.fparam0 = 0.883573;
        e.fparam1 = 0.19635;
        e.fparam2 = 224;
        yield* sub_75(e);
        pc = 6;
        break;
      }
      case 6: {
        e.ci0 = 8;
        e.i7 = 9;
        e.fparam0 = 1.112647;
        e.fparam1 = 0.1309;
        e.fparam2 = 256;
        yield* sub_75(e);
        pc = 7;
        break;
      }
      case 7: {
        e.ci0 = 6;
        e.i7 = 7;
        e.fparam0 = 1.308997;
        e.fparam1 = 0.10472;
        e.fparam2 = 288;
        yield* sub_75(e);
        pc = 8;
        break;
      }
      case 8: {
        e.ci0 = 3;
        e.i7 = 12;
        e.fparam0 = 1.421197;
        e.fparam1 = 0.1496;
        e.fparam2 = 320;
        yield* sub_75(e);
        pc = 9;
        break;
      }
      case 9: {
        e.i7 = 5;
        e.setTimeout(16);
        yield 120;
        pc = 10;
        break;
      }
      case 10: {
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2.5,
          speed2: 0.6,
          angle: 1.5707964,
          angleStep: 1,
          transform: 0x100202,
        }); // op 97
        yield 300;
        pc = 11;
        break;
      }
      case 11: {
        e.nop(); // op 0
        e.setShotRecord(0, 2048, 0, 0, -1, -999.900024, 0); // op 111
        e.i7 = 1;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.6,
          angle: 0.7853982,
          angleStep: 1,
          transform: 0x100a02 /* BOUNCE_X */,
        }); // op 97
        yield 160;
        pc = 12;
        break;
      }
      case 12: {
        e.i7 = 3;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.6,
          angle: 2.3561945,
          angleStep: 1,
          transform: 0x100a02 /* BOUNCE_X */,
        }); // op 97
        yield 160;
        pc = 13;
        break;
      }
      case 13: {
        e.i7 = 5;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2.5,
          speed2: 0.6,
          angle: 1.5707964,
          angleStep: 1,
          transform: 0x100a02 /* BOUNCE_X */,
        }); // op 97
        pc = 14;
        break;
      }
      case 14: {
        e.moveBounce(60, 4, 1); // op 67
        yield 160;
        pc = 15;
        break;
      }
      case 15: {
        e.i7 = 1;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.6,
          angle: -0.7853982,
          angleStep: 1,
          transform: 0x100a02 /* BOUNCE_X */,
        }); // op 96
        yield 160;
        pc = 16;
        break;
      }
      case 16: {
        e.i7 = 3;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 3,
          speed2: 0.6,
          angle: 0.7853982,
          angleStep: 1,
          transform: 0x100a02 /* BOUNCE_X */,
        }); // op 96
        yield 160;
        pc = 17;
        break;
      }
      case 17: {
        e.i7 = 5;
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 10,
          color: 1,
          count: 1,
          rings: 1,
          speed: 2.5,
          speed2: 0.6,
          angle: 0,
          angleStep: 1,
          transform: 0x100a02 /* BOUNCE_X */,
        }); // op 96
        pc = 14;
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
        e.ci0 = 60;
        e.f0 = 0.19635;
        pc = 1;
        break;
      }
      case 1: {
        if (e.f0 >= 3.010693) {
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.f0 += 0.10472;
        pc = 3;
        break;
      }
      case 3: {
        e.f1 = e.f0 / 5;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 5,
          count: 11,
          rings: 1,
          speed: 5,
          speed2: 0.6,
          angle: -1.5707964,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 97
        yield 4;
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
        e.f2 = e.cxf0;
        e.f3 = 400;
        e.ci1 = e.ci0 * 4;
        e.ci1 += 4;
        e.f5 = 0.05236;
        e.f6 = 192;
        e.f7 = 448;
        pc = 1;
        break;
      }
      case 1: {
        e.f4 = 0 - e.f2;
        e.f0 = Math.cos(e.f4);
        e.f0 *= e.cxf2;
        e.f1 = Math.sin(e.f4);
        e.f1 *= e.cxf2;
        e.f0 += e.f6;
        e.f1 += e.f7;
        e.linkChildRelative(77, 0, 0, 250, -2, 100);
        e.f2 += e.cxf1;
        e.f2 = normalizeAngle(e.f2);
        e.ci1 -= 4;
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

// eslint-disable-next-line require-yield -- the original sub has no instructions
export function* sub_76(e: EnemyCtx): Generator<number, void, void> {
  // Empty forward declaration in the original ECL.
  void e;
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
        e.setAnm(54);
        e.setBounds(24, 24);
        e.clearScriptFlags(16);
        e.setHitFlash(1);
        e.clearScriptFlags(3);
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
        e.ci2 = 0;
        e.cf0 = e.posX;
        e.cf1 = e.posY;
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 2;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 8;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 8;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 10;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i6 = 14;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i6 = 20;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i6 = 20;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i6 = 20;
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
        pc = 2;
        break;
      }
      case 2: {
        if (e.ci2 == 0) {
          yield 1;
          pc = 8;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.f0 = e.ci2;
        e.f0 /= 6;
        e.f4 = e.randF32S * e.f0;
        e.f4 += e.cf0;
        e.f5 = e.randF32S * e.f0;
        e.f5 += e.cf1;
        e.setRelPos(e.f4, e.f5);
        e.ci2--;
        if (e.ci2 >= e.ci3) {
          pc = 5;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.f0 = e.randF32S * 0.5;
        e.f0 += e.f1;
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: reg(0x2717) /* i7 */,
          count: 1,
          rings: 1,
          speed: reg(0x2720) /* f0 */,
          speed2: 0.6,
          angle: reg(0x2762) /* randAngle */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 97
        e.setRelPos(e.cf0, e.cf1);
        pc = 5;
        break;
      }
      case 5: {
        if (e.ci2 != 0) {
          yield 1;
          pc = 8;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        if (e.ci3 >= e.i6) {
          yield 1;
          pc = 8;
          break;
        }
        pc = 7;
        break;
      }
      case 7: {
        e.ci3 += 2;
        e.f1 += 0.05;
        yield 1;
        pc = 8;
        break;
      }
      case 8: {
        pc = 2;
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
        e.setShotRepeat(0);
        e.enemyFunc95(); // op 95
        e.setShotSound(-1, -1); // op 113
        e.clearScriptFlags(4);
        e.setShotOrigin(0, 0); // op 110
        e.setSpellTimer(5940, 13); // op 134
        e.resetSpellTimerSub(); // op 153
        e.setSpellTimerElapsed(0); // op 132
        e.ci3 = 0;
        e.moveRelative(110, 4, 192, 224); // op 64
        if (e.isDiff(EASY | EXTRA)) {
          e.startSpell('禁薬「蓬莱の薬」', '八意永琳', 143, 0, 5000000);
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.startSpell('禁薬「蓬莱の薬」', '八意永琳', 144, 0, 5000000);
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.startSpell('禁薬「蓬莱の薬」', '八意永琳', 145, 0, 5000000);
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.startSpell('禁薬「蓬莱の薬」', '八意永琳', 146, 0, 5000000);
        }
        e.setMisc155(1); // op 155
        yield 110;
        pc = 1;
        break;
      }
      case 1: {
        e.setScriptFlags(4);
        e.setMisc160(120); // op 160
        e.autoAnm();
        yield 30;
        pc = 2;
        break;
      }
      case 2: {
        e.nop(); // op 0
        yield* sub_49(e);
        pc = 3;
        break;
      }
      case 3: {
        e.nop(); // op 0
        e.playSfx(16);
        e.f0 = 1.570796;
        e.f2 = 1.047198;
        e.spawnEnemyAlt(79, 0, 0, 0, 10, -2, 10);
        e.f0 = 1.570796;
        e.f2 = -1.047198;
        e.spawnEnemyAlt(79, 0, 0, 0, 10, -2, 10);
        e.f0 = -1.570796;
        e.f2 = -1.047198;
        e.spawnEnemyAlt(79, 0, 0, 0, 10, -2, 10);
        e.f0 = -1.570796;
        e.f2 = 1.047198;
        e.spawnEnemyAlt(79, 0, 0, 0, 10, -2, 10);
        yield 60;
        pc = 4;
        break;
      }
      case 4: {
        e.nop(); // op 0
        e.callSubAlloc(0, 80); // op 135
        yield 660;
        pc = 5;
        break;
      }
      case 5: {
        e.callSubAlloc(0, 81); // op 135
        e.callSubAlloc(1, 82); // op 135
        e.callSubAlloc(2, 83); // op 135
        e.clearAllBullets();
        e.playSfx(15);
        yield 2000;
        pc = 6;
        break;
      }
      case 6: {
        e.callSubAlloc(0, 84); // op 135
        e.callSubAlloc(1, -1); // op 135
        e.callSubAlloc(2, -1); // op 135
        e.clearAllBullets();
        e.playSfx(15);
        yield 100;
        pc = 7;
        break;
      }
      case 7: {
        pc = 7;
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
        e.setAnm(53);
        e.clearScriptFlags(8);
        e.spawnLaser({
          aimed: false, // op 114 keeps the absolute angle
          type: 1,
          color: 6,
          angle: reg(0x2720) /* f0 */,
          speed: 0,
          tail: 0,
          head: 109,
          startLength: 109,
          width: 16,
          startTime: 10,
          duration: 16,
          despawn: 10,
          hitboxStart: 10,
          hitboxEnd: 10,
          flags: 0x4,
        }); // op 114
        e.cf0 = Math.cos(e.f0);
        e.cf0 *= 109;
        e.cf1 = Math.sin(e.f0);
        e.cf1 *= 109;
        e.cf0 += e.posX;
        e.cf1 += e.posY;
        e.f1 = e.f0;
        e.moveRelative(16, 0, e.cf0, e.cf1); // op 64
        e.setShotRecord(0, 262144, 0, -1, -1, -1, -1); // op 111
        e.ci1 = 8;
        pc = 1;
        break;
      }
      case 1: {
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 3,
          color: 6,
          count: 1,
          rings: 1,
          speed: 0.1,
          speed2: 1,
          angle: reg(0x2762) /* randAngle */,
          angleStep: 0.09817477,
          transform: 0x40204 /* FADE_OUT */,
        }); // op 99
        yield 2;
        pc = 2;
        break;
      }
      case 2: {
        if (--e.ci1 > 0) {
          pc = 1;
          break;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.ci0++;
        e.f0 = e.f1 + e.f2;
        e.spawnEnemyAlt(79, 0, 0, 0, 10, -2, 10);
        return;
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
        e.setShotRecord(1, 16384, 0, 2, 6, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 12;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 12;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 0.01;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 0.013333;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 0.016667;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 0.02;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f6 = 0.008333;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f6 = 0.011667;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f6 = 0.013333;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f6 = 0.016667;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 16, 0, 60, -1, e.f7, -999); // op 111
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 0.1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x4212 /* ACCELERATE | RESPRITE */,
        }); // op 99
        e.f1 = 3.141593 / e.ci3;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        e.setShotRecord(0, 16, 0, 90, -1, e.f6, -999); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 0.1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x4212 /* ACCELERATE | RESPRITE */,
        }); // op 99
        if (e.ci3 >= 32) {
          yield 20;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.ci3++;
        yield 20;
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
        e.ci3 = 8;
        e.f0 = -1.570796;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.232711;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.369599;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.380799;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.392699;
        }
        e.ci0 = 30;
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 18,
          color: 1,
          count: 16,
          rings: 1,
          speed: 5.1,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
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
        e.interpSlot(10016 /* f0 */, 600, 0, 0, -1.570796, -3.141593, 0, 0);
        e.ci0 = 75;
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 18,
          color: 1,
          count: 16,
          rings: 1,
          speed: 5.1,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x200,
        }); // op 97
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
        e.interpSlot(10016 /* f0 */, 600, 0, 0, -3.141593, -4.712389, 0, 0);
        e.ci0 = 75;
        pc = 7;
        break;
      }
      case 7: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 18,
          color: 1,
          count: 16,
          rings: 1,
          speed: 5.1,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x200,
        }); // op 97
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
        e.interpSlot(10016 /* f0 */, 600, 0, 0, -4.712389, -6.283185, 0, 0);
        e.ci0 = 75;
        pc = 10;
        break;
      }
      case 10: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 18,
          color: 1,
          count: 16,
          rings: 1,
          speed: 5.1,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x200,
        }); // op 97
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
        e.ci3 = 8;
        e.f0 = -1.570796;
        e.ci0 = 4;
        if (e.isDiff(EASY | EXTRA)) {
          e.f1 = 0.058178;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f1 = 0.0924;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f1 = 0.0924;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f1 = 0.0924;
        }
        pc = 1;
        break;
      }
      case 1: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: 61,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 97
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
        e.interpSlot(10016 /* f0 */, 600, 0, 0, -1.570796, -3.141593, 0, 0);
        e.ci0 = 10;
        pc = 4;
        break;
      }
      case 4: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: 61,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 97
        yield 60;
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
        e.interpSlot(10016 /* f0 */, 600, 0, 0, -3.141593, -4.712389, 0, 0);
        e.ci0 = 10;
        pc = 7;
        break;
      }
      case 7: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: 61,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 97
        yield 60;
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
        e.interpSlot(10016 /* f0 */, 600, 0, 0, -4.712389, -6.283185, 0, 0);
        e.ci0 = 10;
        pc = 10;
        break;
      }
      case 10: {
        if (e.isDiff(EASY | NORMAL | EXTRA)) {
          e.f7 = e.f0;
        }
        if (e.isDiff(HARD | LUNATIC | EXTRA)) {
          e.f7 = 3.141593 - e.f0;
        }
        e.spawnShot({
          mode: 'fixedFan', // aim 1 of 96..104
          type: 17,
          color: 1,
          count: 61,
          rings: 1,
          speed: 4,
          speed2: 1,
          angle: reg(0x2727) /* f7 */,
          angleStep: reg(0x2721) /* f1 */,
          transform: 0x202,
        }); // op 97
        yield 60;
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
        return;
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
        e.ci3 = 8;
        e.f0 = -1.570796;
        yield 1200;
        pc = 1;
        break;
      }
      case 1: {
        e.ci0 = 30;
        e.playSfx(15);
        pc = 2;
        break;
      }
      case 2: {
        e.spawnShot({
          mode: 'aimedFan', // aim 0 of 96..104
          type: 6,
          color: 6,
          count: 3,
          rings: 4,
          speed: 2,
          speed2: 1,
          angle: 0,
          angleStep: 0.7853982,
          transform: 0x202,
        }); // op 96
        yield 20;
        pc = 3;
        break;
      }
      case 3: {
        pc = 2;
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
        e.setShotRecord(0, 131072, 0, 100, -1, -1, -1); // op 111
        e.setShotRecord(1, 16384, 0, 2, 2, -1, -1); // op 111
        e.ci0 = 12;
        e.ci2 = 60;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 24;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 48;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 52;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 56;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(2, 32, 0, 60, -1, 0.023333, 0); // op 111
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 1,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x24222 /* CURL | RESPRITE | WAIT */,
        }); // op 99
        e.f1 = 3.141593 / e.i7;
        e.f0 += e.f1;
        e.setShotRecord(2, 32, 0, 60, -1, -0.033333, 0); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 1,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x24222 /* CURL | RESPRITE | WAIT */,
        }); // op 99
        yield e.delay(e.ci2);
        e.ci2 -= 2;
        if (--e.ci0 > 0) {
          pc = 1;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.ci0 = 10;
        e.setShotRecord(1, 16384, 0, 2, 10, -1, -1); // op 111
        e.ci2 = 80;
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 23;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 47;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 49;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 51;
        }
        pc = 3;
        break;
      }
      case 3: {
        e.setShotRecord(2, 32, 0, 60, -1, 0.003333, 0.01309); // op 111
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 9,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x24222 /* CURL | RESPRITE | WAIT */,
        }); // op 99
        e.f1 = 3.141593 / e.i7;
        e.f0 += e.f1;
        e.setShotRecord(2, 32, 0, 60, -1, 0.003333, -0.01309); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 9,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: 1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x24222 /* CURL | RESPRITE | WAIT */,
        }); // op 99
        yield e.delay(e.ci2);
        e.ci2 -= 6;
        if (--e.ci0 > 0) {
          pc = 3;
          break;
        }
        pc = 4;
        break;
      }
      case 4: {
        e.ci0 = 10;
        e.setMisc136(18, 2); // op 136
        e.callSubAlloc(1, 85); // op 135
        if (e.isDiff(EASY | EXTRA)) {
          e.ci2 = 120;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci2 = 120;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci2 = 120;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci2 = 100;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 70;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 104;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 104;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 104;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.f7 = 1;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.f7 = 1.4;
        }
        pc = 5;
        break;
      }
      case 5: {
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2717) /* i7 */,
          rings: 1,
          speed: reg(0x2727) /* f7 */,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x202,
        }); // op 99
        yield e.delay(e.ci2);
        if (e.ci2 <= 15) {
          pc = 7;
          break;
        }
        pc = 6;
        break;
      }
      case 6: {
        e.ci2 -= 5;
        pc = 7;
        break;
      }
      case 7: {
        pc = 5;
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
        e.setShotRecord(1, 16384, 0, 2, 6, -1, -1); // op 111
        if (e.isDiff(EASY | EXTRA)) {
          e.ci3 = 1;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.ci3 = 6;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.ci3 = 6;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.ci3 = 6;
        }
        if (e.isDiff(EASY | EXTRA)) {
          e.i7 = 20;
        }
        if (e.isDiff(NORMAL | EXTRA)) {
          e.i7 = 28;
        }
        if (e.isDiff(HARD | EXTRA)) {
          e.i7 = 30;
        }
        if (e.isDiff(LUNATIC | EXTRA)) {
          e.i7 = 30;
        }
        pc = 1;
        break;
      }
      case 1: {
        e.setShotRecord(0, 16, 0, 60, -1, 0.026667, -999); // op 111
        e.f0 = e.randAngle;
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 0.1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x4212 /* ACCELERATE | RESPRITE */,
        }); // op 99
        e.f1 = 3.141593 / e.ci3;
        e.f0 += e.f1;
        e.f0 = normalizeAngle(e.f0);
        e.setShotRecord(0, 16, 0, 90, -1, 0.028333, -999); // op 111
        e.spawnShot({
          mode: 'evenRing', // aim 3 of 96..104
          type: 17,
          color: 5,
          count: reg(0x2737) /* ci3 */,
          rings: 1,
          speed: 0.1,
          speed2: 1,
          angle: reg(0x2720) /* f0 */,
          angleStep: 0.09817477,
          transform: 0x4212 /* ACCELERATE | RESPRITE */,
        }); // op 99
        if (e.ci3 >= e.i7) {
          yield 20;
          pc = 3;
          break;
        }
        pc = 2;
        break;
      }
      case 2: {
        e.ci3++;
        yield 20;
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
        e.ci0 -= 25;
        e.playSfx(42);
        e.setTimeout(13);
        pc = 1;
        break;
      }
      case 1: {
        e.spawnEnemy(87, 1176352768, 1176353792, 0, 10, -2, 10);
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
        e.clearScriptFlags(3);
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
