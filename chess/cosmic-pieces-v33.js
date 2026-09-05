const core = window.NovaChessCore;
if (!core) throw new Error('Astralis Nova celestial fleet requires the regulation chess core.');

const ROLES = {
  k: ['Solar Crown King', 'king'],
  q: ['Lunar Crescent Queen', 'queen'],
  r: ['Astralis Nova Citadel', 'rook'],
  b: ['Ringed World Seer', 'bishop'],
  n: ['Comet Strider', 'knight'],
  p: ['Frontier Asteroid', 'pawn']
};

const CLASSIC = {
  '♔': ['k','w'], '♕': ['q','w'], '♖': ['r','w'], '♗': ['b','w'], '♘': ['n','w'], '♙': ['p','w'],
  '♚': ['k','b'], '♛': ['q','b'], '♜': ['r','b'], '♝': ['b','b'], '♞': ['n','b'], '♟': ['p','b']
};

let serial = 0;

installStyles();
applyFleet();
new MutationObserver(applyFleet).observe(document.body, { childList: true, subtree: true });

function installStyles() {
  if (document.getElementById('celestialFleetStyles')) return;
  const style = document.createElement('style');
  style.id = 'celestialFleetStyles';
  style.textContent = `
    .piece.celestial-piece{
      position:relative;display:grid;place-items:center;
      width:96%;height:98%;max-width:none;max-height:none;
      overflow:visible;color:inherit!important;-webkit-text-stroke:0!important;
      text-shadow:none!important;transform:translateZ(0);
      --shell0:#ffffff;--shell1:#d9f8ff;--shell2:#72c9df;--shell3:#244f72;--shell4:#07182a;
      --edge:#efffff;--glow:#53ddff;--energy:#fff3a8;--space:#06111f;
      filter:drop-shadow(0 5px 3px rgba(0,0,0,.82)) drop-shadow(0 0 5px color-mix(in srgb,var(--glow) 78%,transparent))!important;
      transition:filter .16s ease,transform .16s ease;
    }
    .piece.celestial-piece.fleet-black{
      --shell0:#f0eaff;--shell1:#c8baff;--shell2:#8068c9;--shell3:#35256d;--shell4:#080416;
      --edge:#d8f4ff;--glow:#a06dff;--energy:#f5d9ff;--space:#05020c;
    }
    .sq:hover .piece.celestial-piece,
    .sq.selected .piece.celestial-piece{
      filter:drop-shadow(0 6px 4px rgba(0,0,0,.88)) drop-shadow(0 0 8px var(--glow))!important;
    }
    .celestial-svg{display:block;width:100%;height:100%;overflow:visible}
    .celestial-svg .outline{stroke:var(--edge);stroke-width:1.55;stroke-linejoin:round;stroke-linecap:round}
    .celestial-svg .fine{fill:none;stroke:var(--edge);stroke-width:1.05;stroke-linecap:round;opacity:.72}
    .celestial-svg .bright{fill:var(--energy);stroke:#fff;stroke-width:.65}
    .celestial-svg .glass{fill:color-mix(in srgb,var(--glow) 48%,white);stroke:#fff;stroke-width:.65}
    .celestial-svg .shadow{fill:var(--shell4);opacity:.72}
    .celestial-svg .base-shadow{fill:#02050b;opacity:.88}
    .celestial-svg .pedestal{stroke:var(--edge);stroke-width:1.35}
    .celestial-svg .base-rim{fill:var(--shell4);stroke:var(--shell2);stroke-width:1.15}
    .celestial-svg .base-light{fill:none;stroke:var(--energy);stroke-width:1.35;stroke-linecap:round;opacity:.82}
    .celestial-svg .orbit{fill:none;stroke:var(--edge);stroke-width:2;stroke-linecap:round;opacity:.88}
    .celestial-svg .texture{fill:none;stroke:var(--shell0);stroke-width:1.15;stroke-linecap:round;opacity:.44}
    .celestial-svg .crater{fill:var(--shell4);stroke:var(--shell1);stroke-width:.8;opacity:.75}
    .celestial-svg .spark{fill:#fff;filter:drop-shadow(0 0 2px var(--glow))}
    .celestial-piece[data-piece="k"]{--energy:#fff0a3;--glow:#ffd45b}
    .celestial-piece[data-piece="q"]{--energy:#f7fbff;--glow:#a9eaff}
    .celestial-piece[data-piece="r"]{--energy:#dffcff}
    .celestial-piece[data-piece="b"]{--energy:#bfffee;--glow:#4fffd4}
    .celestial-piece[data-piece="n"]{--energy:#ffd8a5;--glow:#ff9f69}
    .celestial-piece[data-piece="p"]{--energy:#d8e6ee}
    .celestial-piece.fleet-black[data-piece="k"]{--energy:#f4d8ff;--glow:#d183ff}
    .celestial-piece.fleet-black[data-piece="n"]{--energy:#f6d5ff;--glow:#b782ff}
    .capture-piece.celestial-capture{
      display:inline-grid;place-items:center;width:1.55em;height:1.55em;vertical-align:middle;
      --shell0:#fff;--shell1:#d9f8ff;--shell2:#72c9df;--shell3:#244f72;--shell4:#07182a;
      --edge:#efffff;--glow:#53ddff;--energy:#fff3a8;--space:#06111f;
    }
    .capture-piece.celestial-capture.fleet-black{
      --shell0:#f0eaff;--shell1:#c8baff;--shell2:#8068c9;--shell3:#35256d;--shell4:#080416;
      --edge:#d8f4ff;--glow:#a06dff;--energy:#f5d9ff;--space:#05020c;
    }
    .capture-piece.celestial-capture .celestial-svg{width:1.55em;height:1.55em;filter:drop-shadow(0 0 2px var(--glow))}
    @media(max-width:520px){.piece.celestial-piece{width:100%;height:100%}}
  `;
  document.head.append(style);
}

function defs(id) {
  return `<defs>
    <linearGradient id="metal-${id}" x1="18%" y1="8%" x2="82%" y2="95%">
      <stop stop-color="var(--shell0)"/><stop offset=".18" stop-color="var(--shell1)"/>
      <stop offset=".48" stop-color="var(--shell2)"/><stop offset=".73" stop-color="var(--shell3)"/>
      <stop offset="1" stop-color="var(--shell4)"/>
    </linearGradient>
    <radialGradient id="orb-${id}" cx="31%" cy="24%" r="78%">
      <stop stop-color="var(--shell0)"/><stop offset=".18" stop-color="var(--shell1)"/>
      <stop offset=".48" stop-color="var(--shell2)"/><stop offset=".78" stop-color="var(--shell3)"/>
      <stop offset="1" stop-color="var(--shell4)"/>
    </radialGradient>
    <radialGradient id="sun-${id}" cx="38%" cy="30%" r="72%">
      <stop stop-color="#fff"/><stop offset=".15" stop-color="var(--energy)"/>
      <stop offset=".48" stop-color="#ffb43f"/><stop offset=".76" stop-color="#e6531f"/>
      <stop offset="1" stop-color="#5d130e"/>
    </radialGradient>
    <linearGradient id="tail-${id}" x1="0" x2="1">
      <stop stop-color="var(--glow)" stop-opacity="0"/><stop offset=".58" stop-color="var(--glow)" stop-opacity=".72"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <filter id="soft-${id}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="2.2"/>
    </filter>
  </defs>`;
}

function base(id, width = 30) {
  return `
    <ellipse class="base-shadow" cx="50" cy="89" rx="${width + 5}" ry="5.2"/>
    <path class="pedestal" fill="url(#metal-${id})" d="M${50-width} 80 Q50 74 ${50+width} 80 L${50+width-3} 90 Q50 95 ${50-width+3} 90Z"/>
    <path class="base-rim" d="M${50-width-2} 87 H${50+width+2} L${50+width-5} 95 H${50-width+5}Z"/>
    <path class="base-light" d="M${50-width+8} 89 H${50+width-8}"/>`;
}

function asteroid(id) {
  return `${base(id,25)}
    <path class="outline" fill="url(#orb-${id})" d="M27 65 20 51l5-17 13-11 18-4 16 8 8 13-3 16-11 14-17 6-14-4Z"/>
    <path class="shadow" d="M27 58 39 39l20-9 17 12-5 17-14 11-16 2Z"/>
    <ellipse class="crater" cx="39" cy="38" rx="7" ry="4.4" transform="rotate(-18 39 38)"/>
    <ellipse class="crater" cx="61" cy="54" rx="8" ry="4.8" transform="rotate(18 61 54)"/>
    <circle class="crater" cx="58" cy="27" r="3.3"/><circle class="crater" cx="34" cy="58" r="2.8"/>
    <path class="texture" d="m27 48 9-3m30-8 7 4m-24 27 9-3"/>`;
}

function king(id) {
  return `${base(id,31)}
    <g opacity=".46" filter="url(#soft-${id})"><circle cx="50" cy="40" r="34" fill="var(--glow)"/></g>
    <g class="sun-rays" fill="var(--energy)" opacity=".9">
      <path d="M50 1 54 12 61 3 60 15 72 8 66 19 79 16 69 25 83 27 70 32 83 39 68 39 78 50 64 44 69 58 59 47 58 62 50 49 42 62 41 47 31 58 36 44 22 50 32 39 17 39 30 32 17 27 31 25 21 16 34 19 28 8 40 15 39 3 46 12Z"/>
    </g>
    <circle class="outline" cx="50" cy="40" r="27" fill="url(#sun-${id})"/>
    <path class="texture" d="M29 35c11 5 21-5 40 0M27 44c16-5 30 7 46 0M32 53c12-5 22 3 35-1"/>
    <path class="outline" fill="url(#metal-${id})" d="M31 27 35 13l10 8 5-16 6 16 10-8 3 14-7 12H38Z"/>
    <path class="bright" d="m50 12 3 8-3 8-3-8Z"/><circle class="glass" cx="50" cy="31" r="3.2"/>`;
}

function queen(id) {
  return `${base(id,30)}
    <path class="outline" fill="url(#orb-${id})" fill-rule="evenodd" d="M69 15c-23 3-38 21-36 42 2 18 17 31 36 30-11-6-17-17-15-30 2-14 13-24 28-27-3-6-7-11-13-15Z"/>
    <path class="texture" d="M43 33c9 3 16 1 23-3M39 47c10 4 18 2 26-1M42 61c8 3 14 2 19 0"/>
    <circle class="crater" cx="48" cy="39" r="3.4"/><circle class="crater" cx="45" cy="55" r="2.5"/>
    <ellipse class="orbit" cx="51" cy="54" rx="36" ry="12" transform="rotate(-14 51 54)"/>
    <path class="outline" fill="url(#metal-${id})" d="M31 25 27 10l13 7 10-14 10 14 13-7-4 15-9 9H40Z"/>
    <circle class="glass" cx="50" cy="18" r="3"/><path class="bright" d="m50 7 2.6 5.5L58 15l-5.4 2.4L50 23l-2.6-5.6L42 15l5.4-2.5Z"/>`;
}

function rook(id) {
  return `${base(id,31)}
    <path class="outline" fill="url(#metal-${id})" d="M24 70V31h10v8h8V25h10v14h8V28h10v11h8v-8h10v39l-10 10H34Z"/>
    <path class="shadow" d="M30 67V45h40v22l-8 10H38Z"/>
    <path class="fine" d="M31 61h38M34 39h34M42 45v25M58 45v25"/>
    <rect class="glass" x="35" y="49" width="5.5" height="9" rx="1"/>
    <rect class="glass" x="47.2" y="49" width="5.5" height="9" rx="1"/>
    <rect class="glass" x="59.5" y="49" width="5.5" height="9" rx="1"/>
    <path class="bright an-star" d="m50 2 3.4 8.4L62 7l-4.3 7.8 9 2.8-9 2.8L62 28l-8.6-3.3L50 33l-3.4-8.3L38 28l4.3-7.6-9-2.8 9-2.8L38 7l8.6 3.4Z"/>
    <path d="M50 27v17" stroke="var(--energy)" stroke-width="2.8" stroke-linecap="round"/>`;
}

function bishop(id) {
  return `${base(id,29)}
    <circle class="outline" cx="50" cy="48" r="25" fill="url(#orb-${id})"/>
    <path class="texture" d="M29 40c12 5 25-5 42 0M28 52c15-5 28 6 44 0"/>
    <ellipse class="orbit" cx="50" cy="49" rx="38" ry="12.5" transform="rotate(-15 50 49)"/>
    <circle class="bright" cx="72" cy="25" r="4.2"/>
    <path class="outline" fill="url(#metal-${id})" d="M44 27 50 7l6 20-6 12Z"/>
    <path d="M50 14 46 31" stroke="var(--energy)" stroke-width="2.6" stroke-linecap="round"/>
    <path class="fine" d="M50 23v48"/>`;
}

function knight(id) {
  return `${base(id,30)}
    <path d="M8 62c17-3 28-12 39-30" fill="none" stroke="url(#tail-${id})" stroke-width="11" stroke-linecap="round"/>
    <path d="M13 68c17-5 27-12 37-28" fill="none" stroke="var(--glow)" stroke-width="2" stroke-linecap="round" opacity=".45"/>
    <path class="outline" fill="url(#metal-${id})" d="M29 72c4-18 12-31 24-38l3-13-9-12c18 1 30 10 34 27l-8 11 8 24-15-5-7-15-8 6-4 15Z"/>
    <path class="shadow" d="M54 29c8-3 15 0 20 6l-6 7-12-2Z"/>
    <circle class="glass" cx="69" cy="33" r="2.6"/>
    <path class="fine" d="M40 58c8 0 15 5 20 12M58 23l11 8"/>
    <path class="bright" d="m77 48 3 6 6 2-6 3-3 6-3-6-6-3 6-2Z"/>`;
}

function art(type, id) {
  switch (type) {
    case 'k': return king(id);
    case 'q': return queen(id);
    case 'r': return rook(id);
    case 'b': return bishop(id);
    case 'n': return knight(id);
    default: return asteroid(id);
  }
}

function svg(type) {
  const id = `nova${++serial}`;
  return `<svg class="celestial-svg" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${defs(id)}${art(type,id)}</svg>`;
}

function applyFleet() {
  document.querySelectorAll('.sq[data-square]').forEach(square => {
    const node = square.querySelector('.piece');
    const piece = core.game?.get(square.dataset.square);
    if (!node || !piece || !ROLES[piece.type]) return;

    if (node.dataset.celestialRole !== piece.type) {
      node.innerHTML = svg(piece.type);
      node.dataset.celestialRole = piece.type;
    }

    node.classList.add('celestial-piece');
    node.classList.toggle('fleet-white', piece.color === 'w');
    node.classList.toggle('fleet-black', piece.color === 'b');
    node.dataset.piece = piece.type;
    node.dataset.fleet = piece.color === 'w' ? 'silver' : 'void';

    const fleet = piece.color === 'w' ? 'Silver Starfleet' : 'Void Fleet';
    const role = ROLES[piece.type];
    const label = `${square.dataset.square.toUpperCase()} ${fleet} ${role[0]} (${role[1]})`;
    node.setAttribute('aria-hidden', 'true');
    square.setAttribute('aria-label', label);
    square.title = label;
  });

  document.querySelectorAll('.capture-piece').forEach(node => {
    let type = node.dataset.piece;
    let color = node.dataset.fleetColor;

    if (!type) {
      const old = CLASSIC[node.textContent.trim()];
      if (!old) return;
      [type, color] = old;
      node.dataset.piece = type;
      node.dataset.fleetColor = color;
    }

    if (!ROLES[type]) return;
    if (node.dataset.celestialCaptureRole !== type) {
      node.innerHTML = svg(type);
      node.dataset.celestialCaptureRole = type;
    }

    node.classList.add('celestial-capture');
    node.classList.toggle('fleet-white', color === 'w');
    node.classList.toggle('fleet-black', color === 'b');
  });
}
