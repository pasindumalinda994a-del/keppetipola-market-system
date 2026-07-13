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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { stalls as seed } from "@/lib/mock";
import type { Stall } from "@/types";

export default function AdminStallsPage() {
  const [stalls, setStalls] = useState<Stall[]>(seed);
  const [open, setOpen] = useState(false);

  function approve(id: string) {
    setStalls((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Active" } : s))
    );
    toast.success("Stall approved");
  }

  return (
    <div>
      <PageHeader
        title="Stall Management"
        description="Approve and manage trader stalls."
        action={
          <Button onClick={() => setOpen(true)}>Add stall</Button>
        }
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stall</TableHead>
              <TableHead>Trader</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stalls.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">
                  {s.name}
                  <p className="text-xs text-muted-foreground">{s.location}</p>
                </TableCell>
                <TableCell>{s.traderName}</TableCell>
                <TableCell>
                  <StatusBadge status={s.status} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  {s.status === "Pending" ? (
                    <Button size="sm" onClick={() => approve(s.id)}>
                      Approve
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline">
                    Edit
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
            <DialogTitle>Add stall</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Stall added (demo)");
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="stallName">Stall name</Label>
              <Input id="stallName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trader">Trader name</Label>
              <Input id="trader" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">Location</Label>
              <Input id="loc" required />
            </div>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
