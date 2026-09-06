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

| Action | Primary Key | Alternate Key | Touch |
|---|---|---|---|
| **Move** | `Arrow Keys` | `W` / `A` / `S` / `D` | Drag on canvas |
| **Shoot** | `Z` | `Space` | Auto while dragging |
| **Bomb (灵击)** | `X` | - | - |
| **Focus / Slow (低速)** | `Shift` | - | - |
| **Pause / Resume** | `ESC` | - | - |
| **Toggle Performance HUD** | `F12` | `P` | - |

---

## 🚀 Installation & Usage

### Installing as a dependency

```bash
npm install @uestc-touhou/touhou-web-engine
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

# Install dependencies
npm install

# Start local interactive demo server
npm run dev

# Run Vitest test suite
npm run test

# Run TypeScript typecheck
npm run typecheck

# Build bundle & type declarations
npm run build
```

---

## 🏛️ Architecture & Extension

### Custom Bullet Pattern Example

```typescript
import { BulletPattern, Entity, Bullet } from '@uestc-touhou/touhou-web-engine';

export class SpiralLaserPattern extends BulletPattern {
  constructor(public count: number, public speed: number) {
    super();
  }

  spawn(emitter: Entity, time: number, player?: Entity): Bullet[] {
    const bullets: Bullet[] = [];
    const angleOffset = time * 0.05;

    for (let i = 0; i < this.count; i++) {
      const angle = (Math.PI * 2 / this.count) * i + angleOffset;
      bullets.push(
        new Bullet({
          position: emitter.position,
          velocity: {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed,
          },
          radius: 4,
          color: 0xff3399,
        })
      );
    }
    return bullets;
  }
}
```

---

## 🧪 Testing & CI

Continuous Integration runs on GitHub Actions on every commit:
- TypeScript 5.7 strict mode verification
- 54+ Unit tests covering:
  - Vector & Entity math & lifecycle
  - Spatial Hash Grid collision bounds & neighbor queries
  - CollisionSystem spatial queries, tag filtering & graze radius
  - Object pool reuse / cap / recycling on collision & bounds culling
  - Input system & key state buffering, touch drag & canvas-coord mapping
  - Bullet lifecycle & bounds culling
  - Pattern generators (Circular, Linear, Aiming, Composite)
  - Player controller movement clamping & invulnerability, touch-follow physics
  - Boss HP phase transitions & SpellCard timeouts
  - TH08 Stage 1 Rumia AI & event timeline triggers
  - TH08Game pause freeze/resume & ESC toggle
  - HUD spellcard banner display window
  - AudioManager BGM state & fade-in config

---

## 📜 Copyright & Attribution

- **Engine Code**: Released under the [MIT License](LICENSE).
- **Touhou Project**: Original game series and characters created by **ZUN / Team Shanghai Alice**. This is an unofficial derivative fan-work complying with Touhou Project fan-made content guidelines.
- **Art & Sound Design**: Referencing the open-source [Taisei Project](https://github.com/taisei-project/taisei) and [th08-web](https://github.com/N0zoM1z0/th08-web).
