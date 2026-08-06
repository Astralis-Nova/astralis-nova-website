(() => {
  "use strict";

  function installStyles() {
    if (document.getElementById("astralisWorldStyles")) return;
    const style = document.createElement("style");
    style.id = "astralisWorldStyles";
    style.textContent = `
      .astralis-worlds{position:relative;overflow:hidden;padding:26px;background:radial-gradient(circle at 50% 48%,rgba(34,109,220,.18),transparent 25rem),linear-gradient(180deg,rgba(7,17,31,.88),rgba(4,9,18,.92));border:1px solid rgba(93,146,214,.46);border-radius:18px;box-shadow:0 20px 65px rgba(0,0,0,.34)}
      .astralis-worlds::before{content:"✦  ·  ✧  ·  ✦  ·  ✧  ·  ✦";position:absolute;top:17px;right:20px;color:rgba(143,203,255,.42);letter-spacing:.34em;font-size:.75rem}
      .astralis-worlds-head{max-width:760px;margin-bottom:22px}.astralis-worlds-head h2{margin:0 0 8px;font-size:clamp(1.75rem,3.5vw,2.6rem)}.astralis-worlds-head p{margin:0;color:#bac8dc;line-height:1.65}
      .astralis-system{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;align-items:stretch}
      .astralis-sun-card{grid-column:span 3;display:flex;align-items:center;justify-content:center;gap:20px;min-height:150px;padding:20px;border:1px solid rgba(255,192,87,.34);border-radius:18px;background:radial-gradient(circle at 50% 50%,rgba(255,173,61,.18),transparent 48%),rgba(4,10,20,.58)}
      .astralis-sun{flex:0 0 92px;width:92px;height:92px;border-radius:50%;background:radial-gradient(circle at 38% 34%,#fff6c7 0 7%,#ffd66e 17%,#ff8b39 48%,#c52c67 74%,#471353 100%);box-shadow:0 0 18px rgba(255,221,113,.9),0 0 45px rgba(255,109,59,.58)}
      .astralis-sun-copy strong{display:block;font-size:1.2rem}.astralis-sun-copy span{display:block;color:#c7d1e0;margin-top:4px;line-height:1.5}
      .astralis-planet-link{position:relative;display:flex;align-items:center;gap:15px;min-height:132px;padding:17px;border-radius:18px;border:1px solid rgba(90,136,198,.42);background:linear-gradient(145deg,rgba(12,25,44,.92),rgba(7,12,25,.92));text-decoration:none;overflow:hidden;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}
      .astralis-planet-link:hover,.astralis-planet-link:focus-visible{transform:translateY(-4px);border-color:#74c7ff;box-shadow:0 17px 38px rgba(0,0,0,.35),0 0 26px rgba(68,159,255,.19)}
      .astralis-planet{position:relative;flex:0 0 72px;width:72px;height:72px;border-radius:50%;box-shadow:inset -13px -13px 18px rgba(0,0,0,.36),0 0 18px rgba(94,168,255,.25)}
      .astralis-planet.ringed::after{content:"";position:absolute;left:-14px;top:27px;width:96px;height:22px;border:4px solid rgba(219,226,255,.72);border-left-color:rgba(87,155,255,.35);border-right-color:rgba(255,151,210,.62);border-radius:50%;transform:rotate(-14deg)}
      .planet-conquest{background:radial-gradient(circle at 34% 27%,#d9efff 0 4%,#5489cf 12%,#203c82 45%,#171743 77%,#09091c 100%)}
      .planet-ace{background:radial-gradient(circle at 34% 30%,#fbfbf1 0 4%,#c7a65b 13%,#745232 45%,#2a1d28 76%,#0a0810 100%)}
      .planet-faith-den{background:radial-gradient(circle at 35% 28%,#fff3b5 0 5%,#e9a13b 17%,#9a4d25 47%,#402117 76%,#0b0807 100%);box-shadow:inset -13px -13px 18px rgba(0,0,0,.42),0 0 22px rgba(255,180,74,.34)}
      .planet-biography{background:radial-gradient(circle at 35% 28%,#ffe4fa 0 5%,#e75ebd 17%,#7843c8 47%,#25205f 76%,#09091b 100%)}
      .planet-orbit{background:radial-gradient(circle at 37% 28%,#fff2c6 0 4%,#f1a85f 17%,#8c4d45 46%,#3b274a 75%,#0b0912 100%)}
      .planet-guestbook{background:radial-gradient(circle at 35% 30%,#e8f5ff 0 5%,#80bce7 17%,#3a6091 47%,#202747 75%,#090a16 100%)}
      .astralis-planet-copy{min-width:0}.astralis-planet-copy strong{display:block;font-size:1rem;color:#fff}.astralis-planet-copy span{display:block;margin-top:5px;color:#b9c7da;font-size:.83rem;line-height:1.45}
      .astralis-world-badge{display:inline-flex!important;width:max-content;margin-top:8px!important;padding:4px 8px;border:1px solid rgba(124,190,255,.35);border-radius:999px;color:#9dd6ff!important;font-size:.68rem!important;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
      @media(max-width:980px){.astralis-system{grid-template-columns:repeat(2,minmax(0,1fr))}.astralis-sun-card{grid-column:span 2}}
      @media(max-width:640px){.astralis-worlds{padding:20px}.astralis-system{grid-template-columns:1fr}.astralis-sun-card{grid-column:span 1;align-items:flex-start;justify-content:flex-start}.astralis-worlds::before{display:none}}
    `;
    document.head.appendChild(style);
  }

  function addConnectedWorlds() {
    document.getElementById("connected-worlds")?.remove();
    const guestbook = document.getElementById("guestbook");
    if (!guestbook) return;
    const section = document.createElement("section");
    section.className = "section-shell shell";
    section.id = "connected-worlds";
    section.innerHTML = `
      <div class="astralis-worlds"><div class="astralis-worlds-head"><p class="eyebrow">CONNECTED WORLDS</p><h2>Choose a Planet</h2><p>A small solar system of music, memories, games, communities, and creative places orbiting Astralis Nova.</p></div>
      <div class="astralis-system">
        <div class="astralis-sun-card"><span class="astralis-sun" aria-hidden="true"></span><span class="astralis-sun-copy"><strong>Astralis Nova</strong><span>The central star. Music, memory, Arizona night skies, old-web spirit, and every strange little world connected to them.</span></span></div>
        <a class="astralis-planet-link" href="/conquest.html"><span class="astralis-planet planet-conquest ringed" aria-hidden="true"></span><span class="astralis-planet-copy"><strong>Conquest</strong><span>Asheron’s Call ACE server information, Discord, connection address, and live-status links.</span><span class="astralis-world-badge">Game World</span></span></a>
        <a class="astralis-planet-link" href="https://emulator.ac/" target="_blank" rel="noopener noreferrer"><span class="astralis-planet planet-ace" aria-hidden="true"></span><span class="astralis-planet-copy"><strong>ACEmulator Forge</strong><span>The open-source engine and community rebuilding the world of Dereth.</span><span class="astralis-world-badge">External Portal</span></span></a>
        <a id="danielFaithWorld" class="astralis-planet-link daniel-faith-link" href="/lion-den-faith.html"><span class="astralis-planet planet-faith-den ringed" aria-hidden="true"></span><span class="astralis-planet-copy"><strong>Daniel and the Lions’ Den</strong><span>Enter a story of faith, courage, integrity, prayer, and deliverance.</span><span class="astralis-world-badge">Inspirational Story</span></span></a>
        <a class="astralis-planet-link" href="/biography.html"><span class="astralis-planet planet-biography" aria-hidden="true"></span><span class="astralis-planet-copy"><strong>Biography Moon</strong><span>The life, memories, technology, family, and imagination behind Astralis Nova.</span><span class="astralis-world-badge">Story World</span></span></a>
        <a class="astralis-planet-link" href="#first-orbit"><span class="astralis-planet planet-orbit ringed" aria-hidden="true"></span><span class="astralis-planet-copy"><strong>First Orbit</strong><span>Archived pages and MIDI relics preserved from Ramon’s earliest corner of the web.</span><span class="astralis-world-badge">Archive World</span></span></a>
        <a class="astralis-planet-link" href="#guestbook"><span class="astralis-planet planet-guestbook" aria-hidden="true"></span><span class="astralis-planet-copy"><strong>Guestbook Moon</strong><span>Sign your name, choose a favorite song, and leave a signal among the stars.</span><span class="astralis-world-badge">Visitor World</span></span></a>
      </div></div>`;
    guestbook.parentNode.insertBefore(section, guestbook);
  }

  installStyles();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addConnectedWorlds, {once:true});
  else addConnectedWorlds();
})();