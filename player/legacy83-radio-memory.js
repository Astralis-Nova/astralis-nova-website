(() => {
  'use strict';
  const KEY='astralisNova.legacy83.lastRadio';
  const EXTENDED_FM_MAX=111.9;

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

  function installExtendedFm(){
    const tuner=document.querySelector('.tuner-module');
    const slider=document.getElementById('tunerSlider');
    if(!tuner||!slider||slider.dataset.extendedFm==='1')return;
    slider.dataset.extendedFm='1';

    const fmButton=tuner.querySelector('[data-band="FM"]');
    const amButton=tuner.querySelector('[data-band="AM"]');
    const freqEl=document.getElementById('tunerFrequency');
    const unitsEl=document.getElementById('tunerUnits');
    const stationEl=document.getElementById('tunerStation');
    const statusEl=document.getElementById('tunerStatus');
    const needle=tuner.querySelector('.tuner-needle');
    const glass=tuner.querySelector('.tuner-glass');
    const knobMarker=tuner.querySelector('.tuner-knob span');

    const setExtendedRange=()=>{
      if(!fmButton?.classList.contains('active'))return;
      slider.max=String(EXTENDED_FM_MAX);
      const scale=tuner.querySelector('.tuner-fm-scale');
      if(scale){
        const spans=[...scale.querySelectorAll('span')];
        if(spans.length>=6){spans[0].textContent='88';spans[1].textContent='92';spans[2].textContent='96';spans[3].textContent='100';spans[4].textContent='104';spans[5].textContent='112';}
      }
    };

    const paintExtended=value=>{
      const f=Math.max(108.1,Math.min(EXTENDED_FM_MAX,Number(value)||108.1));
      const snapped=Number((88.1+Math.round((f-88.1)/0.2)*0.2).toFixed(1));
      slider.value=String(snapped);
      if(freqEl)freqEl.textContent=snapped.toFixed(1);
      if(unitsEl)unitsEl.textContent='MHz';
      if(stationEl)stationEl.textContent='EXTENDED FM • ABOVE US BROADCAST BAND';
      if(statusEl)statusEl.textContent=`EXTENDED DIAL • ${snapped.toFixed(1)} FM`;
      tuner.classList.remove('is-tuned');
      if(needle&&glass){
        const left=53,right=20,width=glass.clientWidth||0;
        const ratio=(snapped-88.1)/(EXTENDED_FM_MAX-88.1);
        needle.style.left=`${(left+ratio*Math.max(0,width-left-right)).toFixed(1)}px`;
        needle.style.opacity='1';
      }
      if(knobMarker){
        const ratio=(snapped-88.1)/(EXTENDED_FM_MAX-88.1);
        knobMarker.style.transform=`rotate(${(ratio*240-120).toFixed(1)}deg)`;
      }
    };

    setExtendedRange();

    slider.addEventListener('input',e=>{
      if(!fmButton?.classList.contains('active'))return;
      const v=Number(slider.value);
      if(v<=107.9)return;
      e.stopImmediatePropagation();
      paintExtended(v);
    },true);

    slider.addEventListener('change',e=>{
      if(!fmButton?.classList.contains('active'))return;
      const v=Number(slider.value);
      if(v<=107.9)return;
      e.stopImmediatePropagation();
      paintExtended(v);
    },true);

    fmButton?.addEventListener('click',()=>setTimeout(setExtendedRange,0));
    amButton?.addEventListener('click',()=>setTimeout(()=>{slider.max='1700';},0));

    window.addEventListener('resize',()=>{
      if(fmButton?.classList.contains('active')&&Number(slider.value)>107.9)paintExtended(slider.value);
    },{passive:true});
  }

  window.addEventListener('legacy83-radio-state',e=>{if(e.detail?.playing&&e.detail?.station)save(e.detail.station);});

  function install(){
    loadEndpointFix();
    const wait=()=>{
      if(!document.querySelector('.tuner-module')){setTimeout(wait,120);return;}
      installExtendedFm();
      setTimeout(restore,700);
    };
    wait();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
