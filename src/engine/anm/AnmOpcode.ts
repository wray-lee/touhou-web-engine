/**
 * The Windows-era animation VM's instruction set.
 *
 * Every moving picture in these games -- enemy, bullet, background layer, HUD
 * panel -- is one `AnmVm` running a script out of an `.anm` pack. The numbers
 * below are the ones ZUN compiled against, taken from `AnmManager.hpp`, so a
 * script lifted straight out of the original data can run without a translation
 * layer in between.
 */

export const ANM_OPCODE = {
  END_OF_SCRIPT: -1,
  NOP: 0,
  DELETE: 1,
  STATIC: 2,
  SPRITE: 3,
  JMP: 4,
  JMP_DEC: 5,
  POS: 6,
  SCALE: 7,
  ALPHA: 8,
  COLOR: 9,
  FLIP_X: 10,
  FLIP_Y: 11,
  ROTATE: 12,
  ANGULAR_VELOCITY: 13,
  SCALE_GROWTH: 14,
  ALPHA_TIME_LINEAR: 15,
  ADDITIVE_BLEND_MODE: 16,
  POS_TIME_LINEAR: 17,
  POS_TIME_DECEL: 18,
  POS_TIME_DECEL2: 19,
  STOP: 20,
  INTERRUPT_LABEL: 21,
  ANCHOR_TOP_LEFT: 22,
  STOP_HIDE: 23,
  POS_MODE: 24,
  INS25: 25,
  ADD_U: 26,
  ADD_V: 27,
  VISIBLE: 28,
  SCALE_TIME_LINEAR: 29,
  Z_WRITE_DISABLE: 30,
  INS31: 31,
  POS_TIME: 32,
  COLOR_TIME: 33,
  ALPHA_TIME: 34,
  ROTATE_TIME: 35,
  SCALE_TIME: 36,
  I_SET: 37,
  F_SET: 38,
  I_ADD: 39,
  F_ADD: 40,
  I_SUB: 41,
  F_SUB: 42,
  I_MUL: 43,
  F_MUL: 44,
  I_DIV: 45,
  F_DIV: 46,
  I_MOD: 47,
  F_MOD: 48,
  I_SET_ADD: 49,
  F_SET_ADD: 50,
  I_SET_SUB: 51,
  F_SET_SUB: 52,
  I_SET_MUL: 53,
  F_SET_MUL: 54,
  I_SET_DIV: 55,
  F_SET_DIV: 56,
  I_SET_MOD: 57,
  F_SET_MOD: 58,
  I_SET_RAND: 59,
  F_SET_RAND: 60,
  F_SIN: 61,
  F_COS: 62,
  F_TAN: 63,
  F_ACOS: 64,
  F_ATAN: 65,
  NORMALIZE_ANGLE: 66,
  I_JMP_EQ: 67,
  F_JMP_EQ: 68,
  I_JMP_NEQ: 69,
  F_JMP_NEQ: 70,
  I_JMP_LESS: 71,
  F_JMP_LESS: 72,
  I_JMP_LESS_OR_EQ: 73,
  F_JMP_LESS_OR_EQ: 74,
  I_JMP_GREATER: 75,
  F_JMP_GREATER: 76,
  I_JMP_GREATER_OR_EQ: 77,
  F_JMP_GREATER_OR_EQ: 78,
  WAIT: 79,
  U_SCROLL: 80,
  V_SCROLL: 81,
  BLEND_MODE: 82,
  INS83: 83,
  COLOR2: 84,
  ALPHA2: 85,
  COLOR2_TIME: 86,
  ALPHA2_TIME: 87,
  INS88: 88,
  RETURN_FROM_INTERRUPT: 89,
} as const;

/** Which of the seven interpolated channels an `interp` timer belongs to. */
export const ANM_INTERP = {
  POS: 0,
  RGB1: 1,
  ALPHA1: 2,
  ROTATE: 3,
  SCALE: 4,
  RGB2: 5,
  ALPHA2: 6,
  LAST: 7,
} as const;

/** Easing curves the `*Time` instructions pick from (`AnmInterpMode`). */
export const ANM_INTERP_MODE = {
  LINEAR: 0,
  EASE_IN: 1,
  EASE_IN_CUBIC: 2,
  EASE_IN_QUARTIC: 3,
  EASE_OUT: 4,
  EASE_OUT_CUBIC: 5,
  EASE_OUT_QUARTIC: 6,
} as const;

/**
 * The ten named registers a script can address instead of a literal.
 *
 * An instruction's `varMask` bit says which of its arguments is a register
 * reference, so `I0..I3`, `F0..F3` and the two counters are the whole working
 * set. The ids are the values that appear inside the bytecode.
 */
export const ANM_VARIABLE = {
  I0: 10000,
  I1: 10001,
  I2: 10002,
  I3: 10003,
  F0: 10004,
  F1: 10005,
  F2: 10006,
  F3: 10007,
  IC0: 10008,
  IC1: 10009,
} as const;

export const ANM_MAX_ARGS = 6;

/** Bytes of an instruction header: opcode, size, time, varMask. */
export const ANM_HEADER_BYTES = 8;
