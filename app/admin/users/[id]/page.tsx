import Link from "next/link";
import { notFound } from "next/navigation";
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
import { sales, systemLogs, transactions, users } from "@/lib/mock";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = users.find((u) => u.id === id);
  if (!user) notFound();

  const userSales = sales.filter(
    (s) => s.farmerId === id || s.traderId === id
  );
  const userTxns = transactions.filter(
    (t) => t.farmerName === user.name || t.traderName.includes(user.name.split(" ")[0])
  );
  const activity = systemLogs.filter((l) => l.user === user.email);

  return (
    <div>
      <PageHeader
        title={user.name}
        description={`${user.role} · ${user.email}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/admin/users">Back</Link>
          </Button>
        }
      />
      <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">Phone</p>
          <p className="font-medium">{user.phone}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Address</p>
          <p className="font-medium">{user.address}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Joined</p>
          <p className="font-medium">{formatDate(user.joinedAt)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <StatusBadge status={user.status} className="mt-1" />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Activity</h2>
        <ul className="space-y-2 text-sm">
          {activity.length === 0 ? (
            <li className="text-muted-foreground">No recent login activity.</li>
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
          {user.role === "farmer" ? "Sales" : "Purchases"}
        </h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Vegetable</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(userSales.length ? userSales : userTxns.slice(0, 3)).map(
                (row) => {
                  if ("unitPrice" in row) {
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{formatDate(row.date)}</TableCell>
                        <TableCell>{row.vegetableName}</TableCell>
                        <TableCell>{formatKg(row.quantityKg)}</TableCell>
                        <TableCell>{formatLKR(row.total)}</TableCell>
                        <TableCell>
                          <StatusBadge status={row.status} />
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={row.id}>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell>{row.vegetableName}</TableCell>
                      <TableCell>{formatKg(row.quantityKg)}</TableCell>
                      <TableCell>{formatLKR(row.amount)}</TableCell>
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
