# ACInfo | Astralis Nova (preview branch)

**Source decision: ACpedia preservation archive only.**
Reference archive: https://www.bartleskeet.com/archives/acpedia/site/index.html

This branch is an unfinished, read-only search foundation for ACWorlds.
**No full ACpedia archive has been imported or published.** The live website is unchanged until this draft is reviewed and merged.

## What exists

- acinfo.html: safe plain-text article viewer and search UI
- functions/api/acinfo/search.js: parameterized D1 FTS5 keyword search
- functions/api/acinfo/article.js: fetches one article and decompresses an R2 gzip object
- schema.sql: dedicated ACINFO_DB schema, separate from DB and CHESS_DB
- import_acpedia_index.py: builds a **title-only** local search index from one saved ACpedia index.html, without crawling
- import_acpedia_html.py: converts a **locally obtained** copy of the ACpedia archive's static HTML pages into JSONL
- import_archive.py: builds an indexed D1 import and individual R2 compressed objects from JSONL
- test_import_acpedia_html.py and test_import_archive.py: offline conversion and search tests

## Selected ACpedia source

The archive describes itself as an offline rebuild of acpedia.org from Wayback captures (2012–2025), reporting **37,811 pages and 56,249 images** on its index when inspected in November 2026.

- Archive index: https://www.bartleskeet.com/archives/acpedia/site/index.html
- Archived article pages: https://www.bartleskeet.com/archives/acpedia/site/m/
- We will not combine this source with other wiki releases.
- The archive's public index does **not** prove permission to mass-download, republish, or copy every image. Obtain a permitted local copy and verify article/image rights and contributor credits before publishing.
- The HTML conversion is text-only; media assets, page layout, and wiki revision history are **not** yet preserved in ACInfo.
- Compare resulting counts against the local input and the archive's reported counts. An index count is not an import-completeness guarantee.

## Quick title search from the existing ACpedia index

Until we have a permitted full-content mirror, ACInfo can search titles and link back to the independently hosted archive. This makes **no full-article or image copies**.

1. Save the single archive index page from https://www.bartleskeet.com/archives/acpedia/site/index.html as **HTML only** in D:\AC\Archives\acpedia-index.html. Do not mirror/crawl its individual article links.
2. From the repository root, generate the small static index:

~~~powershell
python acinfo/import_acpedia_index.py --input "D:\AC\Archives\acpedia-index.html" --output "acinfo/acpedia-index.json"
~~~

3. Review the file's article count and several URLs before putting it on a preview deployment. The archive reports 37,811 pages; the actual usable link count may differ. Do **not** label the collection complete without checking.
4. The ACInfo search page automatically searches this local title index when its D1 full-text search is not yet configured. Results open the archived article directly; there is no proxying or request burst to the archive.

This index file is not in the draft branch yet: the actual HTML index has not been downloaded in this workspace. Do not claim title search is live before the file is created and deployed.

## Attribution and license

The preserved ACpedia copyright page explicitly identifies community-contributed wiki **text** as CC BY-SA 3.0:
https://www.bartleskeet.com/archives/acpedia/site/m/Asheron-s_Call_Community_Wiki-Copyrights.html

- Keep a visible link to https://creativecommons.org/licenses/by-sa/3.0/ and credit the original ACpedia community contributors.
- Link each adapted article to its preserved ACpedia source URL and disclose plain-text conversion.
- License adaptations compatibly; do not assume all images, embedded game content, trademarks, or third-party contributions share the text license.
- The archive host's distribution/access policies still matter. Public access is not equivalent to approval for high-volume crawling.

## Convert an authorized local archive copy

These commands need an already obtained archive containing site/m/*.html. Do not use a web crawler against the host without permission or a permitted bulk archive/download.

On Windows, for example:

~~~powershell
python acinfo/import_acpedia_html.py --input "D:\AC\Archives\acpedia\site" --output "D:\AC\Archives\acpedia-pages.jsonl"
python acinfo/import_archive.py --input "D:\AC\Archives\acpedia-pages.jsonl" --format jsonl --output "D:\AC\Archives\acinfo-build-001" --source acpedia --source-url "https://www.bartleskeet.com/archives/acpedia/site/m/" --license "CC BY-SA 3.0 (community text; verify exceptions)" --attribution "ACpedia community contributors; archive preserved by Bartleskeet"
~~~

The verified community-text license is recorded, but review exceptions and attribution before a publishable import. The converter includes the archived source URL on each page, and the importer preserves it.

The generated batch-NNNNN.sql files belong to the dedicated **ACINFO_DB** only. The generated r2/articles/*.txt.gz objects belong to **ACINFO_ARCHIVE**. Keep both out of GitHub and Cloudflare Pages static assets.

## Cloudflare publishing checklist

1. Preserve a read-only master copy of the authorized source locally, including provenance and checksums.
2. Verify the converted article count and sample dungeons, quests, lore, coordinates, and non-ASCII titles.
3. Verify reuse permission, contributor credits, and per-image rights; do not copy images until reviewed.
4. Create **new** D1 ACINFO_DB. Never execute this schema against live DB or CHESS_DB.
5. Apply schema.sql to ACINFO_DB and import the verified SQL batches.
6. Create and bind ACINFO_ARCHIVE R2, then upload gzip article objects.
7. Test search and decompression on a Cloudflare preview deployment, review cost/quotas, and only then consider merging.

Local tests:

~~~sh
python -m unittest discover -s acinfo -p 'test_*.py' -v
~~~

## Limitations

This is a text-only search pipeline, **not a complete ACpedia mirror yet**. It does not bulk-download the archive; a **locally saved index.html** is needed for title-only search, and a permitted local set of article HTML files is needed for full-text import. It does not import images, templates, interactive maps, or full revision histories. HTML text extraction may include navigation fragments or miss details on unusual pages, so sampled manual review is required.

Keep the existing Astralis Nova site and ACE server databases unchanged until source, licensing, and completeness checks pass.
