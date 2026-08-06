export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  const url = new URL(context.request.url);
  const isHomepage = url.pathname === "/" || url.pathname === "/index.html";
  if (!isHomepage) return response;

  return new HTMLRewriter()
    .on('script[src*="html-midi-player"]', {
      element(element) { element.remove(); },
    })
    .on('link[href="astralis-celestial-drift.css"]', {
      element(element) { element.remove(); },
    })
    .on('script[src="astralis-celestial-drift.js"]', {
      element(element) { element.remove(); },
    })
    .on("head", {
      element(element) {
        element.append('<link rel="icon" type="image/svg+xml" href="/astralis-favicon.svg?v=20260722s"><link rel="alternate icon" type="image/svg+xml" href="/astralis-favicon-static.svg?v=20260722s"><link rel="apple-touch-icon" href="/astralis-favicon-static.svg?v=20260722s"><meta name="theme-color" content="#070c31"><link rel="stylesheet" href="/astralis-celestial-drift.css?v=20260722m"><style>.midi-relics,.astralis-planet-link[href="/conquest.html"],.astralis-planet-link[href="#guestbook"]{display:none!important}</style>', { html: true });
      },
    })
    .on("body", {
      element(element) {
        element.append('<script src="/astralis-performance-loader.js?v=20260806f" defer></script><script src="/astralis-motion-restore.js?v=20260727a" defer></script><script src="/biography-zoey-gallery.js?v=20260726c" defer></script><script src="/biography-rian-gallery.js?v=20260726a" defer></script><script src="/biography-pet-photobook.js?v=20260726e" defer></script><script src="/darktide-catalog.js?v=20260806a" defer></script>', { html: true });
      },
    })
    .transform(response);
}
