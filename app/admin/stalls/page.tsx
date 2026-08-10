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
import { stalls as seed } from "@/lib/mock";
import type { Stall } from "@/types";

export default function AdminStallsPage() {
  const { t } = useLocale();
  const [stalls, setStalls] = useState<Stall[]>(seed);
  const [open, setOpen] = useState(false);

  function approve(id: string) {
    setStalls((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "Active" } : s))
    );
    toast.success(t("admin.stalls.approved"));
  }

  return (
    <div>
      <PageHeader
        title={t("admin.stalls.title")}
        description={t("admin.stalls.description")}
        action={
          <Button onClick={() => setOpen(true)}>{t("admin.stalls.add")}</Button>
        }
      />
      <div className="overflow-hidden rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.stalls.stall")}</TableHead>
              <TableHead>{t("common.trader")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
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
                      {t("common.approve")}
                    </Button>
                  ) : null}
                  <Button size="sm" variant="outline">
                    {t("common.edit")}
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
            <DialogTitle>{t("admin.stalls.add")}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(t("admin.stalls.added"));
              setOpen(false);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="stallName">{t("admin.stalls.name")}</Label>
              <Input id="stallName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trader">{t("admin.stalls.traderName")}</Label>
              <Input id="trader" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loc">{t("common.location")}</Label>
              <Input id="loc" required />
            </div>
            <DialogFooter>
              <Button type="submit">{t("admin.stalls.create")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
