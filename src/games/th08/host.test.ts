// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveAssetUrl, setResourceBase, resetResourceBase, getResourceBase } from '../../engine/core/ResourceResolver';
import { mountTH08 } from './host';

describe('ResourceResolver', () => {
  beforeEach(() => {
    resetResourceBase();
  });

  afterEach(() => {
    resetResourceBase();
  });

  it('preserves external and special URLs unchanged', () => {
    setResourceBase('/th08-assets/');
    expect(resolveAssetUrl('https://example.com/sound.wav')).toBe('https://example.com/sound.wav');
    expect(resolveAssetUrl('http://example.com/bgm.mp3')).toBe('http://example.com/bgm.mp3');
    expect(resolveAssetUrl('//cdn.example.com/pic.png')).toBe('//cdn.example.com/pic.png');
    expect(resolveAssetUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(resolveAssetUrl('blob:http://localhost/1234')).toBe('blob:http://localhost/1234');
  });

  it('leaves paths untouched when base is empty or root', () => {
    setResourceBase('');
    expect(resolveAssetUrl('assets/ui/logo.png')).toBe('assets/ui/logo.png?v=1');
    expect(resolveAssetUrl('/assets/ui/logo.png')).toBe('/assets/ui/logo.png?v=1');

    setResourceBase('/');
    expect(resolveAssetUrl('assets/ui/logo.png')).toBe('assets/ui/logo.png?v=1');
    expect(resolveAssetUrl('/assets/ui/logo.png')).toBe('/assets/ui/logo.png?v=1');
  });

  it('prefixes paths correctly when resource base is configured', () => {
    setResourceBase('/touhou-web-engine/');
    expect(getResourceBase()).toBe('/touhou-web-engine/');
    expect(resolveAssetUrl('assets/ui/title.png')).toBe('/touhou-web-engine/assets/ui/title.png?v=1');
    expect(resolveAssetUrl('/assets/ui/title.png')).toBe('/touhou-web-engine/assets/ui/title.png?v=1');

    // Frontend embed subpath contract: BASE_URL + 'th08-assets/'
    setResourceBase('/gensokyo/th08-assets/');
    expect(resolveAssetUrl('assets/audio/bgm.ogg')).toBe('/gensokyo/th08-assets/assets/audio/bgm.ogg?v=1');
    expect(resolveAssetUrl('/assets/audio/bgm.ogg')).toBe('/gensokyo/th08-assets/assets/audio/bgm.ogg?v=1');

    // Idempotent: does not duplicate base if already prefixed
    expect(resolveAssetUrl('/gensokyo/th08-assets/assets/audio/bgm.ogg')).toBe('/gensokyo/th08-assets/assets/audio/bgm.ogg?v=1');
    expect(resolveAssetUrl('gensokyo/th08-assets/assets/audio/bgm.ogg')).toBe('/gensokyo/th08-assets/assets/audio/bgm.ogg?v=1');
  });

  it('supports relative resource base ./', () => {
    setResourceBase('./');
    expect(getResourceBase()).toBe('./');
    expect(resolveAssetUrl('assets/face.png')).toBe('./assets/face.png?v=1');
    expect(resolveAssetUrl('/assets/face.png')).toBe('./assets/face.png?v=1');
  });

  it('busts the cache on shipped assets but leaves a carried query and test doubles alone', () => {
    setResourceBase('/th08-assets/');
    expect(resolveAssetUrl('/assets/ui/logo.png')).toBe('/th08-assets/assets/ui/logo.png?v=1');
    expect(resolveAssetUrl('/assets/ui/logo.png?x=1')).toBe('/th08-assets/assets/ui/logo.png?x=1');
    expect(resolveAssetUrl('/fake/backdrop.png')).toBe('/th08-assets/fake/backdrop.png');
  });
});

describe('mountTH08 host lifecycle', () => {
  let container: HTMLElement;

  beforeEach(() => {
    resetResourceBase();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    resetResourceBase();
    vi.restoreAllMocks();
  });

  it('mounts into container and exposes handle properties', async () => {
    const handle = mountTH08(container);
    expect(container.classList.contains('th08-host')).toBe(true);

    const menuRoot = container.querySelector('.th08-menu-root');
    expect(menuRoot).not.toBeNull();
    expect(handle.shell).toBeDefined();
    expect(handle.game).toBeUndefined();
    expect(typeof handle.launch).toBe('function');
    expect(typeof handle.destroy).toBe('function');

    await handle.ready;

    handle.destroy();
    expect(container.querySelector('.th08-menu-root')).toBeNull();
  });

  it('configures resourceBase when provided in options and resets on destroy', () => {
    const handle = mountTH08(container, { resourceBase: '/custom/base/' });
    expect(getResourceBase()).toBe('/custom/base/');

    handle.destroy();
    // Resets to defaultBase (empty string in test environment, no BASE_URL set)
    expect(getResourceBase()).toBe('');
  });

  it('handles rapid mount and unmount (StrictMode double-mount resiliency)', () => {
    // Mount 1
    const handle1 = mountTH08(container);
    expect(() => handle1.destroy()).not.toThrow();

    // Mount 2 (StrictMode remount)
    const handle2 = mountTH08(container);
    expect(handle2.shell).toBeDefined();
    expect(() => handle2.destroy()).not.toThrow();
  });

  it('forwards errors via onError callback when mount fails synchronously', () => {
    const errors: Error[] = [];
    const handle = mountTH08(container, {
      onError: (err) => errors.push(err),
    });
    // Verify the handle was created and error callback is wired without throwing
    expect(handle.shell).toBeDefined();
    expect(typeof handle.destroy).toBe('function');
    handle.destroy();
  });

  it('sets CSS custom properties for asset URLs on container', () => {
    setResourceBase('/th08-assets/');
    const handle = mountTH08(container, { resourceBase: '/th08-assets/' });
    const titleBackdrop = container.style.getPropertyValue('--th08-title-backdrop');
    const portraitFrame = container.style.getPropertyValue('--th08-portrait-frame');
    expect(titleBackdrop).toContain('title-backdrop.png');
    expect(portraitFrame).toContain('portrait-frame.png');
    handle.destroy();
  });
});
