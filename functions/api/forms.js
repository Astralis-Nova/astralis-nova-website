const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function hashVisitor(request, salt) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return json({ error: "The website database is not connected." }, 503);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 20_000) {
    return json({ error: "Submission is too large." }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid submission." }, 400);
  }

  // Hidden honeypot field. Bots receive a harmless success response.
  if (clean(body.website, 120)) {
    return json({ ok: true });
  }

  const type = clean(body.type, 20);
  const salt = env.GUESTBOOK_SALT || "astralis-nova-private-forms";
  const ipHash = await hashVisitor(request, salt);
  const now = new Date().toISOString();

  try {
    if (type === "subscribe") {
      const email = clean(body.email, 120).toLowerCase();

      if (!validEmail(email)) {
        return json({ error: "Please enter a valid email address." }, 400);
      }

      const existing = await env.DB.prepare(
        `SELECT id
         FROM subscribers
         WHERE email = ? COLLATE NOCASE
         LIMIT 1`
      ).bind(email).first();

      if (existing?.id) {
        await env.DB.prepare(
          `UPDATE subscribers
           SET status = 'active', updated_at = ?, ip_hash = ?
           WHERE id = ?`
        ).bind(now, ipHash, existing.id).run();

        return json({
          ok: true,
          alreadySubscribed: true,
          message: "This email is already on the Astralis Nova signal.",
        });
      }

      await env.DB.prepare(
        `INSERT INTO subscribers
         (id, email, status, created_at, updated_at, ip_hash)
         VALUES (?, ?, 'active', ?, ?, ?)`
      ).bind(crypto.randomUUID(), email, now, now, ipHash).run();

      return json({
        ok: true,
        message: "Subscription saved.",
      }, 201);
    }

    if (type === "contact") {
      const name = clean(body.name, 60);
      const email = clean(body.email, 120).toLowerCase();
      const subject = clean(body.subject, 100);
      const message = clean(body.message, 2000);

      if (!name) {
        return json({ error: "Please enter your name." }, 400);
      }
      if (!validEmail(email)) {
        return json({ error: "Please enter a valid email address." }, 400);
      }
      if (!subject) {
        return json({ error: "Please enter a subject." }, 400);
      }
      if (message.length < 5) {
        return json({ error: "Please write a slightly longer message." }, 400);
      }

      const recent = await env.DB.prepare(
        `SELECT created_at
         FROM contact_messages
         WHERE ip_hash = ?
         ORDER BY created_at DESC
         LIMIT 1`
      ).bind(ipHash).first();

      if (recent?.created_at) {
        const age = Date.now() - Date.parse(recent.created_at);
        if (Number.isFinite(age) && age < 15_000) {
          return json({
            error: "Please wait a few seconds before sending another message.",
          }, 429);
        }
      }

      await env.DB.prepare(
        `INSERT INTO contact_messages
         (id, name, email, subject, message, status, created_at, ip_hash)
         VALUES (?, ?, ?, ?, ?, 'new', ?, ?)`
      ).bind(
        crypto.randomUUID(),
        name,
        email,
        subject,
        message,
        now,
        ipHash
      ).run();

      return json({
        ok: true,
        message: "Message saved for Ramon.",
      }, 201);
    }

    return json({ error: "Unknown form type." }, 400);
  } catch (error) {
    console.error("D1 form submission failed", error);
    return json({
      error: "The message could not be saved. Please use the direct email link.",
    }, 500);
  }
}
