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

  const installQuoteOrbit=()=>{
    const text=document.querySelector('.quote-text');
    const credit=document.querySelector('.quote-credit');
    const note=document.querySelector('.quote-note');
    if(!text||!credit)return false;

    const now=new Date();
    const dayKey=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
    const quote=quotes[((dayKey%quotes.length)+quotes.length)%quotes.length];

    text.textContent=quote.text;
    credit.textContent=`— ${quote.credit}`;
    if(note)note.textContent=quote.note;
    return true;
  };

  if(!installQuoteOrbit()){
    const observer=new MutationObserver(()=>{
      if(installQuoteOrbit())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),15000);
  }
})();