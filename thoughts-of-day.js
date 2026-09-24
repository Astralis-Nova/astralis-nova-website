(() => {
  "use strict";

  // Add each new thought here. The chamber starts rotating when a second entry exists.
  const thoughts = [
    {
      date: "SEPTEMBER 24, 2026",
      title: "If the Body Is Hardware, Where Is the Self?",
      paragraphs: [
        "When a video card fails, the computer may still be there, but part of how it reaches the world goes quiet. Our bodies have parts that can fail, too. The brain is living tissue and an ongoing process: memory, thought, and experience emerge through its activity.",
        "We can already use some signals from a living brain to guide a robotic device. Imagine extending that connection to an entire body. Would it feel like gaining new arms and eyes? If we someday recreated a person's mind inside a machine, would the one who woke there be the same person, or a new being with the same memories? And where, if anywhere, would a soul fit into that story?"
      ],
      note: "A thought experiment, not a claim that minds can be transferred.",
      source: {
        label: "Explore brain–computer research ↗",
        url: "https://www.nih.gov/news-events/nih-research-matters/decoding-inner-speech-brain-signals"
      },
      related: {
        label: "Explore our questions about consciousness →",
        url: "our-new-star.html#questions-exploring"
      }
    }
  ];

  const chamber = document.getElementById("thought-of-the-day");
  if (!chamber || !thoughts.length) return;

  const date = document.getElementById("thought-date");
  const title = document.getElementById("thought-title");
  const body = document.getElementById("thought-body");
  const note = document.getElementById("thought-note");
  const count = document.getElementById("thought-count");
  const buttons = document.getElementById("thought-buttons");
  const previous = document.getElementById("thought-previous");
  const next = document.getElementById("thought-next");
  if (![date, title, body, note, count, buttons, previous, next].every(Boolean)) return;

  let current = 0;
  let timer;
  let paused = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function addLink(parent, link) {
    if (!link || !link.url) return;
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.label;
    if (/^https?:\/\//.test(link.url)) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    parent.append(" · ", a);
  }

  function show(index) {
    current = (index + thoughts.length) % thoughts.length;
    const entry = thoughts[current];
    date.textContent = "THOUGHT OF THE DAY · " + entry.date;
    title.textContent = entry.title;
    body.replaceChildren(...entry.paragraphs.map(value => {
      const p = document.createElement("p");
      p.textContent = value;
      return p;
    }));
    note.replaceChildren(document.createTextNode(entry.note));
    addLink(note, entry.source);
    addLink(note, entry.related);
    count.textContent = thoughts.length === 1
      ? "First thought in orbit"
      : "Thought " + (current + 1) + " of " + thoughts.length;
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
