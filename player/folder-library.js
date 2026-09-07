(() => {
  'use strict';
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.defer=true;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});
  Promise.resolve()
    .then(()=>load('./download-access.js?v=1'))
    .then(()=>load('./first-run-folder.js?v=1'))
    .then(()=>load('./folder-library-core.js?v=1'))
    .then(()=>load('./planet-orbit.js?v=1'))
    .catch(err=>console.warn('Astralis Nova library bootstrap failed',err));
})();