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

  function install(){
    const waitForTuner=()=>{
      const tuner=document.querySelector('.tuner-module');
      const select=document.getElementById('radioStationSelect');
      if(!tuner||!select){setTimeout(waitForTuner,120);return;}

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
