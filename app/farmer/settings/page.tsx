"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
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

export default function FarmerSettingsPage() {
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
          <Switch
            checked={prefs.offerAlerts}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, offerAlerts: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("farmer.settings.priceBookmarks")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("farmer.settings.priceBookmarksDesc")}
            </p>
          </div>
          <Switch
            checked={prefs.priceBookmarks}
            onCheckedChange={(checked) =>
              setPrefs((p) => ({ ...p, priceBookmarks: checked }))
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("farmer.settings.announcements")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("farmer.settings.announcementsDesc")}
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
          {t("farmer.settings.save")}
        </Button>
      </div>
    </div>
  );
}
