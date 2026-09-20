(() => {
  "use strict";

  const STORAGE_KEY = "astralis.scriptureNexus.reflections.v1";
  const MAX_REFLECTIONS = 100;
  const stopWords = new Set([
    "about", "after", "again", "also", "and", "are", "bible", "but", "can",
    "did", "does", "for", "from", "have", "how", "into", "life", "nexus",
    "not", "say", "scripture", "that", "the", "this", "was", "what", "when",
    "where", "which", "who", "why", "with", "would", "you", "your"
  ]);

  const byId = id => document.getElementById(id);
  const normalize = value => String(value || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = value => [...new Set(normalize(value).split(" ").filter(word => word.length > 2 && !stopWords.has(word)))];
  const references = value => String(value || "").split("•").map(item => normalize(item)).filter(Boolean);

  function readMemory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeMemory(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_REFLECTIONS)));
      return true;
    } catch {
      return false;
    }
  }

  function currentAnswer() {
    return {
      question: byId("askInput")?.value.trim() || "",
      title: byId("answerTitle")?.textContent.trim() || "",
      refs: byId("answerRefs")?.textContent.trim() || ""
    };
  }

  function answerKey(answer) {
    return normalize(answer.question || answer.title);
  }

  function score(record, answer) {
    let total = 0;
    const recordQuestion = normalize(record.question);
    const currentQuestion = normalize(answer.question);
    const recordTitle = normalize(record.title);
    const currentTitle = normalize(answer.title);
    if (recordQuestion && currentQuestion && recordQuestion === currentQuestion) total += 20;
    if (recordTitle && currentTitle && recordTitle === currentTitle) total += 12;

    const currentWords = new Set(words(`${answer.question} ${answer.title}`));
    words(`${record.question} ${record.title}`).forEach(word => {
      if (currentWords.has(word)) total += 2;
    });

    const currentRefs = new Set(references(answer.refs));
    references(record.refs).forEach(ref => {
      if (currentRefs.has(ref)) total += 4;
    });
    return total;
  }

  function matchingReflections(answer) {
    return readMemory()
      .map(record => ({ record, relevance: score(record, answer) }))
      .filter(item => item.relevance >= 4)
      .sort((a, b) => b.relevance - a.relevance || b.record.updatedAt.localeCompare(a.record.updatedAt))
      .slice(0, 3)
      .map(item => item.record);
  }

  function updateContext(answer) {
    const context = byId("nexusContext");
    if (!context || !answer.refs) return;
    const firstReference = answer.refs.split("•")[0].trim();
    context.textContent = `Begin with ${firstReference} in its surrounding chapter. Identify who is speaking, who is being addressed, the historical setting, and whether the passage is narrative, poetry, wisdom, prophecy, or a letter before applying it today.`;
  }

  let renderedKey = "";
  function renderLearnedGuidance({ resetDraft = false } = {}) {
    const answer = currentAnswer();
    if (!answer.title) return;

    updateContext(answer);
    const key = answerKey(answer);
    const input = byId("nexusReflectionInput");
    if (input && (resetDraft || (renderedKey && renderedKey !== key))) input.value = "";
    renderedKey = key;

    const panel = byId("nexusLearnedGuidance");
    const list = byId("nexusLearnedList");
    if (!panel || !list) return;
    const matches = matchingReflections(answer);
    list.replaceChildren();

    matches.forEach(record => {
      const item = document.createElement("li");
      const date = new Date(record.updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      const text = document.createElement("span");
      text.textContent = record.reflection;
      const meta = document.createElement("small");
      meta.style.cssText = "display:block;margin-top:4px;color:#91a7bf";
      meta.textContent = `Saved from “${record.question || record.title}” on ${date}`;
      item.append(text, meta);
      list.appendChild(item);
    });

    panel.classList.toggle("show", matches.length > 0);
  }

  function saveReflection() {
    const input = byId("nexusReflectionInput");
    const status = byId("nexusReflectionStatus");
    const reflection = input?.value.trim() || "";
    const answer = currentAnswer();
    if (!reflection) {
      if (status) status.textContent = "Add a reflection first.";
      input?.focus();
      return;
    }
    if (!answer.title) {
      if (status) status.textContent = "Ask the Nexus a question first.";
      return;
    }

    const now = new Date().toISOString();
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      question: answer.question,
      title: answer.title,
      refs: answer.refs,
      reflection,
      createdAt: now,
      updatedAt: now
    };
    const saved = writeMemory([record, ...readMemory()]);
    if (status) status.textContent = saved ? "Reflection saved. The application layer has been updated." : "This browser could not save the reflection.";
    if (saved) {
      input.value = "";
      renderLearnedGuidance();
    }
  }

  function clearMemory() {
    if (!window.confirm("Clear all reflections saved by Scripture Nexus in this browser?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
    const status = byId("nexusReflectionStatus");
    if (status) status.textContent = "Saved reflections cleared.";
    renderLearnedGuidance({ resetDraft: true });
  }

  function install() {
    byId("nexusSaveReflection")?.addEventListener("click", saveReflection);
    byId("nexusClearMemory")?.addEventListener("click", clearMemory);

    const observed = [byId("answerTitle"), byId("answerRefs")].filter(Boolean);
    const observer = new MutationObserver(() => queueMicrotask(() => renderLearnedGuidance()));
    observed.forEach(element => observer.observe(element, { childList: true, subtree: true, characterData: true }));
    renderLearnedGuidance();

    window.ScriptureNexusLearning = {
      getReflections: () => readMemory().map(item => ({ ...item })),
      clearReflections: clearMemory
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
