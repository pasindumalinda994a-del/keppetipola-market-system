"use client";

import { ChartSegmentedControl } from "@/components/market/chart-ui";
import { useLocale } from "@/components/providers/locale-provider";
import { translateProduceCategory } from "@/lib/i18n/messages";
import { PRODUCE_CATEGORIES } from "@/lib/produce";

export function ProduceCategoryFilter({
  value,
  onChange,
  categories,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  categories?: string[];
  className?: string;
}) {
  const { t } = useLocale();
  const options = categories?.length ? categories : [...PRODUCE_CATEGORIES];

  return (
    <div className={className}>
      <ChartSegmentedControl
        value={value}
        onChange={onChange}
        ariaLabel={t("filter.category")}
        options={[
          { value: "all", label: t("filter.allCategories") },
          ...options.map((category) => ({
            value: category,
            label: translateProduceCategory(category, t),
          })),
        ]}
      />
    </div>
  );
}
