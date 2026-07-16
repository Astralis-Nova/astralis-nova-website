CREATE TABLE IF NOT EXISTS guestbook_entries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  favorite_song TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guestbook_created_at
  ON guestbook_entries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_guestbook_ip_hash
  ON guestbook_entries(ip_hash, created_at DESC);
