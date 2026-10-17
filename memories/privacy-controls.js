(() => {
  'use strict';
  const IDLE_MS = 15 * 60 * 1000;
  let active = false, lastActivity = 0, timer, controller;
  const dialog = document.createElement('dialog');
  dialog.className = 'memory-consent';
  dialog.setAttribute('aria-labelledby', 'memoryConsentTitle');
  dialog.innerHTML = `<form><h2 id="memoryConsentTitle">Review online memory analysis</h2>
    <p>This exact request will leave this device for the Astralis Nova server and Cloudflare Workers AI. It includes the question, selected memory text, tags, and relationship scores. Attachments and the wake phrase are excluded.</p>
    <pre tabindex="0" aria-label="Exact request to send"></pre>
    <label for="memoryAIToken">Owner online-analysis token</label>
    <input id="memoryAIToken" type="password" autocomplete="off" required>
    <p>Use the configured MEMORY_AI_TOKEN, or the existing owner admin token. It is used for this request only and is never saved.</p>
    <label class="memory-permission"><input type="checkbox" required> I permit this request to be sent to Cloudflare AI.</label>
    <div><button type="button" data-cancel>Keep local</button><button type="submit">Send this request</button></div></form>`;
  document.body.appendChild(dialog);
  const input = dialog.querySelector('input[type=password]');
  const checkbox = dialog.querySelector('input[type=checkbox]');
  let resolveConsent = null;
  function finish(value) {
    input.value = ''; checkbox.checked = false; dialog.querySelector('pre').textContent = '';
    if (dialog.open) dialog.close();
    const resolve = resolveConsent; resolveConsent = null; resolve?.(value);
  }
  dialog.querySelector('[data-cancel]').addEventListener('click', () => finish(null));
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
  dialog.querySelector('form').addEventListener('submit', event => { event.preventDefault(); if (event.target.reportValidity()) finish(input.value.trim()); });
  function lock() {
    if (!active) return;
    active = false; clearTimeout(timer); controller?.abort(); finish(null);
    // Reload discards closure-held keys and plaintext in every constellation module.
    // Never clear IndexedDB, learning storage, encrypted vaults, or backup files.
    document.getElementById('vault').hidden = true;
    sessionStorage.removeItem('astralisNovaMemoryPhrase'); location.reload();
  }
  function checkIdle() {
    if (!active) return;
    const remaining = IDLE_MS - (Date.now() - lastActivity);
    if (remaining <= 0) lock();
    else { clearTimeout(timer); timer = setTimeout(checkIdle, remaining); }
  }
  function activity(event) {
    if (!active || !event.isTrusted) return;
    if (Date.now() - lastActivity >= IDLE_MS) { lock(); return; }
    lastActivity = Date.now();
  }
  for (const type of ['pointerdown', 'keydown', 'input', 'scroll']) document.addEventListener(type, activity, { passive: true, capture: true });
  document.addEventListener('visibilitychange', checkIdle);
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  window.NovaMemoryPrivacy = {
    lock, unlocked() { active = true; lastActivity = Date.now(); checkIdle(); },
    async analyze(payload) {
      if (!active || resolveConsent) return null;
      const body = JSON.stringify(payload);
      dialog.querySelector('pre').textContent = JSON.stringify(JSON.parse(body), null, 2);
      dialog.showModal(); dialog.querySelector('[data-cancel]').focus();
      let token = await new Promise(resolve => { resolveConsent = resolve; });
      if (!token || !active) return null;
      controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const pending = fetch('/api/nova-brain', { method: 'POST', cache: 'no-store', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, 'x-nova-consent': 'preview-confirmed' }, body, signal: controller.signal });
        token = ''; const response = await pending; const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Online analysis failed.');
        return active ? data : null;
      } finally { token = ''; clearTimeout(timeout); controller = null; }
    }
  };
})();
