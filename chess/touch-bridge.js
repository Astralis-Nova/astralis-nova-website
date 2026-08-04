const VERSION='18';
let suppressTrustedClickUntil=0;
let refreshTimer=null;

installTouchBridge();

function installTouchBridge(){
  const stage=document.getElementById('triDeckStage');
  if(!stage)return;
  installStatusBar();
  stage.addEventListener('pointerup',handlePointerUp,true);
  stage.addEventListener('click',event=>{
    if(event.isTrusted&&Date.now()<suppressTrustedClickUntil){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  },true);
  document.addEventListener('click',handleMoveButton,true);
  const observer=new MutationObserver(()=>queueRefresh(35));
  for(const id of ['standardBoard','voidPlatformBoard','portNexusBoard','starboardNexusBoard','silverPlatformBoard']){
    const board=document.getElementById(id);
    if(board)observer.observe(board,{childList:true,subtree:false});
  }
  queueRefresh(100);
  setStatus(`Touch bridge v${VERSION} ready. Tap a piece, then use the green button at the bottom.`,'ready');
}

function installStatusBar(){
  if(document.getElementById('touchMoveDock'))return;
  const dock=document.createElement('section');
  dock.id='touchMoveDock';
  dock.innerHTML=`<div id="touchBridgeStatus">Touch bridge v${VERSION} starting…</div><div id="touchBridgeActions"></div>`;
  document.body.append(dock);
  const style=document.createElement('style');
  style.textContent=`
    #touchMoveDock{position:fixed;left:8px;right:8px;bottom:8px;z-index:10000;padding:10px;border:2px solid rgba(102,255,214,.9);border-radius:15px;background:rgba(2,12,28,.97);box-shadow:0 12px 40px rgba(0,0,0,.68),0 0 28px rgba(69,217,255,.24);font-family:Inter,system-ui,sans-serif}
    #touchBridgeStatus{color:#f4fbff;font-size:.76rem;font-weight:850;line-height:1.35;margin-bottom:7px;text-align:center}
    #touchBridgeStatus[data-state="error"]{color:#ff9eb1}#touchBridgeStatus[data-state="success"]{color:#88ffdf}#touchBridgeStatus[data-state="busy"]{color:#ffe27d}
    #touchBridgeActions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
    .touch-bridge-move{min-height:46px;padding:10px 16px;border:1px solid #d4fff6;border-radius:999px;background:linear-gradient(180deg,#8affdf,#2fd0a7);color:#021814;font-weight:950;font-size:.78rem;cursor:pointer;touch-action:manipulation;box-shadow:0 6px 18px rgba(47,208,167,.28)}
    .touch-bridge-move small{display:block;font-size:.56rem;opacity:.72;margin-top:2px}.touch-bridge-move.capture{background:linear-gradient(180deg,#ff9eb2,#ff607d);color:#26030b}
    body{padding-bottom:118px!important}
    @media(max-width:560px){#touchMoveDock{left:5px;right:5px;bottom:5px;padding:8px}.touch-bridge-move{flex:1 1 40%;padding:9px 8px}}
  `;
  document.head.append(style);
}

function handlePointerUp(event){
  const selected=document.querySelector('.square.selected');
  const legal=getLegalSquares();
  if(!selected||!legal.length)return;
  const target=nearestLegal(event.clientX,event.clientY,legal);
  if(!target)return;
  const rect=target.getBoundingClientRect();
  const allowance=Math.max(64,Math.max(rect.width,rect.height)*1.5);
  const distance=Math.hypot(event.clientX-(rect.left+rect.width/2),event.clientY-(rect.top+rect.height/2));
  if(distance>allowance)return;
  event.preventDefault();
  event.stopPropagation();
  suppressTrustedClickUntil=Date.now()+450;
  activateTarget(target,'Board tap');
}

function handleMoveButton(event){
  const button=event.target.closest?.('.touch-bridge-move');
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  const target=findLegal(button.dataset.square,button.dataset.board||'');
  if(!target){
    setStatus(`${button.dataset.square} is no longer available. Tap the piece again.`,'error');
    queueRefresh(80);
    return;
  }
  activateTarget(target,'Move button');
}

function activateTarget(target,source){
  const from=document.querySelector('.square.selected')?.dataset.square?.toUpperCase()||'piece';
  const to=target.dataset.square?.toUpperCase()||'destination';
  setStatus(`${source} received: ${from} → ${to}. Executing…`,'busy');
  target.focus({preventScroll:true});
  target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
  setTimeout(()=>{
    const stillSelected=document.querySelector('.square.selected');
    const last=document.getElementById('lastMove')?.textContent||'';
    if(stillSelected){
      setStatus(`The engine did not release ${from}. Tap the green ${to} button once more.`,'error');
    }else{
      setStatus(`${from} → ${to} executed${last&&last!=='Opening grid'?` · ${last}`:''}.`,'success');
    }
    queueRefresh(100);
  },260);
}

function queueRefresh(delay=40){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(refreshDock,delay);
}

function refreshDock(){
  const actions=document.getElementById('touchBridgeActions');
  if(!actions)return;
  actions.replaceChildren();
  const selected=document.querySelector('.square.selected');
  const legal=getLegalSquares();
  if(!selected){
    setStatus('Tap a white piece. Start with E2. Green move buttons will appear here.','ready');
    return;
  }
  const from=selected.dataset.square?.toUpperCase()||'piece';
  if(!legal.length){
    setStatus(`${from} is blocked. Try a pawn on row 2 or a knight.`,'error');
    return;
  }
  for(const target of legal){
    const square=target.dataset.square?.toUpperCase()||'';
    const board=target.closest('[data-board-shell]')?.dataset.boardShell||'';
    const button=document.createElement('button');
    button.type='button';
    button.className=`touch-bridge-move${target.classList.contains('capture')?' capture':''}`;
    button.dataset.square=square;
    button.dataset.board=board;
    button.innerHTML=`MOVE ${from} → ${square}${board?`<small>${boardName(board)}</small>`:''}`;
    actions.append(button);
  }
  setStatus(`${from} selected. Tap one of the green move buttons below.`,'ready');
}

function getLegalSquares(){return [...document.querySelectorAll('.square.legal,.square.capture')]}
function nearestLegal(x,y,legal){let best=null,bestDistance=Infinity;for(const target of legal){const rect=target.getBoundingClientRect();const d=Math.hypot(x-(rect.left+rect.width/2),y-(rect.top+rect.height/2));if(d<bestDistance){bestDistance=d;best=target}}return best}
function findLegal(square,board){const normalized=String(square||'').toLowerCase();return getLegalSquares().find(node=>String(node.dataset.square||'').toLowerCase()===normalized&&(!board||node.closest('[data-board-shell]')?.dataset.boardShell===board))||null}
function boardName(id){return({VD:'Void tier',NP:'Port Nexus',NS:'Starboard Nexus',SD:'Silver tier'})[id]||id}
function setStatus(message,state='ready'){const node=document.getElementById('touchBridgeStatus');if(node){node.textContent=message;node.dataset.state=state}}
