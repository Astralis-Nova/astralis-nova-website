const core=window.NovaChessCore;
if(!core)throw new Error('Astralis Nova cosmic fleet requires the regulation chess core.');

const PIECE_NAMES={k:'king',q:'queen',r:'rook',b:'bishop',n:'knight',p:'pawn'};
const CAPTURE_TYPES={
  '♔':'k','♕':'q','♖':'r','♗':'b','♘':'n','♙':'p',
  '♚':'k','♛':'q','♜':'r','♝':'b','♞':'n','♟':'p'
};

installCosmicStyles();
applyCosmicFleet();

const observer=new MutationObserver(applyCosmicFleet);
observer.observe(document.body,{childList:true,subtree:true});

function installCosmicStyles(){
  if(document.getElementById('cosmicFleetStyles'))return;
  const style=document.createElement('style');
  style.id='cosmicFleetStyles';
  style.textContent=`
    .piece.cosmic-piece{
      position:relative;
      isolation:isolate;
      display:grid;
      place-items:center;
      width:82%;
      height:86%;
      max-width:none;
      max-height:none;
      border-radius:46% 46% 42% 42%;
      font-family:"Segoe UI Symbol","Noto Sans Symbols 2",serif;
      font-weight:800;
      line-height:1;
      transform:translateZ(0);
    }
    .piece.cosmic-piece::before{
      content:"";
      position:absolute;
      left:8%;
      right:8%;
      top:42%;
      height:31%;
      z-index:-1;
      border:1px solid currentColor;
      border-radius:50%;
      opacity:.58;
      transform:rotate(-17deg) skewX(-8deg);
      box-shadow:0 0 7px currentColor,inset 0 0 5px currentColor;
    }
    .piece.cosmic-piece::after{
      content:"✦";
      position:absolute;
      z-index:2;
      right:2%;
      top:2%;
      font:800 .25em/1 Inter,system-ui,sans-serif;
      color:#fff;
      text-shadow:0 0 4px currentColor,0 0 9px currentColor;
    }
    .piece.cosmic-piece.fleet-white{
      color:#f8feff!important;
      -webkit-text-stroke:.55px #648aa5;
      text-shadow:0 1px 0 #fff,0 0 6px #c8f7ff,0 0 14px rgba(83,222,255,.82),0 5px 5px rgba(0,0,0,.78)!important;
      filter:drop-shadow(0 0 3px rgba(213,249,255,.86))!important;
    }
    .piece.cosmic-piece.fleet-black{
      color:#0a061b!important;
      -webkit-text-stroke:1.15px #c2eaff;
      text-shadow:0 0 2px #fff,0 0 7px rgba(92,205,255,.86),0 0 15px rgba(151,91,255,.68),0 5px 5px #000!important;
      filter:drop-shadow(0 0 4px rgba(126,205,255,.65))!important;
    }
    .piece.cosmic-piece[data-piece="k"]::before{
      top:36%;height:40%;transform:rotate(-8deg);border-width:2px;opacity:.78;
    }
    .piece.cosmic-piece[data-piece="k"]::after{content:"✧";right:4%;top:-1%;font-size:.34em}
    .piece.cosmic-piece[data-piece="q"]::before{
      left:1%;right:1%;top:31%;height:48%;transform:rotate(17deg);opacity:.82;
      box-shadow:0 0 6px currentColor,0 0 13px rgba(132,100,255,.7),inset 0 0 5px currentColor;
    }
    .piece.cosmic-piece[data-piece="q"]::after{content:"✦";right:0;top:-2%;font-size:.36em}
    .piece.cosmic-piece[data-piece="r"]::before{left:5%;right:5%;top:50%;height:25%;transform:none;border-radius:16%;opacity:.7}
    .piece.cosmic-piece[data-piece="b"]::before{left:14%;right:14%;top:25%;height:54%;transform:rotate(34deg);opacity:.68}
    .piece.cosmic-piece[data-piece="n"]::before{left:4%;right:10%;top:38%;height:39%;transform:rotate(-27deg);opacity:.74}
    .piece.cosmic-piece[data-piece="p"]::before{left:13%;right:13%;top:45%;height:29%;opacity:.55}
    .capture-piece.cosmic-capture{position:relative;text-shadow:0 0 5px currentColor}
    .fleet-color-key .fleet-swatch{filter:drop-shadow(0 0 4px currentColor)}
    @media(max-width:520px){
      .piece.cosmic-piece{width:88%;height:90%}
      .piece.cosmic-piece::after{font-size:.22em}
    }
  `;
  document.head.append(style);
}

function applyCosmicFleet(){
  document.querySelectorAll('.sq[data-square]').forEach(square=>{
    const pieceElement=square.querySelector('.piece');
    if(!pieceElement)return;
    const piece=core.game?.get(square.dataset.square);
    if(!piece)return;
    pieceElement.classList.add('cosmic-piece');
    pieceElement.dataset.piece=piece.type;
    pieceElement.dataset.fleet=piece.color==='w'?'silver':'void';
    pieceElement.setAttribute('aria-hidden','true');
    square.setAttribute('aria-label',`${square.dataset.square.toUpperCase()} ${piece.color==='w'?'Silver':'Void'} Fleet ${PIECE_NAMES[piece.type]}`);
  });

  document.querySelectorAll('.capture-piece').forEach(piece=>{
    piece.classList.add('cosmic-capture');
    const type=CAPTURE_TYPES[piece.textContent.trim()];
    if(type)piece.dataset.piece=type;
  });

  const key=document.querySelector('.fleet-color-key');
  if(key){
    const labels=key.querySelectorAll('span');
    if(labels[0])labels[0].lastChild.textContent=' Silver Starfleet';
    if(labels[1])labels[1].lastChild.textContent=' Void Fleet';
  }
}
