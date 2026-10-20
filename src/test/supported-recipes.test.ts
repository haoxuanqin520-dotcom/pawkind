import { describe, expect, it } from "vitest";
import { SUPPORTED_RECIPES } from "../components/pawkind/supported-recipes";

describe("PawKind dog-only scope", () => {
  it("offers only the dog recipe", () => {
    expect(SUPPORTED_RECIPES.map(recipe => recipe.value)).toEqual(["dog"]);
  });
});