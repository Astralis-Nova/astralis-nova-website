(() => {
  const path = window.location.pathname.toLowerCase();
  if (!/\/biography(?:\.html)?\/?$/.test(path)) return;

  const originalFetch = window.fetch.bind(window);
  const spriteChunks = [
    'sprite-00.b64',
    'sprite-01.b64',
    'sprite-02.b64',
    'sprite-03.b64'
  ];
  const version = '20260726b';
  const photoCount = 13;
  const cellSize = 120;
  const columns = 4;
  let albumPromise;

  const loadImage = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Zoey photo sprite could not be decoded.'));
    image.src = src;
  });

  const loadZoeyAlbum = () => {
    if (albumPromise) return albumPromise;

    albumPromise = Promise.all(spriteChunks.map(async name => {
      const response = await originalFetch(`/data/pets/zoey-v20260726b/${name}?v=${version}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Zoey sprite chunk failed: ${name} (${response.status})`);
      return (await response.text()).trim();
    })).then(async chunks => {
      const sprite = await loadImage(`data:image/jpeg;base64,${chunks.join('')}`);
      const photos = Array.from({ length: photoCount }, (_, index) => {
        const canvas = document.createElement('canvas');
        canvas.width = cellSize;
        canvas.height = cellSize;
        const context = canvas.getContext('2d');
        const sourceX = (index % columns) * cellSize;
        const sourceY = Math.floor(index / columns) * cellSize;
        context.drawImage(sprite, sourceX, sourceY, cellSize, cellSize, 0, 0, cellSize, cellSize);
        return canvas.toDataURL('image/jpeg', 0.94);
      });

      return {
        name: 'Zoey',
        aka: 'longtime sidekick',
        description: 'Bright-eyed, expressive, and deeply woven into the family story.',
        // The existing album script removes its first legacy slot. Duplicate photo one
        // here so that all thirteen new photos remain after that compatibility step.
        photos: [photos[0], ...photos]
      };
    });

    return albumPromise;
  };

  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    if (/\/data\/pets\/zoey\.json(?:\?|$)/i.test(url)) {
      try {
        const album = await loadZoeyAlbum();
        return new Response(JSON.stringify(album), {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' }
        });
      } catch (error) {
        console.error(error);
      }
    }

    return originalFetch(input, init);
  };
})();