import assert from'node:assert/strict';
import{makeCaptureIntent,duelResolution,squareFromPoint,defenderWinFen}from'./combat-core.js';

const intent=makeCaptureIntent({from:'e4',to:'d5',attacker:{type:'p',color:'w'},defender:{type:'p',color:'b'},fen:'4k3/8/8/3p4/4P3/8/8/4K3 w - - 0 1'});
assert.equal(duelResolution(intent,'attacker').commitMove,true);
assert.equal(duelResolution(intent,'attacker').removeSquare,'d5');
assert.equal(duelResolution(intent,'defender').commitMove,false);
assert.equal(duelResolution(intent,'defender').removeSquare,'e4');
assert.equal(defenderWinFen(intent.fen,intent),'4k3/8/8/3p4/8/8/8/4K3 b - - 0 1');

const rect={left:100,top:50,width:800,height:800};
assert.equal(squareFromPoint(rect,101,51,'white'),'a8');
assert.equal(squareFromPoint(rect,899,849,'white'),'h1');
assert.equal(squareFromPoint(rect,101,51,'black'),'h1');
assert.equal(squareFromPoint(rect,899,849,'black'),'a8');
assert.equal(squareFromPoint(rect,99,51,'white'),null);

const rookIntent=makeCaptureIntent({from:'h1',to:'h2',attacker:{type:'r',color:'w'},defender:{type:'p',color:'b'},fen:'4k3/8/8/8/8/8/7p/4K2R w K - 0 1'});
assert.equal(defenderWinFen(rookIntent.fen,rookIntent),'4k3/8/8/8/8/8/7p/4K3 b - - 0 1');
console.log('Astralis combat core: attacker-win, defender-win, castling cleanup, and inner-grid mapping passed.');
