(() => {
  "use strict";

  const STYLE_ID = "rainbowPromisePortalStyles";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .rainbow-promise-planet{
        display:grid!important;
        place-items:center!important;
        flex:0 0 96px!important;
        width:96px!important;
        height:96px!important;
        border-radius:50%!important;
        border:1px solid rgba(156,211,255,.38)!important;
        background:
          radial-gradient(circle at 50% 68%,rgba(222,244,255,.22),transparent 46%),
          linear-gradient(145deg,rgba(20,54,88,.96),rgba(7,13,30,.98))!important;
        box-shadow:inset -12px -15px 22px rgba(0,0,0,.34),0 0 22px rgba(98,187,255,.34)!important;
        overflow:visible!important;
        filter:none!important;
      }
      .rainbow-promise-planet::before,
      .rainbow-promise-planet::after{content:none!important;display:none!important}
      .rainbow-portal-symbol{
        display:block;
        font-size:3.75rem;
        line-height:1;
        transform:translateY(-1px);
        filter:drop-shadow(0 0 10px rgba(134,211,255,.52));
        animation:rainbowPromiseFloat 4.8s ease-in-out infinite;
      }
      .rainbow-promise-card{
        border-color:rgba(117,190,255,.62)!important;
        background:
          radial-gradient(circle at 88% 12%,rgba(255,105,197,.12),transparent 34%),
          linear-gradient(145deg,rgba(12,31,52,.94),rgba(7,12,25,.94))!important;
      }
      @keyframes rainbowPromiseFloat{
        0%,100%{transform:translateY(-1px) scale(1)}
        50%{transform:translateY(-5px) scale(1.04)}
      }
      @media(max-width:640px){
        .rainbow-promise-planet{flex-basis:78px!important;width:78px!important;height:78px!important}
        .rainbow-portal-symbol{font-size:3rem}
      }
      @media(prefers-reduced-motion:reduce){.rainbow-portal-symbol{animation:none}}
    `;
    document.head.appendChild(style);
  }

  function restoreGuestbookMenu() {
    const menuLink = [...document.querySelectorAll(".menu a")].find(link =>
      link.textContent.trim() === "RAINBOW" ||
      link.getAttribute("aria-label") === "Open The Rainbow Promise page"
    );
    if (!menuLink) return;
    if (menuLink.getAttribute("href") !== "#guestbook") menuLink.setAttribute("href", "#guestbook");
    if (menuLink.textContent.trim() !== "GUESTBOOK") menuLink.textContent = "GUESTBOOK";
    menuLink.removeAttribute("aria-label");
    menuLink.removeAttribute("title");
  }

  function updateRainbowCard() {
    const section = document.getElementById("connected-worlds");
    if (!section) return false;

    const cards = [...section.querySelectorAll(".astralis-planet-link")];
    const card = cards.find(link => /Guestbook Moon|Rainbow Promise/i.test(link.textContent)) || cards[5];
    if (!card) return false;

    installStyles();
    card.classList.add("rainbow-promise-card");
    if (card.getAttribute("href") !== "/rainbow-promise.html") card.setAttribute("href", "/rainbow-promise.html");
    if (card.getAttribute("aria-label") !== "Open The Rainbow Promise reflection") {
      card.setAttribute("aria-label", "Open The Rainbow Promise reflection");
    }
    card.removeAttribute("target");
    card.removeAttribute("rel");

    const planet = card.querySelector(".astralis-planet");
    if (planet && !planet.classList.contains("rainbow-promise-planet")) {
      planet.className = "astralis-planet rainbow-promise-planet";
      const symbol = document.createElement("span");
      symbol.className = "rainbow-portal-symbol";
      symbol.setAttribute("aria-hidden", "true");
      symbol.textContent = "🌈";
      planet.replaceChildren(symbol);
    }

    const copy = card.querySelector(".astralis-planet-copy");
    if (!copy) return true;

    const heading = copy.querySelector("strong");
    if (heading && heading.textContent !== "Rainbow Promise") heading.textContent = "Rainbow Promise";

    const description = [...copy.querySelectorAll(":scope > span")].find(span =>
      !span.classList.contains("astralis-world-badge") &&
      !span.classList.contains("astralis-world-origin")
    );
    const descriptionText = "Rain, Noah’s ark, the covenant, and the hope carried across the sky after a storm.";
    if (description && description.textContent !== descriptionText) description.textContent = descriptionText;

    const badge = copy.querySelector(".astralis-world-badge");
    if (badge && badge.textContent !== "Reflection World") badge.textContent = "Reflection World";

    const origin = copy.querySelector(".astralis-world-origin");
    if (origin && origin.textContent !== "Visual: Rainbow after the rain") {
      origin.textContent = "Visual: Rainbow after the rain";
    }

    return true;
  }

  function apply() {
    restoreGuestbookMenu();
    updateRainbowCard();
  }

  apply();
  document.addEventListener("DOMContentLoaded", apply, { once: true });
  [500, 1400, 3200, 6200].forEach(delay => window.setTimeout(apply, delay));

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["href", "class"] });
  window.setTimeout(() => observer.disconnect(), 12000);
})();
