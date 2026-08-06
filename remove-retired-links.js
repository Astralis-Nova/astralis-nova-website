(() => {
  "use strict";

  function removeRetiredItems() {
    document.querySelectorAll('.astralis-planet-link[href="/lion-den-faith.html"], .astralis-planet-link[href="/lion-den-faith"], a[href*="lion-den-faith"]')
      .forEach(link => {
        if (link.closest('.astralis-system')) link.remove();
      });

    document.querySelectorAll('.midi-relics').forEach(section => section.remove());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeRetiredItems, { once: true });
  } else {
    removeRetiredItems();
  }

  const observer = new MutationObserver(removeRetiredItems);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
})();
