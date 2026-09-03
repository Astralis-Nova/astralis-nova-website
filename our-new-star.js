(() => {
  "use strict";

  const motion = document.getElementById("novaMotion");
  const toggle = document.getElementById("rotationToggle");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const still = "/assets/astralis-sphere/an-blue-still.webp";
  const animation = "/assets/astralis-sphere/an-blue-motion.webp";
  let rotating = !preference.matches;

  function updateRotation() {
    motion.media = "all";
    motion.srcset = rotating ? animation : still;
    toggle.textContent = rotating ? "Pause motion" : "Resume motion";
    document.documentElement.classList.toggle("space-motion-paused", !rotating);
  }
  toggle.hidden = false;
  toggle.addEventListener("click", () => {
    rotating = !rotating;
    updateRotation();
  });
  const syncPreference = () => {
    rotating = !preference.matches;
    updateRotation();
  };
  if (preference.addEventListener) preference.addEventListener("change", syncPreference);
  else if (preference.addListener) preference.addListener(syncPreference);
  updateRotation();

  const controls = document.getElementById("researchControls");
  const query = document.getElementById("researchQuery");
  const cards = [...document.querySelectorAll(".finding")];
  const filters = [...document.querySelectorAll("[data-topic]")];
  const status = document.getElementById("resultStatus");
  const empty = document.getElementById("emptyResults");
  const surprise = document.getElementById("randomDiscovery");
  const stopWords = new Set(["the", "and", "are", "can", "does", "what", "why", "how", "our", "for", "with", "that", "this", "about", "there", "have", "feel", "into", "from"]);
  let topic = "all";
  let lastDiscovery = null;
  const normalized = text => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const records = cards.map(card => ({ card, text: normalized(`${card.textContent} ${card.dataset.keywords || ""}`), topics: card.dataset.topics.split(" ") }));

  function filterFindings() {
    const terms = normalized(query.value).split(/[^a-z0-9]+/).filter(term => term.length > 1 && !stopWords.has(term));
    let visible = 0;
    for (const record of records) {
      const match = (topic === "all" || record.topics.includes(topic)) && (!terms.length || terms.some(term => record.text.includes(term)));
      record.card.hidden = !match;
      record.card.classList.remove("is-discovery");
      if (match) visible++;
    }
    status.textContent = `${visible} ${visible === 1 ? "entry" : "entries"} shown.`;
    empty.hidden = visible !== 0;
    surprise.disabled = visible === 0;
    filters.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.topic === topic)));
  }
  controls.hidden = false;
  query.addEventListener("input", filterFindings);
  document.getElementById("researchSearch").addEventListener("submit", event => {
    event.preventDefault();
    filterFindings();
  });
  filters.forEach(button => button.addEventListener("click", () => {
    topic = button.dataset.topic;
    filterFindings();
  }));
  document.getElementById("resetResearch").addEventListener("click", () => {
    topic = "all";
    query.value = "";
    filterFindings();
    query.focus();
  });
  surprise.addEventListener("click", () => {
    const visible = cards.filter(card => !card.hidden);
    const candidates = visible.length > 1 ? visible.filter(card => card !== lastDiscovery) : visible;
    if (!candidates.length) return;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    cards.forEach(card => card.classList.toggle("is-discovery", card === chosen));
    const detail = chosen.querySelector("details");
    if (detail) detail.open = true;
    chosen.focus({ preventScroll: true });
    chosen.scrollIntoView({ behavior: preference.matches ? "auto" : "smooth", block: "center" });
    status.textContent = `Discovery: ${chosen.querySelector("h3").textContent}`;
    lastDiscovery = chosen;
  });
  filterFindings();
})();

(() => {
  "use strict";
  const controls = document.getElementById("cosmosControls");
  const views = [...document.querySelectorAll("[data-scene]")];
  const buttons = [...document.querySelectorAll("[data-scene-target]")];
  const status = document.getElementById("cosmosStatus");
  if (!controls || !views.length || !buttons.length) return;
  function showScene(name, announce = true) {
    const selected = views.find(view => view.dataset.scene === name);
    if (!selected) return;
    views.forEach(view => { view.hidden = view !== selected; });
    buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.sceneTarget === name)));
    if (announce) status.textContent = `${selected.querySelector("h3").textContent} view selected.`;
  }
  buttons.forEach(button => button.addEventListener("click", () => showScene(button.dataset.sceneTarget)));
  showScene("solar", false);
  controls.hidden = false;
})();
