const core=window.NovaChessCore;
if(!core)throw new Error('Capture tray requires the clean chess core.');

const SYMBOLS={
  w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},
  b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}
};
const NAMES={q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn',k:'king'};
const VALUES={q:9,r:5,b:3,n:3,p:1,k:0};

installStyles();
const tray=installTray();
updateTray();

const moveList=document.getElementById('moves');
if(moveList){
  new MutationObserver(updateTray).observe(moveList,{childList:true,subtree:true});
}
for(const id of ['VD','NP','NS','SD']){
  const board=document.getElementById(id);
  if(board)new MutationObserver(updateTray).observe(board,{childList:true});
}

function installStyles(){
  if(document.getElementById('captureTrayStyles'))return;
  const style=document.createElement('style');
  style.id='captureTrayStyles';
  style.textContent=`
    .capture-tray{margin-top:9px;padding:10px;border:1px solid rgba(112,231,255,.36);border-radius:11px;background:rgba(3,14,31,.78)}
    .capture-tray h3{margin:0 0 8px;color:#70e7ff;font:950 .7rem/1.2 Inter,system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase}
    .capture-row{display:grid;grid-template-columns:minmax(92px,.8fr) 1fr auto;align-items:center;gap:7px;padding:7px 0;border-top:1px solid rgba(112,231,255,.13)}
    .capture-row:first-of-type{border-top:0}
    .capture-label{color:#bfd5e8;font:850 .63rem/1.25 Inter,system-ui,sans-serif}
    .capture-pieces{display:flex;flex-wrap:wrap;align-items:center;gap:3px;min-height:25px}
    .capture-piece{display:inline-grid;place-items:center;min-width:22px;height:25px;padding:0 2px;border:1px solid rgba(157,221,255,.25);border-radius:6px;background:rgba(15,46,75,.62);font:700 1.28rem/1 serif;filter:drop-shadow(0 2px 2px rgba(0,0,0,.55))}
    .capture-none{color:#7896ae;font:750 .61rem Inter,system-ui,sans-serif}
    .capture-score{color:#ffe7a0;font:900 .62rem Inter,system-ui,sans-serif;white-space:nowrap}
    .capture-note{margin:7px 0 0;color:#91adc3;font:700 .59rem/1.35 Inter,system-ui,sans-serif}
  `;
  document.head.append(style);
}

function installTray(){
  let element=document.getElementById('captureTray');
  if(element)return element;
  element=document.createElement('section');
  element.id='captureTray';
  element.className='capture-tray';
  element.innerHTML=`
    <h3>Captured Pieces</h3>
    <div class="capture-row"><span class="capture-label">White fleet lost</span><div class="capture-pieces" data-captured="white"></div><span class="capture-score" data-score="white">0 pts</span></div>
    <div class="capture-row"><span class="capture-label">Black fleet lost</span><div class="capture-pieces" data-captured="black"></div><span class="capture-score" data-score="black">0 pts</span></div>
    <p class="capture-note">Captured pieces remain listed here even though they disappear from their board squares.</p>`;
  const info=document.querySelector('.side .info');
  if(info)info.insertAdjacentElement('beforebegin',element);
  else document.querySelector('.side')?.append(element);
  return element;
}

function updateTray(){
  if(!tray||!core.game)return;
  const lost={white:[],black:[]};
  for(const move of core.game.history({verbose:true})){
    if(!move.captured)continue;
    const capturedColor=move.color==='w'?'black':'white';
    lost[capturedColor].push({type:move.captured,by:move.color,at:move.to,notation:move.san});
  }
  renderRow('white',lost.white);
  renderRow('black',lost.black);
}

function renderRow(color,pieces){
  const container=tray.querySelector(`[data-captured="${color}"]`);
  const score=tray.querySelector(`[data-score="${color}"]`);
  if(!container||!score)return;
  container.replaceChildren();
  if(!pieces.length){
    const none=document.createElement('span');
    none.className='capture-none';
    none.textContent='None';
    container.append(none);
  }else{
    const code=color==='white'?'w':'b';
    for(const item of pieces){
      const piece=document.createElement('span');
      piece.className='capture-piece';
      piece.textContent=SYMBOLS[code][item.type]||'?';
      piece.title=`${capitalize(color)} ${NAMES[item.type]||item.type} captured on ${item.at.toUpperCase()} (${item.notation})`;
      piece.setAttribute('aria-label',piece.title);
      container.append(piece);
    }
  }
  const total=pieces.reduce((sum,item)=>sum+(VALUES[item.type]||0),0);
  score.textContent=`${total} pt${total===1?'':'s'}`;
}

function capitalize(value){return value.charAt(0).toUpperCase()+value.slice(1)}
