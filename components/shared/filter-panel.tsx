"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import { statusMessageKeys, translateVegetableName } from "@/lib/i18n/messages";

export type FilterValues = {
  vegetable?: string;
  status?: string;
  trader?: string;
};

export function FilterPanel({
  vegetables = [],
  traders = [],
  statuses = [],
  values,
  onChange,
  className,
}: {
  vegetables?: string[];
  traders?: string[];
  statuses?: string[];
  values: FilterValues;
  onChange: (next: FilterValues) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();

  const fields = (
    <div className="grid gap-4 sm:grid-cols-3">
      {vegetables.length > 0 ? (
        <div className="space-y-2">
          <Label>{t("filter.vegetable")}</Label>
          <Select
            value={values.vegetable ?? "all"}
            onValueChange={(v) =>
              onChange({
                ...values,
                vegetable: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filter.allVegetables")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allVegetables")}</SelectItem>
              {vegetables.map((v) => (
                <SelectItem key={v} value={v}>
                  {translateVegetableName(v, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {traders.length > 0 ? (
        <div className="space-y-2">
          <Label>{t("filter.trader")}</Label>
          <Select
            value={values.trader ?? "all"}
            onValueChange={(v) =>
              onChange({
                ...values,
                trader: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filter.allTraders")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allTraders")}</SelectItem>
              {traders.map((tr) => (
                <SelectItem key={tr} value={tr}>
                  {tr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {statuses.length > 0 ? (
        <div className="space-y-2">
          <Label>{t("filter.status")}</Label>
          <Select
            value={values.status ?? "all"}
            onValueChange={(v) =>
              onChange({
                ...values,
                status: !v || v === "all" ? undefined : v,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filter.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filter.allStatuses")}</SelectItem>
              {statuses.map((s) => {
                const key = statusMessageKeys[s];
                return (
                  <SelectItem key={s} value={s}>
                    {key ? t(key) : s}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div className={cn("hidden md:block", className)}>{fields}</div>
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="w-full gap-2" />
            }
          >
            <Filter className="size-4" />
            {t("filter.title")}
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader>
              <SheetTitle>{t("filter.title")}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-4 pb-6">{fields}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
