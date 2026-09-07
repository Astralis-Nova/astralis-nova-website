(() => {
  'use strict';

  const DB_NAME='astralis-nova-player';
  const DB_VERSION=1;
  const STORE='localTracks';
  const DEFAULT_COVER='../cover-3.jpg';
  const AUDIO_TYPES='audio/*,.mp3,.m4a,.aac,.wav,.ogg,.oga,.flac,.webm';

  let db=null;
  let localTracks=[];
  let localMode=false;
  let localCurrent=-1;
  let localObjectUrl='';
  let renderQueued=false;
  let switching=false;

  const $=id=>document.getElementById(id);
  const audio=$('audio');
  const trackList=$('trackList');
  const trackCount=$('trackCount');
  const search=$('search');
  const title=$('trackTitle');
  const artist=$('trackArtist');
  const cover=$('cover');
  const timeReadout=$('timeReadout');
  const favoriteBtn=$('favoriteBtn');
  const downloadTrackBtn=$('downloadTrackBtn');
  const offlineStatus=$('offlineStatus');
  const prevBtn=$('prevBtn');
  const nextBtn=$('nextBtn');

  if(!audio||!trackList)return;

  const fmt=s=>{if(!Number.isFinite(s))return'—:—';const m=Math.floor(s/60),sec=Math.floor(s%60).toString().padStart(2,'0');return `${m}:${sec}`;};
  const escapeHtml=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(db){resolve(db);return;}
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const database=req.result;
        if(!database.objectStoreNames.contains(STORE)){
          const store=database.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});
          store.createIndex('addedAt','addedAt');
          store.createIndex('name','name');
        }
      };
      req.onsuccess=()=>{db=req.result;resolve(db);};
      req.onerror=()=>reject(req.error||new Error('Could not open local music library'));
    });
  }

  function tx(mode='readonly'){
    return openDb().then(database=>database.transaction(STORE,mode).objectStore(STORE));
  }

  async function readAll(){
    const store=await tx();
    return new Promise((resolve,reject)=>{
      const req=store.getAll();
      req.onsuccess=()=>resolve((req.result||[]).sort((a,b)=>(a.addedAt||0)-(b.addedAt||0)));
      req.onerror=()=>reject(req.error);
    });
  }

  async function addRecord(record){
    const store=await tx('readwrite');
    return new Promise((resolve,reject)=>{
      const req=store.add(record);
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>reject(req.error);
    });
  }

  async function deleteRecord(id){
    const store=await tx('readwrite');
    return new Promise((resolve,reject)=>{
      const req=store.delete(id);
      req.onsuccess=()=>resolve();
      req.onerror=()=>reject(req.error);
    });
  }

  function cleanTitle(name){
    return name.replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim()||'Untitled track';
  }

  function artistFromName(name){
    const base=cleanTitle(name);
    const split=base.split(/\s+-\s+/);
    return split.length>1?split.shift().trim():'Local Music';
  }

  function titleFromName(name){
    const base=cleanTitle(name);
    const split=base.split(/\s+-\s+/);
    return split.length>1?split.join(' - ').trim():base;
  }

  async function estimateStorage(){
    if(!navigator.storage?.estimate)return '';
    try{
      const {usage=0,quota=0}=await navigator.storage.estimate();
      const gb=n=>(n/1073741824).toFixed(n>1073741824?1:2);
      return quota?`${gb(usage)} GB used of ${gb(quota)} GB app storage`:'';
    }catch{return '';}
  }

  async function refreshStatus(prefix=''){
    const storage=await estimateStorage();
    const size=localTracks.reduce((sum,t)=>sum+(t.size||0),0);
    const mb=(size/1048576).toFixed(size>=104857600?0:1);
    const text=`Personal library: ${localTracks.length} song${localTracks.length===1?'':'s'} • ${mb} MB${storage?` • ${storage}`:''}`;
    if(offlineStatus&&!localMode)offlineStatus.dataset.localLibrary=text;
    if(offlineStatus&&localMode)offlineStatus.textContent=prefix?`${prefix} • ${text}`:text;
  }

  function buildUi(){
    const toolbar=document.querySelector('.library-toolbar');
    const tabs=toolbar?.querySelector('.tabs');
    if(!toolbar||!tabs||$('addLocalMusicBtn'))return;

    const myTab=document.createElement('button');
    myTab.type='button';
    myTab.className='tab';
    myTab.id='myMusicTab';
    myTab.textContent='My Music';
    myTab.setAttribute('aria-selected','false');
    tabs.insertBefore(myTab,trackCount||null);

    const controls=document.createElement('div');
    controls.className='local-library-actions';
    controls.innerHTML=`<button id="addLocalMusicBtn" class="chip" type="button">＋ Add Music</button><input id="localMusicPicker" type="file" accept="${AUDIO_TYPES}" multiple hidden>`;
    toolbar.appendChild(controls);

    const style=document.createElement('style');
    style.textContent=`
      .local-library-actions{display:flex;align-items:center;gap:8px;margin-left:auto}
      #addLocalMusicBtn{white-space:nowrap;font-weight:800}
      .track-row.local-track{position:relative;padding-right:76px}
      .track-row.local-track .track-name small{color:var(--accent,#49dfff)}
      .local-remove{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:42px;height:28px;border:1px solid #ffffff32;border-radius:7px;background:#090d14;color:#cfd7e6;cursor:pointer;font-size:.7rem;z-index:2}
      .local-remove:hover{border-color:#ff718a;color:#ff9bad}
      .local-library-empty{padding:34px 20px;text-align:center;border:1px dashed #ffffff24;border-radius:12px;color:#aeb9c9;line-height:1.6}
      .local-library-empty strong{display:block;color:#eef5ff;font-size:1.05rem;margin-bottom:5px}
      body[data-skin="legacy83"] #addLocalMusicBtn{background:linear-gradient(#d4d0c6,#8b8b84);color:#151515;border-color:#ece8dc #4b4c49 #3b3c39 #ddd8cb;text-shadow:0 1px #fff8}
      @media(max-width:760px){.library-toolbar{flex-wrap:wrap}.local-library-actions{order:3;width:100%;margin-left:0}.local-library-actions #addLocalMusicBtn{width:100%}.track-row.local-track{padding-right:56px}.local-remove{right:6px;width:36px}}
    `;
    document.head.appendChild(style);

    $('addLocalMusicBtn').addEventListener('click',()=>$('localMusicPicker').click());
    $('localMusicPicker').addEventListener('change',async event=>{
      const files=[...event.target.files].filter(file=>file.type.startsWith('audio/')||/\.(mp3|m4a|aac|wav|ogg|oga|flac|webm)$/i.test(file.name));
      if(!files.length)return;
      $('addLocalMusicBtn').disabled=true;
      $('addLocalMusicBtn').textContent=`Adding ${files.length}…`;
      let added=0,failed=0;
      for(const file of files){
        try{
          await addRecord({name:file.name,title:titleFromName(file.name),artist:artistFromName(file.name),type:file.type||'audio/mpeg',size:file.size,lastModified:file.lastModified,addedAt:Date.now()+added,blob:file});
          added++;
        }catch(err){console.warn('Could not add local music file',file.name,err);failed++;}
      }
      event.target.value='';
      $('addLocalMusicBtn').disabled=false;
      $('addLocalMusicBtn').textContent='＋ Add Music';
      localTracks=await readAll();
      activateLocalMode();
      await refreshStatus(failed?`Added ${added}; ${failed} failed`:`Added ${added} song${added===1?'':'s'}`);
    });

    myTab.addEventListener('click',activateLocalMode);
    [...tabs.querySelectorAll('.tab')].filter(tab=>tab!==myTab).forEach(tab=>tab.addEventListener('click',()=>{if(localMode)deactivateLocalMode();},true));
  }

  function visibleLocalTracks(){
    const q=(search?.value||'').trim().toLowerCase();
    return localTracks.filter(t=>!q||t.title.toLowerCase().includes(q)||t.artist.toLowerCase().includes(q)||t.name.toLowerCase().includes(q));
  }

  function queueRender(){
    if(!localMode||renderQueued)return;
    renderQueued=true;
    queueMicrotask(()=>{renderQueued=false;if(localMode)renderLocalTracks();});
  }

  function renderLocalTracks(){
    if(!localMode)return;
    const visible=visibleLocalTracks();
    trackList.textContent='';
    if(trackCount)trackCount.textContent=`${visible.length} LOCAL TRACK${visible.length===1?'':'S'}`;
    if(!visible.length){
      const empty=document.createElement('div');
      empty.className='local-library-empty';
      empty.innerHTML=localTracks.length?'<strong>No matching songs</strong>Try a different search.':'<strong>Your personal library is ready.</strong>Tap “Add Music” and choose songs from this device. They stay stored locally in the app.';
      trackList.appendChild(empty);
      return;
    }
    visible.forEach((track,index)=>{
      const absoluteIndex=localTracks.findIndex(t=>t.id===track.id);
      const row=document.createElement('button');
      row.type='button';
      row.className='track-row local-track'+(absoluteIndex===localCurrent?' active':'');
      row.setAttribute('role','listitem');
      row.innerHTML=`<span class="track-index">${absoluteIndex===localCurrent&&!audio.paused?'▶':String(index+1).padStart(2,'0')}</span><span class="track-name">${escapeHtml(track.title)}<small>◉ Stored on this device</small></span><span class="track-artist">${escapeHtml(track.artist)}</span><span class="track-duration">${track.duration||'—:—'}</span><span class="local-remove" role="button" tabindex="0" aria-label="Remove ${escapeHtml(track.title)}">✕</span>`;
      row.addEventListener('click',event=>{if(event.target.closest('.local-remove'))return;playLocalTrack(absoluteIndex,true);});
      const remove=row.querySelector('.local-remove');
      const removeHandler=async event=>{
        event.preventDefault();event.stopPropagation();
        const wasCurrent=absoluteIndex===localCurrent;
        await deleteRecord(track.id);
        localTracks=await readAll();
        if(wasCurrent){audio.pause();audio.loop=false;localCurrent=-1;releaseObjectUrl();}
        else if(localCurrent>absoluteIndex)localCurrent--;
        renderLocalTracks();refreshStatus('Removed song');
      };
      remove.addEventListener('click',removeHandler);
      remove.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){removeHandler(event);}});
      trackList.appendChild(row);
    });
  }

  function releaseObjectUrl(){
    if(localObjectUrl){URL.revokeObjectURL(localObjectUrl);localObjectUrl='';}
  }

  function setMediaSession(track){
    if(!('mediaSession'in navigator))return;
    try{
      navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:'Astralis Nova • My Music',artwork:[{src:new URL(DEFAULT_COVER,location.href).href,sizes:'512x512',type:'image/jpeg'}]});
    }catch{}
  }

  async function playLocalTrack(index,autoplay=false){
    if(!localTracks.length)return;
    index=(index+localTracks.length)%localTracks.length;
    const track=localTracks[index];
    if(!track?.blob)return;
    switching=true;
    releaseObjectUrl();
    localCurrent=index;
    localObjectUrl=URL.createObjectURL(track.blob);
    audio.loop=true;
    audio.src=localObjectUrl;
    title.textContent=track.title;
    artist.textContent=track.artist;
    cover.src=DEFAULT_COVER;
    cover.alt=`${track.title} artwork`;
    if(timeReadout)timeReadout.textContent='0:00 / 0:00';
    if(favoriteBtn){favoriteBtn.textContent='☆';favoriteBtn.title='Favorites for personal songs are coming in the sync upgrade.';}
    if(downloadTrackBtn){downloadTrackBtn.textContent='✓ Stored locally';downloadTrackBtn.disabled=false;}
    setMediaSession(track);
    renderLocalTracks();
    await refreshStatus(`Playing “${track.title}”`);
    if(autoplay){try{await audio.play();}catch(err){console.warn('Local playback did not start',err);}}
    setTimeout(()=>{switching=false;},250);
  }

  function activateLocalMode(){
    localMode=true;
    window.NovaLocalLibraryActive=true;
    document.querySelectorAll('.tabs .tab').forEach(tab=>{const active=tab.id==='myMusicTab';tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));});
    renderLocalTracks();
    refreshStatus();
  }

  function deactivateLocalMode(){
    localMode=false;
    window.NovaLocalLibraryActive=false;
    audio.loop=false;
    if(localCurrent>=0){localCurrent=-1;releaseObjectUrl();}
    if(favoriteBtn)favoriteBtn.removeAttribute('title');
    if(offlineStatus?.dataset.localLibrary)offlineStatus.textContent=offlineStatus.dataset.localLibrary;
  }

  function localStep(delta){
    if(!localTracks.length)return;
    const next=localCurrent<0?(delta>0?0:localTracks.length-1):localCurrent+delta;
    playLocalTrack(next,true);
  }

  [prevBtn,nextBtn].forEach((btn,index)=>btn?.addEventListener('click',event=>{
    if(!localMode||localCurrent<0)return;
    event.preventDefault();event.stopImmediatePropagation();
    localStep(index===0?-1:1);
  },true));

  favoriteBtn?.addEventListener('click',event=>{
    if(!localMode||localCurrent<0)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(offlineStatus)offlineStatus.textContent='This song is already stored locally. Personal-song favorites are planned for the sync upgrade.';
  },true);

  downloadTrackBtn?.addEventListener('click',event=>{
    if(!localMode||localCurrent<0)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(offlineStatus)offlineStatus.textContent='Already stored on this device. No extra download is needed.';
  },true);

  search?.addEventListener('input',()=>{if(localMode)queueRender();});

  audio.addEventListener('loadedmetadata',()=>{
    if(!localMode||localCurrent<0)return;
    const track=localTracks[localCurrent];
    if(track)track.duration=fmt(audio.duration);
    renderLocalTracks();
  });

  audio.addEventListener('play',()=>{if(localMode)queueRender();});
  audio.addEventListener('pause',()=>{if(localMode)queueRender();});
  audio.addEventListener('timeupdate',()=>{
    if(!localMode||localCurrent<0||switching||audio.paused||!Number.isFinite(audio.duration)||audio.duration<1)return;
    if(audio.duration-audio.currentTime<0.18){switching=true;localStep(1);}
  });

  const observer=new MutationObserver(()=>{if(localMode)queueRender();});
  observer.observe(trackList,{childList:true});

  async function init(){
    buildUi();
    try{localTracks=await readAll();await refreshStatus();}
    catch(err){console.warn('Local library unavailable',err);if($('addLocalMusicBtn'))$('addLocalMusicBtn').disabled=true;}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
