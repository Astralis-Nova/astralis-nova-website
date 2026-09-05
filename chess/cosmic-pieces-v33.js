const core=window.NovaChessCore;
if(!core)throw new Error('Astralis Nova celestial fleet requires the regulation chess core.');

const ROLES={k:['Solar Crown King','king'],q:['Lunar Crescent Queen','queen'],r:['Astralis Nova Citadel','rook'],b:['Ringed World Seer','bishop'],n:['Comet Strider','knight'],p:['Frontier Asteroid','pawn']};
const CLASSIC={'♔':['k','w'],'♕':['q','w'],'♖':['r','w'],'♗':['b','w'],'♘':['n','w'],'♙':['p','w'],'♚':['k','b'],'♛':['q','b'],'♜':['r','b'],'♝':['b','b'],'♞':['n','b'],'♟':['p','b']};
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
      width:78%!important;height:78%!important;max-width:78%!important;max-height:78%!important;
      overflow:visible!important;color:transparent!important;-webkit-text-stroke:0!important;text-shadow:none!important;
      filter:none!important;transform:none!important;pointer-events:none;
      --s0:#ffffff;--s1:#dffaff;--s2:#88dff4;--s3:#3f91ba;--s4:#123c5d;--s5:#041321;
      --rim:#f2ffff;--glow:#62e6ff;--accent:#fff3aa;--shadow:#01040a;
    }
    .piece.celestial-piece.fleet-black{
      --s0:#fffaff;--s1:#eadcff;--s2:#bc8dff;--s3:#7048bb;--s4:#351b6f;--s5:#0b061c;
      --rim:#f3e7ff;--glow:#bc75ff;--accent:#ffd8ff;--shadow:#030108;
    }
    .celestial-svg{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 4px 3px rgba(0,0,0,.82)) drop-shadow(0 0 2px var(--glow));}
    .celestial-svg .rim{stroke:var(--rim);stroke-width:1.15;stroke-linejoin:round;stroke-linecap:round}
    .celestial-svg .fine{fill:none;stroke:var(--s0);stroke-width:.7;stroke-linecap:round;opacity:.48}
    .celestial-svg .ring{fill:none;stroke:var(--rim);stroke-width:1.9;stroke-linecap:round;opacity:.92}
    .celestial-svg .ring2{fill:none;stroke:var(--glow);stroke-width:.65;stroke-linecap:round;opacity:.64}
    .celestial-svg .crater{fill:var(--s5);stroke:var(--s1);stroke-width:.7;opacity:.9}
    .celestial-svg .spark{fill:#fff;filter:drop-shadow(0 0 1.8px var(--glow))}
    .celestial-svg .window{fill:#f4ffff;stroke:var(--glow);stroke-width:.55}
    .celestial-svg .energy{fill:var(--accent);stroke:#fff;stroke-width:.48}
    .capture-piece.celestial-capture{display:inline-grid!important;place-items:center!important;width:1.45em!important;height:1.45em!important;color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important;--s0:#fff;--s1:#dffaff;--s2:#88dff4;--s3:#3f91ba;--s4:#123c5d;--s5:#041321;--rim:#f2ffff;--glow:#62e6ff;--accent:#fff3aa;--shadow:#01040a;}
    .capture-piece.celestial-capture.fleet-black{--s0:#fffaff;--s1:#eadcff;--s2:#bc8dff;--s3:#7048bb;--s4:#351b6f;--s5:#0b061c;--rim:#f3e7ff;--glow:#bc75ff;--accent:#ffd8ff;--shadow:#030108;}
    .capture-piece.celestial-capture .celestial-svg{width:1.45em;height:1.45em;}
    @media(max-width:700px){.piece.celestial-piece{width:74%!important;height:74%!important;max-width:74%!important;max-height:74%!important}}
  `;
  document.head.append(style);
}

function defs(id,type,color){
  const isVoid=color==='b';
  const sunA=isVoid?'#f9d8ff':'#fff8b6';
  const sunB=isVoid?'#b24fff':'#ffb533';
  const sunC=isVoid?'#4b168c':'#d84c16';
  return `<defs>
    <linearGradient id="metal-${id}" x1="15%" y1="6%" x2="88%" y2="96%"><stop stop-color="var(--s0)"/><stop offset=".17" stop-color="var(--s1)"/><stop offset=".39" stop-color="var(--s2)"/><stop offset=".62" stop-color="var(--s3)"/><stop offset=".82" stop-color="var(--s4)"/><stop offset="1" stop-color="var(--s5)"/></linearGradient>
    <linearGradient id="chrome-${id}" x1="0" y1="0" x2="1" y2="0"><stop stop-color="var(--s5)"/><stop offset=".17" stop-color="var(--s0)"/><stop offset=".34" stop-color="var(--s2)"/><stop offset=".53" stop-color="var(--s0)"/><stop offset=".75" stop-color="var(--s3)"/><stop offset="1" stop-color="var(--s5)"/></linearGradient>
    <radialGradient id="sphere-${id}" cx="28%" cy="22%" r="78%"><stop stop-color="#fff"/><stop offset=".12" stop-color="var(--s0)"/><stop offset=".31" stop-color="var(--s1)"/><stop offset=".55" stop-color="var(--s2)"/><stop offset=".78" stop-color="var(--s4)"/><stop offset="1" stop-color="var(--s5)"/></radialGradient>
    <radialGradient id="sun-${id}" cx="32%" cy="26%" r="76%"><stop stop-color="#fff"/><stop offset=".12" stop-color="${sunA}"/><stop offset=".42" stop-color="${sunB}"/><stop offset=".76" stop-color="${sunC}"/><stop offset="1" stop-color="#12050a"/></radialGradient>
    <linearGradient id="tail-${id}" x1="0" x2="1"><stop stop-color="var(--glow)" stop-opacity="0"/><stop offset=".55" stop-color="var(--glow)" stop-opacity=".62"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <filter id="soft-${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>`;
}

function base(id,w=29){return `<ellipse cx="50" cy="90" rx="${w+4}" ry="4.5" fill="#000" opacity=".65"/><path class="rim" fill="url(#chrome-${id})" d="M${50-w} 79Q50 74 ${50+w} 79L${50+w-3} 87Q50 91 ${50-w+3} 87Z"/><path class="rim" fill="url(#metal-${id})" d="M${50-w-2} 86H${50+w+2}L${50+w-6} 94H${50-w+6}Z"/><path d="M${50-w+8} 89H${50+w-8}" stroke="var(--accent)" stroke-width="1.15" opacity=".7"/>`;}
function sphereCore(id,cx,cy,r){return `<circle cx="${cx}" cy="${cy}" r="${r+4}" fill="var(--glow)" opacity=".13" filter="url(#soft-${id})"/><circle class="rim" cx="${cx}" cy="${cy}" r="${r}" fill="url(#sphere-${id})"/><ellipse cx="${cx-r*.25}" cy="${cy-r*.33}" rx="${r*.42}" ry="${r*.22}" fill="#fff" opacity=".17"/>`;}
function asteroid(id){return `${base(id,25)}${sphereCore(id,50,48,25)}<ellipse class="crater" cx="39" cy="40" rx="6.8" ry="4.3" transform="rotate(-18 39 40)"/><ellipse class="crater" cx="62" cy="55" rx="7.6" ry="4.7" transform="rotate(16 62 55)"/><circle class="crater" cx="59" cy="31" r="3.1"/><circle class="crater" cx="35" cy="58" r="2.7"/><circle class="crater" cx="69" cy="44" r="2.2"/><path class="fine" d="m29 49 9-3m27-8 7 4m-22 25 9-3"/>`;}
function king(id){return `${base(id,30)}<g fill="var(--accent)" opacity=".82"><path d="M50 5 54 14 62 7 61 18 72 12 67 22 79 20 70 28 83 31 70 35 83 42 68 41 77 52 64 46 68 59 58 49 57 63 50 51 43 63 42 49 32 59 36 46 23 52 32 41 17 42 30 35 17 31 30 28 21 20 33 22 28 12 39 18 38 7 46 14Z"/></g>${sphereCore(id,50,43,26)}<path class="fine" d="M31 38c12 5 23-5 38 0M29 47c15-5 28 6 42 0M34 56c11-4 20 2 32-1"/><path class="rim" fill="url(#metal-${id})" d="M31 29 35 14l10 8 5-16 6 16 10-8 3 15-8 10H39Z"/><path class="energy" d="m50 11 3 7-3 7-3-7Z"/><circle class="window" cx="50" cy="32" r="3"/>`;}
function queen(id){return `${base(id,29)}<path class="rim" fill="url(#sphere-${id})" fill-rule="evenodd" d="M70 16c-23 3-37 21-35 40 2 17 16 29 34 29-10-6-16-17-13-29 3-13 13-22 27-25-3-6-7-11-13-15Z"/><ellipse cx="51" cy="38" rx="12" ry="6" fill="#fff" opacity=".14"/><circle class="crater" cx="48" cy="40" r="3.1"/><circle class="crater" cx="45" cy="55" r="2.3"/><ellipse class="ring" cx="51" cy="56" rx="36" ry="11.5" transform="rotate(-14 51 56)"/><ellipse class="ring2" cx="51" cy="56" rx="31" ry="8" transform="rotate(-14 51 56)"/><path class="rim" fill="url(#metal-${id})" d="M31 26 27 10l13 7 10-14 10 14 13-7-4 16-9 9H40Z"/><circle class="window" cx="50" cy="19" r="2.8"/>`;}
function rook(id){return `${base(id,30)}<path class="rim" fill="url(#metal-${id})" d="M23 72V33h9v-9h9v11h6V20h7v15h7V26h8v9h9v-8h9v45l-10 9H33Z"/><path fill="var(--s5)" opacity=".62" d="M30 69V44h40v25l-8 9H38Z"/><path class="fine" d="M31 62h38M34 41h32M40 44v28M50 41v34M60 44v28"/><rect class="window" x="34" y="49" width="5.5" height="9" rx="1"/><rect class="window" x="46" y="49" width="5.5" height="9" rx="1"/><rect class="window" x="58" y="49" width="5.5" height="9" rx="1"/><path class="energy" d="m50 3 3.2 7.7L61 8l-3.8 7.2 8 2.7-8 2.6L61 28l-7.8-2.9L50 33l-3.2-7.9L39 28l3.8-7.5-8-2.6 8-2.7L39 8l7.8 2.7Z"/><path d="M50 29v15" stroke="var(--accent)" stroke-width="2.2"/>`;}
function bishop(id){return `${base(id,28)}${sphereCore(id,50,50,24)}<path class="fine" d="M30 42c12 5 25-5 40 0M29 53c14-5 27 6 42 0"/><ellipse class="ring" cx="50" cy="51" rx="37" ry="12" transform="rotate(-15 50 51)"/><ellipse class="ring2" cx="50" cy="51" rx="31" ry="8" transform="rotate(-15 50 51)"/><path class="rim" fill="url(#metal-${id})" d="M43 29 50 7l7 22-7 12Z"/><path d="M50 14 46 31" stroke="var(--accent)" stroke-width="2.4"/><circle class="energy" cx="72" cy="26" r="3.8"/>`;}
function knight(id){return `${base(id,29)}<path d="M8 64c18-4 28-13 39-31" fill="none" stroke="url(#tail-${id})" stroke-width="11" stroke-linecap="round"/><path class="rim" fill="url(#metal-${id})" d="M29 73c4-18 12-31 24-38l3-13-9-12c18 1 30 10 34 27l-8 11 8 23-15-5-7-15-8 6-4 16Z"/><path fill="var(--s5)" opacity=".68" d="M54 30c8-3 15 0 20 6l-6 7-12-2Z"/><ellipse cx="58" cy="23" rx="10" ry="4" fill="#fff" opacity=".11"/><circle class="window" cx="69" cy="34" r="2.4"/><path class="fine" d="M40 59c8 0 15 5 20 12M58 23l11 8"/><path class="energy" d="m78 48 3 6 6 2-6 3-3 6-3-6-6-3 6-2Z"/>`;}
function art(type,id){if(type==='k')return king(id);if(type==='q')return queen(id);if(type==='r')return rook(id);if(type==='b')return bishop(id);if(type==='n')return knight(id);return asteroid(id);}
function svg(type,color){const id=`nova${++serial}`;return `<svg class="celestial-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${defs(id,type,color)}${art(type,id)}</svg>`;}

function applyFleet(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{const node=square.querySelector('.piece'),piece=core.game?.get(square.dataset.square);if(!node||!piece||!ROLES[piece.type])return;const key=`${piece.color}-${piece.type}`;if(node.dataset.celestialRole!==key){node.innerHTML=svg(piece.type,piece.color);node.dataset.celestialRole=key}node.classList.add('celestial-piece');node.classList.toggle('fleet-white',piece.color==='w');node.classList.toggle('fleet-black',piece.color==='b');node.dataset.piece=piece.type;node.dataset.fleet=piece.color==='w'?'silver':'void';const fleet=piece.color==='w'?'Silver Starfleet':'Void Fleet',role=ROLES[piece.type];const label=`${square.dataset.square.toUpperCase()} ${fleet} ${role[0]} (${role[1]})`;node.setAttribute('aria-hidden','true');square.setAttribute('aria-label',label);square.title=label;});
  document.querySelectorAll('.capture-piece').forEach(node=>{let type=node.dataset.piece,color=node.dataset.fleetColor;if(!type){const old=CLASSIC[node.textContent.trim()];if(!old)return;[type,color]=old;node.dataset.piece=type;node.dataset.fleetColor=color}if(!ROLES[type])return;const key=`${color}-${type}`;if(node.dataset.celestialCaptureRole!==key){node.innerHTML=svg(type,color);node.dataset.celestialCaptureRole=key}node.classList.add('celestial-capture');node.classList.toggle('fleet-white',color==='w');node.classList.toggle('fleet-black',color==='b');});
}
