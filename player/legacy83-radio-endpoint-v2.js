(() => {
  'use strict';

  const EXTENDED_FM_MAX = 111.9;
  const NORMAL_FM_MAX = 107.9;

  function install(){
    const tuner=document.querySelector('.tuner-module');
    if(!tuner){setTimeout(install,150);return;}
    if(tuner.dataset.extendedFmSafe==='1')return;

    const slider=tuner.querySelector('#tunerSlider');
    const needle=tuner.querySelector('.tuner-needle');
    const glass=tuner.querySelector('.tuner-glass');
    const freq=tuner.querySelector('#tunerFrequency');
    const units=tuner.querySelector('#tunerUnits');
    const station=tuner.querySelector('#tunerStation');
    const status=tuner.querySelector('#tunerStatus');
    const knobMarker=tuner.querySelector('.tuner-knob span');
    const fmButton=tuner.querySelector('[data-band="FM"]');
    const amButton=tuner.querySelector('[data-band="AM"]');
    const scale=tuner.querySelector('.tuner-fm-scale');
    if(!slider||!needle||!glass||!freq||!station||!fmButton)return;

    tuner.dataset.extendedFmSafe='1';
    const atFM=()=>fmButton.classList.contains('active');

    function setExtendedRange(){
      if(!atFM())return;
      slider.min='88.1';
      slider.max=String(EXTENDED_FM_MAX);
      slider.step='0.2';
      if(scale){
        const spans=[...scale.querySelectorAll('span')];
        if(spans.length>=6)spans[5].textContent='112';
      }
    }

    function paintExtended(value){
      const snapped=Number((88.1+Math.round((Number(value)-88.1)/0.2)*0.2).toFixed(1));
      const v=Math.max(108.1,Math.min(EXTENDED_FM_MAX,snapped));
      slider.value=String(v);
      freq.textContent=v.toFixed(1);
      if(units)units.textContent='MHz';
      station.textContent='— EXTENDED FM DIAL —';
      if(status)status.textContent=`${v.toFixed(1)} MHz • ABOVE U.S. FM BAND`;
      tuner.classList.remove('is-tuned');
      needle.style.opacity='1';
      const left=53,right=20,width=glass.clientWidth||0;
      const ratio=(v-88.1)/(EXTENDED_FM_MAX-88.1);
      needle.style.left=`${(left+ratio*Math.max(0,width-left-right)).toFixed(1)}px`;
      if(knobMarker)knobMarker.style.transform=`rotate(${(ratio*240-120).toFixed(1)}deg)`;
    }

    setExtendedRange();

    // Only intercept the slider when it is physically above the normal U.S. FM band.
    // Normal tuning, buttons, search, presets and 107.9 are left completely untouched.
    slider.addEventListener('input',e=>{
      if(!atFM())return;
      const v=Number(slider.value);
      if(v<=NORMAL_FM_MAX)return;
      e.stopImmediatePropagation();
      paintExtended(v);
    },true);

    slider.addEventListener('change',e=>{
      if(!atFM())return;
      const v=Number(slider.value);
      if(v<=NORMAL_FM_MAX)return;
      e.stopImmediatePropagation();
      paintExtended(v);
    },true);

    fmButton.addEventListener('click',()=>setTimeout(setExtendedRange,0));
    amButton?.addEventListener('click',()=>setTimeout(()=>{
      slider.min='530';slider.max='1700';slider.step='10';
    },0));

    window.addEventListener('resize',()=>{
      if(atFM()&&Number(slider.value)>NORMAL_FM_MAX)paintExtended(slider.value);
    },{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
