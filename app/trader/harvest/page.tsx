"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
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
import { ApiError, createHarvestOffer, fetchHarvests } from "@/lib/api";
import { formatDate, formatKg } from "@/lib/format";
import { fillTemplate, translateVegetableName } from "@/lib/i18n/messages";
import type { Harvest } from "@/types";

export default function TraderHarvestBrowsePage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const { data: harvests, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchHarvests(authToken)).harvests,
    [] as Harvest[]
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Harvest | null>(null);
  const [pending, setPending] = useState(false);

  function openOffer(harvest: Harvest) {
    setSelected(harvest);
    setOpen(true);
  }

  async function sendOffer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !selected) return;
    const form = e.currentTarget;
    const price = Number((form.elements.namedItem("price") as HTMLInputElement).value);
    const quantityKg = Number(
      (form.elements.namedItem("qty") as HTMLInputElement).value
    );
    const delivery = (form.elements.namedItem("delivery") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;
    setPending(true);
    try {
      await createHarvestOffer(token, selected.id, {
        price,
        quantityKg,
        delivery,
        message: message || undefined,
      });
      toast.success(t("trader.harvest.offerSent"));
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("trader.harvest.title")}
        description={t("trader.harvest.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : harvests.length === 0 ? (
        <EmptyState title={t("trader.harvest.empty")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {harvests.map((h) => (
            <article key={h.id} className="flex flex-col rounded-lg bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("trader.harvest.farmer")}
                  </p>
                  <h3 className="font-semibold">{h.farmerName}</h3>
                </div>
                <StatusBadge status={h.status} />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">{t("common.vegetable")}</dt>
                  <dd className="font-medium">
                    {translateVegetableName(h.vegetableName, t)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("common.qty")}</dt>
                  <dd className="font-medium">
                    {formatKg(h.remainingKg ?? h.quantityKg, locale)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("common.grade")}</dt>
                  <dd className="font-medium">{h.qualityGrade}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">{t("common.delivery")}</dt>
                  <dd className="font-medium">
                    {formatDate(h.expectedDelivery, locale)}
                  </dd>
                </div>
              </dl>
              <Button className="mt-4 w-full" onClick={() => openOffer(h)}>
                {t("trader.harvest.offer")}
              </Button>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selected
                ? fillTemplate(t("trader.harvest.dialogTitle"), {
                    vegetable: translateVegetableName(selected.vegetableName, t),
                  })
                : t("trader.harvest.offer")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={sendOffer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t("trader.applications.pricePerKg")}</Label>
              <Input id="price" name="price" type="number" min={1} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">{t("trader.applications.buyingQty")}</Label>
              <Input
                id="qty"
                name="qty"
                type="number"
                min={1}
                required
                defaultValue={selected?.remainingKg ?? selected?.quantityKg}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery">{t("common.delivery")}</Label>
              <Input
                id="delivery"
                name="delivery"
                type="date"
                required
                defaultValue={selected?.expectedDelivery}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("common.message")}</Label>
              <Textarea id="message" name="message" rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t("common.submitting") : t("trader.applications.submitOffer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
