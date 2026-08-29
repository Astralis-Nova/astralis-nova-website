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
      deep: "Explore next: Exodus 24:9-11, Genesis 32:30, Judges 13:21-22, John 6:46, and compare how each passage describes what was seen."
    },
    {
      match: /(what.*spiritual need|spiritual need.*mean|conscious.*spiritual need)/i,
      title: "What does being conscious of spiritual need mean?",
      refs: "Matthew 5:3 • Psalm 42:1-2 • Matthew 4:4",
      text: "It means recognizing that material things and human ability do not satisfy every need. A person who is conscious of spiritual need actively seeks God's guidance, truth, meaning, and a relationship with him.",
      step: "Consider what regular habits could feed that need, such as prayer, Bible reading, reflection, and asking sincere questions.",
      simple: "It means knowing that you need spiritual guidance and not assuming you already have every important answer.",
      example: "Someone facing a difficult choice asks not only, 'What works for me?' but also, 'What Bible principles should guide this decision?'",
      deep: "Explore next: Psalm 63:1, Isaiah 55:1-3, James 4:8."
    },
    {
      match: /(earth.*(nothing|space)|hang.*earth|suspend.*earth|job 26:7)/i,
      title: "What does the Bible say about the earth in space?",
      refs: "Job 26:7 • Isaiah 40:22 • Psalm 19:1",
      text: "Job 26:7 poetically describes God as suspending the earth 'upon nothing.' It is one of the Bible's striking cosmic images and is worth reading in its larger poetic context.",
      step: "Read Job 26 as a whole, then compare the imagery with other passages about the heavens and creation.",
      simple: "Job describes the earth as hanging on nothing rather than resting on a physical support.",
      example: "The verse can open a discussion about the way ancient biblical poetry described the created world and how readers compare that imagery with later scientific knowledge.",
      deep: "Explore next: Job 38:4-7, Isaiah 40:22, Psalm 8:3-4."
    }
  ];

  const topicAnswers = {
    anxiety: {refs:"Matthew 6:25-34 • Philippians 4:6-7 • Psalm 55:22", text:"These passages encourage prayer, reasonable action, and attention to today's responsibilities instead of mentally living inside tomorrow's problems.", step:"Separate what you can control from what you cannot, then choose one useful action you can take today.", simple:"Pray about what worries you, do what you reasonably can today, and do not make tomorrow carry today's weight too.", example:"If you are worried about work next month, prepare what you can now, pray about the uncertainty, and avoid spending every evening replaying possibilities you cannot yet change.", deep:"Explore next: Matthew 6:33-34 • Psalm 37:5 • Proverbs 3:5-6."},
    forgiveness: {refs:"Ephesians 4:31-32 • Colossians 3:13 • Romans 12:17-21", text:"Bible principles encourage releasing revenge while still allowing wisdom, boundaries, and justice where appropriate. Forgiveness does not require pretending harm never happened.", step:"Ask what it would look like to stop feeding resentment while still responding wisely to what happened.", simple:"You can choose not to seek revenge without pretending the hurt was acceptable.", example:"A friend betrayed your confidence. You may forgive while allowing trust to be rebuilt slowly rather than instantly restored.", deep:"Explore next: Matthew 18:21-35 • Proverbs 19:11 • 1 Peter 3:9."},
    decision: {refs:"Proverbs 3:5-6 • Proverbs 15:22 • Luke 14:28", text:"Scripture values prayer, wise counsel, foresight, and good motives. A Bible-based decision helper should identify principles rather than claim God secretly chose an option through software.", step:"Write down your choices. Ask of each: Is it honest, loving, responsible, spiritually healthy, and what are the likely consequences?", simple:"Pray, get wise advice, think ahead, and check your motives and methods against Bible principles.", example:"Two jobs may pay differently. You can also weigh family time, integrity, stress, responsibilities, and spiritual priorities.", deep:"Explore next: James 1:5 • Proverbs 14:15 • Proverbs 22:3."},
    anger: {refs:"James 1:19-20 • Proverbs 15:1 • Ephesians 4:26-27", text:"The Bible distinguishes feeling anger from allowing anger to control speech and conduct. Slowing the reaction can prevent a temporary emotion from producing permanent damage.", step:"Before answering, identify the outcome you actually want, then choose words that move toward it.", simple:"Feeling angry is not the same as obeying your anger. Slow down before speaking or acting.", example:"Someone sends an insulting message. Instead of firing back immediately, wait until your pulse settles and answer only what needs answering.", deep:"Explore next: Proverbs 16:32 • Ecclesiastes 7:9 • Colossians 3:8."},
    grief: {refs:"Psalm 34:18 • John 11:33-36 • Revelation 21:3-4", text:"Bible accounts do not treat grief as weakness. Jesus himself wept. Scripture allows mourning while offering hope that suffering and death are not the final word.", step:"Give grief room. Pray honestly, revisit comforting passages, and talk with people you trust.", simple:"The Bible does not tell grieving people to stop feeling. It offers comfort and hope while they mourn.", example:"An anniversary brings a loss back sharply. Rather than criticizing yourself for still hurting, allow yourself to remember, pray, and seek supportive company.", deep:"Explore next: Psalm 147:3 • 2 Corinthians 1:3-4 • John 5:28-29."},
    family: {refs:"Colossians 3:12-14 • Ephesians 4:2-3 • Proverbs 15:1", text:"Patience, kindness, truthful speech, and forgiveness are recurring Bible principles for family life. Peace is not merely avoiding difficult conversations but handling them constructively.", step:"Choose one conversation where you can lower the temperature without abandoning the truth.", simple:"Be truthful, but make kindness and patience part of how you tell the truth.", example:"During a repeating household disagreement, choose a calm time to discuss one issue instead of unloading every old complaint at once.", deep:"Explore next: Proverbs 17:9 • Romans 12:18 • 1 Corinthians 13:4-7."},
    money: {refs:"Luke 14:28 • Proverbs 21:5 • 1 Timothy 6:6-10", text:"Bible principles support planning, contentment, honest work, and resisting the idea that possessions determine a person's worth.", step:"Separate necessities, obligations, and wants. Build the next decision around reality rather than pressure or appearance.", simple:"Plan carefully, live within reality, and do not let money become the measure of your value.", example:"If you want something expensive while bills are tight, pause and calculate whether it serves a real need or mainly an impulse.", deep:"Explore next: Proverbs 22:7 • Hebrews 13:5 • Matthew 6:19-21."},
    spiritual: {refs:"Matthew 5:3 • Psalm 42:1-2 • James 4:8", text:"Recognizing spiritual need means admitting that material success, intelligence, or independence cannot answer every question about meaning, morality, hope, and our relationship with God.", step:"Make regular room for prayer, Bible reading, reflection, and sincere questions.", simple:"It means knowing you need spiritual guidance, not assuming you already have every important answer.", example:"When facing a setback, ask not only 'How do I fix this?' but also 'What can I learn spiritually and what Bible principles should guide me?'", deep:"Explore next: Matthew 4:4 • Psalm 63:1 • Isaiah 55:1-3."}
  };

  function chooseTopic(q){
    const s=q.toLowerCase();
    if(/anx|worr|stress|fear|uncertain|control/.test(s)) return "anxiety";
    if(/forgiv|betray|hurt|revenge|friend/.test(s)) return "forgiveness";
    if(/angry|anger|mad|temper/.test(s)) return "anger";
    if(/grief|died|death|loss|miss someone/.test(s)) return "grief";
    if(/family|parent|child|son|daughter|marriage|wife|husband/.test(s)) return "family";
    if(/money|debt|rich|poor|budget|financial/.test(s)) return "money";
    if(/spiritual|meaning|faith|god|prayer/.test(s)) return "spiritual";
    return "decision";
  }

  function findAnswer(q){
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
    function show(q){
      if(!q.trim()) return;
      current=findAnswer(q.trim());
      title.textContent=current.title;
      refs.textContent=current.refs;
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

    const quick=document.createElement("button");
    quick.type="button"; quick.textContent="Can a human see God?"; quick.dataset.q="Can a human see God?";
    const examples=document.querySelector(".examples");
    if(examples){ examples.appendChild(quick); quick.onclick=()=>{input.value=quick.dataset.q;show(input.value)}; }
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",install,{once:true}); else install();
})();
