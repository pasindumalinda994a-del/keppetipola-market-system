"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchSales } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { Sale } from "@/types";

export default function PurchaseHistoryPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: sales, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchSales(authToken, "Completed")).sales,
    [] as Sale[]
  );

  return (
    <div>
      <PageHeader
        title={t("trader.history.title")}
        description={t("trader.history.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : sales.length === 0 ? (
        <EmptyState title={t("trader.history.empty")} />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.farmer")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.qty")}</TableHead>
                <TableHead>{t("common.amount")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.date, locale)}</TableCell>
                  <TableCell className="font-medium">{p.farmerName}</TableCell>
                  <TableCell>
                    {translateVegetableName(p.vegetableName, t)}
                  </TableCell>
                  <TableCell>{formatKg(p.quantityKg, locale)}</TableCell>
                  <TableCell className="font-semibold text-price-foreground">
                    {formatLKR(p.total, locale)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={p.status} />
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
