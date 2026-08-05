(()=>{
  if(window.__astralisNovaOrbAlignmentV1)return;
  window.__astralisNovaOrbAlignmentV1=true;

  const install=()=>{
    if(document.getElementById('novaOrbAlignmentV1'))return;
    const style=document.createElement('style');
    style.id='novaOrbAlignmentV1';
    style.textContent=`
      #novaGuide .nova-orb{
        left:46%!important;
      }
      @media(max-width:560px){
        #novaGuide .nova-orb{
          left:46%!important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  install();
  if(!document.getElementById('novaGuide')){
    const observer=new MutationObserver(()=>{
      if(document.getElementById('novaGuide')){
        install();
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),20000);
  }
})();