(()=>{
  if(window.__astralisNovaConversationV3)return;
  window.__astralisNovaConversationV3=true;

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
  const speak=text=>{if(muted()||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=.9;const v=speechSynthesis.getVoices();u.voice=v.find(x=>/^en-GB/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang));speechSynthesis.cancel();speechSynthesis.speak(u)};
  const emote=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const say=(text,e='✨')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(e);speak(text)};

  const jokes=['Why did the astronaut bring a broom? To sweep through the Milky Way.','A photon checked into a hotel. The clerk asked about luggage. It said, no thanks, I am traveling light.','Why was the computer cold aboard the starship? It left its Windows open.','Why do programmers prefer dark mode? Because light attracts bugs.','The moon opened a restaurant. Great food, but absolutely no atmosphere.'];
  const quotes=[['Remember to look up at the stars and not down at your feet.','Stephen Hawking'],['Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that.','Martin Luther King Jr.'],["If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.",'Martin Luther King Jr.'],['Somewhere, something incredible is waiting to be known.','Carl Sagan']];
  const midiTracks=[
    {key:'good',match:/good|vibe|smile/,title:'Good Vibes',src:'/Audio/goodvib.mid'},
    {key:'turn',match:/turn|eyes|cry/,title:'Turn Your Eyes',src:'/Audio/TurnYourEyes.mid'},
    {key:'angel',match:/angel|sandy/,title:'Angels Watching',src:'/Audio/angelswatching.mid'}
  ];

  const loadScript=(src,id)=>new Promise((resolve,reject)=>{
    const old=document.getElementById(id);
    if(old?.dataset.loaded==='true'){resolve();return}
    if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}
    const s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.onload=()=>{s.dataset.loaded='true';resolve()};s.onerror=reject;document.head.appendChild(s);
  });

  const ensureMidiLibrary=async()=>{
    if(!window.Tone)await loadScript('https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js','novaToneEngineV3');
    if(!window.mm)await loadScript('https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/core.js','novaMagentaEngineV3');
    if(!customElements.get('midi-player'))await loadScript('https://cdn.jsdelivr.net/npm/html-midi-player@1.5.0','novaMidiElementV3');
    await customElements.whenDefined('midi-player');
  };

  const getPlayer=async()=>{
    await ensureMidiLibrary();
    let p=document.getElementById('novaCommandMidi');
    if(!p){
      p=document.createElement('midi-player');p.id='novaCommandMidi';
      p.style.cssText='position:fixed;left:-9999px;bottom:-9999px;width:260px;height:48px;opacity:.001;pointer-events:none;z-index:-1';
      p.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
      document.body.appendChild(p);
    }
    return p;
  };

  const playMidi=async requested=>{
    const selected=requested||pick(midiTracks);
    say(`Loading ${selected.title}...`,'🎹');
    try{
      await ensureMidiLibrary();
      if(window.Tone?.start)await window.Tone.start();
      const p=await getPlayer();
      document.querySelectorAll('audio,video').forEach(x=>{try{x.pause()}catch{}});
      try{p.stop?.()}catch{}
      p.setAttribute('src',selected.src);
      p.src=selected.src;
      await new Promise(r=>setTimeout(r,700));
      let started=false;
      if(typeof p.start==='function'){await p.start();started=true}
      else if(typeof p.play==='function'){await p.play();started=true}
      else{
        const button=p.shadowRoot?.querySelector('button');
        if(button){button.click();started=true}
      }
      if(!started)throw new Error('No MIDI playback control found');
      say(`Engaging, Captain. Playing ${selected.title}.`,'🎹');
    }catch(error){
      console.error('Nova MIDI playback failed',error);
      say(`I could not start ${selected.title}. Open Echoes From the First Orbit and use its visible MIDI player while I recalibrate.`,'🛰️');
    }
  };

  const stopMidi=()=>{const p=document.getElementById('novaCommandMidi');try{p?.stop?.();p?.pause?.()}catch{}say('MIDI relic channel paused, Captain.','🫡')};

  const addMidiButtons=()=>{
    const actions=root.querySelector('.nova-actions');
    if(!actions||root.querySelector('[data-nova-midi]'))return;
    [['random','🎹 Random MIDI'],['good','Good Vibes'],['turn','Turn Your Eyes'],['angel','Angels Watching']].forEach(([key,label])=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaMidi=key;b.innerHTML=`${label}<small>Play MIDI relic</small>`;actions.appendChild(b)});
  };
  addMidiButtons();

  const handle=raw=>{
    const q=clean(raw);if(!q)return false;
    if(/tell me (a )?joke|make me laugh|another joke|space joke|computer joke/.test(q)){say(pick(jokes),'😄');return true}
    if(/tell me (a )?quote|give me (a )?quote|inspire me|words of wisdom|random quote/.test(q)){const [a,b]=pick(quotes);say(`${a} — ${b}`,'✨');return true}
    if(/who are you|what are you/.test(q)){say('I am Astralis Nova, your site guide, archive navigator, and music companion.','🌌');return true}
    if(/welcome me|say welcome|welcome aboard/.test(q)){say('Welcome aboard! Astralis Nova systems are online.','🖖');return true}
    if(/play.*midi|midi.*play|play.*relic|archive music/.test(q)){playMidi(midiTracks.find(t=>t.match.test(q)));return true}
    if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){stopMidi();return true}
    if(/what midi|list.*midi|midi playlist|which midi/.test(q)){say('The MIDI relic playlist includes Good Vibes, Turn Your Eyes, and Angels Watching.','🎼');return true}
    if(/how are you|how do you feel/.test(q)){say('All systems steady and curiosity levels high.','😊');return true}
    if(/thank you|thanks nova|good job/.test(q)){say('You are welcome, Captain. Glad to be part of the voyage.','🖖');return true}
    return false;
  };

  document.addEventListener('click',event=>{
    const b=event.target.closest?.('[data-nova-midi]');
    if(b){event.preventDefault();event.stopImmediatePropagation();const key=b.dataset.novaMidi;playMidi(key==='random'?null:midiTracks.find(t=>t.key===key));return}
    const radio=event.target.closest?.('#musicToggle');
    if(radio){say('Welcome aboard! Astralis Nova Radio is ready.','🖖');return}
    const send=event.target.closest?.('#novaSend');
    if(send&&handle(input?.value)){event.preventDefault();event.stopImmediatePropagation();if(input)input.value=''}
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===input&&handle(input.value)){event.preventDefault();event.stopImmediatePropagation();input.value=''}},true);
})();