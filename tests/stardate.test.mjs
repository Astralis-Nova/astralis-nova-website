import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const loadModule = async path => import('data:text/javascript;base64,' + Buffer.from(await readFile(new URL(path, import.meta.url))).toString('base64'));
const { stardateFor } = await loadModule('../galaxy-stardate.js');
const { onRequest } = await loadModule('../functions/api/stardate.js');

test('Stardate rolls over at Phoenix midnight, not UTC midnight', () => {
  assert.equal(stardateFor(new Date('2026-09-30T06:59:59.999Z')), '2026.272');
  assert.equal(stardateFor(new Date('2026-09-30T07:00:00.000Z')), '2026.273');
});
test('Stardate handles leap days and the new year', () => {
  assert.equal(stardateFor(new Date('2028-02-29T19:00:00Z')), '2028.060');
  assert.equal(stardateFor(new Date('2028-12-31T19:00:00Z')), '2028.366');
  assert.equal(stardateFor(new Date('2029-01-01T06:59:59Z')), '2028.366');
  assert.equal(stardateFor(new Date('2029-01-01T07:00:00Z')), '2029.001');
});
test('Arizona midnight remains at UTC 07:00 through summer and winter', () => {
  assert.equal(stardateFor(new Date('2026-07-02T06:59:59Z')), '2026.182');
  assert.equal(stardateFor(new Date('2026-07-02T07:00:00Z')), '2026.183');
  assert.equal(stardateFor(new Date('2026-01-02T06:59:59Z')), '2026.001');
  assert.equal(stardateFor(new Date('2026-01-02T07:00:00Z')), '2026.002');
});
test('Time endpoint supplies fresh server time with caching disabled', async () => {
  const before = Date.now();
  const response = onRequest({ request: new Request('https://example.test/api/stardate') });
  const payload = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
  assert.equal(payload.timeZone, 'America/Phoenix');
  assert(payload.now >= before && payload.now <= Date.now());
});
test('Time endpoint supports HEAD and rejects other methods', async () => {
  const head = onRequest({ request: new Request('https://example.test/api/stardate', { method: 'HEAD' }) });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  const post = onRequest({ request: new Request('https://example.test/api/stardate', { method: 'POST' }) });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});
