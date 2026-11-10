(() => {
  'use strict';
  const roamer=document.getElementById('jimmittyRoamer');
  const toggle=document.getElementById('jimmittyToggle');
  if(!roamer||!toggle||roamer.dataset.initialized)return;
  roamer.dataset.initialized='true';
  const image=roamer.querySelector('img'),body=roamer.querySelector('.jimmitty-body');
  const shadow=roamer.querySelector('.jimmitty-shadow');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,ready=false,frame=0,last=0,clock=0,restUntil=1.5,landedAt=-10;
  let point={x:0,y:0},hop=null,hopCount=0,bounds={left:12,top:92,right:12,bottom:92},size={w:166,h:188};

  // Photo puppet: isolate the original pixels into overlapping anatomical layers.
  const NS='http://www.w3.org/2000/svg';
  const el=(name,attrs={})=>{const n=document.createElementNS(NS,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
  const rig=el('svg',{viewBox:'0 0 1056 1408','aria-hidden':'true',focusable:'false'});
  rig.style.cssText='display:block;width:100%;height:100%;overflow:visible;transform:rotate(38deg);filter:drop-shadow(1px 4px 3px #0007)';
  const defs=el('defs');rig.append(defs);
  const joints={};
  function photoPart(name,points,x,y){
    const clip=el('clipPath',{id:'jimmitty-clip-'+name,clipPathUnits:'userSpaceOnUse'});
    clip.append(el('polygon',{points}));defs.append(clip);
    const joint=el('g');const piece=el('image',{href:image.getAttribute('src'),x:0,y:0,width:1056,height:1408,'clip-path':'url(#jimmitty-clip-'+name+')'});
    joint.append(piece);rig.append(joint);joints[name]={joint,x,y};return joint;
  }
  photoPart('hindFar','128,625 213,637 440,727 470,753 385,787 302,798 350,849 317,956 257,969 178,836 115,702',350,855);
  photoPart('hindNear','472,1000 506,900 620,780 688,735 756,624 804,623 808,660 836,631 892,661 889,717 800,815 705,918 617,1005 538,1051 466,1053',520,943);
  photoPart('middleFar','38,910 91,893 109,923 165,883 218,902 303,949 284,997 199,962 160,934 100,969 46,956',282,965);
  photoPart('middleNear','641,891 692,896 807,963 980,928 1010,957 998,982 798,1020 675,954 642,949',673,923);
  photoPart('frontFar','129,983 180,976 258,1008 246,1058 181,1040 197,1143 209,1169 160,1238 90,1285 62,1262 106,1215 153,1145 118,1043',233,1020);
  photoPart('frontNear','413,1023 486,1011 514,1057 510,1111 471,1239 480,1355 438,1369 420,1314 416,1241 456,1096 405,1083',465,1050);
  // Rear appendages also flex subtly, rather than staying pinned to the abdomen.
  photoPart('rearFar','363,342 414,365 578,660 527,694 490,625',548,664);
  photoPart('rearNear','625,654 1056,395 1056,456 680,730 637,711',649,685);
  // The abdomen and head sit in front of the overlapping leg roots.
  photoPart('torso','511,671 570,653 637,656 680,723 680,787 629,865 571,942 512,1014 471,1038 420,1082 398,1159 350,1204 270,1204 220,1140 220,1065 224,1002 259,948 294,890 333,826 363,775 437,725 511,671',412,940);
  photoPart('antennaPhoto','0,1103 155,1073 246,1051 286,1057 290,1084 155,1099 0,1134',266,1068);
  // The other feeler is partly out of the original photograph. Reconstruct its fine silhouette.
  const feeler=el('path',{fill:'none',stroke:'#a77a4e','stroke-width':'7','stroke-linecap':'round'});
  const glint=el('path',{fill:'none',stroke:'#e9c28c','stroke-width':'2','stroke-linecap':'round',opacity:'.75'});
  rig.append(feeler,glint);
  function angle(name,a){const j=joints[name];j.joint.setAttribute('transform','rotate('+a.toFixed(2)+' '+j.x+' '+j.y+')');}
  function pose(crouch=0,flight=0,land=0,walk=0){
    const w=Math.sin(clock*19)*walk, w2=Math.sin(clock*19+Math.PI)*walk;
    const f=flight, l=land;
    angle('rearFar',4*Math.sin(clock*2.1)+8*crouch-10*f);
    angle('rearNear',-3*Math.sin(clock*2.5)-7*crouch+9*f);
    angle('hindFar', 13*crouch-23*f+9*l+4*w);
    angle('hindNear',-12*crouch+25*f-8*l+4*w2);
    angle('middleFar',-7*crouch+12*f+5*w2);
    angle('middleNear',8*crouch-13*f+5*w);
    angle('frontFar',-9*f+7*l+12*w);
    angle('frontNear',10*f-7*l+12*w2);
    angle('antennaPhoto',7*Math.sin(clock*3.1)+4*Math.sin(clock*7.4)-8*f);
    const sway=32*Math.sin(clock*2.7+1.4)+13*Math.sin(clock*6.1);
    const d='M 335 1065 Q '+(365+sway*.3)+' 1140 '+(300+sway*.65)+' 1245 Q '+(260+sway)+' 1320 '+(184+sway*1.6)+' 1382';
    feeler.setAttribute('d',d);glint.setAttribute('d',d);
  }
  image.parentNode.append(rig);
  rig.style.display='none';

  const videos=new Set();
  const random=(min,max)=>min+Math.random()*(max-min);
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function paint(altitude=0,pitch=0,crouch=0,flight=0,land=0,walk=0){
    pose(crouch,flight,land,walk);
    roamer.style.transform='translate3d('+point.x.toFixed(2)+'px,'+point.y.toFixed(2)+'px,0)';
    body.style.transform='translateY('+(-altitude+3*crouch+4*land).toFixed(2)+'px) rotate('+pitch.toFixed(2)+'deg) scale('+(1+.055*crouch-.025*flight).toFixed(3)+','+(1-.12*crouch+.045*flight-.10*land).toFixed(3)+')';
    shadow.style.opacity=String(.6*(1-Math.min(.8,altitude/150)));
    shadow.style.transform='scale('+(1-Math.min(.55,altitude/160)).toFixed(3)+')';
    roamer.dataset.hops=String(hopCount);
    roamer.dataset.phase=hop?'hopping':'resting';
  }
  function resize(){
    size={w:roamer.offsetWidth||166,h:roamer.offsetHeight||188};
    const viewWidth=document.documentElement.clientWidth;
    const viewHeight=window.visualViewport?.height||window.innerHeight;
    bounds={left:12,top:Math.min(94,Math.max(8,viewHeight-size.h-78)),right:Math.max(12,viewWidth-size.w-12),bottom:Math.max(12,viewHeight-size.h-78)};
    if(!ready)point={x:bounds.left+(bounds.right-bounds.left)*.72,y:bounds.top+(bounds.bottom-bounds.top)*.57};
    point.x=clamp(point.x,bounds.left,bounds.right);
    point.y=clamp(point.y,Math.min(bounds.top,bounds.bottom),bounds.bottom);
    // Recalculate a new route after resize rather than finishing outside the viewport.
    hop=null;restUntil=clock+.8;paint();
  }
  function newHop(){
    const minY=Math.min(bounds.bottom,bounds.top+48);
    const rangeX=bounds.right-bounds.left,rangeY=Math.max(0,bounds.bottom-minY);
    let target={x:random(bounds.left,bounds.right),y:random(minY,bounds.bottom)};
    // Mix short hops with occasional trips across the page.
    if(Math.random()<.6)target={x:clamp(point.x+random(-200,200),bounds.left,bounds.right),y:clamp(point.y+random(-120,140),minY,bounds.bottom)};
    if(Math.hypot(target.x-point.x,target.y-point.y)<32&&rangeX+rangeY>80){
      target.x=point.x<bounds.left+rangeX/2?bounds.right:bounds.left;
      target.y=clamp(target.y,minY,bounds.bottom);
    }
    const distance=Math.hypot(target.x-point.x,target.y-point.y);
    const roomAbove=Math.max(0,Math.min(point.y,target.y)-bounds.top);
    hop={from:{...point},to:target,start:clock,duration:clamp(.38+distance/800,.45,.83),height:Math.min(random(38,88),roomAbove*.85)};
    if(Math.abs(target.x-point.x)>15)roamer.style.setProperty('--jimmitty-facing',target.x<point.x?1:-1);
  }
  function running(){return ready&&!paused&&!document.hidden&&!document.fullscreenElement&&videos.size===0;}
  function tick(now){
    frame=0;if(!running()){last=0;return;}
    if(last)clock+=Math.min(.05,(now-last)/1000);last=now;
    if(!hop&&clock>=restUntil)newHop();
    if(hop){
      const t=clamp((clock-hop.start)/hop.duration,0,1),ease=t;
      point={x:hop.from.x+(hop.to.x-hop.from.x)*ease,y:hop.from.y+(hop.to.y-hop.from.y)*ease};
      paint(4*t*(1-t)*hop.height,(-9+17*t)*Math.sin(t*Math.PI),0,Math.sin(t*Math.PI),0,0);
      if(t===1){point={...hop.to};hop=null;hopCount++;landedAt=clock;restUntil=clock+random(.8,3.3);paint(0,0,0,0,.8);}
    }else{
      const since=clock-landedAt, until=restUntil-clock;
      const crouch=until<.24?Math.sin(clamp((.24-until)/.24,0,1)*Math.PI/2):0;
      const land=since<.20?Math.sin(clamp(since/.20,0,1)*Math.PI):0;
      const walk=since>.28&&since<.78&&until>.3?Math.sin((since-.28)/.5*Math.PI):0;
      if(walk>0){const direction=roamer.style.getPropertyValue('--jimmitty-facing')==='1'?-1:1;point.x=clamp(point.x+direction*walk*.45,bounds.left,bounds.right);}
      paint(0,Math.sin(clock*2.1)*1.2, crouch,0,land,walk);
    }
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    const active=running();
    toggle.textContent=paused?'Play Jimmitty':'Pause Jimmitty';
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.setAttribute('aria-label',paused?'Play Jimmitty the Cricket hopping':'Pause Jimmitty the Cricket hopping');
    roamer.dataset.motion=active?'running':paused?'paused':'suspended';
    roamer.hidden=Boolean(document.fullscreenElement)||videos.size>0;
    if(active&&!frame){last=0;frame=requestAnimationFrame(tick);}
    if(!active&&frame){cancelAnimationFrame(frame);frame=0;last=0;}
  }
  function imageReady(){
    if(ready||!image.naturalWidth)return;
    image.style.display='none';rig.style.display='block';resize();ready=true;roamer.dataset.ready='true';toggle.hidden=false;sync();
  }
  toggle.addEventListener('click',()=>{paused=!paused;sync();});
  document.querySelectorAll('[data-call-jimmitty]').forEach(button=>button.addEventListener('click',()=>{
    // Calling him keeps the visitor on the original-photo entry.
    hop=null;point={x:clamp(bounds.right*.68,bounds.left,bounds.right),y:Math.max(bounds.top,bounds.bottom-24)};
    restUntil=clock+.5;paint();
    if(!reduced.matches)paused=false;
    sync();
  }));
  document.addEventListener('play',event=>{if(event.target instanceof HTMLVideoElement){videos.add(event.target);sync();}},true);
  for(const name of ['pause','ended','emptied'])document.addEventListener(name,event=>{if(event.target instanceof HTMLVideoElement){videos.delete(event.target);sync();}},true);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('fullscreenchange',sync);
  window.addEventListener('resize',resize,{passive:true});
  window.visualViewport?.addEventListener('resize',resize,{passive:true});
  reduced.addEventListener('change',event=>{paused=event.matches;sync();});
  image.addEventListener('load',imageReady,{once:true});
  image.addEventListener('error',()=>{roamer.hidden=true;toggle.hidden=true;},{once:true});
  if(image.complete)imageReady();
})();

