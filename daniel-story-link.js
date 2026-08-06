(()=>{
  const DESTINATION='/daniel-lions-story/';
  const openStory=event=>{
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.assign(DESTINATION);
  };

  const apply=()=>{
    const elements=[...document.querySelectorAll('a,article,div,section')];
    const textNode=elements.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return (text.includes('eraser board station')||text.includes('daniel and the lions'))&&text.length<500;
    });
    if(!textNode)return false;

    const card=textNode.closest('a')||textNode.closest('[role="link"]')||textNode;
    const link=card.matches?.('a')?card:card.querySelector?.('a');
    const target=link||card;

    if(link){
      link.href=DESTINATION;
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-label','Open Daniel and the Lions Den story portal');
    }

    const title=[...card.querySelectorAll?.('h1,h2,h3,h4,strong,b')||[]].find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('eraser board station')||text.includes('daniel and the lions');
    });
    if(title)title.textContent='Daniel and the Lions’ Den';

    const textBits=[...card.querySelectorAll?.('p,small,span')||[]];
    const description=textBits.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('leave a live drawing')||t.includes('message, starship')||t.includes('suspiciously artistic')||t.includes('enter the lions');
    });
    if(description)description.textContent='Enter an illustrated story of faith, courage, integrity, and deliverance.';

    const badge=textBits.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('live creative world')||t.includes('inspirational story');
    });
    if(badge)badge.textContent='INSPIRATIONAL STORY';

    const visual=textBits.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('visual: red creative world')||t.includes('daniel praying among the lions');
    });
    if(visual)visual.textContent='✦ Visual: Daniel praying among the lions';

    target.dataset.danielStoryReady='true';
    target.style.cursor='pointer';
    target.addEventListener('click',openStory,true);
    target.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){openStory(event)}
    },true);
    return true;
  };

  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(apply()||attempts>60)clearInterval(timer);
  },250);
  apply();
})();