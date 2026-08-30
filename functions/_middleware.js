export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const isHomepage = pathname === "/" || pathname === "/index.html";
  const isBiography = pathname === "/biography.html" || pathname === "/biography";

  // Standalone pages should stay standalone. Only the homepage receives the
  // Astralis-wide visual/runtime stack, while biography receives its own
  // gallery enhancements.
  if (!isHomepage && !isBiography) return response;

  const rewriter = new HTMLRewriter();

  if (isHomepage) {
    rewriter
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
          element.append('<script src="/astralis-performance-loader.js?v=20260830p" defer></script><script src="/astralis-motion-restore.js?v=20260727a" defer></script>', { html: true });
        },
      });
  }

  if (isBiography) {
    rewriter.on("body", {
      element(element) {
        element.append('<script src="/biography-zoey-gallery.js?v=20260726c" defer></script><script src="/biography-rian-gallery.js?v=20260726a" defer></script><script src="/biography-pet-photobook.js?v=20260830a" defer></script>', { html: true });
      },
    });
  }

  return rewriter.transform(response);
}
