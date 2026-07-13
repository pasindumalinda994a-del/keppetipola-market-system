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
import { purchaseOrders } from "@/lib/mock";

export default function PurchaseHistoryPage() {
  const history = purchaseOrders.filter(
    (p) => p.status === "Completed" || p.status === "Accepted"
  );

  return (
    <div>
      <PageHeader
        title="Purchase History"
        description="Past purchases and settled amounts."
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Farmer</TableHead>
              <TableHead>Vegetable</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDate(p.date)}</TableCell>
                <TableCell className="font-medium">{p.farmerName}</TableCell>
                <TableCell>{p.vegetableName}</TableCell>
                <TableCell>{formatKg(p.quantityKg)}</TableCell>
                <TableCell className="font-semibold text-price-foreground">
                  {formatLKR(p.price * p.quantityKg)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
