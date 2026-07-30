export const TRI_STATE_VERSION = 3;

export const TRI_BOARDS = Object.freeze({
  UA: Object.freeze({ id: 'UA', label: 'Void Alpha Platform', shortLabel: 'Void α', size: 2, kind: 'attack', level: 3, parent: 'U' }),
  UB: Object.freeze({ id: 'UB', label: 'Void Beta Platform', shortLabel: 'Void β', size: 2, kind: 'attack', level: 3, parent: 'U' }),
  U: Object.freeze({ id: 'U', label: 'Upper Command Deck', shortLabel: 'Upper', size: 4, kind: 'main', level: 2 }),
  C: Object.freeze({ id: 'C', label: 'Central Battle Deck', shortLabel: 'Core', size: 4, kind: 'main', level: 1 }),
  L: Object.freeze({ id: 'L', label: 'Lower Tactical Deck', shortLabel: 'Lower', size: 4, kind: 'main', level: 0 }),
  LA: Object.freeze({ id: 'LA', label: 'Silver Alpha Platform', shortLabel: 'Silver α', size: 2, kind: 'attack', level: -1, parent: 'L' }),
  LB: Object.freeze({ id: 'LB', label: 'Silver Beta Platform', shortLabel: 'Silver β', size: 2, kind: 'attack', level: -1, parent: 'L' }),
});

export const TRI_BOARD_IDS = Object.freeze(['UA', 'UB', 'U', 'C', 'L', 'LA', 'LB']);
export const TRI_MAIN_IDS = Object.freeze(['L', 'C', 'U']);
export const TRI_PORTAL_SQUARES = Object.freeze(new Set(['b2', 'c2', 'b3', 'c3']));

const FILES = ['a', 'b', 'c', 'd'];
const MAIN_PHASE_NEIGHBORS = Object.freeze({
  L: Object.freeze(['C']),
  C: Object.freeze(['L', 'U']),
  U: Object.freeze(['C']),
});

const ATTACK_LINKS = Object.freeze({
  LA: Object.freeze({ a1: 'a1', b1: 'b1', a2: 'a2', b2: 'b2' }),
  LB: Object.freeze({ a1: 'c1', b1: 'd1', a2: 'c2', b2: 'd2' }),
  UA: Object.freeze({ a1: 'a3', b1: 'b3', a2: 'a4', b2: 'b4' }),
  UB: Object.freeze({ a1: 'c3', b1: 'd3', a2: 'c4', b2: 'd4' }),
});

function put(pieces, board, square, type, color) {
  pieces[`${board}:${square}`] = { type, color };
}

export function createTriState() {
  const pieces = {};

  ['n', 'b', 'b', 'n'].forEach((type, index) => {
    put(pieces, 'L', `${FILES[index]}1`, type, 'white');
    put(pieces, 'U', `${FILES[index]}4`, type, 'black');
  });
  FILES.forEach(file => {
    put(pieces, 'L', `${file}2`, 'p', 'white');
    put(pieces, 'U', `${file}3`, 'p', 'black');
  });

  [
    ['LA', 'a1', 'r'], ['LA', 'b1', 'q'], ['LA', 'a2', 'p'], ['LA', 'b2', 'p'],
    ['LB', 'a1', 'k'], ['LB', 'b1', 'r'], ['LB', 'a2', 'p'], ['LB', 'b2', 'p'],
  ].forEach(([board, square, type]) => put(pieces, board, square, type, 'white'));

  [
    ['UA', 'a2', 'r'], ['UA', 'b2', 'q'], ['UA', 'a1', 'p'], ['UA', 'b1', 'p'],
    ['UB', 'a2', 'k'], ['UB', 'b2', 'r'], ['UB', 'a1', 'p'], ['UB', 'b1', 'p'],
  ].forEach(([board, square, type]) => put(pieces, board, square, type, 'black'));

  return {
    version: TRI_STATE_VERSION,
    pieces,
    turn: 'white',
    moves: [],
    captured: { white: [], black: [] },
    lastMove: null,
    winner: null,
  };
}

export function triBoard(boardId) {
  return TRI_BOARDS[boardId] || null;
}

export function triPiece(tri, board, square) {
  return tri?.pieces?.[`${board}:${square}`] || null;
}

export function triSquareFrom(board, file, rank) {
  const size = TRI_BOARDS[board]?.size || 0;
  if (file < 0 || file >= size || rank < 1 || rank > size) return null;
  return `${FILES[file]}${rank}`;
}

export function triSquareParts(square) {
  return { file: FILES.indexOf(square?.[0]), rank: Number(square?.slice(1)) };
}

export function triSquares(board, orientation = 'white') {
  const size = TRI_BOARDS[board]?.size || 0;
  const files = FILES.slice(0, size);
  const ranks = Array.from({ length: size }, (_, index) => index + 1);
  if (orientation === 'white') ranks.reverse();
  else files.reverse();
  return ranks.flatMap(rank => files.map(file => `${file}${rank}`));
}

export function isTriPortal(board, square) {
  return TRI_BOARDS[board]?.kind === 'main' && TRI_PORTAL_SQUARES.has(square);
}

function attackTransfers(board, square) {
  const spec = TRI_BOARDS[board];
  if (!spec) return [];

  if (spec.kind === 'attack') {
    const target = ATTACK_LINKS[board]?.[square];
    return target ? [{ board: spec.parent, square: target }] : [];
  }

  const matches = [];
  for (const [attackBoard, links] of Object.entries(ATTACK_LINKS)) {
    if (TRI_BOARDS[attackBoard].parent !== board) continue;
    for (const [attackSquare, mainSquare] of Object.entries(links)) {
      if (mainSquare === square) matches.push({ board: attackBoard, square: attackSquare });
    }
  }
  return matches;
}

export function triLegalMoves(tri, board, square) {
  const piece = triPiece(tri, board, square);
  if (!piece || !TRI_BOARDS[board]) return [];

  const { file, rank } = triSquareParts(square);
  const results = [];
  const seen = new Set();

  const add = (targetBoard, targetFile, targetRank, { phase = false, transfer = false, pawnCaptureOnly = false } = {}) => {
    const targetSquare = triSquareFrom(targetBoard, targetFile, targetRank);
    if (!targetSquare) return false;
    const occupant = triPiece(tri, targetBoard, targetSquare);
    if (pawnCaptureOnly && (!occupant || occupant.color === piece.color)) return false;
    if (!pawnCaptureOnly && occupant?.color === piece.color) return false;
    const key = `${targetBoard}:${targetSquare}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        board: targetBoard,
        square: targetSquare,
        capture: Boolean(occupant),
        phase,
        transfer,
      });
    }
    return !occupant;
  };

  const addEmptyPhase = (targetBoard, targetSquare, transfer = false) => {
    if (!TRI_BOARDS[targetBoard] || triPiece(tri, targetBoard, targetSquare)) return;
    const key = `${targetBoard}:${targetSquare}`;
    if (seen.has(key)) return;
    seen.add(key);
    results.push({ board: targetBoard, square: targetSquare, capture: false, phase: true, transfer });
  };

  const slide = directions => {
    for (const [df, dr] of directions) {
      let nextFile = file + df;
      let nextRank = rank + dr;
      while (triSquareFrom(board, nextFile, nextRank)) {
        const clear = add(board, nextFile, nextRank);
        if (!clear) break;
        nextFile += df;
        nextRank += dr;
      }
    }
  };

  if (piece.type === 'p') {
    const direction = piece.color === 'white' ? 1 : -1;
    const one = triSquareFrom(board, file, rank + direction);
    if (one && !triPiece(tri, board, one)) {
      add(board, file, rank + direction);
      const startRank = piece.color === 'white' ? 2 : TRI_BOARDS[board].size - 1;
      const two = triSquareFrom(board, file, rank + direction * 2);
      if (TRI_BOARDS[board].kind === 'main' && rank === startRank && two && !triPiece(tri, board, two)) {
        add(board, file, rank + direction * 2);
      }
    }
    add(board, file - 1, rank + direction, { pawnCaptureOnly: true });
    add(board, file + 1, rank + direction, { pawnCaptureOnly: true });
  }

  if (piece.type === 'n') {
    for (const [df, dr] of [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]]) {
      add(board, file + df, rank + dr);
    }
  }
  if (piece.type === 'b' || piece.type === 'q') slide([[1, 1], [-1, 1], [1, -1], [-1, -1]]);
  if (piece.type === 'r' || piece.type === 'q') slide([[1, 0], [-1, 0], [0, 1], [0, -1]]);
  if (piece.type === 'k') {
    for (let df = -1; df <= 1; df += 1) {
      for (let dr = -1; dr <= 1; dr += 1) {
        if (df || dr) add(board, file + df, rank + dr);
      }
    }
  }

  const spec = TRI_BOARDS[board];
  if (spec.kind === 'main' && (piece.type !== 'p' || isTriPortal(board, square))) {
    for (const neighbor of MAIN_PHASE_NEIGHBORS[board] || []) {
      addEmptyPhase(neighbor, square);
    }
  }

  for (const target of attackTransfers(board, square)) {
    addEmptyPhase(target.board, target.square, true);
  }

  return results;
}

function isPromotion(piece, board, square) {
  if (piece.type !== 'p') return false;
  if (piece.color === 'white') return board === 'U' && Number(square.slice(1)) === 4;
  return board === 'L' && Number(square.slice(1)) === 1;
}

export function applyTriMove(tri, from, target, at = new Date().toISOString()) {
  const legal = triLegalMoves(tri, from.board, from.square)
    .find(move => move.board === target.board && move.square === target.square);
  if (!legal) throw new Error('That Tri-Deck vector is not legal.');

  const fromKey = `${from.board}:${from.square}`;
  const toKey = `${target.board}:${target.square}`;
  const piece = tri.pieces[fromKey];
  const captured = tri.pieces[toKey] || null;
  const promoted = isPromotion(piece, target.board, target.square);

  delete tri.pieces[fromKey];
  tri.pieces[toKey] = { ...piece, type: promoted ? 'q' : piece.type };
  if (captured) tri.captured[piece.color].push(captured.type);
  if (captured?.type === 'k') tri.winner = piece.color;

  const separator = legal.phase ? '⇅' : captured ? '×' : '–';
  const notation = `${from.board}:${from.square}${separator}${target.board}:${target.square}${promoted ? '=O' : ''}`;
  const record = {
    ply: tri.moves.length + 1,
    color: piece.color,
    notation,
    from: from.square,
    to: target.square,
    fromBoard: from.board,
    toBoard: target.board,
    piece: piece.type,
    captured: captured?.type || null,
    phase: Boolean(legal.phase),
    transfer: Boolean(legal.transfer),
    promotion: promoted ? 'q' : null,
    at,
  };

  tri.moves.push(record);
  tri.lastMove = { ...record };
  if (!tri.winner) tri.turn = piece.color === 'white' ? 'black' : 'white';
  return { record, piece, captured, promoted, legal };
}
