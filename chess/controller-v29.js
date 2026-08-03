import('./controller-core-v29.js?v=29')
  .then(()=>import('./rules-guide-v29.js?v=29'))
  .then(()=>import('./capture-tray-v23.js?v=29'))
  .then(()=>import('./piece-colors-v24.js?v=29'))
  .then(()=>import('./online-v20.js?v=29'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='glass-v28';
    const core=window.NovaChessCore;
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V29';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML=`<strong>V29 regulation rules:</strong> the tiers remain one standard 8×8 board. Promotion choices, special-move guidance, a ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} engine audit, and server-side legal-move verification are active.`;
  })
  .catch(error=>{
    console.error('V29 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}
  });
