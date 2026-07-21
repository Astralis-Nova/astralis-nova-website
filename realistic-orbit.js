(() => {
  document.getElementById("astralis-realistic-orbit-v1")?.remove();
  document.getElementById("astralis-realistic-orbit-v2")?.remove();
  document.querySelectorAll(".recent-comet").forEach(element => element.remove());

  const style = document.createElement("style");
  style.id = "astralis-realistic-orbit-v2";
  style.textContent = `
    .relic-icon{width:58px;height:58px;flex:0 0 58px;display:grid;place-items:center;background:transparent;border:0;overflow:visible;font-size:0}
    .relic-icon img{display:block;width:54px;height:54px;object-fit:contain;background:transparent;mix-blend-mode:screen;filter:drop-shadow(0 0 10px rgba(85,152,255,.3));animation:planetDrift 6s ease-in-out infinite;transition:transform .28s ease,filter .28s ease}
    .relic-link-card:nth-child(2n) .relic-icon img{animation-delay:-1.5s}.relic-link-card:nth-child(3n) .relic-icon img{animation-delay:-3s}
    .relic-link-card:hover .relic-icon img,.relic-link-card:focus-visible .relic-icon img{transform:scale(1.13) rotate(4deg);filter:drop-shadow(0 0 16px rgba(120,184,255,.58))}
    @keyframes planetDrift{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-4px) rotate(2deg)}}
    .recent-comet{display:none!important}
    @media(max-width:700px){.relic-icon{width:46px;height:46px;flex-basis:46px}.relic-icon img{width:44px;height:44px}}
    @media(prefers-reduced-motion:reduce){.relic-icon img{animation:none}}
  `;
  document.head.appendChild(style);

  const icons = [
    "/recent-beta-pictoris-d.svg","/recent-toi-1752-b.svg","/recent-wispit-2b.svg",
    "/recent-toi-5624-b.svg","/recent-gaia23bra-b.svg","/recent-toi-1752-c.svg",
    "/recent-wispit-2b.svg","/recent-beta-pictoris-d.svg"
  ];

  document.querySelectorAll(".relic-icon").forEach((element, index) => {
    if (index >= icons.length) return;
    const image = document.createElement("img");
    image.src = icons[index];
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    element.replaceChildren(image);
  });
})();
