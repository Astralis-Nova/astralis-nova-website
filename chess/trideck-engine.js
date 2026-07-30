export const TRI_STATE_VERSION = 6;
export const TRI_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const FILES = Object.freeze(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);

export const TRI_BOARDS = Object.freeze({
  VD: Object.freeze({
    id: 'VD',
    label: 'Void Command Platform',
    shortLabel: 'Void Home',
    files: FILES,
    ranks: Object.freeze([8, 7]),
    level: 3,
    role: 'home',
  }),
  NP: Object.freeze({
    id: 'NP',
    label: 'Port Nexus Platform',
    shortLabel: 'Port Nexus',
    files: Object.freeze(['a', 'b', 'c', 'd']),
    ranks: Object.freeze([6, 5, 4, 3]),
    level: 2,
    role: 'middle',
  }),
  NS: Object.freeze({
    id: 'NS',
    label: 'Starboard Nexus Platform',
    shortLabel: 'Starboard Nexus',
    files: Object.freeze(['e', 'f', 'g', 'h']),
    ranks: Object.freeze([6, 5, 4, 3]),
    level: 2,
    role: 'middle',
  }),
  SD: Object.freeze({
    id: 'SD',
    label: 'Silver Command Platform',
    shortLabel: 'Silver Home',
    files: FILES,
    ranks: Object.freeze([2, 1]),
    level: 0,
    role: 'home',
  }),
});

export const TRI_BOARD_IDS = Object.freeze(['VD', 'NP', 'NS', 'SD']);

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
  const value = String(square || '');
  const file = value[0];
  const rank = Number(value.slice(1));
  return TRI_BOARD_IDS.find((boardId) => {
    const board = TRI_BOARDS[boardId];
    return board.files.includes(file) && board.ranks.includes(rank);
  }) || null;
}

export function triSquares(boardId, orientation = 'white') {
  const board = TRI_BOARDS[boardId];
  if (!board) return [];
  const files = orientation === 'white' ? board.files : [...board.files].reverse();
  const ranks = orientation === 'white' ? board.ranks : [...board.ranks].reverse();
  return ranks.flatMap((rank) => files.map((file) => `${file}${rank}`));
}

export function triSquareParts(square) {
  return {
    file: FILES.indexOf(String(square || '')[0]),
    rank: Number(String(square || '').slice(1)),
  };
}
