(() => {
  "use strict";
  const form = document.getElementById("observationForm");
  if (!form) return;
  const list = document.getElementById("observationEntries");
  const status = document.getElementById("observationStatus");
  const count = document.getElementById("observationCount");
  const submit = document.getElementById("observationSubmit");
  const refresh = document.getElementById("observationRefresh");
  const message = document.getElementById("observationMessage");
  const topic = document.getElementById("observationTopic");
  const topics = new Set(["Space", "Nature", "Spiritual connection", "Research", "Life & consciousness"]);
  const prefix = /^\[Our New Star \/ (Space|Nature|Spiritual connection|Research|Life & consciousness)\] /;
  let entries = [];
  let version = 0;
  function node(tag, text, className) {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function messageNode(text) {
    const paragraph = node("p", "", "observation-entry-message");
    let cursor = 0;
    for (const match of text.matchAll(/https?:\/\/[^\s<>]+/g)) {
      const address = match[0].replace(/[.,!?:;]+$/, "");
      try {
        const url = new URL(address);
        if (url.protocol !== "https:" && url.protocol !== "http:") continue;
        paragraph.append(node("span", text.slice(cursor, match.index)));
        const link = node("a", address);
        link.href = url.href;
        link.target = "_blank";
        link.rel = "nofollow ugc noopener noreferrer";
        paragraph.append(link);
        cursor = match.index + address.length;
      } catch (_) { /* Invalid links remain plain text. */ }
    }
    paragraph.append(node("span", text.slice(cursor)));
    return paragraph;
  }
  function render() {
    list.replaceChildren();
    count.textContent = `${entries.length} shown · latest 50 Observation Deck messages`;
    if (!entries.length) {
      list.append(node("p", "No messages here yet. What would you like to explore together?", "observation-empty"));
      return;
    }
    entries.forEach(entry => {
      const matched = String(entry.message || "").match(prefix);
      const card = node("article", "", "observation-entry");
      const header = node("div", "", "observation-entry-head");
      const name = String(entry.name || "Explorer");
      header.append(node("h4", name), node("span", matched[1], "observation-topic"));
      card.append(header, messageNode(String(entry.message).replace(prefix, "")));
      const footer = node("div", "", "observation-entry-footer");
      const date = new Date(entry.created_at);
      if (Number.isFinite(date.getTime())) {
        const time = node("time", date.toLocaleString());
        time.dateTime = date.toISOString();
        footer.append(time);
      }
      const reply = node("button", "Reply");
      reply.type = "button";
      reply.setAttribute("aria-label", `Write a public reply to ${name}`);
      reply.addEventListener("click", () => {
        const address = `@${name}: `;
        const draft = message.value.startsWith(address) ? message.value : address + message.value;
        if (draft.length > 450) {
          status.textContent = "Your draft is nearly full. Shorten it before adding a reply address; your text has been kept.";
          message.focus();
          return;
        }
        message.value = draft;
        topic.value = matched[1];
        status.textContent = `Writing a public reply to ${name}. Your message will appear on the board.`;
        message.focus();
      });
      footer.append(reply);
      card.append(footer);
      list.append(card);
    });
  }
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The message board is unavailable. Please try again.");
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("The connection timed out. Refresh messages before trying again.");
      throw error;
    } finally { clearTimeout(timer); }
  }
  async function load() {
    const ticket = ++version;
    refresh.disabled = true;
    try {
      const data = await request("/api/guestbook?scope=our-new-star", { headers: { Accept: "application/json" } });
      if (ticket !== version) return;
      if (!Array.isArray(data.entries)) throw new Error("Unexpected message response.");
      entries = data.entries.filter(entry => entry && prefix.test(String(entry.message || ""))).slice(0, 50);
      render();
    } catch (_) {
      if (ticket !== version) return;
      count.textContent = "Messages could not be refreshed. Use Refresh messages to try again.";
      if (!entries.length) list.replaceChildren(node("p", "The message board is temporarily unavailable. You can keep writing your draft.", "observation-empty"));
    } finally { if (ticket === version) refresh.disabled = false; }
  }
  refresh.addEventListener("click", load);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submit.disabled || !form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const kind = String(values.get("topic") || "");
    const text = String(values.get("message") || "").trim();
    if (!name || name.length > 40 || !topics.has(kind) || text.length < 3 || text.length > 450) {
      status.textContent = "Use a name of 1–40 characters and a message of 3–450 characters, and choose a topic.";
      return;
    }
    submit.disabled = true;
    status.textContent = "Posting your public message…";
    try {
      const data = await request("/api/guestbook", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, message: `[Our New Star / ${kind}] ${text}`, website: String(values.get("website") || "") })
      });
      if (!data.entry?.id || !prefix.test(String(data.entry.message || ""))) throw new Error("Could not confirm your post. Refresh messages before trying again.");
      ++version;
      refresh.disabled = false;
      entries = [data.entry, ...entries.filter(entry => entry.id !== data.entry.id)].slice(0, 50);
      render();
      message.value = "";
      status.textContent = "Your message is public. Thank you for adding your voice to the search.";
    } catch (error) {
      status.textContent = error.message || "Your message could not be posted. Your draft has been kept.";
    } finally { submit.disabled = false; }
  });
  submit.disabled = false;
  load();
})();
