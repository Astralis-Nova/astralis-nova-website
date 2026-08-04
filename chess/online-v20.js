const SESSION_KEY='novaChessOnlineV20';
const MODE='trideck';

const core=window.NovaChessCore;
if(!core)throw new Error('Clean chess core did not initialize.');

const onlineReadout=document.getElementById('onlineReadout');
const commanderName=document.getElementById('commanderName');
const joinCode=document.getElementById('joinCode');
const novaTakeover=document.getElementById('novaTakeover');
const createButton=document.getElementById('createOnline');
const joinButton=document.getElementById('joinOnline');
const copyButton=document.getElementById('copyInvite');
const syncButton=document.getElementById('syncOnline');
const leaveButton=document.getElementById('leaveOnline');
const newLocalButton=document.getElementById('newLocal');

let session=readSession();
let onlineGame=null;
let networkBusy=false;
let pollTimer=null;
let aiTimer=null;

function setOnline(message,type=''){
  onlineReadout.textContent=message;
  onlineReadout.className=`readout ${type}`.trim();
}

function readSession(){
  try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}
  catch{return null}
}

function saveSession(){
  if(session)localStorage.setItem(SESSION_KEY,JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function turnName(){return core.game.turn()==='w'?'white':'black'}

function configureOnline(){
  core.setOnlineMode(Boolean(session));
  if(!session){
    core.onHumanMove=null;
    core.canHumanMove=null;
    return;
  }
  core.onHumanMove=commitOnlineMove;
  core.canHumanMove=()=>{
    if(networkBusy||core.busy||!onlineGame)return false;
    if(!['active','active_ai'].includes(onlineGame.status))return false;
    return session.color===turnName();
  };
}

function updateControls(){
  const connected=Boolean(session&&onlineGame);
  createButton.disabled=networkBusy||connected;
  joinButton.disabled=networkBusy||connected;
  copyButton.disabled=!connected;
  syncButton.disabled=!connected||networkBusy;
  leaveButton.disabled=!connected;
}

function moveRecord(made){
  return{
    color:made.color==='w'?'white':'black',
    from:made.from,
    to:made.to,
    fromBoard:core.boardFor(made.from),
    toBoard:core.boardFor(made.to),
    piece:made.piece,
    captured:made.captured||null,
    promotion:made.promotion||null,
    notation:made.san,
    at:new Date().toISOString()
  };
}

async function commitOnlineMove(made,previous){
  if(!session||!onlineGame){
    core.rollback(previous);
    core.setStatus('Online session disappeared. Move restored locally.','bad');
    return;
  }

  networkBusy=true;
  core.setBusy(true);
  core.setStatus(`Sending ${made.san} to the mission archive…`,'busy');
  updateControls();

  try{
    const data=await sendMove(made,false);
    applyServerGame(data.game);
    if(onlineGame.status==='active_ai'&&onlineGame.currentTurn==='black'&&session.color==='white'){
      core.setStatus(`${made.san} saved. Nova is preparing Black’s response.`,'good');
      clearTimeout(aiTimer);
      aiTimer=setTimeout(()=>void makeOnlineAiMove(),650);
    }else{
      core.setStatus(`Move saved. Waiting for ${onlineGame.currentTurn}.`,'good');
    }
  }catch(error){
    core.rollback(previous);
    core.setStatus(`Online move rejected: ${error.message}`,'bad');
    await syncOnline(true);
  }finally{
    networkBusy=false;
    core.setBusy(false);
    updateControls();
  }
}

async function sendMove(made,asAi){
  if(!session||!onlineGame)throw new Error('Online session is missing.');
  const payload={
    id:onlineGame.id,
    token:session.token,
    revision:Number(onlineGame.revision),
    mode:MODE,
    state:core.snapshot(),
    move:moveRecord(made),
    nextTurn:turnName(),
    gameOver:core.game.isGameOver(),
    winner:core.winner()
  };

  let endpoint='../api/chess?action=move';
  if(onlineGame.status==='active_ai'){
    endpoint='../api/chess-ai?action=move';
    if(asAi)payload.asAi=true;
  }

  return api(endpoint,{method:'POST',body:JSON.stringify(payload)});
}

async function makeOnlineAiMove(){
  if(networkBusy||core.busy)return;
  if(!session||session.color!=='white'||onlineGame?.status!=='active_ai'||onlineGame.currentTurn!=='black')return;

  networkBusy=true;
  core.setBusy(true);
  core.setStatus('Nova is calculating the online Black response…','busy');
  const previous={pgn:core.game.pgn(),lastMove:core.lastMove};
  const made=core.applyAiMove();

  if(!made){
    networkBusy=false;
    core.setBusy(false);
    return;
  }

  try{
    const data=await sendMove(made,true);
    applyServerGame(data.game);
    core.setStatus(`Nova played ${made.san}. White to move.`,'good');
  }catch(error){
    core.rollback(previous);
    if(/claimed|no longer|changed/i.test(error.message)){
      core.setStatus('A human challenger took command of Black. Synchronizing…','good');
    }else{
      core.setStatus(`Nova online move paused: ${error.message}`,'bad');
    }
    await syncOnline(true);
  }finally{
    networkBusy=false;
    core.setBusy(false);
    updateControls();
  }
}

function applyServerGame(serverGame){
  if(!serverGame)return;
  onlineGame=serverGame;
  core.setOnlineMode(true);
  core.loadState(serverGame.state||{});
  joinCode.value=serverGame.code||joinCode.value;
  const opponent=session?.color==='white'
    ?serverGame.blackName||'Awaiting challenger'
    :serverGame.whiteName||'White commander';
  setOnline(`${serverGame.code} · ${serverGame.status} · you are ${session?.color||'observer'} · opponent: ${opponent}`,'good');
  saveSession();
  configureOnline();
  updateControls();
}

async function activateNovaForWaitingMission(){
  if(!session||session.color!=='white'||onlineGame?.status!=='waiting'||!novaTakeover.checked)return false;
  try{
    const data=await api('../api/chess-ai?action=enable',{
      method:'POST',
      body:JSON.stringify({id:session.id,token:session.token})
    });
    applyServerGame(data.game);
    core.setStatus('Nova activated as Black. White to move.','good');
    return true;
  }catch(error){
    setOnline(`${onlineGame.code} created and waiting · Nova activation failed: ${error.message}`,'bad');
    core.setStatus('Mission exists, but Nova could not take Black yet. A human may still join with the code.','bad');
    return false;
  }
}

async function createOnline(){
  if(networkBusy||session)return;
  networkBusy=true;
  core.setBusy(true);
  updateControls();

  try{
    const name=cleanName(commanderName.value);
    localStorage.setItem('novaChessName',name);
    core.resetLocal();

    const data=await api('../api/chess?action=create',{
      method:'POST',
      body:JSON.stringify({mode:MODE,name,state:core.snapshot()})
    });

    session={id:data.game.id,code:data.game.code,token:data.token,color:'white'};
    onlineGame=data.game;
    saveSession();
    applyServerGame(onlineGame);
    startPolling();

    const activated=await activateNovaForWaitingMission();
    if(!activated&&onlineGame.status==='waiting'){
      core.setStatus('Mission created. Waiting for a human challenger.','good');
    }else if(onlineGame.status==='active_ai'){
      core.setStatus('Online mission created. White to move against Nova.','good');
    }
  }catch(error){
    setOnline(`Create failed before a mission code was issued: ${error.message}`,'bad');
    core.setStatus(`Online mission was not created: ${error.message}`,'bad');
  }finally{
    networkBusy=false;
    core.setBusy(false);
    updateControls();
  }
}

async function joinOnline(){
  if(networkBusy||session)return;
  networkBusy=true;
  core.setBusy(true);
  updateControls();

  try{
    const code=normalizeCode(joinCode.value);
    const name=cleanName(commanderName.value);
    localStorage.setItem('novaChessName',name);

    const data=await api('../api/chess-ai?action=claim',{
      method:'POST',
      body:JSON.stringify({code,name})
    });

    session={id:data.game.id,code:data.game.code,token:data.token,color:'black'};
    saveSession();
    applyServerGame(data.game);
    startPolling();
    core.setStatus(
      data.replacedAi
        ?'You replaced Nova and now command Black.'
        :'Joined as Black commander.',
      'good'
    );
  }catch(error){
    setOnline(`Join failed: ${error.message}`,'bad');
    core.setStatus(`Could not join mission: ${error.message}`,'bad');
  }finally{
    networkBusy=false;
    core.setBusy(false);
    updateControls();
  }
}

async function syncOnline(silent=false){
  if(!session)return;
  try{
    const data=await api(`../api/chess?action=get&id=${encodeURIComponent(session.id)}`,{method:'GET'});
    const changed=!onlineGame
      ||Number(data.game.revision)!==Number(onlineGame.revision)
      ||data.game.status!==onlineGame.status;
    applyServerGame(data.game);

    if(data.game.status==='waiting'&&session.color==='white'&&novaTakeover.checked){
      await activateNovaForWaitingMission();
    }

    if(changed&&!silent){
      core.setStatus(`Mission synchronized. ${onlineGame.currentTurn} to move.`,'good');
    }

    if(
      onlineGame.status==='active_ai'
      &&onlineGame.currentTurn==='black'
      &&session.color==='white'
      &&!networkBusy
      &&!core.busy
    ){
      clearTimeout(aiTimer);
      aiTimer=setTimeout(()=>void makeOnlineAiMove(),450);
    }
  }catch(error){
    if(!silent)setOnline(`Sync failed: ${error.message}`,'bad');
  }
}

function startPolling(){
  stopPolling();
  pollTimer=setInterval(()=>void syncOnline(true),4000);
}

function stopPolling(){
  if(pollTimer){clearInterval(pollTimer);pollTimer=null}
  clearTimeout(aiTimer);
}

async function resumeOnline(){
  if(!session?.id||!session?.token){
    session=null;
    saveSession();
    return false;
  }

  try{
    const data=await api(`../api/chess?action=get&id=${encodeURIComponent(session.id)}`,{method:'GET'});
    applyServerGame(data.game);
    startPolling();

    if(data.game.status==='waiting'&&session.color==='white'&&novaTakeover.checked){
      await activateNovaForWaitingMission();
    }

    core.setStatus(`Online mission restored. ${onlineGame.currentTurn} to move.`,'good');
    if(onlineGame.status==='active_ai'&&onlineGame.currentTurn==='black'&&session.color==='white'){
      aiTimer=setTimeout(()=>void makeOnlineAiMove(),500);
    }
    return true;
  }catch(error){
    setOnline(`Saved online mission unavailable: ${error.message}`,'bad');
    session=null;
    onlineGame=null;
    saveSession();
    configureOnline();
    return false;
  }
}

function leaveOnline(){
  stopPolling();
  session=null;
  onlineGame=null;
  saveSession();
  configureOnline();
  core.resetLocal();
  setOnline('Local mode. D1 session disconnected.','');
  updateControls();
}

async function checkHealth(){
  try{
    const data=await api('../api/chess?action=health',{method:'GET'});
    if(!session)setOnline(`${data.service} online · ${data.storage} ready`,'good');
  }catch(error){
    if(!session)setOnline(`D1 unavailable; local play still works. ${error.message}`,'bad');
  }
}

async function copyInvite(){
  if(!session?.code)return;
  const url=new URL(location.href);
  url.search='';
  url.searchParams.set('join',session.code);
  try{
    await navigator.clipboard.writeText(url.href);
    setOnline(`Invite copied: ${session.code}`,'good');
  }catch{window.prompt('Copy this invite link:',url.href)}
}

function cleanName(value){
  return String(value||'Commander').trim().replace(/[<>]/g,'').slice(0,32)||'Commander';
}

function normalizeCode(value){
  return String(value||'').trim().toUpperCase().replace(/[^A-Z0-9-]/g,'').slice(0,12);
}

async function api(url,options={}){
  const response=await fetch(url,{
    cache:'no-store',
    headers:{'Content-Type':'application/json',...(options.headers||{})},
    ...options
  });
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.error||`Request failed (${response.status}).`);
  return data;
}

newLocalButton.addEventListener('click',leaveOnline);
createButton.addEventListener('click',()=>void createOnline());
joinButton.addEventListener('click',()=>void joinOnline());
copyButton.addEventListener('click',()=>void copyInvite());
syncButton.addEventListener('click',()=>void syncOnline(false));
leaveButton.addEventListener('click',leaveOnline);

commanderName.value=localStorage.getItem('novaChessName')||'Commander One';
const inviteCode=new URL(location.href).searchParams.get('join');
if(inviteCode)joinCode.value=normalizeCode(inviteCode);

configureOnline();
updateControls();
const resumed=await resumeOnline();
if(!resumed)configureOnline();
void checkHealth();

window.addEventListener('beforeunload',stopPolling);
