(()=>{
'use strict';
const GAME_KEY='astralisTriDGameV1';
const SESSION_KEY='astralisTriDOnlineV1';
const MODE='trideck';
const panel=document.getElementById('onlineMission');
const onlineStatus=document.getElementById('onlineStatus');
const commander=document.getElementById('commanderName');
const joinCode=document.getElementById('joinCode');
const createBtn=document.getElementById('createOnline');
const joinBtn=document.getElementById('joinOnline');
const copyBtn=document.getElementById('copyInvite');
const leaveBtn=document.getElementById('leaveOnline');
const novaTakeover=document.getElementById('novaTakeover');
const novaToggle=document.getElementById('novaToggle');
const newGame=document.getElementById('newGame');
const gameStatus=document.getElementById('gameStatus');
if(!panel||!onlineStatus||!createBtn||!joinBtn)return;

let session=readJson(SESSION_KEY);
let remote=null;
let busy=false;
let pollTimer=null;
let localWatch=null;
let lastObservedPly=Number(readGame()?.ply||0);
let suppressLocal=false;

function readJson(key){try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}}
function writeJson(key,value){if(value)localStorage.setItem(key,JSON.stringify(value));else localStorage.removeItem(key)}
function readGame(){return readJson(GAME_KEY)}
function writeGame(value){if(value)writeJson(GAME_KEY,value)}
function colorCode(){return session?.color==='white'?'w':'b'}
function setOnline(text,bad=false){onlineStatus.textContent=text;onlineStatus.classList.toggle('bad',bad)}
function setGame(text){if(gameStatus)gameStatus.textContent=text}
function cleanName(value){return String(value||'Commander').trim().replace(/[<>\u0000-\u001f]/g,'').slice(0,32)||'Commander'}
function cleanCode(value){return String(value||'').trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12)}
function saveSession(){writeJson(SESSION_KEY,session)}
function updateControls(){
  const connected=Boolean(session&&remote);
  createBtn.disabled=busy||connected;
  joinBtn.disabled=busy||connected;
  if(copyBtn)copyBtn.disabled=!connected;
  if(leaveBtn)leaveBtn.disabled=!connected;
  if(newGame)newGame.disabled=connected;
  if(novaToggle){
    novaToggle.disabled=connected;
    if(connected)novaToggle.textContent=remote?.status==='active_ai'?'Nova Black: ONLINE':'Nova Black: LOCKED';
  }
}
async function api(url,options={}){
  const response=await fetch(url,{cache:'no-store',headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status}).`);
  return data;
}
function snapshotForServer(game=readGame()){
  if(!game)throw new Error('Local Tri-D state is unavailable.');
  return{...game,selected:null,legal:[],novaBlack:false};
}
function currentTurnName(game=readGame()){return game?.turn==='b'?'black':'white'}
function winnerName(game=readGame()){
  if(!game?.gameOver)return null;
  if(game.winner==='w')return'white';
  if(game.winner==='b')return'black';
  return'draw';
}
function moveRecord(game=readGame()){
  const move=game?.lastMove||{};
  const mover=game?.turn==='w'?'black':'white';
  const label=move.castle||`${move.piece||'piece'} ${move.from||'?'} → ${move.to||'?'}`;
  return{color:mover,from:move.from||null,to:move.to||null,capture:move.capture||null,castle:move.castle||null,notation:label,at:new Date().toISOString()};
}
function sameState(a,b){
  try{return JSON.stringify({...a,selected:null,legal:[]})===JSON.stringify({...b,selected:null,legal:[]})}catch{return false}
}
function applyRemote(game,{reload=true}={}){
  if(!game)return;
  remote=game;
  const local=readGame();
  const incoming={...(game.state||{}),selected:null,legal:[],novaBlack:false};
  if(incoming?.pieces&&(!local||!sameState(local,incoming))){
    suppressLocal=true;
    writeGame(incoming);
    lastObservedPly=Number(incoming.ply||0);
    if(reload){location.reload();return}
  }
  lastObservedPly=Number((game.state||local)?.ply||0);
  const opponent=session?.color==='white'?(game.blackName||'Awaiting challenger'):(game.whiteName||'White commander');
  setOnline(`${game.code} · ${game.status} · you are ${session?.color||'observer'} · opponent: ${opponent}`);
  updateControls();
}
function canMoveHere(){
  if(!session||!remote||busy)return!session;
  if(!['active','active_ai'].includes(remote.status))return false;
  const game=readGame();
  return remote.currentTurn===session.color&&game?.turn===colorCode();
}
function ensureLocalNovaOff(){
  const game=readGame();
  if(game?.novaBlack&&novaToggle&&!novaToggle.disabled){
    novaToggle.click();
  }else if(game?.novaBlack){game.novaBlack=false;writeGame(game)}
}
function saveCommander(){const name=cleanName(commander?.value);localStorage.setItem('novaChessName',name);return name}

async function createMission(){
  if(busy||session)return;
  busy=true;updateControls();
  try{
    ensureLocalNovaOff();
    if(newGame&&!newGame.disabled)newGame.click();
    ensureLocalNovaOff();
    const game=readGame();
    const name=saveCommander();
    const data=await api('../api/chess?action=create',{method:'POST',body:JSON.stringify({mode:MODE,name,state:snapshotForServer(game)})});
    session={id:data.game.id,code:data.game.code,token:data.token,color:'white',localNovaPreference:true};
    saveSession();remote=data.game;applyRemote(data.game,{reload:false});
    if(panel)panel.open=true;
    if(novaTakeover?.checked){
      const enabled=await api('../api/chess-ai?action=enable',{method:'POST',body:JSON.stringify({id:session.id,token:session.token})});
      remote=enabled.game;applyRemote(enabled.game,{reload:false});
    }
    startPolling();
    setGame('Online mission created. White to move.');
  }catch(error){setOnline(`Create failed: ${error.message}`,true);setGame('Online mission was not created.');session=null;remote=null;saveSession()}
  finally{busy=false;updateControls()}
}
async function joinMission(){
  if(busy||session)return;
  busy=true;updateControls();
  try{
    const code=cleanCode(joinCode?.value);if(!code)throw new Error('Enter a mission code.');
    ensureLocalNovaOff();
    const name=saveCommander();
    const data=await api('../api/chess-ai?action=claim',{method:'POST',body:JSON.stringify({code,name})});
    session={id:data.game.id,code:data.game.code,token:data.token,color:'black',localNovaPreference:true};
    saveSession();remote=data.game;
    applyRemote(data.game,{reload:true});
  }catch(error){setOnline(`Join failed: ${error.message}`,true);session=null;remote=null;saveSession();busy=false;updateControls()}
}
async function sendLocalMove(game,{asAi=false}={}){
  if(!session||!remote)return;
  const payload={
    id:remote.id,token:session.token,revision:Number(remote.revision),mode:MODE,
    state:snapshotForServer(game),move:moveRecord(game),nextTurn:currentTurnName(game),
    gameOver:Boolean(game.gameOver),winner:winnerName(game),...(asAi?{asAi:true}:{})
  };
  const endpoint=remote.status==='active_ai'?'../api/chess-ai?action=move':'../api/chess?action=move';
  const data=await api(endpoint,{method:'POST',body:JSON.stringify(payload)});
  remote=data.game;applyRemote(data.game,{reload:false});
  return data.game;
}
async function commitObservedHumanMove(game){
  if(busy||!session||!remote)return;
  if(remote.currentTurn!==session.color)return;
  const mover=game.turn==='w'?'black':'white';
  if(mover!==session.color)return;
  busy=true;updateControls();
  try{
    const updated=await sendLocalMove(game,{asAi:false});
    setGame(`Move saved. ${updated.currentTurn} to move.`);
    if(updated.status==='active_ai'&&updated.currentTurn==='black'&&session.color==='white')triggerOnlineNova();
  }catch(error){
    setOnline(`Move rejected: ${error.message}`,true);
    await syncNow({forceReload:true});
  }finally{busy=false;updateControls()}
}
function triggerOnlineNova(){
  if(!session||session.color!=='white'||remote?.status!=='active_ai'||remote.currentTurn!=='black')return;
  const game=readGame();if(!game||game.turn!=='b')return;
  setGame('Nova is calculating Black’s Tri-D response…');
  if(novaToggle&&novaToggle.textContent.includes('OFF'))novaToggle.disabled=false,novaToggle.click(),novaToggle.disabled=true;
  else if(novaToggle&&!readGame()?.novaBlack){novaToggle.disabled=false;novaToggle.click();novaToggle.disabled=true}
  watchForAiMove(Number(game.ply||0));
}
function watchForAiMove(startPly){
  clearInterval(localWatch);
  let ticks=0;
  localWatch=setInterval(async()=>{
    ticks++;
    const game=readGame();
    if(game&&Number(game.ply||0)>startPly&&game.turn==='w'){
      clearInterval(localWatch);localWatch=null;
      if(game.novaBlack&&novaToggle){novaToggle.disabled=false;novaToggle.click();novaToggle.disabled=true}
      busy=true;updateControls();
      try{const updated=await sendLocalMove(readGame(),{asAi:true});setGame(`Nova move saved. ${updated.currentTurn} to move.`)}
      catch(error){setOnline(`Nova sync failed: ${error.message}`,true);await syncNow({forceReload:true})}
      finally{busy=false;updateControls()}
    }else if(ticks>60){clearInterval(localWatch);localWatch=null;setOnline('Nova did not complete a move. Sync the mission by reopening the page.',true)}
  },100);
}
async function syncNow({silent=false,forceReload=false}={}){
  if(!session)return;
  try{
    const data=await api(`../api/chess?action=get&id=${encodeURIComponent(session.id)}`,{method:'GET'});
    const changed=!remote||Number(data.game.revision)!==Number(remote.revision)||data.game.status!==remote.status;
    if(forceReload||changed){applyRemote(data.game,{reload:changed||forceReload});if(changed||forceReload)return}
    remote=data.game;applyRemote(data.game,{reload:false});
    if(!silent)setGame(`Mission synchronized. ${remote.currentTurn} to move.`);
    if(remote.status==='active_ai'&&remote.currentTurn==='black'&&session.color==='white')triggerOnlineNova();
  }catch(error){if(!silent)setOnline(`Sync failed: ${error.message}`,true)}
}
function startPolling(){stopPolling();pollTimer=setInterval(()=>void syncNow({silent:true}),4000)}
function stopPolling(){if(pollTimer){clearInterval(pollTimer);pollTimer=null}if(localWatch){clearInterval(localWatch);localWatch=null}}
async function resume(){
  if(!session?.id||!session?.token){session=null;saveSession();return false}
  try{
    const data=await api(`../api/chess?action=get&id=${encodeURIComponent(session.id)}`,{method:'GET'});
    remote=data.game;applyRemote(data.game,{reload:false});panel.open=true;startPolling();
    if(remote.status==='active_ai'&&remote.currentTurn==='black'&&session.color==='white')triggerOnlineNova();
    return true;
  }catch(error){setOnline(`Saved mission unavailable: ${error.message}`,true);session=null;remote=null;saveSession();return false}
}
function leaveMission(){
  stopPolling();session=null;remote=null;saveSession();
  const game=readGame();if(game){game.novaBlack=true;writeGame(game)}
  setOnline('Local mode. Online mission disconnected.');updateControls();location.reload();
}
async function copyInvite(){
  if(!session?.code)return;
  const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('join',session.code);
  try{await navigator.clipboard.writeText(url.href);setOnline(`Invite copied: ${session.code}`)}catch{window.prompt('Copy this invite link:',url.href)}
}
async function health(){
  try{const data=await api('../api/chess?action=health',{method:'GET'});if(!session)setOnline(`${data.service} online · ${data.storage} ready`)}
  catch(error){if(!session)setOnline(`Online missions unavailable; local Tri-D still works. ${error.message}`,true)}
}

document.addEventListener('click',event=>{
  if(!session)return;
  const square=event.target.closest?.('.sq');
  if(square&&!canMoveHere()&&event.isTrusted){event.preventDefault();event.stopImmediatePropagation();setGame(`Online mission: ${remote?.currentTurn||'other commander'} to move.`);return}
  if((event.target===novaToggle||event.target===newGame)&&event.isTrusted){event.preventDefault();event.stopImmediatePropagation();setGame('That control is locked during an online mission.');return}
  if(square&&canMoveHere()&&event.isTrusted){
    const before=Number(readGame()?.ply||0);
    setTimeout(()=>{
      if(suppressLocal){suppressLocal=false;return}
      const game=readGame();const now=Number(game?.ply||0);
      if(now>before&&now>lastObservedPly){lastObservedPly=now;void commitObservedHumanMove(game)}
    },80);
  }
},true);

createBtn.addEventListener('click',()=>void createMission());
joinBtn.addEventListener('click',()=>void joinMission());
copyBtn?.addEventListener('click',()=>void copyInvite());
leaveBtn?.addEventListener('click',leaveMission);
if(commander)commander.value=localStorage.getItem('novaChessName')||'Commander One';
const invite=new URL(location.href).searchParams.get('join');
if(invite&&joinCode){joinCode.value=cleanCode(invite);panel.open=true}
updateControls();
void(async()=>{const resumed=await resume();if(!resumed)void health()})();
window.addEventListener('beforeunload',stopPolling);
})();
