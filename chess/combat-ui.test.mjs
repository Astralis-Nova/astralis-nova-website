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

test('the inner grid remains gapless while opposing 4x4 quadrants rise in clear glass', () => {
  assert.match(css, /\.playable-grid\{[^}]*gap:0/);
  assert.match(css, /\.board-square\[data-level="upper"\]/);
  assert.match(css, /\.board-square\[data-level="mid"\]/);
  assert.match(css, /\.board-square\[data-level="lower"\]/);
  assert.match(script, /const raised=\(row<4&&column>=4\)\|\|\(row>=4&&column<4\)/);
  assert.match(css, /\.board-square\[data-platform="raised"\][^{]*\{[^}]*transform:translateY\(-14px\)/);
  assert.match(css, /\.playable-grid::before,\.playable-grid::after/);
  assert.match(css, /\.board-square\{[^}]*rgba\(229,251,255,\.095\)/);
  assert.match(script, /document\.elementFromPoint\(event\.clientX,event\.clientY\)/);
});

test('new campaigns use rotating legal mission formations', () => {
  assert.match(html, /astralis-combat\.css\?v=3/);
  assert.match(html, /New Random Campaign/);
  assert.match(script, /chooseMission\(Math\.random,lastMission\)/);
  assert.match(script, /for\(const move of mission\.moves\)game\.move\(move\)/);
  assert.match(script, /startRandomCampaign\(\);/);
});
