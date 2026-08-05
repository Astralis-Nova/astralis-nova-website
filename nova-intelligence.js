(()=>{
  if(window.__astralisNovaIntelligence)return;
  window.__astralisNovaIntelligence=true;
  const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
  const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  const clean=s=>(s||'').replace(/\s+/g,' ').trim();
  const normal=s=>clean(s).toLowerCase().replace(/[^a-z0-9 ]/g,'');
  const root=document.getElementById('novaGuide');
  if(!root)return;
  const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),input=root.querySelector('#novaCommand');
  const face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini'),left=root.querySelector('#novaLeft'),right=root.querySelector('#novaRight');
  const panel=root.querySelector('#novaPanel');
  const speak=text=>{if(get('astralisNovaMuted')==='true'||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);u.rate=.88;u.pitch=.86;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>/^en-GB/i.test(v.lang)&&/sonia|libby|hazel|serena|kate|fiona|moira|martha|natural/i.test(v.name))||voices.find(v=>/^en-GB/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));speechSynthesis.cancel();speechSynthesis.speak(u)};
  const emote=(f='🫡',h='🖖')=>{if(face)face.textContent=f;if(mini)mini.textContent=f;if(left)left.textContent=h;if(right)right.textContent=h};
  const say=(text,voice=true)=>{if(msg)msg.textContent=text;if(voice)speak(text)};
  const log=text=>{let items=[];try{items=JSON.parse(get('astralisNovaMissionLog')||'[]')}catch{}items.push({text,time:Date.now(),page:location.pathname});set('astralisNovaMissionLog',JSON.stringify(items.slice(-40)))};
  const saveBeacon=()=>set('astralisNovaReturnBeacon',JSON.stringify({url:location.href,scrollY:window.scrollY,title:document.title,time:Date.now()}));
  const closeExperiences=()=>{speechSynthesis?.cancel();document.querySelectorAll('audio,video').forEach(m=>{if(!m.paused)m.pause()});document.getElementById('darktidePanel')?.classList.remove('open');document.querySelectorAll('[role="dialog"].open,.modal.open,.overlay.open').forEach(e=>e.classList.remove('open'));document.body.style.overflow='';document.documentElement.style.overflow='';panel?.classList.remove('open')};

  const scan=()=>{
    const map=[];const seen=new Set();
    const add=(label,el,type='section')=>{label=clean(label);if(label.length<2||label.length>90)return;const key=normal(label);if(!key||seen.has(key))return;seen.add(key);let target='';if(el.id)target=`#${CSS.escape(el.id)}`;else if(el.closest('a[href]'))target=el.closest('a[href]').getAttribute('href')||'';map.push({label,target,type,path:location.pathname})};
    document.querySelectorAll('h1,h2,h3,[aria-label],nav a,a[href],button').forEach(el=>{if(el.closest('#novaGuide'))return;const label=el.getAttribute('aria-label')||el.textContent;add(label,el,el.matches('a')?'link':el.matches('button')?'button':'section')});
    document.querySelectorAll('.song h4,.feature-copy h4,.quote-credit,.relic-link-card strong').forEach(el=>add(el.textContent,el,'content'));
    set('astralisNovaSiteMap',JSON.stringify(map.slice(0,180)));log(`Scanned ${map.length} page signals on ${document.title}.`);return map;
  };
  const siteMap=()=>{let saved=[];try{saved=JSON.parse(get('astralisNovaSiteMap')||'[]')}catch{}return [...scan(),...saved].filter((x,i,a)=>a.findIndex(y=>normal(y.label)===normal(x.label)&&y.path===x.path)===i)};
  const score=(query,label)=>{query=normal(query);label=normal(label);if(!query||!label)return 0;if(label===query)return 100;if(label.includes(query))return 80;if(query.includes(label)&&label.length>3)return 65;const words=query.split(' ').filter(x=>x.length>2);return words.reduce((n,w)=>n+(label.includes(w)?12:0),0)};
  const findLive=item=>{if(item.target?.startsWith('#')){try{return document.querySelector(item.target)}catch{}}return [...document.querySelectorAll('h1,h2,h3,a,button,[aria-label],.song h4,.feature-copy h4')].find(el=>normal(el.getAttribute('aria-label')||el.textContent)===normal(item.label));};
  const go=item=>{saveBeacon();closeExperiences();set('astralisNovaLastDestination',item.label);log(`Navigated to ${item.label}.`);emote('🫡','👉');setTimeout(()=>{if(item.path&&item.path!==location.pathname){const url=new URL(item.path,location.origin);url.searchParams.set('novaFind',item.label);location.assign(url.href);return}if(item.target&&/^(https?:|\/|\.\/)/.test(item.target)&&!item.target.startsWith('#')){location.assign(item.target);return}const el=findLive(item);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('nova-pulse-target');setTimeout(()=>el.classList.remove('nova-pulse-target'),4000)}else{location.assign(`/?novaFind=${encodeURIComponent(item.label)}`)}},90)};
  const findAndGo=query=>{const ranked=siteMap().map(item=>({item,score:score(query,item.label)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);if(!ranked.length)return false;const best=ranked[0].item;say(`Engaging, Captain. I found ${best.label}.`,true);go(best);return true};
  const returnBeacon=()=>{let b;try{b=JSON.parse(get('astralisNovaReturnBeacon')||'null')}catch{}if(!b?.url){say('No return beacon has been recorded yet.');return}say('Engaging, Captain. Returning to your previous position.');closeExperiences();setTimeout(()=>location.assign(b.url),100)};
  const handle=text=>{const q=normal(text);if(!q)return false;if(/^(engage|engage nova|make it so)$/.test(q)){emote('🫡','🖖');say('Engaging, Captain. All navigation and scanning systems are online.');log('Captain issued Engage command.');return true}if(/scan (the )?page|map (the )?page|what is on this page|discover page/.test(q)){const map=scan();emote('🔎','👉');say(`Engaging, Captain. I scanned this page and mapped ${map.length} usable signals.`);status.textContent=`Page map saved locally. Review it in Nova Chamber.`;return true}if(/nova chamber|your chamber|your world|memory constellation/.test(q)){saveBeacon();say('Engaging, Captain. Opening Nova Chamber.');closeExperiences();setTimeout(()=>location.assign('/nova-chamber.html'),100);return true}if(/return beacon|where was i|return to previous|go back to previous|resume my tour/.test(q)){returnBeacon();return true}if(/what did you find|show discoveries|site map/.test(q)){const map=scan();say(`I currently recognize ${map.length} signals on this page. Open Nova Chamber to inspect the constellation.`);return true}if(/find |show |open |take me to |go to /.test(q)){const query=q.replace(/^(please )?(find|show|open|take me to|go to) /,'');return findAndGo(query)}return false};

  const addControls=()=>{const actions=root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-intel-action]'))return;const buttons=[['scan','🔎 Scan This Page','Build a live destination map'],['chamber','🌌 Nova Chamber','Open Nova’s evolving world'],['return','↩ Return Beacon','Go back to the previous position']];buttons.forEach(([key,title,small])=>{const b=document.createElement('button');b.className='nova-action';b.type='button';b.dataset.intelAction=key;b.innerHTML=`${title}<small>${small}</small>`;actions.appendChild(b)});};
  addControls();
  root.addEventListener('click',e=>{const key=e.target.closest('[data-intel-action]')?.dataset.intelAction;if(!key)return;e.preventDefault();e.stopPropagation();if(key==='scan')handle('scan page');if(key==='chamber')handle('nova chamber');if(key==='return')handle('return beacon')},true);
  root.querySelector('#novaSend')?.addEventListener('click',e=>{const text=input?.value||'';if(handle(text)){e.preventDefault();e.stopImmediatePropagation();if(input)input.value=''}},true);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&handle(input.value)){e.preventDefault();e.stopImmediatePropagation();input.value=''}},true);

  const requested=new URLSearchParams(location.search).get('novaFind');if(requested)setTimeout(()=>{scan();const match=siteMap().map(item=>({item,score:score(requested,item.label)})).sort((a,b)=>b.score-a.score)[0];if(match?.score>0){const el=findLive(match.item);if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('nova-pulse-target');setTimeout(()=>el.classList.remove('nova-pulse-target'),4000)}history.replaceState(null,'',location.pathname)}},1400);
  setTimeout(scan,1800);
})();