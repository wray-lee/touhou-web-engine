import { mkdirSync } from 'node:fs';
import { Canvas, savePng } from './png.mjs';
import { paintCharacter } from './characters.mjs';
import { BOSSES, ENEMIES, SAKUYA } from './specs.mjs';

/** Composite named canvases onto a dark, numbered contact sheet. */
export function contactSheet(entries, outPath, opts = {}) {
  const cols = opts.cols ?? 4;
  const cell = opts.cell ?? 150;
  const rows = Math.ceil(entries.length / cols);
  const sheet = new Canvas(cols * cell, rows * (cell + 18));
  for (let y = 0; y < sheet.height; y++) {
    const t = y / sheet.height;
    sheet.fillRect(0, y, sheet.width, 1, [0x1a + t * 12, 0x17 + t * 10, 0x26 + t * 14]);
  }
  entries.forEach((e, i) => {
    const gx = (i % cols) * cell;
    const gy = Math.floor(i / cols) * (cell + 18);
    sheet.strokeRect(gx + 2, gy + 2, cell - 4, cell - 4, 1, 0x443c5c);
    const c = e.canvas;
    const s = Math.min((cell - 18) / c.width, (cell - 18) / c.height);
    const scaled = c.resize(Math.max(1, Math.round(c.width * s)), Math.max(1, Math.round(c.height * s)));
    sheet.blit(scaled, Math.round(gx + (cell - scaled.width) / 2), Math.round(gy + (cell - scaled.height) / 2));
    sheet.text(String(i + 1), gx + 6, gy + cell - 15, { size: 12, color: 0xe4d8ee });
  });
  mkdirSync(outPath.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
  savePng(outPath, sheet);
  return outPath;
}

export function characterEntries() {
  return [
    ...Object.entries(BOSSES).map(([k, v]) => ({ key: k, canvas: paintCharacter(v) })),
    ...Object.entries(ENEMIES).map(([k, v]) => ({ key: k, canvas: paintCharacter(v) })),
    { key: 'sakuya', canvas: paintCharacter(SAKUYA) },
  ];
}

export function previewCharacters(outPath) {
  return contactSheet(characterEntries(), outPath, { cols: 5, cell: 150 });
}
