import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/guestbook.js';
function database() {
  const calls = [];
  return { calls, prepare(sql) {
    const call = { sql, args: [] }; calls.push(call);
    return { bind(...args) { call.args = args; return this; }, async all() { return { results: [] }; },
      async first() { return sql.includes('ip_hash =') ? null : { total: 0 }; }, async run() { return { success: true }; } };
  } };
}
test('Observation Deck scopes both entries and count without affecting other pages or accepting injected SQL', async () => {
  for (const [scope, expected] of [['our-new-star', "WHERE message LIKE '[Our New Star / %'"], ['ac-worlds', "WHERE message LIKE '[AC Worlds / %'"], ['', null], ["our-new-star' OR 1=1 --", null]]) {
    const DB = database();
    const request = new Request('https://site.test/api/guestbook?scope=' + encodeURIComponent(scope));
    assert.equal((await onRequestGet({ request, env: { DB } })).status, 200);
    assert.equal(DB.calls.length, 2);
    for (const call of DB.calls) assert.equal(expected ? call.sql.includes(expected) : !call.sql.includes('WHERE'), true);
  }
});
test('longest supported topic plus maximum message survives existing storage limit', async () => {
  const DB = database();
  const message = '[Our New Star / Life & consciousness] ' + 'x'.repeat(450);
  assert(message.length <= 500);
  const response = await onRequestPost({ env: { DB }, request: new Request('https://site.test/api/guestbook', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Explorer', message })
  }) });
  assert.equal(response.status, 201);
  assert.equal((await response.json()).entry.message, message);
  assert.equal(DB.calls.find(c => c.sql.includes('INSERT INTO')).args[4], message);
});
