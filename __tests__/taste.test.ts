import { calibrateTasteFromFeedback, describeTasteChange } from "@/lib/taste";
import type { SessionFeedback, UserPreferences } from "@/lib/types";

const basePreferences: UserPreferences = {
  weightUnit: "g",
  volumeUnit: "ml",
  onlyUseMassUnits: false,
  tastePreferences: {
    sweet: 50,
    sour: 50,
    bitter: 50,
    spicy: 50,
    salty: 50,
  },
  customUnits: [],
  autoCalibrateTaste: true,
};

const feedback = (text: string): SessionFeedback => ({
  rating: 4,
  difficulty: "just_right",
  taste: text,
  notes: "",
});

describe("calibrateTasteFromFeedback", () => {
  it("decreases salty when too salty", () => {
    const next = calibrateTasteFromFeedback(
      basePreferences,
      feedback("太咸了")
    );
    expect(next.salty).toBe(42);
  });

  it("increases sweet when not sweet enough", () => {
    const next = calibrateTasteFromFeedback(
      basePreferences,
      feedback("不够甜，甜点更好")
    );
    expect(next.sweet).toBe(58);
  });

  it("clamps values between 0 and 100", () => {
    const prefs = {
      ...basePreferences,
      tastePreferences: { ...basePreferences.tastePreferences, spicy: 5 },
    };
    const next = calibrateTasteFromFeedback(prefs, feedback("太辣"));
    expect(next.spicy).toBe(0);
  });
});

describe("describeTasteChange", () => {
  it("returns null when no changes", () => {
    const text = describeTasteChange(
      basePreferences.tastePreferences,
      basePreferences.tastePreferences
    );
    expect(text).toBeNull();
  });

  it("describes the change direction", () => {
    const after = {
      ...basePreferences.tastePreferences,
      salty: 42,
      sweet: 58,
    };
    const text = describeTasteChange(
      basePreferences.tastePreferences,
      after
    );
    expect(text).toContain("咸↓8");
    expect(text).toContain("甜↑8");
  });
});
