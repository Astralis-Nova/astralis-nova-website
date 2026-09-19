import{Chess}from'https://cdn.jsdelivr.net/npm/chess.js@1.4.0/+esm';
import{createPiece}from'./pieces.js';
import{PIECE_NAMES,makeCaptureIntent,duelResolution,squareFromPoint,defenderWinFen}from'./combat-core.js';
import{AstralisCombatScene}from'./combat-scene.js';

const FILES=['a','b','c','d','e','f','g','h'];
const grid=document.getElementById('playableGrid'),statusText=document.getElementById('statusText'),turnLabel=document.getElementById('turnLabel'),selectedReadout=document.getElementById('selectedReadout'),lastEvent=document.getElementById('lastEvent'),battleLog=document.getElementById('battleLog');
const duelLayer=document.getElementById('duelLayer'),duelResult=document.getElementById('duelResult'),countdown=document.getElementById('duelCountdown');
let game=new Chess(),orientation='white',selected=null,legal=[],lastMove=null,phase='board',pending=null,aiTimer=null,winnerOverride=null,dragStart=null;

const scene=new AstralisCombatScene({
  canvas:document.getElementById('combatCanvas'),layer:duelLayer,
  onHealth:health=>{document.getElementById('attackerHealth').style.width=`${health.attacker*100}%`;document.getElementById('defenderHealth').style.width=`${health.defender*100}%`},
  onEnd:winner=>finishDuel(winner)
});

function orderedFiles(){return orientation==='white'?FILES:[...FILES].reverse()}
function orderedRanks(){return orientation==='white'?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8]}
function colorName(color){return color==='w'?'Silver':'Void'}
function pieceName(piece){return`${colorName(piece.color)} ${PIECE_NAMES[piece.type]}`}
function setStatus(message){statusText.textContent=message}

function render(){
  grid.replaceChildren();const checked=findCheckedKing();
  for(const rank of orderedRanks())for(const file of orderedFiles()){
    const square=`${file}${rank}`,piece=game.get(square),button=document.createElement('button');button.type='button';button.className=`board-square ${(FILES.indexOf(file)+rank)%2===1?'dark':'light'}`;button.dataset.square=square;button.setAttribute('role','gridcell');
    if(selected===square)button.classList.add('selected');if(lastMove&&(lastMove.from===square||lastMove.to===square))button.classList.add('last');if(checked===square)button.classList.add('check');
    const route=legal.find(move=>move.to===square);if(route)button.classList.add(route.captured?'capture':'legal');
    const coord=document.createElement('span');coord.className='coord';coord.textContent=square.toUpperCase();button.append(coord);
    if(piece){button.append(createPiece(piece.type,piece.color==='w'?'white':'black'));button.setAttribute('aria-label',`${square.toUpperCase()} ${pieceName(piece)}`)}else button.setAttribute('aria-label',square.toUpperCase());
    button.addEventListener('click',()=>handleSquare(square));grid.append(button);
  }
  document.getElementById('rankCoordinates').replaceChildren(...orderedRanks().map(value=>textSpan(value)));
  document.getElementById('fileCoordinates').replaceChildren(...orderedFiles().map(value=>textSpan(value)));
  selectedReadout.textContent=selected?`${selected.toUpperCase()} · ${legal.length} route${legal.length===1?'':'s'}`:'None';
  turnLabel.textContent=winnerOverride?`${colorName(winnerOverride)} victory`:game.isGameOver()?resultText():`${colorName(game.turn())} to move`;
  document.getElementById('silverCard').classList.toggle('active',!winnerOverride&&game.turn()==='w'&&phase==='board');document.getElementById('voidCard').classList.toggle('active',!winnerOverride&&game.turn()==='b'&&phase==='board');
  let white=0,black=0;for(const row of game.board())for(const piece of row){if(piece?.color==='w')white++;if(piece?.color==='b')black++}document.getElementById('silverCount').textContent=white;document.getElementById('voidCount').textContent=black;
  requestAnimationFrame(auditGeometry);
}

function textSpan(value){const span=document.createElement('span');span.textContent=value;return span}
function findCheckedKing(){if(!game.isCheck())return null;for(const file of FILES)for(let rank=1;rank<=8;rank++){const square=`${file}${rank}`,piece=game.get(square);if(piece?.type==='k'&&piece.color===game.turn())return square}return null}
function clearSelection(){selected=null;legal=[]}

function handleSquare(square){
  if(phase!=='board'||winnerOverride||game.isGameOver())return;
  if(game.turn()==='b')return setStatus('Nova is calculating the Void Fleet response.');
  const destination=selected?legal.find(move=>move.to===square):null;
  if(destination){void attemptMove(destination);return}
  const piece=game.get(square);
  if(piece?.color===game.turn()){selected=square;legal=game.moves({square,verbose:true});setStatus(legal.length?`${pieceName(piece)} selected. Choose a glowing destination.`:`${pieceName(piece)} is blocked.`)}else{clearSelection();setStatus('Select one of your Silver units.');render()}
}

async function attemptMove(move){
  const attacker=game.get(move.from),defender=game.get(move.to);
  if(defender){launchDuel(makeCaptureIntent({from:move.from,to:move.to,attacker,defender,promotion:move.promotion||null,fen:game.fen()}));return}
  commitStandardMove(move);afterTurn(`${pieceName(attacker)} advanced ${move.from.toUpperCase()} → ${move.to.toUpperCase()}.`);
}

function commitStandardMove(move){const made=game.move({from:move.from,to:move.to,...(move.promotion?{promotion:move.promotion}:{})});lastMove={from:made.from,to:made.to};clearSelection();render();return made}

function launchDuel(intent){
  pending=intent;phase='duel';clearTimeout(aiTimer);clearSelection();render();duelLayer.hidden=false;duelResult.hidden=true;countdown.hidden=false;
  document.getElementById('duelTitle').textContent=`${PIECE_NAMES[intent.attacker.type]} vs ${PIECE_NAMES[intent.defender.type]}`;document.getElementById('attackerName').textContent=`ATTACKER · ${pieceName(intent.attacker)}`;document.getElementById('defenderName').textContent=`DEFENDER · ${pieceName(intent.defender)}`;
  const humanSide=intent.attacker.color==='w'?'attacker':'defender';document.getElementById('humanRole').textContent=humanSide==='attacker'?pieceName(intent.attacker):pieceName(intent.defender);document.getElementById('duelObjective').textContent=`${intent.from.toUpperCase()} → ${intent.to.toUpperCase()} · capture suspended`;
  let value=3;countdown.textContent=value;const timer=setInterval(()=>{value--;if(value>0)countdown.textContent=value;else if(value===0)countdown.textContent='ENGAGE';else{clearInterval(timer);countdown.hidden=true}},760);
  scene.start(intent,humanSide);setStatus(`Capture suspended: ${intent.from.toUpperCase()} → ${intent.to.toUpperCase()} duel in progress.`);log(`Duel launched: ${pieceName(intent.attacker)} challenges ${pieceName(intent.defender)}.`);
}

function finishDuel(winner){
  if(!pending)return;const resolution=duelResolution(pending,winner),intent=pending;duelResult.hidden=false;duelResult.textContent=winner==='attacker'?'ATTACKER VICTORY':'DEFENDER HOLDS';
  window.setTimeout(()=>{
    if(resolution.commitMove){const made=game.move({from:intent.from,to:intent.to,...(intent.promotion?{promotion:intent.promotion}:{})});lastMove={from:made.from,to:made.to};lastEvent.textContent=`${pieceName(intent.attacker)} won at ${intent.to.toUpperCase()}`;log(`${pieceName(intent.attacker)} won the duel and captured ${pieceName(intent.defender)}.`)}
    else if(resolution.gameWinner){winnerOverride=resolution.gameWinner;lastEvent.textContent=`${pieceName(intent.attacker)} destroyed`;log(`${pieceName(intent.defender)} destroyed the attacking Nexus Prime. ${colorName(resolution.gameWinner)} wins.`)}
    else{game.load(defenderWinFen(intent.fen,intent));lastMove={from:intent.from,to:intent.to};lastEvent.textContent=`${pieceName(intent.defender)} defended ${intent.to.toUpperCase()}`;log(`${pieceName(intent.defender)} held position; ${pieceName(intent.attacker)} was destroyed.`)}
    pending=null;phase='board';scene.stop();duelLayer.hidden=true;clearSelection();render();
    if(winnerOverride||game.isGameOver()){setStatus(resultText());return}setStatus(`${colorName(game.turn())} assumes command after the duel.`);if(game.turn()==='b')scheduleAi();
  },1150);
}

function afterTurn(message){lastEvent.textContent=message;log(message);if(game.isGameOver()){setStatus(resultText());render();return}setStatus(game.turn()==='b'?'Nova is calculating the Void Fleet response.':'Silver to move.');if(game.turn()==='b')scheduleAi()}
function scheduleAi(){clearTimeout(aiTimer);aiTimer=setTimeout(makeAiMove,680)}
function makeAiMove(){
  if(phase!=='board'||game.turn()!=='b'||game.isGameOver()||winnerOverride)return;const moves=game.moves({verbose:true}),values={p:1,n:3,b:3.2,r:5,q:9,k:20};let best=-Infinity,choices=[];
  for(const move of moves){let score=(move.captured?values[move.captured]*11:0)+(move.promotion?8:0)+(move.san.includes('+')?2.5:0)+Math.random()*1.5;if(['d4','e4','d5','e5'].includes(move.to))score+=1;if(score>best+.05){best=score;choices=[move]}else if(Math.abs(score-best)<=.05)choices.push(move)}
  const move=choices[Math.floor(Math.random()*choices.length)]||moves[0];if(!move)return;const attacker=game.get(move.from),defender=game.get(move.to);if(defender){launchDuel(makeCaptureIntent({from:move.from,to:move.to,attacker,defender,promotion:move.promotion||null,fen:game.fen()}));return}commitStandardMove(move);afterTurn(`Nova advanced ${pieceName(attacker)} ${move.from.toUpperCase()} → ${move.to.toUpperCase()}.`);
}

function resultText(){if(winnerOverride)return`${colorName(winnerOverride)} wins: opposing Nexus Prime destroyed.`;if(game.isCheckmate())return`${colorName(game.turn()==='w'?'b':'w')} wins by checkmate.`;if(game.isDraw())return'Draw detected by the chess core.';return'Campaign complete.'}
function log(message){const li=document.createElement('li');li.textContent=message;battleLog.prepend(li);while(battleLog.children.length>16)battleLog.lastElementChild.remove()}
function auditGeometry(){const rect=grid.getBoundingClientRect(),squares=[...grid.children];const expected=rect.width/8,valid=Math.abs(rect.width-rect.height)<1.5&&squares.length===64&&squares.every(square=>{const r=square.getBoundingClientRect();return Math.abs(r.width-expected)<1&&Math.abs(r.height-expected)<1});const node=document.getElementById('geometryStatus');node.textContent=valid?'64 cells locked':'Recalibrating';node.style.color=valid?'var(--success)':'var(--gold)'}

grid.addEventListener('pointerdown',event=>{const square=event.target.closest('.board-square');if(!square)return;dragStart={square:square.dataset.square,x:event.clientX,y:event.clientY}});
grid.addEventListener('pointerup',event=>{if(!dragStart)return;const moved=Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y);if(moved>9&&phase==='board'){event.preventDefault();const target=squareFromPoint(grid.getBoundingClientRect(),event.clientX,event.clientY,orientation);if(!selected)handleSquare(dragStart.square);const route=legal.find(move=>move.to===target);if(route)void attemptMove(route)}dragStart=null});

document.getElementById('newGame').addEventListener('click',()=>{clearTimeout(aiTimer);scene.stop();game=new Chess();orientation='white';selected=null;legal=[];lastMove=null;phase='board';pending=null;winnerOverride=null;duelLayer.hidden=true;lastEvent.textContent='Opening formation';battleLog.replaceChildren(textLi('New Astralis campaign started.'));setStatus('Silver to move. Select a unit.');render()});
document.getElementById('flipBoard').addEventListener('click',()=>{orientation=orientation==='white'?'black':'white';render()});
document.getElementById('rulesButton').addEventListener('click',()=>document.getElementById('rulesDialog').showModal());
window.addEventListener('resize',()=>requestAnimationFrame(auditGeometry));
function textLi(value){const li=document.createElement('li');li.textContent=value;return li}

setStatus('Silver to move. Select a unit.');render();
