/**
 * TH08 stage background texture data.
 * Each stage has 1-5 background texture sheets from stg*bg.anm.
 */

export interface BgTexture {
  file: string;
  width: number;
  height: number;
}

export interface BgSprite {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  tex: number;
}

export interface StageBgData {
  textures: BgTexture[];
  sprites: BgSprite[];
}

/** Stage background atlas data. */
export const TH08_STAGE_BACKGROUNDS: Record<number, StageBgData> = {
  '1': {
    textures: [
      {
        file: '/assets/th08/anm/stg1bg_t0.png',
        width: 512,
        height: 512,
      },
    ],
    sprites: [
      {
        id: 0,
        x: 1,
        y: 1,
        w: 254,
        h: 254,
        tex: 0,
      },
      {
        id: 1,
        x: 258,
        y: 2,
        w: 124,
        h: 124,
        tex: 0,
      },
      {
        id: 2,
        x: 386,
        y: 2,
        w: 124,
        h: 124,
        tex: 0,
      },
    ],
  },
  '2': {
    textures: [
      {
        file: '/assets/th08/anm/stg2bg_t0.png',
        width: 512,
        height: 512,
      },
    ],
    sprites: [
      {
        id: 0,
        x: 1,
        y: 258,
        w: 254,
        h: 252,
        tex: 0,
      },
      {
        id: 1,
        x: 258,
        y: 2,
        w: 124,
        h: 124,
        tex: 0,
      },
      {
        id: 2,
        x: 386,
        y: 2,
        w: 124,
        h: 124,
        tex: 0,
      },
    ],
  },
  '3': {
    textures: [
      {
        file: '/assets/th08/anm/stg3bg_t0.png',
        width: 512,
        height: 256,
      },
      {
        file: '/assets/th08/anm/stg3bg_t1.png',
        width: 256,
        height: 256,
      },
    ],
    sprites: [
      {
        id: 0,
        x: 2,
        y: 1,
        w: 252,
        h: 252,
        tex: 0,
      },
      {
        id: 1,
        x: 258,
        y: 1,
        w: 252,
        h: 252,
        tex: 0,
      },
      {
        id: 2,
        x: 1,
        y: 1,
        w: 254,
        h: 254,
        tex: 1,
      },
      {
        id: 3,
        x: 1,
        y: 1,
        w: 254,
        h: 254,
        tex: 1,
      },
    ],
  },
  '4': {
    textures: [
      {
        file: '/assets/th08/anm/stg4abg_t0.png',
        width: 512,
        height: 512,
      },
      {
        file: '/assets/th08/anm/stg4abg_t1.png',
        width: 512,
        height: 512,
      },
    ],
    sprites: [
      {
        id: 0,
        x: 1,
        y: 1,
        w: 254,
        h: 254,
        tex: 0,
      },
      {
        id: 1,
        x: 496,
        y: 0,
        w: 16,
        h: 512,
        tex: 0,
      },
      {
        id: 2,
        x: 0,
        y: 257,
        w: 288,
        h: 254,
        tex: 0,
      },
      {
        id: 3,
        x: 257,
        y: 0,
        w: 237,
        h: 192,
        tex: 0,
      },
      {
        id: 4,
        x: 0,
        y: 0,
        w: 384,
        h: 448,
        tex: 1,
      },
    ],
  },
  '5': {
    textures: [
      {
        file: '/assets/th08/anm/stg5bg_t0.png',
        width: 512,
        height: 512,
      },
    ],
    sprites: [
      {
        id: 0,
        x: 1,
        y: 1,
        w: 252,
        h: 252,
        tex: 0,
      },
      {
        id: 1,
        x: 257,
        y: 1,
        w: 254,
        h: 254,
        tex: 0,
      },
      {
        id: 2,
        x: 1,
        y: 258,
        w: 126,
        h: 125,
        tex: 0,
      },
      {
        id: 3,
        x: 257,
        y: 1,
        w: 30,
        h: 254,
        tex: 0,
      },
      {
        id: 4,
        x: 481,
        y: 1,
        w: 30,
        h: 254,
        tex: 0,
      },
      {
        id: 5,
        x: 257,
        y: 257,
        w: 252,
        h: 252,
        tex: 0,
      },
      {
        id: 6,
        x: 129,
        y: 258,
        w: 126,
        h: 125,
        tex: 0,
      },
    ],
  },
  '6': {
    textures: [
      {
        file: '/assets/th08/anm/stg6bg_t0.png',
        width: 512,
        height: 512,
      },
      {
        file: '/assets/th08/anm/stg6bg_t1.png',
        width: 512,
        height: 512,
      },
      {
        file: '/assets/th08/anm/stg6bg_t2.png',
        width: 256,
        height: 256,
      },
      {
        file: '/assets/th08/anm/stg6bg_t3.png',
        width: 256,
        height: 256,
      },
      {
        file: '/assets/th08/anm/stg6bg_t4.png',
        width: 256,
        height: 256,
      },
    ],
    sprites: [
      {
        id: 0,
        x: 1,
        y: 1,
        w: 252,
        h: 252,
        tex: 0,
      },
      {
        id: 1,
        x: 257,
        y: 1,
        w: 254,
        h: 254,
        tex: 0,
      },
      {
        id: 2,
        x: 1,
        y: 258,
        w: 126,
        h: 125,
        tex: 0,
      },
      {
        id: 3,
        x: 257,
        y: 1,
        w: 30,
        h: 254,
        tex: 0,
      },
      {
        id: 4,
        x: 481,
        y: 1,
        w: 30,
        h: 254,
        tex: 0,
      },
      {
        id: 5,
        x: 257,
        y: 257,
        w: 252,
        h: 252,
        tex: 0,
      },
      {
        id: 6,
        x: 129,
        y: 258,
        w: 126,
        h: 125,
        tex: 0,
      },
      {
        id: 7,
        x: 0,
        y: 0,
        w: 384,
        h: 448,
        tex: 1,
      },
      {
        id: 8,
        x: 0,
        y: 0,
        w: 256,
        h: 256,
        tex: 2,
      },
      {
        id: 9,
        x: 0,
        y: 0,
        w: 256,
        h: 256,
        tex: 3,
      },
      {
        id: 10,
        x: 0,
        y: 0,
        w: 256,
        h: 256,
        tex: 4,
      },
    ],
  },
};
