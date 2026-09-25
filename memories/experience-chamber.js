(() => {
  'use strict';
  if (window.__novaExperienceChamberV1) return;
  window.__novaExperienceChamberV1 = true;

  const DB_NAME = 'astralisNovaExperienceBrainV1';
  const DB_VERSION = 1;
  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 60 * 1024 * 1024;
  const $ = id => document.getElementById(id);
  const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
  const list = value => [...new Set(clean(value).split(',').map(clean).filter(Boolean))];
  const today = () => new Date().toISOString().slice(0, 10);

  const form = $('experienceForm');
  if (!form || !('indexedDB' in window) || !window.crypto?.subtle) return;

  const story = $('experienceStory');
  const date = $('experienceDate');
  const place = $('experiencePlace');
  const people = $('experiencePeople');
  const feelings = $('experienceFeelings');
  const files = $('experienceFiles');
  const dictate = $('experienceDictate');
  const status = $('experienceStatus');
  const review = $('experienceReview');
  const approve = $('approveExperience');
  const discard = $('discardExperience');
  const captured = $('capturedStrip');
  const exportBrain = $('exportExperienceBrain');
  const importBrain = $('importExperienceBrain');
  const importFile = $('importExperienceFile');
  let key = null;
  let dbPromise = null;
  let experiences = [];
  let pending = null;
  let pendingFiles = [];
  let recognition = null;

  function toBase64(data) {
    const value = new Uint8Array(data);
    let binary = '';
    for (let offset = 0; offset < value.length; offset += 0x8000) binary += String.fromCharCode(...value.subarray(offset, offset + 0x8000));
    return btoa(binary);
  }

  function fromBase64(value) {
    return Uint8Array.from(atob(String(value || '')), character => character.charCodeAt(0));
  }

  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('experiences')) db.createObjectStore('experiences', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('attachments')) {
          const store = db.createObjectStore('attachments', { keyPath: 'id' });
          store.createIndex('experienceId', 'experienceId', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Private experience storage could not open.'));
    });
    return dbPromise;
  }

  function requestValue(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Private storage request failed.'));
    });
  }

  function transactionDone(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || new Error('Private storage transaction failed.'));
      transaction.onabort = () => reject(transaction.error || new Error('Private storage transaction was cancelled.'));
    });
  }

  async function encryptBuffer(buffer) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, buffer);
    return { iv, data };
  }

  async function decryptBuffer(record) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv) }, key, record.data);
  }

  async function encryptJson(value) {
    return encryptBuffer(new TextEncoder().encode(JSON.stringify(value)));
  }

  async function decryptJson(record) {
    const plain = await decryptBuffer(record);
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function toEntry(item) {
    const context = [
      item.occurredOn ? `Date: ${item.occurredOn}.` : '',
      item.place ? `Place: ${item.place}.` : '',
      item.people?.length ? `People: ${item.people.join(', ')}.` : '',
      item.feelings?.length ? `Feelings: ${item.feelings.join(', ')}.` : '',
      item.story
    ].filter(Boolean).join(' ');
    return {
      id: item.id,
      category: item.category || 'Life experience',
      title: item.title,
      summary: item.summary,
      story: context,
      tags: [...new Set([...(item.people || []), ...(item.places || []), ...(item.feelings || []), ...(item.themes || []), 'lived experience'])],
      attachments: item.attachments || [],
      experience: true,
      occurredOn: item.occurredOn,
      created: item.created
    };
  }

  function publishEntries() {
    window.NovaExperienceEntries = experiences.map(toEntry);
    window.NovaMemoryCore?.refresh?.();
    if (captured) {
      captured.innerHTML = '';
      experiences.slice(-8).reverse().forEach(item => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'captured-chip';
        button.textContent = `${item.attachments?.length ? '📎 ' : '✦ '}${item.title}`;
        button.title = 'Ask Nova to connect this experience';
        button.addEventListener('click', () => {
          const question = $('brainQuestion');
          if (!question) return;
          question.value = `Connect this lived experience to everything relevant in the Nova Brain: “${item.title}”. What patterns, lessons, or unanswered questions appear?`;
          question.scrollIntoView({ behavior: 'smooth', block: 'center' });
          question.focus();
        });
        captured.appendChild(button);
      });
    }
  }

  async function loadExperiences() {
    if (!key) return;
    const db = await openDb();
    const records = await requestValue(db.transaction('experiences', 'readonly').objectStore('experiences').getAll());
    const decoded = [];
    for (const record of records) {
      try { decoded.push(await decryptJson(record)); }
      catch (error) { console.warn('A saved Nova experience could not be decrypted.', error); }
    }
    experiences = decoded.sort((a, b) => String(a.created).localeCompare(String(b.created)));
    publishEntries();
    status.textContent = experiences.length ? `${experiences.length} lived experience${experiences.length === 1 ? '' : 's'} available` : 'Ready to absorb an experience';
  }

  function classify(text) {
    const rules = [
      ['Family', /\b(family|mother|mom|father|dad|daughter|son|children|child|wife|husband|uncle|aunt|grand)/i],
      ['Work', /\b(work|job|intel|shift|technician|tool|wafer|boss|coworker|career)/i],
      ['Music', /\b(song|music|record|album|melody|lyrics|singer)/i],
      ['Animals', /\b(dog|cat|zoey|garfield|tortoise|chicken|duck|coyote|snake|animal|pet)/i],
      ['Home & property', /\b(home|house|property|acre|yard|garden|garage|shed|septic|solar)/i],
      ['Health', /\b(health|doctor|hospital|medicine|glucose|diabetes|pain|sick)/i],
      ['Technology', /\b(computer|ai|robot|server|website|software|machine|electronic)/i],
      ['Faith', /\b(faith|god|bible|prayer|spiritual|church|religion)/i],
      ['Knowledge & lesson', /\b(learn|lesson|knowledge|fact|research|discovered|how to|method)/i],
      ['Dream & idea', /\b(dream|idea|future|invent|build|imagine|plan)/i]
    ];
    return rules.find(([, pattern]) => pattern.test(text))?.[0] || 'Life experience';
  }

  function detectThemes(text) {
    const themes = [];
    const rules = [
      ['family legacy', /family|parent|child|memory/i],
      ['resilience', /surviv|recover|again|hard|loss|repair|rebuild/i],
      ['care and responsibility', /help|care|protect|support|responsib/i],
      ['curiosity and learning', /learn|discover|question|curious|study|research/i],
      ['technology and creation', /technology|computer|ai|build|invent|website/i],
      ['Arizona life', /arizona|florence|cactus|desert|property/i],
      ['work and skill', /work|job|intel|technician|tool|skill/i],
      ['music and expression', /music|song|lyrics|record|album/i],
      ['faith and meaning', /faith|god|spiritual|meaning|prayer/i]
    ];
    for (const [name, pattern] of rules) if (pattern.test(text)) themes.push(name);
    return themes.length ? themes : ['personal history'];
  }

  function localProposal(input) {
    const category = classify(input.story);
    const words = clean(input.story).split(' ');
    const title = clean(input.story).split(/[.!?]/)[0].split(' ').slice(0, 10).join(' ') || `${category} memory`;
    const questions = [];
    if (!input.occurredOn) questions.push('When did this happen? An approximate year is enough.');
    if (!input.people.length) questions.push('Was anyone else part of this experience?');
    if (!input.place) questions.push('Where did this happen?');
    if (!input.feelings.length) questions.push('How did this experience make you feel at the time?');
    return {
      title: title.length < words.join(' ').length ? title : `${category}: ${title}`,
      category,
      occurredOn: input.occurredOn,
      people: input.people,
      places: input.place ? [input.place] : [],
      feelings: input.feelings,
      themes: detectThemes(input.story),
      summary: clean(input.story).slice(0, 420),
      story: clean(input.story),
      questions: questions.slice(0, 4),
      confidence: input.people.length && input.place ? 'medium' : 'needs-review',
      mode: 'local-extraction'
    };
  }

  function fileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error || new Error('The photo could not be read.'));
      reader.readAsDataURL(file);
    });
  }

  async function studyExperience(input) {
    const imageFile = pendingFiles.find(file => file.type.startsWith('image/') && file.size <= 3.5 * 1024 * 1024);
    const textFile = pendingFiles.find(file => (file.type === 'text/plain' || /\.txt$/i.test(file.name)) && file.size <= 1024 * 1024);
    let image = null;
    let documentText = '';
    if (imageFile) {
      status.textContent = 'Reading the selected photo';
      try { image = await fileAsDataUrl(imageFile); } catch {}
    }
    if (textFile) {
      status.textContent = 'Reading the attached text';
      try { documentText = (await textFile.text()).slice(0, 12000); } catch {}
    }
    const response = await fetch('/api/nova-experience', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...input, image, documentText, fileNames: pendingFiles.map(file => file.name) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || 'Nova could not study that experience.');
    return data;
  }

  function setReview(proposal) {
    pending = proposal;
    $('reviewTitle').value = proposal.title || '';
    $('reviewCategory').value = [...$('reviewCategory').options].some(option => option.value === proposal.category) ? proposal.category : 'Life experience';
    $('reviewDate').value = proposal.occurredOn || '';
    $('reviewPlace').value = (proposal.places || []).join(', ');
    $('reviewPeople').value = (proposal.people || []).join(', ');
    $('reviewFeelings').value = (proposal.feelings || []).join(', ');
    $('reviewThemes').value = (proposal.themes || []).join(', ');
    $('reviewSummary').value = [proposal.summary,proposal.imageObservation?`Photo observation: ${proposal.imageObservation}`:''].filter(Boolean).join(' ');
    $('reviewStory').value = proposal.story || story.value;
    const questions = proposal.questions?.length ? proposal.questions : ['Nova has enough detail for a first memory. You can still correct anything above.'];
    $('reviewQuestions').replaceChildren(...questions.map(question => { const item = document.createElement('li'); item.textContent = clean(question); return item; }));
    review.hidden = false;
    review.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function saveApprovedExperience() {
    if (!key || !pending) return;
    approve.disabled = true;
    status.textContent = 'Encrypting the approved experience';
    try {
      let total = 0;
      const preparedAttachments = [];
      for (const file of pendingFiles) {
        if (file.size > MAX_FILE_BYTES || total + file.size > MAX_TOTAL_BYTES) continue;
        total += file.size;
        const id = crypto.randomUUID();
        const encrypted = await encryptBuffer(await file.arrayBuffer());
        preparedAttachments.push({ id, name: file.name, type: file.type || 'application/octet-stream', size: file.size, iv: encrypted.iv, data: encrypted.data });
      }
      const id = crypto.randomUUID();
      const item = {
        id,
        title: clean($('reviewTitle').value).slice(0, 140) || 'Untitled experience',
        category: clean($('reviewCategory').value) || 'Life experience',
        occurredOn: $('reviewDate').value || '',
        place: clean($('reviewPlace').value).slice(0, 160),
        people: list($('reviewPeople').value).slice(0, 30),
        places: list($('reviewPlace').value).slice(0, 10),
        feelings: list($('reviewFeelings').value).slice(0, 20),
        themes: list($('reviewThemes').value).slice(0, 24),
        summary: clean($('reviewSummary').value).slice(0, 1200),
        story: clean($('reviewStory').value).slice(0, 12000),
        attachments: preparedAttachments.map(file => ({ id: file.id, name: file.name, type: file.type, size: file.size })),
        created: new Date().toISOString(),
        source: 'owner-approved'
      };
      const encryptedItem = await encryptJson(item);
      const db = await openDb();
      const transaction = db.transaction(['experiences', 'attachments'], 'readwrite');
      transaction.objectStore('experiences').put({ id, created: item.created, iv: encryptedItem.iv, data: encryptedItem.data });
      for (const file of preparedAttachments) transaction.objectStore('attachments').put({ id: file.id, experienceId: id, iv: file.iv, data: file.data });
      await transactionDone(transaction);
      experiences.push(item);
      publishEntries();
      status.textContent = `Remembered: ${item.title}`;
      form.reset();
      date.value = today();
      pending = null;
      pendingFiles = [];
      review.hidden = true;
    } catch (error) {
      console.error('Nova experience save failed', error);
      status.textContent = `Could not preserve it: ${error.message}`;
    } finally {
      approve.disabled = false;
    }
  }

  async function downloadAttachment(id) {
    if (!key || !id) return;
    const db = await openDb();
    const record = await requestValue(db.transaction('attachments', 'readonly').objectStore('attachments').get(id));
    if (!record) return;
    const metadata = experiences.flatMap(item => item.attachments || []).find(item => item.id === id) || {};
    const name = metadata.name || record.name || 'nova-attachment';
    const type = metadata.type || record.type || 'application/octet-stream';
    status.textContent = `Decrypting ${name}`;
    const plain = await decryptBuffer(record);
    const url = URL.createObjectURL(new Blob([plain], { type }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    status.textContent = `Opened encrypted attachment: ${name}`;
  }

  async function removeExperience(id) {
    const item = experiences.find(value => value.id === id);
    if (!item || !confirm(`Remove “${item.title}” and its encrypted attachments from this device?`)) return;
    const db = await openDb();
    const transaction = db.transaction(['experiences', 'attachments'], 'readwrite');
    transaction.objectStore('experiences').delete(id);
    const attachmentStore = transaction.objectStore('attachments');
    for (const attachment of item.attachments || []) attachmentStore.delete(attachment.id);
    await transactionDone(transaction);
    experiences = experiences.filter(value => value.id !== id);
    publishEntries();
    status.textContent = `Removed: ${item.title}`;
  }

  async function exportEncryptedBrain() {
    const db = await openDb();
    status.textContent = 'Packaging the encrypted experience brain';
    const experienceRecords = await requestValue(db.transaction('experiences', 'readonly').objectStore('experiences').getAll());
    const attachmentRecords = await requestValue(db.transaction('attachments', 'readonly').objectStore('attachments').getAll());
    const family = await window.NovaFamilyConstellation?.exportBundlePart?.() || null;
    const bundle = {
      format: 'astralis-nova-experience-brain',
      version: 2,
      exportedAt: new Date().toISOString(),
      experiences: experienceRecords.map(record => ({ id: record.id, created: record.created, iv: toBase64(record.iv), data: toBase64(record.data) })),
      attachments: attachmentRecords.map(record => ({ id: record.id, experienceId: record.experienceId, iv: toBase64(record.iv), data: toBase64(record.data) })),
      family
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(bundle)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `astralis-nova-encrypted-brain-${today()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    status.textContent = `Encrypted brain exported with ${experienceRecords.length} experience${experienceRecords.length === 1 ? '' : 's'}${family ? ' and the family constellation' : ''}`;
  }

  async function importEncryptedBrain(file) {
    if (!file) return;
    if (file.size > 250 * 1024 * 1024) throw new Error('That brain bundle is too large for this browser import.');
    status.textContent = 'Checking the encrypted brain bundle';
    const bundle = JSON.parse(await file.text());
    if (bundle?.format !== 'astralis-nova-experience-brain' || ![1, 2].includes(bundle?.version) || !Array.isArray(bundle.experiences) || !Array.isArray(bundle.attachments)) throw new Error('That file is not an Astralis Nova encrypted brain bundle.');
    const first = bundle.experiences[0];
    if (first) {
      try { await decryptJson({ iv: fromBase64(first.iv), data: fromBase64(first.data) }); }
      catch { throw new Error('This brain bundle was encrypted with a different wake phrase or is damaged.'); }
    }
    const db = await openDb();
    const transaction = db.transaction(['experiences', 'attachments'], 'readwrite');
    const experienceStore = transaction.objectStore('experiences');
    const attachmentStore = transaction.objectStore('attachments');
    for (const record of bundle.experiences.slice(0, 5000)) {
      if (!record?.id || !record?.iv || !record?.data) continue;
      experienceStore.put({ id: String(record.id), created: String(record.created || ''), iv: fromBase64(record.iv), data: fromBase64(record.data) });
    }
    for (const record of bundle.attachments.slice(0, 20000)) {
      if (!record?.id || !record?.experienceId || !record?.iv || !record?.data) continue;
      attachmentStore.put({ id: String(record.id), experienceId: String(record.experienceId), iv: fromBase64(record.iv), data: fromBase64(record.data) });
    }
    await transactionDone(transaction);
    if (bundle.family && window.NovaFamilyConstellation?.importBundlePart) await window.NovaFamilyConstellation.importBundlePart(bundle.family);
    await loadExperiences();
    status.textContent = `Encrypted brain imported: ${experiences.length} experience${experiences.length === 1 ? '' : 's'}${bundle.family ? ' plus the family constellation' : ''} now available`;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const input = {
      story: clean(story.value).slice(0, 12000),
      occurredOn: date.value || '',
      place: clean(place.value).slice(0, 160),
      people: list(people.value).slice(0, 30),
      feelings: list(feelings.value).slice(0, 20)
    };
    if (!input.story) return;
    pendingFiles = [...files.files];
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    status.textContent = 'Nova is studying the experience';
    try {
      let proposal;
      try { proposal = await studyExperience(input); }
      catch (error) { console.warn('Nova experience AI fallback', error); proposal = localProposal(input); }
      setReview(proposal);
      status.textContent = proposal.mode === 'ai-extraction' ? 'AI study complete—waiting for your approval' : 'Local study complete—waiting for your approval';
    } finally {
      submit.disabled = false;
    }
  });

  dictate.addEventListener('click', () => {
    if (recognition) { recognition.stop(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { status.textContent = 'Voice dictation is unavailable in this browser. You can type the story.'; story.focus(); return; }
    recognition?.abort();
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = story.value.trim();
    recognition.onstart = () => { dictate.textContent = '⏹ Stop listening'; status.textContent = 'Listening to your experience'; };
    recognition.onresult = event => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText = clean(`${finalText} ${transcript}`); else interim += transcript;
      }
      story.value = clean(`${finalText} ${interim}`);
    };
    recognition.onend = () => { dictate.textContent = '🎙 Tell Nova'; status.textContent = 'Voice experience captured—add anything missing'; recognition = null; };
    recognition.onerror = () => { status.textContent = 'Nova could not hear clearly. Try again or type the story.'; };
    try { recognition.start(); } catch { recognition = null; }
  });
  approve.addEventListener('click', saveApprovedExperience);
  discard.addEventListener('click', () => { pending = null; pendingFiles = []; review.hidden = true; status.textContent = 'Proposal discarded—nothing was remembered'; });
  document.addEventListener('click', event => {
    const attachment = event.target.closest?.('[data-nova-attachment]');
    if (attachment) downloadAttachment(attachment.dataset.novaAttachment).catch(error => { status.textContent = error.message; });
    const remove = event.target.closest?.('[data-nova-remove-experience]');
    if (remove) removeExperience(remove.dataset.novaRemoveExperience).catch(error => { status.textContent = error.message; });
  });
  exportBrain?.addEventListener('click', () => exportEncryptedBrain().catch(error => { console.error(error); status.textContent = `Export failed: ${error.message}`; }));
  importBrain?.addEventListener('click', () => importFile?.click());
  importFile?.addEventListener('change', () => {
    importEncryptedBrain(importFile.files?.[0]).catch(error => { console.error(error); status.textContent = `Import failed: ${error.message}`; }).finally(() => { importFile.value = ''; });
  });

  async function start(nextKey) {
    if (!nextKey || key) return;
    key = nextKey;
    date.value ||= today();
    try { await loadExperiences(); }
    catch (error) { console.error(error); status.textContent = 'Private experience storage is unavailable on this device'; }
  }

  window.addEventListener('nova-vault-opened', event => start(event.detail?.key));
  start(window.NovaMemoryCore?.getKey?.());
})();
