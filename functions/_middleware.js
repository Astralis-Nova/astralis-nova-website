export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("body", {
      element(element) {
        element.append('<link rel="stylesheet" href="/astralis-celestial-drift.css?v=20260721c"><script src="/site-fixes.js?v=20260720c" defer></script><script src="/cosmic-worlds.js?v=20260720a" defer></script><script src="/recent-exoplanets.js?v=20260721c" defer></script><script src="/conquest-media.js?v=20260720a" defer></script><script src="/realistic-orbit.js?v=20260721b" defer></script><script src="/astralis-celestial-drift.js?v=20260721c" defer></script><script src="/astralis-ai-upgrades.js?v=20260721a" defer></script><script src="/astralis-stragglers.js?v=20260721c" defer></script><script src="/astralis-nova-explorer.js?v=20260722e" defer></script><script src="/vulcan-salute.js?v=20260722f" defer></script><script>setTimeout(()=>{if(!document.getElementById("astralisVulcanBlessing")){const b=document.createElement("button");b.id="astralisVulcanBlessingFallback";b.type="button";b.setAttribute("aria-label","Live long and prosper");b.style.cssText="position:fixed;right:10px;bottom:126px;z-index:99999;border:1px solid rgba(141,232,255,.55);border-radius:22px;padding:10px 14px;background:rgba(3,12,23,.95);color:#e9fbff;box-shadow:0 0 30px rgba(84,154,255,.38);font-size:1rem;cursor:pointer";b.innerHTML="<span style=\"display:block;font-size:3rem;line-height:1\">🖖</span><span style=\"display:block;margin-top:7px;font-size:.6rem;letter-spacing:.12em;text-transform:uppercase\">Live Long and Prosper</span>";document.body.appendChild(b)}},2200);</script><script src="/cosmic-chuckles.js?v=20260722a" defer></script><script src="/hawking-quote-data-a.js?v=20260722a" defer></script><script src="/hawking-quote-data-b.js?v=20260722a" defer></script><script src="/hawking-quote.js?v=20260722a" defer></script>', { html: true });
      },
    })
    .transform(response);
}
