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
test('unreviewed directory links are never rendered, even if syntactically valid', () => {
  const result = worldResources({ name: 'Other', discord_url: 'https://discord.gg/new', website_url: 'https://discord.gg/new' });
  assert.equal(result.length, 0);
  assert.equal(worldResources({ name: 'FrostfACE' }).length, 0);
  assert.equal(worldResources({ name: 'Other', website: 'https://wiki.example.com' }).length, 0);
  assert.equal(worldResources({ name: 'Conquest', discord_url: 'https://discord.gg/Gsadhhv72S' })[0].verification, 'checked');
  assert.equal(worldResources({ name: 'Conquest', discord_url: 'https://discord.gg/new' }).length, 0);
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
    assert.equal(dragon.resources.length, 1);
    assert.equal(dragon.discord, '');
    assert.equal(data.worlds.find(w => w.name === 'Harvestbud').website, 'https://gdleac.com/');
    assert.deepEqual(data.worlds.find(w => w.name === 'FrostfACE').resources, []);
  } finally { globalThis.fetch = original; }
});
test('page scripts parse and the rendered card includes community resources', () => {
  const html = readFileSync(new URL('../ac-worlds.html', import.meta.url), 'utf8');
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
  assert(html.includes('+features+community+address+'));
  assert(html.includes('esc(r.label'));
  assert(html.includes('No verified community links available.'));
  assert(html.includes("r.verification==='checked'"));
  assert(html.includes('href="#ac-community">Suggest a link'));
});

test('known expired and mismatched invites stay absent; known expiry is enforced', () => {
  for (const [name, code] of [['Nexus','npZw7j6T'],['Doctide','Qts4sF58H6'],['Soulclaim','939ARjY'],['Snowreap','GHKk4ck'],['GDLE Test','jd3dEJf']]) {
    assert.equal(worldResources({ name, discord_url: 'https://discord.gg/'+code }).filter(r=>r.kind==='discord').length, 0);
  }
  const dream = { name: 'DreamWeave', discord_url: 'https://discord.gg/KFnBFpFQV' };
  assert.equal(worldResources(dream, Date.parse('2026-09-01')).length, 1);
  assert.equal(worldResources(dream, Date.parse('2026-09-26')).length, 0);
});
