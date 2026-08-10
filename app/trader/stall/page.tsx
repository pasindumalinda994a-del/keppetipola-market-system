"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stalls } from "@/lib/mock";

export default function StallProfilePage() {
  const { t } = useLocale();
  const stall = stalls[0];

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success(t("trader.stall.saved"));
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("trader.stall.title")}
        description={t("trader.stall.description")}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t("trader.stall.name")}</Label>
          <Input id="name" defaultValue={stall.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">{t("common.location")}</Label>
          <Input id="location" defaultValue={stall.location} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="license">{t("common.license")}</Label>
          <Input id="license" defaultValue={stall.license} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">{t("common.contact")}</Label>
          <Input id="contact" defaultValue={stall.contact} />
        </div>
        <Button type="submit">{t("trader.stall.save")}</Button>
      </form>
    </div>
  );
}
