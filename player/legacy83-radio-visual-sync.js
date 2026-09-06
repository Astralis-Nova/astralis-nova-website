(() => {
  'use strict';

  const EQ_FREQUENCIES=[60,170,310,600,1000,3000,6000,12000,14000,16000];
  let radioLive=false;
  let frame=0;
  let start=performance.now();
  let context=null;
  let source=null;
  let filters=[];
  let dryGain=null;
  let wetGain=null;
  let preDelay=null;
  let convolver=null;
  let graphReady=false;
  let recordArmed=false;

  function radioAudio(){ return window.legacy83KmleAudio || null; }

  function elements(){
    return {
      reel:document.querySelector('.reel-module'),
      cassette:document.querySelector('.cassette-module'),
      cassetteLabel:document.getElementById('cassetteModeLabel'),
      reverb:document.querySelector('.reverb-module'),
      needles:[...document.querySelectorAll('.vu-needle')],
      rings:[...document.querySelectorAll('.reverb-tunnel span')],
      preset:document.getElementById('reverbPreset')
    };
  }

  function clearVisuals(){
    const {reel,cassette,reverb,needles,rings}=elements();
    reel?.classList.remove('radio-visual-live');
    cassette?.classList.remove('radio-visual-live');
    reverb?.classList.remove('radio-visual-live');
    needles.forEach(n=>n.style.removeProperty('transform'));
    rings.forEach(r=>{
      r.style.removeProperty('transform');
      r.style.removeProperty('opacity');
      r.style.removeProperty('filter');
    });
  }

  function animate(){
    cancelAnimationFrame(frame);
    if(!radioLive){clearVisuals();return;}

    const {reel,cassette,reverb,needles,rings,preset}=elements();
    reel?.classList.add('radio-visual-live');
    cassette?.classList.add('radio-visual-live');
    reverb?.classList.add('radio-visual-live');

    const t=(performance.now()-start)/1000;
    const a=Math.sin(t*5.9);
    const b=Math.sin(t*9.7)*0.46;
    const c=Math.sin(t*2.8)*0.28;
    const beat=(a+b+c)/1.74;
    const level=Math.max(0,Math.min(1,(beat+1)/2));

    needles.forEach((n,i)=>{
      const angle=-40 + level*(58+i*5);
      n.style.transform=`rotate(${angle.toFixed(1)}deg)`;
    });

    if(preset?.value!=='off'){
      rings.forEach((r,i)=>{
        const scale=1 + level*(0.045+i*0.018);
        r.style.transform=`scale(${scale.toFixed(3)})`;
        r.style.opacity=String(Math.max(.28,1-i*.13+level*.12));
        r.style.filter=`brightness(${(0.9+level*.45).toFixed(2)})`;
      });
    }else{
      rings.forEach(r=>{
        r.style.removeProperty('transform');
        r.style.removeProperty('opacity');
        r.style.removeProperty('filter');
      });
    }

    frame=requestAnimationFrame(animate);
  }

  function buildImpulse(decay=1.1,depth=.35){
    if(!context||!convolver)return;
    const seconds=Math.max(.4,Math.min(5,Number(decay)||1.1));
    const rate=context.sampleRate;
    const length=Math.max(1,Math.floor(rate*seconds));
    const impulse=context.createBuffer(2,length,rate);
    const amount=Math.max(.05,Math.min(1,Number(depth)||.35));
    for(let ch=0;ch<2;ch++){
      const data=impulse.getChannelData(ch);
      for(let i=0;i<length;i++){
        const env=Math.pow(1-i/length,2.2+amount*2.2);
        data[i]=(Math.random()*2-1)*env*amount;
      }
    }
    convolver.buffer=impulse;
  }

  function eqSliders(){ return [...document.querySelectorAll('#eqBands input[type="range"]')].slice(0,10); }

  function syncEq(){
    if(!graphReady)return;
    const enabled=document.getElementById('eqPower')?.getAttribute('aria-pressed')!=='false';
    const sliders=eqSliders();
    filters.forEach((filter,i)=>{
      const raw=Number(sliders[i]?.value||0);
      filter.gain.setTargetAtTime(enabled&&Number.isFinite(raw)?raw:0,context.currentTime,.015);
    });
  }

  function syncReverb(){
    if(!graphReady)return;
    const preset=document.getElementById('reverbPreset')?.value||'off';
    const mix=Number(document.getElementById('reverbMix')?.value||0)/100;
    const depth=Number(document.getElementById('reverbDepth')?.value||35)/100;
    const decay=Number(document.getElementById('reverbDecay')?.value||1.1);
    const delayMs=Number(document.getElementById('reverbPreDelay')?.value||12);
    const wet=preset==='off'?0:Math.max(0,Math.min(.85,mix));
    dryGain.gain.setTargetAtTime(1-wet*.45,context.currentTime,.02);
    wetGain.gain.setTargetAtTime(wet,context.currentTime,.02);
    preDelay.delayTime.setTargetAtTime(Math.max(0,Math.min(.3,delayMs/1000)),context.currentTime,.02);
    buildImpulse(decay,depth);
  }

  async function ensureRadioGraph(){
    const audio=radioAudio();
    if(!audio)return false;
    if(graphReady){
      if(context?.state==='suspended')await context.resume().catch(()=>{});
      return true;
    }
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return false;
      context=new AC();
      source=context.createMediaElementSource(audio);
      filters=EQ_FREQUENCIES.map((frequency,i)=>{
        const f=context.createBiquadFilter();
        f.type=i===0?'lowshelf':i===EQ_FREQUENCIES.length-1?'highshelf':'peaking';
        f.frequency.value=frequency;
        if(f.type==='peaking')f.Q.value=1.05;
        return f;
      });
      filters.forEach((filter,i)=>{
        if(i===0)source.connect(filter);
        else filters[i-1].connect(filter);
      });
      const tail=filters[filters.length-1];
      dryGain=context.createGain();
      wetGain=context.createGain();
      preDelay=context.createDelay(.35);
      convolver=context.createConvolver();
      tail.connect(dryGain).connect(context.destination);
      tail.connect(preDelay).connect(convolver).connect(wetGain).connect(context.destination);
      graphReady=true;
      syncEq();
      syncReverb();
      await context.resume().catch(()=>{});
      document.body.classList.add('legacy83-radio-dsp');
      return true;
    }catch(error){
      console.warn('Legacy 83 radio DSP unavailable; keeping direct radio playback',error);
      document.body.classList.remove('legacy83-radio-dsp');
      return false;
    }
  }

  function setCassetteLabel(text){
    const label=document.getElementById('cassetteModeLabel');
    if(label)label.textContent=text;
  }

  function installCassetteRadioControls(){
    document.querySelectorAll('[data-cassette-action]').forEach(button=>{
      button.addEventListener('click',async event=>{
        if(!radioLive)return;
        const audio=radioAudio();
        if(!audio)return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const action=button.dataset.cassetteAction;
        const cassette=document.querySelector('.cassette-module');
        if(action==='play'){
          cassette?.classList.remove('is-ejected');
          await ensureRadioGraph();
          audio.play().catch(()=>{});
          setCassetteLabel('DOLBY B • RADIO PLAY');
          return;
        }
        if(action==='stop'){
          audio.pause();
          setCassetteLabel('DOLBY B • RADIO STOP');
          return;
        }
        if(action==='eject'){
          audio.pause();
          cassette?.classList.toggle('is-ejected');
          setCassetteLabel(cassette?.classList.contains('is-ejected')?'EJECT':'DOLBY B • READY');
          return;
        }
        if(action==='rewind'||action==='forward'){
          cassette?.classList.remove('is-rewinding','is-forwarding');
          cassette?.classList.add(action==='rewind'?'is-rewinding':'is-forwarding');
          setTimeout(()=>cassette?.classList.remove('is-rewinding','is-forwarding'),320);
          setCassetteLabel('LIVE RADIO • NO SEEK');
          return;
        }
        if(action==='record'){
          recordArmed=!recordArmed;
          button.setAttribute('aria-pressed',String(recordArmed));
          cassette?.classList.toggle('is-record-armed',recordArmed);
          setCassetteLabel(recordArmed?'REC MONITOR • RADIO':'DOLBY B • RADIO PLAY');
        }
      },true);
    });
  }

  function bindDspControls(){
    document.getElementById('eqBands')?.addEventListener('input',syncEq);
    document.getElementById('eqPower')?.addEventListener('click',()=>setTimeout(syncEq,0));
    document.getElementById('eqPreset')?.addEventListener('change',()=>setTimeout(syncEq,0));
    ['reverbPreset','reverbMix','reverbDepth','reverbDecay','reverbPreDelay'].forEach(id=>{
      document.getElementById(id)?.addEventListener('input',syncReverb);
      document.getElementById(id)?.addEventListener('change',syncReverb);
    });
    document.addEventListener('pointerdown',()=>{
      if(context?.state==='suspended')context.resume().catch(()=>{});
    },{passive:true});
  }

  const style=document.createElement('style');
  style.textContent=`
    .reel-module.radio-visual-live .r83-supply,
    .reel-module.radio-visual-live .r83-takeup{animation:legacy83RadioReelSpin 1.25s linear infinite}
    .cassette-module.radio-visual-live .cassette-window{animation:cassetteRadioPulse .75s ease-in-out infinite alternate}
    .reverb-module.radio-visual-live .reverb-tunnel{filter:brightness(1.08)}
    body.legacy83-radio-dsp #equalizer .window-title::after{content:' • RADIO DSP';color:#9fe7ff;font-size:.52rem;margin-left:8px}
    @keyframes legacy83RadioReelSpin{to{transform:rotate(360deg)}}
  `;
  document.head.appendChild(style);

  window.addEventListener('legacy83-radio-state',async e=>{
    radioLive=!!e.detail?.playing;
    start=performance.now();
    if(radioLive){
      await ensureRadioGraph();
      syncEq();
      syncReverb();
      setCassetteLabel(recordArmed?'REC MONITOR • RADIO':'DOLBY B • RADIO PLAY');
    }else if(!recordArmed){
      const label=document.getElementById('cassetteModeLabel');
      if(label&&label.textContent.includes('RADIO'))label.textContent='DOLBY B • READY';
    }
    animate();
  });

  bindDspControls();
  installCassetteRadioControls();
  window.addEventListener('pagehide',()=>{radioLive=false;cancelAnimationFrame(frame);clearVisuals();});
})();
