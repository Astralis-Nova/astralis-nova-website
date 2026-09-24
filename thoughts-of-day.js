(() => {
  "use strict";

  // The chamber rotates through these thoughts when there are two or more.
  const thoughts = [
    "We may learn to give a living mind a new body before we learn whether a mind can leave its original one.",
    "If you could preserve one ordinary day of your life for someone 100 years from now, which day would you choose?",
    "When does repairing an old thing become more meaningful than replacing it?",
    "Could an AI understand a memory without ever having lived one?",
    "If a star's light reaches us long after the star has changed, what does it mean to see something as it is?",
    "What have you learned from an animal that no person taught you?",
    "Is curiosity a kind of faith—that the answer is worth looking for?",
    "If you rebuilt a lost world exactly, would it still be the same world?",
    "Which invention do we use every day without appreciating its true importance?",
    "Can a place hold a memory, or do we carry the memory into the place?",
    "What would you build if it only had to help one person?",
    "If you could ask your future self one question, what would you risk hearing?",
    "Does understanding how something works make it less mysterious—or more?",
    "What's a belief you changed because you investigated it yourself?",
    "If humanity found life on another planet, what should our first message say?",
    "Which small act from your past might have changed someone else's life without you knowing?",
    "What is worth making sturdy enough to outlive you?",
    "Could two people look at the same evidence and both be honestly searching for truth?",
    "If you had one quiet hour with no tasks waiting, where would your mind go?"
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
