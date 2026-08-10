"use client";

import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function FarmerSettingsPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("farmer.settings.title")}
        description={t("farmer.settings.description")}
      />
      <div className="space-y-6 rounded-lg bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("farmer.settings.offerAlerts")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("farmer.settings.offerAlertsDesc")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("farmer.settings.priceBookmarks")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("farmer.settings.priceBookmarksDesc")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("farmer.settings.announcements")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("farmer.settings.announcementsDesc")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button onClick={() => toast.success(t("common.settingsSaved"))}>
          {t("farmer.settings.save")}
        </Button>
      </div>
    </div>
  );
}
