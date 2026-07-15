import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function MiniBarChart({
  data,
  tone,
}: {
  data: number[];
  tone: "up" | "down" | "neutral";
}) {
  const max = Math.max(...data, 1);

  return (
    <div
      className={cn(
        "flex h-14 min-w-14 shrink-0 items-end justify-end gap-1",
        tone === "up" && "text-primary",
        tone === "down" && "text-chart-2",
        tone === "neutral" && "text-muted-foreground"
      )}
      aria-hidden
    >
      {data.map((n, i) => {
        const ratio = n / max;
        return (
          <span
            key={i}
            className="w-1.5 rounded-full bg-current transition-opacity"
            style={{
              height: `${Math.max(16, ratio * 100)}%`,
              opacity: 0.35 + ratio * 0.65,
            }}
          />
        );
      })}
    </div>
  );
}

const defaultCharts = [
  [4, 6, 5, 8, 7],
  [6, 4, 7, 5, 9],
  [3, 5, 4, 6, 5],
  [5, 7, 6, 8, 9],
];

export function StatCard({
  title,
  value,
  change,
  changeLabel = "than last month",
  chartData,
  hint,
  className,
}: {
  title: string;
  value: string;
  /** Percent change vs prior period. Positive = up / green; negative = down / amber. */
  change?: number;
  changeLabel?: string;
  /** Relative bar heights for the sparkline (defaults to a small sample series). */
  chartData?: number[];
  /** Fallback secondary line when `change` is omitted. */
  hint?: string;
  className?: string;
}) {
  const tone: "up" | "down" | "neutral" =
    change == null || change === 0 ? "neutral" : change > 0 ? "up" : "down";
  const TrendIcon =
    tone === "up" ? ArrowUpRight : tone === "down" ? ArrowDownRight : Minus;
  const bars =
    chartData ??
    defaultCharts[
      Math.abs(title.length + value.length) % defaultCharts.length
    ];
  const changeAbs =
    change == null ? null : Math.abs(Number(change.toFixed(1)));

  return (
    <div
      className={cn(
        "flex items-end justify-between gap-4 rounded-2xl bg-card p-5 text-card-foreground shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_rgba(15,15,15,0.05)]",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground tabular-nums sm:text-[1.75rem]">
          {value}
        </p>
        {change != null ? (
          <p
            className={cn(
              "mt-2 inline-flex items-center gap-0.5 text-xs font-medium",
              tone === "up" && "text-success",
              tone === "down" && "text-destructive",
              tone === "neutral" && "text-muted-foreground"
            )}
          >
            <TrendIcon className="size-3.5 shrink-0" strokeWidth={2.25} />
            <span>
              {changeAbs}% {changeLabel}
            </span>
          </p>
        ) : hint ? (
          <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      <MiniBarChart data={bars} tone={tone === "neutral" ? "up" : tone} />
    </div>
  );
}
