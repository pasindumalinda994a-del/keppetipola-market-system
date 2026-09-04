"use client";

import { useEffect, useMemo, useState } from "react";
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
import { MAX_BOOKMARKS } from "@/lib/bookmarks";
import type { PriceHistoryRange, Vegetable } from "@/types";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { useVegetables } from "@/lib/hooks/use-vegetables";
import {
  fillTemplate,
  type MessageKey,
  translateVegetableName,
  vegetableMatchesQuery,
} from "@/lib/i18n/messages";
import { ApiError } from "@/lib/api";

function applyBookmarks(
  source: Vegetable[],
  bookmarkedIds: string[] | undefined
): Vegetable[] {
  const selected = new Set((bookmarkedIds ?? []).slice(0, MAX_BOOKMARKS));
  return source.map((v) => ({
    ...v,
    bookmarked: selected.has(v.id),
  }));
}

export function BookmarkedPriceChart({
  title,
  height = 340,
  showRangeFilter = false,
  searchQuery = "",
  vegetables: vegetablesProp,
}: {
  title?: string;
  height?: number;
  showRangeFilter?: boolean;
  searchQuery?: string;
  vegetables?: Vegetable[];
}) {
  const { t } = useLocale();
  const { user, updateBookmarks } = useAuth();
  const { vegetables: fetched } = useVegetables();
  const source = vegetablesProp?.length ? vegetablesProp : fetched;
  const bookmarkKey = (user?.bookmarkedVegetableIds ?? []).join(",");
  const sourceKey = source.map((v) => v.id).join(",");

  const [vegs, setVegs] = useState<Vegetable[]>(() =>
    applyBookmarks(source, user?.bookmarkedVegetableIds)
  );
  const [saving, setSaving] = useState(false);
  const [range, setRange] = useState<PriceHistoryRange>("week");
  const [chartType, setChartType] = useState<PriceChartType>("line");
  const [metric, setMetric] = useState<PriceChartMetric>("average");

  useEffect(() => {
    setVegs(applyBookmarks(source, user?.bookmarkedVegetableIds));
  }, [sourceKey, bookmarkKey, source, user?.bookmarkedVegetableIds]);

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

  async function toggleBookmark(id: string) {
    if (saving) return;
    const current = vegs.find((v) => v.id === id);
    if (!current) return;

    const nextIds = current.bookmarked
      ? vegs.filter((v) => v.bookmarked && v.id !== id).map((v) => v.id)
      : [...vegs.filter((v) => v.bookmarked).map((v) => v.id), id];

    if (!current.bookmarked && nextIds.length > MAX_BOOKMARKS) {
      toast.error(
        fillTemplate(t("chart.bookmarkLimit"), { max: MAX_BOOKMARKS })
      );
      return;
    }

    const previous = vegs;
    setVegs(applyBookmarks(vegs, nextIds));
    setSaving(true);
    try {
      await updateBookmarks(nextIds);
    } catch (err) {
      setVegs(previous);
      toast.error(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setSaving(false);
    }
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
                disabled={saving}
                onClick={() => toggleBookmark(v.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                  saving && "opacity-70"
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
