/* Progressive enhancement: every element links to its source without JavaScript. */
(() => {
  "use strict";
  const section = document.getElementById("elements");
  if (!section) return;
  const grid = document.getElementById("elementGrid");
  const scroll = document.getElementById("elementScroll");
  const query = document.getElementById("elementQuery");
  const family = document.getElementById("elementFamily");
  const status = document.getElementById("elementStatus");
  const tiles = [...grid.querySelectorAll(".element-tile")];
  const views = [...section.querySelectorAll("[data-element-view]")];
  const dialog = document.getElementById("elementDialog");
  const byNumber = new Map(tiles.map(tile => [tile.dataset.number, tile]));
  let opener = null;
  let view = window.matchMedia("(max-width: 680px)").matches ? "cards" : "table";

  const connections = {
    "1": {
      heading: "The Sun’s main ingredient",
      text: "The Sun is made mostly of hydrogen and helium. In its core, nuclear fusion turns hydrogen into helium, releasing energy that eventually reaches us as sunlight.",
      source: "https://science.nasa.gov/sun/facts/", label: "The Sun’s composition and energy · NASA ↗"
    },
    "14": {
      heading: "From Earth’s crust to microchips",
      text: "Silicon is the second most abundant element in Earth’s crust, after oxygen. It occurs in silica and silicate minerals. Carefully purified and doped silicon also makes the semiconductors at the heart of many microchips.",
      source: "https://periodic-table.rsc.org/element/14/silicon", label: "Silicon’s uses and abundance · Royal Society of Chemistry ↗"
    },
    "6": {
      heading: "A foundation of life’s chemistry",
      text: "Carbon can bond to itself and other elements to form an enormous variety of molecules. This chemistry is central to life on Earth, including the molecules that make up our bodies.",
      source: "https://periodic-table.rsc.org/element/6/carbon", label: "Carbon and living things · Royal Society of Chemistry ↗"
    }
  };

  function filterElements() {
    const term = query.value.trim().toLowerCase();
    const numeric = /^\d+$/.test(term);
    const exactSymbol = tiles.find(tile => tile.dataset.symbol.toLowerCase() === term);
    let count = 0;
    tiles.forEach(tile => {
      const data = tile.dataset;
      const textMatch = !term || (numeric ? Number(term) === Number(data.number) :
        exactSymbol ? tile === exactSymbol : data.name.toLowerCase().includes(term));
      const match = textMatch && (family.value === "all" || family.value === data.family);
      tile.classList.toggle("is-muted", !match);
      tile.hidden = view === "cards" && !match;
      if (match) {
        tile.removeAttribute("aria-disabled");
        tile.removeAttribute("tabindex");
        count++;
      } else {
        tile.setAttribute("aria-disabled", "true");
        tile.tabIndex = -1;
      }
    });
    status.textContent = count === 0 ? "No elements match. Try another name, symbol, or number, or reset the filters." :
      count === tiles.length ? "All 118 elements. Select one to explore its atomic details." :
        `${count} matching ${count === 1 ? "element" : "elements"}.${view === "table" ? " Highlighted in place; choose Cards to gather the matches together." : ""}`;
  }

  function showView(next) {
    view = next;
    grid.dataset.view = view;
    scroll.classList.toggle("is-cards", view === "cards");
    scroll.scrollLeft = 0;
    views.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.elementView === view)));
    filterElements();
  }

  function showElement(tile, trigger) {
    const data = tile.dataset;
    const values = { Family: data.familyName, Symbol: data.symbol, Name: data.name,
      Number: data.number, Protons: data.number, Electrons: data.number, Period: data.period,
      Group: data.group || `${data.familyName} series` };
    Object.entries(values).forEach(([key, value]) => {
      document.getElementById(`elementDialog${key}`).textContent = value;
    });
    dialog.dataset.family = data.family;
    document.getElementById("elementPlainSummary").textContent =
      `${data.name} is element ${data.number}. Every ${data.name.toLowerCase()} atom has ${data.number} ${Number(data.number) === 1 ? "proton" : "protons"} in its center. A neutral atom has the same number of electrons. “${data.symbol}” is the element’s short symbol.`;
    document.getElementById("elementDialogSource").href = tile.href;
    const note = connections[data.number];
    document.getElementById("elementDialogConnection").hidden = !note;
    if (note) {
      document.getElementById("elementConnectionHeading").textContent = note.heading;
      document.getElementById("elementConnectionText").textContent = note.text;
      const source = document.getElementById("elementConnectionSource");
      source.href = note.source;
      source.textContent = note.label;
    }
    opener = trigger;
    dialog.showModal();
  }

  section.addEventListener("click", event => {
    const trigger = event.target.closest(".element-tile, [data-explore-element]");
    if (!trigger || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (trigger.getAttribute("aria-disabled") === "true") { event.preventDefault(); return; }
    const tile = trigger.matches(".element-tile") ? trigger : byNumber.get(trigger.dataset.exploreElement);
    if (!tile || typeof dialog.showModal !== "function") return;
    event.preventDefault();
    showElement(tile, trigger);
  });
  dialog.addEventListener("close", () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  query.addEventListener("input", filterElements);
  family.addEventListener("change", filterElements);
  views.forEach(button => button.addEventListener("click", () => showView(button.dataset.elementView)));
  document.getElementById("elementReset").addEventListener("click", () => {
    query.value = "";
    family.value = "all";
    filterElements();
    query.focus();
  });
  showView(view);
  document.getElementById("elementControls").hidden = false;
  status.hidden = false;
})();
