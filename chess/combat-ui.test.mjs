import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, script, css, legacyRedirect] = await Promise.all([
  readFile(new URL('./index.html', import.meta.url), 'utf8'),
  readFile(new URL('./chess-combat.js', import.meta.url), 'utf8'),
  readFile(new URL('./astralis-combat.css', import.meta.url), 'utf8'),
  readFile(new URL('./tos-tridimensional.html', import.meta.url), 'utf8'),
]);

test('the retired Tri-D board is absent from navigation and old aliases return to Stellar Conquest', () => {
  assert.doesNotMatch(html, /Tri-D Command Board/);
  assert.match(legacyRedirect, /location\.replace\('\.\/'\+location\.search\+location\.hash\)/);
});

test('selecting a movable unit redraws visible route guides', () => {
  const selectionBranch = script.slice(script.indexOf("if(piece?.color===game.turn())"), script.indexOf('async function attemptMove'));
  assert.match(selectionBranch, /legal=game\.moves/);
  assert.match(selectionBranch, /render\(\);/);
  assert.match(script, /route-label/);
  assert.match(script, /Green MOVE squares are legal; red DUEL squares start combat/);
});

test('the inner grid remains gapless while glass level bands are purely visual', () => {
  assert.match(css, /\.playable-grid\{[^}]*gap:0/);
  assert.match(css, /\.board-square\[data-level="upper"\]/);
  assert.match(css, /\.board-square\[data-level="mid"\]/);
  assert.match(css, /\.board-square\[data-level="lower"\]/);
  assert.doesNotMatch(css, /\.board-square\[data-level="(?:upper|mid|lower)"\][^{]*\{[^}]*transform:/);
});
