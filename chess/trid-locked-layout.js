(()=>{
'use strict';

const scene=document.getElementById('scene');
if(!scene)return;

const LAYOUT={
  version:2,
  scene:{width:760,height:1035},
  boards:{
    A1:{dx:-48,dy:91,left:7,top:176},
    U:{left:215,top:65},
    A2:{dx:34,dy:91,left:599,top:176},
    M:{left:191,top:283},
    B1:{dx:-57,dy:-199,left:-2,top:626},
    L:{left:226,top:511},
    B2:{dx:76,dy:-212,left:641,top:613}
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
