(() => {
  "use strict";

  const motion = document.getElementById("novaMotion");
  const toggle = document.getElementById("rotationToggle");
  const supportMotion = document.getElementById("supportMotion");
  const supportToggle = document.getElementById("supportMotionToggle");
  const motionButtons = [toggle, supportToggle].filter(Boolean);
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const still = "/assets/astralis-sphere/support-sphere-still.webp";
  const animation = "/assets/astralis-sphere/support-sphere-tumble.webp";
  let rotating = !preference.matches;

  function updateRotation() {
    motion.media = "all";
    motion.srcset = rotating ? animation : still;
    if (supportMotion) {
      supportMotion.srcset = rotating ? "/assets/astralis-sphere/support-sphere-tumble.webp" :
        "/assets/astralis-sphere/support-sphere-still.webp";
    }
    motionButtons.forEach(button => { button.textContent = rotating ? "Pause motion" : "Resume motion"; });
    document.documentElement.classList.toggle("space-motion-paused", !rotating);
  }
  motionButtons.forEach(button => {
    button.hidden = false;
    button.addEventListener("click", () => {
      rotating = !rotating;
      updateRotation();
    });
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

(() => {
  "use strict";
  const guide = document.getElementById("scaleGuide");
  const layers = [...document.querySelectorAll("[data-backdrop]")];
  const choices = [...document.querySelectorAll("[data-scale]")];
  const sections = [...document.querySelectorAll("[data-universe-scale]")];
  if (!guide || !layers.length || !sections.length) return;
  const name = document.getElementById("scaleName");
  const kind = document.getElementById("scaleKind");
  const explanation = document.getElementById("scaleExplanation");
  const source = document.getElementById("scaleSource");
  const fullImage = document.getElementById("scaleImage");
  const credit = document.getElementById("scaleCredit");
  const status = document.getElementById("scaleStatus");
  const notes = {
    stars: {
      name: "Stars & nebulae", kind: "Telescope observation",
      explanation: "Webb’s Cosmic Cliffs show stars and the edge of a stellar nursery. These observations use infrared light mapped to visible colors.",
      source: "https://science.nasa.gov/asset/webb/cosmic-cliffs-in-the-carina-nebula-nircam-image/",
      credit: "NASA, ESA, CSA, STScI"
    },
    galaxies: {
      name: "Galaxies & bent light", kind: "Telescope observation",
      explanation: "Webb’s SMACS 0723 field contains galaxies at different distances. Curved arcs are distant galaxies distorted and magnified by gravity. The sharp, spiked objects are foreground stars. Infrared filters are assigned visible colors.",
      source: "https://science.nasa.gov/asset/webb/webbs-first-deep-field-nircam-image/",
      credit: "NASA, ESA, CSA, STScI"
    },
    "dark-matter": {
      name: "Mapping dark matter", kind: "Inferred density map",
      explanation: "The blue overlay maps dark matter inferred from its gravitational effect on galaxy images. Brighter blue means higher inferred density. Dark matter itself is invisible; the blue is a data visualization, and its physical nature remains unknown.",
      source: "https://science.nasa.gov/photojournal/webb-data-reveals-dark-matter/",
      credit: "NASA/STScI/J. DePasquale/A. Pagan · 2026"
    },
    microns: {
      name: "Cosmic dust, up close", kind: "Electron micrograph",
      explanation: "This is interplanetary dust particle L2005AR7, collected in Earth’s stratosphere and imaged with a scanning electron microscope. Its scale bar is 5 micrometres (µm). One micron is one millionth of a metre; atoms are much smaller.",
      source: "https://www.nasa.gov/general/bricks-and-mortar-of-the-solar-system/",
      credit: "Hope Ishii, University of Hawai‘i · Original scale bar preserved"
    },
    atoms: {
      name: "Inside an atomic model", kind: "Hydrogen 1s model",
      explanation: "An enlarged mathematical slice through hydrogen’s 1s electron-probability cloud. Brighter colors indicate higher probability density on a logarithmic scale. This is a quantum model, with no physical glow implied; the nucleus is too small to resolve at this scale.",
      source: "https://ocw.mit.edu/courses/8-04-quantum-physics-i-spring-2016/63aa28d2a3cf3e7f49c701147195e4a1_MIT8_04S16_ps4_2016.pdf",
      credit: "Astralis Nova · |ψ₁ₛ|² ∝ exp(−2r/a₀), central slice · MIT 8.04 reference"
    }
  };
  let mode = "auto";
  let active = "stars";
  let pending = null;
  let request = 0;
  let frame = null;

  function updateButtons() {
    choices.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scale === mode)));
  }
  function ready(image) {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    if (image.decode) return image.decode();
    return new Promise((resolve, reject) => {
      const clean = () => { image.removeEventListener("load", loaded); image.removeEventListener("error", failed); };
      const loaded = () => { clean(); resolve(); };
      const failed = () => { clean(); reject(new Error("Image unavailable")); };
      image.addEventListener("load", loaded, { once: true });
      image.addEventListener("error", failed, { once: true });
    });
  }
  async function showBackdrop(key, announce = false) {
    if (!notes[key] || pending === key) return;
    const ticket = ++request;
    pending = key;
    const layer = layers.find(item => item.dataset.backdrop === key);
    const image = layer.querySelector("img");
    try {
      if (!image.getAttribute("src")) image.src = image.dataset.src;
      await ready(image);
      if (ticket !== request) return;
      layers.forEach(item => item.classList.toggle("is-current", item === layer));
      active = key;
      pending = null;
      const note = notes[key];
      name.textContent = note.name;
      kind.textContent = note.kind;
      explanation.textContent = note.explanation;
      source.href = note.source;
      fullImage.href = image.getAttribute("src");
      credit.textContent = note.credit;
      updateButtons();
      if (announce) status.textContent = `${note.name} now fills the page background.`;
    } catch (_) {
      if (ticket !== request) return;
      pending = null;
      if (mode !== "auto") mode = active;
      updateButtons();
      status.textContent = "That view could not load. The current background is still available; you can try again.";
    }
  }
  function followPage() {
    frame = null;
    if (mode !== "auto") return;
    let key = sections[0].dataset.universeScale;
    const threshold = window.innerHeight * 0.45;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) key = section.dataset.universeScale;
      else break;
    }
    if (key !== (pending || active)) showBackdrop(key);
  }
  function scheduleFollow() {
    if (mode === "auto" && frame === null) frame = window.requestAnimationFrame(followPage);
  }
  choices.forEach(button => button.addEventListener("click", () => {
    mode = button.dataset.scale;
    updateButtons();
    if (mode === "auto") {
      ++request;
      pending = null;
      followPage();
      status.textContent = "The background now follows your place on the page.";
    } else showBackdrop(mode, true);
  }));
  window.addEventListener("scroll", scheduleFollow, { passive: true });
  window.addEventListener("resize", scheduleFollow, { passive: true });
  window.addEventListener("pageshow", scheduleFollow);
  guide.hidden = false;
  followPage();
})();
