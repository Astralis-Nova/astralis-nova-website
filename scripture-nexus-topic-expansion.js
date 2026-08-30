(() => {
  'use strict';

  const sexPattern = /\b(sex|sexual|sexuality|premarital sex|sex before marriage|fornication|adultery|porn|pornography|masturbation|intimacy)\b/i;

  const refs = [
    'Genesis 2:24',
    'Proverbs 5:18-19',
    'Hebrews 13:4',
    '1 Corinthians 7:2-5',
    '1 Thessalonians 4:3-5'
  ];

  function renderBaseAnswer(q){
    const box=document.getElementById('answerBox');
    if(!box) return;
    const title=document.getElementById('answerTitle');
    const refEl=document.getElementById('answerRefs');
    const text=document.getElementById('answerText');
    const step=document.getElementById('answerStep');

    title.textContent='Is sex bad according to the Bible?';
    refEl.textContent=refs.join(' • ');
    text.textContent='No. The Bible does not present sex itself as bad or dirty. It presents sexual intimacy as a good part of marriage, while also placing moral boundaries around sexual conduct. Genesis 2:24 describes husband and wife becoming one flesh, Proverbs 5 speaks positively about marital affection, and Hebrews 13:4 says marriage should be honored. At the same time, passages such as 1 Thessalonians 4:3-5 warn against sexual immorality and uncontrolled sexual desire. Christians differ on some details of how particular sexual questions should be applied, so the safest approach is to read the relevant passages in context rather than treating sex itself as sinful.';
    step.textContent='Practical next step: Separate the question “Is sex bad?” from “What sexual conduct does the Bible approve or warn against?” Then compare the passages below in context.';
    box.classList.add('show');

    let extra=document.getElementById('smartVerseEvidence');
    if(!extra){
      extra=document.createElement('div');
      extra.id='smartVerseEvidence';
      extra.style.marginTop='18px';
      extra.innerHTML='<h4 style="margin:0 0 10px;color:#8fd8ff">Scripture evidence</h4><div id="smartVerseEvidenceBody" style="display:grid;gap:10px"></div>';
      box.appendChild(extra);
    }
    const body=document.getElementById('smartVerseEvidenceBody');
    body.innerHTML='<div style="color:#9eb0c7">Opening the passages…</div>';
    loadVerses(body);
  }

  async function loadVerses(body){
    body.innerHTML='';
    for(const ref of refs){
      try{
        const r=await fetch('https://bible-api.com/'+encodeURIComponent(ref)+'?translation=web');
        if(!r.ok) throw new Error('HTTP '+r.status);
        const data=await r.json();
        const card=document.createElement('div');
        card.style.cssText='padding:12px 14px;border:1px solid rgba(126,168,224,.22);border-radius:12px;background:rgba(7,18,35,.72)';
        const verseText=(data.text||'').trim();
        card.innerHTML='<strong style="color:#8fd8ff">'+ref+'</strong><div style="margin-top:6px;line-height:1.55;color:#d7e2ef"></div>';
        card.querySelector('div').textContent=verseText;
        body.appendChild(card);
      }catch(e){
        const card=document.createElement('div');
        card.textContent=ref+' — verse text could not be loaded right now.';
        card.style.color='#9eb0c7';
        body.appendChild(card);
      }
    }
  }

  function shouldHandle(){
    const input=document.getElementById('askInput');
    return !!(input && sexPattern.test(input.value.trim()));
  }

  document.addEventListener('click',e=>{
    const btn=e.target && e.target.closest && e.target.closest('#askBtn');
    if(!btn || !shouldHandle()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    renderBaseAnswer(document.getElementById('askInput').value.trim());
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter' || !e.target || e.target.id!=='askInput' || !shouldHandle()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    renderBaseAnswer(e.target.value.trim());
  },true);
})();