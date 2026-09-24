(() => {
  "use strict";

  // Add future thoughts to this list; the chamber rotates when there are two or more.
  const thoughts = [
    "We may learn to give a living mind a new body before we learn whether a mind can leave its original one."
  ];

  const chamber = document.getElementById("thought-of-the-day");
  const line = document.getElementById("thought-line");
  const buttons = document.getElementById("thought-buttons");
  const previous = document.getElementById("thought-previous");
  const next = document.getElementById("thought-next");
  if (!chamber || !line || !buttons || !previous || !next || !thoughts.length) return;

  let current = 0;
  let timer;
  let paused = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function show(index) {
    current = (index + thoughts.length) % thoughts.length;
    line.textContent = thoughts[current];
  }

  function start() {
    clearInterval(timer);
    if (thoughts.length > 1 && !paused && !reducedMotion.matches && !document.hidden) {
      timer = setInterval(() => show(current + 1), 45000);
    }
  }

  if (thoughts.length > 1) {
    buttons.hidden = false;
    previous.addEventListener("click", () => { show(current - 1); start(); });
    next.addEventListener("click", () => { show(current + 1); start(); });
    chamber.addEventListener("mouseenter", () => { paused = true; start(); });
    chamber.addEventListener("mouseleave", () => { paused = false; start(); });
    chamber.addEventListener("focusin", () => { paused = true; start(); });
    chamber.addEventListener("focusout", event => {
      if (!chamber.contains(event.relatedTarget)) { paused = false; start(); }
    });
    document.addEventListener("visibilitychange", start);
    reducedMotion.addEventListener("change", start);
  }

  show(0);
  start();
})();
