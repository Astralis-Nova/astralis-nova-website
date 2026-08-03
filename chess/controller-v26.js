import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='glass-v27';
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V27';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V27 elevated Nexus glass:</strong> the middle Port and Starboard tiers remain raised and translucent, while the repaired chess controller stays unchanged.';
  })
  .catch(error=>{
    console.error('V27 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
