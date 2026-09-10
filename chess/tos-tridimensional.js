const boards=[['U',4],['M',4],['L',4],['A1',2],['A2',2],['B1',2],['B2',2]];
const readout=document.getElementById('readout');

for(const [id,size] of boards){
  const host=document.getElementById(id);
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      const sq=document.createElement('button');
      sq.type='button';
      sq.className='sq '+(((r+c)%2===0)?'light':'dark');
      const coord=`${String.fromCharCode(65+c)}${size-r}`;
      sq.dataset.coord=`${id}-${coord}`;
      sq.innerHTML=`<span class="coord">${coord}</span>`;
      sq.addEventListener('click',()=>{
        if(document.body.classList.contains('layout-editing')) return;
        readout.textContent=`Selected ${id} · ${coord}`;
        document.querySelectorAll('.sq').forEach(x=>x.style.outline='');
        sq.style.outline='4px solid #ffe47a';
      });
      host.appendChild(sq);
    }
  }
}

document.getElementById('resetView').addEventListener('click',()=>{
  document.querySelectorAll('.sq').forEach(x=>x.style.outline='');
  readout.textContent='View reset. Select any square to inspect its board coordinate.';
});

const editMode=new URLSearchParams(location.search).get('edit')==='1';
if(editMode) enableLayoutEditor();

function enableLayoutEditor(){
  document.body.classList.add('layout-editing');
  const scene=document.getElementById('scene');
  const sceneWrap=document.querySelector('.scene-wrap');
  const movable=[...scene.querySelectorAll('.main-board,.attack')];
  const storageKey='astralis-trichess-layout-v1';

  const editor=document.createElement('section');
  editor.className='layout-editor';
  editor.innerHTML=`
    <div class="layout-editor-head">
      <div><strong>Layout Editor</strong><span>Drag the seven glass boards where you want them.</span></div>
      <a href="./tos-tridimensional.html">Exit Editor</a>
    </div>
    <div class="layout-editor-actions">
      <button type="button" id="layoutSave">Save Layout</button>
      <button type="button" id="layoutCopy">Copy Layout Code</button>
      <button type="button" id="layoutReset">Reset Positions</button>
    </div>
    <div class="layout-selected" id="layoutSelected">Selected board: none</div>
    <textarea id="layoutCode" rows="7" readonly aria-label="Layout code"></textarea>
    <p>When it looks right, press <b>Save Layout</b>, then <b>Copy Layout Code</b> and paste that code into our ChatGPT conversation. I can lock those exact positions into the site.</p>`;
  sceneWrap.insertAdjacentElement('afterend',editor);

  const codeBox=document.getElementById('layoutCode');
  const selectedReadout=document.getElementById('layoutSelected');
  let active=null;
  let drag=null;

  movable.forEach(el=>{
    el.tabIndex=0;
    el.setAttribute('aria-label',`Move ${el.dataset.board} board`);
    el.addEventListener('pointerdown',startDrag);
    el.addEventListener('keydown',nudgeBoard);
  });

  restoreSaved();
  updateCode();

  document.getElementById('layoutSave').addEventListener('click',()=>{
    const layout=captureLayout();
    localStorage.setItem(storageKey,JSON.stringify(layout));
    updateCode(layout);
    readout.textContent='Layout saved on this device. Copy the layout code and send it to me.';
  });

  document.getElementById('layoutCopy').addEventListener('click',async()=>{
    updateCode();
    codeBox.focus();
    codeBox.select();
    try{
      await navigator.clipboard.writeText(codeBox.value);
      readout.textContent='Layout code copied. Paste it into ChatGPT.';
    }catch{
      document.execCommand('copy');
      readout.textContent='Layout code selected. Copy it and paste it into ChatGPT.';
    }
  });

  document.getElementById('layoutReset').addEventListener('click',()=>{
    localStorage.removeItem(storageKey);
    location.reload();
  });

  function startDrag(e){
    if(e.button!==0 && e.pointerType==='mouse') return;
    const el=e.currentTarget;
    active=el;
    movable.forEach(x=>x.classList.toggle('layout-active',x===el));
    selectedReadout.textContent=`Selected board: ${el.dataset.board} · drag it or use arrow keys for 1px nudges`;
    const sceneRect=scene.getBoundingClientRect();
    const rect=el.getBoundingClientRect();
    const scaleX=scene.offsetWidth/sceneRect.width;
    const scaleY=scene.offsetHeight/sceneRect.height;
    drag={
      el,
      pointerId:e.pointerId,
      startX:e.clientX,
      startY:e.clientY,
      startLeft:parseFloat(getComputedStyle(el).left)||0,
      startTop:parseFloat(getComputedStyle(el).top)||0,
      scaleX,
      scaleY
    };
    el.setPointerCapture(e.pointerId);
    el.addEventListener('pointermove',moveDrag);
    el.addEventListener('pointerup',endDrag,{once:true});
    el.addEventListener('pointercancel',endDrag,{once:true});
    e.preventDefault();
  }

  function moveDrag(e){
    if(!drag || e.pointerId!==drag.pointerId) return;
    const dx=(e.clientX-drag.startX)*drag.scaleX;
    const dy=(e.clientY-drag.startY)*drag.scaleY;
    drag.el.style.left=`${Math.round(drag.startLeft+dx)}px`;
    drag.el.style.top=`${Math.round(drag.startTop+dy)}px`;
    updateCode();
  }

  function endDrag(e){
    if(!drag || e.pointerId!==drag.pointerId) return;
    drag.el.removeEventListener('pointermove',moveDrag);
    drag=null;
    updateCode();
  }

  function nudgeBoard(e){
    if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const el=e.currentTarget;
    active=el;
    movable.forEach(x=>x.classList.toggle('layout-active',x===el));
    const step=e.shiftKey?10:1;
    let left=parseFloat(getComputedStyle(el).left)||0;
    let top=parseFloat(getComputedStyle(el).top)||0;
    if(e.key==='ArrowLeft') left-=step;
    if(e.key==='ArrowRight') left+=step;
    if(e.key==='ArrowUp') top-=step;
    if(e.key==='ArrowDown') top+=step;
    el.style.left=`${Math.round(left)}px`;
    el.style.top=`${Math.round(top)}px`;
    selectedReadout.textContent=`Selected board: ${el.dataset.board} · X ${Math.round(left)} · Y ${Math.round(top)}`;
    updateCode();
  }

  function captureLayout(){
    const result={version:1,scene:{width:scene.offsetWidth,height:scene.offsetHeight},boards:{}};
    movable.forEach(el=>{
      const style=getComputedStyle(el);
      result.boards[el.dataset.board]={
        left:Math.round(parseFloat(style.left)||0),
        top:Math.round(parseFloat(style.top)||0)
      };
    });
    return result;
  }

  function updateCode(layout=captureLayout()){
    codeBox.value=JSON.stringify(layout,null,2);
  }

  function restoreSaved(){
    try{
      const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
      if(!saved?.boards) return;
      movable.forEach(el=>{
        const pos=saved.boards[el.dataset.board];
        if(!pos) return;
        if(Number.isFinite(pos.left)) el.style.left=`${pos.left}px`;
        if(Number.isFinite(pos.top)) el.style.top=`${pos.top}px`;
      });
      readout.textContent='Your previously saved layout was restored. Continue adjusting or copy the layout code.';
    }catch{}
  }
}
