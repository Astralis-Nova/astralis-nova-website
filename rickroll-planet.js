(() => {
  "use strict";

  if (window.__astralisRickrollPlanetInstalled) return;
  window.__astralisRickrollPlanetInstalled = true;

  const VIDEO_ID = "dQw4w9WgXcQ";
  const CARD_ID = "astralisUnknownSignalWorld";
  const MODAL_ID = "astralisRickrollTransmission";

  function installStyles() {
    if (document.getElementById("astralisRickrollStyles")) return;

    const style = document.createElement("style");
    style.id = "astralisRickrollStyles";
    style.textContent = `
      .astralis-rickroll-world{
        cursor:pointer;
        border-color:rgba(204,107,255,.48)!important;
        background:
          radial-gradient(circle at 14% 42%,rgba(191,71,255,.16),transparent 34%),
          linear-gradient(145deg,rgba(22,15,48,.96),rgba(7,12,25,.94))!important;
      }
      .astralis-rickroll-world:hover,
      .astralis-rickroll-world:focus-visible{
        border-color:#e19aff!important;
        box-shadow:0 17px 38px rgba(0,0,0,.36),0 0 34px rgba(183,74,255,.25)!important;
      }
      .planet-unknown-signal{
        background:
          radial-gradient(circle at 31% 26%,#fff 0 3%,#e5a4ff 7%,#9b3fd4 20%,#45146f 48%,#180726 73%,#050208 100%);
        box-shadow:
          inset -14px -15px 19px rgba(0,0,0,.48),
          0 0 16px rgba(223,128,255,.55),
          0 0 34px rgba(115,55,255,.35)!important;
        animation:astralisSignalPlanetPulse 3.6s ease-in-out infinite;
      }
      .planet-unknown-signal::before{
        content:"";
        position:absolute;
        inset:-9px;
        border-radius:50%;
        border:1px dashed rgba(224,161,255,.6);
        animation:astralisSignalOrbit 9s linear infinite;
      }
      .planet-unknown-signal::after{
        content:"";
        position:absolute;
        width:10px;
        height:10px;
        right:-3px;
        top:8px;
        border-radius:50%;
        background:#f4dcff;
        box-shadow:0 0 7px #fff,0 0 15px #c566ff;
        animation:astralisSignalBeacon 1.6s ease-in-out infinite;
      }
      .astralis-rickroll-world .astralis-world-badge{
        color:#ebc1ff!important;
        border-color:rgba(218,133,255,.44)!important;
      }

      .astralis-rickroll-modal{
        position:fixed;
        inset:0;
        z-index:1000000;
        display:grid;
        place-items:center;
        padding:clamp(14px,3vw,34px);
        background:
          radial-gradient(circle at 50% 42%,rgba(105,44,169,.32),transparent 45%),
          rgba(0,3,12,.94);
        backdrop-filter:blur(10px);
        opacity:0;
        visibility:hidden;
        transition:opacity .25s ease,visibility .25s ease;
      }
      .astralis-rickroll-modal.open{
        opacity:1;
        visibility:visible;
      }
      .astralis-rickroll-panel{
        position:relative;
        width:min(960px,96vw);
        overflow:hidden;
        border:1px solid rgba(180,123,255,.66);
        border-radius:22px;
        background:linear-gradient(160deg,rgba(11,16,36,.98),rgba(5,7,17,.99));
        box-shadow:0 30px 100px rgba(0,0,0,.72),0 0 42px rgba(158,73,255,.24);
        transform:translateY(18px) scale(.97);
        transition:transform .28s ease;
      }
      .astralis-rickroll-modal.open .astralis-rickroll-panel{
        transform:none;
      }
      .astralis-rickroll-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:18px;
        padding:14px 16px;
        border-bottom:1px solid rgba(152,121,215,.28);
        background:linear-gradient(90deg,rgba(111,46,178,.18),transparent 45%,rgba(55,157,255,.1));
      }
      .astralis-rickroll-title{
        min-width:0;
      }
      .astralis-rickroll-title strong{
        display:block;
        color:#f1dcff;
        font-size:clamp(.86rem,2.4vw,1.05rem);
        letter-spacing:.13em;
        text-transform:uppercase;
      }
      .astralis-rickroll-title span{
        display:block;
        margin-top:3px;
        color:#aebbd2;
        font-size:.75rem;
      }
      .astralis-rickroll-close{
        flex:0 0 auto;
        width:40px;
        height:40px;
        border:1px solid rgba(187,139,255,.52);
        border-radius:50%;
        background:rgba(13,17,34,.9);
        color:#fff;
        font-size:1.35rem;
        cursor:pointer;
      }
      .astralis-rickroll-close:hover,
      .astralis-rickroll-close:focus-visible{
        border-color:#e5b6ff;
        box-shadow:0 0 18px rgba(195,108,255,.3);
      }
      .astralis-rickroll-video{
        position:relative;
        aspect-ratio:16 / 9;
        background:#000;
      }
      .astralis-rickroll-video iframe{
        position:absolute;
        inset:0;
        width:100%;
        height:100%;
        border:0;
      }
      .astralis-rickroll-foot{
        display:flex;
        justify-content:space-between;
        gap:14px;
        padding:11px 16px 14px;
        color:#aebbd2;
        font-size:.73rem;
      }
      .astralis-rickroll-foot a{
        color:#d7b5ff;
      }

      @keyframes astralisSignalPlanetPulse{
        0%,100%{transform:scale(1);filter:saturate(1)}
        50%{transform:scale(1.055);filter:saturate(1.25) brightness(1.08)}
      }
      @keyframes astralisSignalOrbit{to{transform:rotate(360deg)}}
      @keyframes astralisSignalBeacon{
        0%,100%{opacity:.45;transform:scale(.72)}
        50%{opacity:1;transform:scale(1.15)}
      }
      @media(max-width:640px){
        .astralis-rickroll-modal{padding:10px}
        .astralis-rickroll-head{padding:11px 12px}
        .astralis-rickroll-foot{padding:9px 12px 12px;flex-direction:column}
      }
      @media(prefers-reduced-motion:reduce){
        .planet-unknown-signal,.planet-unknown-signal::before,.planet-unknown-signal::after{animation:none!important}
        .astralis-rickroll-modal,.astralis-rickroll-panel{transition:none!important}
      }
    `;
    document.head.appendChild(style);
  }

  function createModal() {
    let modal = document.getElementById(MODAL_ID);
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = MODAL_ID;
    modal.className = "astralis-rickroll-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Unknown signal video transmission");
    modal.innerHTML = `
      <div class="astralis-rickroll-panel">
        <div class="astralis-rickroll-head">
          <div class="astralis-rickroll-title">
            <strong>Unknown Signal Acquired</strong>
            <span>Decrypting deep-space transmission...</span>
          </div>
          <button class="astralis-rickroll-close" type="button" aria-label="Close transmission">×</button>
        </div>
        <div class="astralis-rickroll-video"></div>
        <div class="astralis-rickroll-foot">
          <span>Transmission origin: classified dance sector</span>
          <a href="https://www.youtube.com/watch?v=${VIDEO_ID}" target="_blank" rel="noopener noreferrer">Open transmission directly</a>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const closeButton = modal.querySelector(".astralis-rickroll-close");
    const close = () => closeModal(modal);

    closeButton.addEventListener("click", close);
    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modal.classList.contains("open")) close();
    });

    return modal;
  }

  function openModal() {
    const modal = createModal();
    const video = modal.querySelector(".astralis-rickroll-video");
    const closeButton = modal.querySelector(".astralis-rickroll-close");

    video.innerHTML = `
      <iframe
        src="https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1"
        title="Unknown signal transmission"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowfullscreen></iframe>`;

    modal.classList.add("open");
    document.body.dataset.rickrollOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";
    setTimeout(() => closeButton.focus(), 60);
  }

  function closeModal(modal) {
    modal.classList.remove("open");
    modal.querySelector(".astralis-rickroll-video").innerHTML = "";
    document.body.style.overflow = document.body.dataset.rickrollOverflow || "";
    delete document.body.dataset.rickrollOverflow;
    document.getElementById(CARD_ID)?.focus();
  }

  function addPlanet() {
    if (document.getElementById(CARD_ID)) return true;

    const system = document.querySelector("#connected-worlds .astralis-system");
    if (!system) return false;

    const card = document.createElement("a");
    card.id = CARD_ID;
    card.className = "astralis-planet-link astralis-rickroll-world";
    card.href = "#unknown-signal";
    card.setAttribute("aria-label", "Investigate the unknown planetary signal");
    card.innerHTML = `
      <span class="astralis-planet planet-unknown-signal" aria-hidden="true"></span>
      <span class="astralis-planet-copy">
        <strong>Unknown Signal</strong>
        <span>A strange transmission is bouncing through this uncharted world. Investigation is probably safe.</span>
        <span class="astralis-world-badge">Classified Signal</span>
      </span>`;

    card.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });

    system.appendChild(card);
    return true;
  }

  function boot() {
    installStyles();
    if (addPlanet()) return;

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (addPlanet() || attempts > 80) clearInterval(timer);
    }, 125);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
