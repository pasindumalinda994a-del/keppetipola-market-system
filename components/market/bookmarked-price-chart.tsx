"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  ChartArea,
  ChartColumn,
  ChartLine,
} from "lucide-react";
import { toast } from "sonner";
import {
  MultiVegetablePriceChart,
  type PriceChartMetric,
  type PriceChartType,
} from "@/components/market/multi-vegetable-price-chart";
import { ChartSegmentedControl } from "@/components/market/chart-ui";
import { cn } from "@/lib/utils";
import { vegetables as vegSeed, type PriceHistoryRange } from "@/lib/mock";
import type { Vegetable } from "@/types";

const MAX_BOOKMARKS = 5;

const RANGE_OPTIONS: { value: PriceHistoryRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const CHART_TYPE_OPTIONS: {
  value: PriceChartType;
  label: string;
  icon: typeof ChartLine;
  title: string;
}[] = [
  {
    value: "line",
    label: "Line",
    icon: ChartLine,
    title: "Best for spotting price movement over time",
  },
  {
    value: "bar",
    label: "Bar",
    icon: ChartColumn,
    title: "Best for comparing prices on each day or month",
  },
  {
    value: "area",
    label: "Area",
    icon: ChartArea,
    title: "Shows how large price swings are over time",
  },
];

const METRIC_OPTIONS: { value: PriceChartMetric; label: string }[] = [
  { value: "average", label: "Avg" },
  { value: "highest", label: "High" },
  { value: "lowest", label: "Low" },
];

const METRIC_LABEL: Record<PriceChartMetric, string> = {
  average: "average",
  highest: "highest",
  lowest: "lowest",
};

const RANGE_LABEL: Record<PriceHistoryRange, string> = {
  week: "this week",
  month: "this month",
  year: "this year",
};

function initialVegetables(): Vegetable[] {
  let selected = 0;
  return vegSeed.map((v) => {
    const bookmarked = Boolean(v.bookmarked) && selected < MAX_BOOKMARKS;
    if (bookmarked) selected += 1;
    return { ...v, bookmarked };
  });
}

export function BookmarkedPriceChart({
  title = "Price trend",
  height = 340,
  showRangeFilter = false,
  searchQuery = "",
}: {
  title?: string;
  height?: number;
  showRangeFilter?: boolean;
  searchQuery?: string;
}) {
  const [vegs, setVegs] = useState<Vegetable[]>(initialVegetables);
  const [range, setRange] = useState<PriceHistoryRange>("week");
  const [chartType, setChartType] = useState<PriceChartType>("line");
  const [metric, setMetric] = useState<PriceChartMetric>("average");

  const query = searchQuery.trim().toLowerCase();

  const visibleVegs = useMemo(
    () =>
      query
        ? vegs.filter((v) => v.name.toLowerCase().includes(query))
        : vegs,
    [vegs, query]
  );

  const bookmarkedAll = useMemo(
    () => vegs.filter((v) => v.bookmarked).slice(0, MAX_BOOKMARKS),
    [vegs]
  );

  const bookmarked = useMemo(
    () => visibleVegs.filter((v) => v.bookmarked).slice(0, MAX_BOOKMARKS),
    [visibleVegs]
  );

  const chartVegetables = useMemo(
    () => bookmarked.map((v) => ({ id: v.id, name: v.name })),
    [bookmarked]
  );

  const activeChartHint =
    CHART_TYPE_OPTIONS.find((o) => o.value === chartType)?.title ?? "";

  const chartSummary = showRangeFilter
    ? `Showing ${METRIC_LABEL[metric]} price ${RANGE_LABEL[range]}. ${activeChartHint}.`
    : null;

  function toggleBookmark(id: string) {
    const current = vegs.find((v) => v.id === id);
    if (!current) return;

    if (!current.bookmarked) {
      const count = vegs.filter((v) => v.bookmarked).length;
      if (count >= MAX_BOOKMARKS) {
        toast.error(`You can bookmark up to ${MAX_BOOKMARKS} vegetables`);
        return;
      }
    }

    setVegs((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, bookmarked: !v.bookmarked } : v
      )
    );
  }

  return (
    <section className="rounded-2xl bg-card/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {bookmarkedAll.length > 0
              ? `Watching ${bookmarkedAll.length}/${MAX_BOOKMARKS}: ${bookmarkedAll.map((v) => v.name).join(", ")}`
              : `Bookmark up to ${MAX_BOOKMARKS} vegetables to compare on the chart.`}
          </p>
        </div>

        {showRangeFilter ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ChartSegmentedControl
              ariaLabel="Chart type"
              value={chartType}
              onChange={setChartType}
              options={CHART_TYPE_OPTIONS}
            />
            <ChartSegmentedControl
              ariaLabel="Price metric"
              size="sm"
              value={metric}
              onChange={setMetric}
              options={METRIC_OPTIONS}
            />
            <ChartSegmentedControl
              ariaLabel="Time range"
              size="sm"
              value={range}
              onChange={setRange}
              options={RANGE_OPTIONS}
            />
          </div>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {visibleVegs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vegetables match your search.
          </p>
        ) : (
          visibleVegs.map((v) => {
            const active = Boolean(v.bookmarked);
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => toggleBookmark(v.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Bookmark
                  className="size-3.5"
                  fill={active ? "currentColor" : "none"}
                />
                {v.name}
              </button>
            );
          })
        )}
      </div>

      {chartSummary ? (
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          {chartSummary}
        </p>
      ) : null}

      <MultiVegetablePriceChart
        vegetables={chartVegetables}
        height={height}
        range={showRangeFilter ? range : "week"}
        chartType={showRangeFilter ? chartType : "line"}
        metric={showRangeFilter ? metric : "average"}
      />
    </section>
  );
}
