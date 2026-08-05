(()=>{
  if(window.__astralisFloatingControlsLayoutV2)return;
  window.__astralisFloatingControlsLayoutV2=true;

  const style=document.createElement('style');
  style.id='astralisFloatingControlsLayoutV2';
  style.textContent=`
    #feelingTipsyButton{
      left:50%!important;
      right:auto!important;
      bottom:18px!important;
      transform:translateX(18px)!important;
    }
    #shipSignal{
      position:fixed!important;
      left:50%!important;
      right:auto!important;
      top:auto!important;
      bottom:84px!important;
      transform:translateX(calc(-100% - 18px))!important;
      max-width:min(260px,calc(100vw - 32px))!important;
      z-index:939!important;
    }
    .tipsy-subtitle{
      margin:0 0 7px!important;
      color:#ffbf78!important;
      font-size:.9rem!important;
      font-weight:900!important;
      letter-spacing:.05em!important;
    }
    @media(max-width:640px){
      #feelingTipsyButton{
        bottom:12px!important;
        transform:translateX(10px)!important;
      }
      #shipSignal{
        bottom:76px!important;
        transform:translateX(calc(-100% - 10px))!important;
        max-width:min(220px,calc(50vw - 18px))!important;
      }
    }
  `;
  document.head.appendChild(style);

  const updateMissionLabel=()=>{
    const button=document.getElementById('feelingTipsyButton');
    const label=button?.querySelector('.tipsy-text');
    const title=document.getElementById('feelingTipsyTitle');
    const kicker=document.querySelector('#feelingTipsyPanel .tipsy-kicker');
    if(!button||!label||!title)return false;

    label.textContent='Support the Mission';
    button.setAttribute('aria-label','Open Support the Mission tip jar');
    title.textContent='Support the Mission';

    if(kicker){
      kicker.textContent='Feeling Tipsy?';
      kicker.classList.add('tipsy-subtitle');
    }
    return true;
  };

  const placeSignal=()=>{
    const signal=document.getElementById('shipSignal');
    if(!signal)return false;
    signal.style.setProperty('left','50%','important');
    signal.style.setProperty('right','auto','important');
    signal.style.setProperty('top','auto','important');
    signal.style.setProperty('bottom',matchMedia('(max-width:640px)').matches?'76px':'84px','important');
    signal.style.setProperty('transform',matchMedia('(max-width:640px)').matches?'translateX(calc(-100% - 10px))':'translateX(calc(-100% - 18px))','important');
    return true;
  };

  const attach=()=>{
    const ship=document.getElementById('roamingStarship');
    const missionReady=updateMissionLabel();
    const signalReady=placeSignal();
    if(ship&&signalReady&&!ship.dataset.centeredSignal){
      ship.dataset.centeredSignal='true';
      ship.addEventListener('click',()=>requestAnimationFrame(placeSignal),true);
      window.addEventListener('resize',placeSignal,{passive:true});
    }
    return Boolean(missionReady&&signalReady);
  };

  if(!attach()){
    const observer=new MutationObserver(()=>{
      if(attach())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
})();