import type { FavoriteGroup } from "../types/favorites";

export const DEFAULT_FAVORITE_GROUPS: ReadonlyArray<Pick<FavoriteGroup, "id" | "name">> = [
  { id: "favorite-1", name: "お気に入り1" },
  { id: "favorite-2", name: "お気に入り2" },
  { id: "favorite-3", name: "お気に入り3" },
];

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter((id) => typeof id === "string" && id.length > 0))];
}

export function createDefaultFavoriteGroups(legacyIds: string[] = []): FavoriteGroup[] {
  return DEFAULT_FAVORITE_GROUPS.map((group, index) => ({
    ...group,
    itemIds: index === 0 ? uniqueIds(legacyIds) : [],
  }));
}

export function normalizeFavoriteGroups(value: unknown, legacyIds: string[] = []): FavoriteGroup[] {
  if (!Array.isArray(value)) return createDefaultFavoriteGroups(legacyIds);

  const usedIds = new Set<string>();
  const groups = value.flatMap((candidate, index) => {
    if (!candidate || typeof candidate !== "object") return [];
    const record = candidate as Partial<FavoriteGroup>;
    const id = typeof record.id === "string" && record.id.trim() && !usedIds.has(record.id)
      ? record.id
      : `favorite-${index + 1}`;
    if (usedIds.has(id)) return [];
    usedIds.add(id);
    return [{
      id,
      name: typeof record.name === "string" && record.name.trim() ? record.name.trim() : `お気に入り${index + 1}`,
      itemIds: Array.isArray(record.itemIds) ? uniqueIds(record.itemIds) : [],
    }];
  });

  return groups.length ? groups : createDefaultFavoriteGroups(legacyIds);
}

export function getFavoriteIds(groups: FavoriteGroup[]): string[] {
  return uniqueIds(groups.flatMap((group) => group.itemIds));
}

export function getFavoriteGroupIds(groups: FavoriteGroup[], itemId: string): string[] {
  return groups.filter((group) => group.itemIds.includes(itemId)).map((group) => group.id);
}

export function toggleFavoriteInGroup(groups: FavoriteGroup[], groupId: string, itemId: string): FavoriteGroup[] {
  return groups.map((group) => {
    if (group.id !== groupId) return group;
    const itemIds = group.itemIds.includes(itemId)
      ? group.itemIds.filter((id) => id !== itemId)
      : [...group.itemIds, itemId];
    return { ...group, itemIds };
  });
}
