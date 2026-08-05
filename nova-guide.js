(()=>{
  if(window.__astralisNovaBridgeV18)return;
  window.__astralisNovaBridgeV18=true;

  window.__astralisNovaMidiUpgrade=true;
  window.__astralisNovaMidiUpgradeV2=true;
  window.__astralisNovaMidiUpgradeV3=true;
  window.__astralisNovaOrbAlignmentV1=true;
  window.__astralisNovaOrbAlignmentV2=true;

  const loadScript=(src,key)=>{
    if(document.querySelector(`script[data-${key}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.dataset[key]='true';
    script.async=false;
    document.head.appendChild(script);
  };

  const loadUpgrades=()=>{
    loadScript('/nova-remove-hands.js?v=20260805e','novaRemoveHands');
    loadScript('/nova-intelligence.js?v=20260805a','novaIntelligence');
    loadScript('/nova-conversation.js?v=20260805c','novaConversation');
    loadScript('/feeling-tipsy.js?v=20260805a','feelingTipsy');
  };

  if(window.__astralisNovaGuideV6){loadUpgrades();return}

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@c4c7d4a338e5532fed8fe52d4e7a950c536ccd69/nova-guide.js';
  core.async=false;
  core.onload=loadUpgrades;
  core.onerror=loadUpgrades;
  document.head.appendChild(core);
})();