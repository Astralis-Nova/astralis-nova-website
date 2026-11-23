const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=120", "x-content-type-options": "nosniff" }
});
export async function onRequestGet({ request, env }) {
  if (!env.ACINFO_DB) return json({ error: "ACInfo index is not configured yet." }, 503);
  const slug = (new URL(request.url).searchParams.get("slug") || "").trim();
  if (!/^[a-z0-9][a-z0-9-]{0,180}$/i.test(slug)) return json({ error: "Invalid article." }, 400);
  try {
    const article = await env.ACINFO_DB.prepare(
      "SELECT slug,title,source,source_url,license,attribution,summary,body_key,body_text FROM acinfo_articles WHERE slug = ?"
    ).bind(slug).first();
    if (!article) return json({ error: "Article not found." }, 404);
    if (article.body_key) {
      if (!env.ACINFO_ARCHIVE) return json({ error: "Article storage is not configured." }, 503);
      const object = await env.ACINFO_ARCHIVE.get(article.body_key);
      if (!object) return json({ error: "Archived article unavailable." }, 404);
      // Text is stored as individual .txt files in R2 with HTTP object compression,
      // so Workers can stream the response without unzipping a multi-gigabyte file.
      article.body_text = await object.text();
    }
    delete article.body_key;
    return json({ article });
  } catch {
    return json({ error: "Unable to retrieve this article." }, 503);
  }
}
