import { InputSystem, DEFAULT_KEY_BINDINGS } from '../src/engine/core/InputSystem.ts';
import type { InputAction } from '../src/engine/core/InputSystem.ts';

/** The eight gameplay bindings the panel highlights (debug keys excluded). */
const ACTIONS: InputAction[] = [
  'up',
  'down',
  'left',
  'right',
  'shoot',
  'bomb',
  'slow',
  'pause',
];

const bindingsEl = document.getElementById('bindings')!;
const rawEl = document.getElementById('raw')!;
const padsEl = document.getElementById('gamepads')!;
const dragEl = document.getElementById('drag-area')!;

// ---- binding chips (labels come from the engine's own defaults) ----
const bindings = new InputSystem().getBindings();
const chips = new Map<InputAction, HTMLElement>();
for (const action of ACTIONS) {
  const chip = document.createElement('div');
  chip.className = 'chip';
  const label = document.createElement('div');
  label.className = 'action';
  label.textContent = action;
  const keys = document.createElement('div');
  keys.className = 'keys';
  keys.textContent = (bindings[action] ?? DEFAULT_KEY_BINDINGS[action] ?? []).join(' / ');
  chip.append(label, keys);
  bindingsEl.appendChild(chip);
  chips.set(action, chip);
}

// ---- live input state ----
const input = new InputSystem();
input.attach(dragEl as HTMLElement);

let lastCode = '—';
window.addEventListener('keydown', (e) => {
  lastCode = e.code;
});

function renderGamepads(): void {
  if (typeof navigator.getGamepads !== 'function') {
    padsEl.textContent = 'gamepads: API 不可用';
    return;
  }
  const pads = Array.from(navigator.getGamepads()).filter((p): p is Gamepad => !!p);
  if (pads.length === 0) {
    padsEl.textContent = 'gamepads: 未检测到（连接手柄后按任意键）';
    return;
  }
  padsEl.textContent = pads
    .map((pad) => {
      const buttons = pad.buttons
        .map((b, i) => (b.pressed ? String(i) : ''))
        .filter(Boolean)
        .join(',');
      const axes = pad.axes.map((a) => a.toFixed(2)).join(' ');
      return `${pad.id}\n  connected: ${pad.connected}  mapping: ${pad.mapping}\n  buttons down: ${buttons || '—'}\n  axes: ${axes}`;
    })
    .join('\n\n');
}

function frame(): void {
  input.update();
  const active = new Set(input.getActiveActions());
  for (const [action, chip] of chips) {
    chip.classList.toggle('active', active.has(action));
  }
  const mv = input.getMovementVector();
  rawEl.textContent =
    `last key code: ${lastCode}` +
    `  |  movement: (${mv.x.toFixed(2)}, ${mv.y.toFixed(2)})` +
    `  |  drag: ${input.isDragging ? `(${input.pointerPos.x.toFixed(0)}, ${input.pointerPos.y.toFixed(0)})` : 'no'}`;
  dragEl.classList.toggle('dragging', input.isDragging);
  dragEl.textContent = input.isDragging
    ? `拖拽中 → 局部坐标 (${input.pointerPos.x.toFixed(0)}, ${input.pointerPos.y.toFixed(0)})`
    : '在此拖动（模拟触屏自机）';
  renderGamepads();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
