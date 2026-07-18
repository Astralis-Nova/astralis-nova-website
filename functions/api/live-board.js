export async function onRequest({ request, env }) {
  if (!env.LIVE_BOARD) {
    return new Response("Live board binding is missing.", { status: 503 });
  }

  const upgrade = request.headers.get("Upgrade");
  if (!upgrade || upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket upgrade.", { status: 426 });
  }

  const room = env.LIVE_BOARD.idFromName("astralis-main-board");
  return env.LIVE_BOARD.get(room).fetch(request);
}
