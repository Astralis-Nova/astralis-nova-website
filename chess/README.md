# Nova Chess Front End

This folder is self-contained and can be served directly by Cloudflare Pages.

- `index.html` contains the portal interface and dialogs.
- `chess.css` contains the responsive command-bridge design and seven-board sculpture.
- `pieces.js` draws the original character-style sci-fi piece set as inline SVG.
- `trideck-engine.js` defines the 64-square topology and Nova Tri-Deck move rules.
- `chess.js` runs standard chess, renders both modes, handles local saves and connects to the online API.
- `trideck-engine.test.mjs` verifies the topology, phase routes, platform transfers and victory condition.
- `sw.js` provides a network-first cache for the portal shell.

The standard engine is pinned to `chess.js@1.4.0` through jsDelivr's ESM endpoint. Online game storage is optional. Without the D1 binding, the interface continues in local training mode.
