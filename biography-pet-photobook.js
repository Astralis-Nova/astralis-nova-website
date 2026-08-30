(() => {
  const path = window.location.pathname.toLowerCase();
  if (!/\/biography(?:\.html)?\/?$/.test(path)) return;

  document.getElementById('pet-photobook')?.remove();

  const pets = [
    ['max', 'Max'],
    ['duke', 'Duke'],
    ['zoey-pepper', 'Zoey & Pepper'],
    ['tortellini', 'Tortellini'],
    ['rian', 'Rian'],
    ['general', 'General']
  ];
  const albumSlugs = ['max', 'duke', 'zoey', 'pepper', 'tortellini', 'rian', 'general'];

  const dukeSpriteChunks = [
    'sprite-00.b64', 'sprite-01.b64', 'sprite-02.b64', 'sprite-03.b64',
    'sprite-04.b64', 'sprite-05.b64', 'sprite-06.b64', 'sprite-07.b64'
  ];
  const dukeSpriteVersion = '20260726c';
  const dukePhotoCount = 8;
  const dukeCellSize = 100;
  const dukeColumns = 4;

  const style = document.createElement('style');
  style.textContent = `
    .hero-grid > div:first-child{order:2}.portrait-wrap{order:1}.hero::before{left:auto!important;right:-8%!important}
    #pet-photobook{margin-top:28px;padding:30px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(145deg,rgba(8,17,30,.94),rgba(10,11,27,.9));box-shadow:0 18px 55px rgba(0,0,0,.32)}
    #pet-photobook h2{margin:0;font-size:clamp(2rem,4vw,3rem)}
    #pet-photobook .pet-intro,.pet-note-live{color:#c7d4e7;line-height:1.75}
    .pet-picker-live{display:flex;gap:10px;margin:22px 0;overflow-x:auto;padding-bottom:6px}
    .pet-picker-button{flex:0 0 auto;padding:10px 15px;border:1px solid rgba(112,169,255,.34);border-radius:999px;background:#07101d;color:#dcecff;font:inherit;font-weight:800;cursor:pointer}
    .pet-picker-button[aria-selected="true"]{border-color:#72cfff;background:linear-gradient(135deg,#245b8d,#68335f);color:#fff}
    .pet-viewer-live{padding:18px;border:1px solid rgba(112,169,255,.22);border-radius:20px;background:rgba(5,13,26,.82)}
    .pet-view-copy h3{margin:0;font-size:clamp(1.7rem,3vw,2.3rem)}
    .pet-view-aka{display:inline-block;margin-top:5px;color:#ffd27a;font-size:.82rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}
    .pet-view-copy p{color:#b7c5d9;line-height:1.7}
    .pet-gallery-live{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,150px));justify-content:center;gap:12px;margin-top:16px}
    .pet-photo-card{position:relative;width:100%;max-width:150px;margin:0;overflow:hidden;border:1px solid rgba(112,169,255,.25);border-radius:16px;background:#06101c;box-shadow:0 12px 30px rgba(0,0,0,.28)}
    .pet-photo-button{display:block;width:100%;padding:0;border:0;background:#06101c;cursor:zoom-in}
    .pet-photo-button img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#06101c;image-rendering:auto}
    .pet-photo-label{position:static;display:block;box-sizing:border-box;width:100%;padding:8px 10px;border:0;border-top:1px solid rgba(112,169,255,.25);border-radius:0;background:#081525;color:#fff;font-size:.8rem;font-weight:900;text-align:center;pointer-events:none}
    .pet-loading{padding:28px;text-align:center;color:#aebed3}
    .pet-lightbox-live{position:fixed;inset:0;z-index:1000000;display:none;place-items:center;padding:20px;background:rgba(0,0,0,.93)}
    .pet-lightbox-live.open{display:grid}.pet-lightbox-live img{display:block;width:auto;max-width:min(92vw,520px);max-height:78vh;border-radius:16px;background:#06101c;image-rendering:auto}.pet-lightbox-tools{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px}.pet-fullscreen{padding:9px 13px;border:1px solid rgba(114,207,255,.55);border-radius:999px;background:#0b2840;color:#e8f7ff;font:800 .78rem/1 Inter,system-ui,sans-serif;cursor:pointer}.pet-lightbox-live img:fullscreen{width:100vw;height:100vh;max-width:none;max-height:none;object-fit:contain;border-radius:0;background:#000}
    .pet-lightbox-caption{margin-top:10px;text-align:center;color:#fff;font-weight:900}.pet-close{position:fixed;right:18px;top:18px;width:44px;height:44px;border:1px solid #777;border-radius:50%;background:#07101d;color:#fff;font-size:1.4rem;cursor:pointer}
    @media(max-width:820px){.hero-grid > div:first-child{order:1}.portrait-wrap{order:2}.hero::before{left:52%!important;right:auto!important}}
    @media(max-width:520px){#pet-photobook{padding:20px 15px}.pet-gallery-live{grid-template-columns:repeat(2,minmax(0,140px));justify-content:center}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'pet-photobook';
  section.innerHTML = `
    <p class="eyebrow">Field notes from the home crew</p>
    <h2>The Pet Photobook</h2>
    <p class="pet-intro">Choose a pet. Every picture from our identification quiz is now filed under the correct name and opens individually.</p>
    <div class="pet-picker-live" role="tablist" aria-label="Choose a pet"></div>
    <div class="pet-viewer-live">
      <div class="pet-view-copy"><h3></h3><span class="pet-view-aka"></span><p></p></div>
      <div class="pet-gallery-live" aria-live="polite"></div>
    </div>
    <p class="pet-note-live"><strong>Living album:</strong> more family memories can be added anytime.</p>
  `;

  const picker = section.querySelector('.pet-picker-live');
  const title = section.querySelector('.pet-view-copy h3');
  const aka = section.querySelector('.pet-view-aka');
  const description = section.querySelector('.pet-view-copy p');
  const gallery = section.querySelector('.pet-gallery-live');
  let requestId = 0;
  let correctedAlbumsPromise;

  const uniquePhotos = photos => [...new Set(photos.filter(Boolean))];

  const loadImage = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Duke photo sprite could not be decoded.'));
    image.src = src;
  });

  const loadDukePhotos = async () => {
    const chunks = await Promise.all(dukeSpriteChunks.map(async name => {
      const response = await fetch(`/data/pets/duke-v20260726c/${name}?v=${dukeSpriteVersion}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Duke sprite chunk failed: ${name} (${response.status})`);
      return (await response.text()).trim();
    }));

    const sprite = await loadImage(`data:image/jpeg;base64,${chunks.join('')}`);
    return Array.from({ length: dukePhotoCount }, (_, index) => {
      const canvas = document.createElement('canvas');
      canvas.width = dukeCellSize;
      canvas.height = dukeCellSize;
      const context = canvas.getContext('2d');
      const sourceX = (index % dukeColumns) * dukeCellSize;
      const sourceY = Math.floor(index / dukeColumns) * dukeCellSize;
      context.drawImage(sprite, sourceX, sourceY, dukeCellSize, dukeCellSize, 0, 0, dukeCellSize, dukeCellSize);
      return canvas.toDataURL('image/jpeg', 0.92);
    });
  };

  const getCorrectedAlbums = () => {
    if (correctedAlbumsPromise) return correctedAlbumsPromise;

    correctedAlbumsPromise = Promise.all(
      albumSlugs.map(async slug => {
        const response = await fetch(`/data/pets/${slug}.json?v=${dukeSpriteVersion}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Album request failed for ${slug}: ${response.status}`);
        return [slug, await response.json()];
      })
    ).then(async entries => {
      const albums = Object.fromEntries(entries);
      const maxPhotos = uniquePhotos([
        `/images/pets/max-hq-01.svg?v=${dukeSpriteVersion}`,
        ...albums.max.photos.slice(1),
        albums.zoey.photos[0]
      ]);
      albums.max.photos = [maxPhotos[0], maxPhotos[2]].filter(Boolean);
      albums.zoey.photos = uniquePhotos([`/images/pets/zoey-original-portrait.jpg?v=20260830d`, ...albums.zoey.photos.slice(1)]);
      albums['zoey-pepper'] = {
        name: 'Zoey & Pepper',
        aka: 'best friends · one shared story',
        description: 'Zoey and Pepper shared their days, their patio adventures, and a special place in the family story. Their memories now live together in one album.',
        photos: uniquePhotos([...albums.zoey.photos, ...albums.pepper.photos])
      };
      albums.duke.photos = uniquePhotos([`/images/pets/duke-adoption-day.jpg?v=20260830d`, ...await loadDukePhotos()]);
      albums.rian.photos = uniquePhotos(albums.rian.photos);
      return albums;
    });

    return correctedAlbumsPromise;
  };

  const lightbox = document.createElement('div');
  lightbox.className = 'pet-lightbox-live';
  lightbox.innerHTML = '<button class="pet-close" type="button" aria-label="Close photo">×</button><div><img alt=""><div class="pet-lightbox-tools"><div class="pet-lightbox-caption"></div><button class="pet-fullscreen" type="button">⛶ View full screen</button></div></div>';
  document.body.appendChild(lightbox);
  const closeLightbox = () => lightbox.classList.remove('open');
  lightbox.querySelector('.pet-fullscreen').addEventListener('click',()=>{
    const image=lightbox.querySelector('img');
    if(image.requestFullscreen)image.requestFullscreen();
    else if(image.webkitRequestFullscreen)image.webkitRequestFullscreen();
  });
  lightbox.addEventListener('click', event => { if (event.target === lightbox || event.target.classList.contains('pet-close')) closeLightbox(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLightbox(); });

  const render = pet => {
    title.textContent = pet.name;
    aka.textContent = pet.aka;
    description.textContent = pet.description;
    gallery.innerHTML = '';
    pet.photos.forEach((src, index) => {
      const number = index + 1;
      const figure = document.createElement('figure');
      figure.className = 'pet-photo-card';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pet-photo-button';
      button.setAttribute('aria-label', `Open ${pet.name} photo ${number}`);
      const image = document.createElement('img');
      image.src = src;
      image.alt = `${pet.name}, photo ${number}`;
      image.loading = 'lazy';
      const label = document.createElement('span');
      label.className = 'pet-photo-label';
      label.textContent = `🐾 ${pet.name}`;
      button.appendChild(image);
      button.addEventListener('click', () => {
        lightbox.querySelector('img').src = src;
        lightbox.querySelector('img').alt = image.alt;
        lightbox.querySelector('.pet-lightbox-caption').textContent = `🐾 ${pet.name} · Photo ${number}`;
        lightbox.classList.add('open');
      });
      figure.append(button, label);
      gallery.appendChild(figure);
    });
  };

  const selectPet = async index => {
    const current = ++requestId;
    picker.querySelectorAll('.pet-picker-button').forEach((button, i) => button.setAttribute('aria-selected', i === index ? 'true' : 'false'));
    gallery.innerHTML = '<div class="pet-loading">Loading pet photos…</div>';
    try {
      const albums = await getCorrectedAlbums();
      if (current !== requestId) return;
      render(albums[pets[index][0]]);
    } catch (error) {
      gallery.innerHTML = '<div class="pet-loading">This album could not load. Please refresh the page.</div>';
      console.error(error);
    }
  };

  pets.forEach(([slug, name], index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pet-picker-button';
    button.textContent = name;
    button.addEventListener('click', () => selectPet(index));
    picker.appendChild(button);
  });

  const target = document.querySelector('.signal') || document.querySelector('.footer');
  if (target) target.before(section); else document.querySelector('main')?.appendChild(section);
  selectPet(0);
})();
