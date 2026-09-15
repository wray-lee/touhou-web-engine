/**
 * The recordings `thbgm.dat` holds, with the intro and loop points of each.
 *
 * Generated from `public/assets/th08/manifest.json` by
 * `tools/th08/gen-bgm-tracks.mjs`. Do not edit by hand: the loop points are
 * `thbgm.fmt` records, so the only way to change them is to re-extract. They
 * are the Web Audio `loopStart` (`introSeconds`) and `loopEnd`
 * (`loopSeconds`) of the sliced file, both measured from its start, which is
 * why `extract.mjs:163` adds the intro to the loop length.
 */

export interface BgmTrack {
  name: string;
  file: string;
  introSeconds: number;
  loopSeconds: number;
  totalSeconds: number;
}

export const TH08_BGM_TRACKS: BgmTrack[] = [
  {
    name: 'th08_01',
    file: '/assets/th08/bgm/th08_01.ogg',
    introSeconds: 5.6116,
    loopSeconds: 77.6936,
    totalSeconds: 83.3052,
  },
  {
    name: 'th08_00',
    file: '/assets/th08/bgm/th08_00.ogg',
    introSeconds: 3.9677,
    loopSeconds: 135.0835,
    totalSeconds: 139.0512,
  },
  {
    name: 'th08_03',
    file: '/assets/th08/bgm/th08_03.ogg',
    introSeconds: 15.7896,
    loopSeconds: 93.8086,
    totalSeconds: 109.59819999999999,
  },
  {
    name: 'th08_04',
    file: '/assets/th08/bgm/th08_04.ogg',
    introSeconds: 2.7617,
    loopSeconds: 152.4143,
    totalSeconds: 155.176,
  },
  {
    name: 'th08_05',
    file: '/assets/th08/bgm/th08_05.ogg',
    introSeconds: 25.5746,
    loopSeconds: 121.8228,
    totalSeconds: 147.3974,
  },
  {
    name: 'th08_06',
    file: '/assets/th08/bgm/th08_06.ogg',
    introSeconds: 15.5371,
    loopSeconds: 107.8596,
    totalSeconds: 123.3967,
  },
  {
    name: 'th08_07',
    file: '/assets/th08/bgm/th08_07.ogg',
    introSeconds: 26.9903,
    loopSeconds: 141.4792,
    totalSeconds: 168.46949999999998,
  },
  {
    name: 'th08_08',
    file: '/assets/th08/bgm/th08_08.ogg',
    introSeconds: 8.2823,
    loopSeconds: 103.577,
    totalSeconds: 111.85929999999999,
  },
  {
    name: 'th08_09',
    file: '/assets/th08/bgm/th08_09.ogg',
    introSeconds: 13.2513,
    loopSeconds: 177.2771,
    totalSeconds: 190.52839999999998,
  },
  {
    name: 'th08_10',
    file: '/assets/th08/bgm/th08_10.ogg',
    introSeconds: 10.2806,
    loopSeconds: 137.0151,
    totalSeconds: 147.29569999999998,
  },
  {
    name: 'th08_11',
    file: '/assets/th08/bgm/th08_11.ogg',
    introSeconds: 6.6801,
    loopSeconds: 181.1679,
    totalSeconds: 187.848,
  },
  {
    name: 'th08_12',
    file: '/assets/th08/bgm/th08_12.ogg',
    introSeconds: 3.028,
    loopSeconds: 123.2116,
    totalSeconds: 126.23960000000001,
  },
  {
    name: 'th08_13',
    file: '/assets/th08/bgm/th08_13.ogg',
    introSeconds: 9.4429,
    loopSeconds: 95.8975,
    totalSeconds: 105.34039999999999,
  },
  {
    name: 'th08_14',
    file: '/assets/th08/bgm/th08_14.ogg',
    introSeconds: 7.0052,
    loopSeconds: 185.1545,
    totalSeconds: 192.15970000000002,
  },
  {
    name: 'th08_13b',
    file: '/assets/th08/bgm/th08_13b.ogg',
    introSeconds: 70.0829,
    loopSeconds: 151.9971,
    totalSeconds: 222.07999999999998,
  },
  {
    name: 'th08_15',
    file: '/assets/th08/bgm/th08_15.ogg',
    introSeconds: 37.8587,
    loopSeconds: 217.8366,
    totalSeconds: 255.6953,
  },
  {
    name: 'th08_16',
    file: '/assets/th08/bgm/th08_16.ogg',
    introSeconds: 17.4991,
    loopSeconds: 107.2239,
    totalSeconds: 124.723,
  },
  {
    name: 'th08_17',
    file: '/assets/th08/bgm/th08_17.ogg',
    introSeconds: 19.4721,
    loopSeconds: 124.9212,
    totalSeconds: 144.3933,
  },
  {
    name: 'th08_18',
    file: '/assets/th08/bgm/th08_18.ogg',
    introSeconds: 4.9959,
    loopSeconds: 163.8153,
    totalSeconds: 168.8112,
  },
  {
    name: 'th08_19',
    file: '/assets/th08/bgm/th08_19.ogg',
    introSeconds: 7.567,
    loopSeconds: 184.3515,
    totalSeconds: 191.9185,
  },
  {
    name: 'th08_20',
    file: '/assets/th08/bgm/th08_20.ogg',
    introSeconds: 6.2636,
    loopSeconds: 85.1338,
    totalSeconds: 91.39739999999999,
  },
];
/**
 * Fallback songs per stage number, for a route whose `.std` is not in the
 * generated backdrop table. The values are those stages own `songPaths[0]`
 * and `songPaths[1]`, copied from the raw archives under
 * `public/assets/th08/raw/stage*.std` rather than guessed:
 *
 *     stage1 th08_00/th08_03    stage2 th08_04/th08_05
 *     stage3 th08_06/th08_07    stage4a th08_08/th08_09
 *     stage4b th08_08/th08_10   stage5 th08_11/th08_12
 *     stage6 th08_13/th08_14    stage7 th08_13/th08_15
 *     stage8 th08_18/th08_19
 *
 * 4A/4B share a stage number, and so do 6A/6B, so only one of each pair can be
 * held here; during a run the stage is keyed by route, so it reads the std and
 * never needs this. A slot 2 exists too - `th08_13b` on 6A and 6B - but only an
 * op 7 in that stages conversation can ask for it.
 */
export const STAGE_BGM: Record<number, { stage: string; boss: string }> = {
  1: { stage: 'th08_00', boss: 'th08_03' },
  2: { stage: 'th08_04', boss: 'th08_05' },
  3: { stage: 'th08_06', boss: 'th08_07' },
  4: { stage: 'th08_08', boss: 'th08_09' },
  5: { stage: 'th08_11', boss: 'th08_12' },
  6: { stage: 'th08_13', boss: 'th08_14' },
  7: { stage: 'th08_13', boss: 'th08_15' },
  8: { stage: 'th08_18', boss: 'th08_19' },
};

/**
 * The title screen song. Retail registers it into music slot 8 by name:
 * `g_Supervisor.LoadMusic(8, "bgm/th08_01.mid")` then
 * `g_Supervisor.PlayMusic(8, 0)` (`TitleScreen.cpp:877-878`, also at `:302`,
 * `:1044` and `:3868`). It is not the stage 1 song, even though the two are
 * neighbours in `thbgm.fmt`: `stage1.std` gives `th08_00`.
 */
export const TITLE_BGM = 'th08_01';

export function getBgmTrack(name: string): BgmTrack | undefined {
  return TH08_BGM_TRACKS.find((t) => t.name === name);
}
