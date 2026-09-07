(() => {
  'use strict';

  const PASSWORD='Astralis Nova';
  const SESSION_KEY='astralisNova.downloadUnlocked';

  const $=id=>document.getElementById(id);
  const downloadTrackBtn=$('downloadTrackBtn');
  const downloadAllBtn=$('downloadAllBtn');
  const offlineStatus=$('offlineStatus');

  if(!downloadTrackBtn&&!downloadAllBtn)return;

  function isUnlocked(){return sessionStorage.getItem(SESSION_KEY)==='1';}
  function unlock(){sessionStorage.setItem(SESSION_KEY,'1');}

  function ensureDialog(){
    let dialog=$('downloadPasswordDialog');
    if(dialog)return dialog;
    dialog=document.createElement('dialog');
    dialog.id='downloadPasswordDialog';
    dialog.innerHTML=`
      <form method="dialog" class="nova-password-card">
        <button class="nova-password-close" value="cancel" aria-label="Close">×</button>
        <div class="nova-password-mark">✦</div>
        <h2>Astralis Nova Downloads</h2>
        <p>Listening is open. Downloading music requires the Astralis Nova access password.</p>
        <label>Password<input id="downloadPasswordInput" type="password" autocomplete="current-password" placeholder="Enter password"></label>
        <div id="downloadPasswordError" class="nova-password-error" aria-live="polite"></div>
        <div class="nova-password-actions"><button value="cancel" class="chip">Cancel</button><button id="downloadPasswordUnlock" value="default" class="chip">Unlock downloads</button></div>
      </form>`;
    const style=document.createElement('style');
    style.textContent=`
      #downloadPasswordDialog{border:1px solid #ffffff2c;border-radius:16px;padding:0;background:#07111f;color:#eef5ff;box-shadow:0 24px 80px #000b;max-width:min(92vw,430px)}
      #downloadPasswordDialog::backdrop{background:#01040acc;backdrop-filter:blur(5px)}
      .nova-password-card{position:relative;padding:28px;display:grid;gap:14px}
      .nova-password-mark{font-size:2rem;color:var(--accent,#49dfff)}
      .nova-password-card h2{margin:0;font-size:1.25rem}.nova-password-card p{margin:0;color:#b8c5d7;line-height:1.5}
      .nova-password-card label{display:grid;gap:7px;font-size:.8rem;color:#cbd7e8}.nova-password-card input{border:1px solid #ffffff30;border-radius:9px;background:#020711;color:#fff;padding:11px 12px;font:inherit}
      .nova-password-actions{display:flex;justify-content:flex-end;gap:8px}.nova-password-error{min-height:1.2em;color:#ff8da2;font-size:.78rem}
      .nova-password-close{position:absolute;right:10px;top:8px;border:0;background:none;color:#9fadc0;font-size:1.6rem;cursor:pointer}
      body[data-skin="legacy83"] #downloadPasswordDialog{background:#1a1a18;border-color:#a9a59b;color:#eee9dc;border-radius:3px}
    `;
    document.head.appendChild(style);document.body.appendChild(dialog);
    return dialog;
  }

  function requestPassword(){
    if(isUnlocked())return Promise.resolve(true);
    const dialog=ensureDialog(),input=dialog.querySelector('#downloadPasswordInput'),error=dialog.querySelector('#downloadPasswordError'),unlockBtn=dialog.querySelector('#downloadPasswordUnlock');
    input.value='';error.textContent='';
    return new Promise(resolve=>{
      const cleanup=()=>{dialog.removeEventListener('close',onClose);unlockBtn.removeEventListener('click',onUnlock);};
      const onClose=()=>{cleanup();resolve(isUnlocked());};
      const onUnlock=event=>{
        event.preventDefault();
        if(input.value===PASSWORD){unlock();error.textContent='';dialog.close('ok');}
        else{error.textContent='Incorrect password.';input.select();}
      };
      dialog.addEventListener('close',onClose,{once:true});unlockBtn.addEventListener('click',onUnlock);
      dialog.showModal();setTimeout(()=>input.focus(),30);
    });
  }

  [downloadTrackBtn,downloadAllBtn].forEach(button=>button?.addEventListener('click',async event=>{
    if(window.NovaLocalLibraryActive||window.NovaFolderLibraryActive||isUnlocked())return;
    event.preventDefault();event.stopImmediatePropagation();
    const ok=await requestPassword();
    if(ok){
      if(offlineStatus)offlineStatus.textContent='Downloads unlocked for this session.';
      button.click();
    }
  },true));
})();
