const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('player equalizer uses the current eqBands container', () => {
  const html = read('player/index.html');
  const player = read('player/player.js');
  assert.match(html, /id="eqBands"/);
  assert.match(player, /\$\('eqBands'\)/);
  assert.doesNotMatch(player, /eqSliders/);
});

test('radio directory only exposes secure streams and uses separate live audio', () => {
  const radio = read('player/legacy83-radio.js');
  assert.match(radio, /is_https:'true'/);
  assert.match(radio, /parsed\.protocol==='https:'/);
  assert.match(radio, /window\.legacy83RadioAudio=radioAudio/);
  assert.match(radio, /STREAM TIMEOUT/);
  assert.match(radio, /https:\/\/kbaq\.streamguys1\.com\/kbaq_mp3_128/);
  assert.match(radio, /https:\/\/kjzz\.streamguys1\.com\/kjzz_mp3_128/);
});

test('KMLE waits for real playback and keeps the official player available', () => {
  const kmle = read('player/legacy83-kmle-fallback.js');
  const playBody = kmle.slice(kmle.indexOf('async function playKmle'), kmle.indexOf('function stopKmle'));
  assert.doesNotMatch(playBody, /notify\(true\)/);
  assert.match(kmle, /addEventListener\('playing'.*notify\(true\)/);
  assert.match(kmle, /OPEN OFFICIAL KMLE PLAYER/);
  assert.match(kmle, /USE AUDACY/);
});
