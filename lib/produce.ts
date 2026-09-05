export const PRODUCE_CATEGORIES = ["Vegetable", "Fruit", "Other"] as const;

export type ProduceCategory = (typeof PRODUCE_CATEGORIES)[number];

export const DEFAULT_PRODUCE_CATEGORIES = "Vegetable, Fruit, Other";

export const LEGACY_BOTANICAL_CATEGORIES = ["Root", "Leafy", "Pod"] as const;

export const LEGACY_SETTINGS_CATEGORIES = "Root, Leafy, Pod, Fruit";

export function normalizeProduceCategory(category: string | undefined): string {
  const trimmed = String(category ?? "").trim();
  if (!trimmed) return "Other";
  if ((LEGACY_BOTANICAL_CATEGORIES as readonly string[]).includes(trimmed)) {
    return "Vegetable";
  }
  return trimmed;
}

export function parseProduceCategories(raw: string | undefined): string[] {
  const unique = [
    ...new Set(
      String(raw ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map(normalizeProduceCategory)
    ),
  ];
  return unique.length > 0 ? unique : [...PRODUCE_CATEGORIES];
}

export function normalizeProduceCategoriesSetting(
  raw: string | undefined
): string {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed || trimmed === LEGACY_SETTINGS_CATEGORIES) {
    return DEFAULT_PRODUCE_CATEGORIES;
  }
  return parseProduceCategories(trimmed).join(", ");
}

export function uniqueProduceCategories(categories: string[]): string[] {
  const normalized = [
    ...new Set(categories.map((category) => normalizeProduceCategory(category))),
  ];
  const known = PRODUCE_CATEGORIES.filter((category) =>
    normalized.includes(category)
  );
  const extra = normalized.filter(
    (category) => !(PRODUCE_CATEGORIES as readonly string[]).includes(category)
  );
  return [...known, ...extra];
}

export function matchesProduceCategory(
  category: string | undefined,
  filter: string | undefined
): boolean {
  if (!filter || filter === "all") return true;
  return normalizeProduceCategory(category) === filter;
}

export function filterProduceByCategory<T extends { category: string }>(
  items: T[],
  category: string | undefined
): T[] {
  return items.filter((item) => matchesProduceCategory(item.category, category));
}
