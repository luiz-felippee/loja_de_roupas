-- Sessoes da equipe. O token nunca fica no banco: guardamos apenas o hash SHA-256.
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at TEXT NOT NULL
);
