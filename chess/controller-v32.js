import('./controller-core-v29.js?v=32')
  .then(()=>import('./rules-guide-v29.js?v=32'))
  .then(()=>import('./capture-tray-v23.js?v=32'))
  .then(()=>import('./piece-colors-v24.js?v=32'))
  .then(()=>import('./cosmic-pieces-v32.js?v=32'))
  .then(()=>import('./online-v20.js?v=32'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='realistic-celestial-fleet-v32';
    const core=window.NovaChessCore,badge=document.querySelector('.badge'),notice=document.querySelector('.notice');
    if(badge)badge.textContent='REALISTIC CELESTIAL FLEET V32';
    if(notice)notice.innerHTML=`<strong>V32 celestial fleet:</strong> Asteroid pawns guard realistic planet pieces. The Astralis Nova Citadel combines the rook's castle with a living nova. The four platforms remain one regulation 8×8 board with a ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} rules audit.`;
  })
  .catch(error=>{console.error('V32 chess controller failed to start',error);const status=document.getElementById('status');if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}});
