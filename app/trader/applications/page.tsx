"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatKg } from "@/lib/format";
import { applications as seed } from "@/lib/mock";
import type { Application } from "@/types";

export default function FarmerApplicationsPage() {
  const [apps, setApps] = useState<Application[]>(seed);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);

  function openOffer(app: Application) {
    setSelected(app);
    setOpen(true);
  }

  function reject(id: string) {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a))
    );
    toast.message("Application rejected");
  }

  function sendOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setApps((prev) =>
      prev.map((a) =>
        a.id === selected.id ? { ...a, status: "Offered" } : a
      )
    );
    setOpen(false);
    toast.success(`Offer sent to ${selected.farmerName}`);
  }

  return (
    <div>
      <PageHeader
        title="Farmer Applications"
        description="Review applicants and send offers."
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farmer</TableHead>
              <TableHead>Vegetable</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Harvest Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.farmerName}</TableCell>
                <TableCell>{a.vegetableName}</TableCell>
                <TableCell>{formatKg(a.quantityKg)}</TableCell>
                <TableCell>{a.grade}</TableCell>
                <TableCell>{formatDate(a.harvestDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={a.status} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  {a.status === "Pending" ? (
                    <>
                      <Button size="sm" onClick={() => openOffer(a)}>
                        Send Offer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reject(a.id)}
                      >
                        Reject
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Send offer{selected ? ` to ${selected.farmerName}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={sendOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rs/kg)</Label>
              <Input id="price" type="number" min={1} required defaultValue={198} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyQty">Buying quantity (kg)</Label>
              <Input
                id="buyQty"
                type="number"
                min={1}
                required
                defaultValue={selected?.quantityKg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup time</Label>
              <Input id="pickup" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={3} placeholder="Optional message" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit offer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
