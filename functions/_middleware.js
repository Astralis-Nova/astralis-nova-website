export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("body", {
      element(element) {
        element.append('<link rel="stylesheet" href="/astralis-celestial-drift.css?v=20260721c"><script src="/site-fixes.js?v=20260720c" defer></script><script src="/cosmic-worlds.js?v=20260720a" defer></script><script src="/recent-exoplanets.js?v=20260721c" defer></script><script src="/conquest-media.js?v=20260720a" defer></script><script src="/realistic-orbit.js?v=20260721b" defer></script><script src="/astralis-celestial-drift.js?v=20260721c" defer></script><script src="/astralis-ai-upgrades.js?v=20260721a" defer></script>', { html: true });
      },
    })
    .transform(response);
}
