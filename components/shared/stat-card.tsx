import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export const STAT_ICONS = {
  wheat: "/Icons/wheat_45dp_1F1F1F_FILL0_wght400_GRAD0_opsz48.svg",
  priceCheck: "/Icons/price_check_45dp_1F1F1F_FILL0_wght400_GRAD0_opsz48.svg",
  sell: "/Icons/sell_45dp_1F1F1F_FILL0_wght400_GRAD0_opsz48.svg",
  finance: "/Icons/finance_45dp_1F1F1F_FILL0_wght400_GRAD0_opsz48.svg",
} as const;

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
  icon,
  variant = "default",
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
  /** Public SVG path or a node (e.g. Lucide icon); when set, replaces the sparkline. */
  icon?: string | React.ReactNode;
  variant?: "default" | "brand";
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
        "flex h-full items-end justify-between gap-4 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_rgba(15,15,15,0.05)]",
        variant === "brand"
          ? "bg-primary/15 text-foreground"
          : "bg-card text-card-foreground",
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
      {typeof icon === "string" ? (
        <Image
          src={icon}
          alt=""
          width={45}
          height={45}
          unoptimized
          className="size-11 shrink-0 opacity-80"
        />
      ) : icon ? (
        <span className="flex size-11 shrink-0 items-center justify-center opacity-80 [&_svg]:size-11">
          {icon}
        </span>
      ) : (
        <MiniBarChart data={bars} tone={tone === "neutral" ? "up" : tone} />
      )}
    </div>
  );
}

export function StatCardRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-80 overflow-hidden rounded-2xl p-4 sm:p-5 xl:min-h-[28rem]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Image
          src="/images/Harvested_vegetables_in_agricult…_2K_202609061519.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_70%]"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>
      <div className="relative z-10 grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-5 [&>:nth-child(4)]:xl:col-start-1">
        {children}
      </div>
    </div>
  );
}
