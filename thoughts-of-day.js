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
  const form = document.getElementById("thought-nova-form");
  const questionInput = document.getElementById("thought-nova-input");
  const explore = document.getElementById("thought-nova-explore");
  const voice = document.getElementById("thought-nova-voice");
  const consoleButton = document.getElementById("thought-nova-console");
  const answer = document.getElementById("thought-nova-response");
  if (!chamber || !line || !buttons || !previous || !next || !thoughts.length) return;

  let current = 0;
  let timer;
  let paused = false;
  let questionActive = false;
  let requestIndex = -1;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function show(index) {
    current = (index + thoughts.length) % thoughts.length;
    line.textContent = thoughts[current];
    questionActive = false;
    if (answer) answer.hidden = true;
  }

  function start() {
    clearInterval(timer);
    if (thoughts.length > 1 && !paused && !questionActive && !reducedMotion.matches && !document.hidden) {
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

  // Use the existing Nova console and its handlers so every AI capability stays in one place.
  const setAnswer = message => {
    if (!answer) return;
    answer.textContent = message;
    answer.hidden = false;
  };

  const waitForNova = async () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const root = document.getElementById("novaGuide");
      const panel = root?.querySelector("#novaPanel");
      const input = root?.querySelector("#novaCommand");
      const send = root?.querySelector("#novaSend");
      const orb = root?.querySelector("#novaOrb");
      if (root && panel && input && send && orb && typeof window.AstralisNovaAsk === "function") {
        return { root, panel, input, send, orb };
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    return null;
  };

  const openConsole = async () => {
    const nova = await waitForNova();
    if (!nova) {
      setAnswer("Nova is unavailable right now. Please try again shortly.");
      return null;
    }
    if (nova.orb.getAttribute("aria-expanded") !== "true") nova.orb.click();
    return nova;
  };

  let submitting = false;
  const sendQuestion = async question => {
    if (submitting) return;
    submitting = true;
    setAnswer("Connecting to Nova…");
    try {
      const nova = await openConsole();
      if (!nova) return;
      questionActive = true;
      requestIndex = current;
      start();
      nova.input.value = question;
      const message = nova.root.querySelector("#novaMessage");
      const initial = message?.textContent;
      const observer = message && new MutationObserver(() => {
        if (requestIndex !== current || !questionActive) return;
        const latest = message.textContent?.trim();
        if (latest && latest !== initial) setAnswer(latest);
      });
      observer?.observe(message, { childList: true, characterData: true, subtree: true });
      setTimeout(() => observer?.disconnect(), 60000);
      nova.send.click();
      if (questionInput) questionInput.value = "";
    } finally {
      submitting = false;
    }
  };

  form?.addEventListener("submit", event => {
    event.preventDefault();
    const question = questionInput?.value.trim();
    if (question) sendQuestion(question);
    else openConsole();
  });
  explore?.addEventListener("click", () => {
    sendQuestion(`Explore this Thought of the Day: "${thoughts[current]}". Share a thoughtful perspective, acknowledge uncertainty, and end with one question we can investigate together.`);
  });
  consoleButton?.addEventListener("click", () => openConsole());
  voice?.addEventListener("click", async () => {
    const nova = await openConsole();
    if (!nova) return;
    if (window.AstralisNovaCapabilities?.startListening) {
      window.AstralisNovaCapabilities.startListening();
    } else {
      nova.root.querySelector("#novaMic")?.click();
    }
  });

  show(0);
  start();
})();
