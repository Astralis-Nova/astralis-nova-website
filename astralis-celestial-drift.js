
(function(){
  if (document.getElementById('astralis-celestial-drift')) return;
  const layer = document.createElement('div');
  layer.id = 'astralis-celestial-drift';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = `
    <img class="celestial gas" src="astralis-gas-giant.png" alt="">
    <img class="celestial earth" src="astralis-earth.png" alt="">
    <img class="celestial mars" src="astralis-mars.png" alt="">
    <img class="celestial comet" src="astralis-comet.png" alt="">
  `;
  document.body.prepend(layer);
})();
