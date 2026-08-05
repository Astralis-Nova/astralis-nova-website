(()=>{
  if(window.__astralisNovaBridgeV10)return;
  window.__astralisNovaBridgeV10=true;

  const loadScript=(src,key)=>{
    if(document.querySelector(`script[data-${key}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.dataset[key]='true';
    script.async=false;
    document.head.appendChild(script);
  };

  const loadUpgrades=()=>{
    loadScript('/nova-intelligence.js?v=20260805a','novaIntelligence');
    loadScript('/nova-midi-upgrade.js?v=20260805c','novaMidiUpgrade');
    loadScript('/nova-orb-alignment.js?v=20260805a','novaOrbAlignment');
  };

  if(window.__astralisNovaGuideV6){
    loadUpgrades();
    return;
  }

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@c4c7d4a338e5532fed8fe52d4e7a950c536ccd69/nova-guide.js';
  core.async=false;
  core.onload=loadUpgrades;
  core.onerror=loadUpgrades;
  document.head.appendChild(core);
})();