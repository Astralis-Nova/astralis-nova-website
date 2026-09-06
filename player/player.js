(() => {
  'use strict';

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
  ].map((item, id) => ({ id, title:item[0], src:'../' + encodeURI(item[1]), cover:'../' + item[2], artist:'Astralis Nova', duration:'' }));

  const $ = (id) => document.getElementById(id);
  const audio = $('audio');
  const cover = $('cover');
  const title = $('trackTitle');
  const artist = $('trackArtist');
  const playBtn = $('playBtn');
  const prevBtn = $('prevBtn');
  const nextBtn = $('nextBtn');
  const shuffleBtn = $('shuffleBtn');
  const repeatBtn = $('repeatBtn');
  const favoriteBtn = $('favoriteBtn');
  const seek = $('seek');
  const volume = $('volume');
  const timeReadout = $('timeReadout');
  const trackList = $('trackList');
  const search = $('search');
  const trackCount = $('trackCount');
  const skinSelect = $('skinSelect');
  const eqWindow = $('equalizer');
  const eqToggle = $('eqToggle');
  const eqPower = $('eqPower');
  const eqReset = $('eqReset');
  const canvas = $('visualizer');
  const ctx = canvas.getContext('2d');

  let current = Number(localStorage.getItem('nova.current') || 2);
  if (!Number.isInteger(current) || !tracks[current]) current = 0;
  let shuffle = localStorage.getItem('nova.shuffle') === '1';
  let repeat = localStorage.getItem('nova.repeat') === '1';
  let favorites = new Set(JSON.parse(localStorage.getItem('nova.favorites') || '[]'));
  let filter = 'all';
  let userSeeking = false;
  let deferredInstallPrompt = null;

  const frequencies = [60,170,310,600,1000,3000,6000,12000,14000,16000];
  let audioContext, sourceNode, analyser, filters = [], eqEnabled = true;

  function fmt(seconds){
    if (!Number.isFinite(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  function setMediaSession(track){
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: 'Astralis Nova',
      artwork: [{ src: new URL(track.cover, location.href).href, sizes:'512x512', type:'image/jpeg' }]
    });
  }

  function updateFavoriteUI(){
    const active = favorites.has(tracks[current].id);
    favoriteBtn.setAttribute('aria-pressed', String(active));
    favoriteBtn.textContent = active ? '★' : '☆';
    favoriteBtn.setAttribute('aria-label', active ? 'Remove current track from favorites' : 'Add current track to favorites');
  }

  function loadTrack(index, autoplay=false){
    current = (index + tracks.length) % tracks.length;
    localStorage.setItem('nova.current', String(current));
    const track = tracks[current];
    audio.src = track.src;
    cover.src = track.cover;
    cover.alt = `${track.title} artwork`;
    title.textContent = track.title;
    artist.textContent = track.artist;
    seek.value = '0';
    timeReadout.textContent = '0:00 / 0:00';
    setMediaSession(track);
    updateFavoriteUI();
    renderTracks();
    if (autoplay) playAudio();
  }

  async function ensureAudioGraph(){
    if (audioContext) {
      if (audioContext.state === 'suspended') await audioContext.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioContext = new AC();
    sourceNode = audioContext.createMediaElementSource(audio);
    filters = frequencies.map((frequency) => {
      const f = audioContext.createBiquadFilter();
      f.type = 'peaking'; f.frequency.value = frequency; f.Q.value = 1; f.gain.value = 0;
      return f;
    });
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    let node = sourceNode;
    filters.forEach((f) => { node.connect(f); node = f; });
    node.connect(analyser); analyser.connect(audioContext.destination);
    applyEqValues();
    drawVisualizer();
  }

  async function playAudio(){
    try { await ensureAudioGraph(); await audio.play(); }
    catch (err) { console.warn('Playback did not start', err); }
  }

  function togglePlayback(){ audio.paused ? playAudio() : audio.pause(); }

  function nextTrack(){
    if (shuffle) {
      let next = current;
      while (tracks.length > 1 && next === current) next = Math.floor(Math.random() * tracks.length);
      loadTrack(next, true);
    } else loadTrack(current + 1, true);
  }
  function prevTrack(){ loadTrack(current - 1, true); }

  function visibleTracks(){
    const q = search.value.trim().toLowerCase();
    return tracks.filter((track) => (!q || track.title.toLowerCase().includes(q)) && (filter !== 'favorites' || favorites.has(track.id)));
  }

  function renderTracks(){
    const visible = visibleTracks();
    trackCount.textContent = `${visible.length} TRACK${visible.length === 1 ? '' : 'S'}`;
    trackList.textContent = '';
    visible.forEach((track) => {
      const button = document.createElement('button');
      button.className = 'track-row' + (track.id === current ? ' active' : '');
      button.type = 'button'; button.setAttribute('role','listitem');
      button.innerHTML = `<span class="track-index">${track.id === current && !audio.paused ? '▶' : String(track.id + 1).padStart(2,'0')}</span><span class="track-name">${escapeHtml(track.title)}<small>${favorites.has(track.id) ? '★ Favorite' : 'Astralis Nova'}</small></span><span class="track-artist">Astralis Nova</span><span class="track-duration">${track.duration || '—:—'}</span>`;
      button.addEventListener('click', () => loadTrack(track.id, true));
      trackList.appendChild(button);
    });
  }

  function escapeHtml(value){
    return value.replace(/[&<>'"]/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function buildEq(){
    const saved = JSON.parse(localStorage.getItem('nova.eq') || '[]');
    const host = $('eqSliders');
    frequencies.forEach((freq, i) => {
      const wrap = document.createElement('label'); wrap.className = 'eq-channel';
      const output = document.createElement('output');
      const slider = document.createElement('input');
      slider.type = 'range'; slider.min = '-12'; slider.max = '12'; slider.step = '1'; slider.value = Number.isFinite(saved[i]) ? saved[i] : 0;
      slider.dataset.index = String(i); slider.setAttribute('aria-label', `${freq} hertz equalizer`);
      output.textContent = `${slider.value} dB`;
      slider.addEventListener('input', () => {
        output.textContent = `${slider.value} dB`;
        const values = [...host.querySelectorAll('input')].map((el) => Number(el.value));
        localStorage.setItem('nova.eq', JSON.stringify(values));
        if (filters[i] && eqEnabled) filters[i].gain.value = Number(slider.value);
      });
      const label = document.createElement('span'); label.textContent = freq >= 1000 ? `${freq/1000}K` : String(freq);
      wrap.append(output, slider, label); host.appendChild(wrap);
    });
  }

  function applyEqValues(){
    document.querySelectorAll('#eqSliders input').forEach((slider, i) => {
      if (filters[i]) filters[i].gain.value = eqEnabled ? Number(slider.value) : 0;
    });
  }

  function drawVisualizer(){
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const render = () => {
      requestAnimationFrame(render);
      const w = canvas.width, h = canvas.height;
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0,0,w,h);
      const barW = w / data.length;
      const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim() || '#49dfff';
      const accent2 = getComputedStyle(document.body).getPropertyValue('--accent-2').trim() || '#9d66ff';
      const gradient = ctx.createLinearGradient(0,h,0,0); gradient.addColorStop(0,accent); gradient.addColorStop(1,accent2); ctx.fillStyle = gradient;
      for(let i=0;i<data.length;i++){
        const barH = Math.max(2,(data[i]/255)*h*.92);
        ctx.fillRect(i*barW,h-barH,Math.max(1,barW-2),barH);
      }
    };
    render();
  }

  audio.addEventListener('play', () => { playBtn.textContent='❚❚'; playBtn.setAttribute('aria-label','Pause'); renderTracks(); });
  audio.addEventListener('pause', () => { playBtn.textContent='▶'; playBtn.setAttribute('aria-label','Play'); renderTracks(); });
  audio.addEventListener('loadedmetadata', () => {
    tracks[current].duration = fmt(audio.duration); timeReadout.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`; renderTracks();
  });
  audio.addEventListener('timeupdate', () => {
    if (!userSeeking && Number.isFinite(audio.duration) && audio.duration > 0) seek.value = String(Math.round((audio.currentTime/audio.duration)*1000));
    timeReadout.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
    if ('mediaSession' in navigator && Number.isFinite(audio.duration) && audio.duration > 0) {
      try { navigator.mediaSession.setPositionState({duration:audio.duration,playbackRate:audio.playbackRate,position:Math.min(audio.currentTime,audio.duration)}); } catch {}
    }
  });
  audio.addEventListener('ended', () => repeat ? (audio.currentTime=0,playAudio()) : nextTrack());
  audio.addEventListener('error', () => { timeReadout.textContent='Track unavailable'; });

  playBtn.addEventListener('click', togglePlayback); prevBtn.addEventListener('click', prevTrack); nextBtn.addEventListener('click', nextTrack);
  shuffleBtn.addEventListener('click', () => { shuffle=!shuffle; localStorage.setItem('nova.shuffle',shuffle?'1':'0'); shuffleBtn.setAttribute('aria-pressed',String(shuffle)); });
  repeatBtn.addEventListener('click', () => { repeat=!repeat; localStorage.setItem('nova.repeat',repeat?'1':'0'); repeatBtn.setAttribute('aria-pressed',String(repeat)); });
  favoriteBtn.addEventListener('click', () => { const id=tracks[current].id; favorites.has(id)?favorites.delete(id):favorites.add(id); localStorage.setItem('nova.favorites',JSON.stringify([...favorites])); updateFavoriteUI(); renderTracks(); });
  seek.addEventListener('pointerdown',()=>userSeeking=true); seek.addEventListener('pointerup',()=>userSeeking=false); seek.addEventListener('change',()=>{ if(Number.isFinite(audio.duration)) audio.currentTime=(Number(seek.value)/1000)*audio.duration; userSeeking=false; });
  volume.addEventListener('input',()=>{ audio.volume=Number(volume.value); localStorage.setItem('nova.volume',volume.value); });
  search.addEventListener('input',renderTracks);
  document.querySelectorAll('.tab').forEach((tab)=>tab.addEventListener('click',()=>{ document.querySelectorAll('.tab').forEach(t=>{t.classList.toggle('active',t===tab);t.setAttribute('aria-selected',String(t===tab));}); filter=tab.dataset.filter; renderTracks(); }));
  skinSelect.addEventListener('change',()=>{ document.body.dataset.skin=skinSelect.value; localStorage.setItem('nova.skin',skinSelect.value); });
  eqToggle.addEventListener('click',()=>{ const collapsed=eqWindow.classList.toggle('collapsed'); eqToggle.setAttribute('aria-expanded',String(!collapsed)); });
  eqPower.addEventListener('click',()=>{ eqEnabled=!eqEnabled; eqPower.classList.toggle('active',eqEnabled); eqPower.setAttribute('aria-pressed',String(eqEnabled)); eqPower.textContent=eqEnabled?'EQ ON':'EQ OFF'; applyEqValues(); });
  eqReset.addEventListener('click',()=>{ document.querySelectorAll('#eqSliders input').forEach((s)=>{s.value='0';s.dispatchEvent(new Event('input'));}); });

  if ('mediaSession' in navigator) {
    for (const [action,handler] of [['play',playAudio],['pause',()=>audio.pause()],['previoustrack',prevTrack],['nexttrack',nextTrack],['seekbackward',d=>audio.currentTime=Math.max(0,audio.currentTime-(d.seekOffset||10))],['seekforward',d=>audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+(d.seekOffset||10))],['seekto',d=>{if(d.seekTime!=null)audio.currentTime=d.seekTime;}]]) {
      try { navigator.mediaSession.setActionHandler(action,handler); } catch {}
    }
  }

  window.addEventListener('beforeinstallprompt',(event)=>{ event.preventDefault(); deferredInstallPrompt=event; $('installBtn').hidden=false; });
  $('installBtn').addEventListener('click',async()=>{ if(!deferredInstallPrompt) return; deferredInstallPrompt.prompt(); await deferredInstallPrompt.userChoice; deferredInstallPrompt=null; $('installBtn').hidden=true; });
  window.addEventListener('appinstalled',()=>{ $('pwaStatus').textContent='Installed'; $('installBtn').hidden=true; });

  if ('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));

  const savedSkin=localStorage.getItem('nova.skin')||'nova'; document.body.dataset.skin=savedSkin; skinSelect.value=savedSkin;
  audio.volume=Number(localStorage.getItem('nova.volume')||0.85); volume.value=String(audio.volume);
  shuffleBtn.setAttribute('aria-pressed',String(shuffle)); repeatBtn.setAttribute('aria-pressed',String(repeat));
  if (matchMedia('(max-width:760px)').matches) { eqWindow.classList.add('collapsed'); eqToggle.setAttribute('aria-expanded','false'); }
  buildEq(); loadTrack(current,false);
})();
