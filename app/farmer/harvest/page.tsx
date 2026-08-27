"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, deleteHarvest, fetchHarvests, updateHarvest } from "@/lib/api";
import { formatDate, formatKg } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { Harvest } from "@/types";

export default function FarmerHarvestPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: harvests, setData: setHarvests, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchHarvests(authToken, { mine: true })).harvests,
    [] as Harvest[]
  );

  async function onDelete(id: string) {
    if (!token) return;
    if (!window.confirm(t("farmer.harvest.deleteConfirm"))) return;
    try {
      await deleteHarvest(token, id);
      toast.success(t("farmer.harvest.deleted"));
      setHarvests((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  async function onClose(id: string) {
    if (!token) return;
    try {
      await updateHarvest(token, id, { status: "Closed" });
      toast.success(t("farmer.harvest.closed"));
      setHarvests((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: "Closed" } : h))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("farmer.harvest.title")}
        description={t("farmer.harvest.description")}
        action={
          <Button asChild>
            <Link href="/farmer/harvest/new">{t("farmer.harvest.add")}</Link>
          </Button>
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : harvests.length === 0 ? (
        <EmptyState
          title={t("farmer.harvest.empty")}
          description={t("farmer.harvest.emptyDescription")}
          action={
            <Button asChild>
              <Link href="/farmer/harvest/new">{t("farmer.harvest.add")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.harvestDate")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {harvests.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="font-medium">
                    {translateVegetableName(h.vegetableName, t)}
                  </TableCell>
                  <TableCell>
                    {formatKg(h.remainingKg ?? h.quantityKg, locale)}
                    {h.remainingKg != null && h.remainingKg !== h.quantityKg
                      ? ` / ${formatKg(h.quantityKg, locale)}`
                      : ""}
                  </TableCell>
                  <TableCell>{formatDate(h.harvestDate, locale)}</TableCell>
                  <TableCell>
                    <StatusBadge status={h.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/farmer/harvest/${h.id}`}>{t("common.view")}</Link>
                    </Button>
                    {h.status === "Active" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void onClose(h.id)}
                      >
                        {t("common.closeListing")}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => void onDelete(h.id)}
                    >
                      {t("common.delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
