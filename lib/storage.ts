import type {
  KitchenProfile,
  CookingSession,
  ProviderConfig,
  PantryItem,
  UserPreferences,
} from "./types";

const PROFILE_KEY = "biteplan:kitchenProfile";
const SESSIONS_KEY = "biteplan:sessions";
const CURRENT_SESSION_KEY = "biteplan:currentSession";
const PROVIDERS_KEY = "biteplan:providers";
const PANTRY_KEY = "biteplan:pantry";
const PREFERENCES_KEY = "biteplan:preferences";

let currentUserId: number | null = null;

export function setCurrentUserId(userId: number | null): void {
  currentUserId = userId;
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

async function syncToServer(key: string, value: unknown): Promise<void> {
  if (currentUserId === null) return;
  try {
    await fetch("/api/user/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  } catch {
    // 同步失败时保留本地数据
  }
}

async function deleteFromServer(key: string): Promise<void> {
  if (currentUserId === null) return;
  try {
    await fetch(`/api/user/data?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });
  } catch {
    // ignore
  }
}

export async function syncFromServer(): Promise<void> {
  if (currentUserId === null) return;
  try {
    const res = await fetch("/api/user/data");
    if (!res.ok) return;
    const { data } = (await res.json()) as { data: Record<string, unknown> };
    if (typeof window === "undefined") return;
    if (data.profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(data.profile));
    if (data.pantry) localStorage.setItem(PANTRY_KEY, JSON.stringify(data.pantry));
    if (data.providers) localStorage.setItem(PROVIDERS_KEY, JSON.stringify(data.providers));
    if (data.preferences) localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.preferences));
    if (data.currentSession) localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(data.currentSession));
    if (data.history) localStorage.setItem(SESSIONS_KEY, JSON.stringify(data.history));
  } catch {
    // ignore
  }
}

export function loadProfile(): KitchenProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KitchenProfile;
  } catch {
    return null;
  }
}

export function saveProfile(profile: KitchenProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  void syncToServer("profile", profile);
}

export function loadCurrentSession(): CookingSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CookingSession;
  } catch {
    return null;
  }
}

export function saveCurrentSession(session: CookingSession | null): void {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(session));
    void syncToServer("currentSession", session);
  } else {
    localStorage.removeItem(CURRENT_SESSION_KEY);
    void deleteFromServer("currentSession");
  }
}

export function archiveSession(session: CookingSession): void {
  if (typeof window === "undefined") return;
  const sessions = loadSessions();
  sessions.unshift(session);
  const history = sessions.slice(0, 50);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(history));
  void syncToServer("history", history);
}

export function loadSessions(): CookingSession[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CookingSession[];
  } catch {
    return [];
  }
}

export function loadProviders(): ProviderConfig[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PROVIDERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ProviderConfig[];
  } catch {
    return [];
  }
}

export function saveProviders(providers: ProviderConfig[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PROVIDERS_KEY, JSON.stringify(providers));
  void syncToServer("providers", providers);
}

export function getDefaultProvider(): ProviderConfig | null {
  const providers = loadProviders();
  return providers.find((p) => p.isDefault) || providers[0] || null;
}

export function loadPantry(): PantryItem[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PANTRY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PantryItem[];
  } catch {
    return [];
  }
}

export function savePantry(items: PantryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  void syncToServer("pantry", items);
}

export function addOrUpdatePantryItem(
  item: Omit<PantryItem, "id" | "updatedAt">
): PantryItem {
  const items = loadPantry();
  const existingIndex = items.findIndex(
    (i) => i.name === item.name && i.category === item.category
  );
  const now = new Date().toISOString();
  const newItem: PantryItem = {
    ...item,
    id:
      existingIndex >= 0
        ? items[existingIndex].id
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    updatedAt: now,
  };

  if (existingIndex >= 0) {
    items[existingIndex] = newItem;
  } else {
    items.unshift(newItem);
  }
  savePantry(items);
  return newItem;
}

export function removePantryItem(id: string): void {
  const items = loadPantry().filter((i) => i.id !== id);
  savePantry(items);
}

export function pantryToProfile(
  profile: KitchenProfile,
  pantry: PantryItem[]
): KitchenProfile {
  const ingredients = pantry
    .filter((i) => i.category === "ingredient" || i.category === "seasoning")
    .map((i) => ({ name: i.name, quantity: i.quantity, note: i.note }));
  const tools = pantry
    .filter((i) => i.category === "tool")
    .map((i) => i.name);

  return {
    ...profile,
    availableIngredients: ingredients,
    availableTools: tools,
  };
}

export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return {
      weightUnit: "g",
      volumeUnit: "ml",
      onlyUseMassUnits: false,
    };
  }
  const raw = localStorage.getItem(PREFERENCES_KEY);
  if (!raw) {
    return {
      weightUnit: "g",
      volumeUnit: "ml",
      onlyUseMassUnits: false,
    };
  }
  try {
    return JSON.parse(raw) as UserPreferences;
  } catch {
    return {
      weightUnit: "g",
      volumeUnit: "ml",
      onlyUseMassUnits: false,
    };
  }
}

export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  void syncToServer("preferences", preferences);
}
