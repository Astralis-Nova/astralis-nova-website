const visual=document.createElement('link');
visual.rel='stylesheet';
visual.href='./tri-deck-visual-v25.css?v=25';
visual.dataset.astralisVisual='v25';
document.head.append(visual);

import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V25';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V25 glass command table:</strong> the clear floating tiers, illuminated slab edges, projector spine, and holographic base are restored without changing the working chess controller.';
  })
  .catch(error=>{
    console.error('V25 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
