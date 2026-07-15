"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PriceHistoryPoint } from "@/types";
import { formatLKR } from "@/lib/format";
import {
  ChartLegendRow,
  ChartShell,
  ChartTooltipContent,
  chartAxisTick,
  chartMargin,
} from "@/components/market/chart-ui";

const SERIES = [
  {
    key: "average" as const,
    name: "Average",
    color: "var(--chart-1)",
    strokeWidth: 2.5,
    dash: undefined as string | undefined,
  },
  {
    key: "highest" as const,
    name: "Highest",
    color: "var(--chart-2)",
    strokeWidth: 1.75,
    dash: "5 4",
  },
  {
    key: "lowest" as const,
    name: "Lowest",
    color: "var(--chart-3)",
    strokeWidth: 1.75,
    dash: "5 4",
  },
];

function TrendTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipContent
      label={new Date(String(label)).toLocaleDateString("en-LK", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })}
      items={payload.map((entry) => ({
        name: String(entry.name ?? entry.dataKey ?? ""),
        value: formatLKR(Number(entry.value)),
        color: typeof entry.color === "string" ? entry.color : undefined,
      }))}
    />
  );
}

export function PriceTrendChart({
  data,
  height = 280,
}: {
  data: PriceHistoryPoint[];
  height?: number;
}) {
  return (
    <ChartShell height={height}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={chartMargin}>
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={chartAxisTick}
              dy={8}
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString("en-LK", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={chartAxisTick}
              width={52}
              dx={-4}
              tickFormatter={(v) => `Rs.${v}`}
            />
            <Tooltip
              cursor={{
                stroke: "var(--border)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              content={TrendTooltip}
            />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.name}
                stroke={s.color}
                strokeWidth={s.strokeWidth}
                strokeDasharray={s.dash}
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "var(--card)",
                  fill: s.color,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegendRow
        items={SERIES.map((s) => ({ name: s.name, color: s.color }))}
      />
    </ChartShell>
  );
}
