# Astralis Nova Chess Portal

A two-player asynchronous chess portal for the Astralis Nova website.

## What ships in this release

- Standard chess with legal-move validation, castling, en passant, promotion, check, checkmate, stalemate and draw detection through pinned `chess.js` 1.4.0.
- Nova Tri-Deck, an original three-layer variant with Upper, Core and Lower boards.
- Original sci-fi SVG units: High Commander, Oracle Core, Citadel, Phase Seer, Warp Strider and Drone Sentinel.
- Local saved training games through `localStorage`.
- Online correspondence games through Cloudflare Pages Functions and D1.
- Shareable game codes and invite links.
- Player-specific secret tokens stored only in each player's browser.
- Optimistic revision checks so two moves cannot silently overwrite each other.
- Automatic opponent-move polling every 12 seconds.
- Responsive desktop/mobile layouts, sound cues, board rotation, fullscreen mode and installable PWA metadata.

## Public routes

- `/chess/` — main portal
- `/chess.html` — convenience redirect
- `/api/chess?action=health` — D1 readiness check

## One-time Cloudflare setup

The existing site can continue deploying as a normal Cloudflare Pages project. The new online mode needs one D1 database binding.

### 1. Create the database

From the repository folder:

```powershell
npx wrangler d1 create astralis-nova-chess
```

Copy the returned database ID for your records.

### 2. Install the schema

```powershell
npx wrangler d1 execute astralis-nova-chess --remote --file=./database/chess-schema.sql
```

### 3. Bind D1 to the Pages project

In Cloudflare:

1. Open **Workers & Pages**.
2. Select the Astralis Nova Pages project.
3. Open **Settings > Bindings**.
4. Add a **D1 database binding**.
5. Set the variable name to exactly `DB`.
6. Select `astralis-nova-chess`.
7. Save and redeploy the site.

Using the dashboard binding avoids introducing a Wrangler configuration file that might accidentally replace existing Pages project settings.

### 4. Verify the connection

Open:

```text
https://YOUR-SITE/api/chess?action=health
```

Expected response:

```json
{"ok":true,"service":"astralis-nova-chess","storage":"D1"}
```

Then open `/chess/`, create a game and copy the invite link into another browser or device.

## Nova Tri-Deck rules

- All units begin on the Core deck.
- Units move using their familiar chess movement on their current deck.
- Any non-pawn unit may spend a turn phase-shifting to the same square on an adjacent deck if that destination is empty.
- Drone Sentinels may phase-shift only while standing on one of the four glowing portal nodes: `d4`, `e4`, `d5`, `e5`.
- There is no check/checkmate rule in Tri-Deck v1.
- Capture the opposing High Commander to win.
- Drone Sentinels promote to an Oracle Core on the final rank.

## Security and fairness model

The API protects player actions with 256-bit random player tokens, stores only SHA-256 token hashes, enforces whose turn it is and uses a revision number to prevent stale overwrites.

The browser validates standard and Tri-Deck moves. The server currently validates identity, turn order, revision and payload shape, but it does not independently reconstruct every chess move. This release is appropriate for friendly games. A future tournament-hardening pass should vendor the chess engine into the Worker and validate each submitted transition server-side.

## Files

```text
chess.html
chess/
  index.html
  chess.css
  chess.js
  pieces.js
  icon.svg
  manifest.webmanifest
  sw.js
functions/api/chess.js
database/chess-schema.sql
```

## Suggested next upgrades

- Homepage feature card linking to `/chess/`.
- Email or browser notifications when an opponent moves.
- Accounts, public profiles and match history.
- Draw offers and rematch workflow.
- Server-side legal-move reconstruction.
- Ranked Tri-Deck seasons and spectator mode.
