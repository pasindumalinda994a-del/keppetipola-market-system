"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceHistoryPoint } from "@/types";
import { formatLKR } from "@/lib/format";

export function PriceTrendChart({
  data,
  height = 280,
}: {
  data: PriceHistoryPoint[];
  height?: number;
}) {
  return (
    <div className="w-full rounded-xl border bg-card p-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("en-LK", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `Rs.${v}`}
            width={56}
          />
          <Tooltip
            formatter={(value) => formatLKR(Number(value))}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("en-LK", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="average"
            name="Average"
            stroke="var(--primary)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="highest"
            name="Highest"
            stroke="var(--price)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="lowest"
            name="Lowest"
            stroke="var(--muted-foreground)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
