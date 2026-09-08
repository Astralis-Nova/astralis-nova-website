(()=>{
  if(window.__astralisNovaVoiceFreeV3)return;
  window.__astralisNovaVoiceFreeV3=true;
  if(!('speechSynthesis' in window))return;

  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);
  let chosenVoice=null;
  let chosenStyle=null;

  const femaleHint=/sonia|libby|hazel|serena|kate|martha|susan|aria|jenny|samantha|victoria|moira|fiona|female|woman|natural/i;
  const maleHint=/daniel|george|ryan|guy|david|mark|male|man/i;

  const isEnglish=v=>String(v.lang||'').toLowerCase().startsWith('en');
  const isIrish=v=>String(v.lang||'').toLowerCase().startsWith('en-ie');
  const isBritish=v=>String(v.lang||'').toLowerCase().startsWith('en-gb');
  const nameOf=v=>String(v.name||'');
  const isKnownFemale=v=>femaleHint.test(nameOf(v));
  const isKnownMale=v=>maleHint.test(nameOf(v));

  const scoreVoice=v=>{
    const lang=String(v.lang||'').toLowerCase();
    const name=String(v.name||'').toLowerCase();
    let score=0;
    if(isKnownMale(v))return -9999;
    if(lang.startsWith('en-ie'))score+=260;
    else if(lang.startsWith('en-gb'))score+=180;
    else if(lang.startsWith('en-au'))score+=90;
    else if(lang.startsWith('en-nz'))score+=80;
    else if(lang.startsWith('en'))score+=45;
    if(isKnownFemale(v))score+=180;
    if(/moira|fiona/.test(name))score+=220;
    if(/microsoft|google|enhanced|premium|neural|natural/.test(name))score+=20;
    return score;
  };

  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const styles=[
    {name:'bright',rate:1.04,pitch:1.08},
    {name:'spark',rate:1.08,pitch:1.10},
    {name:'cheeky',rate:1.03,pitch:1.07},
    {name:'captain',rate:.99,pitch:1.04},
    {name:'curious',rate:1.06,pitch:1.08}
  ];

  const chooseForVisit=()=>{
    const voices=synth.getVoices();
    if(!voices.length)return null;

    const english=voices.filter(isEnglish).filter(v=>!isKnownMale(v));
    const irishFemale=english.filter(v=>isIrish(v)&&isKnownFemale(v));
    const britishFemale=english.filter(v=>isBritish(v)&&isKnownFemale(v));
    const otherFemale=english.filter(isKnownFemale);
    const irishUnknown=english.filter(isIrish);

    let pool=[];
    if(irishFemale.length)pool=irishFemale;
    else if(britishFemale.length)pool=britishFemale;
    else if(otherFemale.length)pool=otherFemale;
    else if(irishUnknown.length)pool=irishUnknown;
    else pool=english;

    if(!pool.length)pool=voices.filter(v=>!isKnownMale(v));
    if(!pool.length)return null;

    const ranked=pool.map(v=>({v,score:scoreVoice(v)})).sort((a,b)=>b.score-a.score);
    const topScore=ranked[0]?.score??0;
    const top=ranked.filter(x=>x.score>=topScore-35).map(x=>x.v);
    chosenVoice=pick(top.length?top:ranked.map(x=>x.v));
    chosenStyle=pick(styles);

    document.documentElement.dataset.novaVoice=chosenVoice?.name||'';
    document.documentElement.dataset.novaVoiceLang=chosenVoice?.lang||'';
    document.documentElement.dataset.novaVoiceStyle=chosenStyle?.name||'';
    document.documentElement.dataset.novaVoicePreference='female-irish';
    window.dispatchEvent(new CustomEvent('nova:voice-chosen',{detail:{name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||'',preference:'female-irish'}}));
    return chosenVoice;
  };

  const ensureChoice=()=>chosenVoice||chooseForVisit();

  synth.speak=function(utterance){
    try{
      if(utterance instanceof SpeechSynthesisUtterance){
        const voice=ensureChoice();
        const style=chosenStyle||pick(styles);
        if(voice)utterance.voice=voice;
        utterance.lang=voice?.lang||'en-IE';
        utterance.rate=style.rate;
        utterance.pitch=style.pitch;
        utterance.volume=1;
      }
    }catch{}
    return nativeSpeak(utterance);
  };

  chooseForVisit();
  synth.addEventListener?.('voiceschanged',()=>{chosenVoice=null;chooseForVisit()});

  window.AstralisNovaVoice={
    current:()=>({name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||'',preference:'female-irish'}),
    chooseAgain:()=>{chosenVoice=null;chosenStyle=null;return chooseForVisit()},
    available:()=>synth.getVoices().filter(isEnglish).filter(v=>!isKnownMale(v)).sort((a,b)=>scoreVoice(b)-scoreVoice(a)).map(v=>({name:v.name,lang:v.lang,score:scoreVoice(v)}))
  };
})();
