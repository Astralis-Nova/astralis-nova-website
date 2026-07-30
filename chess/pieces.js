const LABELS = {
  k: 'High Commander',
  q: 'Oracle Core',
  r: 'Citadel',
  b: 'Phase Seer',
  n: 'Warp Strider',
  p: 'Drone Sentinel',
};

const BODY = {
  k: `
    <path d="M50 5 60 18 75 14 71 31 88 38 75 48 78 72H22l3-24L12 38l17-7-4-17 15 4Z"/>
    <path class="detail" d="M50 7v27M34 28h32M28 50h44M26 63h48"/>
    <path class="fin" d="M22 55 8 66l19 2M78 55l14 11-19 2"/>
    <circle class="core" cx="50" cy="42" r="9"/>
    <path class="base" d="M18 74h64l8 15H10Z"/>`,
  q: `
    <path d="M50 4 60 22 83 29 68 47 74 72H26l6-25-15-18 23-7Z"/>
    <path class="ring" d="M18 40c14-13 50-13 64 0-15 9-49 9-64 0Z"/>
    <circle class="core" cx="50" cy="37" r="12"/>
    <path class="detail" d="m50 15 7 13-7 13-7-13ZM30 56h40M28 66h44"/>
    <path class="base" d="M19 74h62l8 15H11Z"/>`,
  r: `
    <path d="M20 13h14v11h10V13h12v11h10V13h14v28l-10 9 6 24H24l6-24-10-9Z"/>
    <path class="fin" d="m24 46-14 8 17 6M76 46l14 8-17 6"/>
    <path class="detail" d="M29 39h42M33 53h34M29 65h42"/>
    <rect class="core" x="41" y="42" width="18" height="16" rx="3"/>
    <path class="base" d="M17 75h66l7 14H10Z"/>`,
  b: `
    <path d="M50 5c15 15 23 29 23 41 0 10-6 20-15 28H42c-9-8-15-18-15-28 0-12 8-26 23-41Z"/>
    <path class="ring" d="M23 45c13-9 41-9 54 0-13 10-41 10-54 0Z"/>
    <path class="detail" d="m55 17-15 29 20 14M32 64h36"/>
    <circle class="core" cx="50" cy="43" r="8"/>
    <path class="base" d="M21 74h58l10 15H11Z"/>`,
  n: `
    <path d="M23 75c3-18 11-30 24-37l-8-15L54 7l11 20 22 10-14 15 3 23Z"/>
    <path class="fin" d="m43 44-23 2 16 12M69 49l19 7-17 7"/>
    <path class="detail" d="m47 38 17 7 14-8M34 60h39M31 69h43"/>
    <circle class="core" cx="60" cy="32" r="6"/>
    <path class="base" d="M18 75h64l8 14H10Z"/>`,
  p: `
    <path d="m50 8 17 13-5 21 14 13-7 20H31l-7-20 14-13-5-21Z"/>
    <path class="fin" d="M32 48 13 59l20 3M68 48l19 11-20 3"/>
    <path class="detail" d="M38 45h24M32 61h36M36 69h28"/>
    <circle class="core" cx="50" cy="29" r="8"/>
    <path class="base" d="M20 75h60l9 14H11Z"/>`,
};

let pieceSerial = 0;

function svgFor(type) {
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
    <g fill="url(#pieceGradient-${uid})" stroke="var(--piece-edge)" stroke-width="2" stroke-linejoin="round">
      ${BODY[type]}
    </g>
    <g class="detail" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></g>
    <style>
      .detail{fill:none;stroke:rgba(255,255,255,.74);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .core{fill:var(--piece-glow);stroke:#fff;stroke-width:1.4;filter:url(#pieceGlow-${uid})}
      .fin{fill:var(--piece-shadow);stroke:var(--piece-edge);stroke-width:2}
      .ring{fill:none;stroke:var(--piece-glow);stroke-width:4;filter:url(#pieceGlow-${uid})}
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
  node.innerHTML = svgFor(type);
  return node;
}

export function pieceMarkup(type, color) {
  const wrapper = document.createElement('div');
  wrapper.append(createPiece(type, color, { mini: true }));
  return wrapper.innerHTML;
}

export const PIECE_LABELS = Object.freeze({ ...LABELS });
