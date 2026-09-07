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

# Run Vitest test suite (74 tests incl. a 2000-bullet perf benchmark)
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
- 74 Unit tests covering:
  - Vector & Entity math & lifecycle
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

---

## 📜 Copyright & Attribution

- **Engine Code**: Released under the [MIT License](LICENSE).
- **Touhou Project**: Original game series and characters created by **ZUN / Team Shanghai Alice**. This is an unofficial derivative fan-work complying with Touhou Project fan-made content guidelines.
- **Art & Sound Design**: Referencing the open-source [Taisei Project](https://github.com/taisei-project/taisei) and [th08-web](https://github.com/N0zoM1z0/th08-web).
