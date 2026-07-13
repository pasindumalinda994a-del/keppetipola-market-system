"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatLKR, formatRelativeTime } from "@/lib/format";
import { marketPrices as seed } from "@/lib/mock";
import type { MarketPrice } from "@/types";

export default function AdminPricesPage() {
  const [prices, setPrices] = useState<MarketPrice[]>(seed);
  const [selected, setSelected] = useState<MarketPrice | null>(null);
  const [open, setOpen] = useState(false);

  function openCorrect(p: MarketPrice) {
    setSelected(p);
    setOpen(true);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    const lowest = Number(fd.get("lowest"));
    const highest = Number(fd.get("highest"));
    const average = Math.round((lowest + highest) / 2);
    setPrices((prev) =>
      prev.map((p) =>
        p.vegetableId === selected.vegetableId
          ? {
              ...p,
              lowest,
              highest,
              average,
              lastUpdated: new Date().toISOString(),
            }
          : p
      )
    );
    setOpen(false);
    toast.success("Price corrected (exceptional override)");
  }

  return (
    <div>
      <PageHeader
        title="Market Prices"
        description="Auto-generated from deals. Manual correction only in exceptional cases."
      />
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vegetable</TableHead>
              <TableHead>Lowest</TableHead>
              <TableHead>Highest</TableHead>
              <TableHead>Average</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                <TableCell className="text-muted-foreground">
                  {formatRelativeTime(p.lastUpdated)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openCorrect(p)}
                  >
                    Correct
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Correct price{selected ? ` — ${selected.vegetableName}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lowest">Lowest</Label>
              <Input
                id="lowest"
                name="lowest"
                type="number"
                defaultValue={selected?.lowest}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="highest">Highest</Label>
              <Input
                id="highest"
                name="highest"
                type="number"
                defaultValue={selected?.highest}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save correction</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
