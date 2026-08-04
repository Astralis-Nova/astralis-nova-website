(()=>{
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

  const loadQuoteAudit=()=>{
    if(document.querySelector('script[src="/quote-attribution-audit.js"]'))return;
    const audit=document.createElement('script');
    audit.src='/quote-attribution-audit.js';
    audit.defer=true;
    document.head.appendChild(audit);
  };

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@391ac37395e6de4dd8158a04476b059060495fee/astralis-celestial-drift.js';
  core.async=false;
  core.onload=()=>{upgradeRiver();loadQuoteAudit()};
  core.onerror=()=>{upgradeRiver();loadQuoteAudit()};
  document.head.appendChild(core);
})();
