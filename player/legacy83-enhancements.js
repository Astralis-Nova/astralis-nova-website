(() => {
  'use strict';

  function installCassetteDeckFix(){
    const module=document.querySelector('.cassette-module');
    const stage=module?.querySelector('.cassette-stage');
    const cassette=stage?.querySelector('.cassette');
    if(!module||!stage||!cassette)return;

    stage.querySelectorAll('.cassette.deck-b,.cassette-counter.counter-b,.cassette-dub-strip').forEach(el=>el.remove());
    module.classList.remove('is-dual-deck');
    module.classList.add('true-dual-cassette');
    const label=module.querySelector('.hifi-label span:first-child');
    if(label)label.textContent='DUAL STEREO CASSETTE DECK';

    let badge=stage.querySelector('.true-dual-labels');
    if(!badge){
      badge=document.createElement('div');
      badge.className='true-dual-labels';
      badge.innerHTML='<span>DECK A</span><b>HIGH SPEED DUBBING • DOLBY B</b><span>DECK B</span>';
      stage.prepend(badge);
    }

    const style=document.createElement('style');
    style.textContent=`
      .true-dual-cassette{grid-column:1/-1!important;min-height:338px}
      .true-dual-cassette .cassette-stage{height:300px;display:grid;grid-template-columns:minmax(0,1fr) 82px;grid-template-rows:28px 178px 66px;gap:8px 12px;padding:12px 18px}
      .true-dual-labels{grid-column:1/-1;grid-row:1;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;color:#e8e3d9;font-size:.44rem;font-weight:900;letter-spacing:.13em;text-align:center;border-bottom:1px solid #56595b;padding-bottom:5px}
      .true-dual-labels b{font-size:.36rem;color:#aaa79f;letter-spacing:.1em}
      .true-dual-cassette .cassette{grid-column:1;grid-row:2;width:min(760px,100%);height:168px;justify-self:center}
      .true-dual-cassette .cassette-counter{grid-column:2;grid-row:2;margin-top:22px}
      .true-dual-cassette .cassette-controls{grid-column:1/-1;grid-row:3}
      .true-dual-cassette .cassette::before{content:'DECK A                                      DECK B';font-size:.46rem;letter-spacing:.13em;top:9px;white-space:pre}
      .true-dual-cassette .cassette-window{left:3%;right:3%;top:38px;height:94px;border:0;background:radial-gradient(circle at 12% 50%,#d2cdc3 0 7%,#211e1a 7.5% 12%,#0d0c0b 12.5% 16%,transparent 16.5%),radial-gradient(circle at 36% 50%,#d2cdc3 0 7%,#211e1a 7.5% 12%,#0d0c0b 12.5% 16%,transparent 16.5%),radial-gradient(circle at 64% 50%,#d2cdc3 0 7%,#211e1a 7.5% 12%,#0d0c0b 12.5% 16%,transparent 16.5%),radial-gradient(circle at 88% 50%,#d2cdc3 0 7%,#211e1a 7.5% 12%,#0d0c0b 12.5% 16%,transparent 16.5%),linear-gradient(90deg,#100d0b 0 47.5%,#77736b 47.7% 52.3%,#100d0b 52.5% 100%);box-shadow:inset 0 0 18px #000,inset 0 0 0 3px #aaa59b,0 1px #fff3}
      .true-dual-cassette .cassette-window::after{content:'';position:absolute;left:49.85%;top:0;bottom:0;width:2px;background:#77736b;box-shadow:0 0 0 1px #151515}
      .true-dual-cassette .cassette-hub{display:none}
      .legacy83-radio-live .true-dual-cassette .cassette-window{animation:cassetteRadioPulse .9s ease-in-out infinite alternate}
      @keyframes cassetteRadioPulse{from{filter:brightness(.92)}to{filter:brightness(1.14)}}
      @media(max-width:620px){.true-dual-cassette{min-height:326px}.true-dual-cassette .cassette-stage{height:288px;grid-template-columns:minmax(0,1fr) 58px;grid-template-rows:25px 168px 58px;padding:9px}.true-dual-labels{font-size:.34rem}.true-dual-labels b{font-size:.28rem}.true-dual-cassette .cassette{height:158px}.true-dual-cassette .cassette::before{font-size:.34rem;letter-spacing:.05em}.true-dual-cassette .cassette-window{height:88px;top:35px}}
    `;
    document.head.appendChild(style);
  }

  function installReverbDeckFinish(){
    const module=document.querySelector('.reverb-module');
    const display=module?.querySelector('.reverb-display');
    if(!module||!display)return;
    module.classList.add('complete-reverb-deck');
    const label=module.querySelector('.hifi-label span:first-child');
    if(label)label.textContent='STEREO REVERBERATOR / AMBIENCE PROCESSOR';

    const style=document.createElement('style');
    style.textContent=`
      .complete-reverb-deck{grid-column:1/-1!important;min-height:438px}
      .complete-reverb-deck .reverb-display{height:400px;grid-template-columns:minmax(0,1.55fr) minmax(260px,.75fr);grid-template-rows:1fr;gap:16px;padding:18px;background:linear-gradient(180deg,#181b1e,#07090b)}
      .complete-reverb-deck .reverb-tunnel{height:330px;align-self:center;border-width:7px;background:radial-gradient(ellipse at center,#64c9ff60 0,#156ba46b 18%,#062641 42%,#01060d 75%);box-shadow:inset 0 0 80px #149dffaa,inset 0 0 0 2px #55bffc55,0 0 24px #138de86b}
      .complete-reverb-deck .reverb-tunnel span{border-width:3px;transition:transform .08s linear,opacity .08s linear,box-shadow .08s linear}
      .complete-reverb-deck .r83-reverb-console{align-self:center;min-height:330px;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:18px;background:repeating-linear-gradient(90deg,#fff0 0 2px,#ffffff10 2px 3px,#00000008 3px 5px),linear-gradient(180deg,#d1cec5,#858681 52%,#bbb8af)}
      .complete-reverb-deck .r83-reverb-preset{font-size:.52rem}
      .complete-reverb-deck .r83-reverb-preset select{padding:11px 8px;font-size:.72rem}
      .complete-reverb-deck .r83-reverb-sliders{grid-template-columns:1fr;gap:14px}
      .complete-reverb-deck .r83-reverb-sliders label{font-size:.49rem}
      .complete-reverb-deck .r83-reverb-sliders input{height:22px}
      .complete-reverb-deck.is-active .reverb-tunnel{filter:brightness(calc(var(--reverb-brightness,1) * 1.08))}
      @media(max-width:760px){.complete-reverb-deck{min-height:650px}.complete-reverb-deck .reverb-display{height:612px;grid-template-columns:1fr;grid-template-rows:270px 1fr;padding:12px}.complete-reverb-deck .reverb-tunnel{height:260px}.complete-reverb-deck .r83-reverb-console{min-height:300px}}
    `;
    document.head.appendChild(style);

    const audio=document.getElementById('audio');
    const preset=document.getElementById('reverbPreset');
    const sync=()=>module.classList.toggle('is-active',!audio?.paused && preset?.value!=='off');
    audio?.addEventListener('play',sync);audio?.addEventListener('pause',sync);audio?.addEventListener('ended',sync);preset?.addEventListener('change',sync);sync();
  }

  function installTurntableTracking(){
    const audio=document.getElementById('audio');
    const module=document.querySelector('.turntable-module');
    const tonearm=module?.querySelector('.tonearm');
    const stage=module?.querySelector('.turntable-stage');
    if(!audio||!module||!tonearm)return;
    let frame=0,lastAngle=6;
    const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
    const positionAngle=()=>{const width=stage?.clientWidth||innerWidth;const start=width<=620?6:width<=950?5:1;const end=width<=620?-9:width<=950?-12:-11;if(Number.isFinite(audio.duration)&&audio.duration>0){const progress=Math.min(1,Math.max(0,audio.currentTime/audio.duration));return start+((end-start)*progress);}return start;};
    const paint=()=>{const playing=!audio.paused&&!audio.ended&&module.classList.contains('is-powered');const cued=module.classList.contains('is-cued');if(playing||audio.currentTime>0)lastAngle=positionAngle();else if(audio.currentTime===0)lastAngle=6;const now=performance.now();const grooveMotion=playing&&!reduceMotion.matches?(Math.sin(now/850)*.72)+(Math.sin(now/310)*.2):0;const lift=cued?' translateY(-8px)':'';tonearm.style.transform=`rotate(${(lastAngle+grooveMotion).toFixed(2)}deg)${lift}`;tonearm.style.transition=playing?'transform .12s linear':'transform .7s cubic-bezier(.2,.75,.25,1)';if(playing)frame=requestAnimationFrame(paint);};
    const startTracking=()=>{cancelAnimationFrame(frame);lastAngle=positionAngle();paint();};
    const stopTracking=()=>{cancelAnimationFrame(frame);paint();};
    const returnArm=()=>{cancelAnimationFrame(frame);lastAngle=6;tonearm.style.transform='rotate(6deg)';tonearm.style.transition='transform .85s cubic-bezier(.2,.75,.25,1)';};
    audio.addEventListener('play',startTracking);audio.addEventListener('playing',startTracking);audio.addEventListener('pause',stopTracking);audio.addEventListener('seeking',paint);audio.addEventListener('timeupdate',()=>{if(audio.paused)paint();});audio.addEventListener('loadedmetadata',()=>{if(audio.currentTime===0)returnArm();else paint();});audio.addEventListener('ended',()=>setTimeout(returnArm,350));window.addEventListener('resize',paint);module.querySelectorAll('[data-turntable-action]').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{if(audio.currentTime===0&&audio.paused)returnArm();else paint();},0)));paint();
  }

  function installRadioRackSync(){
    const audio=document.getElementById('audio');
    const reel=document.querySelector('.reel-module');
    const cassette=document.querySelector('.cassette-module');
    const turntable=document.querySelector('.turntable-module');
    const reverb=document.querySelector('.reverb-module');
    const preset=document.getElementById('reverbPreset');
    const needles=[...document.querySelectorAll('.vu-needle')];
    const rings=[...document.querySelectorAll('.reverb-tunnel span')];
    if(!audio)return;

    let radioLive=false,frame=0,start=performance.now();
    const forceState=playing=>{
      reel?.classList.toggle('is-playing',playing);
      cassette?.classList.toggle('is-playing',playing);
      turntable?.classList.toggle('is-playing',playing);
      if(turntable)turntable.classList.add('is-powered');
      if(reverb)reverb.classList.toggle('is-active',playing&&preset?.value!=='off');
      document.body.classList.toggle('legacy83-radio-live',radioLive&&playing);
    };
    const animateFallback=()=>{
      cancelAnimationFrame(frame);
      if(!radioLive||audio.paused||audio.ended){needles.forEach(n=>n.style.removeProperty('transform'));rings.forEach(r=>{r.style.removeProperty('transform');r.style.removeProperty('opacity')});return;}
      const t=(performance.now()-start)/1000;
      const beat=(Math.sin(t*6.4)+Math.sin(t*10.7)*.45+Math.sin(t*3.1)*.3)/1.75;
      needles.forEach((n,i)=>{const angle=-38+((beat+1)/2)*(56+i*4);n.style.transform=`rotate(${angle.toFixed(1)}deg)`;});
      if(preset?.value!=='off')rings.forEach((r,i)=>{const pulse=1+Math.max(0,beat)*(.055+i*.018);r.style.transform=`scale(${pulse.toFixed(3)})`;r.style.opacity=String(Math.max(.28,1-i*.13+beat*.1));});
      frame=requestAnimationFrame(animateFallback);
    };

    window.addEventListener('legacy83-radio-state',e=>{
      radioLive=!!e.detail?.playing;
      forceState(radioLive&&!audio.paused);
      start=performance.now();animateFallback();
    });
    audio.addEventListener('playing',()=>{forceState(true);if(radioLive)animateFallback();});
    audio.addEventListener('play',()=>{forceState(true);if(radioLive)animateFallback();});
    audio.addEventListener('pause',()=>{forceState(false);if(radioLive)animateFallback();});
    audio.addEventListener('ended',()=>{radioLive=false;forceState(false);animateFallback();});
    preset?.addEventListener('change',()=>{forceState(!audio.paused&&!audio.ended);if(radioLive)animateFallback();});
  }

  const install=()=>{installCassetteDeckFix();installReverbDeckFinish();installTurntableTracking();installRadioRackSync();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();