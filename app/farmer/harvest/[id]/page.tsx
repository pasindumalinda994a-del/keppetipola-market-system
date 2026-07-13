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
import { applications, harvests, offers } from "@/lib/mock";

export default async function HarvestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const harvest = harvests.find((h) => h.id === id);
  if (!harvest) notFound();

  const relatedOffers = offers.filter((o) => o.harvestId === id);
  const relatedApps = applications.filter(
    (a) => a.vegetableName === harvest.vegetableName
  );

  return (
    <div>
      <PageHeader
        title={`${harvest.vegetableName} harvest`}
        description={`Listed ${formatDate(harvest.harvestDate)} · Grade ${harvest.qualityGrade}`}
        action={
          <Button variant="outline" asChild>
            <Link href="/farmer/harvest">Back</Link>
          </Button>
        }
      />

      <div className="grid gap-4 rounded-lg bg-card p-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-sm text-muted-foreground">Quantity</p>
          <p className="font-semibold">{formatKg(harvest.quantityKg)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Delivery</p>
          <p className="font-semibold">{formatDate(harvest.expectedDelivery)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Available until</p>
          <p className="font-semibold">{formatDate(harvest.availableUntil)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Status</p>
          <StatusBadge status={harvest.status} className="mt-1" />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Offers</h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trader</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedOffers.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.traderName}</TableCell>
                  <TableCell>{formatLKR(o.price)}</TableCell>
                  <TableCell>{formatKg(o.quantityKg)}</TableCell>
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
        <h2 className="mb-3 text-lg font-semibold">Applications</h2>
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farmer</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatedApps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.farmerName}</TableCell>
                  <TableCell>{formatKg(a.quantityKg)}</TableCell>
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
        <h2 className="mb-3 text-lg font-semibold">Timeline</h2>
        <ol className="space-y-3 border-l-2 border-primary/30 pl-4">
          <li className="text-sm">
            <span className="font-medium">Listed</span> — {formatDate(harvest.harvestDate)}
          </li>
          <li className="text-sm">
            <span className="font-medium">{harvest.applications} applications</span> received
          </li>
          <li className="text-sm">
            <span className="font-medium">{relatedOffers.length} offers</span> from traders
          </li>
        </ol>
      </section>
    </div>
  );
}
