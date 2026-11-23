import gzip
import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("acinfo_import", ROOT / "import_archive.py")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class TestArchiveImport(unittest.TestCase):
    def test_jsonl_import_and_search(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            source = base / "sample.jsonl"
            source.write_text(
                json.dumps({"title": "Shadow Shards", "body": "Seek the dungeon and study shadow creatures."})+"\n"+
                json.dumps({"title": "Shadow Shards", "body": "Duplicate"})+"\n"+
                json.dumps({"title": "Atlan's Weapons", "body": "Atlan stones and weapons are found in Dereth."})+"\n",
                encoding="utf-8")
            from types import SimpleNamespace
            Args = SimpleNamespace(
                input=str(source), format="jsonl", output=str(base / "build"),
                source="retail", source_url="https://example.org/wiki/",
                license="test-only", attribution="fictional fixture",
                storage="r2", batch_size=1)
            mod.write_import(Args)
            out = Path(Args.output)
            manifest = json.loads((out / "manifest.json").read_text())
            self.assertEqual(manifest["articles"], 2)
            self.assertEqual(manifest["duplicates"], 1)
            db = sqlite3.connect(":memory:")
            db.executescript((ROOT / "schema.sql").read_text())
            for sql in sorted(out.glob("batch-*.sql")):
                db.executescript(sql.read_text())
            result = db.execute(
                "SELECT a.title, snippet(acinfo_fts,1,'[',']','…',12) FROM acinfo_fts "
                "JOIN acinfo_articles a ON a.id=acinfo_fts.rowid "
                "WHERE acinfo_fts MATCH ? ORDER BY bm25(acinfo_fts,9.0,1.0)",
                ('"shadow"*',)
            ).fetchone()
            self.assertEqual(result[0], "Shadow Shards")
            self.assertIn("[shadow]", result[1].lower())
            row = db.execute("SELECT body_key FROM acinfo_articles WHERE title='Shadow Shards'").fetchone()
            with gzip.open(out / "r2" / row[0], "rt", encoding="utf-8") as f:
                self.assertIn("dungeon", f.read())
            self.assertEqual(db.execute("SELECT count(*) FROM acinfo_articles").fetchone()[0], 2)

    def test_xml_streaming_and_entities(self):
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/"dump.xml.gz"
            xml = """<mediawiki xmlns="http://www.mediawiki.org/xml/export-0.11/">
            <page><title>Dungeon &amp; Doors</title><ns>0</ns><revision>
            <text>Find [[Hidden Door|doors]] &amp; [[Shadows]]</text></revision></page>
            <page><title>Talk:Other</title><ns>1</ns><revision><text>Skip</text></revision></page>
            </mediawiki>"""
            with gzip.open(path,"wt",encoding="utf-8") as f: f.write(xml)
            records=list(mod.mediawiki_pages(path))
            self.assertEqual(len(records),1)
            self.assertIn("doors",mod.plain_wikitext(records[0]["body"]))

if __name__ == "__main__":
    unittest.main()
