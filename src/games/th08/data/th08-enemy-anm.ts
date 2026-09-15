/**
 * Generated from public/assets/th08/manifest.json (enemy.anm) by
 * tools/th08/anm/generate.mjs. Do not edit by hand.
 */

/** Texture page the enemy art lives on. */
export const TH08_ENEMY_ANM_PAGE = '/assets/th08/anm/enemy_t0.png';

/** One cell of the enemy atlas, in page pixels. */
export interface EnemyAnimRect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** One frame of an enemy animation. */
export interface EnemyAnimationFrame {
  /** Sprite id within the atlas. */
  readonly sprite: number;
  /** Frames this cell stays on screen. */
  readonly duration: number;
}

/** A lifted ANM script: the sprite cycle plus its loop length. */
export interface EnemyAnimation {
  readonly frames: readonly EnemyAnimationFrame[];
  /** Total frames of one loop; 0 when the script draws nothing. */
  readonly total: number;
}

/** Atlas cells indexed by ANM sprite id (0..156); null when the id is unused. */
export const TH08_ENEMY_ANM_RECTS: readonly (EnemyAnimRect | null)[] = [
  { x: 0, y: 0, w: 32, h: 32 }, // 0
  { x: 32, y: 0, w: 32, h: 32 }, // 1
  { x: 64, y: 0, w: 32, h: 32 }, // 2
  { x: 96, y: 0, w: 32, h: 32 }, // 3
  { x: 128, y: 0, w: 32, h: 32 }, // 4
  { x: 160, y: 0, w: 32, h: 32 }, // 5
  { x: 192, y: 0, w: 32, h: 32 }, // 6
  { x: 224, y: 0, w: 32, h: 32 }, // 7
  { x: 256, y: 0, w: 32, h: 32 }, // 8
  { x: 288, y: 0, w: 32, h: 32 }, // 9
  { x: 320, y: 0, w: 32, h: 32 }, // 10
  { x: 352, y: 0, w: 32, h: 32 }, // 11
  { x: 384, y: 0, w: 32, h: 32 }, // 12
  { x: 416, y: 0, w: 32, h: 32 }, // 13
  { x: 448, y: 0, w: 32, h: 32 }, // 14
  { x: 480, y: 0, w: 32, h: 32 }, // 15
  { x: 0, y: 32, w: 32, h: 32 }, // 16
  { x: 32, y: 32, w: 32, h: 32 }, // 17
  { x: 64, y: 32, w: 32, h: 32 }, // 18
  { x: 96, y: 32, w: 32, h: 32 }, // 19
  { x: 128, y: 32, w: 32, h: 32 }, // 20
  { x: 160, y: 32, w: 32, h: 32 }, // 21
  { x: 192, y: 32, w: 32, h: 32 }, // 22
  { x: 224, y: 32, w: 32, h: 32 }, // 23
  { x: 256, y: 32, w: 32, h: 32 }, // 24
  { x: 288, y: 32, w: 32, h: 32 }, // 25
  { x: 320, y: 32, w: 32, h: 32 }, // 26
  { x: 352, y: 32, w: 32, h: 32 }, // 27
  { x: 384, y: 32, w: 32, h: 32 }, // 28
  { x: 416, y: 32, w: 32, h: 32 }, // 29
  { x: 448, y: 32, w: 32, h: 32 }, // 30
  { x: 480, y: 32, w: 32, h: 32 }, // 31
  { x: 0, y: 64, w: 32, h: 32 }, // 32
  { x: 32, y: 64, w: 32, h: 32 }, // 33
  { x: 64, y: 64, w: 32, h: 32 }, // 34
  { x: 96, y: 64, w: 32, h: 32 }, // 35
  { x: 128, y: 64, w: 32, h: 32 }, // 36
  { x: 160, y: 64, w: 32, h: 32 }, // 37
  { x: 192, y: 64, w: 32, h: 32 }, // 38
  { x: 224, y: 64, w: 32, h: 32 }, // 39
  { x: 256, y: 64, w: 32, h: 32 }, // 40
  { x: 288, y: 64, w: 32, h: 32 }, // 41
  { x: 320, y: 64, w: 32, h: 32 }, // 42
  { x: 352, y: 64, w: 32, h: 32 }, // 43
  { x: 384, y: 64, w: 32, h: 32 }, // 44
  { x: 416, y: 64, w: 32, h: 32 }, // 45
  { x: 448, y: 64, w: 32, h: 32 }, // 46
  { x: 480, y: 64, w: 32, h: 32 }, // 47
  { x: 0, y: 96, w: 32, h: 32 }, // 48
  { x: 32, y: 96, w: 32, h: 32 }, // 49
  { x: 64, y: 96, w: 32, h: 32 }, // 50
  { x: 96, y: 96, w: 32, h: 32 }, // 51
  { x: 128, y: 96, w: 32, h: 32 }, // 52
  { x: 160, y: 96, w: 32, h: 32 }, // 53
  { x: 192, y: 96, w: 32, h: 32 }, // 54
  { x: 224, y: 96, w: 32, h: 32 }, // 55
  { x: 256, y: 96, w: 32, h: 32 }, // 56
  { x: 288, y: 96, w: 32, h: 32 }, // 57
  { x: 320, y: 96, w: 32, h: 32 }, // 58
  { x: 352, y: 96, w: 32, h: 32 }, // 59
  { x: 384, y: 96, w: 32, h: 32 }, // 60
  { x: 416, y: 96, w: 32, h: 32 }, // 61
  { x: 448, y: 96, w: 32, h: 32 }, // 62
  { x: 480, y: 96, w: 32, h: 32 }, // 63
  { x: 64, y: 128, w: 32, h: 32 }, // 64
  { x: 96, y: 128, w: 32, h: 32 }, // 65
  { x: 64, y: 160, w: 32, h: 32 }, // 66
  { x: 96, y: 160, w: 32, h: 32 }, // 67
  { x: 0, y: 128, w: 64, h: 64 }, // 68
  { x: 256, y: 128, w: 32, h: 32 }, // 69
  { x: 288, y: 128, w: 32, h: 32 }, // 70
  { x: 320, y: 128, w: 32, h: 32 }, // 71
  { x: 352, y: 128, w: 32, h: 32 }, // 72
  { x: 384, y: 128, w: 32, h: 32 }, // 73
  { x: 416, y: 128, w: 32, h: 32 }, // 74
  { x: 448, y: 128, w: 32, h: 32 }, // 75
  { x: 480, y: 128, w: 32, h: 32 }, // 76
  { x: 256, y: 160, w: 32, h: 32 }, // 77
  { x: 288, y: 160, w: 32, h: 32 }, // 78
  { x: 320, y: 160, w: 32, h: 32 }, // 79
  { x: 352, y: 160, w: 32, h: 32 }, // 80
  { x: 384, y: 160, w: 32, h: 32 }, // 81
  { x: 416, y: 160, w: 32, h: 32 }, // 82
  { x: 448, y: 160, w: 32, h: 32 }, // 83
  { x: 480, y: 160, w: 32, h: 32 }, // 84
  { x: 256, y: 192, w: 32, h: 32 }, // 85
  { x: 288, y: 192, w: 32, h: 32 }, // 86
  { x: 320, y: 192, w: 32, h: 32 }, // 87
  { x: 352, y: 192, w: 32, h: 32 }, // 88
  { x: 384, y: 192, w: 32, h: 32 }, // 89
  { x: 416, y: 192, w: 32, h: 32 }, // 90
  { x: 448, y: 192, w: 32, h: 32 }, // 91
  { x: 480, y: 192, w: 32, h: 32 }, // 92
  { x: 256, y: 224, w: 32, h: 32 }, // 93
  { x: 288, y: 224, w: 32, h: 32 }, // 94
  { x: 320, y: 224, w: 32, h: 32 }, // 95
  { x: 352, y: 224, w: 32, h: 32 }, // 96
  { x: 384, y: 224, w: 32, h: 32 }, // 97
  { x: 416, y: 224, w: 32, h: 32 }, // 98
  { x: 448, y: 224, w: 32, h: 32 }, // 99
  { x: 480, y: 224, w: 32, h: 32 }, // 100
  { x: 128, y: 128, w: 32, h: 32 }, // 101
  { x: 160, y: 128, w: 32, h: 32 }, // 102
  { x: 192, y: 128, w: 32, h: 32 }, // 103
  { x: 224, y: 128, w: 32, h: 32 }, // 104
  { x: 128, y: 160, w: 32, h: 32 }, // 105
  { x: 160, y: 160, w: 32, h: 32 }, // 106
  { x: 192, y: 160, w: 32, h: 32 }, // 107
  { x: 224, y: 160, w: 32, h: 32 }, // 108
  { x: 128, y: 192, w: 32, h: 32 }, // 109
  { x: 160, y: 192, w: 32, h: 32 }, // 110
  { x: 192, y: 192, w: 32, h: 32 }, // 111
  { x: 224, y: 192, w: 32, h: 32 }, // 112
  { x: 128, y: 224, w: 32, h: 32 }, // 113
  { x: 160, y: 224, w: 32, h: 32 }, // 114
  { x: 192, y: 224, w: 32, h: 32 }, // 115
  { x: 224, y: 224, w: 32, h: 32 }, // 116
  { x: 0, y: 192, w: 32, h: 32 }, // 117
  { x: 32, y: 192, w: 32, h: 32 }, // 118
  { x: 64, y: 192, w: 32, h: 32 }, // 119
  { x: 96, y: 192, w: 32, h: 32 }, // 120
  { x: 0, y: 224, w: 32, h: 32 }, // 121
  { x: 32, y: 224, w: 32, h: 32 }, // 122
  { x: 64, y: 224, w: 32, h: 32 }, // 123
  { x: 96, y: 224, w: 32, h: 32 }, // 124
  { x: 0, y: 256, w: 32, h: 32 }, // 125
  { x: 32, y: 256, w: 32, h: 32 }, // 126
  { x: 64, y: 256, w: 32, h: 32 }, // 127
  { x: 96, y: 256, w: 32, h: 32 }, // 128
  { x: 128, y: 256, w: 32, h: 32 }, // 129
  { x: 160, y: 256, w: 32, h: 32 }, // 130
  { x: 192, y: 256, w: 32, h: 32 }, // 131
  { x: 224, y: 256, w: 32, h: 32 }, // 132
  { x: 0, y: 288, w: 32, h: 32 }, // 133
  { x: 32, y: 288, w: 32, h: 32 }, // 134
  { x: 64, y: 288, w: 32, h: 32 }, // 135
  { x: 96, y: 288, w: 32, h: 32 }, // 136
  { x: 128, y: 288, w: 32, h: 32 }, // 137
  { x: 160, y: 288, w: 32, h: 32 }, // 138
  { x: 192, y: 288, w: 32, h: 32 }, // 139
  { x: 224, y: 288, w: 32, h: 32 }, // 140
  { x: 0, y: 320, w: 32, h: 32 }, // 141
  { x: 32, y: 320, w: 32, h: 32 }, // 142
  { x: 64, y: 320, w: 32, h: 32 }, // 143
  { x: 96, y: 320, w: 32, h: 32 }, // 144
  { x: 128, y: 320, w: 32, h: 32 }, // 145
  { x: 160, y: 320, w: 32, h: 32 }, // 146
  { x: 192, y: 320, w: 32, h: 32 }, // 147
  { x: 224, y: 320, w: 32, h: 32 }, // 148
  { x: 0, y: 352, w: 32, h: 32 }, // 149
  { x: 32, y: 352, w: 32, h: 32 }, // 150
  { x: 64, y: 352, w: 32, h: 32 }, // 151
  { x: 96, y: 352, w: 32, h: 32 }, // 152
  { x: 128, y: 352, w: 32, h: 32 }, // 153
  { x: 160, y: 352, w: 32, h: 32 }, // 154
  { x: 192, y: 352, w: 32, h: 32 }, // 155
  { x: 224, y: 352, w: 32, h: 32 }, // 156
];

/** Animations indexed by the ECL ANM script number. */
export const TH08_ENEMY_ANM_SCRIPTS: readonly EnemyAnimation[] = [
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
      { sprite: 7, duration: 8 },
      { sprite: 6, duration: 8 },
      { sprite: 5, duration: 8 },
      { sprite: 4, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 7, duration: 8 },
      { sprite: 6, duration: 8 },
      { sprite: 5, duration: 8 },
      { sprite: 4, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 4, duration: 8 },
      { sprite: 5, duration: 8 },
      { sprite: 6, duration: 8 },
      { sprite: 7, duration: 1 },
      { sprite: 0, duration: 4 },
      { sprite: 1, duration: 4 },
      { sprite: 2, duration: 4 },
      { sprite: 3, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 4, duration: 8 },
      { sprite: 5, duration: 8 },
      { sprite: 6, duration: 8 },
      { sprite: 7, duration: 1 },
      { sprite: 0, duration: 4 },
      { sprite: 1, duration: 4 },
      { sprite: 2, duration: 4 },
      { sprite: 3, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 0, duration: 24 },
      { sprite: 1, duration: 4 },
      { sprite: 2, duration: 4 },
      { sprite: 3, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 8, duration: 4 },
      { sprite: 9, duration: 4 },
      { sprite: 10, duration: 4 },
      { sprite: 11, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 15, duration: 8 },
      { sprite: 14, duration: 8 },
      { sprite: 13, duration: 8 },
      { sprite: 12, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 15, duration: 8 },
      { sprite: 14, duration: 8 },
      { sprite: 13, duration: 8 },
      { sprite: 12, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 12, duration: 8 },
      { sprite: 13, duration: 8 },
      { sprite: 14, duration: 8 },
      { sprite: 15, duration: 1 },
      { sprite: 8, duration: 4 },
      { sprite: 9, duration: 4 },
      { sprite: 10, duration: 4 },
      { sprite: 11, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 12, duration: 8 },
      { sprite: 13, duration: 8 },
      { sprite: 14, duration: 8 },
      { sprite: 15, duration: 1 },
      { sprite: 8, duration: 4 },
      { sprite: 9, duration: 4 },
      { sprite: 10, duration: 4 },
      { sprite: 11, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 8, duration: 24 },
      { sprite: 9, duration: 4 },
      { sprite: 10, duration: 4 },
      { sprite: 11, duration: 4 },
    ],
    total: 36,
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
      { sprite: 23, duration: 8 },
      { sprite: 22, duration: 8 },
      { sprite: 21, duration: 8 },
      { sprite: 20, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 23, duration: 8 },
      { sprite: 22, duration: 8 },
      { sprite: 21, duration: 8 },
      { sprite: 20, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 20, duration: 8 },
      { sprite: 21, duration: 8 },
      { sprite: 22, duration: 8 },
      { sprite: 23, duration: 1 },
      { sprite: 16, duration: 4 },
      { sprite: 17, duration: 4 },
      { sprite: 18, duration: 4 },
      { sprite: 19, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 20, duration: 8 },
      { sprite: 21, duration: 8 },
      { sprite: 22, duration: 8 },
      { sprite: 23, duration: 1 },
      { sprite: 16, duration: 4 },
      { sprite: 17, duration: 4 },
      { sprite: 18, duration: 4 },
      { sprite: 19, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 16, duration: 24 },
      { sprite: 17, duration: 4 },
      { sprite: 18, duration: 4 },
      { sprite: 19, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 24, duration: 4 },
      { sprite: 25, duration: 4 },
      { sprite: 26, duration: 4 },
      { sprite: 27, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 31, duration: 8 },
      { sprite: 30, duration: 8 },
      { sprite: 29, duration: 8 },
      { sprite: 28, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 31, duration: 8 },
      { sprite: 30, duration: 8 },
      { sprite: 29, duration: 8 },
      { sprite: 28, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 28, duration: 8 },
      { sprite: 29, duration: 8 },
      { sprite: 30, duration: 8 },
      { sprite: 31, duration: 1 },
      { sprite: 24, duration: 4 },
      { sprite: 25, duration: 4 },
      { sprite: 26, duration: 4 },
      { sprite: 27, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 28, duration: 8 },
      { sprite: 29, duration: 8 },
      { sprite: 30, duration: 8 },
      { sprite: 31, duration: 1 },
      { sprite: 24, duration: 4 },
      { sprite: 25, duration: 4 },
      { sprite: 26, duration: 4 },
      { sprite: 27, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 24, duration: 24 },
      { sprite: 25, duration: 4 },
      { sprite: 26, duration: 4 },
      { sprite: 27, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 32, duration: 4 },
      { sprite: 33, duration: 4 },
      { sprite: 34, duration: 4 },
      { sprite: 35, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 39, duration: 8 },
      { sprite: 38, duration: 8 },
      { sprite: 37, duration: 8 },
      { sprite: 36, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 39, duration: 8 },
      { sprite: 38, duration: 8 },
      { sprite: 37, duration: 8 },
      { sprite: 36, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 36, duration: 8 },
      { sprite: 37, duration: 8 },
      { sprite: 38, duration: 8 },
      { sprite: 39, duration: 1 },
      { sprite: 32, duration: 4 },
      { sprite: 33, duration: 4 },
      { sprite: 34, duration: 4 },
      { sprite: 35, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 36, duration: 8 },
      { sprite: 37, duration: 8 },
      { sprite: 38, duration: 8 },
      { sprite: 39, duration: 1 },
      { sprite: 32, duration: 4 },
      { sprite: 33, duration: 4 },
      { sprite: 34, duration: 4 },
      { sprite: 35, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 32, duration: 24 },
      { sprite: 33, duration: 4 },
      { sprite: 34, duration: 4 },
      { sprite: 35, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 40, duration: 4 },
      { sprite: 41, duration: 4 },
      { sprite: 42, duration: 4 },
      { sprite: 43, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 47, duration: 8 },
      { sprite: 46, duration: 8 },
      { sprite: 45, duration: 8 },
      { sprite: 44, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 47, duration: 8 },
      { sprite: 46, duration: 8 },
      { sprite: 45, duration: 8 },
      { sprite: 44, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 44, duration: 8 },
      { sprite: 45, duration: 8 },
      { sprite: 46, duration: 8 },
      { sprite: 47, duration: 1 },
      { sprite: 40, duration: 4 },
      { sprite: 41, duration: 4 },
      { sprite: 42, duration: 4 },
      { sprite: 43, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 44, duration: 8 },
      { sprite: 45, duration: 8 },
      { sprite: 46, duration: 8 },
      { sprite: 47, duration: 1 },
      { sprite: 40, duration: 4 },
      { sprite: 41, duration: 4 },
      { sprite: 42, duration: 4 },
      { sprite: 43, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 40, duration: 24 },
      { sprite: 41, duration: 4 },
      { sprite: 42, duration: 4 },
      { sprite: 43, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 48, duration: 4 },
      { sprite: 49, duration: 4 },
      { sprite: 50, duration: 4 },
      { sprite: 51, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 55, duration: 8 },
      { sprite: 54, duration: 8 },
      { sprite: 53, duration: 8 },
      { sprite: 52, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 55, duration: 8 },
      { sprite: 54, duration: 8 },
      { sprite: 53, duration: 8 },
      { sprite: 52, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 52, duration: 8 },
      { sprite: 53, duration: 8 },
      { sprite: 54, duration: 8 },
      { sprite: 55, duration: 1 },
      { sprite: 48, duration: 4 },
      { sprite: 49, duration: 4 },
      { sprite: 50, duration: 4 },
      { sprite: 51, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 52, duration: 8 },
      { sprite: 53, duration: 8 },
      { sprite: 54, duration: 8 },
      { sprite: 55, duration: 1 },
      { sprite: 48, duration: 4 },
      { sprite: 49, duration: 4 },
      { sprite: 50, duration: 4 },
      { sprite: 51, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 48, duration: 24 },
      { sprite: 49, duration: 4 },
      { sprite: 50, duration: 4 },
      { sprite: 51, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 56, duration: 4 },
      { sprite: 57, duration: 4 },
      { sprite: 58, duration: 4 },
      { sprite: 59, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 63, duration: 8 },
      { sprite: 62, duration: 8 },
      { sprite: 61, duration: 8 },
      { sprite: 60, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 63, duration: 8 },
      { sprite: 62, duration: 8 },
      { sprite: 61, duration: 8 },
      { sprite: 60, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 60, duration: 8 },
      { sprite: 61, duration: 8 },
      { sprite: 62, duration: 8 },
      { sprite: 63, duration: 1 },
      { sprite: 56, duration: 4 },
      { sprite: 57, duration: 4 },
      { sprite: 58, duration: 4 },
      { sprite: 59, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 60, duration: 8 },
      { sprite: 61, duration: 8 },
      { sprite: 62, duration: 8 },
      { sprite: 63, duration: 1 },
      { sprite: 56, duration: 4 },
      { sprite: 57, duration: 4 },
      { sprite: 58, duration: 4 },
      { sprite: 59, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 56, duration: 24 },
      { sprite: 57, duration: 4 },
      { sprite: 58, duration: 4 },
      { sprite: 59, duration: 4 },
    ],
    total: 36,
  },
  { frames: [{ sprite: 68, duration: 4 }], total: 4 },
  { frames: [{ sprite: 64, duration: 4 }], total: 4 },
  { frames: [{ sprite: 65, duration: 4 }], total: 4 },
  { frames: [{ sprite: 66, duration: 4 }], total: 4 },
  { frames: [{ sprite: 67, duration: 4 }], total: 4 },
  {
    frames: [
      { sprite: 69, duration: 2 },
      { sprite: 70, duration: 2 },
      { sprite: 71, duration: 2 },
      { sprite: 72, duration: 2 },
      { sprite: 73, duration: 2 },
      { sprite: 74, duration: 2 },
      { sprite: 75, duration: 2 },
      { sprite: 76, duration: 2 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 77, duration: 2 },
      { sprite: 78, duration: 2 },
      { sprite: 79, duration: 2 },
      { sprite: 80, duration: 2 },
      { sprite: 81, duration: 2 },
      { sprite: 82, duration: 2 },
      { sprite: 83, duration: 2 },
      { sprite: 84, duration: 2 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 85, duration: 2 },
      { sprite: 86, duration: 2 },
      { sprite: 87, duration: 2 },
      { sprite: 88, duration: 2 },
      { sprite: 89, duration: 2 },
      { sprite: 90, duration: 2 },
      { sprite: 91, duration: 2 },
      { sprite: 92, duration: 2 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 93, duration: 2 },
      { sprite: 94, duration: 2 },
      { sprite: 95, duration: 2 },
      { sprite: 96, duration: 2 },
      { sprite: 97, duration: 2 },
      { sprite: 98, duration: 2 },
      { sprite: 99, duration: 2 },
      { sprite: 100, duration: 2 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 101, duration: 4 },
      { sprite: 102, duration: 4 },
      { sprite: 103, duration: 4 },
      { sprite: 104, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 105, duration: 4 },
      { sprite: 106, duration: 4 },
      { sprite: 107, duration: 4 },
      { sprite: 108, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 109, duration: 4 },
      { sprite: 110, duration: 4 },
      { sprite: 111, duration: 4 },
      { sprite: 112, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 113, duration: 4 },
      { sprite: 114, duration: 4 },
      { sprite: 115, duration: 4 },
      { sprite: 116, duration: 4 },
    ],
    total: 16,
  },
  { frames: [{ sprite: 117, duration: 4 }], total: 4 },
  { frames: [{ sprite: 118, duration: 4 }], total: 4 },
  { frames: [{ sprite: 119, duration: 4 }], total: 4 },
  { frames: [{ sprite: 120, duration: 4 }], total: 4 },
  { frames: [{ sprite: 117, duration: 4 }], total: 4 },
  { frames: [{ sprite: 118, duration: 4 }], total: 4 },
  { frames: [{ sprite: 119, duration: 4 }], total: 4 },
  { frames: [{ sprite: 120, duration: 4 }], total: 4 },
  { frames: [{ sprite: 121, duration: 4 }], total: 4 },
  { frames: [{ sprite: 122, duration: 4 }], total: 4 },
  { frames: [{ sprite: 123, duration: 4 }], total: 4 },
  { frames: [{ sprite: 124, duration: 4 }], total: 4 },
  { frames: [{ sprite: 121, duration: 4 }], total: 4 },
  { frames: [{ sprite: 122, duration: 4 }], total: 4 },
  { frames: [{ sprite: 123, duration: 4 }], total: 4 },
  { frames: [{ sprite: 124, duration: 4 }], total: 4 },
  {
    frames: [
      { sprite: 125, duration: 4 },
      { sprite: 126, duration: 4 },
      { sprite: 127, duration: 4 },
      { sprite: 128, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 132, duration: 8 },
      { sprite: 131, duration: 8 },
      { sprite: 130, duration: 8 },
      { sprite: 129, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 132, duration: 8 },
      { sprite: 131, duration: 8 },
      { sprite: 130, duration: 8 },
      { sprite: 129, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 129, duration: 8 },
      { sprite: 130, duration: 8 },
      { sprite: 131, duration: 8 },
      { sprite: 132, duration: 1 },
      { sprite: 125, duration: 4 },
      { sprite: 126, duration: 4 },
      { sprite: 127, duration: 4 },
      { sprite: 128, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 129, duration: 8 },
      { sprite: 130, duration: 8 },
      { sprite: 131, duration: 8 },
      { sprite: 132, duration: 1 },
      { sprite: 125, duration: 4 },
      { sprite: 126, duration: 4 },
      { sprite: 127, duration: 4 },
      { sprite: 128, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 125, duration: 24 },
      { sprite: 126, duration: 4 },
      { sprite: 127, duration: 4 },
      { sprite: 128, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 133, duration: 4 },
      { sprite: 134, duration: 4 },
      { sprite: 135, duration: 4 },
      { sprite: 136, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 140, duration: 8 },
      { sprite: 139, duration: 8 },
      { sprite: 138, duration: 8 },
      { sprite: 137, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 140, duration: 8 },
      { sprite: 139, duration: 8 },
      { sprite: 138, duration: 8 },
      { sprite: 137, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 137, duration: 8 },
      { sprite: 138, duration: 8 },
      { sprite: 139, duration: 8 },
      { sprite: 140, duration: 1 },
      { sprite: 133, duration: 4 },
      { sprite: 134, duration: 4 },
      { sprite: 135, duration: 4 },
      { sprite: 136, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 137, duration: 8 },
      { sprite: 138, duration: 8 },
      { sprite: 139, duration: 8 },
      { sprite: 140, duration: 1 },
      { sprite: 133, duration: 4 },
      { sprite: 134, duration: 4 },
      { sprite: 135, duration: 4 },
      { sprite: 136, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 133, duration: 24 },
      { sprite: 134, duration: 4 },
      { sprite: 135, duration: 4 },
      { sprite: 136, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 141, duration: 4 },
      { sprite: 142, duration: 4 },
      { sprite: 143, duration: 4 },
      { sprite: 144, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 148, duration: 8 },
      { sprite: 147, duration: 8 },
      { sprite: 146, duration: 8 },
      { sprite: 145, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 148, duration: 8 },
      { sprite: 147, duration: 8 },
      { sprite: 146, duration: 8 },
      { sprite: 145, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 145, duration: 8 },
      { sprite: 146, duration: 8 },
      { sprite: 147, duration: 8 },
      { sprite: 148, duration: 1 },
      { sprite: 141, duration: 4 },
      { sprite: 142, duration: 4 },
      { sprite: 143, duration: 4 },
      { sprite: 144, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 145, duration: 8 },
      { sprite: 146, duration: 8 },
      { sprite: 147, duration: 8 },
      { sprite: 148, duration: 1 },
      { sprite: 141, duration: 4 },
      { sprite: 142, duration: 4 },
      { sprite: 143, duration: 4 },
      { sprite: 144, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 141, duration: 24 },
      { sprite: 142, duration: 4 },
      { sprite: 143, duration: 4 },
      { sprite: 144, duration: 4 },
    ],
    total: 36,
  },
  {
    frames: [
      { sprite: 149, duration: 4 },
      { sprite: 150, duration: 4 },
      { sprite: 151, duration: 4 },
      { sprite: 152, duration: 4 },
    ],
    total: 16,
  },
  {
    frames: [
      { sprite: 156, duration: 8 },
      { sprite: 155, duration: 8 },
      { sprite: 154, duration: 8 },
      { sprite: 153, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 156, duration: 8 },
      { sprite: 155, duration: 8 },
      { sprite: 154, duration: 8 },
      { sprite: 153, duration: 8 },
    ],
    total: 32,
  },
  {
    frames: [
      { sprite: 153, duration: 8 },
      { sprite: 154, duration: 8 },
      { sprite: 155, duration: 8 },
      { sprite: 156, duration: 1 },
      { sprite: 149, duration: 4 },
      { sprite: 150, duration: 4 },
      { sprite: 151, duration: 4 },
      { sprite: 152, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 153, duration: 8 },
      { sprite: 154, duration: 8 },
      { sprite: 155, duration: 8 },
      { sprite: 156, duration: 1 },
      { sprite: 149, duration: 4 },
      { sprite: 150, duration: 4 },
      { sprite: 151, duration: 4 },
      { sprite: 152, duration: 4 },
    ],
    total: 41,
  },
  {
    frames: [
      { sprite: 149, duration: 24 },
      { sprite: 150, duration: 4 },
      { sprite: 151, duration: 4 },
      { sprite: 152, duration: 4 },
    ],
    total: 36,
  },
];

/**
 * The untouched VM bytecode of each script, base64-encoded and indexed by script
 * number. `AnmVm` runs these directly, which is what gives enemies their real
 * movement: the sprite cycle above only says which cell to show.
 */
export const TH08_ENEMY_ANM_BYTES: readonly (string | null)[] = [
  'AwAMAAAAAAAAAAAAAwAMAAQAAAABAAAAAwAMAAgAAAACAAAAAwAMAAwAAAADAAAABAAQABAAAAAAAAAAAAAAAA==', // 0
  'AwAMAAAAAAAHAAAAAwAMAAgAAAAGAAAAAwAMABAAAAAFAAAAAwAMABgAAAAEAAAAAgAIABgAAAA=', // 1
  'CgAIAAAAAAADAAwAAAAAAAcAAAADAAwACAAAAAYAAAADAAwAEAAAAAUAAAADAAwAGAAAAAQAAAACAAgAGAAAAA==', // 2
  'AwAMAAAAAAAEAAAAAwAMAAgAAAAFAAAAAwAMABAAAAAGAAAAAwAMABgAAAAHAAAAAwAMABgAAAAAAAAAAwAMABwAAAABAAAAAwAMACAAAAACAAAAAwAMACQAAAADAAAABAAQACgAAAAwAAAAGAAAAA==', // 3
  'CgAIAAAAAAADAAwAAAAAAAQAAAADAAwACAAAAAUAAAADAAwAEAAAAAYAAAADAAwAGAAAAAcAAAADAAwAGAAAAAAAAAADAAwAHAAAAAEAAAADAAwAIAAAAAIAAAADAAwAJAAAAAMAAAAEABAAKAAAADgAAAAYAAAA', // 4
  'AwAMAAAAAAAAAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAAAAAAAADAAwAGAAAAAEAAAADAAwAHAAAAAIAAAADAAwAIAAAAAMAAAAEABAAJAAAAFwAAAAUAAAA', // 5
  'AwAMAAAAAAAIAAAAAwAMAAQAAAAJAAAAAwAMAAgAAAAKAAAAAwAMAAwAAAALAAAABAAQABAAAAAAAAAAAAAAAA==', // 6
  'AwAMAAAAAAAPAAAAAwAMAAgAAAAOAAAAAwAMABAAAAANAAAAAwAMABgAAAAMAAAAAgAIABgAAAA=', // 7
  'CgAIAAAAAAADAAwAAAAAAA8AAAADAAwACAAAAA4AAAADAAwAEAAAAA0AAAADAAwAGAAAAAwAAAACAAgAGAAAAA==', // 8
  'AwAMAAAAAAAMAAAAAwAMAAgAAAANAAAAAwAMABAAAAAOAAAAAwAMABgAAAAPAAAAAwAMABgAAAAIAAAAAwAMABwAAAAJAAAAAwAMACAAAAAKAAAAAwAMACQAAAALAAAABAAQACgAAAAwAAAAGAAAAA==', // 9
  'CgAIAAAAAAADAAwAAAAAAAwAAAADAAwACAAAAA0AAAADAAwAEAAAAA4AAAADAAwAGAAAAA8AAAADAAwAGAAAAAgAAAADAAwAHAAAAAkAAAADAAwAIAAAAAoAAAADAAwAJAAAAAsAAAAEABAAKAAAADgAAAAYAAAA', // 10
  'AwAMAAAAAAAIAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAAAgAAAADAAwAGAAAAAkAAAADAAwAHAAAAAoAAAADAAwAIAAAAAsAAAAEABAAJAAAAFwAAAAUAAAA', // 11
  'AwAMAAAAAAAQAAAAAwAMAAQAAAARAAAAAwAMAAgAAAASAAAAAwAMAAwAAAATAAAABAAQABAAAAAAAAAAAAAAAA==', // 12
  'AwAMAAAAAAAXAAAAAwAMAAgAAAAWAAAAAwAMABAAAAAVAAAAAwAMABgAAAAUAAAAAgAIABgAAAA=', // 13
  'CgAIAAAAAAADAAwAAAAAABcAAAADAAwACAAAABYAAAADAAwAEAAAABUAAAADAAwAGAAAABQAAAACAAgAGAAAAA==', // 14
  'AwAMAAAAAAAUAAAAAwAMAAgAAAAVAAAAAwAMABAAAAAWAAAAAwAMABgAAAAXAAAAAwAMABgAAAAQAAAAAwAMABwAAAARAAAAAwAMACAAAAASAAAAAwAMACQAAAATAAAABAAQACgAAAAwAAAAGAAAAA==', // 15
  'CgAIAAAAAAADAAwAAAAAABQAAAADAAwACAAAABUAAAADAAwAEAAAABYAAAADAAwAGAAAABcAAAADAAwAGAAAABAAAAADAAwAHAAAABEAAAADAAwAIAAAABIAAAADAAwAJAAAABMAAAAEABAAKAAAADgAAAAYAAAA', // 16
  'AwAMAAAAAAAQAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAABAAAAADAAwAGAAAABEAAAADAAwAHAAAABIAAAADAAwAIAAAABMAAAAEABAAJAAAAFwAAAAUAAAA', // 17
  'AwAMAAAAAAAYAAAAAwAMAAQAAAAZAAAAAwAMAAgAAAAaAAAAAwAMAAwAAAAbAAAABAAQABAAAAAAAAAAAAAAAA==', // 18
  'AwAMAAAAAAAfAAAAAwAMAAgAAAAeAAAAAwAMABAAAAAdAAAAAwAMABgAAAAcAAAAAgAIABgAAAA=', // 19
  'CgAIAAAAAAADAAwAAAAAAB8AAAADAAwACAAAAB4AAAADAAwAEAAAAB0AAAADAAwAGAAAABwAAAACAAgAGAAAAA==', // 20
  'AwAMAAAAAAAcAAAAAwAMAAgAAAAdAAAAAwAMABAAAAAeAAAAAwAMABgAAAAfAAAAAwAMABgAAAAYAAAAAwAMABwAAAAZAAAAAwAMACAAAAAaAAAAAwAMACQAAAAbAAAABAAQACgAAAAwAAAAGAAAAA==', // 21
  'CgAIAAAAAAADAAwAAAAAABwAAAADAAwACAAAAB0AAAADAAwAEAAAAB4AAAADAAwAGAAAAB8AAAADAAwAGAAAABgAAAADAAwAHAAAABkAAAADAAwAIAAAABoAAAADAAwAJAAAABsAAAAEABAAKAAAADgAAAAYAAAA', // 22
  'AwAMAAAAAAAYAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAABgAAAADAAwAGAAAABkAAAADAAwAHAAAABoAAAADAAwAIAAAABsAAAAEABAAJAAAAFwAAAAUAAAA', // 23
  'AwAMAAAAAAAgAAAAAwAMAAQAAAAhAAAAAwAMAAgAAAAiAAAAAwAMAAwAAAAjAAAABAAQABAAAAAAAAAAAAAAAA==', // 24
  'AwAMAAAAAAAnAAAAAwAMAAgAAAAmAAAAAwAMABAAAAAlAAAAAwAMABgAAAAkAAAAAgAIABgAAAA=', // 25
  'CgAIAAAAAAADAAwAAAAAACcAAAADAAwACAAAACYAAAADAAwAEAAAACUAAAADAAwAGAAAACQAAAACAAgAGAAAAA==', // 26
  'AwAMAAAAAAAkAAAAAwAMAAgAAAAlAAAAAwAMABAAAAAmAAAAAwAMABgAAAAnAAAAAwAMABgAAAAgAAAAAwAMABwAAAAhAAAAAwAMACAAAAAiAAAAAwAMACQAAAAjAAAABAAQACgAAAAwAAAAGAAAAA==', // 27
  'CgAIAAAAAAADAAwAAAAAACQAAAADAAwACAAAACUAAAADAAwAEAAAACYAAAADAAwAGAAAACcAAAADAAwAGAAAACAAAAADAAwAHAAAACEAAAADAAwAIAAAACIAAAADAAwAJAAAACMAAAAEABAAKAAAADgAAAAYAAAA', // 28
  'AwAMAAAAAAAgAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAACAAAAADAAwAGAAAACEAAAADAAwAHAAAACIAAAADAAwAIAAAACMAAAAEABAAJAAAAFwAAAAUAAAA', // 29
  'AwAMAAAAAAAoAAAAAwAMAAQAAAApAAAAAwAMAAgAAAAqAAAAAwAMAAwAAAArAAAABAAQABAAAAAAAAAAAAAAAA==', // 30
  'AwAMAAAAAAAvAAAAAwAMAAgAAAAuAAAAAwAMABAAAAAtAAAAAwAMABgAAAAsAAAAAgAIABgAAAA=', // 31
  'CgAIAAAAAAADAAwAAAAAAC8AAAADAAwACAAAAC4AAAADAAwAEAAAAC0AAAADAAwAGAAAACwAAAACAAgAGAAAAA==', // 32
  'AwAMAAAAAAAsAAAAAwAMAAgAAAAtAAAAAwAMABAAAAAuAAAAAwAMABgAAAAvAAAAAwAMABgAAAAoAAAAAwAMABwAAAApAAAAAwAMACAAAAAqAAAAAwAMACQAAAArAAAABAAQACgAAAAwAAAAGAAAAA==', // 33
  'CgAIAAAAAAADAAwAAAAAACwAAAADAAwACAAAAC0AAAADAAwAEAAAAC4AAAADAAwAGAAAAC8AAAADAAwAGAAAACgAAAADAAwAHAAAACkAAAADAAwAIAAAACoAAAADAAwAJAAAACsAAAAEABAAKAAAADgAAAAYAAAA', // 34
  'AwAMAAAAAAAoAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAACgAAAADAAwAGAAAACkAAAADAAwAHAAAACoAAAADAAwAIAAAACsAAAAEABAAJAAAAFwAAAAUAAAA', // 35
  'AwAMAAAAAAAwAAAAAwAMAAQAAAAxAAAAAwAMAAgAAAAyAAAAAwAMAAwAAAAzAAAABAAQABAAAAAAAAAAAAAAAA==', // 36
  'AwAMAAAAAAA3AAAAAwAMAAgAAAA2AAAAAwAMABAAAAA1AAAAAwAMABgAAAA0AAAAAgAIABgAAAA=', // 37
  'CgAIAAAAAAADAAwAAAAAADcAAAADAAwACAAAADYAAAADAAwAEAAAADUAAAADAAwAGAAAADQAAAACAAgAGAAAAA==', // 38
  'AwAMAAAAAAA0AAAAAwAMAAgAAAA1AAAAAwAMABAAAAA2AAAAAwAMABgAAAA3AAAAAwAMABgAAAAwAAAAAwAMABwAAAAxAAAAAwAMACAAAAAyAAAAAwAMACQAAAAzAAAABAAQACgAAAAwAAAAGAAAAA==', // 39
  'CgAIAAAAAAADAAwAAAAAADQAAAADAAwACAAAADUAAAADAAwAEAAAADYAAAADAAwAGAAAADcAAAADAAwAGAAAADAAAAADAAwAHAAAADEAAAADAAwAIAAAADIAAAADAAwAJAAAADMAAAAEABAAKAAAADgAAAAYAAAA', // 40
  'AwAMAAAAAAAwAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAADAAAAADAAwAGAAAADEAAAADAAwAHAAAADIAAAADAAwAIAAAADMAAAAEABAAJAAAAFwAAAAUAAAA', // 41
  'AwAMAAAAAAA4AAAAAwAMAAQAAAA5AAAAAwAMAAgAAAA6AAAAAwAMAAwAAAA7AAAABAAQABAAAAAAAAAAAAAAAA==', // 42
  'AwAMAAAAAAA/AAAAAwAMAAgAAAA+AAAAAwAMABAAAAA9AAAAAwAMABgAAAA8AAAAAgAIABgAAAA=', // 43
  'CgAIAAAAAAADAAwAAAAAAD8AAAADAAwACAAAAD4AAAADAAwAEAAAAD0AAAADAAwAGAAAADwAAAACAAgAGAAAAA==', // 44
  'AwAMAAAAAAA8AAAAAwAMAAgAAAA9AAAAAwAMABAAAAA+AAAAAwAMABgAAAA/AAAAAwAMABgAAAA4AAAAAwAMABwAAAA5AAAAAwAMACAAAAA6AAAAAwAMACQAAAA7AAAABAAQACgAAAAwAAAAGAAAAA==', // 45
  'CgAIAAAAAAADAAwAAAAAADwAAAADAAwACAAAAD0AAAADAAwAEAAAAD4AAAADAAwAGAAAAD8AAAADAAwAGAAAADgAAAADAAwAHAAAADkAAAADAAwAIAAAADoAAAADAAwAJAAAADsAAAAEABAAKAAAADgAAAAYAAAA', // 46
  'AwAMAAAAAAA4AAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAADgAAAADAAwAGAAAADkAAAADAAwAHAAAADoAAAADAAwAIAAAADsAAAAEABAAJAAAAFwAAAAUAAAA', // 47
  'AwAMAAAAAABEAAAAUgAMAAAAAAABAAAAJAAYAAAAAAAeAAAABAAAADMzMz8zMzM/JAAYAB4AAAAeAAAABAAAAAAAgD8AAIA/BAAQADwAAAAYAAAAAAAAAA==', // 48
  'DQAUAAAAAAAAAAAAAAAAANsPST4DAAwAAAAAAEAAAAACAAgAMHUAAA==', // 49
  'DQAUAAAAAAAAAAAAAAAAAPrIZb4DAAwAAAAAAEEAAAACAAgAMHUAAA==', // 50
  'DQAUAAAAAAAAAAAAAAAAAJIKBj4DAAwAAAAAAEIAAAACAAgAMHUAAA==', // 51
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAEMAAAACAAgAMHUAAA==', // 52
  'AwAMAAAAAABFAAAAAwAMAAIAAABGAAAAAwAMAAQAAABHAAAAAwAMAAYAAABIAAAAAwAMAAgAAABJAAAAAwAMAAoAAABKAAAAAwAMAAwAAABLAAAAAwAMAA4AAABMAAAABAAQABAAAAAAAAAAAAAAAA==', // 53
  'AwAMAAAAAABNAAAAAwAMAAIAAABOAAAAAwAMAAQAAABPAAAAAwAMAAYAAABQAAAAAwAMAAgAAABRAAAAAwAMAAoAAABSAAAAAwAMAAwAAABTAAAAAwAMAA4AAABUAAAABAAQABAAAAAAAAAAAAAAAA==', // 54
  'AwAMAAAAAABVAAAAAwAMAAIAAABWAAAAAwAMAAQAAABXAAAAAwAMAAYAAABYAAAAAwAMAAgAAABZAAAAAwAMAAoAAABaAAAAAwAMAAwAAABbAAAAAwAMAA4AAABcAAAABAAQABAAAAAAAAAAAAAAAA==', // 55
  'AwAMAAAAAABdAAAAAwAMAAIAAABeAAAAAwAMAAQAAABfAAAAAwAMAAYAAABgAAAAAwAMAAgAAABhAAAAAwAMAAoAAABiAAAAAwAMAAwAAABjAAAAAwAMAA4AAABkAAAABAAQABAAAAAAAAAAAAAAAA==', // 56
  'GQAMAAAAAAABAAAAAwAMAAAAAABlAAAAAwAMAAQAAABmAAAAAwAMAAgAAABnAAAAAwAMAAwAAABoAAAABAAQABAAAAAMAAAAAAAAAA==', // 57
  'GQAMAAAAAAABAAAAAwAMAAAAAABpAAAAAwAMAAQAAABqAAAAAwAMAAgAAABrAAAAAwAMAAwAAABsAAAABAAQABAAAAAMAAAAAAAAAA==', // 58
  'GQAMAAAAAAABAAAAAwAMAAAAAABtAAAAAwAMAAQAAABuAAAAAwAMAAgAAABvAAAAAwAMAAwAAABwAAAABAAQABAAAAAMAAAAAAAAAA==', // 59
  'GQAMAAAAAAABAAAAAwAMAAAAAABxAAAAAwAMAAQAAAByAAAAAwAMAAgAAABzAAAAAwAMAAwAAAB0AAAABAAQABAAAAAMAAAAAAAAAA==', // 60
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHUAAAACAAgAMHUAAA==', // 61
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHYAAAACAAgAMHUAAA==', // 62
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHcAAAACAAgAMHUAAA==', // 63
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHgAAAACAAgAMHUAAA==', // 64
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHUAAAACAAgAMHUAAA==', // 65
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHYAAAACAAgAMHUAAA==', // 66
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHcAAAACAAgAMHUAAA==', // 67
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHgAAAACAAgAMHUAAA==', // 68
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHkAAAACAAgAMHUAAA==', // 69
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHoAAAACAAgAMHUAAA==', // 70
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHsAAAACAAgAMHUAAA==', // 71
  'DQAUAAAAAAAAAAAAAAAAAJIKhr4DAAwAAAAAAHwAAAACAAgAMHUAAA==', // 72
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHkAAAACAAgAMHUAAA==', // 73
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHoAAAACAAgAMHUAAA==', // 74
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHsAAAACAAgAMHUAAA==', // 75
  'DQAUAAAAAAAAAAAAAAAAAJIKhj4DAAwAAAAAAHwAAAACAAgAMHUAAA==', // 76
  'AwAMAAAAAAB9AAAAAwAMAAQAAAB+AAAAAwAMAAgAAAB/AAAAAwAMAAwAAACAAAAABAAQABAAAAAAAAAAAAAAAA==', // 77
  'AwAMAAAAAACEAAAAAwAMAAgAAACDAAAAAwAMABAAAACCAAAAAwAMABgAAACBAAAAAgAIABgAAAA=', // 78
  'CgAIAAAAAAADAAwAAAAAAIQAAAADAAwACAAAAIMAAAADAAwAEAAAAIIAAAADAAwAGAAAAIEAAAACAAgAGAAAAA==', // 79
  'AwAMAAAAAACBAAAAAwAMAAgAAACCAAAAAwAMABAAAACDAAAAAwAMABgAAACEAAAAAwAMABgAAAB9AAAAAwAMABwAAAB+AAAAAwAMACAAAAB/AAAAAwAMACQAAACAAAAABAAQACgAAAAwAAAAGAAAAA==', // 80
  'CgAIAAAAAAADAAwAAAAAAIEAAAADAAwACAAAAIIAAAADAAwAEAAAAIMAAAADAAwAGAAAAIQAAAADAAwAGAAAAH0AAAADAAwAHAAAAH4AAAADAAwAIAAAAH8AAAADAAwAJAAAAIAAAAAEABAAKAAAADgAAAAYAAAA', // 81
  'AwAMAAAAAAB9AAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAAH0AAAADAAwAGAAAAH4AAAADAAwAHAAAAH8AAAADAAwAIAAAAIAAAAAEABAAJAAAAFwAAAAUAAAA', // 82
  'AwAMAAAAAACFAAAAAwAMAAQAAACGAAAAAwAMAAgAAACHAAAAAwAMAAwAAACIAAAABAAQABAAAAAAAAAAAAAAAA==', // 83
  'AwAMAAAAAACMAAAAAwAMAAgAAACLAAAAAwAMABAAAACKAAAAAwAMABgAAACJAAAAAgAIABgAAAA=', // 84
  'CgAIAAAAAAADAAwAAAAAAIwAAAADAAwACAAAAIsAAAADAAwAEAAAAIoAAAADAAwAGAAAAIkAAAACAAgAGAAAAA==', // 85
  'AwAMAAAAAACJAAAAAwAMAAgAAACKAAAAAwAMABAAAACLAAAAAwAMABgAAACMAAAAAwAMABgAAACFAAAAAwAMABwAAACGAAAAAwAMACAAAACHAAAAAwAMACQAAACIAAAABAAQACgAAAAwAAAAGAAAAA==', // 86
  'CgAIAAAAAAADAAwAAAAAAIkAAAADAAwACAAAAIoAAAADAAwAEAAAAIsAAAADAAwAGAAAAIwAAAADAAwAGAAAAIUAAAADAAwAHAAAAIYAAAADAAwAIAAAAIcAAAADAAwAJAAAAIgAAAAEABAAKAAAADgAAAAYAAAA', // 87
  'AwAMAAAAAACFAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAAIUAAAADAAwAGAAAAIYAAAADAAwAHAAAAIcAAAADAAwAIAAAAIgAAAAEABAAJAAAAFwAAAAUAAAA', // 88
  'AwAMAAAAAACNAAAAAwAMAAQAAACOAAAAAwAMAAgAAACPAAAAAwAMAAwAAACQAAAABAAQABAAAAAAAAAAAAAAAA==', // 89
  'AwAMAAAAAACUAAAAAwAMAAgAAACTAAAAAwAMABAAAACSAAAAAwAMABgAAACRAAAAAgAIABgAAAA=', // 90
  'CgAIAAAAAAADAAwAAAAAAJQAAAADAAwACAAAAJMAAAADAAwAEAAAAJIAAAADAAwAGAAAAJEAAAACAAgAGAAAAA==', // 91
  'AwAMAAAAAACRAAAAAwAMAAgAAACSAAAAAwAMABAAAACTAAAAAwAMABgAAACUAAAAAwAMABgAAACNAAAAAwAMABwAAACOAAAAAwAMACAAAACPAAAAAwAMACQAAACQAAAABAAQACgAAAAwAAAAGAAAAA==', // 92
  'CgAIAAAAAAADAAwAAAAAAJEAAAADAAwACAAAAJIAAAADAAwAEAAAAJMAAAADAAwAGAAAAJQAAAADAAwAGAAAAI0AAAADAAwAHAAAAI4AAAADAAwAIAAAAI8AAAADAAwAJAAAAJAAAAAEABAAKAAAADgAAAAYAAAA', // 93
  'AwAMAAAAAACNAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAAI0AAAADAAwAGAAAAI4AAAADAAwAHAAAAI8AAAADAAwAIAAAAJAAAAAEABAAJAAAAFwAAAAUAAAA', // 94
  'AwAMAAAAAACVAAAAAwAMAAQAAACWAAAAAwAMAAgAAACXAAAAAwAMAAwAAACYAAAABAAQABAAAAAAAAAAAAAAAA==', // 95
  'AwAMAAAAAACcAAAAAwAMAAgAAACbAAAAAwAMABAAAACaAAAAAwAMABgAAACZAAAAAgAIABgAAAA=', // 96
  'CgAIAAAAAAADAAwAAAAAAJwAAAADAAwACAAAAJsAAAADAAwAEAAAAJoAAAADAAwAGAAAAJkAAAACAAgAGAAAAA==', // 97
  'AwAMAAAAAACZAAAAAwAMAAgAAACaAAAAAwAMABAAAACbAAAAAwAMABgAAACcAAAAAwAMABgAAACVAAAAAwAMABwAAACWAAAAAwAMACAAAACXAAAAAwAMACQAAACYAAAABAAQACgAAAAwAAAAGAAAAA==', // 98
  'CgAIAAAAAAADAAwAAAAAAJkAAAADAAwACAAAAJoAAAADAAwAEAAAAJsAAAADAAwAGAAAAJwAAAADAAwAGAAAAJUAAAADAAwAHAAAAJYAAAADAAwAIAAAAJcAAAADAAwAJAAAAJgAAAAEABAAKAAAADgAAAAYAAAA', // 99
  'AwAMAAAAAACVAAAACAAMAAAAAAAAAAAABwAQAAAAAAAAAEBBAAAAACIAFAAAAAAAFAAAAAAAAAD/AAAAJAAYAAAAAAAUAAAABAAAAAAAgD8AAIA/AAAIABQAAAADAAwAFAAAAJUAAAADAAwAGAAAAJYAAAADAAwAHAAAAJcAAAADAAwAIAAAAJgAAAAEABAAJAAAAFwAAAAUAAAA', // 100
];

/** The untouched bytecode of one script, or null when the id is unused. */
export const enemyAnmBytes = (script: number): string | null => TH08_ENEMY_ANM_BYTES[script] ?? null;

/**
 * The atlas cell an ECL ANM script shows `age` frames after the enemy spawned.
 * Returns null when the script is unknown or draws nothing.
 */
export function enemyAnimCell(script: number, age: number): number | null {
  const anim = TH08_ENEMY_ANM_SCRIPTS[script];
  if (!anim || anim.total === 0) return null;
  let tick = age % anim.total;
  for (const frame of anim.frames) {
    if (tick < frame.duration) return TH08_ENEMY_ANM_RECTS[frame.sprite] ? frame.sprite : null;
    tick -= frame.duration;
  }
  return null;
}

/** Page rect for an atlas cell. */
export function enemyAnimRect(sprite: number): EnemyAnimRect | null {
  return TH08_ENEMY_ANM_RECTS[sprite] ?? null;
}
