(() => {
  'use strict';

  function installDualCassetteDeck(){
    const module=document.querySelector('.cassette-module');
    const stage=module?.querySelector('.cassette-stage');
    const deckA=stage?.querySelector('.cassette');
    const counterA=stage?.querySelector('.cassette-counter');
    if(!module||!stage||!deckA||stage.querySelector('.cassette.deck-b'))return;

    module.classList.add('is-dual-deck');
    module.querySelector('.hifi-label span:first-child').textContent='DUAL STEREO CASSETTE DECK';

    deckA.classList.add('deck-a');
    const badgeA=document.createElement('span');
    badgeA.className='cassette-deck-badge';
    badgeA.textContent='DECK A • PLAY';
    deckA.appendChild(badgeA);

    const deckB=deckA.cloneNode(true);
    deckB.classList.remove('deck-a');
    deckB.classList.add('deck-b');
    deckB.querySelector('.cassette-deck-badge').textContent='DECK B • REC / DUB';
    deckB.querySelector('.cassette-name').textContent='ASTRALIS NOVA • TYPE II • DUB';
    stage.insertBefore(deckB,counterA);

    if(counterA){
      counterA.classList.add('counter-a');
      const counterB=counterA.cloneNode(true);
      counterB.classList.remove('counter-a');
      counterB.classList.add('counter-b');
      counterB.setAttribute('aria-label','Cassette deck B counter');
      stage.insertBefore(counterB,stage.querySelector('.cassette-controls'));
    }

    const controls=stage.querySelector('.cassette-controls');
    if(controls){
      controls.insertAdjacentHTML('beforebegin','<div class="cassette-dub-strip" aria-hidden="true"><span>DECK A</span><b>HIGH SPEED DUBBING</b><span>DECK B</span></div>');
    }

    const style=document.createElement('style');
    style.textContent=`
      .cassette-module.is-dual-deck{min-height:404px}
      .cassette-module.is-dual-deck .cassette-stage{
        height:366px;
        grid-template-columns:minmax(0,1fr) minmax(0,1fr);
        grid-template-rows:184px 42px 34px 66px;
        gap:8px 12px;
        padding:12px 16px;
      }
      .cassette-module.is-dual-deck .cassette{width:100%;height:176px;grid-row:1;margin:0}
      .cassette-module.is-dual-deck .cassette.deck-a{grid-column:1}
      .cassette-module.is-dual-deck .cassette.deck-b{grid-column:2}
      .cassette-deck-badge{
        position:absolute;left:10px;top:8px;z-index:4;padding:2px 6px;border:1px solid #77736c;
        border-radius:2px;color:#e9e4da;background:#202428;font-size:.4rem;font-weight:900;letter-spacing:.12em;
        box-shadow:0 1px 3px #0009;
      }
      .cassette-module.is-dual-deck .cassette::before{top:28px}
      .cassette-module.is-dual-deck .cassette-window{top:52px;height:78px}
      .cassette-module.is-dual-deck .cassette-name{bottom:7px;font-size:.46rem}
      .cassette-module.is-dual-deck .cassette-counter{grid-row:2;margin:0;align-self:center;justify-self:center;width:min(150px,88%)}
      .cassette-module.is-dual-deck .cassette-counter.counter-a{grid-column:1}
      .cassette-module.is-dual-deck .cassette-counter.counter-b{grid-column:2}
      .cassette-dub-strip{
        grid-column:1/-1;grid-row:3;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;
        color:#aaa79f;font-size:.4rem;letter-spacing:.12em;text-align:center;border-top:1px solid #4f5355;border-bottom:1px solid #383b3d;
      }
      .cassette-dub-strip b{color:#d8d2c8;font-size:.43rem;letter-spacing:.15em}
      .cassette-controls{grid-row:4!important}
      .cassette-module.is-playing .deck-b .cassette-hub{animation-duration:1.18s}
      .cassette-module.is-record-armed .deck-b{box-shadow:inset 0 0 0 4px #0b0d0f,inset 0 0 28px #000c,0 6px 13px #000c,0 0 13px #d53a3055}
      @media(max-width:620px){
        .cassette-module.is-dual-deck{min-height:332px}
        .cassette-module.is-dual-deck .cassette-stage{height:294px;grid-template-rows:142px 34px 28px 58px;padding:9px 8px;gap:6px}
        .cassette-module.is-dual-deck .cassette{height:136px}
        .cassette-module.is-dual-deck .cassette::before{display:none}
        .cassette-module.is-dual-deck .cassette-window{top:32px;height:66px;left:8%;right:8%}
        .cassette-module.is-dual-deck .cassette-hub{width:38px;border-width:6px}
        .cassette-module.is-dual-deck .cassette-name{font-size:.34rem;letter-spacing:.08em}
        .cassette-deck-badge{font-size:.31rem;letter-spacing:.06em;top:6px;left:6px}
        .cassette-module.is-dual-deck .cassette-counter{padding:4px 3px}
        .cassette-module.is-dual-deck .cassette-counter span{font-size:.56rem}
        .cassette-dub-strip{font-size:.3rem;gap:4px}.cassette-dub-strip b{font-size:.31rem;letter-spacing:.06em}
      }
    `;
    document.head.appendChild(style);

    const audio=document.getElementById('audio');
    const counterB=stage.querySelector('.cassette-counter.counter-b');
    const syncDeckBCounter=()=>{
      if(!audio||!counterB)return;
      const count=Math.max(0,Math.floor((Number.isFinite(audio.currentTime)?audio.currentTime:0)*2)+83)%10000;
      const digits=String(count).padStart(4,'0').split('');
      counterB.querySelectorAll('span').forEach((span,i)=>span.textContent=digits[i]||'0');
    };
    audio?.addEventListener('timeupdate',syncDeckBCounter);
    audio?.addEventListener('loadedmetadata',syncDeckBCounter);
    syncDeckBCounter();
  }

  function installTurntableTracking(){
    const audio=document.getElementById('audio');
    const module=document.querySelector('.turntable-module');
    const tonearm=module?.querySelector('.tonearm');
    if(!audio||!module||!tonearm)return;

    let frame=0;
    let lastAngle=6;

    const positionAngle=()=>{
      if(Number.isFinite(audio.duration)&&audio.duration>0){
        const progress=Math.min(1,Math.max(0,audio.currentTime/audio.duration));
        return -7-(progress*12);
      }
      return -7;
    };

    const paint=()=>{
      const playing=!audio.paused&&!audio.ended&&module.classList.contains('is-powered');
      const cued=module.classList.contains('is-cued');
      if(playing||audio.currentTime>0)lastAngle=positionAngle();
      else if(audio.currentTime===0)lastAngle=6;
      const lift=cued?' translateY(-8px)':'';
      tonearm.style.transform=`rotate(${lastAngle.toFixed(2)}deg)${lift}`;
      tonearm.style.transition=playing?'transform .55s linear':'transform .7s cubic-bezier(.2,.75,.25,1)';
      if(playing)frame=requestAnimationFrame(paint);
    };

    const startTracking=()=>{cancelAnimationFrame(frame);lastAngle=positionAngle();paint();};
    const stopTracking=()=>{cancelAnimationFrame(frame);paint();};
    const returnArm=()=>{
      cancelAnimationFrame(frame);
      lastAngle=6;
      tonearm.style.transform='rotate(6deg)';
      tonearm.style.transition='transform .85s cubic-bezier(.2,.75,.25,1)';
    };

    audio.addEventListener('play',startTracking);
    audio.addEventListener('playing',startTracking);
    audio.addEventListener('pause',stopTracking);
    audio.addEventListener('seeking',paint);
    audio.addEventListener('timeupdate',()=>{if(audio.paused)paint();});
    audio.addEventListener('loadedmetadata',()=>{if(audio.currentTime===0)returnArm();else paint();});
    audio.addEventListener('ended',()=>setTimeout(returnArm,350));

    module.querySelectorAll('[data-turntable-action]').forEach(button=>button.addEventListener('click',()=>setTimeout(()=>{
      if(audio.currentTime===0&&audio.paused)returnArm();else paint();
    },0)));

    paint();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>{installDualCassetteDeck();installTurntableTracking();},{once:true});
  }else{
    installDualCassetteDeck();
    installTurntableTracking();
  }
})();
