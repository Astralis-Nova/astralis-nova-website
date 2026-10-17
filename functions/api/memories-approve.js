import { sameSecret } from '../lib/memory-security.js';

const TTL = 48 * 60 * 60 * 1000;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const clean = (v, n) => String(v ?? '').trim().slice(0, n);
function page(title, message, status = 200, form = '', cookie = '') {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(title)}</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#060914;color:#eef6ff;font-family:system-ui;padding:24px;box-sizing:border-box}.card{max-width:620px;padding:30px;border:1px solid #233653;border-radius:22px;background:#0d1425}a{color:#9bd7ff}button{display:block;margin-top:20px;padding:14px;font:inherit;cursor:pointer}label{display:block;line-height:1.6}</style></head><body><main class="card"><h1>${esc(title)}</h1><p>${esc(message)}</p>${form}<p><a href="/memories/">Open Cherished Memories</a></p></main></body></html>`, {
    status, headers: { 'content-type':'text/html; charset=utf-8', 'cache-control':'private, no-store', 'referrer-policy':'no-referrer', 'x-content-type-options':'nosniff',
      'content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'", ...(cookie ? { 'set-cookie':cookie } : {}) }
  });
}
async function pending(env, id, token) {
  const row = await env.DB.prepare('SELECT id,name,email,status,approval_token,created_at FROM memory_access_requests WHERE id=? LIMIT 1').bind(id).first();
  if (!row || !token || !await sameSecret(row.approval_token, token) || row.status !== 'pending') return null;
  const age = Date.now() - Date.parse(row.created_at);
  return Number.isFinite(age) && age >= 0 && age < TTL ? row : null;
}
export async function onRequestGet({ request, env }) {
  if (!env.DB) return page('Archive unavailable', 'The Memories database is not connected.', 503);
  const url = new URL(request.url), id = clean(url.searchParams.get('id'),80), token = clean(url.searchParams.get('token'),180), decision = clean(url.searchParams.get('decision'),20);
  if (!['approve','deny'].includes(decision)) return page('Invalid review link', 'Choose a valid review link.', 400);
  try {
    const row = await pending(env,id,token);
    if (!row) return page('Review link unavailable', 'This link is invalid, already used, or older than 48 hours. Submit a fresh access request if needed.', 400);
    const csrf = crypto.randomUUID();
    const form = `<form action="/api/memories-approve" method="post">${Object.entries({id,token,decision,csrf}).map(([k,v]) => `<input type="hidden" name="${k}" value="${esc(v)}">`).join('')}<label><input type="checkbox" name="confirmed" value="yes" required> I confirm that I want to ${esc(decision)} this access request.</label><button type="submit">Confirm ${esc(decision)}</button></form>`;
    return page('Review family access', `${row.name} (${row.email}) requested access. Opening this page has not changed access. Approval records your decision; the existing private unlock method is still required.`,200,form,
      `nova_memory_review=${csrf}; Path=/api/memories-approve; HttpOnly; Secure; SameSite=Strict; Max-Age=1800`);
  } catch { return page('Review unavailable', 'The request could not be checked. Please try again later.',503); }
}
export async function onRequestPost({ request, env }) {
  if (!env.DB) return page('Archive unavailable', 'The Memories database is not connected.',503);
  if (request.headers.get('origin') !== new URL(request.url).origin) return page('Confirmation rejected', 'Open the private review link and confirm there.',403);
  if (Number(request.headers.get('content-length') || 0) > 4096) return page('Confirmation rejected','The confirmation is too large.',413);
  try {
    const reader = request.body.getReader(); let text = '', size = 0; const decoder = new TextDecoder();
    while (true) { const {done,value} = await reader.read(); if (done) break; size += value.length; if (size > 4096) { await reader.cancel(); return page('Confirmation rejected','The confirmation is too large.',413); } text += decoder.decode(value,{stream:true}); }
    text += decoder.decode();
    const form = new URLSearchParams(text);
    const id = clean(form.get('id'),80), token = clean(form.get('token'),180), decision = clean(form.get('decision'),20), csrf = clean(form.get('csrf'),80);
    const cookie = request.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('nova_memory_review='))?.split('=')[1] || '';
    if (!csrf || !cookie || !await sameSecret(csrf,cookie) || form.get('confirmed') !== 'yes' || !['approve','deny'].includes(decision)) return page('Confirmation rejected','Review the request again and explicitly confirm your decision.',403);
    const row = await pending(env,id,token);
    if (!row) return page('Review link unavailable','This link has expired, was already used, or is invalid.',400);
    const now = new Date().toISOString(), cutoff = new Date(Date.now()-TTL).toISOString();
    const statements = [];
    if (decision === 'approve') statements.push(env.DB.prepare(`INSERT INTO memory_people(id,display_name,email,status,access_level,created_at,updated_at)
      SELECT ?,name,email,'approved','member',?,? FROM memory_access_requests WHERE id=? AND status='pending' AND approval_token=? AND created_at>?
      ON CONFLICT(email) DO UPDATE SET display_name=excluded.display_name,status='approved',updated_at=excluded.updated_at`).bind(crypto.randomUUID(),now,now,id,token,cutoff));
    statements.push(env.DB.prepare("UPDATE memory_access_requests SET status=?,approval_token='',updated_at=? WHERE id=? AND status='pending' AND approval_token=? AND created_at>?").bind(decision === 'approve'?'approved':'denied',now,id,token,cutoff));
    const results = await env.DB.batch(statements);
    if (!results.at(-1).meta.changes) return page('Request already reviewed','No additional access change was made.',409);
    return page('Decision saved',`${row.name}'s request was ${decision === 'approve'?'approved':'denied'}.`,200,'','nova_memory_review=; Path=/api/memories-approve; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
  } catch { return page('Approval failed','The request could not be updated. Please try the review link again.',503); }
}
