(() => {
  'use strict';

  let radioLive=false;
  let frame=0;
  let start=performance.now();

  function elements(){
    return {
      reel:document.querySelector('.reel-module'),
      cassette:document.querySelector('.cassette-module'),
      reverb:document.querySelector('.reverb-module'),
      needles:[...document.querySelectorAll('.vu-needle')],
      rings:[...document.querySelectorAll('.reverb-tunnel span')],
      preset:document.getElementById('reverbPreset')
    };
  }

  function clearVisuals(){
    const {reel,cassette,reverb,needles,rings}=elements();
    reel?.classList.remove('radio-visual-live');
    cassette?.classList.remove('radio-visual-live');
    reverb?.classList.remove('radio-visual-live');
    needles.forEach(n=>n.style.removeProperty('transform'));
    rings.forEach(r=>{
      r.style.removeProperty('transform');
      r.style.removeProperty('opacity');
      r.style.removeProperty('filter');
    });
  }

  function animate(){
    cancelAnimationFrame(frame);
    if(!radioLive){clearVisuals();return;}

    const {reel,cassette,reverb,needles,rings,preset}=elements();
    reel?.classList.add('radio-visual-live');
    cassette?.classList.add('radio-visual-live');
    reverb?.classList.add('radio-visual-live');

    const t=(performance.now()-start)/1000;
    const a=Math.sin(t*5.9);
    const b=Math.sin(t*9.7)*0.46;
    const c=Math.sin(t*2.8)*0.28;
    const beat=(a+b+c)/1.74;
    const level=Math.max(0,Math.min(1,(beat+1)/2));

    needles.forEach((n,i)=>{
      const angle=-40 + level*(58+i*5);
      n.style.transform=`rotate(${angle.toFixed(1)}deg)`;
    });

    if(preset?.value!=='off'){
      rings.forEach((r,i)=>{
        const scale=1 + level*(0.045+i*0.018);
        r.style.transform=`scale(${scale.toFixed(3)})`;
        r.style.opacity=String(Math.max(.28,1-i*.13+level*.12));
        r.style.filter=`brightness(${(0.9+level*.45).toFixed(2)})`;
      });
    }else{
      rings.forEach(r=>{
        r.style.removeProperty('transform');
        r.style.removeProperty('opacity');
        r.style.removeProperty('filter');
      });
    }

    frame=requestAnimationFrame(animate);
  }

  const style=document.createElement('style');
  style.textContent=`
    .reel-module.radio-visual-live .r83-supply,
    .reel-module.radio-visual-live .r83-takeup{animation:legacy83RadioReelSpin 1.25s linear infinite}
    .cassette-module.radio-visual-live .cassette-window{animation:cassetteRadioPulse .75s ease-in-out infinite alternate}
    .reverb-module.radio-visual-live .reverb-tunnel{filter:brightness(1.08)}
    @keyframes legacy83RadioReelSpin{to{transform:rotate(360deg)}}
  `;
  document.head.appendChild(style);

  window.addEventListener('legacy83-radio-state',e=>{
    radioLive=!!e.detail?.playing;
    start=performance.now();
    animate();
  });

  document.getElementById('reverbPreset')?.addEventListener('change',()=>{if(radioLive)animate();});
  window.addEventListener('pagehide',()=>{radioLive=false;cancelAnimationFrame(frame);clearVisuals();});
})();
