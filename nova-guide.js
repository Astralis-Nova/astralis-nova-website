(()=>{
  if(window.__astralisNovaBridgeV7)return;
  window.__astralisNovaBridgeV7=true;

  const loadIntelligence=()=>{
    if(document.querySelector('script[data-nova-intelligence]'))return;
    const intelligence=document.createElement('script');
    intelligence.src='/nova-intelligence.js?v=20260805a';
    intelligence.dataset.novaIntelligence='true';
    intelligence.async=false;
    document.head.appendChild(intelligence);
  };

  if(window.__astralisNovaGuideV6){
    loadIntelligence();
    return;
  }

  const core=document.createElement('script');
  core.src='https://cdn.jsdelivr.net/gh/Astralis-Nova/astralis-nova-website@c4c7d4a338e5532fed8fe52d4e7a950c536ccd69/nova-guide.js';
  core.async=false;
  core.onload=loadIntelligence;
  core.onerror=loadIntelligence;
  document.head.appendChild(core);
})();