(() => {
  "use strict";

  const destination = "/daniel-lions-story-static.html?fresh=20260805n";

  function replaceCard() {
    const oldCard = document.querySelector(
      '#connected-worlds a.astralis-planet-link[href="#live-board"]'
    );

    if (!oldCard) return false;

    const card = oldCard.cloneNode(true);
    card.href = destination;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute(
      "aria-label",
      "Open Daniel and the Lions Den inspirational story in a new tab"
    );
    card.removeAttribute("onclick");

    const planet = card.querySelector(".astralis-planet");
    if (planet) {
      planet.className = "astralis-planet planet-board ringed";
    }

    const title = card.querySelector(".astralis-planet-copy strong");
    if (title) title.textContent = "Daniel and the Lions’ Den";

    const text = card.querySelector(".astralis-planet-copy > span:not(.astralis-world-badge)");
    if (text) {
      text.textContent =
        "Enter the story of Daniel’s courage, prayer, integrity, and deliverance.";
    }

    const badge = card.querySelector(".astralis-world-badge");
    if (badge) badge.textContent = "Inspirational Story";

    oldCard.replaceWith(card);
    return true;
  }

  if (replaceCard()) return;

  const observer = new MutationObserver(() => {
    if (replaceCard()) observer.disconnect();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  setTimeout(() => observer.disconnect(), 15000);
})();