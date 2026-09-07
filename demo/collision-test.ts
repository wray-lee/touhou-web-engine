import { Entity } from '../src/engine/core/Entity';
import { CollisionSystem } from '../src/engine/core/CollisionSystem';

const BULLET_COUNT = 1000;
const CELL_SIZE = 64;
const GRAZE_RADIUS = 16;

const canvas = document.getElementById('view') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const hud = document.getElementById('hud')!;

let W = 0;
let H = 0;
function resize(): void {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// ---- entities: 1 player (center) + 1000 orbiting enemy bullets ----
const center = () => ({ x: W / 2, y: H / 2 });
const player = new Entity(center(), {}, { radius: 2 }, 'player');

interface Orbit {
  angle: number;
  radius: number;
  angularSpeed: number; // rad/s
  /** Radial pulsation: r = radius * (1 - |sin(angle * freq)|), so bullets sweep the center. */
  freq: number;
}
const orbits = new Map<Entity, Orbit>();
const bullets: Entity[] = [];
for (let i = 0; i < BULLET_COUNT; i++) {
  const b = new Entity({ x: 0, y: 0 }, {}, { radius: 4 }, 'enemy-bullet');
  orbits.set(b, {
    angle: Math.random() * Math.PI * 2,
    radius: 80 + Math.random() * (Math.min(W, H) / 2 - 100),
    angularSpeed: (0.2 + Math.random() * 1.2) * (Math.random() < 0.5 ? -1 : 1),
    freq: 1 + Math.floor(Math.random() * 3),
  });
  bullets.push(b);
}
const entities = [player, ...bullets];
const system = new CollisionSystem(CELL_SIZE);

/** Naive all-pairs distance checks per frame: (N+1) choose 2. */
const NAIVE_CHECKS = ((BULLET_COUNT + 1) * BULLET_COUNT) / 2;

// ---- debug overlay toggle: 'D' ----
let debug = false;
window.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') debug = !debug;
});

function step(dt: number): { hits: number; grazes: number } {
  const c = center();
  player.position.x = c.x;
  player.position.y = c.y;
  for (const b of bullets) {
    const o = orbits.get(b)!;
    o.angle += o.angularSpeed * dt;
    const r = o.radius * (1 - Math.abs(Math.sin(o.angle * o.freq)));
    b.position.x = c.x + Math.cos(o.angle) * r;
    b.position.y = c.y + Math.sin(o.angle) * r;
  }
  system.update(entities);
  const hits = system.checkCollisions(player, 'enemy-bullet');
  const grazes = system.queryNearby(player, GRAZE_RADIUS, 'enemy-bullet');
  return { hits: hits.length, grazes: grazes.length };
}

function countCells(): number {
  let n = 0;
  system.forEachCell(() => n++);
  return n;
}

function draw(): void {
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, W, H);

  if (debug) {
    // grid boxes straight from the live spatial hash cells
    ctx.strokeStyle = 'rgba(80,120,255,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    system.forEachCell((key) => {
      const [cx, cy] = key.split(',').map(Number);
      ctx.rect(cx * CELL_SIZE + 0.5, cy * CELL_SIZE + 0.5, CELL_SIZE, CELL_SIZE);
    });
    ctx.stroke();
  }

  ctx.fillStyle = '#ff5fa2';
  for (const b of bullets) {
    const c = b.getHitboxCenter();
    ctx.beginPath();
    ctx.arc(c.x, c.y, debug ? b.hitbox.radius : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const pc = player.getHitboxCenter();
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(pc.x, pc.y, GRAZE_RADIUS, 0, Math.PI * 2); // graze radius
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(pc.x, pc.y, debug ? player.hitbox.radius : 3, 0, Math.PI * 2);
  ctx.fill();
}

let last = performance.now();
let lastFpsAt = last;
let frames = 0;
let fps = 0;
let stats = { hits: 0, grazes: 0 };

function loop(now: number): void {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  stats = step(dt);
  draw();

  frames++;
  if (now - lastFpsAt >= 500) {
    fps = (frames * 1000) / (now - lastFpsAt);
    frames = 0;
    lastFpsAt = now;
  }
  hud.textContent =
    `FPS: ${fps.toFixed(1)}\n` +
    `bullets: ${BULLET_COUNT}  occupied cells: ${countCells()}\n` +
    `collision checks/frame (spatial hash): ${system.totalChecks}\n` +
    `naive n² checks/frame: ${NAIVE_CHECKS}  (${(NAIVE_CHECKS / Math.max(system.totalChecks, 1)).toFixed(0)}x more)\n` +
    `hits: ${stats.hits}  grazes: ${stats.grazes}\n` +
    `[D] debug overlay: ${debug ? 'ON' : 'OFF'}`;
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
