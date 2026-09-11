(()=>{
'use strict';

const host=document.getElementById('M');
if(!host||host.dataset.realSplit==='1')return;

const squares=[...host.querySelectorAll(':scope > .sq')];
if(squares.length!==16)return;

const left=document.createElement('div');
left.className='grid middle-half middle-half-left';
left.id='M-left';
left.setAttribute('aria-label','Middle deck left half');

const right=document.createElement('div');
right.className='grid middle-half middle-half-right';
right.id='M-right';
right.setAttribute('aria-label','Middle deck right half');

for(const sq of squares){
  const cell=sq.dataset.cell||'';
  const local=cell.split(':')[1]||'';
  const file=local.charAt(0);
  (file==='A'||file==='B'?left:right).appendChild(sq);
}

host.replaceChildren(left,right);
host.dataset.realSplit='1';
})();
