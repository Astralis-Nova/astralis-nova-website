(function(){
  const existing = document.getElementById('astralis-celestial-drift');
  const layer = existing || document.createElement('div');

  layer.id = 'astralis-celestial-drift';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <img class="celestial gas" src="/astralis-gas-giant.png" alt="">
    <img class="celestial earth" src="/astralis-earth.png" alt="">
    <img class="celestial mars" src="/astralis-mars.png" alt="">
    <img class="celestial ringed" src="/planet-gas-giant.svg" alt="">
    <img class="celestial comet" src="/comet-c2026-a1-maps.svg" alt="">
  `;

  if (!existing) document.body.prepend(layer);
})();