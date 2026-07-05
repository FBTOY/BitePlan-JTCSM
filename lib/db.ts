import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type {
  KitchenProfile,
  CookingSession,
  PantryItem,
  ProviderConfig,
  UserPreferences,
} from "./types";

const DATA_DIR =
  process.env.DATA_DIR ||
  path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, "biteplan.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_data (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, key)
    );
  `);
}

export function createUser(
  username: string,
  passwordHash: string
): { id: number; username: string } {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)"
  );
  const result = stmt.run(username, passwordHash);
  return { id: Number(result.lastInsertRowid), username };
}

export function findUserById(
  id: number
): { id: number; username: string; password_hash: string } | undefined {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT id, username, password_hash FROM users WHERE id = ?"
  );
  return stmt.get(id) as
    | { id: number; username: string; password_hash: string }
    | undefined;
}

export function findUserByUsername(
  username: string
): { id: number; username: string; password_hash: string } | undefined {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT id, username, password_hash FROM users WHERE username = ?"
  );
  return stmt.get(username) as
    | { id: number; username: string; password_hash: string }
    | undefined;
}

export function createSession(
  sessionId: string,
  userId: number,
  expiresAt: Date
): void {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)"
  );
  stmt.run(sessionId, userId, expiresAt.toISOString());
}

export function findSessionById(
  sessionId: string
): { user_id: number; expires_at: string } | undefined {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT user_id, expires_at FROM sessions WHERE id = ?"
  );
  return stmt.get(sessionId) as
    | { user_id: number; expires_at: string }
    | undefined;
}

export function deleteSession(sessionId: string): void {
  const database = getDb();
  const stmt = database.prepare("DELETE FROM sessions WHERE id = ?");
  stmt.run(sessionId);
}

export function deleteExpiredSessions(): void {
  const database = getDb();
  database.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
}

export function setUserData<T>(userId: number, key: string, value: T): void {
  const database = getDb();
  const stmt = database.prepare(
    "INSERT INTO user_data (user_id, key, value, updated_at) VALUES (?, ?, ?, datetime('now')) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
  );
  stmt.run(userId, key, JSON.stringify(value));
}

export function getUserData<T>(userId: number, key: string): T | null {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT value FROM user_data WHERE user_id = ? AND key = ?"
  );
  const row = stmt.get(userId, key) as { value: string } | undefined;
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export function getAllUserData(userId: number): Record<string, unknown> {
  const database = getDb();
  const stmt = database.prepare(
    "SELECT key, value FROM user_data WHERE user_id = ?"
  );
  const rows = stmt.all(userId) as { key: string; value: string }[];
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }
  return result;
}

export function getUserProfile(userId: number): KitchenProfile | null {
  return getUserData<KitchenProfile>(userId, "profile");
}

export function setUserProfile(userId: number, profile: KitchenProfile): void {
  setUserData(userId, "profile", profile);
}

export function getUserPantry(userId: number): PantryItem[] {
  return getUserData<PantryItem[]>(userId, "pantry") || [];
}

export function setUserPantry(userId: number, pantry: PantryItem[]): void {
  setUserData(userId, "pantry", pantry);
}

export function getUserProviders(userId: number): ProviderConfig[] {
  return getUserData<ProviderConfig[]>(userId, "providers") || [];
}

export function setUserProviders(
  userId: number,
  providers: ProviderConfig[]
): void {
  setUserData(userId, "providers", providers);
}

export function getUserPreferences(userId: number): UserPreferences | null {
  return getUserData<UserPreferences>(userId, "preferences");
}

export function setUserPreferences(
  userId: number,
  preferences: UserPreferences
): void {
  setUserData(userId, "preferences", preferences);
}

export function getUserCurrentSession(userId: number): CookingSession | null {
  return getUserData<CookingSession>(userId, "currentSession");
}

export function setUserCurrentSession(
  userId: number,
  session: CookingSession | null
): void {
  if (session) {
    setUserData(userId, "currentSession", session);
  } else {
    getDb()
      .prepare("DELETE FROM user_data WHERE user_id = ? AND key = ?")
      .run(userId, "currentSession");
  }
}

export function getUserHistory(userId: number): CookingSession[] {
  return getUserData<CookingSession[]>(userId, "history") || [];
}

export function setUserHistory(
  userId: number,
  history: CookingSession[]
): void {
  setUserData(userId, "history", history);
}

export function archiveUserSession(
  userId: number,
  session: CookingSession
): void {
  const history = getUserHistory(userId);
  history.unshift(session);
  setUserHistory(userId, history.slice(0, 50));
}
