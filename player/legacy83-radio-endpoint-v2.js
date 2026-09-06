(() => {
  'use strict';

  function install(){
    const tuner=document.querySelector('.tuner-module');
    if(!tuner){setTimeout(install,100);return;}
    if(tuner.dataset.topFmFix==='1')return;

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
    const next=tuner.querySelector('[data-step="1"]');
    const prev=tuner.querySelector('[data-step="-1"]');
    const searchInput=tuner.querySelector('#radioSearch');
    const searchBtn=tuner.querySelector('#radioSearchBtn');
    const select=tuner.querySelector('#radioStationSelect');
    if(!slider||!needle||!glass||!freq||!station)return;

    tuner.dataset.topFmFix='1';
    const atFM=()=>tuner.querySelector('[data-band="FM"]')?.classList.contains('active');
    const needleX=ratio=>{const left=53,right=20;return left+ratio*Math.max(0,glass.clientWidth-left-right);};
    const ensureRange=()=>{if(atFM()){slider.min='88.1';slider.max='108.0';slider.step='0.1';}};

    function paint1079(){
      if(!atFM())return;
      ensureRange();
      slider.value='107.9';
      needle.style.opacity='1';
      const ratio=(107.9-88.1)/(108.0-88.1);
      needle.style.left=`${needleX(ratio).toFixed(1)}px`;
      if(knobMarker)knobMarker.style.transform=`rotate(${(ratio*240-120).toFixed(1)}deg)`;
      freq.textContent='107.9';
      if(units)units.textContent='MHz';
      station.textContent='KMLE • KMLE COUNTRY 107.9';
      if(status)status.textContent='107.9 FM • KMLE • TUNED';
      tuner.classList.add('is-tuned');
    }

    function paint108(){
      if(!atFM())return;
      ensureRange();
      slider.value='108.0';
      needle.style.opacity='1';
      needle.style.left=`${needleX(1).toFixed(1)}px`;
      if(knobMarker)knobMarker.style.transform='rotate(120deg)';
      freq.textContent='108.0';
      if(units)units.textContent='MHz';
      station.textContent='— FM BAND EDGE —';
      if(status)status.textContent='108.0 MHz • END OF BROADCAST FM';
      tuner.classList.remove('is-tuned');
    }

    function tune1079(play=true){
      paint1079();
      if(!play||!searchInput||!searchBtn||!select)return;
      searchInput.value='107.9';
      let finished=false;
      const pick=()=>{
        if(finished)return;
        const i=[...select.options].findIndex(o=>/107\.9|KMLE/i.test(o.textContent||''));
        if(i>=0){
          finished=true;
          observer.disconnect();
          select.selectedIndex=i;
          select.dispatchEvent(new Event('change',{bubbles:true}));
          setTimeout(paint1079,50);
        }
      };
      const observer=new MutationObserver(pick);
      observer.observe(select,{childList:true});
      searchBtn.click();
      setTimeout(()=>{pick();observer.disconnect();paint1079();},2200);
    }

    ensureRange();

    const goUp=e=>{
      if(!atFM())return;
      const v=Number(slider.value);
      if(v>=107.85){e.stopImmediatePropagation();paint108();return;}
      if(v>=107.65){e.stopImmediatePropagation();tune1079(true);}
    };
    const goDown=e=>{
      if(atFM()&&Number(slider.value)>=107.95){e.stopImmediatePropagation();tune1079(true);}
    };

    up?.addEventListener('click',goUp,true);
    next?.addEventListener('click',goUp,true);
    down?.addEventListener('click',goDown,true);
    prev?.addEventListener('click',goDown,true);

    slider.addEventListener('input',e=>{
      if(!atFM())return;
      const v=Number(slider.value);
      if(v>=107.95){e.stopImmediatePropagation();paint108();}
      else if(v>=107.85){e.stopImmediatePropagation();paint1079();}
    },true);
    slider.addEventListener('change',e=>{
      if(!atFM())return;
      const v=Number(slider.value);
      if(v>=107.95){e.stopImmediatePropagation();paint108();}
      else if(v>=107.85){e.stopImmediatePropagation();tune1079(true);}
    },true);

    tuner.querySelector('[data-band="FM"]')?.addEventListener('click',()=>setTimeout(ensureRange,0));
    window.addEventListener('resize',()=>{
      const v=Number(slider.value);
      if(atFM()&&v>=107.95)paint108();
      else if(atFM()&&v>=107.85)paint1079();
    },{passive:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
