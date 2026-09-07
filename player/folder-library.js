(() => {
  'use strict';

  const DB_NAME='astralis-nova-music-folders';
  const STORE='folders';
  const AUDIO_RE=/\.(mp3|m4a|aac|wav|ogg|oga|flac|webm)$/i;
  const DEFAULT_COVER='../cover-3.jpg';

  let db=null;
  let folders=[];
  let folderTracks=[];
  let folderMode=false;
  let current=-1;
  let objectUrl='';
  let switching=false;
  let renderQueued=false;

  const $=id=>document.getElementById(id);
  const audio=$('audio'),trackList=$('trackList'),trackCount=$('trackCount'),search=$('search');
  const title=$('trackTitle'),artist=$('trackArtist'),cover=$('cover'),timeReadout=$('timeReadout');
  const favoriteBtn=$('favoriteBtn'),downloadTrackBtn=$('downloadTrackBtn'),offlineStatus=$('offlineStatus');
  const prevBtn=$('prevBtn'),nextBtn=$('nextBtn');
  if(!audio||!trackList)return;

  const escapeHtml=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const fmt=s=>{if(!Number.isFinite(s))return'—:—';const m=Math.floor(s/60),sec=Math.floor(s%60).toString().padStart(2,'0');return `${m}:${sec}`;};
  const cleanTitle=name=>name.replace(/\.[^.]+$/,'').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim()||'Untitled track';
  const titleFromName=name=>{const base=cleanTitle(name),parts=base.split(/\s+-\s+/);return parts.length>1?parts.slice(1).join(' - ').trim():base;};
  const artistFromName=name=>{const base=cleanTitle(name),parts=base.split(/\s+-\s+/);return parts.length>1?parts[0].trim():'Local Folder';};

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(db){resolve(db);return;}
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});};
      req.onsuccess=()=>{db=req.result;resolve(db);};
      req.onerror=()=>reject(req.error||new Error('Folder library database unavailable'));
    });
  }
  async function store(mode='readonly'){const database=await openDb();return database.transaction(STORE,mode).objectStore(STORE);}
  async function readFolders(){const s=await store();return new Promise((resolve,reject)=>{const r=s.getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}
  async function saveFolder(handle){const s=await store('readwrite');return new Promise((resolve,reject)=>{const r=s.add({name:handle.name,handle,addedAt:Date.now()});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  async function deleteFolder(id){const s=await store('readwrite');return new Promise((resolve,reject)=>{const r=s.delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});}

  async function hasReadPermission(handle){
    if(!handle?.queryPermission)return false;
    try{return (await handle.queryPermission({mode:'read'}))==='granted';}catch{return false;}
  }
  async function ensureReadPermission(handle){
    if(await hasReadPermission(handle))return true;
    try{return (await handle.requestPermission({mode:'read'}))==='granted';}catch{return false;}
  }

  async function walkDirectory(dir,folderId,folderName,prefix=''){
    const out=[];
    for await(const [name,handle] of dir.entries()){
      if(handle.kind==='file'&&AUDIO_RE.test(name)){
        try{const file=await handle.getFile();out.push({folderId,folderName,path:prefix+name,name,title:titleFromName(name),artist:artistFromName(name),size:file.size,lastModified:file.lastModified,type:file.type||'audio/mpeg',handle,duration:''});}catch{}
      }else if(handle.kind==='directory'){
        const nested=await walkDirectory(handle,folderId,folderName,`${prefix}${name}/`);
        out.push(...nested);
      }
    }
    return out;
  }

  async function rescanFolders(requestPermission=false){
    folderTracks=[];
    let denied=0;
    for(const folder of folders){
      const ok=requestPermission?await ensureReadPermission(folder.handle):await hasReadPermission(folder.handle);
      if(!ok){denied++;continue;}
      folderTracks.push(...await walkDirectory(folder.handle,folder.id,folder.name));
    }
    folderTracks.sort((a,b)=>a.title.localeCompare(b.title));
    if(folderMode)render();
    const suffix=denied?` • ${denied} folder${denied===1?' needs':'s need'} permission`:'';
    if(offlineStatus&&folderMode)offlineStatus.textContent=`Folder library: ${folderTracks.length} song${folderTracks.length===1?'':'s'}${suffix}`;
  }

  function buildUi(){
    const toolbar=document.querySelector('.library-toolbar'),tabs=toolbar?.querySelector('.tabs');
    if(!toolbar||!tabs||$('folderMusicTab'))return;
    const tab=document.createElement('button');tab.type='button';tab.className='tab';tab.id='folderMusicTab';tab.textContent='Folders';tab.setAttribute('aria-selected','false');
    tabs.insertBefore(tab,trackCount||null);
    const actions=document.createElement('div');actions.className='folder-library-actions';
    actions.innerHTML='<button id="chooseMusicFolderBtn" class="chip" type="button">📁 Choose Music Folder</button><button id="rescanMusicFoldersBtn" class="chip" type="button">↻ Rescan</button><button id="manageMusicFoldersBtn" class="chip" type="button">Folders</button>';
    toolbar.appendChild(actions);
    if(!('showDirectoryPicker'in window))$('chooseMusicFolderBtn').title='Folder access is not supported here. Use Add Music instead.';
    const style=document.createElement('style');style.textContent=`
      .folder-library-actions{display:flex;align-items:center;gap:8px;margin-left:auto}
      .folder-library-actions .chip{white-space:nowrap}
      .folder-track .track-name small{color:var(--accent,#49dfff)}
      .folder-library-empty{padding:34px 20px;text-align:center;border:1px dashed #ffffff24;border-radius:12px;color:#aeb9c9;line-height:1.6}
      .folder-library-empty strong{display:block;color:#eef5ff;font-size:1.05rem;margin-bottom:5px}
      .folder-manager{padding:12px 0;display:grid;gap:8px}
      .folder-manager-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid #ffffff1f;border-radius:9px}
      .folder-manager-row button{border:1px solid #ffffff30;border-radius:7px;background:#090d14;color:#d6deea;padding:6px 9px;cursor:pointer}
      body[data-skin="legacy83"] .folder-library-actions .chip{background:linear-gradient(#d4d0c6,#8b8b84);color:#151515;border-color:#ece8dc #4b4c49 #3b3c39 #ddd8cb;text-shadow:0 1px #fff8}
      @media(max-width:760px){.folder-library-actions{order:4;width:100%;margin-left:0;display:grid;grid-template-columns:1fr 1fr}.folder-library-actions #chooseMusicFolderBtn{grid-column:1/-1}}
    `;document.head.appendChild(style);

    tab.addEventListener('click',activate);
    $('chooseMusicFolderBtn').addEventListener('click',chooseFolder);
    $('rescanMusicFoldersBtn').addEventListener('click',async()=>{if(!folderMode)activate();await rescanFolders(true);});
    $('manageMusicFoldersBtn').addEventListener('click',()=>{activate();renderFolderManager();});
    document.addEventListener('click',event=>{const t=event.target.closest('.tab');if(t&&t!==tab&&folderMode)deactivate();},true);
  }

  async function chooseFolder(){
    if(!('showDirectoryPicker'in window)){
      if(offlineStatus)offlineStatus.textContent='This browser does not support persistent folder access. Use “Add Music” for individual songs.';
      return;
    }
    try{
      const handle=await window.showDirectoryPicker({mode:'read'});
      if(!await ensureReadPermission(handle))return;
      const duplicate=folders.some(f=>f.name===handle.name);
      if(!duplicate)await saveFolder(handle);
      folders=await readFolders();activate();await rescanFolders(false);
      if(offlineStatus)offlineStatus.textContent=`Folder “${handle.name}” added • ${folderTracks.length} indexed song${folderTracks.length===1?'':'s'}`;
    }catch(err){if(err?.name!=='AbortError')console.warn('Folder selection failed',err);}
  }

  function visibleTracks(){const q=(search?.value||'').trim().toLowerCase();return folderTracks.filter(t=>!q||t.title.toLowerCase().includes(q)||t.artist.toLowerCase().includes(q)||t.path.toLowerCase().includes(q)||t.folderName.toLowerCase().includes(q));}
  function render(){
    if(!folderMode)return;
    const visible=visibleTracks();trackList.textContent='';if(trackCount)trackCount.textContent=`${visible.length} FOLDER TRACK${visible.length===1?'':'S'}`;
    if(!visible.length){const empty=document.createElement('div');empty.className='folder-library-empty';empty.innerHTML=folders.length?'<strong>No readable songs found yet.</strong>Tap Rescan to grant folder access again, or choose another music folder.':'<strong>No music folders selected.</strong>Choose your Windows music folder and Astralis Nova will index supported audio files without copying them into the app.';trackList.appendChild(empty);return;}
    visible.forEach((track,index)=>{const absoluteIndex=folderTracks.indexOf(track),row=document.createElement('button');row.type='button';row.className='track-row folder-track'+(absoluteIndex===current?' active':'');row.setAttribute('role','listitem');row.innerHTML=`<span class="track-index">${absoluteIndex===current&&!audio.paused?'▶':String(index+1).padStart(2,'0')}</span><span class="track-name">${escapeHtml(track.title)}<small>📁 ${escapeHtml(track.folderName)} / ${escapeHtml(track.path)}</small></span><span class="track-artist">${escapeHtml(track.artist)}</span><span class="track-duration">${track.duration||'—:—'}</span>`;row.addEventListener('click',()=>playTrack(absoluteIndex,true));trackList.appendChild(row);});
  }

  function renderFolderManager(){
    trackList.textContent='';if(trackCount)trackCount.textContent=`${folders.length} MUSIC FOLDER${folders.length===1?'':'S'}`;
    const wrap=document.createElement('div');wrap.className='folder-manager';
    if(!folders.length)wrap.innerHTML='<div class="folder-library-empty"><strong>No folders selected.</strong>Choose a music folder to begin.</div>';
    folders.forEach(folder=>{const row=document.createElement('div');row.className='folder-manager-row';row.innerHTML=`<span>📁 ${escapeHtml(folder.name)}</span><button type="button">Remove</button>`;row.querySelector('button').addEventListener('click',async()=>{await deleteFolder(folder.id);folders=await readFolders();await rescanFolders(false);renderFolderManager();});wrap.appendChild(row);});trackList.appendChild(wrap);
  }

  function releaseUrl(){if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl='';}}
  async function playTrack(index,autoplay=false){
    if(!folderTracks.length)return;index=(index+folderTracks.length)%folderTracks.length;const track=folderTracks[index];
    if(!await ensureReadPermission(track.handle)){if(offlineStatus)offlineStatus.textContent='Folder permission is required. Tap Rescan, then allow access.';return;}
    let file;try{file=await track.handle.getFile();}catch{if(offlineStatus)offlineStatus.textContent='This file is no longer available. Rescan the folder.';return;}
    switching=true;releaseUrl();current=index;objectUrl=URL.createObjectURL(file);audio.loop=true;audio.src=objectUrl;
    title.textContent=track.title;artist.textContent=track.artist;cover.src=DEFAULT_COVER;cover.alt=`${track.title} artwork`;if(timeReadout)timeReadout.textContent='0:00 / 0:00';
    if(favoriteBtn){favoriteBtn.textContent='☆';favoriteBtn.title='Folder-song favorites are planned for cloud sync.';}if(downloadTrackBtn){downloadTrackBtn.textContent='📁 Local folder';downloadTrackBtn.disabled=false;}
    try{if('mediaSession'in navigator)navigator.mediaSession.metadata=new MediaMetadata({title:track.title,artist:track.artist,album:`Astralis Nova • ${track.folderName}`,artwork:[{src:new URL(DEFAULT_COVER,location.href).href,sizes:'512x512',type:'image/jpeg'}]});}catch{}
    render();if(offlineStatus)offlineStatus.textContent=`Playing from ${track.folderName}: ${track.title}`;if(autoplay){try{await audio.play();}catch(err){console.warn('Folder playback did not start',err);}}setTimeout(()=>{switching=false;},250);
  }
  function step(delta){if(!folderTracks.length)return;playTrack(current<0?(delta>0?0:folderTracks.length-1):current+delta,true);}
  function activate(){folderMode=true;window.NovaFolderLibraryActive=true;document.querySelectorAll('.tabs .tab').forEach(tab=>{const on=tab.id==='folderMusicTab';tab.classList.toggle('active',on);tab.setAttribute('aria-selected',String(on));});render();if(offlineStatus)offlineStatus.textContent=`Folder library: ${folderTracks.length} song${folderTracks.length===1?'':'s'} • ${folders.length} folder${folders.length===1?'':'s'}`;}
  function deactivate(){folderMode=false;window.NovaFolderLibraryActive=false;audio.loop=false;current=-1;releaseUrl();if(favoriteBtn)favoriteBtn.removeAttribute('title');}
  function queueRender(){if(!folderMode||renderQueued)return;renderQueued=true;queueMicrotask(()=>{renderQueued=false;if(folderMode)render();});}

  [prevBtn,nextBtn].forEach((btn,i)=>btn?.addEventListener('click',event=>{if(!folderMode||current<0)return;event.preventDefault();event.stopImmediatePropagation();step(i===0?-1:1);},true));
  favoriteBtn?.addEventListener('click',event=>{if(!folderMode||current<0)return;event.preventDefault();event.stopImmediatePropagation();if(offlineStatus)offlineStatus.textContent='Folder-song favorites will be added with library sync.';},true);
  downloadTrackBtn?.addEventListener('click',event=>{if(!folderMode||current<0)return;event.preventDefault();event.stopImmediatePropagation();if(offlineStatus)offlineStatus.textContent='This song already plays directly from your chosen folder.';},true);
  search?.addEventListener('input',()=>{if(folderMode)queueRender();});
  audio.addEventListener('loadedmetadata',()=>{if(!folderMode||current<0)return;folderTracks[current].duration=fmt(audio.duration);render();});
  audio.addEventListener('play',()=>{if(folderMode)queueRender();});audio.addEventListener('pause',()=>{if(folderMode)queueRender();});
  audio.addEventListener('timeupdate',()=>{if(!folderMode||current<0||switching||audio.paused||!Number.isFinite(audio.duration)||audio.duration<1)return;if(audio.duration-audio.currentTime<.18){switching=true;step(1);}});
  const observer=new MutationObserver(()=>{if(folderMode)queueRender();});observer.observe(trackList,{childList:true});

  async function init(){buildUi();try{folders=await readFolders();await rescanFolders(false);}catch(err){console.warn('Folder library unavailable',err);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
