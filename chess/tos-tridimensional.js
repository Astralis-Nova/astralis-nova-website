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
      sq.addEventListener('click',()=>{readout.textContent=`Selected ${id} · ${coord}`;document.querySelectorAll('.sq').forEach(x=>x.style.outline='');sq.style.outline='4px solid #ffe47a';});
      host.appendChild(sq);
    }
  }
}
document.getElementById('resetView').addEventListener('click',()=>{document.querySelectorAll('.sq').forEach(x=>x.style.outline='');readout.textContent='View reset. Select any square to inspect its board coordinate.';});
