const core=window.NovaChessCore;
if(!core)throw new Error('Astralis Nova celestial fleet requires the regulation chess core.');

const ROLES={
  k:['Solar Crown King','king'],
  q:['Lunar Crescent Queen','queen'],
  r:['Astralis Nova Citadel','rook'],
  b:['Ringed World Seer','bishop'],
  n:['Comet Strider','knight'],
  p:['Frontier Asteroid','pawn']
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
    .piece.celestial-piece{position:relative;display:grid;place-items:center;width:114%;height:114%;overflow:visible;color:inherit!important;-webkit-text-stroke:0!important;text-shadow:none!important;transform:translateZ(0);--light:#f8ffff;--mid:#8edff0;--deep:#18335b;--edge:#eaffff;--glow:#5de9ff;--hot:#fff3a0;--planet-light:#f4fbff;--planet-mid:#5889aa;--planet-deep:#0b203c;filter:drop-shadow(0 6px 4px #000d) drop-shadow(0 0 8px var(--glow))!important}
    .piece.celestial-piece.fleet-black{--light:#ddd4ff;--mid:#6b56ac;--deep:#09031b;--edge:#b5eaff;--glow:#9b68ff;--hot:#ead5ff;--planet-light:#cfc7ff;--planet-mid:#594c9b;--planet-deep:#09051e}
    .celestial-svg{display:block;width:100%;height:100%;overflow:visible}
    .celestial-svg .sphere{stroke:var(--edge);stroke-width:1.5}
    .celestial-svg .metal{stroke:var(--edge);stroke-width:1.15}
    .celestial-svg .dark-metal{fill:var(--deep);stroke:var(--edge);stroke-width:1.2}
    .celestial-svg .surface{fill:none;stroke:var(--planet-light);stroke-width:1.5;opacity:.72}
    .celestial-svg .crater{fill:var(--planet-deep);stroke:var(--planet-light);stroke-width:1.1;opacity:.86}
    .celestial-svg .orbit{fill:none;stroke:var(--edge);stroke-width:2.5;opacity:.95}
    .celestial-svg .nova{fill:var(--hot);stroke:#fff;stroke-width:.8}
    .celestial-svg .window{fill:var(--hot);stroke:#fff;stroke-width:.5}
    .celestial-svg .base{stroke:var(--edge)}.celestial-svg .rim{fill:var(--deep);stroke:var(--mid)}
    .celestial-svg .base-light{stroke:var(--hot);stroke-width:1.5;opacity:.9}
    .celestial-piece[data-piece="k"]{--planet-light:#fff9b9;--planet-mid:#ffad35;--planet-deep:#8b1f08}
    .celestial-piece[data-piece="q"]{--planet-light:#f7fbff;--planet-mid:#b6c7dc;--planet-deep:#35435f}
    .celestial-piece[data-piece="b"]{--planet-light:#bdfcf4;--planet-mid:#26a8b4;--planet-deep:#08364e}
    .celestial-piece[data-piece="n"]{--planet-light:#ffd7a3;--planet-mid:#bd6944;--planet-deep:#4d2546}
    .celestial-piece[data-piece="p"]{--planet-light:#c9c6bf;--planet-mid:#746f6a;--planet-deep:#24232d}
    .celestial-piece[data-piece="k"] .sun-rays{animation:solarPulse 3.8s ease-in-out infinite;transform-origin:50px 39px}
    .celestial-piece[data-piece="r"] .an-star{animation:novaPulse 3.4s ease-in-out infinite;transform-origin:50px 13px}
    @keyframes solarPulse{50%{transform:scale(1.08);opacity:1}}
    @keyframes novaPulse{50%{transform:scale(1.18);filter:drop-shadow(0 0 5px var(--hot))}}
    .capture-piece.celestial-capture{display:inline-grid;place-items:center;width:1.5em;height:1.5em;vertical-align:middle;--light:#f8ffff;--mid:#83dced;--deep:#15345d;--edge:#e3ffff;--glow:#56e6ff;--hot:#fff4a9;--planet-light:#f4fbff;--planet-mid:#5489a8;--planet-deep:#0b203c}
    .capture-piece.celestial-capture.fleet-black{--light:#d2c8ff;--mid:#6451a6;--deep:#08031a;--edge:#a9eaff;--glow:#9b68ff;--hot:#ead5ff;--planet-light:#cfc7ff;--planet-mid:#594c9b;--planet-deep:#09051e}
    .capture-piece.celestial-capture .celestial-svg{width:1.5em;height:1.5em;filter:drop-shadow(0 0 3px var(--glow))}
    @media(max-width:520px){.piece.celestial-piece{width:118%;height:118%}}
    @media(prefers-reduced-motion:reduce){.sun-rays,.an-star{animation:none!important}}
  `;
  document.head.append(style);
}

function defs(id){return `<defs>
  <radialGradient id="planet-${id}" cx="30%" cy="22%" r="76%"><stop stop-color="var(--planet-light)"/><stop offset=".38" stop-color="var(--planet-mid)"/><stop offset=".78" stop-color="var(--planet-deep)"/><stop offset="1" stop-color="#010208"/></radialGradient>
  <linearGradient id="metal-${id}" x2="1" y2="1"><stop stop-color="var(--light)"/><stop offset=".46" stop-color="var(--mid)"/><stop offset="1" stop-color="var(--deep)"/></linearGradient>
  <radialGradient id="fire-${id}"><stop stop-color="#fff"/><stop offset=".32" stop-color="var(--hot)"/><stop offset=".72" stop-color="#ff9a28"/><stop offset="1" stop-color="#8b1507"/></radialGradient>
  <linearGradient id="comet-${id}" x1="0" x2="1"><stop stop-color="var(--glow)" stop-opacity="0"/><stop offset=".55" stop-color="var(--glow)" stop-opacity=".75"/><stop offset="1" stop-color="#fff"/></linearGradient>
</defs>`}
function base(){return `<ellipse class="base" cx="50" cy="86" rx="30" ry="7"/><path class="rim" d="M18 86h64l-5 8H23Z"/><path class="base-light" d="M29 88h42"/>`}

function art(type){
  if(type==='p')return `<path class="metal" d="M26 65 18 52l5-18 15-12 20-3 17 10 8 15-5 18-15 12-19 2-14-7Z"/><path d="M28 62 41 43l22-8 17 12-4 14-15 11-19 1Z" fill="var(--planet-deep)" opacity=".55"/><ellipse class="crater" cx="39" cy="38" rx="8" ry="5" transform="rotate(-20 39 38)"/><ellipse class="crater" cx="61" cy="56" rx="9" ry="5.5" transform="rotate(16 61 56)"/><circle class="crater" cx="56" cy="28" r="4"/><circle class="crater" cx="34" cy="58" r="3.3"/><circle class="crater" cx="70" cy="43" r="2.8"/><path class="surface" d="m28 50 10-3m14 17 9-4"/>`;
  if(type==='k')return `<g class="sun-rays"><path class="nova" d="m50 2 5 12 10-9-2 14 14-3-10 10 13 5-15 3 7 13-14-6-8 14-8-14-14 6 7-13-15-3 13-5-10-10 14 3-2-14 10 9Z"/></g><circle cx="50" cy="40" r="29" fill="url(#fire-${serial+1})"/><circle class="sphere" cx="50" cy="40" r="23" fill="url(#planet-${serial+1})"/><path class="surface" d="M29 31c12 6 22-6 40 0M27 42c16-7 30 8 46 0M32 53c12-6 21 3 35-1"/><path class="metal" fill="url(#metal-${serial+1})" d="m32 23 7 7 11-16 11 16 7-7-4 18H36Z"/><circle class="window" cx="50" cy="29" r="3.2"/>`;
  if(type==='q')return `<path class="sphere" fill="url(#planet-${serial+1})" fill-rule="evenodd" d="M70 16c-23 3-38 22-35 42 3 18 18 30 36 29-13-5-20-18-17-31 3-14 14-24 29-26-4-7-8-11-13-14Z"/><path class="surface" d="M47 31c10 4 16 1 24-4M42 45c11 4 18 2 26-2M43 60c9 3 14 2 20 0"/><circle class="crater" cx="50" cy="36" r="4"/><circle class="crater" cx="46" cy="52" r="3"/><path class="metal" fill="url(#metal-${serial+1})" d="m36 19-5-12 12 7 7-12 7 12 12-7-5 12-8 8H44Z"/><path class="orbit" d="M20 65c20 10 45 8 65-5"/>`;
  if(type==='r')return `<path class="dark-metal" d="M24 67V30h10v9h7V24h10v15h7V27h10v12h8v-9h10v37l-10 8H34Z"/><path class="metal" fill="url(#metal-${serial+1})" d="M29 66V43h42v23l-8 9H37Z"/><rect class="window" x="37" y="47" width="6" height="10" rx="1"/><rect class="window" x="47" y="47" width="6" height="10" rx="1"/><rect class="window" x="57" y="47" width="6" height="10" rx="1"/><path class="surface" d="M31 61h38M36 37h28"/><g class="an-star"><path class="nova" d="m50 1 4 10 10-5-5 10 11 3-11 3 5 10-10-5-4 11-4-11-10 5 5-10-11-3 11-3-5-10 10 5Z"/></g><path d="M50 13v17" stroke="var(--hot)" stroke-width="3"/>`;
  if(type==='b')return `<circle class="sphere" cx="50" cy="46" r="26" fill="url(#planet-${serial+1})"/><path class="surface" d="M28 38c13 5 27-5 44 1M27 51c16-5 29 7 46 0"/><ellipse class="orbit" cx="50" cy="47" rx="40" ry="14" transform="rotate(-15 50 47)"/><circle class="nova" cx="72" cy="22" r="5"/><path d="M50 18v54" stroke="var(--hot)" stroke-width="3.2"/><path d="m43 12 7-10 7 10-7 11Z" fill="url(#metal-${serial+1})" stroke="var(--edge)"/>`;
  return `<path d="M11 59c18-5 28-14 37-31" fill="none" stroke="url(#comet-${serial+1})" stroke-width="12" stroke-linecap="round"/><path class="metal" fill="url(#metal-${serial+1})" d="M31 67c5-18 12-28 23-34l2-12-8-10c18 0 29 8 33 24l-7 11 7 22-14-5-7-14-8 6-5 13Z"/><path d="M53 28c7-3 14-1 19 4l-5 6-11-1Z" fill="var(--planet-deep)"/><circle class="window" cx="68" cy="31" r="2.5"/><path class="surface" d="M43 52c8 2 14 7 18 14"/>`;
}

function svg(type){
  const id=`c${++serial}`;
  const raw=art(type)+base();
  const body=raw
    .replaceAll(`planet-${serial+1}`,`planet-${id}`)
    .replaceAll(`metal-${serial+1}`,`metal-${id}`)
    .replaceAll(`fire-${serial+1}`,`fire-${id}`)
    .replaceAll(`comet-${serial+1}`,`comet-${id}`)
    .replaceAll('class="metal" fill="url(#metal-'+id+')"',`class="metal" fill="url(#metal-${id})"`)
    .replaceAll('class="base"',`class="base" fill="url(#metal-${id})"`);
  return `<svg class="celestial-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${defs(id)}${body}</svg>`;
}

function applyFleet(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{
    const node=square.querySelector('.piece'),piece=core.game?.get(square.dataset.square);if(!node||!piece||!ROLES[piece.type])return;
    if(node.dataset.celestialRole!==piece.type){node.innerHTML=svg(piece.type);node.dataset.celestialRole=piece.type}
    node.classList.add('celestial-piece');
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
    if(node.dataset.celestialCaptureRole!==type){node.innerHTML=svg(type);node.dataset.celestialCaptureRole=type}
    node.classList.add('celestial-capture');node.classList.toggle('fleet-black',color==='b');
    node.title=`Captured ${color==='w'?'Silver Starfleet':'Void Fleet'} ${ROLES[type][0]} (${ROLES[type][1]})`;
  });
  const key=document.querySelector('.fleet-color-key');if(key){const labels=key.querySelectorAll('span');if(labels[0])labels[0].lastChild.textContent=' Silver Starfleet';if(labels[1])labels[1].lastChild.textContent=' Void Fleet'}
}
