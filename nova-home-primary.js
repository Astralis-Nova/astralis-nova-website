(()=>{
  if(window.__astralisNovaHomePrimaryV1)return;
  window.__astralisNovaHomePrimaryV1=true;
  const isHome=location.pathname==='/'||/index\.html$/i.test(location.pathname);
  if(!isHome)return;

  const css=document.createElement('style');
  css.textContent=`
    .nova-primary-dock{width:min(1500px,calc(100% - 36px));margin:18px auto 4px;padding:18px;border:1px solid rgba(112,199,255,.48);border-radius:18px;background:radial-gradient(circle at 90% 0,rgba(231,53,255,.12),transparent 32%),radial-gradient(circle at 0 0,rgba(42,153,255,.18),transparent 36%),linear-gradient(180deg,rgba(8,17,34,.88),rgba(5,11,24,.94));box-shadow:0 18px 55px rgba(0,0,0,.34),0 0 34px rgba(38,153,255,.09);backdrop-filter:blur(14px);position:relative;overflow:hidden}
    .nova-primary-dock:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,.035),transparent);transform:translateX(-100%);animation:novaPrimarySweep 8s linear infinite}
    .nova-primary-top{display:flex;align-items:center;gap:14px;justify-content:space-between;flex-wrap:wrap}
    .nova-primary-id{display:flex;align-items:center;gap:12px;min-width:0}
    .nova-primary-orb{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;font-size:1.35rem;border:1px solid rgba(184,239,255,.88);background:radial-gradient(circle at 42% 34%,#fff 0 3%,#81e5ff 7%,#317fe2 28%,#32156e 58%,#090a1e 76%);box-shadow:0 0 20px rgba(79,207,255,.65),0 0 42px rgba(138,56,255,.32)}
    .nova-primary-id h2{margin:0;font-size:1.15rem}.nova-primary-id p{margin:3px 0 0;color:#9fb6cf;font-size:.78rem}
    .nova-primary-live{font-size:.69rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#63e6bb;padding:6px 9px;border-radius:999px;border:1px solid rgba(99,230,187,.28);background:rgba(18,92,71,.13)}
    .nova-primary-row{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:14px}
    .nova-primary-input{min-width:0;height:52px;border-radius:14px;border:1px solid rgba(103,178,232,.42);background:#08152c;color:#fff;padding:0 15px;outline:none;font:inherit}
    .nova-primary-input:focus{border-color:#67d6ff;box-shadow:0 0 0 3px rgba(67,179,255,.13)}
    .nova-primary-send{min-width:112px;height:52px;border:0;border-radius:14px;color:#fff;font-weight:900;cursor:pointer;background:linear-gradient(90deg,#147df5,#d326c4);box-shadow:0 10px 28px rgba(117,52,224,.23)}
    .nova-primary-prompts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.nova-primary-chip{border:1px solid rgba(113,182,232,.27);background:rgba(13,29,55,.8);color:#dcecff;padding:8px 10px;border-radius:999px;font-size:.73rem;cursor:pointer}.nova-primary-chip:hover{border-color:#67d6ff}
    .nova-primary-manual{margin-left:auto}.nova-primary-manual button{border:1px solid rgba(113,182,232,.28);background:#0b1730;color:#d8e9ff;padding:8px 11px;border-radius:999px;cursor:pointer;font-size:.73rem;font-weight:800}
    #novaGuide .nova-destinations-toggle{width:100%;margin:8px 0 0;min-height:42px;border-radius:11px;border:1px solid rgba(108,178,232,.29);background:rgba(10,23,46,.95);color:#fff;cursor:pointer;font-weight:850;text-align:left;padding:9px 11px}
    #novaGuide .nova-destinations-collapsed{display:none!important}
    @keyframes novaPrimarySweep{to{transform:translateX(100%)}}
    @media(max-width:640px){.nova-primary-dock{width:calc(100% - 18px);padding:14px;margin-top:10px}.nova-primary-row{grid-template-columns:1fr}.nova-primary-send{width:100%}.nova-primary-live{display:none}}
    @media(prefers-reduced-motion:reduce){.nova-primary-dock:before{animation:none}}
  `;
  document.head.appendChild(css);

  const waitForNova=(attempt=0)=>{
    const root=document.getElementById('novaGuide');
    if(!root){if(attempt<60)setTimeout(()=>waitForNova(attempt+1),100);return}
    const panel=root.querySelector('#novaPanel');
    const command=root.querySelector('#novaCommand');
    const send=root.querySelector('#novaSend');
    if(!panel||!command||!send){if(attempt<60)setTimeout(()=>waitForNova(attempt+1),100);return}

    let destinationHeading=[...root.querySelectorAll('.nova-section')].find(el=>/destinations/i.test(el.textContent||''));
    let destinationActions=destinationHeading?.nextElementSibling;
    if(destinationHeading&&destinationActions?.classList.contains('nova-actions')){
      destinationHeading.textContent='Explore Manually';
      destinationActions.classList.add('nova-destinations-collapsed');
      const toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='nova-destinations-toggle';
      toggle.setAttribute('aria-expanded','false');
      toggle.textContent='🗺️ Show manual destinations';
      toggle.addEventListener('click',()=>{
        const opening=destinationActions.classList.contains('nova-destinations-collapsed');
        destinationActions.classList.toggle('nova-destinations-collapsed',!opening);
        toggle.setAttribute('aria-expanded',String(opening));
        toggle.textContent=opening?'🗺️ Hide manual destinations':'🗺️ Show manual destinations';
      });
      destinationHeading.after(toggle);
    }

    const dock=document.createElement('section');
    dock.className='nova-primary-dock';
    dock.setAttribute('aria-label','Ask Nova');
    dock.innerHTML=`<div class="nova-primary-top"><div class="nova-primary-id"><div class="nova-primary-orb">🌌</div><div><h2>Ask Nova</h2><p>Your guide to Astralis Nova, powered by the Deep Archive.</p></div></div><span class="nova-primary-live">AI + Vector memory online</span></div><div class="nova-primary-row"><input class="nova-primary-input" type="text" aria-label="Ask Nova a question" placeholder="Ask about music, memories, wildlife, Ramon, Cactus Forest, Darktide…"><button class="nova-primary-send" type="button">Ask Nova</button></div><div class="nova-primary-prompts"><button class="nova-primary-chip" type="button" data-prompt="What does Astralis Nova mean?">Meaning of Astralis Nova</button><button class="nova-primary-chip" type="button" data-prompt="Who is Zoey?">Who is Zoey?</button><button class="nova-primary-chip" type="button" data-prompt="What is Cactus Forest?">Cactus Forest</button><button class="nova-primary-chip" type="button" data-prompt="Take me to the guestbook">Open Guestbook</button><span class="nova-primary-manual"><button type="button">Explore Manually</button></span></div>`;

    const hero=document.querySelector('.hero');
    if(hero)hero.insertAdjacentElement('afterend',dock);else (document.querySelector('main')||document.body).prepend(dock);

    const topInput=dock.querySelector('.nova-primary-input');
    const submit=q=>{
      q=String(q||'').trim();if(!q)return;
      command.value=q;
      panel.classList.add('open');panel.setAttribute('aria-hidden','false');
      send.click();
      topInput.value='';
    };
    dock.querySelector('.nova-primary-send').addEventListener('click',()=>submit(topInput.value));
    topInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();submit(topInput.value)}});
    dock.querySelectorAll('[data-prompt]').forEach(btn=>btn.addEventListener('click',()=>submit(btn.dataset.prompt)));
    dock.querySelector('.nova-primary-manual button').addEventListener('click',()=>{
      panel.classList.add('open');panel.setAttribute('aria-hidden','false');
      if(destinationActions){destinationActions.classList.remove('nova-destinations-collapsed');const t=root.querySelector('.nova-destinations-toggle');if(t){t.setAttribute('aria-expanded','true');t.textContent='🗺️ Hide manual destinations'}}
      destinationHeading?.scrollIntoView({block:'center',behavior:'smooth'});
    });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>waitForNova(),{once:true});else waitForNova();
})();
