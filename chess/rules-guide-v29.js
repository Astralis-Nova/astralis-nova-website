const core=window.NovaChessCore;
if(!core)throw new Error('Rules guide requires the regulation chess core.');

installStyles();
installGuide();

function installStyles(){
  if(document.getElementById('rulesGuideStyles'))return;
  const style=document.createElement('style');
  style.id='rulesGuideStyles';
  style.textContent=`
    .rules-guide{margin-top:10px;border:1px solid rgba(112,231,255,.34);border-radius:12px;background:rgba(4,18,38,.78);overflow:hidden}
    .rules-guide summary{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px;color:#79eaff;font:900 .74rem/1.2 Inter,system-ui,sans-serif;cursor:pointer;list-style:none}
    .rules-guide summary::-webkit-details-marker{display:none}.rules-guide summary::after{content:'▾';color:#78ffdb}.rules-guide[open] summary::after{content:'▴'}
    .rules-audit{padding:3px 7px;border:1px solid rgba(120,255,219,.48);border-radius:999px;color:#bfffe8;font-size:.57rem;white-space:nowrap}
    .rules-body{padding:0 10px 11px;color:#bed4e6;font:700 .64rem/1.45 Inter,system-ui,sans-serif}
    .rules-body p{margin:0 0 8px}.rules-body strong{color:#f2fbff}.rules-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
    .rule-chip{padding:7px;border:1px solid rgba(112,231,255,.17);border-radius:8px;background:rgba(13,42,70,.52)}
    .rules-special{margin-top:7px;padding-top:7px;border-top:1px solid rgba(112,231,255,.16)}
    @media(max-width:520px){.rules-grid{grid-template-columns:1fr}}
  `;
  document.head.append(style);
}

function installGuide(){
  if(document.getElementById('rulesGuide'))return;
  const audit=core.ruleAudit||{passedCount:0,total:0,passed:false};
  const guide=document.createElement('details');
  guide.id='rulesGuide';
  guide.className='rules-guide';
  guide.innerHTML=`
    <summary><span>Official movement rules</span><span class="rules-audit">Engine audit ${audit.passedCount}/${audit.total}</span></summary>
    <div class="rules-body">
      <p><strong>Important:</strong> the four floating tiers are one normal 8×8 chessboard split by coordinates. Pieces do not gain vertical or three-dimensional moves.</p>
      <div class="rules-grid">
        <div class="rule-chip"><strong>Rook</strong><br>Any distance along a rank or file. It cannot jump.</div>
        <div class="rule-chip"><strong>Bishop</strong><br>Any distance diagonally. It cannot jump.</div>
        <div class="rule-chip"><strong>Queen</strong><br>Moves as a rook or bishop. It cannot jump.</div>
        <div class="rule-chip"><strong>Knight</strong><br>An L-shaped jump: two squares plus one sideways.</div>
        <div class="rule-chip"><strong>King</strong><br>One adjacent square, never into check.</div>
        <div class="rule-chip"><strong>Pawn</strong><br>Moves forward, captures diagonally, and may advance two squares only from its starting rank.</div>
      </div>
      <div class="rules-special"><strong>Special moves:</strong> castling moves the king two squares and the rook across it; en passant is available only immediately after the opposing two-square pawn advance; promotion offers queen, rook, bishop, or knight.</div>
    </div>`;
  const online=document.querySelector('.online-card');
  if(online)online.insertAdjacentElement('beforebegin',guide);
  else document.querySelector('.side')?.append(guide);
}
