(()=>{
'use strict';

const MIGRATION_KEY='astralis-trid-full-rules-v2';
const LAYOUT_KEY='astralis-trichess-layout-v2';

// The V6 engine implements W3DCF-based Tri-D chess movement, captures,
// check/checkmate, castling, en passant and promotion. This one-time reset
// only refreshes the game state so every browser receives the complete
// 32-piece starting position. The user's saved board layout is untouched.
if(!localStorage.getItem(MIGRATION_KEY)){
  const savedLayout=localStorage.getItem(LAYOUT_KEY);
  const newGame=document.getElementById('newGame');
  if(newGame){
    newGame.click();
    if(savedLayout!==null)localStorage.setItem(LAYOUT_KEY,savedLayout);
    localStorage.setItem(MIGRATION_KEY,'1');
  }
}

const chip=document.querySelector('.mode-chip');
if(chip)chip.textContent='ASTRALIS TRI-D V6 · 64 SQUARES · W3DCF-BASED';

const dock=document.querySelector('.command-dock');
if(dock&&!document.getElementById('ruleSummary')){
  const note=document.createElement('div');
  note.id='ruleSummary';
  note.className='rule-summary';
  note.textContent='32 pieces · alternating legal turns · captures · check/checkmate · castling · en passant · promotion';
  dock.insertAdjacentElement('afterend',note);
}
})();
