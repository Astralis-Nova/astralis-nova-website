import './move-repair.js?v=16';

const BOARD_NAMES={VD:'Void A8–H7',NP:'Port Nexus A6–D3',NS:'Starboard Nexus E6–H3',SD:'Silver A2–H1'};
let refreshTimer=null;

installStyles();
installPanel();
observeBoards();
queueRefresh(50);

function installStyles(){
  const style=document.createElement('style');
  style.textContent=`
    .square-coordinate{position:absolute;left:3px;top:2px;z-index:18;pointer-events:none;color:rgba(238,252,255,.9);font:900 clamp(.42rem,.8vw,.68rem)/1 Inter,system-ui,sans-serif;letter-spacing:.02em;text-shadow:0 1px 3px #000,0 0 5px #000}
    .square.light .square-coordinate{color:#082239;text-shadow:0 1px 2px rgba(255,255,255,.72)}
    .square.selected .square-coordinate{color:#fff4a8!important;text-shadow:0 0 5px #000,0 0 10px #ffd95f!important}
    .square.legal .square-coordinate{color:#001b15!important;background:#8affdf;border-radius:4px;padding:2px;text-shadow:none!important}
    .square.capture .square-coordinate{color:#21020a!important;background:#ff91a8;border-radius:4px;padding:2px;text-shadow:none!important}
    .chess-help-panel{margin:0 0 12px;padding:13px;border:1px solid rgba(102,255,214,.52);border-radius:14px;background:linear-gradient(135deg,rgba(5,31,50,.96),rgba(19,21,66,.94));box-shadow:0 10px 28px rgba(0,0,0,.3),0 0 22px rgba(69,217,255,.1)}
    .chess-help-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:9px}
    .chess-help-head strong{display:block;color:#8affdf;font:950 .82rem Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
    .chess-help-head span{display:block;margin-top:3px;color:#bdd4e8;font:700 .69rem/1.4 Inter,system-ui,sans-serif}
    .coordinate-key{flex:none;padding:5px 8px;border:1px solid rgba(146,221,255,.34);border-radius:999px;color:#dff8ff!important;background:rgba(4,14,31,.72);font-size:.6rem!important;white-space:nowrap}
    .tier-map{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-bottom:10px}
    .tier-map span{padding:6px;border:1px solid rgba(121,182,255,.2);border-radius:8px;background:rgba(2,11,28,.48);color:#c7dcf0;font:800 .59rem/1.25 Inter,system-ui,sans-serif;text-align:center}
    .move-choice-status{color:#f4fbff;font:850 .74rem/1.45 Inter,system-ui,sans-serif;margin-bottom:8px}
    .move-choice-status strong{color:#ffe27d}
    .move-choice-status[data-state="busy"]{color:#9feaff}.move-choice-status[data-state="success"]{color:#86ffe1}.move-choice-status[data-state="error"]{color:#ff9caf}
    .move-choice-actions{display:flex;flex-wrap:wrap;gap:8px}
    .move-choice-button{min-height:44px;padding:9px 14px;border:1px solid #cafff4;border-radius:999px;background:linear-gradient(180deg,#86ffe1,#32d2aa);color:#031a16;font:950 .76rem/1 Inter,system-ui,sans-serif;box-shadow:0 7px 18px rgba(50,210,170,.22),0 0 15px rgba(83,255,211,.18);cursor:pointer;touch-action:manipulation}
    .move-choice-button small{display:block;margin-top:3px;font-size:.57rem;opacity:.7}
    .move-choice-button.capture{border-color:#ffd0da;background:linear-gradient(180deg,#ff9caf,#ff607d);color:#26020b}
    .move-choice-button:active{transform:translateY(1px);filter:brightness(.92)}
    .coordinate-target-board{z-index:75!important;filter:brightness(1.35) saturate(1.45) drop-shadow(0 0 26px rgba(72,239,255,.7))!important}
    .coordinate-source-board{z-index:60!important}
    .tri-deck-stage.coordinate-selection-active .tri-board-shell{pointer-events:none!important}
    .tri-deck-stage.coordinate-selection-active .coordinate-target-board,
    .tri-deck-stage.coordinate-selection-active .coordinate-source-board{pointer-events:auto!important}
    .coordinate-target-board .tri-board{border-color:#8affdf!important;box-shadow:0 0 0 4px rgba(3,13,29,.94),0 0 0 8px rgba(102,255,214,.95),0 20px 38px rgba(0,0,0,.7),0 0 40px rgba(69,217,255,.68)!important}
    @media(max-width:680px){.tier-map{grid-template-columns:1fr 1fr}.chess-help-head{display:block}.coordinate-key{display:inline-block;margin-top:7px}.square-coordinate{left:2px;top:2px;font-size:.44rem}.move-choice-button{flex:1 1 42%;padding:9px 8px}}
  `;
  document.head.append(style);
}

function installPanel(){
  const toolbar=document.querySelector('.board-toolbar');
  if(!toolbar||document.getElementById('chessHelpPanel'))return;
  const panel=document.createElement('section');
  panel.id='chessHelpPanel';
  panel.className='chess-help-panel';
  panel.setAttribute('aria-live','polite');
  panel.innerHTML=`
    <div class="chess-help-head">
      <div><strong>How to move</strong><span>Tap a white piece once. Then tap a glowing square or use a large move button below.</span></div>
      <span class="coordinate-key">Letters A–H · Numbers 1–8</span>
    </div>
    <div class="tier-map" aria-label="Tri-Deck coordinate map">
      <span>VOID<br>A8–H7</span><span>PORT NEXUS<br>A6–D3</span><span>STARBOARD<br>E6–H3</span><span>SILVER<br>A2–H1</span>
    </div>
    <div class="move-choice-status" id="moveChoiceStatus">Start with a white pawn on row 2. Example: tap <strong>E2</strong>.</div>
    <div class="move-choice-actions" id="moveChoiceActions"></div>`;
  toolbar.insertAdjacentElement('afterend',panel);
}

function observeBoards(){
  const stage=document.getElementById('boardStage');
  stage?.addEventListener('click',()=>queueRefresh(80),true);
  document.getElementById('moveChoiceActions')?.addEventListener('click',event=>{
    const button=event.target.closest('button[data-square]');
    if(!button)return;
    event.preventDefault();
    const target=findTarget(button.dataset.square,button.dataset.board||'');
    if(!target){setStatus(`Destination ${button.dataset.square} refreshed. Tap the piece again.`);return}
    target.focus({preventScroll:true});
    target.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
    queueRefresh(160);
  });

  const observer=new MutationObserver(()=>queueRefresh(35));
  for(const id of ['standardBoard','voidPlatformBoard','portNexusBoard','starboardNexusBoard','silverPlatformBoard']){
    const board=document.getElementById(id);
    if(board)observer.observe(board,{childList:true});
  }
}

function queueRefresh(delay=30){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshGuide,delay)}

function refreshGuide(){
  labelSquares();
  clearTierClasses();
  const selected=document.querySelector('.square.selected');
  const actions=document.getElementById('moveChoiceActions');
  if(!actions)return;
  actions.replaceChildren();
  if(!selected){setStatus('Start with a white pawn on row 2. Example: tap <strong>E2</strong>, then choose E3 or E4.');return}

  const source=String(selected.dataset.square||'').toUpperCase();
  selected.closest('[data-board-shell]')?.classList.add('coordinate-source-board');
  const legal=[...document.querySelectorAll('.square.legal,.square.capture')];
  if(!legal.length){setStatus(`<strong>${source}</strong> has no legal move. At the opening, use a pawn on row 2 or a knight.`);return}

  const stage=document.getElementById('triDeckStage');
  if(stage&&!stage.hidden)stage.classList.add('coordinate-selection-active');
  const names=[];
  for(const target of legal){
    const square=String(target.dataset.square||'').toUpperCase();
    const shell=target.closest('[data-board-shell]');
    const board=shell?.dataset.boardShell||'';
    if(shell)shell.classList.add('coordinate-target-board');
    names.push(square);
    const button=document.createElement('button');
    button.type='button';
    button.className=`move-choice-button${target.classList.contains('capture')?' capture':''}`;
    button.dataset.square=square;
    button.dataset.board=board;
    button.innerHTML=`MOVE TO ${escapeHtml(square)}${board?`<small>${escapeHtml(BOARD_NAMES[board]||board)}</small>`:''}`;
    actions.append(button);
  }
  setStatus(`<strong>${source}</strong> selected. Legal destinations: ${names.join(', ')}. Tap a large button below.`);
}

function labelSquares(){
  document.querySelectorAll('.square[data-square]').forEach(square=>{
    if(square.querySelector('.square-coordinate'))return;
    const label=document.createElement('span');
    label.className='square-coordinate';
    label.textContent=String(square.dataset.square||'').toUpperCase();
    label.setAttribute('aria-hidden','true');
    square.append(label);
  });
}

function clearTierClasses(){
  const stage=document.getElementById('triDeckStage');
  stage?.classList.remove('coordinate-selection-active');
  document.querySelectorAll('.coordinate-target-board,.coordinate-source-board').forEach(node=>node.classList.remove('coordinate-target-board','coordinate-source-board'));
}

function findTarget(square,board){
  const selector=`.square[data-square="${cssEscape(String(square).toLowerCase())}"]`;
  if(board){
    const shell=document.querySelector(`[data-board-shell="${cssEscape(board)}"]`);
    const exact=shell?.querySelector(selector);
    if(exact?.classList.contains('legal')||exact?.classList.contains('capture'))return exact;
  }
  return [...document.querySelectorAll(selector)].find(node=>node.classList.contains('legal')||node.classList.contains('capture'))||null;
}

function setStatus(html){const node=document.getElementById('moveChoiceStatus');if(node)node.innerHTML=html}
function cssEscape(value){return window.CSS?.escape?CSS.escape(value):String(value).replace(/[^a-zA-Z0-9_-]/g,'\\$&')}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
