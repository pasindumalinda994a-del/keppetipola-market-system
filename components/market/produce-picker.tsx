"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/components/providers/locale-provider";
import {
  translateProduceCategory,
  translateVegetableName,
} from "@/lib/i18n/messages";
import {
  filterProduceByCategory,
  uniqueProduceCategories,
} from "@/lib/produce";
import type { Vegetable } from "@/types";

export function ProducePicker({
  vegetables,
  value,
  onChange,
  disabled,
  loading,
}: {
  vegetables: Vegetable[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { t } = useLocale();
  const [category, setCategory] = useState("all");
  const categories = useMemo(
    () => uniqueProduceCategories(vegetables.map((v) => v.category)),
    [vegetables]
  );
  const filtered = useMemo(
    () => filterProduceByCategory(vegetables, category),
    [vegetables, category]
  );
  const items = Object.fromEntries(
    filtered.map((v) => [v.id, translateVegetableName(v.name, t)])
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>{t("common.category")}</Label>
        <Select
          value={category}
          onValueChange={(next) => {
            const selected = next ?? "all";
            setCategory(selected);
            if (
              value &&
              !filterProduceByCategory(vegetables, selected).some(
                (item) => item.id === value
              )
            ) {
              onChange("");
            }
          }}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filter.allCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {translateProduceCategory(c, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("common.vegetable")}</Label>
        <Select
          value={value || undefined}
          onValueChange={(next) => onChange(next ?? "")}
          items={items}
          disabled={disabled || loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("common.selectVegetable")} />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {translateVegetableName(v.name, t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
