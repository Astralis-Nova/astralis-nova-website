const core=window.NovaChessCore;
if(!core)throw new Error('Astralis Nova celestial fleet requires the regulation chess core.');

const ROLES={
  k:['Crownstar Prime','king'],q:['Lunar Empress World','queen'],
  r:['Astralis Nova Citadel','rook'],b:['Aurora World','bishop'],
  n:['Orbital World','knight'],p:['Frontier Asteroid','pawn']
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
    .piece.celestial-piece{position:relative;display:grid;place-items:center;width:98%;height:98%;overflow:visible;color:inherit!important;-webkit-text-stroke:0!important;text-shadow:none!important;transform:translateZ(0);--light:#f8ffff;--mid:#83dced;--deep:#15345d;--edge:#e3ffff;--glow:#56e6ff;--hot:#fff4a9;filter:drop-shadow(0 4px 3px #000c) drop-shadow(0 0 5px var(--glow))!important}
    .piece.celestial-piece.fleet-black{--light:#d2c8ff;--mid:#6451a6;--deep:#08031a;--edge:#a9eaff;--glow:#9b68ff;--hot:#ead5ff}
    .celestial-svg{display:block;width:100%;height:100%;overflow:visible}
    .celestial-svg .sphere{fill:url(#planet);stroke:var(--edge);stroke-width:1.25}
    .celestial-svg .night{fill:var(--deep);opacity:.55}.celestial-svg .land{fill:var(--light);opacity:.18}
    .celestial-svg .surface{fill:none;stroke:var(--light);stroke-width:1.2;opacity:.4}
    .celestial-svg .crater{fill:var(--deep);stroke:var(--mid);stroke-width:.8;opacity:.76}
    .celestial-svg .orbit{fill:none;stroke:var(--edge);stroke-width:2;opacity:.92}
    .celestial-svg .metal{fill:url(#metal);stroke:var(--edge);stroke-width:1.05}
    .celestial-svg .dark-metal{fill:var(--deep);stroke:var(--edge);stroke-width:.9}
    .celestial-svg .nova{fill:var(--hot);stroke:#fff;stroke-width:.65}
    .celestial-svg .beam{fill:none;stroke:var(--hot);stroke-width:2.5;stroke-linecap:round}
    .celestial-svg .base{fill:url(#metal);stroke:var(--edge)}.celestial-svg .rim{fill:var(--deep);stroke:var(--mid)}
    .celestial-svg .base-light{stroke:var(--hot);stroke-width:1.4;opacity:.82}
    .celestial-piece[data-piece="k"]{animation:crownstar 4.8s ease-in-out infinite}
    .celestial-piece[data-piece="r"] .nova{animation:citadel 3.8s ease-in-out infinite;transform-origin:50px 13px}
    .capture-piece.celestial-capture{display:inline-grid;place-items:center;width:1.5em;height:1.5em;vertical-align:middle;--light:#f8ffff;--mid:#83dced;--deep:#15345d;--edge:#e3ffff;--glow:#56e6ff;--hot:#fff4a9}
    .capture-piece.celestial-capture.fleet-black{--light:#d2c8ff;--mid:#6451a6;--deep:#08031a;--edge:#a9eaff;--glow:#9b68ff;--hot:#ead5ff}
    .capture-piece.celestial-capture .celestial-svg{width:1.5em;height:1.5em;filter:drop-shadow(0 0 3px var(--glow))}
    @keyframes crownstar{50%{filter:drop-shadow(0 4px 3px #000c) drop-shadow(0 0 10px var(--hot)) brightness(1.14)}}
    @keyframes citadel{0%,100%{opacity:.78;transform:scale(.9)}50%{opacity:1;transform:scale(1.16)}}
    @media(max-width:520px){.piece.celestial-piece{width:100%;height:100%}}
    @media(prefers-reduced-motion:reduce){.celestial-piece[data-piece="k"],.celestial-piece[data-piece="r"] .nova{animation:none}}
  `;
  document.head.append(style);
}

function defs(id){return `<defs>
  <radialGradient id="planet-${id}" cx="30%" cy="22%" r="74%"><stop stop-color="var(--light)"/><stop offset=".43" stop-color="var(--mid)"/><stop offset=".82" stop-color="var(--deep)"/><stop offset="1" stop-color="#010208"/></radialGradient>
  <linearGradient id="metal-${id}" x2="1" y2="1"><stop stop-color="var(--light)"/><stop offset=".45" stop-color="var(--mid)"/><stop offset="1" stop-color="var(--deep)"/></linearGradient>
  <radialGradient id="fire-${id}"><stop stop-color="#fff"/><stop offset=".35" stop-color="var(--hot)"/><stop offset="1" stop-color="var(--glow)" stop-opacity=".12"/></radialGradient>
  </defs>`}
function base(){return `<ellipse class="base" cx="50" cy="86" rx="31" ry="7"/><path class="rim" d="M18 86h64l-5 8H23Z"/><path class="base-light" d="M29 88h42"/>`}

function art(type){
  if(type==='p')return `<path class="metal" d="M28 63 22 48l8-17 17-9 19 5 12 16-5 18-16 12-18-3Z"/><path class="night" d="m28 63 12-18 20-6 18 4-5 18-16 12-18-3Z"/><ellipse class="crater" cx="40" cy="39" rx="7" ry="5" transform="rotate(-22 40 39)"/><ellipse class="crater" cx="61" cy="56" rx="8" ry="5" transform="rotate(18 61 56)"/><circle class="crater" cx="54" cy="31" r="3"/><circle class="crater" cx="35" cy="59" r="2.6"/>`;
  if(type==='k')return `<path class="nova" d="m50 3 4 12 10-8-3 13 13-1-10 8 12 5-15 2 7 12-13-7-5 14-5-14-13 7 7-12-15-2 12-5-10-8 13 1-3-13 10 8Z"/><circle cx="50" cy="42" r="29" fill="url(#fire)"/><circle class="sphere" cx="50" cy="42" r="23"/><path class="surface" d="M31 31c10 5 17-7 31-1M28 43c13-6 25 9 44 0M34 54c9-6 17 3 29-1"/><path class="metal" d="m34 23 6 6 10-12 10 12 6-6-3 16H37Z"/>`;
  if(type==='q')return `<circle class="sphere" cx="50" cy="43" r="27"/><path class="land" d="M27 37c13-10 26 5 46-3v9c-18 8-31-8-46 3ZM31 55c14-7 24 4 37-1l-5 8c-11 3-20-5-29 0Z"/><path class="surface" d="M26 34c17 8 30-7 47 0M24 44c18 9 32-8 52 0M29 55c14 7 27-5 41 0"/><circle class="nova" cx="74" cy="20" r="5"/><path class="orbit" d="M18 48c13 15 52 17 66-5"/><path class="metal" d="m36 20-4-12 11 7 7-11 7 11 11-7-4 12-8 7H44Z"/>`;
  if(type==='r')return `<circle class="sphere" cx="50" cy="48" r="27"/><path class="land" d="M29 39c11-9 22 3 41-5l5 12c-17 7-31-5-50 4Z"/><path class="dark-metal" d="M31 50V27h8v7h7v-9h8v9h7v-7h8v23l-5 9H36Z"/><path class="metal" d="M37 50V38h26v12l-5 8H42Z"/><rect class="nova" x="46" y="40" width="8" height="8" transform="rotate(45 50 44)"/><path class="nova" d="m50 4 3 8 8-4-4 8 9 3-9 2 4 9-8-5-3 9-3-9-8 5 4-9-9-2 9-3-4-8 8 4Z"/><path class="beam" d="M50 16v12"/>`;
  if(type==='b')return `<circle class="sphere" cx="50" cy="46" r="28"/><path class="land" d="M27 36c14 4 29-6 46 2l3 10c-19-7-31 8-52 1Z"/><path class="surface" d="M29 31c10 9 30 2 42 12M26 48c17-6 29 8 48 1M35 63c10-8 17 2 28-4"/><path class="beam" d="m68 20-36 52"/><circle class="nova" cx="69" cy="18" r="5"/><path class="orbit" d="M20 53c16 13 46 10 63-4"/>`;
  return `<circle class="sphere" cx="48" cy="47" r="27"/><path class="land" d="M25 41c13-11 27 8 48-2l2 12c-19 8-33-7-52 2Z"/><ellipse class="orbit" cx="50" cy="48" rx="38" ry="15" transform="rotate(-17 50 48)"/><circle class="nova" cx="78" cy="31" r="6"/><path class="metal" d="m72 26 8-7 7 5-3 10-9 3Z"/><path class="surface" d="M29 35c9 6 19-5 34 1M27 52c14-4 24 8 43 0"/>`;
}
function svg(type){
  const id=`c${++serial}`;
  const body=art(type).replaceAll('url(#planet)',`url(#planet-${id})`).replaceAll('url(#metal)',`url(#metal-${id})`).replaceAll('url(#fire)',`url(#fire-${id})`);
  return `<svg class="celestial-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${defs(id)}${body}${base()}</svg>`;
}

function applyFleet(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{
    const node=square.querySelector('.piece'),piece=core.game?.get(square.dataset.square);if(!node||!piece||!ROLES[piece.type])return;
    if(node.dataset.celestialRole!==piece.type){node.innerHTML=svg(piece.type);node.dataset.celestialRole=piece.type}
    node.classList.add('celestial-piece');node.dataset.piece=piece.type;node.dataset.fleet=piece.color==='w'?'silver':'void';
    const fleet=piece.color==='w'?'Silver Starfleet':'Void Fleet',role=ROLES[piece.type];
    const label=`${square.dataset.square.toUpperCase()} ${fleet} ${role[0]} (${role[1]})`;
    node.setAttribute('aria-hidden','true');square.setAttribute('aria-label',label);square.title=label;
  });
  document.querySelectorAll('.capture-piece').forEach(node=>{
    let type=node.dataset.piece,color=node.dataset.fleetColor;
    if(!type){const old=CLASSIC[node.textContent.trim()];if(!old)return;[type,color]=old;node.dataset.piece=type;node.dataset.fleetColor=color}
    if(!ROLES[type])return;if(node.dataset.celestialCaptureRole!==type){node.innerHTML=svg(type);node.dataset.celestialCaptureRole=type}
    node.classList.add('celestial-capture');node.title=`Captured ${color==='w'?'Silver Starfleet':'Void Fleet'} ${ROLES[type][0]} (${ROLES[type][1]})`;
  });
  const key=document.querySelector('.fleet-color-key');if(key){const labels=key.querySelectorAll('span');if(labels[0])labels[0].lastChild.textContent=' Silver Starfleet';if(labels[1])labels[1].lastChild.textContent=' Void Fleet'}
}
