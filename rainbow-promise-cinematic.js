(() => {
  'use strict';

  const wrap = document.querySelector('.rainbow-wrap');
  if (!wrap) return;

  const STORM = 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Stormcloud.jpg';
  const RAINBOW = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/The_rainbow.jpg/768px-The_rainbow.jpg';
  const ARK_TEXTURE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Ark_van_Noach_in_Dordrecht%2C_Noah%27s_Ark_replica_%28public_domain%29.jpg/1280px-Ark_van_Noach_in_Dordrecht%2C_Noah%27s_Ark_replica_%28public_domain%29.jpg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.body.classList.add('rp-covenant-motion');
  wrap.removeAttribute('aria-hidden');

  const style = document.createElement('style');
  style.id = 'rainbowPromiseCinematicStyles';
  style.textContent = `
    html,body{max-width:100%;overflow-x:clip}
    .rp-covenant-motion{width:100%;background:radial-gradient(circle at 50% -4%,rgba(112,154,197,.22),transparent 32%),linear-gradient(180deg,#1b334d,#0b1a2a 52%,#050c14)!important}
    .rp-covenant-motion .shell{width:min(1120px,calc(100% - 28px));max-width:100%}
    .rp-covenant-motion main{position:relative;z-index:6;padding-top:44px}.rp-covenant-motion .hero{padding:20px 0 30px}.rp-covenant-motion h1{text-shadow:0 0 48px rgba(222,240,255,.28)}
    .rp-covenant-motion .grid>*{min-width:0}.rp-covenant-motion blockquote{overflow-wrap:anywhere}
    .rp-covenant-motion #astralisNovaExplorer,.rp-covenant-motion .nova-explorer-warp,.rp-covenant-motion .nova-explorer-signal{display:none!important}
    .rp-rain-canvas,.rp-lightning,.rp-drizzle,.rp-fog{position:fixed;inset:0;pointer-events:none}.rp-rain-canvas{z-index:2;opacity:.94}.rp-lightning{z-index:50;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 52% 15%,rgba(255,255,255,.9),transparent 22%),linear-gradient(180deg,rgba(255,255,255,.38),transparent)}.rp-drizzle{z-index:3;opacity:.085;background:repeating-linear-gradient(110deg,transparent 0 18px,rgba(224,242,255,.05) 18px 20px,transparent 20px 38px);animation:rpSheet 13s linear infinite}.rp-fog{z-index:4;opacity:.38;filter:blur(18px);background:radial-gradient(circle at 14% 100%,rgba(220,239,255,.13),transparent 25%),radial-gradient(circle at 52% 100%,rgba(208,230,248,.16),transparent 31%),radial-gradient(circle at 88% 100%,rgba(220,239,255,.12),transparent 25%);animation:rpFog 21s ease-in-out infinite alternate}.rp-covenant-motion header,.rp-covenant-motion main,.rp-covenant-motion footer{position:relative;z-index:6}

    .rp-covenant-motion .rainbow-wrap{position:relative;width:100%;height:min(720px,72vw);min-height:540px;max-width:1120px;margin:34px auto 8px;border-radius:34px;overflow:hidden;border:1px solid rgba(190,225,255,.2);box-shadow:0 30px 110px rgba(0,0,0,.52),inset 0 0 80px rgba(137,204,246,.06);isolation:isolate;background:#132437}
    .rp-covenant-motion .rainbow-wrap::before{content:"";position:absolute;inset:0;z-index:24;pointer-events:none;background:linear-gradient(180deg,rgba(5,15,25,.01),rgba(5,14,23,.08) 42%,rgba(3,9,16,.45) 100%),radial-gradient(ellipse at 52% 18%,rgba(235,245,255,.2),transparent 31%)}
    .rp-covenant-motion .rainbow-wrap::after{content:"";position:absolute;inset:0;z-index:25;pointer-events:none;box-shadow:inset 0 0 90px rgba(1,6,11,.2),inset 0 -170px 190px rgba(2,7,12,.48)}

    .rp-sky,.rp-cloud-photo{position:absolute;inset:-10%;background-image:url('${STORM}');background-size:cover;background-position:center 35%;will-change:transform}.rp-sky{z-index:1;filter:saturate(.84) contrast(1.07) brightness(.87);animation:rpSkyPan 31s ease-in-out infinite alternate}.rp-cloud-photo{z-index:5;pointer-events:none;mix-blend-mode:screen}.rp-cloud-back{opacity:.21;filter:blur(4px) brightness(.78) saturate(.74);transform:scale(1.16);-webkit-mask-image:linear-gradient(180deg,#000 0 64%,transparent 91%);mask-image:linear-gradient(180deg,#000 0 64%,transparent 91%);animation:rpCloudBack 35s ease-in-out infinite alternate}.rp-cloud-front{opacity:.27;filter:blur(1.6px) brightness(.71) contrast(1.08);transform:scale(1.23);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 17% 74%,transparent 98%);mask-image:linear-gradient(180deg,transparent 0,#000 17% 74%,transparent 98%);animation:rpCloudFront 25s ease-in-out infinite alternate-reverse}
    .rp-sunbreak{position:absolute;left:51%;top:-4%;width:72%;height:82%;transform:translateX(-50%);z-index:6;opacity:.36;filter:blur(24px);clip-path:polygon(38% 0,62% 0,93% 100%,7% 100%);background:linear-gradient(180deg,rgba(255,255,245,.82),rgba(255,236,174,.2) 49%,rgba(225,240,251,.05) 79%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 24% 76%,transparent);mask-image:linear-gradient(90deg,transparent,#000 24% 76%,transparent);animation:rpLight 9.5s ease-in-out infinite alternate}

    .rp-rainbow-photo{position:absolute;left:50%;top:3%;width:98%;height:73%;transform:translateX(-50%) scale(1.035);z-index:8;opacity:0;object-fit:cover;object-position:center 43%;filter:saturate(.92) contrast(1.02) brightness(1.04) blur(6px);mix-blend-mode:screen;-webkit-mask-image:radial-gradient(ellipse at 50% 100%,transparent 0 36%,#000 45% 78%,transparent 92%);mask-image:radial-gradient(ellipse at 50% 100%,transparent 0 36%,#000 45% 78%,transparent 92%);transition:opacity 7.5s ease,filter 7.5s ease,transform 8s ease}.rp-rainbow-photo.is-visible{opacity:.8;filter:saturate(1.04) contrast(1.04) brightness(1.12) blur(.35px);transform:translateX(-50%) scale(1);animation:rpRainbowBreathe 12s ease-in-out 8s infinite alternate}
    .rp-rainbow-haze{position:absolute;left:50%;top:4%;width:100%;height:76%;transform:translateX(-50%);z-index:9;opacity:0;background:radial-gradient(ellipse at 50% 100%,transparent 0 42%,rgba(255,150,159,.14) 49%,rgba(243,205,111,.12) 55%,rgba(118,202,143,.1) 61%,rgba(107,183,232,.11) 67%,rgba(145,112,210,.1) 72%,transparent 80%);filter:blur(18px);transition:opacity 8s ease 1s}.rp-rainbow-haze.is-visible{opacity:.94}

    .rp-covenant-beam{position:absolute;left:50%;bottom:19%;width:64%;height:65%;transform:translateX(-50%);z-index:11;opacity:.26;filter:blur(22px);clip-path:polygon(41% 0,59% 0,93% 100%,7% 100%);background:linear-gradient(180deg,rgba(255,255,247,.92),rgba(255,235,165,.28) 47%,rgba(231,241,249,.05) 82%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 24% 76%,transparent);mask-image:linear-gradient(90deg,transparent,#000 24% 76%,transparent);animation:rpBeam 6.8s ease-in-out infinite alternate}.rp-covenant-beam::after{content:"";position:absolute;inset:10% 29% 0;filter:blur(13px);background:linear-gradient(180deg,rgba(255,255,251,.72),rgba(255,225,132,.13) 64%,transparent)}
    .rp-covenant-halo{position:absolute;left:50%;bottom:14%;width:min(720px,88%);height:280px;transform:translateX(-50%);z-index:12;border-radius:50%;opacity:.73;filter:blur(23px);background:radial-gradient(ellipse at center,rgba(255,254,235,.86) 0%,rgba(255,232,145,.43) 27%,rgba(211,232,245,.16) 55%,transparent 77%);box-shadow:0 0 90px rgba(255,224,129,.18);animation:rpHalo 5.8s ease-in-out infinite alternate}.rp-covenant-halo::after{content:"";position:absolute;inset:24% 22%;border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,245,.68),rgba(255,218,110,.22) 43%,transparent 73%);filter:blur(10px)}
    .rp-covenant-ring{position:absolute;left:50%;bottom:25%;width:min(450px,58%);height:138px;transform:translateX(-50%);z-index:13;border-radius:50%;opacity:.44;filter:blur(6px);border:2px solid rgba(255,247,207,.72);box-shadow:0 0 40px rgba(255,237,163,.5),inset 0 0 28px rgba(255,249,223,.32);animation:rpRing 7.4s ease-in-out infinite alternate}
    .rp-covenant-motes{position:absolute;left:18%;right:18%;bottom:19%;height:34%;z-index:14;opacity:.56;mix-blend-mode:screen;background-image:radial-gradient(circle,rgba(255,247,191,.9) 0 1px,transparent 1.7px),radial-gradient(circle,rgba(221,243,255,.8) 0 1px,transparent 1.8px);background-size:68px 64px,93px 86px;background-position:0 0,27px 18px;-webkit-mask-image:radial-gradient(ellipse at center,#000,transparent 76%);mask-image:radial-gradient(ellipse at center,#000,transparent 76%);animation:rpMotes 8s ease-in-out infinite alternate}

    .rp-birds{position:absolute;inset:0;z-index:17;pointer-events:none;overflow:hidden}.rp-bird{--bird-color:rgba(226,237,241,.82);position:absolute;left:-12%;width:24px;height:12px;color:var(--bird-color);filter:drop-shadow(0 2px 3px rgba(0,0,0,.38));animation:rpBirdFlight 20s linear infinite;will-change:transform}.rp-bird::before,.rp-bird::after{content:"";position:absolute;top:4px;width:13px;height:7px;border-top:2px solid currentColor;border-radius:80% 80% 0 0;transform-origin:100% 50%;animation:rpBirdWingLeft .8s ease-in-out infinite alternate}.rp-bird::before{right:50%;transform:rotate(18deg)}.rp-bird::after{left:50%;transform-origin:0 50%;transform:rotate(-18deg);animation-name:rpBirdWingRight}.rp-bird-body{position:absolute;left:9px;top:5px;width:7px;height:2px;border-radius:999px;background:currentColor;opacity:.82}.rp-bird-raven{--bird-color:rgba(28,38,45,.88);top:26%;animation-duration:17s;animation-delay:-4s;scale:.9}.rp-bird-dove-one{top:34%;animation-duration:22s;animation-delay:-13s;scale:.78}.rp-bird-dove-two{--bird-color:rgba(239,244,241,.86);top:19%;animation-duration:26s;animation-delay:-8s;scale:.72}.rp-bird-raven::before,.rp-bird-raven::after{animation-duration:.68s}.rp-bird-dove-two::before,.rp-bird-dove-two::after{animation-duration:.92s}.rp-olive-leaf{position:absolute;left:15px;top:7px;width:8px;height:1px;background:rgba(116,154,86,.88);transform:rotate(18deg);transform-origin:left center}.rp-olive-leaf::before,.rp-olive-leaf::after{content:"";position:absolute;width:3px;height:2px;border-radius:100% 0 100% 0;background:rgba(139,176,103,.92)}.rp-olive-leaf::before{left:2px;top:-2px;transform:rotate(-22deg)}.rp-olive-leaf::after{left:5px;top:1px;transform:rotate(155deg)}

    .rp-ark-group{position:absolute;left:50%;bottom:21%;width:min(500px,58%);height:238px;transform:translateX(-50%);z-index:18;filter:drop-shadow(0 17px 23px rgba(0,0,0,.58)) drop-shadow(0 0 16px rgba(255,194,88,.3));animation:rpArkBob 5.6s ease-in-out infinite;will-change:transform}.rp-ark-group::after{content:"";position:absolute;left:1%;right:1%;bottom:17px;height:122px;z-index:9;clip-path:polygon(2% 18%,8% 6%,91% 6%,99% 28%,95% 58%,84% 83%,17% 84%,7% 65%);box-shadow:inset 0 0 0 2px rgba(255,207,126,.3),0 0 20px rgba(255,187,73,.2);pointer-events:none}
    .rp-ark-hull{position:absolute;left:0;right:0;bottom:18px;height:116px;z-index:3;clip-path:polygon(2% 18%,8% 6%,91% 6%,99% 28%,95% 58%,84% 83%,17% 84%,7% 65%);overflow:hidden;background:radial-gradient(ellipse at 50% 4%,rgba(255,223,165,.24),transparent 42%),repeating-linear-gradient(0deg,rgba(255,230,180,.07) 0 2px,transparent 2px 11px),linear-gradient(180deg,#97643d 0%,#6f4427 40%,#3b2415 78%,#1c120c 100%);box-shadow:inset 0 10px 18px rgba(255,218,154,.12),inset 0 -22px 28px rgba(7,4,2,.5)}.rp-ark-hull::before{content:"";position:absolute;inset:-15%;background:url('${ARK_TEXTURE}') center 82%/145% auto no-repeat;opacity:.16;filter:sepia(.75) saturate(.7) contrast(1.25) brightness(.78);mix-blend-mode:overlay}.rp-ark-hull::after{content:"";position:absolute;left:5%;right:5%;top:8%;height:7px;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(255,233,190,.82) 42%,rgba(255,196,98,.48) 66%,transparent);filter:blur(1px);animation:rpHullGleam 4.8s ease-in-out infinite alternate}
    .rp-ark-deck{position:absolute;left:16%;right:16%;bottom:113px;height:57px;z-index:4;clip-path:polygon(4% 15%,96% 15%,90% 100%,9% 100%);overflow:hidden;background:repeating-linear-gradient(0deg,rgba(255,226,173,.06) 0 2px,transparent 2px 10px),linear-gradient(180deg,#93643f,#59371f 66%,#342116);box-shadow:inset 0 -11px 18px rgba(0,0,0,.3),inset 0 4px 9px rgba(255,218,153,.16)}.rp-ark-deck::before{content:"";position:absolute;inset:-28%;background:url('${ARK_TEXTURE}') center 84%/180% auto no-repeat;opacity:.12;filter:sepia(.8) saturate(.6) contrast(1.3) brightness(.72);mix-blend-mode:overlay}
    .rp-ark-roof{position:absolute;left:24%;right:24%;bottom:161px;height:36px;z-index:6;clip-path:polygon(50% 0,100% 82%,91% 100%,9% 100%,0 82%);background:linear-gradient(105deg,rgba(255,207,126,.22),transparent 46%),linear-gradient(180deg,#6b4428,#2b1a10);box-shadow:0 5px 13px rgba(0,0,0,.42),inset 0 3px 5px rgba(255,217,149,.18)}
    .rp-ark-window{position:absolute;bottom:130px;z-index:8;width:20px;height:13px;border-radius:2px;background:linear-gradient(180deg,#fffbd1,#ffc45c 75%);border:1px solid rgba(255,244,187,.85);box-shadow:0 0 8px #fff4ba,0 0 20px rgba(255,199,82,.92),0 0 36px rgba(255,171,45,.42);animation:rpWindowGlow 3.4s ease-in-out infinite alternate}.rp-ark-window.w1{left:34%;animation-delay:-.8s}.rp-ark-window.w2{left:48%;animation-delay:-2.1s}.rp-ark-window.w3{left:62%;animation-delay:-1.4s}.rp-ark-keel{position:absolute;left:12%;right:8%;bottom:11px;height:18px;z-index:2;clip-path:polygon(0 0,100% 0,84% 100%,20% 100%);background:linear-gradient(180deg,#402614,#130c08);box-shadow:0 4px 8px rgba(0,0,0,.45)}
    .rp-ark-wake{position:absolute;left:-16%;right:-16%;bottom:-4px;height:54px;z-index:11;opacity:.72;filter:blur(1.4px);background:radial-gradient(ellipse at 50% 0,rgba(246,252,255,.7) 0 4%,rgba(204,232,244,.46) 12%,rgba(91,163,197,.22) 29%,transparent 58%),repeating-radial-gradient(ellipse at 50% -22%,transparent 0 18px,rgba(224,242,249,.28) 20px 22px,transparent 24px 45px);transform-origin:50% 0;animation:rpWake 3.1s ease-in-out infinite alternate}.rp-ark-wake::before,.rp-ark-wake::after{content:"";position:absolute;top:7px;width:44%;height:35px;border-top:2px solid rgba(229,244,250,.45);border-radius:50%;filter:blur(1.3px)}.rp-ark-wake::before{right:48%;transform:rotate(-8deg)}.rp-ark-wake::after{left:48%;transform:rotate(8deg)}
    .rp-bow-foam{position:absolute;left:5%;right:4%;bottom:7px;height:28px;z-index:12;opacity:.7;background:radial-gradient(ellipse at 15% 55%,rgba(242,250,253,.62),transparent 25%),radial-gradient(ellipse at 84% 55%,rgba(238,248,252,.56),transparent 25%),radial-gradient(ellipse at 50% 75%,rgba(175,216,235,.3),transparent 52%);filter:blur(1.5px);animation:rpFoam 2.8s ease-in-out infinite alternate}

    .rp-water{position:absolute;left:-8%;right:-8%;bottom:-6%;height:46%;z-index:10;overflow:hidden;background:linear-gradient(180deg,rgba(73,143,180,.23),rgba(28,91,129,.58) 22%,rgba(8,48,78,.95) 58%,rgba(2,15,29,.995));box-shadow:inset 0 16px 34px rgba(158,207,231,.045),inset 0 -32px 70px rgba(0,7,16,.3)}.rp-water::before{content:"";position:absolute;inset:0;opacity:.58;background:radial-gradient(ellipse at 50% 0,rgba(232,219,162,.19),transparent 31%),radial-gradient(ellipse at 20% 25%,rgba(89,177,207,.1),transparent 35%),radial-gradient(ellipse at 80% 38%,rgba(61,143,186,.1),transparent 37%),linear-gradient(180deg,rgba(163,205,226,.07),transparent 30%,rgba(1,11,23,.5) 92%)}.rp-water::after{content:"";position:absolute;inset:-6% -4%;opacity:.08;mix-blend-mode:screen;background:radial-gradient(ellipse at 23% 18%,rgba(188,224,239,.14),transparent 24%),radial-gradient(ellipse at 72% 31%,rgba(129,188,216,.11),transparent 29%),linear-gradient(104deg,transparent 18%,rgba(183,217,232,.06) 42%,transparent 64%);-webkit-mask-image:linear-gradient(180deg,#000,transparent 82%);mask-image:linear-gradient(180deg,#000,transparent 82%);animation:rpSurfaceDrift 10s ease-in-out infinite alternate}
    .rp-wave{position:absolute;left:-18%;width:136%;border-radius:50%;will-change:transform;transform-origin:50% 50%;filter:drop-shadow(0 -3px 5px rgba(159,207,228,.065));overflow:hidden}.rp-wave::before{content:"";position:absolute;inset:0;opacity:.3;background:radial-gradient(ellipse at 8% 6%,rgba(213,236,245,.18) 0 3%,transparent 9%),radial-gradient(ellipse at 28% 9%,rgba(191,224,239,.14) 0 4%,transparent 11%),radial-gradient(ellipse at 52% 5%,rgba(211,235,245,.17) 0 3%,transparent 10%),radial-gradient(ellipse at 75% 8%,rgba(188,221,237,.14) 0 4%,transparent 11%),radial-gradient(ellipse at 94% 5%,rgba(211,235,245,.16) 0 3%,transparent 10%);background-size:210px 100%;animation:rpCrestShimmer 7s linear infinite}
    .rp-wave-a{top:-3%;height:82px;opacity:.82;background:radial-gradient(ellipse at 50% 0,rgba(169,214,233,.25) 0 6%,rgba(50,126,165,.3) 15%,rgba(15,67,101,.06) 68%,transparent 72%);box-shadow:inset 0 4px 0 rgba(190,222,236,.11);animation:rpWaveA 5.3s ease-in-out infinite}
    .rp-wave-b{top:18%;height:96px;opacity:.72;background:radial-gradient(ellipse at 50% 0,rgba(145,199,224,.21) 0 6%,rgba(31,101,143,.34) 17%,rgba(7,48,78,.08) 70%,transparent 74%);box-shadow:inset 0 3px 0 rgba(176,213,231,.09);animation:rpWaveB 6.8s ease-in-out infinite reverse}
    .rp-wave-c{top:43%;height:112px;opacity:.61;background:radial-gradient(ellipse at 50% 0,rgba(112,180,211,.18) 0 6%,rgba(21,75,115,.38) 18%,rgba(4,32,58,.1) 72%,transparent 76%);box-shadow:inset 0 3px 0 rgba(153,198,220,.07);animation:rpWaveC 8.4s ease-in-out infinite}
    .rp-wave-d{top:69%;height:122px;opacity:.5;background:radial-gradient(ellipse at 50% 0,rgba(84,151,185,.15) 0 6%,rgba(14,54,88,.42) 19%,rgba(2,20,39,.18) 74%,transparent 78%);box-shadow:inset 0 2px 0 rgba(131,181,207,.06);animation:rpWaveD 10.2s ease-in-out infinite reverse}
    .rp-water-glint{position:absolute;left:7%;right:7%;bottom:4%;height:38%;z-index:14;opacity:.16;filter:blur(8px);mix-blend-mode:screen;background:radial-gradient(ellipse at 50% 2%,rgba(238,220,154,.2),transparent 35%),radial-gradient(ellipse at 28% 33%,rgba(159,207,226,.12),transparent 26%),radial-gradient(ellipse at 72% 49%,rgba(109,176,208,.09),transparent 30%);-webkit-mask-image:linear-gradient(180deg,#000,rgba(0,0,0,.55) 45%,transparent 100%);mask-image:linear-gradient(180deg,#000,rgba(0,0,0,.55) 45%,transparent 100%);animation:rpGlint 6.8s ease-in-out infinite alternate}
    .rp-shimmer-band{position:absolute;left:14%;right:14%;bottom:17%;height:19%;z-index:15;opacity:.1;filter:blur(8px);mix-blend-mode:screen;background:radial-gradient(ellipse at 20% 45%,rgba(210,232,240,.18),transparent 26%),radial-gradient(ellipse at 53% 34%,rgba(224,237,240,.14),transparent 31%),radial-gradient(ellipse at 82% 55%,rgba(142,195,218,.12),transparent 25%);clip-path:polygon(0 43%,17% 25%,36% 51%,55% 22%,75% 48%,100% 29%,100% 69%,77% 60%,56% 78%,35% 61%,16% 80%,0 65%);animation:rpShimmerBand 6.2s ease-in-out infinite alternate}
    .rp-foam-trail{position:absolute;left:25%;right:25%;top:4%;height:28%;z-index:16;opacity:.52;filter:blur(1.8px);background:radial-gradient(ellipse at center top,rgba(237,248,252,.55),rgba(164,207,226,.2) 31%,transparent 69%),repeating-radial-gradient(ellipse at 50% 0,transparent 0 19px,rgba(213,235,244,.26) 21px 23px,transparent 25px 48px);animation:rpTrail 3.5s ease-in-out infinite alternate}

    .rp-ark-reflection{position:absolute;left:50%;bottom:2%;width:min(460px,54%);height:145px;transform:translateX(-50%) scaleY(-1);transform-origin:50% 0;z-index:13;opacity:.12;filter:blur(7px) saturate(.55);-webkit-mask-image:linear-gradient(180deg,#000 0 9%,rgba(0,0,0,.4) 42%,transparent 91%);mask-image:linear-gradient(180deg,#000 0 9%,rgba(0,0,0,.4) 42%,transparent 91%);animation:rpReflection 7s ease-in-out infinite;overflow:hidden}.rp-ref-hull{position:absolute;left:1%;right:1%;bottom:22px;height:76px;clip-path:polygon(2% 18%,8% 6%,91% 6%,99% 28%,95% 58%,84% 83%,17% 84%,7% 65%);background:linear-gradient(180deg,rgba(231,190,112,.25),rgba(59,35,19,.5))}.rp-ref-deck{position:absolute;left:17%;right:17%;bottom:91px;height:37px;clip-path:polygon(4% 15%,96% 15%,90% 100%,9% 100%);background:linear-gradient(180deg,rgba(223,180,107,.2),rgba(48,30,18,.48))}.rp-ref-roof{position:absolute;left:25%;right:25%;bottom:122px;height:24px;clip-path:polygon(50% 0,100% 82%,91% 100%,9% 100%,0 82%);background:linear-gradient(180deg,rgba(219,170,84,.17),rgba(34,21,14,.5))}.rp-ref-windows{position:absolute;left:35%;right:35%;bottom:100px;height:8px;background:repeating-linear-gradient(90deg,rgba(236,204,121,.28) 0 10px,transparent 10px 35px);filter:blur(4px);box-shadow:0 0 10px rgba(213,167,64,.18)}.rp-ref-ripple{position:absolute;left:-7%;right:-7%;top:18%;height:62%;opacity:.07;background:radial-gradient(ellipse at 50% 9%,rgba(139,190,213,.16),transparent 27%),radial-gradient(ellipse at 32% 48%,rgba(113,169,196,.09),transparent 22%),radial-gradient(ellipse at 71% 64%,rgba(94,153,184,.08),transparent 25%);mix-blend-mode:screen;filter:blur(5px);animation:rpRefRipple 4.6s ease-in-out infinite alternate}
    .rp-vapor{position:absolute;left:-7%;right:-7%;bottom:20%;height:31%;z-index:19;opacity:.38;filter:blur(25px);background:radial-gradient(ellipse at 18% 57%,rgba(226,240,250,.23),transparent 29%),radial-gradient(ellipse at 51% 64%,rgba(207,228,243,.17),transparent 35%),radial-gradient(ellipse at 84% 56%,rgba(224,239,250,.2),transparent 30%);animation:rpMist 17s ease-in-out infinite alternate}

    .rp-sound-toggle{position:absolute;left:14px;top:12px;z-index:32;min-width:112px;min-height:44px;padding:10px 15px;border:1px solid rgba(205,230,245,.32);border-radius:999px;color:#edf8ff;background:rgba(4,17,29,.7);box-shadow:0 8px 24px rgba(0,0,0,.24);backdrop-filter:blur(12px);font:800 .75rem/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.04em;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.rp-sound-toggle:hover{background:rgba(10,34,52,.84);border-color:rgba(222,239,249,.48)}.rp-sound-toggle:focus-visible{outline:3px solid rgba(164,220,250,.85);outline-offset:3px}.rp-sound-toggle[aria-pressed="true"]{background:rgba(26,69,84,.78);border-color:rgba(191,232,236,.56);box-shadow:0 8px 24px rgba(0,0,0,.24),0 0 18px rgba(133,209,220,.14)}
    .rp-caption{position:absolute;left:18px;right:18px;bottom:16px;z-index:30;display:flex;justify-content:space-between;align-items:flex-end;gap:16px;max-width:calc(100% - 36px);padding:17px 19px;border-radius:22px;border:1px solid rgba(186,223,255,.16);background:linear-gradient(180deg,rgba(8,23,40,.38),rgba(4,11,19,.78));backdrop-filter:blur(12px);text-align:left;overflow:hidden}.rp-caption>div:first-child{min-width:0}.rp-caption strong{display:block;font-size:1.02rem}.rp-caption span{display:block;color:#cfe7fa;line-height:1.5;margin-top:4px;max-width:700px;font-size:.9rem}.rp-tag{flex:0 0 auto;white-space:nowrap;border:1px solid rgba(186,223,255,.18);background:rgba(255,255,255,.055);border-radius:999px;padding:9px 13px;font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.rp-credit{position:absolute;right:14px;top:12px;z-index:31;max-width:48%;color:rgba(232,243,251,.7);font-size:.6rem;line-height:1.4;text-align:right;text-shadow:0 2px 8px rgba(0,0,0,.85)}

    @keyframes rpSkyPan{from{transform:scale(1.08) translate3d(-2%,0,0)}to{transform:scale(1.15) translate3d(2%,-1.2%,0)}}
    @keyframes rpCloudBack{from{transform:scale(1.16) translateX(-6%)}to{transform:scale(1.16) translateX(7%)}}
    @keyframes rpCloudFront{from{transform:scale(1.23) translateX(-8%)}to{transform:scale(1.23) translateX(6%)}}
    @keyframes rpLight{from{opacity:.27;transform:translateX(-50%) scaleX(.92)}to{opacity:.48;transform:translateX(-50%) scaleX(1.08)}}
    @keyframes rpRainbowBreathe{from{opacity:.74;filter:saturate(.98) brightness(1.06)}to{opacity:.84;filter:saturate(1.08) brightness(1.15)}}
    @keyframes rpBeam{from{opacity:.18;transform:translateX(-50%) scaleX(.92)}to{opacity:.36;transform:translateX(-50%) scaleX(1.08)}}
    @keyframes rpHalo{from{opacity:.56;transform:translateX(-50%) scale(.93)}to{opacity:.9;transform:translateX(-50%) scale(1.07)}}
    @keyframes rpRing{from{opacity:.27;transform:translateX(-50%) scale(.95)}to{opacity:.58;transform:translateX(-50%) scale(1.07)}}
    @keyframes rpMotes{from{transform:translate3d(-2%,3%,0);opacity:.36}to{transform:translate3d(2%,-3%,0);opacity:.7}}
    @keyframes rpBirdFlight{0%{transform:translate3d(-90px,4px,0)}18%{transform:translate3d(calc(22vw + 80px),-5px,0)}44%{transform:translate3d(calc(52vw + 100px),7px,0)}72%{transform:translate3d(calc(82vw + 120px),-3px,0)}100%{transform:translate3d(calc(112vw + 170px),5px,0)}}
    @keyframes rpBirdWingLeft{from{transform:rotate(27deg) scaleY(.72)}to{transform:rotate(-8deg) scaleY(1.08)}}
    @keyframes rpBirdWingRight{from{transform:rotate(-27deg) scaleY(.72)}to{transform:rotate(8deg) scaleY(1.08)}}
    @keyframes rpArkBob{0%,100%{transform:translateX(-50%) translateY(0) rotate(-.32deg)}50%{transform:translateX(-50%) translateY(8px) rotate(.36deg)}}
    @keyframes rpHullGleam{from{transform:translateX(-8%);opacity:.42}to{transform:translateX(8%);opacity:.9}}
    @keyframes rpWindowGlow{from{filter:brightness(.9);opacity:.84}to{filter:brightness(1.28);opacity:1}}
    @keyframes rpWake{from{transform:translateX(-3%) scaleX(.92) scaleY(.9);opacity:.52}to{transform:translateX(3%) scaleX(1.07) scaleY(1.06);opacity:.76}}
    @keyframes rpFoam{from{transform:translateX(-2%) scaleX(.95);opacity:.52}to{transform:translateX(2%) scaleX(1.04);opacity:.72}}
    @keyframes rpWaveA{0%,100%{transform:translate3d(-4%,0,0) scaleY(.94)}50%{transform:translate3d(4%,7px,0) scaleY(1.1)}}
    @keyframes rpWaveB{0%,100%{transform:translate3d(4%,3px,0) scaleY(1.04)}50%{transform:translate3d(-4%,-6px,0) scaleY(.92)}}
    @keyframes rpWaveC{0%,100%{transform:translate3d(-3%,5px,0) scaleY(.94)}50%{transform:translate3d(4%,-4px,0) scaleY(1.08)}}
    @keyframes rpWaveD{0%,100%{transform:translate3d(3%,2px,0) scaleY(1.03)}50%{transform:translate3d(-4%,-5px,0) scaleY(.94)}}
    @keyframes rpCrestShimmer{from{background-position:-90px 0}to{background-position:120px 0}}
    @keyframes rpSurfaceDrift{from{transform:translate3d(-2%,-1%,0) scale(1)}to{transform:translate3d(2%,1%,0) scale(1.03)}}
    @keyframes rpGlint{from{transform:translateX(-3%) scaleY(.9);opacity:.1}to{transform:translateX(3%) scaleY(1.08);opacity:.2}}
    @keyframes rpShimmerBand{from{transform:translateX(-2%) scaleY(.94)}to{transform:translateX(2%) scaleY(1.06)}}
    @keyframes rpTrail{from{transform:translateX(-3%) scaleX(.92);opacity:.4}to{transform:translateX(3%) scaleX(1.08);opacity:.58}}
    @keyframes rpReflection{0%,100%{transform:translateX(-50%) scaleY(-1) translateY(0) skewX(-.7deg) scaleX(.99)}50%{transform:translateX(-50%) scaleY(-1) translateY(-3px) skewX(.8deg) scaleX(1.01)}}
    @keyframes rpRefRipple{from{transform:translateY(-1px) scaleX(.98)}to{transform:translateY(3px) scaleX(1.02)}}
    @keyframes rpMist{from{transform:translateX(-2.5%)}to{transform:translateX(2.5%)}}
    @keyframes rpSheet{from{transform:translate3d(0,-10%,0)}to{transform:translate3d(-4%,14%,0)}}
    @keyframes rpFog{from{transform:translateX(-1.5%)}to{transform:translateX(1.5%)}}

    @media(max-width:1050px){
      .rp-covenant-motion .shell{width:min(100% - 24px,900px)}
      .rp-covenant-motion .grid{grid-template-columns:1fr!important}
      .rp-covenant-motion .verse,.rp-covenant-motion .reflection{grid-column:1!important}
      .rp-covenant-motion .rainbow-wrap{height:min(720px,82vw);min-height:590px;border-radius:28px}
      .rp-caption{left:12px;right:12px;bottom:12px;max-width:calc(100% - 24px);padding:14px;flex-direction:column;align-items:flex-start;gap:10px}.rp-caption span{font-size:.86rem}.rp-tag{font-size:.68rem;padding:8px 11px}
      .rp-credit{right:12px;top:10px;max-width:58%;font-size:.55rem}
      .rp-sound-toggle{left:12px;top:10px}
    }
    @media(max-width:700px){
      .rp-covenant-motion .shell{width:calc(100% - 20px)}
      .rp-covenant-motion main{padding-top:26px}.rp-covenant-motion .hero{padding:16px 0 24px}
      .rp-covenant-motion .rainbow-wrap{min-height:560px;height:min(680px,150vw);border-radius:24px}
      .rp-rainbow-photo{top:6%;height:65%}.rp-covenant-beam{width:96%;height:62%;bottom:20%}.rp-covenant-halo{width:112%;height:228px;bottom:16%}.rp-covenant-ring{width:80%;bottom:30%}.rp-covenant-motes{left:6%;right:6%;bottom:22%}
      .rp-bird{width:20px;height:10px}.rp-bird::before,.rp-bird::after{width:11px;height:6px}.rp-bird-body{left:8px;top:5px;width:6px}.rp-bird-raven{top:28%;scale:.76}.rp-bird-dove-one{top:36%;scale:.67}.rp-bird-dove-two{top:21%;scale:.63}
      .rp-ark-group{width:82%;height:210px;bottom:23%;filter:drop-shadow(0 14px 18px rgba(0,0,0,.55)) drop-shadow(0 0 14px rgba(255,197,91,.3))}.rp-ark-hull{height:102px}.rp-ark-deck{bottom:100px;height:51px}.rp-ark-roof{bottom:143px}.rp-ark-window{bottom:115px;width:17px;height:12px}.rp-ark-keel{bottom:9px}.rp-ark-wake{height:48px;bottom:-5px}.rp-bow-foam{bottom:5px}
      .rp-water{height:49%;bottom:-7%}.rp-wave-a{height:72px}.rp-wave-b{height:84px}.rp-wave-c{height:96px}.rp-wave-d{height:106px}.rp-water-glint{height:42%;opacity:.13}.rp-shimmer-band{left:7%;right:7%;opacity:.075}.rp-foam-trail{left:18%;right:18%;top:7%;opacity:.46}
      .rp-ark-reflection{width:72%;height:132px;bottom:3%;opacity:.095}.rp-ref-hull{height:69px}.rp-ref-deck{bottom:83px;height:34px}.rp-ref-roof{bottom:112px}.rp-ref-windows{bottom:91px}
      .rp-caption strong{font-size:.95rem}.rp-caption span{line-height:1.45;font-size:.82rem}.rp-credit{max-width:54%;font-size:.5rem}.rp-sound-toggle{min-width:105px;min-height:46px;padding:11px 13px;font-size:.72rem}
    }
    @media(max-width:430px){
      .rp-covenant-motion .rainbow-wrap{min-height:555px;height:151vw}
      .rp-ark-group{width:86%;bottom:23.5%}.rp-water{height:50%}.rp-covenant-halo{height:215px}.rp-caption{padding:12px}.rp-caption span{font-size:.79rem}.rp-shimmer-band{opacity:.06}.rp-water-glint{opacity:.1}.rp-credit{top:66px;max-width:58%}
    }
    @media(prefers-reduced-motion:reduce){.rp-rain-canvas{display:none}.rp-drizzle,.rp-fog,.rp-sky,.rp-cloud-photo,.rp-sunbreak,.rp-covenant-beam,.rp-covenant-halo,.rp-covenant-ring,.rp-covenant-motes,.rp-bird,.rp-bird::before,.rp-bird::after,.rp-ark-group,.rp-ark-hull::after,.rp-ark-window,.rp-ark-wake,.rp-bow-foam,.rp-water::after,.rp-wave,.rp-wave::before,.rp-water-glint,.rp-shimmer-band,.rp-foam-trail,.rp-ark-reflection,.rp-ref-ripple,.rp-vapor{animation:none!important}.rp-bird-raven{left:18%;top:28%;scale:.82}.rp-bird-dove-one{left:70%;top:35%;scale:.72}.rp-bird-dove-two{left:51%;top:20%;scale:.66}.rp-rainbow-photo{opacity:.8;filter:saturate(1.04) brightness(1.12);transform:translateX(-50%)}.rp-rainbow-haze{opacity:.94}}
  `;
  document.head.appendChild(style);

  wrap.innerHTML = `
    <div class="rp-sky"></div>
    <div class="rp-cloud-photo rp-cloud-back"></div>
    <div class="rp-cloud-photo rp-cloud-front"></div>
    <div class="rp-sunbreak"></div>
    <img class="rp-rainbow-photo" src="${RAINBOW}" alt="A real rainbow appearing through storm clouds">
    <div class="rp-rainbow-haze"></div>
    <div class="rp-covenant-beam"></div>
    <div class="rp-covenant-halo"></div>
    <div class="rp-covenant-ring"></div>
    <div class="rp-covenant-motes"></div>
    <div class="rp-birds" aria-hidden="true">
      <div class="rp-bird rp-bird-raven"><span class="rp-bird-body"></span></div>
      <div class="rp-bird rp-bird-dove-one"><span class="rp-bird-body"></span></div>
      <div class="rp-bird rp-bird-dove-two"><span class="rp-bird-body"></span><i class="rp-olive-leaf"></i></div>
    </div>
    <div class="rp-water">
      <div class="rp-wave rp-wave-a"></div>
      <div class="rp-wave rp-wave-b"></div>
      <div class="rp-wave rp-wave-c"></div>
      <div class="rp-wave rp-wave-d"></div>
      <div class="rp-foam-trail"></div>
    </div>
    <div class="rp-water-glint"></div>
    <div class="rp-shimmer-band"></div>
    <div class="rp-ark-reflection" aria-hidden="true">
      <div class="rp-ref-roof"></div><div class="rp-ref-deck"></div><div class="rp-ref-windows"></div><div class="rp-ref-hull"></div><div class="rp-ref-ripple"></div>
    </div>
    <div class="rp-ark-group" aria-label="Noah's Ark riding moving water">
      <div class="rp-ark-roof"></div><div class="rp-ark-deck"></div>
      <span class="rp-ark-window w1"></span><span class="rp-ark-window w2"></span><span class="rp-ark-window w3"></span>
      <div class="rp-ark-hull"></div><div class="rp-ark-keel"></div><div class="rp-bow-foam"></div><div class="rp-ark-wake"></div>
    </div>
    <div class="rp-vapor"></div>
    <button class="rp-sound-toggle" type="button" aria-pressed="false" aria-label="Turn ambient sound on">Sound Off</button>
    <div class="rp-credit">Storm and Ark texture: public domain/CC0 via Wikimedia Commons<br>Rainbow: Dietmar Rabich, CC BY-SA 4.0</div>
    <div class="rp-caption"><div><strong>The ark moves through living water as the promise gathers.</strong><span>Deep blue waves roll beneath the reconstructed wooden ark while foam, reflection, warm light, rain, and the emerging rainbow turn the storm toward hope.</span></div><div class="rp-tag">Living Covenant</div></div>`;

  const rainbow = wrap.querySelector('.rp-rainbow-photo');
  const haze = wrap.querySelector('.rp-rainbow-haze');
  requestAnimationFrame(() => setTimeout(() => {
    rainbow?.classList.add('is-visible');
    haze?.classList.add('is-visible');
  }, reduced ? 0 : 1400));

  const soundButton = wrap.querySelector('.rp-sound-toggle');
  let audioContext = null;
  let masterGain = null;
  let ambienceNodes = [];
  let thunderTimer = 0;
  let soundEnabled = false;

  const createNoiseBuffer = (context, seconds = 4) => {
    const frameCount = Math.floor(context.sampleRate * seconds);
    const buffer = context.createBuffer(1, frameCount, context.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < frameCount; i += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + .018 * white) / 1.018;
      data[i] = brown * 3.2;
    }
    return buffer;
  };

  const connectNoiseLayer = (context, buffer, settings) => {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = settings.type;
    filter.frequency.value = settings.frequency;
    filter.Q.value = settings.q || .7;
    gain.gain.value = settings.gain;
    source.connect(filter).connect(gain).connect(masterGain);
    source.start();
    ambienceNodes.push(source, filter, gain);
    return { source, filter, gain };
  };

  const scheduleThunder = () => {
    window.clearTimeout(thunderTimer);
    if (!soundEnabled || !audioContext || !masterGain) return;
    thunderTimer = window.setTimeout(() => {
      if (!soundEnabled || audioContext.state !== 'running') return;
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(47 + Math.random() * 12, now);
      oscillator.frequency.exponentialRampToValueAtTime(29, now + 2.8);
      filter.type = 'lowpass';
      filter.frequency.value = 115;
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.035, now + .45);
      gain.gain.exponentialRampToValueAtTime(.0001, now + 3.2);
      oscillator.connect(filter).connect(gain).connect(masterGain);
      oscillator.start(now);
      oscillator.stop(now + 3.3);
      scheduleThunder();
    }, 18000 + Math.random() * 24000);
  };

  const ensureAmbience = () => {
    if (audioContext) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      soundButton.disabled = true;
      soundButton.textContent = 'Sound Unavailable';
      soundButton.setAttribute('aria-label', 'Ambient sound is unavailable in this browser');
      return;
    }

    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioContext.destination);

    const noiseBuffer = createNoiseBuffer(audioContext);
    const rain = connectNoiseLayer(audioContext, noiseBuffer, { type: 'highpass', frequency: 2800, q: .4, gain: .018 });
    const wind = connectNoiseLayer(audioContext, noiseBuffer, { type: 'bandpass', frequency: 420, q: .55, gain: .024 });
    const water = connectNoiseLayer(audioContext, noiseBuffer, { type: 'lowpass', frequency: 170, q: .7, gain: .036 });
    rain.source.playbackRate.value = 1.17;
    wind.source.playbackRate.value = .43;
    water.source.playbackRate.value = .68;

    const windLfo = audioContext.createOscillator();
    const windLfoGain = audioContext.createGain();
    windLfo.frequency.value = .075;
    windLfoGain.gain.value = 120;
    windLfo.connect(windLfoGain).connect(wind.filter.frequency);
    windLfo.start();

    const surfLfo = audioContext.createOscillator();
    const surfLfoGain = audioContext.createGain();
    surfLfo.frequency.value = .11;
    surfLfoGain.gain.value = .012;
    surfLfo.connect(surfLfoGain).connect(water.gain.gain);
    surfLfo.start();
    ambienceNodes.push(windLfo, windLfoGain, surfLfo, surfLfoGain);
  };

  const setSound = async (enabled) => {
    ensureAmbience();
    if (!audioContext || !masterGain) return;
    soundEnabled = enabled;
    if (audioContext.state === 'suspended') await audioContext.resume();
    const now = audioContext.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, .0001), now);
    masterGain.gain.exponentialRampToValueAtTime(enabled ? .095 : .0001, now + (enabled ? 1.6 : 1.1));
    soundButton.textContent = enabled ? 'Sound On' : 'Sound Off';
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.setAttribute('aria-label', enabled ? 'Turn ambient sound off' : 'Turn ambient sound on');
    if (enabled) {
      scheduleThunder();
    } else {
      window.clearTimeout(thunderTimer);
      window.setTimeout(() => {
        if (!soundEnabled && audioContext?.state === 'running') audioContext.suspend().catch(() => {});
      }, 1250);
    }
  };

  soundButton?.addEventListener('click', () => {
    setSound(!soundEnabled).catch(() => {});
  });

  const canvas = document.createElement('canvas');
  canvas.className = 'rp-rain-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const lightning = document.createElement('div');
  lightning.className = 'rp-lightning';
  lightning.setAttribute('aria-hidden', 'true');
  const drizzle = document.createElement('div');
  drizzle.className = 'rp-drizzle';
  drizzle.setAttribute('aria-hidden', 'true');
  const fog = document.createElement('div');
  fog.className = 'rp-fog';
  fog.setAttribute('aria-hidden', 'true');
  document.body.append(canvas, lightning, drizzle, fog);

  const closeAudio = () => {
    soundEnabled = false;
    window.clearTimeout(thunderTimer);
    ambienceNodes.forEach((node) => {
      try { node.stop?.(); } catch (_) {}
      try { node.disconnect?.(); } catch (_) {}
    });
    ambienceNodes = [];
    audioContext?.close().catch(() => {});
  };

  if (reduced) {
    window.addEventListener('pagehide', closeAudio, { once: true });
    return;
  }

  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let drops = [];
  let frame = 0;

  const makeDrop = () => {
    const depth = Math.random();
    return {
      x: Math.random() * width,
      y: Math.random() * height - height,
      len: 12 + depth * 28,
      speed: 8 + depth * 18,
      drift: 2 + depth * 3.5,
      alpha: .07 + depth * .22,
      line: .5 + depth * 1.2
    };
  };

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drops = Array.from({ length: Math.max(110, Math.floor(width / 8)) }, makeDrop);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const drop of drops) {
      ctx.beginPath();
      ctx.lineWidth = drop.line;
      ctx.strokeStyle = `rgba(215,236,255,${drop.alpha})`;
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(drop.x - drop.drift, drop.y + drop.len);
      ctx.stroke();
      drop.x -= drop.drift * .22;
      drop.y += drop.speed;
      if (drop.y > height + 40 || drop.x < -40) {
        Object.assign(drop, makeDrop(), { y: -30 - Math.random() * height * .35, x: Math.random() * width + 40 });
      }
    }
    frame = requestAnimationFrame(draw);
  }

  function flash() {
    lightning.animate([
      { opacity: 0 },
      { opacity: .16, offset: .08 },
      { opacity: .5, offset: .18 },
      { opacity: .07, offset: .5 },
      { opacity: .27, offset: .68 },
      { opacity: 0 }
    ], { duration: 760 + Math.random() * 460, easing: 'ease-out' });
    wrap.animate([
      { filter: 'brightness(1)' },
      { filter: 'brightness(1.12)' },
      { filter: 'brightness(1.03)' },
      { filter: 'brightness(1)' }
    ], { duration: 850, easing: 'ease-out' });
    window.setTimeout(flash, 5600 + Math.random() * 9800);
  }

  resize();
  draw();
  window.setTimeout(flash, 4200 + Math.random() * 5200);
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(frame);
    closeAudio();
  }, { once: true });
})();
