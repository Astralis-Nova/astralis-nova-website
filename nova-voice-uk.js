(()=>{
  if(window.__astralisNovaVoiceFreeV4)return;
  window.__astralisNovaVoiceFreeV4=true;
  if(!('speechSynthesis' in window))return;

  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);
  let chosenVoice=null;
  let chosenStyle=null;

  const femaleHint=/sonia|libby|hazel|serena|kate|martha|susan|aria|jenny|samantha|victoria|moira|fiona|zira|eva|ava|emma|olivia|salli|joanna|kendra|kimberly|ivy|amy|nicole|raveena|tessa|female|woman/i;
  const maleHint=/daniel|george|ryan|guy|david|mark|james|john|paul|matthew|thomas|male|man/i;

  const isEnglish=v=>String(v.lang||'').toLowerCase().startsWith('en');
  const isIrish=v=>String(v.lang||'').toLowerCase().startsWith('en-ie');
  const isBritish=v=>String(v.lang||'').toLowerCase().startsWith('en-gb');
  const nameOf=v=>String(v.name||'');
  const isKnownFemale=v=>femaleHint.test(nameOf(v))&&!maleHint.test(nameOf(v));

  const scoreVoice=v=>{
    if(!isKnownFemale(v))return -9999;
    const lang=String(v.lang||'').toLowerCase();
    const name=String(v.name||'').toLowerCase();
    let score=100;
    if(lang.startsWith('en-ie'))score+=260;
    else if(lang.startsWith('en-gb'))score+=170;
    else if(lang.startsWith('en-au'))score+=90;
    else if(lang.startsWith('en-nz'))score+=80;
    else if(lang.startsWith('en'))score+=50;
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

    const femaleEnglish=voices.filter(isEnglish).filter(isKnownFemale);
    const irishFemale=femaleEnglish.filter(isIrish);
    const britishFemale=femaleEnglish.filter(isBritish);

    let pool=[];
    if(irishFemale.length)pool=irishFemale;
    else if(britishFemale.length)pool=britishFemale;
    else pool=femaleEnglish;

    if(!pool.length){
      chosenVoice=null;
      document.documentElement.dataset.novaVoice='';
      document.documentElement.dataset.novaVoiceLang='';
      document.documentElement.dataset.novaVoicePreference='female-only-no-fallback';
      window.dispatchEvent(new CustomEvent('nova:voice-unavailable',{detail:{reason:'No recognized female English voice is installed. Nova will stay silent rather than use a male/default voice.'}}));
      return null;
    }

    const ranked=pool.map(v=>({v,score:scoreVoice(v)})).sort((a,b)=>b.score-a.score);
    const topScore=ranked[0]?.score??0;
    const top=ranked.filter(x=>x.score>=topScore-60).map(x=>x.v);
    chosenVoice=pick(top.length?top:ranked.map(x=>x.v));
    chosenStyle=pick(styles);

    document.documentElement.dataset.novaVoice=chosenVoice?.name||'';
    document.documentElement.dataset.novaVoiceLang=chosenVoice?.lang||'';
    document.documentElement.dataset.novaVoiceStyle=chosenStyle?.name||'';
    document.documentElement.dataset.novaVoicePreference='female-only';
    window.dispatchEvent(new CustomEvent('nova:voice-chosen',{detail:{name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||'',preference:'female-only'}}));
    return chosenVoice;
  };

  const ensureChoice=()=>chosenVoice||chooseForVisit();

  synth.speak=function(utterance){
    try{
      if(utterance instanceof SpeechSynthesisUtterance){
        const voice=ensureChoice();
        if(!voice)return;
        const style=chosenStyle||pick(styles);
        utterance.voice=voice;
        utterance.lang=voice.lang||'en-IE';
        utterance.rate=style.rate;
        utterance.pitch=style.pitch;
        utterance.volume=1;
      }
    }catch{return}
    return nativeSpeak(utterance);
  };

  chooseForVisit();
  synth.addEventListener?.('voiceschanged',()=>{chosenVoice=null;chooseForVisit()});

  window.AstralisNovaVoice={
    current:()=>({name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||'',preference:'female-only'}),
    chooseAgain:()=>{chosenVoice=null;chosenStyle=null;return chooseForVisit()},
    available:()=>synth.getVoices().filter(isEnglish).filter(isKnownFemale).sort((a,b)=>scoreVoice(b)-scoreVoice(a)).map(v=>({name:v.name,lang:v.lang,score:scoreVoice(v)}))
  };
})();