# @uestc-touhou/touhou-web-engine

> A high-performance, extensible STG (danmaku) game engine designed to recreate Touhou Project in the browser.

[![CI](https://github.com/wray-lee/touhou-web-engine/actions/workflows/ci.yml/badge.svg)](https://github.com/wray-lee/touhou-web-engine/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PixiJS](https://img.shields.io/badge/PixiJS-8.6-ff1361.svg)](https://pixijs.com/)

---

## 🌟 Highlights

- **Pure Web & Lightweight**: Built on TypeScript & PixiJS 8.x with WebGL hardware acceleration — 60 FPS guaranteed even with 2000+ bullets on screen.
- **Three-Tier Architecture**:
  1. **Engine Core** (`@core`): Pure game-agnostic STG engine (Entities, Spatial Hash Grid Collision, Timeline, Web Audio).
  2. **Touhou Common** (`@touhou`): Reusable abstractions for the Touhou series (Bullet Patterns, Player Controller, Boss/SpellCard mechanics, HUD).
  3. **Game Implementations** (`@/games/th08`): Game-specific stages, bosses, and spellcard scripts.
- **Battle-Tested Patterns**: Composite, Circular, Linear, Aiming bullet patterns with high-precision angle & angular velocity calculation.
- **Zero Heavy Audio Assets Required**: Built-in Web Audio API synthesis engine for retro arcade SE (shooting, graze, bombing, spellcards) **and BGM** (synthesized stage theme) — no asset files needed.
- **Object Pooled Bullets**: All bullet creation (player shots, enemy patterns, boss spellcards) routes through a shared object pool to minimize GC pressure.
- **Spatial Hash Collision**: Every collision (player bullets vs enemies/boss, player graze) resolves via 64px spatial hash neighbourhood queries — O(n²) loops eliminated.
- **Mobile Ready**: Touch-drag flies the ship and auto-fires; ESC pauses with a dedicated pause menu.
- **Gamepad + Rebindable Keys**: Standard-layout gamepads are polled automatically (D-pad/stick = move, A = shoot, B/X = bomb, LB/LT = focus, Start = pause); every binding can be remapped at runtime.

---

## 🕹️ Demo Pages

`bun run dev` 启动 Vite（默认 `http://localhost:3000`）后可访问：

| 路径 | 内容 |
|---|---|
| `/` | **主 Demo** —— TH08 Stage 1 完整可玩（露米娅三面 + 音频控制按钮） |
| `/demo/input-test.html` | 输入映射可视化：8 个绑定芯片实时高亮 + 原始 `KeyboardEvent.code` + 拖动指针坐标 + 手柄状态（票据 05） |
| `/demo/renderer-test.html` | 渲染基准：100 个弹跳彩色圆圈 + 左上角 FPS 计数（票据 03） |
| `/demo/collision-test.html` | 碰撞基准：1000 弹 + 自机，`D` 键切换空间哈希网格/判定点调试浮层（票据 04） |
| `/example/index.html` | **库用法示例**：把引擎当 npm 包嵌入的最小装配（`new TH08Game()` → `init` → `start`，票据 15） |

---

## 🖼️ Screenshots

> **TODO** — 本项目的 CI/开发环境为无头（headless）环境，暂时无法自动截取游戏画面。
> 后续将在下列占位处补充：
>
> - `image/screenshot-stage1.png` — Stage 1 实机画面（露米娅符卡）
> - `image/screenshot-perf-monitor.png` — F12 性能监控面板
> - `image/screenshot-collision-debug.png` — 空间哈希碰撞调试浮层
>
> 本地补图：`bun run dev` 打开 `http://localhost:3000/`，按 `F12` 显示性能浮层后截图即可。

---

## 🎮 Playable Demo (TH08 Stage 1: Rumia)

The engine comes with a complete implementation of **東方永夜抄 ~ Imperishable Night** Stage 1:
- Fairy waves with V-formation and cross-fire patterns
- Mid-boss encounter
- Full Boss Rumia (露米娅) with 3 phases:
  - Phase 1: Non-spell 16-way spinning rings
  - Phase 2: Night Sign「Night Bird」 (夜符「Night Bird」)
  - Phase 3: Darkness Sign「Demarcation」 (闇符「Demarcation」)
- Player controls (Reimu Hakurei):
  - Normal mode (4.5 px/f) with homing needle spread
  - Focused / Slow mode (2.0 px/f with visible hitbox)
  - Spirit Strike Bomb (X) with 5-second invulnerability & screen clear
  - Real-time Graze counter, SpellCard countdown, and Score tracking
  - F12 Performance & Collision monitor (real distance-comparison count)
  - ESC pause menu (freezes gameplay + BGM)
  - SpellCard banner with centered pop-in animation

### Controls

| Action | Primary Key | Alternate Key | Touch | Gamepad |
|---|---|---|---|---|
| **Move** | `Arrow Keys` | `W` / `A` / `S` / `D` | Drag on canvas | Left stick / D-pad |
| **Shoot** | `Z` | `Space` | Auto while dragging | `A` |
| **Bomb (灵击)** | `X` | - | - | `B` / `X` |
| **Focus / Slow (低速)** | `Shift` | - | - | `LB` / `LT` |
| **Pause / Resume** | `ESC` | - | - | `Start` |
| **Toggle Performance HUD** | `F12` | `P` | - | - |

All bindings are rebindable at runtime:

```typescript
game.input.setKeyBinding('shoot', ['KeyJ']);          // keyboard
game.input.setGamepadBinding('bomb', { buttons: [5] }); // gamepad (RB)
const map = game.input.getBindings();                  // render a settings screen
```

---

## 🚀 Installation & Usage

> This project is managed with [Bun](https://bun.sh). `bun install` / `bun run <script>`
> work out of the box; npm is fully compatible as well.

### Installing as a dependency

```bash
bun add @uestc-touhou/touhou-web-engine
# or: npm install @uestc-touhou/touhou-web-engine
```

### React / Web Integration Example

```tsx
import React, { useEffect, useRef } from 'react';
import { TH08Game } from '@uestc-touhou/touhou-web-engine/th08';

export const TouhouGameComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const game = new TH08Game();
    game.init(containerRef.current).then(() => {
      game.start();
    });

    return () => {
      game.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '640px',
        height: '480px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      }}
    />
  );
};
```

### Developing Locally

```bash
# Clone the repository
git clone git@github.com:wray-lee/touhou-web-engine.git
cd touhou-web-engine

# Install dependencies (Bun is the canonical toolchain; npm also works)
bun install

# Start local interactive demo server
bun run dev

# Run Vitest test suite (136 tests incl. a 2000-bullet perf benchmark)
bun run test

# Lint + typecheck
bun run lint
bun run typecheck

# Full CI gate (typecheck + lint + test)
bun run ci

# Build bundle & type declarations
bun run build
```

---

## 🏛️ Architecture & Extension

The engine is a **three-tier framework**. Everything you need to ship a new stage
or boss lives behind a small, stable API surface.

```
@uestc-touhou/touhou-web-engine          ← engine core + touhou-common (this package root)
@uestc-touhou/touhou-web-engine/th08     ← a reference game (TH08 Stage 1)
```

### Three-tier architecture (ASCII)

依赖方向严格自下而上：上层可 import 下层，下层永不反向依赖。

```
┌───────────────────────────────────────────────────────────────────────────┐
│  GAME IMPL          src/games/th08/            (TH08 专属，可整体替换)      │
│    TH08Game · stages/Stage1 (帧时间轴) · bosses/Rumia (3 阶段 AI/符卡)      │
├───────────────────────────────────────────────────────────────────────────┤
│  TOUHOU COMMON      src/touhou-common/         (TH06–TH18 系列可复用)       │
│    player/Player (移动/低速/Bomb/擦弹/触摸)   enemy/Enemy (航点+周期射击)    │
│    boss/Boss + SpellCard (多阶段 HP/符卡计时)  ui/HUD (分数/残机/名牌)       │
│    bullet-patterns/ BulletPattern · Circular · Linear · Aiming · Composite │
├───────────────────────────────────────────────────────────────────────────┤
│  ENGINE CORE        src/engine/                (完全游戏无关)               │
│    core/     Entity · Vector2 · EventEmitter · Bullet · BulletSystem(池)   │
│              CollisionSystem · InputSystem · Stage (帧时间轴)               │
│    physics/  SpatialHashGrid (64px 网格邻域查询)                            │
│    renderer/ PixiRenderer (WebGL/HUD/暂停浮层) · SpriteManager (程序化精灵)  │
│    audio/    AudioManager (合成 SE + BGM/loop/fadeIn/preload)              │
│    debug/    PerformanceMonitor (FPS/实体/真实碰撞比较计数)                  │
│    perf/     performance.bench.test (2000+ 弹帧预算基准)                     │
└───────────────────────────────────────────────────────────────────────────┘
```

### API at a glance

| Layer | Class / function | Responsibility |
|---|---|---|
| **Engine** | `Entity` | Position / velocity / hitbox / lifecycle base for everything |
| | `Bullet` | Pooled projectile with angular velocity & acceleration |
| | `BulletSystem` | Owns live bullets + **object pool** (`createBullet` / `recycle`) |
| | `CollisionSystem` | Spatial-hash queries by tag, graze radius, real check count |
| | `InputSystem` | Keyboard + gamepad + touch-drag, 3-frame press buffering, runtime rebinding |
| | `Stage` | Frame-based timeline (`{ frame, action }`) |
| | `PixiRenderer` | WebGL scene, HUD, banners, pause overlay |
| | `SpriteManager` | Named procedural sprites; bullets draw by `Bullet.sprite` key |
| | `AudioManager` | Synthesized SE + BGM (`playBGM` / `preload` / fade) |
| **Touhou** | `Player` | Movement, focus/slow, bomb, graze, touch-follow |
| | `Enemy` | Waypoint movement + periodic pattern fire |
| | `Boss` / `SpellCard` | Multi-phase HP, spellcard timer & bonus |
| | `BulletPattern` | Base — implement `spawn()`; `withFactory()` for pooling |
| | `Circular/Linear/Aiming/Composite` | Ready-made patterns |
| | `HUD` | Score / lives / bombs / power / graze / spellcard banner |

### 1 · Custom bullet pattern (pool-aware)

Always create bullets through `this.factory`, never `new Bullet(...)` — otherwise
they bypass the object pool and defeat the GC optimization:

```typescript
import { BulletPattern, Entity, Bullet } from '@uestc-touhou/touhou-web-engine';

export class SpiralPattern extends BulletPattern {
  constructor(private count: number, private speed: number) {
    super();
  }

  spawn(emitter: Entity, time: number, _player?: Entity): Bullet[] {
    const bullets: Bullet[] = [];
    for (let i = 0; i < this.count; i++) {
      const angle = (Math.PI * 2 / this.count) * i + time * 0.05;
      bullets.push(
        this.factory({                       // ← pooled creation
          position: emitter.position,
          velocity: { x: Math.cos(angle) * this.speed, y: Math.sin(angle) * this.speed },
          radius: 4,
          color: 0xff3399,
        })
      );
    }
    return bullets;
  }
}
```

### 1b · Bullet sprites

Every pattern config accepts a `sprite` key resolved by the renderer's
`SpriteManager` (built-ins: `bullet_small`, `bullet_ring`, `bullet_needle`,
`bullet_star`; unknown keys fall back to a default orb). Register your own —
procedurally, no asset files required:

```typescript
import { SpriteManager } from '@uestc-touhou/touhou-web-engine';

// renderer.sprites is the PixiRenderer's SpriteManager
renderer.sprites.register('bullet_plasma', (g, x, y, { color, radius }) => {
  g.circle(x, y, radius + 2).fill({ color, alpha: 0.4 });
  g.circle(x, y, radius).fill({ color });
});

// then reference it from any pattern:
new CircularPattern({ count: 16, speed: 2, color: 0x66ffcc, sprite: 'bullet_plasma' });
```

### 2 · Custom boss

Extend `Boss`, declare phases (non-spell + spellcards), and emit bullets from
`updateAI`. Route runtime patterns through the pool with `withBulletFactory`:

```typescript
import { Boss, SpellCard, CircularPattern, AimingPattern, Entity, Bullet }
  from '@uestc-touhou/touhou-web-engine';

export class MyBoss extends Boss {
  private frame = 0;

  constructor() {
    super({
      name: 'My Boss',
      phases: [
        { maxHp: 200, isSpellCard: false },
        {
          maxHp: 300,
          isSpellCard: true,
          spellCard: new SpellCard({
            name: '符「My Spell」',
            durationSeconds: 40,
            bonusScore: 1_000_000,
            maxHp: 300,
            pattern: new CircularPattern({ count: 24, speed: 2.4 }),
          }),
        },
      ],
    });
  }

  updateAI(_dt: number, player?: Entity): Bullet[] {
    this.frame++;
    const out: Bullet[] = [];
    if (this.frame % 45 === 0) {
      out.push(...new AimingPattern({ count: 3, speed: 4 }).spawn(this, this.frame, player));
    }
    return out;
  }
}

// In your game setup:
// boss.withBulletFactory((cfg) => bulletSystem.createBullet(cfg));
```

### 3 · Custom stage timeline

A stage is just a list of frame-triggered actions. Spawn enemies/bosses via
callbacks so the game loop owns lifecycle & pooling:

```typescript
import { Stage, StageTimelineEvent, Enemy, AimingPattern }
  from '@uestc-touhou/touhou-web-engine';

export function createMyStage(cb: {
  spawnEnemy: (e: Enemy) => void;
  onClear: () => void;
  bulletFactory?: (cfg: any) => any;
}): Stage {
  const timeline: StageTimelineEvent[] = [
    {
      frame: 60,
      action: () => {
        const enemy = new Enemy(
          { x: 200, y: -20 },
          { x: 0, y: 2 },
          cb.bulletFactory
            ? { hp: 20, shootInterval: 50,
                shootPattern: new AimingPattern({ count: 1, speed: 2.8 }),
                bulletFactory: cb.bulletFactory }
            : { hp: 20, shootInterval: 50,
                shootPattern: new AimingPattern({ count: 1, speed: 2.8 }) }
        );
        cb.spawnEnemy(enemy);
      },
    },
    { frame: 1800, action: () => cb.onClear() },
  ];
  return new Stage({ name: 'My Stage', timeline });
}
```

### 4 · Wire it into a game

`TH08Game` is the reference orchestrator. To build your own, compose the systems
and drive them from one `stepFrame()` (see `src/games/th08/TH08Game.ts`):

```typescript
import { TH08Game } from '@uestc-touhou/touhou-web-engine/th08';

const game = new TH08Game();
await game.init(document.getElementById('root')!); // mounts Pixi canvas + input
game.start();
// game.pause() / game.resume() / game.togglePause() — ESC handled internally
// game.destroy() — removes listeners & disposes renderer
```

---

## 🧪 Testing & CI

Continuous Integration runs on GitHub Actions on every commit (`typecheck → lint → test → build`):
- TypeScript 5.7 strict mode verification + ESLint flat-config lint
- 136 Unit tests covering:
  - Vector & Entity math & lifecycle（含 `Entity.transform` 位置/速度/旋转联动视图）
  - Typed `EventEmitter`（泛型 EventMap：`on` / `off` / `once` / `emit`）
  - Spatial Hash Grid collision bounds & neighbor queries
  - CollisionSystem spatial queries, tag filtering & graze radius
  - Object pool reuse / cap / recycling on collision & bounds culling
  - Input system: key state, 3-frame press buffering, gamepad buttons/stick, runtime rebinding, touch drag & canvas-coord mapping
  - Bullet lifecycle & bounds culling
  - Pattern generators (Circular, Linear, Aiming, Composite) + pool-factory propagation
  - SpriteManager procedural sprite registry (built-ins, custom keys, default fallback)
  - Player controller movement clamping & invulnerability, touch-follow physics
  - Boss HP phase transitions & SpellCard timeouts
  - TH08 Stage 1 Rumia AI (incl. Demarcation composite dual-ring salvo) & timeline triggers
  - TH08Game pause freeze/resume & ESC toggle
  - HUD spellcard banner display window
  - AudioManager BGM state & fade-in config
- **Performance benchmark** (`src/engine/perf/performance.bench.test.ts`): simulates the full
  per-frame logic pipeline (bullet motion + spatial-hash rebuild + hit/graze queries) with
  **2000+ live danmaku over 300 frames** and asserts the frame budget holds. Measured on CI
  hardware: avg **~0.55 ms/frame**, p95 **~0.94 ms** (budget 16.6 ms), peak collision
  comparisons ~14 k/frame — far below the O(n²) ≈ 4.2 M a naive loop would cost.

Contributing guidelines (code style, TDD requirements, PR flow, commit conventions) live in
[CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📜 Copyright & Attribution

- **Engine Code**: Released under the [MIT License](LICENSE).
- **Touhou Project**: Original game series and characters created by **ZUN / Team Shanghai Alice**. This is an unofficial derivative fan-work complying with Touhou Project fan-made content guidelines.
- **Art & Sound Design**: Referencing the open-source [Taisei Project](https://github.com/taisei-project/taisei) and [th08-web](https://github.com/N0zoM1z0/th08-web).
