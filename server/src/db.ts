import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data', 'tradingedge.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS datasources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'singlestore',
      connection_string_encrypted TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tiles (
      id TEXT PRIMARY KEY,
      dashboard_id TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT 'Untitled Tile',
      query TEXT NOT NULL DEFAULT 'SELECT 1',
      datasource_id TEXT,
      view_type TEXT NOT NULL DEFAULT 'table',
      view_config TEXT NOT NULL DEFAULT '{}',
      col_span INTEGER NOT NULL DEFAULT 3,
      row_span INTEGER NOT NULL DEFAULT 2,
      pos_x INTEGER NOT NULL DEFAULT 0,
      pos_y INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dashboard_id) REFERENCES dashboards(id) ON DELETE CASCADE,
      FOREIGN KEY (datasource_id) REFERENCES datasources(id) ON DELETE SET NULL
    );

    -- Migration: add view_config if upgrading from older schema
    ALTER TABLE tiles ADD COLUMN view_config TEXT NOT NULL DEFAULT '{}';
  `);
}

export function closeDb(): void {
  if (db) {
    db.close();
  }
}
