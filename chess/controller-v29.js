import('./controller-core-v29.js?v=31')
  .then(()=>import('./rules-guide-v29.js?v=31'))
  .then(()=>import('./capture-tray-v23.js?v=31'))
  .then(()=>import('./piece-colors-v24.js?v=31'))
  .then(()=>import('./cosmic-pieces-v31.js?v=31'))
  .then(()=>import('./online-v20.js?v=31'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='universe-fleet-v31';
    const core=window.NovaChessCore;
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='UNIVERSE FLEET V31';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML=`<strong>V31 universe fleet:</strong> Sun, Moon, Ringed World, Comet, Asteroid, and Nova Star pieces are active. The four platforms remain one regulation 8×8 board with a ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} rules audit.`;
  })
  .catch(error=>{
    console.error('V31 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}
  });
