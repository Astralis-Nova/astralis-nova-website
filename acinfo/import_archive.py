#!/usr/bin/env python3
"""Convert a licensed MediaWiki XML dump or normalized JSONL into ACInfo imports.

Examples:
  python acinfo/import_archive.py --input wiki.xml.bz2 --format mediawiki --output acinfo-build
  python acinfo/import_archive.py --input articles.jsonl --format jsonl --output acinfo-build

This does not download third-party archives, extract Docker/SQL snapshots,
verify redistribution rights, create Cloudflare resources, or upload R2 files.
"""
import argparse
import bz2
import gzip
from urllib.parse import quote
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sqlite3
import unicodedata
import xml.etree.ElementTree as ET

SLUG_RE = re.compile(r"[^a-z0-9]+")
PAGE_LIMIT = 1000000

def slugify(title):
    base = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode().lower()
    slug = SLUG_RE.sub("-", base).strip("-")[:155].strip("-") or "page"
    return slug + "-" + hashlib.sha256(title.encode("utf8")).hexdigest()[:12]

def open_source(path):
    if path.suffix == ".bz2":
        return bz2.open(path, "rb")
    if path.suffix == ".gz":
        return gzip.open(path, "rb")
    return path.open("rb")

def mediawiki_pages(path):
    # iterparse streams pages: the full dump is never loaded into RAM.
    with open_source(path) as stream:
        parser = ET.iterparse(stream, events=("start", "end"))
        _, root = next(parser)
        for event, elem in parser:
            if event != "end" or elem.tag.rsplit("}", 1)[-1] != "page":
                continue
            def field(parent, name):
                child = next((x for x in parent if x.tag.rsplit("}", 1)[-1] == name), None)
                return child
            title = field(elem, "title")
            ns = field(elem, "ns")
            revision = field(elem, "revision")
            body = field(revision, "text") if revision is not None else None
            if title is not None and ns is not None and ns.text == "0" and body is not None:
                yield {"title": title.text or "", "body": body.text or ""}
            root.clear()

def jsonl_pages(path):
    with open_source(path) as stream:
        for number, raw in enumerate(stream, 1):
            if not raw.strip():
                continue
            try:
                yield json.loads(raw)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON on line {number}") from exc

def plain_wikitext(text):
    # Lightweight search normalization, not a full MediaWiki renderer.
    text = re.sub(r"<!--.*?-->", " ", text, flags=re.S)
    text = re.sub(r"<ref\b[^>]*>.*?</ref>", " ", text, flags=re.S | re.I)
    text = re.sub(r"\[\[(?:[^\]|]*\|)?([^\]]+)\]\]", r"\1", text)
    text = re.sub(r"\{\{[^{}]{0,500}\}\}", " ", text)
    text = re.sub(r"(?m)^=+\s*(.*?)\s*=+\s*$", r"\1", text)
    text = re.sub(r"<[^>]+>", " ", text)
    return html.unescape(text).replace("\x00", "").strip()

def sql_quote(v):
    return "NULL" if v is None else "'" + str(v).replace("'", "''") + "'"

def write_import(args):
    output = Path(args.output)
    if output.exists() and any(output.iterdir()):
        raise ValueError("Output directory must be empty; use a new directory for each import.")
    output.mkdir(parents=True, exist_ok=True)
    objects = output / "r2" / "articles"
    if args.storage == "r2":
        objects.mkdir(parents=True, exist_ok=True)
    pages = mediawiki_pages(Path(args.input)) if args.format == "mediawiki" else jsonl_pages(Path(args.input))
    manifest = {"source": args.source, "storage": args.storage, "articles": 0,
                "duplicates": 0, "empty": 0, "batches": 0, "article_bytes": 0}
    seen = set()
    batch = []
    def flush():
        if not batch:
            return
        n = manifest["batches"] + 1
        sql = "BEGIN TRANSACTION;\n" + "\n".join(batch) + "\nCOMMIT;\n"
        (output / f"batch-{n:05}.sql").write_text(sql, encoding="utf-8")
        manifest["batches"] = n
        batch.clear()
    for page in pages:
        title = str(page.get("title") or "").strip()
        raw = str(page.get("body") or page.get("text") or "")
        if not title or not raw.strip():
            manifest["empty"] += 1
            continue
        slug = slugify(title)
        if slug in seen:
            manifest["duplicates"] += 1
            continue
        seen.add(slug)
        body = plain_wikitext(raw) if args.format == "mediawiki" else raw
        if not body.strip():
            manifest["empty"] += 1
            continue
        summary = re.sub(r"\s+", " ", body)[:300]
        if args.format == "jsonl":
            source_url = page.get("source_url") or args.source_url.rstrip("/") + "/" + quote(title.replace(" ", "_"), safe="/")
        else:
            source_url = args.source_url.rstrip("/") + "/" + quote(title.replace(" ", "_"), safe="/")
        manifest["articles"] += 1
        item_id = manifest["articles"]
        data = body.encode("utf-8")
        manifest["article_bytes"] += len(data)
        body_key = f"articles/{slug}.txt.gz" if args.storage == "r2" else None
        if body_key:
            (objects / f"{slug}.txt.gz").write_bytes(gzip.compress(data, compresslevel=9, mtime=0))
        values = [item_id, slug, title, args.source, source_url, args.license,
                  args.attribution, summary, body if args.storage == "d1" else None, body_key]
        batch.append("INSERT INTO acinfo_articles (id,slug,title,source,source_url,license,attribution,summary,body_text,body_key) VALUES (" +
                     ",".join(sql_quote(v) for v in values) + ");")
        batch.append("INSERT INTO acinfo_fts(rowid,title,body) VALUES (" +
                     ",".join(sql_quote(v) for v in [item_id,title,body]) + ");")
        if item_id % args.batch_size == 0:
            flush()
        if item_id >= PAGE_LIMIT:
            raise ValueError("Refusing an unexpectedly large input: inspect source before proceeding.")
    flush()
    (output / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--input", required=True)
    p.add_argument("--format", choices=["mediawiki", "jsonl"], required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--source", default="acpedia")
    p.add_argument("--source-url", default="https://www.bartleskeet.com/archives/acpedia/site/m/")
    p.add_argument("--license", required=True, help="Verified source license, not a guess")
    p.add_argument("--attribution", required=True, help="Accurate content contributors/source attribution")
    p.add_argument("--storage", choices=["r2", "d1"], default="r2")
    p.add_argument("--batch-size", type=int, default=40)
    a = p.parse_args()
    if not 1 <= a.batch_size <= 250:
        p.error("batch size must be between 1 and 250")
    write_import(a)
