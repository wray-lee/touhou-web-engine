/**
 * Generated from public/assets/th08/manifest.json (stgNNtxt.anm) by
 * tools/th08/anm/generate-stgtxt.mjs. Do not edit by hand.
 *
 * The retail stage-title card. `Gui.cpp:2307` runs scripts 0..3 of this pack
 * on `Gui::Impl::vm2a44[0..3]` as a stage loads, and `Gui.cpp:766-770` re-runs
 * script 3 with sprite `arg+3` on every msg op 7. The bytecode is kept as-is
 * so `AnmVm` can play it; `length` is the last instruction time, which is how
 * long the card holds before its own `Delete` retires it.
 */

/** One atlas cell of a stage-text pack, addressed by its ANM sprite id. */
export interface StgtxtCell {
  readonly id: number;
  /** Which page of the pack the rect lives on. */
  readonly tex: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** One script of a stage-text pack: raw VM words plus its own lifetime. */
export interface StgtxtScript {
  readonly id: number;
  readonly base64: string;
  /** Last instruction time in ANM ticks, which is when the script deletes itself. */
  readonly length: number;
}

/** One lifted `stgNNtxt.anm` pack. */
export interface StgtxtPack {
  /** URL of page 0, the only page any shipped title pack uses. */
  readonly page: string;
  readonly cells: readonly StgtxtCell[];
  readonly scripts: readonly (StgtxtScript | null)[];
}

export const TH08_STGTXT: Readonly<Record<string, StgtxtPack>> = {
  stg1txt: {
    page: '/assets/th08/anm/stg1txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAGBDAACGQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACIAFAByAQAAPAAAAAAAAAAAAAAAJAAYAHIBAAAQAAAABAAAAAAAIEEAAAAAAQAIAK4BAAA=',
        length: 430,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEACQAQAAAAAAADwAAAABAAgAzAEAAA==',
        length: 460,
      }, // 3
    ],
  },
  stg2txt: {
    page: '/assets/th08/anm/stg2txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAGBDAACGQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACIAFAByAQAAPAAAAAAAAAAAAAAAJAAYAHIBAAAQAAAABAAAAAAAIEEAAAAAAQAIAK4BAAA=',
        length: 430,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEACQAQAAAAAAADwAAAABAAgAzAEAAA==',
        length: 460,
      }, // 3
    ],
  },
  stg3txt: {
    page: '/assets/th08/anm/stg3txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAGBDAACGQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACIAFAByAQAAPAAAAAAAAAAAAAAAJAAYAHIBAAAQAAAABAAAAAAAIEEAAAAAAQAIAK4BAAA=',
        length: 430,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEACQAQAAAAAAADwAAAABAAgAzAEAAA==',
        length: 460,
      }, // 3
    ],
  },
  stg4atxt: {
    page: '/assets/th08/anm/stg4atxt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAGBDAACGQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACIAFAByAQAAPAAAAAAAAAAAAAAAJAAYAHIBAAAQAAAABAAAAAAAIEEAAAAAAQAIAK4BAAA=',
        length: 430,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEACQAQAAAAAAADwAAAABAAgAzAEAAA==',
        length: 460,
      }, // 3
    ],
  },
  stg4btxt: {
    page: '/assets/th08/anm/stg4btxt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAGBDAACGQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACIAFAByAQAAPAAAAAAAAAAAAAAAJAAYAHIBAAAQAAAABAAAAAAAIEEAAAAAAQAIAK4BAAA=',
        length: 430,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEACQAQAAAAAAADwAAAABAAgAzAEAAA==',
        length: 460,
      }, // 3
    ],
  },
  stg5txt: {
    page: '/assets/th08/anm/stg5txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAIAAwAWAIAAAAAAAAiABQA2gIAADwAAAAAAAAA/wAAACQAGADaAgAAEAAAAAQAAAAAAIA/AACAPyEAHADKAwAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQAQgQAADwAAAAAAAAAAAAAAAEACAB+BAAA',
        length: 1150,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAIAAwAWAIAAAAAAAAiABQA2gIAADwAAAAAAAAA/wAAACQAGADaAgAAEAAAAAQAAAAAAIA/AACAPyEAHADKAwAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQAQgQAADwAAAAAAAAAAAAAAAEACAB+BAAA',
        length: 1150,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAHBDAACGQwAAAAAIAAwAAAAAAAAAAAAIAAwAWAIAAAAAAAAiABQA2gIAADwAAAAAAAAA/wAAACIAFADKAwAAPAAAAAAAAAAAAAAAJAAYAMoDAAAQAAAABAAAAAAAIEEAAAAAAQAIAAYEAAA=',
        length: 1030,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEAD0AQAAAAAAADwAAAABAAgAMAIAAA==',
        length: 560,
      }, // 3
    ],
  },
  stg6txt: {
    page: '/assets/th08/anm/stg6txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 48 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 256, y: 80, w: 256, h: 24 },
      { id: 6, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAIAAwAlAIAAAAAAAAiABQAFgMAADwAAAAAAAAA/wAAACQAGAAWAwAAEAAAAAQAAAAAAIA/AACAPyEAHAAGBAAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQAfgQAADwAAAAAAAAAAAAAAAEACAC6BAAA',
        length: 1210,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAIAAwAlAIAAAAAAAAiABQAFgMAADwAAAAAAAAA/wAAACQAGAAWAwAAEAAAAAQAAAAAAIA/AACAPyEAHAAGBAAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQAfgQAADwAAAAAAAAAAAAAAAEACAC6BAAA',
        length: 1210,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAHBDAACGQwAAAAAIAAwAAAAAAAAAAAAIAAwAlAIAAAAAAAAiABQAFgMAADwAAAAAAAAA/wAAACIAFAAGBAAAPAAAAAAAAAAAAAAAJAAYAAYEAAAQAAAABAAAAAAAIEEAAAAAAQAIAEIEAAA=',
        length: 1090,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEAD0AQAAAAAAADwAAAABAAgAMAIAAA==',
        length: 560,
      }, // 3
    ],
  },
  stg7txt: {
    page: '/assets/th08/anm/stg7txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 64 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 256, y: 80, w: 256, h: 24 },
      { id: 6, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAIAAwAlAIAAAAAAAAiABQAFgMAADwAAAAAAAAA/wAAACQAGAAWAwAAEAAAAAQAAAAAAIA/AACAPyEAHAAGBAAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQAfgQAADwAAAAAAAAAAAAAAAEACAC6BAAA',
        length: 1210,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAIAAwAlAIAAAAAAAAiABQAFgMAADwAAAAAAAAA/wAAACQAGAAWAwAAEAAAAAQAAAAAAIA/AACAPyEAHAAGBAAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQAfgQAADwAAAAAAAAAAAAAAAEACAC6BAAA',
        length: 1210,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAHBDAACGQwAAAAAIAAwAAAAAAAAAAAAIAAwAlAIAAAAAAAAiABQAFgMAADwAAAAAAAAA/wAAACIAFAAGBAAAPAAAAAAAAAAAAAAAJAAYAAYEAAAQAAAABAAAAAAAIEEAAAAAAQAIAEIEAAA=',
        length: 1090,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEAD0AQAAAAAAADwAAAABAAgAMAIAAA==',
        length: 560,
      }, // 3
    ],
  },
  stg8txt: {
    page: '/assets/th08/anm/stg8txt_t0.png',
    cells: [
      { id: 0, tex: 0, x: 0, y: 0, w: 256, h: 48 },
      { id: 1, tex: 0, x: 0, y: 48, w: 96, h: 32 },
      { id: 2, tex: 0, x: 256, y: 0, w: 256, h: 64 },
      { id: 3, tex: 0, x: 0, y: 80, w: 256, h: 24 },
      { id: 4, tex: 0, x: 0, y: 104, w: 256, h: 24 },
      { id: 5, tex: 0, x: 256, y: 80, w: 256, h: 24 },
      { id: 6, tex: 0, x: 0, y: 128, w: 128, h: 128 },
    ],
    scripts: [
      {
        id: 0,
        base64:
          'AwAMAAAAAAABAAAABgAUAAAAAAAAAABDAAAwQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 0
      {
        id: 1,
        base64:
          'AwAMAAAAAAAAAAAABgAUAAAAAAAAAGBDAABQQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACQAGACCAAAAEAAAAAQAAAAAAIA/AACAPyEAHAByAQAAeAAAAAAAAABQAAAAYAAAAJAAAAAiABQA6gEAADwAAAAAAAAAAAAAAAEACAAmAgAA',
        length: 550,
      }, // 1
      {
        id: 2,
        base64:
          'AwAMAAAAAAACAAAABgAUAAAAAAAAAGBDAACGQwAAAAAIAAwAAAAAAAAAAAAiABQAggAAADwAAAAAAAAA/wAAACIAFAByAQAAPAAAAAAAAAAAAAAAJAAYAHIBAAAQAAAABAAAAAAAIEEAAAAAAQAIAK4BAAA=',
        length: 430,
      }, // 2
      {
        id: 3,
        base64:
          'AwAMAAAAAAADAAAABgAUAAAAAAAAAAhEAADkQwAAAAAIAAwAAAAAAAAAAAAPABAAyAAAAP8AAAA8AAAAIAAcAMgAAAA8AAAABAAAAAAAkEMAAORDAAAAAA8AEACQAQAAAAAAADwAAAABAAgAzAEAAA==',
        length: 460,
      }, // 3
    ],
  },
};

/**
 * Which `stgNNtxt.anm` a campaign route shows. Same ecldata pairing as
 * `STGENM_BY_ROUTE`: 6A is `stg6txt` and the true finale 6B is `stg7txt`.
 */
export const STGTXT_BY_ROUTE: Readonly<Record<string, string>> = {
  stage1: 'stg1txt',
  stage2: 'stg2txt',
  stage3: 'stg3txt',
  stage4a: 'stg4atxt',
  stage4b: 'stg4btxt',
  stage5: 'stg5txt',
  stage6a: 'stg6txt',
  stage6b: 'stg7txt',
};

/** The raw VM words of one stage-text script, or null when the id is unused. */
export function stgtxtBytes(name: string, script: number): string | null {
  return TH08_STGTXT[name]?.scripts[script]?.base64 ?? null;
}

/** How long one stage-text script holds before deleting itself, in ANM ticks. */
export function stgtxtLength(name: string, script: number): number {
  return TH08_STGTXT[name]?.scripts[script]?.length ?? 0;
}

/** The atlas cell one stage-text sprite id draws. */
export function stgtxtCell(name: string, sprite: number): StgtxtCell | null {
  return TH08_STGTXT[name]?.cells.find((c) => c.id === sprite) ?? null;
}
