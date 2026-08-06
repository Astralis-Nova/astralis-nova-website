(()=>{
  const destination='/daniel-lions-portal.html?fresh=20260805j';
  let danielCard=null;

  const isDanielTarget=node=>{
    if(!danielCard||!node)return false;
    return node===danielCard||danielCard.contains(node);
  };

  const openDaniel=event=>{
    if(!isDanielTarget(event.target))return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    location.href=destination;
  };

  window.addEventListener('click',openDaniel,true);
  window.addEventListener('pointerup',event=>{
    if(!isDanielTarget(event.target))return;
    event.preventDefault();
    event.stopPropagation();
  },true);

  const apply=()=>{
    const candidates=[...document.querySelectorAll('a,article,div,section')];
    const textNode=candidates.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return (text.includes('eraser board station')||text.includes('daniel and the lions'))&&text.length<500;
    });
    if(!textNode)return false;

    const card=textNode.closest('a')||textNode.closest('[role="link"]')||textNode;
    danielCard=card;
    card.dataset.danielStoryCard='true';
    card.style.cursor='pointer';
    card.removeAttribute('onclick');
    card.removeAttribute('data-target');
    card.removeAttribute('data-section');
    card.removeAttribute('data-scroll');

    const links=card.matches('a')?[card]:[...card.querySelectorAll('a')];
    links.forEach(link=>{
      link.href=destination;
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.removeAttribute('onclick');
      link.setAttribute('aria-label','Open Daniel and the Lions Den story');
    });

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
    return true;
  };

  if(!apply()){
    const observer=new MutationObserver(()=>{
      if(apply())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),12000);
  }
})();