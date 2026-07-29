# Nova Chess Front End

This folder is self-contained and can be served directly by Cloudflare Pages.

- `index.html` contains the portal interface and dialogs.
- `chess.css` contains the responsive command-bridge design and layered boards.
- `pieces.js` draws the original sci-fi piece set as inline SVG.
- `chess.js` runs standard chess, Nova Tri-Deck, local saves and the online API client.
- `sw.js` provides a network-first cache for the portal shell.

The standard engine is pinned to `chess.js@1.4.0` through jsDelivr's ESM endpoint. Online game storage is optional. Without the D1 binding, the interface continues in local training mode.
