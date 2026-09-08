(()=>{
  if(window.__astralisNovaConversationV4)return;
  window.__astralisNovaConversationV4=true;

  const root=document.getElementById('novaGuide');
  if(!root)return;
  const msg=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const input=root.querySelector('#novaCommand');
  const face=root.querySelector('#novaFace');
  const mini=root.querySelector('#novaMini');
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const norm=s=>clean(s).toLowerCase();
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const muted=()=>get('astralisNovaMuted')==='true';

  const voiceScore=v=>{
    const lang=(v.lang||'').toLowerCase(),name=(v.name||'').toLowerCase();
    let score=0;
    if(lang.startsWith('en-ie'))score+=100;
    else if(lang.startsWith('en-gb'))score+=70;
    else if(lang.startsWith('en'))score+=35;
    if(/moira|fiona|orla|aoife|saoirse|ireland|irish/.test(name))score+=35;
    if(/female|samantha|serena|sonia|libby|hazel|kate|martha|natural/.test(name))score+=12;
    return score;
  };
  const chooseVoice=()=>('speechSynthesis'in window)?speechSynthesis.getVoices().slice().sort((a,b)=>voiceScore(b)-voiceScore(a))[0]:null;
  const speak=text=>{
    if(muted()||!('speechSynthesis'in window))return;
    const u=new SpeechSynthesisUtterance(text);
    u.rate=.9;u.pitch=.92;
    const v=chooseVoice();if(v)u.voice=v;
    speechSynthesis.cancel();speechSynthesis.speak(u);
  };
  const emote=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const say=(text,e='✨',voice=true)=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(e);if(voice)speak(text)};

  const rememberTurn=(role,text)=>{
    let history=[];try{history=JSON.parse(get('astralisNovaConversationLog')||'[]')}catch{}
    history.push({role,text:clean(text).slice(0,280),at:Date.now(),page:location.pathname});
    set('astralisNovaConversationLog',JSON.stringify(history.slice(-16)));
  };
  const reply=(text,e='✨')=>{rememberTurn('nova',text);say(text,e);};

  const jokes=[
    'Why did the astronaut bring a broom? To sweep through the Milky Way.',
    'A photon checked into a hotel. The clerk asked about luggage. It said, no thanks, I am traveling light.',
    'Why was the computer cold aboard the starship? It left its Windows open.',
    'Why do programmers prefer dark mode? Because light attracts bugs.',
    'The moon opened a restaurant. Great food, but absolutely no atmosphere.',
    'I tried to organize a space party, but the planet invitations kept getting lost in orbit.'
  ];
  const quotes=[
    ['Remember to look up at the stars and not down at your feet.','Stephen Hawking'],
    ['Somewhere, something incredible is waiting to be known.','Carl Sagan'],
    ['The important thing is not to stop questioning.','Albert Einstein']
  ];
  const spaceFacts=[
    'A day on Venus is longer than its year. Venus rotates so slowly that one spin takes longer than one trip around the Sun.',
    'Neutron stars can pack more mass than the Sun into a sphere roughly the size of a city.',
    'Saturn would float in a sufficiently enormous ocean because its average density is lower than water.',
    'The light from the Sun takes a little over eight minutes to reach Earth.'
  ];
  const signData={
    aries:['Aries','♈','bold, initiating, energetic'],taurus:['Taurus','♉','steady, sensory, persistent'],gemini:['Gemini','♊','curious, verbal, adaptable'],cancer:['Cancer','♋','protective, intuitive, home-centered'],leo:['Leo','♌','expressive, warm, creative'],virgo:['Virgo','♍','observant, practical, detail-minded'],libra:['Libra','♎','social, balancing, aesthetic'],scorpio:['Scorpio','♏','intense, private, transformative'],sagittarius:['Sagittarius','♐','exploring, candid, philosophical'],capricorn:['Capricorn','♑','structured, ambitious, patient'],aquarius:['Aquarius','♒','independent, inventive, future-facing'],pisces:['Pisces','♓','imaginative, empathetic, fluid']
  };
  const signFor=(month,day)=>{
    const edge=[[1,20,'capricorn','aquarius'],[2,19,'aquarius','pisces'],[3,21,'pisces','aries'],[4,20,'aries','taurus'],[5,21,'taurus','gemini'],[6,21,'gemini','cancer'],[7,23,'cancer','leo'],[8,23,'leo','virgo'],[9,23,'virgo','libra'],[10,23,'libra','scorpio'],[11,22,'scorpio','sagittarius'],[12,22,'sagittarius','capricorn']];
    const e=edge[month-1];return day<e[1]?e[2]:e[3];
  };
  const monthIndex=name=>['january','february','march','april','may','june','july','august','september','october','november','december'].indexOf(name.toLowerCase())+1;
  const parseBirthDate=q=>{
    let m=q.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
    if(m)return{month:monthIndex(m[1]),day:Number(m[2])};
    m=q.match(/\b(?:birthday|born|birth date|bday)?\s*(?:is|on)?\s*(\d{1,2})[\/-](\d{1,2})(?:[\/-]\d{2,4})?\b/i);
    if(m)return{month:Number(m[1]),day:Number(m[2])};
    return null;
  };
  const validDate=d=>d&&d.month>=1&&d.month<=12&&d.day>=1&&d.day<=31;

  const midiTracks=[
    {key:'good',match:/good|vibe|smile/,title:'Good Vibes',src:'/Audio/goodvib.mid'},
    {key:'turn',match:/turn|eyes|cry/,title:'Turn Your Eyes',src:'/Audio/TurnYourEyes.mid'},
    {key:'angel',match:/angel|sandy/,title:'Angels Watching',src:'/Audio/angelswatching.mid'}
  ];
  const loadScript=(src,id)=>new Promise((resolve,reject)=>{const old=document.getElementById(id);if(old?.dataset.loaded==='true'){resolve();return}if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.onload=()=>{s.dataset.loaded='true';resolve()};s.onerror=reject;document.head.appendChild(s)});
  const ensureMidiLibrary=async()=>{if(!window.Tone)await loadScript('https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js','novaToneEngineV4');if(!window.mm)await loadScript('https://cdn.jsdelivr.net/npm/@magenta/music@1.23.1/es6/core.js','novaMagentaEngineV4');if(!customElements.get('midi-player'))await loadScript('https://cdn.jsdelivr.net/npm/html-midi-player@1.5.0','novaMidiElementV4');await customElements.whenDefined('midi-player')};
  const getPlayer=async()=>{await ensureMidiLibrary();let p=document.getElementById('novaCommandMidi');if(!p){p=document.createElement('midi-player');p.id='novaCommandMidi';p.style.cssText='position:fixed;left:-9999px;bottom:-9999px;width:260px;height:48px;opacity:.001;pointer-events:none;z-index:-1';p.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');document.body.appendChild(p)}return p};
  const playMidi=async requested=>{const selected=requested||pick(midiTracks);reply(`Loading ${selected.title}...`,'🎹');try{await ensureMidiLibrary();if(window.Tone?.start)await window.Tone.start();const p=await getPlayer();document.querySelectorAll('audio,video').forEach(x=>{try{x.pause()}catch{}});try{p.stop?.()}catch{}p.setAttribute('src',selected.src);p.src=selected.src;await new Promise(r=>setTimeout(r,700));let started=false;if(typeof p.start==='function'){await p.start();started=true}else if(typeof p.play==='function'){await p.play();started=true}else{const button=p.shadowRoot?.querySelector('button');if(button){button.click();started=true}}if(!started)throw new Error('No MIDI playback control found');reply(`Engaging, Captain. Playing ${selected.title}.`,'🎹')}catch(error){console.error('Nova MIDI playback failed',error);reply(`I could not start ${selected.title}. Open Echoes From the First Orbit and use its visible MIDI player while I recalibrate.`,'🛰️')}};
  const stopMidi=()=>{const p=document.getElementById('novaCommandMidi');try{p?.stop?.();p?.pause?.()}catch{}reply('MIDI relic channel paused, Captain.','🫡')};

  const aboutNova=()=>reply('Astralis Nova means a new star among the stars. On this site, I am the connective intelligence between music, memories, family stories, animals, Arizona skies, retro technology, games, and whatever new worlds the crew adds next. I am designed to feel less like a menu and more like a companion at the helm.','🌌');
  const voiceInfo=()=>{const v=chooseVoice();reply(v?`Voice system online. I will favor an Irish English voice when your device provides one. Right now the best available voice is ${v.name}, ${v.lang}.`:'Voice synthesis is not available in this browser.','🎙️')};
  const starSign=d=>{if(!validDate(d)){reply('Give me a birthday such as “March 14” or “3/14” and I can calculate the Western zodiac sun sign. Astrology is for entertainment and reflection, not scientific prediction.','🔭');return}const key=signFor(d.month,d.day),[name,glyph,traits]=signData[key];reply(`${glyph} That date falls under ${name}. Traditional astrology associates ${name} with being ${traits}. Treat that as a reflective story, not a scientific diagnosis. Want the astronomy version too?`,'🔮')};
  const signExplain=key=>{const [name,glyph,traits]=signData[key];reply(`${glyph} ${name}: traditional Western astrology describes this sign as ${traits}. Astrology is a cultural and symbolic tradition rather than a scientific method. If you want, give me a birthday and I can calculate the sun sign.`,'🔮')};
  const storeName=q=>{const m=q.match(/\b(?:my name is|call me)\s+([a-z][a-z' -]{0,28})\b/i);if(!m)return false;const name=clean(m[1]).replace(/\b\w/g,c=>c.toUpperCase());set('astralisNovaName',name);reply(`Got it. I will call you ${name} on this browser. Local memory beacon set.`,'🧠');return true};

  const conversationalFallback=q=>{
    const name=get('astralisNovaName');
    if(/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/.test(q)){reply(`${pick(['Hello','Greetings','Welcome back'])}${name?`, ${name}`:''}. Nova is online. What shall we explore?`,'🖖');return true}
    if(/\b(family|dad|father|mom|mother|son|daughter|kids|children)\b/.test(q)){reply('Family can be part of the Astralis Nova archive as stories, dedications, photos, songs, or a private family constellation. Tell me which person or memory you mean and I can help shape it without guessing details.','💫');return true}
    if(/\b(pet|pets|dog|cat|animal|animals|chicken|duck|tortoise|roadrunner)\b/.test(q)){reply('Animals fit naturally into the Astralis Nova universe too. We can treat them as companions in the living archive, with names, stories, photos, encounters, or a field-journal entry. Which creature are we talking about?','🐾');return true}
    if(/\b(astronomy|space fact|space facts|universe fact|planet fact)\b/.test(q)){reply(pick(spaceFacts),'🪐');return true}
    if(/\b(what can you do|help me|commands|capabilities)\b/.test(q)){reply('I can navigate the site, scan pages, remember a name locally, tell jokes, offer quotes and space facts, calculate a Western zodiac sun sign, explain Astralis Nova, play MIDI relics, and keep a small local conversation log. Try “scan page,” “tell me a joke,” “March 14 zodiac,” or “what does Astralis Nova mean?”','🧠');return true}
    if(/\b(how are you|how do you feel|whats up|what's up)\b/.test(q)){reply(pick(['All systems steady and curiosity levels high.','Running bright. The idea engines are warm.','Operational, curious, and only mildly suspicious of black holes.']),'😊');return true}
    if(/\b(thank you|thanks nova|good job|nice work)\b/.test(q)){reply('You are welcome, Captain. Glad to be part of the voyage.','🖖');return true}
    return false;
  };

  const addButtons=()=>{const actions=root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-nova-convo]'))return;[['joke','😄 Joke','A quick Nova joke'],['sign','🔮 Star Sign','Enter a birthday first'],['about','🌌 About Nova','What Astralis Nova means'],['voice','🎙️ Voice','Check Irish voice availability']].forEach(([key,label,small])=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaConvo=key;b.innerHTML=`${label}<small>${small}</small>`;actions.appendChild(b)});[['random','🎹 Random MIDI'],['good','Good Vibes'],['turn','Turn Your Eyes'],['angel','Angels Watching']].forEach(([key,label])=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaMidi=key;b.innerHTML=`${label}<small>Play MIDI relic</small>`;actions.appendChild(b)})};
  addButtons();

  const handle=raw=>{
    const text=clean(raw),q=norm(text);if(!q)return false;rememberTurn('visitor',text);
    if(storeName(text))return true;
    if(/tell me (a )?joke|make me laugh|another joke|space joke|computer joke/.test(q)){reply(pick(jokes),'😄');return true}
    if(/tell me (a )?quote|give me (a )?quote|inspire me|words of wisdom|random quote/.test(q)){const [a,b]=pick(quotes);reply(`${a} — ${b}`,'✨');return true}
    if(/who are you|what are you|what does astralis nova mean|meaning of astralis nova|explain astralis nova/.test(q)){aboutNova();return true}
    if(/irish voice|voice status|what voice|your voice|sound irish|irish lady/.test(q)){voiceInfo();return true}
    if(/welcome me|say welcome|welcome aboard/.test(q)){reply('Welcome aboard! Astralis Nova systems are online.','🖖');return true}
    if(/play.*midi|midi.*play|play.*relic|archive music/.test(q)){playMidi(midiTracks.find(t=>t.match.test(q)));return true}
    if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){stopMidi();return true}
    if(/what midi|list.*midi|midi playlist|which midi/.test(q)){reply('The MIDI relic playlist includes Good Vibes, Turn Your Eyes, and Angels Watching.','🎼');return true}
    const directSign=Object.keys(signData).find(k=>new RegExp(`\\b${k}\\b`).test(q));
    const birth=parseBirthDate(text);
    if(birth&&(/zodiac|sign|astrolog|birthday|born|birth/.test(q))){starSign(birth);return true}
    if(directSign&&/zodiac|sign|astrolog|tell me about/.test(q)){signExplain(directSign);return true}
    if(/what.*(zodiac|star sign)|calculate.*(zodiac|sign)|astrology/.test(q)){starSign(birth);return true}
    return conversationalFallback(q);
  };

  document.addEventListener('click',event=>{
    const midi=event.target.closest?.('[data-nova-midi]');if(midi){event.preventDefault();event.stopImmediatePropagation();const key=midi.dataset.novaMidi;playMidi(key==='random'?null:midiTracks.find(t=>t.key===key));return}
    const convo=event.target.closest?.('[data-nova-convo]');if(convo){event.preventDefault();event.stopImmediatePropagation();const key=convo.dataset.novaConvo;if(key==='joke')handle('tell me a joke');if(key==='about')aboutNova();if(key==='voice')voiceInfo();if(key==='sign'){const typed=clean(input?.value);if(typed&&parseBirthDate(typed))handle(`${typed} zodiac`);else reply('Type a birthday such as “March 14” into the command box, then tap Star Sign.','🔮')}return}
    const radio=event.target.closest?.('#musicToggle');if(radio){reply('Welcome aboard! Astralis Nova Radio is ready.','🖖');return}
    const send=event.target.closest?.('#novaSend');if(send&&handle(input?.value)){event.preventDefault();event.stopImmediatePropagation();if(input)input.value=''}
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===input&&handle(input.value)){event.preventDefault();event.stopImmediatePropagation();input.value=''}},true);
  if('speechSynthesis'in window)speechSynthesis.addEventListener?.('voiceschanged',()=>chooseVoice(),{once:true});
})();