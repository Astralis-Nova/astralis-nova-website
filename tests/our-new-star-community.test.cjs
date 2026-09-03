const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../our-new-star-community.js'), 'utf8');
const tick = () => new Promise(resolve => setImmediate(resolve));
function node(tag) {
  return { tag, children: [], handlers: {}, attrs: {}, value: '', textContent: '', disabled: false,
    addEventListener(key, fn) { this.handlers[key] = fn; },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(key, value) { this.attrs[key] = value; },
    reportValidity() { return true; }, focus() { this.focused = true; }
  };
}
function setup({ failPost = false, entries = [], deferredGet = false } = {}) {
  const ids = Object.fromEntries(['observationForm','observationEntries','observationStatus','observationCount','observationSubmit','observationRefresh','observationMessage','observationTopic'].map(id => [id, node()]));
  ids.observationMessage.value = 'A question about stars.';
  ids.observationTopic.value = 'Space';
  const requests = [];
  let releaseGet;
  vm.runInNewContext(source, {
    document: { getElementById: id => ids[id], createElement: node },
    FormData: class { get(key) { return { name: '<img onerror=alert(1)>', topic: ids.observationTopic.value, message: ids.observationMessage.value, website: '' }[key]; } },
    AbortController, URL, setTimeout, clearTimeout,
    fetch: async (url, options) => {
      requests.push({ url, options });
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { ok: !failPost, json: async () => failPost ? { error: 'Please wait 30 seconds before signing again.' } : { entry: { id: 'new', name: body.name, message: body.message, created_at: '2026-09-03T00:00:00Z' } } };
      }
      if (deferredGet) await new Promise(resolve => { releaseGet = resolve; });
      return { ok: true, json: async () => ({ entries }) };
    }
  });
  return { ids, requests, releaseGet: () => releaseGet() };
}
test('scope excludes other-page notes; source links and names render safely; replies preserve drafts', async () => {
  const s = setup({ entries: [
    { id: 'old', name: '<img onerror=alert(1)>', message: '[Our New Star / Research] Read https://science.nasa.gov/ems/.', created_at: '2026-09-03T00:00:00Z' },
    { id: 'ac', name: 'Other', message: '[AC Worlds / Suggestion] Other page.' }
  ] });
  await tick();
  assert.equal(s.requests[0].url, '/api/guestbook?scope=our-new-star');
  assert.equal(s.ids.observationEntries.children.length, 1);
  const card = s.ids.observationEntries.children[0];
  assert.equal(card.children[0].children[0].textContent, '<img onerror=alert(1)>');
  const link = card.children[1].children.find(child => child.tag === 'a');
  assert.equal(link.href, 'https://science.nasa.gov/ems/');
  assert.match(link.rel, /noopener/);
  card.children[2].children.at(-1).handlers.click();
  assert.match(s.ids.observationMessage.value, /^@<img onerror=alert\(1\)>: A question/);
  assert.equal(s.ids.observationTopic.value, 'Research');
  s.ids.observationMessage.value = 'x'.repeat(450);
  card.children[2].children.at(-1).handlers.click();
  assert.equal(s.ids.observationMessage.value.length, 450);
  assert.match(s.ids.observationStatus.textContent, /kept/);
});
test('successful post retains name/topic, clears draft only on confirmation, and defeats stale refresh', async () => {
  const s = setup({ deferredGet: true });
  await s.ids.observationForm.handlers.submit({ preventDefault() {} });
  const post = s.requests.find(r => r.options.method === 'POST');
  assert.equal(JSON.parse(post.options.body).message, '[Our New Star / Space] A question about stars.');
  assert.equal(s.ids.observationMessage.value, '');
  assert.equal(s.ids.observationTopic.value, 'Space');
  s.releaseGet(); await tick();
  assert.equal(s.ids.observationEntries.children[0].children[0].children[0].textContent, '<img onerror=alert(1)>');
  assert.equal(s.ids.observationSubmit.disabled, false);
});
test('failed posts preserve drafts; invalid topics and oversized drafts never submit', async () => {
  const s = setup({ failPost: true }); await tick();
  await s.ids.observationForm.handlers.submit({ preventDefault() {} });
  assert.equal(s.ids.observationMessage.value, 'A question about stars.');
  assert.match(s.ids.observationStatus.textContent, /30 seconds/);
  s.ids.observationTopic.value = 'Invalid';
  await s.ids.observationForm.handlers.submit({ preventDefault() {} });
  s.ids.observationTopic.value = 'Space'; s.ids.observationMessage.value = 'x'.repeat(451);
  await s.ids.observationForm.handlers.submit({ preventDefault() {} });
  assert.equal(s.requests.filter(r => r.options.method === 'POST').length, 1);
});
