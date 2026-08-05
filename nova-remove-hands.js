(()=>{
  if(window.__astralisNovaCleanupV4)return;
  window.__astralisNovaCleanupV4=true;

  const css=`
    #novaGuide .nova-hand,
    #novaGuide #novaLeft,
    #novaGuide #novaRight{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
      animation:none!important;
    }
    #novaGuide .nova-orb-wrap{
      width:104px!important;
      min-width:104px!important;
      height:104px!important;
      display:grid!important;
      place-items:center!important;
      position:relative!important;
      overflow:visible!important;
    }
    #novaGuide .nova-orb{
      position:relative!important;
      left:auto!important;
      right:auto!important;
      top:auto!important;
      margin:0!important;
      transform:none!important;
    }
    @media(max-width:560px){
      #novaGuide .nova-orb-wrap{
        width:84px!important;
        min-width:84px!important;
        height:84px!important;
      }
    }
  `;

  const clean=()=>{
    let style=document.getElementById('novaCleanupStylesV4');
    if(!style){
      style=document.createElement('style');
      style.id='novaCleanupStylesV4';
      style.textContent=css;
      document.head.appendChild(style);
    }

    const musicToggle=document.getElementById('musicToggle');
    if(musicToggle){
      musicToggle.hidden=false;
      musicToggle.removeAttribute('aria-hidden');
      musicToggle.tabIndex=0;
      musicToggle.style.removeProperty('display');
      musicToggle.style.removeProperty('visibility');
      musicToggle.style.removeProperty('opacity');
      musicToggle.style.removeProperty('pointer-events');
    }

    const root=document.getElementById('novaGuide');
    if(!root)return false;
    root.querySelectorAll('.nova-hand,#novaLeft,#novaRight').forEach(el=>el.remove());
    root.querySelector('.nova-orb-wrap')?.classList.remove('wave');
    return true;
  };

  if(clean())return;
  const observer=new MutationObserver(()=>{if(clean())observer.disconnect()});
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),5000);
})();