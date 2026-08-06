(() => {
  "use strict";

  const STORY_URL = "/lion-den-faith.html?portal=1";

  function removeOldCards() {
    document.querySelectorAll('#connected-worlds a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = (link.textContent || '').toLowerCase();
      if (
        href === '#live-board' ||
        href.includes('daniel') ||
        href.includes('lion-den') ||
        text.includes('eraser board') ||
        text.includes('daniel and the lions')
      ) {
        link.remove();
      }
    });
  }

  function addPortal() {
    removeOldCards();
    if (document.getElementById('lionsDenStandalonePortal')) return true;

    const guestbook = document.getElementById('guestbook');
    if (!guestbook?.parentNode) return false;

    const style = document.createElement('style');
    style.id = 'lionsDenStandaloneStyles';
    style.textContent = `
      #lionsDenStandalonePortal{padding:0 0 36px}
      .lions-den-standalone{display:block;position:relative;overflow:hidden;padding:26px;border-radius:20px;border:1px solid rgba(255,200,92,.48);background:radial-gradient(circle at 12% 32%,rgba(255,183,55,.25),transparent 24rem),linear-gradient(145deg,rgba(45,25,10,.96),rgba(8,12,21,.96));color:#fff;text-decoration:none;box-shadow:0 22px 60px rgba(0,0,0,.38)}
      .lions-den-standalone-inner{display:flex;align-items:center;gap:20px;position:relative;z-index:1}
      .lions-den-mark{flex:0 0 88px;width:88px;height:88px;border-radius:50%;display:grid;place-items:center;font-size:2.25rem;background:radial-gradient(circle at 35% 28%,#fff4bd 0 8%,#e5a13e 22%,#8f4321 58%,#25110b 100%);box-shadow:0 0 28px rgba(255,180,65,.38)}
      .lions-den-copy strong{display:block;font-size:clamp(1.35rem,3vw,2rem);margin-bottom:6px}
      .lions-den-copy span{display:block;color:#e2d5bf;line-height:1.55}
      .lions-den-badge{display:inline-flex!important;width:max-content;margin-top:10px!important;padding:5px 9px;border:1px solid rgba(255,214,126,.45);border-radius:999px;color:#ffe39c!important;font-size:.7rem!important;font-weight:900;letter-spacing:.06em;text-transform:uppercase}
      .lions-den-standalone:hover,.lions-den-standalone:focus-visible{border-color:#ffd873;transform:translateY(-2px)}
      @media(max-width:620px){.lions-den-standalone-inner{align-items:flex-start}.lions-den-mark{flex-basis:68px;width:68px;height:68px;font-size:1.75rem}}
    `;
    document.head.appendChild(style);

    const section = document.createElement('section');
    section.id = 'lionsDenStandalonePortal';
    section.className = 'section-shell shell';
    section.innerHTML = `
      <a class="lions-den-standalone" href="${STORY_URL}" aria-label="Open Daniel and the Lions' Den story">
        <span class="lions-den-standalone-inner">
          <span class="lions-den-mark" aria-hidden="true">🦁</span>
          <span class="lions-den-copy">
            <strong>Daniel and the Lions’ Den</strong>
            <span>A standalone story portal of faith, courage, prayer, integrity, and deliverance.</span>
            <span class="lions-den-badge">Open Story Portal</span>
          </span>
        </span>
      </a>`;

    guestbook.parentNode.insertBefore(section, guestbook);
    return true;
  }

  if (addPortal()) return;
  const observer = new MutationObserver(() => {
    removeOldCards();
    if (addPortal()) observer.disconnect();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();