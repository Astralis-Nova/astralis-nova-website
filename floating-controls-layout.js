(()=>{
  if(window.__astralisFloatingControlsLayoutV1)return;
  window.__astralisFloatingControlsLayoutV1=true;

  const style=document.createElement('style');
  style.id='astralisFloatingControlsLayoutV1';
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
    if(!ship||!placeSignal())return false;
    if(!ship.dataset.centeredSignal){
      ship.dataset.centeredSignal='true';
      ship.addEventListener('click',()=>requestAnimationFrame(placeSignal),true);
      window.addEventListener('resize',placeSignal,{passive:true});
    }
    return true;
  };

  if(!attach()){
    const observer=new MutationObserver(()=>{
      if(attach())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),8000);
  }
})();