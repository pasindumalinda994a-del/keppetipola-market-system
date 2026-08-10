"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { translateVegetableName } from "@/lib/i18n/messages";
import { purchaseOrders } from "@/lib/mock";

export default function PurchaseHistoryPage() {
  const { t, locale } = useLocale();
  const history = purchaseOrders.filter(
    (p) => p.status === "Completed" || p.status === "Accepted"
  );

  return (
    <div>
      <PageHeader
        title={t("trader.history.title")}
        description={t("trader.history.description")}
      />
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
            {history.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDate(p.date, locale)}</TableCell>
                <TableCell className="font-medium">{p.farmerName}</TableCell>
                <TableCell>{translateVegetableName(p.vegetableName, t)}</TableCell>
                <TableCell>{formatKg(p.quantityKg, locale)}</TableCell>
                <TableCell className="font-semibold text-price-foreground">
                  {formatLKR(p.price * p.quantityKg, locale)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
