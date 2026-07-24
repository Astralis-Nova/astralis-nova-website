(() => {
  const path = window.location.pathname.toLowerCase();
  if (!/\/biography(?:\.html)?\/?$/.test(path)) return;

  document.getElementById('pet-photobook')?.remove();

  const pets = [
    {
      name: 'Max',
      aka: 'aka Puddles',
      collection: '/images/pets/max-collection.svg?v=20260724d',
      description: 'A fluffy white cloud with loyal-companion energy, gentle eyes, and a talent for turning any cozy spot into his command bridge.'
    },
    {
      name: 'Duke',
      aka: 'aka Prancer',
      collection: '/images/pets/duke-collection.svg?v=20260724d',
      description: 'The brown greeter of the crew: alert, warm-hearted, and always looking like he knows exactly when it is snack o’clock.'
    },
    {
      name: 'Zoey & Pepper',
      aka: 'best-friend memories',
      collection: '/images/pets/zoey-collection.svg?v=20260724d',
      description: 'Zoey and Pepper together, two beloved companions sharing the same family orbit.'
    },
    {
      name: 'Tortellini',
      aka: 'slow-and-steady specialist',
      collection: '/images/pets/tortellini.svg?v=20260724d',
      description: 'The shelled explorer of the household, quiet, determined, and living proof that starships are not the only things built with good armor.'
    },
    {
      name: 'Rian',
      aka: 'white-dog star power',
      collection: '/images/pets/rian-collection.svg?v=20260724d',
      description: 'Fluffy ears, bright eyes, and the kind of face that could negotiate extra treats from almost anyone.'
    },
    {
      name: 'General',
      aka: 'calm household guardian',
      collection: '/images/pets/general-collection.svg?v=20260724d',
      description: 'Steady posture, alert eyes, and the unmistakable energy of a loyal protector making quiet rounds around the home.'
    }
  ];

  const style = document.createElement('style');
  style.textContent = `
    .hero-grid > div:first-child{order:2}
    .portrait-wrap{order:1}
    .hero::before{left:auto!important;right:-8%!important}
    #pet-photobook{margin-top:28px;padding:30px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(145deg,rgba(8,17,30,.94),rgba(10,11,27,.9));box-shadow:0 18px 55px rgba(0,0,0,.32)}
    #pet-photobook h2{margin:0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.03em}
    #pet-photobook .pet-intro{max-width:800px;margin:14px 0 0;color:#d7e2f4;line-height:1.8}
    .pet-picker-live{display:flex;gap:10px;margin-top:24px;padding-bottom:8px;overflow-x:auto;scrollbar-width:thin}
    .pet-picker-button{flex:0 0 auto;padding:11px 17px;border:1px solid rgba(112,169,255,.32);border-radius:999px;background:rgba(5,13,27,.82);color:#dcecff;font:inherit;font-weight:800;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease,box-shadow .2s ease}
    .pet-picker-button:hover,.pet-picker-button:focus-visible{transform:translateY(-2px);border-color:rgba(121,202,255,.85);outline:none}
    .pet-picker-button[aria-selected="true"]{border-color:#72cfff;background:linear-gradient(135deg,rgba(32,128,204,.52),rgba(167,50,139,.38));box-shadow:0 0 24px rgba(79,183,255,.18);color:#fff}
    .pet-viewer-live{margin-top:20px;padding:20px;border:1px solid rgba(112,169,255,.22);border-radius:22px;background:rgba(5,13,26,.82)}
    .pet-view-copy{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:baseline;margin-bottom:18px}
    .pet-view-copy h3{margin:0;font-size:clamp(1.7rem,3vw,2.35rem)}
    .pet-view-aka{color:#ffd27a;font-size:.84rem;font-weight:900;letter-spacing:.07em;text-transform:uppercase}
    .pet-view-copy p{flex-basis:100%;margin:5px 0 0;color:#b7c5d9;line-height:1.75}
    .pet-gallery-live{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
    .pet-photo-card{position:relative;margin:0;overflow:hidden;border:1px solid rgba(112,169,255,.24);border-radius:18px;background:#06101c;box-shadow:0 14px 34px rgba(0,0,0,.28)}
    .pet-photo-button{display:block;width:100%;padding:0;border:0;background:#06101c;cursor:zoom-in}
    .pet-photo-button img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#06101c}
    .pet-photo-label{position:absolute;left:10px;bottom:10px;z-index:2;padding:7px 11px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(3,9,20,.84);color:#fff;font-size:.82rem;font-weight:900;letter-spacing:.03em;backdrop-filter:blur(8px);box-shadow:0 6px 20px rgba(0,0,0,.34);pointer-events:none}
    .pet-loading{padding:26px;text-align:center;color:#aebed3}
    .pet-note-live{margin:20px 0 0;color:#b8c7dc;line-height:1.7}
    .pet-lightbox-live{position:fixed;inset:0;z-index:1000000;display:none;place-items:center;padding:24px;background:rgba(0,0,0,.92)}
    .pet-lightbox-live.open{display:grid}
    .pet-lightbox-frame{position:relative;max-width:min(94vw,1000px);max-height:90vh}
    .pet-lightbox-live img{display:block;max-width:94vw;max-height:82vh;border-radius:18px;background:#06101c;box-shadow:0 0 60px rgba(79,183,255,.3)}
    .pet-lightbox-caption{margin-top:12px;text-align:center;color:#fff;font-weight:900;font-size:1.05rem}
    .pet-lightbox-live .pet-close{position:fixed;right:20px;top:20px;width:46px;height:46px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:#07101d;color:#fff;font-size:1.5rem;cursor:pointer}
    @media(max-width:820px){.hero-grid > div:first-child{order:1}.portrait-wrap{order:2}.hero::before{left:52%!important;right:auto!important}}
    @media(max-width:760px){#pet-photobook{padding:22px 18px}.pet-gallery-live{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:480px){.pet-gallery-live{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'pet-photobook';
  section.innerHTML = `
    <p class="eyebrow">Field notes from the home crew</p>
    <h2>The Pet Photobook</h2>
    <p class="pet-intro">Choose a member of the crew. Every photograph now carries the correct pet name, and each picture can be opened individually.</p>
    <div class="pet-picker-live" role="tablist" aria-label="Choose a pet"></div>
    <div class="pet-viewer-live">
      <div class="pet-view-copy">
        <h3></h3>
        <span class="pet-view-aka"></span>
        <p></p>
      </div>
      <div class="pet-gallery-live" aria-live="polite"></div>
    </div>
    <p class="pet-note-live"><strong>Living album:</strong> more photographs can be added under the correct pet whenever new memories surface from the archives.</p>
  `;

  const picker = section.querySelector('.pet-picker-live');
  const viewerTitle = section.querySelector('.pet-view-copy h3');
  const viewerAka = section.querySelector('.pet-view-aka');
  const viewerDescription = section.querySelector('.pet-view-copy p');
  const gallery = section.querySelector('.pet-gallery-live');
  let activeRequest = 0;

  const extractPhotos = async collectionUrl => {
    const response = await fetch(collectionUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load album (${response.status})`);
    const svgText = await response.text();
    const documentSvg = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    return [...documentSvg.querySelectorAll('image')]
      .map(image => image.getAttribute('href') || image.getAttributeNS('http://www.w3.org/1999/xlink', 'href'))
      .filter(Boolean);
  };

  const lightbox = document.createElement('div');
  lightbox.className = 'pet-lightbox-live';
  lightbox.innerHTML = '<button class="pet-close" type="button" aria-label="Close pet photo">×</button><div class="pet-lightbox-frame"><img alt="Expanded pet photo"><div class="pet-lightbox-caption"></div></div>';
  document.body.appendChild(lightbox);

  const openLightbox = (src, petName, photoNumber) => {
    const expandedImage = lightbox.querySelector('img');
    expandedImage.src = src;
    expandedImage.alt = `${petName}, photo ${photoNumber}`;
    lightbox.querySelector('.pet-lightbox-caption').textContent = `🐾 ${petName} · Photo ${photoNumber}`;
    lightbox.classList.add('open');
  };

  const closeLightbox = () => lightbox.classList.remove('open');
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.classList.contains('pet-close')) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
  });

  const renderPhotos = (pet, photos) => {
    gallery.innerHTML = '';
    photos.forEach((src, index) => {
      const photoNumber = index + 1;
      const card = document.createElement('figure');
      card.className = 'pet-photo-card';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pet-photo-button';
      button.setAttribute('aria-label', `Open ${pet.name} photo ${photoNumber}`);
      const image = document.createElement('img');
      image.src = src;
      image.alt = `${pet.name}, photo ${photoNumber}`;
      image.loading = 'lazy';
      const label = document.createElement('span');
      label.className = 'pet-photo-label';
      label.textContent = `🐾 ${pet.name}`;
      button.appendChild(image);
      button.addEventListener('click', () => openLightbox(src, pet.name, photoNumber));
      card.append(button, label);
      gallery.appendChild(card);
    });
  };

  const selectPet = async index => {
    const requestId = ++activeRequest;
    const pet = pets[index];
    picker.querySelectorAll('.pet-picker-button').forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });
    viewerTitle.textContent = pet.name;
    viewerAka.textContent = pet.aka;
    viewerDescription.textContent = pet.description;
    gallery.innerHTML = '<div class="pet-loading">Loading labeled photos…</div>';
    try {
      const photos = await extractPhotos(pet.collection);
      if (requestId !== activeRequest) return;
      if (!photos.length) throw new Error('No photographs found');
      renderPhotos(pet, photos);
    } catch (error) {
      if (requestId !== activeRequest) return;
      gallery.innerHTML = `<div class="pet-loading">The ${pet.name} collection could not load. Please refresh the page.</div>`;
      console.error(error);
    }
  };

  pets.forEach((pet, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pet-picker-button';
    button.setAttribute('role', 'tab');
    button.textContent = pet.name;
    button.addEventListener('click', () => selectPet(index));
    picker.appendChild(button);
  });

  const target = document.querySelector('.signal') || document.querySelector('.footer');
  if (target) target.before(section);
  else document.querySelector('main')?.appendChild(section);

  selectPet(0);
})();
