(() => {
  'use strict';
  const KEY='astralisNova.legacy83.lastRadio';

  function loadEndpointFix(){
    if(document.querySelector('script[data-legacy83-endpoint-v2]'))return;
    const s=document.createElement('script');
    s.src='./legacy83-radio-endpoint-v2.js?v=001e4a4';
    s.defer=true;
    s.dataset.legacy83EndpointV2='1';
    document.head.appendChild(s);
  }

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
      slider.value=String(saved.frequency);
      slider.dispatchEvent(new Event('input',{bubbles:true}));
      const status=document.getElementById('tunerStatus');
      if(status)status.textContent=`MEMORY • ${band==='FM'?Number(saved.frequency).toFixed(1):Math.round(saved.frequency)} ${band}`;
    },80);
  }

  window.addEventListener('legacy83-radio-state',e=>{if(e.detail?.playing&&e.detail?.station)save(e.detail.station);});

  function install(){
    loadEndpointFix();
    const wait=()=>{
      if(!document.querySelector('.tuner-module')){setTimeout(wait,120);return;}
      setTimeout(restore,700);
    };
    wait();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
