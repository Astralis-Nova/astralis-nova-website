(()=>{
  const destination='/daniel-lions-story-static.html?fresh=20260805m';

  const apply=()=>{
    const candidates=[...document.querySelectorAll('a,article,div,section')];
    const textNode=candidates.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return (text.includes('eraser board station')||text.includes('daniel and the lions'))&&text.length<500;
    });
    if(!textNode)return false;

    const card=textNode.closest('a')||textNode.closest('[role="link"]')||textNode;
    card.dataset.danielStoryCard='true';
    card.style.position=card.style.position||'relative';
    card.style.cursor='pointer';
    card.removeAttribute('onclick');
    card.removeAttribute('data-target');
    card.removeAttribute('data-section');
    card.removeAttribute('data-scroll');

    let link=card.matches('a')?card:card.querySelector('a');
    if(!link){
      link=document.createElement('a');
      link.setAttribute('aria-label','Open Daniel and the Lions Den story');
      link.style.cssText='position:absolute;inset:0;z-index:20;border-radius:inherit;text-decoration:none;color:inherit;';
      link.innerHTML='<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Open Daniel and the Lions Den story</span>';
      card.appendChild(link);
    }

    link.href=destination;
    link.target='_self';
    link.rel='';
    link.removeAttribute('onclick');
    link.setAttribute('aria-label','Open Daniel and the Lions Den story');

    const title=[...card.querySelectorAll('h1,h2,h3,h4,strong,b')].find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('eraser board station')||text.includes('daniel and the lions');
    });
    if(title)title.textContent='Daniel and the Lions’ Den';

    const bits=[...card.querySelectorAll('p,small,span')];
    const description=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('leave a live drawing')||text.includes('message, starship')||text.includes('suspiciously artistic')||text.includes('open a separate illustrated story');
    });
    if(description)description.textContent='Read the lightweight story of faith, courage, integrity, and deliverance.';

    const badge=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('live creative world')||text.includes('inspirational story');
    });
    if(badge)badge.textContent='INSPIRATIONAL STORY';

    const visual=bits.find(el=>{
      const text=(el.textContent||'').toLowerCase();
      return text.includes('visual: red creative world')||text.includes('opens in a clean new tab');
    });
    if(visual)visual.textContent='✦ Lightweight static story page';
    return true;
  };

  if(!apply()){
    const observer=new MutationObserver(()=>{if(apply())observer.disconnect()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
})();