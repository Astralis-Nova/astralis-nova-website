(()=>{
  if(window.__astralisNovaVoiceFreeV2)return;
  window.__astralisNovaVoiceFreeV2=true;
  if(!('speechSynthesis' in window))return;

  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);
  let chosenVoice=null;
  let chosenStyle=null;

  const femaleHint=/sonia|libby|hazel|serena|kate|martha|susan|aria|jenny|samantha|victoria|female|woman|natural/i;
  const maleHint=/daniel|george|ryan|guy|male|man/i;

  const scoreVoice=v=>{
    const lang=String(v.lang||'').toLowerCase();
    const name=String(v.name||'').toLowerCase();
    let score=0;
    if(lang.startsWith('en-gb'))score+=120;
    else if(lang.startsWith('en-ie'))score+=95;
    else if(lang.startsWith('en-au'))score+=65;
    else if(lang.startsWith('en-nz'))score+=55;
    else if(lang.startsWith('en'))score+=30;
    if(femaleHint.test(name))score+=48;
    if(/microsoft|google|enhanced|premium|neural|natural/.test(name))score+=16;
    if(maleHint.test(name))score-=90;
    return score;
  };

  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const styles=[
    {name:'bright',rate:1.06,pitch:1.10},
    {name:'spark',rate:1.11,pitch:1.12},
    {name:'cheeky',rate:1.04,pitch:1.07},
    {name:'captain',rate:1.00,pitch:1.04},
    {name:'curious',rate:1.08,pitch:1.09}
  ];

  const chooseForVisit=()=>{
    const voices=synth.getVoices();
    if(!voices.length)return null;
    const ranked=voices.map(v=>({v,score:scoreVoice(v)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    const elite=ranked.filter(x=>x.score>=95).map(x=>x.v);
    const good=ranked.filter(x=>x.score>=55).map(x=>x.v);
    const pool=elite.length>1?elite:(good.length?good:ranked.slice(0,5).map(x=>x.v));
    chosenVoice=pick(pool.length?pool:voices);
    chosenStyle=pick(styles);
    document.documentElement.dataset.novaVoice=chosenVoice?.name||'';
    document.documentElement.dataset.novaVoiceLang=chosenVoice?.lang||'';
    document.documentElement.dataset.novaVoiceStyle=chosenStyle?.name||'';
    window.dispatchEvent(new CustomEvent('nova:voice-chosen',{detail:{name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||''}}));
    return chosenVoice;
  };

  const ensureChoice=()=>chosenVoice||chooseForVisit();

  synth.speak=function(utterance){
    try{
      if(utterance instanceof SpeechSynthesisUtterance){
        const voice=ensureChoice();
        const style=chosenStyle||pick(styles);
        if(voice)utterance.voice=voice;
        utterance.lang=voice?.lang||'en-GB';
        utterance.rate=style.rate;
        utterance.pitch=style.pitch;
        utterance.volume=1;
      }
    }catch{}
    return nativeSpeak(utterance);
  };

  chooseForVisit();
  synth.addEventListener?.('voiceschanged',()=>{if(!chosenVoice)chooseForVisit()});

  window.AstralisNovaVoice={
    current:()=>({name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||''}),
    chooseAgain:()=>{chosenVoice=null;chosenStyle=null;return chooseForVisit()},
    available:()=>synth.getVoices().filter(v=>scoreVoice(v)>0).map(v=>({name:v.name,lang:v.lang}))
  };
})();
