/**
 * ECL operand-selector tables: the register id an operand carries, mapped to
 * the field it names.
 *
 * These are shared by both halves of the port. The runtime needs them because
 * `ResolveInt` / `ResolveFloat` redirect an operand only when its id is in the
 * table and otherwise hand back the operand itself; the translator needs them
 * because that is the same question asked at translate time, and answering it
 * differently is how a decoded script would start disagreeing with the retail
 * one. They live here rather than in `sim/EnemySlot` so that `format/` can read
 * them without importing the layer that imports it.
 */

/**
 * ECL int register id -> field name.
 *
 * This is the operand selector of retail's `ResolveInt`
 * (`EclOperandsInt.cpp:40-165`): ids 0x2710..0x2774 name a register and every
 * other value is the caller's own literal. `spawnShot` reads it too, because
 * shot operands are resolved at fire time, where the registers live.
 */

export const INT_FIELD_BY_ID: Record<number, string> = {
  0x2710: 'i0',
  0x2711: 'i1',
  0x2712: 'i2',
  0x2713: 'i3',
  0x2714: 'i4',
  0x2715: 'i5',
  0x2716: 'i6',
  0x2717: 'i7',
  0x2718: 'ei0',
  0x2719: 'ei1',
  0x271a: 'ei2',
  0x271b: 'ei3',
  0x271c: 'ei4',
  0x271d: 'ei5',
  0x271e: 'ei6',
  0x271f: 'ei7',
  0x2720: 'f0',
  0x2721: 'f1',
  0x2722: 'f2',
  0x2723: 'f3',
  0x2724: 'f4',
  0x2725: 'f5',
  0x2726: 'f6',
  0x2727: 'f7',
  0x2728: 'ef0',
  0x2729: 'ef1',
  0x272a: 'ef2',
  0x272b: 'ef3',
  0x272c: 'ef4',
  0x272d: 'ef5',
  0x272e: 'ef6',
  0x272f: 'ef7',
  0x2734: 'ci0',
  0x2735: 'ci1',
  0x2736: 'ci2',
  0x2737: 'ci3',
  0x2745: 'cxi0',
  0x2746: 'cxi1',
  0x2747: 'cxi2',
  0x2748: 'cxi3',
  0x2749: 'cxf0',
  0x274a: 'cxf1',
  0x274b: 'cxf2',
  0x274c: 'cxf3',
  0x2730: 'randIntMasked',
  0x2731: 'randF32i',
  0x2732: 'randInt',
  0x2733: 'randF32Si',
  0x2738: 'difficulty',
  0x2739: 'rank',
  0x2744: 'shotType',
  0x273a: 'posX',
  0x273b: 'posY',
  0x273c: 'posZ',
  0x273d: 'playerX',
  0x273e: 'playerY',
  0x273f: 'playerZ',
  0x2741: 'hp',
  0x2743: 'maxHp',
  0x2740: 'angleToPlayer',
  0x2742: 'distToPlayer',
  0x274d: 'param0',
  0x274e: 'param1',
  0x274f: 'param2',
  0x2750: 'param3',
  0x2751: 'fparam0',
  0x2752: 'fparam1',
  0x2753: 'fparam2',
  0x2754: 'fparam3',
  0x2755: 'moveAngle',
  0x2756: 'headingVel',
  0x2757: 'moveSpeed',
  0x2758: 'speedAccel',
  0x2759: 'orbitRadius',
  0x275a: 'originX',
  0x275b: 'originY',
  0x275c: 'originZ',
  0x275d: 'orbitAngle',
  0x275e: 'orbitAngleVel',
  0x2770: 'parentChainCount',
  0x2771: 'playerIsYoukai',
  0x2772: 'timeOrbReady',
  0x2773: 'spellCardState',
  0x2774: 'spellCardTimer',
  // `EclOperandsInt.cpp:136-137`: the two spawn parameters ops 90..92 hand down
  // stay readable from the child's own script.
  0x276c: 'dropType',
  0x276d: 'scoreValue',
  // `EclOperandsInt.cpp:120-135`: the observed velocity triple, the four
  // op 133 life-bar thresholds, the last damage taken, and the boss seat.
  0x2763: 'lastDamage',
  0x2764: 'bossMarker',
  0x2765: 'velocityX',
  0x2766: 'velocityY',
  0x2767: 'velocityZ',
  0x2768: 'phase0',
  0x2769: 'phase1',
  0x276a: 'phase2',
  0x276b: 'phase3',
};

/**
 * ECL float register id -> field name. `ResolveFloat`
 * (`EclOperandsFloat.cpp:46`) switches on the operand truncated to an int, so a
 * register reference arrives as the value `10016.0` and friends. Id 0x2772 is
 * deliberately absent: retail lets it fall through to the raw operand.
 */
export const FLOAT_FIELD_BY_ID: Record<number, string> = {
  0x2710: 'i0',
  0x2711: 'i1',
  0x2712: 'i2',
  0x2713: 'i3',
  0x2714: 'i4',
  0x2715: 'i5',
  0x2716: 'i6',
  0x2717: 'i7',
  0x2718: 'ei0',
  0x2719: 'ei1',
  0x271a: 'ei2',
  0x271b: 'ei3',
  0x271c: 'ei4',
  0x271d: 'ei5',
  0x271e: 'ei6',
  0x271f: 'ei7',
  0x2720: 'f0',
  0x2721: 'f1',
  0x2722: 'f2',
  0x2723: 'f3',
  0x2724: 'f4',
  0x2725: 'f5',
  0x2726: 'f6',
  0x2727: 'f7',
  0x2728: 'ef0',
  0x2729: 'ef1',
  0x272a: 'ef2',
  0x272b: 'ef3',
  0x272c: 'ef4',
  0x272d: 'ef5',
  0x272e: 'ef6',
  0x272f: 'ef7',
  0x2749: 'cxf0',
  0x274a: 'cxf1',
  0x274b: 'cxf2',
  0x274c: 'cxf3',
  0x2734: 'ci0',
  0x2735: 'ci1',
  0x2736: 'ci2',
  0x2737: 'ci3',
  0x2745: 'cxi0',
  0x2746: 'cxi1',
  0x2747: 'cxi2',
  0x2748: 'cxi3',
  0x2730: 'randIntMasked',
  0x2731: 'randF32',
  0x2732: 'randInt',
  0x2733: 'randF32S',
  0x2762: 'randAngle',
  0x2738: 'difficulty',
  0x2739: 'rank',
  0x2744: 'shotType',
  0x273a: 'posX',
  0x273b: 'posY',
  0x273c: 'posZ',
  0x273d: 'playerX',
  0x273e: 'playerY',
  0x273f: 'playerZ',
  0x2740: 'angleToPlayer',
  0x2741: 'hpF',
  0x2742: 'distToPlayer',
  0x2743: 'maxHpF',
  0x274d: 'param0',
  0x274e: 'param1',
  0x274f: 'param2',
  0x2750: 'param3',
  0x2751: 'fparam0',
  0x2752: 'fparam1',
  0x2753: 'fparam2',
  0x2754: 'fparam3',
  0x2755: 'moveAngle',
  0x2756: 'headingVel',
  0x2757: 'moveSpeed',
  0x2758: 'speedAccel',
  0x2759: 'orbitRadius',
  0x275a: 'originX',
  0x275b: 'originY',
  0x275c: 'originZ',
  0x275d: 'orbitAngle',
  0x275e: 'orbitAngleVel',
  0x275f: 'tweenDX',
  0x2760: 'tweenDY',
  0x2770: 'parentChainCount',
  0x2771: 'playerIsYoukai',
  0x2773: 'spellCardState',
  // `EclOperandsFloat.cpp:85-86` exposes the same two fields as floats.
  0x276c: 'dropType',
  0x276d: 'scoreValue',
  // `EclOperandsFloat.cpp:129-136`: the Z of the tween-displacement vector,
  // the last-frame displacement the integrator left behind, and the life-bar
  // thresholds. All four velocity ids are read-only: retail has no case for
  // them in `ResolveFloatLValue`, so a script cannot steer through them.
  0x2761: 'tweenDZ',
  0x2763: 'lastDamage',
  0x2764: 'bossMarker',
  0x2765: 'velocityX',
  0x2766: 'velocityY',
  0x2767: 'velocityZ',
  0x2768: 'phase0',
  0x2769: 'phase1',
  0x276a: 'phase2',
  0x276b: 'phase3',
  // `EclOperandsFloat.cpp:122-123`: the second context float pair, +0x68.
  0x276e: 'cf0',
  0x276f: 'cf1',
};

/**
 * The ids `ResolveFloatLValue` (`EclOperandsFloat.cpp:175-231`) has a case for.
 * Everything else falls through to `default: return operand`, which writes the
 * instruction own operand bytes and changes nothing, so an interpolator aimed at
 * an int register or a sensor is a no-op rather than a corruption. The three
 * player registers are absent: retail lets a script drag the ship, and nothing in
 * the shipped stages does.
 */
export const WRITABLE_FLOAT_FIELD_BY_ID: Record<number, string> = {
  0x2720: 'f0',
  0x2721: 'f1',
  0x2722: 'f2',
  0x2723: 'f3',
  0x2724: 'f4',
  0x2725: 'f5',
  0x2726: 'f6',
  0x2727: 'f7',
  0x2728: 'ef0',
  0x2729: 'ef1',
  0x272a: 'ef2',
  0x272b: 'ef3',
  0x272c: 'ef4',
  0x272d: 'ef5',
  0x272e: 'ef6',
  0x272f: 'ef7',
  0x2749: 'cxf0',
  0x274a: 'cxf1',
  0x274b: 'cxf2',
  0x274c: 'cxf3',
  0x273a: 'posX',
  0x273b: 'posY',
  0x273c: 'posZ',
  0x2751: 'fparam0',
  0x2752: 'fparam1',
  0x2753: 'fparam2',
  0x2754: 'fparam3',
  0x2755: 'moveAngle',
  0x2756: 'headingVel',
  0x2757: 'moveSpeed',
  0x2758: 'speedAccel',
  0x2759: 'orbitRadius',
  0x275a: 'originX',
  0x275b: 'originY',
  0x275c: 'originZ',
  0x275d: 'orbitAngle',
  0x275e: 'orbitAngleVel',
  0x275f: 'tweenDX',
  0x2760: 'tweenDY',
  0x2761: 'tweenDZ',
  0x276e: 'cf0',
  0x276f: 'cf1',
};

/**
 * `g_EclGameTimeScale`, the factor the interpreter multiplies scripted motion by
 * when it steps and integrates an enemy (`EnemyManagerUpdate.cpp:486-490`).
 *
 * Retail keeps it at 1 for a normal run and drops it for a slow-motion effect;
 * the port has no such effect, so every motion step runs at full scale. It lives
 * beside the register tables because both are the interpreter's own vocabulary.
 */
export const ECL_GAME_TIME_SCALE = 1;
