(()=>{
  if(window.__astralisNovaLevelingV1)return;
  window.__astralisNovaLevelingV1=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const KEY='astralisNovaXpSessionV1';
  const once=(name,ms=90000)=>{try{const data=JSON.parse(sessionStorage.getItem(KEY)||'{}'),now=Date.now();if(now-(data[name]||0)<ms)return false;data[name]=now;sessionStorage.setItem(KEY,JSON.stringify(data));return true}catch{return true}};
  const post=(type,label='')=>fetch('/api/nova-xp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,label:clean(label).slice(0,120)})}).then(r=>r.ok?r.json():null).then(x=>{if(x)render(x);return x}).catch(()=>null);
  const get=()=>fetch('/api/nova-xp',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(x=>{if(x)render(x);return x}).catch(()=>null);
  const bar=n=>`${Math.round((Number(n)||0)*100)}%`;
  const render=data=>{
    let card=root.querySelector('[data-nova-level-card]');
    if(!card){card=document.createElement('div');card.dataset.novaLevelCard='true';card.style.cssText='margin:10px 0;padding:10px 12px;border:1px solid rgba(140,210,255,.24);border-radius:14px;background:rgba(7,18,34,.56);font-size:.86rem;line-height:1.35';const body=root.querySelector('.nova-body')||root;body.appendChild(card)}
    const top=(data.skills||[])[0];
    card.innerHTML=`<strong>🌟 Nova • Level ${data.level} ${clean(data.rank)}</strong><div style="margin-top:6px;height:7px;border-radius:999px;background:rgba(255,255,255,.1);overflow:hidden"><span style="display:block;height:100%;width:${bar(data.levelProgress)};background:currentColor;opacity:.8"></span></div><small style="display:block;margin-top:5px;opacity:.82">${Number(data.totalXp||0).toLocaleString()} XP • ${Number(data.encounters||0).toLocaleString()} encounters${top?` • Strongest skill: ${clean(top.skill)}`:''}</small>`;
    document.documentElement.dataset.novaLevel=String(data.level||1);document.documentElement.dataset.novaRank=clean(data.rank);
  };
  const classify=txt=>{const q=clean(txt).toLowerCase();if(/music|song|audio|player|midi|darktide/.test(q))return'music';if(/wild|snake|coyote|animal|tortoise|cactus|chicken/.test(q))return'wildlife';if(/chess|game|asheron|ac world/.test(q))return'games';if(/archive|history|river|poem|orbit/.test(q))return'archive';return'conversation'};
  const awardQuestion=q=>{const skill=classify(q);if(once(`q:${skill}`,45000))post(skill==='conversation'?'conversation':skill,q)};
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('a[href]');if(link&&once('navigation',30000))post('navigation',link.textContent||link.getAttribute('aria-label')||'internal link');
    const tour=e.target.closest?.('[data-nova-autonomy]');if(tour&&/Nova Tour/i.test(tour.textContent)&&once('tour',120000))post('tour','Nova Tour');
    const joke=e.target.closest?.('[data-nova-spark]');if(joke){const t=joke.textContent||'';if(/joke/i.test(t)&&once('joke',30000))post('joke',t);else if(/riddle/i.test(t)&&once('riddle',30000))post('riddle',t)}
  },true);
  const original=window.AstralisNovaAsk;
  let tries=0;
  const hook=()=>{if(typeof window.AstralisNovaAsk!=='function'){if(tries++<40)setTimeout(hook,250);return}if(window.AstralisNovaAsk.__xpWrapped)return;const fn=window.AstralisNovaAsk;const wrapped=function(q){awardQuestion(q);return fn.apply(this,arguments)};wrapped.__xpWrapped=true;window.AstralisNovaAsk=wrapped};hook();
  if(once('returning',6*60*60*1000)){try{const p=window.AstralisNovaAutonomy?.profile?.();if((p?.visits||0)>2)post('returning_visitor',document.title)}catch{}}
  get();
  window.AstralisNovaLeveling={get,award:post};
})();
