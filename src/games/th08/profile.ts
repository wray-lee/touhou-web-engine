import type { GameProfile, GameStageCallbacks, GameStageInfo } from '../../touhou-common/game/GameProfile';
import { Stage } from '../../engine/core/Stage';
import { STAGE_METADATA, type StageNumber } from './types';
import { bossEncounterDialogue, spellCardDialogue, stageIntroDialogue } from './data/StageDialogue';
import type { CharacterId } from '../../touhou-common/player/CharacterProfile';

/** TH08 永夜抄 - the reference game built on the shared profile contract. */
const stages: GameStageInfo[] = (Object.keys(STAGE_METADATA) as unknown as string[])
  .map((k) => Number(k))
  .sort((a, b) => a - b)
  .map((n) => {
    const meta = STAGE_METADATA[n as StageNumber];
    return {
      stage: meta.stage,
      title: meta.title,
      boss: meta.boss,
      theme: meta.theme,
      cycleFrames: meta.cycleFrames,
      bgTheme: meta.bgTheme,
      bgBrightness: meta.bgBrightness,
      bgScroll: meta.bgScroll,
    };
  });

export const TH08_PROFILE: GameProfile = {
  id: 'th08',
  label: 'TH08 永夜抄',
  title: '東方永夜抄',
  subtitle: 'Imperishable Night',
  stageCount: 6,
  stages,
  /**
   * TH08 has no hand-authored stage. Every wave, boss and spell card comes from
   * the translated ECL script in `src/th08/stages/<route>/`, which
   * `EclStageLoader` drives through `StageRunner`. The `Stage` returned here is
   * therefore an empty shell that only carries the frame clock and the clear
   * flag: a fallback chart racing the real script for the screen is exactly the
   * "demo look" the translated data replaced.
   */
  buildStage(stage: number, _callbacks: GameStageCallbacks): Stage {
    const meta = STAGE_METADATA[stage as StageNumber];
    return new Stage({ name: meta.title, stageNumber: stage, timeline: [] });
  },
  introDialogue: (stage, character) => stageIntroDialogue(stage as StageNumber, character as CharacterId),
  bossDialogue: (stage, character) => bossEncounterDialogue(stage as StageNumber, character as CharacterId),
  spellDialogue: (stage) => spellCardDialogue(stage as StageNumber),
};
