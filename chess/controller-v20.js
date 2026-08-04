const visual=document.createElement('link');
visual.rel='stylesheet';
visual.href='./tri-deck-visual-v27.css?v=27';
visual.dataset.astralisVisual='v27';
document.head.append(visual);

import('./controller-core-v20.js?v=22')
  .then(()=>import('./capture-tray-v23.js?v=23'))
  .then(()=>import('./piece-colors-v24.js?v=24'))
  .then(()=>import('./online-v20.js?v=22'))
  .then(()=>{
    const badge=document.querySelector('.badge');
    if(badge)badge.textContent='ONLINE CONTROLLER V27';
    const notice=document.querySelector('.notice');
    if(notice)notice.innerHTML='<strong>V27 elevated clear Nexus:</strong> the middle Port and Starboard tiers sit higher and use a more transparent acrylic board surface, while the working chess controller remains unchanged.';
  })
  .catch(error=>{
    console.error('V27 chess controller failed to start',error);
    const status=document.getElementById('status');
    if(status){
      status.textContent=`Controller startup failed: ${error.message}`;
      status.className='status bad';
    }
  });
