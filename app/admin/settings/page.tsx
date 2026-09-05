"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ApiError, fetchSettings, saveSettings } from "@/lib/api";
import { DEFAULT_PRODUCE_CATEGORIES } from "@/lib/produce";

const DEFAULT_OFFER_TEMPLATE =
  "{{trader}} offered Rs.{{price}}/kg for your {{vegetable}} listing.";

export default function AdminSettingsPage() {
  const { t } = useLocale();
  const { token } = useAuth();
  const [categories, setCategories] = useState(DEFAULT_PRODUCE_CATEGORIES);
  const [opensAt, setOpensAt] = useState("04:00");
  const [closesAt, setClosesAt] = useState("14:00");
  const [marketName, setMarketName] = useState("Keppetipola Market");
  const [offerTemplate, setOfferTemplate] = useState(DEFAULT_OFFER_TEMPLATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchSettings(token)
      .then(({ settings }) => {
        if (cancelled) return;
        setCategories(settings.vegetableCategories);
        setOpensAt(settings.opensAt);
        setClosesAt(settings.closesAt);
        setMarketName(settings.marketName);
        if (settings.offerTemplate) {
          setOfferTemplate(settings.offerTemplate);
        }
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : t("common.retry"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const { settings } = await saveSettings(token, {
        vegetableCategories: categories,
        opensAt,
        closesAt,
        marketName,
        offerTemplate,
      });
      setCategories(settings.vegetableCategories);
      setOpensAt(settings.opensAt);
      setClosesAt(settings.closesAt);
      setMarketName(settings.marketName);
      if (settings.offerTemplate) setOfferTemplate(settings.offerTemplate);
      toast.success(t("common.settingsSaved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={t("admin.settings.title")}
        description={t("admin.settings.description")}
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : (
        <form onSubmit={(e) => void save(e)} className="space-y-8 rounded-lg bg-card p-6">
          <section className="space-y-4">
            <h2 className="font-semibold">{t("admin.settings.categories")}</h2>
            <div className="space-y-2">
              <Label htmlFor="categories">
                {t("admin.settings.vegetableCategories")}
              </Label>
              <Input
                id="categories"
                value={categories}
                onChange={(e) => setCategories(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t("admin.settings.vegetableCategoriesHint")}
              </p>
            </div>
          </section>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-semibold">{t("admin.settings.marketHours")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="open">{t("admin.settings.opens")}</Label>
                <Input
                  id="open"
                  type="time"
                  value={opensAt}
                  onChange={(e) => setOpensAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close">{t("admin.settings.closes")}</Label>
                <Input
                  id="close"
                  type="time"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                />
              </div>
            </div>
          </section>
          <Separator />
          <section className="space-y-4">
            <h2 className="font-semibold">{t("admin.settings.systemConfig")}</h2>
            <div className="space-y-2">
              <Label htmlFor="marketName">{t("admin.settings.displayName")}</Label>
              <Input
                id="marketName"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                required
              />
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
                value={offerTemplate}
                onChange={(e) => setOfferTemplate(e.target.value)}
              />
            </div>
          </section>
          <Button type="submit" disabled={saving}>
            {t("admin.settings.save")}
          </Button>
        </form>
      )}
    </div>
  );
}
