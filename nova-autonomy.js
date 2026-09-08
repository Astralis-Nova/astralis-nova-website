(()=>{
  if(window.__astralisNovaAutonomyV1)return;
  window.__astralisNovaAutonomyV1=true;

  const root=document.getElementById('novaGuide');
  if(!root)return;
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const read=(store,key,fallback)=>{try{const raw=store.getItem(key);return raw==null?fallback:JSON.parse(raw)}catch{return fallback}};
  const write=(store,key,value)=>{try{store.setItem(key,JSON.stringify(value))}catch{}};
  const PROFILE_KEY='astralisNovaVisitorProfileV1';
  const TOUR_KEY='astralisNovaTourV1';
  const EVENT_KEY='astralisNovaRecentEventV1';

  const classify=(text='')=>{
    const q=text.toLowerCase();
    if(/music|song|player|audio|darktide|midi/.test(q))return'music';
    if(/chess|game|ac-world|asheron/.test(q))return'games';
    if(/wild|snake|coyote|tortoise|chicken|animal|cactus/.test(q))return'wildlife';
    if(/archive|orbit|river|poem|memory|history/.test(q))return'archive';
    if(/guestbook|contact|community/.test(q))return'community';
    return'explore';
  };

  const loadProfile=()=>read(localStorage,PROFILE_KEY,{visits:0,pages:{},interests:{},lastPath:'',lastTitle:'',lastSeen:0});
  const saveProfile=p=>write(localStorage,PROFILE_KEY,p);
  const profile=loadProfile();
  const pageKey=location.pathname+location.search;
  profile.visits=(profile.visits||0)+1;
  profile.pages[pageKey]=(profile.pages[pageKey]||0)+1;
  const pageInterest=classify(`${location.pathname} ${document.title}`);
  profile.interests[pageInterest]=(profile.interests[pageInterest]||0)+1;
  profile.lastPath=pageKey;profile.lastTitle=document.title;profile.lastSeen=Date.now();
  saveProfile(profile);

  const rememberEvent=(type,label)=>{
    const evt={type,label:clean(label).slice(0,120),path:location.pathname,at:Date.now()};
    write(localStorage,EVENT_KEY,evt);
    const p=loadProfile();const interest=classify(`${type} ${label}`);p.interests[interest]=(p.interests[interest]||0)+1;saveProfile(p);
  };

  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]');
    if(link){try{const u=new URL(link.href,location.href);if(u.origin===location.origin)rememberEvent('visited',link.textContent||link.getAttribute('aria-label')||u.pathname)}catch{}}
    const play=event.target.closest?.('.play,[aria-label*="play" i],button[data-song-index]');
    if(play)rememberEvent('played',play.getAttribute('aria-label')||play.textContent||'music');
  },true);

  const topInterests=()=>Object.entries(loadProfile().interests||{}).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
  const context=()=>{
    const p=loadProfile(),evt=read(localStorage,EVENT_KEY,null);
    return clean(`Device-local visitor memory: ${p.visits||0} page visits. Frequent interests: ${topInterests().join(', ')||'still learning'}. Last page: ${p.lastTitle||'unknown'}. ${evt?`Recent site event: ${evt.type} ${evt.label}.`:''}`);
  };

  const sayLocal=(text,emoji='🧭')=>{
    const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),mini=root.querySelector('#novaMini');
    if(msg)msg.textContent=text;if(status)status.textContent=text;if(face)face.textContent=emoji;if(mini)mini.textContent=emoji;
    if(localStorage.getItem('astralisNovaMuted')!=='true'&&'speechSynthesis'in window){const u=new SpeechSynthesisUtterance(text);speechSynthesis.cancel();speechSynthesis.speak(u)}
  };

  const links=()=>window.AstralisNovaDomain?.links?.()||[...document.querySelectorAll('a[href]')].map(a=>{try{const u=new URL(a.href,location.href);if(u.origin!==location.origin)return null;return{href:u.pathname+u.search+u.hash,label:clean(a.textContent||a.getAttribute('aria-label')||u.pathname)}}catch{return null}}).filter(Boolean);
  const pickStop=(visited=[])=>{
    const p=loadProfile(),fav=topInterests();
    const pool=links().filter(x=>x.href&&x.href!==location.pathname&&!visited.includes(x.href)&&!/^#?$/.test(x.href));
    if(!pool.length)return null;
    const scored=pool.map(x=>{let score=Math.random()*5;const c=classify(`${x.label} ${x.href}`);if(fav.includes(c))score+=4;score-=Math.min(4,p.pages?.[x.href]||0);return{x,score}}).sort((a,b)=>b.score-a.score);
    return scored[0]?.x||null;
  };

  const startTour=()=>{
    const first=pickStop([]);if(!first){sayLocal('I have surveyed this page, but there is nowhere new to steer us yet.','🛰️');return}
    const tour={active:true,remaining:5,visited:[pageKey],started:Date.now()};write(sessionStorage,TOUR_KEY,tour);
    sayLocal(`Tour mode engaged. I am choosing the route. First stop: ${first.label||'somewhere interesting'}.`,'🧭');
    setTimeout(()=>{location.href=first.href},1050);
  };
  const continueTour=()=>{
    const tour=read(sessionStorage,TOUR_KEY,null);if(!tour?.active)return startTour();
    if((tour.remaining||0)<=0){tour.active=false;write(sessionStorage,TOUR_KEY,tour);sayLocal('Tour complete. I have returned the helm to you. Unless you say otherwise, naturally.','✨');return}
    const stop=pickStop(tour.visited||[]);if(!stop){tour.active=false;write(sessionStorage,TOUR_KEY,tour);sayLocal('We have exhausted the useful local routes from here. Tour complete.','✨');return}
    tour.visited=[...(tour.visited||[]),pageKey].slice(-20);tour.remaining-=1;write(sessionStorage,TOUR_KEY,tour);
    sayLocal(`I picked our next stop: ${stop.label||'another corner of Astralis Nova'}.`,'🧭');setTimeout(()=>{location.href=stop.href},950);
  };
  const stopTour=()=>{const t=read(sessionStorage,TOUR_KEY,{active:false});t.active=false;write(sessionStorage,TOUR_KEY,t);sayLocal('Tour mode paused. You have the helm. For now.','🫡')};

  const addControls=()=>{
    const actions=root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-nova-autonomy]'))return;
    const make=(html,handler)=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaAutonomy='true';b.innerHTML=html;b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();handler()});actions.appendChild(b)};
    make('🧭 Nova Tour<small>I choose the route</small>',()=>{const t=read(sessionStorage,TOUR_KEY,null);t?.active?continueTour():startTour()});
    make('🧠 Visitor Memory<small>What I learned on this device</small>',()=>{const p=loadProfile();sayLocal(`I remember ${p.visits||0} page visits on this device. Your strongest trails are ${topInterests().join(', ')||'still forming'}. This memory stays in this browser.`,'🧠')});
    make('🎲 Nova Decides<small>Hand me the helm</small>',()=>window.AstralisNovaAsk?.('Nova, you decide where we go next')||startTour());
  };
  addControls();

  const tour=read(sessionStorage,TOUR_KEY,null);
  if(tour?.active){
    tour.visited=[...(tour.visited||[]),pageKey].filter((v,i,a)=>a.indexOf(v)===i).slice(-20);write(sessionStorage,TOUR_KEY,tour);
    setTimeout(()=>{
      const panel=root.querySelector('#novaPanel');if(panel){panel.classList.add('open');panel.setAttribute('aria-hidden','false')}
      sayLocal(`Welcome to ${document.title}. I brought you here. Have a look around, then tap Nova Tour when you want the next stop.`,'🌌');
    },850);
  }

  window.AstralisNovaAutonomy={context,profile:loadProfile,startTour,continueTour,stopTour,rememberEvent,topInterests};
})();
