(() => {
  "use strict";

  function repairHomepageCards() {
    const system = document.querySelector('#connected-worlds .astralis-system');
    if (system) {
      system.querySelectorAll('.astralis-planet-link').forEach(link => {
        const url = new URL(link.href, location.href);

        if (url.pathname === '/conquest.html' || url.hash === '#guestbook') {
          link.remove();
          return;
        }

        if (url.hostname === 'emulator.ac') {
          link.href = 'https://emulator.ac/';
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('aria-label', 'Open ACEmulator and learn about the Conquest ACE world');

          const title = link.querySelector('.astralis-planet-copy strong');
          const description = [...link.querySelectorAll('.astralis-planet-copy > span')]
            .find(span => !span.classList.contains('astralis-world-badge') && !span.classList.contains('astralis-world-origin'));
          const badge = link.querySelector('.astralis-world-badge');

          if (title) title.textContent = 'ACEmulator';
          if (description) description.textContent = 'The open-source engine rebuilding Dereth, including the ACE technology behind worlds such as Conquest.';
          if (badge) badge.textContent = 'ACE World Portal';
        }

        if (url.pathname === '/lion-den-faith.html' || url.pathname === '/lion-den-faith') {
          link.href = '/rainbow-promise.html';
          link.setAttribute('aria-label', 'Open The Rainbow Promise reflection');
          link.removeAttribute('target');
          link.removeAttribute('rel');

          const title = link.querySelector('.astralis-planet-copy strong');
          const description = [...link.querySelectorAll('.astralis-planet-copy > span')]
            .find(span => !span.classList.contains('astralis-world-badge') && !span.classList.contains('astralis-world-origin'));
          const badge = link.querySelector('.astralis-world-badge');

          if (title) title.textContent = 'Rainbow Promise';
          if (description) description.textContent = 'Rain, Noah’s ark, the covenant, and hope carried across the sky after a storm.';
          if (badge) badge.textContent = 'Reflection World';
        }
      });
    }

    document.querySelectorAll('.midi-relics').forEach(section => section.remove());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', repairHomepageCards, { once: true });
  } else {
    repairHomepageCards();
  }

  const observer = new MutationObserver(repairHomepageCards);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
