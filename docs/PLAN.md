# Touhou Web Engine - 项目计划总结

## 📋 已完成

✅ **新仓库创建**: https://github.com/wray-lee/touhou-web-engine  
✅ **技术规格文档**: `docs/SPEC.md` (详细的问题陈述、解决方案、用户故事、实现决策)  
✅ **任务分解**: `.scratch/touhou-web-engine-mvp/` 包含 16 个垂直切片任务票据  
✅ **Git 配置**: `.gitignore` 排除 `.scratch/` 等开发文件  

## 🎯 项目目标

构建一个**现代化、可扩展的 STG 引擎**，最终支持东方 Project TH06-TH18 全系列 Web 复刻。

**Phase 1 (MVP)**: 完整的 TH08 Stage 1（露米娅面）+ 可复用引擎框架

## 🏗️ 架构设计（三层）

```
src/
├── engine/              # 核心引擎层（游戏无关，可复用）
│   ├── core/           # Entity, Stage, BulletSystem, CollisionSystem
│   ├── renderer/       # PixiJS 渲染封装
│   └── audio/          # Web Audio API 封装
├── touhou-common/      # 东方通用层（TH06-TH18 可复用）
│   ├── bullet-patterns/  # CircularPattern, AimingPattern, etc.
│   ├── player/         # PlayerController, BombSystem
│   ├── boss/           # BossController, SpellCard
│   └── ui/             # HUD, 符卡名牌, 对话系统
└── games/th08/         # TH08 具体实现
    ├── stages/         # Stage1.ts ~ Stage6.ts
    ├── bosses/         # Rumia.ts, Cirno.ts, etc.
    └── data/           # 弹幕配置（从 th08-web 翻译）
```

## 📦 技术栈

- **渲染**: PixiJS 8.x (WebGL)
- **语言**: TypeScript 5.7 (严格模式)
- **构建**: Vite 6.x
- **测试**: Vitest 2.x
- **素材**: Taisei Project (MIT 许可)

## 🎮 代码参考来源

- **th08-web**: 游戏逻辑（弹幕公式、碰撞算法、时间系统）
- **toho-like-js**: 配置格式（关卡脚本、弹幕 pattern）
- **Taisei Project**: 美术资源（精灵图、音频）

## 📋 任务清单（16 个任务）

### 基础设施 (Week 1)
1. **01-foundation** - 项目脚手架 + CI/CD ✨ **可立即开始**
2. **02-entity-system** - 核心实体抽象
3. **03-pixi-renderer** - PixiJS 渲染层
4. **04-collision-system** - 空间哈希碰撞检测
5. **05-input-system** - 键盘输入管理

### 游戏系统 (Week 2)
6. **06-bullet-system** - 弹幕系统 + Pattern 抽象
7. **07-player-controller** - 玩家控制器
8. **08-stage-system** - 关卡时间轴管理器
9. **09-boss-spellcard** - Boss 系统 + 符卡机制
10. **10-hud** - HUD 界面（分数/残机/Bomb）

### Stage 1 实现 (Week 3)
11. **11-rumia-boss** - 露米娅 Boss AI
12. **12-stage1-timeline** - Stage 1 完整时间轴
13. **13-audio-system** - 音频管理器
14. **14-performance-monitor** - 性能监控面板

### 打包发布 (Week 4)
15. **15-library-build** - 库构建配置
16. **16-documentation** - README + API 文档

## 🔗 依赖关系

- **无依赖**: 01-foundation ← 立即可开始
- **第二层**: 02-entity-system, 05-input-system, 13-audio-system
- **第三层**: 03, 04, 07, 08 (依赖第二层)
- **第四层**: 06, 10 (依赖第三层)
- **第五层**: 09, 11, 14 (依赖第四层)
- **第六层**: 12 (依赖第五层)
- **最终层**: 15, 16 (依赖第六层)

详细依赖图见 `.scratch/touhou-web-engine-mvp/README.md`

## ✅ 验收标准（Phase 1）

- [x] Stage 1 可完整游玩（击败露米娅）
- [ ] 60 FPS 稳定，1000+ 弹幕不掉帧（性能目标：同屏 2000+ 不掉帧，见 SPEC「性能目标」）
- [x] 所有测试通过（`npm run ci` —— 当前 54 项）
- [x] 编译成 npm 包可导入（`@uestc-touhou/touhou-web-engine/th08` 路径已验证）
- [x] 性能监控显示 FPS/实体数/碰撞检测次数（碰撞次数为空间哈希真实距离比较计数）
- [x] README 包含使用示例和架构说明

### 评审修复记录（2026-09-07）

对照「代码评审」修复项：

- [x] US#7 ESC 暂停 + 暂停菜单（含 BGM 暂停/续播）
- [x] US#9 移动端：触摸拖动自机 + 自动射击（替换"仅在桌面游玩"提示）
- [x] SPEC L181 弹幕对象池（BulletSystem 内置池 + 全链路注入）
- [x] SPEC L127-130 碰撞全量迁移空间哈希网格 + F12 真实计数
- [x] US#6 符卡名牌居中弹出动画
- [x] Ticket 13 BGM fadeIn/loop/preload + 内置合成回退
- [x] npm 包 `./th08` 导出路径对齐（vite entry `games/th08/index`）
- [x] 标准层：EntityTag 联合类型 + AimingPattern 委托共享 spread 生成器
- [ ] Bullet.sprite / CompositePattern 保留但未接入 SpriteManager 渲染（Phase 2 素材接入时启用）

## 📊 预估工作量

- **Week 1-2**: 基础引擎框架 (Tasks 01-10)
- **Week 3**: Stage 1 实现 (Tasks 11-14)
- **Week 4**: 打包发布 (Tasks 15-16)

**总计**: 约 3-4 周全职开发

## 🚀 下一步

从 **Task 01 (foundation)** 开始实施：

```bash
cd /d/Projects/touhou-web-engine
# 按照 .scratch/touhou-web-engine-mvp/issues/01-foundation.md 执行
```

完成后直接推送到 main 分支（个人仓库，无需 PR）。

## 📚 文档位置

- **完整规格**: `docs/SPEC.md`
- **任务票据**: `.scratch/touhou-web-engine-mvp/issues/*.md`
- **任务总览**: `.scratch/touhou-web-engine-mvp/README.md`
