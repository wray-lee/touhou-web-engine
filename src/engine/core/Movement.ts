/**
 * Eight-way movement resolution: the shared input primitive behind a Touhou ship.
 *
 * A bullet-hell ship does not move along a normalised vector. It moves along one
 * of nine states -- idle, four cardinals, four diagonals -- chosen by a fixed
 * priority over the *held keys*, and each state carries its own per-axis speed.
 * The reference for this file is 東方永夜抄's `Player.cpp:646-668` (the index) and
 * `:793-817` (the speeds), but nothing below is specific to that game, which is
 * why it lives in the engine and not in a stage.
 *
 * Two consequences are worth stating out loud, because both are invisible until a
 * replay disagrees with a recording:
 *
 *  - pressing two opposite keys is not stillness. Down beats up and left beats
 *    right, so `up+down` walks down and `left+right+up` walks up-left;
 *  - a diagonal is not faster. The shipped speed tables store the diagonal figure
 *    already divided by sqrt 2, so the *magnitude* matches a straight line and only
 *    the per-axis component differs.
 */

/** The four direction bits, matching `Global.hpp:97-126`. */
export const MOVE_BITS = { up: 1 << 4, down: 1 << 5, left: 1 << 6, right: 1 << 7 } as const;

/** The nine movement states produced by {@link movementDirectionIndex}. */
export const MOVE_DIRECTION = {
  idle: 0,
  up: 1,
  down: 2,
  left: 3,
  right: 4,
  upLeft: 5,
  upRight: 6,
  downLeft: 7,
  downRight: 8,
} as const;

/**
 * Resolve held direction bits into one of the nine movement states.
 *
 * The four diagonals are tested first, as exact bit pairs, and then the single
 * axes in down, up, left, right order. That order is the behaviour: it is what
 * makes a replay of a recorded input stream put the ship where it stood in the
 * original, rather than somewhere near it.
 */
export function movementDirectionIndex(bits: number): number {
  const { up, down, left, right } = MOVE_BITS;
  if ((bits & (up | left)) === (up | left)) return MOVE_DIRECTION.upLeft;
  if ((bits & (down | left)) === (down | left)) return MOVE_DIRECTION.downLeft;
  if ((bits & (up | right)) === (up | right)) return MOVE_DIRECTION.upRight;
  if ((bits & (down | right)) === (down | right)) return MOVE_DIRECTION.downRight;
  if (bits & down) return MOVE_DIRECTION.down;
  if (bits & up) return MOVE_DIRECTION.up;
  if (bits & left) return MOVE_DIRECTION.left;
  if (bits & right) return MOVE_DIRECTION.right;
  return MOVE_DIRECTION.idle;
}

/**
 * The per-axis velocity for one movement state.
 *
 * `axis` applies to the four cardinals and `diagonal` to the four corners, which
 * is how the original stores them: two independent numbers per stance, read
 * straight out of the ship's data file.
 */
export function movementAxisSpeeds(index: number, axis: number, diagonal: number): [number, number] {
  switch (index) {
    case MOVE_DIRECTION.up:
      return [0, -axis];
    case MOVE_DIRECTION.down:
      return [0, axis];
    case MOVE_DIRECTION.left:
      return [-axis, 0];
    case MOVE_DIRECTION.right:
      return [axis, 0];
    case MOVE_DIRECTION.upLeft:
      return [-diagonal, -diagonal];
    case MOVE_DIRECTION.upRight:
      return [diagonal, -diagonal];
    case MOVE_DIRECTION.downLeft:
      return [-diagonal, diagonal];
    case MOVE_DIRECTION.downRight:
      return [diagonal, diagonal];
    default:
      return [0, 0];
  }
}
