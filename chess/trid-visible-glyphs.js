(()=>{
'use strict';
const GLYPHS={
  w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},
  b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}
};
const TYPES=['k','q','r','b','n','p'];
let scheduled=false;
function decorate(){
  scheduled=false;
  document.querySelectorAll('.piece').forEach(piece=>{
    const color=piece.classList.contains('crystal')?'w':piece.classList.contains('sapphire')?'b':null;
    const type=TYPES.find(t=>piece.classList.contains(`piece-${t}`));
    if(!color||!type)return;
    let glyph=piece.querySelector(':scope > .piece-glyph');
    if(!glyph){
      glyph=document.createElement('span');
      glyph.className='piece-glyph';
      glyph.setAttribute('aria-hidden','true');
      piece.appendChild(glyph);
    }
    const next=GLYPHS[color][type];
    if(glyph.textContent!==next)glyph.textContent=next;
  });
}
function schedule(){
  if(scheduled)return;
  scheduled=true;
  requestAnimationFrame(decorate);
}
decorate();
const scene=document.getElementById('scene');
if(scene)new MutationObserver(schedule).observe(scene,{childList:true,subtree:true});
window.addEventListener('pageshow',schedule);
})();
