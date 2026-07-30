import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRI_BOARD_IDS,
  TRI_STATE_VERSION,
  applyTriMove,
  createTriState,
  triLegalMoves,
  triSquares,
} from './trideck-engine.js';

test('Nova Tri-Deck has 64 playable squares and 32 starting units', () => {
  const tri = createTriState();
  const squareCount = TRI_BOARD_IDS.reduce((total, board) => total + triSquares(board).length, 0);
  assert.equal(TRI_STATE_VERSION, 3);
  assert.equal(squareCount, 64);
  assert.equal(Object.keys(tri.pieces).length, 32);
  assert.equal(Object.values(tri.pieces).filter(piece => piece.color === 'white').length, 16);
  assert.equal(Object.values(tri.pieces).filter(piece => piece.color === 'black').length, 16);
});

test('main-deck pieces can phase to the matching empty square', () => {
  const tri = createTriState();
  const moves = triLegalMoves(tri, 'L', 'a1');
  assert.ok(moves.some(move => move.board === 'C' && move.square === 'a1' && move.phase));
});

test('Drone Sentinels need a portal cell to phase between main decks', () => {
  const tri = createTriState();
  const ordinary = triLegalMoves(tri, 'L', 'a2');
  const portal = triLegalMoves(tri, 'L', 'b2');
  assert.ok(!ordinary.some(move => move.board === 'C' && move.square === 'a2'));
  assert.ok(portal.some(move => move.board === 'C' && move.square === 'b2' && move.phase));
});

test('all attack-platform cells link to their matching command-deck cells', () => {
  const tri = createTriState();
  delete tri.pieces['L:a1'];
  const moves = triLegalMoves(tri, 'LA', 'a1');
  const transfer = moves.find(move => move.board === 'L' && move.square === 'a1');
  assert.ok(transfer?.transfer);

  const result = applyTriMove(tri, { board: 'LA', square: 'a1' }, transfer, '2026-07-30T00:00:00.000Z');
  assert.equal(tri.pieces['L:a1'].type, 'r');
  assert.equal(result.record.notation, 'LA:a1⇅L:a1');
  assert.equal(tri.turn, 'black');
});

test('capturing the opposing High Commander wins Tri-Deck', () => {
  const tri = createTriState();
  tri.pieces = {
    'C:a1': { type: 'r', color: 'white' },
    'C:a4': { type: 'k', color: 'black' },
  };
  const target = triLegalMoves(tri, 'C', 'a1').find(move => move.board === 'C' && move.square === 'a4');
  const result = applyTriMove(tri, { board: 'C', square: 'a1' }, target);
  assert.equal(result.captured.type, 'k');
  assert.equal(tri.winner, 'white');
});
