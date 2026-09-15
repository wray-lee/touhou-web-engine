/**
 * Generated from public/assets/th08/manifest.json (stgNNenm.anm) by
 * tools/th08/anm/generate-stgenm.mjs. Do not edit by hand.
 *
 * Per-stage enemy/boss animation: the ANM script ids ECL ops 58..61 name
 * live here, not in `enemy.anm`. `pageOf[sprite]` is the atlas page key the
 * renderer already registers as `enemy:stage-<page>:<sprite>`.
 */

import type { EnemyAnimation } from './th08-enemy-anm';

/** One lifted `stgNNenm.anm` pack. */
export interface StgenmPack {
  /** Atlas page key per sprite id (`stg5enm_t1`), null when the id is unused. */
  readonly pageOf: readonly (string | null)[];
  /** Lifted sprite cycle per ANM script id. */
  readonly scripts: readonly EnemyAnimation[];
  /** Raw VM bytecode per ANM script id, null when the id is unused. */
  readonly bytes: readonly (string | null)[];
}

export const TH08_STGENM: Readonly<Record<string, StgenmPack>> = {
  stg1enm: {
    pageOf: [
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
      'stg1enm_t0',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 8, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
        ],
        total: 93,
      },
      {
        frames: [
          { sprite: 8, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 4, duration: 4 },
        ],
        total: 93,
      },
      {
        frames: [
          { sprite: 9, duration: 4 },
          { sprite: 10, duration: 4 },
        ],
        total: 8,
      },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAEAAAAAQAAAAMADAAIAAAAAgAAAAMADAAMAAAAAwAAAAMADAAQAAAABAAAAAMADAAUAAAAAAAAAAMADAAYAAAAAQAAAAMADAAcAAAAAgAAAAMADAAgAAAAAwAAAAMADAAkAAAABAAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALAAAAAEAAAADAAwAMAAAAAIAAAADAAwANAAAAAMAAAADAAwAOAAAAAQAAAADAAwAPAAAAAAAAAADAAwAQAAAAAEAAAADAAwARAAAAAIAAAADAAwASAAAAAMAAAADAAwATAAAAAQAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAUAAAADAAwABAAAAAYAAAADAAwACAAAAAcAAAADAAwADAAAAAgAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAFAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAHAAAAAwAMAAwAAAAIAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAgAAAADAAwABAAAAAcAAAADAAwACAAAAAYAAAADAAwADAAAAAUAAAAgABwADAAAACgAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABAAAAABAAAAAwAMABQAAAACAAAAAwAMABgAAAADAAAAAwAMABwAAAAEAAAAAwAMACAAAAAAAAAAAwAMACQAAAABAAAAAwAMACgAAAACAAAAAwAMACwAAAADAAAAAwAMADAAAAAEAAAAAwAMADQAAAAAAAAAIAAcADQAAAAoAAAABAAAAAAAAAAAAIBAAAAAAAMADAA4AAAAAQAAAAMADAA8AAAAAgAAAAMADABAAAAAAwAAAAMADABEAAAABAAAAAMADABIAAAAAAAAAAMADABMAAAAAQAAAAMADABQAAAAAgAAAAMADABUAAAAAwAAAAMADABYAAAABAAAAAQAEABcAAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAIAAAAAwAMAAQAAAAHAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAFAAAAIAAcAAwAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAAQAAAAAQAAAAMADAAUAAAAAgAAAAMADAAYAAAAAwAAAAMADAAcAAAABAAAAAMADAAgAAAAAAAAAAMADAAkAAAAAQAAAAMADAAoAAAAAgAAAAMADAAsAAAAAwAAAAMADAAwAAAABAAAAAMADAA0AAAAAAAAACAAHAA0AAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwAOAAAAAEAAAADAAwAPAAAAAIAAAADAAwAQAAAAAMAAAADAAwARAAAAAQAAAADAAwASAAAAAAAAAADAAwATAAAAAEAAAADAAwAUAAAAAIAAAADAAwAVAAAAAMAAAADAAwAWAAAAAQAAAAEABAAXAAAADwAAAAMAAAA', // 4
      'GAAMAAAAAAABAAAAAwAMAAAAAAAJAAAAAwAMAAQAAAAKAAAAIAAcAAQAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAAsAAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAVAAAACQAAAAEAAAA', // 5
    ],
  },
  stg2enm: {
    pageOf: [
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
      'stg2enm_t0',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 64,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 8, duration: 2 },
          { sprite: 9, duration: 2 },
          { sprite: 10, duration: 2 },
          { sprite: 11, duration: 2 },
        ],
        total: 8,
      },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAEAAAAAQAAAAMADAAIAAAAAgAAAAMADAAMAAAAAwAAAAMADAAQAAAAAAAAAAMADAAUAAAAAQAAAAMADAAYAAAAAgAAAAMADAAcAAAAAwAAAAMADAAgAAAAAAAAACAAHAAgAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAJAAAAAEAAAADAAwAKAAAAAIAAAADAAwALAAAAAMAAAADAAwAMAAAAAAAAAADAAwANAAAAAEAAAADAAwAOAAAAAIAAAADAAwAPAAAAAMAAAAEABAAQAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABAAAAABAAAAAwAMABQAAAACAAAAAwAMABgAAAADAAAAAwAMABwAAAAAAAAAAwAMACAAAAABAAAAAwAMACQAAAACAAAAAwAMACgAAAADAAAAAwAMACwAAAAAAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAAAQAAAAMADAA0AAAAAgAAAAMADAA4AAAAAwAAAAMADAA8AAAAAAAAAAMADABAAAAAAQAAAAMADABEAAAAAgAAAAMADABIAAAAAwAAAAQAEABMAAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAAQAAAAAQAAAAMADAAUAAAAAgAAAAMADAAYAAAAAwAAAAMADAAcAAAAAAAAAAMADAAgAAAAAQAAAAMADAAkAAAAAgAAAAMADAAoAAAAAwAAAAMADAAsAAAAAAAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAAAEAAAADAAwANAAAAAIAAAADAAwAOAAAAAMAAAADAAwAPAAAAAAAAAADAAwAQAAAAAEAAAADAAwARAAAAAIAAAADAAwASAAAAAMAAAAEABAATAAAADwAAAAMAAAA', // 4
      'GAAMAAAAAAABAAAAAwAMAAAAAAAIAAAAAwAMAAIAAAAJAAAAAwAMAAQAAAAKAAAAAwAMAAYAAAALAAAAIAAcAAYAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAAuAAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAVgAAADwAAAAGAAAA', // 5
    ],
  },
  stg3enm: {
    pageOf: [
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
      'stg3enm_t0',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 8, duration: 2 },
          { sprite: 9, duration: 2 },
          { sprite: 10, duration: 2 },
          { sprite: 11, duration: 2 },
        ],
        total: 8,
      },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAFAAAAAQAAAAMADAAKAAAAAgAAAAMADAAPAAAAAwAAAAMADAAUAAAAAAAAAAMADAAZAAAAAQAAAAMADAAeAAAAAgAAAAMADAAjAAAAAwAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAEAAAADAAwAMgAAAAIAAAADAAwANwAAAAMAAAADAAwAPAAAAAAAAAADAAwAQQAAAAEAAAADAAwARgAAAAIAAAADAAwASwAAAAMAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABAAAAABAAAAAwAMABQAAAACAAAAAwAMABgAAAADAAAAAwAMABwAAAAAAAAAAwAMACAAAAABAAAAAwAMACQAAAACAAAAAwAMACgAAAADAAAAAwAMACwAAAAAAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAAAQAAAAMADAA0AAAAAgAAAAMADAA4AAAAAwAAAAMADAA8AAAAAAAAAAMADABAAAAAAQAAAAMADABEAAAAAgAAAAMADABIAAAAAwAAAAQAEABMAAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAAQAAAAAQAAAAMADAAUAAAAAgAAAAMADAAYAAAAAwAAAAMADAAcAAAAAAAAAAMADAAgAAAAAQAAAAMADAAkAAAAAgAAAAMADAAoAAAAAwAAAAMADAAsAAAAAAAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAAAEAAAADAAwANAAAAAIAAAADAAwAOAAAAAMAAAADAAwAPAAAAAAAAAADAAwAQAAAAAEAAAADAAwARAAAAAIAAAADAAwASAAAAAMAAAAEABAATAAAADwAAAAMAAAA', // 4
      'GAAMAAAAAAABAAAAAwAMAAAAAAAIAAAAAwAMAAIAAAAJAAAAAwAMAAQAAAAKAAAAAwAMAAYAAAALAAAAIAAcAAYAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAAuAAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAVgAAADwAAAAGAAAA', // 5
    ],
  },
  stg4aenm: {
    pageOf: [
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
      'stg4aenm_t0',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 8, duration: 6 },
          { sprite: 10, duration: 4 },
          { sprite: 11, duration: 6 },
          { sprite: 9, duration: 6 },
        ],
        total: 22,
      },
      {
        frames: [
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 16, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 16, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 19, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 16, duration: 1 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 19, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 16, duration: 1 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 20, duration: 6 },
          { sprite: 22, duration: 4 },
          { sprite: 23, duration: 6 },
          { sprite: 21, duration: 6 },
        ],
        total: 22,
      },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAFAAAAAQAAAAMADAAKAAAAAgAAAAMADAAPAAAAAwAAAAMADAAUAAAAAAAAAAMADAAZAAAAAQAAAAMADAAeAAAAAgAAAAMADAAjAAAAAwAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAEAAAADAAwAMgAAAAIAAAADAAwANwAAAAMAAAADAAwAPAAAAAAAAAADAAwAQQAAAAEAAAADAAwARgAAAAIAAAADAAwASwAAAAMAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAADgAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABMAAAABAAAAAwAMABoAAAACAAAAAwAMACEAAAADAAAAAwAMACgAAAAAAAAAAwAMAC8AAAABAAAAAwAMADYAAAACAAAAAwAMAD0AAAADAAAAAwAMAEQAAAAAAAAAIAAcAEQAAAA4AAAABAAAAAAAAAAAAIBAAAAAAAMADABLAAAAAQAAAAMADABSAAAAAgAAAAMADABZAAAAAwAAAAMADABgAAAAAAAAAAMADABnAAAAAQAAAAMADABuAAAAAgAAAAMADAB1AAAAAwAAAAQAEAB8AAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAA4AAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAATAAAAAQAAAAMADAAaAAAAAgAAAAMADAAhAAAAAwAAAAMADAAoAAAAAAAAAAMADAAvAAAAAQAAAAMADAA2AAAAAgAAAAMADAA9AAAAAwAAAAMADABEAAAAAAAAACAAHABEAAAAOAAAAAQAAAAAAAAAAACAQAAAAAADAAwASwAAAAEAAAADAAwAUgAAAAIAAAADAAwAWQAAAAMAAAADAAwAYAAAAAAAAAADAAwAZwAAAAEAAAADAAwAbgAAAAIAAAADAAwAdQAAAAMAAAAEABAAfAAAADwAAAAMAAAA', // 4
      'AwAMAAAAAAAIAAAAAwAMAAYAAAAKAAAAAwAMAAoAAAALAAAAAwAMABAAAAAJAAAABAAQABQAAAAAAAAAAAAAAA==', // 5
      'GAAMAAAAAAABAAAAUgAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAADAAAAAMADAAFAAAADQAAAAMADAAKAAAADgAAAAMADAAPAAAADwAAAAMADAAUAAAADAAAAAMADAAZAAAADQAAAAMADAAeAAAADgAAAAMADAAjAAAADwAAAAMADAAoAAAADAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAA0AAAADAAwAMgAAAA4AAAADAAwANwAAAA8AAAADAAwAPAAAAAwAAAADAAwAQQAAAA0AAAADAAwARgAAAA4AAAADAAwASwAAAA8AAAAEABAAUAAAABgAAAAAAAAA', // 6
      'UgAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAABAAAAADAAwABAAAABEAAAADAAwACAAAABIAAAADAAwADAAAABMAAAACAAgADAAAAA==', // 7
      'UgAMAAAAAAABAAAAAwAMAAAAAAAQAAAAAwAMAAQAAAARAAAAAwAMAAgAAAASAAAAAwAMAAwAAAATAAAAAgAIAAwAAAA=', // 8
      'UgAMAAAAAAABAAAAGAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAABMAAAADAAwABAAAABIAAAADAAwACAAAABEAAAADAAwADAAAABAAAAAgABwADAAAADgAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAMAAAAAwAMABMAAAANAAAAAwAMABoAAAAOAAAAAwAMACEAAAAPAAAAAwAMACgAAAAMAAAAAwAMAC8AAAANAAAAAwAMADYAAAAOAAAAAwAMAD0AAAAPAAAAAwAMAEQAAAAMAAAAIAAcAEQAAAA4AAAABAAAAAAAAAAAAIBAAAAAAAMADABLAAAADQAAAAMADABSAAAADgAAAAMADABZAAAADwAAAAMADABgAAAADAAAAAMADABnAAAADQAAAAMADABuAAAADgAAAAMADAB1AAAADwAAAAQAEAB8AAAAUAAAAAwAAAA=', // 9
      'UgAMAAAAAAABAAAAGAAMAAAAAAABAAAAAwAMAAAAAAATAAAAAwAMAAQAAAASAAAAAwAMAAgAAAARAAAAAwAMAAwAAAAQAAAAIAAcAAwAAAA4AAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAADAAAAAMADAATAAAADQAAAAMADAAaAAAADgAAAAMADAAhAAAADwAAAAMADAAoAAAADAAAAAMADAAvAAAADQAAAAMADAA2AAAADgAAAAMADAA9AAAADwAAAAMADABEAAAADAAAACAAHABEAAAAOAAAAAQAAAAAAAAAAACAQAAAAAADAAwASwAAAA0AAAADAAwAUgAAAA4AAAADAAwAWQAAAA8AAAADAAwAYAAAAAwAAAADAAwAZwAAAA0AAAADAAwAbgAAAA4AAAADAAwAdQAAAA8AAAAEABAAfAAAAEgAAAAMAAAA', // 10
      'UgAMAAAAAAABAAAAAwAMAAAAAAAUAAAAAwAMAAYAAAAWAAAAAwAMAAoAAAAXAAAAAwAMABAAAAAVAAAABAAQABQAAAAMAAAAAAAAAA==', // 11
    ],
  },
  stg4benm: {
    pageOf: [
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t0',
      'stg4benm_t1',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
        ],
        total: 125,
      },
      { frames: [{ sprite: 8, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAFAAAAAQAAAAMADAAKAAAAAgAAAAMADAAPAAAAAwAAAAMADAAUAAAAAAAAAAMADAAZAAAAAQAAAAMADAAeAAAAAgAAAAMADAAjAAAAAwAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAEAAAADAAwAMgAAAAIAAAADAAwANwAAAAMAAAADAAwAPAAAAAAAAAADAAwAQQAAAAEAAAADAAwARgAAAAIAAAADAAwASwAAAAMAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAADgAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABMAAAABAAAAAwAMABoAAAACAAAAAwAMACEAAAADAAAAAwAMACgAAAAAAAAAAwAMAC8AAAABAAAAAwAMADYAAAACAAAAAwAMAD0AAAADAAAAAwAMAEQAAAAAAAAAIAAcAEQAAAA4AAAABAAAAAAAAAAAAIBAAAAAAAMADABLAAAAAQAAAAMADABSAAAAAgAAAAMADABZAAAAAwAAAAMADABgAAAAAAAAAAMADABnAAAAAQAAAAMADABuAAAAAgAAAAMADAB1AAAAAwAAAAQAEAB8AAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAA4AAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAATAAAAAQAAAAMADAAaAAAAAgAAAAMADAAhAAAAAwAAAAMADAAoAAAAAAAAAAMADAAvAAAAAQAAAAMADAA2AAAAAgAAAAMADAA9AAAAAwAAAAMADABEAAAAAAAAACAAHABEAAAAOAAAAAQAAAAAAAAAAACAQAAAAAADAAwASwAAAAEAAAADAAwAUgAAAAIAAAADAAwAWQAAAAMAAAADAAwAYAAAAAAAAAADAAwAZwAAAAEAAAADAAwAbgAAAAIAAAADAAwAdQAAAAMAAAAEABAAfAAAADwAAAAMAAAA', // 4
      'AwAMAAAAAAAIAAAAIAAcAAAAAAA4AAAABAAAAAAAAAAAAIDAAAAAACAAHAA4AAAAOAAAAAQAAAAAAAAAAACAQAAAAAAEABAAcAAAAAwAAAAAAAAA', // 5
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAP8AAAD/AAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzczMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzczMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAAAAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 6
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAOAAAADgAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzcxMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzcxMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAADAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 7
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAMAAAADAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAj8L1PCQAGAAAAAAAPAAAAAEAAAAzMxNAj8L1PCQAGAA8AAAAPAAAAAQAAAAzMxNAAACAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 8
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAIAAAACAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAACtejPCQAGAAAAAAAPAAAAAEAAAAzMxNACtejPCQAGAA8AAAAPAAAAAQAAAAzMxNAAAAAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 9
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAP8AAAD/AAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzczMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzczMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAABAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 10
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAOAAAADgAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzcxMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzcxMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAAAgQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 11
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAMAAAADAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAj8L1PCQAGAAAAAAAPAAAAAEAAAAzMxNAj8L1PCQAGAA8AAAAPAAAAAQAAAAzMxNAAAAAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 12
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAIAAAACAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAACtejPCQAGAAAAAAAPAAAAAEAAAAzMxNACtejPCQAGAA8AAAAPAAAAAQAAAAzMxNAAADAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUADYBAAA8AAAAAAAAAAAAAAABAAgAcgEAAA==', // 13
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAP8AAAD/AAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzczMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzczMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAABAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAA4BAAA8AAAAAAAAAAAAAAABAAgASgEAAA==', // 14
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAOAAAADgAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzcxMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzcxMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAAAgQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAA4BAAA8AAAAAAAAAAAAAAABAAgASgEAAA==', // 15
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAMAAAADAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAj8L1PCQAGAAAAAAAPAAAAAEAAAAzMxNAj8L1PCQAGAA8AAAAPAAAAAQAAAAzMxNAAAAAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAA4BAAA8AAAAAAAAAAAAAAABAAgASgEAAA==', // 16
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAIAAAACAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAACtejPCQAGAAAAAAAPAAAAAEAAAAzMxNACtejPCQAGAA8AAAAPAAAAAQAAAAzMxNAAADAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAA4BAAA8AAAAAAAAAAAAAAABAAgASgEAAA==', // 17
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAP8AAAD/AAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzczMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzczMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAABAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAPAAAAA8AAAAAAAAAAAAAAABAAgALAEAAA==', // 18
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAOAAAADgAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzcxMPSQAGAAAAAAAPAAAAAEAAAAzMxNAzcxMPSQAGAA8AAAAPAAAAAQAAAAzMxNAAAAgQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAPAAAAA8AAAAAAAAAAAAAAABAAgALAEAAA==', // 19
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAMAAAADAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAj8L1PCQAGAAAAAAAPAAAAAEAAAAzMxNAj8L1PCQAGAA8AAAAPAAAAAQAAAAzMxNAAAAAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAPAAAAA8AAAAAAAAAAAAAAABAAgALAEAAA==', // 20
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAIAAAACAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAACtejPCQAGAAAAAAAPAAAAAEAAAAzMxNACtejPCQAGAA8AAAAPAAAAAQAAAAzMxNAAADAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAPAAAAA8AAAAAAAAAAAAAAABAAgALAEAAA==', // 21
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAP8AAAD/AAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzczMPSQAGAAAAAAAPAAAAAEAAACamXlAzczMPSQAGAA8AAAAPAAAAAQAAACamXlAAABAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAIIAAAAoAAAAAAAAAAAAAAABAAgAqgAAAA==', // 22
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAOAAAADgAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAzcxMPSQAGAAAAAAAPAAAAAEAAACamXlAzcxMPSQAGAA8AAAAPAAAAAQAAACamXlAAAAgQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAIIAAAAoAAAAAAAAAAAAAAABAAgAqgAAAA==', // 23
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAMAAAADAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAAj8L1PCQAGAAAAAAAPAAAAAEAAACamXlAj8L1PCQAGAA8AAAAPAAAAAQAAACamXlAAAAAQB4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAIIAAAAoAAAAAAAAAAAAAAABAAgAqgAAAA==', // 24
      'AwAMAAAAAAAMAAAAUgAMAAAAAAABAAAACQAUAAAAAAD/AAAA/wAAAP8AAAAhABwAAAAAADwAAAAAAAAA/wAAAIAAAACAAAAACAAMAAAAAABgAAAAGQAMAAAAAAABAAAABwAQAAAAAAAAAAAACtejPCQAGAAAAAAAPAAAAAEAAACamXlACtejPCQAGAA8AAAAPAAAAAQAAACamXlAAADAPx4ADAA8AAAAAQAAACIAFABaAAAAHgAAAAAAAAD/AAAAIgAUAIIAAAAoAAAAAAAAAAAAAAABAAgAqgAAAA==', // 25
    ],
  },
  stg5enm: {
    pageOf: [
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t0',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
      'stg5enm_t1',
    ],
    scripts: [
      { frames: [{ sprite: 0, duration: 4 }], total: 4 },
      {
        frames: [
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 3, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 0, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 3, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 0, duration: 4 },
        ],
        total: 16,
      },
      { frames: [{ sprite: 4, duration: 4 }], total: 4 },
      {
        frames: [
          { sprite: 5, duration: 5 },
          { sprite: 6, duration: 5 },
          { sprite: 7, duration: 5 },
          { sprite: 8, duration: 5 },
          { sprite: 5, duration: 5 },
          { sprite: 6, duration: 5 },
          { sprite: 7, duration: 5 },
          { sprite: 8, duration: 5 },
          { sprite: 5, duration: 5 },
          { sprite: 6, duration: 5 },
          { sprite: 7, duration: 5 },
          { sprite: 8, duration: 5 },
          { sprite: 5, duration: 5 },
          { sprite: 6, duration: 5 },
          { sprite: 7, duration: 5 },
          { sprite: 8, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 9, duration: 4 },
          { sprite: 10, duration: 4 },
          { sprite: 11, duration: 4 },
          { sprite: 12, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 9, duration: 4 },
          { sprite: 10, duration: 4 },
          { sprite: 11, duration: 4 },
          { sprite: 12, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 12, duration: 4 },
          { sprite: 11, duration: 4 },
          { sprite: 10, duration: 4 },
          { sprite: 9, duration: 1 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 12, duration: 4 },
          { sprite: 11, duration: 4 },
          { sprite: 10, duration: 4 },
          { sprite: 9, duration: 1 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
          { sprite: 8, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 13, duration: 2 },
          { sprite: 14, duration: 2 },
          { sprite: 15, duration: 2 },
          { sprite: 16, duration: 2 },
        ],
        total: 8,
      },
      {
        frames: [
          { sprite: 17, duration: 5 },
          { sprite: 18, duration: 5 },
          { sprite: 19, duration: 5 },
          { sprite: 20, duration: 5 },
          { sprite: 17, duration: 5 },
          { sprite: 18, duration: 5 },
          { sprite: 19, duration: 5 },
          { sprite: 20, duration: 5 },
          { sprite: 17, duration: 5 },
          { sprite: 18, duration: 5 },
          { sprite: 19, duration: 5 },
          { sprite: 20, duration: 5 },
          { sprite: 17, duration: 5 },
          { sprite: 18, duration: 5 },
          { sprite: 19, duration: 5 },
          { sprite: 20, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 21, duration: 4 },
          { sprite: 22, duration: 4 },
          { sprite: 23, duration: 4 },
          { sprite: 24, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 21, duration: 4 },
          { sprite: 22, duration: 4 },
          { sprite: 23, duration: 4 },
          { sprite: 24, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 24, duration: 4 },
          { sprite: 23, duration: 4 },
          { sprite: 22, duration: 4 },
          { sprite: 21, duration: 1 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 24, duration: 4 },
          { sprite: 23, duration: 4 },
          { sprite: 22, duration: 4 },
          { sprite: 21, duration: 1 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 25, duration: 2 },
          { sprite: 26, duration: 2 },
          { sprite: 27, duration: 2 },
          { sprite: 28, duration: 2 },
        ],
        total: 8,
      },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAAwAMAAAAAAAAAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAUAAAABgAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAAAAAADAAwABAAAAAEAAAADAAwACAAAAAIAAAADAAwADAAAAAMAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAAAAAAAwAMAAQAAAABAAAAAwAMAAgAAAACAAAAAwAMAAwAAAADAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAMAAAADAAwABAAAAAIAAAADAAwACAAAAAEAAAADAAwADAAAAAAAAAAgABwADAAAACgAAAAEAAAAAAAAAAAAgMAAAAAAIAAcADQAAAAoAAAABAAAAAAAAAAAAIBAAAAAAAQAEABcAAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAADAAAAAwAMAAQAAAACAAAAAwAMAAgAAAABAAAAAwAMAAwAAAAAAAAAIAAcAAwAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAA0AAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAXAAAADwAAAAMAAAA', // 4
      'AwAMAAAAAAAEAAAAUgAMAAAAAAABAAAABwAQAAAAAAAAAABAAAAAQAgADAAAAAAAAAAAACQAGAAAAAAAMgAAAAQAAAAAAIA/AACAPyIAFAAAAAAAMgAAAAAAAAD/AAAAIgAUADIAAAAKAAAAAAAAAAAAAAAUAAgAPAAAAA==', // 5
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAABQAAAAMADAAFAAAABgAAAAMADAAKAAAABwAAAAMADAAPAAAACAAAAAMADAAUAAAABQAAAAMADAAZAAAABgAAAAMADAAeAAAABwAAAAMADAAjAAAACAAAAAMADAAoAAAABQAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAYAAAADAAwAMgAAAAcAAAADAAwANwAAAAgAAAADAAwAPAAAAAUAAAADAAwAQQAAAAYAAAADAAwARgAAAAcAAAADAAwASwAAAAgAAAAEABAAUAAAAAwAAAAAAAAA', // 6
      'CgAIAAAAAAADAAwAAAAAAAkAAAADAAwABAAAAAoAAAADAAwACAAAAAsAAAADAAwADAAAAAwAAAACAAgADAAAAA==', // 7
      'AwAMAAAAAAAJAAAAAwAMAAQAAAAKAAAAAwAMAAgAAAALAAAAAwAMAAwAAAAMAAAAAgAIAAwAAAA=', // 8
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAwAAAADAAwABAAAAAsAAAADAAwACAAAAAoAAAADAAwADAAAAAkAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAFAAAAAwAMABAAAAAGAAAAAwAMABQAAAAHAAAAAwAMABgAAAAIAAAAAwAMABwAAAAFAAAAAwAMACAAAAAGAAAAAwAMACQAAAAHAAAAAwAMACgAAAAIAAAAAwAMACwAAAAFAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAABgAAAAMADAA0AAAABwAAAAMADAA4AAAACAAAAAMADAA8AAAABQAAAAMADABAAAAABgAAAAMADABEAAAABwAAAAMADABIAAAACAAAAAQAEABMAAAARAAAAAwAAAA=', // 9
      'GAAMAAAAAAABAAAAAwAMAAAAAAAMAAAAAwAMAAQAAAALAAAAAwAMAAgAAAAKAAAAAwAMAAwAAAAJAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAABQAAAAMADAAQAAAABgAAAAMADAAUAAAABwAAAAMADAAYAAAACAAAAAMADAAcAAAABQAAAAMADAAgAAAABgAAAAMADAAkAAAABwAAAAMADAAoAAAACAAAAAMADAAsAAAABQAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAAAYAAAADAAwANAAAAAcAAAADAAwAOAAAAAgAAAADAAwAPAAAAAUAAAADAAwAQAAAAAYAAAADAAwARAAAAAcAAAADAAwASAAAAAgAAAAEABAATAAAADwAAAAMAAAA', // 10
      'GAAMAAAAAAABAAAAAwAMAAAAAAANAAAAAwAMAAIAAAAOAAAAAwAMAAQAAAAPAAAAAwAMAAYAAAAQAAAAIAAcAAYAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAAuAAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAVgAAADwAAAAGAAAA', // 11
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAEQAAAAMADAAFAAAAEgAAAAMADAAKAAAAEwAAAAMADAAPAAAAFAAAAAMADAAUAAAAEQAAAAMADAAZAAAAEgAAAAMADAAeAAAAEwAAAAMADAAjAAAAFAAAAAMADAAoAAAAEQAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAABIAAAADAAwAMgAAABMAAAADAAwANwAAABQAAAADAAwAPAAAABEAAAADAAwAQQAAABIAAAADAAwARgAAABMAAAADAAwASwAAABQAAAAEABAAUAAAAAwAAAAAAAAA', // 12
      'CgAIAAAAAAADAAwAAAAAABUAAAADAAwABAAAABYAAAADAAwACAAAABcAAAADAAwADAAAABgAAAACAAgADAAAAA==', // 13
      'AwAMAAAAAAAVAAAAAwAMAAQAAAAWAAAAAwAMAAgAAAAXAAAAAwAMAAwAAAAYAAAAAgAIAAwAAAA=', // 14
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAABgAAAADAAwABAAAABcAAAADAAwACAAAABYAAAADAAwADAAAABUAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAARAAAAAwAMABAAAAASAAAAAwAMABQAAAATAAAAAwAMABgAAAAUAAAAAwAMABwAAAARAAAAAwAMACAAAAASAAAAAwAMACQAAAATAAAAAwAMACgAAAAUAAAAAwAMACwAAAARAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAAEgAAAAMADAA0AAAAEwAAAAMADAA4AAAAFAAAAAMADAA8AAAAEQAAAAMADABAAAAAEgAAAAMADABEAAAAEwAAAAMADABIAAAAFAAAAAQAEABMAAAARAAAAAwAAAA=', // 15
      'GAAMAAAAAAABAAAAAwAMAAAAAAAYAAAAAwAMAAQAAAAXAAAAAwAMAAgAAAAWAAAAAwAMAAwAAAAVAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAEQAAAAMADAAQAAAAEgAAAAMADAAUAAAAEwAAAAMADAAYAAAAFAAAAAMADAAcAAAAEQAAAAMADAAgAAAAEgAAAAMADAAkAAAAEwAAAAMADAAoAAAAFAAAAAMADAAsAAAAEQAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAABIAAAADAAwANAAAABMAAAADAAwAOAAAABQAAAADAAwAPAAAABEAAAADAAwAQAAAABIAAAADAAwARAAAABMAAAADAAwASAAAABQAAAAEABAATAAAADwAAAAMAAAA', // 16
      'GAAMAAAAAAABAAAAAwAMAAAAAAAZAAAAAwAMAAIAAAAaAAAAAwAMAAQAAAAbAAAAAwAMAAYAAAAcAAAAIAAcAAYAAAAoAAAABAAAAAAAAAAAAIDAAAAAACAAHAAuAAAAKAAAAAQAAAAAAAAAAACAQAAAAAAEABAAVgAAADwAAAAGAAAA', // 17
    ],
  },
  stg6enm: {
    pageOf: [
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
      'stg6enm_t0',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 8, duration: 2 },
          { sprite: 9, duration: 2 },
          { sprite: 10, duration: 2 },
          { sprite: 11, duration: 2 },
        ],
        total: 8,
      },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAFAAAAAQAAAAMADAAKAAAAAgAAAAMADAAPAAAAAwAAAAMADAAUAAAAAAAAAAMADAAZAAAAAQAAAAMADAAeAAAAAgAAAAMADAAjAAAAAwAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAEAAAADAAwAMgAAAAIAAAADAAwANwAAAAMAAAADAAwAPAAAAAAAAAADAAwAQQAAAAEAAAADAAwARgAAAAIAAAADAAwASwAAAAMAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABAAAAABAAAAAwAMABQAAAACAAAAAwAMABgAAAADAAAAAwAMABwAAAAAAAAAAwAMACAAAAABAAAAAwAMACQAAAACAAAAAwAMACgAAAADAAAAAwAMACwAAAAAAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAAAQAAAAMADAA0AAAAAgAAAAMADAA4AAAAAwAAAAMADAA8AAAAAAAAAAMADABAAAAAAQAAAAMADABEAAAAAgAAAAMADABIAAAAAwAAAAQAEABMAAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAAQAAAAAQAAAAMADAAUAAAAAgAAAAMADAAYAAAAAwAAAAMADAAcAAAAAAAAAAMADAAgAAAAAQAAAAMADAAkAAAAAgAAAAMADAAoAAAAAwAAAAMADAAsAAAAAAAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAAAEAAAADAAwANAAAAAIAAAADAAwAOAAAAAMAAAADAAwAPAAAAAAAAAADAAwAQAAAAAEAAAADAAwARAAAAAIAAAADAAwASAAAAAMAAAAEABAATAAAADwAAAAMAAAA', // 4
      'GAAMAAAAAAABAAAAAwAMAAAAAAAIAAAAAwAMAAIAAAAJAAAAAwAMAAQAAAAKAAAAAwAMAAYAAAALAAAABAAQAC4AAAA8AAAABgAAAA==', // 5
      'GAAMAAAAAAABAAAAAwAMAAAAAAAMAAAABwAQAAAAAAAAAKBBAAAAAAgADAAAAAAAAAAAACIAFAA8AAAADwAAAAQAAAD/AAAAJAAYADwAAAAPAAAABAAAAAAAgD8AAIA/IAAcADwAAAA8AAAABAAAAAAAAAAAAIDAAAAAACAAHAB4AAAAPAAAAAQAAAAAAAAAAACAQAAAAAAEABAAtAAAAGAAAAA8AAAA', // 6
    ],
  },
  stg7enm: {
    pageOf: [
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t0',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
      'stg7enm_t1',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
          { sprite: 0, duration: 4 },
          { sprite: 1, duration: 4 },
          { sprite: 2, duration: 4 },
          { sprite: 3, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 8, duration: 2 },
          { sprite: 9, duration: 2 },
          { sprite: 10, duration: 2 },
          { sprite: 11, duration: 2 },
        ],
        total: 8,
      },
      { frames: [{ sprite: 12, duration: 4 }], total: 4 },
      {
        frames: [
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 16, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 16, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 16, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 16, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 20, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 20, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 17, duration: 1 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 20, duration: 4 },
          { sprite: 19, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 17, duration: 1 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
          { sprite: 13, duration: 4 },
          { sprite: 14, duration: 4 },
          { sprite: 15, duration: 4 },
          { sprite: 16, duration: 4 },
        ],
        total: 77,
      },
      {
        frames: [
          { sprite: 21, duration: 2 },
          { sprite: 22, duration: 2 },
          { sprite: 23, duration: 2 },
          { sprite: 24, duration: 2 },
        ],
        total: 8,
      },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAFAAAAAQAAAAMADAAKAAAAAgAAAAMADAAPAAAAAwAAAAMADAAUAAAAAAAAAAMADAAZAAAAAQAAAAMADAAeAAAAAgAAAAMADAAjAAAAAwAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAEAAAADAAwAMgAAAAIAAAADAAwANwAAAAMAAAADAAwAPAAAAAAAAAADAAwAQQAAAAEAAAADAAwARgAAAAIAAAADAAwASwAAAAMAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABAAAAABAAAAAwAMABQAAAACAAAAAwAMABgAAAADAAAAAwAMABwAAAAAAAAAAwAMACAAAAABAAAAAwAMACQAAAACAAAAAwAMACgAAAADAAAAAwAMACwAAAAAAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAAAQAAAAMADAA0AAAAAgAAAAMADAA4AAAAAwAAAAMADAA8AAAAAAAAAAMADABAAAAAAQAAAAMADABEAAAAAgAAAAMADABIAAAAAwAAAAQAEABMAAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAAQAAAAAQAAAAMADAAUAAAAAgAAAAMADAAYAAAAAwAAAAMADAAcAAAAAAAAAAMADAAgAAAAAQAAAAMADAAkAAAAAgAAAAMADAAoAAAAAwAAAAMADAAsAAAAAAAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAAAEAAAADAAwANAAAAAIAAAADAAwAOAAAAAMAAAADAAwAPAAAAAAAAAADAAwAQAAAAAEAAAADAAwARAAAAAIAAAADAAwASAAAAAMAAAAEABAATAAAADwAAAAMAAAA', // 4
      'GAAMAAAAAAABAAAAAwAMAAAAAAAIAAAAAwAMAAIAAAAJAAAAAwAMAAQAAAAKAAAAAwAMAAYAAAALAAAABAAQAC4AAAA8AAAABgAAAA==', // 5
      'GAAMAAAAAAABAAAAAwAMAAAAAAAMAAAABwAQAAAAAAAAAKBBAAAAAAgADAAAAAAAAAAAACIAFAA8AAAAGQAAAAQAAAD/AAAAJAAYADwAAAAZAAAABAAAAAAAgD8AAIA/IAAcADwAAAA8AAAABAAAAAAAAAAAAIDAAAAAACAAHAB4AAAAPAAAAAQAAAAAAAAAAACAQAAAAAAEABAAtAAAAGAAAAA8AAAA', // 6
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAADQAAAAMADAAFAAAADgAAAAMADAAKAAAADwAAAAMADAAPAAAAEAAAAAMADAAUAAAADQAAAAMADAAZAAAADgAAAAMADAAeAAAADwAAAAMADAAjAAAAEAAAAAMADAAoAAAADQAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAA4AAAADAAwAMgAAAA8AAAADAAwANwAAABAAAAADAAwAPAAAAA0AAAADAAwAQQAAAA4AAAADAAwARgAAAA8AAAADAAwASwAAABAAAAAEABAAUAAAAAwAAAAAAAAA', // 7
      'CgAIAAAAAAADAAwAAAAAABEAAAADAAwABAAAABIAAAADAAwACAAAABMAAAADAAwADAAAABQAAAACAAgADAAAAA==', // 8
      'AwAMAAAAAAARAAAAAwAMAAQAAAASAAAAAwAMAAgAAAATAAAAAwAMAAwAAAAUAAAAAgAIAAwAAAA=', // 9
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAABQAAAADAAwABAAAABMAAAADAAwACAAAABIAAAADAAwADAAAABEAAAAgABwADAAAACAAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAANAAAAAwAMABAAAAAOAAAAAwAMABQAAAAPAAAAAwAMABgAAAAQAAAAAwAMABwAAAANAAAAAwAMACAAAAAOAAAAAwAMACQAAAAPAAAAAwAMACgAAAAQAAAAAwAMACwAAAANAAAAIAAcACwAAAAgAAAABAAAAAAAAAAAAIBAAAAAAAMADAAwAAAADgAAAAMADAA0AAAADwAAAAMADAA4AAAAEAAAAAMADAA8AAAADQAAAAMADABAAAAADgAAAAMADABEAAAADwAAAAMADABIAAAAEAAAAAQAEABMAAAARAAAAAwAAAA=', // 10
      'GAAMAAAAAAABAAAAAwAMAAAAAAAUAAAAAwAMAAQAAAATAAAAAwAMAAgAAAASAAAAAwAMAAwAAAARAAAAIAAcAAwAAAAgAAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAADQAAAAMADAAQAAAADgAAAAMADAAUAAAADwAAAAMADAAYAAAAEAAAAAMADAAcAAAADQAAAAMADAAgAAAADgAAAAMADAAkAAAADwAAAAMADAAoAAAAEAAAAAMADAAsAAAADQAAACAAHAAsAAAAIAAAAAQAAAAAAAAAAACAQAAAAAADAAwAMAAAAA4AAAADAAwANAAAAA8AAAADAAwAOAAAABAAAAADAAwAPAAAAA0AAAADAAwAQAAAAA4AAAADAAwARAAAAA8AAAADAAwASAAAABAAAAAEABAATAAAADwAAAAMAAAA', // 11
      'GAAMAAAAAAABAAAAAwAMAAAAAAAVAAAAAwAMAAIAAAAWAAAAAwAMAAQAAAAXAAAAAwAMAAYAAAAYAAAABAAQAC4AAAA8AAAABgAAAA==', // 12
    ],
  },
  stg8enm: {
    pageOf: [
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t0',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t1',
      'stg8enm_t2',
    ],
    scripts: [
      {
        frames: [
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
          { sprite: 0, duration: 5 },
          { sprite: 1, duration: 5 },
          { sprite: 2, duration: 5 },
          { sprite: 3, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 4, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 7, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 7, duration: 4 },
          { sprite: 6, duration: 4 },
          { sprite: 5, duration: 4 },
          { sprite: 4, duration: 1 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
          { sprite: 0, duration: 7 },
          { sprite: 1, duration: 7 },
          { sprite: 2, duration: 7 },
          { sprite: 3, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 8, duration: 6 },
          { sprite: 9, duration: 4 },
          { sprite: 10, duration: 6 },
          { sprite: 11, duration: 6 },
        ],
        total: 22,
      },
      {
        frames: [
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
          { sprite: 12, duration: 5 },
          { sprite: 13, duration: 5 },
          { sprite: 14, duration: 5 },
          { sprite: 15, duration: 5 },
        ],
        total: 80,
      },
      {
        frames: [
          { sprite: 16, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 16, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 19, duration: 4 },
        ],
        total: 16,
      },
      {
        frames: [
          { sprite: 19, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 16, duration: 1 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 19, duration: 4 },
          { sprite: 18, duration: 4 },
          { sprite: 17, duration: 4 },
          { sprite: 16, duration: 1 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
          { sprite: 12, duration: 7 },
          { sprite: 13, duration: 7 },
          { sprite: 14, duration: 7 },
          { sprite: 15, duration: 7 },
        ],
        total: 125,
      },
      {
        frames: [
          { sprite: 20, duration: 6 },
          { sprite: 21, duration: 4 },
          { sprite: 22, duration: 6 },
          { sprite: 23, duration: 6 },
        ],
        total: 22,
      },
      {
        frames: [
          { sprite: 20, duration: 6 },
          { sprite: 21, duration: 4 },
          { sprite: 22, duration: 6 },
          { sprite: 23, duration: 6 },
        ],
        total: 22,
      },
      { frames: [{ sprite: 24, duration: 4 }], total: 4 },
      { frames: [{ sprite: 24, duration: 4 }], total: 4 },
      { frames: [{ sprite: 24, duration: 4 }], total: 4 },
      { frames: [{ sprite: 24, duration: 4 }], total: 4 },
      { frames: [{ sprite: 24, duration: 4 }], total: 4 },
      { frames: [{ sprite: 24, duration: 4 }], total: 4 },
    ],
    bytes: [
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAAAAAAAAMADAAFAAAAAQAAAAMADAAKAAAAAgAAAAMADAAPAAAAAwAAAAMADAAUAAAAAAAAAAMADAAZAAAAAQAAAAMADAAeAAAAAgAAAAMADAAjAAAAAwAAAAMADAAoAAAAAAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAAEAAAADAAwAMgAAAAIAAAADAAwANwAAAAMAAAADAAwAPAAAAAAAAAADAAwAQQAAAAEAAAADAAwARgAAAAIAAAADAAwASwAAAAMAAAAEABAAUAAAAAwAAAAAAAAA', // 0
      'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwABAAAAAUAAAADAAwACAAAAAYAAAADAAwADAAAAAcAAAACAAgADAAAAA==', // 1
      'AwAMAAAAAAAEAAAAAwAMAAQAAAAFAAAAAwAMAAgAAAAGAAAAAwAMAAwAAAAHAAAAAgAIAAwAAAA=', // 2
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAAAcAAAADAAwABAAAAAYAAAADAAwACAAAAAUAAAADAAwADAAAAAQAAAAgABwADAAAADgAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAAAAAAAwAMABMAAAABAAAAAwAMABoAAAACAAAAAwAMACEAAAADAAAAAwAMACgAAAAAAAAAAwAMAC8AAAABAAAAAwAMADYAAAACAAAAAwAMAD0AAAADAAAAAwAMAEQAAAAAAAAAIAAcAEQAAAA4AAAABAAAAAAAAAAAAIBAAAAAAAMADABLAAAAAQAAAAMADABSAAAAAgAAAAMADABZAAAAAwAAAAMADABgAAAAAAAAAAMADABnAAAAAQAAAAMADABuAAAAAgAAAAMADAB1AAAAAwAAAAQAEAB8AAAARAAAAAwAAAA=', // 3
      'GAAMAAAAAAABAAAAAwAMAAAAAAAHAAAAAwAMAAQAAAAGAAAAAwAMAAgAAAAFAAAAAwAMAAwAAAAEAAAAIAAcAAwAAAA4AAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAAAAAAAAMADAATAAAAAQAAAAMADAAaAAAAAgAAAAMADAAhAAAAAwAAAAMADAAoAAAAAAAAAAMADAAvAAAAAQAAAAMADAA2AAAAAgAAAAMADAA9AAAAAwAAAAMADABEAAAAAAAAACAAHABEAAAAOAAAAAQAAAAAAAAAAACAQAAAAAADAAwASwAAAAEAAAADAAwAUgAAAAIAAAADAAwAWQAAAAMAAAADAAwAYAAAAAAAAAADAAwAZwAAAAEAAAADAAwAbgAAAAIAAAADAAwAdQAAAAMAAAAEABAAfAAAADwAAAAMAAAA', // 4
      'AwAMAAAAAAAIAAAAAwAMAAYAAAAJAAAAAwAMAAoAAAAKAAAAAwAMABAAAAALAAAABAAQALAPAAAkAAAACgAAAA==', // 5
      'GAAMAAAAAAABAAAAIAAcAAAAAAAoAAAABAAAAAAAAAAAAIDAAAAAAAMADAAAAAAADAAAAAMADAAFAAAADQAAAAMADAAKAAAADgAAAAMADAAPAAAADwAAAAMADAAUAAAADAAAAAMADAAZAAAADQAAAAMADAAeAAAADgAAAAMADAAjAAAADwAAAAMADAAoAAAADAAAACAAHAAoAAAAKAAAAAQAAAAAAAAAAACAQAAAAAADAAwALQAAAA0AAAADAAwAMgAAAA4AAAADAAwANwAAAA8AAAADAAwAPAAAAAwAAAADAAwAQQAAAA0AAAADAAwARgAAAA4AAAADAAwASwAAAA8AAAAEABAAUAAAAAwAAAAAAAAA', // 6
      'CgAIAAAAAAADAAwAAAAAABAAAAADAAwABAAAABEAAAADAAwACAAAABIAAAADAAwADAAAABMAAAACAAgADAAAAA==', // 7
      'AwAMAAAAAAAQAAAAAwAMAAQAAAARAAAAAwAMAAgAAAASAAAAAwAMAAwAAAATAAAAAgAIAAwAAAA=', // 8
      'GAAMAAAAAAABAAAACgAIAAAAAAADAAwAAAAAABMAAAADAAwABAAAABIAAAADAAwACAAAABEAAAADAAwADAAAABAAAAAgABwADAAAADgAAAAEAAAAAAAAAAAAgMAAAAAAAwAMAAwAAAAMAAAAAwAMABMAAAANAAAAAwAMABoAAAAOAAAAAwAMACEAAAAPAAAAAwAMACgAAAAMAAAAAwAMAC8AAAANAAAAAwAMADYAAAAOAAAAAwAMAD0AAAAPAAAAAwAMAEQAAAAMAAAAIAAcAEQAAAA4AAAABAAAAAAAAAAAAIBAAAAAAAMADABLAAAADQAAAAMADABSAAAADgAAAAMADABZAAAADwAAAAMADABgAAAADAAAAAMADABnAAAADQAAAAMADABuAAAADgAAAAMADAB1AAAADwAAAAQAEAB8AAAARAAAAAwAAAA=', // 9
      'GAAMAAAAAAABAAAAAwAMAAAAAAATAAAAAwAMAAQAAAASAAAAAwAMAAgAAAARAAAAAwAMAAwAAAAQAAAAIAAcAAwAAAA4AAAABAAAAAAAAAAAAIDAAAAAAAMADAAMAAAADAAAAAMADAATAAAADQAAAAMADAAaAAAADgAAAAMADAAhAAAADwAAAAMADAAoAAAADAAAAAMADAAvAAAADQAAAAMADAA2AAAADgAAAAMADAA9AAAADwAAAAMADABEAAAADAAAACAAHABEAAAAOAAAAAQAAAAAAAAAAACAQAAAAAADAAwASwAAAA0AAAADAAwAUgAAAA4AAAADAAwAWQAAAA8AAAADAAwAYAAAAAwAAAADAAwAZwAAAA0AAAADAAwAbgAAAA4AAAADAAwAdQAAAA8AAAAEABAAfAAAADwAAAAMAAAA', // 10
      'AwAMAAAAAAAUAAAAAwAMAAYAAAAVAAAAAwAMAAoAAAAWAAAAAwAMABAAAAAXAAAABAAQALAPAAAkAAAACgAAAA==', // 11
      'IgAUAAAAAAA8AAAAAAAAAIAAAAADAAwAAAAAABQAAAADAAwABgAAABUAAAADAAwACgAAABYAAAADAAwAEAAAABcAAAAEABAAsA8AADgAAAAKAAAA', // 12
      'AwAMAAAAAAAYAAAACAAMAAAAAAAAAAAAIgAUAAAAAAAoAAAABAAAAP8AAAAHABAAAAAAAAAAgEAAAIBAJAAYAAAAAAAoAAAAAAAAAAAAgD8AAIA/BAAQADB1AABUAAAAAAAAAA==', // 13
      'AwAMAAAAAAAYAAAAUgAMAAAAAAABAAAAIgAUAAAAAAAoAAAABAAAAP8AAAAkABgAAAAAACgAAAAAAAAAAACAPwAAgD8AAAgAKAAAAAgADAAoAAAA/wAAAAcAEAAoAAAAzcxMP83MTD8kABgAKAAAAC4AAAAAAAAAmpmZP5qZmT8iABQAKAAAAC4AAAAEAAAAAAAAAAQAEABWAAAATAAAACgAAAA=', // 14
      'AwAMAAAAAAAYAAAABAAQADB1AAAMAAAAAAAAAA==', // 15
      'AwAMAAAAAAAYAAAAUgAMAAAAAAABAAAACAAMAAAAAAD/AAAABwAQAAAAAADNzEw/zcxMPyQAGAAAAAAALgAAAAAAAACamZk/mpmZPyIAFAAAAAAALgAAAAQAAAAAAAAABAAQAC4AAAAYAAAAAAAAAA==', // 16
      'AwAMAAAAAAAYAAAAUgAMAAAAAAABAAAAIgAUAAAAAAAoAAAABAAAAP8AAAAkABgAAAAAACgAAAAAAAAAAACAPwAAgD8AAAgAKAAAAAgADAAoAAAA/wAAAAcAEAAoAAAAzcxMP83MTD8kABgAKAAAAC4AAAAAAAAAAAAAQAAAAEAiABQAKAAAAC4AAAAEAAAAAAAAAAQAEABWAAAATAAAACgAAAA=', // 17
      'AwAMAAAAAAAYAAAAUgAMAAAAAAABAAAACAAMAAAAAAAAAAAAIgAUAAAAAAAoAAAABAAAAP8AAAAHABAAAAAAAAAAgEAAAIBAJAAYAAAAAAAoAAAAAAAAAAAAgD8AAIA/AAAIAD8AAAAIAAwAPwAAAP8AAAAHABAAPwAAAGZmpj9mZqY/JAAYAD8AAAAuAAAAAAAAAAAAgD8AAIA/IgAUAD8AAAAuAAAAAQAAAAAAAAAEABAAbQAAAGgAAAA/AAAA', // 18
    ],
  },
};

/**
 * Which `stgNNenm.anm` a campaign route draws from. The pack follows the
 * ECL index, so 6A is `stg6enm` and the true finale 6B is `stg7enm`
 * (same pairing as `STD_KEY_BY_ROUTE`).
 */
export const STGENM_BY_ROUTE: Readonly<Record<string, string>> = {
  stage1: 'stg1enm',
  stage2: 'stg2enm',
  stage3: 'stg3enm',
  stage4a: 'stg4aenm',
  stage4b: 'stg4benm',
  stage5: 'stg5enm',
  stage6a: 'stg6enm',
  stage6b: 'stg7enm',
};

/**
 * The atlas cell one stage-pack script shows `age` frames after the spawn.
 * Only used when a slot has no VM to run (a stage pack that failed to load).
 */
export function stgenmAnimCell(name: string, script: number, age: number): number | null {
  const pack = TH08_STGENM[name];
  const anim = pack?.scripts[script];
  if (!anim || anim.total === 0) return null;
  let tick = age % anim.total;
  for (const frame of anim.frames) {
    if (tick < frame.duration) return pack.pageOf[frame.sprite] ? frame.sprite : null;
    tick -= frame.duration;
  }
  return null;
}

/** The raw VM bytecode of one stage-pack script, or null when the id is unused. */
export const stgenmBytes = (name: string, script: number): string | null =>
  TH08_STGENM[name]?.bytes[script] ?? null;

/** The atlas page a stage-pack sprite id lives on, or null when the id is unused. */
export const stgenmPageOf = (name: string, sprite: number): string | null =>
  TH08_STGENM[name]?.pageOf[sprite] ?? null;
