export const PIECE_NAMES=Object.freeze({
  p:'Asteroid Sentinel',n:'Comet Strider',b:'Ringworld Oracle',r:'Astralis Citadel',q:'Astral Sovereign',k:'Nexus Prime'
});

export const COMBAT_STATS=Object.freeze({
  p:{health:74,speed:215,damage:16,cooldown:560,projectileSpeed:430},
  n:{health:88,speed:270,damage:17,cooldown:470,projectileSpeed:480},
  b:{health:92,speed:225,damage:21,cooldown:650,projectileSpeed:520},
  r:{health:122,speed:175,damage:24,cooldown:720,projectileSpeed:390},
  q:{health:108,speed:245,damage:22,cooldown:430,projectileSpeed:560},
  k:{health:138,speed:190,damage:25,cooldown:620,projectileSpeed:450}
});

export function makeCaptureIntent({from,to,attacker,defender,promotion=null,fen}){
  if(!from||!to||!attacker||!defender||attacker.color===defender.color)throw new Error('Invalid Astralis capture intent.');
  return Object.freeze({
    from:from.toLowerCase(),to:to.toLowerCase(),promotion,
    attacker:Object.freeze({...attacker}),defender:Object.freeze({...defender}),fen
  });
}

export function duelResolution(intent,winner){
  if(!intent||!['attacker','defender'].includes(winner))throw new Error('A duel requires an attacker or defender winner.');
  return Object.freeze({
    winner,
    loser:winner==='attacker'?'defender':'attacker',
    commitMove:winner==='attacker',
    removeSquare:winner==='attacker'?intent.to:intent.from,
    survivingSquare:intent.to,
    nextTurn:intent.attacker.color==='w'?'b':'w',
    gameWinner:winner==='defender'&&intent.attacker.type==='k'?intent.defender.color:null
  });
}

export function squareFromPoint(rect,clientX,clientY,orientation='white'){
  if(!rect||rect.width<=0||rect.height<=0)return null;
  const x=clientX-rect.left,y=clientY-rect.top;
  if(x<0||y<0||x>=rect.width||y>=rect.height)return null;
  const col=Math.min(7,Math.floor(x/(rect.width/8)));
  const row=Math.min(7,Math.floor(y/(rect.height/8)));
  const files=orientation==='white'?'abcdefgh':'hgfedcba';
  const ranks=orientation==='white'?[8,7,6,5,4,3,2,1]:[1,2,3,4,5,6,7,8];
  return`${files[col]}${ranks[row]}`;
}

export function defenderWinFen(fen,intent){
  const fields=String(fen||'').trim().split(/\s+/);
  if(fields.length<6)throw new Error('Cannot resolve duel from an invalid FEN.');
  const board=expandBoard(fields[0]);
  const {row,col}=indices(intent.from);
  board[row][col]=null;
  let castling=fields[2];
  const rights={a1:'Q',h1:'K',a8:'q',h8:'k'};
  if(rights[intent.from])castling=castling.replace(rights[intent.from],'');
  if(intent.attacker.type==='k')castling=castling.replace(intent.attacker.color==='w'?/[KQ]/g:/[kq]/g,'');
  const next=intent.attacker.color==='w'?'b':'w';
  const fullmove=Number(fields[5])+(intent.attacker.color==='b'?1:0);
  return[compressBoard(board),next,castling||'-','-','0',String(fullmove)].join(' ');
}

function indices(square){return{row:8-Number(square[1]),col:'abcdefgh'.indexOf(square[0])}}
function expandBoard(layout){return layout.split('/').map(rank=>{const cells=[];for(const token of rank){if(/\d/.test(token))cells.push(...Array(Number(token)).fill(null));else cells.push(token)}return cells})}
function compressBoard(board){return board.map(rank=>{let out='',empty=0;for(const cell of rank){if(!cell){empty++;continue}if(empty){out+=empty;empty=0}out+=cell}return out+(empty||'')}).join('/')}
