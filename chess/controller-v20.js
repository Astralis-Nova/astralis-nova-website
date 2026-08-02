import('./controller-core-v20.js?v=20')
  .then(()=>import('./online-v20.js?v=21'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V21';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V21 guarded networking:</strong> Nova activation is compatible with the existing D1 schema, and partially created missions recover automatically.';
  })
  .catch(error=>{
    console.error('V21 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
