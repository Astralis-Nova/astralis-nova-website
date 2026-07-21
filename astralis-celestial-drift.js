(function(){
  const existing = document.getElementById('astralis-celestial-drift');
  const layer = existing || document.createElement('div');

  layer.id = 'astralis-celestial-drift';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <img class="celestial beta" src="/recent-beta-pictoris-d.svg" alt="">
    <img class="celestial toi" src="/recent-toi-1752-b.svg" alt="">
    <img class="celestial wispit" src="/recent-wispit-2b.svg" alt="">
    <img class="celestial gaia" src="/recent-gaia23bra-b.svg" alt="">
    <img class="celestial comet" src="/comet-c2026-a1-maps.svg" alt="">
  `;

  if (!existing) document.body.prepend(layer);
})();
