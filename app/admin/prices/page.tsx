"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";
import { formatLKR, formatRelativeTime } from "@/lib/format";
import { marketPrices as seed } from "@/lib/mock";
import type { MarketPrice } from "@/types";

export default function AdminPricesPage() {
  const { t, locale } = useLocale();
  const [prices, setPrices] = useState<MarketPrice[]>(seed);
  const [selected, setSelected] = useState<MarketPrice | null>(null);
  const [open, setOpen] = useState(false);

  function openCorrect(p: MarketPrice) {
    setSelected(p);
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const lowest = Number(fd.get("lowest"));
    const highest = Number(fd.get("highest"));
    const average = Math.round((lowest + highest) / 2);
    setPrices((prev) =>
      prev.map((p) =>
        p.vegetableId === selected.vegetableId
          ? {
              ...p,
              lowest,
              highest,
              average,
              lastUpdated: new Date().toISOString(),
            }
          : p
      )
    );
    setOpen(false);
    toast.success(t("admin.prices.corrected"));
  }

  return (
    <div>
      <PageHeader
        title={t("admin.prices.title")}
        description={t("admin.prices.description")}
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.vegetable")}</TableHead>
              <TableHead>{t("common.lowest")}</TableHead>
              <TableHead>{t("common.highest")}</TableHead>
              <TableHead>{t("common.average")}</TableHead>
              <TableHead>{t("common.updated")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {prices.map((p) => (
              <TableRow key={p.vegetableId}>
                <TableCell className="font-medium">
                  {translateVegetableName(p.vegetableName, t)}
                </TableCell>
                <TableCell>{formatLKR(p.lowest, locale)}</TableCell>
                <TableCell>{formatLKR(p.highest, locale)}</TableCell>
                <TableCell className="font-semibold text-price-foreground">
                  {formatLKR(p.average, locale)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(p.lastUpdated, locale)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCorrect(p)}
                  >
                    {t("admin.prices.correct")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? fillTemplate(t("admin.prices.correctDesc"), {
                    name: translateVegetableName(selected.vegetableName, t),
                  })
                : t("admin.prices.correctTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowest">{t("common.lowest")}</Label>
              <Input
                id="lowest"
                name="lowest"
                type="number"
                defaultValue={selected?.lowest}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highest">{t("common.highest")}</Label>
              <Input
                id="highest"
                name="highest"
                type="number"
                defaultValue={selected?.highest}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t("admin.prices.saveCorrection")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
