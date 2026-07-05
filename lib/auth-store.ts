import { useSyncExternalStore } from "react";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
  synced: boolean;
}

let state: AuthState = { user: null, loading: true, synced: false };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

async function fetchUser(): Promise<void> {
  try {
    const res = await fetch("/api/auth/me");
    const data = (await res.json()) as { user: User | null };
    state = { ...state, user: data.user, loading: false };
  } catch {
    state = { ...state, user: null, loading: false };
  }
  emit();
}

export async function syncUserData(): Promise<void> {
  if (!state.user || state.synced) return;
  try {
    const { syncFromServer, setCurrentUserId } = await import("./storage");
    setCurrentUserId(state.user.id);
    await syncFromServer();
    state = { ...state, synced: true };
  } catch {
    state = { ...state, synced: false };
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (state.loading) {
    void fetchUser();
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): AuthState {
  return state;
}

function getServerSnapshot(): AuthState {
  return { user: null, loading: false, synced: false };
}

export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }
  state = { user: null, loading: false, synced: false };
  emit();
}
