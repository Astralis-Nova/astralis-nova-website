(()=>{
  if(window.__astralisNovaVoiceUKV1)return;
  window.__astralisNovaVoiceUKV1=true;
  if(!('speechSynthesis' in window))return;

  const synth=window.speechSynthesis;
  const nativeSpeak=synth.speak.bind(synth);

  const scoreVoice=v=>{
    const lang=String(v.lang||'').toLowerCase();
    const name=String(v.name||'').toLowerCase();
    let score=0;
    if(lang.startsWith('en-gb'))score+=120;
    else if(lang.startsWith('en-ie'))score+=70;
    else if(lang.startsWith('en-au'))score+=45;
    else if(lang.startsWith('en'))score+=25;
    if(/sonia|libby|hazel|serena|kate|martha|susan|female|woman|natural/.test(name))score+=42;
    if(/microsoft|google|enhanced|premium|neural|natural/.test(name))score+=14;
    if(/daniel|george|ryan|male|man/.test(name))score-=55;
    return score;
  };

  const chooseVoice=()=>{
    const voices=synth.getVoices();
    if(!voices.length)return null;
    return voices.slice().sort((a,b)=>scoreVoice(b)-scoreVoice(a))[0]||null;
  };

  synth.speak=function(utterance){
    try{
      if(utterance instanceof SpeechSynthesisUtterance){
        const voice=chooseVoice();
        if(voice)utterance.voice=voice;
        utterance.lang=voice?.lang||'en-GB';
        utterance.rate=1.03;
        utterance.pitch=1.08;
        utterance.volume=1;
      }
    }catch{}
    return nativeSpeak(utterance);
  };

  const announceVoice=()=>{
    const voice=chooseVoice();
    if(voice){
      document.documentElement.dataset.novaVoice=voice.name;
      document.documentElement.dataset.novaVoiceLang=voice.lang;
    }
  };
  announceVoice();
  synth.addEventListener?.('voiceschanged',announceVoice);
})();
