import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRI_BOARD_IDS,
  TRI_START_FEN,
  TRI_STATE_VERSION,
  createTriState,
  triBoard,
  triBoardForSquare,
  triSquares,
} from './trideck-engine.js';

test('Nova Tri-Deck divides one complete 8×8 battlefield into four 16-square platforms', () => {
  const squares = TRI_BOARD_IDS.flatMap((board) => triSquares(board));
  assert.equal(TRI_STATE_VERSION, 6);
  assert.equal(TRI_BOARD_IDS.length, 4);
  assert.equal(squares.length, 64);
  assert.equal(new Set(squares).size, 64);
  assert.deepEqual([...new Set(squares.map((square) => square[0]))], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  assert.deepEqual([...new Set(squares.map((square) => Number(square[1])))].sort(), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('every physical platform contains exactly 16 playable squares', () => {
  for (const boardId of TRI_BOARD_IDS) assert.equal(triSquares(boardId).length, 16);
  assert.deepEqual(triBoard('NP').files, ['a', 'b', 'c', 'd']);
  assert.deepEqual(triBoard('NS').files, ['e', 'f', 'g', 'h']);
});

test('home armies occupy the two 8-square rows at opposite ends', () => {
  assert.equal(triBoardForSquare('e8'), 'VD');
  assert.equal(triBoardForSquare('a7'), 'VD');
  assert.equal(triBoardForSquare('h2'), 'SD');
  assert.equal(triBoardForSquare('d1'), 'SD');
});

test('the middle four ranks split into two side-by-side 4×4 nexus platforms', () => {
  for (const square of ['a6', 'd5', 'a4', 'd3']) assert.equal(triBoardForSquare(square), 'NP');
  for (const square of ['e6', 'h5', 'e4', 'h3']) assert.equal(triBoardForSquare(square), 'NS');
});

test('rotating the view reverses both files and ranks inside every platform', () => {
  assert.equal(triSquares('SD', 'white')[0], 'a2');
  assert.equal(triSquares('SD', 'black')[0], 'h1');
  assert.equal(triSquares('NP', 'white')[0], 'a6');
  assert.equal(triSquares('NP', 'black')[0], 'd3');
  assert.equal(triSquares('NS', 'white')[0], 'e6');
  assert.equal(triSquares('NS', 'black')[0], 'h3');
  assert.equal(triSquares('VD', 'white')[0], 'a8');
  assert.equal(triSquares('VD', 'black')[0], 'h7');
});

test('a new Tri-Deck mission starts with the standard 32-piece chess position', () => {
  const tri = createTriState();
  const boardPart = TRI_START_FEN.split(' ')[0];
  const pieceCount = [...boardPart].filter((character) => /[prnbqkPRNBQK]/.test(character)).length;
  assert.equal(tri.version, 6);
  assert.equal(tri.fen, TRI_START_FEN);
  assert.equal(pieceCount, 32);
  assert.equal(tri.moves.length, 0);
});
