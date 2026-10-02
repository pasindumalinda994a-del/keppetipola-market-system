import {
  MarketPrice,
  type MarketPriceDocument,
  type MarketPriceSource,
} from "@/database/market-price.model";
import { PriceSnapshot } from "@/database/price-snapshot.model";
import type { SaleDocument } from "@/database/sale.model";
import { writeSystemLog } from "@/lib/actions/log.actions";
import { upsertPriceSnapshot, utcDateKey } from "@/lib/actions/price-history.actions";

async function previousDayAverage(
  price: MarketPriceDocument,
  today: string
): Promise<number> {
  const prior = await PriceSnapshot.findOne({
    vegetableId: price.vegetableId,
    date: { $lt: today },
  }).sort({ date: -1 });
  return prior?.average ?? 0;
}

export async function setPriceRange(
  price: MarketPriceDocument,
  input: { lowest: number; highest: number; source: MarketPriceSource }
): Promise<MarketPriceDocument> {
  const today = utcDateKey();
  const average = Math.round((input.lowest + input.highest) / 2);
  const baseline = await previousDayAverage(price, today);

  price.lowest = input.lowest;
  price.highest = input.highest;
  price.average = average;
  price.change =
    baseline > 0 ? Math.round(((average - baseline) / baseline) * 100) : 0;
  price.rangeDate = today;
  price.source = input.source;
  price.lastUpdated = new Date();

  await price.save();
  await upsertPriceSnapshot({
    vegetableId: price.vegetableId,
    lowest: price.lowest,
    highest: price.highest,
    average: price.average,
    date: today,
  });
  return price;
}

export async function applySalePrice(
  sale: SaleDocument
): Promise<MarketPriceDocument | null> {
  const salePrice = sale.originalUnitPrice ?? sale.unitPrice;
  if (!Number.isFinite(salePrice) || salePrice <= 0) return null;

  const price = await MarketPrice.findOne({ vegetableId: sale.vegetableId });
  if (!price) return null;

  const today = utcDateKey();
  const isNewDay = price.rangeDate !== today;
  const lowest = isNewDay ? salePrice : Math.min(price.lowest, salePrice);
  const highest = isNewDay ? salePrice : Math.max(price.highest, salePrice);
  const rangeChanged = lowest !== price.lowest || highest !== price.highest;

  price.salesCount = isNewDay ? 1 : (price.salesCount ?? 0) + 1;
  await setPriceRange(price, { lowest, highest, source: "sales" });

  if (rangeChanged) {
    await writeSystemLog(
      "Price Update",
      `${price.vegetableName} range set to Rs.${lowest}–Rs.${highest} from sale (${sale.quantityKg} kg @ Rs.${salePrice})`
    );
  }
  return price;
}
