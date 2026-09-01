const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
test('Megamix is a playable main catalog track with real assets and no invented streaming links', () => {
  const start = html.indexOf('const songs=');
  const end = html.indexOf('const features=', start);
  const songs = vm.runInNewContext(html.slice(start, end) + ';songs');
  assert.equal(songs.length, 28);
  const song = songs.find(s => s.title === 'Darktide Megamix');
  assert.equal(song.audio, 'Audio/Darktide-Megamix.mp3');
  assert(fs.existsSync(path.join(root, song.audio)));
  assert(fs.existsSync(path.join(root, song.cover)));
  assert(song.siteLink.includes('track=darktide-megamix'));
  assert.equal(song.spotify, undefined);
  assert(html.includes('data-filter="Special mixes"'));
  assert(html.includes('${s.siteLink?'));
  assert(html.includes('data-song-index="${songs.indexOf(s)}"'));
});
test('all homepage inline scripts compile', () => {
  for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) if (match[1].trim()) new vm.Script(match[1]);
});
