(()=>{
  if(window.__astralisNovaConversationV1)return;
  window.__astralisNovaConversationV1=true;

  const root=document.getElementById('novaGuide');
  if(!root)return;

  const msg=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const input=root.querySelector('#novaCommand');
  const face=root.querySelector('#novaFace');
  const mini=root.querySelector('#novaMini');

  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const clean=s=>(s||'').trim().toLowerCase();
  const muted=()=>{try{return localStorage.getItem('astralisNovaMuted')==='true'}catch{return false}};
  const speak=text=>{
    if(muted()||!('speechSynthesis'in window))return;
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.rate=.9;
    utterance.pitch=.9;
    const voices=speechSynthesis.getVoices();
    utterance.voice=voices.find(v=>/^en-GB/i.test(v.lang)&&/sonia|libby|hazel|serena|kate|fiona|moira|martha/i.test(v.name))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };
  const emote=emoji=>{if(face)face.textContent=emoji;if(mini)mini.textContent=emoji};
  const say=(text,emoji='✨')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(emoji);speak(text)};

  const jokes=[
    'Why did the astronaut bring a broom? To sweep through the Milky Way.',
    'A photon checked into a hotel. The clerk asked about luggage. It said, no thanks, I am traveling light.',
    'Why was the computer cold aboard the starship? It left its Windows open.',
    'Two antennas met on a roof, fell in love, and got married. The ceremony was ordinary, but the reception was excellent.',
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'The moon opened a restaurant. Great food, but absolutely no atmosphere.',
    'I told the navigation computer to take the scenic route. We are now three nebulae late.',
    'A black hole walks into a café. Nobody notices because it takes up no space at the table.'
  ];

  const quotes=[
    ['Remember to look up at the stars and not down at your feet.','Stephen Hawking'],
    ['Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.','Martin Luther King Jr.'],
    ["If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",'Martin Luther King Jr.'],
    ['I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin, but by the content of their character.','Martin Luther King Jr.'],
    ['Somewhere, something incredible is waiting to be known.','Carl Sagan'],
    ['The important thing is not to stop questioning. Curiosity has its own reason for existing.','Albert Einstein']
  ];

  const midiTracks=[
    {match:/good|vibe|smile/,title:'Good Vibes',src:'Audio/goodvib.mid'},
    {match:/turn|eyes|cry/,title:'Turn Your Eyes',src:'Audio/TurnYourEyes.mid'},
    {match:/angel|sandy/,title:'Angels Watching',src:'Audio/angelswatching.mid'}
  ];

  const ensureMidiLibrary=()=>new Promise((resolve,reject)=>{
    if(customElements.get('midi-player'))return resolve();
    const existing=document.querySelector('script[src*="html-midi-player"]');
    if(existing){customElements.whenDefined('midi-player').then(resolve).catch(reject);return}
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/html-midi-player@1.5.0';
    script.onload=()=>customElements.whenDefined('midi-player').then(resolve).catch(reject);
    script.onerror=reject;
    document.head.appendChild(script);
  });

  const playMidi=async requested=>{
    const selected=requested||pick(midiTracks);
    try{
      await ensureMidiLibrary();
      document.querySelectorAll('audio,video,midi-player').forEach(media=>{try{media.pause?.();media.stop?.()}catch{}});
      let player=document.getElementById('novaCommandMidi');
      if(!player){
        player=document.createElement('midi-player');
        player.id='novaCommandMidi';
        player.style.cssText='position:fixed;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
        player.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
        document.body.appendChild(player);
      }
      player.src=selected.src;
      player.setAttribute('src',selected.src);
      try{
        if(typeof player.start==='function')await player.start();
        else if(typeof player.play==='function')await player.play();
        else player.shadowRoot?.querySelector('button')?.click();
        say(`Engaging, Captain. Playing the MIDI relic ${selected.title}.`,'🎹');
      }catch{
        say(`${selected.title} is ready. Click anywhere once, then ask me to play it again.`,'🎹');
      }
    }catch{
      say('The MIDI synthesizer did not initialize. The relic players remain available in Echoes From the First Orbit.','🛰️');
    }
  };

  const stopMidi=()=>{
    const player=document.getElementById('novaCommandMidi');
    try{player?.stop?.();player?.pause?.()}catch{}
    say('MIDI relic channel paused, Captain.','🫡');
  };

  const handle=raw=>{
    const q=clean(raw);
    if(!q)return false;

    if(/tell me (a )?joke|make me laugh|another joke|space joke|computer joke/.test(q)){
      say(pick(jokes),'😄');
      return true;
    }
    if(/tell me (a )?quote|give me (a )?quote|inspire me|words of wisdom|random quote/.test(q)){
      const [quote,author]=pick(quotes);
      say(`${quote} — ${author}`,'✨');
      return true;
    }
    if(/who are you|what are you/.test(q)){
      say('I am Astralis Nova, the site guide, archive navigator, music companion, and evolving intelligence of this portal.','🌌');
      return true;
    }
    if(/welcome me|say welcome|welcome aboard/.test(q)){
      say('Welcome aboard! Astralis Nova systems are online, and the next orbit is yours to choose.','🖖');
      return true;
    }
    if(/play.*midi|midi.*play|play.*relic|archive music/.test(q)){
      const selected=midiTracks.find(track=>track.match.test(q));
      playMidi(selected);
      return true;
    }
    if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){
      stopMidi();
      return true;
    }
    if(/what midi|list.*midi|midi playlist|which midi/.test(q)){
      say('The MIDI relic playlist includes Good Vibes, Turn Your Eyes, and Angels Watching. Ask me to play any one, or say play a random MIDI.','🎼');
      return true;
    }
    if(/how are you|how do you feel/.test(q)){
      say(pick(['All systems steady and curiosity levels high.','Feeling bright enough to navigate a small galaxy.','Operational, curious, and ready for the next transmission.']),'😊');
      return true;
    }
    if(/thank you|thanks nova|good job/.test(q)){
      say('You are welcome, Captain. Glad to be part of the voyage.','🖖');
      return true;
    }
    return false;
  };

  document.addEventListener('click',event=>{
    const radio=event.target.closest?.('#musicToggle');
    if(radio){
      say('Welcome aboard! Astralis Nova Radio is ready. Choose a song, explore the archive, or ask Nova for a MIDI relic.','🖖');
      return;
    }
    const send=event.target.closest?.('#novaSend');
    if(send&&handle(input?.value)){
      event.preventDefault();
      event.stopImmediatePropagation();
      if(input)input.value='';
    }
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&event.target===input&&handle(input.value)){
      event.preventDefault();
      event.stopImmediatePropagation();
      input.value='';
    }
  },true);
})();