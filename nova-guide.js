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
    loadScript('/nova-conversation.js?v=20260907a','novaConversation');
    loadScript('/nova-daily-intelligence.js?v=20260908a','novaDailyIntelligence');
    loadScript('/nova-personality-matrix.js?v=20260908c','novaPersonalityMatrix');
    loadScript('/nova-rag.js?v=20260908f','novaRag');
    loadScript('/nova-voice-uk.js?v=20260908d','novaVoiceUK');
    loadScript('/nova-autonomy.js?v=20260908a','novaAutonomy');
    loadScript('/nova-personality-sparks.js?v=20260908a','novaPersonalitySparks');
    loadScript('/nova-capabilities.js?v=20260908a','novaCapabilities');
    loadScript('/nova-owner-console.js?v=20260908a','novaOwnerConsole');
    loadScript('/nova-leveling.js?v=20260908a','novaLeveling');
    loadScript('/nova-planner.js?v=20260908a','novaPlanner');
    loadScript('/nova-home-primary.js?v=20260908a','novaHomePrimary');
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