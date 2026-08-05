(()=>{
  if(window.__astralisNovaMidiUpgradeV3)return;
  window.__astralisNovaMidiUpgradeV3=true;

  const midis=[
    {src:'/Audio/goodvib.mid',title:'Good Vibrations'},
    {src:'/Audio/turnyoureyes.mid',title:'Turn Your Eyes'},
    {src:'/Audio/angelswatching.mid',title:'Angels Watching'}
  ];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const root=document.getElementById('novaGuide');
  if(!root)return;

  const style=document.createElement('style');
  style.id='novaMidiUpgradeStylesV3';
  style.textContent=`
    #novaGuide .nova-orb-wrap{
      width:210px!important;
      min-width:210px!important;
      height:104px!important;
      position:relative!important;
      overflow:visible!important;
      display:block!important;
    }
    #novaGuide .nova-orb{
      position:absolute!important;
      left:50%!important;
      top:50%!important;
      margin:0!important;
      transform:translate(-50%,-50%)!important;
    }
    #novaGuide .nova-hand{
      position:absolute!important;
      top:50%!important;
      margin:0!important;
      font-size:1.72rem!important;
      line-height:1!important;
      z-index:5!important;
      pointer-events:none!important;
    }
    #novaGuide .nova-hand.left{
      left:8px!important;
      right:auto!important;
      transform:translateY(-50%)!important;
    }
    #novaGuide .nova-hand.right{
      right:8px!important;
      left:auto!important;
      transform:translateY(-50%)!important;
    }
    #musicToggle,#musicDock,#playerToggle,#audioToggle,#floatingPlay,
    .music-dock,.music-player,.music-float,.floating-music,.site-music-toggle,
    .floating-player,.player-dock,.audio-dock,.site-audio-dock,.floating-audio,
    [data-music-toggle],[data-audio-toggle]{
      display:none!important;
      visibility:hidden!important;
      opacity:0!important;
      pointer-events:none!important;
    }
    #novaMidiPlayer{
      position:fixed!important;
      width:1px!important;
      height:1px!important;
      opacity:0!important;
      pointer-events:none!important;
      left:-9999px!important;
      bottom:-9999px!important;
    }
    @media(max-width:560px){
      #novaGuide .nova-orb-wrap{width:184px!important;min-width:184px!important;height:92px!important}
      #novaGuide .nova-hand.left{left:8px!important}
      #novaGuide .nova-hand.right{right:8px!important}
      #novaGuide .nova-hand{font-size:1.45rem!important}
    }
  `;
  document.head.appendChild(style);

  const looksLikeLegacyPlay=el=>{
    if(!el||el.closest('#novaGuide'))return false;
    const text=((el.getAttribute?.('aria-label')||'')+' '+(el.getAttribute?.('title')||'')+' '+(el.textContent||'')).toLowerCase();
    const visual=(el.innerHTML||'').toLowerCase();
    const musicWords=/(background music|site music|music player|play music|pause music|audio player|soundtrack)/.test(text);
    const playSymbol=/[▶⏵⏯⏸♫♪]/.test(text)||/&(?:#9654|play)/.test(visual);
    if(!musicWords&&!playSymbol)return false;
    const box=el.getBoundingClientRect?.();
    const nearBottomLeft=box&&box.left<180&&box.bottom>innerHeight-180;
    let node=el;
    let fixed=false;
    while(node&&node!==document.body){
      const pos=getComputedStyle(node).position;
      if(pos==='fixed'||pos==='sticky'){fixed=true;break}
      node=node.parentElement;
    }
    return musicWords||(playSymbol&&nearBottomLeft&&fixed);
  };

  const hideNode=el=>{
    el.hidden=true;
    el.setAttribute?.('aria-hidden','true');
    if('tabIndex'in el)el.tabIndex=-1;
    el.style?.setProperty('display','none','important');
    let p=el.parentElement;
    while(p&&p!==document.body&&p!==root){
      const pos=getComputedStyle(p).position;
      if(pos==='fixed'||pos==='sticky'){
        p.hidden=true;
        p.setAttribute('aria-hidden','true');
        p.style.setProperty('display','none','important');
        break;
      }
      p=p.parentElement;
    }
  };

  const removeLegacyPlayer=()=>{
    const selectors=['#musicToggle','#musicDock','#playerToggle','#audioToggle','#floatingPlay','.music-dock','.music-player','.music-float','.floating-music','.site-music-toggle','.floating-player','.player-dock','.audio-dock','.site-audio-dock','.floating-audio','[data-music-toggle]','[data-audio-toggle]'];
    document.querySelectorAll(selectors.join(',')).forEach(hideNode);
    document.querySelectorAll('button,a,[role="button"]').forEach(el=>{if(looksLikeLegacyPlay(el))hideNode(el)});
  };
  removeLegacyPlayer();
  new MutationObserver(removeLegacyPlayer).observe(document.body,{childList:true,subtree:true});
  addEventListener('resize',removeLegacyPlayer,{passive:true});

  let player=null;
  let armedTrack=null;
  let midiStarted=false;

  const ensureLibrary=()=>new Promise((resolve,reject)=>{
    if(customElements.get('midi-player')){resolve();return}
    const existing=document.querySelector('script[data-html-midi-player]');
    if(existing){
      customElements.whenDefined('midi-player').then(resolve).catch(reject);
      return;
    }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/html-midi-player@1.5.0';
    script.dataset.htmlMidiPlayer='true';
    script.onload=()=>customElements.whenDefined('midi-player').then(resolve).catch(reject);
    script.onerror=reject;
    document.head.appendChild(script);
  });

  const ensurePlayer=async()=>{
    await ensureLibrary();
    player=document.getElementById('novaMidiPlayer');
    if(!player){
      player=document.createElement('midi-player');
      player.id='novaMidiPlayer';
      player.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
      document.body.appendChild(player);
    }
    return player;
  };

  const msg=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const face=root.querySelector('#novaFace');
  const left=root.querySelector('#novaLeft');
  const right=root.querySelector('#novaRight');
  const input=root.querySelector('#novaCommand');
  const emote=()=>{if(face)face.textContent=pick(['🎹','🎵','🎧','😊','🖖']);if(left)left.textContent=pick(['🤘','👏','🖖']);if(right)right.textContent=pick(['🤘','👏','🖖'])};
  const say=text=>{if(msg)msg.textContent=text;if(status)status.textContent=text};

  const armRandom=async()=>{
    armedTrack=pick(midis);
    try{
      const p=await ensurePlayer();
      p.src=armedTrack.src;
      p.setAttribute('src',armedTrack.src);
      if(status)status.textContent=`MIDI armed: ${armedTrack.title}.`;
      return true;
    }catch{
      if(status)status.textContent='MIDI engine could not initialize.';
      return false;
    }
  };

  const playArmed=async(forceNew=false)=>{
    if(forceNew||!armedTrack)await armRandom();
    const p=await ensurePlayer().catch(()=>null);
    if(!p||!armedTrack)return false;
    document.querySelectorAll('audio,video').forEach(m=>{if(!m.paused)m.pause()});
    try{p.stop?.()}catch{}
    p.src=armedTrack.src;
    p.setAttribute('src',armedTrack.src);
    emote();
    try{
      if(typeof p.start==='function')await p.start();
      else if(typeof p.play==='function')await p.play();
      else p.shadowRoot?.querySelector('button')?.click();
      midiStarted=true;
      say(`Engaging, Captain. Random archive transmission online: ${armedTrack.title}.`);
      return true;
    }catch{
      midiStarted=false;
      if(status)status.textContent=`${armedTrack.title} is armed. Click Nova or anywhere on the page to start it.`;
      return false;
    }
  };

  const stopMidi=()=>{
    try{player?.stop?.()}catch{}
    midiStarted=false;
    say('MIDI channel paused, Captain.');
  };

  const addButtons=()=>{
    const ops=[...root.querySelectorAll('.nova-section')].find(x=>/operations/i.test(x.textContent||''));
    const actions=ops?.nextElementSibling||root.querySelector('.nova-actions');
    if(!actions||root.querySelector('[data-midi-action]'))return;
    const make=(key,title,small)=>{const b=document.createElement('button');b.className='nova-action';b.type='button';b.dataset.midiAction=key;b.innerHTML=`${title}<small>${small}</small>`;actions.appendChild(b)};
    make('play','🎹 Random MIDI','Nova chooses an archive tune');
    make('stop','⏹ Stop MIDI','Silence Nova’s MIDI channel');
  };
  addButtons();

  root.addEventListener('click',e=>{
    const key=e.target.closest('[data-midi-action]')?.dataset.midiAction;
    if(!key)return;
    e.preventDefault();e.stopPropagation();
    key==='play'?playArmed(true):stopMidi();
  },true);

  const handle=text=>{
    const q=(text||'').toLowerCase().trim();
    if(/(play|start).*(random )?midi|random midi|play archive music|play old music/.test(q)){playArmed(true);return true}
    if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){stopMidi();return true}
    return false;
  };
  root.querySelector('#novaSend')?.addEventListener('click',e=>{if(handle(input?.value)){e.preventDefault();e.stopImmediatePropagation();if(input)input.value=''}},true);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&handle(input.value)){e.preventDefault();e.stopImmediatePropagation();input.value=''}},true);

  setTimeout(async()=>{
    await armRandom();
    await playArmed(false);
  },1400);

  const firstInteraction=async()=>{
    if(!armedTrack)await armRandom();
    if(!midiStarted)await playArmed(false);
  };
  document.addEventListener('pointerdown',firstInteraction,{once:true,capture:true});
  document.addEventListener('keydown',firstInteraction,{once:true,capture:true});
})();