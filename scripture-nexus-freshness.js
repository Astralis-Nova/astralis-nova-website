(() => {
  'use strict';

  const STORE='scriptureNexus.v2.';
  const safeGet=(k,fallback)=>{try{const v=JSON.parse(localStorage.getItem(STORE+k));return v??fallback}catch{return fallback}};
  const safeSet=(k,v)=>{try{localStorage.setItem(STORE+k,JSON.stringify(v))}catch{}};
  const dayNumber=()=>Math.floor(Date.now()/86400000);
  const weekNumber=()=>Math.floor(Date.now()/604800000);
  const hashPick=(arr,n)=>arr[Math.abs(n)%arr.length];
  const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b};
  function unseenPick(key,arr,count=1){let seen=safeGet(key,[]).filter(i=>i>=0&&i<arr.length);let pool=arr.map((_,i)=>i).filter(i=>!seen.includes(i));if(pool.length<count){seen=[];pool=arr.map((_,i)=>i)}const chosen=shuffle(pool).slice(0,count);safeSet(key,[...seen,...chosen]);return chosen.map(i=>arr[i])}

  const topics=[
    ['Anxiety','Worry and uncertainty'],['Forgiveness','When somebody hurt you'],['Decisions','Choices with consequences'],['Anger','When emotions run hot'],['Grief','Loss, memory, and hope'],['Family','Relationships at home'],['Money','Pressure and priorities'],['Spiritual Need','Meaning and faith'],
    ['Loneliness','When you feel unseen or isolated'],['Work','Pressure, fairness, and integrity'],['Patience','When waiting feels difficult'],['Friendship','Trust, loyalty, and influence'],['Guilt','When your conscience is heavy'],['Fear','Courage when you feel afraid'],['Discouragement','When you feel like giving up'],['Prayer','How and why to pray'],
    ['Honesty','Truth when lying seems easier'],['Generosity','Giving time, help, and resources'],['Difficult People','Responding without becoming bitter'],['Parenting','Guidance, patience, and example'],['Marriage','Love, respect, and commitment'],['Peer Pressure','Doing right when others push back'],['Jealousy','Contentment and comparison'],['Pride','Humility and teachability'],
    ['Purpose','Meaning and direction in life'],['Temptation','Resisting harmful choices'],['Hope','Looking beyond present trouble'],['Kindness','Strength expressed gently'],['Self-Control','Managing impulses and reactions'],['Being Mistreated','Responding to unfair treatment'],['Aging','Wisdom, dignity, and changing seasons'],['Death & Hope','Comfort and the Bible’s hope']
  ];

  const prompts=[
    'Why is there more happiness in giving than receiving?','What does Matthew 5:10 mean?','How can I forgive someone who hurt me?','What does the Bible say about anxiety?','How should I handle anger?','Give me a Bible verse for encouragement.','What can I learn from Jesus about difficult people?','What does being conscious of spiritual need mean?',
    'What does the Bible say about loneliness?','How can Bible principles help with family conflict?','What does the Bible say about making hard decisions?','How can I deal with guilt?','What does the Bible teach about honesty?','How can I have more patience?','What makes a good friend according to the Bible?','How should I respond when I am treated unfairly?',
    'What does the Bible say about money and priorities?','How can I strengthen my faith?','What does the Bible say about fear?','How can prayer help me?','What does the Bible teach about generosity?','How can I stop comparing myself with others?','What does the Bible say about pride?','How can I resist peer pressure?',
    'What is the Bible’s advice for parents?','How can married couples show love and respect?','How can I find purpose in life?','What does the Bible say about temptation?','How can I stay hopeful when life is hard?','What does Jesus teach about kindness?','How can I develop self-control?','What does the Bible say about growing older?',
    'What hope does the Bible give about death?','What does salt of the earth mean?','What does light of the world mean?','What does it mean not to store up treasures on earth?','What can birds and lilies teach us about worry?','What does Job 26:7 mean?','Can a human see God?','What can I learn from the book of Proverbs?'
  ];

  const facts=[
    {t:'The earth “upon nothing”',x:'Job 26:7 poetically describes the earth as suspended upon nothing.',s:'Job 26:7'},
    {t:'Questions are part of Bible teaching',x:'Bible writers and teachers often used questions to help listeners examine motives, beliefs, and choices.',s:'Job • Psalms • the Gospels'},
    {t:'Jesus taught with ordinary things',x:'Seeds, lamps, coins, nets, bread, sheep, weather, and family life became memorable teaching tools.',s:'Examples throughout the Gospels'},
    {t:'The Bible is a library',x:'The Bible is a collection of many books written in different periods and literary styles rather than one continuous modern-style book.',s:'66-book Bible library'},
    {t:'Psalms is the largest Bible book by chapters',x:'Psalms contains 150 psalms or chapters, more than any other Bible book.',s:'Book of Psalms'},
    {t:'Psalm 119 is an alphabetic poem',x:'Sections of Psalm 119 follow the sequence of the Hebrew alphabet, a literary structure called an acrostic.',s:'Psalm 119'},
    {t:'The shortest verse can carry deep emotion',x:'John 11:35 simply records that Jesus wept, showing that grief and compassion are not treated as weakness.',s:'John 11:35'},
    {t:'Proverbs often teaches by contrast',x:'Many proverbs place two paths side by side, such as wisdom and foolishness or diligence and laziness.',s:'Book of Proverbs'},
    {t:'Job contains ancient questions about suffering',x:'The book does not avoid difficult questions about pain, justice, human limits, and trust.',s:'Book of Job'},
    {t:'Ruth centers on loyalty and kindness',x:'Ruth’s short story explores loyalty, family responsibility, generosity, and unexpected restoration.',s:'Book of Ruth'},
    {t:'Esther never records a direct speech by God',x:'The story develops through courage, timing, reversals, and human decisions without a direct divine speech in the narrative.',s:'Book of Esther'},
    {t:'Ecclesiastes asks what gives life lasting value',x:'The writer examines work, pleasure, wealth, time, mortality, and what ultimately matters.',s:'Book of Ecclesiastes'},
    {t:'Isaiah uses vivid future imagery',x:'Isaiah contains memorable pictures of peace, restoration, justice, and hope.',s:'Isaiah 2:4 • 11:6-9 • 65:21-25'},
    {t:'Jesus frequently answered with another question',x:'Rather than merely supplying information, Jesus sometimes used a question to help a person reason to a conclusion.',s:'Examples throughout the Gospels'},
    {t:'The Good Samaritan begins with a question',x:'Jesus gave the illustration after a man asked, “Who really is my neighbor?”',s:'Luke 10:25-37'},
    {t:'The Sermon on the Mount uses nature as a classroom',x:'Jesus pointed to birds, flowers, sunlight, rain, salt, and light to teach spiritual lessons.',s:'Matthew 5–7'},
    {t:'Paul quoted a saying of Jesus not recorded in the Gospels',x:'Acts 20:35 preserves the saying that there is more happiness in giving than in receiving.',s:'Acts 20:35'},
    {t:'A tiny letter addresses a large moral issue',x:'Philemon is only one chapter, yet it deals with mercy, brotherhood, reconciliation, and how Christians treat one another.',s:'Philemon'},
    {t:'James is packed with practical comparisons',x:'James compares uncontrolled speech to a fire, life to a mist, and a hearer who does not act to someone forgetting his own face.',s:'James 1:23-24 • 3:5-6 • 4:14'},
    {t:'Revelation uses symbolic numbers and images',x:'Its visions use lamps, stars, beasts, scrolls, trumpets, bowls, and symbolic numbers, making context especially important.',s:'Book of Revelation'},
    {t:'Genesis begins with order and purpose',x:'Its opening account moves through a structured sequence as the earth becomes prepared for life.',s:'Genesis 1'},
    {t:'Moses was reluctant at first',x:'When commissioned, Moses raised several concerns about his ability and how people would respond.',s:'Exodus 3–4'},
    {t:'David wrote from very different emotional states',x:'Psalms associated with David include praise, fear, repentance, confidence, grief, and gratitude.',s:'Psalms'},
    {t:'Bible courage is not the absence of fear',x:'Many faithful people acted while facing danger, uncertainty, or personal weakness.',s:'Joshua 1:9 • Esther 4:14-16 • Acts 4:29'}
  ];

  const quizzes=[
    {l:'Cadet',q:'Who defeated Goliath?',c:['David','Daniel','Peter','Joseph'],a:0,r:'1 Samuel 17'},
    {l:'Cadet',q:'Who built the ark?',c:['Abraham','Moses','Noah','Solomon'],a:2,r:'Genesis 6–8'},
    {l:'Cadet',q:'Who was swallowed by a great fish?',c:['Jonah','Elijah','Samuel','Isaiah'],a:0,r:'Jonah 1–2'},
    {l:'Cadet',q:'Who led Israel out of Egypt?',c:['Moses','Joshua','David','Paul'],a:0,r:'Exodus'},
    {l:'Cadet',q:'Who was known for great physical strength?',c:['Samson','Solomon','Timothy','Ezra'],a:0,r:'Judges 13–16'},
    {l:'Cadet',q:'Who became queen and courageously approached the king?',c:['Ruth','Esther','Miriam','Lydia'],a:1,r:'Esther 4–7'},
    {l:'Cadet',q:'Who was thrown into a lions’ pit?',c:['Daniel','Joseph','Peter','Job'],a:0,r:'Daniel 6'},
    {l:'Cadet',q:'Where was Jesus born?',c:['Nazareth','Jerusalem','Bethlehem','Capernaum'],a:2,r:'Matthew 2:1'},
    {l:'Cadet',q:'Who baptized Jesus?',c:['Peter','John the Baptist','Paul','Andrew'],a:1,r:'Matthew 3:13-17'},
    {l:'Cadet',q:'How many apostles did Jesus choose?',c:['7','10','12','40'],a:2,r:'Luke 6:13'},
    {l:'Cadet',q:'Which Bible book contains 150 psalms?',c:['Proverbs','Psalms','Isaiah','Acts'],a:1,r:'Psalms'},
    {l:'Cadet',q:'Who was Jesus’ mother?',c:['Mary','Martha','Elizabeth','Deborah'],a:0,r:'Luke 1–2'},

    {l:'Explorer',q:'Which book says the earth is suspended upon nothing?',c:['Psalms','Job','Isaiah','Genesis'],a:1,r:'Job 26:7'},
    {l:'Explorer',q:'Who interpreted Pharaoh’s dreams in Egypt?',c:['Joseph','Moses','Daniel','Aaron'],a:0,r:'Genesis 41'},
    {l:'Explorer',q:'Who asked God for wisdom to govern?',c:['David','Solomon','Hezekiah','Josiah'],a:1,r:'1 Kings 3'},
    {l:'Explorer',q:'Which prophet challenged the prophets of Baal on Mount Carmel?',c:['Elijah','Elisha','Isaiah','Jeremiah'],a:0,r:'1 Kings 18'},
    {l:'Explorer',q:'Who said, “Your people will be my people”?',c:['Esther','Ruth','Hannah','Abigail'],a:1,r:'Ruth 1:16'},
    {l:'Explorer',q:'Which Gospel includes the illustration of the Good Samaritan?',c:['Matthew','Mark','Luke','John'],a:2,r:'Luke 10:25-37'},
    {l:'Explorer',q:'Who climbed a tree to see Jesus?',c:['Zacchaeus','Nicodemus','Bartimaeus','Cornelius'],a:0,r:'Luke 19:1-10'},
    {l:'Explorer',q:'Who denied knowing Jesus three times?',c:['John','Peter','Thomas','James'],a:1,r:'Luke 22:54-62'},
    {l:'Explorer',q:'Who was the first Christian martyr recorded in Acts?',c:['Stephen','Barnabas','James','Timothy'],a:0,r:'Acts 7'},
    {l:'Explorer',q:'Where were disciples first called Christians?',c:['Rome','Jerusalem','Antioch','Corinth'],a:2,r:'Acts 11:26'},
    {l:'Explorer',q:'Which apostle had previously been known as Saul?',c:['Peter','Paul','John','Matthew'],a:1,r:'Acts 13:9'},
    {l:'Explorer',q:'Who wrote about faith without works being dead?',c:['James','Luke','Jude','Mark'],a:0,r:'James 2:26'},

    {l:'Scholar',q:'Which judge defeated Midian with only 300 men?',c:['Jephthah','Gideon','Samson','Barak'],a:1,r:'Judges 7'},
    {l:'Scholar',q:'Who confronted David after his sin involving Bathsheba?',c:['Nathan','Gad','Samuel','Ahijah'],a:0,r:'2 Samuel 12'},
    {l:'Scholar',q:'Which king found the book of the Law during temple repairs?',c:['Josiah','Ahab','Saul','Rehoboam'],a:0,r:'2 Kings 22'},
    {l:'Scholar',q:'Which prophet saw a valley of dry bones?',c:['Daniel','Ezekiel','Hosea','Amos'],a:1,r:'Ezekiel 37'},
    {l:'Scholar',q:'Who rebuilt Jerusalem’s walls despite opposition?',c:['Ezra','Nehemiah','Zerubbabel','Mordecai'],a:1,r:'Nehemiah 2–6'},
    {l:'Scholar',q:'Which prophet married Gomer?',c:['Joel','Hosea','Micah','Habakkuk'],a:1,r:'Hosea 1'},
    {l:'Scholar',q:'Which Gospel opens by calling Jesus “the Word”?',c:['Matthew','Mark','Luke','John'],a:3,r:'John 1:1'},
    {l:'Scholar',q:'Who explained Isaiah to an Ethiopian official?',c:['Philip','Stephen','Silas','Apollos'],a:0,r:'Acts 8:26-40'},
    {l:'Scholar',q:'Who was a tentmaker with Paul in Corinth?',c:['Aquila','Titus','Luke','Tychicus'],a:0,r:'Acts 18:1-3'},
    {l:'Scholar',q:'Which congregation received counsel about spiritual armor?',c:['Ephesus','Philippi','Colossae','Thessalonica'],a:0,r:'Ephesians 6:10-18'},
    {l:'Scholar',q:'Which letter describes the tongue as a fire?',c:['Hebrews','James','Jude','1 Peter'],a:1,r:'James 3:5-6'},
    {l:'Scholar',q:'Which prophet is quoted in Romans 1:17 about living by faith?',c:['Habakkuk','Malachi','Zephaniah','Obadiah'],a:0,r:'Habakkuk 2:4 • Romans 1:17'}
  ];

  const dailyVerses=[
    ['Proverbs 3:5-6','Trust beyond your own understanding','Trust in God while seeking direction rather than relying only on your own viewpoint.'],
    ['Matthew 5:9','Be a peacemaker','Peace often requires initiative, humility, and restraint rather than merely avoiding conflict.'],
    ['Psalm 55:22','Throw your burden on God','Prayer can help move a burden from endless mental replay into trust and purposeful action.'],
    ['Acts 20:35','Happiness in giving','Generosity can produce a deep form of happiness by improving someone else’s situation.'],
    ['James 1:19','Quick to listen','Listening first can prevent emotion from deciding what your words will do next.'],
    ['Philippians 4:6-7','Prayer when anxious','Bring concerns to God with thanksgiving instead of allowing anxiety to become the only voice in the room.'],
    ['Matthew 6:34','One day at a time','Tomorrow has its own concerns. Give today’s responsibilities today’s attention.'],
    ['Proverbs 15:1','A mild answer','The way something is said can either cool conflict or feed it.'],
    ['Psalm 34:18','Near the brokenhearted','The Bible portrays God as close to people whose hearts are crushed by grief.'],
    ['Ephesians 4:32','Kind and forgiving','Kindness and compassion can interrupt cycles of resentment.'],
    ['Micah 6:8','Justice, loyalty, modesty','A compact summary of conduct centered on justice, loyal love, and modesty before God.'],
    ['Romans 12:21','Conquer evil with good','Do not let another person’s wrongdoing choose the kind of person you become.'],
    ['Proverbs 17:17','A true friend','A loyal friend remains present when circumstances become difficult.'],
    ['Matthew 7:12','The Golden Rule','Consider how you would want to be treated, then let that shape how you treat others.'],
    ['Galatians 6:9','Do not give up','Good work can require patience before its results become visible.'],
    ['1 Peter 5:7','Throw anxiety on God','Faith includes bringing personal anxieties to God rather than carrying them alone.'],
    ['Proverbs 14:15','Think before believing','The inexperienced may accept every word; wisdom examines where a path leads.'],
    ['Colossians 3:13','Continue forgiving','Forgiveness can be a continuing choice, especially when hurt does not disappear immediately.'],
    ['Matthew 5:16','Let your light shine','Good conduct can make faith visible without turning spirituality into self-promotion.'],
    ['Ecclesiastes 3:1','A time for everything','Life has seasons. Wisdom includes recognizing when circumstances have changed.'],
    ['Isaiah 41:10','Do not be afraid','The passage connects courage with confidence that God provides help and support.'],
    ['Joshua 1:9','Be courageous','Courage is acting faithfully despite fear, not necessarily feeling no fear.'],
    ['Proverbs 22:3','See danger and act','Wisdom includes noticing risks early and taking reasonable precautions.'],
    ['Luke 6:31','Treat others well','Jesus frames ethics through empathy: consider how you want others to act toward you.'],
    ['Hebrews 13:5','Be content','Contentment protects us from allowing possessions to become the measure of security.'],
    ['Psalm 37:5','Commit your way to God','Planning and trust can work together rather than competing.'],
    ['Matthew 5:10','Doing right under pressure','Opposition does not automatically mean a righteous choice was the wrong choice.'],
    ['Proverbs 16:32','Control beats conquest','Self-control is portrayed as a greater strength than simply overpowering others.'],
    ['1 Corinthians 13:4','Love is patient and kind','Love shows itself through behavior, especially patience and kindness.'],
    ['James 1:5','Ask for wisdom','When you do not know what to do, the Bible encourages asking God for wisdom.'],
    ['Psalm 119:105','A lamp for your path','Scripture can provide enough light for the next faithful step even when the entire road is not visible.']
  ];

  const weeklyThemes=[
    {t:'Happiness That Lasts',r:'Acts 20:35',x:'Explore why generosity, gratitude, and spiritual priorities can produce deeper happiness.',q:'Why is there more happiness in giving than receiving?'},
    {t:'Courage Under Pressure',r:'Joshua 1:9',x:'Explore courage when fear, opposition, or uncertainty makes the right course difficult.',q:'What does the Bible teach about courage?'},
    {t:'Peace of Mind',r:'Philippians 4:6-7',x:'Explore prayer, perspective, and practical principles for handling anxiety.',q:'What does the Bible say about anxiety?'},
    {t:'Family & Home',r:'Colossians 3:12-14',x:'Explore patience, forgiveness, compassion, and love inside everyday family life.',q:'What Bible principles can help with family conflict?'},
    {t:'Forgiveness',r:'Ephesians 4:31-32',x:'Explore forgiveness without confusing it with pretending that harmful behavior never happened.',q:'How can I forgive someone who hurt me?'},
    {t:'Creation & the Universe',r:'Job 26:7',x:'Explore some of the Bible’s memorable imagery about the earth, heavens, stars, and creation.',q:'What does the Bible say about the earth in space?'},
    {t:'Words Have Power',r:'Proverbs 15:1',x:'Explore listening, gentle answers, gossip, encouragement, and the influence of speech.',q:'What does the Bible teach about the way we speak?'},
    {t:'Friendship',r:'Proverbs 17:17',x:'Explore loyalty, influence, honesty, and what makes someone a trustworthy friend.',q:'What makes a good friend according to the Bible?'},
    {t:'Work & Integrity',r:'Colossians 3:23',x:'Explore honesty, diligence, unfair treatment, and maintaining principles at work.',q:'What Bible principles can help me at work?'},
    {t:'Money & Priorities',r:'Matthew 6:19-21',x:'Explore contentment, generosity, planning, and why possessions should not own our heart.',q:'What does the Bible say about money and priorities?'},
    {t:'Hope in Hard Times',r:'Romans 12:12',x:'Explore endurance, prayer, and reasons to keep hope alive during difficult seasons.',q:'How can the Bible help me stay hopeful?'},
    {t:'Jesus’ Teaching Style',r:'Matthew 13:34',x:'Explore why Jesus used questions, illustrations, ordinary objects, and stories that people remembered.',q:'Why did Jesus teach with illustrations?'},
    {t:'Wisdom for Decisions',r:'Proverbs 3:5-6',x:'Explore prayer, counsel, foresight, motives, and consequences before making a major choice.',q:'What does the Bible say about making hard decisions?'},
    {t:'Kindness as Strength',r:'Luke 6:31',x:'Explore kindness, empathy, mercy, and treating people well even when it costs something.',q:'What does Jesus teach about kindness?'},
    {t:'Patience',r:'Galatians 6:9',x:'Explore waiting without giving up and staying steady when results are slow.',q:'How can I have more patience?'},
    {t:'Light in the World',r:'Matthew 5:14-16',x:'Explore how ordinary good conduct can quietly influence people around us.',q:'What does it mean to be the light of the world?'}
  ];

  function addStyles(){const s=document.createElement('style');s.textContent=`
    .nexus-fresh{padding:10px 0 24px}.nexus-fresh-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.fresh-card{padding:20px;border:1px solid rgba(120,180,255,.35);border-radius:18px;background:rgba(5,15,29,.82);backdrop-filter:blur(10px);box-shadow:0 14px 45px rgba(0,0,0,.22)}.fresh-card h3{margin:7px 0}.fresh-card p{color:#c8d5e6;line-height:1.55}.fresh-meta{font-size:.78rem;color:#83dcff;font-weight:800}.fresh-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.fresh-mini{border:1px solid rgba(120,180,255,.28);border-radius:999px;background:#0b1a31;color:#e8f2ff;padding:8px 11px;cursor:pointer}.progress-track{height:8px;border-radius:999px;background:#0c1830;overflow:hidden;margin-top:8px}.progress-fill{height:100%;background:linear-gradient(90deg,#357ce9,#8b65ef);width:0}.challenge-levels{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px}.challenge-levels button{border:1px solid rgba(120,180,255,.25);border-radius:999px;background:#0b1a31;color:#dce7f6;padding:7px 10px;cursor:pointer}.challenge-levels button.active{background:linear-gradient(135deg,#357ce9,#8b65ef);color:white}.rotation-note{color:#8fa4bd;font-size:.78rem;margin-top:8px}@media(max-width:700px){.nexus-fresh-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(s)}

  function ask(q){const i=document.getElementById('askInput'),b=document.getElementById('askBtn');if(!i||!b)return;i.value=q;b.click();document.getElementById('answerBox')?.scrollIntoView({behavior:'smooth',block:'center'})}

  function buildFreshSection(){const guidance=document.getElementById('guidance');if(!guidance)return;const daily=hashPick(dailyVerses,dayNumber());const weekly=hashPick(weeklyThemes,weekNumber());const sec=document.createElement('section');sec.className='section shell nexus-fresh';sec.id='featured';sec.innerHTML=`<div class="section-head"><div class="eyebrow">Returning Explorer Signal</div><h2>Fresh from the Nexus</h2><p>Daily and weekly features rotate automatically while the larger library remembers what this browser has already explored.</p></div><div class="nexus-fresh-grid"><article class="fresh-card"><div class="eyebrow">Verse of the Day</div><h3>${daily[0]} · ${daily[1]}</h3><p>${daily[2]}</p><div class="fresh-actions"><button class="action" id="dailyExplore">Explore this verse ✦</button></div></article><article class="fresh-card"><div class="eyebrow">This Week in Scripture</div><h3>${weekly.t}</h3><div class="fresh-meta">${weekly.r}</div><p>${weekly.x}</p><div class="fresh-actions"><button class="action" id="weeklyExplore">Explore this theme</button></div></article></div>`;guidance.parentNode.insertBefore(sec,guidance);document.getElementById('dailyExplore').onclick=()=>ask(daily[0]);document.getElementById('weeklyExplore').onclick=()=>ask(weekly.q)}

  function rotatePrompts(){const box=document.querySelector('.examples');if(!box)return;box.innerHTML='';unseenPick('promptSeen',prompts,8).forEach(q=>{const b=document.createElement('button');b.textContent=q.length>34?q.slice(0,32)+'…':q;b.title=q;b.onclick=()=>ask(q);box.appendChild(b)});const surprise=document.createElement('button');surprise.textContent='🎲 Surprise question';surprise.onclick=()=>ask(unseenPick('surpriseSeen',prompts,1)[0]);box.appendChild(surprise)}

  function rotateTopics(){const box=document.getElementById('topicGrid');if(!box)return;box.innerHTML='';unseenPick('topicSeen',topics,8).forEach(([a,b])=>{const el=document.createElement('button');el.className='topic';el.innerHTML='<strong>'+a+'</strong><span>'+b+'</span>';el.onclick=()=>ask(a);box.appendChild(el)});const p=box.previousElementSibling?.querySelector('p');if(p)p.textContent='Eight doorways rotate each visit from a larger life-guidance library. Or describe the situation above.'}

  function nextFact(){const f=unseenPick('factSeen',facts,1)[0];document.getElementById('factTitle').textContent=f.t;document.getElementById('factText').textContent=f.x;document.getElementById('factSource').textContent=f.s}

  let currentLevel=safeGet('quizLevel','Explorer');
  function availableQuiz(){const set=quizzes.filter(q=>q.l===currentLevel);return unseenPick('quizSeen.'+currentLevel,set,1)[0]}
  function nextQuiz(){const q=availableQuiz(),question=document.getElementById('quizQuestion'),choices=document.getElementById('quizChoices'),result=document.getElementById('quizResult');if(!q||!question||!choices)return;question.textContent=q.q;choices.innerHTML='';result.textContent='';q.c.forEach((c,i)=>{const b=document.createElement('button');b.className='quiz-choice';b.textContent=c;b.onclick=()=>{result.textContent=i===q.a?'Correct ✦  '+q.r:'Not quite. Try again.'};choices.appendChild(b)})}
  function buildQuizLevels(){const question=document.getElementById('quizQuestion');if(!question)return;const levels=document.createElement('div');levels.className='challenge-levels';['Cadet','Explorer','Scholar'].forEach(l=>{const b=document.createElement('button');b.textContent=l;b.classList.toggle('active',l===currentLevel);b.onclick=()=>{currentLevel=l;safeSet('quizLevel',l);levels.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.textContent===l));nextQuiz()};levels.appendChild(b)});question.parentNode.insertBefore(levels,question);const note=document.createElement('div');note.className='rotation-note';note.textContent='Questions avoid repeats until you work through the current level.';document.getElementById('newQuiz')?.insertAdjacentElement('afterend',note)}

  function progress(){const bookInfo=document.getElementById('bookInfo');if(!bookInfo)return;const section=document.getElementById('books');const head=section?.querySelector('.section-head');if(!head)return;const card=document.createElement('div');card.className='fresh-card';card.style.marginBottom='18px';card.innerHTML='<div class="eyebrow">Your Bible Journey</div><h3 id="journeyCount">0 of 66 books explored</h3><div class="progress-track"><div class="progress-fill" id="journeyFill"></div></div><div class="rotation-note">Stored only in this browser. No account needed.</div>';head.insertAdjacentElement('afterend',card);const update=()=>{const seen=safeGet('booksSeen',[]);document.getElementById('journeyCount').textContent=seen.length+' of 66 books explored';document.getElementById('journeyFill').style.width=(seen.length/66*100)+'%'};['hebrewBooks','greekBooks'].forEach(id=>document.getElementById(id)?.addEventListener('click',e=>{const b=e.target.closest('.book');if(!b)return;const seen=safeGet('booksSeen',[]);if(!seen.includes(b.title)){seen.push(b.title);safeSet('booksSeen',seen);update()}}));update()}

  function init(){addStyles();buildFreshSection();rotatePrompts();rotateTopics();const rf=document.getElementById('randomFact');if(rf)rf.onclick=nextFact;nextFact();buildQuizLevels();const nq=document.getElementById('newQuiz');if(nq)nq.onclick=nextQuiz;nextQuiz();progress()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else setTimeout(init,0);
})();