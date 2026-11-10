(() => {
  'use strict';
  const roamer=document.getElementById('jimmittyRoamer');
  const toggle=document.getElementById('jimmittyToggle');
  if(!roamer||!toggle||roamer.dataset.initialized)return;
  roamer.dataset.initialized='true';
  const image=roamer.querySelector('img'),body=roamer.querySelector('.jimmitty-body');
  const shadow=roamer.querySelector('.jimmitty-shadow');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduced.matches,ready=false,frame=0,last=0,clock=0,restUntil=1.5;
  let point={x:0,y:0},hop=null,hopCount=0,bounds={left:12,top:92,right:12,bottom:92},size={w:166,h:188};
  const videos=new Set();
  const random=(min,max)=>min+Math.random()*(max-min);
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  function paint(altitude=0,pitch=0){
    roamer.style.transform='translate3d('+point.x.toFixed(2)+'px,'+point.y.toFixed(2)+'px,0)';
    body.style.transform='translateY('+(-altitude).toFixed(2)+'px) rotate('+pitch.toFixed(2)+'deg)';
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
    hop={from:{...point},to:target,start:clock,duration:clamp(.58+distance/650,.66,1.18),height:Math.min(random(38,88),roomAbove*.85)};
    if(Math.abs(target.x-point.x)>15)roamer.style.setProperty('--jimmitty-facing',target.x<point.x?1:-1);
  }
  function running(){return ready&&!paused&&!document.hidden&&!document.fullscreenElement&&videos.size===0;}
  function tick(now){
    frame=0;if(!running()){last=0;return;}
    if(last)clock+=Math.min(.05,(now-last)/1000);last=now;
    if(!hop&&clock>=restUntil)newHop();
    if(hop){
      const t=clamp((clock-hop.start)/hop.duration,0,1),ease=t*t*(3-2*t);
      point={x:hop.from.x+(hop.to.x-hop.from.x)*ease,y:hop.from.y+(hop.to.y-hop.from.y)*ease};
      paint(4*t*(1-t)*hop.height,Math.sin(t*Math.PI)*(t<.5?-7:5));
      if(t===1){point={...hop.to};hop=null;hopCount++;restUntil=clock+random(1.1,3.8);paint();}
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
    resize();ready=true;roamer.dataset.ready='true';toggle.hidden=false;sync();
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

