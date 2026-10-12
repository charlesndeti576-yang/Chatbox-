-- Run this once in the Neon SQL Editor
CREATE TABLE IF NOT EXISTS users (
  phone      TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  pass_hash  TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id           BIGSERIAL PRIMARY KEY,
  room         TEXT NOT NULL,
  type         TEXT NOT NULL DEFAULT 'msg',   -- 'msg' or 'system'
  sender_phone TEXT NOT NULL REFERENCES users(phone),
  sender_name  TEXT NOT NULL,
  text         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_room_id_idx ON messages (room, id);
