(() => {
  const path = window.location.pathname.toLowerCase();
  if (!path.endsWith('/biography') && !path.endsWith('/biography.html')) return;
  if (document.getElementById('pet-photobook')) return;

  const pets = [
    {
      name: 'Max',
      aka: 'aka Puddles',
      description: 'A fluffy white cloud with loyal-companion energy, gentle eyes, and a talent for turning any cozy spot into his command bridge.',
      photos: ['/images/pets/max-puddles.svg?v=20260724a']
    },
    {
      name: 'Duke',
      aka: 'aka Prancer',
      description: 'The brown greeter of the crew: alert, warm-hearted, and always looking like he knows exactly when it is snack o’clock.',
      photos: ['/images/pets/duke-prancer.svg?v=20260724a']
    },
    {
      name: 'Zoey',
      aka: 'longtime sidekick',
      description: 'Bright-eyed, expressive, and full of personality. Zoey has the kind of face that can say an entire paragraph without barking once.',
      photos: [
        '/images/pets/zoey.svg?v=20260724a',
        '/images/pets/zoey-memory.svg?v=20260724a'
      ]
    },
    {
      name: 'Tortellini',
      aka: 'slow-and-steady specialist',
      description: 'The shelled explorer of the household, quiet, determined, and living proof that starships are not the only things built with good armor.',
      photos: ['/images/pets/tortellini.svg?v=20260724a']
    },
    {
      name: 'Rian',
      aka: 'white-dog star power',
      description: 'Fluffy ears, bright eyes, sweater-weather energy, and the kind of face that could negotiate extra treats from almost anyone.',
      photos: ['/images/pets/rian.svg?v=20260724a']
    },
    {
      name: 'General',
      aka: 'calm household guardian',
      description: 'Steady posture, alert eyes, and the unmistakable energy of a loyal protector making quiet rounds around the home.',
      photos: ['/images/pets/general.svg?v=20260724a']
    }
  ];

  const style = document.createElement('style');
  style.textContent = `
    #pet-photobook{margin-top:28px;padding:30px;border:1px solid rgba(255,255,255,.12);border-radius:24px;background:linear-gradient(145deg,rgba(8,17,30,.94),rgba(10,11,27,.9));box-shadow:0 18px 55px rgba(0,0,0,.32)}
    #pet-photobook h2{margin:0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.03em}
    #pet-photobook .pet-intro{max-width:780px;margin:14px 0 0;color:#d7e2f4;line-height:1.8}
    .pet-grid-live{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;margin-top:24px}
    .pet-card-live{overflow:hidden;border:1px solid rgba(112,169,255,.25);border-radius:20px;background:rgba(7,14,26,.86);box-shadow:0 14px 38px rgba(0,0,0,.28)}
    .pet-gallery-live{display:grid;grid-auto-flow:column;grid-auto-columns:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin}
    .pet-photo-live{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#06101c;scroll-snap-align:start;cursor:zoom-in}
    .pet-copy-live{padding:16px 16px 18px}
    .pet-copy-live h3{margin:0;font-size:1.2rem}
    .pet-aka-live{display:inline-block;margin-top:5px;color:#ffd27a;font-size:.82rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
    .pet-copy-live p{margin:12px 0 0;color:#b7c5d9;line-height:1.65}
    .pet-note-live{margin:20px 0 0;color:#b8c7dc;line-height:1.7}
    .pet-lightbox-live{position:fixed;inset:0;z-index:1000000;display:none;place-items:center;padding:24px;background:rgba(0,0,0,.9)}
    .pet-lightbox-live.open{display:grid}
    .pet-lightbox-live img{max-width:min(92vw,980px);max-height:88vh;border-radius:18px;box-shadow:0 0 60px rgba(79,183,255,.3)}
    .pet-lightbox-live button{position:fixed;right:20px;top:20px;width:44px;height:44px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:#07101d;color:#fff;font-size:1.4rem;cursor:pointer}
    @media(max-width:560px){#pet-photobook{padding:22px 18px}.pet-grid-live{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'pet-photobook';
  section.innerHTML = `
    <p class="eyebrow">Field notes from the home crew</p>
    <h2>The Pet Photobook</h2>
    <p class="pet-intro">Every good biography needs the real supporting cast. This is a living album for Ramon’s animal companions and household legends, built to grow whenever more favorite pictures are found.</p>
    <div class="pet-grid-live"></div>
    <p class="pet-note-live"><strong>Living album:</strong> more pet photographs can be added anytime new memories surface from the archives.</p>
  `;

  const grid = section.querySelector('.pet-grid-live');
  for (const pet of pets) {
    const card = document.createElement('article');
    card.className = 'pet-card-live';

    const gallery = document.createElement('div');
    gallery.className = 'pet-gallery-live';
    pet.photos.forEach((src, index) => {
      const image = document.createElement('img');
      image.className = 'pet-photo-live';
      image.src = src;
      image.loading = 'lazy';
      image.alt = `${pet.name} pet photograph${pet.photos.length > 1 ? ` ${index + 1}` : ''}`;
      gallery.appendChild(image);
    });

    const copy = document.createElement('div');
    copy.className = 'pet-copy-live';
    copy.innerHTML = `<h3>${pet.name}</h3><span class="pet-aka-live">${pet.aka}</span><p>${pet.description}</p>`;
    card.append(gallery, copy);
    grid.appendChild(card);
  }

  const target = document.querySelector('.signal') || document.querySelector('.footer');
  if (target) target.before(section);
  else document.querySelector('main')?.appendChild(section);

  const lightbox = document.createElement('div');
  lightbox.className = 'pet-lightbox-live';
  lightbox.innerHTML = '<button type="button" aria-label="Close pet photo">×</button><img alt="Expanded pet photograph">';
  document.body.appendChild(lightbox);

  const closeLightbox = () => lightbox.classList.remove('open');
  section.addEventListener('click', event => {
    const image = event.target.closest('.pet-photo-live');
    if (!image) return;
    lightbox.querySelector('img').src = image.src;
    lightbox.classList.add('open');
  });
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.tagName === 'BUTTON') closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
  });
})();
