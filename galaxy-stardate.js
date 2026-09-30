const TIME_ZONE = 'America/Phoenix';
const calendar = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: 'numeric', day: 'numeric' });

export function stardateFor(instant) {
  const parts = Object.fromEntries(calendar.formatToParts(instant).map(part => [part.type, part.value]));
  const year = Number(parts.year), month = Number(parts.month), day = Number(parts.day);
  const ordinal = 1 + Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000);
  return year + '.' + String(ordinal).padStart(3, '0');
}

function startClock() {
  const root = document.getElementById('galaxyStardate');
  if (!root) return;
  const stardate = document.getElementById('galaxyStardateValue');
  const clock = document.getElementById('galaxyArizonaTime');
  const date = document.getElementById('galaxyArizonaDate');
  const timeFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateFormat = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, month: 'short', day: 'numeric', year: 'numeric' });
  let anchor = { epoch: Date.now(), monotonic: performance.now() };
  let syncing = false;

  function render() {
    if (document.hidden) return;
    const instant = new Date(anchor.epoch + performance.now() - anchor.monotonic);
    const iso = instant.toISOString();
    stardate.textContent = stardateFor(instant);
    stardate.dateTime = iso;
    clock.textContent = timeFormat.format(instant);
    clock.dateTime = iso;
    date.textContent = dateFormat.format(instant);
    date.dateTime = iso;
  }

  async function synchronize() {
    if (syncing || document.hidden) return;
    syncing = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const started = performance.now();
    try {
      const response = await fetch('/api/stardate', { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('Time synchronization unavailable');
      const payload = await response.json();
      if (!Number.isFinite(payload.now) || payload.now < 0 || payload.now > 8640000000000000 || payload.timeZone !== TIME_ZONE) throw new Error('Invalid time response');
      const received = performance.now();
      // Compensate for approximately half the request's round-trip delay.
      anchor = { epoch: payload.now + (received - started) / 2, monotonic: received };
      root.dataset.timeSource = 'server';
      render();
    } catch {
      // Keep the clock running from its last known time during a connection gap.
    } finally {
      clearTimeout(timeout);
      syncing = false;
    }
  }

  root.dataset.timeSource = 'device';
  render();
  synchronize();
  setInterval(render, 1000);
  setInterval(synchronize, 300000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      render();
      synchronize();
    }
  });
  window.addEventListener('online', synchronize);
}

if (typeof document !== 'undefined') startClock();
