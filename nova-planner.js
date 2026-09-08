(()=>{
  if(window.__astralisNovaPlannerV1)return;
  window.__astralisNovaPlannerV1=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const PLAN_KEY='astralisNovaActivePlanV1';
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const read=()=>{try{return JSON.parse(sessionStorage.getItem(PLAN_KEY)||'null')}catch{return null}};
  const write=p=>{try{sessionStorage.setItem(PLAN_KEY,JSON.stringify(p))}catch{}};
  const clear=()=>{try{sessionStorage.removeItem(PLAN_KEY)}catch{}};
  const say=(text,emoji='🧭')=>{
    const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
    if(msg)msg.textContent=text;if(status)status.textContent=text;if(face)face.textContent=emoji;if(mini)mini.textContent=emoji;
    if(localStorage.getItem('astralisNovaMuted')!=='true'&&'speechSynthesis'in window){const u=new SpeechSynthesisUtterance(text);speechSynthesis.cancel();speechSynthesis.speak(u)}
  };
  const siteLinks=()=>window.AstralisNovaDomain?.links?.()||[...document.querySelectorAll('a[href]')].map(a=>{try{const u=new URL(a.href,location.href);if(u.origin!==location.origin)return null;return{href:u.pathname+u.search+u.hash,label:clean(a.textContent||a.getAttribute('aria-label')||u.pathname)}}catch{return null}}).filter(Boolean);
  const pageContext=()=>clean(`${document.title} ${location.pathname} ${(document.querySelector('main')||document.body)?.innerText||''}`).slice(0,5000);
  const mediaAction=operation=>{
    const audio=[...document.querySelectorAll('audio')];
    if(audio.length){if(operation==='play'){audio[0].play?.().catch(()=>{})}else audio.forEach(a=>a.pause?.());return true}
    const rx=operation==='play'?/\bplay\b/i:/\bpause\b/i;
    const control=[...document.querySelectorAll('button,[role="button"]')].find(el=>rx.test(`${el.textContent||''} ${el.getAttribute('aria-label')||''}`));
    if(control){control.click();return true}return false;
  };
  const executeNext=async()=>{
    const state=read();if(!state?.active||!Array.isArray(state.steps))return false;
    if(state.index>=state.steps.length){say(`Goal complete: ${state.goal}`,'✨');clear();window.AstralisNovaLeveling?.award?.('goal_complete');return true}
    const step=state.steps[state.index];state.index+=1;write(state);
    if(step.type==='navigate'&&step.href){say(`Step ${state.index} of ${state.steps.length}: ${step.label||'changing course'}.`,'🧭');setTimeout(()=>{location.href=step.href},850);return true}
    if(step.type==='ask'&&step.prompt){say(`Step ${state.index} of ${state.steps.length}: consulting the Deep Archive.`,'🧠');await window.AstralisNovaAsk?.(step.prompt);setTimeout(executeNext,1600);return true}
    if(step.type==='tour'){say(`Step ${state.index} of ${state.steps.length}: autonomous tour engaged.`,'🌌');window.AstralisNovaAutonomy?.startTour?.();return true}
    if(step.type==='media'){const ok=mediaAction(step.operation);say(ok?`${step.operation==='play'?'Playback':'Pause'} command executed.`:`I could not find a ${step.operation} control on this page.`,'🎧');setTimeout(executeNext,1100);return true}
    setTimeout(executeNext,300);return true;
  };
  const planGoal=async goal=>{
    goal=clean(goal);if(!goal)return false;
    say('Goal received. Plotting a multi-step course…','🧠');
    try{
      const r=await fetch('/api/nova-plan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goal,pageContext:pageContext(),availableLinks:siteLinks().slice(0,100)})});
      const data=await r.json();if(!r.ok)throw new Error(data?.error||`HTTP ${r.status}`);
      const steps=data?.plan?.steps||[];if(!steps.length)throw new Error('No usable steps');
      const state={active:true,goal,summary:clean(data.plan.summary),steps,index:0,startedAt:Date.now()};write(state);
      say(`${state.summary} ${steps.length} step${steps.length===1?'':'s'} ready.`,'🗺️');
      window.AstralisNovaLeveling?.award?.('goal_planned');setTimeout(executeNext,1100);return true;
    }catch(error){console.error('Nova planner failed',error);say('I could not build that route, so I will answer it directly instead.','🛰️');return window.AstralisNovaAsk?.(goal)||false}
  };
  const stop=()=>{clear();say('Goal mode cancelled. I have released the active plan.','🫡')};
  const addControl=()=>{
    const actions=root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-nova-planner]'))return;
    const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaPlanner='true';b.innerHTML='🗺️ Goal Mode<small>Give me an objective, I plan the route</small>';
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const goal=prompt('What should Nova accomplish?');if(goal)planGoal(goal)});actions.appendChild(b);
  };
  addControl();
  const pending=read();
  if(pending?.active){setTimeout(()=>{const panel=root.querySelector('#novaPanel');if(panel){panel.classList.add('open');panel.setAttribute('aria-hidden','false')}say(`Continuing goal: ${pending.goal}`,'🧭');setTimeout(executeNext,900)},700)}
  window.AstralisNovaPlanner={plan:planGoal,next:executeNext,stop,state:read};
})();
