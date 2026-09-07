(() => {
  'use strict';

  const STYLE_ID='astralis-nova-planet-orbit-style';
  const ACTIVE='body[data-skin="nova"],body[data-skin="legacy83"]';

  function installStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      body[data-skin="nova"] .art-wrap,
      body[data-skin="legacy83"] .art-wrap{
        overflow:visible;
        isolation:isolate;
        background:
          radial-gradient(circle at 50% 50%,#153b5f66 0 35%,transparent 67%),
          radial-gradient(circle at 50% 50%,#07182b 0 62%,#01040a 76%);
        box-shadow:0 0 24px #49dfff3d,inset 0 0 35px #07182bcc;
      }
      body[data-skin="nova"] .art-wrap{border-color:#2c789d}
      body[data-skin="legacy83"] .art-wrap{border-color:#65594e}

      body[data-skin="nova"] .art-wrap > #cover,
      body[data-skin="legacy83"] .art-wrap > #cover{
        opacity:0;
        pointer-events:none;
      }

      .nova-planet-scene{
        display:none;
        position:absolute;
        inset:-18%;
        z-index:1;
        pointer-events:none;
        perspective:700px;
        transform-style:preserve-3d;
      }
      body[data-skin="nova"] .nova-planet-scene,
      body[data-skin="legacy83"] .nova-planet-scene{display:block}

      .nova-planet-core{
        position:absolute;
        left:50%;
        top:50%;
        width:69%;
        aspect-ratio:1;
        transform:translate(-50%,-50%) rotate(-8deg);
        border-radius:50%;
        z-index:4;
        filter:drop-shadow(0 0 11px #6ee5ff73) drop-shadow(0 0 26px #344cff4d);
      }
      .nova-planet-core::before{
        content:"";
        position:absolute;
        inset:-3.5%;
        border-radius:50%;
        background:radial-gradient(circle at 28% 22%,#e6fbff85 0 1.2%,#65ddff2b 12%,transparent 47%);
        box-shadow:inset -17px -12px 28px #020916b8,0 0 18px #58dfff6b,0 0 44px #496cff38;
        z-index:2;
      }
      .nova-planet-texture{
        width:100%;height:100%;display:block;object-fit:contain;border-radius:50%;
        animation:novaPlanetRotate 42s linear infinite;
        filter:saturate(1.18) contrast(1.08) brightness(.98);
        will-change:transform;
      }
      .nova-planet-atmosphere{
        position:absolute;inset:-5.5%;border-radius:50%;border:1px solid #8cecff7a;
        box-shadow:0 0 9px #62dcff9e,0 0 26px #3a6fff66,inset 0 0 18px #74e7ff35;
        animation:novaAtmosphere 5.5s ease-in-out infinite;z-index:5;
      }

      .nova-orbit{position:absolute;inset:0;z-index:6}
      .nova-orbit::before{
        content:"";position:absolute;left:50%;top:50%;width:82%;height:44%;
        transform:translate(-50%,-50%) rotate(-11deg);
        border:1px solid #75dfff35;border-radius:50%;box-shadow:0 0 9px #4edfff1d;
      }
      .nova-orbit-b::before{
        width:94%;height:60%;transform:translate(-50%,-50%) rotate(24deg);border-color:#9b7cff2d;
      }
      .nova-moon{
        position:absolute;left:0;top:0;border-radius:50%;
        background:
          radial-gradient(circle at 30% 27%,#e4e7ec 0 7%,transparent 8%),
          radial-gradient(circle at 62% 37%,#676d78 0 10%,transparent 11%),
          radial-gradient(circle at 44% 72%,#555b66 0 8%,transparent 9%),
          radial-gradient(circle at 35% 30%,#d6d9df,#858b96 40%,#3d4350 68%,#161a23 100%);
        box-shadow:inset -7px -7px 12px #05070bb8,inset 3px 3px 6px #ffffff42,0 0 10px #d5f5ff8a,0 0 22px #5aa8ff4d;
        will-change:offset-distance,transform,filter;
      }
      .nova-moon-a{
        width:42px;height:42px;offset-path:ellipse(41% 22% at 50% 50%);offset-rotate:0deg;
        animation:novaMoonA 14s linear infinite;
      }
      .nova-moon-b{
        width:27px;height:27px;
        background:
          radial-gradient(circle at 62% 33%,#80788e 0 9%,transparent 10%),
          radial-gradient(circle at 33% 64%,#514a5e 0 8%,transparent 9%),
          radial-gradient(circle at 34% 29%,#c9c3d9,#746e80 47%,#2d2a37 75%,#121119 100%);
        offset-path:ellipse(47% 31% at 50% 50%);offset-rotate:0deg;
        animation:novaMoonB 23s linear infinite reverse;
      }

      body[data-skin="nova"] .art-wrap .favorite,
      body[data-skin="legacy83"] .art-wrap .favorite{z-index:12}

      @keyframes novaPlanetRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      @keyframes novaAtmosphere{0%,100%{opacity:.72;transform:scale(1)}50%{opacity:1;transform:scale(1.022)}}
      @keyframes novaMoonA{
        0%{offset-distance:0%;transform:scale(.78);filter:brightness(.68)}
        24%{transform:scale(1);filter:brightness(.96)}
        50%{offset-distance:50%;transform:scale(1.26);filter:brightness(1.3)}
        76%{transform:scale(1);filter:brightness(.95)}
        100%{offset-distance:100%;transform:scale(.78);filter:brightness(.68)}
      }
      @keyframes novaMoonB{
        0%{offset-distance:0%;transform:scale(.84);filter:brightness(.74)}
        50%{offset-distance:50%;transform:scale(1.18);filter:brightness(1.22)}
        100%{offset-distance:100%;transform:scale(.84);filter:brightness(.74)}
      }

      @media(max-width:760px){
        .nova-planet-scene{inset:-12%}
        .nova-moon-a{width:35px;height:35px}
        .nova-moon-b{width:22px;height:22px}
      }
      @media(prefers-reduced-motion:reduce){
        .nova-planet-texture,.nova-planet-atmosphere,.nova-moon-a,.nova-moon-b{animation:none!important}
        .nova-moon-a{offset-distance:18%}.nova-moon-b{offset-distance:68%}
      }
    `;
    document.head.appendChild(style);
  }

  function buildScene(){
    const wrap=document.querySelector('.art-wrap');
    if(!wrap || wrap.querySelector('.nova-planet-scene')) return;
    const scene=document.createElement('div');
    scene.className='nova-planet-scene';
    scene.setAttribute('aria-hidden','true');
    scene.innerHTML=`
      <div class="nova-orbit nova-orbit-a"><span class="nova-moon nova-moon-a"></span></div>
      <div class="nova-orbit nova-orbit-b"><span class="nova-moon nova-moon-b"></span></div>
      <div class="nova-planet-core">
        <img class="nova-planet-texture" src="../astralis-gas-giant.png" alt="" loading="eager" decoding="async">
        <span class="nova-planet-atmosphere"></span>
      </div>`;
    wrap.insertBefore(scene,wrap.firstChild);
  }

  function init(){installStyles();buildScene();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();