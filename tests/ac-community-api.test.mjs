import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet, onRequestPost } from '../functions/api/guestbook.js';

function database(recent = null) {
  const calls = [];
  return { calls, prepare(sql) {
    const call = { sql, args: [] }; calls.push(call);
    return { bind(...args) { call.args = args; return this; },
      async all() { return { results: [] }; },
      async first() { return sql.includes('ip_hash =') ? recent : { total: 0 }; },
      async run() { return { success: true }; }
    };
  } };
}
test('homepage guestbook remains unfiltered; AC view filters entries and count', async () => {
  for (const scope of ['', '?scope=ac-worlds', '?scope=other']) {
    const DB = database();
    const response = await onRequestGet({ env: { DB }, request: new Request('https://site.test/api/guestbook' + scope) });
    assert.equal(response.status, 200);
    assert.equal(DB.calls.length, 2);
    for (const call of DB.calls) assert.equal(call.sql.includes("WHERE message LIKE '[AC Worlds / %'"), scope === '?scope=ac-worlds');
    assert(!DB.calls.some(call => /INSERT|UPDATE|DELETE/.test(call.sql)));
  }
});
const post = (DB, body) => onRequestPost({ env: { DB }, request: new Request('https://site.test/api/guestbook', {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '192.0.2.1' }, body: JSON.stringify(body)
}) });
test('tagged public feedback saves through existing parameterized guestbook insert', async () => {
  const DB = database();
  const message = '[AC Worlds / Suggestion] Please add this quest.';
  const response = await post(DB, { name: 'Visitor', message });
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.entry.message, message);
  const insert = DB.calls.find(call => call.sql.includes('INSERT INTO'));
  assert.equal(insert.args[4], message);
  assert.equal(insert.args[1], 'Visitor');
});
test('existing anti-spam and rate limit apply to feedback', async () => {
  assert.equal((await post(database(), { name: 'Visitor', message: 'hello', website: 'spam' })).status, 400);
  assert.equal((await post(database(), { name: 'Visitor', message: '[AC Worlds / Guestbook] <script>alert(1)</script>' })).status, 400);
  assert.equal((await post(database({ created_at: new Date().toISOString() }), { name: 'Visitor', message: '[AC Worlds / Guestbook] hello' })).status, 429);
});
test('missing database produces honest unavailable status', async () => {
  assert.equal((await onRequestGet({ env: {} })).status, 503);
});
