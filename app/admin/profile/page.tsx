"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/shared/profile-form";

export default function AdminProfilePage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title={t("farmer.profile.title")}
        description={t("farmer.profile.description")}
      />
      <ProfileForm />
    </div>
  );
}
