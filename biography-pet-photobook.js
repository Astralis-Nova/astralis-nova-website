(() => {
  const path = window.location.pathname.toLowerCase();
  if (!/\/biography(?:\.html)?\/?$/.test(path)) return;

  document.getElementById('pet-photobook')?.remove();

  const pets = [
    ['max', 'Max'],
    ['duke', 'Duke'],
    ['zoey', 'Zoey'],
    ['pepper', 'Pepper'],
    ['tortellini', 'Tortellini'],
    ['rian', 'Rian'],
    ['general', 'General']
  ];

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
    .pet-gallery-live{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-top:16px}
    .pet-photo-card{position:relative;margin:0;overflow:hidden;border:1px solid rgba(112,169,255,.25);border-radius:16px;background:#06101c;box-shadow:0 12px 30px rgba(0,0,0,.28)}
    .pet-photo-button{display:block;width:100%;padding:0;border:0;background:#06101c;cursor:zoom-in}
    .pet-photo-button img{display:block;width:100%;aspect-ratio:1/1;object-fit:contain;background:#06101c}
    .pet-photo-label{position:absolute;left:9px;bottom:9px;padding:6px 10px;border:1px solid rgba(255,255,255,.25);border-radius:999px;background:rgba(3,9,20,.86);color:#fff;font-size:.8rem;font-weight:900;pointer-events:none}
    .pet-loading{padding:28px;text-align:center;color:#aebed3}
    .pet-lightbox-live{position:fixed;inset:0;z-index:1000000;display:none;place-items:center;padding:20px;background:rgba(0,0,0,.93)}
    .pet-lightbox-live.open{display:grid}.pet-lightbox-live img{display:block;max-width:94vw;max-height:82vh;border-radius:16px;background:#06101c}
    .pet-lightbox-caption{margin-top:10px;text-align:center;color:#fff;font-weight:900}.pet-close{position:fixed;right:18px;top:18px;width:44px;height:44px;border:1px solid #777;border-radius:50%;background:#07101d;color:#fff;font-size:1.4rem;cursor:pointer}
    @media(max-width:820px){.hero-grid > div:first-child{order:1}.portrait-wrap{order:2}.hero::before{left:52%!important;right:auto!important}}
    @media(max-width:520px){#pet-photobook{padding:20px 15px}.pet-gallery-live{grid-template-columns:1fr 1fr}}
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

  const getCorrectedAlbums = () => {
    if (correctedAlbumsPromise) return correctedAlbumsPromise;

    correctedAlbumsPromise = Promise.all(
      pets.map(async ([slug]) => {
        const response = await fetch(`/data/pets/${slug}.json?v=20260724h`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Album request failed for ${slug}: ${response.status}`);
        return [slug, await response.json()];
      })
    ).then(entries => {
      const albums = Object.fromEntries(entries);

      // Corrections from the three identification quizzes:
      // - The white puppy was Max, not Zoey.
      // - The family photo with the brown dog was Duke, not Rian.
      albums.max.photos = uniquePhotos([...albums.max.photos, albums.zoey.photos[0]]);
      albums.zoey.photos = uniquePhotos(albums.zoey.photos.slice(1));
      albums.duke.photos = uniquePhotos([...albums.duke.photos, albums.rian.photos[5]]);
      albums.rian.photos = uniquePhotos(albums.rian.photos.slice(0, 5));

      return albums;
    });

    return correctedAlbumsPromise;
  };

  const lightbox = document.createElement('div');
  lightbox.className = 'pet-lightbox-live';
  lightbox.innerHTML = '<button class="pet-close" type="button" aria-label="Close photo">×</button><div><img alt=""><div class="pet-lightbox-caption"></div></div>';
  document.body.appendChild(lightbox);
  const closeLightbox = () => lightbox.classList.remove('open');
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