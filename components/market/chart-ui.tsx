"use client";

import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Shared palette for multi-series charts — vivid but calm on mint surfaces */
export const CHART_SERIES_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const chartAxisTick = {
  fill: "var(--muted-foreground)",
  fontSize: 11,
  fontWeight: 500,
} as const;

export const chartMargin = {
  top: 12,
  right: 12,
  left: 4,
  bottom: 4,
} as const;

/** Soft card frame used by every chart */
export function ChartShell({
  children,
  height,
  className,
  empty,
}: {
  children?: ReactNode;
  height?: number;
  className?: string;
  empty?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-2xl bg-card p-3 shadow-[0_1px_2px_rgba(15,15,15,0.04),0_8px_24px_rgba(15,15,15,0.05)] sm:p-4",
        className
      )}
      style={height != null ? { height } : undefined}
    >
      {empty ? (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-6 text-center">
          {empty}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function ChartEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </>
  );
}

/** Compact custom tooltip — readable over busy series */
export function ChartTooltipContent({
  label,
  items,
}: {
  label?: string;
  items: { name: string; value: string; color?: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="min-w-[148px] rounded-xl border border-border/60 bg-card/95 px-3 py-2.5 shadow-[0_8px_24px_rgba(15,15,15,0.1)] backdrop-blur-sm">
      {label ? (
        <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
      ) : null}
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li
            key={item.name}
            className="flex items-center justify-between gap-4 text-xs"
          >
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: item.color ?? "var(--primary)" }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {item.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Soft legend row under / above the plot */
export function ChartLegendRow({
  items,
}: {
  items: { name: string; color: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 px-1 pb-1">
      {items.map((item) => (
        <span
          key={item.name}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <span
            className="size-2 rounded-full"
            style={{ background: item.color }}
          />
          {item.name}
        </span>
      ))}
    </div>
  );
}

/** iOS-style segmented control for chart filters */
export function ChartSegmentedControl<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  size = "md",
}: {
  value: T;
  onChange: (value: T) => void;
  options: {
    value: T;
    label: string;
    icon?: ComponentType<{ className?: string }>;
    title?: string;
  }[];
  ariaLabel: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center rounded-full bg-muted/80 p-0.5",
        size === "sm" && "gap-0"
      )}
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full font-medium transition-all",
              size === "sm"
                ? "h-7 px-2.5 text-[11px]"
                : "h-8 px-3 text-xs",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
