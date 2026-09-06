export interface Vector2 {
  x: number;
  y: number;
}

export function createVector2(x = 0, y = 0): Vector2 {
  return { x, y };
}

export function addVectors(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scaleVector(v: Vector2, s: number): Vector2 {
  return { x: v.x * s, y: v.y * s };
}

export function distanceBetween(a: Vector2, b: Vector2): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

export function angleBetween(from: Vector2, to: Vector2): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}
