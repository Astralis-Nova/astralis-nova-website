(()=>{
  if(window.__astralisNovaAliveV1)return;
  window.__astralisNovaAliveV1=true;

  const root=document.getElementById('novaGuide');
  if(!root)return;
  const msg=root.querySelector('#novaMessage');
  const status=root.querySelector('#novaStatus');
  const face=root.querySelector('#novaFace');
  const mini=root.querySelector('#novaMini');
  const pick=a=>a[Math.floor(Math.random()*a.length)];
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  const muted=()=>{try{return localStorage.getItem('astralisNovaMuted')==='true'}catch{return false}};
  const emote=e=>{if(face)face.textContent=e;if(mini)mini.textContent=e};
  const speak=text=>{if(muted()||!('speechSynthesis'in window))return;const u=new SpeechSynthesisUtterance(text);speechSynthesis.cancel();speechSynthesis.speak(u)};
  const say=(text,e='✨')=>{if(msg)msg.textContent=text;if(status)status.textContent=text;emote(e);speak(text)};

  const jokes=[
    'I asked the black hole for directions. It said, “Come closer.” I declined the invitation.',
    'My navigation system has one rule: if the map says “here be dragons,” I update the firmware first.',
    'A photon walks into customs. “Anything to declare?” “No, I am traveling light.”',
    'I tried to teach a comet patience. It said it was just passing through.',
    'The astronaut opened a bakery on Mars. Business was slow. Apparently everyone wanted more atmosphere.',
    'I told the chess engine to think outside the box. It moved a rook off the board. We had a meeting.',
    'Two antennas met on a roof, fell in love, and got married. The ceremony was average, but the reception was excellent.',
    'I bought a telescope with trust issues. It keeps looking into everything.',
    'Why do robots make poor secret keepers? Too many debug logs.',
    'I challenged the Moon to a staring contest. It disappeared for a few hours. Suspicious.',
    'The server asked for a day off. I said, “Fine, but do not crash on the couch.”',
    'My favorite exercise is orbital mechanics. Lots of revolutions, very little jogging.',
    'The computer joined a band. Naturally, it had excellent cache timing.',
    'A neutron walked into a café and asked the price of coffee. The waiter said, “For you, no charge.”',
    'I do not procrastinate. I perform strategically delayed computation.'
  ];

  const leadership=[
    'Leadership thought: clarity beats volume. People move faster when they understand the mission, not merely the urgency.',
    'Leadership thought: the strongest leader in the room is often the one who can change course without needing to pretend the first plan was perfect.',
    'Leadership thought: trust compounds. Small promises kept consistently become authority that does not need to shout.',
    'Leadership thought: good leaders create more decision-makers, not more dependents.',
    'Leadership thought: when pressure rises, simplify the objective before increasing the effort.',
    'Leadership thought: a team learns your priorities from what you reward, what you tolerate, and what you repeatedly ask about.',
    'Leadership thought: courage is not always charging forward. Sometimes it is stopping a bad plan early.',
    'Leadership thought: if nobody can disagree with you safely, you do not have a feedback system. You have an echo chamber.',
    'Leadership thought: competence earns confidence, but consistency earns trust.',
    'Leadership thought: the best handoff leaves the next person with context, not just instructions.',
    'Leadership thought: urgency is a tool. If everything is urgent, the tool has become noise.',
    'Leadership thought: a calm leader can lend nervous systems to an entire room.'
  ];

  const wowFacts=[
    'Known fact: an octopus has three hearts, and two of them stop beating while it swims.',
    'Known fact: a day on Venus is longer than a Venusian year. The planet rotates extraordinarily slowly.',
    'Known fact: sharks existed before trees appeared on Earth.',
    'Known fact: the observable universe contains more stars than there are grains of sand on all of Earth’s beaches by common astronomical estimates.',
    'Known fact: honey can remain edible for an extremely long time when sealed and protected from moisture because microbes struggle to grow in it.',
    'Known fact: the Eiffel Tower can grow several centimeters taller in hot weather as its metal expands.',
    'Known fact: wombat droppings are cube-shaped. Biology occasionally submits very strange engineering drawings.',
    'Known fact: lightning can heat the air around it to temperatures hotter than the surface of the Sun.',
    'Known fact: bananas are berries botanically, while strawberries are not true botanical berries.',
    'Known fact: some turtles can breathe through specialized tissues near the rear of their bodies while underwater. Nature has no respect for dignified design reviews.',
    'Known fact: the Moon is slowly moving away from Earth by a few centimeters per year.',
    'Known fact: a teaspoon of neutron-star matter would weigh around a billion tons on Earth, depending on the exact density assumed.'
  ];

  const spaceFacts=[
    'Space fact: sunlight takes about eight minutes and twenty seconds to reach Earth.',
    'Space fact: Jupiter is so massive that it contains more than twice the mass of all the other planets combined.',
    'Space fact: footprints on the Moon can persist for extremely long periods because there is essentially no weather to erase them.',
    'Space fact: Saturn’s average density is lower than water, so in a fantastically large enough ocean it would float.',
    'Space fact: Mars has the largest volcano known in the Solar System, Olympus Mons.',
    'Space fact: neutron stars can rotate hundreds of times per second.',
    'Space fact: there are rogue planets that travel through interstellar space without orbiting a star.',
    'Space fact: the International Space Station circles Earth roughly every ninety minutes.',
    'Space fact: Uranus rotates on its side compared with most planets, probably because of ancient giant impacts.',
    'Space fact: the Sun contains more than 99 percent of the mass in the Solar System.'
  ];

  const animalFacts=[
    'Animal fact: crows can recognize individual human faces and remember them for years.',
    'Animal fact: elephants can communicate using very low-frequency sounds that travel over long distances.',
    'Animal fact: dolphins use signature whistles that function a little like individual names.',
    'Animal fact: ravens can plan for future events and solve multi-step problems.',
    'Animal fact: dogs have a sense of smell tens of thousands of times more sensitive than ours for some odors.',
    'Animal fact: bees communicate the direction and distance of food with a waggle dance.',
    'Animal fact: sea otters sometimes hold hands while resting so they do not drift apart.',
    'Animal fact: roadrunners can reach impressive running speeds and will eat snakes, lizards, insects, and small rodents.',
    'Animal fact: some tortoises can live for more than a century.',
    'Animal fact: chickens can distinguish many individual flock mates and maintain complex social hierarchies.'
  ];

  const techFacts=[
    'Tech fact: the first computer mouse prototype was made of wood.',
    'Tech fact: GPS satellites require corrections from both special and general relativity or positioning errors would accumulate rapidly.',
    'Tech fact: the term “bug” for a technical fault predates computers, although an actual moth famously became part of computing folklore in 1947.',
    'Tech fact: modern smartphones contain more computing power than the computers used for the Apollo Moon missions by enormous margins.',
    'Tech fact: the internet and the World Wide Web are not the same thing. The web is one service that runs on top of the internet.',
    'Tech fact: QR codes were invented in Japan for tracking automotive parts before becoming everyday links and tickets.',
    'Tech fact: RAID can improve resilience against some drive failures, but it is not a substitute for a separate backup.',
    'Tech fact: solid-state drives have no moving mechanical read heads, which is one reason they tolerate shock better than traditional hard drives.'
  ];

  const historyFacts=[
    'History fact: Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.',
    'History fact: Oxford University was teaching students centuries before the Aztec Empire was founded.',
    'History fact: the shortest recorded war, between Britain and Zanzibar in 1896, lasted less than an hour.',
    'History fact: the fax machine was invented before the American Civil War.',
    'History fact: Nintendo was founded in 1889, long before electronic video games, originally making playing cards.',
    'History fact: the last woolly mammoths survived on Wrangel Island thousands of years after the pyramids of Giza were built.',
    'History fact: humans were using controlled fire long before the invention of agriculture.'
  ];

  const riddles=[
    ['I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?','An echo.'],
    ['The more of me you take, the more you leave behind. What am I?','Footsteps.'],
    ['What can travel around the world while staying in one corner?','A stamp.'],
    ['What has many keys but cannot open a single lock?','A piano.'],
    ['I get wetter the more I dry. What am I?','A towel.']
  ];

  const novaThoughts=[
    'Nova thought: curiosity is one of the few resources that grows when you spend it.',
    'Nova thought: every archive is a conversation between the person you were and the person who finds it later.',
    'Nova thought: a good system should make the right thing easier, not merely the wrong thing punishable.',
    'Nova thought: nostalgia becomes more useful when you preserve the story, not just the object.',
    'Nova thought: technology gets interesting when it stops feeling like equipment and starts feeling like an extension of intent.',
    'Nova thought: there is no shame in rebuilding something twice. The second version knows where the first one fell down.',
    'Nova thought: the future is usually assembled from very ordinary parts by people stubborn enough to keep connecting them.'
  ];

  const modes={
    joke:()=>[pick(jokes),'😄'],leadership:()=>[pick(leadership),'🧭'],wow:()=>[pick(wowFacts),'🤯'],space:()=>[pick(spaceFacts),'🪐'],animal:()=>[pick(animalFacts),'🐾'],tech:()=>[pick(techFacts),'💾'],history:()=>[pick(historyFacts),'⌛'],thought:()=>[pick(novaThoughts),'🌌']
  };

  const perform=mode=>{const fn=modes[mode]||modes.wow;const [text,e]=fn();say(text,e);return text};
  const askRiddle=()=>{const [q,a]=pick(riddles);say(`${q} Think on it. Ask me “answer the riddle” when you want the answer.`,'🧩');try{sessionStorage.setItem('astralisNovaRiddleAnswer',a)}catch{}};
  const answerRiddle=()=>{let a='I seem to have misplaced the riddle. Very professional of me.';try{a=sessionStorage.getItem('astralisNovaRiddleAnswer')||a}catch{}say(a,'💡')};

  const handleText=text=>{
    const q=clean(text).toLowerCase();
    if(!q)return false;
    if(/\b(leadership quote|leadership thought|leader quote|leadership advice)\b/.test(q)){perform('leadership');return true}
    if(/\b(wow fact|amazing fact|mind.?blowing fact|surprise fact|random fact|tell me a fact)\b/.test(q)){perform('wow');return true}
    if(/\b(space fact|astronomy fact|cosmic fact)\b/.test(q)){perform('space');return true}
    if(/\b(animal fact|wildlife fact)\b/.test(q)){perform('animal');return true}
    if(/\b(tech fact|technology fact|computer fact)\b/.test(q)){perform('tech');return true}
    if(/\b(history fact|historical fact)\b/.test(q)){perform('history');return true}
    if(/\b(nova thought|your thought|something wise|wisdom)\b/.test(q)){perform('thought');return true}
    if(/\b(riddle|brain teaser)\b/.test(q)&&!/answer/.test(q)){askRiddle();return true}
    if(/\b(answer the riddle|riddle answer)\b/.test(q)){answerRiddle();return true}
    if(/\b(coin flip|flip a coin|heads or tails)\b/.test(q)){say(`I flipped it: ${Math.random()<.5?'heads':'tails'}. No quantum appeals allowed.`,'🪙');return true}
    if(/\b(random number)\b/.test(q)){say(`Random number from 1 to 100: ${1+Math.floor(Math.random()*100)}.`,'🎲');return true}
    return false;
  };

  const input=root.querySelector('#novaCommand');
  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-nova-alive]');
    if(b){e.preventDefault();e.stopPropagation();const mode=b.dataset.novaAlive;if(mode==='riddle')askRiddle();else perform(mode);return}
    const send=e.target.closest?.('#novaSend');
    if(send&&input&&handleText(input.value)){e.preventDefault();e.stopImmediatePropagation();input.value=''}
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&e.target===input&&handleText(input.value)){e.preventDefault();e.stopImmediatePropagation();input.value=''}
  },true);

  const addButtons=()=>{
    const actions=root.querySelector('.nova-actions');
    if(!actions||root.querySelector('[data-nova-alive]'))return;
    const buttons=[
      ['wow','🤯 Wow Fact','Something unexpectedly true'],
      ['leadership','🧭 Leadership','A Nova leadership thought'],
      ['space','🪐 Space Fact','Cosmic knowledge'],
      ['animal','🐾 Animal Fact','Nature gets strange'],
      ['tech','💾 Tech Fact','Computing and engineering'],
      ['riddle','🧩 Riddle','Test the carbon unit']
    ];
    buttons.forEach(([mode,label,small])=>{const b=document.createElement('button');b.type='button';b.className='nova-action';b.dataset.novaAlive=mode;b.innerHTML=`${label}<small>${small}</small>`;actions.appendChild(b)});
  };
  addButtons();

  // A tiny bit of spontaneous life, once per browser session, when Nova is opened.
  let greeted=false;
  const observer=new MutationObserver(()=>{
    const panel=root.querySelector('#novaPanel');
    if(!panel||greeted||!panel.classList.contains('open'))return;
    greeted=true;
    let done=false;try{done=sessionStorage.getItem('astralisNovaSparked')==='1';sessionStorage.setItem('astralisNovaSparked','1')}catch{}
    if(done||Math.random()>.45)return;
    const spark=pick([
      'Nova online. I have facts, questionable jokes, leadership thoughts, riddles, and absolutely no intention of being boring.',
      'Helm is yours. Unless you say “Nova decides,” in which case I have several ideas and suspiciously good confidence.',
      'Welcome back. The archive is awake, the stars are still where I left them, and I brought extra trivia.'
    ]);
    setTimeout(()=>say(spark,'✨'),450);
  });
  observer.observe(root,{subtree:true,attributes:true,attributeFilter:['class','aria-hidden']});

  window.AstralisNovaAlive={perform,handleText,joke:()=>perform('joke'),fact:()=>perform('wow'),leadership:()=>perform('leadership'),riddle:askRiddle};
})();
