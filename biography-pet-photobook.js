(() => {
  const path = window.location.pathname.toLowerCase();
  if (!/\/biography(?:\.html)?\/?$/.test(path)) return;

  document.getElementById('pet-photobook')?.remove();

  const pets = [
    {
      name: 'Max',
      aka: 'aka Puddles',
      count: 5,
      collection: '/images/pets/max-collection.svg?v=20260724d',
      description: 'A fluffy white cloud with loyal-companion energy, gentle eyes, and a talent for turning any cozy spot into his command bridge. His refreshed collection now includes family time, teddy-bear cuddles, puppy days, couch relaxation, and his bright-eyed tile-floor portrait.'
    },
    {
      name: 'Duke',
      aka: 'aka Prancer',
      count: 2,
      collection: '/images/pets/duke-collection.svg?v=20260724d',
      description: 'The brown greeter of the crew: alert, warm-hearted, and always looking like he knows exactly when it is snack o’clock. His newest collection includes a sunny close-up and a family porch memory.'
    },
    {
      name: 'Zoey & Pepper',
      aka: 'best-friend memories',
      count: 2,
      collection: '/images/pets/zoey-collection.svg?v=20260724d',
      description: 'Zoey and Pepper together, two beloved companions sharing the same family orbit. Their collection includes a portrait together and a warm porch memory with the family crew.'
    },
    {
      name: 'Tortellini',
      aka: 'slow-and-steady specialist',
      count: 2,
      collection: '/images/pets/tortellini.svg?v=20260724d',
      description: 'The shelled explorer of the household, quiet, determined, and living proof that starships are not the only things built with good armor. The album now includes both habitat and outdoor dining adventures.'
    },
    {
      name: 'Rian',
      aka: 'white-dog star power',
      count: 5,
      collection: '/images/pets/rian-collection.svg?v=20260724d',
      description: 'Fluffy ears, bright eyes, and the kind of face that could negotiate extra treats from almost anyone. Both top photos are correctly filed under Rian, including the special picture with Shaleyaa and the teddy-bear cuddle.'
    },
    {
      name: 'General',
      aka: 'calm household guardian',
      count: 2,
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
    .pet-viewer-live{display:grid;grid-template-columns:minmax(280px,.95fr) minmax(0,1.05fr);gap:26px;align-items:center;margin-top:20px;padding:20px;border:1px solid rgba(112,169,255,.22);border-radius:22px;background:rgba(5,13,26,.82)}
    .pet-collection-button{display:block;width:100%;padding:0;border:0;border-radius:18px;background:#06101c;overflow:hidden;cursor:zoom-in;box-shadow:0 16px 40px rgba(0,0,0,.3)}
    .pet-collection-image{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;background:#06101c}
    .pet-view-copy h3{margin:0;font-size:clamp(1.7rem,3vw,2.35rem)}
    .pet-view-aka{display:inline-block;margin-top:6px;color:#ffd27a;font-size:.84rem;font-weight:900;letter-spacing:.07em;text-transform:uppercase}
    .pet-view-copy p{margin:14px 0 0;color:#b7c5d9;line-height:1.75}
    .pet-count-live{display:inline-flex;margin-top:16px;padding:7px 11px;border:1px solid rgba(255,255,255,.13);border-radius:999px;color:#dcecff;background:rgba(255,255,255,.05);font-size:.86rem;font-weight:800}
    .pet-open-hint{display:block;margin-top:11px;color:#95abc4;font-size:.84rem}
    .pet-note-live{margin:20px 0 0;color:#b8c7dc;line-height:1.7}
    .pet-lightbox-live{position:fixed;inset:0;z-index:1000000;display:none;place-items:center;padding:24px;background:rgba(0,0,0,.92)}
    .pet-lightbox-live.open{display:grid}
    .pet-lightbox-live img{max-width:min(94vw,1000px);max-height:88vh;border-radius:18px;background:#06101c;box-shadow:0 0 60px rgba(79,183,255,.3)}
    .pet-lightbox-live button{position:fixed;right:20px;top:20px;width:46px;height:46px;border:1px solid rgba(255,255,255,.3);border-radius:50%;background:#07101d;color:#fff;font-size:1.5rem;cursor:pointer}
    @media(max-width:820px){.hero-grid > div:first-child{order:1}.portrait-wrap{order:2}.hero::before{left:52%!important;right:auto!important}}
    @media(max-width:760px){#pet-photobook{padding:22px 18px}.pet-viewer-live{grid-template-columns:1fr}.pet-collection-image{aspect-ratio:1/1}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'pet-photobook';
  section.innerHTML = `
    <p class="eyebrow">Field notes from the home crew</p>
    <h2>The Pet Photobook</h2>
    <p class="pet-intro">Choose a member of the crew to open that pet’s photo collection. The album is built to keep growing whenever more favorite pictures are found.</p>
    <div class="pet-picker-live" role="tablist" aria-label="Choose a pet"></div>
    <div class="pet-viewer-live">
      <button class="pet-collection-button" type="button" aria-label="Open selected pet photos full screen">
        <img class="pet-collection-image" alt="">
      </button>
      <div class="pet-view-copy">
        <h3></h3>
        <span class="pet-view-aka"></span>
        <p></p>
        <span class="pet-count-live"></span>
        <span class="pet-open-hint">Tap the photo collection to enlarge it.</span>
      </div>
    </div>
    <p class="pet-note-live"><strong>Living album:</strong> additional photographs can be added under the correct pet whenever more memories surface from the archives.</p>
  `;

  const picker = section.querySelector('.pet-picker-live');
  const viewerImage = section.querySelector('.pet-collection-image');
  const viewerTitle = section.querySelector('.pet-view-copy h3');
  const viewerAka = section.querySelector('.pet-view-aka');
  const viewerDescription = section.querySelector('.pet-view-copy p');
  const viewerCount = section.querySelector('.pet-count-live');
  const viewerButton = section.querySelector('.pet-collection-button');

  const selectPet = index => {
    const pet = pets[index];
    picker.querySelectorAll('.pet-picker-button').forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });
    viewerImage.src = pet.collection;
    viewerImage.alt = `${pet.name} photo collection containing ${pet.count} photograph${pet.count === 1 ? '' : 's'}`;
    viewerTitle.textContent = pet.name;
    viewerAka.textContent = pet.aka;
    viewerDescription.textContent = pet.description;
    viewerCount.textContent = `${pet.count} photo${pet.count === 1 ? '' : 's'} in this collection`;
    viewerButton.dataset.petName = pet.name;
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

  const lightbox = document.createElement('div');
  lightbox.className = 'pet-lightbox-live';
  lightbox.innerHTML = '<button type="button" aria-label="Close pet photos">×</button><img alt="Expanded pet photo collection">';
  document.body.appendChild(lightbox);

  const closeLightbox = () => lightbox.classList.remove('open');
  viewerButton.addEventListener('click', () => {
    const expandedImage = lightbox.querySelector('img');
    expandedImage.src = viewerImage.src;
    expandedImage.alt = viewerImage.alt;
    lightbox.classList.add('open');
  });
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox || event.target.tagName === 'BUTTON') closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
  });

  selectPet(0);
})();
