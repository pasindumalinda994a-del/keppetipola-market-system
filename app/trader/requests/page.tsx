"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import { translateVegetableName } from "@/lib/i18n/messages";
import { buyingRequests } from "@/lib/mock";

export default function TraderRequestsPage() {
  const { t, locale } = useLocale();
  const mine = buyingRequests.filter((r) => r.traderId === "trader-1");

  return (
    <div>
      <PageHeader
        title={t("trader.requests.title")}
        description={t("trader.requests.description")}
        action={
          <Button asChild>
            <Link href="/trader/requests/new">{t("trader.requests.new")}</Link>
          </Button>
        }
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.vegetable")}</TableHead>
              <TableHead>{t("common.neededQty")}</TableHead>
              <TableHead>{t("common.priceRange")}</TableHead>
              <TableHead>{t("common.deadline")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mine.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {translateVegetableName(r.vegetableName, t)}
                </TableCell>
                <TableCell>{formatKg(r.quantityKg, locale)}</TableCell>
                <TableCell>
                  {formatLKR(r.minPrice, locale)}–{formatLKR(r.maxPrice, locale)}
                </TableCell>
                <TableCell>{formatDateTime(r.closingTime, locale)}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
