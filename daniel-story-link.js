(()=>{
  const DESTINATION='/daniel-lions-story.html?v=20260805a';

  const openDaniel=event=>{
    const card=event.target.closest?.('[data-daniel-story-ready="true"]');
    if(!card)return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    location.assign(DESTINATION);
  };

  document.addEventListener('click',openDaniel,true);

  const apply=()=>{
    const all=[...document.querySelectorAll('a,article,div,section')];
    const textNode=all.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return (text.includes('eraser board station')||text.includes('daniel and the lions'))&&text.length<500;
    });
    if(!textNode)return false;

    const card=textNode.closest('a')||textNode.querySelector('a')||textNode;
    const link=card.matches?.('a')?card:card.querySelector?.('a');
    if(link){
      link.href=DESTINATION;
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-label','Open Daniel and the Lions Den story');
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

    card.dataset.danielStoryReady='true';
    if(link)link.dataset.danielStoryReady='true';
    return true;
  };

  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(apply()||attempts>40)clearInterval(timer);
  },250);
  apply();
})();