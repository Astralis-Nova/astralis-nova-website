const $ = (id) => document.getElementById(id);
const query = $("query");
const thought = $("thought");
const glyphs = $("glyphs");
const searchStatus = $("searchStatus");
const detail = $("detail");
const matches = $("matches");
const matchList = $("matchList");
let entries = [];
let selectedId = null;
let requestNumber = 0;
let debounce;

function position(id, index) {
  let hash = 2166136261;
  for (const character of id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  const row = Math.floor(index / 8) % 6;
  const y = 21 + row * 12 + ((hash >>> 11) % 7);
  const halfWidth = (y - 2) * .50;
  const fraction = ((hash >>> 3) % 1000) / 1000;
  const x = 50 + (fraction * 1.7 - .85) * halfWidth;
  return { x, y };
}

function select(entry) {
  selectedId = entry.id;
  detail.replaceChildren();
  const message = document.createElement("p");
  message.textContent = entry.message;
  message.classList.toggle("character-art", /\n|  /.test(entry.message));
  const date = document.createElement("small");
  date.textContent = new Date(entry.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  detail.append(message, date);
  for (const node of glyphs.children) node.setAttribute("aria-pressed", String(node.dataset.id === selectedId));
}

function render(data, prefix) {
  entries = data.entries || [];
  glyphs.replaceChildren();
  matchList.replaceChildren();
  matches.hidden = !prefix;
  searchStatus.textContent = prefix
    ? (entries.length ? `Thoughts beginning with “${prefix}”` : "No matching thoughts.")
    : "Select a glowing fragment to read it.";
  if (!entries.length) {
    detail.replaceChildren();
    const empty = document.createElement("span");
    empty.className = "empty";
    empty.textContent = prefix ? "No thought begins that way yet. You could leave the first." : "Search by the first characters, or leave a thought of your own.";
    detail.append(empty);
    return;
  }
  entries.forEach((entry, index) => {
    const { x, y } = position(entry.id, index);
    const button = document.createElement("button");
    button.className = prefix ? "glyph found" : "glyph";
    button.type = "button";
    button.dataset.id = entry.id;
    button.style.left = `${x}%`;
    button.style.top = `${y}%`;
    button.style.setProperty("--delay", `${-(index % 11) * .35}s`);
    button.textContent = Array.from(entry.message.trimStart())[0] || "✦";
    button.setAttribute("aria-label", `Read thought: ${entry.message.slice(0, 70)}`);
    button.setAttribute("aria-pressed", String(entry.id === selectedId));
    button.addEventListener("click", () => select(entry));
    glyphs.append(button);
    if (prefix) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "match";
      item.classList.toggle("character-art", /\n|  /.test(entry.message));
      const strong = document.createElement("strong");
      strong.textContent = Array.from(entry.message).slice(0, Array.from(prefix).length).join("");
      item.append(strong, document.createTextNode(Array.from(entry.message).slice(Array.from(prefix).length).join("")));
      item.addEventListener("click", () => select(entry));
      matchList.append(item);
    }
  });
  const selected = entries.find((entry) => entry.id === selectedId);
  if (selected) select(selected);
  else if (prefix) select(entries[0]);
  else {
    selectedId = null;
    detail.innerHTML = '<span class="empty">Select a glowing fragment to read its message.</span>';
  }
}

async function load() {
  const serial = ++requestNumber;
  const prefix = query.value.trim();
  searchStatus.textContent = "Searching the pyramid…";
  try {
    const response = await fetch(`/api/pyramid?q=${encodeURIComponent(prefix)}`, { headers: { Accept: "application/json" } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The pyramid could not be opened.");
    if (serial === requestNumber) render(data, prefix);
  } catch (error) {
    if (serial === requestNumber) searchStatus.textContent = error.message || "The pyramid is unavailable. Please try again.";
  }
}

query.addEventListener("input", () => { clearTimeout(debounce); debounce = setTimeout(load, 220); });
const artTemplates = {"starfield":"  ✦          ·\n       ⋆\n ·          ✧\n    .    ✦","pyramid":"       ✦\n      /\\\n     /  \\\n    /____\\","ship":"             ✦\n      .-============-.\n  ___/  NXS ASTRALIS  \\___\n <___ ✧  EXPLORER  ✧ ___>\n     \\________________/\n         \\   ||   /\n     =====\\__||__/=====\n          /__||__\\\n          ✦  ||  ✦","symbols":"✦  ✧  ⋆  ·  ◇  △  ☾  ∞  ⟡"};
const preview = $("preview");
function updatePreview() {
  preview.textContent = thought.value || "Your character art appears here.";
  $("length").textContent = `${thought.value.length} / 2000`;
}
thought.addEventListener("input", updatePreview);
document.querySelectorAll("[data-pyr-art]").forEach(button => button.addEventListener("click", () => {
  const art = artTemplates[button.dataset.pyrArt];
  if (!art) return;
  const start = thought.selectionStart, end = thought.selectionEnd;
  const lead = thought.value && start === thought.value.length ? "\n" : "";
  const addition = lead + art;
  if (thought.value.length - (end - start) + addition.length > thought.maxLength) {
    $("status").textContent = "The character canvas is full.";
    return;
  }
  thought.setRangeText(addition, start, end, "end");
  thought.focus();
  updatePreview();
}));
$("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = thought.value;
  if (!message.trim()) { $("status").textContent = "Write at least one character."; thought.focus(); return; }
  const submit = $("submit");
  submit.disabled = true;
  $("status").textContent = "Placing your thought…";
  try {
    const response = await fetch("/api/pyramid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The thought could not be saved.");
    thought.value = "";
    updatePreview();
    $("status").textContent = "Your thought is in the pyramid.";
    query.value = "";
    selectedId = data.entry.id;
    await load();
  } catch (error) { $("status").textContent = error.message || "Try again in a moment."; }
  finally { submit.disabled = false; }
});
load();
