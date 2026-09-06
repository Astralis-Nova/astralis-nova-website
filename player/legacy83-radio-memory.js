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
    if(!tuner||tuner.dataset.endpointFix==='1')return;
    const slider=tuner.querySelector('#tunerSlider');
    const needle=tuner.querySelector('.tuner-needle');
    const glass=tuner.querySelector('.tuner-glass');
    const freq=tuner.querySelector('#tunerFrequency');
    const units=tuner.querySelector('#tunerUnits');
    const station=tuner.querySelector('#tunerStation');
    const status=tuner.querySelector('#tunerStatus');
    const knobMarker=tuner.querySelector('.tuner-knob span');
    const up=tuner.querySelector('[data-scan="up"]');
    if(!slider||!needle||!glass||!freq||!station)return;

    tuner.dataset.endpointFix='1';
    const atFM=()=>tuner.querySelector('[data-band="FM"]')?.classList.contains('active');
    const needleX=ratio=>{
      const left=53,right=20;
      return left+ratio*Math.max(0,glass.clientWidth-left-right);
    };
    const ensureFMRange=()=>{
      if(!atFM())return;
      slider.min='88.0';
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

    ensureFMRange();

    slider.addEventListener('input',e=>{
      if(atFM()&&Number(slider.value)>=108){e.stopImmediatePropagation();show108();}
    },true);
    slider.addEventListener('change',e=>{
      if(atFM()&&Number(slider.value)>=108){e.stopImmediatePropagation();show108();}
    },true);
    up?.addEventListener('click',e=>{
      if(atFM()&&Number(slider.value)>=107.9){e.stopImmediatePropagation();show108();}
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
