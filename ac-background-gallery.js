(() => {
  'use strict';
  const scenes = [{"id":"sho-roadside","name":"Sho Roadside Portal","image":"/assets/ac-portals/sho-roadside.jpg","source":"https://www.drunkenfell.com/index.php?title=Sho_Roadside_Portal","kind":"Portal"},{"id":"portal-space-entrance","name":"Entrance to Portal Space","image":"/assets/ac-portals/portal-space-entrance.jpg","source":"https://www.drunkenfell.com/index.php?title=Entrance_to_Portal_Space","kind":"Portal"},{"id":"portal-gateway","name":"Portal Gateway","image":"/assets/ac-portals/portal-gateway.jpg","source":"https://www.drunkenfell.com/index.php?title=File%3APortal_Gateway_Live.jpg","kind":"Portal"},{"id":"four-towers","name":"Four Towers Entrance","image":"/assets/ac-portals/four-towers.jpg","source":"https://www.drunkenfell.com/index.php?title=Four_Towers_Entrance_Portal","kind":"Portal"},{"id":"tree-portal","name":"Tree Portal","image":"/assets/ac-portals/tree-portal.jpg","source":"https://www.drunkenfell.com/index.php?title=Tree_Portal","kind":"Portal"},{"id":"beachside","name":"Beachside Portal","image":"/assets/ac-portals/beachside.jpg","source":"https://www.drunkenfell.com/index.php?title=Beachside_Portal","kind":"Portal"},{"id":"high-mountain","name":"High Mountain Valley Portal","image":"/assets/ac-portals/high-mountain.jpg","source":"https://www.drunkenfell.com/index.php?title=High_Mountain_Valley_Portal","kind":"Portal"},{"id":"asherons-island","name":"Asheron’s Island Portal","image":"/assets/ac-portals/asherons-island.jpg","source":"https://www.drunkenfell.com/index.php?title=Asheron's_Island_Portal","kind":"Portal"},{"id":"westward","name":"Westward Portal","image":"/assets/ac-portals/westward.jpg","source":"https://www.drunkenfell.com/index.php?title=Westward_Portal","kind":"Portal"},{"id":"simple-tower","name":"Simple Tower Portal","image":"/assets/ac-portals/simple-tower.jpg","source":"https://www.drunkenfell.com/index.php?title=Simple_Tower_Portal","kind":"Portal"},{"id":"north-direlands","name":"North Direlands Portal","image":"/assets/ac-portals/north-direlands.jpg","source":"https://www.drunkenfell.com/index.php?title=North_Direlands_Portal","kind":"Portal"},{"id":"eastham-beach","name":"Eastham Beach Portal","image":"/assets/ac-portals/eastham-beach.jpg","source":"https://www.drunkenfell.com/index.php?title=Eastham_Beach_Portal","kind":"Portal"},{"id":"beta-world-map","name":"Beta world map","image":"/assets/ac-portals/beta-world-map.jpg","source":"https://www.drunkenfell.com/index.php?title=File%3ABeta_World_Map.jpg","kind":"Map"},{"id":"subway-map","name":"Subway / Abandoned Mine map","image":"/assets/ac-portals/subway-map.png","source":"https://www.drunkenfell.com/index.php?title=File%3A01C9.png","kind":"Map"},{"id":"armor-concept","name":"Armor concept art (2010)","image":"/assets/ac-portals/armor-concept.jpg","source":"https://www.drunkenfell.com/index.php?title=File%3ANew_Armor_Concept_Art_2010.jpg","kind":"Artwork"}];
  const select = document.getElementById('backgroundChoice');
  const gallery = document.getElementById('backgroundGallery');
  const status = document.getElementById('backgroundStatus');
  if (!select || !gallery || !status) return;
  const defaultImage = '/ac-worlds-emblem-dark.webp';
  function apply(id) {
    const scene = scenes.find(item => item.id === id);
    const url = scene ? scene.image : defaultImage;
    document.body.style.backgroundImage = 'url("' + url + '")';
    document.body.style.backgroundSize = scene ? 'cover' : '';
    document.body.style.backgroundPosition = 'center top';
    select.value = scene ? scene.id : '';
    status.textContent = scene ? scene.name + ' selected. Archival image; low-resolution originals may look soft when enlarged.' : 'Centered bronze emblem selected — no orange parchment surround.';
    try { localStorage.setItem('ac-background-scene', scene ? scene.id : ''); } catch (_) {}
  }
  scenes.forEach(scene => {
    select.add(new Option(scene.kind + ' — ' + scene.name, scene.id));
    const card = document.createElement('article');
    card.className = 'background-card';
    const img = document.createElement('img');
    img.src = scene.image; img.alt = scene.name; img.loading = 'lazy'; img.decoding = 'async';
    img.addEventListener('error', () => { img.hidden = true; });
    const title = document.createElement('h3'); title.textContent = scene.name;
    const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Use as background';
    button.addEventListener('click', () => apply(scene.id));
    const full = document.createElement('a'); full.href = scene.image; full.textContent = 'View full image ↗'; full.target = '_blank'; full.rel = 'noopener noreferrer';
    const source = document.createElement('a'); source.href = scene.source; source.textContent = 'Drunkapedia source / attribution ↗'; source.target = '_blank'; source.rel = 'noopener noreferrer';
    card.append(img, title, button, full, source); gallery.append(card);
  });
  select.addEventListener('change', () => apply(select.value));
  document.getElementById('resetBackground').addEventListener('click', () => apply(''));
  let saved = ''; try { saved = localStorage.getItem('ac-background-scene') || ''; } catch (_) {}
  apply(saved);
})();
