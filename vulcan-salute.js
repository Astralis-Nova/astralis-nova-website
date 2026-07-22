(() => {
  "use strict";

  document.getElementById("astralisVulcanBlessing")?.remove();
  document.getElementById("astralisVulcanBlessingStyles")?.remove();

  const style = document.createElement("style");
  style.id = "astralisVulcanBlessingStyles";
  style.textContent = `
    .vulcan-inline-blessing{
      position:relative;
      z-index:2;
      display:flex;
      justify-content:center;
      align-items:center;
      width:100%;
      box-sizing:border-box;
      margin:42px 0 0;
      padding:26px 18px 116px;
      color:#d9e9f7;
      text-align:center;
      pointer-events:none;
    }
    .vulcan-inline-line{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      flex-wrap:wrap;
      gap:.4rem;
      max-width:min(680px,calc(100vw - 36px));
      padding:9px 15px;
      border:1px solid rgba(129,205,255,.18);
      border-radius:999px;
      background:rgba(3,11,24,.58);
      box-shadow:0 10px 28px rgba(0,0,0,.25),0 0 18px rgba(76,164,255,.07);
      font-size:clamp(.78rem,1.2vw,.92rem);
      line-height:1.45;
      letter-spacing:.025em;
      backdrop-filter:blur(5px);
      -webkit-backdrop-filter:blur(5px);
    }
    .vulcan-inline-icon{
      display:inline-block;
      font-size:1.12em;
      line-height:1;
      opacity:.82;
      filter:brightness(1.22) saturate(.62) contrast(.94);
      text-shadow:0 0 5px rgba(190,232,255,.42),0 0 11px rgba(132,199,255,.18);
      transform-origin:50% 80%;
      animation:vulcanInlineGlow 3.2s ease-in-out infinite;
    }
    @keyframes vulcanInlineGlow{
      0%,100%{transform:translateY(0) scale(.98);opacity:.76}
      50%{transform:translateY(-1px) scale(1.04);opacity:.96}
    }
    @media(max-width:700px){
      .vulcan-inline-blessing{margin-top:32px;padding:20px 12px 104px}
      .vulcan-inline-line{gap:.32rem;padding:8px 12px;font-size:.75rem}
      .vulcan-inline-icon{font-size:1.08em}
    }
    @media(prefers-reduced-motion:reduce){
      .vulcan-inline-icon{animation:none}
    }
  `;
  document.head.appendChild(style);

  const section = document.createElement("section");
  section.id = "astralisVulcanBlessing";
  section.className = "vulcan-inline-blessing";
  section.setAttribute("aria-label", "Live long and prosper blessing");
  section.innerHTML = `
    <p class="vulcan-inline-line">
      <span>Peace and long life from the Astralis frontier.</span>
      <span class="vulcan-inline-icon" aria-hidden="true">🖖</span>
    </p>
  `;

  document.body.appendChild(section);
})();
