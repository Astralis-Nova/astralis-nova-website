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

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function onRequestPost({ request, env }) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 20_000) return json({ error: "Submission is too large." }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid submission." }, 400);
  }

  if (clean(body.website, 120)) {
    return json({ ok: true });
  }

  const type = clean(body.type, 20);
  const destination = env.FORM_DESTINATION || "ramon_bivens@yahoo.com";
  let payload;

  if (type === "subscribe") {
    const email = clean(body.email, 120).toLowerCase();
    if (!validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);

    payload = {
      email,
      message: `Newsletter subscription request from ${email}`,
      _subject: "New Astralis Nova subscriber",
      _template: "table",
    };
  } else if (type === "contact") {
    const name = clean(body.name, 60);
    const email = clean(body.email, 120).toLowerCase();
    const subject = clean(body.subject, 100);
    const message = clean(body.message, 2000);

    if (!name) return json({ error: "Please enter your name." }, 400);
    if (!validEmail(email)) return json({ error: "Please enter a valid email address." }, 400);
    if (!subject) return json({ error: "Please enter a subject." }, 400);
    if (message.length < 5) return json({ error: "Please write a slightly longer message." }, 400);

    payload = {
      name,
      email,
      subject,
      message,
      _replyto: email,
      _subject: `Astralis Nova website: ${subject}`,
      _template: "table",
    };
  } else {
    return json({ error: "Unknown form type." }, 400);
  }

  try {
    const endpoint = `https://formsubmit.co/ajax/${destination}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === "false" || result.success === false) {
      console.error("Form delivery failed", result);
      return json({
        error: result.message || "The message could not be delivered. Please use the direct email link."
      }, 502);
    }

    return json({ ok: true, message: result.message || "Submission delivered." });
  } catch (error) {
    console.error("Form proxy failed", error);
    return json({ error: "The message service is temporarily unavailable." }, 502);
  }
}
