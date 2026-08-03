const visual=document.createElement('link');
visual.rel='stylesheet';
visual.href='./tri-deck-visual-v26.css?v=26';
visual.dataset.astralisVisual='v26';
document.head.append(visual);

import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V26';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V26 clear raised Nexus:</strong> the middle Port and Starboard tier is lifted, while the playable boards use the more transparent glass treatment from the original command table.';
  })
  .catch(error=>{
    console.error('V26 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
