import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('acpedia_index', ROOT / 'import_acpedia_index.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TestACPediaTitleIndex(unittest.TestCase):
    def test_extracts_only_archived_articles_and_deduplicates(self):
        html = """<!doctype html><html><body>
        <a href="m/Main_Page.html">Main Page</a>
        <a href="./m/Category-Dungeon.html">Category: Dungeon</a>
        <a href="/archives/acpedia/site/m/Atlan%27s_Laboratory.html">Atlan's Laboratory</a>
        <a href="m/Main_Page.html">Duplicate</a>
        <a href="/archives/acpedia/site/img/a.jpg">Not an article</a>
        <a href="https://example.net/archives/acpedia/site/m/Fake.html">Other domain</a>
        <a href="../../admin.html">Outside directory</a>
        </body></html>"""
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            inp=folder / 'index.html'
            out=folder / 'title-index.json'
            inp.write_text(html, encoding='utf-8')
            mod.convert(inp, out)
            data=json.loads(out.read_text(encoding='utf-8'))
            self.assertEqual(data['source'], 'acpedia')
            self.assertEqual(data['kind'], 'title_only')
            self.assertEqual(data['count'], 3)
            self.assertEqual(data['articles'][2]['title'], "Atlan's Laboratory")
            self.assertTrue(data['articles'][1]['url'].endswith('/m/Category-Dungeon.html'))
            self.assertTrue(all(a['url'].startswith('https://www.bartleskeet.com/') for a in data['articles']))
            with self.assertRaises(FileExistsError):
                mod.convert(inp,out)

    def test_empty_index_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            inp=Path(temp)/'index.html'
            inp.write_text('<a href="https://example.net/m/Test.html">Wrong</a>', encoding='utf-8')
            with self.assertRaises(ValueError):
                mod.convert(inp,Path(temp)/'out.json')

if __name__ == '__main__':
    unittest.main()
