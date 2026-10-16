export async function onRequest({ request, env }) {
  if (!env.LIVE_BOARD) {
    return new Response("Live board binding is missing.", { status: 503 });
  }

  const upgrade = request.headers.get("Upgrade");
  if (!upgrade || upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket upgrade.", { status: 426 });
  }

  // Start a fresh shared room for the Bugs Bunny reset board so older visitor
  // scribbles do not reappear from the previous room's persisted stroke history.
  // Keep this name stable so new drawings remain shared across visits.
  const room = env.LIVE_BOARD.idFromName("astralis-main-board-bugs-20261016");
  return env.LIVE_BOARD.get(room).fetch(request);
}
