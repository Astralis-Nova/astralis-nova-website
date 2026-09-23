import test from'node:test';
import assert from'node:assert/strict';
import{MISSIONS,chooseMission}from'./mission-formations.js';

test('campaign catalog provides varied, balanced opening sequences',()=>{
  assert.ok(MISSIONS.length>=8);
  assert.equal(new Set(MISSIONS.map(mission=>mission.name)).size,MISSIONS.length);
  assert.equal(new Set(MISSIONS.map(mission=>mission.moves.join(' '))).size,MISSIONS.length);
  for(const mission of MISSIONS){
    assert.ok(mission.name.length>0);
    assert.ok(mission.moves.length>=4);
    assert.equal(mission.moves.length%2,0,'Silver must receive the next turn');
  }
});

test('the next randomized campaign does not immediately repeat',()=>{
  const first=chooseMission(()=>0);
  const next=chooseMission(()=>0,first.name);
  assert.notEqual(next.name,first.name);
});
