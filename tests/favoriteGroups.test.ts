import { describe, expect, it } from "vitest";
import { createDefaultFavoriteGroups, getFavoriteIds, normalizeFavoriteGroups, toggleFavoriteInGroup } from "../src/services/favoriteGroups";

describe("favorite groups", () => {
  it("starts with three named groups and migrates legacy IDs into the first group", () => {
    const groups = createDefaultFavoriteGroups(["word-a", "phrase:p1"]);
    expect(groups.map((group) => group.name)).toEqual(["お気に入り1", "お気に入り2", "お気に入り3"]);
    expect(groups[0].itemIds).toEqual(["word-a", "phrase:p1"]);
    expect(getFavoriteIds(groups)).toEqual(["word-a", "phrase:p1"]);
  });

  it("keeps the same item in multiple groups", () => {
    const groups = createDefaultFavoriteGroups();
    const first = toggleFavoriteInGroup(groups, "favorite-1", "word-a");
    const second = toggleFavoriteInGroup(first, "favorite-2", "word-a");
    expect(second[0].itemIds).toEqual(["word-a"]);
    expect(second[1].itemIds).toEqual(["word-a"]);
    expect(getFavoriteIds(second)).toEqual(["word-a"]);
  });

  it("normalizes invalid persisted groups without losing valid entries", () => {
    const groups = normalizeFavoriteGroups([
      { id: "custom", name: "つい忘れる", itemIds: ["word-a", "word-a"] },
      { id: "custom", name: "重複ID", itemIds: ["word-b"] },
      { id: "other", name: "", itemIds: "invalid" },
    ]);
    expect(groups).toHaveLength(3);
    expect(groups[0]).toEqual({ id: "custom", name: "つい忘れる", itemIds: ["word-a"] });
    expect(groups[1].itemIds).toEqual(["word-b"]);
    expect(groups[2].itemIds).toEqual([]);
  });
});
