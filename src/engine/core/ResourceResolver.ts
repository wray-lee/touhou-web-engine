/**
 * Centralized resource base resolver for the engine.
 *
 * Handles base paths (e.g. '/' or '/touhou-web-engine/' or '/th08-assets/'),
 * leaving absolute URLs (http://, https://), protocol-relative (//), data: and blob: untouched.
 */

// ponytail: single active host base with safe reset; fallback to Vite BASE_URL or root
const defaultBase: string =
  (typeof import.meta !== 'undefined' &&
  (import.meta as { env?: { BASE_URL?: string } }).env &&
  typeof (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL === 'string' &&
  (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL !== '/'
    ? (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL
    : '') || '';

let currentBase: string = defaultBase;

// Appended to resolved asset URLs so a long-lived CDN cache of a 404 does not
// outlive the file appearing. Bump when the shipped asset set changes.
const ASSET_REV = '1';

function withRev(url: string): string {
  // Only the shipped asset tree, written both as '/assets/...' and 'assets/...'.
  // 'th08-assets' is a base, not the tree, and test doubles live under /fake.
  const path = url.startsWith('/') ? url : `/${url}`;
  if (!ASSET_REV || url.includes('?') || !path.includes('/assets/')) return url;
  return `${url}?v=${ASSET_REV}`;
}

export function setResourceBase(base: string): void {
  if (!base || base === '.' || base === './') {
    currentBase = base === '.' || base === './' ? './' : '';
    return;
  }
  currentBase = base.endsWith('/') ? base : `${base}/`;
}

export function getResourceBase(): string {
  return currentBase;
}

export function resetResourceBase(): void {
  currentBase = defaultBase;
}

export function resolveAssetUrl(url: string, base: string = currentBase): string {
  if (!url || typeof url !== 'string') return url;
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//')
  ) {
    return url;
  }

  if (!base || base === '/') {
    return withRev(url);
  }

  const cleanBase = base.endsWith('/') ? base : `${base}/`;

  // If url is already prefixed with cleanBase, avoid duplicate prefix
  if (url === cleanBase || url.startsWith(cleanBase)) {
    return withRev(url);
  }

  const pathWithoutLeadingSlash = url.startsWith('/') ? url.slice(1) : url;
  if (cleanBase !== './') {
    const baseWithoutLeadingSlash = cleanBase.startsWith('/') ? cleanBase.slice(1) : cleanBase;
    if (pathWithoutLeadingSlash.startsWith(baseWithoutLeadingSlash)) {
      return withRev(cleanBase.startsWith('/') ? `/${pathWithoutLeadingSlash}` : pathWithoutLeadingSlash);
    }
  }

  return withRev(`${cleanBase}${pathWithoutLeadingSlash}`);
}
