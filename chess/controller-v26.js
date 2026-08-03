import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='glass-v25';
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V26';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V26 hard-wired glass table:</strong> the visual stylesheet now loads directly from the page after the base styles, while the repaired chess controller remains unchanged.';
  })
  .catch(error=>{
    console.error('V26 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
