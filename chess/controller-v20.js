import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V24';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V24 fleet colors:</strong> White pieces remain ivory and Black pieces remain obsidian with a bright edge on every tier and in the captured-piece tray.';
  })
  .catch(error=>{
    console.error('V24 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
