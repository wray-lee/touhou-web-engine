/**
 * Normalize an angle to [-PI, PI], matching ZUN's `AddNormalizeAngle`.
 *
 * The reduction is arithmetic rather than a subtract loop: an ANM script can hand this a
 * rotation built from a garbage register, and a loop that steps by 2*PI would then spend
 * a billion iterations on one frame -- which is exactly how the effect scripts wedged the
 * browser. A non-finite angle is not an angle at all, so it draws nothing and gets 0.
 */
export function normalizeAngle(a: number): number {
  if (!Number.isFinite(a)) return 0;
  let r = a % (Math.PI * 2);
  if (r > Math.PI) r -= Math.PI * 2;
  else if (r < -Math.PI) r += Math.PI * 2;
  return r;
}
