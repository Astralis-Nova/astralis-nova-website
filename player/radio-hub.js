(()=>{
  'use strict';

  const STORAGE_KEY='nova.radioPlaylists.v1';
  const FALLBACK_VERIFIED=[
    {name:'KBACH Classical 89.5 - Phoenix, AZ',homepage:'https://kbaq.org/listen-to-kbach/',url_resolved:'https://kbaq.streamguys1.com/kbaq_mp3_128',_call:'KBAQ',_frequency:89.5,_source:'verified'},
    {name:'KJZZ 91.5 - Phoenix, AZ',homepage:'https://www.kjzz.org/listen',url_resolved:'https://kjzz.streamguys1.com/kjzz_mp3_128',_call:'KJZZ',_frequency:91.5,_source:'verified'}
  ];

  const readImported=()=>{
    try{const rows=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');return Array.isArray(rows)?window.AstralisRadioPlaylist.dedupe(rows).slice(0,250):[];}catch{return [];}
  };
  const saveImported=rows=>localStorage.setItem(STORAGE_KEY,JSON.stringify(window.AstralisRadioPlaylist.dedupe(rows).slice(0,250)));

  async function loadVerified(){
    try{
      const response=await fetch('./radio-stations.json?v=1',{cache:'no-store'});if(!response.ok)throw new Error(String(response.status));
      const payload=await response.json();
      return payload.stations.map(station=>({name:station.name,homepage:station.homepage,url_resolved:station.stream,_call:station.call,_frequency:Number(station.frequency),genre:station.genre,_source:'verified'}));
    }catch(error){console.warn('verified radio list unavailable',error);return FALLBACK_VERIFIED;}
  }

  function install(){
    const controller=window.legacy83RadioController;
    const tuner=document.querySelector('.tuner-module');
    const panel=tuner?.querySelector('.tuner-search-panel');
    const genres=tuner?.querySelector('.tuner-genres');
    if(!controller||!tuner||!panel||!genres||panel.querySelector('.radio-source-bank'))return false;

    let activeBank='verified';
    let verified=[];

    const bank=document.createElement('div');
    bank.className='radio-source-bank';
    bank.setAttribute('role','tablist');
    bank.setAttribute('aria-label','Radio source');
    bank.innerHTML=`
      <button type="button" role="tab" data-radio-bank="verified">✓ VERIFIED</button>
      <button type="button" role="tab" data-radio-bank="community">COMMUNITY</button>
      <button type="button" role="tab" data-radio-bank="playlists">MY PLAYLISTS</button>
      <button type="button" role="tab" data-radio-bank="astralis">✦ ASTRALIS RADIO</button>`;

    const notice=document.createElement('div');
    notice.className='radio-source-notice';
    notice.setAttribute('role','status');
    notice.setAttribute('aria-live','polite');

    const importer=document.createElement('div');
    importer.className='radio-importer';
    importer.hidden=true;
    importer.innerHTML=`
      <label class="radio-import-file">IMPORT .M3U / .PLS<input type="file" accept=".m3u,.m3u8,.pls,audio/x-mpegurl,application/vnd.apple.mpegurl" hidden></label>
      <input class="radio-import-url" type="url" inputmode="url" placeholder="Paste HTTPS stream or playlist URL" aria-label="HTTPS radio stream or playlist URL">
      <button class="radio-import-add" type="button">ADD</button>
      <button class="radio-import-clear" type="button">CLEAR</button>`;

    const services=document.createElement('div');
    services.className='radio-official-services';
    services.innerHTML='<span>OFFICIAL PLAYERS</span><a href="https://www.audacy.com/kmle1079" target="_blank" rel="noopener noreferrer">KMLE / Audacy</a><a href="https://tunein.com/radio/" target="_blank" rel="noopener noreferrer">TuneIn</a><a href="https://www.siriusxm.com/player" target="_blank" rel="noopener noreferrer">SiriusXM</a>';

    panel.insertBefore(bank,genres);
    panel.insertBefore(notice,genres);
    panel.append(importer,services);

    const style=document.createElement('style');
    style.textContent=`
      .radio-source-bank{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px}
      .radio-source-bank button,.radio-importer button,.radio-import-file{min-height:34px;border:1px solid #555;border-radius:2px;background:linear-gradient(#555b5e,#25292b);color:#eef8fc;font:800 .68rem/1.1 system-ui;letter-spacing:.035em;display:flex;align-items:center;justify-content:center;text-align:center;cursor:pointer}
      .radio-source-bank button[aria-selected="true"]{color:#bff6ff;border-color:#78cada;box-shadow:inset 0 0 10px #49dfff55,0 0 7px #49dfff33}
      .radio-source-notice{min-height:20px;color:#bed4dc;font:700 .72rem/1.35 system-ui;letter-spacing:.025em}
      .radio-importer{display:grid;grid-template-columns:auto minmax(150px,1fr) 54px 58px;gap:5px}.radio-importer[hidden]{display:none}
      .radio-importer input[type="url"]{min-width:0;padding:8px;border:1px solid #555;background:#101416;color:#edf8ff;font-size:.76rem}
      .radio-official-services{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:3px;color:#9ba9ae;font:700 .68rem/1.3 system-ui}.radio-official-services a{color:#bfeeff;text-underline-offset:2px}
      body[data-skin="desert"] .radio-source-bank button[aria-selected="true"]{color:#ffe5bb;border-color:#dcaa67;box-shadow:inset 0 0 10px #ffad5355,0 0 7px #ffad5333}
      body[data-skin="classic"] .radio-source-bank button[aria-selected="true"]{color:#d7ffc9;border-color:#8fd878;box-shadow:inset 0 0 10px #7cff5455,0 0 7px #7cff5433}
      @media(max-width:760px){.radio-source-bank{grid-template-columns:1fr 1fr}.radio-source-bank button{min-height:42px}.radio-importer{grid-template-columns:1fr 1fr}.radio-importer input[type="url"]{grid-column:1/-1;grid-row:1}.radio-import-file{min-height:42px}}
    `;
    document.head.appendChild(style);

    function selectBank(name){
      activeBank=name;
      bank.querySelectorAll('[data-radio-bank]').forEach(button=>button.setAttribute('aria-selected',String(button.dataset.radioBank===name)));
      importer.hidden=name!=='playlists';
    }

    async function showVerified(){
      selectBank('verified');
      if(!verified.length)verified=await loadVerified();
      controller.setStations(verified,{statusText:`${verified.length} VERIFIED HTTPS CHANNELS`});
      notice.textContent='Official station streams pinned by Astralis Nova. Best choice for dependable playback.';
    }

    async function showCommunity(){
      selectBank('community');
      notice.textContent='Loading the community directory… availability can change without notice.';
      await controller.loadCommunity('Arizona');
      notice.textContent='Community directory • secure streams only • availability can change.';
    }

    function showPlaylists(message=''){
      selectBank('playlists');
      const rows=readImported();
      controller.setStations(rows,{statusText:rows.length?`${rows.length} IMPORTED CHANNELS`:'IMPORT AN .M3U / .PLS PLAYLIST'});
      notice.textContent=message||(rows.length?'Saved on this device. HTTPS streams only.':'Import a VLC-style station list or add one HTTPS stream URL.');
    }

    async function showAstralis(){
      selectBank('astralis');
      controller.stop();
      controller.showVirtualStation({name:'ASTRALIS NOVA RADIO',_source:'astralis'},'ASTRALIS RADIO • CONNECTING…');
      notice.textContent='Continuous Astralis Nova rotation from our own music library—no outside station can change this signal.';
      try{await window.AstralisNovaPlayer?.playRadio?.();}catch(error){console.warn('Astralis Radio failed',error);controller.showVirtualStation({name:'ASTRALIS NOVA RADIO',_source:'astralis'},'ASTRALIS RADIO • TAP PLAY');}
    }

    bank.addEventListener('click',event=>{
      const button=event.target.closest('[data-radio-bank]');if(!button)return;
      if(button.dataset.radioBank==='verified')showVerified();
      if(button.dataset.radioBank==='community')showCommunity();
      if(button.dataset.radioBank==='playlists')showPlaylists();
      if(button.dataset.radioBank==='astralis')showAstralis();
    });

    importer.querySelector('input[type="file"]').addEventListener('change',async event=>{
      const file=event.currentTarget.files?.[0];if(!file)return;
      if(file.size>1024*1024){showPlaylists('Playlist is too large. Use a file under 1 MB.');event.currentTarget.value='';return;}
      const result=window.AstralisRadioPlaylist.parsePlaylist(await file.text(),{sourceName:file.name});
      if(result.error){showPlaylists(result.error);event.currentTarget.value='';return;}
      const rows=window.AstralisRadioPlaylist.dedupe([...readImported(),...result.stations]);saveImported(rows);
      showPlaylists(`Imported ${result.stations.length} secure channel${result.stations.length===1?'':'s'} from ${file.name}.`);
      event.currentTarget.value='';
    });

    importer.querySelector('.radio-import-add').addEventListener('click',async()=>{
      const input=importer.querySelector('.radio-import-url');
      const url=window.AstralisRadioPlaylist.secureUrl(input.value);
      if(!url){showPlaylists('Use a complete HTTPS address. Insecure HTTP streams are blocked on this website.');return;}
      if(/\.(m3u|pls)(?:$|[?#])/i.test(url)){
        try{
          const response=await fetch(url);if(!response.ok)throw new Error(String(response.status));
          const result=window.AstralisRadioPlaylist.parsePlaylist(await response.text(),{sourceName:new URL(url).hostname});
          if(result.error)throw new Error(result.error);
          const rows=window.AstralisRadioPlaylist.dedupe([...readImported(),...result.stations]);saveImported(rows);input.value='';showPlaylists(`Imported ${result.stations.length} channels from the playlist URL.`);return;
        }catch(error){console.warn('playlist URL import failed',error);showPlaylists('That playlist server blocked browser import. Download its .m3u file and use IMPORT instead.');return;}
      }
      const name=new URL(url).hostname.replace(/^www\./,'');
      const rows=window.AstralisRadioPlaylist.dedupe([...readImported(),{name,url_resolved:url,_frequency:null,_source:'playlist',genre:'My Playlist',playlistSource:'Direct URL'}]);
      saveImported(rows);input.value='';showPlaylists('Added one secure stream. Select it below to test playback.');
    });

    importer.querySelector('.radio-import-clear').addEventListener('click',()=>{localStorage.removeItem(STORAGE_KEY);showPlaylists('Imported channels cleared from this device.');});

    window.addEventListener('legacy83-radio-state',event=>{
      if(event.detail?.station?._source!=='astralis')return;
      controller.showVirtualStation(event.detail.station,event.detail.playing?'ASTRALIS RADIO • PLAYING • RACK SYNC':'ASTRALIS RADIO • PAUSED');
    });

    showVerified();
    return true;
  }

  if(!install()){
    const ready=()=>{if(install())window.removeEventListener('legacy83-radio-ready',ready);};
    window.addEventListener('legacy83-radio-ready',ready);
    const timer=setInterval(()=>{if(install())clearInterval(timer);},150);
    setTimeout(()=>clearInterval(timer),8000);
  }
})();
