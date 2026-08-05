(()=>{
  if(window.__astralisNovaMidiUpgrade)return;
  window.__astralisNovaMidiUpgrade=true;

  const midis=[
    {src:'/Audio/goodvib.mid',title:'Good Vibrations'},
    {src:'/Audio/turnyoureyes.mid',title:'Turn Your Eyes'},
    {src:'/Audio/angelswatching.mid',title:'Angels Watching'}
  ];
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const root=document.getElementById('novaGuide');
  if(!root)return;

  const style=document.createElement('style');
  style.textContent=`
    #novaGuide .nova-orb-wrap{width:154px!important}
    #novaGuide .nova-hand.left{left:-7px!important}
    #novaGuide .nova-hand.right{right:-7px!important}
    #novaGuide .nova-hand{top:34px!important;font-size:1.65rem!important}
    #musicToggle,.music-float,.floating-music,.site-music-toggle{display:none!important}
    #novaMidiPlayer{position:fixed!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important;left:-9999px!important;bottom:-9999px!important}
    @media(max-width:560px){#novaGuide .nova-orb-wrap{width:128px!important}#novaGuide .nova-hand.left{left:-3px!important}#novaGuide .nova-hand.right{right:-3px!important}}
  `;
  document.head.appendChild(style);

  const oldToggle=document.getElementById('musicToggle');
  if(oldToggle){oldToggle.hidden=true;oldToggle.setAttribute('aria-hidden','true');oldToggle.tabIndex=-1}

  let player=document.getElementById('novaMidiPlayer');
  if(!player){
    player=document.createElement('midi-player');
    player.id='novaMidiPlayer';
    player.setAttribute('sound-font','https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
    document.body.appendChild(player);
  }

  const msg=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const face=root.querySelector('#novaFace');
  const left=root.querySelector('#novaLeft');
  const right=root.querySelector('#novaRight');
  const input=root.querySelector('#novaCommand');

  const emote=()=>{if(face)face.textContent=pick(['🎹','🎵','🎧','😊','🖖']);if(left)left.textContent=pick(['🤘','👏','🖖']);if(right)right.textContent=pick(['🤘','👏','🖖'])};
  const say=text=>{if(msg)msg.textContent=text;if(status)status.textContent=text};
  const loadAndPlay=async(track=pick(midis))=>{
    document.querySelectorAll('audio,video').forEach(m=>{if(!m.paused)m.pause()});
    try{player.stop?.()}catch{}
    player.src=track.src;
    player.setAttribute('src',track.src);
    emote();
    say(`Engaging, Captain. Playing random MIDI: ${track.title}.`);
    try{await player.start?.();return true}catch{}
    try{await player.play?.();return true}catch{}
    status.textContent=`${track.title} is loaded. Tap Nova once, then ask me to play MIDI again if your browser blocked autoplay.`;
    return false;
  };
  const stopMidi=()=>{try{player.stop?.()}catch{};say('MIDI channel paused, Captain.')};

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
    if(key==='play')loadAndPlay();else stopMidi();
  },true);

  const handle=text=>{
    const q=(text||'').toLowerCase().trim();
    if(/(play|start).*(random )?midi|random midi|play archive music|play old music/.test(q)){loadAndPlay();return true}
    if(/stop.*midi|pause.*midi|silence.*midi/.test(q)){stopMidi();return true}
    return false;
  };
  root.querySelector('#novaSend')?.addEventListener('click',e=>{if(handle(input?.value)){e.preventDefault();e.stopImmediatePropagation();if(input)input.value=''}},true);
  input?.addEventListener('keydown',e=>{if(e.key==='Enter'&&handle(input.value)){e.preventDefault();e.stopImmediatePropagation();input.value=''}},true);

  const tryAutoplay=()=>{
    if(sessionStorage.getItem('novaMidiAttempted'))return;
    sessionStorage.setItem('novaMidiAttempted','1');
    loadAndPlay();
  };
  setTimeout(tryAutoplay,1600);
  document.addEventListener('pointerdown',()=>{if(player&&player.src&&!player.playing)player.start?.().catch?.(()=>{})},{once:true,capture:true});
})();