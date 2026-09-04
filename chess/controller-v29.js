import('./controller-core-v29.js?v=30')
  .then(()=>import('./rules-guide-v29.js?v=30'))
  .then(()=>import('./capture-tray-v23.js?v=30'))
  .then(()=>import('./piece-colors-v24.js?v=30'))
  .then(()=>import('./cosmic-pieces-v30.js?v=30'))
  .then(()=>import('./online-v20.js?v=30'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='cosmic-glass-v30';
    const core=window.NovaChessCore;
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='COSMIC FLEET V30';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML=`<strong>V30 cosmic fleet:</strong> illuminated command glass and Astralis Nova fleet styling are active. The four platforms remain one regulation 8×8 board with a ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} rules audit.`;
  })
  .catch(error=>{
    console.error('V30 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}
  });
