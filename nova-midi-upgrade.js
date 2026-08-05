(()=>{
  if(window.__astralisNovaMidiUpgradeV2)return;
  window.__astralisNovaMidiUpgradeV2=true;

  const midis=[
    {src:'/Audio/goodvib.mid',title:'Good Vibrations'},
    {src:'/Audio/turnyoureyes.mid',title:'Turn Your Eyes'},
    {src:'/Audio/angelswatching.mid',title:'Angels Watching'}
  ];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const root=document.getElementById('novaGuide');
  if(!root)return;

  const style=document.createElement('style');
  style.id='novaMidiUpgradeStylesV2';
  style.textContent=`
    #novaGuide .nova-orb-wrap{width:190px!important;min-width:190px!important;overflow:visible!important}
    #novaGuide .nova-hand{position:absolute!important;top:32px!important;font-size:1.75rem!important;z-index:4!important}
    #novaGuide .nova-hand.left{left:-28px!important;right:auto!important}
    #novaGuide .nova-hand.right{right:-28px!important;left:auto!important}
    #musicToggle,#musicDock,.music-dock,.music-player,.music-float,.floating-music,.site-music-toggle,.floating-player{display:none!important;visibility:hidden!important;pointer-events:none!important}
    #novaMidiPlayer{position:fixed!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;left:-9999px!important;bottom:-9999px!important}
    @media(max-width:560px){
      #novaGuide .nova-orb-wrap{width:152px!important;min-width:152px!important}
      #novaGuide .nova-hand.left{left:-19px!important}
      #novaGuide .nova-hand.right{right:-19px!important}
      #novaGuide .nova-hand{font-size:1.45rem!important}
    }
  `;
  document.head.appendChild(style);

  const removeLegacyPlayer=()=>{
    const selectors=['#musicToggle','#musicDock','.music-dock','.music-player','.music-float','.floating-music','.site-music-toggle','.floating-player'];
    document.querySelectorAll(selectors.join(',')).forEach(el=>{
      el.hidden=true;
      el.setAttribute('aria-hidden','true');
      el.tabIndex=-1;
      el.style.setProperty('display','none','important');
      const parent=el.parentElement;
      if(parent&&getComputedStyle(parent).position==='fixed'&&parent!==root){
        parent.hidden=true;
        parent.setAttribute('aria-hidden','true');
        parent.style.setProperty('display','none','important');
      }
    });
    [...document.querySelectorAll('button')].forEach(button=>{
      if(button.closest('#novaGuide'))return;
      const label=((button.getAttribute('aria-label')||'')+' '+(button.textContent||'')).toLowerCase();
      if(!/(background music|music paused|play background|pause background)/.test(label))return;
      const fixed=[button,...button.parents||[]].find?.(()=>false);
      button.hidden=true;button.tabIndex=-1;button.style.setProperty('display','none','important');
      let p=button.parentElement;
      while(p&&p!==document.body){if(getComputedStyle(p).position==='fixed'){p.hidden=true;p.style.setProperty('display','none','important');break}p=p.parentElement}
    });
  };
  removeLegacyPlayer();
  new MutationObserver(removeLegacyPlayer).observe(document.body,{childList:true,subtree:true});

  let player=document.getElementById('novaMidiPlayer');
  if(!player){player=document.createElement('midi-player');player.id='novaMidiPlayer';player.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');document.body.appendChild(player)}
  const msg=root.querySelector('#novaMessage'),status=root.querySelector('#novaStatus'),face=root.querySelector('#novaFace'),left=root.querySelector('#novaLeft'),right=root.querySelector('#novaRight'),input=root.querySelector('#novaCommand');
  const emote=()=>{if(face)face.textContent=pick(['🎹','🎵','🎧','😊','🖖']);if(left)left.textContent=pick(['🤘','👏','🖖']);if(right)right.textContent=pick(['🤘','👏','🖖'])};
  const say=text=>{if(msg)msg.textContent=text;if(status)status.textContent=text};
  const loadAndPlay=async(track=pick(midis))=>{document.querySelectorAll('audio,video').forEach(m=>{if(!m.paused)m.pause()});try{player.stop?.()}catch{}player.src=track.src;player.setAttribute('src',track.src);emote();say(`Engaging, Captain. Playing random MIDI: ${track.title}.`);try{await player.start?.();return true}catch{}try{await player.play?.();return true}catch{}status.textContent=`${track.title} is loaded. Tap Nova once, then ask me to play MIDI again if autoplay was blocked.`;return false};
  const stopMidi=()=>{try{player.stop?.()}catch{}say('MIDI channel paused, Captain.')};
  const addButtons=()=>{const ops=[...root.querySelectorAll('.nova-section')].find(x=>/operations/i.test(x.textContent||''));const actions=ops?.nextElementSibling||root.querySelector('.nova-actions');if(!actions||root.querySelector('[data-midi-action]'))return;const make=(key,title,small)=>{const b=document.createElement('button');b.className='nova-action';b.type='button';b.dataset.midiAction=key;b.innerHTML=`${title}<small>${small}</small>`;actions.appendChild(b)};make('play','🎹 Random MIDI','Nova chooses an archive tune');make('stop','⏹ Stop MIDI','Silence Nova’s MIDI channel')};
  addButtons();
  root.addEventListener('click',e=>{const key=e.target.closest('[data-midi-action]')?.dataset.midiAction;if(!key)return;e.preventDefault();e.stopPropagation();key==='play'?loadAndPlay():stopMidi()},true);
  const handle=text=>{const q=(text||'').toLowerCase().trim();if(/(play|start).*(random )?midi|random midi|play archive music|play old music/.test(q)){loadAndPlay();return true}if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){stopMidi();return true}return false};
  root.querySelector('#novaSend')?.addEventListener('click',e=>{if(handle(input?.value)){e.preventDefault();e.stopImmediatePropagation();if(input)input.value=''}},true);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&handle(input.value)){e.preventDefault();e.stopImmediatePropagation();input.value=''}},true);
  setTimeout(()=>{if(!sessionStorage.getItem('novaMidiAttempted')){sessionStorage.setItem('novaMidiAttempted','1');loadAndPlay()}},1600);
  document.addEventListener('pointerdown',()=>{if(player&&player.src&&!player.playing)player.start?.().catch?.(()=>{})},{once:true,capture:true});
})();