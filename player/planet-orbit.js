(() => {
  'use strict';

  const STYLE_ID='astralis-nova-planet-orbit-style';

  function installStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      body[data-skin="nova"] .art-wrap{
        overflow:visible;
        isolation:isolate;
        background:
          radial-gradient(circle at 50% 50%,#153b5f66 0 35%,transparent 67%),
          radial-gradient(circle at 50% 50%,#07182b 0 62%,#01040a 76%);
        border-color:#2c789d;
        box-shadow:0 0 24px #49dfff3d,inset 0 0 35px #07182bcc;
      }
      body[data-skin="nova"] .art-wrap > #cover{
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
      body[data-skin="nova"] .nova-planet-scene{display:block}
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
        pointer-events:none;
      }
      .nova-planet-texture{
        width:100%;
        height:100%;
        display:block;
        object-fit:contain;
        border-radius:50%;
        transform:rotate(0deg);
        animation:novaPlanetRotate 58s linear infinite;
        filter:saturate(1.12) contrast(1.06) brightness(.94);
        will-change:transform;
      }
      .nova-planet-atmosphere{
        position:absolute;
        inset:-5.5%;
        border-radius:50%;
        border:1px solid #8cecff7a;
        box-shadow:0 0 9px #62dcff9e,0 0 26px #3a6fff66,inset 0 0 18px #74e7ff35;
        animation:novaAtmosphere 5.5s ease-in-out infinite;
        z-index:5;
      }
      .nova-orbit{
        position:absolute;
        inset:0;
        z-index:6;
      }
      .nova-orbit::before{
        content:"";
        position:absolute;
        left:50%;
        top:50%;
        width:78%;
        height:42%;
        transform:translate(-50%,-50%) rotate(-11deg);
        border:1px solid #75dfff24;
        border-radius:50%;
        box-shadow:0 0 9px #4edfff11;
      }
      .nova-orbit-b::before{
        width:90%;
        height:58%;
        transform:translate(-50%,-50%) rotate(24deg);
        border-color:#9b7cff1f;
      }
      .nova-moon{
        position:absolute;
        left:0;
        top:0;
        border-radius:50%;
        background:
          radial-gradient(circle at 30% 27%,#d5d8de 0 7%,transparent 8%),
          radial-gradient(circle at 62% 37%,#676d78 0 10%,transparent 11%),
          radial-gradient(circle at 44% 72%,#555b66 0 8%,transparent 9%),
          radial-gradient(circle at 35% 30%,#c8cbd1,#787e89 40%,#343944 68%,#161a23 100%);
        box-shadow:inset -7px -7px 12px #05070bb8,inset 3px 3px 6px #ffffff42,0 0 9px #c7efff5c,0 0 18px #5aa8ff2d;
        will-change:offset-distance,transform,filter;
      }
      .nova-moon-a{
        width:36px;
        height:36px;
        offset-path:ellipse(39% 21% at 50% 50%);
        offset-rotate:0deg;
        animation:novaMoonA 16s linear infinite;
      }
      .nova-moon-b{
        width:22px;
        height:22px;
        background:
          radial-gradient(circle at 62% 33%,#756d82 0 9%,transparent 10%),
          radial-gradient(circle at 33% 64%,#4c4657 0 8%,transparent 9%),
          radial-gradient(circle at 34% 29%,#bbb5cd,#6e6879 47%,#292633 75%,#121119 100%);
        offset-path:ellipse(45% 30% at 50% 50%);
        offset-rotate:0deg;
        animation:novaMoonB 25s linear infinite reverse;
      }
      body[data-skin="nova"] .art-wrap .favorite{z-index:12}
      @keyframes novaPlanetRotate{
        from{transform:rotate(0deg)}
        to{transform:rotate(360deg)}
      }
      @keyframes novaAtmosphere{
        0%,100%{opacity:.72;transform:scale(1)}
        50%{opacity:1;transform:scale(1.018)}
      }
      @keyframes novaMoonA{
        0%{offset-distance:0%;transform:scale(.82);filter:brightness(.72)}
        24%{transform:scale(1);filter:brightness(.94)}
        50%{offset-distance:50%;transform:scale(1.18);filter:brightness(1.2)}
        76%{transform:scale(1);filter:brightness(.92)}
        100%{offset-distance:100%;transform:scale(.82);filter:brightness(.72)}
      }
      @keyframes novaMoonB{
        0%{offset-distance:0%;transform:scale(.88);filter:brightness(.78)}
        50%{offset-distance:50%;transform:scale(1.12);filter:brightness(1.16)}
        100%{offset-distance:100%;transform:scale(.88);filter:brightness(.78)}
      }
      @media(max-width:760px){
        .nova-planet-scene{inset:-12%}
        .nova-moon-a{width:31px;height:31px}
        .nova-moon-b{width:19px;height:19px}
      }
      @media(prefers-reduced-motion:reduce){
        .nova-planet-texture,.nova-planet-atmosphere,.nova-moon-a,.nova-moon-b{animation:none!important}
        .nova-moon-a{offset-distance:18%}
        .nova-moon-b{offset-distance:68%}
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

  function init(){
    installStyles();
    buildScene();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();