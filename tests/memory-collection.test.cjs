const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto, createHash } = require('node:crypto');
const { File } = require('node:buffer');
const source = fs.readFileSync(require('node:path').join(__dirname, '../memories/memory-collection.js'), 'utf8');
function reader() {
  const window = {};
  vm.runInNewContext(source, { window, crypto: webcrypto, File, Uint8Array, atob, fetch() { throw new Error('No network allowed'); } });
  return window.NovaMemoryCollection;
}
function fixture() {
  const data = Buffer.from([255,216,255,224,0,0,255,217]);
  return { format: 'astralis-nova-memory-collection', version: 1, id: '1'.repeat(64), title: 'Synthetic family memory', story: 'A synthetic fixture, with names and dates left unconfirmed.', files: [{ name: 'test.jpg', type: 'image/jpeg', size: data.length, sha256: createHash('sha256').update(data).digest('hex'), data: data.toString('base64') }] };
}
const file = value => new File([JSON.stringify(value)], 'synthetic.nova.json', { type: 'application/json' });
test('collection preserves bytes and stages a review without inventing people or dates', async () => {
  const input = fixture();
  const result = await reader().read(file(input));
  assert.equal(result.photos, 1); assert.equal(result.videos, 0);
  assert.equal(result.proposal.occurredOn, ''); assert.equal(result.proposal.people.length, 0);
  assert.equal(result.proposal.story, input.story);
  assert.deepEqual(Buffer.from(await result.files[0].arrayBuffer()), Buffer.from(input.files[0].data, 'base64'));
});
test('a damaged later file rejects the entire collection', async () => {
  const input = fixture(); input.files.push({ ...input.files[0], name: 'second.jpg', sha256: '0'.repeat(64) });
  await assert.rejects(reader().read(file(input)), /integrity check/);
});
test('active media, false MIME types, duplicate names and unsupported versions fail closed', async () => {
  for (const mutate of [x => x.files[0].type = 'image/svg+xml', x => x.files[0].type = 'video/mp4', x => x.files.push({ ...x.files[0] }), x => x.version = 2]) {
    const input = fixture(); mutate(input);
    await assert.rejects(reader().read(file(input)));
  }
});
test('oversize bundles are rejected before reading; oversize media before decoding', async () => {
  await assert.rejects(reader().read({ size: 86*1024*1024, text() { throw new Error('should not read'); } }), /smaller than/);
  const input = fixture(); input.files[0].size = 26*1024*1024;
  await assert.rejects(reader().read(file(input)), /too large/);
});
test('invalid base64, unsafe filenames and incorrect declared lengths are rejected', async () => {
  for (const mutate of [x => x.files[0].data = '!'.repeat(12), x => x.files[0].name = '../test.jpg', x => x.files[0].size++]) {
    const input = fixture(); mutate(input);
    await assert.rejects(reader().read(file(input)));
  }
});

function chamber(key) {
  const elements = new Map(), stores = { experiences: new Map(), attachments: new Map() };
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: '', hidden: id === 'experienceReview', disabled: id === 'importMemoryCollection', files: [], handlers: {}, dataset: {},
      options: [{ value: 'Family' }], addEventListener(name, fn) { this.handlers[name] = fn; },
      querySelector() { return element('submitButton'); }, replaceChildren() {}, appendChild() {}, scrollIntoView() {}, reset() {},
    });
    return elements.get(id);
  };
  const request = result => {
    const value = { result }; setImmediate(() => value.onsuccess?.()); return value;
  };
  const db = { transaction(names, mode) {
    const tx = { objectStore(name) { return {
      getAll: () => request([...stores[name].values()]),
      put(value) { stores[name].set(value.id, value); },
    }; } };
    if (mode === 'readwrite') setImmediate(() => tx.oncomplete?.());
    return tx;
  } };
  const indexedDB = { open: () => request(db) };
  const window = { indexedDB, crypto: webcrypto, NovaMemoryCollection: reader(), NovaMemoryCore: { getKey: () => key, refresh() {} }, addEventListener() {} };
  const document = { getElementById: element, createElement: () => element('created'), addEventListener() {} };
  const source = fs.readFileSync(require('node:path').join(__dirname, '../memories/experience-chamber.js'), 'utf8');
  vm.runInNewContext(source, { window, document, indexedDB, crypto: webcrypto, Uint8Array, TextEncoder, TextDecoder, console, setTimeout, clearTimeout, Date, File, atob, btoa });
  return { elements, stores, window };
}
const settle = () => new Promise(resolve => setImmediate(resolve));
test('collection is saved only on approval, all media is encrypted, and repeat import adds nothing', async () => {
  const key = await webcrypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const { elements, stores, window } = chamber(key);
  await settle(); await settle();
  const input = elements.get('memoryCollectionFile');
  input.files = [file(fixture())]; await input.handlers.change();
  assert.equal(elements.get('experienceReview').hidden, false);
  assert.equal(stores.experiences.size, 0); assert.equal(stores.attachments.size, 0);
  await elements.get('approveExperience').handlers.click();
  assert.equal(stores.experiences.size, 1); assert.equal(stores.attachments.size, 1);
  const record = [...stores.experiences.values()][0], media = [...stores.attachments.values()][0];
  const decode = r => webcrypto.subtle.decrypt({ name: 'AES-GCM', iv: r.iv }, key, r.data);
  const memory = JSON.parse(new TextDecoder().decode(await decode(record)));
  assert.equal(memory.title, 'Synthetic family memory'); assert.equal(memory.collectionId, '1'.repeat(64));
  assert.equal(memory.attachments.length, 1);
  assert.deepEqual(Buffer.from(await decode(media)), Buffer.from(fixture().files[0].data, 'base64'));
  assert.equal(record.title, undefined); assert.equal(media.name, undefined);
  input.files = [file(fixture())]; await input.handlers.change();
  assert.match(elements.get('experienceStatus').textContent, /already remembered/);
  assert.equal(stores.experiences.size, 1); assert.equal(window.NovaExperienceEntries.length, 1);
});
test('a locked archive does not read or stage a collection', async () => {
  const { elements, stores } = chamber(null);
  const input = elements.get('memoryCollectionFile');
  input.files = [{ text() { throw new Error('must not read while locked'); } }];
  await input.handlers.change();
  assert.equal(elements.get('experienceReview').hidden, true);
  assert.equal(stores.experiences.size, 0); assert.equal(stores.attachments.size, 0);
});
