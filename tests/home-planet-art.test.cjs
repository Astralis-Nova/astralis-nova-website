const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { resolve } = require('node:path');

test('deferred exoplanet decoration preserves renderer-owned cinematic artwork', () => {
  const visited = [];
  const cards = ['first-orbit', 'scripture-nexus', 'faith-stories', 'wild-encounters'].map(world => ({
    dataset: { world },
    classList: { contains(name) { visited.push(world); return name === 'cinematic-world'; } },
    querySelector() { assert.fail(`Deferred decoration tried to replace ${world}`); }
  }));
  const section = { dataset: {}, querySelectorAll: () => cards, querySelector: () => null };
  const document = {
    getElementById: id => id === 'connected-worlds' ? section : null,
    createElement: () => ({}),
    head: { appendChild() {} }
  };
  runInNewContext(readFileSync(resolve(__dirname, '../recent-exoplanets.js'), 'utf8'), { document });
  assert.deepEqual(visited, cards.map(card => card.dataset.world));
});
