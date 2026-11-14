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
    '<path d="M296 64 306 67 309 68 306 69 296 72Z" fill="#141923"/>',
    '<path d="M251 61 264 63 281 67 265 67Z" fill="#141c28"/>',
    '<path d="M251 75 264 73 281 69 265 69Z" fill="#141c28"/>',
    '<text x="132" y="48" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="12" fill="#1c334c">NASA</text>',
    '<text x="158" y="89" text-anchor="middle" font-family="Arial,sans-serif" font-weight="bold" font-size="11" fill="#25384b">USA</text>',
    '<rect x="178" y="83" width="27" height="14" fill="#f5f5f5"/>',
    '<path d="M178 85h27m-27 3h27m-27 3h27m-27 3h27" stroke="#ba2031" stroke-width="1"/>',
    '<rect x="178" y="83" width="11" height="7.5" fill="#193e79"/>',
    '<text x="159" y="70" fill="#172333" font-size="7.5" font-family="Arial,sans-serif" font-weight="bold" text-anchor="middle">CHALLENGER</text>',
    '</svg>'
  ].join('');
  const css = [
    '.challenger-flight-lane{position:absolute;z-index:9;left:-27%;top:3%;width:154%;height:105px;pointer-events:none;overflow:visible;isolation:isolate}',
    '.challenger-ship{position:absolute;left:-38%;top:0;width:clamp(155px,17vw,225px);border:0;background:none;padding:8px;cursor:pointer;pointer-events:auto;filter:drop-shadow(0 8px 10px #0009) drop-shadow(0 0 7px #9ecfff66);transform-origin:center;animation:challenger-cross 33s ease-in-out -12s infinite}',
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
    '.challenger-mini-flight{position:absolute;z-index:4;pointer-events:none;top:-13px;left:-15px;width:65px;filter:drop-shadow(0 0 4px #92ceff);animation:challenger-mini-pass 16s ease-in-out -6s infinite}',
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
    enhanceHomeMini();
    return true;
  }

  // NASA's historical orbiter GLB provides true 3D geometry and material shading.
  // This generic shuttle-family model is used as an interpretive tribute to OV-099.
  const nasaOrbiterModel='https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/3D%20Models/Space%20Shuttle%20(D)/Space%20Shuttle%20(D).glb';
  const viewerLibrary='https://cdnjs.cloudflare.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js';
  let viewerLoading=null;
  const realismCSS=[
    '.challenger-ship{aspect-ratio:2.05 / 1;height:auto;transform-style:preserve-3d;perspective:650px;will-change:transform,left;contain:layout style}',
    '.challenger-svg-fallback{display:block;width:100%;height:100%;transition:opacity .8s ease}',
    '.challenger-svg-fallback .challenger-shuttle-art{height:100%;object-fit:contain}',
    '.challenger-real3d{position:absolute;inset:-24% -9%;width:118%;height:148%;display:block;pointer-events:none!important;opacity:0;filter:brightness(1.1) contrast(1.05) drop-shadow(0 5px 9px #0005);transition:opacity .9s ease;background:transparent}',
    '.challenger-3d-ready>.challenger-real3d{opacity:1}',
    '.challenger-3d-ready>.challenger-svg-fallback{opacity:0}',
    '.challenger-mini-flight{width:94px;max-width:none;height:72px}',
    '.challenger-mini-flight .challenger-real3d{inset:-8% -8%;width:116%;height:116%}',
    '.challenger-memorial .challenger-3d-inspection{height:260px;position:relative;margin:12px 0 10px;background:radial-gradient(ellipse at 50% 65%,#1b35529c,#050b1a 68%);border:1px solid #6b9eca77;border-radius:12px;overflow:hidden}',
    '.challenger-3d-inspection model-viewer{display:block;width:100%;height:100%;background:transparent}',
    '.challenger-3d-inspection figcaption{position:absolute;left:10px;bottom:7px;right:10px;color:#d0e9ff;font-size:.73rem;text-align:center;pointer-events:none;text-shadow:0 1px 6px #000}',
    '.challenger-3d-inspection .challenger-inspect-fallback{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}',
    '.challenger-3d-inspection .challenger-inspect-fallback svg{max-width:90%;height:auto;filter:drop-shadow(0 5px 9px #0008)}',
    '.challenger-3d-inspection.challenger-3d-ready .challenger-inspect-fallback{display:none}',
    '.challenger-3d-inspection model-viewer{opacity:0;transition:opacity .8s ease}',
    '.challenger-3d-inspection.challenger-3d-ready model-viewer{opacity:1}',
    '@media(max-width:680px){.challenger-ship{width:clamp(138px,40vw,175px)}.challenger-mini-flight{width:74px;height:58px}.challenger-memorial .challenger-3d-inspection{height:210px}}',
    '@media(prefers-reduced-motion:reduce){.challenger-real3d{transition:none}.challenger-ship{will-change:auto}}'
  ].join('\n');

  function load3DRenderer(){
    if(!('customElements' in window)||!('WebGLRenderingContext' in window))return Promise.reject(new Error('3D unavailable'));
    if(customElements.get('model-viewer'))return Promise.resolve();
    if(!viewerLoading){
      viewerLoading=new Promise((resolve,reject)=>{
        const tag=document.createElement('script');
        tag.type='module';
        tag.src=viewerLibrary;
        tag.onload=()=>customElements.whenDefined('model-viewer').then(resolve,reject);
        tag.onerror=()=>reject(new Error('3D library unavailable'));
        document.head.appendChild(tag);
      });
    }
    return viewerLoading;
  }
  function buildModelViewer(interactive){
    const model=document.createElement('model-viewer');
    model.setAttribute('alt','NASA Space Shuttle orbiter rendered in 3D as a memorial to Challenger');
    model.setAttribute('environment-image','neutral');
    model.setAttribute('exposure','1.35');
    model.setAttribute('shadow-intensity','0');
    model.setAttribute('camera-orbit',interactive?'28deg 63deg 105%':'30deg 60deg 104%');
    model.setAttribute('field-of-view',interactive?'27deg':'29deg');
    model.setAttribute('interaction-prompt','none');
    model.setAttribute('loading','eager');
    if(interactive){
      model.setAttribute('camera-controls','');
      model.setAttribute('touch-action','pan-y');
      model.setAttribute('disable-zoom','');
      model.setAttribute('auto-rotate-delay','1800');
      model.setAttribute('rotation-per-second','6deg');
    } else {
      model.className='challenger-real3d';
      model.setAttribute('rotation-per-second','8deg');
    }
    if(!document.documentElement.classList.contains('space-motion-paused') &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      model.setAttribute('auto-rotate','');
    }
    return model;
  }
  function attach3D(target,interactive){
    if(!target||target.dataset.challenger3d)return;
    target.dataset.challenger3d='pending';
    load3DRenderer().then(()=>{
      if(!target.isConnected)return;
      const viewer=buildModelViewer(interactive);
      if(!interactive){
        const backup=document.createElement('span');
        backup.className='challenger-svg-fallback';
        while(target.firstChild)backup.appendChild(target.firstChild);
        target.appendChild(backup);
      }
      target.appendChild(viewer);
      viewer.addEventListener('load',()=>{target.classList.add('challenger-3d-ready')},{once:true});
      viewer.addEventListener('error',()=>{target.classList.remove('challenger-3d-ready')},{once:true});
      // Set source only after listeners exist. The browser caches the shared NASA GLB.
      viewer.setAttribute('src',nasaOrbiterModel);
      const sync=()=>{
        if(document.documentElement.classList.contains('space-motion-paused') ||
           window.matchMedia('(prefers-reduced-motion: reduce)').matches){
          viewer.removeAttribute('auto-rotate');
        }else{
          viewer.setAttribute('auto-rotate','');
        }
      };
      const observer=new MutationObserver(sync);
      observer.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
      viewer.addEventListener('model-visibility',()=>{if(!target.isConnected)observer.disconnect()});
    }).catch(()=>{
      target.dataset.challenger3d='fallback';
    });
  }
  function addMemorialModel(){
    const details=document.getElementById('challengerMemorial');
    if(!details||details.dataset.challengerInspect)return;
    details.dataset.challengerInspect='ready';
    const sources=document.createElement('p');
    sources.className='challenger-model-credit';
    sources.innerHTML='3D spacecraft: <a href="https://science.nasa.gov/3d-resources/space-shuttle-d/" target="_blank" rel="noopener noreferrer">NASA Space Shuttle model</a>. This is a shuttle-family reference model, not a scan of Challenger itself.';
    details.appendChild(sources);
    const fig=document.createElement('figure');
    fig.className='challenger-3d-inspection';
    fig.innerHTML='<div class="challenger-inspect-fallback">'+shuttleSVG+'</div><figcaption>Rotate with a finger or mouse · NASA orbiter-only reference</figcaption>';
    const list=details.querySelector('ul');
    if(list)list.before(fig);
    const onToggle=()=>{if(details.open)attach3D(fig,true);};
    details.addEventListener('toggle',onToggle);
    if(details.open)onToggle();
  }
  function enhanceHomeMini(){
    const mini=document.querySelector('.challenger-mini-flight');
    if(mini)attach3D(mini,false);
  }
  const identityCSS = [
    '.challenger-flight-lane{z-index:14;overflow:visible}',
    '.challenger-flight-lane::before{content:"";position:absolute;right:7%;top:-15px;width:clamp(68px,11vw,105px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 29% 23%,#d6edff44,transparent 44%),url("/astralis-earth.png") center / cover no-repeat;opacity:.46;box-shadow:inset -20px -10px 28px #000d,0 0 22px #6eb0ff40;pointer-events:none}',
    '.challenger-ship{width:clamp(210px,26vw,300px)!important;min-height:106px!important;overflow:visible;filter:drop-shadow(0 0 9px #4a9bcc99) drop-shadow(0 8px 12px #000b)}',
    '.challenger-real3d{inset:-20% -7%;width:114%;height:140%;filter:brightness(1.25) contrast(1.11) drop-shadow(0 5px 11px #000a)}',
    '.challenger-ship::after{content:"🇺🇸  CHALLENGER  ·  OV-099";display:block;position:absolute;z-index:12;left:1%;right:1%;bottom:-19px;padding:5px 3px;color:#fff;font:850 11px ui-sans-serif,system-ui,sans-serif;letter-spacing:.075em;text-align:center;white-space:nowrap;text-shadow:0 1px 4px #000,0 0 6px #000;background:linear-gradient(90deg,#05172ddf,#113556e9,#06172bdc);border:1px solid #9edbffb3;border-radius:5px;box-shadow:0 5px 12px #0009;pointer-events:none}',
    '.challenger-mini-flight::after{display:none}',
    '.challenger-signal{font-size:.84rem;line-height:1.6;letter-spacing:.07em}',
    '.challenger-memorial{border-color:#93cfff9c;background:linear-gradient(145deg,#112b47ed,#07101deb)}',
    '.challenger-memorial>summary{font-weight:800;color:#e4f4ff}',
    '.challenger-3d-inspection::before{content:"";position:absolute;bottom:-44%;left:-22%;width:144%;height:83%;border-radius:50%;background:radial-gradient(ellipse at 50% 7%,#c3e7ff69 2%,#428cca72 6%,#103a6961 22%,transparent 63%);pointer-events:none}',
    '.challenger-inspection-marker{position:absolute;z-index:5;top:10px;left:10px;right:10px;display:flex;gap:6px;flex-wrap:wrap;pointer-events:none}',
    '.challenger-inspection-marker span{display:inline-block;border:1px solid #9fdbff66;background:#071a2ee8;color:#fff;border-radius:4px;padding:3px 7px;font-size:10px;font-weight:800;letter-spacing:.04em;text-shadow:0 1px 3px #000}',
    '@media(max-width:680px){.challenger-ship{width:clamp(170px,49vw,220px)!important;min-height:85px!important}.challenger-ship::after{bottom:-14px;font-size:9px;padding:3px}.challenger-flight-lane::before{right:1%;width:65px}.challenger-memorial{margin-top:15px}}'
  ].join('\n');
  function addOrbiterIdentity(){
    const ship=document.querySelector('.challenger-ship');
    if(ship)ship.setAttribute('aria-label','Space Shuttle Challenger OV-099, orbiter only, in space. Open the crew memorial.');
    const figure=document.querySelector('.challenger-3d-inspection');
    if(figure&&!figure.querySelector('.challenger-inspection-marker')){
      const marker=document.createElement('div');
      marker.className='challenger-inspection-marker';
      marker.innerHTML='<span>🇺🇸 CHALLENGER</span><span>OV-099</span><span>ORBITER ONLY</span>';
      figure.prepend(marker);
    }
    const source=document.querySelector('.challenger-model-credit');
    if(source&&!source.dataset.orbiterNote){
      source.dataset.orbiterNote='true';
      source.append(' The model depicts just the orbiter, with no external tank or solid rocket boosters. The Challenger identification is a memorial overlay, not an original NASA model texture.');
    }
  }

  function installReal3D(){
    if(document.getElementById('challengerReal3DStyles'))return;
    const style=document.createElement('style');
    style.id='challengerReal3DStyles';
    style.textContent=realismCSS+'\n'+identityCSS;
    document.head.appendChild(style);
    const ship=document.querySelector('.challenger-ship');
    if(ship)attach3D(ship,false);
    enhanceHomeMini();
    addMemorialModel();
    addOrbiterIdentity();
  }

  function boot(){
    installStyles();
    installPlanetTribute();
    installReal3D();
    if(installLandingFlyby())return;
    const worlds=document.getElementById('connected-worlds');
    if(!worlds)return;
    const observer=new MutationObserver(()=>{if(installLandingFlyby()){enhanceHomeMini();observer.disconnect();}});
    observer.observe(worlds,{childList:true,subtree:true});
    window.setTimeout(()=>observer.disconnect(),15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();