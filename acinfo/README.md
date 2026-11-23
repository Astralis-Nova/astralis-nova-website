# ACInfo • Astralis Nova (preview branch)

This is a source-aware, searchable archive foundation for ACWorlds.
**No ACPedia archive has been imported or published yet.**
The live website is unchanged until review and merge.

## What is implemented

- `/acinfo.html`: standalone search and article viewer, text safely rendered without HTML injection.
- `/api/acinfo/search`: parameterized D1 full-text (FTS5) search with snippets.
- `/api/acinfo/article`: loads one article, decompressing its .txt.gz object from R2 when needed.
- `schema.sql`: **dedicated** ACINFO_DB with article attribution, source, title, and search index.
- `import_archive.py`: streaming MediaWiki XML (.xml, .gz, .bz2) **or** normalized JSONL input, deterministic slugs, checked batches, and individually compressed gzip article objects.
- `test_import_archive.py`: fixtures for XML extraction, duplicate handling, gzip decompression, and SQLite FTS5 retrieval.

## Real archive format matters

The ACCPP v1.1 release is a **4.1 GB .7z Docker/MediaWiki server bundle**, not a ready-to-run MediaWiki XML export. The importer DOES NOT directly ingest the .7z, Docker images, MariaDB tables, or media files. It requires exporting page content to MediaWiki XML or JSONL first (after local installation and legal review). The media files and full revision histories also require a future, separate pipeline.

Official project information:
https://www.reddit.com/r/AsheronsCall/comments/1xnbekp/

Do not upload the 4.1 GB release into GitHub or Cloudflare Pages.

## Local importer test

```sh
python -m unittest discover -s acinfo -p 'test_*.py' -v
```

## Convert and import (after obtaining a suitable licensed XML export)

```sh
python acinfo/import_archive.py \
  --input exported-pages.xml.gz --format mediawiki \
  --output ./acinfo-import-001 --source retail \
  --source-url https://asheron.info/wiki/index.php/ \
  --license 'REPLACE_WITH_VERIFIED_LICENSE' \
  --attribution 'REPLACE_WITH_VERIFIED_CREDITS'
```

- `batch-NNNNN.sql` files go to the new D1 ACINFO_DB only, one at a time.
- `r2/articles/*.txt.gz` go to the ACINFO_ARCHIVE R2 bucket, retaining the `articles/` prefix.
- `manifest.json` reports counts; compare it with the actual export article count before declaring completeness.
- R2 upload and D1 migration require authenticated Cloudflare access and are intentionally **not** automated in this branch.
- Import SQL batches use inserts; reimport to a fresh database or implement an explicit, tested upsert before reruns.

## Cloudflare configuration

1. Create new D1 database `ACINFO_DB`, leaving `DB` and `CHESS_DB` untouched.
2. Execute `acinfo/schema.sql` in ACINFO_DB (not in the other databases).
3. Bind the new database to Pages Functions as `ACINFO_DB`.
4. Create R2 bucket and bind `ACINFO_ARCHIVE`; upload individual .txt.gz objects.
5. Test search, articles, malformed queries, credits, content completeness and costs on a preview URL.
6. Merge only after tests and archival attribution/license review.

### Preservation and reuse

Keep a separate, untouched master archive locally, with checksum and metadata. Attribute all original wiki contributors, preserve source URLs, follow applicable content/image licenses, and keep retail, Hollowtide, and Astralis data visibly distinct.

### Known limits

This is **search infrastructure, not the full wiki mirror**: no media converter, original revision history, MediaWiki templates, AI answer generation, sitemap, or complete source ingestion yet. Plain-text extraction removes some markup, and the full-text index duplicates article text for fast retrieval. Benchmark D1 storage and read/write quotas after a sample batch. An unverified .7z file is never safe to execute or publish blindly.
