(()=>{
  const destination='/daniel-lions-portal.html?fresh=20260805k';
  let danielCard=null;

  const isDanielTarget=node=>danielCard&&node&&(node===danielCard||danielCard.contains(node));

  window.addEventListener('click',event=>{
    if(!isDanielTarget(event.target))return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    window.open(destination,'_blank','noopener,noreferrer');
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

    const links=card.matches('a')?[card]:[...card.querySelectorAll('a')];
    links.forEach(link=>{
      link.href=destination;
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.removeAttribute('onclick');
      link.setAttribute('aria-label','Open Daniel and the Lions Den story in a new tab');
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
    if(description)description.textContent='Open a separate illustrated story of faith, courage, integrity, and deliverance.';

    const badge=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('live creative world')||text.includes('inspirational story');
    });
    if(badge)badge.textContent='INSPIRATIONAL STORY';

    const visual=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('visual: red creative world')||text.includes('daniel praying among the lions');
    });
    if(visual)visual.textContent='✦ Opens in a clean new tab';
    return true;
  };

  if(!apply()){
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),12000);
  }
})();