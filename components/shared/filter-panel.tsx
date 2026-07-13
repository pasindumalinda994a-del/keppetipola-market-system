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

  const fields = (
    <div className="grid gap-4 sm:grid-cols-3">
      {vegetables.length > 0 ? (
        <div className="space-y-2">
          <Label>Vegetable</Label>
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
              <SelectValue placeholder="All vegetables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vegetables</SelectItem>
              {vegetables.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {traders.length > 0 ? (
        <div className="space-y-2">
          <Label>Trader</Label>
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
              <SelectValue placeholder="All traders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All traders</SelectItem>
              {traders.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
      {statuses.length > 0 ? (
        <div className="space-y-2">
          <Label>Status</Label>
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
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
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
            Filters
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4 px-4 pb-6">{fields}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
