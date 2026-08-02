import('./controller-core-v20.js?v=20')
  .then(()=>import('./online-v20.js?v=21'))
  .catch(error=>{
    console.error('V21 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
