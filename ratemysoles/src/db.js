import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'ratemysoles.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS photos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title        TEXT    NOT NULL DEFAULT '',
    filename     TEXT    NOT NULL,
    thumb        TEXT    NOT NULL,
    width        INTEGER,
    height       INTEGER,
    uploader     TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'active', -- active | removed
    created_at   INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS votes (
    photo_id   INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    voter      TEXT    NOT NULL,
    score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
    created_at INTEGER NOT NULL,
    PRIMARY KEY (photo_id, voter)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id   INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    reporter   TEXT    NOT NULL,
    reason     TEXT    NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_photos_status  ON photos(status);
  CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at);
  CREATE INDEX IF NOT EXISTS idx_votes_photo    ON votes(photo_id);
`);

export default db;
