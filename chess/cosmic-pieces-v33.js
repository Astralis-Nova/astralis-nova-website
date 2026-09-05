const core=window.NovaChessCore;
if(!core)throw new Error('Astralis Nova celestial fleet requires the regulation chess core.');

const ROLES={
  k:['Solar Crown King','king'],q:['Lunar Crescent Queen','queen'],r:['Astralis Nova Citadel','rook'],
  b:['Ringed World Seer','bishop'],n:['Comet Strider','knight'],p:['Frontier Asteroid','pawn']
};
const CLASSIC={
  '♔':['k','w'],'♕':['q','w'],'♖':['r','w'],'♗':['b','w'],'♘':['n','w'],'♙':['p','w'],
  '♚':['k','b'],'♛':['q','b'],'♜':['r','b'],'♝':['b','b'],'♞':['n','b'],'♟':['p','b']
};
let serial=0;

installStyles();
applyFleet();
new MutationObserver(applyFleet).observe(document.body,{childList:true,subtree:true});

function installStyles(){
  if(document.getElementById('celestialFleetStyles'))return;
  const style=document.createElement('style');
  style.id='celestialFleetStyles';
  style.textContent=`
    .piece.celestial-piece{
      position:relative!important;display:grid!important;place-items:center!important;
      width:132%!important;height:132%!important;max-width:none!important;max-height:none!important;
      overflow:visible!important;color:transparent!important;-webkit-text-stroke:0!important;text-shadow:none!important;
      transform:translateY(-2%) translateZ(0);filter:none!important;pointer-events:none;
      --c0:#ffffff;--c1:#dffaff;--c2:#72d6ef;--c3:#276e9c;--c4:#071c31;
      --edge:#f0ffff;--glow:#64e6ff;--hot:#fff2a4;--dark:#020712;
    }
    .piece.celestial-piece.fleet-black{
      --c0:#fff7ff;--c1:#e2cfff;--c2:#a070e8;--c3:#553090;--c4:#0b061d;
      --edge:#eadfff;--glow:#b26cff;--hot:#f4d4ff;--dark:#05020d;
    }
    .celestial-svg{
      width:100%;height:100%;overflow:visible;display:block;
      filter:drop-shadow(0 5px 3px rgba(0,0,0,.9)) drop-shadow(0 0 3px var(--glow));
      transform:scale(1.06);transform-origin:50% 58%;
    }
    .sq:hover .celestial-svg,.sq.selected .celestial-svg{
      transform:scale(1.11);
      filter:drop-shadow(0 6px 4px rgba(0,0,0,.92)) drop-shadow(0 0 7px var(--glow));
    }
    .celestial-svg .edge{stroke:var(--edge);stroke-width:1.2;stroke-linejoin:round;stroke-linecap:round}
    .celestial-svg .fine{fill:none;stroke:var(--c0);stroke-width:.8;stroke-linecap:round;opacity:.58}
    .celestial-svg .energy{fill:var(--hot);stroke:#fff;stroke-width:.55}
    .celestial-svg .window{fill:#eaffff;stroke:var(--glow);stroke-width:.6}
    .celestial-svg .crater{fill:var(--c4);stroke:var(--c1);stroke-width:.75;opacity:.88}
    .celestial-svg .orbit{fill:none;stroke:var(--edge);stroke-width:2.05;opacity:.94}
    .celestial-svg .orbit2{fill:none;stroke:var(--glow);stroke-width:.75;opacity:.7}
    .celestial-svg .spark{fill:#fff}
    .capture-piece.celestial-capture{
      display:inline-grid!important;place-items:center!important;width:1.8em!important;height:1.8em!important;
      color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important;
      --c0:#fff;--c1:#dffaff;--c2:#72d6ef;--c3:#276e9c;--c4:#071c31;
      --edge:#f0ffff;--glow:#64e6ff;--hot:#fff2a4;--dark:#020712;
    }
    .capture-piece.celestial-capture.fleet-black{
      --c0:#fff7ff;--c1:#e2cfff;--c2:#a070e8;--c3:#553090;--c4:#0b061d;
      --edge:#eadfff;--glow:#b26cff;--hot:#f4d4ff;--dark:#05020d;
    }
    .capture-piece.celestial-capture .celestial-svg{width:1.8em;height:1.8em}
    @media(max-width:520px){
      .piece.celestial-piece{width:140%!important;height:140%!important}
      .celestial-svg{transform:scale(1.1)}
    }
  `;
  document.head.append(style);
}

function defs(id,type,color){
  const isVoid=color==='b';
  const sunHot=isVoid?'#b54dff':'#fff5a8';
  const sunMid=isVoid?'#6d26ba':'#ff9f25';
  const sunDeep=isVoid?'#12031f':'#8b1b08';
  return `<defs>
    <linearGradient id="metal-${id}" x1="18%" y1="5%" x2="82%" y2="96%">
      <stop stop-color="var(--c0)"/><stop offset=".18" stop-color="var(--c1)"/>
      <stop offset=".43" stop-color="var(--c2)"/><stop offset=".68" stop-color="var(--c3)"/>
      <stop offset=".86" stop-color="var(--c4)"/><stop offset="1" stop-color="#010309"/>
    </linearGradient>
    <linearGradient id="chrome-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="var(--c4)"/><stop offset=".18" stop-color="var(--c0)"/>
      <stop offset=".36" stop-color="var(--c2)"/><stop offset=".58" stop-color="var(--c0)"/>
      <stop offset=".78" stop-color="var(--c3)"/><stop offset="1" stop-color="var(--c4)"/>
    </linearGradient>
    <radialGradient id="orb-${id}" cx="28%" cy="20%" r="78%">
      <stop stop-color="var(--c0)"/><stop offset=".17" stop-color="var(--c1)"/>
      <stop offset=".43" stop-color="var(--c2)"/><stop offset=".72" stop-color="var(--c3)"/>
      <stop offset="1" stop-color="var(--c4)"/>
    </radialGradient>
    <radialGradient id="sun-${id}" cx="35%" cy="28%" r="75%">
      <stop stop-color="#fff"/><stop offset=".13" stop-color="${sunHot}"/>
      <stop offset=".46" stop-color="${sunMid}"/><stop offset=".78" stop-color="${sunDeep}"/>
      <stop offset="1" stop-color="#020108"/>
    </radialGradient>
    <linearGradient id="tail-${id}" x1="0" x2="1">
      <stop stop-color="var(--glow)" stop-opacity="0"/><stop offset=".48" stop-color="var(--glow)" stop-opacity=".62"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <filter id="blur-${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter>
    <filter id="glow-${id}" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

function base(id,w=30){
  return `<ellipse cx="50" cy="91" rx="${w+4}" ry="4.6" fill="#000" opacity=".75"/>
    <path class="edge" fill="url(#chrome-${id})" d="M${50-w} 78 Q50 73 ${50+w} 78 L${50+w-3} 87 Q50 92 ${50-w+3} 87Z"/>
    <path fill="url(#metal-${id})" stroke="var(--edge)" stroke-width="1" d="M${50-w-3} 86H${50+w+3}L${50+w-6} 95H${50-w+6}Z"/>
    <path d="M${50-w+8} 89H${50+w-8}" stroke="var(--hot)" stroke-width="1.25" opacity=".75"/>`;
}

function asteroid(id){
  return `${base(id,25)}
    <path class="edge" fill="url(#orb-${id})" d="M24 59 19 47l5-13 11-10 16-5 16 4 11 10 4 13-5 15-11 11-16 4-15-3-11-8Z"/>
    <path fill="var(--c4)" opacity=".42" d="M27 57 38 38l20-10 17 9-3 18-14 12-17 5Z"/>
    <ellipse class="crater" cx="38" cy="37" rx="6.7" ry="4.4" transform="rotate(-20 38 37)"/>
    <ellipse class="crater" cx="61" cy="54" rx="7.8" ry="4.8" transform="rotate(17 61 54)"/>
    <circle class="crater" cx="58" cy="28" r="3.1"/><circle class="crater" cx="34" cy="58" r="2.7"/>
    <circle class="crater" cx="69" cy="42" r="2.3"/><path class="fine" d="m27 47 9-3m29-7 8 4m-25 27 10-3"/>`;
}

function king(id,color){
  return `${base(id,31)}
    <circle cx="50" cy="39" r="35" fill="var(--glow)" opacity=".22" filter="url(#blur-${id})"/>
    <g fill="var(--hot)" opacity=".86">
      <path d="M50 1 54 11 61 3 60 14 72 7 66 18 79 15 69 24 83 26 70 31 84 38 68 38 79 49 64 43 70 57 59 47 58 62 50 49 42 62 41 47 30 57 36 43 21 49 32 38 16 38 30 31 17 26 31 24 21 15 34 18 28 7 40 14 39 3 46 11Z"/>
    </g>
    <circle class="edge" cx="50" cy="41" r="27" fill="url(#sun-${id})"/>
    <circle cx="42" cy="33" r="11" fill="#fff" opacity=".12"/>
    <path class="fine" d="M30 35c12 5 23-6 40 0M27 44c16-5 31 7 46 0M32 54c12-5 22 3 36-1"/>
    <path class="edge" fill="url(#metal-${id})" d="M29 28 34 12l11 8 5-17 6 17 11-8 4 16-8 11H37Z"/>
    <path class="energy" d="m50 9 3 8-3 8-3-8Z"/><circle class="window" cx="50" cy="31" r="3.2"/>`;
}

function queen(id){
  return `${base(id,30)}
    <path class="edge" fill="url(#orb-${id})" fill-rule="evenodd" d="M70 14c-24 3-39 22-36 43 3 18 18 31 37 29-12-6-18-17-15-30 3-14 14-23 28-26-3-7-8-12-14-16Z"/>
    <path class="fine" d="M44 32c9 4 17 1 24-3M40 46c10 4 18 2 26-1M43 60c8 3 14 2 20 0"/>
    <circle class="crater" cx="48" cy="38" r="3.3"/><circle class="crater" cx="45" cy="54" r="2.5"/>
    <ellipse class="orbit" cx="51" cy="55" rx="37" ry="12" transform="rotate(-14 51 55)"/>
    <ellipse class="orbit2" cx="51" cy="55" rx="31" ry="8" transform="rotate(-14 51 55)"/>
    <path class="edge" fill="url(#metal-${id})" d="M29 25 25 9l14 7 11-14 11 14 14-7-4 16-10 10H39Z"/>
    <circle class="window" cx="50" cy="18" r="3"/><path class="energy" d="m50 6 2.6 5.5L58 14l-5.4 2.5L50 22l-2.6-5.5L42 14l5.4-2.5Z"/>`;
}

function rook(id){
  return `${base(id,32)}
    <g filter="url(#glow-${id})"><path fill="var(--glow)" opacity=".15" d="M20 75V24h13V11h8v18h6V7h7v22h6V15h8v14h12v46Z"/></g>
    <path class="edge" fill="url(#metal-${id})" d="M21 72V31h9v-9h9v12h7V17h8v17h7V24h9v10h9v-8h9v46l-10 9H31Z"/>
    <path fill="var(--c4)" opacity=".66" d="M28 69V43h44v26l-9 9H37Z"/>
    <path class="fine" d="M29 62h42M33 40h34M39 43v29M50 40v35M61 43v29"/>
    <rect class="window" x="33" y="48" width="6" height="10" rx="1"/><rect class="window" x="45" y="48" width="6" height="10" rx="1"/>
    <rect class="window" x="57" y="48" width="6" height="10" rx="1"/><rect class="window" x="69" y="48" width="4.5" height="10" rx="1"/>
    <path class="energy" d="m50 1 3.5 8.5L62 6l-4 8 9 3-9 3 4 8-8.5-3.4L50 33l-3.5-8.4L38 28l4-8-9-3 9-3-4-8 8.5 3.5Z"/>
    <path d="M50 28v17" stroke="var(--hot)" stroke-width="2.5"/>`;
}

function bishop(id){
  return `${base(id,30)}
    <circle cx="50" cy="48" r="29" fill="var(--glow)" opacity=".15" filter="url(#blur-${id})"/>
    <circle class="edge" cx="50" cy="49" r="25" fill="url(#orb-${id})"/>
    <path class="fine" d="M29 41c12 5 26-5 42 0M28 53c15-5 29 7 44 0"/>
    <ellipse class="orbit" cx="50" cy="50" rx="39" ry="12.5" transform="rotate(-15 50 50)"/>
    <ellipse class="orbit2" cx="50" cy="50" rx="34" ry="9" transform="rotate(-15 50 50)"/>
    <circle class="energy" cx="72" cy="25" r="4.2"/>
    <path class="edge" fill="url(#metal-${id})" d="M43 28 50 6l7 22-7 12Z"/>
    <path d="M50 13 46 31" stroke="var(--hot)" stroke-width="2.6"/><path class="fine" d="M50 23v49"/>`;
}

function knight(id){
  return `${base(id,31)}
    <path d="M7 64c17-3 29-13 40-31" fill="none" stroke="url(#tail-${id})" stroke-width="12" stroke-linecap="round"/>
    <path d="M12 69c17-5 28-12 38-28" fill="none" stroke="var(--glow)" stroke-width="2" opacity=".5"/>
    <path class="edge" fill="url(#metal-${id})" d="M28 73c4-18 12-32 24-39l4-13-10-13c19 1 31 10 35 28l-8 12 8 24-15-5-7-16-9 7-4 15Z"/>
    <path fill="var(--c4)" opacity=".7" d="M54 29c8-3 16 0 21 6l-6 7-13-2Z"/>
    <circle class="window" cx="69" cy="33" r="2.5"/>
    <path class="fine" d="M39 59c9 0 16 5 21 12M57 22l12 9M48 12l9 8"/>
    <path class="energy" d="m78 48 3 6 6 2-6 3-3 6-3-6-6-3 6-2Z"/>`;
}

function art(type,id,color){
  if(type==='k')return king(id,color);
  if(type==='q')return queen(id);
  if(type==='r')return rook(id);
  if(type==='b')return bishop(id);
  if(type==='n')return knight(id);
  return asteroid(id);
}

function svg(type,color){
  const id=`nova${++serial}`;
  return `<svg class="celestial-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${defs(id,type,color)}${art(type,id,color)}</svg>`;
}

function applyFleet(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{
    const node=square.querySelector('.piece'),piece=core.game?.get(square.dataset.square);
    if(!node||!piece||!ROLES[piece.type])return;
    const key=`${piece.color}-${piece.type}`;
    if(node.dataset.celestialRole!==key){node.innerHTML=svg(piece.type,piece.color);node.dataset.celestialRole=key}
    node.classList.add('celestial-piece');
    node.classList.toggle('fleet-white',piece.color==='w');
    node.classList.toggle('fleet-black',piece.color==='b');
    node.dataset.piece=piece.type;node.dataset.fleet=piece.color==='w'?'silver':'void';
    const fleet=piece.color==='w'?'Silver Starfleet':'Void Fleet',role=ROLES[piece.type];
    const label=`${square.dataset.square.toUpperCase()} ${fleet} ${role[0]} (${role[1]})`;
    node.setAttribute('aria-hidden','true');square.setAttribute('aria-label',label);square.title=label;
  });
  document.querySelectorAll('.capture-piece').forEach(node=>{
    let type=node.dataset.piece,color=node.dataset.fleetColor;
    if(!type){const old=CLASSIC[node.textContent.trim()];if(!old)return;[type,color]=old;node.dataset.piece=type;node.dataset.fleetColor=color}
    if(!ROLES[type])return;
    const key=`${color}-${type}`;
    if(node.dataset.celestialCaptureRole!==key){node.innerHTML=svg(type,color);node.dataset.celestialCaptureRole=key}
    node.classList.add('celestial-capture');
    node.classList.toggle('fleet-white',color==='w');node.classList.toggle('fleet-black',color==='b');
  });
}
