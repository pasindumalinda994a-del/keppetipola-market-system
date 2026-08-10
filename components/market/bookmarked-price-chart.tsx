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
import { useLocale } from "@/components/providers/locale-provider";
import { fillTemplate, type MessageKey, translateVegetableName, vegetableMatchesQuery } from "@/lib/i18n/messages";

const MAX_BOOKMARKS = 5;

function initialVegetables(): Vegetable[] {
  let selected = 0;
  return vegSeed.map((v) => {
    const bookmarked = Boolean(v.bookmarked) && selected < MAX_BOOKMARKS;
    if (bookmarked) selected += 1;
    return { ...v, bookmarked };
  });
}

export function BookmarkedPriceChart({
  title,
  height = 340,
  showRangeFilter = false,
  searchQuery = "",
}: {
  title?: string;
  height?: number;
  showRangeFilter?: boolean;
  searchQuery?: string;
}) {
  const { t } = useLocale();
  const [vegs, setVegs] = useState<Vegetable[]>(initialVegetables);
  const [range, setRange] = useState<PriceHistoryRange>("week");
  const [chartType, setChartType] = useState<PriceChartType>("line");
  const [metric, setMetric] = useState<PriceChartMetric>("average");

  const query = searchQuery.trim().toLowerCase();

  const rangeOptions: { value: PriceHistoryRange; label: string }[] = [
    { value: "week", label: t("chart.week") },
    { value: "month", label: t("chart.month") },
    { value: "year", label: t("chart.year") },
  ];

  const chartTypeOptions: {
    value: PriceChartType;
    label: string;
    icon: typeof ChartLine;
    title: string;
  }[] = [
    {
      value: "line",
      label: t("chart.line"),
      icon: ChartLine,
      title: t("chart.lineHint"),
    },
    {
      value: "bar",
      label: t("chart.bar"),
      icon: ChartColumn,
      title: t("chart.barHint"),
    },
    {
      value: "area",
      label: t("chart.area"),
      icon: ChartArea,
      title: t("chart.areaHint"),
    },
  ];

  const metricOptions: { value: PriceChartMetric; label: string }[] = [
    { value: "average", label: t("chart.avg") },
    { value: "highest", label: t("chart.high") },
    { value: "lowest", label: t("chart.low") },
  ];

  const metricLabelKeys: Record<PriceChartMetric, MessageKey> = {
    average: "chart.metric.average",
    highest: "chart.metric.highest",
    lowest: "chart.metric.lowest",
  };

  const rangeLabelKeys: Record<PriceHistoryRange, MessageKey> = {
    week: "chart.range.week",
    month: "chart.range.month",
    year: "chart.range.year",
  };

  const visibleVegs = useMemo(
    () =>
      query
        ? vegs.filter((v) => vegetableMatchesQuery(v.name, query, t))
        : vegs,
    [vegs, query, t]
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
    () =>
      bookmarked.map((v) => ({
        id: v.id,
        name: translateVegetableName(v.name, t),
      })),
    [bookmarked, t]
  );

  const activeChartHint =
    chartTypeOptions.find((o) => o.value === chartType)?.title ?? "";

  const chartSummary = showRangeFilter
    ? fillTemplate(t("chart.summary"), {
        metric: t(metricLabelKeys[metric]),
        range: t(rangeLabelKeys[range]),
        hint: activeChartHint,
      })
    : null;

  function toggleBookmark(id: string) {
    const current = vegs.find((v) => v.id === id);
    if (!current) return;

    if (!current.bookmarked) {
      const count = vegs.filter((v) => v.bookmarked).length;
      if (count >= MAX_BOOKMARKS) {
        toast.error(
          fillTemplate(t("chart.bookmarkLimit"), { max: MAX_BOOKMARKS })
        );
        return;
      }
    }

    setVegs((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, bookmarked: !v.bookmarked } : v
      )
    );
  }

  const heading = title ?? t("chart.priceTrend");

  return (
    <section className="rounded-2xl bg-card/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{heading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {bookmarkedAll.length > 0
              ? fillTemplate(t("chart.watching"), {
                  n: bookmarkedAll.length,
                  max: MAX_BOOKMARKS,
                  names: bookmarkedAll
                    .map((v) => translateVegetableName(v.name, t))
                    .join(", "),
                })
              : fillTemplate(t("chart.bookmarkHint"), { max: MAX_BOOKMARKS })}
          </p>
        </div>

        {showRangeFilter ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ChartSegmentedControl
              ariaLabel={t("chart.typeAria")}
              value={chartType}
              onChange={setChartType}
              options={chartTypeOptions}
            />
            <ChartSegmentedControl
              ariaLabel={t("chart.metricAria")}
              size="sm"
              value={metric}
              onChange={setMetric}
              options={metricOptions}
            />
            <ChartSegmentedControl
              ariaLabel={t("chart.rangeAria")}
              size="sm"
              value={range}
              onChange={setRange}
              options={rangeOptions}
            />
          </div>
        ) : null}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {visibleVegs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("chart.noMatch")}</p>
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
                {translateVegetableName(v.name, t)}
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
