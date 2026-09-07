# 贡献指南（Contributing Guide）

感谢你有兴趣为 **Touhou Web Engine** 做出贡献！本文档说明代码风格、测试要求、PR 流程与提交规范。

## 环境准备

本项目使用 [Bun](https://bun.sh) 作为规范工具链（`packageManager: bun@1.4.0`，锁文件为 `bun.lock`）：

```bash
bun install          # 安装依赖（npm 亦兼容，但提交前请保证 bun.lock 同步）
bun run dev          # 启动本地 demo 服务器（http://localhost:3000）
bun run ci           # 质量门禁：typecheck + lint + test
```

要求 Node >= 18（仅在使用 npm 兼容模式时需要关心）。

## 代码风格

风格由 **ESLint（flat config）+ Prettier** 共同强制，两者即配置文件本身，无需另读文档：

### ESLint（`eslint.config.js`）

- 基于 `js.configs.recommended` + `@typescript-eslint` recommended 规则集
- 仅作用于 `src/**/*.ts`；忽略 `dist/`、配置文件与 `*.test.ts`
- 关键定制：
  - `@typescript-eslint/no-unused-vars`：以 `_` 开头的参数豁免（`argsIgnorePattern: '^_'`）
  - `@typescript-eslint/no-explicit-any`：关闭（引擎层保留逃生舱）
  - `no-undef`：关闭（DOM 类型由 TypeScript 解析）
  - `no-console`：warn，允许 `warn` / `error` / `log`
- 运行：`bun run lint`，自动修复 `bun run lint:fix`

### Prettier（`.prettierrc`）

| 选项 | 值 |
|---|---|
| `semi` | `true`（保留分号） |
| `singleQuote` | `true`（单引号） |
| `trailingComma` | `"all"` |
| `printWidth` | `110` |
| `tabWidth` | `2` |

- 运行：`bun run format`；检查 `bun run format:check`

### TypeScript

- `tsconfig.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`
- 路径别名（vite / vitest / tsc 三处同步维护）：
  - `@/*` → `src/*`
  - `@core/*` → `src/engine/core/*`
  - `@renderer/*` → `src/engine/renderer/*`
  - `@physics/*` → `src/engine/physics/*`
  - `@touhou/*` → `src/touhou-common/*`
- 类型检查：`bun run typecheck`

### 架构约束

新增代码必须落在正确的层，依赖方向只能**自下而上**（下层不得 import 上层）：

- `src/engine/` —— 游戏无关核心（core / physics / renderer / audio / debug）
- `src/touhou-common/` —— 东方系列通用（bullet-patterns / player / enemy / boss / ui）
- `src/games/th08/` —— TH08 专属（stages / bosses）

子弹等高频对象一律走对象池（`BulletSystem.createBullet` / pattern 的 `this.factory`），
不要直接 `new Bullet(...)`。

## 测试要求

- **TDD**：先写失败的测试，再实现功能（红 → 绿 → 重构）。每个新行为都应有对应测试。
- **只测外部行为，不测实现细节**：例如断言 `pattern.spawn()` 返回的子弹数量与角度，
  而不是内部循环写法。
- 测试与源码同目录共存：`src/**/<Name>.test.ts`，框架为 Vitest（`environment: 'node'`，
  `globals: true`）。
- 运行：
  - 单次全量：`bun run test`
  - watch 模式：`bun run test:watch`
  - 覆盖率：`bun run test:coverage`
- **CI 门禁**：`bun run ci`（= `typecheck` → `lint` → `test`）必须全绿才允许合并。
  GitHub Actions（`.github/workflows/ci.yml`）在每次 push / PR 上额外执行 `bun run build`。
- 性能回归由 `src/engine/perf/performance.bench.test.ts` 锁定（2000+ 弹 × 300 帧全管线，
  断言帧预算），修改碰撞/弹幕热路径时注意不要弄红它。

## PR 流程

1. **分支**：从 `main` 切出，按类型命名 —— `feat/xxx`、`fix/xxx`、`docs/xxx`、`chore/xxx`。
2. **开发**：小步提交，每个提交自成逻辑单元；过程中随时 `bun run ci`。
3. **提 PR 前**：rebase 或 merge `main` 解决冲突，确认 `bun run ci` 全绿。
4. **开 PR**：目标分支 `main`；标题遵循下方提交规范；描述里链接对应票据
   （`.scratch/touhou-web-engine-mvp/issues/NN-*.md`）并逐条对照验收标准。
5. **CI 绿**：GitHub Actions 全绿是 review 的前置条件。
6. **Review**：至少一名维护者批准；改动引擎公共 API 时需说明向后兼容性。
7. **合并**：squash 或 rebase 合并，不污染 `main` 历史。

## 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/) + **中文描述**，
与现有历史保持一致：

```
<type>: <中文摘要>

<可选正文：中文，说明动机与关键点>
```

- **type**（取自现有 `git log`）：
  - `feat:` 新功能（例：`feat: InputSystem 手柄支持 + 运行时按键重绑定（票据 05 补全）`）
  - `fix:` 缺陷修复（例：`fix: CompositePattern.withFactory 传播到子 pattern（堵住组合弹幕池泄漏）`）
  - `docs:` / `docs+chore:` 文档（例：`docs: 添加项目规格文档和任务分解`）
  - `ci:` 流水线（例：`ci: GitHub Actions 切换到 bun（setup-bun + frozen-lockfile + build 校验）`）
  - `chore:` 工具链/杂项（例：`chore: 迁移到 bun 工具链 + 框架接口完备性修复`）
- 摘要用一般现在时、不带句尾句号；涉及具体票据时在括号内注明（如「票据 13」）。
- 一次提交只做一件事；文档与代码改动尽量分开（或如 `docs+chore:` 那样显式标注复合类型）。

## 素材与音频说明

- Phase 1 零外部美术依赖：精灵由 `SpriteManager` 程序化生成。
- 音频占位素材为 **WAV**（`public/audio/bgm/stage1.wav`、`public/audio/se/shoot.wav`，
  由脚本合成的静音/短音循环），而非票据原文的 MP3 —— Web Audio 与 `<audio>` 对 WAV
  解码零成本且无需引入编码依赖；`AudioManager` 在无外部素材时还会回退到内置合成 BGM/SE。

## 许可

提交即表示同意你的贡献以 MIT 许可证发布。详见 [LICENSE](LICENSE)。
