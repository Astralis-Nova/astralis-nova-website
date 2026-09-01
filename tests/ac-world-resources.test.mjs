import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { safeResourceUrl, worldResources } from '../lib/ac-world-resources.js';
import { onRequestGet } from '../functions/api/ac-worlds.js';

test('domain-only websites normalize; unsafe and placeholder values stay absent', () => {
  assert.equal(safeResourceUrl(' sunderingac.com '), 'https://sunderingac.com/');
  assert.equal(safeResourceUrl('gdleac.com'), 'https://gdleac.com/');
  for (const value of ['WIP', '', null, 'javascript:alert(1)', 'data:text/html,test', '//evil.test', 'https://user:pass@example.com', 'not a website']) assert.equal(safeResourceUrl(value), '');
});
test('Discord is explicit, links deduplicate, and current directory values are used', () => {
  const result = worldResources({ name: 'Other', discord_url: 'https://discord.gg/new', website_url: 'https://discord.gg/new' });
  assert.equal(result.length, 1);
  assert.equal(result[0].label, 'Discord');
  assert.equal(result[0].url, 'https://discord.gg/new');
  assert.equal(worldResources({ name: 'FrostfACE' }).length, 0);
  assert.equal(worldResources({ name: 'Other', website: 'https://wiki.example.com' })[0].label, 'World wiki');
});
test('supplemental links never leak between similarly named worlds', () => {
  assert.equal(worldResources({ name: 'DragonMoon' })[0].url, 'https://dragonmoonac.com/index.php/Main_Page');
  assert.equal(worldResources({ name: 'InfiniteLeaftide' })[0].url, 'https://www.leaftidewiki.com/');
  for (const name of ['LeafDawn', 'Leafdawning', 'Infinite Frosthaven', 'DragonMoon Test', '__proto__']) assert.deepEqual(worldResources({ name }), []);
});
test('directory API adds resources without losing population or legacy URL fields', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async url => new Response(JSON.stringify(url.endsWith('/servers.json') ? [
    { name: 'DragonMoon', discord_url: 'https://discord.gg/dragonmoon' },
    { name: 'Harvestbud', website_url: 'gdleac.com' },
    { name: 'FrostfACE' }
  ] : url.includes('player_counts') ? [{ server: 'DragonMoon', count: 12 }] : []));
  try {
    const response = await onRequestGet();
    assert.equal(response.status, 200);
    const data = await response.json();
    assert.equal(data.total, 3);
    const dragon = data.worlds.find(w => w.name === 'DragonMoon');
    assert.equal(dragon.characters, 12);
    assert.equal(dragon.resources.length, 2);
    assert.equal(dragon.discord, 'https://discord.gg/dragonmoon');
    assert.equal(data.worlds.find(w => w.name === 'Harvestbud').website, 'https://gdleac.com/');
    assert.deepEqual(data.worlds.find(w => w.name === 'FrostfACE').resources, []);
  } finally { globalThis.fetch = original; }
});
test('page scripts parse and the rendered card includes community resources', () => {
  const html = readFileSync(new URL('../ac-worlds.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
  assert(html.includes('+features+community+address+'));
  assert(html.includes('esc(r.label'));
  assert(html.includes('No public community links listed yet.'));
  assert(html.includes('href="#ac-community">Suggest a link'));
});
