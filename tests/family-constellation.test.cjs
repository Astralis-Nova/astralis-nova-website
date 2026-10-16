const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const path = require('node:path');
const familySource = fs.readFileSync(path.join(__dirname, '../memories/family-constellation.js'), 'utf8');
const coreSource = fs.readFileSync(path.join(__dirname, '../memories/gedcom-core.js'), 'utf8');
const coreScope = {};
vm.runInNewContext(coreSource, coreScope);
const core = coreScope.NovaGedcomCore;
const tree = () => ({ ...core.parseGedcom('0 HEAD\n1 SOUR TEST\n0 @I1@ INDI\n1 NAME Example /Person/\n1 BIRT\n2 DATE ABT 1900\n2 PLAC Example Town\n0 @I2@ INDI\n1 NAME Child /Person/\n0 @F1@ FAM\n1 HUSB @I1@\n1 CHIL @I2@\n0 TRLR'), sourceFile: 'example.ged', sourceSha256: 'test-source-digest' });
const tick = () => new Promise(resolve => setImmediate(resolve));
async function settle() { for (let n = 0; n < 8; n++) await tick(); }

function element(tag) {
  return { tag, hidden: true, children: [], handlers: {}, dataset: {}, value: '', checked: false,
    addEventListener(event, handler) { this.handlers[event] = handler; },
    append(...children) { this.children.push(...children); },
    appendChild(child) { this.children.push(child); return child; },
    replaceChildren(...children) { this.children = children; },
    setAttribute() {}, scrollIntoView() {}, querySelector() { return null; }
  };
}
async function setup({ saved = tree(), local = null, eventActivation = false } = {}) {
  const key = await webcrypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  let record = null;
  if (local) {
    const iv = webcrypto.getRandomValues(new Uint8Array(12));
    record = { id: 'active', iv, data: await webcrypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(local))) };
  }
  const initialRecord = record;
  let writes = 0;
  const ids = {};
  const handlers = {};
  const node = id => ids[id] ||= element(id);
  const db = {
    transaction() {
      const transaction = { objectStore: () => ({
        get() { const request = {}; queueMicrotask(() => { request.result = record; request.onsuccess?.(); }); return request; },
        put(next) { record = next; writes++; queueMicrotask(() => transaction.oncomplete?.()); },
        delete() { record = null; writes++; queueMicrotask(() => transaction.oncomplete?.()); }
      }) };
      return transaction;
    }
  };
  const indexedDB = { open() { const request = {}; queueMicrotask(() => { request.result = db; request.onsuccess?.(); }); return request; } };
  const window = { NovaGedcomCore: core, indexedDB, crypto: webcrypto,
    NovaMemoryCore: { getKey: () => eventActivation ? null : key, getFamilyArchive: () => saved, refresh() {} },
    addEventListener(event, handler) { handlers[event] = handler; }
  };
  vm.runInNewContext(familySource, { window, document: { getElementById: node, createElement: element, createElementNS: (_, tag) => element(tag), createTextNode: text => ({ textContent: text }) },
    indexedDB, crypto: webcrypto, TextEncoder, TextDecoder, Uint8Array, Blob, Response,
    btoa: value => Buffer.from(value, 'binary').toString('base64'), atob: value => Buffer.from(value, 'base64').toString('binary'),
    requestAnimationFrame() {}, confirm: () => true, console, setTimeout
  });
  if (eventActivation) handlers['nova-vault-opened']({ detail: { key, familyConstellation: saved } });
  await settle();
  return { ids, window, key, initialRecord, record: () => record, writes: () => writes };
}

test('sealed Ancestry tree opens for review without writing or activating unapproved memories', async () => {
  for (const eventActivation of [false, true]) {
    const s = await setup({ eventActivation });
    assert.equal(s.ids.familyImportReview.hidden, false);
    assert.equal(s.ids.savedFamilyImport.hidden, false);
    assert.equal(s.ids.familyImportApproval.checked, false);
    assert.equal(s.ids.approveFamilyImport.disabled, true);
    assert.equal(s.window.NovaFamilyEntries.length, 0);
    assert.equal(s.writes(), 0);
    await s.ids.approveFamilyImport.handlers.click();
    assert.equal(s.writes(), 0);
  }
});

test('approval encrypts the exact reviewed tree and makes its people available to the brain', async () => {
  const s = await setup();
  s.ids.familyImportApproval.checked = true;
  s.ids.familyImportApproval.handlers.change();
  await s.ids.approveFamilyImport.handlers.click();
  assert.equal(s.writes(), 1);
  assert.equal(s.ids.familyImportReview.hidden, true);
  assert.equal(s.ids.savedFamilyImport.hidden, true);
  assert.equal(s.ids.familyWorkspace.hidden, false);
  assert.equal(s.window.NovaFamilyEntries.length, 2);
  assert.equal(s.window.NovaFamilyConnectionCount, 1);
  const record = s.record();
  assert.equal(record.people, undefined);
  assert.equal(Buffer.from(record.data).includes(Buffer.from('Example Person')), false);
  const decrypted = await webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: record.iv }, s.key, record.data);
  const decoded = JSON.parse(new TextDecoder().decode(decrypted));
  assert.equal(decoded.sourceSha256, 'test-source-digest');
  assert.equal(decoded.people[0].events[0].date, 'ABT 1900');
  assert.equal(decoded.people[0].childIds[0], '@I2@');
});

test('existing device tree is preserved until the saved update is reviewed and approved', async () => {
  const old = tree();
  old.sourceSha256 = 'older-source';
  old.people[0].name = 'Existing Device Person';
  const s = await setup({ local: old });
  assert.equal(s.ids.familyImportReview.hidden, true);
  assert.equal(s.ids.savedFamilyImport.hidden, false);
  assert.equal(s.window.NovaFamilyEntries[0].title, 'Existing Device Person');
  assert.equal(s.record(), s.initialRecord);
  s.ids.reviewSavedFamily.handlers.click();
  assert.equal(s.ids.familyImportReview.hidden, false);
  assert.equal(s.writes(), 0);
  assert.equal(s.window.NovaFamilyEntries[0].title, 'Existing Device Person');
});

test('approved saved tree reopens without a repeated import; erase clears only device data', async () => {
  const s = await setup({ local: tree() });
  assert.equal(s.ids.savedFamilyImport.hidden, true);
  assert.equal(s.ids.familyWorkspace.hidden, false);
  assert.equal(s.window.NovaFamilyPersonCount, 2);
  await s.ids.eraseFamilyConstellation.handlers.click();
  assert.equal(s.record(), null);
  assert.equal(s.window.NovaFamilyPersonCount, 0);
  assert.equal(s.ids.savedFamilyImport.hidden, false);
  s.ids.reviewSavedFamily.handlers.click();
  assert.equal(s.ids.familyImportReview.hidden, false);
});

test('older archives without a sealed tree still offer normal local GEDCOM import', async () => {
  const s = await setup({ saved: null });
  assert.equal(s.ids.savedFamilyImport.hidden, true);
  assert.equal(s.ids.familyImportReview.hidden, true);
  assert.equal(s.ids.familyStatus.textContent, 'Ready for an Ancestry GEDCOM export');
  assert.equal(s.writes(), 0);
});

test('published vault has only encryption metadata and ciphertext', () => {
  const payload = JSON.parse(fs.readFileSync(path.join(__dirname, '../memories/vault.enc.json'), 'utf8'));
  assert.deepEqual(Object.keys(payload).sort(), ['cipher', 'data', 'iterations', 'iv', 'kdf', 'salt', 'version']);
  assert.equal(payload.cipher, 'AES-GCM');
  assert.equal(Buffer.from(payload.iv, 'base64').length, 12);
  assert.ok(payload.iterations >= 310000);
  assert.equal(payload.familyConstellation, undefined);
});
