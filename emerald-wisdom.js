(() => {
  'use strict';
  const cards = [...document.querySelectorAll('.teaching')];
  const search = document.getElementById('teachingSearch');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const status = document.getElementById('resultsStatus');
  const saveStatus = document.getElementById('saveStatus');
  const key = 'astralis-emerald-reading-v1';
  const validIds = new Set(cards.map(card => card.id));
  let selected = 'all';
  let saved = new Set();
  let storageWorks = true;
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(data)) saved = new Set(data.filter(id => validIds.has(id)));
  } catch { storageWorks = false; }
  function normalize(value) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  const searchable = new Map(cards.map(card => [card, normalize(card.textContent + ' ' + card.dataset.keywords)]));
  function applyFilters() {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let count = 0;
    for (const card of cards) {
      const traditionMatches = selected === 'all' || (selected === 'saved' ? saved.has(card.id) : card.dataset.tradition === selected);
      const visible = traditionMatches && words.every(word => searchable.get(card).includes(word));
      card.hidden = !visible;
      if (visible) count++;
    }
    document.getElementById('emptyResults').hidden = count !== 0;
    status.textContent = `${count} ${count === 1 ? 'teaching' : 'teachings'} ${selected === 'saved' ? 'in your saved reading list' : 'to explore'}${search.value.trim() ? ' matching your search' : ''}.`;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === selected)));
  }
  function syncSaved() {
    document.getElementById('savedCount').textContent = saved.size;
    document.querySelectorAll('[data-save]').forEach(button => {
      const isSaved = saved.has(button.dataset.save);
      button.setAttribute('aria-pressed', String(isSaved));
      button.textContent = isSaved ? '✓ Saved for research' : '＋ Save for research';
      button.setAttribute('aria-label', `${isSaved ? 'Remove' : 'Save'} ${document.getElementById(button.dataset.save).querySelector('h3').textContent}${isSaved ? ' from your reading list' : ' for research'}`);
      button.hidden = false;
    });
  }
  function reveal(id) {
    const card = document.getElementById(id);
    if (!card || !validIds.has(id)) return;
    if (card.hidden) { selected = 'all'; search.value = ''; applyFilters(); }
    card.querySelector('details').open = true;
  }
  filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; applyFilters(); }));
  search.addEventListener('input', applyFilters);
  document.querySelectorAll('[data-query]').forEach(button => button.addEventListener('click', () => {
    selected = 'all'; search.value = button.dataset.query; applyFilters();
  }));
  document.getElementById('resetFilters').addEventListener('click', () => { selected = 'all'; search.value = ''; applyFilters(); search.focus(); });
  document.querySelectorAll('[data-save]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    try { localStorage.setItem(key, JSON.stringify([...saved])); storageWorks = true; }
    catch { storageWorks = false; }
    syncSaved(); applyFilters();
    saveStatus.textContent = storageWorks ? 'Your reading list is saved in this browser.' : 'Your reading list works for this visit; browser storage is unavailable.';
    if (selected === 'saved' && !saved.has(id)) document.querySelector('[data-filter="saved"]').focus();
  }));
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => reveal(link.hash.slice(1))));
  window.addEventListener('hashchange', () => reveal(location.hash.slice(1)));
  const surprise = document.getElementById('surpriseMe');
  surprise.hidden = false;
  surprise.addEventListener('click', () => {
    const visible = cards.filter(card => !card.hidden);
    if (!visible.length) { saveStatus.textContent = 'Clear your filters to find a story.'; return; }
    const card = visible[Math.floor(Math.random() * visible.length)];
    reveal(card.id); location.hash = card.id;
    card.querySelector('summary').focus({preventScroll:true});
  });
  const discoveries = [
    {title:'A universe that leaves room for a question',text:'The Rigveda’s creation hymn ends with uncertainty about who can truly know how existence began. An ancient sacred poem can hold a question open.',id:'origins',link:'Explore the creation hymn →'},
    {title:'What would you ask Death?',text:'Nachiketas refuses temporary rewards because they cannot answer what happens after dying. His story asks which questions are worth more than distraction.',id:'nachiketas',link:'Meet the boy who questioned Death →'},
    {title:'A tiny seed, a very large question',text:'A father and son look inside a banyan seed. Their conversation moves from the familiar natural world to a question about the basis of existence.',id:'banyan',link:'Open the banyan teaching →'},
    {title:'Include the lives outside your circle',text:'The Metta Sutta invites goodwill toward living beings near and far, seen and unseen. What would that care look like in the world around you today?',id:'goodwill',link:'Read about a wider kindness →'},
    {title:'Useful action can begin before certainty',text:'The poisoned-arrow parable asks why someone would postpone urgent care until every speculative question had been answered.',id:'arrow',link:'Follow the poisoned-arrow parable →'}
  ];
  let discoveryIndex = 0;
  const next = document.getElementById('nextDiscovery');
  next.hidden = false;
  next.addEventListener('click', () => {
    discoveryIndex = (discoveryIndex + 1) % discoveries.length;
    const item = discoveries[discoveryIndex];
    document.getElementById('discoveryTitle').textContent = item.title;
    document.getElementById('discoveryText').textContent = item.text;
    const link = document.getElementById('discoveryLink'); link.href = '#' + item.id; link.textContent = item.link;
  });
  document.getElementById('explorerTools').hidden = false;
  syncSaved(); applyFilters(); reveal(location.hash.slice(1));

  const canvas = document.getElementById('wisdomSky');
  const ctx = canvas.getContext('2d');
  const motion = document.getElementById('motionToggle');
  const weather = window.EmeraldWeather?.create(document.getElementById('planetWeather'), {
    image: document.querySelector('img.hero-art'), airCanvas: document.getElementById('planetAir'), wind: .65
  });
  const grove = window.EmeraldGrove?.create();
  const groveMotion = document.getElementById('groveMotion');
  document.querySelectorAll('[data-animal]').forEach(button => button.addEventListener('click', () => {
    const kind = button.dataset.animal;
    document.querySelectorAll('[data-animal]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelectorAll('[data-animal-panel]').forEach(panel => { panel.hidden = panel.dataset.animalPanel !== kind; });
    grove?.lookAt(kind);
  }));
  const windControl = document.getElementById('windToggle');
  const winds = [{name:'gentle',value:.65},{name:'breezy',value:1.4},{name:'calm',value:0}];
  let windIndex = 0;
  if (weather) {
    windControl.hidden = false;
    windControl.setAttribute('aria-label', 'Change wind. Current: gentle.');
    windControl.addEventListener('click', () => {
      windIndex = (windIndex + 1) % winds.length;
      const wind = winds[windIndex];
      weather.setWind(wind.value);
      grove?.setWind(wind.value);
      windControl.textContent = 'Wind: ' + wind.name;
      windControl.setAttribute('aria-label', 'Change wind. Current: ' + wind.name + '.');
    });
  }
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, frame = null, width = 0, height = 0, last = 0, time = 0;
  let seed = 8917;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const stars = Array.from({length:75}, () => ({x:rand(),y:rand(),size:.4+rand()*1.1,speed:.15+rand()*.5,phase:rand()*6.28}));
  function resize() {
    width = innerWidth; height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    for (const star of stars) {
      const y = ((star.y + time*star.speed*.0007) % 1)*height;
      ctx.globalAlpha = .17 + .3*(.5+.5*Math.sin(time*.3+star.phase));
      ctx.fillStyle = '#d9efbc'; ctx.beginPath(); ctx.arc(star.x*width,y,star.size,0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  function tick(now) {
    frame = null;
    if (paused || document.hidden) return;
    if (!last || now-last >= 65) { if (last) time += Math.min((now-last)/1000,.2); last=now; draw(); }
    frame = requestAnimationFrame(tick);
  }
  function syncMotion() {
    document.body.classList.toggle('sky-paused', paused || document.hidden);
    motion.textContent = paused ? 'Resume world motion' : 'Pause world motion';
    motion.setAttribute('aria-pressed', String(paused));
    weather?.pause(paused || document.hidden);
    grove?.pause(paused || document.hidden);
    groveMotion.textContent = paused ? 'Resume motion' : 'Pause motion';
    groveMotion.setAttribute('aria-pressed', String(paused));
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; last=0;
    if (!paused && !document.hidden) frame=requestAnimationFrame(tick);
  }
  motion.hidden = false;
  groveMotion.hidden = false;
  groveMotion.addEventListener('click', () => { paused=!paused; syncMotion(); });
  motion.addEventListener('click', () => { paused=!paused; syncMotion(); });
  reduced.addEventListener('change', event => { paused=event.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  addEventListener('resize', resize, {passive:true});
  resize(); syncMotion();
})();
