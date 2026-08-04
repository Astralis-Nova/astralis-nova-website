const upstreamFetch=window.fetch.bind(window);
let lastCommand=null;

window.fetch=async function repairedChessFetch(input,init={}){
  const url=requestUrl(input);
  const parsed=new URL(url,location.href);
  const isChessMove=/\/api\/chess(?:\?|$)/.test(parsed.pathname+parsed.search)&&parsed.searchParams.get('action')==='move';
  if(!isChessMove)return upstreamFetch(input,init);

  const body=parseBody(init.body);
  const novaGame=isNovaGame();
  showMoveState(novaGame?'Sending move through the Nova AI bridge…':'Sending move to the mission archive…','busy');

  if(novaGame){
    const aiUrl=new URL('../api/chess-ai',location.href);
    aiUrl.searchParams.set('action','move');
    const response=await upstreamFetch(aiUrl,{...init,method:'POST'});
    const data=await response.clone().json().catch(()=>({}));
    if(!response.ok){
      showMoveState(data.error||`Move rejected (${response.status}).`,'error');
      return jsonResponse(response,data);
    }
    if(data?.game){
      const publicData=clone(data);
      publicData.game.status='active';
      publicData.game.blackName='Nova AI';
      const notation=body?.move?.notation||lastCommand||'Move';
      showMoveState(`${notation} accepted. Nova is preparing Black's reply.`,'success');
      setTimeout(()=>document.getElementById('refreshButton')?.click(),120);
      return jsonResponse(response,publicData);
    }
    return response;
  }

  const response=await upstreamFetch(input,init);
  const data=await response.clone().json().catch(()=>({}));
  showMoveState(response.ok?'Move accepted by the mission archive.':data.error||`Move rejected (${response.status}).`,response.ok?'success':'error');
  return response;
};

document.addEventListener('click',event=>{
  const moveButton=event.target.closest?.('.move-choice-button[data-square]');
  const legalSquare=event.target.closest?.('.square.legal,.square.capture');
  if(moveButton){
    lastCommand=`${selectedSquare()} to ${String(moveButton.dataset.square||'').toUpperCase()}`;
    showMoveState(`Command received: ${lastCommand}.`,'busy');
  }else if(legalSquare){
    lastCommand=`${selectedSquare()} to ${String(legalSquare.dataset.square||'').toUpperCase()}`;
    showMoveState(`Destination tapped: ${lastCommand}.`,'busy');
  }
},true);

window.addEventListener('error',event=>{
  if(event?.message)showMoveState(`Board error: ${event.message}`,'error');
});
window.addEventListener('unhandledrejection',event=>{
  const message=event?.reason?.message||String(event?.reason||'Unknown board error');
  showMoveState(`Board error: ${message}`,'error');
});

function isNovaGame(){
  const blackName=document.getElementById('blackPlayerName')?.textContent||'';
  const blackStatus=document.getElementById('blackPlayerStatus')?.textContent||'';
  return /nova ai/i.test(blackName)||/ai turn|seat open/i.test(blackStatus);
}
function selectedSquare(){return document.querySelector('.square.selected')?.dataset.square?.toUpperCase()||'selected piece'}
function showMoveState(message,type=''){
  const status=document.getElementById('moveChoiceStatus');
  if(status){
    status.textContent=message;
    status.dataset.state=type;
  }
  const detail=document.getElementById('connectionDetail');
  if(detail&&type==='error')detail.textContent=message;
  const panel=document.getElementById('novaMessage');
  if(panel)panel.innerHTML=`<span class="nova-avatar">N</span><p><strong>Nova:</strong> ${escapeHtml(message)}</p>`;
}
function requestUrl(input){return typeof input==='string'?input:input instanceof URL?input.href:input?.url||''}
function parseBody(body){if(!body)return null;if(typeof body==='string'){try{return JSON.parse(body)}catch{return null}}return null}
function clone(value){try{return JSON.parse(JSON.stringify(value))}catch{return value}}
function jsonResponse(response,data){const headers=new Headers(response.headers);headers.set('Content-Type','application/json; charset=utf-8');headers.delete('Content-Length');return new Response(JSON.stringify(data),{status:response.status,statusText:response.statusText,headers})}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
