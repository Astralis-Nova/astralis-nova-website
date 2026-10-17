# Privacy and reliability release

## Data preservation and compatibility

The encrypted `memories/vault.enc.json`, original media and artwork are unchanged.
The constellation tap sequence and wake-phrase normalization, PBKDF2 parameters,
archive key, stable learning key, IndexedDB database names, store layouts, and
encrypted backup versions are unchanged. No re-encryption or migration is needed.
Saved learning, family imports, experiences, and attachments reopen with the same
phrase. Inactivity locking reloads the document after 15 minutes without input;
it discards plaintext and keys, without clearing storage. Unsaved form drafts must
be saved before leaving the device unattended.

## Online analysis

Default cognitive analysis and Experience Chamber extraction now run on the device.
No photos or attachments are automatically uploaded. The optional cognitive action
shows the exact request and requires consent for each send. The owner token is used
only for that request; it is not stored. It is separate from the vault wake phrase.

The API uses `MEMORY_AI_TOKEN` when configured, otherwise the existing `ADMIN_TOKEN`.
Do not share an admin token with family members. A dedicated MEMORY_AI_TOKEN is
recommended if online analysis is used. Without an owner token or the existing D1
`DB` binding the route fails closed; local analysis continues to work. `AI` is the
existing Workers AI binding; no new paid service is introduced. Online model usage
uses the existing account quota. Limits are six authorized calls per minute and
100 per UTC day, shared across the two private analysis routes. Counters live in
the new, additive `memory_ai_limits` table created on first authorized use.

## Access requests

Existing links open a read-only review page. Only an explicit checkbox and same-origin
POST with a short-lived review cookie can approve/deny. Tokens expire 48 hours after
the existing created_at timestamp, and are consumed on use. Expired pending requests
can be submitted again. Existing approved people and album permissions are retained.
Approval records the owner's decision; it does not distribute the vault phrase or
introduce a family login. That existing unlock boundary is preserved.

## Player and motion

Player shell cache v19 normalizes versioned URLs, includes all current entry-point
assets and radio controls, and retains `astralis-nova-offline-audio-v1`. Private pages,
API responses and external radio streams are not cached by the player worker. Existing
downloaded audio is retained, including Megamix; range and suffix requests support
seeking. Shell installation still needs one online visit; saved music uses device
storage and may be subject to browser eviction.

Background/offscreen CSS motion, decorative muted autoplay video, car/pyramid canvas,
and the player visualizer now coordinate with visibility and reduced motion. Existing
character artwork and rigs are retained. Toon Planet has no new visible words.

## Validation

Run `python scripts/check-site-resources.py` and
`node --test tests/*.test.* chess/*.test.mjs`. The release workflow additionally checks
privacy, approval expiry/CSRF, settings damage, playback recovery, offline cache keys,
saved-audio retention and range responses. Security tests use synthetic records and
an in-memory SQLite database; no production family data or emails are used.
