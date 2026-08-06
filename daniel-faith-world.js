(() => {
  "use strict";

  const addDanielWorld = () => {
    const system = document.querySelector("#connected-worlds .astralis-system");
    if (!system) return false;

    system.querySelectorAll('a[href="#live-board"],a[href*="daniel"],a[href*="lion-den"]')
      .forEach(link => link.remove());

    if (document.getElementById("danielFaithWorld")) return true;

    const style = document.createElement("style");
    style.textContent = `.planet-faith-den{background:radial-gradient(circle at 35% 28%,#fff3b5 0 5%,#e9a13b 17%,#9a4d25 47%,#402117 76%,#0b0807 100%);box-shadow:inset -13px -13px 18px rgba(0,0,0,.42),0 0 22px rgba(255,180,74,.34)}`;
    document.head.appendChild(style);

    const card = document.createElement("a");
    card.id = "danielFaithWorld";
    card.className = "astralis-planet-link daniel-faith-link";
    card.href = "/lion-den-faith.html";
    card.setAttribute("aria-label", "Open Daniel and the Lions’ Den story");
    card.innerHTML = `
      <span class="astralis-planet planet-faith-den ringed" aria-hidden="true"></span>
      <span class="astralis-planet-copy">
        <strong>Daniel and the Lions’ Den</strong>
        <span>Enter a story of faith, courage, integrity, prayer, and deliverance.</span>
        <span class="astralis-world-badge">Inspirational Story</span>
      </span>`;

    const biography = system.querySelector('a[href="/biography.html"]');
    if (biography) system.insertBefore(card, biography);
    else system.appendChild(card);
    return true;
  };

  if (addDanielWorld()) return;
  const observer = new MutationObserver(() => {
    if (addDanielWorld()) observer.disconnect();
  });
  observer.observe(document.documentElement, {childList:true, subtree:true});
  setTimeout(() => observer.disconnect(), 10000);
})();