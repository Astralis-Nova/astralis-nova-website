const BOARD_NAMES={VD:'Void Command Platform',NP:'Port Nexus',NS:'Starboard Nexus',SD:'Silver Command Platform'};
let guideTimer=null;

installStyles();
installGuide();

function installStyles(){
  const style=document.createElement('style');
  style.textContent=`
    @keyframes novaMovePulse{0%,100%{box-shadow:inset 0 0 0 4px #66ffd6,0 0 10px rgba(83,255,211,.65)}50%{box-shadow:inset 0 0 0 6px #d8fff5,0 0 28px rgba(83,255,211,1)}}
    @keyframes novaBoardPulse{0%,100%{filter:brightness(1.12) saturate(1.18) drop-shadow(0 0 10px rgba(69,217,255,.28))}50%{filter:brightness(1.42) saturate(1.5) drop-shadow(0 0 28px rgba(69,217,255,.78))}}
    .square.legal{z-index:8!important;animation:novaMovePulse 1.15s ease-in-out infinite!important;box-shadow:inset 0 0 0 4px #66ffd6,0 0 22px rgba(83,255,211,.85)!important}
    .square.legal::before{width:46%!important;min-width:14px!important;z-index:12!important;background:#79ffdc!important;border:3px solid #effffb!important;box-shadow:0 0 8px #fff,0 0 24px #43edbd!important}
    .square.capture{z-index:8!important;box-shadow:inset 0 0 0 5px #ff7390,0 0 26px rgba(255,96,125,.9)!important}
    .square.capture::before{z-index:12!important;width:82%!important;border-width:6px!important;border-color:#ff7f99!important;box-shadow:inset 0 0 20px rgba(255,96,125,.32),0 0 22px rgba(255,96,125,.9)!important}
    .tri-board-shell.move-target-board{z-index:45!important;animation:novaBoardPulse 1.35s ease-in-out infinite!important}
    .deck-tabs button.move-target-tab{color:#04111b!important;background:#66ffd6!important;box-shadow:0 0 18px rgba(83,255,211,.72)!important}
    .move-guide-banner{position:absolute;left:50%;top:12px;translate:-50% 0;z-index:80;width:min(94%,720px);padding:11px 15px;border:1px solid rgba(116,242,255,.76);border-radius:12px;background:rgba(3,15,34,.96);box-shadow:0 12px 34px rgba(0,0,0,.48),0 0 24px rgba(69,217,255,.18);color:#f7fdff;text-align:center;font:800 .76rem/1.45 Inter,system-ui,sans-serif;letter-spacing:.02em;pointer-events:auto}
    .move-guide-banner strong{color:#79ffdc}.move-guide-banner.blocked{border-color:rgba(255,211,107,.72)}.move-guide-banner.blocked strong{color:#ffd36b}
    .move-guide-copy{display:block;margin-bottom:9px}
    .move-guide-actions{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
    .move-guide-button{min-height:42px;padding:9px 14px;border:1px solid #b8fff0;border-radius:999px;background:linear-gradient(180deg,#77ffdc,#31cfa8);color:#03131a;font:900 .76rem Inter,system-ui,sans-serif;box-shadow:0 6px 18px rgba(49,207,168,.28),0 0 16px rgba(83,255,211,.24);cursor:pointer;touch-action:manipulation}
    .move-guide-button:active{transform:translateY(1px);filter:brightness(.92)}
    .move-guide-button.capture-button{border-color:#ffd0da;background:linear-gradient(180deg,#ff9db0,#ff607d);color:#21030a}
    .move-guide-button small{display:block;font-size:.58rem;opacity:.72;margin-top:1px}
    @media(max-width:560px){.move-guide-banner{top:6px;padding:9px 10px;font-size:.68rem}.square.legal::before{width:55%!important}.move-guide-button{min-height:40px;padding:8px 12px;font-size:.72rem}}
    @media(prefers-reduced-motion:reduce){.square.legal,.tri-board-shell.move-target-board{animation:none!important}}
  `;
  document.head.append(style);
}

function installGuide(){
  const stage=document.getElementById('boardStage');
  if(!stage)return;
  const banner=document.createElement('div');
  banner.id='moveGuideBanner';
  banner.className='move-guide-banner';
  banner.hidden=true;
  banner.setAttribute('aria-live','polite');
  stage.append(banner);

  stage.addEventListener('click',event=>{
    if(event.target.closest('.move-guide-button'))return;
    queueGuide(70);
  });
  const observer=new MutationObserver(()=>queueGuide(25));
  for(const id of ['standardBoard','voidPlatformBoard','portNexusBoard','starboardNexusBoard','silverPlatformBoard']){
    const board=document.getElementById(id);
    if(board)observer.observe(board,{childList:true});
  }
}

function queueGuide(delay=30){
  clearTimeout(guideTimer);
  guideTimer=setTimeout(updateGuide,delay);
}

function updateGuide(){
  clearTargets();
  const selected=document.querySelector('.square.selected');
  const banner=document.getElementById('moveGuideBanner');
  if(!banner)return;
  if(!selected){banner.hidden=true;banner.replaceChildren();return}

  const legal=[...document.querySelectorAll('.square.legal,.square.capture')];
  const source=String(selected.dataset.square||'').toUpperCase();
  if(!legal.length){
    banner.hidden=false;
    banner.className='move-guide-banner blocked';
    banner.innerHTML=`<strong>${source||'That piece'} is blocked.</strong> Try a front pawn or either knight.`;
    speak(`${source||'That piece'} has no legal routes. Try a front pawn or either knight.`);
    return;
  }

  const squares=[];
  const boards=new Map();
  for(const target of legal){
    const square=String(target.dataset.square||'').toUpperCase();
    if(square&&!squares.includes(square))squares.push(square);
    const shell=target.closest('[data-board-shell]');
    if(shell){
      const id=shell.dataset.boardShell;
      shell.classList.add('move-target-board');
      boards.set(id,BOARD_NAMES[id]||id);
      document.querySelector(`#deckTabs button[data-board="${id}"]`)?.classList.add('move-target-tab');
    }
  }

  const boardText=boards.size?` on ${[...boards.values()].join(' or ')}`:'';
  banner.hidden=false;
  banner.className='move-guide-banner';
  banner.replaceChildren();

  const copy=document.createElement('span');
  copy.className='move-guide-copy';
  copy.innerHTML=`<strong>${legal.length} move${legal.length===1?'':'s'} available:</strong> ${squares.join(', ')}${boardText}.`;
  banner.append(copy);

  const actions=document.createElement('div');
  actions.className='move-guide-actions';
  for(const target of legal){
    const square=String(target.dataset.square||'').toUpperCase();
    const shell=target.closest('[data-board-shell]');
    const boardId=shell?.dataset.boardShell||'';
    const button=document.createElement('button');
    button.type='button';
    button.className=`move-guide-button${target.classList.contains('capture')?' capture-button':''}`;
    button.innerHTML=`Move to ${escapeHtml(square)}${boardId?`<small>${escapeHtml(BOARD_NAMES[boardId]||boardId)}</small>`:''}`;
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      const freshTarget=findTarget(square,boardId);
      if(!freshTarget){
        speak(`The destination ${square} refreshed before the move. Select the piece once more.`);
        return;
      }
      freshTarget.click();
    });
    actions.append(button);
  }
  banner.append(actions);

  speak(`${legal.length} legal route${legal.length===1?'':'s'} from ${source}: ${squares.join(', ')}${boardText}. Use the large move buttons or tap a pulsing square.`);
}

function findTarget(square,boardId){
  const candidates=[...document.querySelectorAll('.square.legal,.square.capture')];
  return candidates.find(node=>{
    const sameSquare=String(node.dataset.square||'').toUpperCase()===square;
    const nodeBoard=node.closest('[data-board-shell]')?.dataset.boardShell||'';
    return sameSquare&&nodeBoard===boardId;
  })||null;
}

function clearTargets(){
  document.querySelectorAll('.move-target-board').forEach(node=>node.classList.remove('move-target-board'));
  document.querySelectorAll('.move-target-tab').forEach(node=>node.classList.remove('move-target-tab'));
}

function speak(text){
  const panel=document.getElementById('novaMessage');
  if(!panel)return;
  panel.innerHTML=`<span class="nova-avatar">N</span><p><strong>Nova:</strong> ${escapeHtml(text)}</p>`;
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
}
