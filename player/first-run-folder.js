(() => {
  'use strict';

  const SETUP_KEY='astralisNova.musicFolderSetupOffered.v1';
  const DB_NAME='astralis-nova-music-folders';
  const STORE='folders';
  const FOLDER_NAME='Astralis Nova';

  const $=id=>document.getElementById(id);
  const offlineStatus=$('offlineStatus');

  async function saveFolderHandle(handle){
    return new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id',autoIncrement:true});};
      req.onerror=()=>reject(req.error);
      req.onsuccess=()=>{
        const db=req.result,tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE),get=store.getAll();
        get.onerror=()=>reject(get.error);
        get.onsuccess=()=>{
          const exists=(get.result||[]).some(item=>item.name===handle.name);
          if(!exists)store.add({name:handle.name,handle,addedAt:Date.now()});
          tx.oncomplete=()=>{db.close();resolve();};tx.onerror=()=>reject(tx.error);
        };
      };
    });
  }

  function ensureDialog(){
    let dialog=$('firstRunFolderDialog');if(dialog)return dialog;
    dialog=document.createElement('dialog');dialog.id='firstRunFolderDialog';
    dialog.innerHTML=`<form method="dialog" class="nova-folder-setup">
      <div class="nova-folder-symbol">📁</div>
      <h2>Set up your Astralis Nova music folder?</h2>
      <p>Choose a location and the player can create an <strong>Astralis Nova</strong> folder there for your personal music.</p>
      <p class="nova-folder-note">You stay in control. The browser will ask before folder access is granted.</p>
      <div class="nova-folder-actions"><button value="later" class="chip">Not now</button><button id="createNovaFolderBtn" value="default" class="chip">Choose location</button></div>
    </form>`;
    const style=document.createElement('style');style.textContent=`
      #firstRunFolderDialog{border:1px solid #ffffff2c;border-radius:16px;padding:0;background:#07111f;color:#eef5ff;box-shadow:0 24px 80px #000b;max-width:min(92vw,470px)}
      #firstRunFolderDialog::backdrop{background:#01040acc;backdrop-filter:blur(5px)}
      .nova-folder-setup{padding:28px;display:grid;gap:14px}.nova-folder-symbol{font-size:2.2rem}.nova-folder-setup h2{margin:0;font-size:1.25rem}.nova-folder-setup p{margin:0;line-height:1.5;color:#b8c5d7}.nova-folder-note{font-size:.82rem}.nova-folder-actions{display:flex;justify-content:flex-end;gap:8px}
      body[data-skin="legacy83"] #firstRunFolderDialog{background:#1a1a18;border-color:#a9a59b;color:#eee9dc;border-radius:3px}
    `;document.head.appendChild(style);document.body.appendChild(dialog);return dialog;
  }

  async function createFolder(){
    if(!('showDirectoryPicker'in window)){
      if(offlineStatus)offlineStatus.textContent='Automatic folder setup is not supported here. Use “Choose Music Folder” instead.';
      return false;
    }
    try{
      const parent=await window.showDirectoryPicker({mode:'readwrite'});
      if(parent.requestPermission&&await parent.requestPermission({mode:'readwrite'})!=='granted')return false;
      const handle=await parent.getDirectoryHandle(FOLDER_NAME,{create:true});
      await saveFolderHandle(handle);
      if(offlineStatus)offlineStatus.textContent=`Astralis Nova music folder ready: ${FOLDER_NAME}`;
      window.dispatchEvent(new CustomEvent('astralis-nova-folder-created',{detail:{name:FOLDER_NAME}}));
      return true;
    }catch(err){if(err?.name!=='AbortError')console.warn('Astralis Nova folder setup failed',err);return false;}
  }

  function offerSetup(force=false){
    if(!force&&localStorage.getItem(SETUP_KEY)==='1')return;
    localStorage.setItem(SETUP_KEY,'1');
    if(!('showDirectoryPicker'in window))return;
    const dialog=ensureDialog(),button=dialog.querySelector('#createNovaFolderBtn');
    const handler=async event=>{event.preventDefault();button.disabled=true;button.textContent='Creating…';const ok=await createFolder();button.disabled=false;button.textContent='Choose location';if(ok)dialog.close('created');};
    button.addEventListener('click',handler,{once:true});dialog.showModal();
  }

  window.addEventListener('appinstalled',()=>setTimeout(()=>offerSetup(true),350));
  window.addEventListener('astralis-nova-offer-folder-setup',()=>offerSetup(true));
  window.addEventListener('load',()=>{
    const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    if(standalone)setTimeout(()=>offerSetup(false),900);
  });
})();
