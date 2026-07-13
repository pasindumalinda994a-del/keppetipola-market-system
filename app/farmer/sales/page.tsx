import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatKg, formatLKR } from "@/lib/format";
import { sales } from "@/lib/mock";

export default function FarmerSalesPage() {
  return (
    <div>
      <PageHeader
        title="My Sales"
        description="Completed and in-progress sales."
      />
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead>Vegetable</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Link
                    href={`/farmer/sales/${s.id}`}
                    className="font-medium hover:underline"
                  >
                    {formatDate(s.date)}
                  </Link>
                </TableCell>
                <TableCell>{s.traderName}</TableCell>
                <TableCell>{s.vegetableName}</TableCell>
                <TableCell>{formatKg(s.quantityKg)}</TableCell>
                <TableCell className="font-semibold text-price-foreground">
                  {formatLKR(s.total)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
