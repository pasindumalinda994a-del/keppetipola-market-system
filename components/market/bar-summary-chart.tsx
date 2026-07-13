"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR } from "@/lib/format";

export function BarSummaryChart({
  data,
  dataKey,
  nameKey = "name",
  height = 280,
  valueIsCurrency = false,
}: {
  data: Record<string, string | number>[];
  dataKey: string;
  nameKey?: string;
  height?: number;
  valueIsCurrency?: boolean;
}) {
  return (
    <div className="w-full rounded-xl border bg-card p-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) =>
              valueIsCurrency ? `Rs.${Math.round(Number(v) / 1000)}k` : String(v)
            }
            width={52}
          />
          <Tooltip
            formatter={(value) =>
              valueIsCurrency
                ? formatLKR(Number(value))
                : Number(value).toLocaleString()
            }
          />
          <Bar dataKey={dataKey} fill="var(--primary)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
