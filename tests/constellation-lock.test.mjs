import assert from "node:assert/strict";
import test from "node:test";

await import("../constellation-lock.js");

const { create, PATTERN } = globalThis.AstralisConstellationLock;

test("uses the private 3-2-1 constellation pattern", () => {
  assert.deepEqual([...PATTERN], ["apex", "apex", "apex", "left", "left", "bottom"]);
});

test("opens only after the complete ordered sequence", () => {
  let completions = 0;
  const lock = create({ onComplete: () => { completions += 1; } });

  for (const node of PATTERN.slice(0, -1)) lock.tap(node);
  assert.equal(completions, 0);
  assert.equal(lock.getProgress(), 5);

  assert.equal(lock.tap("bottom"), "complete");
  assert.equal(completions, 1);
  assert.equal(lock.getProgress(), 0);
});

test("a wrong node silently resets the sequence", () => {
  let completions = 0;
  const lock = create({ onComplete: () => { completions += 1; } });

  lock.tap("apex");
  lock.tap("apex");
  assert.equal(lock.tap("left"), "reset");
  assert.equal(lock.getProgress(), 0);

  lock.tap("bottom");
  for (const node of PATTERN) lock.tap(node);
  assert.equal(completions, 1);
});

test("an apex mistap can become the first tap of a fresh attempt", () => {
  const lock = create();
  lock.tap("apex");
  lock.tap("left");
  assert.equal(lock.tap("apex"), "progress");
  assert.equal(lock.getProgress(), 1);
});

test("the sequence expires after eight seconds", () => {
  let expiry;
  let resets = 0;
  const lock = create({
    timeoutMs: 8000,
    setTimer: callback => { expiry = callback; return 1; },
    clearTimer: () => {},
    onReset: () => { resets += 1; }
  });

  lock.tap("apex");
  lock.tap("apex");
  assert.equal(lock.getProgress(), 2);
  expiry();
  assert.equal(lock.getProgress(), 0);
  assert.equal(resets, 1);
});

test("homepage contains all three mobile tap targets and the trace", async () => {
  const { readFile } = await import("node:fs/promises");
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /data-constellation-node="apex"/);
  assert.match(html, /data-constellation-node="left"/);
  assert.match(html, /data-constellation-node="bottom"/);
  assert.match(html, /class="thought-constellation-trace"/);
  assert.match(html, /constellation-lock\.js/);
});
