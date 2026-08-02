const core=window.NovaChessCore;
if(!core)throw new Error('Fleet color system requires the clean chess core.');

installFleetStyles();
applyFleetColors();

const observer=new MutationObserver(applyFleetColors);
observer.observe(document.body,{childList:true,subtree:true});

function installFleetStyles(){
  if(document.getElementById('fleetColorStyles'))return;
  const style=document.createElement('style');
  style.id='fleetColorStyles';
  style.textContent=`
    .piece.fleet-white{
      color:#fffaf0!important;
      -webkit-text-stroke:.55px #6f8798;
      text-shadow:0 1px 0 #fff,0 0 5px rgba(220,248,255,.95),0 4px 4px rgba(0,0,0,.68)!important;
      filter:none!important;
    }
    .piece.fleet-black{
      color:#020711!important;
      -webkit-text-stroke:1.05px #bcecff;
      text-shadow:0 0 2px #fff,0 0 7px rgba(74,208,255,.75),0 4px 4px rgba(0,0,0,.85)!important;
      filter:none!important;
    }
    .capture-piece.fleet-white{
      color:#fffaf0!important;
      -webkit-text-stroke:.45px #688295;
      text-shadow:0 0 4px rgba(220,248,255,.9),0 2px 2px #000;
    }
    .capture-piece.fleet-black{
      color:#020711!important;
      -webkit-text-stroke:1px #c8f2ff;
      text-shadow:0 0 2px #fff,0 0 6px rgba(74,208,255,.75),0 2px 2px #000;
    }
    .fleet-color-key{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 8px;color:#9fb8cc;font:800 .59rem/1.2 Inter,system-ui,sans-serif}
    .fleet-color-key span{display:inline-flex;align-items:center;gap:4px}
    .fleet-swatch{font:800 1.1rem/1 serif}
    .fleet-swatch.white{color:#fffaf0;-webkit-text-stroke:.4px #688295;text-shadow:0 0 4px #dff8ff}
    .fleet-swatch.black{color:#020711;-webkit-text-stroke:1px #c8f2ff;text-shadow:0 0 4px #7bdfff}
  `;
  document.head.append(style);
}

function applyFleetColors(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{
    const pieceElement=square.querySelector('.piece');
    if(!pieceElement)return;
    const piece=core.game?.get(square.dataset.square);
    pieceElement.classList.remove('fleet-white','fleet-black');
    if(piece?.color==='w')pieceElement.classList.add('fleet-white');
    if(piece?.color==='b')pieceElement.classList.add('fleet-black');
  });

  document.querySelectorAll('[data-captured="white"] .capture-piece').forEach(piece=>{
    piece.classList.remove('fleet-black');
    piece.classList.add('fleet-white');
  });
  document.querySelectorAll('[data-captured="black"] .capture-piece').forEach(piece=>{
    piece.classList.remove('fleet-white');
    piece.classList.add('fleet-black');
  });

  installLegend();
}

function installLegend(){
  const tray=document.getElementById('captureTray');
  if(!tray||tray.querySelector('.fleet-color-key'))return;
  const legend=document.createElement('div');
  legend.className='fleet-color-key';
  legend.innerHTML='<span><b class="fleet-swatch white">♙</b> White fleet</span><span><b class="fleet-swatch black">♟</b> Black fleet</span>';
  tray.querySelector('h3')?.insertAdjacentElement('afterend',legend);
}
