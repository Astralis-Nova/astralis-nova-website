(()=>{
'use strict';

const scene=document.getElementById('scene');
if(!scene)return;

const glyphs={
  'w-k':'♔','w-q':'♕','w-r':'♖','w-b':'♗','w-n':'♘','w-p':'♙',
  'b-k':'♚','b-q':'♛','b-r':'♜','b-b':'♝','b-n':'♞','b-p':'♟'
};

function syncSquare(square){
  if(!square?.classList?.contains('sq'))return;
  const piece=square.querySelector(':scope > .piece');
  if(!piece){
    square.removeAttribute('data-mobile-piece');
    square.removeAttribute('data-mobile-color');
    return;
  }

  const color=piece.classList.contains('crystal')?'w':piece.classList.contains('sapphire')?'b':null;
  const type=['k','q','r','b','n','p'].find(t=>piece.classList.contains(`piece-${t}`));
  if(!color||!type)return;

  square.dataset.mobilePiece=glyphs[`${color}-${type}`];
  square.dataset.mobileColor=color;
}

function syncAll(){
  scene.querySelectorAll('.sq').forEach(syncSquare);
}

syncAll();

const observer=new MutationObserver(mutations=>{
  const touched=new Set();
  for(const mutation of mutations){
    const target=mutation.target;
    const square=target?.classList?.contains('sq')?target:target?.closest?.('.sq');
    if(square)touched.add(square);
    for(const node of mutation.addedNodes){
      if(node.nodeType!==1)continue;
      if(node.classList?.contains('sq'))touched.add(node);
      const parentSquare=node.closest?.('.sq');
      if(parentSquare)touched.add(parentSquare);
      node.querySelectorAll?.('.sq').forEach(s=>touched.add(s));
    }
  }
  touched.forEach(syncSquare);
});

observer.observe(scene,{subtree:true,childList:true});
window.AstralisTriDMobilePieceFallback={sync:syncAll};
})();
