import Link from "next/link";
import {
  Building2,
  Leaf,
  ShoppingBag,
  Users,
} from "lucide-react";
import { PriceTrendChart } from "@/components/market/price-trend-chart";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
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
import { formatKg, formatLKR, formatRelativeTime } from "@/lib/format";
import {
  adminDashboardStats,
  getPriceHistory,
  stalls,
  systemLogs,
  transactions,
  users,
} from "@/lib/mock";

export default function AdminDashboardPage() {
  const pendingFarmers = users.filter(
    (u) => u.role === "farmer" && u.status === "Pending"
  ).length;
  const pendingStalls = stalls.filter((s) => s.status === "Pending").length;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Market overview and pending approvals."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Farmers"
          value={String(adminDashboardStats.farmers)}
          icon={Users}
        />
        <StatCard
          title="Traders"
          value={String(adminDashboardStats.traders)}
          icon={Building2}
        />
        <StatCard
          title="Transactions"
          value={String(adminDashboardStats.transactions)}
          icon={ShoppingBag}
        />
        <StatCard
          title="Today's Sales"
          value={formatLKR(adminDashboardStats.todaySales)}
          icon={Leaf}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Pending Approvals</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Farmers</p>
            <p className="mt-1 text-2xl font-semibold">{pendingFarmers}</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/users">Review</Link>
            </Button>
          </article>
          <article className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Traders</p>
            <p className="mt-1 text-2xl font-semibold">0</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/users">Review</Link>
            </Button>
          </article>
          <article className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Stalls</p>
            <p className="mt-1 text-2xl font-semibold">{pendingStalls}</p>
            <Button variant="link" className="px-0" asChild>
              <Link href="/admin/stalls">Review</Link>
            </Button>
          </article>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/transactions">View all</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Parties</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 4).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="text-sm">
                      {t.farmerName} → {t.traderName}
                      <br />
                      <span className="text-muted-foreground">
                        {t.vegetableName} · {formatKg(t.quantityKg)}
                      </span>
                    </TableCell>
                    <TableCell>{formatLKR(t.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge status={t.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        <section>
          <h2 className="mb-4 text-lg font-semibold">Price Trend</h2>
          <PriceTrendChart data={getPriceHistory("veg-1")} height={260} />
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Activity Log</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/logs">All logs</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {systemLogs.slice(0, 5).map((log) => (
            <li
              key={log.id}
              className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
            >
              <div>
                <span className="font-medium text-primary">{log.type}</span>
                <span className="text-muted-foreground"> — {log.message}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(log.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
