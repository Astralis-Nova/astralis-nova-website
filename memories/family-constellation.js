(() => {
  'use strict';
  if (window.__novaFamilyConstellationV1) return;
  window.__novaFamilyConstellationV1 = true;

  const core = window.NovaGedcomCore;
  const section = document.getElementById('familyConstellation');
  if (!core || !section || !('indexedDB' in window) || !window.crypto?.subtle) return;

  const DB_NAME = 'astralisNovaFamilyConstellationV1';
  const DB_VERSION = 1;
  const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
  const MAX_GEDCOM_BYTES = 80 * 1024 * 1024;
  const $ = id => document.getElementById(id);
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const unique = values => [...new Set((values || []).filter(Boolean))];
  const status = $('familyStatus');
  const fileInput = $('familyGedcomFile');
  const inspectButton = $('inspectGedcom');
  const review = $('familyImportReview');
  const approve = $('approveFamilyImport');
  const approval = $('familyImportApproval');
  const workspace = $('familyWorkspace');
  const rootSelect = $('familyRoot');
  const searchInput = $('familySearch');
  const searchResults = $('familySearchResults');
  const graphElement = $('familyGraph');
  const profileElement = $('familyProfile');
  const timelineElement = $('familyTimeline');
  const exportButton = $('exportFamilyConstellation');
  const importButton = $('importFamilyConstellation');
  const importFile = $('importFamilyFile');
  const eraseButton = $('eraseFamilyConstellation');

  let key = null;
  let dbPromise = null;
  let graph = null;
  let pendingGraph = null;
  let activePersonId = '';

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('snapshots')) db.createObjectStore('snapshots', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('The encrypted family store could not open.'));
    });
    return dbPromise;
  }

  function requestValue(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('The family store request failed.'));
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('The family store transaction failed.'));
      transaction.onabort = () => reject(transaction.error || new Error('The family store transaction was cancelled.'));
    });
  }

  function toBase64(data) {
    const bytes = new Uint8Array(data);
    let binary = '';
    for (let offset = 0; offset < bytes.length; offset += 0x8000) binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
    return btoa(binary);
  }

  function fromBase64(value) {
    return Uint8Array.from(atob(String(value || '')), character => character.charCodeAt(0));
  }

  async function encryptGraph(value) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plain = new TextEncoder().encode(JSON.stringify(value));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
    return { iv, data };
  }

  async function decryptGraph(record) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv) }, key, record.data);
    return JSON.parse(new TextDecoder().decode(plain));
  }

  async function inflateRaw(bytes) {
    if (!('DecompressionStream' in window)) throw new Error('This browser cannot open ZIP files. Unzip it first, then select the .ged file.');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function gedcomFromZip(file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let eocd = -1;
    for (let offset = Math.max(0, bytes.length - 65557); offset <= bytes.length - 22; offset += 1) {
      if (view.getUint32(offset, true) === 0x06054b50) eocd = offset;
    }
    if (eocd < 0) throw new Error('Nova could not read that ZIP archive. Unzip it first and select the .ged file.');
    const totalEntries = view.getUint16(eocd + 10, true);
    let cursor = view.getUint32(eocd + 16, true);
    const decoder = new TextDecoder();
    let chosen = null;
    for (let index = 0; index < totalEntries && cursor + 46 <= bytes.length; index += 1) {
      if (view.getUint32(cursor, true) !== 0x02014b50) break;
      const method = view.getUint16(cursor + 10, true);
      const compressedSize = view.getUint32(cursor + 20, true);
      const uncompressedSize = view.getUint32(cursor + 24, true);
      const nameLength = view.getUint16(cursor + 28, true);
      const extraLength = view.getUint16(cursor + 30, true);
      const commentLength = view.getUint16(cursor + 32, true);
      const localOffset = view.getUint32(cursor + 42, true);
      const name = decoder.decode(bytes.subarray(cursor + 46, cursor + 46 + nameLength));
      if (/\.(ged|gedcom)$/i.test(name) && !name.startsWith('__MACOSX/')) chosen = { method, compressedSize, uncompressedSize, localOffset, name };
      cursor += 46 + nameLength + extraLength + commentLength;
    }
    if (!chosen) throw new Error('That ZIP does not contain a .ged or .gedcom family tree.');
    if (chosen.uncompressedSize > MAX_GEDCOM_BYTES) throw new Error('The GEDCOM inside that ZIP is too large for safe browser inspection.');
    if (view.getUint32(chosen.localOffset, true) !== 0x04034b50) throw new Error('The GEDCOM entry in that ZIP is damaged.');
    const localNameLength = view.getUint16(chosen.localOffset + 26, true);
    const localExtraLength = view.getUint16(chosen.localOffset + 28, true);
    const start = chosen.localOffset + 30 + localNameLength + localExtraLength;
    const compressed = bytes.subarray(start, start + chosen.compressedSize);
    let plain;
    if (chosen.method === 0) plain = compressed;
    else if (chosen.method === 8) plain = await inflateRaw(compressed);
    else throw new Error('That ZIP uses a compression method this browser cannot open. Unzip it first and select the .ged file.');
    return { name: chosen.name, bytes: plain };
  }

  function decodeGedcom(bytes) {
    const initial = new TextDecoder('utf-8').decode(bytes);
    if (/\n1 CHAR (?:ANSI|ANSEL)/i.test(`\n${initial.slice(0, 4000)}`)) {
      try { return new TextDecoder('windows-1252').decode(bytes); } catch {}
    }
    return initial;
  }

  async function readGedcom(file) {
    if (!file) throw new Error('Select an Ancestry GEDCOM or ZIP export first.');
    if (file.size > MAX_UPLOAD_BYTES) throw new Error('That upload is larger than 50 MB. Unzip it first or divide the tree before importing.');
    if (/\.zip$/i.test(file.name) || /zip/i.test(file.type)) {
      const extracted = await gedcomFromZip(file);
      return { name: extracted.name, text: decodeGedcom(extracted.bytes) };
    }
    if (!/\.(ged|gedcom)$/i.test(file.name)) throw new Error('Choose an Ancestry .ged, .gedcom, or .zip tree export.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > MAX_GEDCOM_BYTES) throw new Error('That GEDCOM is too large for safe browser inspection.');
    return { name: file.name, text: decodeGedcom(bytes) };
  }

  function personMap() {
    return new Map((graph?.people || []).map(person => [person.id, person]));
  }

  function familyMap() {
    return new Map((graph?.families || []).map(family => [family.id, family]));
  }

  function relationshipCount(value) {
    const links = new Set();
    for (const family of value?.families || []) {
      for (let first = 0; first < family.partnerIds.length; first += 1) {
        for (let second = first + 1; second < family.partnerIds.length; second += 1) links.add(`p:${[family.partnerIds[first], family.partnerIds[second]].sort().join('|')}`);
      }
      for (const parent of family.partnerIds) for (const child of family.childIds) links.add(`c:${parent}|${child}`);
    }
    return links.size;
  }

  function publishEntries() {
    if (!graph) {
      window.NovaFamilyEntries = [];
      window.NovaFamilyConnectionCount = 0;
      window.NovaFamilyPersonCount = 0;
    } else {
      window.NovaFamilyEntries = core.brainEntries(graph);
      window.NovaFamilyConnectionCount = relationshipCount(graph);
      window.NovaFamilyPersonCount = graph.stats?.people || graph.people.length;
    }
    window.NovaMemoryCore?.refresh?.();
  }

  function statCard(value, label) {
    const item = document.createElement('div');
    item.className = 'family-stat';
    const strong = document.createElement('b');
    strong.textContent = String(value);
    item.append(strong, document.createTextNode(label));
    return item;
  }

  function renderReview() {
    const stats = $('familyReviewStats');
    stats.replaceChildren(
      statCard(pendingGraph.stats.people, 'people'),
      statCard(pendingGraph.stats.families, 'families'),
      statCard(pendingGraph.stats.sources, 'sources'),
      statCard(pendingGraph.stats.places, 'places')
    );
    const warnings = $('familyWarnings');
    warnings.replaceChildren();
    const messages = pendingGraph.warnings.length ? pendingGraph.warnings.slice(0, 15).map(item => item.message) : ['No obvious duplicate, chronology, or broken-reference warnings were detected.'];
    for (const message of messages) {
      const item = document.createElement('li');
      item.textContent = message;
      warnings.appendChild(item);
    }
    if (pendingGraph.warnings.length > 15) {
      const item = document.createElement('li');
      item.textContent = `${pendingGraph.warnings.length - 15} additional warnings will remain attached to the encrypted import.`;
      warnings.appendChild(item);
    }
    const sample = $('familyPersonSample');
    sample.replaceChildren(...pendingGraph.people.slice(0, 28).map(person => {
      const chip = document.createElement('span');
      chip.className = 'family-person-chip';
      chip.textContent = `${person.name} · ${core.lifeLabel(person)}`;
      return chip;
    }));
    approval.checked = false;
    approve.disabled = true;
    review.hidden = false;
    review.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function eventYear(event) {
    return core.yearOf(event?.date) ?? 99999;
  }

  function fillRootSelect(preferred = '') {
    const previous = preferred || rootSelect.value || activePersonId;
    const people = [...(graph?.people || [])].sort((a, b) => a.name.localeCompare(b.name));
    rootSelect.replaceChildren(...people.map(person => {
      const option = document.createElement('option');
      option.value = person.id;
      option.textContent = `${person.name} · ${core.lifeLabel(person)}`;
      return option;
    }));
    const root = people.find(person => person.id === previous) || people.find(person => !person.parentIds.length) || people[0];
    if (root) rootSelect.value = root.id;
    activePersonId = root?.id || '';
  }

  function visibleGenerations(rootId) {
    const people = personMap();
    const levels = new Map([[rootId, 0]]);
    const visitAncestors = (id, level) => {
      if (level < -3) return;
      const person = people.get(id);
      for (const parentId of person?.parentIds || []) {
        if (!levels.has(parentId) || levels.get(parentId) > level - 1) levels.set(parentId, level - 1);
        visitAncestors(parentId, level - 1);
      }
    };
    const visitDescendants = (id, level) => {
      if (level > 2) return;
      const person = people.get(id);
      for (const childId of person?.childIds || []) {
        if (!levels.has(childId) || levels.get(childId) < level + 1) levels.set(childId, level + 1);
        visitDescendants(childId, level + 1);
      }
    };
    visitAncestors(rootId, 0);
    visitDescendants(rootId, 0);
    for (const [id, level] of [...levels]) for (const spouseId of people.get(id)?.spouseIds || []) if (!levels.has(spouseId)) levels.set(spouseId, level);
    if (levels.size > 120) return new Map([...levels].slice(0, 120));
    return levels;
  }

  function drawConnections(visible) {
    const svg = graphElement.querySelector('svg');
    if (!svg) return;
    svg.replaceChildren();
    const people = personMap();
    const container = graphElement.getBoundingClientRect();
    const node = id => graphElement.querySelector(`[data-family-person="${CSS.escape(id)}"]`);
    const point = element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.left - container.left + rect.width / 2, y: rect.top - container.top + rect.height / 2 };
    };
    const addLine = (fromId, toId, className) => {
      const from = node(fromId), to = node(toId);
      if (!from || !to) return;
      const a = point(from), b = point(to);
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const middle = (a.y + b.y) / 2;
      path.setAttribute('d', className === 'spouse' ? `M ${a.x} ${a.y} L ${b.x} ${b.y}` : `M ${a.x} ${a.y} C ${a.x} ${middle}, ${b.x} ${middle}, ${b.x} ${b.y}`);
      path.setAttribute('class', className);
      svg.appendChild(path);
    };
    const spouseLinks = new Set();
    for (const id of visible.keys()) {
      const person = people.get(id);
      for (const parentId of person?.parentIds || []) if (visible.has(parentId)) addLine(parentId, id, 'descent');
      for (const spouseId of person?.spouseIds || []) {
        if (!visible.has(spouseId)) continue;
        const key = [id, spouseId].sort().join('|');
        if (!spouseLinks.has(key)) { spouseLinks.add(key); addLine(id, spouseId, 'spouse'); }
      }
    }
    svg.setAttribute('viewBox', `0 0 ${Math.max(1, graphElement.scrollWidth)} ${Math.max(1, graphElement.scrollHeight)}`);
  }

  function renderGraph(rootId = rootSelect.value || activePersonId) {
    if (!graph?.people?.length) return;
    const people = personMap();
    if (!people.has(rootId)) rootId = graph.people[0].id;
    const visible = visibleGenerations(rootId);
    graphElement.replaceChildren();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    graphElement.appendChild(svg);
    const labels = new Map([[-3, 'Great-grandparents'], [-2, 'Grandparents'], [-1, 'Parents'], [0, 'Selected generation'], [1, 'Children'], [2, 'Grandchildren']]);
    for (const level of [...new Set(visible.values())].sort((a, b) => a - b)) {
      const band = document.createElement('section');
      band.className = 'family-generation';
      const heading = document.createElement('h5');
      heading.textContent = labels.get(level) || `Generation ${level}`;
      const nodes = document.createElement('div');
      nodes.className = 'family-nodes';
      for (const [id, personLevel] of visible) {
        if (personLevel !== level) continue;
        const person = people.get(id);
        if (!person) continue;
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `family-node${id === rootId ? ' root' : ''}${id === activePersonId ? ' active' : ''}`;
        button.dataset.familyPerson = id;
        const name = document.createElement('b');
        name.textContent = person.name;
        const life = document.createElement('span');
        life.textContent = core.lifeLabel(person);
        button.append(name, life);
        button.addEventListener('click', () => selectPerson(id));
        nodes.appendChild(button);
      }
      band.append(heading, nodes);
      graphElement.appendChild(band);
    }
    requestAnimationFrame(() => drawConnections(visible));
  }

  function relationButton(label, person, target) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'family-relation';
    button.textContent = `${label}: ${person.name}`;
    button.addEventListener('click', () => selectPerson(person.id, target));
    return button;
  }

  function renderProfile(id) {
    const people = personMap();
    const families = familyMap();
    const person = people.get(id);
    profileElement.replaceChildren();
    timelineElement.replaceChildren();
    if (!person) return;
    const title = document.createElement('h4');
    title.textContent = person.name;
    const life = document.createElement('p');
    life.className = 'family-life';
    life.textContent = core.lifeLabel(person);
    const relationships = document.createElement('div');
    relationships.className = 'family-relations';
    for (const parentId of person.parentIds) if (people.has(parentId)) relationships.appendChild(relationButton('Parent', people.get(parentId), 'root'));
    for (const spouseId of person.spouseIds) if (people.has(spouseId)) relationships.appendChild(relationButton('Partner', people.get(spouseId), 'root'));
    for (const childId of person.childIds) if (people.has(childId)) relationships.appendChild(relationButton('Child', people.get(childId), 'root'));
    const notes = document.createElement('p');
    notes.className = 'family-notes';
    notes.textContent = person.notes.join(' ') || 'No personal note was included in the GEDCOM.';
    const sourceIds = unique([...person.sourceRefs, ...person.events.flatMap(event => event.sourceRefs || [])]);
    const sourceMap = new Map((graph.sources || []).map(source => [source.id, source]));
    const sourceTitles = sourceIds.map(sourceId => sourceMap.get(sourceId)?.title || (/^@.+@$/.test(sourceId) ? '' : sourceId)).filter(Boolean);
    const evidence = document.createElement('p');
    evidence.className = 'family-notes';
    evidence.textContent = sourceTitles.length ? `Sources: ${sourceTitles.join(' · ')}` : 'No named source record was attached to this person.';
    const linked = document.createElement('div');
    linked.className = 'family-relations';
    const normalizedName = person.name.toLowerCase();
    const memories = (window.NovaExperienceEntries || []).filter(entry => [entry.title, entry.summary, entry.story, ...(entry.tags || [])].join(' ').toLowerCase().includes(normalizedName)).slice(0, 8);
    for (const memory of memories) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'family-relation';
      button.textContent = `Memory: ${memory.title}`;
      button.addEventListener('click', () => {
        const input = $('memorySearch');
        const form = $('searchForm');
        if (!input || !form) return;
        input.value = person.name;
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      linked.appendChild(button);
    }
    const actions = document.createElement('div');
    actions.className = 'family-profile-actions';
    const center = document.createElement('button');
    center.type = 'button';
    center.textContent = 'Center tree here';
    center.addEventListener('click', () => { rootSelect.value = id; renderGraph(id); });
    const ask = document.createElement('button');
    ask.type = 'button';
    ask.textContent = 'Ask Nova about this person';
    ask.addEventListener('click', () => {
      const question = $('brainQuestion');
      if (!question) return;
      question.value = `Using the family constellation and every relevant memory, what do we know about ${person.name}? Separate documented facts, family memories, inferences, and unanswered questions.`;
      question.scrollIntoView({ behavior: 'smooth', block: 'center' });
      question.focus();
    });
    actions.append(center, ask);
    profileElement.append(title, life, relationships, notes, evidence);
    if (memories.length) profileElement.append(linked);
    profileElement.append(actions);

    const events = person.events.map(event => ({ ...event, owner: person.name }));
    for (const familyId of person.familyAsSpouse || []) {
      const family = families.get(familyId);
      if (family) for (const event of family.events) events.push({ ...event, owner: 'Family event' });
    }
    events.sort((a, b) => eventYear(a) - eventYear(b));
    if (!events.length) {
      const empty = document.createElement('p');
      empty.className = 'family-empty';
      empty.textContent = 'No dated life events were included for this person.';
      timelineElement.appendChild(empty);
    } else {
      for (const event of events) {
        const row = document.createElement('div');
        row.className = 'family-timeline-event';
        const date = document.createElement('time');
        date.textContent = event.date || 'Date unknown';
        const detail = document.createElement('div');
        const heading = document.createElement('b');
        heading.textContent = event.type;
        const copy = document.createElement('span');
        copy.textContent = [event.place, event.description, ...(event.notes || [])].filter(Boolean).join(' · ') || 'No additional detail';
        detail.append(heading, copy);
        row.append(date, detail);
        timelineElement.appendChild(row);
      }
    }
  }

  function selectPerson(id, target = '') {
    activePersonId = id;
    renderProfile(id);
    renderGraph(rootSelect.value || id);
    if (target === 'root') {
      rootSelect.value = id;
      renderGraph(id);
    }
  }

  function renderSearch() {
    const query = clean(searchInput.value).toLowerCase();
    searchResults.replaceChildren();
    if (!query) return;
    const matches = (graph?.people || []).filter(person => `${person.name} ${person.events.map(event => `${event.place} ${event.date}`).join(' ')}`.toLowerCase().includes(query)).slice(0, 12);
    if (!matches.length) {
      const empty = document.createElement('span');
      empty.className = 'family-empty';
      empty.textContent = 'No person, date, or place matched.';
      searchResults.appendChild(empty);
      return;
    }
    for (const person of matches) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `${person.name} · ${core.lifeLabel(person)}`;
      button.addEventListener('click', () => {
        rootSelect.value = person.id;
        searchInput.value = '';
        searchResults.replaceChildren();
        selectPerson(person.id, 'root');
      });
      searchResults.appendChild(button);
    }
  }

  function renderWorkspace(preferred = '') {
    if (!graph?.people?.length) {
      workspace.hidden = true;
      return;
    }
    workspace.hidden = false;
    fillRootSelect(preferred);
    selectPerson(rootSelect.value);
    status.textContent = `${graph.stats.people} people · ${relationshipCount(graph)} documented relationships`;
  }

  async function saveGraph(value) {
    const encrypted = await encryptGraph(value);
    const db = await openDb();
    const transaction = db.transaction('snapshots', 'readwrite');
    transaction.objectStore('snapshots').put({ id: 'active', updated: new Date().toISOString(), iv: encrypted.iv, data: encrypted.data });
    await transactionDone(transaction);
  }

  async function loadGraph() {
    if (!key) return;
    const db = await openDb();
    const record = await requestValue(db.transaction('snapshots', 'readonly').objectStore('snapshots').get('active'));
    if (!record) {
      status.textContent = 'Ready for an Ancestry GEDCOM export';
      graph = null;
      publishEntries();
      return;
    }
    graph = await decryptGraph(record);
    publishEntries();
    renderWorkspace();
  }

  async function exportConstellation() {
    const snapshot = await exportBundlePart();
    if (!snapshot) throw new Error('There is no encrypted family constellation to export yet.');
    const bundle = { format: 'astralis-nova-encrypted-family', version: 1, exportedAt: new Date().toISOString(), snapshot };
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `astralis-nova-encrypted-family-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    status.textContent = 'Encrypted family constellation exported';
  }

  async function exportBundlePart() {
    const db = await openDb();
    const record = await requestValue(db.transaction('snapshots', 'readonly').objectStore('snapshots').get('active'));
    return record ? { id: 'active', updated: record.updated, iv: toBase64(record.iv), data: toBase64(record.data) } : null;
  }

  async function importBundlePart(snapshot) {
    if (!snapshot?.iv || !snapshot?.data) throw new Error('The encrypted family snapshot is missing or damaged.');
    const record = { id: 'active', updated: snapshot.updated || new Date().toISOString(), iv: fromBase64(snapshot.iv), data: fromBase64(snapshot.data) };
    const decoded = await decryptGraph(record).catch(() => { throw new Error('That family bundle uses a different wake phrase or is damaged.'); });
    if (decoded?.format !== 'astralis-nova-family-constellation' || !Array.isArray(decoded.people)) throw new Error('The decrypted family bundle is not valid.');
    const db = await openDb();
    const transaction = db.transaction('snapshots', 'readwrite');
    transaction.objectStore('snapshots').put(record);
    await transactionDone(transaction);
    graph = decoded;
    publishEntries();
    renderWorkspace();
    status.textContent = `Imported encrypted constellation with ${graph.stats.people} people`;
  }

  async function importConstellation(file) {
    if (!file || file.size > 120 * 1024 * 1024) throw new Error('That encrypted family bundle is too large.');
    const bundle = JSON.parse(await file.text());
    if (bundle?.format !== 'astralis-nova-encrypted-family' || bundle?.version !== 1 || !bundle.snapshot) throw new Error('That is not an Astralis Nova encrypted family bundle.');
    await importBundlePart(bundle.snapshot);
  }

  fileInput.addEventListener('change', () => { inspectButton.disabled = !fileInput.files?.[0]; });
  inspectButton.addEventListener('click', async () => {
    inspectButton.disabled = true;
    review.hidden = true;
    status.textContent = 'Reading the family export locally';
    try {
      const loaded = await readGedcom(fileInput.files?.[0]);
      status.textContent = `Mapping people and relationships from ${loaded.name}`;
      pendingGraph = core.parseGedcom(loaded.text);
      if (pendingGraph.stats.people > 10000 || pendingGraph.stats.families > 20000) throw new Error('This first importer supports up to 10,000 people and 20,000 family groups per tree.');
      pendingGraph.sourceFile = loaded.name;
      renderReview();
      status.textContent = `Review ${pendingGraph.stats.people} people before encryption`;
    } catch (error) {
      console.error('Nova GEDCOM inspection failed', error);
      status.textContent = error.message;
    } finally {
      inspectButton.disabled = !fileInput.files?.[0];
    }
  });

  approval.addEventListener('change', () => { approve.disabled = !approval.checked; });
  approve.addEventListener('click', async () => {
    if (!key || !pendingGraph || !approval.checked) return;
    approve.disabled = true;
    status.textContent = 'Encrypting the approved family constellation';
    try {
      await saveGraph(pendingGraph);
      graph = pendingGraph;
      pendingGraph = null;
      review.hidden = true;
      fileInput.value = '';
      publishEntries();
      renderWorkspace();
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error('Nova family import failed', error);
      status.textContent = `Family import failed: ${error.message}`;
    } finally {
      approve.disabled = !approval.checked;
    }
  });

  rootSelect.addEventListener('change', () => selectPerson(rootSelect.value));
  searchInput.addEventListener('input', renderSearch);
  exportButton.addEventListener('click', () => exportConstellation().catch(error => { status.textContent = error.message; }));
  importButton.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => importConstellation(importFile.files?.[0]).catch(error => { console.error(error); status.textContent = error.message; }).finally(() => { importFile.value = ''; }));
  eraseButton.addEventListener('click', async () => {
    if (!graph || !confirm('Erase the encrypted family constellation from this device? Your Ancestry account and original GEDCOM will not be changed.')) return;
    const db = await openDb();
    const transaction = db.transaction('snapshots', 'readwrite');
    transaction.objectStore('snapshots').delete('active');
    await transactionDone(transaction);
    graph = null;
    pendingGraph = null;
    review.hidden = true;
    workspace.hidden = true;
    publishEntries();
    status.textContent = 'Encrypted family constellation erased from this device';
  });

  window.addEventListener('resize', () => { if (graph && !workspace.hidden) requestAnimationFrame(() => drawConnections(visibleGenerations(rootSelect.value))); });
  async function activate(vaultKey) {
    key = vaultKey || null;
    if (!key) return;
    try { await loadGraph(); }
    catch (error) { console.error('Nova family constellation could not open', error); status.textContent = 'The encrypted family constellation could not be opened on this device'; }
  }

  window.addEventListener('nova-vault-opened', event => activate(event.detail?.key));
  window.NovaFamilyConstellation = { exportBundlePart, importBundlePart };
  const existingKey = window.NovaMemoryCore?.getKey?.();
  if (existingKey) activate(existingKey);
})();
