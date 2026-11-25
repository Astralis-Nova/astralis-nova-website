#!/usr/bin/env python3
"""Create a compact, title-only ACpedia index from a saved archive index.html.

Only reads one *local* HTML file. No crawler or network requests. This index
contains titles and direct links, not copied article contents or images.
"""
import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

ARCHIVE_HOME = 'https://www.bartleskeet.com/archives/acpedia/site/index.html'
ARCHIVE_PATH = '/archives/acpedia/site/m/'
MAX_ARTICLES = 100000

class ArchiveIndexParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.current_href = None
        self.current_title = []
        self.rows = []
        self.seen = set()

    def handle_starttag(self, tag, attrs):
        if tag.lower() != 'a':
            return
        href = dict(attrs).get('href')
        if not href:
            return
        full = urljoin(ARCHIVE_HOME, href)
        parsed = urlsplit(full)
        if (parsed.scheme != 'https'
                or parsed.netloc != 'www.bartleskeet.com'
                or not parsed.path.startswith(ARCHIVE_PATH)
                or not parsed.path.lower().endswith('.html')):
            return
        self.current_href = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, '', ''))
        self.current_title = []

    def handle_data(self, data):
        if self.current_href:
            self.current_title.append(data)

    def handle_endtag(self, tag):
        if tag.lower() != 'a' or not self.current_href:
            return
        title = ' '.join(''.join(self.current_title).split())
        if title and self.current_href not in self.seen:
            if len(self.rows) >= MAX_ARTICLES:
                raise ValueError('Unexpectedly large archive index, refusing import.')
            self.rows.append({'title': title, 'url': self.current_href})
            self.seen.add(self.current_href)
        self.current_href = None
        self.current_title = []

def convert(input_path, output_path):
    src = Path(input_path)
    dst = Path(output_path)
    if not src.is_file():
        raise FileNotFoundError('Provide a saved ACpedia archive index.html.')
    if dst.exists():
        raise FileExistsError('Output exists; choose a new filename.')
    parser = ArchiveIndexParser()
    parser.feed(src.read_text(encoding='utf-8', errors='replace'))
    if not parser.rows:
        raise ValueError('No ACpedia article links found. Verify the input is the archive index.')
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = {'source': 'acpedia', 'kind': 'title_only', 'count': len(parser.rows),
              'archive_home': ARCHIVE_HOME, 'articles': parser.rows}
    dst.write_text(json.dumps(result, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(json.dumps({'articles': len(parser.rows), 'output': str(dst), 'title_only': True}, indent=2))

if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input', required=True, help='Saved ACpedia index.html, no crawling')
    p.add_argument('--output', required=True, help='New title-only JSON output')
    args = p.parse_args()
    convert(args.input, args.output)
