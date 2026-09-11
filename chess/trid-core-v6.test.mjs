import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class ClassList {
  constructor(){this.values=new Set()}
  add(...names){names.forEach(name=>this.values.add(name))}
  remove(...names){names.forEach(name=>this.values.delete(name))}
  toggle(name,force){
    const next=force===undefined?!this.values.has(name):Boolean(force);
    if(next)this.values.add(name);else this.values.delete(name);
    return next;
  }
  contains(name){return this.values.has(name)}
}

class Element {
  constructor(tag='div'){
    this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={setProperty(){}};
    this.classList=new ClassList();this.attributes={};this.textContent='';this.innerHTML='';this.disabled=false;
  }
  set className(value){this.classList=new ClassList();String(value).split(/\s+/).filter(Boolean).forEach(name=>this.classList.add(name))}
  get className(){return [...this.classList.values].join(' ')}
  setAttribute(name,value){this.attributes[name]=String(value)}
  addEventListener(){}
  appendChild(child){this.children.push(child);return child}
  append(...children){children.forEach(child=>this.appendChild(child))}
  replaceChildren(...children){this.children=[...children]}
  remove(){this.removed=true}
}

function bootEngine(){
  const ids=new Map();
  const create=(id,classes='')=>{const element=new Element();element.id=id;element.className=classes;ids.set(id,element);return element};
  const scene=create('scene');
  const gameActions=create('gameActions','game-actions');
  create('gameStatus');create('newGame');create('novaToggle');create('flipBoard');create('attackBoardMode');create('attackRotate');create('chip','mode-chip');
  for(const id of ['A1','U','A2','M','B1','L','B2']){
    create(id);
    const platform=create(`platform-${id}`,id.length===1?'main-board':'attack');platform.dataset.board=id;scene.appendChild(platform);
  }
  const document={
    getElementById:id=>ids.get(id)||null,
    createElement:tag=>new Element(tag),
    querySelector(selector){
      if(selector==='.game-actions')return gameActions;
      if(selector==='.mode-chip')return ids.get('chip');
      const match=selector.match(/^\[data-board="([^"]+)"\]$/);return match?ids.get(`platform-${match[1]}`)||null:null;
    }
  };
  const storage=new Map();
  const localStorage={getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
  const window={prompt:()=> 'Q'};
  const context=vm.createContext({document,window,localStorage,console,setTimeout:()=>0,clearTimeout(){}});
  const source=fs.readFileSync(new URL('./trid-core-v5.js',import.meta.url),'utf8');
  vm.runInContext(source,context,{filename:'trid-core-v5.js'});
  return context.window.AstralisTriD;
}

const engine=bootEngine();
const rules=engine.test;
const piece=(color,type,moved=false)=>({color,type,moved});
const stateWith=(pieces,overrides={})=>({...rules.freshState(false),pieces,turn:'w',novaBlack:false,gameOver:false,ply:4,...overrides});

test('starts with one complete 32-piece W3DCF army and a versioned ruleset',()=>{
  const state=rules.freshState(false);
  assert.equal(engine.version,6);
  assert.match(engine.ruleset,/W3DCF 2013/);
  assert.equal(Object.keys(state.pieces).length,32);
  assert.equal(Object.values(state.pieces).filter(p=>p.color==='w').length,16);
  assert.equal(Object.values(state.pieces).filter(p=>p.color==='b').length,16);
});

test('alternates the turn after every legal piece move',()=>{
  const state=rules.freshState(false);
  const move=rules.legalMoves('L:B2',state).find(candidate=>candidate.doublePawn);
  assert.ok(move);
  assert.equal(rules.applyMove(move,state).turn,'b');
});

test('a blocker on any overlapping level stops a slider beyond that projected square',()=>{
  const state=stateWith({
    'L:A1':piece('w','k'),'U:D4':piece('b','k'),'L:B1':piece('w','r'),'L:B3':piece('b','p')
  });
  const moves=rules.pseudoMoves('L:B1',state);
  assert.ok(moves.some(move=>move.to==='L:B3'&&move.capture==='L:B3'));
  assert.ok(moves.some(move=>move.to==='M:B1'));
  assert.equal(moves.some(move=>move.to==='L:B4'||move.to==='M:B2'),false);
});

test('sliders continue their line across non-existent squares to another deck',()=>{
  const state=stateWith({
    'L:C1':piece('w','k'),'U:C4':piece('b','k'),'A1:A1':piece('w','r')
  });
  const moves=rules.pseudoMoves('A1:A1',state);
  assert.ok(moves.some(move=>move.to==='B1:A2'));
});

test('a pawn cannot double-step through a blocker on another level',()=>{
  const state=stateWith({
    'L:A1':piece('w','k'),'U:D4':piece('b','k'),'L:B2':piece('w','p'),'M:B1':piece('b','n')
  },{ply:0});
  const moves=rules.pseudoMoves('L:B2',state);
  assert.ok(moves.some(move=>move.to==='L:B3'));
  assert.equal(moves.some(move=>move.doublePawn),false);
});

test('sliders defend a projected square occupied by a friendly piece',()=>{
  const state=stateWith({
    'L:A1':piece('w','k'),'U:D4':piece('b','k'),'L:B4':piece('b','r'),'L:B3':piece('b','p')
  });
  assert.equal(rules.attacked('L:B3','b',state),true);
});

test('en passant lands on either open level and removes the double-stepped pawn',()=>{
  const before=stateWith({
    'L:A1':piece('w','k'),'U:D4':piece('b','k'),'L:B2':piece('w','p'),'L:C4':piece('b','p',true)
  },{ply:6});
  const whiteDouble=rules.legalMoves('L:B2',before).find(move=>move.to==='L:B4'&&move.doublePawn);
  assert.ok(whiteDouble);
  const afterWhite=rules.applyMove(whiteDouble,before);
  const replies=rules.legalMoves('L:C4',afterWhite).filter(move=>move.enPassant);
  assert.deepEqual(new Set(replies.map(move=>move.to)),new Set(['L:B3','M:B1']));
  const afterCapture=rules.applyMove(replies[0],afterWhite);
  assert.equal(afterCapture.pieces['L:B4'],undefined);
});

test('king-side castling swaps king and rook, and is forbidden as the player first move',()=>{
  const pieces={'L:C1':piece('w','k'),'B2:B1':piece('w','r'),'U:C4':piece('b','k')};
  const firstTurn=stateWith(pieces,{ply:0});
  assert.equal(rules.legalMoves('L:C1',firstTurn).some(move=>move.castle),false);
  const later=stateWith(pieces,{ply:2});
  const castle=rules.legalMoves('L:C1',later).find(move=>move.castle?.name==='O-O');
  assert.ok(castle);
  const castled=rules.applyMove(castle,later);
  assert.equal(castled.pieces['B2:B1'].type,'k');
  assert.equal(castled.pieces['L:C1'].type,'r');
});

test('queen-side and Black castling also return the rook to the king origin',()=>{
  const white=stateWith({'L:C1':piece('w','k'),'B1:A1':piece('w','r'),'U:C4':piece('b','k')},{ply:2});
  const whiteCastle=rules.legalMoves('L:C1',white).find(move=>move.castle?.name==='O-O-O');
  assert.ok(whiteCastle);
  const whiteAfter=rules.applyMove(whiteCastle,white);
  assert.equal(whiteAfter.pieces['B1:B1'].type,'k');
  assert.equal(whiteAfter.pieces['L:C1'].type,'r');

  const black=stateWith({'L:C1':piece('w','k'),'U:C4':piece('b','k'),'A2:B1':piece('b','r')},{turn:'b',ply:3});
  const blackCastle=rules.legalMoves('U:C4',black).find(move=>move.castle?.name==='O-O');
  assert.ok(blackCastle);
  const blackAfter=rules.applyMove(blackCastle,black);
  assert.equal(blackAfter.pieces['A2:B1'].type,'k');
  assert.equal(blackAfter.pieces['U:C4'].type,'r');
});

test('empty attack boards remain controlled by their original owner',()=>{
  const black=stateWith({'L:C1':piece('w','k'),'U:C4':piece('b','k')},{turn:'b'});
  assert.ok(rules.attackBoardMoves('A1',black).length>0);
  const white={...black,turn:'w'};
  assert.equal(rules.attackBoardMoves('A1',white).length,0);
});

test('a king may ride an attack board when the resulting position remains safe',()=>{
  const state=stateWith({'B1:A1':piece('w','k'),'U:D4':piece('b','k')});
  assert.ok(rules.attackBoardMoves('B1',state).length>0);
});

test('occupied attack boards move forward or sideways, while empty boards may move backward',()=>{
  const mounts={A1:'U_NW',A2:'U_NE',B1:'M_SW',B2:'L_SE'};
  const occupied=stateWith({'L:C1':piece('w','k'),'U:C4':piece('b','k'),'B1:A1':piece('w','n')},{attackMounts:mounts});
  assert.equal(rules.attackBoardMoves('B1',occupied).some(move=>move.target==='L_SW'),false);
  const empty={...occupied,pieces:{'L:C1':piece('w','k'),'U:C4':piece('b','k')}};
  assert.equal(rules.attackBoardMoves('B1',empty).some(move=>move.target==='L_SW'),true);
});

test('promotion is applied immediately on the farthest main-board rank',()=>{
  const state=stateWith({'L:A1':piece('w','k'),'U:D1':piece('b','k'),'U:B3':piece('w','p',true)});
  const move=rules.legalMoves('U:B3',state).find(candidate=>candidate.to==='U:B4');
  assert.ok(move);
  assert.equal(rules.applyMove(move,state,'n').pieces['U:B4'].type,'n');
});

test('glass pieces pivot from the exact square center in normal and flipped views',()=>{
  const css=fs.readFileSync(new URL('./trid-command-board-v6.css',import.meta.url),'utf8');
  const source=fs.readFileSync(new URL('./trid-core-v5.js',import.meta.url),'utf8');
  assert.match(css,/--piece-anchor-x:50%/);
  assert.match(css,/--piece-anchor-y:50%/);
  assert.match(css,/translate3d\(-50%,0,var\(--piece-deck-lift\)\) rotateX\(-90deg\)/);
  assert.match(css,/\.scene\.flipped \.piece\{transform:translate3d\(-50%,0,var\(--piece-deck-lift\)\) rotateX\(-90deg\) rotateZ\(180deg\)/);
  assert.match(source,/viewBox="0 0 100 164" preserveAspectRatio="xMidYMax meet"/);
});

test('a deterministic multi-move game keeps alternating without losing either king',()=>{
  let state=rules.freshState(false);
  let completed=0;
  for(let ply=0;ply<80;ply++){
    const moves=rules.allLegalMoves(state.turn,state);
    if(!moves.length)break;
    const previousTurn=state.turn;
    state=rules.applyMove(moves[(ply*17)%moves.length],state,'q');
    assert.notEqual(state.turn,previousTurn);
    assert.equal(Object.values(state.pieces).filter(p=>p.type==='k').length,2);
    assert.ok(Object.keys(state.pieces).length<=32);
    completed++;
  }
  assert.ok(completed>=30);
});
