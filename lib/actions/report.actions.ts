import { Sale } from "@/database/sale.model";
import type { SalesReport } from "@/types";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function startOfUtcDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function inRange(date: Date, start: Date, end: Date) {
  const t = date.getTime();
  return t >= start.getTime() && t < end.getTime();
}

export async function getSalesReport(traderId?: string): Promise<SalesReport> {
  const filter: Record<string, unknown> = { status: "Completed" };
  if (traderId) {
    filter.traderId = traderId;
  }

  const sales = await Sale.find(filter).sort({ date: 1, createdAt: 1 });
  const today = startOfUtcDay(new Date());

  const daily = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - (6 - i));
    const next = new Date(day);
    next.setUTCDate(next.getUTCDate() + 1);
    const rows = sales.filter((s) => inRange(s.date, day, next));
    return {
      name: day.toISOString().slice(0, 10),
      weekday: day.getUTCDay(),
      amount: rows.reduce((sum, s) => sum + s.total, 0),
    };
  });

  const weekly = Array.from({ length: 4 }, (_, i) => {
    const weekEnd = new Date(today);
    weekEnd.setUTCDate(weekEnd.getUTCDate() - (3 - i) * 7 + 1);
    const weekStart = new Date(weekEnd);
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
    const rows = sales.filter((s) => inRange(s.date, weekStart, weekEnd));
    return {
      name: `W${i + 1}`,
      amount: rows.reduce((sum, s) => sum + s.total, 0),
      purchases: rows.length,
    };
  });

  const monthly = Array.from({ length: 12 }, (_, i) => {
    const monthStart = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - (11 - i), 1)
    );
    const monthEnd = new Date(
      Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1)
    );
    const rows = sales.filter((s) => inRange(s.date, monthStart, monthEnd));
    return {
      name: MONTHS[monthStart.getUTCMonth()],
      amount: rows.reduce((sum, s) => sum + s.total, 0),
      purchases: rows.length,
    };
  });

  const vegMap = new Map<string, number>();
  for (const sale of sales) {
    vegMap.set(
      sale.vegetableName,
      (vegMap.get(sale.vegetableName) ?? 0) + sale.quantityKg
    );
  }
  const topVegetables = [...vegMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, kg]) => ({ name, kg }));

  const exportRows = [...sales].reverse().map((sale) => ({
    date:
      sale.date instanceof Date
        ? sale.date.toISOString().slice(0, 10)
        : String(sale.date).slice(0, 10),
    farmerName: sale.farmerName,
    traderName: sale.traderName,
    vegetableName: sale.vegetableName,
    quantityKg: sale.quantityKg,
    unitPrice: sale.unitPrice,
    total: sale.total,
    status: sale.status,
  }));

  return { daily, weekly, monthly, topVegetables, exportRows };
}
