import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { worldArtwork } from '../lib/ac-world-art.js';
const root = new URL('../', import.meta.url);

// Directory snapshot checked on 2026-09-01, independent of the artwork registry.
const listedWorlds = ["ACPrime", "AChard", "Asheron4Fun.com", "Buadren AC", "CABA", "Coldeve", "Conquest", "Dekarutide", "Derptide", "Doctide", "DragonMoon", "DreamWeave", "Drunkenfell", "Ebontide", "Eversong", "Frostcull", "FrostfACE", "FunkyTown 2.0", "FunkyTown PK", "Harvestagain", "Harvestbud", "Infinite Frosthaven", "InfiniteLeaftide", "Jellocull", "LeafDawn", "Leafdawning", "Levistras", "Mistwood", "Modclaim", "Morgentau", "MorningStorm", "Newfoundland", "Nexus", "NoESCapeGames", "PortalStorm", "Reefcull", "Seedsow", "Shadowgain", "Shadowland", "Snowreap", "Soulclaim", "Sundering", "The Tower", "Thistlecrown", "Unfamiliar Shores"];

test('all 45 listed worlds have distinct image files and stable assignments', () => {
  const paths = new Set();
  const hashes = new Set();
  const assignments = listedWorlds.map(name => [name, worldArtwork(name)]);
  for (const [name, art] of assignments) {
    assert(art?.image, 'Missing artwork: ' + name);
    const file = new URL(art.image.slice(1), root);
    assert(existsSync(file), 'Missing image: ' + name);
    assert(!paths.has(art.image), 'Reused image path: ' + name);
    paths.add(art.image);
    const hash = createHash('sha256').update(readFileSync(file)).digest('hex');
    assert(!hashes.has(hash), 'Reused image bytes: ' + name);
    hashes.add(hash);
    assert(art.source.startsWith('https://'));
    assert.equal(typeof art.associated, 'boolean');
    assert(art.label.length > 5);
  }
  for (const [name, art] of assignments.reverse()) {
    assert.deepEqual(worldArtwork(name), art, 'Sorting must not change artwork');
    assert.deepEqual(worldArtwork('  '+name.toUpperCase()+'  '), art);
  }
});

test('unknown or similar names cannot borrow another world image', () => {
  for (const name of ['', '__proto__', 'constructor', 'Derptide Test', 'DragonMoon Test', 'A new world']) {
    assert.equal(worldArtwork(name), null);
  }
  for (const name of ['Derptide','Asheron4Fun.com','Drunkenfell']) {
    assert.equal(worldArtwork(name).associated, true);
  }
  assert.notDeepEqual(worldArtwork('LeafDawn'), worldArtwork('Leafdawning'));
  assert.notDeepEqual(worldArtwork('FunkyTown 2.0'), worldArtwork('FunkyTown PK'));
});

test('portal and title share a stage with pause controls preserved; card images lazy-load', () => {
  const html = readFileSync(new URL('ac-worlds.html', root), 'utf8');
  const css = readFileSync(new URL('ac-adventure.css', root), 'utf8');
  assert.match(html, /class="hero-title-stage"><figure class="portal-art">[\s\S]*?id="portalSpaceToggle"[\s\S]*?<\/figure><h1 id="acWorldsTitle">/);
  assert(css.includes('.hero .hero-title-stage .portal-art{position:absolute;'));
  assert(css.includes('pointer-events:auto'));
  assert.match(html, /class="world-art-image"[\s\S]*?loading="lazy" decoding="async"/);
  assert(html.includes('AC archive artwork'));
  assert(!html.includes("art.image:'/assets/ac-portals/portal-gateway.jpg'"));
  assert(css.includes('.world[data-art-layout="none"]{padding-top:18px}'));
  assert(html.includes('esc(artPath)'));
});
