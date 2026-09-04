"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import type { NotificationPrefs } from "@/types";

const defaults: NotificationPrefs = {
  offerAlerts: true,
  priceBookmarks: true,
  announcements: true,
  newApplications: true,
  acceptedOffers: true,
};

export default function TraderSettingsPage() {
  const { t } = useLocale();
  const { user, updateProfile } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    ...defaults,
    ...user?.notificationPrefs,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateProfile({ notificationPrefs: prefs });
      toast.success(t("common.settingsSaved"));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    } finally {
      setSaving(false);
    }
  }

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
          <Switch
            checked={prefs.newApplications}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, newApplications: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("trader.settings.acceptedOffers")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("trader.settings.acceptedOffersDesc")}
            </p>
          </div>
          <Switch
            checked={prefs.acceptedOffers}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, acceptedOffers: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("trader.settings.announcements")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("trader.settings.announcementsDesc")}
            </p>
          </div>
          <Switch
            checked={prefs.announcements}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, announcements: checked }))
            }
          />
        </div>
        <Button onClick={() => void save()} disabled={saving}>
          {t("trader.settings.save")}
        </Button>
      </div>
    </div>
  );
}
