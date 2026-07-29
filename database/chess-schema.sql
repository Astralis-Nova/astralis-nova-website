PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS chess_games (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('standard','trideck')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','active','finished','resigned')),
  white_name TEXT NOT NULL,
  black_name TEXT,
  white_token_hash TEXT NOT NULL,
  black_token_hash TEXT,
  state_json TEXT NOT NULL,
  current_turn TEXT NOT NULL DEFAULT 'white' CHECK (current_turn IN ('white','black')),
  revision INTEGER NOT NULL DEFAULT 0,
  winner TEXT CHECK (winner IN ('white','black','draw') OR winner IS NULL),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chess_moves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT NOT NULL,
  revision INTEGER NOT NULL,
  player_color TEXT NOT NULL CHECK (player_color IN ('white','black')),
  notation TEXT NOT NULL,
  move_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES chess_games(id) ON DELETE CASCADE,
  UNIQUE (game_id, revision)
);

CREATE INDEX IF NOT EXISTS idx_chess_games_code ON chess_games(code);
CREATE INDEX IF NOT EXISTS idx_chess_games_updated ON chess_games(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chess_moves_game ON chess_moves(game_id, revision);
