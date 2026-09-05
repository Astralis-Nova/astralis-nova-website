import('./controller-core-v29.js?v=36')
  .then(()=>import('./rules-guide-v29.js?v=36'))
  .then(()=>import('./capture-tray-v23.js?v=36'))
  .then(()=>import('./piece-colors-v24.js?v=36'))
  .then(()=>import('./cosmic-pieces-v33.js?v=36'))
  .then(()=>import('./online-v20.js?v=36'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='celestial-fleet-v36';
    const core=window.NovaChessCore,badge=document.querySelector('.badge'),notice=document.querySelector('.notice');
    if(badge)badge.textContent='CELESTIAL FLEET V36';
    if(notice)notice.innerHTML=`<strong>V36 celestial fleet:</strong> enlarged sculptural Sun King, crescent Moon Queen, Astralis Nova Citadels, ringed planetary bishops, comet-strider knights, and cratered asteroid pawns. The board retains its ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} regulation rules audit.`;
    installV36VisualRepair();
    tunePieceViews();
    new MutationObserver(tunePieceViews).observe(document.body,{childList:true,subtree:true});
  })
  .catch(error=>{console.error('V36 chess controller failed to start',error);const status=document.getElementById('status');if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}});

function installV36VisualRepair(){
  if(document.getElementById('v36VisualRepair'))return;
  const style=document.createElement('style');
  style.id='v36VisualRepair';
  style.textContent=`
    .piece.celestial-piece{
      width:100%!important;
      height:100%!important;
      max-width:none!important;
      max-height:none!important;
      transform:none!important;
    }
    .piece.celestial-piece .celestial-svg{
      width:100%!important;
      height:100%!important;
      transform:none!important;
      transform-origin:center!important;
    }
    @media(max-width:1100px){
      .layout{grid-template-columns:1fr!important}
      .side{position:static!important}
      .battlefield{min-height:auto!important;padding:10px!important}
      .tier-shell.home{width:96%!important}
      .tier-stack{max-width:900px!important;margin-inline:auto!important}
    }
    @media(max-width:700px){
      .tier-shell.home{width:100%!important}
      .tier-stack{padding-left:0!important;padding-right:0!important}
      .celestial-svg{filter:drop-shadow(0 4px 2px rgba(0,0,0,.9)) drop-shadow(0 0 3px var(--glow))!important}
    }
  `;
  document.head.append(style);
}

function tunePieceViews(){
  const zoom={
    k:'10 -2 80 100',
    q:'12 0 76 98',
    r:'12 0 76 98',
    b:'8 2 84 96',
    n:'7 4 86 94',
    p:'13 12 74 86'
  };
  document.querySelectorAll('.celestial-svg').forEach(svg=>{
    const host=svg.closest('[data-piece]');
    const type=host?.dataset?.piece;
    svg.setAttribute('viewBox',zoom[type]||'10 0 80 98');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  });
}
