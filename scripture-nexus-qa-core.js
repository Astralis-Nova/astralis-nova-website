(() => {
  "use strict";

  const directAnswers = [
    {
      match: /(can|could|may|did).*(human|man|person|people).*(see|look at|view).*(god|jehovah)|can.*see god|see god.*live/i,
      title: "Can a human see God?",
      refs: "Exodus 33:20 • John 1:18 • 1 Timothy 6:16 • Exodus 33:18-23",
      text: "The Bible indicates that humans cannot see God directly in his full glory and continue living. Exodus 33:20 says that no human can see God and live, and John 1:18 says that no man has seen God at any time. When Bible accounts describe people as seeing God, the surrounding context may involve a vision, an angelic representative, or a manifestation rather than a human literally seeing God's full divine form.",
      step: "Compare Exodus 33:18-23 with John 1:18 and 1 Timothy 6:16. Notice the difference between seeing a manifestation or vision and seeing God directly.",
      simple: "According to the Bible, humans cannot look directly on God in his full divine glory and survive. Accounts of people 'seeing God' can describe visions or representatives rather than seeing God's full form.",
      example: "Think of a message delivered through a representative. Meeting the representative can truly be an encounter with the sender's authority without literally seeing the sender face-to-face. Some Bible accounts use similar representative language.",
      deep: "Explore next: Exodus 24:9-11 • Genesis 32:30 • Judges 13:21-22 • John 6:46."
    },
    {
      match: /(what.*spiritual need|spiritual need.*mean|conscious.*spiritual need)/i,
      title: "What does being conscious of spiritual need mean?",
      refs: "Matthew 5:3 • Psalm 42:1-2 • Matthew 4:4",
      text: "It means recognizing that material things and human ability do not satisfy every need. A person who is conscious of spiritual need actively seeks God's guidance, truth, meaning, and a relationship with him.",
      step: "Consider what regular habits could feed that need, such as prayer, Bible reading, reflection, and asking sincere questions.",
      simple: "It means knowing that you need spiritual guidance and not assuming you already have every important answer.",
      example: "Someone facing a difficult choice asks not only, 'What works for me?' but also, 'What Bible principles should guide this decision?'",
      deep: "Explore next: Psalm 63:1 • Isaiah 55:1-3 • James 4:8."
    },
    {
      match: /(earth.*(nothing|space)|hang.*earth|suspend.*earth|job 26:7)/i,
      title: "What does the Bible say about the earth in space?",
      refs: "Job 26:7 • Isaiah 40:22 • Psalm 19:1",
      text: "Job 26:7 poetically describes God as suspending the earth 'upon nothing.' It is one of the Bible's striking cosmic images and is worth reading in its larger poetic context.",
      step: "Read Job 26 as a whole, then compare the imagery with other passages about the heavens and creation.",
      simple: "Job describes the earth as hanging on nothing rather than resting on a physical support.",
      example: "The verse can open a discussion about the way ancient biblical poetry described the created world and how readers compare that imagery with later scientific knowledge.",
      deep: "Explore next: Job 38:4-7 • Isaiah 40:22 • Psalm 8:3-4."
    },
    {
      match: /(more happiness|happier).*(giving|give).*(receiving|receive)|giving.*receiving|acts 20:35/i,
      title: "Why is there more happiness in giving than receiving?",
      refs: "Acts 20:35 • Proverbs 11:25 • Luke 6:38",
      text: "Jesus' saying recorded at Acts 20:35 points to a deeper kind of happiness that comes from generosity. Receiving can satisfy a need or desire, but giving can create purpose, strengthen love, and let us share in another person's relief or joy.",
      step: "Look for one practical way to give today, whether that means time, attention, encouragement, hospitality, or material help.",
      simple: "Getting something can feel good. Helping someone else can create a deeper and longer-lasting kind of joy.",
      example: "Buying something for yourself may be enjoyable, but helping a struggling family with groceries can stay in your heart because you know your gift made their day easier.",
      deep: "Explore next: 2 Corinthians 9:7 • Hebrews 13:16 • Proverbs 19:17."
    },
    {
      match: /(matthew 5:10|persecuted.*righteous|persecution.*righteous)/i,
      title: "What does Matthew 5:10 mean?",
      refs: "Matthew 5:10-12 • 1 Peter 3:14 • 2 Timothy 3:12",
      text: "Jesus was speaking about people who suffer because they choose what is right in God's eyes. The happiness is not in being mistreated. It comes from knowing that opposition does not cancel God's approval or the hope connected with his Kingdom.",
      step: "When doing the right thing costs you something, ask whether your choice is still guided by truth, love, and a clean conscience rather than by fear of people's reactions.",
      simple: "If people treat you badly because you are trying to do what is right, their treatment does not mean you chose the wrong path.",
      example: "A worker refuses to falsify a report even though coworkers mock him or a supervisor pressures him. The hardship comes because he chose honesty.",
      deep: "Explore next: Matthew 5:44 • Acts 5:41 • Romans 12:17-21."
    },
    {
      match: /(salt of the earth|light of the world|matthew 5:13|matthew 5:14|matthew 5:16)/i,
      title: "What do 'salt of the earth' and 'light of the world' mean?",
      refs: "Matthew 5:13-16 • Philippians 2:15 • Colossians 4:6",
      text: "Jesus used salt and light as memorable pictures. Salt affects what it touches, and light makes things visible. His followers should have a good influence through their conduct and let their fine works point attention toward God rather than toward themselves.",
      step: "Choose one ordinary setting today where kindness, honesty, patience, or courage could make your faith visible without needing a speech.",
      simple: "Live in a way that makes things a little better and helps others see good qualities in action.",
      example: "At work, one calm and honest person can change the tone of a tense situation. That quiet influence is a little like light in a dark room.",
      deep: "Explore next: Ephesians 5:8-10 • 1 Peter 2:12 • Proverbs 4:18."
    },
    {
      match: /(treasures.*earth|store.*treasure|matthew 6:19|moth.*rust)/i,
      title: "What does it mean not to store up treasures on earth?",
      refs: "Matthew 6:19-21 • Luke 12:15 • 1 Timothy 6:17-19",
      text: "Jesus was warning against building our identity and security mainly around possessions that can be lost, damaged, stolen, or left behind. Spiritual values, generosity, faith, and a good relationship with God have a different kind of durability.",
      step: "Ask what currently receives most of your time, worry, and energy. That often reveals where your treasure really is.",
      simple: "Enjoy useful things, but do not make possessions the center of your life or the measure of your worth.",
      example: "A person can own a nice car without letting the car own his priorities. The issue is not having things; it is what has your heart.",
      deep: "Explore next: Matthew 6:24 • Hebrews 13:5 • Proverbs 23:4-5."
    },
    {
      match: /(birds of heaven|lilies of the field|matthew 6:25|matthew 6:26|matthew 6:28|anxious.*clothing)/i,
      title: "What can the birds and lilies teach us about worry?",
      refs: "Matthew 6:25-34 • Luke 12:22-31 • Psalm 55:22",
      text: "Jesus used birds and flowers to redirect attention from endless worry toward trust, perspective, and today's responsibilities. He was not teaching laziness. Birds still search for food. The point is that anxiety cannot create security by itself.",
      step: "Do what is reasonably yours to do today, then refuse to mentally live through every possible problem tomorrow might contain.",
      simple: "Plan and work, but do not let worry pretend that it can control the future.",
      example: "If money is tight, making a budget is useful. Staying awake all night imagining every possible disaster usually is not.",
      deep: "Explore next: Matthew 6:33-34 • Proverbs 3:5-6 • Philippians 4:6-7."
    }
  ];

  const verseNotes = {
    "Matthew 5:3": {title:"Matthew 5:3 — Spiritual need", text:"Jesus describes as happy those who recognize their spiritual need rather than assuming material success or self-reliance answers everything.", refs:"Matthew 5:3 • Matthew 4:4 • Psalm 42:1-2"},
    "Matthew 5:10-12": {title:"Matthew 5:10-12 — Persecuted for righteousness", text:"Jesus distinguishes suffering for doing what is right from ordinary hardship. The passage reassures faithful people that human opposition does not erase God's approval.", refs:"Matthew 5:10-12 • 1 Peter 3:14"},
    "Matthew 5:13-16": {title:"Matthew 5:13-16 — Salt and light", text:"Jesus uses salt and light to describe the positive influence of faithful conduct. Fine works should help others see goodness and give glory to God.", refs:"Matthew 5:13-16 • Philippians 2:15"},
    "Matthew 6:19-21": {title:"Matthew 6:19-21 — Where your treasure is", text:"The passage contrasts temporary material treasures with values and actions that have lasting spiritual worth. What we treasure tends to pull our heart and attention toward it.", refs:"Matthew 6:19-21 • Luke 12:15"},
    "Matthew 6:25-34": {title:"Matthew 6:25-34 — Anxiety and daily needs", text:"Jesus points to birds and flowers to teach trust and perspective. The lesson is not to stop working, but to avoid letting tomorrow's uncertainty consume today's life.", refs:"Matthew 6:25-34 • Philippians 4:6-7"},
    "Acts 20:35": {title:"Acts 20:35 — Happiness in giving", text:"Paul recalls Jesus' teaching that giving produces a special happiness. Generosity can bring purpose, connection, and the joy of improving another person's situation.", refs:"Acts 20:35 • 2 Corinthians 9:7"},
    "Job 26:7": {title:"Job 26:7 — The earth upon nothing", text:"Job poetically describes God as stretching out the northern sky over empty space and suspending the earth upon nothing, a striking image in the book's discussion of creation.", refs:"Job 26:7 • Job 38:4-7"},
    "Philippians 4:6-7": {title:"Philippians 4:6-7 — Prayer and anxiety", text:"The passage encourages believers to bring concerns to God in prayer with thanksgiving, connecting that practice with a peace that guards the heart and mind.", refs:"Philippians 4:6-7 • Psalm 55:22"},
    "Ephesians 4:31-32": {title:"Ephesians 4:31-32 — Kindness and forgiveness", text:"Paul contrasts bitterness and harmful speech with kindness, compassion, and a forgiving spirit.", refs:"Ephesians 4:31-32 • Colossians 3:13"},
    "James 1:19-20": {title:"James 1:19-20 — Slow down anger", text:"James recommends being quick to listen, slow to speak, and slow to anger, because uncontrolled human anger does not produce God's righteousness.", refs:"James 1:19-20 • Proverbs 15:1"},
    "Psalm 34:18": {title:"Psalm 34:18 — Close to the brokenhearted", text:"This psalm presents God as near to people who are brokenhearted and crushed in spirit, making it a frequently comforting passage during grief and distress.", refs:"Psalm 34:18 • Psalm 147:3"},
    "Proverbs 3:5-6": {title:"Proverbs 3:5-6 — Trust and direction", text:"These verses encourage trusting God rather than relying only on one's own understanding, while taking him into account when choosing a path.", refs:"Proverbs 3:5-6 • James 1:5"}
  };

  const topicAnswers = {
    anxiety: {refs:"Matthew 6:25-34 • Philippians 4:6-7 • Psalm 55:22", text:"These passages encourage prayer, reasonable action, and attention to today's responsibilities instead of mentally living inside tomorrow's problems.", step:"Separate what you can control from what you cannot, then choose one useful action you can take today.", simple:"Pray about what worries you, do what you reasonably can today, and do not make tomorrow carry today's weight too.", example:"If you are worried about work next month, prepare what you can now, pray about the uncertainty, and avoid spending every evening replaying possibilities you cannot yet change.", deep:"Explore next: Matthew 6:33-34 • Psalm 37:5 • Proverbs 3:5-6."},
    forgiveness: {refs:"Ephesians 4:31-32 • Colossians 3:13 • Romans 12:17-21", text:"Bible principles encourage releasing revenge while still allowing wisdom, boundaries, and justice where appropriate. Forgiveness does not require pretending harm never happened.", step:"Ask what it would look like to stop feeding resentment while still responding wisely to what happened.", simple:"You can choose not to seek revenge without pretending the hurt was acceptable.", example:"A friend betrayed your confidence. You may forgive while allowing trust to be rebuilt slowly rather than instantly restored.", deep:"Explore next: Matthew 18:21-35 • Proverbs 19:11 • 1 Peter 3:9."},
    decision: {refs:"Proverbs 3:5-6 • Proverbs 15:22 • Luke 14:28", text:"Scripture values prayer, wise counsel, foresight, and good motives. A Bible-based decision helper should identify principles rather than claim God secretly chose an option through software.", step:"Write down your choices. Ask of each: Is it honest, loving, responsible, spiritually healthy, and what are the likely consequences?", simple:"Pray, get wise advice, think ahead, and check your motives and methods against Bible principles.", example:"Two jobs may pay differently. You can also weigh family time, integrity, stress, responsibilities, and spiritual priorities.", deep:"Explore next: James 1:5 • Proverbs 14:15 • Proverbs 22:3."},
    anger: {refs:"James 1:19-20 • Proverbs 15:1 • Ephesians 4:26-27", text:"The Bible distinguishes feeling anger from allowing anger to control speech and conduct. Slowing the reaction can prevent a temporary emotion from producing permanent damage.", step:"Before answering, identify the outcome you actually want, then choose words that move toward it.", simple:"Feeling angry is not the same as obeying your anger. Slow down before speaking or acting.", example:"Someone sends an insulting message. Instead of firing back immediately, wait until your pulse settles and answer only what needs answering.", deep:"Explore next: Proverbs 16:32 • Ecclesiastes 7:9 • Colossians 3:8."},
    grief: {refs:"Psalm 34:18 • John 11:33-36 • Revelation 21:3-4", text:"Bible accounts do not treat grief as weakness. Jesus himself wept. Scripture allows mourning while offering hope that suffering and death are not the final word.", step:"Give grief room. Pray honestly, revisit comforting passages, and talk with people you trust.", simple:"The Bible does not tell grieving people to stop feeling. It offers comfort and hope while they mourn.", example:"An anniversary brings a loss back sharply. Rather than criticizing yourself for still hurting, allow yourself to remember, pray, and seek supportive company.", deep:"Explore next: Psalm 147:3 • 2 Corinthians 1:3-4 • John 5:28-29."},
    family: {refs:"Colossians 3:12-14 • Ephesians 4:2-3 • Proverbs 15:1", text:"Patience, kindness, truthful speech, and forgiveness are recurring Bible principles for family life. Peace is not merely avoiding difficult conversations but handling them constructively.", step:"Choose one conversation where you can lower the temperature without abandoning the truth.", simple:"Be truthful, but make kindness and patience part of how you tell the truth.", example:"During a repeating household disagreement, choose a calm time to discuss one issue instead of unloading every old complaint at once.", deep:"Explore next: Proverbs 17:9 • Romans 12:18 • 1 Corinthians 13:4-7."},
    money: {refs:"Luke 14:28 • Proverbs 21:5 • 1 Timothy 6:6-10", text:"Bible principles support planning, contentment, honest work, and resisting the idea that possessions determine a person's worth.", step:"Separate necessities, obligations, and wants. Build the next decision around reality rather than pressure or appearance.", simple:"Plan carefully, live within reality, and do not let money become the measure of your value.", example:"If you want something expensive while bills are tight, pause and calculate whether it serves a real need or mainly an impulse.", deep:"Explore next: Proverbs 22:7 • Hebrews 13:5 • Matthew 6:19-21."},
    spiritual: {refs:"Matthew 5:3 • Psalm 42:1-2 • James 4:8", text:"Recognizing spiritual need means admitting that material success, intelligence, or independence cannot answer every question about meaning, morality, hope, and our relationship with God.", step:"Make regular room for prayer, Bible reading, reflection, and sincere questions.", simple:"It means knowing you need spiritual guidance, not assuming you already have every important answer.", example:"When facing a setback, ask not only 'How do I fix this?' but also 'What can I learn spiritually and what Bible principles should guide me?'", deep:"Explore next: Matthew 4:4 • Psalm 63:1 • Isaiah 55:1-3."},
    honesty: {refs:"Proverbs 12:22 • Ephesians 4:25 • Luke 16:10", text:"The Bible treats honesty as part of faithfulness, not merely as a tactic for avoiding consequences. Truthfulness builds trust and keeps a person's conscience clear.", step:"If a situation tempts you to hide or distort the truth, ask what a truthful and responsible response would look like.", simple:"Tell the truth and act honestly even when dishonesty would be easier.", example:"A mistake at work could be hidden, but admitting it early may prevent a larger problem and preserve trust.", deep:"Explore next: Proverbs 10:9 • Colossians 3:9 • 2 Corinthians 8:21."},
    friendship: {refs:"Proverbs 17:17 • Proverbs 18:24 • 1 Corinthians 15:33", text:"Scripture values loyal friendship while also warning that close associations influence our thinking and conduct. A good friend is both supportive and good for your character.", step:"Think about whether your closest relationships encourage your best qualities or repeatedly pull you away from them.", simple:"Choose friends who care about you and also help you become a better person.", example:"A true friend can support you during trouble while still telling you when a choice is unwise.", deep:"Explore next: Proverbs 27:6 • Proverbs 27:17 • John 15:13."},
    guilt: {refs:"Psalm 32:5 • 1 John 1:9 • Proverbs 28:13", text:"The Bible does not present healthy guilt as a place to live forever. Acknowledging wrongdoing, seeking forgiveness, making what can be made right, and changing course can turn guilt into repentance and growth.", step:"Identify what can actually be confessed, repaired, or changed instead of repeatedly punishing yourself without taking constructive action.", simple:"Own what was wrong, ask forgiveness, make repairs where possible, and change direction.", example:"If you hurt someone with your words, guilt can move you to apologize and change how you speak rather than simply replaying the mistake.", deep:"Explore next: Psalm 51:10-12 • 2 Corinthians 7:10 • Micah 7:18-19."}
  };

  function chooseTopic(q){
    const s=q.toLowerCase();
    if(/anx|worr|stress|fear|uncertain|control/.test(s)) return "anxiety";
    if(/forgiv|betray|hurt|revenge/.test(s)) return "forgiveness";
    if(/angry|anger|mad|temper/.test(s)) return "anger";
    if(/grief|died|death|loss|miss someone/.test(s)) return "grief";
    if(/family|parent|child|son|daughter|marriage|wife|husband/.test(s)) return "family";
    if(/money|debt|rich|poor|budget|financial/.test(s)) return "money";
    if(/honest|truth|lie|lying|dishonest/.test(s)) return "honesty";
    if(/friend|friendship|association|peer/.test(s)) return "friendship";
    if(/guilt|guilty|regret|ashamed|shame/.test(s)) return "guilt";
    if(/spiritual|meaning|faith|god|prayer/.test(s)) return "spiritual";
    return "decision";
  }

  function findVerseNote(q){
    const lower=q.toLowerCase();
    const key=Object.keys(verseNotes).find(k=>lower.includes(k.toLowerCase()));
    if(!key) return null;
    const v=verseNotes[key];
    return {title:v.title, refs:v.refs, text:v.text, step:"Read the surrounding verses as well so the reference is understood in context.", simple:v.text, example:"Try reading the verse before and after this reference and ask: What problem is being addressed, what principle is being taught, and how could it apply today?", deep:"Open the surrounding chapter and compare related references shown above."};
  }

  function findAnswer(q){
    const verse=findVerseNote(q);
    if(verse) return verse;
    const direct=directAnswers.find(a=>a.match.test(q));
    if(direct) return direct;
    const t=topicAnswers[chooseTopic(q)];
    return {title:"Bible principles for your question", ...t};
  }

  function install(){
    const input=document.getElementById("askInput"), btn=document.getElementById("askBtn"), box=document.getElementById("answerBox");
    if(!input||!btn||!box) return;
    let current=null;
    const title=document.getElementById("answerTitle"), refs=document.getElementById("answerRefs"), text=document.getElementById("answerText"), step=document.getElementById("answerStep");

    const style=document.createElement("style");
    style.textContent=`
      #answerRefs{display:flex;gap:7px;flex-wrap:wrap;align-items:center}
      .nexus-ref{border:1px solid rgba(121,217,255,.38);background:rgba(14,39,67,.9);color:#9fe5ff;border-radius:999px;padding:7px 10px;font:inherit;font-size:.78rem;font-weight:800;cursor:pointer;transition:.18s ease}
      .nexus-ref:hover,.nexus-ref:focus{transform:translateY(-1px);border-color:#79d9ff;background:rgba(28,69,112,.96);outline:none}
      .more-q{border-color:rgba(139,101,239,.44)!important;background:rgba(32,20,67,.78)!important}
    `;
    document.head.appendChild(style);

    function renderRefs(refString){
      refs.innerHTML="";
      String(refString||"").split("•").map(s=>s.trim()).filter(Boolean).forEach(ref=>{
        const b=document.createElement("button");
        b.type="button";
        b.className="nexus-ref";
        b.textContent=ref;
        b.title="Explain "+ref;
        b.onclick=()=>{
          input.value="Explain "+ref;
          show(input.value);
        };
        refs.appendChild(b);
      });
    }

    function show(q){
      if(!q.trim()) return;
      current=findAnswer(q.trim());
      title.textContent=current.title;
      renderRefs(current.refs);
      text.textContent=current.text;
      step.textContent="Practical next step: "+current.step;
      box.classList.add("show");
      box.scrollIntoView({behavior:"smooth",block:"center"});
    }

    btn.onclick=()=>show(input.value);
    input.addEventListener("keydown",e=>{if(e.key==="Enter") show(input.value)});
    document.querySelectorAll(".examples button").forEach(b=>b.onclick=()=>{input.value=b.dataset.q||b.textContent;show(input.value)});

    const simpler=document.getElementById("simplerBtn"), example=document.getElementById("exampleBtn"), deeper=document.getElementById("deeperBtn");
    if(simpler) simpler.onclick=()=>{if(current) text.textContent=current.simple};
    if(example) example.onclick=()=>{if(current) text.textContent=current.example};
    if(deeper) deeper.onclick=()=>{if(current) text.textContent=current.deep};

    const extraQuestions = [
      ["Giving & happiness","Why is there more happiness in giving than receiving?"],
      ["Matthew 5:10","What does Matthew 5:10 mean?"],
      ["Salt & light","What does Jesus mean by salt of the earth and light of the world?"],
      ["Treasures","Why did Jesus say not to store up treasures on earth?"],
      ["Birds & lilies","What can the birds and lilies teach us about worry?"],
      ["Unfair treatment","How should I deal with unfair treatment?"],
      ["Honesty","What does the Bible say about honesty?"],
      ["Friendship","What does the Bible say about choosing friends?"],
      ["Guilt","How can I deal with guilt after making a mistake?"],
      ["Patience","How can the Bible help me become more patient?"],
      ["Loneliness","What does the Bible say when I feel lonely?"],
      ["Suffering","Why does God allow suffering?"],
      ["Work","What Bible principles can help me at work?"],
      ["Faith","How can I strengthen my faith?"],
      ["Difficult people","How did Jesus deal with difficult people?"],
      ["Encouragement","Give me a Bible thought for encouragement."],
      ["Family conflict","What Bible advice can help with family conflict?"],
      ["Hard decision","How can Bible principles help me make a difficult decision?"]
    ];

    const examples=document.querySelector(".examples");
    if(examples){
      extraQuestions.forEach(([label,q])=>{
        const b=document.createElement("button");
        b.type="button";
        b.classList.add("more-q");
        b.textContent=label;
        b.dataset.q=q;
        b.onclick=()=>{input.value=q;show(q)};
        examples.appendChild(b);
      });

      const random=document.createElement("button");
      random.type="button";
      random.classList.add("more-q");
      random.textContent="🎲 Surprise question";
      random.onclick=()=>{
        const pick=extraQuestions[Math.floor(Math.random()*extraQuestions.length)][1];
        input.value=pick;
        show(pick);
      };
      examples.appendChild(random);
    }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true}); else install();
})();
