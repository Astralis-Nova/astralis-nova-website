(() => {
  "use strict";

  const card = document.querySelector("#cosmic-culture .chuckle-card");
  const inner = card?.querySelector(".culture-inner");
  if (!card || !inner || document.getElementById("cosmicJokeCarousel")) return;

  const jokes = [
    {
      icon: "🚀",
      setup: "Why was the starship late?",
      punchline: "It took the scenic wormhole.",
      category: "Explorer-class excuse"
    },
    {
      icon: "👽",
      setup: "What is an alien’s favorite computer key?",
      punchline: "The space bar.",
      category: "Interstellar technology"
    },
    {
      icon: "🌕",
      setup: "Why did the moon skip dinner?",
      punchline: "It was already full.",
      category: "Lunar dining report"
    },
    {
      icon: "🤖",
      setup: "Why did the robot join the band?",
      punchline: "It had excellent byte rhythm.",
      category: "Synthetic groove"
    },
    {
      icon: "🪐",
      setup: "What did one lonely planet say to the other?",
      punchline: "You give my universe a little more gravity.",
      category: "Planetary friendship"
    },
    {
      icon: "☄️",
      setup: "How does a comet organize its schedule?",
      punchline: "It leaves a long trail of reminders.",
      category: "Cosmic productivity"
    },
    {
      icon: "🛰️",
      setup: "Why did the satellite break up with the telescope?",
      punchline: "It needed more space.",
      category: "Orbital relationship news"
    },
    {
      icon: "🕳️",
      setup: "Why was the black hole terrible at keeping secrets?",
      punchline: "Everything eventually got pulled in.",
      category: "Deep-space gossip"
    },
    {
      icon: "🎵",
      setup: "Why did the musician move to Mars?",
      punchline: "Earth audiences kept asking for more space.",
      category: "Astralis Nova tour planning"
    },
    {
      icon: "✏️",
      setup: "Why did the astronaut bring a pencil into orbit?",
      punchline: "To draw a better trajectory.",
      category: "Mission-control geometry"
    }
  ];

  const style = document.createElement("style");
  style.id = "cosmicJokeCarouselStyles";
  style.textContent = `
    .chuckle-card .chuckle-image.cosmic-joke-fallback-hidden{display:none!important}
    .cosmic-joke-carousel{position:relative;margin-top:16px}
    .cosmic-joke-stage{
      min-height:260px;display:grid;grid-template-columns:92px 1fr;gap:22px;
      align-items:center;padding:24px;border:1px solid rgba(137,171,221,.42);
      border-radius:16px;background:
        radial-gradient(circle at 14% 20%,rgba(71,175,255,.16),transparent 16rem),
        radial-gradient(circle at 88% 84%,rgba(175,91,255,.14),transparent 18rem),
        linear-gradient(145deg,rgba(3,11,23,.82),rgba(8,20,38,.72));
      box-shadow:0 18px 46px rgba(0,0,0,.28),inset 0 0 38px rgba(88,140,255,.05);
      transition:opacity .22s ease,transform .22s ease
    }
    .cosmic-joke-stage.is-changing{opacity:.18;transform:translateY(5px) scale(.99)}
    .cosmic-joke-icon{
      width:82px;height:82px;display:grid;place-items:center;border-radius:50%;font-size:3.25rem;
      background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.18),rgba(60,116,221,.12) 45%,rgba(5,13,26,.62));
      border:1px solid rgba(129,194,255,.42);box-shadow:0 0 28px rgba(76,158,255,.16)
    }
    .cosmic-joke-copy{min-width:0}
    .cosmic-joke-setup{margin:0;color:#f4f8ff;font-size:clamp(1.2rem,2.5vw,1.75rem);font-weight:850;line-height:1.32}
    .cosmic-joke-punchline{margin:12px 0 0;color:#91dcff;font-size:clamp(1.05rem,2vw,1.4rem);font-weight:800;line-height:1.4}
    .cosmic-joke-meta{margin-top:17px;color:#89a0bb;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase}
    .cosmic-joke-controls{display:flex;align-items:center;gap:9px;margin-top:14px;flex-wrap:wrap}
    .cosmic-joke-button{
      min-width:42px;min-height:38px;padding:7px 12px;border:1px solid rgba(112,145,199,.54);
      border-radius:10px;background:rgba(6,17,31,.82);color:#edf5ff;font:inherit;font-weight:800;cursor:pointer
    }
    .cosmic-joke-button:hover,.cosmic-joke-button:focus-visible{border-color:#70b9ff;background:rgba(31,103,184,.2);outline:none}
    .cosmic-joke-progress{display:flex;gap:6px;margin-left:auto}
    .cosmic-joke-dot{width:7px;height:7px;border:0;border-radius:50%;padding:0;background:#50647d;cursor:pointer}
    .cosmic-joke-dot.active{background:#77d9ff;box-shadow:0 0 10px rgba(91,205,255,.8)}
    .cosmic-joke-status{color:#8ea3bd;font-size:.74rem}
    @media(max-width:620px){
      .cosmic-joke-stage{grid-template-columns:1fr;min-height:300px;text-align:center;padding:21px}
      .cosmic-joke-icon{margin:auto;width:72px;height:72px;font-size:2.75rem}
      .cosmic-joke-controls{justify-content:center}
      .cosmic-joke-progress{width:100%;margin:4px 0 0;justify-content:center}
    }
    @media(prefers-reduced-motion:reduce){.cosmic-joke-stage{transition:none}}
  `;
  document.head.appendChild(style);

  const fallbackImage = inner.querySelector(".chuckle-image");
  fallbackImage?.classList.add("cosmic-joke-fallback-hidden");

  const carousel = document.createElement("div");
  carousel.id = "cosmicJokeCarousel";
  carousel.className = "cosmic-joke-carousel";
  carousel.innerHTML = `
    <div class="cosmic-joke-stage" aria-live="polite" aria-atomic="true">
      <div class="cosmic-joke-icon" aria-hidden="true"></div>
      <div class="cosmic-joke-copy">
        <p class="cosmic-joke-setup"></p>
        <p class="cosmic-joke-punchline"></p>
        <div class="cosmic-joke-meta"></div>
      </div>
    </div>
    <div class="cosmic-joke-controls" aria-label="Cosmic joke controls">
      <button class="cosmic-joke-button cosmic-joke-previous" type="button" aria-label="Previous joke">←</button>
      <button class="cosmic-joke-button cosmic-joke-pause" type="button" aria-label="Pause rotating jokes">Pause</button>
      <button class="cosmic-joke-button cosmic-joke-next" type="button" aria-label="Next joke">→</button>
      <span class="cosmic-joke-status" aria-live="polite"></span>
      <div class="cosmic-joke-progress" aria-label="Choose a joke"></div>
    </div>
  `;

  const tag = inner.querySelector(".chuckle-tag");
  if (tag) inner.insertBefore(carousel, tag);
  else inner.appendChild(carousel);
  if (tag) tag.textContent = "😄 Rotating laugh transmission";

  const stage = carousel.querySelector(".cosmic-joke-stage");
  const icon = carousel.querySelector(".cosmic-joke-icon");
  const setup = carousel.querySelector(".cosmic-joke-setup");
  const punchline = carousel.querySelector(".cosmic-joke-punchline");
  const meta = carousel.querySelector(".cosmic-joke-meta");
  const status = carousel.querySelector(".cosmic-joke-status");
  const progress = carousel.querySelector(".cosmic-joke-progress");
  const previous = carousel.querySelector(".cosmic-joke-previous");
  const next = carousel.querySelector(".cosmic-joke-next");
  const pause = carousel.querySelector(".cosmic-joke-pause");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const today = new Date();
  const dailySeed = Number(`${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`);
  let index = dailySeed % jokes.length;
  let timer = null;
  let manuallyPaused = reducedMotion;
  let interactionPaused = false;
  let pageHidden = document.hidden;

  jokes.forEach((_, dotIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "cosmic-joke-dot";
    dot.setAttribute("aria-label", `Show joke ${dotIndex + 1}`);
    dot.addEventListener("click", () => {
      index = dotIndex;
      render(true);
      restart();
    });
    progress.appendChild(dot);
  });

  function render(animate = false) {
    const joke = jokes[index];
    const apply = () => {
      icon.textContent = joke.icon;
      setup.textContent = joke.setup;
      punchline.textContent = joke.punchline;
      meta.textContent = `${joke.category} · Transmission ${index + 1} of ${jokes.length}`;
      [...progress.children].forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
      stage.classList.remove("is-changing");
    };

    if (animate && !reducedMotion) {
      stage.classList.add("is-changing");
      window.setTimeout(apply, 190);
    } else apply();
  }

  function move(amount) {
    index = (index + amount + jokes.length) % jokes.length;
    render(true);
  }

  function shouldRun() {
    return !manuallyPaused && !interactionPaused && !pageHidden && !reducedMotion;
  }

  function syncStatus() {
    const pausedNow = !shouldRun();
    pause.textContent = manuallyPaused ? "Resume" : "Pause";
    pause.setAttribute("aria-label", manuallyPaused ? "Resume rotating jokes" : "Pause rotating jokes");
    status.textContent = reducedMotion
      ? "Automatic rotation disabled by motion preference"
      : pausedNow
        ? "Rotation paused"
        : "Next transmission in 14 seconds";
  }

  function stop() {
    window.clearInterval(timer);
    timer = null;
  }

  function start() {
    stop();
    if (shouldRun()) timer = window.setInterval(() => move(1), 14000);
    syncStatus();
  }

  function restart() {
    start();
  }

  previous.addEventListener("click", () => {
    move(-1);
    restart();
  });

  next.addEventListener("click", () => {
    move(1);
    restart();
  });

  pause.addEventListener("click", () => {
    manuallyPaused = !manuallyPaused;
    start();
  });

  card.addEventListener("pointerenter", () => {
    interactionPaused = true;
    start();
  });

  card.addEventListener("pointerleave", () => {
    interactionPaused = false;
    start();
  });

  card.addEventListener("focusin", () => {
    interactionPaused = true;
    start();
  });

  card.addEventListener("focusout", event => {
    if (!card.contains(event.relatedTarget)) {
      interactionPaused = false;
      start();
    }
  });

  document.addEventListener("visibilitychange", () => {
    pageHidden = document.hidden;
    start();
  });

  render(false);
  start();
})();