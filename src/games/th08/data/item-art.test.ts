import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ITEM_SPECS, ItemKind } from '../../../touhou-common/item/Item';
import { DROP_TABLE } from '../../../touhou-common/item/ItemSystem';
import { ASSET_MANIFEST } from './asset-manifest';
import { TAISEI_ITEM_ICON } from './taisei-ui';

/**
 * Drop items are the one TH08 system whose art comes straight from upstream, so
 * a missing texture here is exactly the "still looks like a demo" regression the
 * rest of this suite guards against. Every kind the drop table can roll must
 * resolve to a manifest entry backed by a real file on disk.
 */
/** Manifest URLs are site-absolute, so strip the leading slash before joining. */
function publicPath(url: string): string {
  return join('public', url.replace(/^\//, ''));
}

const ROLLABLE_KINDS = new Set<ItemKind>();
for (const tier of Object.values(DROP_TABLE)) {
  if (tier.power > 0) ROLLABLE_KINDS.add('power');
  if (tier.powerSmall > 0) ROLLABLE_KINDS.add('powerSmall');
  if (tier.point > 0) ROLLABLE_KINDS.add('point');
  if (tier.rare > 0) {
    ROLLABLE_KINDS.add('life');
    ROLLABLE_KINDS.add('bomb');
  }
}

describe('Taisei drop-item art', () => {
  it('covers every kind the drop table can roll', () => {
    for (const kind of ROLLABLE_KINDS) {
      expect(ITEM_SPECS[kind], kind).toBeDefined();
    }
  });

  it('points each spec at a vendored Taisei item texture', () => {
    for (const [kind, spec] of Object.entries(ITEM_SPECS)) {
      expect(spec.sprite, kind).toMatch(/^taisei:item:/);
    }
  });

  it('resolves every spec sprite through the asset manifest to a real file', () => {
    for (const [kind, spec] of Object.entries(ITEM_SPECS)) {
      const url = ASSET_MANIFEST[spec.sprite];
      expect(url, kind + ' missing from ASSET_MANIFEST').toBeTruthy();
      expect(existsSync(publicPath(url)), kind + ' -> ' + url).toBe(true);
    }
  });

  it('keeps the HUD icon map pointing at real files', () => {
    for (const [kind, url] of Object.entries(TAISEI_ITEM_ICON)) {
      expect(existsSync(publicPath(url)), kind + ' -> ' + url).toBe(true);
    }
  });
});
