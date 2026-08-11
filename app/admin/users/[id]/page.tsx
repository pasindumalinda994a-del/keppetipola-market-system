"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError, fetchUser, updateUserStatus } from "@/lib/api";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { translateVegetableName, type MessageKey } from "@/lib/i18n/messages";
import { sales, systemLogs, transactions } from "@/lib/mock";
import type { User, UserRole } from "@/types";

function roleLabel(role: UserRole, t: (key: MessageKey) => string) {
  if (role === "farmer") return t("common.farmer");
  if (role === "trader") return t("common.trader");
  return t("common.admins");
}

export default function AdminUserDetailPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notFoundUser, setNotFoundUser] = useState(false);

  useEffect(() => {
    if (!token || !id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchUser(token!, id);
        if (!cancelled) setUser(data.user);
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.status === 404) {
            setNotFoundUser(true);
          } else {
            toast.error(
              err instanceof ApiError ? err.message : t("common.requestFailed")
            );
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, id, t]);

  if (notFoundUser) notFound();
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  if (!user) return null;

  const userSales = sales.filter(
    (s) => s.farmerId === id || s.traderId === id
  );
  const userTxns = transactions.filter(
    (txn) =>
      txn.farmerName === user.name ||
      txn.traderName.includes(user.name.split(" ")[0])
  );
  const activity = systemLogs.filter((l) => l.user === user.email);

  async function toggleStatus() {
    if (!token || !user) return;
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    setUpdating(true);
    try {
      const data = await updateUserStatus(token, user.id, nextStatus);
      setUser(data.user);
      toast.success(
        nextStatus === "Active"
          ? t("admin.users.activated")
          : t("admin.users.deactivated")
      );
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : t("common.requestFailed")
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={user.name}
        description={`${roleLabel(user.role, t)} · ${user.email}`}
        action={
          <div className="flex gap-2">
            <Button
              variant={user.status === "Active" ? "destructive" : "default"}
              onClick={toggleStatus}
              disabled={updating}
            >
              {user.status === "Active"
                ? t("admin.users.deactivate")
                : t("admin.users.activate")}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/users">{t("common.back")}</Link>
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("common.phone")}</p>
          <p className="font-medium">{user.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.address")}</p>
          <p className="font-medium">{user.address || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.joined")}</p>
          <p className="font-medium">{formatDate(user.joinedAt, locale)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.status")}</p>
          <StatusBadge status={user.status} className="mt-1" />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t("common.activity")}</h2>
        <ul className="space-y-2 text-sm">
          {activity.length === 0 ? (
            <li className="text-muted-foreground">
              {t("admin.users.noActivity")}
            </li>
          ) : (
            activity.map((a) => (
              <li key={a.id} className="rounded-lg bg-card px-4 py-2">
                {a.message}
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          {user.role === "farmer" ? t("common.sales") : t("common.purchases")}
        </h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.qty")}</TableHead>
                <TableHead>{t("common.amount")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(userSales.length ? userSales : userTxns.slice(0, 3)).length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    {t("admin.users.noTransactions")}
                  </TableCell>
                </TableRow>
              ) : (
                (userSales.length ? userSales : userTxns.slice(0, 3)).map(
                  (row) => {
                    if ("unitPrice" in row) {
                      return (
                        <TableRow key={row.id}>
                          <TableCell>{formatDate(row.date, locale)}</TableCell>
                          <TableCell>
                            {translateVegetableName(row.vegetableName, t)}
                          </TableCell>
                          <TableCell>
                            {formatKg(row.quantityKg, locale)}
                          </TableCell>
                          <TableCell>{formatLKR(row.total, locale)}</TableCell>
                          <TableCell>
                            <StatusBadge status={row.status} />
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{formatDate(row.date, locale)}</TableCell>
                        <TableCell>
                          {translateVegetableName(row.vegetableName, t)}
                        </TableCell>
                        <TableCell>
                          {formatKg(row.quantityKg, locale)}
                        </TableCell>
                        <TableCell>{formatLKR(row.amount, locale)}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                      </TableRow>
                    );
                  }
                )
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
