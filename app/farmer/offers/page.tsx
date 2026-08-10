"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { offers as initialOffers } from "@/lib/mock";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types";

export default function FarmerOffersPage() {
  const { t, locale } = useLocale();
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const highest = Math.max(...offers.map((o) => o.price));

  function accept(id: string) {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: "Accepted" }
          : o.status === "Pending"
            ? { ...o, status: "Cancelled" }
            : o
      )
    );
    toast.success(t("farmer.offers.accepted"));
  }

  function reject(id: string) {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o))
    );
    toast.message(t("farmer.offers.rejected"));
  }

  return (
    <div>
      <PageHeader
        title={t("farmer.offers.title")}
        description={t("farmer.offers.description")}
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.trader")}</TableHead>
              <TableHead>{t("common.price")}</TableHead>
              <TableHead>{t("common.quantity")}</TableHead>
              <TableHead>{t("common.delivery")}</TableHead>
              <TableHead>{t("common.rating")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...offers]
              .sort((a, b) => b.price - a.price)
              .map((o) => (
                <TableRow
                  key={o.id}
                  className={cn(
                    o.price === highest &&
                      o.status !== "Cancelled" &&
                      "bg-price/10"
                  )}
                >
                  <TableCell className="font-medium">{o.traderName}</TableCell>
                  <TableCell className="font-semibold text-price-foreground">
                    {formatLKR(o.price, locale)}
                    {o.price === highest && o.status !== "Cancelled" ? (
                      <span className="ml-2 text-xs font-medium text-primary">
                        {t("farmer.offers.highest")}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatKg(o.quantityKg, locale)}</TableCell>
                  <TableCell>{formatDate(o.delivery, locale)}</TableCell>
                  <TableCell>{o.rating.toFixed(1)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    {o.status === "Pending" || o.status === "Offered" ? (
                      <>
                        <Button size="sm" onClick={() => accept(o.id)}>
                          {t("common.accept")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(o.id)}
                        >
                          {t("common.reject")}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toast.message(t("farmer.offers.counterTitle"), {
                              description: t("common.comingSoonLater"),
                            })
                          }
                        >
                          {t("farmer.offers.counter")}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
