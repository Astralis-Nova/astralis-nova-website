export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on('script[src*="html-midi-player"]', {
      element(element) {
        element.remove();
      },
    })
    .on('link[href="astralis-celestial-drift.css"]', {
      element(element) {
        element.remove();
      },
    })
    .on('script[src="astralis-celestial-drift.js"]', {
      element(element) {
        element.remove();
      },
    })
    .on("head", {
      element(element) {
        element.append('<link rel="icon" type="image/svg+xml" href="/astralis-favicon.svg?v=20260722s"><link rel="alternate icon" type="image/svg+xml" href="/astralis-favicon-static.svg?v=20260722s"><link rel="apple-touch-icon" href="/astralis-favicon-static.svg?v=20260722s"><meta name="theme-color" content="#070c31"><link rel="stylesheet" href="/astralis-celestial-drift.css?v=20260722m"><style>#astralisVulcanBlessing{z-index:99999!important;right:16px!important;bottom:92px!important;width:270px!important;display:block!important;visibility:visible!important;opacity:1!important}@media(max-width:700px){#astralisVulcanBlessing{right:8px!important;bottom:78px!important;width:178px!important}}</style>', { html: true });
      },
    })
    .on("body", {
      element(element) {
        element.append('<script src="/astralis-performance-loader.js?v=20260722v" defer></script><script src="/biography-pet-photobook.js?v=20260724d" defer></script>', { html: true });
      },
    })
    .transform(response);
}
