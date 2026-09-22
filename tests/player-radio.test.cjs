const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

test('verified station bank contains only curated HTTPS streams', () => {
  const bank = JSON.parse(read('player/radio-stations.json'));
  assert.ok(bank.stations.length >= 2);
  for (const station of bank.stations) {
    assert.match(station.stream, /^https:\/\//);
    assert.match(station.homepage, /^https:\/\//);
    assert.ok(station.name);
  }
});

test('VLC-style playlist parser imports HTTPS M3U and PLS entries safely', () => {
  const context = { URL };
  context.globalThis = context;
  vm.runInNewContext(read('player/radio-playlist-core.js'), context);
  const parser = context.AstralisRadioPlaylist;
  const m3u = parser.parsePlaylist(`#EXTM3U\n#EXTINF:-1 group-title="Arizona",KTEST 99.1\nhttps://radio.example/live.mp3\n#EXTINF:-1,Blocked\nhttp://radio.example/insecure.mp3`);
  assert.equal(m3u.stations.length, 1);
  assert.equal(m3u.stations[0].name, 'KTEST 99.1');
  assert.equal(m3u.stations[0]._frequency, 99.1);
  assert.equal(m3u.stations[0].genre, 'Arizona');

  const pls = parser.parsePlaylist(`[playlist]\nFile1=https://radio.example/two.mp3\nTitle1=Station Two`);
  assert.equal(pls.stations.length, 1);
  assert.equal(pls.stations[0].name, 'Station Two');

  const hlsFile = parser.parsePlaylist(`#EXTM3U\n#EXT-X-TARGETDURATION:6\nsegment01.ts`);
  assert.equal(hlsFile.stations.length, 0);
  assert.match(hlsFile.error, /original HTTPS \.m3u8 URL/);
});

test('radio hub exposes all four source banks and official provider launchers', () => {
  const html = read('player/index.html');
  const hub = read('player/radio-hub.js');
  assert.match(hub, /data-radio-bank="verified"/);
  assert.match(hub, /data-radio-bank="community"/);
  assert.match(hub, /data-radio-bank="playlists"/);
  assert.match(hub, /data-radio-bank="astralis"/);
  assert.match(hub, /KMLE \/ Audacy/);
  assert.match(hub, /SiriusXM/);
  assert.match(html, /radio-playlist-core\.js\?v=1/);
  assert.match(html, /radio-hub\.js\?v=1/);
});

test('Astralis Nova Radio uses the owned catalog as a continuous channel', () => {
  const player = read('player/player.js');
  assert.match(player, /playNovaRadio/);
  assert.match(player, /novaRadioMode\|\|shuffle/);
  assert.match(player, /window\.AstralisNovaPlayer=/);
  assert.match(player, /_source:'astralis'/);
});

test('KMLE waits for real playback and keeps the official player available', () => {
  const kmle = read('player/legacy83-kmle-fallback.js');
  const playBody = kmle.slice(kmle.indexOf('async function playKmle'), kmle.indexOf('function stopKmle'));
  assert.doesNotMatch(playBody, /notify\(true\)/);
  assert.match(kmle, /addEventListener\('playing'.*notify\(true\)/);
  assert.match(kmle, /OPEN OFFICIAL KMLE PLAYER/);
  assert.match(kmle, /USE AUDACY/);
});
