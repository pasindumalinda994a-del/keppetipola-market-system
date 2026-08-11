"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, fetchPrices, updatePrice } from "@/lib/api";
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";
import { formatLKR, formatRelativeTime } from "@/lib/format";
import type { MarketPrice } from "@/types";

export default function AdminPricesPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [selected, setSelected] = useState<MarketPrice | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchPrices();
      setPrices(data.prices);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t("common.requestFailed")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCorrect(p: MarketPrice) {
    setSelected(p);
    setOpen(true);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected || !token) return;
    const fd = new FormData(e.currentTarget);
    const lowest = Number(fd.get("lowest"));
    const highest = Number(fd.get("highest"));
    setSaving(true);
    try {
      await updatePrice(token, selected.vegetableId, { lowest, highest });
      await load();
      setOpen(false);
      toast.success(t("admin.prices.corrected"));
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t("common.requestFailed")
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("admin.prices.title")}
        description={t("admin.prices.description")}
      />
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
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
              {prices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    {t("admin.prices.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                prices.map((p) => (
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

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
              <Button type="submit" disabled={saving}>
                {saving ? t("common.saving") : t("admin.prices.saveCorrection")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
