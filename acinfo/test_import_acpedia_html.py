import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('acpedia_import', ROOT / 'import_acpedia_html.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TestACPediaHTML(unittest.TestCase):
    def test_excludes_navigation_and_preserves_article_and_url(self):
        page = '''<!doctype html><html><body><nav>Not article</nav>
        <header>Source and archive home</header><h1>Shadow Shards</h1>
        <main><h2>Dungeon</h2><p>Enter the <strong>shadow</strong> ruins.</p>
        <ul><li>First creature</li><li>Second creature</li></ul>
        <script>unsafe javascript</script></main><footer>Footer links</footer></body></html>'''
        title, body = mod.parse_html(page)
        self.assertEqual(title,'Shadow Shards')
        self.assertIn('shadow ruins',body)
        self.assertIn('Second creature',body)
        self.assertNotIn('unsafe javascript',body)
        self.assertNotIn('Not article',body)
        self.assertNotIn('Footer links',body)
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / 'site' / 'm'
            src.mkdir(parents=True)
            (src / 'Shadow_Shards.html').write_text(page, encoding='utf-8')
            output = Path(tmp) / 'pages.jsonl'
            mod.convert(src.parent, output)
            items = [json.loads(line) for line in output.read_text(encoding='utf-8').splitlines()]
            self.assertEqual(len(items),1)
            self.assertEqual(items[0]['title'],'Shadow Shards')
            self.assertEqual(items[0]['source_url'],mod.ARCHIVE_BASE+'Shadow_Shards.html')
            with self.assertRaises(FileExistsError):
                mod.convert(src.parent, output)

if __name__ == '__main__':
    unittest.main()
