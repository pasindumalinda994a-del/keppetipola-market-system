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
import { translateVegetableName, type MessageKey } from "@/lib/i18n/messages";
import { sales, systemLogs, transactions, users } from "@/lib/mock";
import type { UserRole } from "@/types";

function roleLabel(role: UserRole, t: (key: MessageKey) => string) {
  if (role === "farmer") return t("common.farmer");
  if (role === "trader") return t("common.trader");
  return t("common.admins");
}

export default function AdminUserDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const user = users.find((u) => u.id === id);
  if (!user) notFound();

  const userSales = sales.filter(
    (s) => s.farmerId === id || s.traderId === id
  );
  const userTxns = transactions.filter(
    (txn) =>
      txn.farmerName === user.name ||
      txn.traderName.includes(user.name.split(" ")[0])
  );
  const activity = systemLogs.filter((l) => l.user === user.email);

  return (
    <div>
      <PageHeader
        title={user.name}
        description={`${roleLabel(user.role, t)} · ${user.email}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/users">{t("common.back")}</Link>
          </Button>
        }
      />
      <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">{t("common.phone")}</p>
          <p className="font-medium">{user.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{t("common.address")}</p>
          <p className="font-medium">{user.address}</p>
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
              {(userSales.length ? userSales : userTxns.slice(0, 3)).map(
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
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
