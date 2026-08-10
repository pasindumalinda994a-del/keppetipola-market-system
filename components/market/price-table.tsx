"use client";

import { formatLKR, formatRelativeTime } from "@/lib/format";
import type { MarketPrice } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceChange } from "@/components/shared/price-change";
import { useLocale } from "@/components/providers/locale-provider";
import { translateVegetableName } from "@/lib/i18n/messages";

export function PriceTable({ prices }: { prices: MarketPrice[] }) {
  const { t, locale } = useLocale();
  return (
    <div className="overflow-hidden rounded-lg bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("common.vegetable")}</TableHead>
            <TableHead>{t("common.lowest")}</TableHead>
            <TableHead>{t("common.highest")}</TableHead>
            <TableHead>{t("common.average")}</TableHead>
            <TableHead>{t("common.change")}</TableHead>
            <TableHead>{t("common.lastUpdated")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((p) => (
            <TableRow key={p.vegetableId}>
              <TableCell className="font-medium">
                {translateVegetableName(p.vegetableName, t)}
              </TableCell>
              <TableCell>{formatLKR(p.lowest, locale)}</TableCell>
              <TableCell>{formatLKR(p.highest, locale)}</TableCell>
              <TableCell className="font-semibold text-price-foreground">
                {formatLKR(p.average, locale)}
              </TableCell>
              <TableCell>
                <PriceChange value={p.change} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeTime(p.lastUpdated, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
