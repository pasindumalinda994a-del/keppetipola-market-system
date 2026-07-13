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
import { formatDate, formatKg } from "@/lib/format";
import { harvests } from "@/lib/mock";

export default function FarmerHarvestPage() {
  return (
    <div>
      <PageHeader
        title="My Harvest Stocks"
        description="Manage available harvest ready for traders."
        action={
          <Button asChild>
            <Link href="/farmer/harvest/new">Add Harvest</Link>
          </Button>
        }
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vegetable</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Harvest Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {harvests.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.vegetableName}</TableCell>
                <TableCell>{formatKg(h.quantityKg)}</TableCell>
                <TableCell>{formatDate(h.harvestDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={h.status} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/farmer/harvest/${h.id}`}>View</Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/farmer/harvest/${h.id}`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
