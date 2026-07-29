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
    <path d="M50 10 58 22 73 18 70 35 82 42 72 51 76 73H24l4-22-12-9 12-7-3-17 16 4Z"/>
    <path class="detail" d="M50 10v20M35 30h30M31 53h38M28 64h44"/>
    <circle class="core" cx="50" cy="41" r="8"/>
    <path class="base" d="M21 76h58l6 12H15Z"/>`,
  q: `
    <path d="M50 8 62 27 84 34 69 51 72 75H28l3-24-15-17 22-7Z"/>
    <circle class="core" cx="50" cy="39" r="12"/>
    <path class="detail" d="m50 20 7 12-7 12-7-12Zm-20 29h40M28 64h44"/>
    <path class="base" d="M22 76h56l7 12H15Z"/>`,
  r: `
    <path d="M23 16h12v10h10V16h10v10h10V16h12v24l-8 9 5 27H26l5-27-8-9Z"/>
    <path class="detail" d="M31 39h38M35 51h30M33 64h34"/>
    <rect class="core" x="43" y="43" width="14" height="14" rx="3"/>
    <path class="base" d="M21 76h58l6 12H15Z"/>`,
  b: `
    <path d="M50 9c14 13 21 25 21 36 0 9-5 18-13 25H42c-8-7-13-16-13-25 0-11 7-23 21-36Z"/>
    <path class="detail" d="m53 21-12 24 18 11M34 61h32"/>
    <circle class="core" cx="50" cy="44" r="7"/>
    <path class="base" d="M25 72h50l10 16H15Z"/>`,
  n: `
    <path d="M28 76c1-17 7-29 20-36l-7-14 12-15 10 18 17 9-10 13 2 25Z"/>
    <path class="detail" d="m48 40 14 5 10-7M38 57h30M35 67h35"/>
    <circle class="core" cx="58" cy="33" r="5"/>
    <path class="base" d="M23 76h54l8 12H15Z"/>`,
  p: `
    <circle cx="50" cy="27" r="16"/>
    <path d="M34 45h32l8 29H26Z"/>
    <path class="detail" d="M38 50h24M34 63h32"/>
    <circle class="core" cx="50" cy="27" r="6"/>
    <path class="base" d="M24 74h52l9 14H15Z"/>`,
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
      .base{filter:drop-shadow(0 4px 2px rgba(0,0,0,.25))}
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
