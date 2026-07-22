(() => {
  "use strict";

  const style = document.createElement("style");
  style.id = "astralisFinalVisualFixes";
  style.textContent = `
    .nova-core-visual,
    .nova-core-visual > img{
      background:transparent!important;
      background-color:transparent!important;
    }
    .nova-core-visual{
      overflow:visible!important;
      isolation:isolate;
    }
    .nova-core-visual > img{
      mix-blend-mode:normal!important;
      border:0!important;
      outline:0!important;
      box-shadow:none!important;
    }
  `;
  document.head.appendChild(style);

  function refreshCore() {
    const image = document.querySelector(".nova-core-visual > img");
    if (!image) return false;
    const desired = new URL("/astralis-nova-core.svg?v=20260722q", window.location.href).href;
    if (image.src !== desired) image.src = desired;
    return true;
  }

  if (!refreshCore()) {
    const observer = new MutationObserver(() => {
      if (refreshCore()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.setTimeout(() => observer.disconnect(), 12000);
  }
})();