// Remote memory analysis is owner-only. No vault key or wake phrase leaves the browser.
export async function sameSecret(a, b) {
  const digest = value => crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const [left, right] = await Promise.all([digest(a), digest(b)]);
  const x = new Uint8Array(left), y = new Uint8Array(right);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function authorizeMemoryAI(request, env) {
  const fail = (error, status) => new Response(JSON.stringify({ error }), {
    status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...(status === 429 ? { 'retry-after': '60' } : {}) }
  });
  const secret = env.MEMORY_AI_TOKEN || env.ADMIN_TOKEN;
  if (!secret) return fail('Online memory analysis is not configured. Local analysis is available.', 503);
  const supplied = (request.headers.get('authorization') || '').replace(/^Bearer /, '');
  if (!supplied || !await sameSecret(supplied, secret)) return fail('Owner authorization is required for online analysis.', 401);
  if (request.headers.get('origin') !== new URL(request.url).origin || request.headers.get('x-nova-consent') !== 'preview-confirmed') {
    return fail('Review and confirm the online analysis preview first.', 403);
  }
  if (!env.DB) return fail('Online analysis rate limiting is unavailable. Use local analysis.', 503);
  // Atomic counters in existing D1 work across isolates and fail closed on errors.
  try {
    await env.DB.prepare('CREATE TABLE IF NOT EXISTS memory_ai_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)').run();
    const now = Date.now();
    for (const [period, limit] of [[60000, 6], [86400000, 100]]) {
      const bucket = `owner:${period}:${Math.floor(now / period)}`;
      const result = await env.DB.prepare(`INSERT INTO memory_ai_limits(bucket,count,expires) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 WHERE count<? RETURNING count`).bind(bucket, now + period * 2, limit).first();
      if (!result) return fail('Online analysis limit reached. Try again later or use local analysis.', 429);
    }
    await env.DB.prepare('DELETE FROM memory_ai_limits WHERE expires<?').bind(now).run();
  } catch {
    return fail('Online analysis protection is unavailable. Use local analysis.', 503);
  }
  return null;
}

export async function readLimitedJson(request, limit = 48000) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('A JSON body is required.');
  let size = 0; const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('Submission is too large.'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
