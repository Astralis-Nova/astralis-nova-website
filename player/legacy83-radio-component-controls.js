(() => {
  'use strict';

  let radioLive=false;
  let frame=0;
  let start=performance.now();

  const radioAudio=()=>window.legacy83KmleAudio||null;
  const cassette=()=>document.querySelector('.cassette-module');
  const cassetteLabel=()=>document.getElementById('cassetteModeLabel');
  const reverb=()=>document.querySelector('.reverb-module');
  const equalizer=()=>document.getElementById('equalizer');
  const rack=()=>document.querySelector('.component-rack');
  const playerWindow=()=>document.querySelector('.player-window');
  const needles=()=>[...document.querySelectorAll('.vu-needle')];
  const rings=()=>[...document.querySelectorAll('.reverb-tunnel span')];
  const eqSliders=()=>[...document.querySelectorAll('#eqBands input[type="range"]')];

  function setCassetteState(playing){
    const deck=cassette();
    deck?.classList.toggle('radio-visual-live',playing);
    deck?.classList.toggle('is-playing',playing);
    const play=document.querySelector('[data-cassette-action="play"]');
    play?.setAttribute('aria-pressed',String(playing));
    const label=cassetteLabel();
    if(label) label.textContent=playing?'DOLBY B • RADIO PLAY':'DOLBY B • READY';
  }

  function setRadioVisualState(playing){
    equalizer()?.classList.toggle('radio-visual-live',playing);
    rack()?.classList.toggle('radio-visual-live',playing);
    playerWindow()?.classList.toggle('radio-visual-live',playing);
    document.body.classList.toggle('legacy83-radio-components-live',playing);
  }

  function clearVisuals(){
    setCassetteState(false);
    setRadioVisualState(false);
    reverb()?.classList.remove('radio-visual-live');
    needles().forEach(n=>n.style.removeProperty('transform'));
    rings().forEach(r=>{
      r.style.removeProperty('transform');
      r.style.removeProperty('opacity');
      r.style.removeProperty('filter');
    });
    eqSliders().forEach(s=>s.style.removeProperty('filter'));
  }

  function visualReverbAmount(){
    const preset=document.getElementById('reverbPreset')?.value||'off';
    if(preset==='off')return 0;
    const mix=Number(document.getElementById('reverbMix')?.value||0)/100;
    const depth=Number(document.getElementById('reverbDepth')?.value||35)/100;
    return Math.max(.15,Math.min(1,(mix*.65)+(depth*.35)));
  }

  function animate(){
    cancelAnimationFrame(frame);
    if(!radioLive){clearVisuals();return;}

    setCassetteState(true);
    setRadioVisualState(true);
    reverb()?.classList.add('radio-visual-live');

    const t=(performance.now()-start)/1000;
    const beat=(Math.sin(t*5.7)+Math.sin(t*9.3)*.45+Math.sin(t*2.6)*.28)/1.73;
    const level=Math.max(0,Math.min(1,(beat+1)/2));

    needles().forEach((n,i)=>{
      const angle=-40+level*(58+i*5);
      n.style.setProperty('transform',`rotate(${angle.toFixed(1)}deg)`,'important');
    });

    const amount=visualReverbAmount();
    if(amount>0){
      rings().forEach((r,i)=>{
        const scale=1+level*amount*(0.04+i*0.017);
        r.style.setProperty('transform',`scale(${scale.toFixed(3)})`,'important');
        r.style.setProperty('opacity',String(Math.max(.28,1-i*.13+level*amount*.16)),'important');
        r.style.setProperty('filter',`brightness(${(0.92+level*amount*.55).toFixed(2)})`,'important');
      });
    }else{
      rings().forEach(r=>{
        r.style.removeProperty('transform');
        r.style.removeProperty('opacity');
        r.style.removeProperty('filter');
      });
    }

    const eqOn=document.getElementById('eqPower')?.getAttribute('aria-pressed')!=='false';
    eqSliders().forEach((slider,i)=>{
      if(!eqOn){slider.style.removeProperty('filter');return;}
      const value=Math.abs(Number(slider.value||0));
      const glow=.9+level*.3+Math.min(.25,value/48)+(i%2)*.02;
      slider.style.setProperty('filter',`brightness(${glow.toFixed(2)})`,'important');
    });

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
    .cassette-module.radio-visual-live .cassette-window{animation:cassetteRadioPulse .75s ease-in-out infinite alternate!important}
    .cassette-module.radio-visual-live .cassette-window::before{animation:cassetteTapeRadio 1.15s linear infinite!important}
    .reverb-module.radio-visual-live .reverb-tunnel{filter:brightness(1.08)}
    #equalizer.radio-visual-live .window-title .tagline::after{content:' • RADIO VISUAL';opacity:.8}
    #equalizer.radio-visual-live .eq-toolbar{animation:radioEqGlow 1.25s ease-in-out infinite alternate}
    .component-rack.radio-visual-live{animation:radioRackPulse 1.8s ease-in-out infinite alternate}
    .player-window.radio-visual-live #visualizer{animation:radioScreenPulse 1.4s ease-in-out infinite alternate}

    body[data-skin="nova"].legacy83-radio-components-live .component-rack,
    body[data-skin="nova"].legacy83-radio-components-live #equalizer{box-shadow:0 0 24px rgba(73,223,255,.18),0 0 42px rgba(157,102,255,.10),inset 0 0 18px rgba(73,223,255,.06)}
    body[data-skin="nova"].legacy83-radio-components-live .reverb-tunnel{filter:drop-shadow(0 0 10px rgba(73,223,255,.55))}

    body[data-skin="desert"].legacy83-radio-components-live .component-rack,
    body[data-skin="desert"].legacy83-radio-components-live #equalizer{box-shadow:0 0 24px rgba(255,179,90,.18),0 0 40px rgba(218,105,255,.08),inset 0 0 18px rgba(255,179,90,.06)}
    body[data-skin="desert"].legacy83-radio-components-live .reverb-tunnel{filter:drop-shadow(0 0 10px rgba(255,179,90,.5))}

    body[data-skin="classic"].legacy83-radio-components-live .component-rack,
    body[data-skin="classic"].legacy83-radio-components-live #equalizer{box-shadow:0 0 20px rgba(141,255,103,.16),inset 0 0 16px rgba(141,255,103,.06)}
    body[data-skin="classic"].legacy83-radio-components-live .reverb-tunnel{filter:drop-shadow(0 0 9px rgba(141,255,103,.5))}
    body[data-skin="classic"].legacy83-radio-components-live .meter-module{filter:sepia(.15) saturate(1.15)}

    body[data-skin="legacy83"].legacy83-radio-components-live .component-rack,
    body[data-skin="legacy83"].legacy83-radio-components-live #equalizer{box-shadow:0 0 22px rgba(57,168,255,.18),inset 0 0 18px rgba(57,168,255,.05)}

    @keyframes cassetteRadioPulse{from{filter:brightness(.92)}to{filter:brightness(1.18)}}
    @keyframes cassetteTapeRadio{to{background-position:120px 0,-120px 0,0 0}}
    @keyframes radioEqGlow{from{filter:brightness(.96)}to{filter:brightness(1.12)}}
    @keyframes radioRackPulse{from{filter:brightness(.985)}to{filter:brightness(1.035)}}
    @keyframes radioScreenPulse{from{filter:brightness(.96)}to{filter:brightness(1.08)}}
  `;
  document.head.appendChild(style);

  window.addEventListener('legacy83-radio-state',e=>{
    radioLive=!!e.detail?.playing;
    start=performance.now();
    animate();
  });

  ['reverbPreset','reverbMix','reverbDepth','reverbDecay','reverbPreDelay','eqPower','eqPreset'].forEach(id=>{
    document.getElementById(id)?.addEventListener('input',()=>{if(radioLive)animate();});
    document.getElementById(id)?.addEventListener('change',()=>{if(radioLive)animate();});
  });

  document.getElementById('skinSelect')?.addEventListener('change',()=>{if(radioLive)requestAnimationFrame(animate);});
  installCassetteControls();
  window.addEventListener('pagehide',()=>{radioLive=false;cancelAnimationFrame(frame);clearVisuals();});
})();
