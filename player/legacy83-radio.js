(() => {
  'use strict';

  const API_SERVERS=['https://de1.api.radio-browser.info','https://de2.api.radio-browser.info','https://nl1.api.radio-browser.info'];
  const GENRES={Arizona:{state:'Arizona'},Country:{tag:'country'},Pop:{tag:'pop'},'80s':{tag:'80s'}};

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
          <div class="tuner-glass" aria-label="AM FM tuning scale">
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
          <label class="tuner-slider-wrap"><span>TUNING</span><input id="tunerSlider" type="range" min="88" max="108" step="0.1" value="107.9"></label>
          <button type="button" class="tuner-scan" data-scan="up">▶</button>
          <div class="tuner-signal"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="tuner-browser">
          <div class="tuner-knob-wrap"><button type="button" class="tuner-knob" aria-label="Next station"><span></span></button><small>STATION<br>SELECT</small></div>
          <div class="tuner-search-panel">
            <div class="tuner-search-row"><input id="radioSearch" type="search" placeholder="Search 107.9, station name, city or genre"><button id="radioSearchBtn" type="button">SEARCH</button></div>
            <div class="tuner-genres">${Object.keys(GENRES).map(name=>`<button type="button" data-genre="${name}">${name}</button>`).join('')}</div>
            <select id="radioStationSelect" aria-label="Live radio stations"><option>Load a station list…</option></select>
          </div>
        </div>
        <div class="tuner-presets"><span>PRESETS</span>${[1,2,3,4,5,6,7,8,9,10,11,12].map(n=>`<button type="button" data-preset="${n-1}">${n}</button>`).join('')}</div>
      </div>`;
    reel.insertAdjacentElement('afterend',module);

    const oldMeter=document.querySelector('.meter-module');
    const meterBank=oldMeter?.querySelector('.meter-bank');
    if(meterBank){const slot=module.querySelector('.receiver-meter-slot');const title=document.createElement('div');title.className='receiver-meter-title';title.innerHTML='<span>POWER LEVEL</span><small>L / R • WATTS</small>';slot.append(title,meterBank);oldMeter.remove();}

    const style=document.createElement('style');
    style.textContent=`
      .legacy83-grid>.tuner-module{grid-column:1/-1!important;width:100%;min-width:0}.tuner-module{min-height:430px;overflow:hidden}.tuner-face{position:relative;min-height:392px;padding:12px 16px 14px;background:linear-gradient(180deg,#b9b8b2,#8f908c 4%,#c9c7c0 11%,#777875 100%);box-shadow:inset 0 1px #fff9,inset 0 -8px 18px #0005}.tuner-brand{display:flex;justify-content:space-between;color:#24282a;font-size:.46rem;letter-spacing:.13em;margin-bottom:8px}.tuner-brand strong{font-size:.62rem}.tuner-meter-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.9fr);gap:12px}.tuner-glass{position:relative;height:128px;border:4px solid #303336;border-radius:3px;background:linear-gradient(#07151d,#031017 58%,#061d28);box-shadow:inset 0 0 22px #000,0 2px 5px #0008;color:#bdefff;overflow:hidden}.tuner-band-scale{position:absolute;left:18px;right:18px;display:grid;grid-template-columns:32px repeat(6,1fr);font:700 .48rem/1 system-ui;letter-spacing:.08em;text-shadow:0 0 7px #6ee7ff}.tuner-band-scale small{color:#f2cb74}.tuner-fm-scale{top:13px}.tuner-am-scale{top:42px;color:#86ccdc}.tuner-ticks{position:absolute;left:53px;right:20px;top:29px;height:34px;background:repeating-linear-gradient(90deg,#8fe8ff 0 1px,transparent 1px 3.4%);opacity:.48}.tuner-needle{position:absolute;top:7px;bottom:7px;width:2px;left:99.5%;background:#ff6c59;box-shadow:0 0 7px #ff3d2f;transition:left .2s}.tuner-readout{position:absolute;left:17px;bottom:11px;display:flex;align-items:baseline;gap:5px;color:#d9f7ff;text-shadow:0 0 8px #45dfff}.tuner-readout b{font:700 1.05rem ui-monospace}.tuner-readout small{font-size:.43rem}.tuner-readout strong{margin-left:12px;font-size:.48rem;letter-spacing:.1em;color:#f3d28a;max-width:250px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tuner-lamps{position:absolute;right:14px;bottom:9px;display:flex;gap:7px;font-size:.36rem}.tuner-lamps span{padding:3px 5px;border:1px solid #315a47;color:#aaffc6;background:#07110c;box-shadow:inset 0 0 7px #29e27055}.receiver-meter-slot{min-width:0;border:3px solid #33363a;background:#080a0b;padding:7px 8px 8px}.receiver-meter-title{display:flex;justify-content:space-between;color:#d8d0b5;font-size:.4rem;letter-spacing:.12em;margin-bottom:5px}.receiver-meter-slot .meter-bank{height:116px;margin:0;gap:7px;padding:8px 8px 24px}.tuner-controls{display:grid;grid-template-columns:54px 72px 34px minmax(130px,1fr) 34px 78px;gap:9px;align-items:center;margin-top:10px}.tuner-controls button,.tuner-presets button,.tuner-genres button,.tuner-search-row button{border:1px solid #35383a;border-radius:2px;background:linear-gradient(#70716f,#333634);color:#eee;box-shadow:inset 0 1px #fff4,0 2px 3px #0008;min-height:28px;font-weight:800}.tuner-power{display:grid;place-items:center}.tuner-power b{color:#72ff86}.tuner-band-buttons{display:grid;grid-template-columns:1fr 1fr;gap:3px}.tuner-band-buttons .active,.tuner-genres .active{color:#d9f7ff;box-shadow:inset 0 0 8px #55cfff88}.tuner-slider-wrap{display:grid;gap:3px;color:#202426;font-size:.34rem;font-weight:900;text-align:center}.tuner-signal{height:28px;display:flex;align-items:end;gap:3px;padding:3px 5px;background:#151918}.tuner-signal span{width:10px;background:#70e996}.tuner-signal span:nth-child(1){height:20%}.tuner-signal span:nth-child(2){height:35%}.tuner-signal span:nth-child(3){height:52%}.tuner-signal span:nth-child(4){height:72%}.tuner-signal span:nth-child(5){height:95%}.tuner-browser{display:grid;grid-template-columns:95px 1fr;gap:12px;margin-top:10px;padding:10px;border:1px solid #575b5d;background:linear-gradient(#303437,#171a1c)}.tuner-knob-wrap{text-align:center;color:#d6d0c6;font-size:.34rem;letter-spacing:.08em}.tuner-knob{position:relative;width:70px;height:70px;border-radius:50%!important;border:2px solid #4d4f4e!important;background:repeating-conic-gradient(#4f5150 0 3deg,#c4c3bd 3.5deg 7deg)!important;box-shadow:inset 0 0 0 10px #a6a5a0,inset 0 0 10px #0008,0 4px 5px #0008!important}.tuner-knob span{position:absolute;left:34px;top:5px;width:3px;height:20px;background:#202220;transform-origin:1px 30px}.tuner-search-panel{display:grid;gap:7px}.tuner-search-row{display:grid;grid-template-columns:1fr 76px;gap:6px}.tuner-search-row input,#radioStationSelect{min-width:0;padding:7px 8px;border:1px solid #555;background:#101416;color:#edf8ff}.tuner-genres{display:flex;gap:5px;flex-wrap:wrap}.tuner-genres button{min-height:24px;padding:3px 9px;font-size:.38rem}.tuner-presets{display:flex;gap:4px;align-items:center;margin-top:8px;color:#262a2b;font-size:.34rem;font-weight:900;flex-wrap:wrap}.tuner-presets button{min-width:28px;min-height:24px;padding:2px 5px}.tuner-module:not(.is-powered) .tuner-glass,.tuner-module:not(.is-powered) .receiver-meter-slot{filter:brightness(.25)}
      @media(max-width:760px){.tuner-meter-layout{grid-template-columns:1fr}.tuner-module{min-height:555px}.tuner-browser{grid-template-columns:78px 1fr}.tuner-knob{width:60px;height:60px}.tuner-knob span{left:29px;transform-origin:1px 25px}}
      @media(max-width:620px){.tuner-face{padding:9px 8px}.tuner-controls{grid-template-columns:44px 62px 28px minmax(84px,1fr) 28px 54px;gap:4px}.tuner-readout strong{max-width:125px}.tuner-browser{grid-template-columns:64px 1fr;padding:7px}.tuner-knob{width:50px;height:50px}.tuner-knob span{left:24px;height:16px;transform-origin:1px 21px}.tuner-search-row{grid-template-columns:1fr 62px}.tuner-search-row input{font-size:.68rem}.tuner-genres button{font-size:.31rem;padding:2px 6px}}
    `;
    document.head.appendChild(style);

    const status=module.querySelector('#tunerStatus'),stationName=module.querySelector('#tunerStation'),freqEl=module.querySelector('#tunerFrequency'),unitsEl=module.querySelector('#tunerUnits'),slider=module.querySelector('#tunerSlider'),needle=module.querySelector('.tuner-needle'),power=module.querySelector('.tuner-power'),searchInput=module.querySelector('#radioSearch'),searchBtn=module.querySelector('#radioSearchBtn'),select=module.querySelector('#radioStationSelect'),knob=module.querySelector('.tuner-knob'),knobMarker=knob.querySelector('span');
    const musicAudio=document.getElementById('audio');const radioAudio=new Audio();radioAudio.preload='none';
    let powered=true,band='FM',stations=[],index=0,knobAngle=-120;

    async function apiSearch(params={}){
      const query=new URLSearchParams({hidebroken:'true',order:'clickcount',reverse:'true',limit:'80',...params});
      for(const server of API_SERVERS){try{const r=await fetch(`${server}/json/stations/search?${query}`,{headers:{Accept:'application/json'}});if(!r.ok)continue;const rows=await r.json();const good=rows.filter(s=>s.name&&(s.url_resolved||s.url));if(good.length)return good;}catch(e){console.warn('radio search failed',server,e);}}
      return [];
    }

    function stationFrequency(i){const lim=band==='FM'?{min:88,max:108}:{min:530,max:1700};if(stations.length<2)return lim.min;return lim.min+(i/(stations.length-1))*(lim.max-lim.min);}
    function paintStation(i,{play=false}={}){if(!stations.length){stationName.textContent='NO STATIONS FOUND';return;}index=(i+stations.length)%stations.length;const s=stations[index];select.selectedIndex=index;const f=stationFrequency(index);slider.value=String(f);freqEl.textContent=band==='FM'?f.toFixed(1):String(Math.round(f));unitsEl.textContent=band==='FM'?'MHz':'kHz';needle.style.left=`${(index/Math.max(1,stations.length-1)*100).toFixed(1)}%`;stationName.textContent=s.name.trim();knobAngle=((index/Math.max(1,stations.length-1))*240)-120;knobMarker.style.transform=`rotate(${knobAngle}deg)`;if(play)playStation(s);}
    async function playStation(s){if(!powered)return;const url=s?.url_resolved||s?.url;if(!url){status.textContent='STATION UNAVAILABLE';return;}try{musicAudio?.pause();radioAudio.pause();radioAudio.src=url;radioAudio.load();status.textContent='CONNECTING…';await radioAudio.play();status.textContent='LIVE • PLAYING';}catch(e){status.textContent='STREAM ERROR • TRY NEXT';}}
    function loadSelect(){select.innerHTML='';stations.forEach((s,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=`${i+1}. ${s.name}${s.state?` — ${s.state}`:''}`;select.appendChild(o);});if(stations.length)paintStation(0,{play:false});}
    async function loadGenre(name){module.querySelectorAll('[data-genre]').forEach(b=>b.classList.toggle('active',b.dataset.genre===name));status.textContent=`LOADING ${name.toUpperCase()}…`;const g=GENRES[name]||{};stations=await apiSearch({countrycode:'US',...g});loadSelect();status.textContent=stations.length?`${stations.length} LIVE STATIONS`:'NO STATIONS FOUND';}
    async function doSearch(){const q=searchInput.value.trim();if(!q)return loadGenre('Arizona');status.textContent='SEARCHING…';const numeric=/^\d{2,4}(?:\.\d)?$/.test(q);stations=await apiSearch(numeric?{name:q}:{name:q});if(stations.length<5)stations=[...stations,...await apiSearch({tag:q})].filter((s,i,a)=>a.findIndex(x=>x.stationuuid===s.stationuuid)===i);loadSelect();status.textContent=stations.length?`${stations.length} MATCHES`:'NO MATCHES';}
    function step(dir){if(!stations.length)return;paintStation(index+dir,{play:true});}
    function setBand(next){band=next;module.querySelectorAll('[data-band]').forEach(b=>b.classList.toggle('active',b.dataset.band===band));slider.min=band==='FM'?'88':'530';slider.max=band==='FM'?'108':'1700';slider.step=band==='FM'?'.1':'10';paintStation(index,{play:false});}

    searchBtn.addEventListener('click',doSearch);searchInput.addEventListener('keydown',e=>{if(e.key==='Enter')doSearch();});module.querySelectorAll('[data-genre]').forEach(b=>b.addEventListener('click',()=>loadGenre(b.dataset.genre)));select.addEventListener('change',()=>paintStation(Number(select.value),{play:true}));knob.addEventListener('click',()=>step(1));knob.addEventListener('wheel',e=>{e.preventDefault();step(e.deltaY>0?1:-1);},{passive:false});module.querySelectorAll('[data-scan]').forEach(b=>b.addEventListener('click',()=>step(b.dataset.scan==='up'?1:-1)));slider.addEventListener('change',()=>{if(!stations.length)return;const pct=(Number(slider.value)-Number(slider.min))/(Number(slider.max)-Number(slider.min));paintStation(Math.round(pct*(stations.length-1)),{play:true});});module.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{if(stations.length)paintStation(Number(b.dataset.preset)%stations.length,{play:true});}));module.querySelectorAll('[data-band]').forEach(b=>b.addEventListener('click',()=>setBand(b.dataset.band)));power.addEventListener('click',()=>{powered=!powered;module.classList.toggle('is-powered',powered);power.setAttribute('aria-pressed',String(powered));if(!powered){radioAudio.pause();status.textContent='POWER OFF';}else status.textContent='LIVE RADIO READY';});radioAudio.addEventListener('playing',()=>status.textContent='LIVE • PLAYING');radioAudio.addEventListener('waiting',()=>status.textContent='BUFFERING…');radioAudio.addEventListener('error',()=>status.textContent='STREAM ERROR • TRY NEXT');

    setBand('FM');loadGenre('Arizona');
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLegacy83Radio,{once:true});else installLegacy83Radio();
})();