# Website audit — 5 October 2026

Scope: 35 HTML pages inventoried; 927 original HTML/CSS/JavaScript references examined; 578 unique internal and external URLs requested (303 internal, 275 external). Public pages and main interactive features were checked in a signed-in browser session, including song search/playback, popups, community rendering, the player, and chess moves. Community posts, payments, administrative writes, and multiplayer invitations were not submitted.

## Confirmed defects repaired

- Missing `Turn Your Eyes` MIDI: correct the filename's case for Linux hosting.
- First-visit music volume: preserve the 35% default when no stored preference exists, while retaining a saved mute setting.
- Simultaneous playback: the catalog player and background dock now pause each other.
- Rainbow Promise's broken external photo: use a locally hosted, optimized photo with corrected author/license attribution.
- Chess reliability: bundle chess.js 1.4.0 and the historical legacy controller locally rather than loading them from third-party CDNs. Update diagnostic checks to match the current combat controller.
- Refresh affected script version URLs and repair a stale cache-version test assertion.

## Validation

- All 89 Node tests pass, including new first-visit/stored volume, mutual audio pause, and bundled chess engine regression checks.
- All 166 JavaScript files pass syntax checks; 24 inline script blocks were checked during the initial audit.
- The reusable resource checker passes across all 35 HTML files and 923 current references. It checks local file destinations and duplicate IDs; dynamic anchors require browser checks.
- Deployment runs the resource checker and regression tests on future pushes.

## Limits and external destinations

Most URLs returned success. Some Fandom, ACpedia, NIH and Asheron's Guide destinations blocked requests or timed out. Two TIME URLs returned 404 to the HTTP client but the exact articles remain discoverable with their original URLs through web search. These are left intact pending normal-browser confirmation; automated rejection does not establish a broken destination. A successful status alone also does not prove that a third-party page's content, download, video, or stream works.

The check does not certify every dynamic API path, outbound link embedded in generated content, radio stream, browser/device combination, accessibility requirement, security property, or administrative operation. Missing local resources can be masked by Cloudflare's HTML fallback; the filesystem checker is therefore retained alongside HTTP checks.
