(()=>{
  if(window.__astralisNovaVoiceFreeV5)return;
  window.__astralisNovaVoiceFreeV5=true;
  if(!('speechSynthesis' in window))return;

  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);
  let chosenVoice=null;
  let chosenStyle=null;
  let voicesReady=false;
  let unlockAttempted=false;
  let retryTimer=null;
  const pending=[];

  const femaleHint=/sonia|libby|hazel|serena|kate|martha|susan|aria|jenny|samantha|victoria|moira|fiona|zira|eva|ava|emma|olivia|salli|joanna|kendra|kimberly|ivy|amy|nicole|raveena|tessa|karen|maeve|gemma|hannah|sienna|brooke|haley|heather|bree|brittany|elise|kelsey|meghan|paige|priya|sharon|female|woman|feminine/i;
  const maleHint=/daniel|george|ryan|guy|david|mark|james|john|paul|matthew|thomas|angus|alex|fred|bruce|cliff|cole|colin|conor|donovan|drew|jack|kai|kit|marcelo|marcus|miles|naveen|rufus|sean|tanner|wade|wes|apollo|arcas|aries|atlas|draco|hermes|hyperion|jupiter|mars|neptune|odysseus|orion|orpheus|pluto|saturn|zeus|male|man|masculine/i;

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
    if(lang.startsWith('en-ie'))score+=320;
    else if(lang.startsWith('en-gb'))score+=190;
    else if(lang.startsWith('en-au'))score+=100;
    else if(lang.startsWith('en-nz'))score+=90;
    else if(lang.startsWith('en'))score+=55;
    if(/moira|fiona|maeve/.test(name))score+=260;
    if(/google uk english female|female/.test(name))score+=120;
    if(/microsoft|google|apple|samsung|enhanced|premium|neural|natural/.test(name))score+=25;
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

  const femaleVoices=()=>synth.getVoices().filter(isEnglish).filter(isKnownFemale);

  const chooseForVisit=()=>{
    const voices=synth.getVoices();
    if(!voices.length){voicesReady=false;return null}
    voicesReady=true;
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
      document.documentElement.dataset.novaVoicePreference='female-only-unavailable';
      window.dispatchEvent(new CustomEvent('nova:voice-unavailable',{detail:{reason:'No recognized female English voice is exposed by this browser yet.'}}));
      return null;
    }

    const ranked=pool.map(v=>({v,score:scoreVoice(v)})).sort((a,b)=>b.score-a.score);
    const topScore=ranked[0]?.score??0;
    const top=ranked.filter(x=>x.score>=topScore-70).map(x=>x.v);
    chosenVoice=pick(top.length?top:ranked.map(x=>x.v));
    chosenStyle=pick(styles);

    document.documentElement.dataset.novaVoice=chosenVoice?.name||'';
    document.documentElement.dataset.novaVoiceLang=chosenVoice?.lang||'';
    document.documentElement.dataset.novaVoiceStyle=chosenStyle?.name||'';
    document.documentElement.dataset.novaVoicePreference='female-only-mobile-safe';
    window.dispatchEvent(new CustomEvent('nova:voice-chosen',{detail:{name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||'',preference:'female-only-mobile-safe'}}));
    flushPending();
    return chosenVoice;
  };

  const prepareUtterance=utterance=>{
    const voice=chosenVoice||chooseForVisit();
    if(!voice)return false;
    const style=chosenStyle||pick(styles);
    utterance.voice=voice;
    utterance.lang=voice.lang||'en-IE';
    utterance.rate=style.rate;
    utterance.pitch=style.pitch;
    utterance.volume=1;
    return true;
  };

  function flushPending(){
    if(!chosenVoice||!pending.length)return;
    const items=pending.splice(0,pending.length);
    items.slice(-2).forEach(u=>{try{if(prepareUtterance(u))nativeSpeak(u)}catch{}});
  }

  const queueUntilReady=utterance=>{
    pending.push(utterance);
    while(pending.length>2)pending.shift();
    beginVoiceRetries();
  };

  const beginVoiceRetries=()=>{
    if(retryTimer)return;
    let tries=0;
    const tick=()=>{
      retryTimer=null;
      if(chosenVoice||chooseForVisit())return;
      if(++tries<16)retryTimer=setTimeout(tick,500);
    };
    retryTimer=setTimeout(tick,100);
  };

  synth.speak=function(utterance){
    try{
      if(!(utterance instanceof SpeechSynthesisUtterance))return nativeSpeak(utterance);
      if(prepareUtterance(utterance))return nativeSpeak(utterance);
      queueUntilReady(utterance);
      return;
    }catch{return}
  };

  const unlock=()=>{
    if(unlockAttempted)return;
    unlockAttempted=true;
    if(!chosenVoice)chooseForVisit();
    if(chosenVoice){
      try{
        const u=new SpeechSynthesisUtterance(' ');
        if(prepareUtterance(u)){u.volume=.01;nativeSpeak(u);synth.cancel()}
      }catch{}
    }else beginVoiceRetries();
  };

  ['pointerdown','touchstart','keydown'].forEach(type=>document.addEventListener(type,unlock,{once:true,capture:true,passive:true}));
  synth.addEventListener?.('voiceschanged',()=>{chosenVoice=null;chooseForVisit();});
  beginVoiceRetries();

  window.AstralisNovaVoice={
    current:()=>({name:chosenVoice?.name||'',lang:chosenVoice?.lang||'',style:chosenStyle?.name||'',preference:'female-only-mobile-safe',voicesReady,availableFemale:femaleVoices().length}),
    chooseAgain:()=>{chosenVoice=null;chosenStyle=null;return chooseForVisit()},
    refresh:()=>chooseForVisit(),
    available:()=>femaleVoices().sort((a,b)=>scoreVoice(b)-scoreVoice(a)).map(v=>({name:v.name,lang:v.lang,score:scoreVoice(v)}))
  };
})();