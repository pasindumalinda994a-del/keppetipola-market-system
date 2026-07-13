import Link from "next/link";
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
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import { buyingRequests } from "@/lib/mock";

export default function TraderRequestsPage() {
  const mine = buyingRequests.filter((r) => r.traderId === "trader-1");

  return (
    <div>
      <PageHeader
        title="Buying Requests"
        description="Create demand so farmers can apply."
        action={
          <Button asChild>
            <Link href="/trader/requests/new">New Buying Request</Link>
          </Button>
        }
      />
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vegetable</TableHead>
              <TableHead>Needed Qty</TableHead>
              <TableHead>Price Range</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mine.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.vegetableName}</TableCell>
                <TableCell>{formatKg(r.quantityKg)}</TableCell>
                <TableCell>
                  {formatLKR(r.minPrice)}–{formatLKR(r.maxPrice)}
                </TableCell>
                <TableCell>{formatDateTime(r.closingTime)}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
