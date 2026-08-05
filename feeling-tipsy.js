(()=>{
  if(window.__astralisFeelingTipsyV1)return;
  window.__astralisFeelingTipsyV1=true;
  if(document.getElementById('feelingTipsyButton'))return;

  const PAYPAL_URL='https://paypal.me/ramonbivens';

  const style=document.createElement('style');
  style.id='feelingTipsyStyles';
  style.textContent=`
    #feelingTipsyButton{
      position:fixed;right:18px;bottom:18px;z-index:940;
      min-height:48px;padding:11px 17px;border:1px solid rgba(255,255,255,.24);
      border-radius:999px;background:linear-gradient(135deg,#5926a7,#b8237c 58%,#e8842f);
      color:#fff;font-weight:900;letter-spacing:.01em;cursor:pointer;
      box-shadow:0 14px 38px rgba(0,0,0,.46),0 0 24px rgba(198,58,174,.25);
      display:inline-flex;align-items:center;gap:8px;transition:transform .18s ease,filter .18s ease
    }
    #feelingTipsyButton:hover,#feelingTipsyButton:focus-visible{transform:translateY(-2px);filter:brightness(1.1)}
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
    @media(max-width:640px){#feelingTipsyButton{right:12px;bottom:12px;padding:10px 14px}.tipsy-card{padding:27px 19px}.tipsy-reasons{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const button=document.createElement('button');
  button.id='feelingTipsyButton';
  button.type='button';
  button.setAttribute('aria-haspopup','dialog');
  button.innerHTML='💫 Feeling Tipsy?';

  const panel=document.createElement('div');
  panel.id='feelingTipsyPanel';
  panel.setAttribute('role','dialog');
  panel.setAttribute('aria-modal','true');
  panel.setAttribute('aria-labelledby','feelingTipsyTitle');
  panel.innerHTML=`
    <div class="tipsy-card">
      <button class="tipsy-close" id="feelingTipsyClose" type="button" aria-label="Close tip jar">×</button>
      <div class="tipsy-icon" aria-hidden="true">🍸</div>
      <p class="tipsy-kicker">Support the Astralis Nova mission</p>
      <h2 id="feelingTipsyTitle">Feeling Tipsy?</h2>
      <p>Astralis Nova is independently created and maintained. Tips help support the work, tools, and time behind keeping this little universe alive and growing.</p>
      <div class="tipsy-reasons">
        <div class="tipsy-reason">🎵 New music and remixes</div>
        <div class="tipsy-reason">🛠️ Website upkeep and repairs</div>
        <div class="tipsy-reason">🛰️ Hosting and creative tools</div>
        <div class="tipsy-reason">🗃️ Archive restoration</div>
        <div class="tipsy-reason">🤖 Nova experiments and features</div>
        <div class="tipsy-reason">⏳ The many hours behind it all</div>
      </div>
      <div class="tipsy-actions">
        <a class="tipsy-paypal" href="${PAYPAL_URL}" target="_blank" rel="noopener noreferrer">💙 Tip with PayPal</a>
        <button class="tipsy-later" id="feelingTipsyLater" type="button">Maybe Later</button>
      </div>
      <p class="tipsy-note">Tips are always optional and deeply appreciated. PayPal may apply seller or processing fees.</p>
    </div>`;

  document.body.append(button,panel);

  const open=()=>{panel.classList.add('open');document.body.style.overflow='hidden';document.getElementById('feelingTipsyClose')?.focus()};
  const close=()=>{panel.classList.remove('open');document.body.style.overflow='';button.focus()};
  button.addEventListener('click',open);
  document.getElementById('feelingTipsyClose')?.addEventListener('click',close);
  document.getElementById('feelingTipsyLater')?.addEventListener('click',close);
  panel.addEventListener('click',event=>{if(event.target===panel)close()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.classList.contains('open'))close()});
})();