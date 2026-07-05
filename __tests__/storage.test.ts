import {
  loadProfile,
  saveProfile,
  loadCurrentSession,
  saveCurrentSession,
  loadProviders,
  saveProviders,
  loadPantry,
  savePantry,
  addOrUpdatePantryItem,
  removePantryItem,
  pantryToProfile,
} from "@/lib/storage";
import type {
  KitchenProfile,
  CookingSession,
  ProviderConfig,
} from "@/lib/types";

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves and loads profile", () => {
    const profile: KitchenProfile = {
      servings: 3,
      skillLevel: "intermediate",
      timeMinutes: 60,
      dietaryNotes: "",
      availableIngredients: [{ name: "牛肉" }],
      availableTools: ["炒锅"],
    };
    saveProfile(profile);
    expect(loadProfile()).toEqual(profile);
  });

  it("returns null when profile missing", () => {
    expect(loadProfile()).toBeNull();
  });

  it("saves and loads current session", () => {
    const profile: KitchenProfile = {
      servings: 1,
      skillLevel: "beginner",
      timeMinutes: 30,
      dietaryNotes: "",
      availableIngredients: [],
      availableTools: [],
    };
    const session: CookingSession = {
      id: "s1",
      startedAt: "2026-01-01T00:00:00Z",
      profile,
      recipe: {
        title: "测试菜",
        description: "",
        servings: 1,
        estimatedTimeMinutes: 10,
        requiredIngredients: [],
        requiredTools: [],
        steps: [],
      },
      completedStepIds: [],
      checkedItems: {},
    };
    saveCurrentSession(session);
    expect(loadCurrentSession()).toEqual(session);
  });

  it("clears current session when null is saved", () => {
    saveCurrentSession(null);
    expect(loadCurrentSession()).toBeNull();
  });

  it("saves and loads providers", () => {
    const providers: ProviderConfig[] = [
      {
        id: "p1",
        provider: "moonshot",
        name: "Kimi",
        apiKey: "sk-test",
        model: "moonshot-v1-8k",
        baseUrl: "https://api.moonshot.cn/v1",
        isDefault: true,
      },
    ];
    saveProviders(providers);
    expect(loadProviders()).toEqual(providers);
  });

  it("adds pantry items", () => {
    addOrUpdatePantryItem({
      name: "生抽",
      quantity: "1瓶",
      category: "seasoning",
    });
    const pantry = loadPantry();
    expect(pantry).toHaveLength(1);
    expect(pantry[0].name).toBe("生抽");
  });

  it("updates existing pantry item", () => {
    addOrUpdatePantryItem({ name: "鸡蛋", category: "ingredient" });
    addOrUpdatePantryItem({
      name: "鸡蛋",
      quantity: "10个",
      category: "ingredient",
    });
    expect(loadPantry()).toHaveLength(1);
    expect(loadPantry()[0].quantity).toBe("10个");
  });

  it("removes pantry item", () => {
    const item = addOrUpdatePantryItem({ name: "葱", category: "ingredient" });
    removePantryItem(item.id);
    expect(loadPantry()).toHaveLength(0);
  });

  it("converts pantry to profile", () => {
    const profile: KitchenProfile = {
      servings: 2,
      skillLevel: "beginner",
      timeMinutes: 30,
      dietaryNotes: "",
      availableIngredients: [],
      availableTools: [],
    };
    savePantry([
      {
        id: "1",
        name: "鸡蛋",
        quantity: "3个",
        category: "ingredient",
        updatedAt: "2026-01-01",
      },
      {
        id: "2",
        name: "炒锅",
        category: "tool",
        updatedAt: "2026-01-01",
      },
    ]);
    const merged = pantryToProfile(profile, loadPantry());
    expect(merged.availableIngredients).toEqual([
      { name: "鸡蛋", quantity: "3个" },
    ]);
    expect(merged.availableTools).toEqual(["炒锅"]);
  });
});
