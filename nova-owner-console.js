(()=>{
  if(window.__astralisNovaOwnerConsoleV1)return;
  window.__astralisNovaOwnerConsoleV1=true;
  const root=document.getElementById('novaGuide');if(!root)return;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const getToken=()=>sessionStorage.getItem('astralisNovaOwnerToken')||'';
  const setToken=t=>sessionStorage.setItem('astralisNovaOwnerToken',t);
  const say=(text,emoji='🛠️')=>{const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');if(msg)msg.textContent=text;if(status)status.textContent=text;if(face)face.textContent=emoji;if(mini)mini.textContent=emoji};

  const css=document.createElement('style');css.textContent=`
    .nova-owner-shade{position:fixed;inset:0;background:rgba(3,7,18,.72);backdrop-filter:blur(8px);z-index:99998;display:grid;place-items:center;padding:18px}
    .nova-owner-console{width:min(760px,96vw);max-height:88vh;overflow:auto;background:linear-gradient(180deg,rgba(18,28,52,.98),rgba(8,14,30,.98));border:1px solid rgba(126,210,255,.35);border-radius:22px;box-shadow:0 24px 80px rgba(0,0,0,.55),0 0 40px rgba(70,160,255,.12);padding:20px;color:#edf7ff}
    .nova-owner-head{display:flex;justify-content:space-between;gap:14px;align-items:center;margin-bottom:16px}.nova-owner-head h3{margin:0;font-size:1.35rem}.nova-owner-close{border:0;background:transparent;color:#fff;font-size:1.4rem;cursor:pointer}
    .nova-owner-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:12px 0 18px}.nova-owner-stat{padding:12px;border-radius:14px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.08)}
    .nova-owner-stat strong{display:block;font-size:1.25rem}.nova-owner-form{display:grid;gap:10px}.nova-owner-form input,.nova-owner-form textarea,.nova-owner-form select{width:100%;box-sizing:border-box;background:#091326;color:#fff;border:1px solid rgba(141,210,255,.25);border-radius:12px;padding:11px;font:inherit}.nova-owner-form textarea{min-height:130px;resize:vertical}.nova-owner-form button{padding:11px 14px;border-radius:12px;border:1px solid rgba(145,223,255,.35);background:rgba(70,148,255,.17);color:#fff;font-weight:700;cursor:pointer}.nova-owner-list{margin-top:14px;display:grid;gap:8px}.nova-owner-item{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.04);font-size:.92rem}.nova-owner-note{font-size:.83rem;opacity:.75;margin-top:8px}
  `;document.head.appendChild(css);

  const api=async(path,options={})=>{
    const token=getToken();
    const headers={...(options.headers||{}),'Authorization':`Bearer ${token}`};
    const r=await fetch(path,{...options,headers});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.error||`HTTP ${r.status}`);return data;
  };

  const requestToken=()=>{
    let token=getToken();
    if(token)return true;
    token=prompt('Nova Owner Console\nEnter the ADMIN_TOKEN for this session:')||'';
    if(!clean(token))return false;
    setToken(clean(token));return true;
  };

  const openConsole=async()=>{
    if(!requestToken()){say('Owner console launch cancelled. No token, no bridge access.','🔒');return}
    const shade=document.createElement('div');shade.className='nova-owner-shade';shade.innerHTML=`<section class="nova-owner-console" role="dialog" aria-modal="true" aria-label="Nova Owner Console"><div class="nova-owner-head"><div><h3>🛠 Nova Owner Console</h3><div class="nova-owner-note">Teach Nova and inspect her systems.</div></div><button class="nova-owner-close" aria-label="Close">✕</button></div><div data-owner-body>Connecting to Nova systems…</div></section>`;
    document.body.appendChild(shade);shade.querySelector('.nova-owner-close').onclick=()=>shade.remove();shade.addEventListener('click',e=>{if(e.target===shade)shade.remove()});
    const body=shade.querySelector('[data-owner-body]');
    try{
      const data=await api('/api/nova-admin');
      body.innerHTML=`<div class="nova-owner-grid"><div class="nova-owner-stat"><strong>${data.knowledge||0}</strong>Total knowledge</div><div class="nova-owner-stat"><strong>${data.ownerKnowledge||0}</strong>Owner-added</div><div class="nova-owner-stat"><strong>${data.vectorize?'Online':'Offline'}</strong>Vectorize</div><div class="nova-owner-stat"><strong>${data.workersAI?'Online':'Offline'}</strong>Workers AI</div></div><form class="nova-owner-form"><input name="title" placeholder="Knowledge title" required><select name="category"><option>archive</option><option>music</option><option>wildlife</option><option>family-safe</option><option>technology</option><option>games</option><option>history</option><option>site</option></select><textarea name="text" placeholder="What should Nova know? Keep public facts public-safe." required></textarea><input name="tags" placeholder="Tags, comma separated"><button type="submit">🧠 Teach Nova</button><div data-save-status class="nova-owner-note">Owner-added entries are written to D1 and vectorized when AI + Vectorize are available.</div></form><div class="nova-owner-list" data-latest></div>`;
      const list=body.querySelector('[data-latest]');
      const renderLatest=items=>{list.innerHTML=(items||[]).length?`<strong>Recent owner knowledge</strong>`+(items||[]).map(x=>`<div class="nova-owner-item"><strong>${clean(x.title)}</strong><br><small>${clean(x.category)} • ${clean(x.updated_at||'')}</small></div>`).join(''):'<div class="nova-owner-note">No owner-added knowledge yet.</div>'};renderLatest(data.latest);
      body.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),status=body.querySelector('[data-save-status]');status.textContent='Teaching Nova…';try{const saved=await api('/api/nova-admin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'add',title:f.get('title'),category:f.get('category'),text:f.get('text'),tags:f.get('tags')})});status.textContent=`Saved: ${saved.title}. ${saved.vectorized?'Vector memory updated.':'Stored in D1; vector memory unavailable.'}`;e.currentTarget.reset();const fresh=await api('/api/nova-admin');renderLatest(fresh.latest);say(`Knowledge accepted: ${saved.title}. I will remember that.`,'🧠')}catch(err){status.textContent=`Could not save: ${err.message}`}};
    }catch(err){body.innerHTML=`<p>🔒 ${clean(err.message)}</p><p class="nova-owner-note">If the token was entered incorrectly, close this panel and reopen it after clearing this tab's session storage.</p>`}
  };

  const actions=root.querySelector('.nova-actions');if(actions&&!root.querySelector('[data-nova-owner-console]')){const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaOwnerConsole='true';b.innerHTML='🛠 Owner Console<small>Teach Nova + inspect systems</small>';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openConsole()});actions.appendChild(b)}
  window.AstralisNovaOwner={open:openConsole};
})();
