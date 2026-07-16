const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength) {
  return String(value ?? "").replace(/\u0000/g, "").trim().slice(0, maxLength);
}

async function hashVisitor(request, salt) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function looksLikeSpam(message) {
  const lower = message.toLowerCase();
  const blocked = ["<script", "javascript:", "data:text/html", "[url=", "href="];
  if (blocked.some((term) => lower.includes(term))) return true;
  const links = lower.match(/https?:\/\/|www\./g) || [];
  return links.length > 1;
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "Guestbook database is not connected." }, 503);

  try {
    const [entriesResult, countResult] = await Promise.all([
      env.DB.prepare(
        `SELECT id, name, location, favorite_song, message, created_at
         FROM guestbook_entries
         ORDER BY created_at DESC
         LIMIT 50`
      ).all(),
      env.DB.prepare("SELECT COUNT(*) AS total FROM guestbook_entries").first(),
    ]);

    return json({
      entries: entriesResult.results || [],
      total: Number(countResult?.total || 0),
    });
  } catch (error) {
    console.error("Guestbook GET failed", error);
    return json({ error: "The guestbook could not be loaded." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Guestbook database is not connected." }, 503);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) return json({ error: "Submission is too large." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid submission." }, 400);
  }

  if (clean(body.website, 120)) {
    return json({ error: "Submission rejected." }, 400);
  }

  const name = clean(body.name, 40);
  const location = clean(body.location, 60);
  const favoriteSong = clean(body.favoriteSong, 80);
  const message = clean(body.message, 500);

  if (name.length < 1) return json({ error: "Please enter a name or nickname." }, 400);
  if (message.length < 3) return json({ error: "Please write a slightly longer message." }, 400);
  if (looksLikeSpam(message)) return json({ error: "Please remove scripts or extra links." }, 400);

  try {
    const ipHash = await hashVisitor(request, env.GUESTBOOK_SALT || "astralis-nova-guestbook");
    const recent = await env.DB.prepare(
      `SELECT created_at
       FROM guestbook_entries
       WHERE ip_hash = ?
       ORDER BY created_at DESC
       LIMIT 1`
    ).bind(ipHash).first();

    if (recent?.created_at) {
      const age = Date.now() - Date.parse(recent.created_at);
      if (Number.isFinite(age) && age < 30_000) {
        return json({ error: "Please wait 30 seconds before signing again." }, 429);
      }
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO guestbook_entries
       (id, name, location, favorite_song, message, created_at, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, name, location, favoriteSong, message, createdAt, ipHash).run();

    const countResult = await env.DB.prepare(
      "SELECT COUNT(*) AS total FROM guestbook_entries"
    ).first();

    return json({
      entry: {
        id,
        name,
        location,
        favorite_song: favoriteSong,
        message,
        created_at: createdAt,
      },
      total: Number(countResult?.total || 1),
    }, 201);
  } catch (error) {
    console.error("Guestbook POST failed", error);
    return json({ error: "Your guestbook entry could not be saved." }, 500);
  }
}
