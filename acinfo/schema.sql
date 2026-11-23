-- ACInfo has its OWN D1 database: never apply to DB or CHESS_DB.
CREATE TABLE IF NOT EXISTS acinfo_articles (
 id INTEGER PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 title TEXT NOT NULL,
 source TEXT NOT NULL,
 source_url TEXT,
 license TEXT,
 attribution TEXT,
 summary TEXT,
 body_text TEXT,
 body_key TEXT,
 imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE VIRTUAL TABLE IF NOT EXISTS acinfo_fts USING fts5(title, body, content='');
-- Contentless FTS: importer must insert matching rowid,title,body explicitly.
CREATE INDEX IF NOT EXISTS idx_acinfo_source ON acinfo_articles(source);
