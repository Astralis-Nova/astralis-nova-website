#!/usr/bin/env python3
"""Convert an already-obtained local ACPedia HTML mirror to ACInfo JSONL.

No fetching, scraping, uploading or licensing assumptions. Accepts the mirror's
site/m directory and emits records with preserved source URLs for later review.
"""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.parse import quote

ARCHIVE_BASE = 'https://www.bartleskeet.com/archives/acpedia/site/m/'
SKIP = {'script', 'style', 'nav', 'footer', 'aside', 'form', 'noscript', 'svg'}
BREAKS = {'p', 'div', 'br', 'li', 'tr', 'table', 'h2', 'h3', 'h4', 'h5', 'hr', 'section', 'article'}

class PageText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.parts = []
        self.in_h1 = False
        self.heading_seen = False
        self.skipped = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if tag in SKIP:
            self.skipped.append(tag)
        if self.skipped:
            return
        if tag == 'h1' and not self.heading_seen:
            self.in_h1 = True
            self.heading_seen = True
        elif self.heading_seen and tag in BREAKS:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        tag = tag.lower()
        if self.skipped:
            if tag == self.skipped[-1]:
                self.skipped.pop()
            return
        if tag == 'h1' and self.in_h1:
            self.in_h1 = False
        elif self.heading_seen and tag in BREAKS:
            self.parts.append('\n')

    def handle_data(self, data):
        if self.skipped:
            return
        if self.in_h1:
            self.title_parts.append(data)
        elif self.heading_seen:
            self.parts.append(data)

def parse_html(raw):
    parser = PageText()
    parser.feed(raw)
    title = re.sub(r'\s+', ' ', ''.join(parser.title_parts)).strip()
    body = '\n'.join(
        re.sub(r'[ \t\r\f\v]+', ' ', line).strip()
        for line in ''.join(parser.parts).splitlines()
        if line.strip()
    )
    return title, body

def convert(mirror_dir, output_path, archive_base=ARCHIVE_BASE):
    mirror_dir = Path(mirror_dir)
    if (mirror_dir / 'm').is_dir():
        mirror_dir = mirror_dir / 'm'
    if not mirror_dir.is_dir():
        raise ValueError('Expected an existing ACpedia HTML mirror directory (site/ or site/m/).')
    output_path = Path(output_path)
    if output_path.exists():
        raise FileExistsError('Output already exists: use a new JSONL filename for each conversion.')
    if output_path.resolve().is_relative_to(mirror_dir.resolve()):
        raise ValueError('Output must be outside the source mirror.')
    output_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    skipped = 0
    with output_path.open('x', encoding='utf-8') as out:
        for file in sorted(mirror_dir.rglob('*.html')):
            if file.is_symlink():
                skipped += 1
                continue
            title, body = parse_html(file.read_text(encoding='utf-8', errors='replace'))
            if not title or not body:
                skipped += 1
                continue
            relative_url = '/'.join(quote(piece) for piece in file.relative_to(mirror_dir).parts)
            row = {'title': title, 'body': body, 'source_url': archive_base.rstrip('/') + '/' + relative_url}
            out.write(json.dumps(row, ensure_ascii=False) + '\n')
            count += 1
    print(json.dumps({'source':'acpedia','converted_pages':count,'skipped':skipped,'output':str(output_path)},indent=2))

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input', required=True, help='Existing local site/ or site/m/ folder')
    p.add_argument('--output', required=True, help='New output JSONL file outside source mirror')
    args = p.parse_args()
    convert(args.input, args.output)
