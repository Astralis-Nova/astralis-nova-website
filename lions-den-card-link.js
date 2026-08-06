(() => {
  "use strict";

  function replaceCard() {
    const card = document.querySelector('.astralis-planet-link[href="#live-board"]');
    if (!card || card.dataset.lionsDenLink === "true") return Boolean(card);

    card.dataset.lionsDenLink = "true";
    card.href = "/lion-den-faith.html";
    card.setAttribute("aria-label", "Open Daniel and the Lions’ Den faith story");

    const title = card.querySelector(".astralis-planet-copy strong");
    const description = card.querySelector(".astralis-planet-copy span:not(.astralis-world-badge)");
    const badge = card.querySelector(".astralis-world-badge");

    if (title) title.textContent = "Daniel and the Lions’ Den";
    if (description) description.textContent = "A story of courage, prayer, faith, and protection in the darkness.";
    if (badge) badge.textContent = "Faith Story";

    return true;
  }

  function boot() {
    if (replaceCard()) return;

    const observer = new MutationObserver(() => {
      if (replaceCard()) observer.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
