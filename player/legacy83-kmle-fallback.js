(() => {
  'use strict';

  const KMLE_URL = 'https://www.audacy.com/kmle1079';

  function install(){
    const tuner = document.querySelector('.tuner-module');
    if (!tuner || tuner.dataset.kmleFallbackInstalled === 'true') return false;
    tuner.dataset.kmleFallbackInstalled = 'true';

    const slider = tuner.querySelector('#tunerSlider');
    const station = tuner.querySelector('#tunerStation');
    const status = tuner.querySelector('#tunerStatus');
    const searchPanel = tuner.querySelector('.tuner-search-panel');
    if (!slider || !station || !status || !searchPanel) return false;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tuner-kmle-live';
    btn.textContent = '107.9 KMLE • OFFICIAL LIVE';
    btn.hidden = true;
    btn.style.cssText = 'min-height:34px;border:1px solid #5a5140;border-radius:2px;background:linear-gradient(#887a58,#413b2c);color:#fff0bd;font-weight:900;letter-spacing:.04em;cursor:pointer;';
    btn.addEventListener('click', () => {
      status.textContent = '107.9 KMLE • OPENING OFFICIAL LIVE FEED';
      window.open(KMLE_URL, '_blank', 'noopener,noreferrer');
    });
    searchPanel.appendChild(btn);

    function is1079(){
      return Math.abs(Number(slider.value) - 107.9) < 0.05;
    }

    let refreshing = false;
    function refresh(){
      if (refreshing) return;
      refreshing = true;
      try {
        const at1079 = is1079();
        const text = `${station.textContent || ''} ${status.textContent || ''}`.toUpperCase();
        const streamProblem = /STREAM ERROR|NO STREAM|NO CALIBRATED|UNAVAILABLE|NO STATIONS/.test(text);

        if (at1079) {
          const kmleLabel = 'KMLE • KMLE COUNTRY 107.9';
          // MutationObserver watches this node. Only write when the value truly changes,
          // otherwise textContent would retrigger the observer forever and freeze the UI.
          if (station.textContent !== kmleLabel) station.textContent = kmleLabel;
          btn.hidden = !streamProblem;
          tuner.classList.add('is-tuned');
        } else {
          btn.hidden = true;
        }
      } finally {
        refreshing = false;
      }
    }

    slider.addEventListener('input', refresh);
    slider.addEventListener('change', () => setTimeout(refresh, 250));

    const observer = new MutationObserver(() => {
      // Coalesce status/station mutations into one refresh per frame.
      requestAnimationFrame(refresh);
    });
    observer.observe(status, {childList:true, characterData:true, subtree:true});
    observer.observe(station, {childList:true, characterData:true, subtree:true});

    setTimeout(refresh, 500);
    return true;
  }

  if (!install()) {
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
  }
})();
