(() => {
  'use strict';

  const API_SERVERS=['https://de1.api.radio-browser.info','https://de2.api.radio-browser.info','https://nl1.api.radio-browser.info'];
  const GENRES={Arizona:{state:'Arizona'},Country:{tag:'country'},Pop:{tag:'pop'},'80s':{tag:'80s'}};
  const FREQUENCY_ALIASES={
    '107.9':{name:'KMLE',countrycode:'US',state:'Arizona',frequency:107.9,label:'KMLE Country 107.9'}
  };

  function installLegacy83Radio(){
    const reel=document.querySelector('.reel-module');
    if(!reel||document.querySelector('.tuner-module'))return;

    const module=document.createElement('article');
    module.className='hifi-module tuner-module tuner-power-module is-powered';
    module.innerHTML=`
      <div class="hifi-label"><span>AM / FM STEREO RECEIVER + POWER METERS</span><span id="tunerStatus">LIVE RADIO READY</span></div>
      <div class="tuner-face">
        <div class="tuner-brand"><strong>ASTRALIS NOVA</strong><span>AN-83T • LIVE INTERNET TUNER</span></div>
        <div class="tuner-meter-layout">
          <div class="tuner-glass">
            <div class="tuner-band-scale tuner-fm-scale"><small>FM</small><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>
            <div class="tuner-band-scale tuner-am-scale"><small>AM</small><span>530</span><span>700</span><span>900</span><span>1100</span><span>1400</span><span>1700</span></div>
            <div class="tuner-ticks"></div><span class="tuner-needle"></span>
            <div class="tuner-readout"><b id="tunerFrequency">107.9</b><small id="tunerUnits">MHz</small><strong id="tunerStation">SEARCH OR SELECT A STATION</strong></div>
            <div class="tuner-lamps"><span>LIVE</span><span>TUNED</span></div>
          </div>
          <div class="receiver-meter-slot" aria-label="Stereo power meters"></div>
        </div>
        <div class="tuner-controls">
          <button type="button" class="tuner-power" aria-pressed="true"><b>●</b><small>POWER</small></button>
          <div class="tuner-band-buttons"><button type="button" data-band="FM" class="active">FM</button><button type="button" data-band="AM">AM</button></div>
          <button type="button" class="tuner-scan" data-scan="down">◀</button>
          <label class="tuner-slider-wrap"><span>TUNING</span><input id="tunerSlider" type="range" min="0" max="79" step="1" value="0"></label>
          <button type="button" class="tuner-scan" data-scan="up">▶</button>
          <div class="tuner-signal"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="tuner-browser">
          <div class="tuner-knob-wrap">
            <button type="button" class="tuner-step" data-step="-1">◀ PREV</button>
            <button type="button" class="tuner-knob" aria-label="Drag or tap to tune"><span></span></button>
            <button type="button" class="tuner-step" data-step="1">NEXT ▶</button>
            <small>DRAG KNOB OR USE PREV / NEXT</small>
          </div>
          <div class="tuner-search-panel">
            <div class="tuner-search-row"><input id="radioSearch" type="search" placeholder="Search 107.9, KMLE, station name, city or genre"><button id="radioSearchBtn" type="button">SEARCH</button></div>
            <div class="tuner-genres">${Object.keys(GENRES).map(name=>`<button type="button" data-genre="${name}">${name}</button>`).join('')}</div>
            <select id="radioStationSelect" aria-label="Live radio stations"><option>Load a station list…</option></select>
          </div>
        </div>
        <div class="tuner-presets"><span>PRESETS</span>${[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>`<button type="button" data-preset="${n-1}">${n}</button>`).join('')}</div>
      </div>`;
    reel.insertAdjacentElement('afterend',module);

    const oldMeter=document.querySelector('.meter-module');
    const meterBank=oldMeter?.querySelector('.meter-bank');
    if(meterBank){
      const slot=module.querySelector('.receiver-meter-slot');
      const title=document.createElement('div');
      title.className='receiver-meter-title';
      title.innerHTML='<span>POWER LEVEL</span><small>L / R • WATTS</small>';
      slot.append(title,meterBank);oldMeter.remove();
    }

    const style=document.createElement('style');
    style.textContent=`
      .legacy83-grid>.tuner-module{grid-column:1/-1!important;width:100%}.tuner-module{min-height:455px;overflow:hidden}.tuner-face{padding:12px 16px 14px;background:linear-gradient(180deg,#b9b8b2,#8f908c 4%,#c9c7c0 11%,#777875 100%)}
      .tuner-brand{display:flex;justify-content:space-between;color:#24282a;font-size:.46rem;letter-spacing:.13em;margin-bottom:8px}.tuner-brand strong{font-size:.62rem}.tuner-meter-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.9fr);gap:12px}.tuner-glass{position:relative;height:128px;border:4px solid #303336;border-radius:3px;background:linear-gradient(#07151d,#031017 58%,#061d28);box-shadow:inset 0 0 22px #000,0 2px 5px #0008;color:#bdefff;overflow:hidden}.tuner-band-scale{position:absolute;left:18px;right:18px;display:grid;grid-template-columns:32px repeat(6,1fr);font:700 .48rem/1 system-ui;letter-spacing:.08em;text-shadow:0 0 7px #6ee7ff}.tuner-band-scale small{color:#f2cb74}.tuner-fm-scale{top:13px}.tuner-am-scale{top:42px;color:#86ccdc}.tuner-ticks{position:absolute;left:53px;right:20px;top:29px;height:34px;background:repeating-linear-gradient(90deg,#8fe8ff 0 1px,transparent 1px 3.4%);opacity:.48}.tuner-needle{position:absolute;top:7px;bottom:7px;width:2px;left:0;background:#ff6c59;box-shadow:0 0 7px #ff3d2f;transition:left .18s}.tuner-readout{position:absolute;left:17px;bottom:11px;display:flex;align-items:baseline;gap:5px;color:#d9f7ff;text-shadow:0 0 8px #45dfff}.tuner-readout b{font:700 1.05rem ui-monospace}.tuner-readout small{font-size:.43rem}.tuner-readout strong{margin-left:12px;font-size:.48rem;letter-spacing:.1em;color:#f3d28a;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tuner-lamps{position:absolute;right:14px;bottom:9px;display:flex;gap:7px;font-size:.36rem}.tuner-lamps span{padding:3px 5px;border:1px solid #315a47;color:#aaffc6;background:#07110c;box-shadow:inset 0 0 7px #29e27055}.receiver-meter-slot{min-width:0;border:3px solid #33363a;background:#080a0b;padding:7px 8px}.receiver-meter-title{display:flex;justify-content:space-between;color:#d8d0b5;font-size:.4rem;letter-spacing:.12em}.receiver-meter-slot .meter-bank{height:116px;margin:5px 0 0;padding:8px 8px 24px}.tuner-controls{display:grid;grid-template-columns:54px 72px 42px minmax(160px,1fr) 42px 78px;gap:9px;align-items:center;margin-top:10px}.tuner-controls button,.tuner-step,.tuner-presets button,.tuner-genres button,.tuner-search-row button{border:1px solid #35383a;border-radius:2px;background:linear-gradient(#70716f,#333634);color:#eee;box-shadow:inset 0 1px #fff4,0 2px 3px #0008;min-height:30px;font-weight:800}.tuner-band-buttons{display:grid;grid-template-columns:1fr 1fr;gap:3px}.tuner-band-buttons .active,.tuner-genres .active{color:#d9f7ff;box-shadow:inset 0 0 8px #55cfff88}.tuner-slider-wrap{display:grid;gap:3px;color:#202426;font-size:.36rem;font-weight:900;text-align:center}.tuner-slider-wrap input{width:100%;height:28px;touch-action:pan-x}.tuner-signal{height:28px;display:flex;align-items:end;gap:3px;padding:3px 5px;background:#151918}.tuner-signal span{width:10px;background:#70e996}.tuner-signal span:nth-child(1){height:20%}.tuner-signal span:nth-child(2){height:35%}.tuner-signal span:nth-child(3){height:52%}.tuner-signal span:nth-child(4){height:72%}.tuner-signal span:nth-child(5){height:95%}.tuner-browser{display:grid;grid-template-columns:150px 1fr;gap:12px;margin-top:10px;padding:10px;border:1px solid #575b5d;background:linear-gradient(#303437,#171a1c)}.tuner-knob-wrap{display:grid;grid-template-columns:1fr 86px 1fr;align-items:center;gap:5px;text-align:center;color:#d6d0c6;font-size:.34rem}.tuner-knob-wrap small{grid-column:1/-1}.tuner-knob{position:relative;width:82px;height:82px;border-radius:50%!important;border:2px solid #4d4f4e!important;background:repeating-conic-gradient(#4f5150 0 3deg,#c4c3bd 3.5deg 7deg)!important;box-shadow:inset 0 0 0 11px #a6a5a0,inset 0 0 10px #0008,0 4px 5px #0008!important;touch-action:none;cursor:grab}.tuner-knob:active{cursor:grabbing}.tuner-knob span{position:absolute;left:39px;top:6px;width:3px;height:22px;background:#202220;transform-origin:1px 34px}.tuner-step{padding:4px;font-size:.34rem}.tuner-search-panel{display:grid;gap:7px}.tuner-search-row{display:grid;grid-template-columns:1fr 76px;gap:6px}.tuner-search-row input,#radioStationSelect{min-width:0;padding:8px;border:1px solid #555;background:#101416;color:#edf8ff}.tuner-genres{display:flex;gap:5px;flex-wrap:wrap}.tuner-genres button{min-height:26px;padding:3px 9px;font-size:.38rem}.tuner-presets{display:flex;gap:4px;align-items:center;margin-top:8px;color:#262a2b;font-size:.34rem;font-weight:900;flex-wrap:wrap}.tuner-presets button{min-width:30px;min-height:26px;padding:2px 5px}.tuner-module:not(.is-powered) .tuner-glass,.tuner-module:not(.is-powered) .receiver-meter-slot{filter:brightness(.25)}
      @media(max-width:760px){.tuner-meter-layout{grid-template-columns:1fr}.tuner-module{min-height:595px}.tuner-browser{grid-template-columns:1fr}.tuner-knob-wrap{grid-template-columns:70px 92px 70px;justify-content:center}.tuner-knob{width:88px;height:88px}.tuner-knob span{left:42px;transform-origin:1px 37px}}
      @media(max-width:620px){.tuner-face{padding:9px 8px}.tuner-controls{grid-template-columns:44px 58px 38px minmax(110px,1fr) 38px 50px;gap:4px}.tuner-readout strong{max-width:125px}.tuner-browser{padding:8px}.tuner-knob-wrap{grid-template-columns:64px 86px 64px}.tuner-knob{width:82px;height:82px}.tuner-knob span{left:39px;transform-origin:1px 34px}.tuner-step{min-height:42px;font-size:.32rem}.tuner-search-row{grid-template-columns:1fr 66px}.tuner-search-row input{font-size:.68rem}.tuner-genres button{font-size:.32rem;padding:2px 6px}}
    `;
    document.head.appendChild(style);

    const status=module.querySelector('#tunerStatus'),stationName=module.querySelector('#tunerStation'),freqEl=module.querySelector('#tunerFrequency'),unitsEl=module.querySelector('#tunerUnits'),slider=module.querySelector('#tunerSlider'),needle=module.querySelector('.tuner-needle'),power=module.querySelector('.tuner-power'),searchInput=module.querySelector('#radioSearch'),searchBtn=module.querySelector('#radioSearchBtn'),select=module.querySelector('#radioStationSelect'),knob=module.querySelector('.tuner-knob'),knobMarker=knob.querySelector('span');
    const audio=document.getElementById('audio');
    let powered=true,band='FM',stations=[],index=0,dragStartX=null,dragStartIndex=0;

    async function apiSearch(params={}){
      const query=new URLSearchParams({hidebroken:'true',order:'clickcount',reverse:'true',limit:'80',...params});
      for(const server of API_SERVERS){
        try{const r=await fetch(`${server}/json/stations/search?${query}`,{headers:{Accept:'application/json'}});if(!r.ok)continue;const rows=await r.json();const good=rows.filter(s=>s.name&&(s.url_resolved||s.url));if(good.length)return good;}catch(e){console.warn('radio search failed',server,e);}
      }
      return [];
    }

    function stationFrequency(i){const s=stations[i];if(Number.isFinite(s?._frequency))return s._frequency;const lim=band==='FM'?{min:88,max:108}:{min:530,max:1700};if(stations.length<2)return lim.min;return lim.min+(i/(stations.length-1))*(lim.max-lim.min);}
    function paintStation(i,{play=false}={}){
      if(!stations.length){stationName.textContent='NO STATIONS FOUND';return;}
      index=Math.max(0,Math.min(stations.length-1,i));
      const s=stations[index],f=stationFrequency(index),ratio=band==='FM'?Math.max(0,Math.min(1,(f-88)/20)):index/Math.max(1,stations.length-1);
      select.selectedIndex=index;slider.max=String(Math.max(0,stations.length-1));slider.value=String(index);
      freqEl.textContent=band==='FM'?f.toFixed(1):String(Math.round(f));unitsEl.textContent=band==='FM'?'MHz':'kHz';
      needle.style.left=`${(ratio*100).toFixed(1)}%`;stationName.textContent=(s._label||s.name).trim();knobMarker.style.transform=`rotate(${(ratio*240-120).toFixed(1)}deg)`;
      if(play)playStation(s);
    }
    async function playStation(s){
      if(!powered||!audio)return;
      const url=s?.url_resolved||s?.url;if(!url){status.textContent='STATION UNAVAILABLE';return;}
      try{
        audio.pause();audio.src=url;audio.removeAttribute('crossorigin');audio.load();
        document.getElementById('trackTitle').textContent=(s._label||s.name)?.trim()||'Live Radio';
        document.getElementById('trackArtist').textContent='Live Radio • Legacy 83 Tuner';
        status.textContent='CONNECTING…';
        await audio.play();
        status.textContent='LIVE • PLAYING • RACK ACTIVE';
        module.classList.add('is-tuned');
      }catch(e){console.warn('stream failed',e);status.textContent='STREAM ERROR • TRY NEXT';}
    }
    function loadSelect(){
      select.innerHTML='';stations.forEach((s,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=`${i+1}. ${s._label||s.name}${s.state?` — ${s.state}`:''}`;select.appendChild(o);});
      slider.max=String(Math.max(0,stations.length-1));if(stations.length)paintStation(0);
    }
    async function loadGenre(name){module.querySelectorAll('[data-genre]').forEach(b=>b.classList.toggle('active',b.dataset.genre===name));status.textContent=`LOADING ${name.toUpperCase()}…`;stations=await apiSearch({countrycode:'US',...(GENRES[name]||{})});loadSelect();status.textContent=stations.length?`${stations.length} LIVE STATIONS`:'NO STATIONS FOUND';}
    async function doSearch(){
      const raw=searchInput.value.trim();if(!raw)return loadGenre('Arizona');status.textContent='SEARCHING…';
      const key=raw.replace(/\s*fm$/i,'').trim();
      const alias=FREQUENCY_ALIASES[key];
      if(alias){
        const matches=await apiSearch({name:alias.name,countrycode:alias.countrycode,state:alias.state});
        stations=matches.map((s,i)=>({...s,_frequency:i===0?alias.frequency:undefined,_label:i===0?alias.label:undefined}));
        loadSelect();
        if(stations.length){paintStation(0,{play:false});status.textContent=`FOUND ${alias.label.toUpperCase()}`;}else status.textContent=`${alias.label.toUpperCase()} NOT IN DIRECTORY`;
        return;
      }
      const byName=await apiSearch({name:raw});const byTag=await apiSearch({tag:raw});
      stations=[...byName,...byTag].filter((s,i,a)=>a.findIndex(x=>x.stationuuid===s.stationuuid)===i);loadSelect();status.textContent=stations.length?`${stations.length} MATCHES`:'NO MATCHES';
    }
    function step(delta,play=true){if(!stations.length)return;paintStation(Math.max(0,Math.min(stations.length-1,index+delta)),{play});}

    module.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>step(Number(b.dataset.step),true)));
    module.querySelectorAll('[data-scan]').forEach(b=>b.addEventListener('click',()=>step(b.dataset.scan==='up'?1:-1,true)));
    slider.addEventListener('input',()=>paintStation(Number(slider.value)));slider.addEventListener('change',()=>paintStation(Number(slider.value),{play:true}));
    select.addEventListener('change',()=>paintStation(Number(select.value),{play:true}));
    knob.addEventListener('click',()=>step(1,true));
    knob.addEventListener('pointerdown',e=>{dragStartX=e.clientX;dragStartIndex=index;knob.setPointerCapture(e.pointerId);});
    knob.addEventListener('pointermove',e=>{if(dragStartX===null||!stations.length)return;const delta=Math.round((e.clientX-dragStartX)/18);paintStation(Math.max(0,Math.min(stations.length-1,dragStartIndex+delta)));});
    knob.addEventListener('pointerup',e=>{if(dragStartX===null)return;dragStartX=null;knob.releasePointerCapture?.(e.pointerId);paintStation(index,{play:true});});
    knob.addEventListener('wheel',e=>{e.preventDefault();step(e.deltaY>0?1:-1,true);},{passive:false});
    searchBtn.addEventListener('click',doSearch);searchInput.addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});
    module.querySelectorAll('[data-genre]').forEach(b=>b.addEventListener('click',()=>loadGenre(b.dataset.genre)));
    module.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{if(!stations.length)return;paintStation(Math.min(Number(b.dataset.preset),stations.length-1),{play:true});}));
    module.querySelectorAll('[data-band]').forEach(b=>b.addEventListener('click',()=>{band=b.dataset.band;module.querySelectorAll('[data-band]').forEach(x=>x.classList.toggle('active',x===b));paintStation(index);}));
    power.addEventListener('click',()=>{powered=!powered;module.classList.toggle('is-powered',powered);power.setAttribute('aria-pressed',String(powered));if(!powered)audio?.pause();status.textContent=powered?'LIVE RADIO READY':'POWER OFF';});
    audio?.addEventListener('playing',()=>{if(module.classList.contains('is-powered'))status.textContent='LIVE • PLAYING • RACK ACTIVE';});
    audio?.addEventListener('waiting',()=>{if(module.classList.contains('is-powered'))status.textContent='BUFFERING…';});

    loadGenre('Arizona');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLegacy83Radio,{once:true});else installLegacy83Radio();
})();