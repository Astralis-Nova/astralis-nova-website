(()=>{
'use strict';
const MARKER='astralis-trid-fresh-start-v3';
const GAME_KEY='astralisTriDGameV2';
if(localStorage.getItem(MARKER))return;
localStorage.removeItem(GAME_KEY);
localStorage.setItem(MARKER,'1');
})();
