"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { sales } from "@/lib/mock";

export default function FarmerSalesPage() {
  const { t, locale } = useLocale();

  return (
    <div>
      <PageHeader
        title={t("farmer.sales.title")}
        description={t("farmer.sales.description")}
      />
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
                <TableCell>{translateVegetableName(s.vegetableName, t)}</TableCell>
                <TableCell>{formatKg(s.quantityKg, locale)}</TableCell>
                <TableCell className="font-semibold text-price-foreground">
                  {formatLKR(s.total, locale)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
