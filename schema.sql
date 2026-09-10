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

CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at
  ON contact_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status
  ON contact_messages(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_hash
  ON contact_messages(ip_hash, created_at DESC);

CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscribers_created_at
  ON subscribers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscribers_status
  ON subscribers(status, created_at DESC);

CREATE TABLE IF NOT EXISTS memory_access_requests (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE,
  relationship TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  approval_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_requests_email
  ON memory_access_requests(email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_memory_requests_status
  ON memory_access_requests(status, created_at DESC);

CREATE TABLE IF NOT EXISTS memory_people (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  status TEXT NOT NULL DEFAULT 'approved',
  access_level TEXT NOT NULL DEFAULT 'member',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_memory_people_status
  ON memory_people(status, display_name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS memory_album_permissions (
  person_id TEXT NOT NULL,
  album_id TEXT NOT NULL,
  can_view INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  PRIMARY KEY (person_id, album_id),
  FOREIGN KEY (person_id) REFERENCES memory_people(id) ON DELETE CASCADE
);
