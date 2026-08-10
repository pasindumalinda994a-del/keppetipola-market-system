"use client";

import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function AdminSettingsPage() {
  const { t } = useLocale();

  function save(e: React.FormEvent) {
    e.preventDefault();
    toast.success(t("common.settingsSaved"));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />
      <form onSubmit={save} className="space-y-8 rounded-lg bg-card p-6">
        <section className="space-y-4">
          <h2 className="font-semibold">{t("admin.settings.categories")}</h2>
          <div className="space-y-2">
            <Label htmlFor="categories">
              {t("admin.settings.vegetableCategories")}
            </Label>
            <Input
              id="categories"
              defaultValue="Root, Leafy, Pod, Fruit"
            />
          </div>
        </section>
        <Separator />
        <section className="space-y-4">
          <h2 className="font-semibold">{t("admin.settings.marketHours")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="open">{t("admin.settings.opens")}</Label>
              <Input id="open" type="time" defaultValue="04:00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="close">{t("admin.settings.closes")}</Label>
              <Input id="close" type="time" defaultValue="14:00" />
            </div>
          </div>
        </section>
        <Separator />
        <section className="space-y-4">
          <h2 className="font-semibold">{t("admin.settings.systemConfig")}</h2>
          <div className="space-y-2">
            <Label htmlFor="marketName">{t("admin.settings.displayName")}</Label>
            <Input id="marketName" defaultValue="Keppetipola Market" />
          </div>
        </section>
        <Separator />
        <section className="space-y-4">
          <h2 className="font-semibold">{t("admin.settings.notifTemplates")}</h2>
          <div className="space-y-2">
            <Label htmlFor="offerTpl">{t("admin.settings.offerTemplate")}</Label>
            <Textarea
              id="offerTpl"
              rows={3}
              defaultValue="{{trader}} offered Rs.{{price}}/kg for your {{vegetable}} listing."
            />
          </div>
        </section>
        <Button type="submit">{t("admin.settings.save")}</Button>
      </form>
    </div>
  );
}
