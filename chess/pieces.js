const LABELS = {
  k: 'High Commander',
  q: 'Oracle Core',
  r: 'Citadel Droid',
  b: 'Phase Seer',
  n: 'Warp Strider',
  p: 'Drone Sentinel',
};

let pieceSerial = 0;

const FIGURES = {
  white: {
    k: `
      <path class="cloth" d="M24 76 31 42l11-9h16l11 9 7 34Z"/>
      <path class="armor" d="M28 48 15 57l16 7M72 48l13 9-16 7"/>
      <path class="metal" d="M39 32V19l6-8h10l6 8v13l-6 7H45Z"/>
      <path class="visor" d="M41 23h18l-4 7H45Z"/>
      <path class="line" d="M37 44h26M40 51h20M50 39v25"/>
      <path class="glow-fill" d="m50 44 5 6-5 7-5-7Z"/>
      <path class="base" d="M20 75h60l10 14H10Z"/>`,
    q: `
      <path class="ring" d="M24 24c8-13 44-13 52 0-10 9-42 9-52 0Z"/>
      <path class="cloth" d="M22 76 35 41l7-8h16l7 8 13 35Z"/>
      <circle class="metal" cx="50" cy="24" r="11"/>
      <path class="visor" d="M42 23h16l-3 5H45Z"/>
      <path class="armor" d="m34 45-17 12 18 2M66 45l17 12-18 2"/>
      <path class="line" d="M39 42h22M35 61h30M50 36v32"/>
      <circle class="core" cx="50" cy="46" r="6"/>
      <path class="base" d="M19 75h62l9 14H10Z"/>`,
    r: `
      <path class="metal" d="M29 29c2-14 40-14 42 0v43H29Z"/>
      <path class="armor" d="M26 35 14 43l12 7M74 35l12 8-12 7"/>
      <path class="line" d="M30 31h40M35 42h30M35 60h30M43 33v34M57 33v34"/>
      <rect class="visor" x="37" y="22" width="26" height="8" rx="4"/>
      <rect class="glow-fill" x="43" y="45" width="14" height="10" rx="2"/>
      <circle class="core" cx="50" cy="25" r="3"/>
      <path class="base" d="M20 73h60l10 16H10Z"/>`,
    b: `
      <path class="cloth" d="M22 76c4-26 10-47 28-64 18 17 24 38 28 64Z"/>
      <path class="shadow" d="M36 31c5-13 23-13 28 0l-6 14H42Z"/>
      <path class="visor" d="M41 31h18l-4 7H45Z"/>
      <path class="armor" d="M31 49 16 59l18 2M69 49l15 10-18 2"/>
      <path class="line" d="M50 42v29M35 61h30"/>
      <path class="ring" d="M27 47c11-8 35-8 46 0-12 8-34 8-46 0Z"/>
      <path class="base" d="M19 75h62l9 14H10Z"/>`,
    n: `
      <path class="shadow" d="M25 70 19 35l14-8 8 12h18l8-12 14 8-6 35Z"/>
      <path class="armor" d="M17 40 5 52l22 1M83 40l12 12-22 1"/>
      <path class="metal" d="M39 31V17l7-8h8l7 8v14l-6 8H45Z"/>
      <path class="visor" d="M40 22h20l-5 7H45Z"/>
      <path class="line" d="M36 45h28M42 45l-4 22M58 45l4 22"/>
      <path class="glow" d="M22 52 9 66M78 52l13 14"/>
      <path class="base" d="M18 71h64l8 18H10Z"/>`,
    p: `
      <path class="armor" d="M28 72 33 42l9-8h16l9 8 5 30Z"/>
      <path class="metal" d="M37 33V19l7-8h12l7 8v14l-7 7H44Z"/>
      <path class="visor" d="M39 22h22l-5 8H44Z"/>
      <path class="shadow" d="M33 45 20 54l14 7M67 45l13 9-14 7"/>
      <path class="line" d="M39 46h22M36 60h28M50 40v28"/>
      <circle class="core" cx="50" cy="48" r="4"/>
      <path class="base" d="M21 71h58l10 18H11Z"/>`,
  },
  black: {
    k: `
      <path class="cloth" d="M17 76 29 38l13-7h16l13 7 12 38Z"/>
      <path class="armor" d="M28 45 9 58l22 4M72 45l19 13-22 4"/>
      <path class="metal" d="m34 31 7-19 9-8 9 8 7 19-9 10H43Z"/>
      <path class="visor" d="m39 22 11 8 11-8-5 14H44Z"/>
      <path class="line" d="M34 45h32M50 40v29M37 57h26"/>
      <path class="glow" d="m42 46 8 8 8-8"/>
      <path class="base" d="M17 75h66l8 14H9Z"/>`,
    q: `
      <path class="cloth" d="M17 76 32 41l10-8h16l10 8 15 35Z"/>
      <path class="metal" d="m35 30 5-17 10 8 10-8 5 17-9 10H44Z"/>
      <path class="visor" d="M41 27h18l-5 7h-8Z"/>
      <path class="armor" d="m30 44-20 11 22 6M70 44l20 11-22 6"/>
      <path class="glow" d="M25 50 8 72M75 50l17 22"/>
      <path class="core" d="m50 43 7 8-7 10-7-10Z"/>
      <path class="base" d="M16 75h68l8 14H8Z"/>`,
    r: `
      <path class="shadow" d="M25 71V31l11-10h28l11 10v40Z"/>
      <path class="armor" d="m25 35-17 7 17 12M75 35l17 7-17 12"/>
      <path class="metal" d="m34 30 5-16h22l5 16Z"/>
      <path class="visor" d="M38 22h24l-5 7H43Z"/>
      <path class="line" d="M31 37h38M35 48h30M35 61h30M42 35v31M58 35v31"/>
      <rect class="core" x="43" y="43" width="14" height="10" rx="1"/>
      <path class="base" d="M18 71h64l9 18H9Z"/>`,
    b: `
      <path class="cloth" d="M17 76c7-29 14-51 33-69 19 18 26 40 33 69Z"/>
      <path class="shadow" d="M32 34c5-18 31-18 36 0l-9 14H41Z"/>
      <path class="visor" d="m39 32 11 8 11-8-5 13H44Z"/>
      <path class="armor" d="m30 49-18 11 21 3M70 49l18 11-21 3"/>
      <path class="glow" d="M23 54 8 74M77 54l15 20"/>
      <path class="line" d="M50 46v25M34 63h32"/>
      <path class="base" d="M17 75h66l9 14H8Z"/>`,
    n: `
      <path class="shadow" d="M21 70 25 34l13-9h24l13 9 4 36Z"/>
      <path class="armor" d="M25 39 7 49l20 7M75 39l18 10-20 7"/>
      <path class="metal" d="M37 32V17l7-9h12l7 9v15l-7 9H44Z"/>
      <path class="visor" d="M39 21h22l-5 10H44Z"/>
      <path class="line" d="M35 45h30M40 47l-5 20M60 47l5 20"/>
      <path class="glow" d="M25 50 11 69M75 50l14 19"/>
      <path class="base" d="M17 70h66l9 19H8Z"/>`,
    p: `
      <path class="armor" d="M25 72 32 42l10-8h16l10 8 7 30Z"/>
      <path class="metal" d="m34 33 5-17 11-8 11 8 5 17-9 8H43Z"/>
      <path class="visor" d="M38 23h24l-6 9H44Z"/>
      <path class="shadow" d="m31 45-16 10 18 6M69 45l16 10-18 6"/>
      <path class="line" d="M36 47h28M35 61h30M50 41v28"/>
      <path class="core" d="m50 47 5 5-5 6-5-6Z"/>
      <path class="base" d="M19 71h62l10 18H9Z"/>`,
  },
};

function svgFor(type, color) {
  const uid = `${type}-${pieceSerial += 1}`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="pieceGradient-${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="var(--piece-main)"/>
        <stop offset=".58" stop-color="var(--piece-mid)"/>
        <stop offset="1" stop-color="var(--piece-edge)"/>
      </linearGradient>
      <filter id="pieceGlow-${uid}" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="2.2" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g stroke="var(--piece-edge)" stroke-width="1.8" stroke-linejoin="round">
      ${FIGURES[color]?.[type] || ''}
    </g>
    <style>
      .armor{fill:url(#pieceGradient-${uid})}
      .metal{fill:var(--piece-mid)}
      .cloth,.shadow{fill:var(--piece-shadow)}
      .cloth{stroke:var(--piece-edge);stroke-width:2.2}
      .shadow{stroke:var(--piece-glow);stroke-width:1.4}
      .line{fill:none;stroke:rgba(255,255,255,.76);stroke-width:2;stroke-linecap:round}
      .visor{fill:var(--piece-glow);stroke:#fff;stroke-width:1.2;filter:url(#pieceGlow-${uid})}
      .core{fill:var(--piece-glow);stroke:#fff;stroke-width:1.4;filter:url(#pieceGlow-${uid})}
      .ring{fill:none;stroke:var(--piece-glow);stroke-width:4;filter:url(#pieceGlow-${uid})}
      .glow{fill:none;stroke:var(--piece-glow);stroke-width:4;stroke-linecap:round;filter:url(#pieceGlow-${uid})}
      .glow-fill{fill:var(--piece-glow);stroke:#fff;stroke-width:1;filter:url(#pieceGlow-${uid})}
      .base{filter:drop-shadow(0 5px 3px rgba(0,0,0,.36))}
    </style>
  </svg>`;
}

export function pieceName(type) {
  return LABELS[type] || 'Unknown unit';
}

export function createPiece(type, color, { mini = false } = {}) {
  const node = document.createElement('span');
  node.className = `piece ${color}${mini ? ' mini-piece' : ''}`;
  node.setAttribute('role', 'img');
  node.setAttribute('aria-label', `${color === 'white' ? 'Silver' : 'Void'} ${pieceName(type)}`);
  node.dataset.piece = type;
  node.dataset.color = color;
  node.innerHTML = svgFor(type, color);
  return node;
}

export function pieceMarkup(type, color) {
  const wrapper = document.createElement('div');
  wrapper.append(createPiece(type, color, { mini: true }));
  return wrapper.innerHTML;
}

export const PIECE_LABELS = Object.freeze({ ...LABELS });
