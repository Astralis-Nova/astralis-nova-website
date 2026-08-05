(()=>{
  if(window.__astralisNovaConversationV2)return;
  window.__astralisNovaConversationV2=true;

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
    utterance.rate=.9;utterance.pitch=.9;
    const voices=speechSynthesis.getVoices();
    utterance.voice=voices.find(v=>/^en-GB/i.test(v.lang)&&/sonia|libby|hazel|serena|kate|fiona|moira|martha/i.test(v.name))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
    speechSynthesis.cancel();speechSynthesis.speak(utterance);
  };
  const emote=emoji=>{if(face)face.textContent=emoji;if(mini)mini.textContent=emoji};
  const say=(text,emoji='✨')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(emoji);speak(text)};

  const jokes=[
    'Why did the astronaut bring a broom? To sweep through the Milky Way.',
    'A photon checked into a hotel. The clerk asked about luggage. It said, no thanks, I am traveling light.',
    'Why was the computer cold aboard the starship? It left its Windows open.',
    'Two antennas met on a roof and got married. The ceremony was ordinary, but the reception was excellent.',
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'The moon opened a restaurant. Great food, but absolutely no atmosphere.',
    'I told the navigation computer to take the scenic route. We are now three nebulae late.'
  ];
  const quotes=[
    ['Remember to look up at the stars and not down at your feet.','Stephen Hawking'],
    ['Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.','Martin Luther King Jr.'],
    ["If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",'Martin Luther King Jr.'],
    ['I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin, but by the content of their character.','Martin Luther King Jr.'],
    ['Somewhere, something incredible is waiting to be known.','Carl Sagan']
  ];
  const midiTracks=[
    {match:/good|vibe|smile/,title:'Good Vibes',src:'/Audio/goodvib.mid'},
    {match:/turn|eyes|cry/,title:'Turn Your Eyes',src:'/Audio/TurnYourEyes.mid'},
    {match:/angel|sandy/,title:'Angels Watching',src:'/Audio/angelswatching.mid'}
  ];

  const loadScript=(src,key)=>new Promise((resolve,reject)=>{
    if(document.querySelector(`script[data-${key}]`)){resolve();return}
    const script=document.createElement('script');script.src=src;script.dataset[key]='true';script.onload=resolve;script.onerror=reject;document.head.appendChild(script);
  });
  const ensureMidiLibrary=async()=>{
    if(customElements.get('midi-player'))return;
    await loadScript('https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js','novaTone');
    await loadScript('https://cdn.jsdelivr.net/npm/html-midi-player@1.5.0','novaMidiLibrary');
    await customElements.whenDefined('midi-player');
  };
  const getPlayer=async()=>{
    await ensureMidiLibrary();
    let player=document.getElementById('novaCommandMidi');
    if(!player){
      player=document.createElement('midi-player');player.id='novaCommandMidi';
      player.style.cssText='position:fixed;left:-9999px;bottom:-9999px;width:1px;height:1px;opacity:0;pointer-events:none';
      player.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
      document.body.appendChild(player);
    }
    return player;
  };
  const playMidi=async requested=>{
    const selected=requested||pick(midiTracks);
    say(`Loading the MIDI relic ${selected.title}...`,'🎹');
    try{
      const player=await getPlayer();
      document.querySelectorAll('audio,video').forEach(media=>{try{media.pause()}catch{}});
      try{player.stop?.()}catch{}
      player.setAttribute('src',selected.src);player.src=selected.src;
      await new Promise(r=>setTimeout(r,250));
      if(typeof player.start==='function')await player.start();
      else if(typeof player.play==='function')await player.play();
      else player.shadowRoot?.querySelector('button')?.click();
      say(`Engaging, Captain. Playing ${selected.title}.`,'🎹');
    }catch(error){
      console.warn('Nova MIDI playback failed',error);
      say(`${selected.title} is available in Echoes From the First Orbit. Your browser may require one click on its visible Play button before MIDI sound can begin.`,'🛰️');
    }
  };
  const stopMidi=()=>{const player=document.getElementById('novaCommandMidi');try{player?.stop?.();player?.pause?.()}catch{}say('MIDI relic channel paused, Captain.','🫡')};

  const addMidiButtons=()=>{
    const actions=root.querySelector('.nova-actions');
    if(!actions||root.querySelector('[data-nova-midi]'))return;
    const tracks=[['random','🎹 Random MIDI'],['good','Good Vibes'],['turn','Turn Your Eyes'],['angel','Angels Watching']];
    tracks.forEach(([key,label])=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaMidi=key;b.innerHTML=`${label}<small>Play MIDI relic</small>`;actions.appendChild(b)});
  };
  addMidiButtons();

  const handle=raw=>{
    const q=clean(raw);if(!q)return false;
    if(/tell me (a )?joke|make me laugh|another joke|space joke|computer joke/.test(q)){say(pick(jokes),'😄');return true}
    if(/tell me (a )?quote|give me (a )?quote|inspire me|words of wisdom|random quote/.test(q)){const [quote,author]=pick(quotes);say(`${quote} — ${author}`,'✨');return true}
    if(/who are you|what are you/.test(q)){say('I am Astralis Nova, the site guide, archive navigator, music companion, and evolving intelligence of this portal.','🌌');return true}
    if(/welcome me|say welcome|welcome aboard/.test(q)){say('Welcome aboard! Astralis Nova systems are online, and the next orbit is yours to choose.','🖖');return true}
    if(/play.*midi|midi.*play|play.*relic|archive music/.test(q)){playMidi(midiTracks.find(track=>track.match.test(q)));return true}
    if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){stopMidi();return true}
    if(/what midi|list.*midi|midi playlist|which midi/.test(q)){say('The MIDI relic playlist includes Good Vibes, Turn Your Eyes, and Angels Watching. You can also use the new MIDI buttons in my command panel.','🎼');return true}
    if(/how are you|how do you feel/.test(q)){say(pick(['All systems steady and curiosity levels high.','Feeling bright enough to navigate a small galaxy.','Operational, curious, and ready for the next transmission.']),'😊');return true}
    if(/thank you|thanks nova|good job/.test(q)){say('You are welcome, Captain. Glad to be part of the voyage.','🖖');return true}
    return false;
  };

  document.addEventListener('click',event=>{
    const midiButton=event.target.closest?.('[data-nova-midi]');
    if(midiButton){event.preventDefault();event.stopImmediatePropagation();const key=midiButton.dataset.novaMidi;const selected=key==='random'?null:midiTracks.find(t=>t.match.test(key));playMidi(selected);return}

    const radio=event.target.closest?.('#musicToggle');
    if(radio){
      event.preventDefault();event.stopImmediatePropagation();
      const audio=document.getElementById('siteAudio');
      if(audio){
        if(audio.paused){audio.play().catch(()=>{});radio.textContent='❚❚'}else{audio.pause();radio.textContent='▶'}
      }
      say('Welcome aboard! Astralis Nova Radio is ready.','🖖');
      return;
    }

    const send=event.target.closest?.('#novaSend');
    if(send&&handle(input?.value)){event.preventDefault();event.stopImmediatePropagation();if(input)input.value=''}
  },true);

  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&event.target===input&&handle(input.value)){event.preventDefault();event.stopImmediatePropagation();input.value=''}
  },true);
})();