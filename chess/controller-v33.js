import('./controller-core-v29.js?v=37')
  .then(()=>import('./rules-guide-v29.js?v=37'))
  .then(()=>import('./capture-tray-v23.js?v=37'))
  .then(()=>import('./piece-colors-v24.js?v=37'))
  .then(()=>import('./cosmic-pieces-v33.js?v=37'))
  .then(()=>import('./online-v20.js?v=37'))
  .then(()=>{
    document.documentElement.dataset.astralisVisual='celestial-fleet-v37';
    const core=window.NovaChessCore,badge=document.querySelector('.badge'),notice=document.querySelector('.notice');
    if(badge)badge.textContent='CELESTIAL FLEET V37';
    if(notice)notice.innerHTML=`<strong>V37 Astralis sphere render:</strong> refined Sun King, Moon Queen, Astralis Nova Citadels, ringed-world bishops, comet knights, and cratered asteroid pawns. Pieces use layered sphere lighting, reflective highlights, rim light and metallic bases. The board retains its ${core?.ruleAudit?.passedCount||0}/${core?.ruleAudit?.total||0} regulation rules audit.`;
    installV37BoardTools();
  })
  .catch(error=>{console.error('V37 chess controller failed to start',error);const status=document.getElementById('status');if(status){status.textContent=`Controller startup failed: ${error.message}`;status.className='status bad'}});

function installV37BoardTools(){
  if(document.getElementById('v37BoardTools'))return;
  const style=document.createElement('style');style.id='v37BoardTools';style.textContent=`
    :root{--nova-board-zoom:1}
    .layout{grid-template-columns:1fr!important}
    .side{position:static!important}
    .battlefield{min-height:auto!important;padding:10px!important;overflow:auto!important}
    .tier-stack{transform:scale(var(--nova-board-zoom));transform-origin:top center;transition:transform .18s ease;max-width:900px!important;margin-inline:auto!important}
    .nova-zoom-bar{display:flex;align-items:center;justify-content:center;gap:9px;margin:0 0 10px;padding:8px;border:1px solid rgba(112,231,255,.35);border-radius:12px;background:rgba(4,18,38,.78)}
    .nova-zoom-bar .zoom-label{color:#bcefff;font-weight:900;font-size:.72rem;margin-right:2px}
    .nova-zoom-bar button{min-width:42px;min-height:38px;border:1px solid #78dfff;border-radius:9px;background:#103c68;color:#fff;font-size:1.15rem;font-weight:950;cursor:pointer}
    .nova-zoom-bar output{min-width:60px;text-align:center;color:#e8fdff;font-weight:950;font-size:.8rem}
    @media(max-width:700px){.tier-shell.home{width:100%!important}.tier-stack{padding-left:0!important;padding-right:0!important}.nova-zoom-bar{position:sticky;top:4px;z-index:30;backdrop-filter:blur(8px)}}
  `;document.head.append(style);

  const battlefield=document.querySelector('.battlefield');if(!battlefield)return;
  const bar=document.createElement('div');bar.className='nova-zoom-bar';bar.setAttribute('aria-label','Board zoom controls');bar.innerHTML='<span class="zoom-label">Board Zoom</span><button type="button" data-z="out" aria-label="Zoom out">−</button><output id="novaZoomReadout">100%</output><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="reset" aria-label="Reset zoom" style="font-size:.7rem;min-width:58px">Reset</button>';
  battlefield.insertAdjacentElement('beforebegin',bar);
  let zoom=Number(localStorage.getItem('novaBoardZoom')||1);if(!Number.isFinite(zoom))zoom=1;
  const apply=()=>{zoom=Math.max(.72,Math.min(1.18,zoom));document.documentElement.style.setProperty('--nova-board-zoom',zoom.toFixed(2));bar.querySelector('#novaZoomReadout').value=`${Math.round(zoom*100)}%`;localStorage.setItem('novaBoardZoom',String(zoom));};
  bar.addEventListener('click',e=>{const action=e.target.closest('button')?.dataset?.z;if(action==='out')zoom-=.05;if(action==='in')zoom+=.05;if(action==='reset')zoom=1;apply();});
  apply();
}
