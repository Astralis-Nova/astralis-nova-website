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
  function scrollReading(card) {
    const scroller = document.querySelector('.library-scroller');
    requestAnimationFrame(() => scroller.scrollTo({top: scroller.scrollTop + card.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 16, behavior: reduced.matches ? 'instant' : 'smooth'}));
  }
  function reveal(id) {
    const card = document.getElementById(id);
    if (!card || !document.getElementById('libraryDialog').contains(card)) return;
    if (!document.getElementById('libraryDialog').open) openLibrary();
    if (!validIds.has(id)) { scrollReading(card); return; }
    if (card.hidden) { selected = 'all'; search.value = ''; applyFilters(); }
    card.querySelector('details').open = true;
    scrollReading(card);
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
  document.addEventListener('click', event => { const link=event.target.closest('a[href^="#"]'); if(link) { const id=link.hash.slice(1); if(document.getElementById('libraryDialog').contains(document.getElementById(id))) {event.preventDefault(); history.pushState(null,'','#'+id); reveal(id);} } });
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
  syncSaved(); applyFilters();

  const creatureDialog=document.getElementById('creatureDialog'),library=document.getElementById('libraryDialog');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches;
  const motion=document.getElementById('motionToggle');
  let grove, groveVisible = false, readingOrigin = location.hash === '#livingGrove' ? 'livingGrove' : 'emeraldSky';
  const skyMotion = document.getElementById('skyMotionToggle');
  function syncMotion(){
    const blocked = paused || creatureDialog.open || library.open;
    grove?.pause(blocked || !groveVisible);
    window.EmeraldSky?.pause(blocked);
    skyMotion.textContent = paused ? 'Resume sky' : 'Pause sky';
    skyMotion.setAttribute('aria-pressed', String(paused));
    motion.textContent=paused?'Resume life':'Pause life';motion.setAttribute('aria-pressed',String(paused));
  }
  function closeDialog(dialog){if(dialog.open)dialog.close();}
  function openLibrary(){closeDialog(creatureDialog);if(!library.open){readingOrigin=groveVisible?'livingGrove':'emeraldSky';const back=library.querySelector('[data-close=libraryDialog]');back.textContent=readingOrigin==='emeraldSky'?'Back to the sky ×':'Back to forest ×';back.setAttribute('aria-label',readingOrigin==='emeraldSky'?'Return to the sky':'Return to the forest');library.showModal();}syncMotion();}
  function showCreature(kind){
    const item=window.EmeraldCreatures.find(c=>c.id===kind);if(!item)return;
    closeDialog(library);
    const content=document.getElementById('creatureContent');content.replaceChildren();
    const el=(tag,text,cls)=>{const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;};
    const title=el('h2',item.name);title.id='creatureTitle';content.append(title,el('p',item.subtitle,'creature-subtitle'));
    for(const story of item.stories){
      const section=el('section','','creature-story');section.append(el('span',story.tradition,'tradition-tag'),el('h3',story.title),el('p',story.text));
      const link=el('a',story.source+' ↗');link.href=story.url;link.target='_blank';link.rel='noopener noreferrer';section.append(link);content.append(section);
    }
    if(item.note)content.append(el('p',item.note,'creature-note'));
    if(item.reading){const link=el('a','Explore the longer teaching →','related-reading');link.href='#'+item.reading;content.append(link);}
    if(!creatureDialog.open)creatureDialog.showModal();creatureDialog.scrollTop=0;syncMotion();
  }
  grove=window.EmeraldGrove?.create({onSelect:showCreature});
  new IntersectionObserver(entries=>{groveVisible=entries[0].intersectionRatio>=.08;syncMotion();},{threshold:.08}).observe(document.getElementById('livingGrove'));
  skyMotion.addEventListener('click',()=>{paused=!paused;syncMotion();});
  document.querySelectorAll('[data-close-library]').forEach(link=>link.addEventListener('click',()=>closeDialog(library)));
  const finder=document.getElementById('creatureFinder');
  for(const c of window.EmeraldCreatures){const option=document.createElement('option');option.value=c.id;option.textContent=c.name;finder.append(option);}
  finder.addEventListener('change',()=>{const kind=finder.value;if(kind){grove?.focusKind(kind);showCreature(kind);}finder.value='';});
  document.getElementById('openLibrary').addEventListener('click',openLibrary);
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(document.getElementById(b.dataset.close))));
  for(const dialog of [creatureDialog,library])dialog.addEventListener('close',()=>{
    if(dialog===library&&document.getElementById(location.hash.slice(1))&&library.contains(document.getElementById(location.hash.slice(1))))history.replaceState(null,'','#'+readingOrigin);syncMotion();
  });
  document.getElementById('panLeft').addEventListener('click',()=>grove?.pan(-1));
  document.getElementById('panRight').addEventListener('click',()=>grove?.pan(1));
  motion.addEventListener('click',()=>{paused=!paused;syncMotion();});
  reduced.addEventListener('change',e=>{paused=e.matches;syncMotion();});
  const names=document.getElementById('namesToggle');names.addEventListener('click',()=>{const hidden=document.getElementById('creatureHotspots').classList.toggle('names-hidden');names.textContent=hidden?'Names off':'Names on';names.setAttribute('aria-pressed',String(!hidden));});
  const winds=[{name:'gentle',value:.65},{name:'breezy',value:1.4},{name:'calm',value:0}];let windIndex=0;
  document.getElementById('windToggle').addEventListener('click',event=>{windIndex=(windIndex+1)%winds.length;grove?.setWind(winds[windIndex].value);event.currentTarget.textContent='Wind: '+winds[windIndex].name;});
  syncMotion();reveal(location.hash.slice(1));
})();

