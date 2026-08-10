"use client";

import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/auth-provider";

export default function FarmerProfilePage() {
  const { t } = useLocale();
  const { user } = useAuth();
  if (!user) return null;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    toast.success(t("farmer.profile.saved"));
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("farmer.profile.title")}
        description={t("farmer.profile.description")}
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t("farmer.profile.fullName")}</Label>
          <Input id="name" defaultValue={user.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("common.phone")}</Label>
          <Input id="phone" defaultValue={user.phone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("common.email")}</Label>
          <Input id="email" type="email" defaultValue={user.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">{t("common.address")}</Label>
          <Input id="address" defaultValue={user.address} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bank">{t("farmer.profile.bankDetails")}</Label>
          <Input id="bank" placeholder={t("common.comingSoon")} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("farmer.profile.newPassword")}</Label>
          <Input
            id="password"
            type="password"
            placeholder={t("farmer.profile.passwordPlaceholder")}
          />
        </div>
        <Button type="submit">{t("farmer.profile.save")}</Button>
      </form>
    </div>
  );
}
