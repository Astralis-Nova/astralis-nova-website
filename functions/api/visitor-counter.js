const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function hashVisitor(request, salt) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function counts(db) {
  const result = await db.prepare(
    `SELECT COUNT(*) AS visits,
            COUNT(DISTINCT visitor_hash) AS unique_visitors
     FROM visitor_events`
  ).first();

  return {
    visits: Number(result?.visits || 0),
    uniqueVisitors: Number(result?.unique_visitors || 0),
  };
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: "Visitor database is not connected." }, 503);

  try {
    return json(await counts(env.DB));
  } catch (error) {
    console.error("Visitor counter GET failed", error);
    return json({ error: "Visitor counter could not be loaded." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: "Visitor database is not connected." }, 503);

  try {
    const visitorHash = await hashVisitor(
      request,
      env.VISITOR_COUNTER_SALT || "astralis-nova-martian-counter"
    );

    // Count at most one visit per hashed network address every 30 minutes.
    const recent = await env.DB.prepare(
      `SELECT created_at
       FROM visitor_events
       WHERE visitor_hash = ?
       ORDER BY created_at DESC
       LIMIT 1`
    ).bind(visitorHash).first();

    let counted = false;
    if (!recent?.created_at ||
        Date.now() - Date.parse(recent.created_at) >= 30 * 60 * 1000) {
      await env.DB.prepare(
        `INSERT INTO visitor_events (id, visitor_hash, created_at)
         VALUES (?, ?, ?)`
      ).bind(crypto.randomUUID(), visitorHash, new Date().toISOString()).run();
      counted = true;
    }

    return json({ ...(await counts(env.DB)), counted });
  } catch (error) {
    console.error("Visitor counter POST failed", error);
    return json({ error: "Visitor signal could not be recorded." }, 500);
  }
}
