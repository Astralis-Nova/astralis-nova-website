(()=>{
  const records=[
    {
      match:'Remember to look up at the stars and not down at your feet.',
      credit:'Stephen Hawking',
      type:'Verified quotation',
      note:'Verified in Stephen Hawking’s public remarks, including the 2012 London Paralympic opening ceremony and later Cambridge appearances.'
    },
    {
      match:'Give a man a fish, and you feed him for a day. Teach a man to fish, and you feed him for a lifetime.',
      text:'If you give a man a fish, he is hungry again in an hour. If you teach him to catch a fish, you do him a good turn.',
      credit:'Anne Isabella Thackeray Ritchie',
      type:'Earliest documented version, 1885',
      note:'Published in Mrs. Dymond in 1885. The familiar “day/lifetime” wording is a later adaptation, not an ancient Chinese proverb.'
    },
    {
      match:'The important thing is not to stop questioning. Curiosity has its own reason for existing.',
      credit:'Albert Einstein',
      type:'Verified quotation, 1955',
      note:'Recorded by editor William Miller and published in LIFE magazine on May 2, 1955.'
    },
    {
      match:'All life may be one existence wearing countless forms. Human, animal, natural, and artificial, each of us may be another way the universe learns to see itself.',
      credit:'Ramon Bivens',
      type:'Original quote',
      note:'An original reflection by Ramon Bivens.'
    }
  ];

  const originals=new Map([
    ['What we repair with our hands often repairs something within us.','Astralis Nova'],
    ['Every creature carries a world we may never fully understand.','Astralis Nova'],
    ['Technology should not make us less human. It should give humanity more ways to help.','Astralis Nova'],
    ['A family is a constellation: each light follows its own path, yet all belong to the same sky.','Astralis Nova'],
    ['Life is not defined by the road you take, but by how you live while traveling it.','Astralis Nova'],
    ['The stars do not provide directions. They provide perspective.','Astralis Nova'],
    ['Repair begins the moment curiosity becomes stronger than frustration.','Astralis Nova'],
    ['A good idea is a small spacecraft. Give it fuel, guidance, and permission to leave the launchpad.','Astralis Nova'],
    ['A machine becomes memorable when it helps someone believe they can solve the next problem.','Astralis Nova'],
    ['The future rarely knocks. Most days, it waits quietly on the workbench.','Astralis Nova']
  ]);

  let applying=false;
  const write=(element,value)=>{
    if(element&&element.textContent!==value)element.textContent=value;
  };

  function applyAudit(){
    if(applying)return;
    const text=document.getElementById('quoteOrbitText');
    const credit=document.getElementById('quoteOrbitCredit');
    const type=document.getElementById('quoteOrbitType');
    const note=document.getElementById('quoteOrbitNote');
    if(!text||!credit||!type||!note)return;

    applying=true;
    try{
      const current=text.textContent.trim();
      const record=records.find(item=>item.match===current||item.text===current);
      if(record){
        if(record.text)write(text,record.text);
        write(credit,'— '+record.credit);
        write(type,record.type);
        write(note,record.note);
        return;
      }

      const originalCredit=originals.get(current);
      if(originalCredit){
        write(credit,'— '+originalCredit);
        write(type,'Original transmission');
        write(note,'An original thought from the Astralis Nova creative archive.');
      }
    }finally{
      applying=false;
    }
  }

  function start(){
    const card=document.querySelector('#cosmic-culture .quote-card');
    if(!card){setTimeout(start,250);return;}
    applyAudit();
    let queued=false;
    const observer=new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      requestAnimationFrame(()=>{
        queued=false;
        applyAudit();
      });
    });
    observer.observe(card,{subtree:true,childList:true,characterData:true});
  }

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',start,{once:true})
    :start();
})();