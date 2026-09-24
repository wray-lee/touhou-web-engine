import { TH08Game } from './TH08Game';
import { TH08Shell, type TH08ShellOptions } from './TH08Shell';
import type { GameSelection, ResultsReport } from './ui/TH08Menu';
import type { PlayerPrefs } from './ui/PlayerPrefs';
import { setResourceBase, resetResourceBase, resolveAssetUrl } from '../../engine/core/ResourceResolver';

export type { GameSelection, ResultsReport };

export interface TH08HostOptions extends TH08ShellOptions {
  /** Optional custom game container element. If omitted, a `.th08-game-root` is appended to container. */
  gameRoot?: HTMLElement;
  /** Optional custom menu container element. If omitted, a `.th08-menu-root` is appended to container. */
  menuRoot?: HTMLElement;
  /**
   * Base URL for loading assets (e.g. '/th08-assets/', './', or custom CDN URL).
   * Overrides the default resource base while this host is mounted.
   */
  resourceBase?: string;
  /** Immediately launch into game instead of title menu. */
  autostart?: boolean | GameSelection;
}

export type TH08HostStatus = 'title' | 'running' | 'destroyed';

export interface TH08HostState {
  status: TH08HostStatus;
}

export interface TH08HostHandle {
  /** The instantiated shell controller. */
  readonly shell: TH08Shell;
  /** Currently active game instance, if a run has started. */
  readonly game: TH08Game | undefined;
  /** Function returning active game instance. */
  getGame(): TH08Game | undefined;
  /** Host lifecycle state. */
  getState(): TH08HostState;
  /** Promise that resolves when initial setup/boot completes. */
  readonly ready: Promise<void>;
  /** Update player preferences (volumes, controls, skin). */
  updatePrefs(prefs: Partial<PlayerPrefs>): void;
  /** Launch a specific team / difficulty / stage selection. */
  launch(selection: GameSelection): Promise<void>;
  /** Teardown all resources, DOM elements, and listeners. */
  destroy(): void;
}

let activeHostCount = 0;

/**
 * Mounts the TH08 game shell into a host DOM element.
 *
 * Designed for embedding into host frameworks (e.g. React 18, Vue) with full
 * resiliency against rapid unmount and StrictMode double-mounting.
 */
export function mountTH08(
  container: HTMLElement,
  options: TH08HostOptions = {},
): TH08HostHandle {
  let destroyed = false;
  let status: TH08HostStatus = 'title';
  let createdGame = false;
  let createdMenu = false;
  let gameRoot = options.gameRoot;
  let menuRoot = options.menuRoot;

  if (options.resourceBase !== undefined) {
    setResourceBase(options.resourceBase);
  }
  activeHostCount++;

  // Ensure host container has scoped styling class and backdrop properties
  if (!container.classList.contains('th08-host') && container.id !== 'game-root') {
    container.classList.add('th08-host');
  }
  container.style.setProperty('--th08-title-backdrop', `url("${resolveAssetUrl('/assets/ui/title-backdrop.png')}")`);
  container.style.setProperty('--th08-portrait-frame', `url("${resolveAssetUrl('/assets/ui/portrait-frame.png')}")`);

  if (!gameRoot) {
    gameRoot = document.createElement('div');
    gameRoot.className = 'th08-game-root';
    container.appendChild(gameRoot);
    createdGame = true;
  }

  if (!menuRoot) {
    menuRoot = document.createElement('div');
    menuRoot.className = 'th08-menu-root';
    container.appendChild(menuRoot);
    createdMenu = true;
  }

  const shell = new TH08Shell(gameRoot, menuRoot, {
    listenUrlParams: options.listenUrlParams ?? false,
    toggleBodyClass: options.toggleBodyClass ?? false,
    onStageClear: options.onStageClear,
    onError: options.onError,
  });

  const readyPromise = (async () => {
    if (destroyed) return;
    try {
      if (options.autostart) {
        status = 'running';
        const selection: GameSelection =
          typeof options.autostart === 'object'
            ? options.autostart
            : {
                character: 'reimu-yukari',
                difficulty: 'normal',
                stage: 1,
                campaign: true,
              };
        await shell.launch(selection);
      } else {
        await shell.boot();
      }
    } catch (err) {
      if (!destroyed) {
        const error = err instanceof Error ? err : new Error(String(err));
        options.onError?.(error);
        throw error;
      }
    }
  })();

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    status = 'destroyed';

    shell.destroy();

    if (createdGame && gameRoot && gameRoot.parentElement === container) {
      gameRoot.remove();
    }
    if (createdMenu && menuRoot && menuRoot.parentElement === container) {
      menuRoot.remove();
    }

    activeHostCount = Math.max(0, activeHostCount - 1);
    if (activeHostCount === 0) {
      resetResourceBase();
    }
  };

  return {
    get shell() {
      return shell;
    },
    get game() {
      return shell.getGame();
    },
    getGame: () => shell.getGame(),
    getState: () => ({
      status: destroyed ? 'destroyed' : shell.getGame() ? 'running' : status,
    }),
    ready: readyPromise,
    updatePrefs: (prefs: Partial<PlayerPrefs>) => {
      shell.applyPrefs(prefs);
    },
    launch: async (selection: GameSelection) => {
      if (destroyed) return;
      status = 'running';
      await shell.launch(selection);
    },
    destroy,
  };
}
