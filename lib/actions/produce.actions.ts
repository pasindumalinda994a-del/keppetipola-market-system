import { MarketSettings } from "@/database/market-settings.model";
import { Vegetable } from "@/database/vegetable.model";
import {
  DEFAULT_PRODUCE_CATEGORIES,
  LEGACY_BOTANICAL_CATEGORIES,
  LEGACY_SETTINGS_CATEGORIES,
} from "@/lib/produce";

let pending: Promise<void> | null = null;

async function migrateLegacyProduceCatalog() {
  await Vegetable.updateMany(
    { category: { $in: [...LEGACY_BOTANICAL_CATEGORIES] } },
    { $set: { category: "Vegetable" } }
  );
  await MarketSettings.updateMany(
    { vegetableCategories: LEGACY_SETTINGS_CATEGORIES },
    { $set: { vegetableCategories: DEFAULT_PRODUCE_CATEGORIES } }
  );
}

/** One-time remap of botanical types (Root/Leafy/Pod) to Vegetable. */
export function ensureProduceCatalog(): Promise<void> {
  if (!pending) {
    pending = migrateLegacyProduceCatalog().catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}
