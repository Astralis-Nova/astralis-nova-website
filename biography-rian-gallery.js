(() => {
  const path = window.location.pathname.toLowerCase();
  if (!/\/biography(?:\.html)?\/?$/.test(path)) return;

  const originalFetch = window.fetch.bind(window);
  const version = '20260726a';
  const photoChunks = [
    ['photo-01-00.b64', 'photo-01-01.b64', 'photo-01-02.b64'],
    ['photo-02-00.b64', 'photo-02-01.b64']
  ];
  let albumPromise;

  const loadPhoto = async names => {
    const chunks = await Promise.all(names.map(async name => {
      const response = await originalFetch(`/data/pets/rian-v20260726a/${name}?v=${version}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Rian photo chunk failed: ${name} (${response.status})`);
      return (await response.text()).trim();
    }));
    return `data:image/jpeg;base64,${chunks.join('')}`;
  };

  const loadAlbum = async (input, init) => {
    if (albumPromise) return albumPromise;

    albumPromise = (async () => {
      const response = await originalFetch(input, { ...init, cache: 'no-store' });
      if (!response.ok) throw new Error(`Rian album request failed: ${response.status}`);

      const original = await response.json();
      const uploadedPhotos = await Promise.all(photoChunks.map(loadPhoto));
      const retainedRianPhotos = Array.isArray(original.photos) ? original.photos.slice(3, 5) : [];

      return {
        ...original,
        description: 'Fluffy ears, bright eyes, and favorite memories with Shaleyaa, cozy naps, and playful portraits.',
        photos: [...uploadedPhotos, ...retainedRianPhotos]
      };
    })();

    return albumPromise;
  };

  const style = document.createElement('style');
  style.textContent = '.pet-lightbox-live img{width:min(92vw,640px)!important;height:auto!important;object-fit:contain!important}';
  document.head.appendChild(style);

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (/\/data\/pets\/rian\.json(?:\?|$)/i.test(url)) {
      try {
        const album = await loadAlbum(input, init);
        return new Response(JSON.stringify(album), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      } catch (error) {
        console.error('Rian gallery update failed.', error);
      }
    }

    return originalFetch(input, init);
  };
})();