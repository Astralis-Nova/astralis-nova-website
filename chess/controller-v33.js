import('./controller-core-v29.js?v=35')
  .then(()=>import('./rules-guide-v29.js?v=35'))
  .then(()=>import('./capture-tray-v23.js?v=35'))
  .then(()=>import('./piece-colors-v24.js?v=35'))
  .then(()=>import('./cosmic-pieces-v33.js?v=35'))
  .then(()=>import('./online-v20.js?v=35'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='celestial-fleet-v35';
    const core=window.NovaChessCore,badge=document.querySelector('.badge'),notice=document.querySelector('.notice');
    if(badge)badge.textContent='CELESTIAL FLEET V35';
    if(notice)notice.innerHTML=`<strong>V35 celestial fleet:</strong> Sun King, crescent Moon Queen, Astralis Nova Citadels, ringed planetary bishops, comet-strider knights, and cratered asteroid pawns. The board retains its ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} regulation rules audit.`;
  })
  .catch(error=>{console.error('V35 chess controller failed to start',error);const status=document.getElementById('status');if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}});
