"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, fetchMyStall, saveMyStall } from "@/lib/api";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import type { Stall } from "@/types";

export default function StallProfilePage() {
  const { t } = useLocale();
  const { user, token } = useAuth();
  const { data: stall, setData: setStall, loading } = useTokenQuery(
    token,
    async (authToken) => (await fetchMyStall(authToken)).stall,
    null as Stall | null
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const location = (form.elements.namedItem("location") as HTMLInputElement)
      .value;
    const license = (form.elements.namedItem("license") as HTMLInputElement)
      .value;
    const contact = (form.elements.namedItem("contact") as HTMLInputElement)
      .value;
    try {
      const data = await saveMyStall(token, {
        name,
        location,
        license,
        contact,
      });
      setStall(data.stall);
      toast.success(t("trader.stall.saved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("trader.stall.title")}
        description={t("trader.stall.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <form
          key={stall?.id ?? "new"}
          onSubmit={(e) => void onSubmit(e)}
          className="space-y-4 rounded-lg bg-card p-6"
        >
          {stall ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {stall.status === "Pending"
                  ? t("trader.stall.pendingNote")
                  : stall.status === "Inactive"
                    ? t("trader.stall.inactiveNote")
                    : t("trader.stall.activeNote")}
              </p>
              <StatusBadge status={stall.status} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("trader.stall.emptyHint")}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">{t("trader.stall.name")}</Label>
            <Input
              id="name"
              name="name"
              defaultValue={stall?.name ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t("common.location")}</Label>
            <Input
              id="location"
              name="location"
              defaultValue={stall?.location ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="license">{t("common.license")}</Label>
            <Input
              id="license"
              name="license"
              defaultValue={stall?.license ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">{t("common.contact")}</Label>
            <Input
              id="contact"
              name="contact"
              defaultValue={stall?.contact || user.phone}
            />
          </div>
          <Button type="submit">{t("trader.stall.save")}</Button>
        </form>
      )}
    </div>
  );
}
