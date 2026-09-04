import mongoose, { type Types } from "mongoose";
import { PriceSnapshot } from "@/database/price-snapshot.model";
import type { PriceHistoryPoint, PriceHistoryRange } from "@/types";

export function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function addUtcDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateKey(d);
}

export async function upsertPriceSnapshot(input: {
  vegetableId: Types.ObjectId | string;
  lowest: number;
  highest: number;
  average: number;
  date?: string;
}): Promise<void> {
  const date = input.date ?? utcDateKey();
  await PriceSnapshot.findOneAndUpdate(
    { vegetableId: input.vegetableId, date },
    {
      $set: {
        vegetableId: input.vegetableId,
        date,
        lowest: input.lowest,
        highest: input.highest,
        average: input.average,
      },
    },
    { upsert: true }
  );
}

function rangeStartKey(range: PriceHistoryRange, today: string): string {
  if (range === "week") return addUtcDays(today, -6);
  if (range === "month") return addUtcDays(today, -29);
  const d = new Date(`${today}T00:00:00.000Z`);
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - 11);
  return utcDateKey(d);
}

function toPoint(doc: {
  date: string;
  average: number;
  lowest: number;
  highest: number;
}): PriceHistoryPoint {
  return {
    date: doc.date,
    average: doc.average,
    lowest: doc.lowest,
    highest: doc.highest,
  };
}

function monthlyPoints(rows: PriceHistoryPoint[]): PriceHistoryPoint[] {
  const buckets = new Map<
    string,
    { sumAvg: number; sumLow: number; sumHigh: number; n: number }
  >();

  for (const row of rows) {
    const monthKey = `${row.date.slice(0, 7)}-01`;
    const bucket = buckets.get(monthKey) ?? {
      sumAvg: 0,
      sumLow: 0,
      sumHigh: 0,
      n: 0,
    };
    bucket.sumAvg += row.average;
    bucket.sumLow += row.lowest;
    bucket.sumHigh += row.highest;
    bucket.n += 1;
    buckets.set(monthKey, bucket);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => ({
      date,
      average: Math.round(bucket.sumAvg / bucket.n),
      lowest: Math.round(bucket.sumLow / bucket.n),
      highest: Math.round(bucket.sumHigh / bucket.n),
    }));
}

export async function getPriceHistory(
  vegetableId: string,
  range: PriceHistoryRange = "week"
): Promise<PriceHistoryPoint[]> {
  if (!mongoose.isValidObjectId(vegetableId)) return [];

  const today = utcDateKey();
  const start = rangeStartKey(range, today);
  const rows = await PriceSnapshot.find({
    vegetableId,
    date: { $gte: start, $lte: today },
  }).sort({ date: 1 });

  const points = rows.map(toPoint);
  return range === "year" ? monthlyPoints(points) : points;
}

export async function getPriceHistories(
  vegetableIds: string[],
  range: PriceHistoryRange = "week"
): Promise<Record<string, PriceHistoryPoint[]>> {
  const ids = [...new Set(vegetableIds.filter((id) => mongoose.isValidObjectId(id)))];
  const result: Record<string, PriceHistoryPoint[]> = {};
  for (const id of ids) {
    result[id] = [];
  }
  if (ids.length === 0) return result;

  const today = utcDateKey();
  const start = rangeStartKey(range, today);
  const rows = await PriceSnapshot.find({
    vegetableId: { $in: ids },
    date: { $gte: start, $lte: today },
  }).sort({ date: 1 });

  for (const row of rows) {
    const id = String(row.vegetableId);
    if (!result[id]) result[id] = [];
    result[id].push(toPoint(row));
  }

  if (range === "year") {
    for (const id of ids) {
      result[id] = monthlyPoints(result[id] ?? []);
    }
  }

  return result;
}

export function parsePriceHistoryRange(value: unknown): PriceHistoryRange {
  if (value === "month" || value === "year" || value === "week") return value;
  return "week";
}
