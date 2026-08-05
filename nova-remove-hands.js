(()=>{
  if(window.__astralisNovaRemoveHandsV2)return;
  window.__astralisNovaRemoveHandsV2=true;

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
    let style=document.getElementById('novaRemoveHandsStylesV2');
    if(!style){
      style=document.createElement('style');
      style.id='novaRemoveHandsStylesV2';
      style.textContent=css;
      document.head.appendChild(style);
    }
    const root=document.getElementById('novaGuide');
    if(!root)return false;
    root.querySelectorAll('.nova-hand,#novaLeft,#novaRight').forEach(el=>el.remove());
    root.querySelector('.nova-orb-wrap')?.classList.remove('wave');
    return true;
  };

  if(clean())return;

  const observer=new MutationObserver(()=>{
    if(clean())observer.disconnect();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),8000);
})();