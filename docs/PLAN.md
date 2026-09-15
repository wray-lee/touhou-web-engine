# 永夜抄 Web Engine — Implementation Status

> Updated: 2026-09-12
> TSC: CLEAN | Lint: 0 errors | Tests: 688/688 (76 files) | Build: OK | Source: `npm run ci`
> Dev server: `npx vite --port 5180 --strictPort --no-open` → `http://localhost:5180/`

The authoritative requirement ledger is `docs/REQUIREMENTS.md` (R-0 … R-11, every row with
runtime evidence or an explicit 🟡). This file only tracks phase progress.

## Phase Status

| Phase | Content | Status | Completion |
|-------|---------|--------|------------|
| **P0** | Fix half-finished code + asset pipeline | ✅ Done | 100% |
| **P1** | ECL translator (disasm + codegen) | ✅ Done | 100% |
| **P2** | Runtime sim layer | ✅ Done | 95% |
| **P3** | Hand refactor layer | ✅ Done | 100% |
| **P4** | Presentation layer | ✅ Done | 90% |
| **P5** | Flow, docs, cleanup | ✅ Done | 95% |

## Completed

### P0 — Foundation
- [x] th08.dat extraction: 317 entries (anm/ecl/std/msg/sht/wav/mid), 113 ANM packs decoded to PNG pages
- [x] thbgm.dat extraction: 21 BGM tracks as ogg with intro/loop points
- [x] Asset manifest with sprite rectangles for all anm files
- [x] Placeholder ladder so a checkout without the data files still plays end to end

### P1 — ECL Translator
- [x] EclFile parser: 9 ecl files (53–156 subs each), 2–4 timelines
- [x] EclDisasm: 185 opcodes (93 low + 92 high), variable resolution
- [x] EclEmitTs: generator coroutine code generation with difficulty masks
- [x] ReplayFile parser: demorpy0–3 decoded, input = one packed u16 per frame at `stage + 0x24`
- [x] Rng: 16-bit LCG matching ZUN's implementation
- [x] MsgFile, ShtFile, StdFile parsers
- [x] Snapshot tests for all 9 ecl files; `npm run ecl:check` green

### P2 — Runtime Sim
- [x] ECL-generated coroutines drive the real game loop (`StageRunner` + `EnemySlot` + lane scheduler)
- [x] Bullet / laser / item / enemy / player / spellcard subsystems ported from the decompile
- [x] Authentic bullet speeds, counts and angles straight out of the translated ECL
- [x] Difficulty branching is a live `difficultyMask` per instruction, not a reskin
- [x] **Replay gate**: `RetailReplay.test.ts` runs ZUN's four whole input streams through the sim and
  scores them against his own results (`TOTAL_SCORE_FLOOR = 0.51`, per-route floors 0.105 / 0.28 /
  0.073 / 0.034). Byte-identical scoreboard across the P3 refactor is the proof that refactoring
  changed no behaviour.
- [x] `AllRoutes.test.ts` runs all eight routes hands-off to the end of their timelines (7 `CLEARED`;
  stage 5 waits on a boss that cannot die without firing, which is retail behaviour)

### P3 — Hand Refactor
- [x] Launch parameters lifted from 16 positional arguments into named `ShotDescriptor` /
      `LaserDescriptor` records; `ShotDescriptor.test.ts` proves pack/unpack are exact inverses over
      every real tuple in the game
- [x] Register numbers rendered as `reg(0x2755) /* moveAngle */` from `EclRegisters.ts`
- [x] All 18 generated files regenerated and behaviour-checked against the replay gate
- [x] Dead hand-written layer deleted: `stages/Stage1..6.ts`, `CampaignStage.ts`,
      `bosses/{Rumia,StageBosses,bossBalance}.ts` and their tests (14 files)

### P4 — Presentation
- [x] PixiJS 8 renderer, 640×480 canvas, 384×448 playfield at (32,16), right HUD panel from `front.anm`
- [x] `.std` 3D backdrop: nine routes projected to quads, camera-space linear fog like the hardware path
- [x] Original sprites everywhere they resolve: 8 members from `player00..03.anm` with retail pose
      scripts, per-stage boss art from `stgNNenm.anm` (op 58–61 bank switch), `enemy.anm` grunts,
      338 bullet sprites from `etama.anm`, HUD digits from `ascii.anm`
- [x] Boss gauge with SETLIVES + multi-bar easing, spell banner, card cut-in with boss portrait
- [x] Dialogue VM: retail `msg*.dat` scripts, original portraits, ANM interrupt codes 3/4/6,
      width-tiered portrait offsets, night clock routed into the 6B branch
- [x] **Stage-title card** (`stgNNtxt`): four ANM VM slots at retail positions and alpha ramps
- [x] **ScreenEffect chain 4** (msg op 14): 442-frame full-screen fade-out
- [x] Per-ship bomb art, 16 cards, human/youkai variants
- [x] Focus hitbox drawn with the retail additive `etama` 4-cell orb
- [x] Responsive: playfield fills window height at 1920×1080 / 1366×768, aspect-preserved at 390×844
- [x] 21 BGM with intro/loop points + 17 SE from the real wav files

### P5 — Flow, docs, cleanup
- [x] Title → Character → Difficulty → stage 1, campaign runs 1→6 without stage select
- [x] Practice mode owns stage selection; `THANKS FOR PLAYING` only appears there
- [x] Pause menu, game over → results, arcade-style continue, leaderboard, replay export
- [x] Touch controls, keyboard + gamepad, opt-in mouse steering
- [x] `docs/REQUIREMENTS.md` rewritten as an evidence ledger; README documents the extraction
      commands, the translation pipeline and the copyright boundary
- [x] Temp-file cleanup; `npm run format && npm run ci && npm run build` green

## Remaining for 90%

- [ ] One uninterrupted 1→6 browser playthrough (every stage is reachable via `?warp`; the
      continuous recording has not been done)
- [ ] Stage 5's final segment needs a kill to advance — covered in sim, not yet in browser
- [ ] Retail title screen (`title01.anm`) and result screen (`result00.anm`) art: the packs are
      extracted, but the reference decompile `#include`s a `Title.hpp` that is not on disk, so the
      script→sprite assignment has no citable source. Shipping a guessed layout would violate the
      "original art only" rule, so the DOM menu stays until that data is recovered.
- [ ] `eff01..eff09*` effect packs: the retail template table lives at raw address `0x004c6d30`
      (`EffectManager.cpp:92-93`) and `th08.exe` is not on disk, so template→scriptIdx is
      unreadable; the player death burst still uses a placeholder sheet.
- [ ] Per-vertex alpha on `QuadLayer` to erase the last `.std` overlap seams (needs a custom
      Pixi v8 shader, GLSL + WGSL)
- [ ] A second game on the engine, to prove the ECL/ANM translation layer is generic rather than
      TH08-shaped
