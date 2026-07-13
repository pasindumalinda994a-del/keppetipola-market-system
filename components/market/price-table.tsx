import { formatLKR, formatRelativeTime } from "@/lib/format";
import type { MarketPrice } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceChange } from "@/components/shared/price-change";

export function PriceTable({ prices }: { prices: MarketPrice[] }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vegetable</TableHead>
            <TableHead>Lowest</TableHead>
            <TableHead>Highest</TableHead>
            <TableHead>Average</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prices.map((p) => (
            <TableRow key={p.vegetableId}>
              <TableCell className="font-medium">{p.vegetableName}</TableCell>
              <TableCell>{formatLKR(p.lowest)}</TableCell>
              <TableCell>{formatLKR(p.highest)}</TableCell>
              <TableCell className="font-semibold text-price-foreground">
                {formatLKR(p.average)}
              </TableCell>
              <TableCell>
                <PriceChange value={p.change} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatRelativeTime(p.lastUpdated)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
