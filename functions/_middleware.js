export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.append('<link rel="icon" type="image/svg+xml" href="/astralis-favicon.svg?v=20260722s"><link rel="alternate icon" type="image/svg+xml" href="/astralis-favicon-static.svg?v=20260722s"><link rel="apple-touch-icon" href="/astralis-favicon-static.svg?v=20260722s"><meta name="theme-color" content="#070c31">', { html: true });
      },
    })
    .on("body", {
      element(element) {
        element.append('<link rel="stylesheet" href="/astralis-celestial-drift.css?v=20260722m"><style>#astralisVulcanBlessing{z-index:99999!important;right:16px!important;bottom:92px!important;width:270px!important;display:block!important;visibility:visible!important;opacity:1!important}@media(max-width:700px){#astralisVulcanBlessing{right:8px!important;bottom:78px!important;width:178px!important}}</style><script src="/site-fixes.js?v=20260720c" defer></script><script src="/cosmic-worlds.js?v=20260720a" defer></script><script src="/rickroll-planet.js?v=20260722a" defer></script><script src="/recent-exoplanets.js?v=20260722n" defer></script><script src="/conquest-media.js?v=20260720a" defer></script><script src="/realistic-orbit.js?v=20260721b" defer></script><script src="/astralis-celestial-drift.js?v=20260722m" defer></script><script src="/astralis-ai-upgrades.js?v=20260722q" defer></script><script src="/astralis-stragglers.js?v=20260722q" defer></script><script src="/realistic-galaxy-upgrade.js?v=20260722r" defer></script><script src="/astralis-brand-orbit.js?v=20260722s" defer></script><script src="/final-visual-fixes.js?v=20260722q" defer></script><script src="/astralis-nova-explorer.js?v=20260722e" defer></script><script src="/vulcan-salute.js?v=20260722l" defer></script><script src="/cosmic-chuckles.js?v=20260722a" defer></script><script src="/hawking-quote-data-a.js?v=20260722a" defer></script><script src="/hawking-quote-data-b.js?v=20260722a" defer></script><script src="/hawking-quote.js?v=20260722a" defer></script>', { html: true });
      },
    })
    .transform(response);
}
