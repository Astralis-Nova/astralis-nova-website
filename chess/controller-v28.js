import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='glass-v28';
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V28';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V28 clear command table:</strong> one clean visual layer now controls the raised translucent Nexus tiers, with the working chess engine left unchanged.';
  })
  .catch(error=>{
    console.error('V28 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
