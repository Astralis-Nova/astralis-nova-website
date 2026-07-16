const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export async function onRequestDelete({ request, env, params }) {
  if (!env.DB) return json({ error: "Guestbook database is not connected." }, 503);
  if (!env.ADMIN_TOKEN) return json({ error: "Admin deletion is not configured." }, 503);

  const authorization = request.headers.get("authorization") || "";
  if (authorization !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json({ error: "Unauthorized." }, 401);
  }

  const id = String(params.id || "").trim();
  if (!id || id.length > 80) return json({ error: "Invalid entry ID." }, 400);

  try {
    const result = await env.DB.prepare(
      "DELETE FROM guestbook_entries WHERE id = ?"
    ).bind(id).run();

    return json({ ok: true, deleted: Number(result.meta?.changes || 0) });
  } catch (error) {
    console.error("Guestbook DELETE failed", error);
    return json({ error: "The entry could not be deleted." }, 500);
  }
}
