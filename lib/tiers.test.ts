import { describe, expect, it } from "vitest";

import type { Profile } from "./profile";
import { FREE_SAVE_LIMIT, isPremium, saveLimitFor } from "./tiers";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "u1",
    display_name: null,
    target_weight_kg: null,
    plan: "free",
    valid_until: null,
    ...overrides,
  };
}

describe("isPremium", () => {
  it("treats a null profile as free", () => {
    expect(isPremium(null)).toBe(false);
    expect(isPremium(undefined)).toBe(false);
  });

  it("treats an explicit free plan as not premium", () => {
    expect(isPremium(makeProfile({ plan: "free" }))).toBe(false);
  });

  it("treats premium with no expiry as premium", () => {
    expect(isPremium(makeProfile({ plan: "premium", valid_until: null }))).toBe(
      true
    );
  });

  it("treats premium valid in the future as premium", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(
      isPremium(makeProfile({ plan: "premium", valid_until: future }))
    ).toBe(true);
  });

  it("treats expired premium as free", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    expect(isPremium(makeProfile({ plan: "premium", valid_until: past }))).toBe(
      false
    );
  });
});

describe("saveLimitFor", () => {
  it("caps free users at FREE_SAVE_LIMIT", () => {
    expect(saveLimitFor(makeProfile({ plan: "free" }))).toBe(FREE_SAVE_LIMIT);
    expect(saveLimitFor(null)).toBe(FREE_SAVE_LIMIT);
  });

  it("gives premium users no limit", () => {
    expect(saveLimitFor(makeProfile({ plan: "premium" }))).toBe(Infinity);
  });
});
