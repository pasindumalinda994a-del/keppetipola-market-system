"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
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
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";
import { formatDate, formatKg } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import {
  ApiError,
  fetchApplications,
  rejectApplication,
  sendApplicationOffer,
} from "@/lib/api";
import type { Application } from "@/types";

export default function FarmerApplicationsPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: apps, setData: setApps, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchApplications(authToken)).applications,
    [] as Application[]
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Application | null>(null);
  const [pending, setPending] = useState(false);

  function openOffer(app: Application) {
    setSelected(app);
    setOpen(true);
  }

  async function reject(id: string) {
    if (!token) return;
    try {
      await rejectApplication(token, id);
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a))
      );
      toast.message(t("trader.applications.rejected"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  async function sendOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !selected) return;
    const form = e.currentTarget;
    const price = Number(
      (form.elements.namedItem("price") as HTMLInputElement).value
    );
    const quantityKg = Number(
      (form.elements.namedItem("buyQty") as HTMLInputElement).value
    );
    const delivery = (form.elements.namedItem("pickup") as HTMLInputElement)
      .value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement)
      .value;
    setPending(true);
    try {
      await sendApplicationOffer(token, selected.id, {
        price,
        quantityKg,
        delivery,
        message: message || undefined,
      });
      setApps((prev) =>
        prev.map((a) =>
          a.id === selected.id ? { ...a, status: "Offered" } : a
        )
      );
      setOpen(false);
      toast.success(
        fillTemplate(t("trader.applications.offerSent"), {
          name: selected.farmerName,
        })
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("trader.applications.title")}
        description={t("trader.applications.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : apps.length === 0 ? (
        <EmptyState title={t("trader.applications.empty")} />
      ) : (
        <div className="overflow-hidden rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.farmer")}</TableHead>
                <TableHead>{t("common.vegetable")}</TableHead>
                <TableHead>{t("common.qty")}</TableHead>
                <TableHead>{t("common.grade")}</TableHead>
                <TableHead>{t("common.harvestDate")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="text-right">{t("common.action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.farmerName}</TableCell>
                  <TableCell>
                    {translateVegetableName(a.vegetableName, t)}
                  </TableCell>
                  <TableCell>{formatKg(a.quantityKg, locale)}</TableCell>
                  <TableCell>{a.grade}</TableCell>
                  <TableCell>{formatDate(a.harvestDate, locale)}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    {a.status === "Pending" ? (
                      <>
                        <Button size="sm" onClick={() => openOffer(a)}>
                          {t("trader.applications.sendOffer")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void reject(a.id)}
                        >
                          {t("common.reject")}
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? fillTemplate(t("trader.applications.dialogDesc"), {
                    name: selected.farmerName,
                  })
                : t("trader.applications.dialogTitle")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={sendOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("trader.applications.pricePerKg")}</Label>
              <Input id="price" name="price" type="number" min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyQty">{t("trader.applications.buyingQty")}</Label>
              <Input
                id="buyQty"
                name="buyQty"
                type="number"
                min={1}
                required
                defaultValue={selected?.quantityKg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup">{t("trader.applications.pickupTime")}</Label>
              <Input id="pickup" name="pickup" type="datetime-local" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("common.message")}</Label>
              <Textarea
                id="message"
                name="message"
                rows={3}
                placeholder={t("common.optionalMessage")}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending
                  ? t("common.submitting")
                  : t("trader.applications.submitOffer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
