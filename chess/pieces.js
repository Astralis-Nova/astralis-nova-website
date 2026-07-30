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

const FACTION_DETAIL = {
  white: {
    k: `<ellipse class="faction-line" cx="50" cy="31" rx="26" ry="7"/><path class="faction-solid" d="M20 47 5 55l20 5M80 47l15 8-20 5"/>`,
    q: `<ellipse class="faction-line" cx="50" cy="24" rx="29" ry="8"/><circle class="faction-core" cx="50" cy="16" r="5"/>`,
    r: `<path class="faction-solid" d="m25 34-18 9 20 5M75 34l18 9-20 5"/><rect class="faction-core" x="45" y="20" width="10" height="9" rx="4"/>`,
    b: `<ellipse class="faction-line" cx="50" cy="39" rx="28" ry="9"/><path class="faction-solid" d="M23 50 9 59l20 2M77 50l14 9-20 2"/>`,
    n: `<path class="faction-solid" d="M44 39 15 43l22 11M69 45l23 9-22 7"/><circle class="faction-core" cx="60" cy="28" r="4"/>`,
    p: `<ellipse class="faction-line" cx="50" cy="30" rx="22" ry="7"/><path class="faction-solid" d="M31 47 11 56l22 5M69 47l20 9-22 5"/>`,
  },
  black: {
    k: `<path class="faction-solid" d="M50 7 61 27 88 35 69 45 84 62 57 54 50 78 43 54 16 62 31 45 12 35 39 27Z"/>`,
    q: `<path class="faction-line" d="m50 8 12 19 25 11-21 12 9 25-25-14-25 14 9-25-21-12 25-11Z"/><path class="faction-solid" d="m50 17 7 13-7 10-7-10Z"/>`,
    r: `<path class="faction-solid" d="m20 30-14 17 24-4-9 18 25-12-9-19ZM80 30l14 17-24-4 9 18-25-12 9-19Z"/>`,
    b: `<path class="faction-line" d="M50 8 65 35 90 48 63 55 50 82 37 55 10 48 35 35Z"/><path class="faction-solid" d="m50 21 8 20-8 10-8-10Z"/>`,
    n: `<path class="faction-solid" d="m40 24-31 8 28 10-19 18 34-11M62 28l31 14-27 8 17 20-32-16"/>`,
    p: `<path class="faction-solid" d="M50 11 62 34 87 45 64 54 73 79 50 65 27 79 36 54 13 45 38 34Z"/>`,
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
    <g fill="url(#pieceGradient-${uid})" stroke="var(--piece-edge)" stroke-width="2" stroke-linejoin="round">
      ${BODY[type]}
      ${FACTION_DETAIL[color]?.[type] || ''}
    </g>
    <g class="detail" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></g>
    <style>
      .detail{fill:none;stroke:rgba(255,255,255,.74);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .core{fill:var(--piece-glow);stroke:#fff;stroke-width:1.4;filter:url(#pieceGlow-${uid})}
      .fin{fill:var(--piece-shadow);stroke:var(--piece-edge);stroke-width:2}
      .ring{fill:none;stroke:var(--piece-glow);stroke-width:4;filter:url(#pieceGlow-${uid})}
      .faction-line{fill:none;stroke:var(--piece-glow);stroke-width:3;filter:url(#pieceGlow-${uid})}
      .faction-solid{fill:var(--piece-shadow);stroke:var(--piece-glow);stroke-width:1.8}
      .faction-core{fill:#fff;stroke:var(--piece-glow);stroke-width:2;filter:url(#pieceGlow-${uid})}
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
