(() => {
  "use strict";

  function repairHomepageCards() {
    document.querySelectorAll('.astralis-planet-link[href="/lion-den-faith.html"], .astralis-planet-link[href="/lion-den-faith"], a[href*="lion-den-faith"]')
      .forEach(link => {
        if (!link.closest('.astralis-system')) return;
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
      });

    document.querySelectorAll('.midi-relics').forEach(section => section.remove());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", repairHomepageCards, { once: true });
  } else {
    repairHomepageCards();
  }

  const observer = new MutationObserver(repairHomepageCards);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
