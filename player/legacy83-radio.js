(() => {
  'use strict';

  const API_SERVERS = [
    'https://de1.api.radio-browser.info',
    'https://de2.api.radio-browser.info',
    'https://nl1.api.radio-browser.info'
  ];

  function installLegacy83Radio(){
    const rack=document.querySelector('.legacy83-grid');
    const reel=document.querySelector('.reel-module');
    if(!rack||!reel||document.querySelector('.tuner-module'))return;

    const fallback={
      FM:[
        {freq:88.3,name:'LIVE RADIO 1'},{freq:91.7,name:'LIVE RADIO 2'},{freq:94.5,name:'LIVE RADIO 3'},
        {freq:97.9,name:'LIVE RADIO 4'},{freq:101.3,name:'LIVE RADIO 5'},{freq:104.7,name:'LIVE RADIO 6'}
      ],
      AM:[
        {freq:650,name:'LIVE AM 1'},{freq:880,name:'LIVE AM 2'},{freq:1230,name:'LIVE AM 3'},
        {freq:1490,name:'LIVE AM 4'},{freq:1600,name:'LIVE AM 5'},{freq:1700,name:'LIVE AM 6'}
      ]
    };
    const stations={FM:[...fallback.FM],AM:[...fallback.AM]};

    const module=document.createElement('article');
    module.className='hifi-module tuner-module tuner-power-module is-powered';
    module.innerHTML=`
      <div class="hifi-label"><span>AM / FM STEREO RECEIVER + POWER METERS</span><span id="tunerStatus">LOADING LIVE RADIO</span></div>
      <div class="tuner-face">
        <div class="tuner-brand"><strong>ASTRALIS NOVA</strong><span>AN-83T • LIVE INTERNET TUNER</span></div>
        <div class="tuner-meter-layout">
          <div class="tuner-glass" aria-label="AM FM tuning scale">
            <div class="tuner-band-scale tuner-fm-scale"><small>FM</small><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>
            <div class="tuner-band-scale tuner-am-scale"><small>AM</small><span>530</span><span>700</span><span>900</span><span>1100</span><span>1400</span><span>1700</span></div>
            <div class="tuner-ticks" aria-hidden="true"></div>
            <span class="tuner-needle" aria-hidden="true"></span>
            <div class="tuner-readout"><b id="tunerFrequency">97.9</b><small id="tunerUnits">MHz</small><strong id="tunerStation">LIVE RADIO</strong></div>
            <div class="tuner-lamps" aria-hidden="true"><span class="stereo-lamp">LIVE</span><span class="signal-lamp">TUNED</span></div>
          </div>
          <div class="receiver-meter-slot" aria-label="Stereo power meters"></div>
        </div>
        <div class="tuner-controls">
          <button type="button" class="tuner-power" aria-pressed="true"><b>●</b><small>POWER</small></button>
          <div class="tuner-band-buttons" role="group" aria-label="Radio band"><button type="button" data-band="FM" class="active" aria-pressed="true">FM</button><button type="button" data-band="AM" aria-pressed="false">AM</button></div>
          <button type="button" class="tuner-scan" data-scan="down" aria-label="Scan down">◀</button>
          <label class="tuner-slider-wrap"><span>TUNING</span><input id="tunerSlider" type="range" min="88" max="108" step="0.1" value="97.9" aria-label="Tuning frequency"></label>
          <button type="button" class="tuner-scan" data-scan="up" aria-label="Scan up">▶</button>
          <div class="tuner-signal" aria-label="Signal strength"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="tuner-presets" aria-label="Live station presets"><span>LIVE PRESETS</span>${[1,2,3,4,5,6].map(n=>`<button type="button" data-preset="${n-1}">${n}</button>`).join('')}</div>
      </div>`;
    reel.insertAdjacentElement('afterend',module);

    const oldMeter=document.querySelector('.meter-module');
    const meterBank=oldMeter?.querySelector('.meter-bank');
    if(meterBank){
      const slot=module.querySelector('.receiver-meter-slot');
      const title=document.createElement('div');
      title.className='receiver-meter-title';
      title.innerHTML='<span>POWER LEVEL</span><small>L / R • WATTS</small>';
      slot.append(title,meterBank);
      oldMeter.remove();
    }

    const style=document.createElement('style');
    style.textContent=`
      .legacy83-grid>.tuner-module{grid-column:1/-1!important;width:100%;min-width:0}
      .tuner-module{min-height:330px;overflow:hidden}
      .tuner-face{position:relative;min-height:292px;padding:12px 16px 14px;background:linear-gradient(180deg,#b9b8b2 0,#8f908c 4%,#c9c7c0 11%,#969692 15%,#777875 100%);box-shadow:inset 0 1px #fff9,inset 0 -8px 18px #0005}
      .tuner-brand{display:flex;justify-content:space-between;align-items:end;color:#24282a;text-shadow:0 1px #fff8;font-size:.46rem;letter-spacing:.13em;margin-bottom:8px}.tuner-brand strong{font-size:.62rem;letter-spacing:.18em}
      .tuner-meter-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.9fr);gap:12px;align-items:stretch}
      .tuner-glass{position:relative;height:128px;border:4px solid #303336;border-radius:3px;background:linear-gradient(180deg,#07151d,#031017 58%,#061d28);box-shadow:inset 0 0 22px #000,0 2px 5px #0008;overflow:hidden;color:#bdefff}
      .tuner-band-scale{position:absolute;left:18px;right:18px;display:grid;grid-template-columns:32px repeat(6,1fr);align-items:center;font:700 .48rem/1 system-ui,sans-serif;letter-spacing:.08em;text-shadow:0 0 7px #6ee7ff}.tuner-band-scale small{color:#f2cb74}.tuner-fm-scale{top:13px}.tuner-am-scale{top:42px;color:#86ccdc}
      .tuner-ticks{position:absolute;left:53px;right:20px;top:29px;height:34px;background:repeating-linear-gradient(90deg,#8fe8ff 0 1px,transparent 1px 3.4%);opacity:.48}
      .tuner-needle{position:absolute;top:7px;bottom:7px;width:2px;left:50%;background:#ff6c59;box-shadow:0 0 7px #ff3d2f;transition:left .24s}
      .tuner-readout{position:absolute;left:17px;bottom:11px;display:flex;align-items:baseline;gap:5px;color:#d9f7ff;text-shadow:0 0 8px #45dfff}.tuner-readout b{font:700 1.05rem/1 ui-monospace,monospace}.tuner-readout small{font-size:.43rem}.tuner-readout strong{margin-left:12px;font-size:.48rem;letter-spacing:.1em;color:#f3d28a;white-space:nowrap;max-width:230px;overflow:hidden;text-overflow:ellipsis}
      .tuner-lamps{position:absolute;right:14px;bottom:9px;display:flex;gap:7px;font-size:.36rem}.tuner-lamps span{padding:3px 5px;border:1px solid #315a47;color:#5d8c76;background:#07110c}.tuner-module.is-tuned .tuner-lamps span{color:#aaffc6;box-shadow:inset 0 0 7px #29e27077,0 0 5px #29e27055}
      .receiver-meter-slot{min-width:0;border:3px solid #33363a;border-radius:3px;background:linear-gradient(#171b1d,#080a0b);padding:7px 8px 8px;box-shadow:inset 0 0 15px #000,0 2px 5px #0007}.receiver-meter-title{display:flex;justify-content:space-between;color:#d8d0b5;font-size:.4rem;letter-spacing:.12em;margin-bottom:5px}.receiver-meter-slot .meter-bank{height:116px;margin:0;gap:7px;padding:8px 8px 24px}
      .tuner-controls{display:grid;grid-template-columns:54px 72px 34px minmax(130px,1fr) 34px 78px;gap:9px;align-items:center;margin-top:10px}.tuner-controls button,.tuner-presets button{border:1px solid #35383a;border-radius:2px;background:linear-gradient(#70716f,#333634);color:#eee;box-shadow:inset 0 1px #fff4,0 2px 3px #0008;min-height:28px;font-weight:800}.tuner-power{display:grid;place-items:center}.tuner-power b{color:#72ff86}.tuner-band-buttons{display:grid;grid-template-columns:1fr 1fr;gap:3px}.tuner-band-buttons button.active,.tuner-presets button.active{color:#d9f7ff;box-shadow:inset 0 0 8px #55cfff88,0 2px 3px #0008}.tuner-slider-wrap{display:grid;gap:3px;color:#202426;font-size:.34rem;font-weight:900;text-align:center}.tuner-slider-wrap input{width:100%}.tuner-signal{height:28px;display:flex;align-items:end;gap:3px;padding:3px 5px;border:1px solid #333;background:#151918}.tuner-signal span{width:10px;height:20%;background:#31523d}.tuner-signal span:nth-child(2){height:35%}.tuner-signal span:nth-child(3){height:52%}.tuner-signal span:nth-child(4){height:72%}.tuner-signal span:nth-child(5){height:95%}.tuner-signal span.on{background:#70e996;box-shadow:0 0 5px #4cff88}
      .tuner-presets{display:flex;gap:6px;align-items:center;margin-top:8px;color:#262a2b;font-size:.36rem;font-weight:900;letter-spacing:.12em}.tuner-presets button{min-width:32px;min-height:24px;padding:2px 8px}
      .tuner-module:not(.is-powered) .tuner-glass,.tuner-module:not(.is-powered) .receiver-meter-slot{filter:brightness(.28) saturate(.25)}
      @media(max-width:760px){.tuner-meter-layout{grid-template-columns:1fr}.tuner-module{min-height:445px}.receiver-meter-slot .meter-bank{height:112px}}
      @media(max-width:620px){.tuner-face{padding:9px 8px}.tuner-glass{height:110px}.tuner-controls{grid-template-columns:44px 62px 28px minmax(84px,1fr) 28px 60px;gap:4px}.tuner-readout strong{max-width:120px}.tuner-signal span{width:6px}}
    `;
    document.head.appendChild(style);

    const slider=module.querySelector('#tunerSlider');
    const freqEl=module.querySelector('#tunerFrequency');
    const unitsEl=module.querySelector('#tunerUnits');
    const stationEl=module.querySelector('#tunerStation');
    const statusEl=module.querySelector('#tunerStatus');
    const needle=module.querySelector('.tuner-needle');
    const powerBtn=module.querySelector('.tuner-power');
    const signalBars=[...module.querySelectorAll('.tuner-signal span')];
    const presetBtns=[...module.querySelectorAll('[data-preset]')];
    const musicAudio=document.getElementById('audio');
    const radioAudio=new Audio();
    radioAudio.preload='none';
    let band='FM';
    let powered=true;

    const bandLimits=()=>band==='FM'?{min:88,max:108,step:.1,unit:'MHz'}:{min:530,max:1700,step:10,unit:'kHz'};
    const nearestStation=value=>stations[band].reduce((best,s)=>Math.abs(s.freq-value)<Math.abs(best.freq-value)?s:best,stations[band][0]);

    async function fetchLiveStations(){
      statusEl.textContent='LOADING LIVE RADIO';
      for(const server of API_SERVERS){
        try{
          const url=`${server}/json/stations/search?countrycode=US&state=Arizona&hidebroken=true&order=clickcount&reverse=true&limit=40`;
          const response=await fetch(url,{headers:{Accept:'application/json'}});
          if(!response.ok)throw new Error(`HTTP ${response.status}`);
          const rows=await response.json();
          const live=rows.filter(s=>(s.url_resolved||s.url||'').startsWith('https://')&&s.name);
          if(live.length<6)continue;
          const fmFreq=[88.3,91.7,94.5,97.9,101.3,104.7];
          const amFreq=[650,880,1230,1490,1600,1700];
          stations.FM=live.slice(0,6).map((s,i)=>({freq:fmFreq[i],name:s.name.trim(),url:s.url_resolved||s.url,uuid:s.stationuuid}));
          const second=live.slice(6,12).length>=6?live.slice(6,12):live.slice(0,6).reverse();
          stations.AM=second.map((s,i)=>({freq:amFreq[i],name:s.name.trim(),url:s.url_resolved||s.url,uuid:s.stationuuid}));
          statusEl.textContent='LIVE STATIONS READY';
          paint(slider.value,{play:false});
          return;
        }catch(err){ console.warn('Radio directory failed',server,err); }
      }
      statusEl.textContent='LIVE DIRECTORY OFFLINE';
    }

    function paint(value,{play=false}={}){
      const limits=bandLimits();
      const numeric=Math.min(limits.max,Math.max(limits.min,Number(value)));
      const nearest=nearestStation(numeric);
      const tolerance=band==='FM'?.32:38;
      const distance=Math.abs(nearest.freq-numeric);
      const strength=Math.max(0,1-distance/tolerance);
      needle.style.left=`${((numeric-limits.min)/(limits.max-limits.min)*100).toFixed(2)}%`;
      freqEl.textContent=band==='FM'?numeric.toFixed(1):String(Math.round(numeric));
      unitsEl.textContent=limits.unit;
      stationEl.textContent=strength>.18?nearest.name:'— BETWEEN STATIONS —';
      module.classList.toggle('is-tuned',powered&&strength>.45);
      signalBars.forEach((bar,i)=>bar.classList.toggle('on',powered&&i<Math.round(strength*5)));
      statusEl.textContent=!powered?'POWER OFF':strength>.45?(radioAudio.paused?'LIVE • READY':'LIVE • PLAYING'):'TUNING';
      presetBtns.forEach((btn,i)=>btn.classList.toggle('active',stations[band][i]===nearest&&strength>.45));
      if(play&&strength>.45)playStation(nearest);
    }

    async function playStation(station){
      if(!powered||!station?.url){
        statusEl.textContent=station?.url?'POWER OFF':'STATION UNAVAILABLE';
        return;
      }
      try{
        musicAudio?.pause();
        radioAudio.pause();
        radioAudio.src=station.url;
        radioAudio.load();
        statusEl.textContent='CONNECTING…';
        await radioAudio.play();
        statusEl.textContent='LIVE • PLAYING';
        module.classList.add('is-tuned');
      }catch(err){
        console.warn('Live station failed',station.name,err);
        statusEl.textContent='STREAM FAILED • SCAN';
      }
    }

    function setBand(next){
      radioAudio.pause();
      band=next;
      const limits=bandLimits();
      slider.min=String(limits.min);slider.max=String(limits.max);slider.step=String(limits.step);
      const station=stations[band][Math.min(3,stations[band].length-1)];
      slider.value=String(station.freq);
      module.querySelectorAll('[data-band]').forEach(btn=>{const active=btn.dataset.band===band;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
      paint(station.freq,{play:false});
    }

    function scan(direction){
      if(!powered)return;
      const list=stations[band];
      const value=Number(slider.value);
      const target=direction==='up'
        ? (list.find(s=>s.freq>value+.01)||list[0])
        : ([...list].reverse().find(s=>s.freq<value-.01)||list[list.length-1]);
      slider.value=String(target.freq);
      paint(target.freq,{play:true});
    }

    slider.addEventListener('input',()=>paint(slider.value,{play:false}));
    slider.addEventListener('change',()=>paint(slider.value,{play:true}));
    module.querySelectorAll('[data-band]').forEach(btn=>btn.addEventListener('click',()=>setBand(btn.dataset.band)));
    module.querySelectorAll('[data-scan]').forEach(btn=>btn.addEventListener('click',()=>scan(btn.dataset.scan)));
    presetBtns.forEach(btn=>btn.addEventListener('click',()=>{
      const station=stations[band][Number(btn.dataset.preset)];
      if(!station)return;
      slider.value=String(station.freq);
      paint(station.freq,{play:true});
    }));
    powerBtn.addEventListener('click',()=>{
      powered=!powered;
      module.classList.toggle('is-powered',powered);
      powerBtn.setAttribute('aria-pressed',String(powered));
      if(!powered)radioAudio.pause();
      paint(slider.value,{play:false});
    });
    radioAudio.addEventListener('playing',()=>{statusEl.textContent='LIVE • PLAYING';module.classList.add('is-tuned');});
    radioAudio.addEventListener('waiting',()=>{if(powered)statusEl.textContent='BUFFERING…';});
    radioAudio.addEventListener('error',()=>{if(powered)statusEl.textContent='STREAM ERROR • SCAN';});

    setBand('FM');
    slider.value='97.9';
    paint(97.9,{play:false});
    fetchLiveStations();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLegacy83Radio,{once:true});
  else installLegacy83Radio();
})();