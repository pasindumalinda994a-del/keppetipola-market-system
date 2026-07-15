"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatLKR } from "@/lib/format";
import {
  ChartShell,
  ChartTooltipContent,
  chartAxisTick,
  chartMargin,
} from "@/components/market/chart-ui";

function BarTooltip({
  active,
  payload,
  label,
  valueIsCurrency,
}: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
  label?: string | number;
  valueIsCurrency: boolean;
}) {
  if (!active || !payload?.length) return null;

  const entry = payload[0];
  const raw = Number(entry.value);
  const value = valueIsCurrency
    ? formatLKR(raw)
    : `${raw.toLocaleString()} kg`;

  return (
    <ChartTooltipContent
      label={String(label ?? "")}
      items={[
        {
          name: valueIsCurrency ? "Amount" : "Quantity",
          value,
          color:
            typeof entry.color === "string" ? entry.color : "var(--primary)",
        },
      ]}
    />
  );
}

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
  const max = Math.max(...data.map((d) => Number(d[dataKey]) || 0), 1);

  return (
    <ChartShell height={height}>
      <div className="h-full min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={chartMargin} barCategoryGap="22%">
            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.7}
            />
            <XAxis
              dataKey={nameKey}
              axisLine={false}
              tickLine={false}
              tick={chartAxisTick}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={chartAxisTick}
              width={48}
              dx={-4}
              tickFormatter={(v) =>
                valueIsCurrency
                  ? `Rs.${Math.round(Number(v) / 1000)}k`
                  : String(v)
              }
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
              content={(props) => (
                <BarTooltip {...props} valueIsCurrency={valueIsCurrency} />
              )}
            />
            <Bar dataKey={dataKey} radius={[8, 8, 4, 4]} maxBarSize={44}>
              {data.map((entry, index) => {
                const ratio = (Number(entry[dataKey]) || 0) / max;
                const opacity = 0.45 + ratio * 0.55;
                return (
                  <Cell
                    key={`${String(entry[nameKey])}-${index}`}
                    fill="var(--primary)"
                    fillOpacity={opacity}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
