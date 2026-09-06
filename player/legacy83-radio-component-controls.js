(() => {
  'use strict';

  let radioLive=false;
  let frame=0;
  let start=performance.now();

  const radioAudio=()=>window.legacy83KmleAudio||null;
  const cassette=()=>document.querySelector('.cassette-module');
  const cassetteLabel=()=>document.getElementById('cassetteModeLabel');
  const reverb=()=>document.querySelector('.reverb-module');
  const needles=()=>[...document.querySelectorAll('.vu-needle')];
  const rings=()=>[...document.querySelectorAll('.reverb-tunnel span')];

  function setCassetteState(playing){
    const deck=cassette();
    deck?.classList.toggle('radio-visual-live',playing);
    deck?.classList.toggle('is-playing',playing);
    const play=document.querySelector('[data-cassette-action="play"]');
    play?.setAttribute('aria-pressed',String(playing));
    const label=cassetteLabel();
    if(label) label.textContent=playing?'DOLBY B • RADIO PLAY':'DOLBY B • READY';
  }

  function clearVisuals(){
    setCassetteState(false);
    reverb()?.classList.remove('radio-visual-live');
    needles().forEach(n=>n.style.removeProperty('transform'));
    rings().forEach(r=>{
      r.style.removeProperty('transform');
      r.style.removeProperty('opacity');
      r.style.removeProperty('filter');
    });
  }

  function animate(){
    cancelAnimationFrame(frame);
    if(!radioLive){clearVisuals();return;}

    setCassetteState(true);
    reverb()?.classList.add('radio-visual-live');

    const t=(performance.now()-start)/1000;
    const beat=(Math.sin(t*5.7)+Math.sin(t*9.3)*.45+Math.sin(t*2.6)*.28)/1.73;
    const level=Math.max(0,Math.min(1,(beat+1)/2));

    needles().forEach((n,i)=>{
      const angle=-40+level*(58+i*5);
      n.style.transform=`rotate(${angle.toFixed(1)}deg)`;
    });

    const preset=document.getElementById('reverbPreset')?.value||'off';
    if(preset!=='off'){
      rings().forEach((r,i)=>{
        const scale=1+level*(0.04+i*0.017);
        r.style.transform=`scale(${scale.toFixed(3)})`;
        r.style.opacity=String(Math.max(.3,1-i*.13+level*.1));
        r.style.filter=`brightness(${(0.92+level*.4).toFixed(2)})`;
      });
    }else{
      rings().forEach(r=>{
        r.style.removeProperty('transform');
        r.style.removeProperty('opacity');
        r.style.removeProperty('filter');
      });
    }

    frame=requestAnimationFrame(animate);
  }

  function installCassetteControls(){
    document.querySelectorAll('[data-cassette-action]').forEach(button=>{
      button.addEventListener('click',event=>{
        if(!radioLive)return;
        const audio=radioAudio();
        if(!audio)return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const action=button.dataset.cassetteAction;
        const deck=cassette();
        const label=cassetteLabel();

        if(action==='play'){
          deck?.classList.remove('is-ejected');
          audio.play().catch(()=>{});
          setCassetteState(true);
          return;
        }
        if(action==='stop'){
          audio.pause();
          setCassetteState(false);
          return;
        }
        if(action==='eject'){
          audio.pause();
          deck?.classList.toggle('is-ejected');
          if(label) label.textContent=deck?.classList.contains('is-ejected')?'EJECT':'DOLBY B • READY';
          return;
        }
        if(action==='rewind'||action==='forward'){
          deck?.classList.remove('is-rewinding','is-forwarding');
          deck?.classList.add(action==='rewind'?'is-rewinding':'is-forwarding');
          setTimeout(()=>deck?.classList.remove('is-rewinding','is-forwarding'),320);
          if(label) label.textContent='LIVE RADIO • NO SEEK';
          setTimeout(()=>{if(radioLive&&label)label.textContent='DOLBY B • RADIO PLAY';},700);
          return;
        }
        if(action==='record'){
          const armed=button.getAttribute('aria-pressed')!=='true';
          button.setAttribute('aria-pressed',String(armed));
          deck?.classList.toggle('is-record-armed',armed);
          if(label) label.textContent=armed?'REC MONITOR • RADIO':'DOLBY B • RADIO PLAY';
        }
      },true);
    });
  }

  const style=document.createElement('style');
  style.textContent=`
    .cassette-module.radio-visual-live .cassette-window{animation:cassetteRadioPulse .75s ease-in-out infinite alternate}
    .reverb-module.radio-visual-live .reverb-tunnel{filter:brightness(1.08)}
  `;
  document.head.appendChild(style);

  window.addEventListener('legacy83-radio-state',e=>{
    radioLive=!!e.detail?.playing;
    start=performance.now();
    animate();
  });

  document.getElementById('reverbPreset')?.addEventListener('change',()=>{if(radioLive)animate();});
  installCassetteControls();
  window.addEventListener('pagehide',()=>{radioLive=false;cancelAnimationFrame(frame);clearVisuals();});
})();
