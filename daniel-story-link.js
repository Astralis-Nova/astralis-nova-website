(()=>{
  const destination='/daniel-lions-story/?v=20260805g';

  const apply=()=>{
    const elements=[...document.querySelectorAll('a,article,div,section')];
    const textNode=elements.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return (text.includes('eraser board station')||text.includes('daniel and the lions'))&&text.length<500;
    });
    if(!textNode)return false;

    const card=textNode.closest('a')||textNode.closest('[role="link"]')||textNode;
    const link=card.matches?.('a')?card:card.querySelector?.('a');
    if(!link)return false;

    link.href=destination;
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.setAttribute('aria-label','Open Daniel and the Lions Den story');

    const title=[...card.querySelectorAll('h1,h2,h3,h4,strong,b')].find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('eraser board station')||text.includes('daniel and the lions');
    });
    if(title)title.textContent='Daniel and the Lions’ Den';

    const bits=[...card.querySelectorAll('p,small,span')];
    const description=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('leave a live drawing')||text.includes('message, starship')||text.includes('suspiciously artistic')||text.includes('enter an illustrated story');
    });
    if(description)description.textContent='Enter an illustrated story of faith, courage, integrity, and deliverance.';

    const badge=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('live creative world')||text.includes('inspirational story');
    });
    if(badge)badge.textContent='INSPIRATIONAL STORY';

    const visual=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('visual: red creative world')||text.includes('daniel praying among the lions');
    });
    if(visual)visual.textContent='✦ Visual: Daniel praying among the lions';

    link.dataset.danielStoryReady='true';
    return true;
  };

  if(!apply()){
    const observer=new MutationObserver(()=>{
      if(apply())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),10000);
  }
})();