(() => {
  'use strict';

  const SOURCE='https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml';
  let biblePromise=null;

  const BOOK_NAMES={GEN:'Genesis',EXO:'Exodus',LEV:'Leviticus',NUM:'Numbers',DEU:'Deuteronomy',JOS:'Joshua',JDG:'Judges',RUT:'Ruth','1SA':'1 Samuel','2SA':'2 Samuel','1KI':'1 Kings','2KI':'2 Kings','1CH':'1 Chronicles','2CH':'2 Chronicles',EZR:'Ezra',NEH:'Nehemiah',EST:'Esther',JOB:'Job',PSA:'Psalms',PRO:'Proverbs',ECC:'Ecclesiastes',SNG:'Song of Solomon',ISA:'Isaiah',JER:'Jeremiah',LAM:'Lamentations',EZK:'Ezekiel',DAN:'Daniel',HOS:'Hosea',JOL:'Joel',AMO:'Amos',OBA:'Obadiah',JON:'Jonah',MIC:'Micah',NAM:'Nahum',HAB:'Habakkuk',ZEP:'Zephaniah',HAG:'Haggai',ZEC:'Zechariah',MAL:'Malachi',MAT:'Matthew',MRK:'Mark',LUK:'Luke',JHN:'John',ACT:'Acts',ROM:'Romans','1CO':'1 Corinthians','2CO':'2 Corinthians',GAL:'Galatians',EPH:'Ephesians',PHP:'Philippians',COL:'Colossians','1TH':'1 Thessalonians','2TH':'2 Thessalonians','1TI':'1 Timothy','2TI':'2 Timothy',TIT:'Titus',PHM:'Philemon',HEB:'Hebrews',JAS:'James','1PE':'1 Peter','2PE':'2 Peter','1JN':'1 John','2JN':'2 John','3JN':'3 John',JUD:'Jude',REV:'Revelation'};

  const STOP=new Set('a an and are as at bad be can could did do does for from good had has have how i if in is it me my of on or should so that the their them there these they this to was we were what when where which who why will with would you your'.split(' '));
  const SYN={
    sex:['sexual','intercourse','intimacy','fornication','adultery','marriage','immorality'],
    sexual:['sex','fornication','adultery','immorality','marriage'],
    lie:['lying','liar','false','falsehood','deceit','deceive','dishonest'],lying:['lie','liar','false','falsehood','deceit','deceive'],
    trust:['faith','faithful','confidence','rely','reliable'],friend:['friendship','companion','neighbor'],friends:['friendship','companions'],
    afraid:['fear','anxious','anxiety','worry'],fear:['afraid','anxiety','worry'],sad:['sorrow','grief','mourning','brokenhearted'],
    angry:['anger','wrath','rage'],anger:['angry','wrath','rage'],forgive:['forgiveness','forgiven','mercy'],forgiveness:['forgive','forgiven','mercy'],
    money:['wealth','rich','riches','treasure','greed'],work:['labor','labour','diligent','lazy','sluggard'],family:['father','mother','children','child','household'],
    lonely:['alone','loneliness','forsaken'],death:['dead','die','dying','grave','resurrection'],hell:['gehenna','hades','sheol','fire','judgment'],
    heaven:['heavens','heavenly','paradise'],god:['lord','jehovah'],jesus:['christ','messiah','son'],prayer:['pray','praying'],pray:['prayer','praying'],
    hope:['hopeful','expectation','endurance'],suffer:['suffering','tribulation','trial','trials'],suffering:['suffer','tribulation','trial'],
    temptation:['tempt','tempted','sin'],porn:['pornography','lust','sexual','immorality'],pornography:['lust','sexual','immorality'],
    alcohol:['wine','drunk','drunkenness'],drugs:['sober','drunkenness','sorcery'],tattoo:['mark','body'],
    gay:['homosexual','same-sex','sexual','men'],homosexual:['same-sex','sexual','men'],
    divorce:['marriage','wife','husband','separate'],marriage:['husband','wife','married','one flesh']
  };

  function normalize(s){return (s||'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim()}
  function stem(w){return w.length>5?w.replace(/(ing|ers|ies|ied|ed|es|s)$/,''):w}
  function concepts(q){
    const raw=normalize(q).split(' ').filter(w=>w.length>1&&!STOP.has(w));
    const out=[];
    raw.forEach(w=>{out.push(w);(SYN[w]||[]).forEach(x=>out.push(x))});
    return [...new Set(out.map(stem).filter(Boolean))];
  }

  function parseUSFX(xmlText){
    const doc=new DOMParser().parseFromString(xmlText,'application/xml');
    if(doc.querySelector('parsererror')) throw new Error('Bible XML could not be parsed');
    const verses=[];
    const books=[...doc.querySelectorAll('book')];
    books.forEach(book=>{
      const bid=(book.getAttribute('id')||book.querySelector('id')?.getAttribute('id')||'').toUpperCase();
      let chapter='',verse='',buffer='';
      const flush=()=>{const text=buffer.replace(/\s+/g,' ').trim();if(chapter&&verse&&text)verses.push({book:BOOK_NAMES[bid]||bid,chapter,verse,text,norm:normalize(text)});buffer=''};
      const walk=node=>{
        if(node.nodeType===Node.TEXT_NODE){if(verse) buffer+=' '+node.nodeValue;return}
        if(node.nodeType!==Node.ELEMENT_NODE)return;
        const tag=node.tagName.toLowerCase();
        if(['f','fe','x','fig','note'].includes(tag))return;
        if(tag==='c'){flush();chapter=node.getAttribute('id')||node.getAttribute('number')||'';verse=''}
        if(tag==='v'){flush();verse=node.getAttribute('id')||node.getAttribute('number')||''}
        [...node.childNodes].forEach(walk);
      };
      [...book.childNodes].forEach(walk);flush();
    });
    if(verses.length<1000) throw new Error('Bible verse index was unexpectedly small');
    return verses;
  }

  async function loadBible(){
    if(!biblePromise)biblePromise=fetch(SOURCE,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('Bible source returned '+r.status);return r.text()}).then(parseUSFX);
    return biblePromise;
  }

  function scoreVerse(v,tokens,query){
    let score=0, matched=0;
    const text=v.norm;
    const q=normalize(query);
    if(q.length>8&&text.includes(q))score+=30;
    tokens.forEach(t=>{
      if(t.length<3)return;
      const re=new RegExp('\\b'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','i');
      if(re.test(text)){score+=t.length>=7?7:5;matched++}
    });
    if(matched>=2)score+=matched*4;
    if(matched>=3)score+=8;
    if(text.length<180&&matched)score+=1;
    return {score,matched};
  }

  function searchBible(verses,q){
    const toks=concepts(q);
    const ranked=[];
    for(const v of verses){const s=scoreVerse(v,toks,q);if(s.score>0)ranked.push({...v,...s})}
    ranked.sort((a,b)=>b.score-a.score||b.matched-a.matched);
    const picked=[];const chapters=new Map();
    for(const r of ranked){
      const key=r.book+' '+r.chapter;
      const n=chapters.get(key)||0;
      if(n>=2)continue;
      picked.push(r);chapters.set(key,n+1);
      if(picked.length>=7)break;
    }
    return {tokens:toks,results:picked};
  }

  function confidence(results){if(!results.length)return 'Low';const s=results[0].score;return s>=28?'Strong':s>=16?'Moderate':'Exploratory'}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  async function wholeBibleFallback(q){
    const box=document.getElementById('answerBox'),title=document.getElementById('answerTitle'),refs=document.getElementById('answerRefs'),text=document.getElementById('answerText'),step=document.getElementById('answerStep');
    if(!box||!title)return;
    title.textContent='Searching the Bible…';refs.textContent='Whole-Bible keyword and concept scan';text.textContent='Looking through the World English Bible for passages related to your question.';step.textContent='';box.classList.add('show');
    try{
      const verses=await loadBible();
      const hit=searchBible(verses,q);const conf=confidence(hit.results);
      if(!hit.results.length){title.textContent='I could not find a confident Bible match';refs.textContent='Search confidence: Low';text.textContent='Your question did not produce a strong text match. Try rephrasing it with one or two specific ideas, or ask about a person, action, feeling, or Bible teaching.';step.textContent='Nexus did not invent an answer because the Bible search match was weak.';return}
      title.textContent='Bible passages related to your question';
      refs.textContent='Search confidence: '+conf+' • '+hit.results.slice(0,5).map(r=>r.book+' '+r.chapter+':'+r.verse).join(' • ');
      text.textContent='Nexus searched the Bible text for the ideas in your question. These are the strongest passages it found. Read them in context before drawing a conclusion.';
      step.innerHTML='<div style="margin-top:14px"><strong>🔎 How Nexus found this</strong><br><span style="color:#9eb0c7">Concepts: '+esc(hit.tokens.slice(0,12).join(' • '))+'</span></div>'+hit.results.map(r=>'<div style="margin-top:12px;padding:12px 14px;border:1px solid rgba(126,168,224,.22);border-radius:12px;background:rgba(7,18,35,.72)"><strong style="color:#83dcff">'+esc(r.book+' '+r.chapter+':'+r.verse)+'</strong><div style="margin-top:6px;line-height:1.55">'+esc(r.text)+'</div></div>').join('')+'<p style="margin-top:14px;color:#9eb0c7">World English Bible • Search results are relevance matches, not a claim that every listed verse answers the question by itself.</p>';
    }catch(err){
      console.warn('Whole Bible search unavailable',err);
      title.textContent='Bible search is temporarily unavailable';refs.textContent='';text.textContent='The live whole-Bible search could not load its Bible text source right now. The regular Scripture Nexus answers and 66-book explorer still work.';step.textContent='Try again in a moment.';
    }
  }

  function genericAnswerShowing(){
    const t=(document.getElementById('answerTitle')?.textContent||'').toLowerCase();
    return !t||t.includes('bible principles for your question')||t.includes('principles for your question')||t.includes('searching the bible');
  }

  function handle(){
    const input=document.getElementById('askInput');const q=input?.value.trim();if(!q)return;
    setTimeout(()=>{if(genericAnswerShowing())wholeBibleFallback(q)},350);
  }

  function init(){
    const btn=document.getElementById('askBtn'),input=document.getElementById('askInput');
    if(btn)btn.addEventListener('click',handle);
    if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter')handle()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();