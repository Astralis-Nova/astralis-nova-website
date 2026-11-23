# ACInfo search foundation (not yet a populated mirror)

This is a non-destructive Cloudflare Pages prototype. It adds /acinfo.html and two read-only endpoints. **No wiki content has been imported.** Review source licensing and attribution, especially for images, before redistribution.

## Architecture
- Dedicated D1 binding `ACINFO_DB` holds article metadata and a SQLite FTS5 index.
- Optional R2 binding `ACINFO_ARCHIVE` holds individual UTF-8 text objects addressed by `body_key`. R2 supports storage-level compression; do not store one huge ZIP that requires decompression per request.
- Metadata has `source`, `source_url`, `license`, and `attribution` for clear provenance. Keep retail, Hollowtide and Astralis separate.
- Keep the untouched original compressed archive as a private, versioned preservation backup outside the public Git repository.
- Images are deferred to a future stage pending source license verification and asset mapping.

## Deployment (requires Cloudflare dashboard access)
1. Create a **new** D1 database named `ACINFO_DB`, not the existing `DB` or `CHESS_DB`.
2. Apply `acinfo/schema.sql` using Wrangler's D1 execute facility.
3. Bind that database as `ACINFO_DB` to Pages production and preview environments.
4. If using R2-backed article bodies, create an R2 bucket and bind it as `ACINFO_ARCHIVE` (do not commit its credentials).
5. Extract the preservation archive locally. Audit reuse rights and normalize UTF-8 article text; generate one unique URL-safe slug per article. Import metadata with `body_key` or `body_text`, plus a matching FTS row.
6. Verify search, pagination/data completeness, attribution, malformed queries, resource limits and licensing in a preview deployment before merging.

## Import contract
For each article:
- Insert into `acinfo_articles` fields `slug,title,source,source_url,license,attribution,summary,body_key` (or `body_text`).
- Obtain its numeric `id`.
- Insert `(rowid,title,body)` into `acinfo_fts` with the exact same `id`. `body` contains searchable plain text, including any relevant categories.
- Slugs must match `[A-Za-z0-9][A-Za-z0-9-]{0,180}`.
- Recommended ingestion is resumable in batches with checkpointing, deduplication and integrity checks.
- Never import server-exclusive wiki material as original retail content.

## Known limits
- No AI answer generator in this prototype. Ordinary full-text search is cheaper and gives source-linked results first.
- The FTS query currently requires **all** query terms. Add a safe fuzzy/ranked fallback after evaluating the corpus.
- The article endpoint returns plain text (not raw third-party HTML) to avoid scripting injection.
- Source archives can contain database dumps and images not directly supported by this importer; conversion tooling remains to be developed once the actual archive format is inspected.
- We should not claim the full corpus is online until an import report confirms counts.
