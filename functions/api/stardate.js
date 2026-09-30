export function onRequest({ request }) {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, max-age=0',
    'X-Content-Type-Options': 'nosniff'
  };
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...headers, Allow: 'GET, HEAD' } });
  }
  return new Response(request.method === 'HEAD' ? null : JSON.stringify({ now: Date.now(), timeZone: 'America/Phoenix' }), { headers });
}
