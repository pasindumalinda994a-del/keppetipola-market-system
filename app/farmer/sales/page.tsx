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
import { ApiError, completeSale, fetchSales } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { Sale } from "@/types";

export default function FarmerSalesPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: sales, setData: setSales, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchSales(authToken)).sales,
    [] as Sale[]
  );

  async function onComplete(id: string) {
    if (!token) return;
    try {
      await completeSale(token, id);
      toast.success(t("farmer.sales.completed"));
      setSales((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "Completed" } : s))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  return (
    <div>
      <PageHeader
        title={t("farmer.sales.title")}
        description={t("farmer.sales.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : sales.length === 0 ? (
        <EmptyState title={t("farmer.sales.empty")} />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.trader")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.quantity")}</TableHead>
                <TableHead>{t("common.total")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <Link
                      href={`/farmer/sales/${s.id}`}
                      className="font-medium hover:underline"
                    >
                      {formatDate(s.date, locale)}
                    </Link>
                  </TableCell>
                  <TableCell>{s.traderName}</TableCell>
                  <TableCell>
                    {translateVegetableName(s.vegetableName, t)}
                  </TableCell>
                  <TableCell>{formatKg(s.quantityKg, locale)}</TableCell>
                  <TableCell className="font-semibold text-price-foreground">
                    {formatLKR(s.total, locale)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {s.status === "Accepted" ? (
                      <Button size="sm" onClick={() => void onComplete(s.id)}>
                        {t("common.markCompleted")}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/farmer/sales/${s.id}`}>{t("common.view")}</Link>
                      </Button>
                    )}
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
