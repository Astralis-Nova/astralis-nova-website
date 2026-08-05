(()=>{
  const apply=()=>{
    const all=[...document.querySelectorAll('a,article,div,section')];
    const textNode=all.find(el=>{
      const text=(el.textContent||'').trim().toLowerCase();
      return text.includes('eraser board station')&&text.length<500;
    });
    if(!textNode)return false;

    const card=textNode.closest('a')||textNode.querySelector('a')||textNode;
    const link=card.matches?.('a')?card:card.querySelector?.('a');
    if(link){
      link.href='/daniel-and-lions-den.html';
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-label','Open Daniel and the Lions Den story');
    }

    const title=[...card.querySelectorAll?.('h1,h2,h3,h4,strong,b')||[]].find(el=>(el.textContent||'').toLowerCase().includes('eraser board station'));
    if(title)title.textContent='Daniel and the Lions’ Den';

    const paragraphs=[...card.querySelectorAll?.('p,small,span')||[]];
    const description=paragraphs.find(el=>{
      const t=(el.textContent||'').toLowerCase();
      return t.includes('leave a live drawing')||t.includes('message, starship')||t.includes('suspiciously artistic');
    });
    if(description)description.textContent='Enter the lions’ den for an illustrated story of faith, courage, integrity, and deliverance.';

    const badge=paragraphs.find(el=>(el.textContent||'').toLowerCase().includes('live creative world'));
    if(badge)badge.textContent='INSPIRATIONAL STORY';

    const visual=paragraphs.find(el=>(el.textContent||'').toLowerCase().includes('visual: red creative world'));
    if(visual)visual.textContent='✦ Visual: Daniel praying among the lions';

    const image=card.querySelector?.('img');
    if(image){
      image.alt='Daniel and the Lions Den';
      image.style.filter='sepia(.35) saturate(1.2) hue-rotate(340deg) brightness(.9)';
    }

    card.dataset.danielStoryReady='true';
    return true;
  };

  let attempts=0;
  const timer=setInterval(()=>{
    attempts++;
    if(apply()||attempts>40)clearInterval(timer);
  },250);
  apply();
})();