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
import { vegetables as seed } from "@/lib/mock";
import type { Vegetable } from "@/types";

export default function AdminVegetablesPage() {
  const [items, setItems] = useState<Vegetable[]>(seed);
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    setItems((prev) =>
      prev.map((v) =>
        v.id === id
          ? { ...v, status: v.status === "Active" ? "Inactive" : "Active" }
          : v
      )
    );
    toast.success("Vegetable updated");
  }

  return (
    <div>
      <PageHeader
        title="Vegetable Management"
        description="Catalog of market vegetables."
        action={<Button onClick={() => setOpen(true)}>Add vegetable</Button>}
      />
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vegetable</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">{v.name}</TableCell>
                <TableCell>{v.category}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={v.status === "Active" ? "Active" : "Closed"}
                  />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => toggle(v.id)}>
                    {v.status === "Active" ? "Disable" : "Enable"}
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
            <DialogTitle>Add vegetable</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") || "");
              const category = String(fd.get("category") || "Other");
              setItems((prev) => [
                ...prev,
                {
                  id: `veg-${Date.now()}`,
                  name,
                  category,
                  unit: "kg",
                  status: "Active",
                },
              ]);
              toast.success("Vegetable added");
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" required />
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
