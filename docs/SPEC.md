# Touhou Web Engine - Technical Specification

## Problem Statement

UESTC Gensokyo（成电幻想乡）需要在其网站上展示技术实力，但缺少一个引人注目的交互式技术展示模块。传统的静态展示（项目列表、活动照片）无法充分体现社团的技术深度，特别是在游戏开发和 Web 技术领域的能力。

目前市面上虽然存在一些东方 Project 的 Web 实现（如 th08-web、toho-like-js），但它们要么依赖原作资源文件（版权灰色地带），要么不可扩展（硬编码特定关卡），无法作为通用框架复用于多部东方作品或其他 STG 游戏。

## Solution

构建一个现代化、可扩展的 STG（弹幕射击游戏）引擎，以东方 Project 系列为首要目标，最终支持 TH06-TH18 全系列作品的 Web 复刻。该引擎将：

1. **采用纯 Web 技术栈**（TypeScript + PixiJS），无需 WASM 或原作资源文件
2. **使用开源美术资源**（Taisei Project，MIT 许可），合法合规
3. **借鉴成熟实现**（th08-web 的游戏逻辑，toho-like-js 的配置格式）
4. **分层架构设计**，核心引擎层与具体游戏实现解耦
5. **首个交付目标**：东方永夜抄（TH08）完整六面 + Stage 1（露米娅）作为 MVP

最终产物编译后集成到 UESTCGensokyo-Frontend，以 `/games` 页面形式对外展示。

## User Stories

### 访客视角

1. As a 访客, I want to 在主站导航栏看到"游戏"入口, so that 我能发现社团的技术展示模块
2. As a 访客, I want to 看到游戏列表页展示可玩的东方作品, so that 我能选择感兴趣的关卡开始游玩
3. As a 东方粉, I want to 在浏览器直接游玩永夜抄, so that 无需下载安装原作即可体验经典弹幕
4. As a 玩家, I want to 使用键盘方向键移动角色、Z键射击、X键Bomb、Shift键低速移动, so that 操作体验与原作一致
5. As a 玩家, I want to 看到右上角显示分数、残机数、符卡计时, so that 了解当前游戏状态
6. As a 玩家, I want to 在符卡开始时看到符卡名牌居中弹出, so that 知道当前挑战的符卡名称
7. As a 玩家, I want to 按 ESC 暂停游戏并显示暂停菜单, so that 可以中途休息或退出
8. As a 技术爱好者, I want to 按 F12 显示性能监控面板（FPS/实体数/碰撞检测次数）, so that 看到引擎的技术实力
9. As a 移动端访客, I want to 通过触摸拖动自机游玩（拖动即自动射击）, so that 在手机上也能体验游戏 —— ✅ 已实现（原"仅提示桌面游玩"方案已被触摸拖动替代，虚拟摇杆仍不在范围内）

### 开发者视角

10. As a 引擎开发者, I want to 核心引擎层与具体游戏实现分离, so that 后续可以复用引擎开发其他东方作品
11. As a 关卡设计者, I want to 用 TypeScript 配置文件定义关卡脚本（敌人出场时间、符卡配置）, so that 无需修改引擎代码即可创建新关卡
12. As a 弹幕设计者, I want to 组合基础 Pattern（环形弹、直线弹、自机狙）构建复杂符卡, so that 快速实现各种弹幕效果
13. As a 贡献者, I want to 清晰的模块边界和测试覆盖, so that 可以安全地扩展引擎功能
14. As a 前端集成者, I want to 引擎编译成独立 npm 包, so that 可以在任何 React 项目中引入游戏模块

### 维护者视角

15. As a 项目维护者, I want to CI 自动运行类型检查、Lint、单元测试, so that 确保代码质量
16. As a 项目维护者, I want to 完整的 TypeScript 类型定义, so that 集成时有良好的开发体验
17. As a 项目维护者, I want to 清晰的文档说明如何添加新关卡, so that 降低贡献门槛

## Implementation Decisions

### 架构设计

**三层架构**：

1. **引擎核心层**（`src/engine/`）
   - `core/`: Entity、Stage、BulletSystem、CollisionSystem、InputSystem
   - `renderer/`: PixiRenderer（WebGL 渲染适配）、SpriteManager、EffectSystem
   - `audio/`: AudioManager（Web Audio API 封装）
   - `physics/`: Transform、Hitbox、碰撞检测算法
   - 特点：完全游戏无关，可复用于任何 STG

2. **东方通用层**（`src/touhou-common/`）
   - `bullet-patterns/`: 东方系列常见弹幕 pattern（CircularPattern、AimingPattern、LaserPattern）
   - `player/`: PlayerController、BombSystem
   - `boss/`: BossController、SpellCard 抽象
   - `ui/`: HUD、符卡名牌、对话系统
   - 特点：东方系列通用，TH06-TH18 可复用

3. **TH08 具体实现层**（`src/games/th08/`）
   - `stages/`: Stage1.ts ~ Stage6.ts（关卡脚本）
   - `bosses/`: Rumia.ts, Cirno.ts 等（Boss AI 实现）
   - `data/`: 弹幕配置、符卡配置（从 th08-web 翻译）
   - `players/`: ReimuYukari.ts, MarisaAlice.ts（角色差异化）
   - 特点：TH08 专属逻辑

### 技术选型

- **渲染引擎**: PixiJS 8.x（WebGL 高性能渲染，支持 10000+ 精灵不掉帧）
- **类型系统**: TypeScript 5.7（严格模式）
- **构建工具**: Vite 6.x（快速 HMR + 生产构建）
- **测试框架**: Vitest 2.x（与 Vite 原生集成）
- **代码质量**: ESLint + Prettier（统一代码风格）
- **包管理/任务运行**: **Bun**（`packageManager: bun@1.4.0` + `bun.lock`；CI 用
  `oven-sh/setup-bun@v2` + `bun install --frozen-lockfile`；npm 命令仍兼容）

### 弹幕系统设计

采用 **Pattern 模式**，从 th08-web 的 `BulletSpawnDescriptor` 和 toho-like-js 的配置格式提炼：

实际实现（`src/touhou-common/bullet-patterns/`）：pattern 以**配置对象**构造，
子弹一律经 `this.factory` 创建（默认走共享对象池 `obtainBullet`，可由
`withFactory()` 注入宿主 `BulletSystem.createBullet`），绝不直接 `new Bullet`：

```typescript
abstract class BulletPattern {
  protected factory: BulletFactory = (config) => obtainBullet(config); // 默认共享池
  withFactory(factory: BulletFactory): this; // 注入宿主池
  abstract spawn(emitter: Entity, time: number, player?: Entity): Bullet[];
}

// 具体 pattern（配置对象式）
class CircularPattern extends BulletPattern {
  constructor(public config: CircularPatternConfig) { super(); } // { count, speed, angleOffset?, radius?, color?, sprite?, ... }
  spawn(emitter: Entity): Bullet[] {
    const { count, speed, angleOffset = 0 } = this.config;
    const bullets: Bullet[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + angleOffset;
      bullets.push(this.factory({
        position: { x: emitter.position.x, y: emitter.position.y },
        velocity: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        sprite: 'bullet_ring', // SpriteManager 程序化精灵键（零外部素材）
      }));
    }
    return bullets;
  }
}

// 组合 pattern（复杂符卡）；withFactory 向子 pattern 传播
class CompositePattern extends BulletPattern {
  constructor(public patterns: BulletPattern[]) { super(); }
  spawn(emitter: Entity, time: number, player?: Entity): Bullet[] {
    return this.patterns.flatMap((p) => p.spawn(emitter, time, player));
  }
}
```

### 碰撞检测优化

采用 **空间哈希网格**（Spatial Hash Grid）：
- 将屏幕划分为 64x64 像素的网格
- 实体只与相邻 9 格内的实体进行碰撞检测
- 复杂度从 O(n²) 降至 O(n)
- 参考 th08-web 的判定点算法：玩家判定点 2px，弹幕判定圆 4-8px

### 关卡脚本格式

采用 **TypeScript 配置文件**（类似 toho-like-js，但类型安全）。落地形态为
**帧制时间轴** `{ frame, action }`（非毫秒 `time`），由 `Stage` 驱动；关卡工厂函数
接收一组回调（`spawnEnemy` / `spawnBoss` / `onClear` / `bulletFactory`），把实体生命周期
与对象池的所有权留给宿主游戏循环。以下为 `src/games/th08/stages/Stage1.ts` 的真实 API：

```typescript
// src/games/th08/stages/Stage1.ts —— 实际实现
export interface Stage1Callbacks {
  spawnEnemy: (enemy: Enemy) => void;
  spawnBoss: (boss: Rumia) => void;
  onClear: () => void;
  showMessage?: (text: string, durationFrames?: number) => void;
  bulletFactory?: BulletFactory; // 注入对象池工厂
}

export function createStage1(callbacks: Stage1Callbacks): Stage {
  const timeline: StageTimelineEvent[] = [
    {
      frame: 60, // 帧制，非毫秒
      action: () => {
        const enemy = new Enemy(
          { x: 120, y: -20 },
          { x: 0, y: 2.2 },
          {
            hp: 20,
            shootInterval: 50,
            shootPattern: new AimingPattern({ count: 1, speed: 2.8 }),
            bulletFactory: callbacks.bulletFactory, // 走对象池
          },
        );
        callbacks.spawnEnemy(enemy);
      },
    },
    // ... 更多波次；Boss 登场、阶段切换、onClear 同理
  ];
  return new Stage({ name: 'Stage 1', stageNumber: 1, timeline });
}
```

`Stage` 另提供一组 **StageContext API**（票据 08）供时间轴回调调用，宿主游戏负责消费：
`spawnEntity(entity)`、`startBossPhase(boss, index)`、`showDialogue(text, frames)`，
产出队列 `spawnedEntities` / `bossPhaseRequests` / `dialogueQueue`。

### 美术资源策略

**Phase 1（MVP）**: 程序生成占位符
- 弹幕：Canvas Graphics API 绘制纯色圆形/菱形
- 角色：简化像素风几何图形
- 目标：快速验证引擎架构

**Phase 2（完整版）**: Taisei Project 素材
- 从 Taisei 仓库提取精灵图（`.spr` 格式）
- 编写转换脚本：`.spr` → PNG
- 用 TexturePacker 生成 sprite atlas
- 资源路径：`public/assets/sprites/th08/`

### 性能优化

- **对象池**（Object Pool）：✅ 已接线。`src/engine/core/Bullet.ts` 提供模块级共享空闲链表
  （`obtainBullet` / `releaseBullet` / `getBulletPoolSize` / `drainBulletPool`，默认上限
  `DEFAULT_BULLET_POOL_CAP = 512`，双重释放安全）。`BulletSystem.createBullet()` 复用实例，
  越界剔除与 `clearAll()` 回收；Player / Enemy / Boss / 全部 Pattern 的子弹创建统一经
  `BulletFactory`（宿主注入 `bulletSystem.createBullet`），无一处 `new Bullet` 旁路。
  `BulletSystem.getStats()` 报告 `poolReused` / `poolAllocated` / `poolSize`。
- **空间哈希网格**：✅ 全量迁移。`CollisionSystem` 惰性重建网格（`ensureGrid()`），
  玩家子弹 vs 敌人/Boss、擦弹查询全部走 9 格邻域；`totalChecks` 统计真实距离比较次数
  （F12 面板展示，2000+ 弹峰值 ~14k 次 ≪ O(n²) 420 万次）。
- **Dirty Flag**：只在状态变化时重新渲染
- **PixiJS Batch Rendering**：自动合并 draw call
- **RAF 锁帧**：60 FPS 固定时间步长

### 前端集成

实际 `TH08Game` 构造仅接受 `{ container?: HTMLElement; headless?: boolean }`，
容器在 `await game.init(container)` 时挂载（Phase 1 固定 Stage 1 / 单角色，
`stage`/`difficulty`/`player` 选项留待后续迭代）：

```typescript
// UESTCGensokyo-Frontend/src/pages/games/TH08Stage1.tsx
import { useEffect, useRef } from 'react';
import { TH08Game } from '@uestc-touhou/touhou-web-engine/th08';

export default function TH08Stage1Page() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const game = new TH08Game();
    game.init(containerRef.current).then(() => game.start());
    return () => game.destroy();
  }, []);

  return (
    <div ref={containerRef} className="game-container">
      {/* PixiJS 自动创建 canvas */}
    </div>
  );
}
```

## Testing Decisions

### 测试原则

**只测试外部行为，不测试实现细节**：
- ✅ 测试：调用 `pattern.spawn()` 返回正确数量和位置的 Bullet
- ❌ 不测试：Pattern 内部的循环实现方式

### 测试范围

1. **引擎核心层**（高优先级）
   - `BulletSystem.test.ts`: 弹幕生成、更新、销毁
   - `CollisionSystem.test.ts`: 空间哈希网格、碰撞检测准确性
   - `Entity.test.ts`: 位置更新、速度计算
   - `Stage.test.ts`: 时间轴事件触发

2. **东方通用层**（中优先级）
   - `CircularPattern.test.ts`: 环形弹生成正确数量和角度
   - `AimingPattern.test.ts`: 自机狙瞄准计算
   - `SpellCard.test.ts`: 符卡计时、阶段切换

3. **TH08 实现层**（低优先级，集成测试）
   - `Stage1.test.ts`: 关卡脚本正确触发事件
   - `Rumia.test.ts`: Boss 在特定时间点发射特定弹幕

### 测试工具

- **Vitest**: 单元测试框架
- **@vitest/ui**: 交互式测试 UI
- **@vitest/coverage-v8**: 代码覆盖率（目标 >80%）

### 现有先例

参考 toho-like-js 的测试方式（虽然它没有自动化测试，但 `webgl_test.html` 提供了手动测试思路）：
- 创建最小场景（单个 Boss + 单个 Pattern）
- 验证弹幕数量、位置、碰撞
- 截图对比（Playwright visual regression 可选）

## Out of Scope

以下内容**不在**本期规格范围内，留待后续迭代：

1. **Replay 录像系统**：保存/回放游戏录像（th08-web 已实现，但需要额外存储设计）
2. **排行榜系统**：全球/本地高分榜（需要后端 API 支持）
3. **虚拟摇杆**：触摸拖动自机已实现（US#9），虚拟摇杆样式交互暂不做
4. **多人联机**：WebRTC 协作模式（toho-like-js 有实现，但复杂度高）
5. **关卡编辑器**：可视化编辑弹幕 pattern（需要独立工具链）
6. **TH06-TH07 和 TH09-TH18**：其他东方作品（本期专注 TH08）
7. **对话系统完整实现**：Boss 登场/符卡前对话（Phase 1 仅占位）
8. **Extra 难度和 Last Word**：TH08 的额外模式（先完成 Normal/Hard/Lunatic）
9. **音乐房和设置菜单**：完整的游戏菜单系统（Phase 1 直接进入关卡）

### 移动端适配（Moved into Phase 1）

> 2026-09-07 更新：US#9「移动端兼容」由"仅显示桌面提示"调整为
> **支持触摸拖动自机游玩**。实现方式为触摸/指针拖动，自机以常规速度平滑跟随手指；
> 拖动期间自动射击。移动端从 Out of Scope 移入 Phase 1。

### 已落实的实现决策（评审修复，2026-09-07）

对照初版评审发现并修复的偏差：

| # | 评审项 | 修复 |
|---|--------|------|
| 1 | **对象池**（SPEC 「性能优化」L181） | `BulletSystem` 内置对象池：`createBullet()` 复用 + `recycle()`，全游戏子弹创建（Player/Enemy/Boss/Pattern）统一走池，F12 面板展示复用/分配计数 |
| 2 | **暂停**（US#7） | ESC 暂停/恢复；暂停冻结全部游戏逻辑（时间轴、实体、HUD）但仍渲染；暂停覆盖菜单 + BGM 暂停/续播 |
| 3 | **碰撞检测**（「碰撞检测优化」） | 玩家子弹 vs 敌人/Boss、擦弹（graze 16px）全部迁移到空间哈希网格邻域查询；F12 `Collision Checks` 统计真实距离比较次数 |
| 4 | **符卡名牌**（US#6） | 名牌 30 帧内从右侧滑入 playfield 中心（ease-out cubic），叠加 scale 1.6→1.0 缓动 + 淡入动画 |
| 5 | **移动端**（US#9） | 触摸拖动自机跟随 + 自动射击（见上） |
| 6 | **BGM**（Ticket 13） | `playBGM(url, { loop, volume, fadeIn })` + `preload()`；无外部素材时回退内置 Web Audio 合成琶音循环；首次用户手势解锁 |
| 7 | **npm 导出**（「前端集成」L190） | 修正 `dist/th08.js` 与 `dist/games/th08/index.d.ts` 路径不一致：vite entry 改为 `games/th08/index` |

**协作方式**：以上修复同时附带单元测试覆盖（TDD）。

### Phase 1 交付状态（2026-09-07 同步）

`.scratch/touhou-web-engine-mvp/issues/` 的 **16 张票据已全部交付**（核心验收标准满足；
个别细节项以等效实现替代或留待 Phase 2，已在各票据复选框行尾逐条注明原因），
`bun run ci`（typecheck + lint + test）与 `bun run build` 全绿，测试 **136 项**。

| 票据 | 状态 | 备注（与原规格的替代实现） |
|---|---|---|
| 01 脚手架 + CI | ✅ | 工具链 **bun 代 npm**（`bun.lock`、CI `setup-bun`）；npm 仍可用 |
| 02 Entity | ✅ | 额外补 `Transform` 视图 + 泛型类型化 `EventEmitter` |
| 03 Pixi 渲染层 | ✅ | `demo/renderer-test.html`（100 圆 60FPS 基准） |
| 04 碰撞系统 | ✅ | `demo/collision-test.html`（1000 弹 + `D` 键网格/判定点浮层） |
| 05 输入系统 | ✅ | 超出原规格：手柄 + 运行时重绑定 + 触摸拖动 |
| 06 弹幕 + Pattern | ✅ | 4 种 pattern 全走对象池（`this.factory`） |
| 07 玩家控制器 | ✅ | 触摸跟随替代独立 Bomb 占位（Bomb 已实装灵击） |
| 08 关卡时间轴 | ✅ | 事件格式落地为 `{ frame, action }`（帧制，非毫秒 `time`） |
| 09 Boss + 符卡 | ✅ | 名牌居中弹出动画（US#6） |
| 10 HUD | ✅ | TH08 右侧面板布局（Score/Lives/Bombs/Power/Graze） |
| 11 露米娅 AI | ✅ | 3 阶段（原票据写 2 阶段，实交付含闇符「Demarcation」） |
| 12 Stage 1 时间轴 | ✅ | 妖精波次 + 中 Boss + Boss，可全程游玩至 STAGE CLEAR |
| 13 音频系统 | ✅ | 占位素材 **WAV 代 MP3**（`public/audio/bgm/stage1.wav`、`public/audio/se/shoot.wav`）；无素材时回退内置合成 |
| 14 性能监控 | ✅ | F12 浮层含实体分类 + 真实碰撞比较计数 + 实时输入行 |
| 15 库构建 | ✅ | `example/index.html` 库用法示例；`./th08` 导出路径已对齐 |
| 16 文档 | ✅ | README（架构图/Demo 页/React/扩展指南）+ `CONTRIBUTING.md`；截图因无头环境留 TODO |

**未落地项（Phase 2+）**：Taisei 真实素材、LaserPattern、对话系统、TH08 Stage 2-6、
多角色差异化 —— 见「Out of Scope」与「开发优先级」。

## Further Notes

### 代码借鉴清单

从 **th08-web** 借鉴：
- `src/BulletManager.cpp`: 弹幕生成公式、变换（transform）逻辑
- `src/EclManager.cpp`: 关卡脚本执行机制（虽然我们用 TS 不用 ECL，但时间轴概念相同）
- `src/Player.cpp`: 玩家判定点、移动速度（低速 2.0px/frame，高速 4.5px/frame）
- `src/Background.cpp`: 背景滚动和缩放效果

从 **toho-like-js** 借鉴：
- `data/bullets_params.js`: 弹幕类型配置（type、shotCount、baseCount）
- `data/bosses_params.js`: Boss AI 配置（spellCard、vital、v 移动向量）
- `source/Bullet.js`: 弹幕更新逻辑（速度、角度、加速度）

### 许可证和版权

- **引擎代码**: MIT 许可（与 Taisei 一致）
- **Taisei 素材**: MIT 许可 + CC-BY 4.0（音乐）
- **th08-web 代码参考**: 学习其逻辑但完全重写（避免许可冲突）
- **toho-like-js 代码参考**: MIT 许可，可直接参考
- **声明**: 本项目为东方 Project 非官方二次创作，遵守 ZUN 的二次创作指南

### 开发优先级

**Phase 1 (MVP, 2-3 周)**:
1. 引擎核心层搭建
2. Stage 1 完整实现（露米娅 + 2 个符卡）
3. 单人物（灵梦/紫组）
4. 程序生成占位符美术
5. 部署到 touhou-web-engine 仓库，CI/CD 配置

**Phase 2 (完整 TH08, 6-8 周)**:
1. Stage 2-6 实现
2. 4 组人物差异化
3. 时间系统（日/夜切换）
4. Taisei 素材集成
5. 完整 UI（标题画面、难度选择、结算画面）

**Phase 3 (扩展, 后续)**:
1. TH06-TH07 支持
2. Replay 系统
3. 排行榜
4. 移动端适配

### 性能目标

- **60 FPS 稳定**：同屏 2000+ 弹幕不掉帧
- **首次加载**: <3 秒（含素材）
- **内存占用**: <200MB（不含音乐）
- **包体积**: <5MB（编译后 JS + 素材）

### 集成到主站

编译产物发布为 npm 包：
```bash
# 在 touhou-web-engine 仓库
npm run build  # 生成 dist/

# 在 UESTCGensokyo-Frontend 仓库
npm install @uestc-touhou/touhou-web-engine
```

路由配置：
- `/games` → 游戏列表页
- `/games/th08` → TH08 选择页面（难度/人物）
- `/games/th08/stage1` → Stage 1 游戏页面
