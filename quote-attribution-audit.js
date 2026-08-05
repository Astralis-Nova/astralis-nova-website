(()=>{
  const quotes=[
    {
      text:"Remember to look up at the stars and not down at your feet. Try to make sense of what you see and wonder about what makes the Universe exist. Be curious.",
      credit:"Stephen Hawking",
      note:"A reminder to stay curious, keep looking outward, and never stop wondering what may be waiting beyond the next horizon."
    },
    {
      text:"Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.",
      credit:"Martin Luther King Jr.",
      note:"A call to answer division with courage, light, and love."
    },
    {
      text:"If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",
      credit:"Martin Luther King Jr.",
      note:"Forward motion still counts, even when the journey changes pace."
    },
    {
      text:"I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin, but by the content of their character.",
      credit:"Martin Luther King Jr.",
      note:"A vision of dignity, equality, and a future measured by character rather than prejudice."
    }
  ];

  const installStyles=()=>{
    if(document.getElementById('mlkTributeStyles'))return;
    const style=document.createElement('style');
    style.id='mlkTributeStyles';
    style.textContent=`
      .mlk-tribute{margin-top:18px;padding:24px;border:1px solid rgba(106,168,255,.44);border-radius:16px;background:radial-gradient(circle at 12% 10%,rgba(43,133,255,.13),transparent 24rem),radial-gradient(circle at 88% 90%,rgba(236,22,140,.10),transparent 24rem),rgba(4,11,21,.68);box-shadow:0 18px 50px rgba(0,0,0,.26)}
      .mlk-tribute h3{margin:0 0 14px;font-size:clamp(1.25rem,2.5vw,1.85rem);line-height:1.25}
      .mlk-tribute p{margin:0 0 15px;color:#d8e1ef;line-height:1.72}
      .mlk-tribute blockquote{margin:14px 0;padding:14px 18px;border-left:3px solid #5aa7ff;background:rgba(8,18,31,.55);border-radius:0 12px 12px 0;color:#f4f7ff;line-height:1.7;font-size:1rem}
      .mlk-tribute .mlk-credit{margin-top:18px;color:#8dc9ff;font-weight:900;letter-spacing:.03em}
    `;
    document.head.appendChild(style);
  };

  const installQuoteOrbit=()=>{
    const text=document.querySelector('.quote-text');
    const credit=document.querySelector('.quote-credit');
    const note=document.querySelector('.quote-note');
    if(!text||!credit)return false;

    const now=new Date();
    const dayKey=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
    const quote=quotes[((dayKey%quotes.length)+quotes.length)%quotes.length];

    if(text.textContent.trim()!==quote.text)text.textContent=quote.text;
    const expectedCredit=`— ${quote.credit}`;
    if(credit.textContent.trim()!==expectedCredit)credit.textContent=expectedCredit;
    if(note&&note.textContent.trim()!==quote.note)note.textContent=quote.note;
    return true;
  };

  const installMLKTribute=()=>{
    if(document.getElementById('mlkTribute'))return true;
    const quoteCard=document.querySelector('.quote-card');
    if(!quoteCard)return false;
    const tribute=document.createElement('section');
    tribute.id='mlkTribute';
    tribute.className='mlk-tribute';
    tribute.setAttribute('aria-label','Martin Luther King Jr. tribute');
    tribute.innerHTML=`
      <h3>Astralis Nova carries the light, love, courage, and forward motion of Martin Luther King Jr.</h3>
      <blockquote>“Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.”</blockquote>
      <blockquote>“If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.”</blockquote>
      <blockquote>“I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin, but by the content of their character.”</blockquote>
      <p class="mlk-credit">— Martin Luther King Jr.</p>`;
    quoteCard.insertAdjacentElement('afterend',tribute);
    return true;
  };

  const installAll=()=>{
    installStyles();
    const orbitReady=installQuoteOrbit();
    const tributeReady=installMLKTribute();
    return orbitReady&&tributeReady;
  };

  installAll();

  const observer=new MutationObserver(()=>installAll());
  observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  setTimeout(()=>observer.disconnect(),30000);
})();