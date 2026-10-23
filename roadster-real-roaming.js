(() => {
  'use strict';
  // Footage directly embedded from Tesla's own October 15, 2026 YouTube video.
  // The car is NOT drawn or AI-generated. Only the video frame moves around the page.
  const videoId='r5vsHHPVhJg';
  const official='https://www.youtube.com/watch?v='+videoId;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const stage=document.createElement('div');
  stage.id='astralis-real-roadster';
  stage.setAttribute('aria-label','Real 2026 Tesla Roadster thruster demonstration video');
  stage.innerHTML='<div class="roadster-real-media"><img src="https://i.ytimg.com/vi/'+videoId+'/hqdefault.jpg" alt="" decoding="async"></div>'+
    '<a class="roadster-real-hit" href="'+official+'" target="_blank" rel="noopener noreferrer" aria-label="Watch the official Tesla Roadster 2026 kickflip video">'+
    '<span class="roadster-real-label">▶ REAL ROADSTER · TESLA FOOTAGE</span></a>'+
    '<button class="roadster-real-close" aria-label="Hide the roaming real Roadster video" title="Hide video">×</button>';
  document.body.appendChild(stage);
  const media=stage.querySelector('.roadster-real-media');
  const close=stage.querySelector('.roadster-real-close');
  let frame=0,elapsed=0,previous=0,width=0,height=0,visible=true,loaded=false;
  const pos={x:20,y:128};
  const bound=(v,min,max)=>Math.min(max,Math.max(min,v));
  const videoUrl='https://www.youtube-nocookie.com/embed/'+videoId+
    '?autoplay=1&mute=1&loop=1&playlist='+videoId+'&controls=0&playsinline=1&rel=0&disablekb=1';
  function size(){
    const r=stage.getBoundingClientRect();width=r.width;height=r.height;
  }
  function update(seconds){
    const headerBottom=document.querySelector('.topbar')?.getBoundingClientRect().bottom||84;
    const maxX=Math.max(10,innerWidth-width-18);
    const maxY=Math.max(headerBottom+14,innerHeight-height-40);
    const minY=Math.min(headerBottom+16,maxY);
    const periodX=seconds*Math.PI*2/113;
    const periodY=seconds*Math.PI*2/91;
    pos.x=bound(maxX*(.49+.42*Math.sin(periodX)+.07*Math.sin(seconds*Math.PI*2/31)),10,maxX);
    pos.y=bound(minY+(maxY-minY)*(.52+.38*Math.cos(periodY)+.08*Math.sin(seconds*Math.PI*2/43)),minY,maxY);
    stage.style.setProperty('--roadster-real-x',Math.round(pos.x)+'px');
    stage.style.setProperty('--roadster-real-y',Math.round(pos.y)+'px');
    stage.style.setProperty('--roadster-real-tilt',(-2+4*Math.sin(seconds*Math.PI*2/35)).toFixed(2)+'deg');
  }
  function motion(now){
    frame=0;
    if(!visible||document.hidden||reduced.matches){previous=now;return}
    if(previous)elapsed+=Math.min(100,now-previous)/1000;
    previous=now;update(elapsed);frame=requestAnimationFrame(motion);
  }
  function sync(){
    cancelAnimationFrame(frame);frame=0;previous=0;
    if(!visible||document.hidden)return;
    size();
    if(reduced.matches){
      stage.style.setProperty('--roadster-real-x','12px');
      stage.style.setProperty('--roadster-real-y','104px');
      stage.style.setProperty('--roadster-real-tilt','0deg');
    }else{update(elapsed);frame=requestAnimationFrame(motion)}
  }
  function startRealVideo(){
    if(loaded||reduced.matches||!visible||document.hidden)return;
    loaded=true;
    const iframe=document.createElement('iframe');
    iframe.src=videoUrl;
    iframe.title='Authentic Tesla Roadster 2026 Kickflip with cold-gas thrusters';
    iframe.allow='autoplay; encrypted-media; picture-in-picture';
    iframe.referrerPolicy='strict-origin-when-cross-origin';
    iframe.setAttribute('loading','eager');
    iframe.setAttribute('tabindex','-1');
    iframe.addEventListener('load',()=>stage.classList.add('video-active'),{once:true});
    media.appendChild(iframe);
  }
  close.addEventListener('click',()=>{
    visible=false;cancelAnimationFrame(frame);frame=0;stage.remove();
  });
  window.addEventListener('resize',sync,{passive:true});
  document.addEventListener('visibilitychange',sync);
  if(reduced.addEventListener)reduced.addEventListener('change',sync);
  sync();
  if('requestIdleCallback' in window)requestIdleCallback(startRealVideo,{timeout:1500});
  else setTimeout(startRealVideo,700);
})();