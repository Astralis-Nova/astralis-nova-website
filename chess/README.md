# Nova Chess Front End

This folder is self-contained and can be served directly by Cloudflare Pages.

- `index.html` contains the portal interface and dialogs.
- `chess.css` contains the responsive command-bridge design and four-platform sculpture.
- `pieces.js` draws the original Astralis Staunton-style sci-fi set as inline SVG.
- `trideck-engine.js` maps a complete 8×8 chess grid onto four elevated 8×2 platforms.
- `chess.js` runs standard chess, renders both modes, handles local saves and connects to the online API.
- `trideck-engine.test.mjs` verifies all 64 squares, platform boundaries, home ranks, middle ranks and rotated orientation.
- `sw.js` provides a network-first cache for the portal shell.

Both Standard and Tri-Deck legality use `chess.js@1.4.0`, pinned through jsDelivr's ESM endpoint. Online game storage is optional. Without the D1 binding, the interface continues in local training mode.
