const boards=[['U',4],['M',4],['L',4],['A1',2],['A2',2],['B1',2],['B2',2]];

const pieceSetup={
  U:{A4:['♞','sapphire','Black knight'],B4:['♝','sapphire','Black bishop'],C4:['♝','sapphire','Black bishop'],D4:['♞','sapphire','Black knight'],A3:['♟','sapphire','Black pawn'],B3:['♟','sapphire','Black pawn'],C3:['♟','sapphire','Black pawn'],D3:['♟','sapphire','Black pawn']},
  A1:{A2:['♟','sapphire','Black pawn'],B2:['♟','sapphire','Black pawn'],A1:['♜','sapphire','Black rook'],B1:['♛','sapphire','Black queen']},
  A2:{A2:['♟','sapphire','Black pawn'],B2:['♟','sapphire','Black pawn'],A1:['♚','sapphire','Black king'],B1:['♜','sapphire','Black rook']},
  L:{A2:['♙','crystal','White pawn'],B2:['♙','crystal','White pawn'],C2:['♙','crystal','White pawn'],D2:['♙','crystal','White pawn'],A1:['♘','crystal','White knight'],B1:['♗','crystal','White bishop'],C1:['♗','crystal','White bishop'],D1:['♘','crystal','White knight']},
  B1:{A2:['♙','crystal','White pawn'],B2:['♙','crystal','White pawn'],A1:['♖','crystal','White rook'],B1:['♕','crystal','White queen']},
  B2:{A2:['♙','crystal','White pawn'],B2:['♙','crystal','White pawn'],A1:['♔','crystal','White king'],B1:['♖','crystal','White rook']}
};

for(const [id,size] of boards){
  const host=document.getElementById(id);
  if(!host) continue;
  for(let r=0;r<size;r++){
    for(let c=0;c<size;c++){
      const sq=document.createElement('div');
      sq.className='sq '+(((r+c)%2===0)?'light':'dark');
      const coord=`${String.fromCharCode(65+c)}${size-r}`;
      sq.dataset.coord=`${id}-${coord}`;
      sq.setAttribute('aria-label',`${id} ${coord}`);

      const piece=pieceSetup[id]?.[coord];
      if(piece){
        const [glyph,side,label]=piece;
        const token=document.createElement('span');
        token.className=`piece ${side}`;
        token.textContent=glyph;
        token.setAttribute('role','img');
        token.setAttribute('aria-label',label);
        sq.appendChild(token);
      }
      host.appendChild(sq);
    }
  }
}
