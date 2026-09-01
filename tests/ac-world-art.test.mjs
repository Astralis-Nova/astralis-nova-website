import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { worldArtwork } from '../lib/ac-world-art.js';
import { verifiedWorldLinks } from '../lib/ac-verified-links.js';
const root = new URL('../', import.meta.url);

test('server artwork maps only to its own world; other worlds are explicitly shared scenes', () => {
  for (const name of ['Derptide','Asheron4Fun.com','Drunkenfell']) {
    const art = worldArtwork(name);
    assert.equal(art.associated, true);
    assert(existsSync(new URL(art.image.slice(1), root)));
    assert(art.source.startsWith('https://'));
  }
  for (const name of ['Conquest','DragonMoon','DreamWeave','InfiniteLeaftide','Derptide Test','__proto__',...verifiedWorldLinks.map(r=>r.world)]) {
    const art = worldArtwork(name);
    assert(existsSync(new URL(art.image.slice(1), root)));
    if (!['Derptide','Asheron4Fun.com','Drunkenfell'].includes(name)) {
      assert.equal(art.associated, false);
      assert.equal(art.label, 'Shared Dereth scenery');
    }
    assert.deepEqual(worldArtwork(name), worldArtwork(name));
  }
});

test('portal and title share a stage with pause controls preserved; card images lazy-load', () => {
  const html = readFileSync(new URL('ac-worlds.html', root), 'utf8');
  const css = readFileSync(new URL('ac-adventure.css', root), 'utf8');
  assert.match(html, /class="hero-title-stage"><figure class="portal-art">[\s\S]*?id="portalSpaceToggle"[\s\S]*?<\/figure><h1 id="acWorldsTitle">/);
  assert(css.includes('.hero .hero-title-stage .portal-art{position:absolute;'));
  assert(css.includes('pointer-events:auto'));
  assert.match(html, /class="world-art-image"[\s\S]*?loading="lazy" decoding="async"/);
  assert(html.includes('Shared AC scenery'));
  assert(html.includes('esc(artPath)'));
});
