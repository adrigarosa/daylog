import type { SQLiteDatabase } from 'expo-sqlite';

// Full schema inline — no .sql file imports needed (Android asset system incompatibility)
const TABLES = [
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    is_system INTEGER DEFAULT 0 NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    status TEXT,
    habit_done INTEGER,
    habit_config_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0 NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS entry_categories (
    entry_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    auto_tagged INTEGER DEFAULT 0 NOT NULL,
    PRIMARY KEY (entry_id, category_id)
  )`,
  `CREATE TABLE IF NOT EXISTS keywords (
    id TEXT PRIMARY KEY NOT NULL,
    keyword TEXT NOT NULL,
    category_id TEXT NOT NULL,
    is_system INTEGER DEFAULT 0 NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS keywords_keyword_cat_unique ON keywords (keyword, category_id)`,
  `CREATE TABLE IF NOT EXISTS habits_config (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category_ids TEXT DEFAULT '[]' NOT NULL,
    keywords TEXT DEFAULT '[]' NOT NULL,
    color TEXT,
    is_active INTEGER DEFAULT 1 NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  )`,
];

export function runMigrations(expo: SQLiteDatabase): void {
  // Create all tables idempotently
  for (const sql of TABLES) {
    expo.execSync(sql);
  }

  // habit_config_id was added in schema v2 — add to existing DBs (fails silently if already exists)
  try {
    expo.execSync('ALTER TABLE entries ADD COLUMN habit_config_id TEXT');
  } catch {
    // Column already present — ignore
  }
}
