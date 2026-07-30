export const TRI_STATE_VERSION = 4;
export const TRI_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const TRI_BOARDS = Object.freeze({
  VD: Object.freeze({
    id: 'VD',
    label: 'Void Command Platform',
    shortLabel: 'Void Home',
    ranks: Object.freeze([8, 7]),
    level: 3,
    role: 'home',
  }),
  NU: Object.freeze({
    id: 'NU',
    label: 'Upper Nexus Platform',
    shortLabel: 'Upper Nexus',
    ranks: Object.freeze([6, 5]),
    level: 2,
    role: 'middle',
  }),
  NL: Object.freeze({
    id: 'NL',
    label: 'Lower Nexus Platform',
    shortLabel: 'Lower Nexus',
    ranks: Object.freeze([4, 3]),
    level: 1,
    role: 'middle',
  }),
  SD: Object.freeze({
    id: 'SD',
    label: 'Silver Command Platform',
    shortLabel: 'Silver Home',
    ranks: Object.freeze([2, 1]),
    level: 0,
    role: 'home',
  }),
});

export const TRI_BOARD_IDS = Object.freeze(['VD', 'NU', 'NL', 'SD']);
const FILES = Object.freeze(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

export function createTriState() {
  return {
    version: TRI_STATE_VERSION,
    fen: TRI_START_FEN,
    moves: [],
    captured: { white: [], black: [] },
    lastMove: null,
    winner: null,
  };
}

export function triBoard(boardId) {
  return TRI_BOARDS[boardId] || null;
}

export function triBoardForSquare(square) {
  const rank = Number(String(square || '').slice(1));
  return TRI_BOARD_IDS.find((boardId) => TRI_BOARDS[boardId].ranks.includes(rank)) || null;
}

export function triSquares(boardId, orientation = 'white') {
  const board = TRI_BOARDS[boardId];
  if (!board) return [];
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? board.ranks : [...board.ranks].reverse();
  return ranks.flatMap((rank) => files.map((file) => `${file}${rank}`));
}

export function triSquareParts(square) {
  return {
    file: FILES.indexOf(String(square || '')[0]),
    rank: Number(String(square || '').slice(1)),
  };
}
