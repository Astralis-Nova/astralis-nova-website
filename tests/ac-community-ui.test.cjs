const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../ac-community.js'), 'utf8');
function node() {
  return { children: [], handlers: {}, value: '', textContent: '', disabled: false,
    addEventListener(event, fn) { this.handlers[event] = fn; },
    dispatchEvent(event) { this.handlers[event.type]?.(event); },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    reportValidity() { return true; }, reset() { this.wasReset = true; }
  };
}
function setup(failPost = false) {
  const ids = Object.fromEntries(['conquest-quests','questSearch','questServer','questType','databaseTarget','acFeedbackForm','acFeedbackEntries','acFeedbackStatus','acFeedbackCount','acFeedbackSubmit','acFeedbackRefresh'].map(id => [id, node()]));
  const conquest = node(), general = node();
  const requests = [];
  const values = { name: '<img onerror=alert(1)>', kind: 'Suggestion', message: 'Please fix the quest link.', website: '' };
  vm.runInNewContext(source, {
    document: { getElementById: id => ids[id], createElement: () => node(), querySelectorAll: selector => selector.includes('#conquest-quests') ? [conquest] : [general] },
    window: { addEventListener() {} }, location: { hash: '' }, Event: class { constructor(type) { this.type = type; } },
    FormData: class { get(key) { return values[key]; } }, AbortController, setTimeout, clearTimeout,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { ok: !failPost, json: async () => failPost ? { error: 'Please wait 30 seconds before signing again.' } : { entry: { id: 'test-only', name: body.name, message: body.message, created_at: '2026-09-01T00:00:00Z' } } };
      }
      return { ok: true, json: async () => ({ entries: [] }) };
    }
  });
  return { ids, conquest, general, requests, values };
}
const tick = () => new Promise(resolve => setImmediate(resolve));
test('Conquest shortcut opens catalog, resets filter, and selects Conquest; general shortcut restores all sources', async () => {
  const s = setup(); await tick();
  s.ids.questSearch.value = 'diamond heart'; s.ids.questType.value = 'Boss encounter';
  s.conquest.handlers.click();
  assert.equal(s.ids['conquest-quests'].open, true);
  assert.equal(s.ids.questServer.value, 'Conquest');
  assert.equal(s.ids.databaseTarget.value, 'conquest');
  assert.equal(s.ids.questType.value, 'all');
  assert.equal(s.ids.questSearch.value, '');
  s.general.handlers.click();
  assert.equal(s.ids['conquest-quests'].open, false);
  assert.equal(s.ids.questServer.value, 'all');
});
test('public post uses existing endpoint, shows confirmed entry as text, and resets only after success', async () => {
  const s = setup(); await tick();
  await s.ids.acFeedbackForm.handlers.submit({ preventDefault() {} });
  const posted = s.requests.find(r => r.options.method === 'POST');
  assert.equal(posted.url, '/api/guestbook');
  assert.equal(JSON.parse(posted.options.body).message, '[AC Worlds / Suggestion] Please fix the quest link.');
  assert.equal(s.ids.acFeedbackEntries.children[0].children[0].textContent, '<img onerror=alert(1)>');
  assert.equal(s.ids.acFeedbackForm.wasReset, true);
  assert.equal(s.ids.acFeedbackSubmit.disabled, false);
});
test('failed post preserves form and displays server error', async () => {
  const s = setup(true); await tick();
  await s.ids.acFeedbackForm.handlers.submit({ preventDefault() {} });
  assert.equal(s.ids.acFeedbackForm.wasReset, undefined);
  assert.match(s.ids.acFeedbackStatus.textContent, /wait 30 seconds/);
  assert.equal(s.ids.acFeedbackSubmit.disabled, false);
});
