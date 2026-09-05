import { MarketSettings } from "@/database/market-settings.model";
import { Vegetable } from "@/database/vegetable.model";
import { PRODUCE_CATALOG, produceNameRegex } from "@/lib/produce-catalog";
import { normalizeProduceCategoriesSetting } from "@/lib/produce";

let pending: Promise<void> | null = null;

async function migrateLegacyProduceCatalog() {
  await Vegetable.updateMany(
    { category: { $in: ["Root", "Leafy", "Pod", "Vegetable", "Other"] } },
    { $set: { category: "Vegetables" } }
  );
  await Vegetable.updateMany(
    { category: "Fruit" },
    { $set: { category: "Fruits" } }
  );

  for (const item of PRODUCE_CATALOG) {
    const patch: { category: string; status?: "Active" } = {
      category: item.category,
    };
    if (item.name === "Radish") {
      patch.status = "Active";
    }
    await Vegetable.updateMany(
      { name: produceNameRegex(item.name) },
      { $set: patch }
    );
  }

  const settings = await MarketSettings.find();
  for (const doc of settings) {
    const next = normalizeProduceCategoriesSetting(doc.vegetableCategories);
    if (next !== doc.vegetableCategories) {
      doc.vegetableCategories = next;
      await doc.save();
    }
  }
}

/** Remap legacy category names and apply the catalog category map. Does not create produce. */
export function ensureProduceCatalog(): Promise<void> {
  if (!pending) {
    pending = migrateLegacyProduceCatalog().catch((err) => {
      pending = null;
      throw err;
    });
  }
  return pending;
}
