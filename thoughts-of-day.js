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
  const novaToggle = document.getElementById("thought-nova-toggle");
  const miniPanel = document.getElementById("thought-nova-panel");
  const closeButton = document.getElementById("thought-nova-close");
  const form = document.getElementById("thought-nova-form");
  const questionInput = document.getElementById("thought-nova-input");
  const explore = document.getElementById("thought-nova-explore");
  const voice = document.getElementById("thought-nova-voice");
  const memoryHotspot = document.getElementById("thought-memory-hotspot");
  const accessLock = document.getElementById("thought-access-lock");
  const accessClose = document.getElementById("thought-access-close");
  const accessStatus = document.getElementById("thought-access-status");
  const accessForm = document.getElementById("thought-access-form");
  const accessInput = document.getElementById("thought-access-input");
  const accessMic = document.getElementById("thought-access-mic");
  const answer = document.getElementById("thought-nova-response");
  const host = document.getElementById("thought-nova-host");
  const stemFace = document.getElementById("thought-nova-face");
  if (!chamber || !line || !novaToggle || !miniPanel || !thoughts.length) return;

  let current = 0;
  let timer;
  let questionActive = false;
  let requestIndex = -1;
  const rotationMs = 3 * 60 * 1000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function show(index) {
    current = (index + thoughts.length) % thoughts.length;
    line.textContent = thoughts[current];
    questionActive = false;
    if (answer) answer.hidden = true;
  }

  function showRandomThought() {
    if (thoughts.length < 2) return;
    const offset = 1 + Math.floor(Math.random() * (thoughts.length - 1));
    show((current + offset) % thoughts.length);
  }

  function start() {
    clearInterval(timer);
    if (thoughts.length > 1 && miniPanel.hidden && !questionActive && !document.hidden) {
      timer = setInterval(showRandomThought, rotationMs);
    }
  }

  const setPanelOpen = open => {
    miniPanel.hidden = !open;
    novaToggle.setAttribute("aria-expanded", String(open));
    novaToggle.setAttribute("aria-label", open ? "Close the Nova AI thought interface" : "Open the Nova AI thought interface");
    if (open) {
      clearInterval(timer);
      window.setTimeout(() => questionInput?.focus(), 0);
    } else {
      questionActive = false;
      start();
      novaToggle.focus();
    }
  };

  novaToggle.addEventListener("click", () => setPanelOpen(miniPanel.hidden));
  closeButton?.addEventListener("click", () => setPanelOpen(false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !miniPanel.hidden) setPanelOpen(false);
  });
  document.addEventListener("visibilitychange", start);

  // Use the existing Nova console and its handlers so every AI capability stays in one place.
  const setAnswer = message => {
    if (!answer) return;
    answer.textContent = message;
    answer.hidden = false;
  };

  let faceObserver;
  const mirrorNovaFace = sourceFace => {
    if (!stemFace || !sourceFace) return;
    stemFace.textContent = sourceFace.textContent || "😁";
    if (faceObserver) return;
    faceObserver = new MutationObserver(() => {
      stemFace.textContent = sourceFace.textContent || "😁";
    });
    faceObserver.observe(sourceFace, { childList: true, characterData: true, subtree: true });
  };

  const waitForNova = async () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const root = document.getElementById("novaGuide");
      const panel = root?.querySelector("#novaPanel");
      const input = root?.querySelector("#novaCommand");
      const send = root?.querySelector("#novaSend");
      const orb = root?.querySelector("#novaOrb");
      mirrorNovaFace(root?.querySelector("#novaFace"));
      if (root && panel && input && send && orb && typeof window.AstralisNovaAsk === "function") {
        if (host && root.parentElement !== host) host.appendChild(root);
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
  voice?.addEventListener("click", async () => {
    const nova = await openConsole();
    if (!nova) return;
    if (window.AstralisNovaCapabilities?.startListening) {
      window.AstralisNovaCapabilities.startListening();
    } else {
      nova.root.querySelector("#novaMic")?.click();
    }
  });
  let secretTaps = 0;
  let secretTapTimer;
  let speechRecognition;
  const normalizePhrase = value => value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
  const closeAccess = () => {
    speechRecognition?.abort();
    if (accessLock) accessLock.hidden = true;
    if (accessInput) accessInput.value = "";
    if (accessStatus) accessStatus.textContent = "Say the private wake phrase.";
    start();
  };
  const unlockWithPhrase = phrase => {
    const normalized = normalizePhrase(phrase || "");
    if (!normalized) {
      if (accessStatus) accessStatus.textContent = "Nova did not hear a phrase. Try again.";
      accessInput?.focus();
      return;
    }
    if (accessStatus) accessStatus.textContent = "Checking the private signal…";
    sessionStorage.setItem("astralisNovaMemoryPhrase", normalized);
    setTimeout(() => location.assign("/memories/"), 280);
  };
  const listenForWakePhrase = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (accessStatus) accessStatus.textContent = "Voice access is unavailable here. Type the wake phrase.";
      accessInput?.focus();
      return;
    }
    speechRecognition?.abort();
    speechRecognition = new SpeechRecognition();
    speechRecognition.lang = "en-US";
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.onstart = () => { if (accessStatus) accessStatus.textContent = "Listening…"; };
    speechRecognition.onresult = event => {
      const phrase = event.results?.[0]?.[0]?.transcript || "";
      if (accessInput) accessInput.value = phrase;
      unlockWithPhrase(phrase);
    };
    speechRecognition.onerror = () => {
      if (accessStatus) accessStatus.textContent = "Tap the microphone or type the wake phrase.";
      accessInput?.focus();
    };
    try { speechRecognition.start(); } catch { accessInput?.focus(); }
  };
  const openAccess = () => {
    setPanelOpen(false);
    clearInterval(timer);
    if (accessLock) accessLock.hidden = false;
    if (accessStatus) accessStatus.textContent = "Say the private wake phrase.";
    setTimeout(listenForWakePhrase, 80);
  };
  memoryHotspot?.addEventListener("click", () => {
    secretTaps += 1;
    clearTimeout(secretTapTimer);
    if (secretTaps >= 3) {
      secretTaps = 0;
      openAccess();
      return;
    }
    secretTapTimer = setTimeout(() => { secretTaps = 0; }, 1600);
  });
  accessForm?.addEventListener("submit", event => {
    event.preventDefault();
    unlockWithPhrase(accessInput?.value);
  });
  accessMic?.addEventListener("click", listenForWakePhrase);
  accessClose?.addEventListener("click", closeAccess);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && accessLock && !accessLock.hidden) closeAccess();
  });

  show(Math.floor(Math.random() * thoughts.length));
  start();
  if (host) waitForNova();
  const revealBrain = () => {
    setPanelOpen(true);
    chamber.scrollIntoView({ block: "start", behavior: reducedMotion.matches ? "auto" : "smooth" });
  };
  document.addEventListener("click", event => {
    if (event.target.closest?.(".nova-primary-send, .nova-primary-chip")) revealBrain();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.matches?.(".nova-primary-input") && event.target.value.trim()) {
      setTimeout(revealBrain, 0);
    }
  });
})();
