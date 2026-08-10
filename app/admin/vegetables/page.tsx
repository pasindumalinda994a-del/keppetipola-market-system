"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
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
import { translateVegetableName } from "@/lib/i18n/messages";
import { vegetables as seed } from "@/lib/mock";
import type { Vegetable } from "@/types";

export default function AdminVegetablesPage() {
  const { t } = useLocale();
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
    toast.success(t("admin.vegetables.updated"));
  }

  return (
    <div>
      <PageHeader
        title={t("admin.vegetables.title")}
        description={t("admin.vegetables.description")}
        action={
          <Button onClick={() => setOpen(true)}>
            {t("admin.vegetables.add")}
          </Button>
        }
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.vegetable")}</TableHead>
              <TableHead>{t("common.category")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-medium">
                  {translateVegetableName(v.name, t)}
                </TableCell>
                <TableCell>{v.category}</TableCell>
                <TableCell>
                  <StatusBadge status={v.status} />
                </TableCell>
                <TableCell className="space-x-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => toggle(v.id)}>
                    {v.status === "Active"
                      ? t("common.disable")
                      : t("common.enable")}
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
            <DialogTitle>{t("admin.vegetables.add")}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const name = String(fd.get("name") || "");
              const category = String(fd.get("category") || t("common.other"));
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
              toast.success(t("admin.vegetables.added"));
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">{t("common.name")}</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">{t("common.category")}</Label>
              <Input id="category" name="category" required />
            </div>
            <DialogFooter>
              <Button type="submit">{t("common.create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
