(() => {
  if (document.getElementById("astralis-realistic-orbit-v1")) return;

  const style = document.createElement("style");
  style.id = "astralis-realistic-orbit-v1";
  style.textContent = `
    .relic-icon{width:58px;height:58px;flex:0 0 58px;display:grid;place-items:center;background:transparent;border:0;overflow:visible;font-size:0}
    .relic-icon img{display:block;width:54px;height:54px;object-fit:contain;filter:drop-shadow(0 0 10px rgba(85,152,255,.3));animation:planetDrift 6s ease-in-out infinite;transition:transform .28s ease,filter .28s ease}
    .relic-link-card:nth-child(2n) .relic-icon img{animation-delay:-1.5s}.relic-link-card:nth-child(3n) .relic-icon img{animation-delay:-3s}
    .relic-link-card:hover .relic-icon img,.relic-link-card:focus-visible .relic-icon img{transform:scale(1.13) rotate(4deg);filter:drop-shadow(0 0 16px rgba(120,184,255,.58))}
    @keyframes planetDrift{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(2deg)}}
    .recent-comet{position:fixed;left:-420px;top:14vh;width:clamp(150px,18vw,300px);z-index:32;pointer-events:none;background:transparent;opacity:.74;filter:drop-shadow(0 0 12px rgba(102,177,255,.3));animation:recentCometPass 48s linear infinite;will-change:transform,left,top}
    .recent-comet img{display:block;width:100%;height:auto;background:transparent}
    @keyframes recentCometPass{0%{left:-420px;top:14vh;transform:rotate(-8deg) scale(.78);opacity:0}5%{opacity:.74}45%{top:34vh;transform:rotate(-4deg) scale(.92)}88%{opacity:.7}100%{left:calc(100vw + 420px);top:56vh;transform:rotate(2deg) scale(.72);opacity:0}}
    @media(max-width:700px){.relic-icon{width:46px;height:46px;flex-basis:46px}.relic-icon img{width:44px;height:44px}.recent-comet{width:145px;opacity:.6}}
    @media(prefers-reduced-motion:reduce){.relic-icon img{animation:none}.recent-comet{display:none}}
  `;
  document.head.appendChild(style);

  const icons = [
    "planet-earthlike.svg","planet-rocky.svg","planet-gas-giant.svg",
    "planet-earthlike.svg","planet-rocky.svg","planet-gas-giant.svg",
    "planet-gas-giant.svg","planet-earthlike.svg"
  ];
  document.querySelectorAll(".relic-icon").forEach((el, i) => {
    if (i >= icons.length) return;
    const img = document.createElement("img");
    img.src = icons[i];
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    el.replaceChildren(img);
  });

  if (!document.querySelector(".recent-comet")) {
    const comet = document.createElement("div");
    comet.className = "recent-comet";
    comet.setAttribute("aria-hidden", "true");
    const img = document.createElement("img");
    img.src = "comet-c2026-a1-maps.svg";
    img.alt = "";
    comet.appendChild(img);
    document.body.appendChild(comet);
  }
})();
