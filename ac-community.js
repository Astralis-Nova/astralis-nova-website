(() => {
  'use strict';
  const catalog = document.getElementById('conquest-quests');
  const search = document.getElementById('questSearch');
  const server = document.getElementById('questServer');
  const target = document.getElementById('databaseTarget');
  function chooseCatalog(conquest, clearSearch = false) {
    if (!catalog || !server || !target || !search) return;
    catalog.open = conquest;
    server.value = conquest ? 'Conquest' : 'all';
    target.value = conquest ? 'conquest' : 'web';
    if (clearSearch) {
      search.value = '';
      document.getElementById('questType').value = 'all';
    }
    server.dispatchEvent(new Event('change', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
    search.dispatchEvent(new Event('input', { bubbles: true }));
  }
  document.querySelectorAll('a[href="#conquest-quests"]').forEach(link => {
    link.addEventListener('click', () => chooseCatalog(true, true));
  });
  document.querySelectorAll('a[href="#quests"]').forEach(link => {
    link.addEventListener('click', () => chooseCatalog(false));
  });
  function followHash() {
    if (location.hash === '#conquest-quests') chooseCatalog(true);
  }
  window.addEventListener('hashchange', followHash);
  followHash();

  const form = document.getElementById('acFeedbackForm');
  const list = document.getElementById('acFeedbackEntries');
  const status = document.getElementById('acFeedbackStatus');
  const counter = document.getElementById('acFeedbackCount');
  const submit = document.getElementById('acFeedbackSubmit');
  const refresh = document.getElementById('acFeedbackRefresh');
  if (!form || !list || !status || !counter || !submit || !refresh) return;
  let entries = [];
  submit.disabled = false;
  let loadVersion = 0;
  const categories = new Set(['Guestbook', 'Suggestion', 'Report a problem', 'Missing content']);
  const prefix = /^\[AC Worlds \/ (Guestbook|Suggestion|Report a problem|Missing content)\] /;
  function element(tag, text, className) {
    const node = document.createElement(tag);
    node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function render() {
    list.replaceChildren();
    counter.textContent = entries.length + ' shown · latest 50 AC Worlds messages';
    if (!entries.length) {
      list.append(element('p', 'No AC Worlds messages yet. Leave the first note.'));
      return;
    }
    entries.forEach(entry => {
      const card = element('article', '', 'feedback-entry');
      const match = String(entry.message || '').match(prefix);
      const date = new Date(entry.created_at);
      card.append(element('h4', entry.name || 'Visitor'));
      card.append(element('span', match ? match[1] : 'AC Worlds message', 'feedback-kind'));
      card.append(element('p', String(entry.message || '').replace(prefix, '')));
      if (Number.isFinite(date.getTime())) {
        const time = element('time', date.toLocaleString());
        time.dateTime = date.toISOString();
        card.append(time);
      }
      list.append(card);
    });
  }
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'The guestbook is unavailable. Please try again.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('The connection timed out. Refresh messages before trying again.');
      throw error;
    } finally { clearTimeout(timer); }
  }
  async function load() {
    const version = ++loadVersion;
    refresh.disabled = true;
    try {
      const data = await request('/api/guestbook?scope=ac-worlds', { headers: { Accept: 'application/json' } });
      if (version !== loadVersion) return;
      if (!Array.isArray(data.entries)) throw new Error('Unexpected guestbook response. Please retry.');
      entries = data.entries.filter(entry => entry && String(entry.message || '').startsWith('[AC Worlds / ')).slice(0, 50);
      render();
    } catch (_) {
      if (version !== loadVersion) return;
      counter.textContent = 'Messages could not be refreshed. Use Refresh to retry.';
      if (!entries.length) list.replaceChildren(element('p', 'Visitor messages are temporarily unavailable.'));
    } finally { if (version === loadVersion) refresh.disabled = false; }
  }
  refresh.addEventListener('click', load);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    const values = new FormData(form);
    const kind = String(values.get('kind'));
    const message = String(values.get('message') || '').trim();
    const name = String(values.get('name') || '').trim();
    if (!categories.has(kind) || !name || message.length < 3 || message.length > 450) {
      status.textContent = 'Enter a nickname and a message of 3–450 characters.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Posting your public message…';
    try {
      const result = await request('/api/guestbook', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, message: '[AC Worlds / ' + kind + '] ' + message, website: String(values.get('website') || '') })
      });
      if (!result.entry || !result.entry.id) throw new Error('Could not confirm your post. Refresh before trying again.');
      ++loadVersion;
      refresh.disabled = false;
      entries = [result.entry, ...entries.filter(entry => entry.id !== result.entry.id)].slice(0, 50);
      render();
      form.reset();
      status.textContent = 'Posted publicly. Thank you for helping improve AC Worlds!';
    } catch (error) {
      status.textContent = error.message || 'Could not post your message. Your text is still here; please retry.';
    } finally { submit.disabled = false; }
  });
  load();
})();
