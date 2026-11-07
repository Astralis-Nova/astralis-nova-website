const passages={home:{ref:'John 14:2–3',quote:'“In my Father’s house are many mansions … I go to prepare a place for you.”',text:'Jesus offers his disciples reassurance as they face separation. We imagine those many dwelling places as a welcome, held in the hope of being with him.'},tears:{ref:'John 11:33–36',quote:'“Jesus wept.”',text:'Before raising Lazarus, Jesus shares in the sorrow around him. This reflection holds grief and hope together. Love gives us room to mourn.'},hope:{ref:'Revelation 21:4–5',quote:'“And God shall wipe away all tears from their eyes … Behold, I make all things new.”',text:'Revelation describes a vision of renewed creation and the end of death and sorrow. The river and light of this imagined world give shape to that hope.'}};const buttons=document.querySelectorAll('[data-passage]');function showPassage(key){const p=passages[key];document.getElementById('reference').textContent=p.ref+' · King James Version';document.getElementById('quote').textContent=p.quote;document.getElementById('reflection').textContent=p.text;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.passage===key)));}buttons.forEach(b=>b.addEventListener('click',()=>showPassage(b.dataset.passage)));showPassage('home');const sky=document.querySelector('.particles');for(let i=0;i<28;i++){const star=document.createElement('i');star.style.left=(i*37%100)+'%';star.style.top=(i*53%100)+'%';star.style.animationDelay=-(i%8)+'s';sky.append(star);}
const lazarusScene = document.getElementById('lazarusScene');
const replayLazarus = document.getElementById('replayLazarus');
const lazarusCaption = document.getElementById('lazarusCaption');
let sceneFrame;
function awakenLazarus() {
  lazarusScene.classList.add('is-awake');
}
if ('IntersectionObserver' in window) {
  const sceneObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      awakenLazarus();
      sceneObserver.disconnect();
    }
  }, {threshold: 0.3});
  sceneObserver.observe(lazarusScene);
} else {
  awakenLazarus();
}
replayLazarus.addEventListener('click', () => {
  cancelAnimationFrame(sceneFrame);
  lazarusScene.classList.remove('is-awake');
  lazarusCaption.textContent = '“Lazarus, come forth.” — John 11:43 (KJV)';
  void lazarusScene.getBoundingClientRect();
  sceneFrame = requestAnimationFrame(() => requestAnimationFrame(awakenLazarus));
});
