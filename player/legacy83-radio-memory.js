(() => {
  'use strict';

  const STORAGE_KEY='astralisNova.legacy83.lastRadio';
  let restoring=false;

  function readMemory(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved||!Number.isFinite(Number(saved.frequency)))return null;
      return {band:saved.band==='AM'?'AM':'FM',frequency:Number(saved.frequency),call:saved.call||'',name:saved.name||''};
    }catch{return null;}
  }

  function writeMemory(station){
    const frequency=Number(station?._frequency);
    if(!Number.isFinite(frequency))return;
    const band=frequency<88?'AM':'FM';
    try{
      localStorage.setItem(STORAGE_KEY,JSON.stringify({
        band,
        frequency,
        call:station?._call||'',
        name:station?.name||'',
        savedAt:Date.now()
      }));
    }catch{}
  }

  function restoreDial(){
    if(restoring)return;
    const saved=readMemory();
    const tuner=document.querySelector('.tuner-module');
    const slider=document.getElementById('tunerSlider');
    if(!saved||!tuner||!slider)return;

    restoring=true;
    const bandButton=tuner.querySelector(`[data-band="${saved.band}"]`);
    if(bandButton&&!bandButton.classList.contains('active'))bandButton.click();

    slider.value=String(saved.frequency);
    slider.dispatchEvent(new Event('input',{bubbles:true}));

    const select=document.getElementById('radioStationSelect');
    if(select){
      const target=[...select.options].findIndex(o=>{
        const text=o.textContent||'';
        const freqMatch=saved.band==='FM'?text.includes(saved.frequency.toFixed(1)):text.includes(String(Math.round(saved.frequency)));
        const callMatch=!saved.call||text.toUpperCase().includes(saved.call.toUpperCase());
        return freqMatch&&callMatch;
      });
      if(target>=0)select.selectedIndex=target;
    }

    const status=document.getElementById('tunerStatus');
    if(status)status.textContent=`MEMORY • ${saved.band==='FM'?saved.frequency.toFixed(1):Math.round(saved.frequency)} ${saved.band}`;
    restoring=false;
  }

  window.addEventListener('legacy83-radio-state',event=>{
    if(event.detail?.playing&&event.detail?.station)writeMemory(event.detail.station);
  });

  function installEndpointFix(tuner){
    if(!tuner||tuner.dataset.endpointFix==='2')return;
    const slider=tuner.querySelector('#tunerSlider');
    const needle=tuner.querySelector('.tuner-needle');
    const glass=tuner.querySelector('.tuner-glass');
    const freq=tuner.querySelector('#tunerFrequency');
    const units=tuner.querySelector('#tunerUnits');
    const station=tuner.querySelector('#tunerStation');
    const status=tuner.querySelector('#tunerStatus');
    const knobMarker=tuner.querySelector('.tuner-knob span');
    const up=tuner.querySelector('[data-scan="up"]');
    const down=tuner.querySelector('[data-scan="down"]');
    const searchInput=tuner.querySelector('#radioSearch');
    const searchBtn=tuner.querySelector('#radioSearchBtn');
    const select=tuner.querySelector('#radioStationSelect');
    if(!slider||!needle||!glass||!freq||!station)return;

    tuner.dataset.endpointFix='2';
    const atFM=()=>tuner.querySelector('[data-band="FM"]')?.classList.contains('active');
    const needleX=ratio=>{
      const left=53,right=20;
      return left+ratio*Math.max(0,glass.clientWidth-left-right);
    };
    const ensureFMRange=()=>{
      if(!atFM())return;
      slider.min='88.1';
      slider.max='108.0';
      slider.step='0.1';
    };
    const show108=()=>{
      if(!atFM())return;
      ensureFMRange();
      slider.value='108.0';
      needle.style.opacity='1';
      needle.style.left=`${needleX(1).toFixed(1)}px`;
      if(knobMarker)knobMarker.style.transform='rotate(120deg)';
      freq.textContent='108.0';
      if(units)units.textContent='MHz';
      station.textContent='— FM BAND EDGE —';
      if(status)status.textContent='108.0 MHz • END OF BROADCAST FM';
      tuner.classList.remove('is-tuned');
    };
    const tune1079=({play=true}={})=>{
      if(!atFM())return;
      ensureFMRange();
      slider.value='107.9';
      slider.dispatchEvent(new Event('input',{bubbles:true}));
      if(!play)return;

      // Force a fresh KMLE/107.9 lookup so the top real FM channel works
      // even when the currently loaded Arizona directory page omitted it.
      if(searchInput&&searchBtn&&select){
        searchInput.value='107.9';
        let done=false;
        const tryPlay=()=>{
          if(done)return;
          const target=[...select.options].findIndex(o=>(o.textContent||'').includes('107.9'));
          if(target>=0){
            done=true;
            observer.disconnect();
            select.selectedIndex=target;
            select.dispatchEvent(new Event('change',{bubbles:true}));
          }
        };
        const observer=new MutationObserver(tryPlay);
        observer.observe(select,{childList:true});
        searchBtn.click();
        setTimeout(()=>{tryPlay();observer.disconnect();},1800);
      }else{
        slider.dispatchEvent(new Event('change',{bubbles:true}));
      }
    };

    ensureFMRange();

    slider.addEventListener('input',e=>{
      if(atFM()&&Number(slider.value)>=108){e.stopImmediatePropagation();show108();}
    },true);
    slider.addEventListener('change',e=>{
      if(!atFM())return;
      const value=Number(slider.value);
      if(value>=108){e.stopImmediatePropagation();show108();return;}
      if(value>=107.85){e.stopImmediatePropagation();tune1079({play:true});}
    },true);

    up?.addEventListener('click',e=>{
      if(!atFM())return;
      const value=Number(slider.value);
      if(value>=107.85){e.stopImmediatePropagation();show108();return;}
      if(value>=107.65){e.stopImmediatePropagation();tune1079({play:true});}
    },true);

    down?.addEventListener('click',e=>{
      if(atFM()&&Number(slider.value)>=107.95){e.stopImmediatePropagation();tune1079({play:true});}
    },true);

    tuner.querySelector('[data-band="FM"]')?.addEventListener('click',()=>setTimeout(ensureFMRange,0));
    window.addEventListener('resize',()=>{
      if(atFM()&&Number(slider.value)>=108)needle.style.left=`${needleX(1).toFixed(1)}px`;
    },{passive:true});
  }

  function install(){
    const waitForTuner=()=>{
      const tuner=document.querySelector('.tuner-module');
      const select=document.getElementById('radioStationSelect');
      if(!tuner||!select){setTimeout(waitForTuner,120);return;}

      installEndpointFix(tuner);

      const observer=new MutationObserver(()=>{
        if(select.options.length&&select.options[0]?.value!=='')setTimeout(restoreDial,50);
      });
      observer.observe(select,{childList:true});

      setTimeout(restoreDial,700);
    };
    waitForTuner();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
