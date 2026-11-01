(() => {
  'use strict';
  const MAX_FILE_BYTES = 25 * 1024 * 1024;
  const MAX_TOTAL_BYTES = 60 * 1024 * 1024;
  const MAX_BUNDLE_BYTES = 85 * 1024 * 1024;
  const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4']);
  const clean = (value, limit) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit);

  function matchesMedia(bytes, type) {
    const ascii = (start, end) => String.fromCharCode(...bytes.subarray(start, end));
    if (type === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (type === 'image/png') return bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n);
    if (type === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    return bytes.length >= 12 && ascii(4, 8) === 'ftyp';
  }

  async function read(file) {
    if (!file || file.size > MAX_BUNDLE_BYTES) throw new Error('Choose a memory collection smaller than 85 MB.');
    let bundle;
    try { bundle = JSON.parse(await file.text()); }
    catch { throw new Error('This memory collection could not be read.'); }
    if (bundle?.format !== 'astralis-nova-memory-collection' || bundle.version !== 1 ||
        !/^[a-f0-9]{64}$/.test(bundle.id || '') || !Array.isArray(bundle.files) ||
        !bundle.files.length || bundle.files.length > 30) throw new Error('Choose an Astralis Nova photo and video collection.');
    const names = new Set();
    let total = 0;
    // Validate every size before decoding or staging any of the collection.
    for (const item of bundle.files) {
      if (!TYPES.has(item?.type) || !Number.isSafeInteger(item.size) || item.size < 1 ||
          item.size > MAX_FILE_BYTES || typeof item.data !== 'string' ||
          item.data.length !== 4 * Math.ceil(item.size / 3) ||
          !/^[a-f0-9]{64}$/.test(item.sha256 || '') ||
          typeof item.name !== 'string' || item.name.length > 160 ||
          !item.name.trim() || /[\x00-\x1f/\\]/.test(item.name) || names.has(item.name)) {
        throw new Error('A collection file is unsupported, duplicated, or too large. Nothing was saved.');
      }
      names.add(item.name);
      total += item.size;
      if (total > MAX_TOTAL_BYTES) throw new Error('This collection exceeds the 60 MB limit. Nothing was saved.');
    }
    const files = [];
    for (const item of bundle.files) {
      let binary;
      try { binary = atob(item.data); }
      catch { throw new Error('A collection file is damaged. Nothing was saved.'); }
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      binary = null;
      if (bytes.length !== item.size || !matchesMedia(bytes, item.type)) throw new Error('A collection file does not match its media type. Nothing was saved.');
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== item.sha256) throw new Error('A collection file failed its integrity check. Nothing was saved.');
      files.push(new File([bytes], item.name, { type: item.type }));
      item.data = '';
    }
    const photos = files.filter(f => f.type.startsWith('image/')).length;
    const videos = files.length - photos;
    return {
      id: bundle.id, files, photos, videos, total,
      proposal: {
        title: clean(bundle.title, 140) || 'Cherished memories', category: 'Family',
        occurredOn: '', places: [], people: [], feelings: [], themes: ['family', 'cherished memories'],
        summary: clean(bundle.summary, 1200) || `${photos} photos and ${videos} videos selected for the private archive.`,
        story: clean(bundle.story, 12000),
        questions: [`All ${files.length} files passed their integrity checks. Review the title and story, then choose Approve and remember to encrypt the collection on this device.`, 'Names and dates are left blank so you can add them accurately.'],
        confidence: 'needs-review', mode: 'local-extraction'
      }
    };
  }
  window.NovaMemoryCollection = Object.freeze({ read });
})();
