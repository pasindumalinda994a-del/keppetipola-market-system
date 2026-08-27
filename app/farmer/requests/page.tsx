"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { formatDateTime, formatKg, formatLKR } from "@/lib/format";
import {
  fillTemplate,
  translateVegetableName,
  vegetableMatchesQuery,
} from "@/lib/i18n/messages";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, applyToRequest, fetchApplications, fetchRequests } from "@/lib/api";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { BuyingRequest } from "@/types";

function traderInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function FarmerRequestsPage() {
  const { t, locale } = useLocale();
  const { token } = useAuth();
  const [q, setQ] = useState("");
  const { data, setData, loading } = useTokenQuery(
    token,
    async (authToken) => {
      const [reqData, appData] = await Promise.all([
        fetchRequests(authToken),
        fetchApplications(authToken),
      ]);
      return {
        requests: reqData.requests,
        appliedIds: appData.applications.map((a) => a.requestId),
      };
    },
    { requests: [] as BuyingRequest[], appliedIds: [] as string[] }
  );
  const requests = data.requests;
  const appliedIds = new Set(data.appliedIds);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<BuyingRequest | null>(null);
  const [grade, setGrade] = useState("A");
  const [pending, setPending] = useState(false);

  const filtered = useMemo(() => {
    return requests
      .filter((r) => {
        return (
          !q ||
          vegetableMatchesQuery(r.vegetableName, q, t) ||
          r.traderName.toLowerCase().includes(q.toLowerCase())
        );
      })
      .sort((a, b) => b.maxPrice - a.maxPrice);
  }, [q, t, requests]);

  function openApply(request: BuyingRequest) {
    setSelected(request);
    setGrade(request.preferredGrade);
    setOpen(true);
  }

  async function onApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token || !selected) return;
    const form = e.currentTarget;
    const quantityKg = Number(
      (form.elements.namedItem("qty") as HTMLInputElement).value
    );
    const harvestDate = (form.elements.namedItem("harvestDate") as HTMLInputElement)
      .value;
    setPending(true);
    try {
      await applyToRequest(token, selected.id, {
        quantityKg,
        grade,
        harvestDate,
      });
      toast.success(
        fillTemplate(t("farmer.requests.applied"), { name: selected.traderName })
      );
      setData((prev) => ({
        ...prev,
        appliedIds: [...prev.appliedIds, selected.id],
      }));
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
        title={t("farmer.requests.title")}
        description={t("farmer.requests.description")}
      />
      <div className="mb-6">
        <SearchBar value={q} onChange={setQ} placeholder={t("search.default")} />
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : filtered.length === 0 ? (
        <EmptyState title={t("farmer.requests.empty")} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const applied = appliedIds.has(r.id);
            return (
              <article key={r.id} className="flex flex-col rounded-lg bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="lg" className="size-11">
                      {r.traderPhotoUrl ? (
                        <AvatarImage src={r.traderPhotoUrl} alt={r.traderName} />
                      ) : null}
                      <AvatarFallback>{traderInitials(r.traderName)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {t("common.trader")}
                      </p>
                      <h3 className="truncate font-semibold">{r.traderName}</h3>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-secondary px-2 py-1 text-xs font-medium">
                    {fillTemplate(t("common.gradeLabel"), { grade: r.preferredGrade })}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t("demand.needs")}</dt>
                    <dd className="font-medium">
                      {translateVegetableName(r.vegetableName, t)} ·{" "}
                      {formatKg(r.remainingKg ?? r.quantityKg, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t("demand.priceRange")}</dt>
                    <dd className="font-semibold text-price-foreground">
                      {formatLKR(r.minPrice, locale)}–{formatLKR(r.maxPrice, locale)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">{t("demand.closes")}</dt>
                    <dd className="font-medium">
                      {formatDateTime(r.closingTime, locale)}
                    </dd>
                  </div>
                </dl>
                <Button
                  className="mt-4 w-full"
                  disabled={applied}
                  onClick={() => openApply(r)}
                >
                  {applied
                    ? t("farmer.requests.alreadyApplied")
                    : t("common.apply")}
                </Button>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("farmer.requests.applyTitle")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onApply} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qty">{t("farmer.harvest.quantityKg")}</Label>
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
              <Label>{t("farmer.harvest.qualityGrade")}</Label>
              <Select value={grade} onValueChange={(v) => setGrade(v ?? "A")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="harvestDate">{t("common.harvestDate")}</Label>
              <Input id="harvestDate" name="harvestDate" type="date" required />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? t("common.submitting") : t("farmer.requests.applySubmit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
