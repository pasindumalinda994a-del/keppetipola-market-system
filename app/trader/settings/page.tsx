"use client";

import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function TraderSettingsPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("trader.settings.title")}
        description={t("trader.settings.description")}
      />
      <div className="space-y-6 rounded-lg bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("trader.settings.newApplications")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("trader.settings.newApplicationsDesc")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("trader.settings.acceptedOffers")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("trader.settings.acceptedOffersDesc")}
            </p>
          </div>
          <Switch defaultChecked />
        </div>
        <Button onClick={() => toast.success(t("common.settingsSaved"))}>
          {t("trader.settings.save")}
        </Button>
      </div>
    </div>
  );
}
