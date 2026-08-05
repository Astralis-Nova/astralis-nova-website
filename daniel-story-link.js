(()=>{
  const DEST='/daniel-and-lions-den.html';

  const findCard=()=>{
    const candidates=[...document.querySelectorAll('a,article,div,section')];
    return candidates.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return (text.includes('eraser board station')||text.includes('daniel and the lions’ den')||text.includes("daniel and the lions' den"))&&text.length<500;
    })||null;
  };

  const forceDanielNavigation=event=>{
    const target=event.target instanceof Element?event.target:null;
    if(!target)return;
    const card=target.closest('[data-daniel-story-ready="true"]');
    if(!card)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.location.assign(DEST);
  };

  document.addEventListener('click',forceDanielNavigation,true);
  document.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    forceDanielNavigation(event);
  },true);

  const apply=()=>{
    const textNode=findCard();
    if(!textNode)return false;

    const card=textNode.closest('a,[role="link"],article,div,section')||textNode;
    const link=card.matches?.('a')?card:card.querySelector?.('a');

    card.dataset.danielStoryReady='true';
    card.setAttribute('role','link');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label','Open Daniel and the Lions Den story');
    card.removeAttribute('onclick');

    if(link){
      link.href=DEST;
      link.setAttribute('href',DEST);
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.removeAttribute('onclick');
      link.dataset.danielStoryReady='true';
      link.setAttribute('aria-label','Open Daniel and the Lions Den story');
    }

    for(const el of card.querySelectorAll?.('[data-target],[data-href],[data-url]')||[]){
      if(el.hasAttribute('data-target'))el.setAttribute('data-target',DEST);
      if(el.hasAttribute('data-href'))el.setAttribute('data-href',DEST);
      if(el.hasAttribute('data-url'))el.setAttribute('data-url',DEST);
    }

    const title=[...card.querySelectorAll?.('h1,h2,h3,h4,strong,b')||[]].find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('eraser board station')||t.includes('daniel and the lions');
    });
    if(title)title.textContent='Daniel and the Lions’ Den';

    const paragraphs=[...card.querySelectorAll?.('p,small,span')||[]];
    const description=paragraphs.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('leave a live drawing')||t.includes('message, starship')||t.includes('suspiciously artistic')||t.includes('enter the lions');
    });
    if(description)description.textContent='Enter the lions’ den for an illustrated story of faith, courage, integrity, and deliverance.';

    const badge=paragraphs.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('live creative world')||t.includes('inspirational story');
    });
    if(badge)badge.textContent='INSPIRATIONAL STORY';

    const visual=paragraphs.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('visual: red creative world')||t.includes('daniel praying among the lions');
    });
    if(visual)visual.textContent='✦ Visual: Daniel praying among the lions';

    const image=card.querySelector?.('img');
    if(image){
      image.alt='Daniel and the Lions Den';
      image.style.filter='sepia(.35) saturate(1.2) hue-rotate(340deg) brightness(.9)';
    }

    return true;
  };

  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(apply()||attempts>60)clearInterval(timer);
  },200);
  apply();
})();