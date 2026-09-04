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
    .piece.celestial-piece{position:relative;display:grid;place-items:center;width:108%;height:108%;overflow:visible;color:inherit!important;-webkit-text-stroke:0!important;text-shadow:none!important;transform:translateZ(0);--light:#f8ffff;--mid:#83dced;--deep:#15345d;--edge:#e3ffff;--glow:#56e6ff;--hot:#fff4a9;--planet-light:#f4fbff;--planet-mid:#5489a8;--planet-deep:#0b203c;filter:drop-shadow(0 5px 4px #000e) drop-shadow(0 0 7px var(--glow))!important}
    .piece.celestial-piece.fleet-black{--light:#d2c8ff;--mid:#6451a6;--deep:#08031a;--edge:#a9eaff;--glow:#9b68ff;--hot:#ead5ff}
    .celestial-svg{display:block;width:100%;height:100%;overflow:visible}
    .celestial-piece[data-piece="k"]{--planet-light:#fff8b0;--planet-mid:#ff9e2e;--planet-deep:#8d1607}
    .celestial-piece[data-piece="q"]{--planet-light:#eefcff;--planet-mid:#509bd4;--planet-deep:#142c70}
    .celestial-piece[data-piece="r"]{--planet-light:#ffc08a;--planet-mid:#b94d2e;--planet-deep:#4c1117}
    .celestial-piece[data-piece="b"]{--planet-light:#bcfff0;--planet-mid:#22a1a8;--planet-deep:#07334f}
    .celestial-piece[data-piece="n"]{--planet-light:#ffe1a7;--planet-mid:#bd7642;--planet-deep:#58334a}
    .celestial-piece[data-piece="p"]{--planet-light:#c8c5be;--planet-mid:#716c6a;--planet-deep:#252433}
    .celestial-svg .sphere{stroke:var(--edge);stroke-width:1.65}
    .celestial-svg .night{fill:var(--planet-deep);opacity:.5}.celestial-svg .land{fill:var(--planet-light);opacity:.32}
    .celestial-svg .surface{fill:none;stroke:var(--planet-light);stroke-width:1.55;opacity:.62}
    .celestial-svg .cloud{fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;opacity:.5}
    .celestial-svg .specular{opacity:.7}
    .celestial-svg .crater{fill:var(--planet-deep);stroke:var(--planet-light);stroke-width:1.15;opacity:.8}
    .celestial-svg .orbit{fill:none;stroke:var(--edge);stroke-width:2.8;opacity:.96}
    .celestial-svg .metal{stroke:var(--edge);stroke-width:1.05}
    .celestial-svg .dark-metal{fill:var(--deep);stroke:var(--edge);stroke-width:1.25}
    .celestial-svg .nova{fill:var(--hot);stroke:#fff;stroke-width:.65}
    .celestial-svg .beam{fill:none;stroke:var(--hot);stroke-width:3.2;stroke-linecap:round}
    .celestial-svg .window{fill:var(--hot);stroke:#fff;stroke-width:.55}
    .celestial-svg .base{stroke:var(--edge)}.celestial-svg .rim{fill:var(--deep);stroke:var(--mid)}
    .celestial-svg .base-light{stroke:var(--hot);stroke-width:1.4;opacity:.82}
    .celestial-piece[data-piece="k"]{animation:crownstar 4.8s ease-in-out infinite}
    .celestial-piece[data-piece="r"] .nova{animation:citadel 3.8s ease-in-out infinite;transform-origin:50px 13px}
    .capture-piece.celestial-capture{display:inline-grid;place-items:center;width:1.5em;height:1.5em;vertical-align:middle;--light:#f8ffff;--mid:#83dced;--deep:#15345d;--edge:#e3ffff;--glow:#56e6ff;--hot:#fff4a9}
    .capture-piece.celestial-capture.fleet-black{--light:#d2c8ff;--mid:#6451a6;--deep:#08031a;--edge:#a9eaff;--glow:#9b68ff;--hot:#ead5ff}
    .capture-piece.celestial-capture .celestial-svg{width:1.5em;height:1.5em;filter:drop-shadow(0 0 3px var(--glow))}
    @keyframes crownstar{50%{filter:drop-shadow(0 4px 3px #000c) drop-shadow(0 0 10px var(--hot)) brightness(1.14)}}
    @keyframes citadel{0%,100%{opacity:.78;transform:scale(.9)}50%{opacity:1;transform:scale(1.16)}}
    @media(max-width:520px){.piece.celestial-piece{width:112%;height:112%}.celestial-svg .surface{stroke-width:2}.celestial-svg .crater{stroke-width:1.5}}
    @media(prefers-reduced-motion:reduce){.celestial-piece[data-piece="k"],.celestial-piece[data-piece="r"] .nova{animation:none}}
  `;
  document.head.append(style);
}

function defs(id){return `<defs>
  <radialGradient id="planet-${id}" cx="29%" cy="20%" r="76%"><stop stop-color="var(--planet-light)"/><stop offset=".38" stop-color="var(--planet-mid)"/><stop offset=".79" stop-color="var(--planet-deep)"/><stop offset="1" stop-color="#010208"/></radialGradient>
  <linearGradient id="metal-${id}" x2="1" y2="1"><stop stop-color="var(--light)"/><stop offset=".45" stop-color="var(--mid)"/><stop offset="1" stop-color="var(--deep)"/></linearGradient>
  <radialGradient id="fire-${id}"><stop stop-color="#fff"/><stop offset=".35" stop-color="var(--hot)"/><stop offset="1" stop-color="var(--glow)" stop-opacity=".12"/></radialGradient>
  <radialGradient id="shine-${id}" cx="25%" cy="20%" r="70%"><stop stop-color="#fff"/><stop offset=".28" stop-color="#fff" stop-opacity=".12"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>`}
function base(){return `<ellipse class="base" cx="50" cy="86" rx="31" ry="7"/><path class="rim" d="M18 86h64l-5 8H23Z"/><path class="base-light" d="M29 88h42"/>`}

function art(type){
  if(type==='p')return `<path class="metal" d="M25 62 19 48l7-18 17-11 19 4 15 14 3 13-9 17-17 9-18-5Z"/><path class="night" d="m25 62 15-17 22-8 18 13-9 17-17 9-18-5Z"/><ellipse class="crater" cx="38" cy="37" rx="8" ry="5.5" transform="rotate(-22 38 37)"/><ellipse class="crater" cx="62" cy="57" rx="9" ry="5.5" transform="rotate(18 62 57)"/><circle class="crater" cx="56" cy="29" r="3.8"/><circle class="crater" cx="34" cy="58" r="3"/><circle class="crater" cx="69" cy="43" r="2.7"/><path class="surface" d="m29 49 10-3m13 18 9-4"/>`;
  if(type==='k')return `<path class="nova" d="m50 1 4 13 11-9-3 14 14-2-11 9 13 5-16 3 7 13-14-7-5 15-5-15-14 7 7-13-16-3 13-5-11-9 14 2-3-14 11 9Z"/><circle cx="50" cy="42" r="31" fill="url(#fire)"/><circle class="sphere" cx="50" cy="42" r="24"/><path class="surface" d="M28 30c11 7 22-8 39 0M26 42c16-7 29 10 48 0M31 55c12-7 21 4 36-2"/><path class="cloud" d="M34 36c6 3 10-3 16 0m4 12c7-3 10 4 16 0"/><ellipse class="specular" cx="43" cy="37" rx="21" ry="23"/><path class="metal" d="m32 24 7 7 11-15 11 15 7-7-4 17H36Z"/><circle class="window" cx="50" cy="30" r="3"/>`;
  if(type==='q')return `<circle class="sphere" cx="50" cy="44" r="29"/><path class="land" d="M25 36c14-11 28 5 50-4v10c-19 9-34-8-50 4ZM28 56c16-8 27 5 43-1l-6 9c-12 4-22-6-33 0Z"/><path class="surface" d="M24 34c18 9 33-8 51 0M22 45c20 10 35-9 56 0M27 57c16 8 30-6 46 0"/><path class="cloud" d="M31 29c7 4 13-3 20 0m-17 22c8 5 14-2 22 1"/><ellipse class="specular" cx="43" cy="39" rx="24" ry="26"/><circle class="nova" cx="77" cy="19" r="6"/><path class="orbit" d="M15 49c15 17 57 18 72-6"/><path class="metal" d="m34 20-5-14 13 8 8-13 8 13 13-8-5 14-9 8H43Z"/>`;
  if(type==='r')return `<circle class="sphere" cx="50" cy="49" r="29"/><path class="land" d="M25 38c13-10 25 4 48-6l5 13c-20 9-35-5-56 5Z"/><ellipse class="specular" cx="43" cy="43" rx="23" ry="26"/><path class="dark-metal" d="M25 56V25h11v9h8V22h12v12h8v-9h11v31l-7 9H32Z"/><path class="metal" d="M31 55V38h38v17l-7 10H38Z"/><path class="surface" d="M35 43h30M34 51h32"/><rect class="window" x="39" y="42" width="5" height="8" rx="1"/><rect class="window" x="48" y="42" width="5" height="8" rx="1"/><rect class="window" x="57" y="42" width="5" height="8" rx="1"/><path class="nova" d="m50 1 4 10 10-5-5 10 11 3-11 3 5 10-10-5-4 11-4-11-10 5 5-10-11-3 11-3-5-10 10 5Z"/><path class="beam" d="M50 14v13"/>`;
  if(type==='b')return `<circle class="sphere" cx="50" cy="46" r="30"/><path class="land" d="M24 34c15 5 31-7 53 2l2 12c-21-8-35 9-58 1Z"/><path class="surface" d="M27 29c12 10 32 2 46 14M22 48c19-7 34 9 56 1M32 64c11-9 20 3 33-4"/><path class="cloud" d="M29 40c8 4 13-3 20 1m3 13c8-4 13 4 20-1"/><ellipse class="specular" cx="43" cy="40" rx="24" ry="27"/><path class="beam" d="m71 17-41 58"/><circle class="nova" cx="72" cy="16" r="6"/><path class="orbit" d="M16 54c18 15 51 12 70-5"/>`;
  return `<circle class="sphere" cx="47" cy="47" r="29"/><path class="land" d="M22 40c15-12 30 9 54-2l2 13c-21 9-37-8-58 2Z"/><path class="surface" d="M26 34c11 7 22-6 39 1M24 52c16-5 28 9 49 0M35 63c9-4 17 3 27-1"/><ellipse class="specular" cx="40" cy="40" rx="23" ry="26"/><ellipse class="orbit" cx="50" cy="48" rx="42" ry="16" transform="rotate(-17 50 48)"/><path class="orbit" d="M12 56c19 3 55-7 75-20" opacity=".55"/><circle class="nova" cx="81" cy="28" r="7"/><path class="metal" d="m74 23 8-8 9 6-3 12-10 4Z"/><circle class="crater" cx="80" cy="25" r="2.2"/>`;
}
function svg(type){
  const id=`c${++serial}`;
  const body=(art(type)+base())
    .replaceAll('url(#planet)',`url(#planet-${id})`).replaceAll('url(#metal)',`url(#metal-${id})`)
    .replaceAll('url(#fire)',`url(#fire-${id})`).replaceAll('url(#shine)',`url(#shine-${id})`)
    .replaceAll('class="sphere"',`class="sphere" fill="url(#planet-${id})"`)
    .replaceAll('class="metal"',`class="metal" fill="url(#metal-${id})"`)
    .replaceAll('class="base"',`class="base" fill="url(#metal-${id})"`)
    .replaceAll('class="specular"',`class="specular" fill="url(#shine-${id})"`);
  return `<svg class="celestial-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${defs(id)}${body}</svg>`;
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
