import { TH08Shell } from './games/th08/TH08Shell';
import { setResourceBase } from './engine/core/ResourceResolver';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-root');
  const menuRoot = document.getElementById('menu-root');
  if (!container || !menuRoot) return;

  const baseUrl = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL;
  if (baseUrl) {
    setResourceBase(baseUrl);
  }

  new TH08Shell(container, menuRoot, {
    listenUrlParams: true,
    toggleBodyClass: true,
  }).boot();
});
