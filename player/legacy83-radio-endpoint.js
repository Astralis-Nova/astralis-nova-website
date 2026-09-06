(() => {
  'use strict';

  const install = () => {
    const module = document.querySelector('.tuner-module');
    if (!module || module.dataset.endpointFix === '1') return false;

    const slider = module.querySelector('#tunerSlider');
    const needle = module.querySelector('.tuner-needle');
    const glass = module.querySelector('.tuner-glass');
    const freq = module.querySelector('#tunerFrequency');
    const units = module.querySelector('#tunerUnits');
    const station = module.querySelector('#tunerStation');
    const status = module.querySelector('#tunerStatus');
    const knobMarker = module.querySelector('.tuner-knob span');
    const up = module.querySelector('[data-scan="up"]');
    if (!slider || !needle || !glass || !freq || !station) return false;

    module.dataset.endpointFix = '1';

    const atFM = () => module.querySelector('[data-band="FM"]')?.classList.contains('active');
    const needleX = ratio => {
      const left = 53, right = 20;
      return left + ratio * Math.max(0, glass.clientWidth - left - right);
    };

    const show108 = () => {
      if (!atFM()) return;
      slider.min = '88.0';
      slider.max = '108.0';
      slider.step = '0.1';
      slider.value = '108.0';
      needle.style.opacity = '1';
      needle.style.left = `${needleX(1).toFixed(1)}px`;
      if (knobMarker) knobMarker.style.transform = 'rotate(120deg)';
      freq.textContent = '108.0';
      if (units) units.textContent = 'MHz';
      station.textContent = '— FM BAND EDGE —';
      status.textContent = '108.0 MHz • END OF BROADCAST FM';
      module.classList.remove('is-tuned');
    };

    const ensureFMRange = () => {
      if (!atFM()) return;
      slider.min = '88.0';
      slider.max = '108.0';
      slider.step = '0.1';
    };

    // Run after the main tuner has configured its controls.
    ensureFMRange();

    // 108.0 is the physical top edge of the FM dial. 107.9 remains the last
    // U.S. broadcast channel center. Intercept only the 108.0 endpoint so the
    // normal tuner logic still handles every real station/channel below it.
    slider.addEventListener('input', e => {
      if (atFM() && Number(slider.value) >= 108) {
        e.stopImmediatePropagation();
        show108();
      }
    }, true);
    slider.addEventListener('change', e => {
      if (atFM() && Number(slider.value) >= 108) {
        e.stopImmediatePropagation();
        show108();
      }
    }, true);

    // Give the UP scan button one final mechanical step beyond 107.9 to 108.0.
    up?.addEventListener('click', e => {
      if (atFM() && Number(slider.value) >= 107.9) {
        e.stopImmediatePropagation();
        show108();
      }
    }, true);

    module.querySelector('[data-band="FM"]')?.addEventListener('click', () => {
      setTimeout(ensureFMRange, 0);
    });

    window.addEventListener('resize', () => {
      if (atFM() && Number(slider.value) >= 108) needle.style.left = `${needleX(1).toFixed(1)}px`;
    }, {passive:true});

    return true;
  };

  if (!install()) {
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, {childList:true, subtree:true});
  }
})();