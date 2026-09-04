const LABELS = {
  k: 'Solar King',
  q: 'Lunar Queen',
  r: 'Astralis Nova Citadel',
  b: 'Ringworld Seer',
  n: 'Comet Strider',
  p: 'Asteroid Pawn',
};

let pieceSerial = 0;

const FIGURES = {
  // King: crowned sun / nova core
  k: `
    <path class="deep" d="M33 79 39 49h22l6 30Z"/>
    <path class="shell" d="M29 79 36 52l8-9h12l8 9 7 27Z"/>
    <circle class="core" cx="50" cy="32" r="12"/>
    <path class="glow" d="M50 8v9M50 47v8M26 32h9M65 32h9M33 15l6 7M61 42l6 7M67 15l-6 7M39 42l-6 7"/>
    <path class="shell" d="m38 18 5-8 7 6 7-6 5 8-3 8H41Z"/>
    <path class="accent" d="M35 56h30l-2 10H37Z"/>
    <path class="detail" d="M40 70h20M43 76h14"/>
  `,

  // Queen: crescent moon / astrology crown
  q: `
    <path class="deep" d="M33 79 39 47h22l6 32Z"/>
    <path class="shell" d="M29 79 36 51l8-9h12l8 9 7 28Z"/>
    <path class="shell" d="M57 12c-12 2-20 12-18 23 2 10 12 16 23 13-8-3-12-10-11-18 1-8 5-14 6-18Z"/>
    <circle class="gem" cx="62" cy="18" r="3"/>
    <circle class="gem" cx="35" cy="25" r="2.5"/>
    <path class="glow" d="M68 12v6M65 15h6M32 15v5M29 18h6"/>
    <path class="accent" d="M35 57h30l-3 10H38Z"/>
    <path class="detail" d="M41 70h18M43 76h14"/>
  `,

  // Rook: Astralis Nova observatory / castle citadel
  r: `
    <path class="deep" d="M31 79V38h38v41Z"/>
    <path class="shell" d="M27 79 31 39h38l4 40Z"/>
    <path class="shell" d="M28 38V21h9v7h8v-7h10v7h8v-7h9v17Z"/>
    <path class="shell" d="M39 21c2-8 7-12 11-12s9 4 11 12Z"/>
    <circle class="core" cx="50" cy="21" r="5"/>
    <path class="glow" d="M50 7v7M43 11h14"/>
    <path class="accent" d="M31 44h38v10H31Z"/>
    <path class="detail" d="M38 57v15M50 57v15M62 57v15M34 73h32"/>
  `,

  // Bishop: ringed planet / orbital seer
  b: `
    <path class="deep" d="M32 79c3-20 7-31 14-39h8c7 8 11 19 14 39Z"/>
    <path class="shell" d="M28 79c5-23 10-35 19-42h6c9 7 14 19 19 42Z"/>
    <circle class="shell" cx="50" cy="28" r="12"/>
    <ellipse class="accent" cx="50" cy="28" rx="22" ry="7" transform="rotate(-12 50 28)"/>
    <path class="glow" d="M30 31c8-7 32-12 40-5"/>
    <path class="slash" d="m56 18-12 20"/>
    <path class="accent" d="M35 56h30l-3 10H38Z"/>
    <path class="detail" d="M42 70h16"/>
  `,

  // Knight: comet / planetary strider
  n: `
    <path class="deep" d="M28 79c5-18 11-28 22-35l13 5 8 30Z"/>
    <path class="shell" d="M24 79c4-18 12-31 24-39l3-12-8-12c19 1 29 11 31 28l-9 12 8 23Z"/>
    <circle class="core" cx="61" cy="34" r="5"/>
    <path class="accent" d="m49 28 15 4 7 12-10 8-13-11Z"/>
    <path class="glow" d="M42 16c-9 4-14 11-18 20M46 21c-8 5-12 11-15 18"/>
    <path class="detail" d="M39 53c9 2 16 8 20 19M33 69h28"/>
  `,

  // Pawn: cratered asteroid
  p: `
    <path class="deep" d="M34 79c2-16 7-27 16-33 9 6 14 17 16 33Z"/>
    <path class="shell" d="M29 79c4-17 10-28 18-33h6c8 5 14 16 18 33Z"/>
    <path class="shell" d="M35 28c0-10 7-17 16-17 11 0 17 7 16 17-1 9-8 15-17 15-9 0-15-6-15-15Z"/>
    <circle class="deep" cx="44" cy="24" r="4"/>
    <circle class="deep" cx="57" cy="31" r="3.2"/>
    <circle class="deep" cx="53" cy="19" r="2.4"/>
    <circle class="accent" cx="41" cy="33" r="2.5"/>
    <path class="accent" d="M35 56h30l-3 10H38Z"/>
    <path class="detail" d="M42 71h16"/>
  `,
};

function svgFor(type) {
  const uid = `${type}-${pieceSerial += 1}`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="body-${uid}" x1=".12" y1=".05" x2=".85" y2=".95">
        <stop offset="0" stop-color="var(--piece-highlight)" stop-opacity=".98"/>
        <stop offset=".16" stop-color="var(--piece-main)" stop-opacity=".76"/>
        <stop offset=".42" stop-color="var(--piece-highlight)" stop-opacity=".34"/>
        <stop offset=".69" stop-color="var(--piece-mid)" stop-opacity=".72"/>
        <stop offset="1" stop-color="var(--piece-edge)" stop-opacity=".96"/>
      </linearGradient>
      <linearGradient id="base-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--piece-highlight)" stop-opacity=".94"/>
        <stop offset=".24" stop-color="var(--piece-main)" stop-opacity=".7"/>
        <stop offset=".55" stop-color="var(--piece-mid)" stop-opacity=".5"/>
        <stop offset="1" stop-color="var(--piece-shadow)" stop-opacity=".96"/>
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
      #figure-${uid} .shell{fill:url(#body-${uid});fill-opacity:var(--piece-shell-opacity,.9)}
      #figure-${uid} .deep{fill:var(--piece-shadow);fill-opacity:var(--piece-deep-opacity,.75)}
      #figure-${uid} .accent{fill:var(--piece-accent);fill-opacity:var(--piece-accent-opacity,.62)}
      #figure-${uid} .base{fill:url(#base-${uid});fill-opacity:.92}
      #figure-${uid} .base-shadow{fill:rgba(0,0,0,.48);stroke:none}
      #figure-${uid} .base-rim{fill:var(--piece-shadow);fill-opacity:.84}
      #figure-${uid} .base-light,#figure-${uid} .detail{fill:none;stroke:var(--piece-highlight);stroke-width:1.65;opacity:.92}
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
