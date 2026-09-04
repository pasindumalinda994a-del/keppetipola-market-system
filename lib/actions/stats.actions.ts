import { Sale } from "@/database/sale.model";
import { User } from "@/database/user.model";
import type { MarketStatCard, MarketStats } from "@/types";

function startOfUtcDay(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t < end.getTime();
}

function pctChange(today: number, yesterday: number): number {
  if (yesterday === 0) return 0;
  return Math.round(((today - yesterday) / yesterday) * 1000) / 10;
}

function card(
  today: number,
  yesterday: number,
  chartData: number[]
): MarketStatCard {
  return {
    value: today,
    change: pctChange(today, yesterday),
    chartData,
  };
}

export async function getMarketStats(): Promise<MarketStats> {
  const today = startOfUtcDay(new Date());
  const days = Array.from({ length: 5 }, (_, i) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - (4 - i));
    return day;
  });
  const rangeStart = days[0];
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const [sales, activeFarmers, activeTraders, joins] = await Promise.all([
    Sale.find({
      status: "Completed",
      date: { $gte: rangeStart, $lt: tomorrow },
    }).select("date quantityKg"),
    User.countDocuments({ role: "farmer", status: "Active" }),
    User.countDocuments({ role: "trader", status: "Active" }),
    User.find({
      role: { $in: ["farmer", "trader"] },
      joinedAt: { $gte: rangeStart, $lt: tomorrow },
    }).select("role joinedAt"),
  ]);

  const txnCounts: number[] = [];
  const kgCounts: number[] = [];
  const farmerJoins: number[] = [];
  const traderJoins: number[] = [];

  for (const day of days) {
    const next = new Date(day);
    next.setUTCDate(next.getUTCDate() + 1);
    const daySales = sales.filter((s) => inRange(s.date, day, next));
    txnCounts.push(daySales.length);
    kgCounts.push(daySales.reduce((sum, s) => sum + s.quantityKg, 0));
    farmerJoins.push(
      joins.filter((u) => u.role === "farmer" && inRange(u.joinedAt, day, next))
        .length
    );
    traderJoins.push(
      joins.filter((u) => u.role === "trader" && inRange(u.joinedAt, day, next))
        .length
    );
  }

  const todayKg = kgCounts[4] ?? 0;
  const yesterdayKg = kgCounts[3] ?? 0;

  return {
    todayTransactions: card(txnCounts[4] ?? 0, txnCounts[3] ?? 0, txnCounts),
    activeFarmers: {
      value: activeFarmers,
      change: pctChange(farmerJoins[4] ?? 0, farmerJoins[3] ?? 0),
      chartData: farmerJoins,
    },
    activeTraders: {
      value: activeTraders,
      change: pctChange(traderJoins[4] ?? 0, traderJoins[3] ?? 0),
      chartData: traderJoins,
    },
    vegetablesSoldTons: {
      value: Math.round((todayKg / 1000) * 10) / 10,
      change: pctChange(todayKg, yesterdayKg),
      chartData: kgCounts,
    },
  };
}
