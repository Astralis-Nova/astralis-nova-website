(() => {
  'use strict';

  function restoreArtwork(){
    document.querySelectorAll('.nova-planet-scene').forEach(el=>el.remove());
    document.getElementById('astralis-nova-planet-orbit-style')?.remove();

    const cover=document.getElementById('cover');
    if(cover){
      cover.style.setProperty('opacity','1','important');
      cover.style.setProperty('display','block','important');
      cover.style.setProperty('visibility','visible','important');
      cover.style.setProperty('pointer-events','auto','important');
      cover.style.setProperty('position','relative','important');
      cover.style.setProperty('z-index','1','important');
    }

    const wrap=document.querySelector('.art-wrap');
    if(wrap){
      wrap.style.removeProperty('overflow');
      wrap.style.removeProperty('isolation');
      wrap.style.removeProperty('background');
      wrap.style.removeProperty('box-shadow');
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',restoreArtwork,{once:true});
  }else{
    restoreArtwork();
  }

  // Run once more after delayed/cached scripts have had a chance to execute.
  setTimeout(restoreArtwork,250);
  setTimeout(restoreArtwork,1200);
})();
