"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR } from "@/lib/format";
import {
  getPriceHistory,
  type PriceHistoryRange,
} from "@/lib/mock";
import {
  CHART_SERIES_COLORS,
  ChartEmptyState,
  ChartLegendRow,
  ChartShell,
  ChartTooltipContent,
  chartAxisTick,
  chartMargin,
} from "@/components/market/chart-ui";

export type ChartVegetable = {
  id: string;
  name: string;
};

export type PriceChartType = "line" | "bar" | "area";
export type PriceChartMetric = "average" | "highest" | "lowest";

function formatTick(value: string, range: PriceHistoryRange) {
  const date = new Date(value);
  if (range === "year") {
    return date.toLocaleDateString("en-LK", {
      month: "short",
      year: "2-digit",
    });
  }
  return date.toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
  });
}

function formatTooltipLabel(value: string, range: PriceHistoryRange) {
  const date = new Date(value);
  if (range === "year") {
    return date.toLocaleDateString("en-LK", {
      month: "long",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-LK", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function MultiSeriesTooltip({
  active,
  payload,
  label,
  range,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  range: PriceHistoryRange;
}) {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipContent
      label={formatTooltipLabel(String(label ?? ""), range)}
      items={payload.map((entry) => ({
        name: String(entry.name ?? entry.dataKey ?? ""),
        value: formatLKR(Number(entry.value)),
        color: typeof entry.color === "string" ? entry.color : undefined,
      }))}
    />
  );
}

export function MultiVegetablePriceChart({
  vegetables,
  height = 320,
  range = "week",
  chartType = "line",
  metric = "average",
}: {
  vegetables: ChartVegetable[];
  height?: number;
  range?: PriceHistoryRange;
  chartType?: PriceChartType;
  metric?: PriceChartMetric;
}) {
  const data = useMemo(() => {
    if (vegetables.length === 0) return [];

    const histories = vegetables.map((v) => ({
      id: v.id,
      name: v.name,
      points: getPriceHistory(v.id, range),
    }));

    const dates = histories[0].points.map((p) => p.date);

    return dates.map((date, i) => {
      const row: Record<string, string | number> = { date };
      for (const h of histories) {
        row[h.name] = h.points[i]?.[metric] ?? 0;
      }
      return row;
    });
  }, [vegetables, range, metric]);

  const tickInterval =
    range === "month" ? 4 : range === "year" ? 0 : "preserveStartEnd";

  const legendItems = vegetables.map((v, i) => ({
    name: v.name,
    color: CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length],
  }));

  const axes = (
    <>
      <CartesianGrid
        vertical={false}
        stroke="var(--border)"
        strokeOpacity={0.7}
        strokeDasharray="0"
      />
      <XAxis
        dataKey="date"
        axisLine={false}
        tickLine={false}
        tick={chartAxisTick}
        dy={8}
        interval={tickInterval}
        minTickGap={range === "month" ? 28 : 8}
        tickFormatter={(v) => formatTick(String(v), range)}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tick={chartAxisTick}
        tickFormatter={(v) => `Rs.${v}`}
        width={52}
        dx={-4}
      />
      <Tooltip
        cursor={{
          stroke: "var(--border)",
          strokeWidth: 1,
          strokeDasharray: "4 4",
        }}
        content={(props) => <MultiSeriesTooltip {...props} range={range} />}
      />
    </>
  );

  if (vegetables.length === 0) {
    return (
      <ChartShell
        height={height}
        empty={
          <ChartEmptyState
            title="No vegetables selected"
            description="Bookmark vegetables above to compare their prices on this chart."
          />
        }
      />
    );
  }

  return (
    <ChartShell height={height}>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={data} margin={chartMargin} barGap={2} barCategoryGap="18%">
              {axes}
              {vegetables.map((v, i) => (
                <Bar
                  key={v.id}
                  dataKey={v.name}
                  name={v.name}
                  fill={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
                  radius={[6, 6, 2, 2]}
                  maxBarSize={22}
                />
              ))}
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={data} margin={chartMargin}>
              <defs>
                {vegetables.map((v, i) => {
                  const color =
                    CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length];
                  return (
                    <linearGradient
                      key={v.id}
                      id={`area-${v.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                  );
                })}
              </defs>
              {axes}
              {vegetables.map((v, i) => {
                const color =
                  CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length];
                return (
                  <Area
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    name={v.name}
                    stroke={color}
                    fill={`url(#area-${v.id})`}
                    strokeWidth={2.25}
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "var(--card)",
                      fill: color,
                    }}
                  />
                );
              })}
            </AreaChart>
          ) : (
            <LineChart data={data} margin={chartMargin}>
              {axes}
              {vegetables.map((v, i) => {
                const color =
                  CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length];
                return (
                  <Line
                    key={v.id}
                    type="monotone"
                    dataKey={v.name}
                    name={v.name}
                    stroke={color}
                    strokeWidth={2.25}
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "var(--card)",
                      fill: color,
                    }}
                  />
                );
              })}
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <ChartLegendRow items={legendItems} />
    </ChartShell>
  );
}
