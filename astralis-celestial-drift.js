(()=>{
  // Preserve shared Megamix links after moving the featured player to AC Worlds.
  if(new URLSearchParams(location.search).get('darktide')==='1'){
    location.replace('/ac-worlds?track=darktide-megamix#ac-jukebox');
    return;
  }
  const upgradeRiver=()=>{
    const card=document.querySelector('.relic-link-card[href*="soldierboy602/river.html"]');
    if(!card)return;
    card.href='/just-a-river.html';
    card.removeAttribute('target');
    card.removeAttribute('rel');
    card.setAttribute('aria-label','Open the restored Just A River poem page');
    const title=card.querySelector('strong');
    const description=card.querySelector('small');
    if(title)title.textContent='Just A River';
    if(description)description.textContent='A flowing twilight restoration with the poem, preserved MIDI, and original archive link.';
  };

  const loadScript=(src,key)=>{
    if(document.querySelector(`script[data-${key}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.dataset[key]='true';
    script.async=false;
    document.head.appendChild(script);
  };
  const loadQuoteAudit=()=>loadScript('/quote-attribution-audit.js?v=20260805a','quoteAudit');
  const loadNovaGuide=()=>loadScript('/nova-guide.js?v=20260805g','novaGuide');
  const loadTipJar=()=>loadScript('/feeling-tipsy.js?v=20260805c','feelingTipsy');
  const loadFloatingLayout=()=>loadScript('/floating-controls-layout.js?v=20260830b','floatingControlsLayout');

  const finish=()=>{upgradeRiver();loadQuoteAudit();loadNovaGuide();loadTipJar();loadFloatingLayout()};
  const core=document.createElement('script');core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@391ac37395e6de4dd8158a04476b059060495fee/astralis-celestial-drift.js';core.async=false;core.onload=finish;core.onerror=finish;document.head.appendChild(core);
})();
