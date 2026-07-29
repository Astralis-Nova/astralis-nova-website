(function(){
  const existing = document.getElementById('astralis-celestial-drift');
  const layer = existing || document.createElement('div');

  layer.id = 'astralis-celestial-drift';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <img class="celestial gas" src="/astralis-gas-giant.png" alt="">
    <img class="celestial earth" src="/astralis-earth.png" alt="">
    <img class="celestial mars" src="/astralis-mars.png" alt="">
    <img class="celestial ringed" src="/planet-gas-giant.svg?v=20260722m" alt="">
    <img class="celestial comet" src="/comet-c2026-a1-maps.svg" alt="">
  `;

  if (!existing) document.body.prepend(layer);

  const GOOGLE_MAPS_PROFILE_URL = 'https://maps.app.goo.gl/42LnQL1bCe7H8JHr6';
  const HAS_PUBLIC_PROFILE_LINK = true;

  const addTravelPortalStyles = () => {
    if (document.getElementById('astralis-travel-portal-styles')) return;

    const style = document.createElement('style');
    style.id = 'astralis-travel-portal-styles';
    style.textContent = `
      .astralis-travel-portal{position:relative}
      .travel-portal-panel{
        position:relative;overflow:hidden;padding:clamp(24px,4vw,46px);
        background:
          radial-gradient(circle at 12% 16%,rgba(20,217,144,.18),transparent 25rem),
          radial-gradient(circle at 88% 86%,rgba(10,140,255,.20),transparent 28rem),
          linear-gradient(135deg,rgba(7,17,29,.92),rgba(8,26,37,.88));
      }
      .travel-portal-panel::before{
        content:"";position:absolute;inset:0;pointer-events:none;opacity:.34;
        background-image:
          linear-gradient(rgba(100,160,210,.10) 1px,transparent 1px),
          linear-gradient(90deg,rgba(100,160,210,.10) 1px,transparent 1px);
        background-size:38px 38px;mask-image:linear-gradient(90deg,#000,transparent 72%);
      }
      .travel-portal-grid{
        position:relative;display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr);
        gap:clamp(22px,4vw,48px);align-items:center;
      }
      .travel-portal-copy h2{margin:0 0 12px;font-size:clamp(1.8rem,4vw,3.2rem);line-height:1.02}
      .travel-portal-copy>p:not(.eyebrow){max-width:700px;margin:0;color:#c5d2e3;line-height:1.65}
      .travel-tags{display:flex;flex-wrap:wrap;gap:9px;margin:20px 0 23px}
      .travel-tag{
        display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;
        background:rgba(5,15,26,.72);border:1px solid rgba(103,164,211,.32);
        color:#d8e7f5;font-size:.78rem;font-weight:800;
      }
      .travel-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px}
      .travel-status{color:#8fa3b9;font-size:.78rem;line-height:1.45;max-width:320px}
      .travel-map-card{
        min-height:290px;position:relative;overflow:hidden;border-radius:22px;
        border:1px solid rgba(123,188,228,.42);box-shadow:0 24px 70px rgba(0,0,0,.35);
        background:
          radial-gradient(circle at 67% 43%,rgba(20,217,144,.36) 0 7px,transparent 8px),
          radial-gradient(circle at 35% 61%,rgba(236,22,140,.38) 0 6px,transparent 7px),
          radial-gradient(circle at 52% 28%,rgba(10,140,255,.42) 0 5px,transparent 6px),
          linear-gradient(145deg,#10263a,#07111d 58%,#122c32);
      }
      .travel-map-card::before{
        content:"";position:absolute;inset:-25%;transform:rotate(-11deg);opacity:.58;
        background:
          repeating-linear-gradient(16deg,transparent 0 27px,rgba(124,180,213,.18) 28px 30px,transparent 31px 58px),
          repeating-linear-gradient(104deg,transparent 0 42px,rgba(61,129,165,.16) 43px 45px,transparent 46px 82px);
      }
      .travel-route{
        position:absolute;left:12%;right:10%;top:52%;height:88px;border:3px dashed rgba(118,211,255,.74);
        border-color:rgba(118,211,255,.74) transparent transparent rgba(118,211,255,.74);
        border-radius:70% 0 0 0;transform:rotate(-9deg);
      }
      .travel-pin{
        position:absolute;width:42px;height:42px;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);display:grid;place-items:center;
        background:linear-gradient(135deg,#16a7ff,#ec168c);box-shadow:0 0 32px rgba(51,163,255,.56);
      }
      .travel-pin::after{content:"✦";transform:rotate(45deg);font-weight:900;color:white}
      .travel-pin.one{left:20%;top:58%}.travel-pin.two{right:24%;top:28%;scale:.76}
      .travel-map-label{
        position:absolute;left:18px;right:18px;bottom:18px;padding:15px 16px;border-radius:14px;
        background:rgba(3,9,16,.78);border:1px solid rgba(112,174,215,.30);backdrop-filter:blur(10px)
      }
      .travel-map-label strong{display:block;margin-bottom:4px;letter-spacing:.06em}
      .travel-map-label small{color:#9eb0c4;line-height:1.45}
      @media(max-width:820px){
        .travel-portal-grid{grid-template-columns:1fr}
        .travel-map-card{min-height:240px}
      }
    `;
    document.head.appendChild(style);
  };

  const addTravelPortal = () => {
    if (document.getElementById('travels')) return;

    const contactSection = document.getElementById('contact');
    if (!contactSection) return;

    addTravelPortalStyles();

    const section = document.createElement('section');
    section.className = 'section-shell shell astralis-travel-portal';
    section.id = 'travels';
    section.innerHTML = `
      <div class="panel travel-portal-panel">
        <div class="travel-portal-grid">
          <div class="travel-portal-copy">
            <p class="eyebrow">REAL-WORLD EXPLORATION LOG</p>
            <h2>Astralis Travels & Reviews</h2>
            <p>Step beyond the music and explore Ramon's public travel discoveries, honest place reviews, photos, and useful observations from Arizona and wherever the road leads next.</p>
            <div class="travel-tags" aria-label="Travel portal topics">
              <span class="travel-tag">📍 Places explored</span>
              <span class="travel-tag">⭐ Honest reviews</span>
              <span class="travel-tag">📷 Photos & discoveries</span>
              <span class="travel-tag">🛣️ Arizona and beyond</span>
              <span class="travel-tag">🏅 Level 7 Local Guide</span>
            </div>
            <div class="travel-actions">
              <a class="btn primary" href="${GOOGLE_MAPS_PROFILE_URL}" target="_blank" rel="noopener noreferrer">🗺️ ${HAS_PUBLIC_PROFILE_LINK ? 'VIEW RAMON’S MAPS PROFILE' : 'OPEN GOOGLE MAPS'}</a>
              <span class="travel-status">${HAS_PUBLIC_PROFILE_LINK ? 'Opens Ramon’s public Google Maps contributions, including reviews and photos. Level 7 Local Guide.' : 'The portal is ready. Ramon’s exact public profile link will replace this temporary Maps destination.'}</span>
            </div>
          </div>
          <div class="travel-map-card" aria-hidden="true">
            <div class="travel-route"></div>
            <div class="travel-pin one"></div>
            <div class="travel-pin two"></div>
            <div class="travel-map-label">
              <strong>TRAVEL LOG SIGNAL</strong>
              <small>Local finds, road discoveries, memorable stops, and straight-talking reviews from the world beyond the starship. Level 7 Local Guide.</small>
            </div>
          </div>
        </div>
      </div>
    `;

    contactSection.parentNode.insertBefore(section, contactSection);

    const menu = document.querySelector('.menu');
    if (menu && !menu.querySelector('a[href="#travels"]')) {
      const travelLink = document.createElement('a');
      travelLink.href = '#travels';
      travelLink.textContent = 'TRAVELS';
      const guestbookLink = menu.querySelector('a[href="#guestbook"]');
      menu.insertBefore(travelLink, guestbookLink || null);
    }

    const connect = document.querySelector('.connect');
    if (connect && !connect.querySelector('a[href="#travels"]')) {
      const travelLink = document.createElement('a');
      travelLink.href = '#travels';
      travelLink.textContent = '🗺️ Explore Travels & Reviews';
      connect.appendChild(travelLink);
    }
  };

  const quoteOrbit = [
    {
      text:'Remember to look up at the stars and not down at your feet.',
      credit:'Stephen Hawking',
      type:'Favorite quote'
    },
    {
      text:'The stars do not provide directions. They provide perspective.',
      credit:'Astralis Nova',
      type:'Original transmission'
    },
    {
      text:'Repair begins the moment curiosity becomes stronger than frustration.',
      credit:'Astralis Nova',
      type:'Original transmission'
    },
    {
      text:'A good idea is a small spacecraft. Give it fuel, guidance, and permission to leave the launchpad.',
      credit:'Astralis Nova',
      type:'Original transmission'
    },
    {
      text:'A machine becomes memorable when it helps someone believe they can solve the next problem.',
      credit:'Astralis Nova',
      type:'Original transmission'
    },
    {
      text:'The future rarely knocks. Most days, it waits quietly on the workbench.',
      credit:'Astralis Nova',
      type:'Original transmission'
    }
  ];

  const addQuoteOrbitStyles = () => {
    if (document.getElementById('astralis-quote-orbit-styles')) return;

    const style = document.createElement('style');
    style.id = 'astralis-quote-orbit-styles';
    style.textContent = `
      .quote-card .culture-inner{min-height:100%;display:flex;flex-direction:column}
      .quote-orbit-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
      .quote-orbit-badge{
        display:inline-flex;align-items:center;padding:6px 9px;border-radius:999px;
        border:1px solid rgba(107,166,226,.36);background:rgba(5,14,28,.58);
        color:#a9c8ea;font-size:.68rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase
      }
      .quote-orbit-copy{transition:opacity .24s ease,transform .24s ease}
      .quote-orbit-copy.is-changing{opacity:0;transform:translateY(7px)}
      .quote-orbit-text{min-height:5.8em;margin:10px 0 12px}
      .quote-orbit-credit{margin:0;color:#7ec5ff;font-weight:800}
      .quote-orbit-note{margin-top:14px}
      .quote-orbit-controls{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:18px}
      .quote-orbit-next{
        min-height:38px;padding:8px 13px;border-radius:999px;border:1px solid rgba(106,164,226,.48);
        background:rgba(7,20,38,.76);color:#fff;font-weight:900;cursor:pointer
      }
      .quote-orbit-next:hover,.quote-orbit-next:focus-visible{border-color:#68b9ff;background:rgba(14,46,78,.84)}
      .quote-orbit-count{color:#849ab3;font-size:.75rem;font-variant-numeric:tabular-nums}
      @media(prefers-reduced-motion:reduce){.quote-orbit-copy{transition:none}}
    `;
    document.head.appendChild(style);
  };

  const activateQuoteOrbit = () => {
    const card = document.querySelector('#cosmic-culture .quote-card');
    if (!card || card.dataset.quoteOrbitReady === 'true') return;

    addQuoteOrbitStyles();
    card.dataset.quoteOrbitReady = 'true';
    card.innerHTML = `
      <div class="culture-inner">
        <div class="quote-orbit-head">
          <p class="eyebrow" style="margin:0">QUOTE ORBIT</p>
          <span class="quote-orbit-badge" id="quoteOrbitType">Favorite quote</span>
        </div>
        <div class="quote-mark" aria-hidden="true">“</div>
        <div class="quote-orbit-copy" id="quoteOrbitCopy" aria-live="polite">
          <blockquote class="quote-text quote-orbit-text" id="quoteOrbitText"></blockquote>
          <p class="quote-credit quote-orbit-credit" id="quoteOrbitCredit"></p>
          <div class="quote-note quote-orbit-note" id="quoteOrbitNote"></div>
        </div>
        <div class="quote-orbit-controls">
          <button class="quote-orbit-next" id="quoteOrbitNext" type="button">✦ NEXT TRANSMISSION</button>
          <span class="quote-orbit-count" id="quoteOrbitCount"></span>
        </div>
      </div>
    `;

    const text = card.querySelector('#quoteOrbitText');
    const credit = card.querySelector('#quoteOrbitCredit');
    const type = card.querySelector('#quoteOrbitType');
    const note = card.querySelector('#quoteOrbitNote');
    const count = card.querySelector('#quoteOrbitCount');
    const copy = card.querySelector('#quoteOrbitCopy');
    const next = card.querySelector('#quoteOrbitNext');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let index = Math.floor(Date.now() / 86400000) % quoteOrbit.length;
    let timer;

    const render = (animate) => {
      const quote = quoteOrbit[index];
      const update = () => {
        text.textContent = quote.text;
        credit.textContent = `— ${quote.credit}`;
        type.textContent = quote.type;
        note.textContent = quote.type === 'Favorite quote'
          ? 'A favorite voice carried forward among the stars.'
          : 'An original thought from the Astralis Nova creative archive.';
        count.textContent = `${String(index + 1).padStart(2,'0')} / ${String(quoteOrbit.length).padStart(2,'0')}`;
        copy.classList.remove('is-changing');
      };

      if (animate && !reduceMotion) {
        copy.classList.add('is-changing');
        window.setTimeout(update,240);
      } else {
        update();
      }
    };

    const advance = () => {
      index = (index + 1) % quoteOrbit.length;
      render(true);
    };

    const startTimer = () => {
      if (reduceMotion) return;
      window.clearInterval(timer);
      timer = window.setInterval(advance,14000);
    };

    next.addEventListener('click',() => {
      advance();
      startTimer();
    });
    card.addEventListener('mouseenter',() => window.clearInterval(timer));
    card.addEventListener('mouseleave',startTimer);
    document.addEventListener('visibilitychange',() => {
      if (document.hidden) window.clearInterval(timer);
      else startTimer();
    });

    render(false);
    startTimer();
  };

  addTravelPortal();
  activateQuoteOrbit();
})();
