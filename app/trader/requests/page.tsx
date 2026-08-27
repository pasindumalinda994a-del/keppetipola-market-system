"use client";

import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
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
import { ApiError, closeBuyingRequest, fetchRequests } from "@/lib/api";
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { translateVegetableName } from "@/lib/i18n/messages";
import type { BuyingRequest } from "@/types";

export default function TraderRequestsPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: requests, setData: setRequests, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchRequests(authToken, { mine: true })).requests,
    [] as BuyingRequest[]
  );

  async function onClose(id: string) {
    if (!token) return;
    try {
      await closeBuyingRequest(token, id);
      toast.success(t("trader.requests.closed"));
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Closed" } : r))
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

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
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : requests.length === 0 ? (
        <EmptyState
          title={t("trader.requests.empty")}
          action={
            <Button asChild>
              <Link href="/trader/requests/new">{t("trader.requests.new")}</Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.neededQty")}</TableHead>
                <TableHead>{t("common.priceRange")}</TableHead>
                <TableHead>{t("common.deadline")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    {translateVegetableName(r.vegetableName, t)}
                  </TableCell>
                  <TableCell>
                    {formatKg(r.remainingKg ?? r.quantityKg, locale)}
                  </TableCell>
                  <TableCell>
                    {formatLKR(r.minPrice, locale)}–{formatLKR(r.maxPrice, locale)}
                  </TableCell>
                  <TableCell>{formatDateTime(r.closingTime, locale)}</TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    {r.status === "Active" ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void onClose(r.id)}
                      >
                        {t("common.closeListing")}
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
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
