(() => {
  'use strict';

  const OFFLINE_CACHE = 'astralis-nova-offline-audio-v1';
  const tracks = [
    ['Back When She Was Little Growing Up','Audio/mp3/Back When She Was Little Growing Up.mp3','cover-15.jpg'],
    ['Born Right Here','Audio/mp3/Born Right Here.mp3','cover-20.jpg'],
    ['Cactus Forest','Audio/mp3/Cactus Forest.mp3','cover-3.jpg'],
    ['Darktide','Audio/mp3/Darktide.mp3','cover-16.jpg'],
    ['Darktide — Alternate Mix','Audio/mp3/Darktide Alternate mix.mp3','cover-16.jpg'],
    ['Darktide — Remix','Audio/mp3/Darktide Remix.mp3','cover-16.jpg'],
    ['Heart of Gold Rocklin','Audio/mp3/Heart of Gold Rocklin.mp3','cover-24.jpg'],
    ['Just a Little Time','Audio/mp3/Just a Little Time.mp3','cover-12.jpg'],
    ['Let This Day Be Kind','Audio/mp3/Let This Day Be Kind.mp3','cover-11.jpg'],
    ['Logged Back In','Audio/mp3/Logged Back In.mp3','cover-17.jpg'],
    ['Military Brats','Audio/mp3/Military Brats.mp3','cover-6.jpg'],
    ["My Dad's Last Day on This Earth",'Audio/mp3/My Dads Last Day on This Earth.mp3','cover-25.jpg'],
    ['My Girl Alexis','Audio/mp3/My Girl Alexis.mp3','cover-18.jpg'],
    ['My Whole World','Audio/mp3/My Whole World.mp3','cover-26.jpg'],
    ['One Outcome (Peace)','Audio/mp3/One Outcome (Peace) (1).mp3','cover-19.jpg'],
    ['Our First Night','Audio/mp3/Our First Night.mp3','cover-1.jpg'],
    ['Run With The Light','Audio/mp3/RUN WITH THE LIGHT.mp3','cover-2.jpg'],
    ['Searching Through the Light','Audio/mp3/Searching Through the Light.mp3','cover-21.jpg'],
    ['Starlight in My Boots — Remix','Audio/mp3/Starlight in My Boots remix.mp3','cover-8.jpg'],
    ['Starlight in My Boots — Original','Audio/mp3/original Starlight in my Boots.mp3','cover-7.jpg'],
    ['That Look','Audio/mp3/That Look.mp3','cover-10.jpg'],
    ['Till We Meet Again','Audio/mp3/Till We Meet Again.mp3','cover-22.jpg'],
    ['Till We Meet Again — Remix','Audio/mp3/Till We Meet Again Remix.mp3','cover-22.jpg'],
    ['Under the NightSky','Audio/mp3/Under the NightSky.mp3','cover-4.jpg'],
    ['When The Lights Were Golden','Audio/mp3/WHEN THE LIGHTS WERE GOLDEN.mp3','cover-13.jpg'],
    ['We Are the Universe — Original','Audio/mp3/We Are the Universe Original.mp3','cover-9.jpg'],
    ['We Are the Universe — Remix','Audio/mp3/We Are the Universe Remix.mp3','cover-5.jpg'],
    ['We Let It Pass Us By','Audio/mp3/We Let It Pass Us By.mp3','cover-23.jpg']
  ].map((item,id)=>({id,title:item[0],src:'../'+encodeURI(item[1]),cover:'../'+item[2],artist:'Astralis Nova',duration:''}));

  const $ = id => document.getElementById(id);
  const audio=$('audio'),cover=$('cover'),title=$('trackTitle'),artist=$('trackArtist'),playBtn=$('playBtn'),prevBtn=$('prevBtn'),nextBtn=$('nextBtn'),shuffleBtn=$('shuffleBtn'),repeatBtn=$('repeatBtn'),favoriteBtn=$('favoriteBtn'),seek=$('seek'),volume=$('volume'),timeReadout=$('timeReadout'),trackList=$('trackList'),search=$('search'),trackCount=$('trackCount'),skinSelect=$('skinSelect'),eqWindow=$('equalizer'),eqToggle=$('eqToggle'),eqPower=$('eqPower'),eqReset=$('eqReset'),eqPreset=$('eqPreset'),canvas=$('visualizer'),ctx=canvas.getContext('2d'),downloadTrackBtn=$('downloadTrackBtn'),downloadAllBtn=$('downloadAllBtn'),offlineStatus=$('offlineStatus');
  const reelDeck=document.querySelector('.reel-module'),reelCounterDigits=[...document.querySelectorAll('.r83-counter span')],reelTransportButtons=[...document.querySelectorAll('[data-reel-action]')],reelPlayButton=document.querySelector('[data-reel-action="play"]'),reelRecordButton=document.querySelector('[data-reel-action="record"]');
  const reverbModule=document.querySelector('.reverb-module'),reverbTunnel=document.querySelector('.reverb-tunnel'),reverbModeLabel=$('reverbModeLabel'),reverbPreset=$('reverbPreset'),reverbMix=$('reverbMix'),reverbDepth=$('reverbDepth'),reverbDecay=$('reverbDecay'),reverbPreDelay=$('reverbPreDelay'),reverbMixValue=$('reverbMixValue'),reverbDepthValue=$('reverbDepthValue'),reverbDecayValue=$('reverbDecayValue'),reverbPreDelayValue=$('reverbPreDelayValue');
  const cassetteModule=document.querySelector('.cassette-module'),cassetteModeLabel=$('cassetteModeLabel'),cassetteCounterDigits=[...document.querySelectorAll('.cassette-counter span')],cassetteButtons=[...document.querySelectorAll('[data-cassette-action]')],cassettePlayButton=document.querySelector('[data-cassette-action="play"]'),cassetteEjectButton=document.querySelector('[data-cassette-action="eject"]'),cassetteRecordButton=document.querySelector('[data-cassette-action="record"]');
  const vuMeters=[...document.querySelectorAll('.vu-meter')],vuNeedles=[...document.querySelectorAll('.vu-needle')];
  const turntableModule=document.querySelector('.turntable-module'),turntableStatus=$('turntableStatus'),turntableButtons=[...document.querySelectorAll('[data-turntable-action]')],turntablePowerButton=document.querySelector('[data-turntable-action="power"]'),turntableStartButton=document.querySelector('[data-turntable-action="start"]'),turntableSpeed33Button=document.querySelector('[data-turntable-action="speed33"]'),turntableSpeed45Button=document.querySelector('[data-turntable-action="speed45"]'),turntableCueButton=document.querySelector('[data-turntable-action="cue"]'),turntablePitch=$('turntablePitch'),turntablePitchValue=$('turntablePitchValue');

  let current=Number(localStorage.getItem('nova.current')||2); if(!Number.isInteger(current)||!tracks[current]) current=0;
  let shuffle=localStorage.getItem('nova.shuffle')==='1',repeat=localStorage.getItem('nova.repeat')==='1';
  let favorites=new Set(JSON.parse(localStorage.getItem('nova.favorites')||'[]')),offlineIds=new Set(),filter='all',userSeeking=false,deferredInstallPrompt=null;
  const frequencies=[60,170,310,600,1000,3000,6000,12000,14000,16000];
  const eqPresets={
    flat:[0,0,0,0,0,0,0,0,0,0],
    bass:[7,6,5,3,1,0,0,0,0,0],
    treble:[0,0,0,0,0,1,3,5,6,6],
    vocal:[-2,-1,0,2,4,5,3,1,0,-1],
    rock:[5,4,2,0,-1,1,3,4,5,5],
    pop:[2,3,2,0,-1,1,2,3,3,2],
    classical:[1,1,0,-1,-1,0,2,3,4,4],
    hiphop:[7,6,4,1,0,1,3,4,3,2],
    electronic:[6,5,3,1,0,2,4,5,5,4],
    podcast:[-4,-3,-1,2,5,6,4,1,-1,-2],
    night:[-5,-4,-2,0,1,1,0,-2,-3,-4]
  };
  const reverbPresets={
    off:{mix:0,depth:35,decay:1.1,preDelay:12},
    room:{mix:22,depth:35,decay:1.1,preDelay:12},
    hall:{mix:32,depth:55,decay:2.6,preDelay:30},
    plate:{mix:28,depth:45,decay:1.7,preDelay:8},
    ambient:{mix:42,depth:68,decay:4.5,preDelay:55},
    echo:{mix:35,depth:52,decay:2.2,preDelay:240}
  };
  let audioContext,sourceNode,analyser,filters=[],eqEnabled=true;
  let reverbPreDelayNode,reverbConvolver,reverbDryGain,reverbWetGain,reverbEchoDelay,reverbEchoFeedback,reverbEchoGain,reverbImpulseTimer;
  let vuSplitter,vuAnalyserLeft,vuAnalyserRight,vuLeftLevel=0,vuRightLevel=0;
  const vuDataLeft=new Float32Array(256),vuDataRight=new Float32Array(256);
  let reverbState={preset:'off',...reverbPresets.off};
  try{
    const savedReverb=JSON.parse(localStorage.getItem('nova.reverb')||'null');
    if(savedReverb&&reverbPresets[savedReverb.preset])reverbState={...reverbPresets[savedReverb.preset],...savedReverb};
  }catch{localStorage.removeItem('nova.reverb');}
  let reelRecordArmed=false,cassetteRecordArmed=false,cassetteEjected=false;
  let turntablePowered=true,turntableCued=false,turntableSpeed=localStorage.getItem('nova.turntableSpeed')==='45'?45:33,turntablePitchAmount=Number(localStorage.getItem('nova.turntablePitch')||0);
  if(!Number.isFinite(turntablePitchAmount)||turntablePitchAmount < -8||turntablePitchAmount > 8)turntablePitchAmount=0;

  const fmt=s=>{if(!Number.isFinite(s))return'0:00';const m=Math.floor(s/60),sec=Math.floor(s%60).toString().padStart(2,'0');return `${m}:${sec}`};
  const absoluteSrc=t=>new URL(t.src,location.href).href;
  const escapeHtml=v=>v.replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function updateReelDeckMotion(){
    if(!reelDeck)return;
    const running=!audio.paused&&!audio.ended;
    reelDeck.classList.toggle('is-playing',running);
    if(reelPlayButton)reelPlayButton.setAttribute('aria-pressed',String(running));
    updateCassetteMotion();
    updateTurntableMotion();
  }
  function updateReelCounter(){
    if(!reelCounterDigits.length)return;
    const count=Math.max(0,Math.floor((Number.isFinite(audio.currentTime)?audio.currentTime:0)*3))%10000;
    String(count).padStart(4,'0').split('').forEach((digit,index)=>{reelCounterDigits[index].textContent=digit;});
  }
  function seekReelBy(seconds){
    if(!Number.isFinite(audio.duration)||audio.duration<=0)return;
    audio.currentTime=Math.min(audio.duration,Math.max(0,audio.currentTime+seconds));
    updateReelCounter();
  }
  function toggleReelRecord(){
    reelRecordArmed=!reelRecordArmed;
    if(reelRecordButton)reelRecordButton.setAttribute('aria-pressed',String(reelRecordArmed));
    reelDeck?.classList.toggle('is-record-armed',reelRecordArmed);
    offlineStatus.textContent=reelRecordArmed?'Reel deck REC armed for visual monitoring — no audio file is being recorded.':'Reel deck REC disarmed.';
  }
  function handleReelTransport(event){
    const action=event.currentTarget.dataset.reelAction;
    if(action==='play'){togglePlayback();return;}
    if(action==='stop'){audio.pause();audio.currentTime=0;updateReelCounter();return;}
    if(action==='rewind'){seekReelBy(-10);return;}
    if(action==='forward'){seekReelBy(10);return;}
    if(action==='record')toggleReelRecord();
  }

  function updateCassetteMotion(){
    if(!cassetteModule)return;
    const running=!audio.paused&&!audio.ended&&!cassetteEjected;
    cassetteModule.classList.toggle('is-playing',running);
    if(cassettePlayButton)cassettePlayButton.setAttribute('aria-pressed',String(running));
    if(cassetteModeLabel)cassetteModeLabel.textContent=cassetteEjected?'EJECT':cassetteRecordArmed?'REC ARM':running?'DOLBY B • PLAY':'DOLBY B • READY';
  }
  function updateCassetteCounter(){
    if(!cassetteCounterDigits.length)return;
    const count=Math.max(0,Math.floor((Number.isFinite(audio.currentTime)?audio.currentTime:0)*2))%10000;
    String(count).padStart(4,'0').split('').forEach((digit,index)=>{cassetteCounterDigits[index].textContent=digit;});
  }
  function toggleCassetteRecord(){
    cassetteRecordArmed=!cassetteRecordArmed;
    cassetteRecordButton?.setAttribute('aria-pressed',String(cassetteRecordArmed));
    cassetteModule?.classList.toggle('is-record-armed',cassetteRecordArmed);
    updateCassetteMotion();
    offlineStatus.textContent=cassetteRecordArmed?'Cassette REC armed for visual monitoring — no audio file is being recorded.':'Cassette REC disarmed.';
  }
  function pulseCassetteTransport(name){
    if(!cassetteModule)return;
    cassetteModule.classList.remove('is-rewinding','is-forwarding');
    cassetteModule.classList.add(name);
    setTimeout(()=>cassetteModule.classList.remove(name),320);
  }
  function handleCassetteTransport(event){
    const action=event.currentTarget.dataset.cassetteAction;
    if(action==='eject'){
      audio.pause();cassetteEjected=!cassetteEjected;
      cassetteModule?.classList.toggle('is-ejected',cassetteEjected);
      cassetteEjectButton?.setAttribute('aria-pressed',String(cassetteEjected));
      updateCassetteMotion();return;
    }
    if(action==='play'){
      if(cassetteEjected){cassetteEjected=false;cassetteModule?.classList.remove('is-ejected');cassetteEjectButton?.setAttribute('aria-pressed','false');}
      togglePlayback();return;
    }
    if(action==='stop'){audio.pause();updateCassetteMotion();return;}
    if(action==='rewind'){seekReelBy(-10);updateCassetteCounter();pulseCassetteTransport('is-rewinding');return;}
    if(action==='forward'){seekReelBy(10);updateCassetteCounter();pulseCassetteTransport('is-forwarding');return;}
    if(action==='record')toggleCassetteRecord();
  }


  function updateTurntableMotion(){
    if(!turntableModule)return;
    const running=turntablePowered&&!turntableCued&&!audio.paused&&!audio.ended;
    turntableModule.classList.toggle('is-powered',turntablePowered);
    turntableModule.classList.toggle('is-playing',running);
    turntableModule.classList.toggle('is-cued',turntableCued);
    turntableModule.classList.toggle('is-45',turntableSpeed===45);
    turntablePowerButton?.setAttribute('aria-pressed',String(turntablePowered));
    turntableStartButton?.setAttribute('aria-pressed',String(running));
    turntableSpeed33Button?.setAttribute('aria-pressed',String(turntableSpeed===33));
    turntableSpeed45Button?.setAttribute('aria-pressed',String(turntableSpeed===45));
    turntableCueButton?.setAttribute('aria-pressed',String(turntableCued));
    if(turntableStatus)turntableStatus.textContent=!turntablePowered?'POWER OFF':turntableCued?`${turntableSpeed===45?'45':'33⅓'} RPM • CUE UP`:`${turntableSpeed===45?'45':'33⅓'} RPM • ${running?'PLAY':'READY'}`;
  }
  function setTurntableSpeed(speed){
    turntableSpeed=speed===45?45:33;
    localStorage.setItem('nova.turntableSpeed',String(turntableSpeed));
    updateTurntableMotion();
  }
  function handleTurntableControl(event){
    const action=event.currentTarget.dataset.turntableAction;
    if(action==='power'){turntablePowered=!turntablePowered;if(!turntablePowered)audio.pause();updateTurntableMotion();return;}
    if(action==='start'){
      if(!turntablePowered)turntablePowered=true;
      if(turntableCued)turntableCued=false;
      togglePlayback();updateTurntableMotion();return;
    }
    if(action==='speed33'){setTurntableSpeed(33);return;}
    if(action==='speed45'){setTurntableSpeed(45);return;}
    if(action==='cue'){turntableCued=!turntableCued;if(turntableCued)audio.pause();updateTurntableMotion();}
  }
  function updateTurntablePitch(){
    turntablePitchAmount=Number(turntablePitch.value);
    audio.playbackRate=1+turntablePitchAmount/100;
    turntablePitchValue.textContent=`${turntablePitchAmount>0?'+':''}${turntablePitchAmount}%`;
    localStorage.setItem('nova.turntablePitch',String(turntablePitchAmount));
  }



  async function refreshOfflineState(){
    if(!('caches' in window)) return;
    const cache=await caches.open(OFFLINE_CACHE); offlineIds.clear();
    for(const t of tracks){ if(await cache.match(absoluteSrc(t))) offlineIds.add(t.id); }
    const count=offlineIds.size;
    offlineStatus.textContent=`Offline music: ${count} of ${tracks.length} songs saved${navigator.onLine?'':' • currently offline'}`;
    downloadTrackBtn.textContent=offlineIds.has(current)?'✓ Saved offline':'⇩ Save song';
    downloadAllBtn.textContent=count===tracks.length?'✓ All songs saved':'⇩ Save all';
    renderTracks();
  }

  async function saveTrackOffline(track){
    if(!('caches' in window)) throw new Error('Offline storage unavailable');
    const cache=await caches.open(OFFLINE_CACHE),url=absoluteSrc(track);
    const response=await fetch(url,{cache:'no-store'});
    if(!response.ok) throw new Error(`Download failed: ${response.status}`);
    await cache.put(url,response.clone()); offlineIds.add(track.id);
  }

  async function saveCurrentTrack(){
    const track=tracks[current];
    if(offlineIds.has(track.id)){ offlineStatus.textContent=`${track.title} is already saved offline.`; return; }
    downloadTrackBtn.disabled=true; downloadTrackBtn.textContent='Saving…';
    try{await saveTrackOffline(track);offlineStatus.textContent=`Saved “${track.title}” for offline playback.`;}
    catch(err){offlineStatus.textContent=`Could not save this song. ${err.message}`;}
    finally{downloadTrackBtn.disabled=false;await refreshOfflineState();}
  }

  async function saveAllTracks(){
    downloadAllBtn.disabled=true;
    let done=offlineIds.size,failed=0;
    for(const track of tracks){
      if(offlineIds.has(track.id)) continue;
      downloadAllBtn.textContent=`Saving ${done+1}/${tracks.length}`;
      offlineStatus.textContent=`Downloading for offline use: ${track.title}`;
      try{await saveTrackOffline(track);done++;}catch{failed++;}
    }
    downloadAllBtn.disabled=false;
    await refreshOfflineState();
    offlineStatus.textContent=failed?`Saved ${done} songs. ${failed} could not be downloaded.`:`All ${tracks.length} songs are saved for offline playback.`;
  }

  function setMediaSession(track){
    if(!('mediaSession'in navigator))return;
    navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:'Astralis Nova',artwork:[{src:new URL(track.cover,location.href).href,sizes:'512x512',type:'image/jpeg'}]});
  }
  function updateFavoriteUI(){const active=favorites.has(tracks[current].id);favoriteBtn.setAttribute('aria-pressed',String(active));favoriteBtn.textContent=active?'★':'☆';favoriteBtn.setAttribute('aria-label',active?'Remove current track from favorites':'Add current track to favorites');}
  function loadTrack(index,autoplay=false){current=(index+tracks.length)%tracks.length;localStorage.setItem('nova.current',String(current));const track=tracks[current];audio.src=track.src;cover.src=track.cover;cover.alt=`${track.title} artwork`;title.textContent=track.title;artist.textContent=track.artist;seek.value='0';timeReadout.textContent='0:00 / 0:00';setMediaSession(track);updateFavoriteUI();downloadTrackBtn.textContent=offlineIds.has(track.id)?'✓ Saved offline':'⇩ Save song';renderTracks();if(autoplay)playAudio();}

  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function saveReverbState(){localStorage.setItem('nova.reverb',JSON.stringify(reverbState));}
  function syncReverbUI(){
    reverbPreset.value=reverbState.preset;
    reverbMix.value=String(reverbState.mix);reverbDepth.value=String(reverbState.depth);reverbDecay.value=String(reverbState.decay);reverbPreDelay.value=String(reverbState.preDelay);
    reverbMixValue.textContent=`${Math.round(reverbState.mix)}%`;
    reverbDepthValue.textContent=`${Math.round(reverbState.depth)}%`;
    reverbDecayValue.textContent=`${Number(reverbState.decay).toFixed(1)} s`;
    reverbPreDelayValue.textContent=`${Math.round(reverbState.preDelay)} ms`;
    reverbModeLabel.textContent=reverbState.preset.toUpperCase();
    reverbModule.classList.toggle('is-active',reverbState.preset!=='off'&&reverbState.mix>0);
  }
  function rebuildReverbImpulse(){
    if(!audioContext||!reverbConvolver)return;
    const seconds=clamp(Number(reverbState.decay),.4,5),depth=clamp(Number(reverbState.depth)/100,0,1);
    const length=Math.max(1,Math.floor(audioContext.sampleRate*seconds)),buffer=audioContext.createBuffer(2,length,audioContext.sampleRate);
    for(let channel=0;channel<2;channel++){
      const data=buffer.getChannelData(channel);
      for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/length,1.7+depth*2.8);
    }
    reverbConvolver.buffer=buffer;
  }
  function scheduleReverbImpulse(){
    clearTimeout(reverbImpulseTimer);
    reverbImpulseTimer=setTimeout(rebuildReverbImpulse,80);
  }
  function updateReverbGraph(rebuild=false){
    syncReverbUI();
    if(!audioContext||!reverbDryGain)return;
    const active=reverbState.preset!=='off'&&reverbState.mix>0,mix=active?clamp(Number(reverbState.mix)/100,0,1):0,depth=clamp(Number(reverbState.depth)/100,0,1),now=audioContext.currentTime;
    reverbDryGain.gain.setTargetAtTime(active?Math.cos(mix*Math.PI*.5):1,now,.02);
    const wet=Math.sin(mix*Math.PI*.5)*(.4+depth*.6),echo=reverbState.preset==='echo';
    reverbWetGain.gain.setTargetAtTime(active&&!echo?wet:0,now,.02);
    reverbEchoGain.gain.setTargetAtTime(active&&echo?wet:0,now,.02);
    reverbPreDelayNode.delayTime.setTargetAtTime(clamp(Number(reverbState.preDelay)/1000,0,.3),now,.02);
    reverbEchoDelay.delayTime.setTargetAtTime(clamp(Number(reverbState.preDelay)/1000,.08,.3),now,.02);
    reverbEchoFeedback.gain.setTargetAtTime(echo?clamp(.18+depth*.57,.18,.75):0,now,.02);
    if(rebuild)scheduleReverbImpulse();
  }
  function setReverbPreset(name){
    if(!reverbPresets[name])return;
    reverbState={preset:name,...reverbPresets[name]};
    saveReverbState();updateReverbGraph(true);
  }
  function handleReverbControl(event){
    const key=event.currentTarget.dataset.reverbControl;
    reverbState[key]=Number(event.currentTarget.value);
    saveReverbState();updateReverbGraph(key==='depth'||key==='decay');
  }

  async function ensureAudioGraph(){
    if(audioContext){if(audioContext.state==='suspended')await audioContext.resume();return;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    audioContext=new AC();sourceNode=audioContext.createMediaElementSource(audio);
    filters=frequencies.map(frequency=>{const f=audioContext.createBiquadFilter();f.type='peaking';f.frequency.value=frequency;f.Q.value=1;f.gain.value=0;return f});
    analyser=audioContext.createAnalyser();analyser.fftSize=256;
    reverbDryGain=audioContext.createGain();reverbWetGain=audioContext.createGain();reverbEchoGain=audioContext.createGain();
    reverbDryGain.gain.value=1;reverbWetGain.gain.value=0;reverbEchoGain.gain.value=0;
    reverbPreDelayNode=audioContext.createDelay(.3);reverbConvolver=audioContext.createConvolver();reverbConvolver.normalize=true;
    reverbEchoDelay=audioContext.createDelay(.3);reverbEchoFeedback=audioContext.createGain();
    reverbEchoDelay.delayTime.value=.18;reverbEchoFeedback.gain.value=0;
    let node=sourceNode;filters.forEach(filter=>{node.connect(filter);node=filter});
    node.connect(reverbDryGain);reverbDryGain.connect(analyser);
    node.connect(reverbPreDelayNode);reverbPreDelayNode.connect(reverbConvolver);reverbConvolver.connect(reverbWetGain);reverbWetGain.connect(analyser);
    node.connect(reverbEchoDelay);reverbEchoDelay.connect(reverbEchoGain);reverbEchoGain.connect(analyser);reverbEchoDelay.connect(reverbEchoFeedback);reverbEchoFeedback.connect(reverbEchoDelay);
    vuSplitter=audioContext.createChannelSplitter(2);vuAnalyserLeft=audioContext.createAnalyser();vuAnalyserRight=audioContext.createAnalyser();
    vuAnalyserLeft.fftSize=256;vuAnalyserRight.fftSize=256;
    analyser.connect(vuSplitter);vuSplitter.connect(vuAnalyserLeft,0);vuSplitter.connect(vuAnalyserRight,1);
    analyser.connect(audioContext.destination);
    applyEqValues();rebuildReverbImpulse();updateReverbGraph();drawVisualizer();
  }
  async function playAudio(){try{await ensureAudioGraph();await audio.play();}catch(err){console.warn('Playback did not start',err);if(!navigator.onLine&&!offlineIds.has(current))offlineStatus.textContent='This song is not saved offline. Reconnect and tap Save song.';}}
  const togglePlayback=()=>audio.paused?playAudio():audio.pause();
  function nextTrack(){if(shuffle){let next=current;while(tracks.length>1&&next===current)next=Math.floor(Math.random()*tracks.length);loadTrack(next,true);}else loadTrack(current+1,true);}
  const prevTrack=()=>loadTrack(current-1,true);
  function visibleTracks(){const q=search.value.trim().toLowerCase();return tracks.filter(t=>(!q||t.title.toLowerCase().includes(q))&&(filter!=='favorites'||favorites.has(t.id))&&(filter!=='offline'||offlineIds.has(t.id)));}
  function renderTracks(){const visible=visibleTracks();trackCount.textContent=`${visible.length} TRACK${visible.length===1?'':'S'}`;trackList.textContent='';visible.forEach(track=>{const button=document.createElement('button');button.className='track-row'+(track.id===current?' active':'');button.type='button';button.setAttribute('role','listitem');const badges=[favorites.has(track.id)?'★ Favorite':'',offlineIds.has(track.id)?'✓ Offline':''].filter(Boolean).join(' • ');button.innerHTML=`<span class="track-index">${track.id===current&&!audio.paused?'▶':String(track.id+1).padStart(2,'0')}</span><span class="track-name">${escapeHtml(track.title)}<small>${badges||'Astralis Nova'}</small></span><span class="track-artist">Astralis Nova</span><span class="track-duration">${track.duration||'—:—'}</span>`;button.addEventListener('click',()=>loadTrack(track.id,true));trackList.appendChild(button);});}

  function applyPreset(name){
    if(name==='custom'){localStorage.setItem('nova.eqPreset','custom');return;}
    const values=eqPresets[name]||eqPresets.flat;
    document.querySelectorAll('#eqSliders input').forEach((slider,i)=>{slider.value=String(values[i]||0);slider.dispatchEvent(new Event('input'));});
    localStorage.setItem('nova.eqPreset',name);
    eqPreset.value=name;
  }

  function buildEq(){
    const saved=JSON.parse(localStorage.getItem('nova.eq')||'[]'),host=$('eqSliders');
    frequencies.forEach((freq,i)=>{
      const wrap=document.createElement('label');wrap.className='eq-channel';
      const output=document.createElement('output'),slider=document.createElement('input');
      slider.type='range';slider.min='-12';slider.max='12';slider.step='1';slider.value=Number.isFinite(saved[i])?saved[i]:0;slider.dataset.index=String(i);slider.setAttribute('aria-label',`${freq} hertz equalizer`);output.textContent=`${slider.value} dB`;
      slider.addEventListener('input',()=>{
        output.textContent=`${slider.value} dB`;
        const values=[...host.querySelectorAll('input')].map(el=>Number(el.value));
        localStorage.setItem('nova.eq',JSON.stringify(values));
        if(filters[i]&&eqEnabled)filters[i].gain.value=Number(slider.value);
        if(document.activeElement===slider){eqPreset.value='custom';localStorage.setItem('nova.eqPreset','custom');}
      });
      const label=document.createElement('span');label.textContent=freq>=1000?`${freq/1000}K`:String(freq);wrap.append(output,slider,label);host.appendChild(wrap);
    });
    const savedPreset=localStorage.getItem('nova.eqPreset')||'flat';
    eqPreset.value=savedPreset;
    if(savedPreset!=='custom') applyPreset(savedPreset);
  }
  function applyEqValues(){document.querySelectorAll('#eqSliders input').forEach((slider,i)=>{if(filters[i])filters[i].gain.value=eqEnabled?Number(slider.value):0;});}
  function readVuLevel(meter,data){
    if(!meter)return 0;
    meter.getFloatTimeDomainData(data);
    let sum=0;for(let i=0;i<data.length;i++)sum+=data[i]*data[i];
    const rms=Math.sqrt(sum/data.length);
    if(rms<=.00001)return 0;
    return clamp((20*Math.log10(rms)+48)/48,0,1);
  }
  function updateVuMeters(){
    if(!vuAnalyserLeft||!vuAnalyserRight||vuNeedles.length<2)return;
    let leftTarget=audio.paused?0:readVuLevel(vuAnalyserLeft,vuDataLeft),rightTarget=audio.paused?0:readVuLevel(vuAnalyserRight,vuDataRight);
    if(rightTarget<.001&&leftTarget>.01)rightTarget=leftTarget;
    vuLeftLevel+=(leftTarget-vuLeftLevel)*(leftTarget>vuLeftLevel ? .27 : .075);
    vuRightLevel+=(rightTarget-vuRightLevel)*(rightTarget>vuRightLevel ? .27 : .075);
    [vuLeftLevel,vuRightLevel].forEach((level,index)=>{
      const angle=-43+level*78;
      vuNeedles[index].style.setProperty('--vu-angle',`${angle.toFixed(2)}deg`);
      vuMeters[index].setAttribute('aria-valuenow',String(Math.round(level*100)));
      vuMeters[index].classList.toggle('is-peaking',level>.9);
    });
  }
  function drawVisualizer(){if(!analyser)return;const data=new Uint8Array(analyser.frequencyBinCount);const render=()=>{requestAnimationFrame(render);const w=canvas.width,h=canvas.height;analyser.getByteFrequencyData(data);updateVuMeters();if(reverbTunnel&&reverbState.preset!=='off'){let total=0;for(let i=0;i<data.length;i++)total+=data[i];reverbTunnel.style.setProperty('--reverb-brightness',(1+(total/data.length/255)*.72).toFixed(2));}ctx.clearRect(0,0,w,h);const barW=w/data.length,accent=getComputedStyle(document.body).getPropertyValue('--accent').trim()||'#49dfff',accent2=getComputedStyle(document.body).getPropertyValue('--accent-2').trim()||'#9d66ff',gradient=ctx.createLinearGradient(0,h,0,0);gradient.addColorStop(0,accent);gradient.addColorStop(1,accent2);ctx.fillStyle=gradient;for(let i=0;i<data.length;i++){const barH=Math.max(2,(data[i]/255)*h*.92);ctx.fillRect(i*barW,h-barH,Math.max(1,barW-2),barH);}};render();}

  audio.addEventListener('play',()=>{playBtn.textContent='❚❚';playBtn.setAttribute('aria-label','Pause');updateReelDeckMotion();renderTracks();});
  audio.addEventListener('playing',updateReelDeckMotion);
  audio.addEventListener('waiting',()=>{reelDeck?.classList.remove('is-playing');cassetteModule?.classList.remove('is-playing');turntableModule?.classList.remove('is-playing');});
  audio.addEventListener('stalled',()=>{reelDeck?.classList.remove('is-playing');cassetteModule?.classList.remove('is-playing');turntableModule?.classList.remove('is-playing');});
  audio.addEventListener('pause',()=>{playBtn.textContent='▶';playBtn.setAttribute('aria-label','Play');updateReelDeckMotion();renderTracks();});
  audio.addEventListener('emptied',()=>{updateReelCounter();updateCassetteCounter();});
  audio.addEventListener('loadedmetadata',()=>{updateReelCounter();updateCassetteCounter();tracks[current].duration=fmt(audio.duration);timeReadout.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;renderTracks();});
  audio.addEventListener('timeupdate',()=>{updateReelCounter();updateCassetteCounter();if(!userSeeking&&Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(Math.round((audio.currentTime/audio.duration)*1000));timeReadout.textContent=`${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;if('mediaSession'in navigator&&Number.isFinite(audio.duration)&&audio.duration>0){try{navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)});}catch{}}});
  audio.addEventListener('ended',()=>{updateReelDeckMotion();repeat?(audio.currentTime=0,playAudio()):nextTrack();});
  audio.addEventListener('error',()=>{timeReadout.textContent='Track unavailable';if(!navigator.onLine&&!offlineIds.has(current))offlineStatus.textContent='This track was not downloaded. Reconnect to save it for offline use.';});

  playBtn.addEventListener('click',togglePlayback);prevBtn.addEventListener('click',prevTrack);nextBtn.addEventListener('click',nextTrack);
  reelTransportButtons.forEach(button=>button.addEventListener('click',handleReelTransport));
  cassetteButtons.forEach(button=>button.addEventListener('click',handleCassetteTransport));
  turntableButtons.forEach(button=>button.addEventListener('click',handleTurntableControl));
  turntablePitch.addEventListener('input',updateTurntablePitch);
  shuffleBtn.addEventListener('click',()=>{shuffle=!shuffle;localStorage.setItem('nova.shuffle',shuffle?'1':'0');shuffleBtn.setAttribute('aria-pressed',String(shuffle));});
  repeatBtn.addEventListener('click',()=>{repeat=!repeat;localStorage.setItem('nova.repeat',repeat?'1':'0');repeatBtn.setAttribute('aria-pressed',String(repeat));});
  favoriteBtn.addEventListener('click',()=>{const id=tracks[current].id;favorites.has(id)?favorites.delete(id):favorites.add(id);localStorage.setItem('nova.favorites',JSON.stringify([...favorites]));updateFavoriteUI();renderTracks();});
  downloadTrackBtn.addEventListener('click',saveCurrentTrack);downloadAllBtn.addEventListener('click',saveAllTracks);
  seek.addEventListener('pointerdown',()=>userSeeking=true);seek.addEventListener('pointerup',()=>userSeeking=false);seek.addEventListener('change',()=>{if(Number.isFinite(audio.duration))audio.currentTime=(Number(seek.value)/1000)*audio.duration;userSeeking=false;});
  volume.addEventListener('input',()=>{audio.volume=Number(volume.value);localStorage.setItem('nova.volume',volume.value);});search.addEventListener('input',renderTracks);
  document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t===tab);t.setAttribute('aria-selected',String(t===tab));});filter=tab.dataset.filter;renderTracks();}));
  skinSelect.addEventListener('change',()=>{document.body.dataset.skin=skinSelect.value;localStorage.setItem('nova.skin',skinSelect.value);});
  eqToggle.addEventListener('click',()=>{const collapsed=eqWindow.classList.toggle('collapsed');eqToggle.setAttribute('aria-expanded',String(!collapsed));});
  eqPower.addEventListener('click',()=>{eqEnabled=!eqEnabled;eqPower.classList.toggle('active',eqEnabled);eqPower.setAttribute('aria-pressed',String(eqEnabled));eqPower.textContent=eqEnabled?'EQ ON':'EQ OFF';applyEqValues();});
  eqPreset.addEventListener('change',()=>applyPreset(eqPreset.value));
  reverbPreset.addEventListener('change',()=>setReverbPreset(reverbPreset.value));
  [reverbMix,reverbDepth,reverbDecay,reverbPreDelay].forEach(control=>control.addEventListener('input',handleReverbControl));
  eqReset.addEventListener('click',()=>{eqPreset.value='flat';applyPreset('flat');});
  window.addEventListener('online',refreshOfflineState);window.addEventListener('offline',refreshOfflineState);

  if('mediaSession'in navigator){for(const [action,handler] of [['play',playAudio],['pause',()=>audio.pause()],['previoustrack',prevTrack],['nexttrack',nextTrack],['seekbackward',d=>audio.currentTime=Math.max(0,audio.currentTime-(d.seekOffset||10))],['seekforward',d=>audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+(d.seekOffset||10))],['seekto',d=>{if(d.seekTime!=null)audio.currentTime=d.seekTime;}]] ){try{navigator.mediaSession.setActionHandler(action,handler);}catch{}}}
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;$('installBtn').hidden=false;});
  $('installBtn').addEventListener('click',async()=>{if(!deferredInstallPrompt)return;deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;$('installBtn').hidden=true;});
  window.addEventListener('appinstalled',()=>{$('pwaStatus').textContent='Installed';$('installBtn').hidden=true;});
  if('serviceWorker'in navigator)window.addEventListener('load',async()=>{try{await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;refreshOfflineState();}catch(err){console.warn(err);}});

  const savedSkin=localStorage.getItem('nova.skin')||'nova';document.body.dataset.skin=savedSkin;skinSelect.value=savedSkin;audio.volume=Number(localStorage.getItem('nova.volume')||0.85);volume.value=String(audio.volume);shuffleBtn.setAttribute('aria-pressed',String(shuffle));repeatBtn.setAttribute('aria-pressed',String(repeat));if(matchMedia('(max-width:760px)').matches){eqWindow.classList.add('collapsed');eqToggle.setAttribute('aria-expanded','false');}buildEq();syncReverbUI();turntablePitch.value=String(turntablePitchAmount);updateTurntablePitch();updateTurntableMotion();loadTrack(current,false);refreshOfflineState();
})();
