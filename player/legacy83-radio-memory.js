(() => {
  'use strict';
  const KEY='astralisNova.legacy83.lastRadio';

  function save(station){
    const f=Number(station?._frequency);
    if(!Number.isFinite(f))return;
    try{localStorage.setItem(KEY,JSON.stringify({band:f<88?'AM':'FM',frequency:f,call:station?._call||'',savedAt:Date.now()}));}catch{}
  }

  function restore(){
    let saved=null;
    try{saved=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
    const tuner=document.querySelector('.tuner-module');
    const slider=document.getElementById('tunerSlider');
    if(!saved||!tuner||!slider||!Number.isFinite(Number(saved.frequency)))return;
    const band=saved.band==='AM'?'AM':'FM';
    const button=tuner.querySelector(`[data-band="${band}"]`);
    if(button&&!button.classList.contains('active'))button.click();
    setTimeout(()=>{
      // Keep the U.S. FM dial strictly at 88.1-107.9 MHz.
      if(band==='FM'){
        slider.min='88.1';slider.max='107.9';slider.step='0.2';
      }
      slider.value=String(saved.frequency);
      slider.dispatchEvent(new Event('input',{bubbles:true}));
      const status=document.getElementById('tunerStatus');
      if(status)status.textContent=`MEMORY • ${band==='FM'?Number(saved.frequency).toFixed(1):Math.round(saved.frequency)} ${band}`;
    },80);
  }

  window.addEventListener('legacy83-radio-state',e=>{if(e.detail?.playing&&e.detail?.station)save(e.detail.station);});

  function install(){
    const wait=()=>{
      const tuner=document.querySelector('.tuner-module');
      const slider=document.getElementById('tunerSlider');
      if(!tuner||!slider){setTimeout(wait,120);return;}
      // Undo any stale extended-dial script left in an older cached page.
      const fm=tuner.querySelector('[data-band="FM"]');
      if(fm?.classList.contains('active')){slider.min='88.1';slider.max='107.9';slider.step='0.2';}
      const scale=tuner.querySelector('.tuner-fm-scale');
      const spans=scale?[...scale.querySelectorAll('span')]:[];
      if(spans.length>=6)spans[5].textContent='108';
      setTimeout(restore,700);
    };
    wait();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
