const core=window.NovaChessCore;
if(!core)throw new Error('Astralis Nova universe fleet requires the regulation chess core.');

const COSMIC_ROLES={
  k:{symbol:'☀',name:'Nova Sun',role:'king'},
  q:{symbol:'☾',name:'Lunar Empress',role:'queen'},
  r:{symbol:'●',name:'Ringed World',role:'rook'},
  b:{symbol:'☄',name:'Comet',role:'bishop'},
  n:{symbol:'◆',name:'Asteroid',role:'knight'},
  p:{symbol:'✦',name:'Nova Star',role:'pawn'}
};

const CLASSIC_PIECES={
  '♔':{type:'k',color:'w'},'♕':{type:'q',color:'w'},'♖':{type:'r',color:'w'},
  '♗':{type:'b',color:'w'},'♘':{type:'n',color:'w'},'♙':{type:'p',color:'w'},
  '♚':{type:'k',color:'b'},'♛':{type:'q',color:'b'},'♜':{type:'r',color:'b'},
  '♝':{type:'b',color:'b'},'♞':{type:'n',color:'b'},'♟':{type:'p',color:'b'}
};

installUniverseStyles();
applyUniverseFleet();

const observer=new MutationObserver(applyUniverseFleet);
observer.observe(document.body,{childList:true,subtree:true});

function installUniverseStyles(){
  if(document.getElementById('cosmicUniverseStyles'))return;
  const style=document.createElement('style');
  style.id='cosmicUniverseStyles';
  style.textContent=`
    .piece.cosmic-piece{
      position:relative;
      isolation:isolate;
      display:grid;
      place-items:center;
      width:86%;
      height:90%;
      max-width:none;
      max-height:none;
      border-radius:50%;
      font-family:"Segoe UI Symbol","Noto Sans Symbols 2","Arial Unicode MS",serif;
      font-weight:800;
      line-height:1;
      transform:translateZ(0);
    }
    .piece.cosmic-piece::before{
      content:"";
      position:absolute;
      z-index:-1;
      left:7%;
      right:7%;
      top:35%;
      height:36%;
      border:1.5px solid currentColor;
      border-radius:50%;
      opacity:.64;
      transform:rotate(-18deg);
      box-shadow:0 0 7px currentColor,inset 0 0 5px currentColor;
    }
    .piece.cosmic-piece::after{
      content:"✦";
      position:absolute;
      z-index:2;
      right:1%;
      top:1%;
      font:800 .23em/1 Inter,system-ui,sans-serif;
      color:#fff;
      text-shadow:0 0 4px currentColor,0 0 9px currentColor;
    }
    .piece.cosmic-piece.fleet-white{
      color:#f9feff!important;
      -webkit-text-stroke:.45px #6f99b1;
      text-shadow:0 1px 0 #fff,0 0 7px #c9f8ff,0 0 16px rgba(68,220,255,.9),0 5px 5px rgba(0,0,0,.8)!important;
      filter:drop-shadow(0 0 4px rgba(210,249,255,.9))!important;
    }
    .piece.cosmic-piece.fleet-black{
      color:#09051b!important;
      -webkit-text-stroke:1.1px #c7edff;
      text-shadow:0 0 2px #fff,0 0 8px rgba(77,204,255,.9),0 0 16px rgba(154,86,255,.78),0 5px 5px #000!important;
      filter:drop-shadow(0 0 4px rgba(137,211,255,.72))!important;
    }
    .piece.cosmic-piece[data-piece="k"]{
      font-size:1.05em;
      animation:nova-sun-pulse 4.8s ease-in-out infinite;
    }
    .piece.cosmic-piece[data-piece="k"]::before{
      inset:7%;
      height:auto;
      border:2px solid currentColor;
      transform:none;
      opacity:.78;
      box-shadow:0 0 8px currentColor,0 0 18px currentColor,inset 0 0 9px currentColor;
    }
    .piece.cosmic-piece[data-piece="k"]::after{content:"✧";right:-1%;top:-2%;font-size:.31em}
    .piece.cosmic-piece[data-piece="q"]{font-size:1.08em}
    .piece.cosmic-piece[data-piece="q"]::before{
      left:-1%;right:-1%;top:27%;height:48%;transform:rotate(20deg);opacity:.82;
      box-shadow:0 0 7px currentColor,0 0 15px rgba(155,103,255,.72),inset 0 0 5px currentColor;
    }
    .piece.cosmic-piece[data-piece="q"]::after{content:"✦";right:-2%;top:-3%;font-size:.34em}
    .piece.cosmic-piece[data-piece="r"]{font-size:.92em}
    .piece.cosmic-piece[data-piece="r"]::before{
      left:-3%;right:-3%;top:36%;height:31%;border-width:2px;transform:rotate(-14deg);opacity:.92;
    }
    .piece.cosmic-piece[data-piece="b"]{font-size:1.02em;transform:rotate(-8deg)}
    .piece.cosmic-piece[data-piece="b"]::before{
      left:3%;right:42%;top:59%;height:4px;border:0;border-radius:99px;
      background:linear-gradient(90deg,transparent,currentColor);transform:rotate(-27deg);opacity:.8;
      box-shadow:0 0 7px currentColor;
    }
    .piece.cosmic-piece[data-piece="n"]{font-size:.82em;transform:rotate(8deg)}
    .piece.cosmic-piece[data-piece="n"]::before{
      left:18%;right:18%;top:19%;height:62%;border:1px solid currentColor;border-radius:42% 55% 46% 58%;
      transform:rotate(25deg);opacity:.45;
      background:radial-gradient(circle at 30% 32%,currentColor 0 3%,transparent 4%),radial-gradient(circle at 66% 59%,currentColor 0 4%,transparent 5%);
    }
    .piece.cosmic-piece[data-piece="p"]{font-size:.82em}
    .piece.cosmic-piece[data-piece="p"]::before{
      left:18%;right:18%;top:19%;height:62%;transform:none;border-style:dotted;opacity:.56;
    }
    .capture-piece.cosmic-capture{position:relative;text-shadow:0 0 6px currentColor}
    .capture-piece.cosmic-capture[data-piece="k"]{font-size:1.08em}
    @keyframes nova-sun-pulse{
      0%,100%{filter:brightness(.96) drop-shadow(0 0 3px currentColor)}
      50%{filter:brightness(1.22) drop-shadow(0 0 8px currentColor)}
    }
    @media(max-width:520px){
      .piece.cosmic-piece{width:91%;height:93%}
      .piece.cosmic-piece::after{font-size:.2em}
    }
    @media(prefers-reduced-motion:reduce){.piece.cosmic-piece[data-piece="k"]{animation:none}}
  `;
  document.head.append(style);
}

function applyUniverseFleet(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{
    const pieceElement=square.querySelector('.piece');
    if(!pieceElement)return;
    const piece=core.game?.get(square.dataset.square);
    const cosmic=piece&&COSMIC_ROLES[piece.type];
    if(!piece||!cosmic)return;

    if(pieceElement.dataset.cosmicRole!==piece.type){
      pieceElement.textContent=cosmic.symbol;
      pieceElement.dataset.cosmicRole=piece.type;
    }
    pieceElement.classList.add('cosmic-piece');
    pieceElement.dataset.piece=piece.type;
    pieceElement.dataset.fleet=piece.color==='w'?'silver':'void';
    pieceElement.setAttribute('aria-hidden','true');

    const fleet=piece.color==='w'?'Silver Starfleet':'Void Fleet';
    const description=`${square.dataset.square.toUpperCase()} ${fleet} ${cosmic.name} (${cosmic.role})`;
    square.setAttribute('aria-label',description);
    square.title=description;
  });

  document.querySelectorAll('.capture-piece').forEach(pieceElement=>{
    let type=pieceElement.dataset.piece;
    let color=pieceElement.dataset.fleetColor;
    if(!type){
      const classic=CLASSIC_PIECES[pieceElement.textContent.trim()];
      if(!classic)return;
      type=classic.type;
      color=classic.color;
      pieceElement.dataset.piece=type;
      pieceElement.dataset.fleetColor=color;
    }
    const cosmic=COSMIC_ROLES[type];
    if(!cosmic)return;
    if(pieceElement.dataset.cosmicCaptureRole!==type){
      pieceElement.textContent=cosmic.symbol;
      pieceElement.dataset.cosmicCaptureRole=type;
    }
    pieceElement.classList.add('cosmic-capture');
    pieceElement.title=`Captured ${color==='w'?'Silver Starfleet':'Void Fleet'} ${cosmic.name} (${cosmic.role})`;
  });

  const key=document.querySelector('.fleet-color-key');
  if(key){
    const labels=key.querySelectorAll('span');
    if(labels[0])labels[0].lastChild.textContent=' Silver Starfleet';
    if(labels[1])labels[1].lastChild.textContent=' Void Fleet';
  }
}
