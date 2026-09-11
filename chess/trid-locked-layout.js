(()=>{
'use strict';

const scene=document.getElementById('scene');
if(!scene)return;

const LAYOUT={
  version:3,
  scene:{width:880,height:1000},
  boards:{
    A1:{dx:-10,dy:90,left:45,top:175},
    U:{left:260,top:55},
    A2:{dx:135,dy:90,left:700,top:175},
    M:{left:245,top:335},
    B1:{dx:-10,dy:-80,left:45,top:745},
    L:{left:260,top:635},
    B2:{dx:135,dy:-80,left:700,top:745}
  }
};

for(const platform of scene.querySelectorAll('.main-board,.attack')){
  const id=platform.dataset.board;
  const p=LAYOUT.boards[id];
  if(!p)continue;
  if(platform.classList.contains('attack')){
    platform.style.setProperty('--layout-dx',`${p.dx}px`);
    platform.style.setProperty('--layout-dy',`${p.dy}px`);
  }else{
    platform.style.setProperty('--layout-left',`${p.left}px`);
    platform.style.setProperty('--layout-top',`${p.top}px`);
  }
}

scene.classList.add('layout-custom');
scene.dataset.layoutVersion=String(LAYOUT.version);
window.AstralisTriDLayout=Object.freeze(LAYOUT);
})();
