"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { offers as initialOffers } from "@/lib/mock";
import { cn } from "@/lib/utils";
import type { Offer } from "@/types";

export default function FarmerOffersPage() {
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const highest = Math.max(...offers.map((o) => o.price));

  function accept(id: string) {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: "Accepted" }
          : o.status === "Pending"
            ? { ...o, status: "Cancelled" }
            : o
      )
    );
    toast.success("Offer accepted");
  }

  function reject(id: string) {
    setOffers((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "Cancelled" } : o))
    );
    toast.message("Offer rejected");
  }

  return (
    <div>
      <PageHeader
        title="Trader Offers"
        description="Compare offers — highest price is highlighted."
      />
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trader</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...offers]
              .sort((a, b) => b.price - a.price)
              .map((o) => (
                <TableRow
                  key={o.id}
                  className={cn(
                    o.price === highest &&
                      o.status !== "Cancelled" &&
                      "bg-price/10"
                  )}
                >
                  <TableCell className="font-medium">{o.traderName}</TableCell>
                  <TableCell className="font-semibold text-price-foreground">
                    {formatLKR(o.price)}
                    {o.price === highest && o.status !== "Cancelled" ? (
                      <span className="ml-2 text-xs font-medium text-primary">
                        Highest
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>{formatKg(o.quantityKg)}</TableCell>
                  <TableCell>{formatDate(o.delivery)}</TableCell>
                  <TableCell>{o.rating.toFixed(1)}</TableCell>
                  <TableCell>
                    <StatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    {o.status === "Pending" || o.status === "Offered" ? (
                      <>
                        <Button size="sm" onClick={() => accept(o.id)}>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => reject(o.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toast.message("Counter offer", {
                              description: "Coming soon in a later release.",
                            })
                          }
                        >
                          Counter
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
