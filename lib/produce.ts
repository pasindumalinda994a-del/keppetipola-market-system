export const PRODUCE_CATEGORIES = [
  "Vegetables",
  "Tubers",
  "Leafy greens",
  "Grains & dry goods",
  "Fruits",
] as const;

export type ProduceCategory = (typeof PRODUCE_CATEGORIES)[number];

export const DEFAULT_PRODUCE_CATEGORIES = PRODUCE_CATEGORIES.join(", ");

export const LEGACY_BOTANICAL_CATEGORIES = ["Root", "Leafy", "Pod"] as const;

export const LEGACY_SETTINGS_CATEGORIES = "Root, Leafy, Pod, Fruit";

export const LEGACY_THREE_CATEGORIES = "Vegetable, Fruit, Other";

const LEGACY_CATEGORY_MAP: Record<string, ProduceCategory> = {
  Vegetable: "Vegetables",
  Fruit: "Fruits",
  Other: "Vegetables",
  Root: "Vegetables",
  Leafy: "Vegetables",
  Pod: "Vegetables",
};

export function normalizeProduceCategory(category: string | undefined): string {
  const trimmed = String(category ?? "").trim();
  if (!trimmed) return "Vegetables";
  return LEGACY_CATEGORY_MAP[trimmed] ?? trimmed;
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
  if (
    !trimmed ||
    trimmed === LEGACY_SETTINGS_CATEGORIES ||
    trimmed === LEGACY_THREE_CATEGORIES
  ) {
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
