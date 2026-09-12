import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "boardy.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    start_date TEXT NOT NULL,
    remaining INTEGER DEFAULT 60,
    score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Needs support',
    color TEXT DEFAULT '#e2e8f0',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    payload TEXT DEFAULT '{}',
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS summaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;

// ─── Helper Types ───
export type User = {
  id: number;
  name: string;
  initials: string;
  role: string;
  department: string;
  start_date: string;
  remaining: number;
  score: number;
  status: string;
  color: string;
  created_at: string;
};

export type EventLog = {
  id: number;
  user_id: number;
  event_type: string;
  description: string;
  payload: string;
  timestamp: string;
};

export type Summary = {
  id: number;
  user_id: number;
  role: string;
  content: string;
  created_at: string;
};
