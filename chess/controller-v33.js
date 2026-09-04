import('./controller-core-v29.js?v=33')
  .then(()=>import('./rules-guide-v29.js?v=33'))
  .then(()=>import('./capture-tray-v23.js?v=33'))
  .then(()=>import('./piece-colors-v24.js?v=33'))
  .then(()=>import('./cosmic-pieces-v33.js?v=33'))
  .then(()=>import('./online-v20.js?v=33'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='detailed-celestial-fleet-v33';
    const core=window.NovaChessCore,badge=document.querySelector('.badge'),notice=document.querySelector('.notice');
    if(badge)badge.textContent='DETAILED CELESTIAL FLEET V33';
    if(notice)notice.innerHTML=`<strong>V33 detailed fleet:</strong> Larger cratered asteroid pawns guard individually colored, textured worlds. Crowns, orbital rings, atmospheric bands, luminous seams, and the fortified Astralis Nova Citadel keep every role recognizable. The board retains its ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} regulation rules audit.`;
  })
  .catch(error=>{console.error('V33 chess controller failed to start',error);const status=document.getElementById('status');if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}});
