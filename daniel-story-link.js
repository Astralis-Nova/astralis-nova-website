(()=>{
  const replaceCard=()=>{
    const cards=[...document.querySelectorAll('a.relic-link-card')];
    const card=cards.find(a=>{
      const text=(a.textContent||'').toLowerCase();
      const href=(a.getAttribute('href')||'').toLowerCase();
      return text.includes('eraser')||href.includes('eraser')||href.includes('board');
    });
    if(!card)return false;
    card.href='/daniel-and-lions-den.html';
    card.removeAttribute('target');
    card.removeAttribute('rel');
    card.setAttribute('aria-label','Open Daniel and the Lions Den story');
    const title=card.querySelector('strong');
    const description=card.querySelector('small');
    if(title)title.textContent='Daniel and the Lions’ Den';
    if(description)description.textContent='An animated story of faith, courage, integrity, and deliverance, with a related MIDI.';
    return true;
  };
  if(!replaceCard()){
    const observer=new MutationObserver(()=>{if(replaceCard())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),6000);
  }
})();