(()=>{
  if(window.__astralisNovaOrbAlignmentV2)return;
  window.__astralisNovaOrbAlignmentV2=true;

  const install=()=>{
    let style=document.getElementById('novaOrbAlignmentV2');
    if(!style){
      style=document.createElement('style');
      style.id='novaOrbAlignmentV2';
      document.head.appendChild(style);
    }
    style.textContent=`
      #novaGuide .nova-orb-wrap{
        position:relative!important;
        width:210px!important;
        min-width:210px!important;
        height:104px!important;
        overflow:visible!important;
      }
      #novaGuide .nova-orb{
        position:absolute!important;
        left:calc(50% - 20px)!important;
        top:50%!important;
        margin-left:-42px!important;
        margin-top:-42px!important;
        transform:none!important;
        animation:novaOrbGlowOnly 2.5s ease-in-out infinite!important;
      }
      #novaGuide .nova-hand.left{left:8px!important;right:auto!important}
      #novaGuide .nova-hand.right{right:8px!important;left:auto!important}
      @keyframes novaOrbGlowOnly{
        50%{filter:brightness(1.2);box-shadow:0 0 0 7px rgba(49,154,255,.12),0 0 40px rgba(78,210,255,1),0 0 90px rgba(116,54,255,.74),inset 0 0 34px rgba(255,255,255,.28)}
      }
      @media(max-width:560px){
        #novaGuide .nova-orb-wrap{width:184px!important;min-width:184px!important;height:92px!important}
        #novaGuide .nova-orb{
          left:calc(50% - 15px)!important;
          margin-left:-34px!important;
          margin-top:-34px!important;
        }
      }
    `;
  };

  install();
  const observer=new MutationObserver(()=>install());
  observer.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(()=>observer.disconnect(),30000);
})();