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

export default function PurchaseOrdersPage() {
  const { t, locale } = useLocale();

  return (
    <div>
      <PageHeader
        title={t("trader.orders.title")}
        description={t("trader.orders.description")}
      />
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.farmerName}</TableCell>
                <TableCell>{translateVegetableName(p.vegetableName, t)}</TableCell>
                <TableCell>{formatKg(p.quantityKg, locale)}</TableCell>
                <TableCell>{formatLKR(p.price, locale)}</TableCell>
                <TableCell>{formatDate(p.delivery, locale)}</TableCell>
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
