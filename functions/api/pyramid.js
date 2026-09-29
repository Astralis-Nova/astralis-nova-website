const headers = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });

async function tables(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS pyramid_thoughts (
    id TEXT PRIMARY KEY, message TEXT NOT NULL, search_key TEXT NOT NULL, created_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS pyramid_rate_limits (
    ip_hash TEXT PRIMARY KEY, last_post INTEGER NOT NULL
  )`).run();
}

function publicEntry(row) { return { id: row.id, message: row.message, created_at: row.created_at }; }

export async function onRequestGet({ env, request }) {
  if (!env.DB) return json({ error: "The pyramid database is unavailable." }, 503);
  const q = (new URL(request.url).searchParams.get("q") || "").trim().slice(0, 80);
  try {
    await tables(env.DB);
    const where = q ? "WHERE substr(search_key, 1, ?) = ?" : "";
    const bindings = q ? [Array.from(q.toLocaleLowerCase()).length, q.toLocaleLowerCase()] : [];
    const rows = await env.DB.prepare(`SELECT id, message, created_at FROM pyramid_thoughts ${where} ORDER BY created_at DESC LIMIT 48`).bind(...bindings).all();
    return json({ entries: (rows.results || []).map(publicEntry) });
  } catch (error) {
    console.error("Pyramid read failed", error);
    return json({ error: "The pyramid could not be opened." }, 500);
  }
}

export async function onRequestPost({ env, request }) {
  if (!env.DB) return json({ error: "The pyramid database is unavailable." }, 503);
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "This form must be used on Astralis Nova." }, 403);
  if (Number(request.headers.get("Content-Length") || 0) > 3000) return json({ error: "Message is too long." }, 413);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid message." }, 400); }
  const message = String(body?.message ?? "").trim();
  if (!message || Array.from(message).length > 300 || /[\u0000-\u0008\u000b\u000e-\u001f]/.test(message)) return json({ error: "Enter 1–300 characters of text." }, 400);
  if (/(?:https?:\/\/|www\.|<script|javascript:)/i.test(message)) return json({ error: "Please leave out links and code." }, 400);
  try {
    await tables(env.DB);
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const salt = env.PYRAMID_SALT || "astralis-nova-pyramid";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}:${ip}:${new Date().toISOString().slice(0, 10)}`));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const now = Date.now();
    await env.DB.prepare("DELETE FROM pyramid_rate_limits WHERE last_post < ?").bind(now - 86_400_000).run();
    // The conditional UPSERT is atomic, including when two posts arrive together.
    const limit = await env.DB.prepare(`INSERT INTO pyramid_rate_limits (ip_hash, last_post) VALUES (?, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET last_post = excluded.last_post
      WHERE pyramid_rate_limits.last_post <= ?`).bind(hash, now, now - 30_000).run();
    if (!limit.meta?.changes) return json({ error: "Please wait 30 seconds before leaving another thought." }, 429);
    const entry = { id: crypto.randomUUID(), message, created_at: new Date(now).toISOString() };
    await env.DB.prepare("INSERT INTO pyramid_thoughts (id, message, search_key, created_at) VALUES (?, ?, ?, ?)")
      .bind(entry.id, entry.message, entry.message.toLocaleLowerCase(), entry.created_at).run();
    return json({ entry }, 201);
  } catch (error) {
    console.error("Pyramid write failed", error);
    return json({ error: "The thought could not be saved. Please try again." }, 500);
  }
}
