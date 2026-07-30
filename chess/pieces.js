const LABELS = {
  k: 'High Commander',
  q: 'Oracle Core',
  r: 'Citadel',
  b: 'Phase Seer',
  n: 'Warp Strider',
  p: 'Drone Sentinel',
};

let pieceSerial = 0;

const FIGURES = {
  k: `
    <path class="deep" d="M35 79 39 39h22l4 40Z"/>
    <path class="shell" d="M31 79 37 45l8-9h10l8 9 6 34Z"/>
    <path class="accent" d="M34 57h32l-2 9H36Z"/>
    <path class="shell" d="m36 34 5-13 7 5V12h4v14l7-5 5 13-8 7H44Z"/>
    <path class="gem" d="m50 39 5 7-5 8-5-8Z"/>
    <path class="detail" d="M41 69h18M43 76h14M42 32h16"/>
    <path class="glow" d="M50 7v7M43 11h14"/>
  `,
  q: `
    <path class="deep" d="M33 79 38 39h24l5 40Z"/>
    <path class="shell" d="M29 79 37 48l7-9h12l7 9 8 31Z"/>
    <path class="accent" d="M34 58h32l-3 10H37Z"/>
    <path class="shell" d="m34 35-5-18 12 8 9-15 9 15 12-8-5 18-9 7H43Z"/>
    <circle class="gem" cx="29" cy="16" r="3"/>
    <circle class="gem" cx="50" cy="9" r="3.5"/>
    <circle class="gem" cx="71" cy="16" r="3"/>
    <path class="detail" d="M39 34h22M41 70h18"/>
    <circle class="core" cx="50" cy="50" r="5"/>
  `,
  r: `
    <path class="deep" d="M31 79V34h38v45Z"/>
    <path class="shell" d="M27 79 31 37h38l4 42Z"/>
    <path class="shell" d="M27 36V17h10v8h8v-8h10v8h8v-8h10v19Z"/>
    <path class="accent" d="M31 41h38v11H31Z"/>
    <path class="detail" d="M38 55v17M50 55v17M62 55v17M33 73h34"/>
    <rect class="core" x="43" y="43" width="14" height="7" rx="2"/>
    <path class="glow" d="M35 31h30"/>
  `,
  b: `
    <path class="deep" d="M32 79c3-20 6-32 13-40h10c7 8 10 20 13 40Z"/>
    <path class="shell" d="M28 79c5-23 10-36 19-43h6c9 7 14 20 19 43Z"/>
    <path class="shell" d="M50 8c13 10 18 21 13 29-5 8-21 8-26 0-5-8 0-19 13-29Z"/>
    <path class="accent" d="M34 55h32l-3 11H37Z"/>
    <path class="slash" d="m57 16-16 21"/>
    <path class="detail" d="M42 70h16"/>
    <circle class="core" cx="50" cy="49" r="4.5"/>
  `,
  n: `
    <path class="deep" d="M28 79c5-18 11-29 22-36l13 5 8 31Z"/>
    <path class="shell" d="M24 79c4-18 12-31 24-39l2-13-9-12c20 1 31 11 33 29l-9 12 8 23Z"/>
    <path class="accent" d="m49 27 15 4 7 12-10 8-13-11Z"/>
    <path class="visor" d="m52 31 13 3-5 6-9-3Z"/>
    <path class="detail" d="M39 52c9 2 16 8 20 20M33 69h28"/>
    <path class="glow" d="m42 16 9 11M36 18l8 10"/>
    <circle class="gem" cx="63" cy="34" r="2.3"/>
  `,
  p: `
    <path class="deep" d="M34 79c2-18 7-29 16-35 9 6 14 17 16 35Z"/>
    <path class="shell" d="M29 79c4-19 10-31 18-35h6c8 4 14 16 18 35Z"/>
    <circle class="shell" cx="50" cy="27" r="15"/>
    <path class="visor" d="M38 25c7-5 17-5 24 0l-4 7H42Z"/>
    <path class="accent" d="M35 57h30l-3 11H38Z"/>
    <circle class="core" cx="50" cy="49" r="4"/>
    <path class="detail" d="M42 71h16"/>
    <path class="glow" d="M50 8v5"/>
  `,
};

function svgFor(type) {
  const uid = `${type}-${pieceSerial += 1}`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="body-${uid}" x1=".12" y1=".05" x2=".85" y2=".95">
        <stop offset="0" stop-color="var(--piece-highlight)"/>
        <stop offset=".28" stop-color="var(--piece-main)"/>
        <stop offset=".68" stop-color="var(--piece-mid)"/>
        <stop offset="1" stop-color="var(--piece-edge)"/>
      </linearGradient>
      <linearGradient id="base-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--piece-highlight)"/>
        <stop offset=".32" stop-color="var(--piece-main)"/>
        <stop offset="1" stop-color="var(--piece-shadow)"/>
      </linearGradient>
      <radialGradient id="core-${uid}">
        <stop offset="0" stop-color="#fff"/>
        <stop offset=".3" stop-color="var(--piece-glow)"/>
        <stop offset="1" stop-color="var(--piece-edge)"/>
      </radialGradient>
      <filter id="glow-${uid}" x="-55%" y="-55%" width="210%" height="210%">
        <feGaussianBlur stdDeviation="2.1" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g id="figure-${uid}" stroke="var(--piece-outline)" stroke-width="1.65" stroke-linejoin="round" stroke-linecap="round">
      ${FIGURES[type] || ''}
      <path class="base-shadow" d="M20 78h60l9 10-5 7H16l-5-7Z"/>
      <path class="base" d="M20 77h60l8 11H12Z"/>
      <path class="base-rim" d="M13 88h74l-4 6H17Z"/>
      <path class="base-light" d="M25 82h50"/>
    </g>
    <style>
      #figure-${uid} .shell{fill:url(#body-${uid})}
      #figure-${uid} .deep{fill:var(--piece-shadow)}
      #figure-${uid} .accent{fill:var(--piece-accent)}
      #figure-${uid} .base{fill:url(#base-${uid})}
      #figure-${uid} .base-shadow{fill:rgba(0,0,0,.48);stroke:none}
      #figure-${uid} .base-rim{fill:var(--piece-shadow)}
      #figure-${uid} .base-light,#figure-${uid} .detail{fill:none;stroke:var(--piece-highlight);stroke-width:1.65;opacity:.86}
      #figure-${uid} .gem,#figure-${uid} .core{fill:url(#core-${uid});stroke:#fff;filter:url(#glow-${uid})}
      #figure-${uid} .visor{fill:var(--piece-glow);stroke:var(--piece-highlight);filter:url(#glow-${uid})}
      #figure-${uid} .glow{fill:none;stroke:var(--piece-glow);stroke-width:3.2;filter:url(#glow-${uid})}
      #figure-${uid} .slash{fill:none;stroke:var(--piece-glow);stroke-width:4.8;filter:url(#glow-${uid})}
    </style>
  </svg>`;
}

export function pieceSvg(type) {
  return svgFor(type);
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
