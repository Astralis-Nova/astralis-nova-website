(() => {
  'use strict';

  function installLegacy83Radio(){
    const rack=document.querySelector('.legacy83-grid');
    const reel=document.querySelector('.reel-module');
    if(!rack||!reel||document.querySelector('.tuner-module'))return;

    const stations={
      FM:[
        {freq:88.3,name:'CACTUS FM',track:'Cactus Forest'},
        {freq:91.7,name:'NIGHTSKY',track:'Under the NightSky'},
        {freq:94.5,name:'STARLIGHT',track:'Starlight in My Boots — Original'},
        {freq:97.9,name:'DARKTIDE RADIO',track:'Darktide Megamix'},
        {freq:101.3,name:'NOVA ONE',track:'We Are the Universe — Remix'},
        {freq:104.7,name:'GOLDEN LIGHTS',track:'When The Lights Were Golden'},
        {freq:107.9,name:'FIRST NIGHT',track:'Our First Night'}
      ],
      AM:[
        {freq:650,name:'MEMORY 650',track:"My Dad's Last Day on This Earth"},
        {freq:880,name:'BRATS 880',track:'Military Brats'},
        {freq:1230,name:'LOGIN 1230',track:'Logged Back In'},
        {freq:1490,name:'PEACE 1490',track:'One Outcome (Peace)'},
        {freq:1600,name:'ALEXIS 1600',track:'My Girl Alexis'}
      ]
    };

    const module=document.createElement('article');
    module.className='hifi-module tuner-module tuner-power-module is-powered';
    module.innerHTML=`
      <div class="hifi-label"><span>AM / FM STEREO RECEIVER + POWER METERS</span><span id="tunerStatus">FM STEREO</span></div>
      <div class="tuner-face">
        <div class="tuner-brand"><strong>ASTRALIS NOVA</strong><span>AN-83T • QUARTZ SYNTHESIZED</span></div>
        <div class="tuner-meter-layout">
          <div class="tuner-glass" aria-label="AM FM tuning scale">
            <div class="tuner-band-scale tuner-fm-scale"><small>FM</small><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>
            <div class="tuner-band-scale tuner-am-scale"><small>AM</small><span>530</span><span>700</span><span>900</span><span>1100</span><span>1400</span><span>1700</span></div>
            <div class="tuner-ticks" aria-hidden="true"></div>
            <span class="tuner-needle" aria-hidden="true"></span>
            <div class="tuner-readout"><b id="tunerFrequency">97.9</b><small id="tunerUnits">MHz</small><strong id="tunerStation">DARKTIDE RADIO</strong></div>
            <div class="tuner-lamps" aria-hidden="true"><span class="stereo-lamp">STEREO</span><span class="signal-lamp">TUNED</span></div>
          </div>
          <div class="receiver-meter-slot" aria-label="Stereo power meters"></div>
        </div>
        <div class="tuner-controls">
          <button type="button" class="tuner-power" aria-pressed="true"><b>●</b><small>POWER</small></button>
          <div class="tuner-band-buttons" role="group" aria-label="Radio band">
            <button type="button" data-band="FM" class="active" aria-pressed="true">FM</button>
            <button type="button" data-band="AM" aria-pressed="false">AM</button>
          </div>
          <button type="button" class="tuner-scan" data-scan="down" aria-label="Scan down">◀</button>
          <label class="tuner-slider-wrap"><span>TUNING</span><input id="tunerSlider" type="range" min="88" max="108" step="0.1" value="97.9" aria-label="Tuning frequency"></label>
          <button type="button" class="tuner-scan" data-scan="up" aria-label="Scan up">▶</button>
          <div class="tuner-signal" aria-label="Signal strength"><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <div class="tuner-presets" aria-label="Station presets"><span>MEMORY</span>${[1,2,3,4,5,6].map(n=>`<button type="button" data-preset="${n-1}">${n}</button>`).join('')}</div>
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

    const cassetteModule=document.querySelector('.cassette-module');
    if(cassetteModule&&!cassetteModule.classList.contains('dual-cassette-module')){
      cassetteModule.classList.add('dual-cassette-module');
      const label=cassetteModule.querySelector('.hifi-label span:first-child');
      if(label)label.textContent='DUAL STEREO CASSETTE DECK';
      const stage=cassetteModule.querySelector('.cassette-stage');
      const originalCassette=stage?.querySelector('.cassette');
      const originalCounter=stage?.querySelector('.cassette-counter');
      const originalControls=stage?.querySelector('.cassette-controls');
      if(stage&&originalCassette&&originalCounter&&originalControls){
        const bays=document.createElement('div');
        bays.className='dual-cassette-bays';
        const bayA=document.createElement('div');
        bayA.className='cassette-bay cassette-bay-a active';
        bayA.innerHTML='<div class="cassette-bay-head"><b>DECK A</b><span>PLAYBACK / RECORD</span></div>';
        bayA.append(originalCassette,originalCounter);

        const bayB=document.createElement('div');
        bayB.className='cassette-bay cassette-bay-b';
        bayB.innerHTML=`<div class="cassette-bay-head"><b>DECK B</b><span>PLAYBACK</span></div>
          <div class="cassette cassette-b" aria-hidden="true"><div class="cassette-window"><span class="cassette-hub"></span><span class="cassette-hub"></span></div><div class="cassette-name">ASTRALIS NOVA • TYPE II</div></div>
          <div class="cassette-counter cassette-counter-b" aria-label="Cassette deck B counter"><span>0</span><span>0</span><span>0</span><span>0</span></div>`;
        bays.append(bayA,bayB);
        stage.prepend(bays);

        const selector=document.createElement('div');
        selector.className='cassette-deck-selector';
        selector.innerHTML='<button type="button" data-cassette-deck="A" class="active" aria-pressed="true">DECK A</button><button type="button" data-cassette-deck="B" aria-pressed="false">DECK B</button><span>HIGH SPEED DUBBING • DOLBY B</span>';
        originalControls.before(selector);
        selector.querySelectorAll('[data-cassette-deck]').forEach(btn=>btn.addEventListener('click',()=>{
          const deck=btn.dataset.cassetteDeck;
          selector.querySelectorAll('button').forEach(b=>{const on=b===btn;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
          bayA.classList.toggle('active',deck==='A');
          bayB.classList.toggle('active',deck==='B');
          cassetteModule.dataset.activeDeck=deck;
        }));
        originalControls.addEventListener('click',event=>{
          const button=event.target.closest('[data-cassette-action]');
          if(!button)return;
          const activeBay=cassetteModule.dataset.activeDeck==='B'?bayB:bayA;
          activeBay.classList.toggle('is-running',button.dataset.cassetteAction==='play');
          if(button.dataset.cassetteAction==='stop'||button.dataset.cassetteAction==='eject')activeBay.classList.remove('is-running');
        });
      }
    }

    const style=document.createElement('style');
    style.textContent=`
      .tuner-module{min-height:330px;overflow:hidden}
      .tuner-face{position:relative;min-height:292px;padding:12px 16px 14px;background:linear-gradient(180deg,#b9b8b2 0,#8f908c 4%,#c9c7c0 11%,#969692 15%,#777875 100%);box-shadow:inset 0 1px #fff9,inset 0 -8px 18px #0005}
      .tuner-brand{display:flex;justify-content:space-between;align-items:end;color:#24282a;text-shadow:0 1px #fff8;font-size:.46rem;letter-spacing:.13em;margin-bottom:8px}.tuner-brand strong{font-size:.62rem;letter-spacing:.18em}.tuner-brand span{opacity:.82}
      .tuner-meter-layout{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(220px,.9fr);gap:12px;align-items:stretch}
      .tuner-glass{position:relative;height:128px;border:4px solid #303336;border-radius:3px;background:linear-gradient(180deg,#07151d,#031017 58%,#061d28);box-shadow:inset 0 0 22px #000,0 2px 5px #0008;overflow:hidden;color:#bdefff}
      .tuner-glass::after{content:'';position:absolute;inset:0;background:linear-gradient(110deg,#fff0 7%,#fff2 19%,#fff0 31%,#8be7ff10 67%,#fff0 79%);pointer-events:none}
      .tuner-band-scale{position:absolute;left:18px;right:18px;display:grid;grid-template-columns:32px repeat(6,1fr);align-items:center;font:700 .48rem/1 system-ui,sans-serif;letter-spacing:.08em;text-shadow:0 0 7px #6ee7ff}.tuner-band-scale small{color:#f2cb74;font-size:.43rem}.tuner-fm-scale{top:13px}.tuner-am-scale{top:42px;color:#86ccdc}.tuner-ticks{position:absolute;left:53px;right:20px;top:29px;height:34px;background:repeating-linear-gradient(90deg,#8fe8ff 0 1px,transparent 1px 3.4%);opacity:.48}
      .tuner-needle{position:absolute;top:7px;bottom:7px;width:2px;left:50%;background:#ff6c59;box-shadow:0 0 7px #ff3d2f,0 0 13px #ff3d2f;transition:left .24s cubic-bezier(.2,.75,.2,1)}
      .tuner-readout{position:absolute;left:17px;bottom:11px;display:flex;align-items:baseline;gap:5px;color:#d9f7ff;text-shadow:0 0 8px #45dfff}.tuner-readout b{font:700 1.05rem/1 ui-monospace,monospace;letter-spacing:.06em}.tuner-readout small{font-size:.43rem;letter-spacing:.1em}.tuner-readout strong{margin-left:12px;font-size:.48rem;letter-spacing:.13em;color:#f3d28a;white-space:nowrap}
      .tuner-lamps{position:absolute;right:14px;bottom:9px;display:flex;gap:7px;font-size:.36rem;letter-spacing:.08em}.tuner-lamps span{padding:3px 5px;border:1px solid #315a47;color:#5d8c76;background:#07110c;box-shadow:inset 0 0 5px #000}.tuner-module.is-tuned .signal-lamp,.tuner-module.is-tuned .stereo-lamp{color:#aaffc6;border-color:#6aa47e;box-shadow:inset 0 0 7px #29e27077,0 0 5px #29e27055}
      .receiver-meter-slot{min-width:0;border:3px solid #33363a;border-radius:3px;background:linear-gradient(#171b1d,#080a0b);padding:7px 8px 8px;box-shadow:inset 0 0 15px #000,0 2px 5px #0007}.receiver-meter-title{display:flex;justify-content:space-between;color:#d8d0b5;font-size:.4rem;letter-spacing:.12em;margin-bottom:5px}.receiver-meter-title small{font-size:.34rem;color:#8fa1a5}.receiver-meter-slot .meter-bank{margin:0;gap:7px}.receiver-meter-slot .vu-meter{min-height:92px}
      .tuner-controls{display:grid;grid-template-columns:54px 72px 34px minmax(130px,1fr) 34px 78px;gap:9px;align-items:center;margin-top:10px}.tuner-controls button,.tuner-presets button,.cassette-deck-selector button{border:1px solid #35383a;border-bottom-color:#111;border-radius:2px;background:linear-gradient(#70716f,#333634);color:#eee;box-shadow:inset 0 1px #fff4,0 2px 3px #0008;text-shadow:0 1px #000;min-height:28px;font-weight:800}.tuner-controls button:active,.tuner-presets button:active,.cassette-deck-selector button:active{transform:translateY(1px)}.tuner-power{display:grid;place-items:center;padding:2px}.tuner-power b{color:#72ff86;font-size:.6rem}.tuner-power small{font-size:.3rem}.tuner-band-buttons{display:grid;grid-template-columns:1fr 1fr;gap:3px}.tuner-band-buttons button.active,.cassette-deck-selector button.active{color:#d9f7ff;box-shadow:inset 0 0 8px #55cfff88,0 2px 3px #0008}.tuner-slider-wrap{display:grid;gap:3px;color:#202426;font-size:.34rem;font-weight:900;letter-spacing:.1em;text-align:center}.tuner-slider-wrap input{width:100%;accent-color:#243f4c}.tuner-signal{height:28px;display:flex;align-items:end;gap:3px;padding:3px 5px;border:1px solid #333;background:#151918}.tuner-signal span{width:10px;height:20%;background:#31523d}.tuner-signal span:nth-child(2){height:35%}.tuner-signal span:nth-child(3){height:52%}.tuner-signal span:nth-child(4){height:72%}.tuner-signal span:nth-child(5){height:95%}.tuner-signal span.on{background:#70e996;box-shadow:0 0 5px #4cff88}
      .tuner-presets{display:flex;gap:6px;align-items:center;margin-top:8px;color:#262a2b;font-size:.36rem;font-weight:900;letter-spacing:.12em}.tuner-presets button{min-width:32px;min-height:24px;padding:2px 8px;font-size:.44rem}.tuner-presets button.active{color:#fff3bf;box-shadow:inset 0 0 8px #e4b85188,0 2px 3px #0008}
      .tuner-module:not(.is-powered) .tuner-glass,.tuner-module:not(.is-powered) .receiver-meter-slot{filter:brightness(.28) saturate(.25)}.tuner-module:not(.is-powered) .tuner-power b{color:#4a514b}
      .dual-cassette-module .cassette-stage{display:block}.dual-cassette-bays{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px}.cassette-bay{min-width:0;padding:7px;border:2px solid #454745;border-radius:3px;background:linear-gradient(#676865,#393b39);box-shadow:inset 0 1px #fff5,0 2px 5px #0007;opacity:.84}.cassette-bay.active{opacity:1;box-shadow:inset 0 0 13px #9be9ff26,0 2px 5px #0008}.cassette-bay-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;color:#e9e9df;font-size:.38rem;letter-spacing:.09em}.cassette-bay-head span{font-size:.31rem;color:#b7b9b4}.cassette-bay .cassette{margin:0 auto}.cassette-bay .cassette-counter{margin:7px auto 0}.cassette-bay.is-running .cassette-hub{animation:cassetteSpin .75s linear infinite}.cassette-deck-selector{display:flex;align-items:center;gap:7px;margin:4px 0 10px}.cassette-deck-selector button{min-height:24px;padding:3px 10px;font-size:.36rem}.cassette-deck-selector span{margin-left:auto;color:#252a2b;font-size:.34rem;font-weight:900;letter-spacing:.08em;text-shadow:0 1px #fff6}
      @keyframes cassetteSpin{to{transform:rotate(360deg)}}
      @media(max-width:760px){.tuner-meter-layout{grid-template-columns:1fr}.receiver-meter-slot .vu-meter{min-height:82px}.tuner-module{min-height:430px}}
      @media(max-width:620px){.tuner-face{padding:9px 8px}.tuner-brand{font-size:.34rem}.tuner-brand strong{font-size:.46rem}.tuner-glass{height:110px}.tuner-band-scale{left:8px;right:8px;grid-template-columns:25px repeat(6,1fr);font-size:.36rem}.tuner-ticks{left:34px;right:8px}.tuner-readout{left:8px}.tuner-readout b{font-size:.82rem}.tuner-readout strong{font-size:.34rem;margin-left:5px;max-width:122px;overflow:hidden;text-overflow:ellipsis}.tuner-lamps{right:7px}.tuner-controls{grid-template-columns:44px 62px 28px minmax(84px,1fr) 28px 60px;gap:4px}.tuner-controls button{min-height:26px;font-size:.4rem}.tuner-signal{gap:2px;padding:3px}.tuner-signal span{width:6px}.dual-cassette-bays{grid-template-columns:1fr;gap:8px}.cassette-deck-selector{flex-wrap:wrap}.cassette-deck-selector span{width:100%;margin-left:0}}
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
    const audio=document.getElementById('audio');
    const search=document.getElementById('search');
    let band='FM';
    let powered=true;
    let currentStation=stations.FM.find(s=>s.freq===97.9)||stations.FM[0];

    const bandLimits=()=>band==='FM'?{min:88,max:108,step:.1,unit:'MHz'}:{min:530,max:1700,step:10,unit:'kHz'};
    const nearestStation=value=>stations[band].reduce((best,s)=>Math.abs(s.freq-value)<Math.abs(best.freq-value)?s:best,stations[band][0]);

    function playTrackByTitle(trackTitle){
      if(!powered)return;
      const allTab=document.querySelector('.tab[data-filter="all"]');
      if(allTab&&!allTab.classList.contains('active'))allTab.click();
      if(search&&search.value){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
      requestAnimationFrame(()=>{
        const rows=[...document.querySelectorAll('#trackList .track-row')];
        const row=rows.find(el=>el.querySelector('.track-name')?.childNodes?.[0]?.textContent?.trim()===trackTitle)||rows.find(el=>el.querySelector('.track-name')?.textContent?.trim().startsWith(trackTitle));
        if(row)row.click();
      });
    }

    function paint(value,{play=false}={}){
      const limits=bandLimits();
      const numeric=Math.min(limits.max,Math.max(limits.min,Number(value)));
      const nearest=nearestStation(numeric);
      const tolerance=band==='FM'?.32:38;
      const distance=Math.abs(nearest.freq-numeric);
      const strength=Math.max(0,1-distance/tolerance);
      const position=(numeric-limits.min)/(limits.max-limits.min)*100;
      needle.style.left=`${position.toFixed(2)}%`;
      freqEl.textContent=band==='FM'?numeric.toFixed(1):String(Math.round(numeric));
      unitsEl.textContent=limits.unit;
      stationEl.textContent=strength>.18?nearest.name:'— BETWEEN STATIONS —';
      module.classList.toggle('is-tuned',powered&&strength>.45);
      signalBars.forEach((bar,i)=>bar.classList.toggle('on',powered&&i<Math.round(strength*5)));
      statusEl.textContent=!powered?'POWER OFF':strength>.45?(band==='FM'?'FM STEREO':'AM TUNED'):'TUNING';
      currentStation=nearest;
      presetBtns.forEach((btn,i)=>btn.classList.toggle('active',stations[band][i]===nearest&&strength>.45));
      if(play&&strength>.45)playTrackByTitle(nearest.track);
    }

    function setBand(next){
      band=next;
      const limits=bandLimits();
      slider.min=String(limits.min);slider.max=String(limits.max);slider.step=String(limits.step);
      currentStation=stations[band][Math.min(3,stations[band].length-1)];
      slider.value=String(currentStation.freq);
      module.querySelectorAll('[data-band]').forEach(btn=>{const active=btn.dataset.band===band;btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));});
      paint(currentStation.freq,{play:false});
    }

    function scan(direction){
      if(!powered)return;
      const list=stations[band];
      const value=Number(slider.value);
      let target;
      if(direction==='up')target=list.find(s=>s.freq>value+.01)||list[0];
      else target=[...list].reverse().find(s=>s.freq<value-.01)||list[list.length-1];
      slider.value=String(target.freq);paint(target.freq,{play:true});
    }

    slider.addEventListener('input',()=>paint(slider.value,{play:false}));
    slider.addEventListener('change',()=>paint(slider.value,{play:true}));
    module.querySelectorAll('[data-band]').forEach(btn=>btn.addEventListener('click',()=>setBand(btn.dataset.band)));
    module.querySelectorAll('[data-scan]').forEach(btn=>btn.addEventListener('click',()=>scan(btn.dataset.scan)));
    presetBtns.forEach(btn=>btn.addEventListener('click',()=>{
      if(!powered)return;
      const station=stations[band][Number(btn.dataset.preset)];
      if(!station)return;
      slider.value=String(station.freq);paint(station.freq,{play:true});
    }));
    powerBtn.addEventListener('click',()=>{
      powered=!powered;
      module.classList.toggle('is-powered',powered);
      powerBtn.setAttribute('aria-pressed',String(powered));
      if(!powered)audio?.pause();
      paint(slider.value,{play:false});
    });

    audio?.addEventListener('play',()=>{if(powered&&module.classList.contains('is-tuned'))statusEl.textContent=band==='FM'?'FM STEREO':'AM TUNED';});
    setBand('FM');
    slider.value='97.9';paint(97.9,{play:false});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',installLegacy83Radio,{once:true});
  else installLegacy83Radio();
})();