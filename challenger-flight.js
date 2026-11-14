(() => {
  "use strict";
  // An imagined tribute flight, not a reconstruction of STS-51-L.
  const shuttleSVG = [
    '<svg class="challenger-shuttle-art" viewBox="0 0 320 136" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
    '<defs><linearGradient id="challenger-hull" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".6" stop-color="#e1eaf4"/><stop offset="1" stop-color="#94a7bc"/></linearGradient></defs>',
    '<path d="M91 62 49 5 73 9 196 58 196 77 73 127 49 131 91 74Z" fill="#dbe5f1" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>',
    '<path d="M77 13 104 61 162 61ZM77 123 104 75 162 75Z" fill="#384658" opacity=".43"/>',
    '<path d="M49 61 29 35 44 35 109 60ZM49 75 29 101 44 101 109 76Z" fill="#f7faff" stroke="#8b9cad" stroke-width="2"/>',
    '<path d="M29 58 H239 C263 58 291 63 309 68 291 73 263 78 239 78 H29 Q22 68 29 58Z" fill="url(#challenger-hull)" stroke="#f9fcff" stroke-width="2"/>',
    '<path d="M271 61 294 66 276 68 259 65 252 61ZM271 75 294 70 276 68 259 71 252 75Z" fill="#233244"/>',
    '<path d="M91 58 86 24 104 58Z" fill="#f5f8fc" stroke="#8194a6" stroke-width="1.6"/>',
    '<path d="M58 61 H233 M58 75 H233" stroke="#8299ad" stroke-width="1" opacity=".6"/>',
    '<rect x="141" y="62" width="36" height="12" rx="2" fill="#c7d3df" stroke="#8a9aac" stroke-width="1"/>',
    '<text x="159" y="70" fill="#314153" font-size="6" font-family="Arial,sans-serif" font-weight="bold" text-anchor="middle">CHALLENGER</text>',
    '<circle cx="28" cy="61" r="6" fill="#26333f" stroke="#d4e5f1" stroke-width="2"/>',
    '<circle cx="23" cy="68" r="6" fill="#26333f" stroke="#d4e5f1" stroke-width="2"/>',
    '<circle cx="28" cy="75" r="6" fill="#26333f" stroke="#d4e5f1" stroke-width="2"/>',
    '</svg>'
  ].join('');
  const css = [
    '.challenger-flight-lane{position:absolute;z-index:9;left:-27%;top:3%;width:154%;height:105px;pointer-events:none;overflow:visible;isolation:isolate}',
    '.challenger-ship{position:absolute;left:-38%;top:0;width:clamp(155px,17vw,225px);border:0;background:none;padding:8px;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 8px 10px #0009) drop-shadow(0 0 7px #9ecfff66);transform-origin:center;animation:challenger-cross 33s ease-in-out infinite}',
    '.challenger-shuttle-art{display:block;width:100%;height:auto}',
    '.challenger-ship:hover,.challenger-ship:focus-visible{filter:drop-shadow(0 0 13px #d9f3ff) drop-shadow(0 5px 9px #000b)}',
    '.challenger-ship:focus-visible{outline:2px solid #bdeeff;outline-offset:3px;border-radius:16px}',
    '.challenger-starlight{position:absolute;left:-12%;top:50%;width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 8px #c7eaff,0 0 17px #82beff;opacity:.8;animation:challenger-twinkle 4s ease-in-out infinite alternate}',
    '.challenger-starlight:nth-child(2){left:1%;top:75%;width:5px;height:5px;animation-delay:-2.5s}',
    '.challenger-starlight:nth-child(3){left:18%;top:12%;width:4px;height:4px;animation-delay:-1s}',
    '.challenger-starlight:nth-child(4){left:35%;top:76%;width:6px;height:6px;animation-delay:-3s}',
    '.challenger-starlight:nth-child(5){left:52%;top:2%;width:4px;height:4px;animation-delay:-1.7s}',
    '.challenger-starlight:nth-child(6){left:70%;top:70%;width:5px;height:5px;animation-delay:-.5s}',
    '.challenger-starlight:nth-child(7){left:91%;top:10%;width:6px;height:6px;animation-delay:-3.4s}',
    '.challenger-signal{max-width:380px;font-size:.76rem;letter-spacing:.06em;color:#d5e9fd;text-align:center;margin:7px auto 3px;text-shadow:0 1px 10px #010713}',
    '.challenger-signal strong{color:#fff;font-weight:750}',
    '.challenger-memorial{width:min(100%,440px);max-width:440px;padding:10px 15px;margin:8px auto 0;border:1px solid #7abfee66;border-radius:14px;background:linear-gradient(140deg,#08182ce8,#030a18e8);box-shadow:0 7px 28px #0006;color:#d6eaff;text-align:left;line-height:1.55}',
    '.challenger-memorial>summary{font-size:.83rem;cursor:pointer;color:#d5edff;font-weight:700;list-style-position:inside}',
    '.challenger-memorial[open]{border-color:#9bd5ff}',
    '.challenger-memorial p{font-size:.84rem;margin:12px 0;color:#c5d7e9}',
    '.challenger-memorial ul{list-style:disc;padding:0 0 0 20px;margin:9px 0 12px;columns:2;column-gap:18px;font-size:.78rem}',
    '.challenger-memorial li{break-inside:avoid;margin-bottom:5px}',
    '.challenger-memorial a{color:#9fe0ff;font-size:.84rem}',
    '.challenger-mini-flight{position:absolute;z-index:4;pointer-events:none;top:-13px;left:-15px;width:65px;filter:drop-shadow(0 0 4px #92ceff);animation:challenger-mini-pass 16s ease-in-out infinite}',
    '.challenger-mini-flight .challenger-shuttle-art{display:block;width:100%;height:auto}',
    '@keyframes challenger-cross{0%{left:-38%;transform:translateY(17px) scale(.78) rotate(-8deg);opacity:0}7%{opacity:1}48%{transform:translateY(-13px) scale(1.03) rotate(-4deg);opacity:1}92%{opacity:1}100%{left:106%;transform:translateY(19px) scale(.75) rotate(-7deg);opacity:0}}',
    '@keyframes challenger-mini-pass{0%,100%{transform:translate(-26px,21px) scale(.62);opacity:0}18%{opacity:1}52%{transform:translate(51px,-23px) scale(1.1);opacity:1}84%{opacity:1}95%{transform:translate(106px,16px) scale(.65);opacity:0}}',
    '@keyframes challenger-twinkle{from{opacity:.2;transform:scale(.65)}to{opacity:1;transform:scale(1.25)}}',
    '.space-motion-paused .challenger-ship,.space-motion-paused .challenger-starlight,.space-motion-paused .challenger-mini-flight{animation-play-state:paused}',
    '@media(max-width:680px){.challenger-flight-lane{top:1%;left:-24%;width:148%;height:90px}.challenger-ship{width:145px}.challenger-memorial ul{columns:1}.challenger-signal{font-size:.7rem}.challenger-memorial{padding:10px 12px}}',
    '@media(prefers-reduced-motion:reduce){.challenger-ship,.challenger-starlight,.challenger-mini-flight{animation:none!important}.challenger-ship{left:48%;top:0;transform:translateX(-50%) rotate(-5deg)!important;opacity:1}.challenger-mini-flight{transform:translate(49px,-20px);opacity:1}}'
  ].join('\n');
  function installStyles(){
    if(document.getElementById('challengerFlightStyles'))return;
    const style=document.createElement('style');
    style.id='challengerFlightStyles';
    style.textContent=css;
    document.head.appendChild(style);
  }
  function installPlanetTribute(){
    const stage=document.querySelector('.hero .sphere-stage');
    if(!stage||stage.querySelector('.challenger-flight-lane'))return;
    const lane=document.createElement('div');
    lane.className='challenger-flight-lane';
    lane.innerHTML=Array(7).fill('<span class="challenger-starlight"></span>').join('')+
      '<button type="button" class="challenger-ship" aria-label="Space Shuttle Challenger in a symbolic flight. Open the memorial to its seven crew members." aria-controls="challengerMemorial">'+shuttleSVG+'</button>';
    stage.prepend(lane);
    const line=document.createElement('p');
    line.className='challenger-signal';
    line.innerHTML='<strong>CHALLENGER · OV-099</strong> &nbsp; ✦ &nbsp; A symbolic flight for seven bright stars';
    stage.appendChild(line);
    const tribute=document.createElement('details');
    tribute.className='challenger-memorial';
    tribute.id='challengerMemorial';
    tribute.innerHTML=[
      '<summary>Meet Challenger’s seven crew members · STS-51-L</summary>',
      '<p>On January 28, 1986, Space Shuttle Challenger and all seven crew members were lost shortly after launch. This imagined journey through Astralis Nova’s sky honors their lives and aspirations. It is not a depiction of the final mission.</p>',
      '<ul><li>Francis R. Scobee</li><li>Michael J. Smith</li><li>Judith A. Resnik</li><li>Ronald E. McNair</li><li>Ellison S. Onizuka</li><li>Gregory B. Jarvis</li><li>S. Christa McAuliffe</li></ul>',
      '<a href="https://www.nasa.gov/challenger-sts-51l-accident/" target="_blank" rel="noopener noreferrer">Remember the crew with NASA ↗</a>'
    ].join('');
    stage.appendChild(tribute);
    lane.querySelector('.challenger-ship').addEventListener('click',()=>{
      tribute.open=true;
      tribute.querySelector('summary').focus({preventScroll:true});
      tribute.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
    });
  }
  function installLandingFlyby(){
    const planet=document.querySelector('.astralis-planet-link[data-world="reserved-world"] .planet-nova-sphere');
    if(!planet||planet.querySelector('.challenger-mini-flight'))return false;
    const mini=document.createElement('span');
    mini.className='challenger-mini-flight';
    mini.setAttribute('aria-hidden','true');
    mini.innerHTML=shuttleSVG;
    planet.appendChild(mini);
    return true;
  }
  function boot(){
    installStyles();
    installPlanetTribute();
    if(installLandingFlyby())return;
    const worlds=document.getElementById('connected-worlds');
    if(!worlds)return;
    const observer=new MutationObserver(()=>{if(installLandingFlyby())observer.disconnect();});
    observer.observe(worlds,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();