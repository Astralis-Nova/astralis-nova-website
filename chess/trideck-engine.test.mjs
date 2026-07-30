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

test('Nova Tri-Deck divides one complete 8×8 battlefield into three platforms', () => {
  const squares = TRI_BOARD_IDS.flatMap((board) => triSquares(board));
  assert.equal(TRI_STATE_VERSION, 5);
  assert.equal(TRI_BOARD_IDS.length, 3);
  assert.equal(squares.length, 64);
  assert.equal(new Set(squares).size, 64);
  assert.deepEqual([...new Set(squares.map((square) => square[0]))], ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
  assert.deepEqual([...new Set(squares.map((square) => Number(square[1])))].sort(), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('home platforms hold 16 squares and the central platform holds 32', () => {
  assert.equal(triBoard('VD').ranks.length, 2);
  assert.equal(triSquares('VD').length, 16);
  assert.equal(triBoard('NX').ranks.length, 4);
  assert.equal(triSquares('NX').length, 32);
  assert.equal(triBoard('SD').ranks.length, 2);
  assert.equal(triSquares('SD').length, 16);
});

test('home armies occupy the two 8-square rows at opposite ends', () => {
  assert.equal(triBoardForSquare('e8'), 'VD');
  assert.equal(triBoardForSquare('a7'), 'VD');
  assert.equal(triBoardForSquare('h2'), 'SD');
  assert.equal(triBoardForSquare('d1'), 'SD');
});

test('the middle four ranks form one 8×4 nexus platform', () => {
  for (const square of ['a6', 'h5', 'a4', 'h3']) assert.equal(triBoardForSquare(square), 'NX');
});

test('rotating the view reverses both files and ranks inside every platform', () => {
  assert.equal(triSquares('SD', 'white')[0], 'a2');
  assert.equal(triSquares('SD', 'black')[0], 'h1');
  assert.equal(triSquares('NX', 'white')[0], 'a6');
  assert.equal(triSquares('NX', 'black')[0], 'h3');
  assert.equal(triSquares('VD', 'white')[0], 'a8');
  assert.equal(triSquares('VD', 'black')[0], 'h7');
});

test('a new Tri-Deck mission starts with the standard 32-piece chess position', () => {
  const tri = createTriState();
  const boardPart = TRI_START_FEN.split(' ')[0];
  const pieceCount = [...boardPart].filter((character) => /[prnbqkPRNBQK]/.test(character)).length;
  assert.equal(tri.version, 5);
  assert.equal(tri.fen, TRI_START_FEN);
  assert.equal(pieceCount, 32);
  assert.equal(tri.moves.length, 0);
});
