import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V23';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V23 battle inventory:</strong> captured White and Black pieces remain visible in a dedicated tray, while check guidance continues to list legal replies.';
  })
  .catch(error=>{
    console.error('V23 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
