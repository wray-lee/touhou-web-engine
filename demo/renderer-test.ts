import { Application, Graphics, Text } from 'pixi.js';

const COUNT = 100;
const app = new Application();
await app.init({ resizeTo: window, background: 0x101018, antialias: true });
document.body.appendChild(app.canvas);

// 100 个随机彩色圆圈，随机速度，边界反弹
const circles: { g: Graphics; radius: number; vx: number; vy: number }[] = [];
for (let i = 0; i < COUNT; i++) {
  const radius = 6 + Math.random() * 14;
  const g = new Graphics();
  g.circle(0, 0, radius).fill(Math.random() * 0xffffff);
  g.x = radius + Math.random() * (app.screen.width - radius * 2);
  g.y = radius + Math.random() * (app.screen.height - radius * 2);
  const speed = 120 + Math.random() * 280; // px/s
  const angle = Math.random() * Math.PI * 2;
  circles.push({
    g,
    radius,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  });
  app.stage.addChild(g);
}

// 左上角 FPS 文本
const fpsText = new Text({
  text: 'FPS: --',
  style: { fontFamily: 'monospace', fontSize: 20, fill: 0x00ff88 },
});
fpsText.x = 8;
fpsText.y = 8;
app.stage.addChild(fpsText);

let frames = 0;
let lastFpsAt = performance.now();

app.ticker.add((ticker) => {
  const dt = ticker.deltaMS / 1000;
  const w = app.screen.width;
  const h = app.screen.height;
  for (const c of circles) {
    c.g.x += c.vx * dt;
    c.g.y += c.vy * dt;
    if (c.g.x < c.radius) {
      c.g.x = c.radius;
      c.vx = -c.vx;
    } else if (c.g.x > w - c.radius) {
      c.g.x = w - c.radius;
      c.vx = -c.vx;
    }
    if (c.g.y < c.radius) {
      c.g.y = c.radius;
      c.vy = -c.vy;
    } else if (c.g.y > h - c.radius) {
      c.g.y = h - c.radius;
      c.vy = -c.vy;
    }
  }
  frames++;
  const now = performance.now();
  if (now - lastFpsAt >= 500) {
    fpsText.text = `FPS: ${((frames * 1000) / (now - lastFpsAt)).toFixed(1)}`;
    frames = 0;
    lastFpsAt = now;
  }
});
