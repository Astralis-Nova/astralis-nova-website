# Astralis Nova Chess Front End

This folder is self-contained and can be served directly by Cloudflare Pages.

- `index.html` is the live seven-deck, 64-square command board.
- `trid-core-v5.js` contains the version 6 W3DCF-based rules engine, Nova opponent, saves, and glass-piece renderer.
- `trid-command-board-v6.css` is the final responsive floating-glass visual layer.
- `trid-locked-layout.js` locks the three 4×4 main boards and four movable 2×2 attack boards into the approved silhouette.
- `trid-online-v1.js` connects local play to the optional online mission API.
- `trid-core-v6.test.mjs` audits blocking across levels, alternating turns, castling, en passant, promotion, and attack-board ownership/movement.
- `trideck-engine.test.mjs` retains regression coverage for the earlier four-platform coordinate mapper.

The active Tri-D rules follow Jens Meder & friends' 2013 tournament edition, with Astralis Nova's optional 180-degree attack-board rotation retained as a house extension. Online game storage is optional; without D1, the interface continues in local training mode.
