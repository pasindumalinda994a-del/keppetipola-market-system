import Link from "next/link";
import {
  ClipboardList,
  ShoppingBag,
  Users,
  Wallet,
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
import { formatKg, formatLKR } from "@/lib/format";
import {
  applications,
  buyingRequests,
  getPriceHistory,
  purchaseOrders,
  traderDashboardStats,
} from "@/lib/mock";

export default function TraderDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Manage demand and review farmer applications."
        action={
          <Button asChild>
            <Link href="/trader/requests/new">New Buying Request</Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Buying Requests"
          value={String(traderDashboardStats.buyingRequests)}
          icon={ClipboardList}
        />
        <StatCard
          title="Applications"
          value={String(traderDashboardStats.applications)}
          icon={Users}
        />
        <StatCard
          title="Purchases Today"
          value={String(traderDashboardStats.purchasesToday)}
          icon={ShoppingBag}
        />
        <StatCard
          title="Today's Spending"
          value={formatLKR(traderDashboardStats.todaySpending)}
          icon={Wallet}
        />
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/trader/applications">Review</Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Vegetable</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.slice(0, 4).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.farmerName}</TableCell>
                  <TableCell>{a.vegetableName}</TableCell>
                  <TableCell>{formatKg(a.quantityKg)}</TableCell>
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
        <h2 className="mb-4 text-lg font-semibold">Today&apos;s Requests</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buyingRequests
            .filter((r) => r.traderId === "trader-1")
            .map((r) => (
              <article key={r.id} className="rounded-lg border bg-card p-4">
                <h3 className="font-semibold">{r.vegetableName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Need {formatKg(r.quantityKg)} · {formatLKR(r.minPrice)}–
                  {formatLKR(r.maxPrice)}
                </p>
                <StatusBadge status={r.status} className="mt-3" />
              </article>
            ))}
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold">Recent Purchases</h2>
          <div className="overflow-hidden rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Vegetable</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.farmerName}</TableCell>
                    <TableCell>{p.vegetableName}</TableCell>
                    <TableCell>
                      {formatLKR(p.price * p.quantityKg)}
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
    </div>
  );
}
