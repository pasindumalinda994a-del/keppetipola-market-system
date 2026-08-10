"use client";

import Link from "next/link";
import { useLocale } from "@/components/providers/locale-provider";
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
import { formatDate, formatKg } from "@/lib/format";
import { translateVegetableName } from "@/lib/i18n/messages";
import { harvests } from "@/lib/mock";

export default function FarmerHarvestPage() {
  const { t, locale } = useLocale();

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
                <TableCell>{formatKg(h.quantityKg, locale)}</TableCell>
                <TableCell>{formatDate(h.harvestDate, locale)}</TableCell>
                <TableCell>
                  <StatusBadge status={h.status} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/farmer/harvest/${h.id}`}>{t("common.view")}</Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/farmer/harvest/${h.id}`}>{t("common.edit")}</Link>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    {t("common.delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
