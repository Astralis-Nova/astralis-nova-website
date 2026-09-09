(()=>{
  if(window.__astralisNovaVoiceHostedV1)return;
  window.__astralisNovaVoiceHostedV1=true;
  if(!('speechSynthesis' in window))return;

  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);
  const nativeCancel=synth.cancel.bind(synth);
  const femaleHint=/sonia|libby|hazel|serena|kate|martha|susan|aria|jenny|samantha|victoria|moira|fiona|zira|eva|ava|emma|olivia|salli|joanna|kendra|kimberly|ivy|amy|nicole|raveena|tessa|karen|maeve|gemma|hannah|sienna|brooke|haley|heather|bree|brittany|elise|kelsey|meghan|paige|priya|sharon|female|woman|feminine/i;
  const maleHint=/daniel|george|ryan|guy|david|mark|james|john|paul|matthew|thomas|angus|alex|fred|bruce|cliff|cole|colin|conor|donovan|drew|jack|kai|kit|marcelo|marcus|miles|naveen|rufus|sean|tanner|wade|wes|apollo|arcas|aries|atlas|draco|hermes|hyperion|jupiter|mars|neptune|odysseus|orion|orpheus|pluto|saturn|zeus|male|man|masculine/i;
  const hostedFemale=['pandora','thalia','helena','andromeda','aurora','cora','cordelia','harmonia','iris','juno','phoebe','vesta','theia','athena'];

  let chosenVoice=null;
  let chosenHosted=hostedFemale[Math.floor(Math.random()*hostedFemale.length)];
  let currentSource=null;
  let currentAudio=null;
  let ctx=null;
  let unlocked=false;

  const isEnglish=v=>String(v.lang||'').toLowerCase().startsWith('en');
  const isIrish=v=>String(v.lang||'').toLowerCase().startsWith('en-ie');
  const isBritish=v=>String(v.lang||'').toLowerCase().startsWith('en-gb');
  const isKnownFemale=v=>femaleHint.test(String(v.name||''))&&!maleHint.test(String(v.name||''));
  const localScore=v=>isIrish(v)?300:isBritish(v)?220:isEnglish(v)?100:0;
  const pickLocal=()=>{
    const voices=synth.getVoices().filter(isEnglish).filter(isKnownFemale).sort((a,b)=>localScore(b)-localScore(a));
    chosenVoice=voices[0]||null;
    return chosenVoice;
  };

  const getCtx=()=>{
    if(ctx)return ctx;
    const A=window.AudioContext||window.webkitAudioContext;
    if(!A)return null;
    try{ctx=new A();return ctx}catch{return null}
  };

  const unlock=()=>{
    const c=getCtx();
    if(c){c.resume?.().catch?.(()=>{});unlocked=true}else unlocked=true;
  };
  ['pointerdown','touchstart','keydown','click'].forEach(type=>document.addEventListener(type,unlock,{once:true,capture:true,passive:true}));

  const stopHosted=()=>{
    try{currentSource?.stop?.()}catch{}
    try{currentAudio?.pause?.()}catch{}
    currentSource=null;currentAudio=null;
  };

  const playBuffer=async arrayBuffer=>{
    const c=getCtx();
    if(c){
      try{
        await c.resume();
        const decoded=await c.decodeAudioData(arrayBuffer.slice(0));
        stopHosted();
        const source=c.createBufferSource();source.buffer=decoded;source.connect(c.destination);currentSource=source;source.onended=()=>{if(currentSource===source)currentSource=null};source.start(0);return true;
      }catch(error){console.warn('Nova WebAudio playback failed',error)}
    }
    try{
      stopHosted();
      const blob=new Blob([arrayBuffer],{type:'audio/mpeg'});const url=URL.createObjectURL(blob);const audio=new Audio(url);currentAudio=audio;audio.onended=()=>{URL.revokeObjectURL(url);if(currentAudio===audio)currentAudio=null};await audio.play();return true;
    }catch(error){console.warn('Nova HTML audio playback failed',error);return false}
  };

  const hostedSpeak=async text=>{
    if(!text)return false;
    try{
      const r=await fetch('/api/nova-voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:String(text).slice(0,1200),speaker:chosenHosted}),cache:'no-store'});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const buf=await r.arrayBuffer();
      if(!buf.byteLength)throw new Error('empty audio');
      return await playBuffer(buf);
    }catch(error){console.warn('Nova hosted voice unavailable',error);return false}
  };

  const localSpeak=utterance=>{
    const voice=chosenVoice||pickLocal();
    if(!voice)return false;
    try{utterance.voice=voice;utterance.lang=voice.lang||'en-IE';utterance.rate=1.04;utterance.pitch=1.06;utterance.volume=1;nativeSpeak(utterance);return true}catch{return false}
  };

  synth.cancel=function(){stopHosted();return nativeCancel()};
  synth.speak=function(utterance){
    if(!(utterance instanceof SpeechSynthesisUtterance))return nativeSpeak(utterance);
    const text=String(utterance.text||'').trim();
    if(!text)return;
    hostedSpeak(text).then(ok=>{if(!ok)localSpeak(utterance)});
  };

  const refreshLocal=()=>{
    pickLocal();
    document.documentElement.dataset.novaVoice=chosenVoice?.name||`Hosted ${chosenHosted}`;
    document.documentElement.dataset.novaVoiceLang=chosenVoice?.lang||'hosted-en';
    document.documentElement.dataset.novaVoicePreference='hosted-female-only';
  };
  refreshLocal();
  synth.addEventListener?.('voiceschanged',refreshLocal);

  window.AstralisNovaVoice={
    current:()=>({name:chosenVoice?.name||`Hosted ${chosenHosted}`,lang:chosenVoice?.lang||'hosted-en',style:'hosted-female',preference:'female-only'}),
    chooseAgain:()=>{chosenHosted=hostedFemale[Math.floor(Math.random()*hostedFemale.length)];chosenVoice=null;refreshLocal();return chosenHosted},
    refresh:()=>refreshLocal(),
    available:()=>synth.getVoices().filter(isEnglish).filter(isKnownFemale).map(v=>({name:v.name,lang:v.lang})),
    hosted:()=>({speaker:chosenHosted,unlocked})
  };
})();
