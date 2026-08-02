import('./controller-core-v20.js?v=22')
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V22';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V22 check guidance:</strong> the checked king glows red, and the controller lists the legal moves that can answer check.';
  })
  .catch(error=>{
    console.error('V22 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
