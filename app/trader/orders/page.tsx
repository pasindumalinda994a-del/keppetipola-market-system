"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, completeSale, fetchSales } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { Sale } from "@/types";

export default function PurchaseOrdersPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: sales, setData: setSales, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchSales(authToken, "Accepted")).sales,
    [] as Sale[]
  );

  async function onComplete(id: string) {
    if (!token) return;
    try {
      await completeSale(token, id);
      toast.success(t("trader.orders.completed"));
      setSales((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("trader.orders.title")}
        description={t("trader.orders.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : sales.length === 0 ? (
        <EmptyState title={t("trader.orders.empty")} />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.farmer")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.qty")}</TableHead>
                <TableHead>{t("common.price")}</TableHead>
                <TableHead>{t("common.delivery")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.farmerName}</TableCell>
                  <TableCell>
                    {translateVegetableName(p.vegetableName, t)}
                  </TableCell>
                  <TableCell>{formatKg(p.quantityKg, locale)}</TableCell>
                  <TableCell>{formatLKR(p.unitPrice, locale)}</TableCell>
                  <TableCell>
                    {formatDate(p.delivery ?? p.date, locale)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => void onComplete(p.id)}>
                      {t("common.markCompleted")}
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
