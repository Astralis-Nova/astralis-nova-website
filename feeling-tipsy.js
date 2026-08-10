(()=>{
  if(window.__astralisFeelingTipsyV2)return;
  window.__astralisFeelingTipsyV2=true;
  if(document.getElementById('feelingTipsyButton'))return;

  const PAYPAL_URL='https://paypal.me/ramonbivens';

  const style=document.createElement('style');
  style.id='feelingTipsyStylesV2';
  style.textContent=`
    #feelingTipsyButton{
      position:fixed;right:18px;bottom:18px;z-index:940;
      margin:0;padding:0;border:0;background:transparent;color:#fff;cursor:pointer;
      -webkit-tap-highlight-color:transparent
    }
    .tipsy-jar-wrap{
      display:flex;align-items:center;gap:11px;padding:9px 15px 9px 10px;
      border:1px solid rgba(255,255,255,.2);border-radius:999px;
      background:linear-gradient(135deg,rgba(15,20,39,.94),rgba(31,16,50,.94));
      box-shadow:0 14px 38px rgba(0,0,0,.46),0 0 25px rgba(198,58,174,.24);
      backdrop-filter:blur(11px);transition:transform .18s ease,filter .18s ease
    }
    .tipsy-text{font-weight:900;letter-spacing:.01em;white-space:nowrap}
    .tipsy-jar{
      position:relative;width:42px;height:51px;overflow:visible;
      transform-origin:50% 86%;animation:tipsyIdle 4.2s ease-in-out infinite
    }
    .tipsy-glass{
      position:absolute;left:3px;right:3px;top:6px;bottom:0;overflow:hidden;
      border:2px solid rgba(225,247,255,.75);border-radius:8px 8px 12px 12px;
      background:linear-gradient(110deg,rgba(255,255,255,.28),rgba(255,255,255,.06) 44%,rgba(111,210,255,.18));
      box-shadow:inset 0 0 12px rgba(255,255,255,.17),0 0 15px rgba(93,207,255,.22)
    }
    .tipsy-lid{
      position:absolute;z-index:4;top:1px;left:8px;width:26px;height:9px;
      border-radius:5px 5px 2px 2px;background:linear-gradient(90deg,#74dfff,#c660ff,#ff829e);
      border:1px solid rgba(255,255,255,.58);box-shadow:0 0 10px rgba(147,203,255,.35)
    }
    .tipsy-liquid{
      position:absolute;left:2px;right:2px;bottom:2px;height:58%;
      border-radius:6px 6px 9px 9px;background:linear-gradient(180deg,#55d4ff,#8339e4 52%,#ec168c);
      opacity:.88;transform-origin:50% 100%;animation:tipsySlosh 4.2s ease-in-out infinite
    }
    .tipsy-spark{position:absolute;z-index:3;font-size:.68rem;pointer-events:none;animation:tipsyTwinkle 2.1s ease-in-out infinite}
    .tipsy-spark.one{left:9px;top:17px}.tipsy-spark.two{right:8px;top:27px;animation-delay:.7s}
    .tipsy-label{
      position:absolute;z-index:4;left:50%;bottom:8px;transform:translateX(-50%);
      padding:2px 5px;border:1px solid rgba(255,255,255,.2);border-radius:999px;
      background:rgba(8,13,31,.72);font-size:.55rem;font-weight:900;color:#fff
    }
    .tipsy-coin{
      position:absolute;z-index:5;top:-10px;left:15px;width:13px;height:13px;border-radius:50%;
      display:grid;place-items:center;background:linear-gradient(135deg,#fff6a9,#ffc43d 55%,#d77a00);
      border:1px solid rgba(255,255,255,.72);box-shadow:0 0 9px rgba(255,193,61,.6);
      color:#805000;font-size:.48rem;font-weight:1000;opacity:0
    }
    #feelingTipsyButton:hover .tipsy-jar,#feelingTipsyButton:focus-visible .tipsy-jar{animation:none;transform:rotate(13deg)}
    #feelingTipsyButton:hover .tipsy-liquid,#feelingTipsyButton:focus-visible .tipsy-liquid{animation:none;transform:rotate(-8deg) scaleX(1.04)}
    #feelingTipsyButton:hover .tipsy-jar-wrap,#feelingTipsyButton:focus-visible .tipsy-jar-wrap{transform:translateY(-2px);filter:brightness(1.1)}
    #feelingTipsyButton.tipping .tipsy-jar{animation:tipsyClick .42s ease forwards}
    #feelingTipsyButton.tipping .tipsy-liquid{animation:tipsyClickSlosh .42s ease forwards}
    #feelingTipsyButton.tipping .tipsy-coin{animation:tipsyCoin .42s ease forwards}

    #feelingTipsyPanel{display:none;position:fixed;inset:0;z-index:1200;padding:20px;background:rgba(1,3,9,.82);backdrop-filter:blur(12px);align-items:center;justify-content:center}
    #feelingTipsyPanel.open{display:flex}
    .tipsy-card{position:relative;width:min(610px,100%);border:1px solid rgba(255,179,92,.38);border-radius:24px;padding:30px;background:radial-gradient(circle at 50% 0,rgba(167,55,191,.26),transparent 44%),linear-gradient(180deg,#111024,#070914);box-shadow:0 32px 100px rgba(0,0,0,.65),0 0 40px rgba(179,64,167,.18);text-align:center;color:#fff}
    .tipsy-icon{width:78px;height:78px;margin:0 auto 14px;border-radius:50%;display:grid;place-items:center;font-size:2.15rem;background:radial-gradient(circle at 42% 35%,#fff7cf 0 4%,#ffbf64 13%,#bb3d8e 43%,#35166e 70%,#0b0b20 100%);box-shadow:0 0 30px rgba(237,133,100,.45)}
    .tipsy-kicker{margin:0 0 6px;color:#ffbf78;font-size:.72rem;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    .tipsy-card h2{margin:0 0 12px;font-size:clamp(2rem,7vw,3.35rem);letter-spacing:-.04em}
    .tipsy-card p{margin:0 auto 18px;max-width:520px;color:#d5d9e7;line-height:1.66}
    .tipsy-reasons{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:20px 0;text-align:left}
    .tipsy-reason{padding:11px 12px;border:1px solid rgba(255,255,255,.11);border-radius:14px;background:rgba(255,255,255,.045);color:#e7ebf5;font-size:.86rem}
    .tipsy-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px}
    .tipsy-paypal,.tipsy-later{min-height:46px;padding:11px 18px;border-radius:999px;font-weight:900;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px}
    .tipsy-paypal{background:#0070e0;color:#fff;border:1px solid #53a8ff;box-shadow:0 0 20px rgba(0,112,224,.25)}
    .tipsy-later{background:#111827;color:#fff;border:1px solid rgba(255,255,255,.2);cursor:pointer}
    .tipsy-close{position:absolute;right:13px;top:12px;width:39px;height:39px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#111522;color:#fff;font-size:1.2rem;cursor:pointer}
    .tipsy-note{margin-top:14px!important;font-size:.78rem;color:#9eabc0!important}

    @keyframes tipsyIdle{0%,72%,100%{transform:rotate(0)}78%{transform:rotate(-5deg)}84%{transform:rotate(4deg)}90%{transform:rotate(-2deg)}}
    @keyframes tipsySlosh{0%,72%,100%{transform:rotate(0) scaleX(1)}78%{transform:rotate(4deg) scaleX(1.03)}84%{transform:rotate(-4deg) scaleX(1.03)}90%{transform:rotate(2deg)}}
    @keyframes tipsyTwinkle{0%,100%{opacity:.45;transform:scale(.8)}50%{opacity:1;transform:scale(1.18)}}
    @keyframes tipsyClick{0%{transform:rotate(0)}55%{transform:rotate(27deg) translateY(1px)}100%{transform:rotate(0)}}
    @keyframes tipsyClickSlosh{0%{transform:rotate(0)}55%{transform:rotate(-17deg) scaleX(1.08)}100%{transform:rotate(0)}}
    @keyframes tipsyCoin{0%{opacity:0;transform:translate(0,0) rotate(0)}22%{opacity:1}70%{opacity:1;transform:translate(21px,-15px) rotate(160deg)}100%{opacity:0;transform:translate(27px,2px) rotate(240deg)}}

    @media(max-width:640px){#feelingTipsyButton{right:12px;bottom:12px}.tipsy-jar-wrap{padding:8px 12px 8px 9px}.tipsy-text{font-size:.9rem}.tipsy-card{padding:27px 19px}.tipsy-reasons{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.tipsy-jar,.tipsy-liquid,.tipsy-spark{animation:none!important}.tipsy-coin{display:none}}
  `;
  document.head.appendChild(style);

  const button=document.createElement('button');
  button.id='feelingTipsyButton';
  button.type='button';
  button.setAttribute('aria-haspopup','dialog');
  button.setAttribute('aria-label','Open the Astralis Nova support panel');
  button.innerHTML=`
    <span class="tipsy-jar-wrap">
      <span class="tipsy-jar" aria-hidden="true">
        <span class="tipsy-lid"></span>
        <span class="tipsy-glass">
          <span class="tipsy-liquid"></span>
          <span class="tipsy-spark one">✦</span>
          <span class="tipsy-spark two">✧</span>
          <span class="tipsy-label">SUPPORT</span>
        </span>
        <span class="tipsy-coin">$</span>
      </span>
      <span class="tipsy-text">Fuel the Next Orbit</span>
    </span>`;

  const panel=document.createElement('div');
  panel.id='feelingTipsyPanel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-labelledby','feelingTipsyTitle');
  panel.innerHTML=`
    <div class="tipsy-card">
      <button class="tipsy-close" id="feelingTipsyClose" type="button" aria-label="Close support panel">×</button>
      <div class="tipsy-icon" aria-hidden="true">🚀</div>
      <p class="tipsy-kicker">Support the Astralis Nova mission</p>
      <h2 id="feelingTipsyTitle">Fuel the Next Orbit</h2>
      <p>Astralis Nova is independently created and maintained. Support helps with the work, tools, and time behind keeping this little universe alive and growing.</p>
      <div class="tipsy-reasons">
        <div class="tipsy-reason">🎵 New music and remixes</div>
        <div class="tipsy-reason">🛠️ Website upkeep and repairs</div>
        <div class="tipsy-reason">🛰️ Hosting and creative tools</div>
        <div class="tipsy-reason">🗃️ Archive restoration</div>
        <div class="tipsy-reason">🤖 Nova experiments and features</div>
        <div class="tipsy-reason">⏳ The many hours behind it all</div>
      </div>
      <div class="tipsy-actions">
        <a class="tipsy-paypal" href="${PAYPAL_URL}" target="_blank" rel="noopener noreferrer">💙 Support with PayPal</a>
        <button class="tipsy-later" id="feelingTipsyLater" type="button">Maybe Later</button>
      </div>
      <p class="tipsy-note">Support is always optional and deeply appreciated. PayPal may apply seller or processing fees.</p>
    </div>`;

  document.body.append(button,panel);

  let opening=false;
  const open=()=>{
    if(opening)return;
    opening=true;
    button.classList.add('tipping');
    setTimeout(()=>{
      button.classList.remove('tipping');
      panel.classList.add('open');
      document.body.style.overflow='hidden';
      document.getElementById('feelingTipsyClose')?.focus();
      opening=false;
    },420);
  };
  const close=()=>{panel.classList.remove('open');document.body.style.overflow='';button.focus()};
  button.addEventListener('click',open);
  document.getElementById('feelingTipsyClose')?.addEventListener('click',close);
  document.getElementById('feelingTipsyLater')?.addEventListener('click',close);
  panel.addEventListener('click',event=>{if(event.target===panel)close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open'))close()});
})();