installCoordinateGuide();

function installCoordinateGuide(){
  installStyles();
  installHelpPanel();
  labelSquares();
  const observer=new MutationObserver(labelSquares);
  for(const id of ['standardBoard','voidPlatformBoard','portNexusBoard','starboardNexusBoard','silverPlatformBoard']){
    const board=document.getElementById(id);
    if(board)observer.observe(board,{childList:true});
  }
}

function installStyles(){
  if(document.getElementById('coordinateGuideStyles'))return;
  const style=document.createElement('style');
  style.id='coordinateGuideStyles';
  style.textContent=`
    .square-coordinate{position:absolute;left:3px;top:2px;z-index:18;pointer-events:none;color:rgba(238,252,255,.92);font:900 clamp(.42rem,.8vw,.68rem)/1 Inter,system-ui,sans-serif;text-shadow:0 1px 3px #000,0 0 5px #000}
    .square.light .square-coordinate{color:#082239;text-shadow:0 1px 2px rgba(255,255,255,.75)}
    .square.selected .square-coordinate{color:#fff4a8!important;text-shadow:0 0 5px #000,0 0 10px #ffd95f!important}
    .square.legal .square-coordinate{color:#001b15!important;background:#8affdf;border-radius:4px;padding:2px;text-shadow:none!important}
    .square.capture .square-coordinate{color:#21020a!important;background:#ff91a8;border-radius:4px;padding:2px;text-shadow:none!important}
    .chess-help-panel{margin:0 0 12px;padding:13px;border:1px solid rgba(102,255,214,.52);border-radius:14px;background:linear-gradient(135deg,rgba(5,31,50,.96),rgba(19,21,66,.94));box-shadow:0 10px 28px rgba(0,0,0,.3),0 0 22px rgba(69,217,255,.1)}
    .chess-help-panel strong{display:block;color:#8affdf;font:950 .82rem Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px}
    .chess-help-panel p{margin:0;color:#d1e4f3;font:750 .72rem/1.5 Inter,system-ui,sans-serif}
    .tier-map{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;margin-top:9px}
    .tier-map span{padding:6px;border:1px solid rgba(121,182,255,.2);border-radius:8px;background:rgba(2,11,28,.48);color:#c7dcf0;font:800 .59rem/1.25 Inter,system-ui,sans-serif;text-align:center}
    @media(max-width:680px){.tier-map{grid-template-columns:1fr 1fr}.square-coordinate{left:2px;top:2px;font-size:.44rem}}
  `;
  document.head.append(style);
}

function installHelpPanel(){
  const toolbar=document.querySelector('.board-toolbar');
  if(!toolbar||document.getElementById('chessHelpPanel'))return;
  const panel=document.createElement('section');
  panel.id='chessHelpPanel';
  panel.className='chess-help-panel';
  panel.innerHTML=`
    <strong>How to move</strong>
    <p>Tap a white piece once. Then use the bright green move buttons fixed at the bottom of the screen. Start with E2, then choose E3 or E4.</p>
    <div class="tier-map"><span>VOID<br>A8–H7</span><span>PORT NEXUS<br>A6–D3</span><span>STARBOARD<br>E6–H3</span><span>SILVER<br>A2–H1</span></div>`;
  toolbar.insertAdjacentElement('afterend',panel);
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
