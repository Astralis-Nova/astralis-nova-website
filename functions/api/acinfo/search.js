const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=60", "x-content-type-options": "nosniff" }
});
export async function onRequestGet({ request, env }) {
  if (!env.ACINFO_DB) return json({ error: "ACInfo index is not configured yet." }, 503);
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  const source = (url.searchParams.get("source") || "").trim();
  if (!q) return json({ results: [] });
  const terms = q.normalize("NFKC").match(/[\p{L}\p{N}]+/gu)?.slice(0, 8) || [];
  if (!terms.length) return json({ results: [] });
  const match = terms.map(term => '"' + term.replace(/"/g, '""') + '"*').join(" AND ");
  try {
    const sql = `SELECT a.slug, a.title, a.source, a.summary, a.source_url,
      snippet(acinfo_fts, 1, '[', ']', '…', 22) AS excerpt
      FROM acinfo_fts JOIN acinfo_articles a ON a.id = acinfo_fts.rowid
      WHERE acinfo_fts MATCH ? ${source ? "AND a.source = ?" : ""}
      ORDER BY bm25(acinfo_fts, 9.0, 1.0) LIMIT 30`;
    const params = source ? [match, source] : [match];
    const result = await env.ACINFO_DB.prepare(sql).bind(...params).all();
    return json({ query: q, results: result.results || [] });
  } catch {
    return json({ error: "ACInfo search is temporarily unavailable." }, 503);
  }
}
