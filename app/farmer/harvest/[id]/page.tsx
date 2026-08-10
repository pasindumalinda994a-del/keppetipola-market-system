"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
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
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";
import { applications, harvests, offers } from "@/lib/mock";

export default function HarvestDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const harvest = harvests.find((h) => h.id === id);
  if (!harvest) notFound();

  const relatedOffers = offers.filter((o) => o.harvestId === id);
  const relatedApps = applications.filter(
    (a) => a.vegetableName === harvest.vegetableName
  );

  return (
    <div>
      <PageHeader
        title={fillTemplate(t("farmer.harvest.detailTitle"), {
          vegetable: translateVegetableName(harvest.vegetableName, t),
        })}
        description={fillTemplate(t("farmer.harvest.detailDescription"), {
          date: formatDate(harvest.harvestDate, locale),
          grade: harvest.qualityGrade,
        })}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/harvest">{t("common.back")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("common.quantity")}</p>
          <p className="font-semibold">{formatKg(harvest.quantityKg, locale)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.delivery")}</p>
          <p className="font-semibold">
            {formatDate(harvest.expectedDelivery, locale)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            {t("farmer.harvest.availableUntil")}
          </p>
          <p className="font-semibold">
            {formatDate(harvest.availableUntil, locale)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.status")}</p>
          <StatusBadge status={harvest.status} className="mt-1" />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t("farmer.harvest.offers")}</h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.trader")}</TableHead>
                <TableHead>{t("common.price")}</TableHead>
                <TableHead>{t("common.qty")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedOffers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.traderName}</TableCell>
                  <TableCell>{formatLKR(o.price, locale)}</TableCell>
                  <TableCell>{formatKg(o.quantityKg, locale)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          {t("farmer.harvest.applications")}
        </h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.farmer")}</TableHead>
                <TableHead>{t("common.qty")}</TableHead>
                <TableHead>{t("common.grade")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedApps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.farmerName}</TableCell>
                  <TableCell>{formatKg(a.quantityKg, locale)}</TableCell>
                  <TableCell>{a.grade}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t("farmer.harvest.timeline")}</h2>
        <ol className="space-y-3 border-l-2 border-primary/30 pl-4">
          <li className="text-sm">
            <span className="font-medium">{t("farmer.harvest.listed")}</span> —{" "}
            {formatDate(harvest.harvestDate, locale)}
          </li>
          <li className="text-sm">
            <span className="font-medium">
              {fillTemplate(t("farmer.harvest.appsReceived"), {
                n: harvest.applications,
              })}
            </span>
          </li>
          <li className="text-sm">
            <span className="font-medium">
              {fillTemplate(t("farmer.harvest.offersFromTraders"), {
                n: relatedOffers.length,
              })}
            </span>
          </li>
        </ol>
      </section>
    </div>
  );
}
