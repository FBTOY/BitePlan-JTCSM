export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type ProviderType = "anthropic" | "moonshot";

export type WeightUnit = "g" | "kg" | "oz" | "lb";
export type VolumeUnit = "ml" | "l" | "cup" | "tbsp" | "tsp";

export interface UserPreferences {
  weightUnit: WeightUnit;
  volumeUnit: VolumeUnit;
  onlyUseMassUnits: boolean;
}

export interface User {
  id: number;
  username: string;
}

export interface ProviderConfig {
  id: string;
  provider: ProviderType;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  isDefault: boolean;
}

export interface Ingredient {
  name: string;
  quantity?: string;
  note?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  quantity?: string;
  category: "ingredient" | "seasoning" | "tool";
  note?: string;
  updatedAt: string;
}

export interface KitchenProfile {
  servings: number;
  skillLevel: SkillLevel;
  timeMinutes: number;
  dietaryNotes: string;
  availableIngredients: Ingredient[];
  availableTools: string[];
}

export interface RecipeStep {
  id: string;
  order: number;
  title: string;
  instruction: string;
  durationMinutes?: number;
  tips?: string[];
  checklist: string[];
  nextStepHint?: string;
}

export interface RecipePlan {
  title: string;
  description: string;
  servings: number;
  estimatedTimeMinutes: number;
  requiredIngredients: Ingredient[];
  missingIngredients?: Ingredient[];
  requiredTools: string[];
  missingTools?: string[];
  steps: RecipeStep[];
}

export interface CookingSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  profile: KitchenProfile;
  recipe: RecipePlan;
  completedStepIds: string[];
  checkedItems: Record<string, boolean>;
  feedback?: SessionFeedback;
}

export interface SessionFeedback {
  rating: number;
  difficulty: "too_easy" | "just_right" | "too_hard";
  taste: string;
  notes: string;
}
