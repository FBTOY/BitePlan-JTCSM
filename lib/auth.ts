import bcrypt from "bcryptjs";
import crypto from "crypto";
import { parse as parseCookie, serialize as serializeCookie } from "cookie";
import {
  createSession,
  findSessionById,
  deleteSession,
  findUserByUsername,
  createUser,
  findUserById,
  deleteExpiredSessions,
} from "./db";
import type { User } from "./types";

const SESSION_COOKIE = "biteplan_session";
const SESSION_DAYS = 7;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createAuthSession(userId: number): string {
  deleteExpiredSessions();
  const sessionId = generateSessionId();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  createSession(sessionId, userId, expiresAt);
  return sessionId;
}

export function getSessionCookieHeader(
  sessionId: string,
  clear = false
): string {
  return serializeCookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: clear ? 0 : SESSION_DAYS * 24 * 60 * 60,
  });
}

export function parseSessionCookie(header?: string): string | undefined {
  if (!header) return undefined;
  const cookies = parseCookie(header);
  return cookies[SESSION_COOKIE];
}

export function getCurrentUser(cookieHeader?: string): User | null {
  deleteExpiredSessions();
  const sessionId = parseSessionCookie(cookieHeader);
  if (!sessionId) return null;
  const session = findSessionById(sessionId);
  if (!session) return null;
  const expiresAt = new Date(session.expires_at);
  if (expiresAt < new Date()) {
    deleteSession(sessionId);
    return null;
  }
  const user = findUserById(session.user_id);
  if (!user) {
    deleteSession(sessionId);
    return null;
  }
  return { id: user.id, username: user.username };
}

export function logoutSession(sessionId?: string): void {
  if (sessionId) {
    deleteSession(sessionId);
  }
}

export function authenticateUser(
  username: string,
  password: string
): User | null {
  const user = findUserByUsername(username);
  if (!user) return null;
  if (!verifyPassword(password, user.password_hash)) return null;
  return { id: user.id, username: user.username };
}

export function registerUser(username: string, password: string): User | null {
  const existing = findUserByUsername(username);
  if (existing) return null;
  const passwordHash = hashPassword(password);
  const { id } = createUser(username, passwordHash);
  return { id, username };
}
