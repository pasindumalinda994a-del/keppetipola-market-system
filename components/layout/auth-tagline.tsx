"use client";

import { BrandLogo } from "@/components/layout/brand-logo";
import { useLocale } from "@/components/providers/locale-provider";

export function AuthTagline() {
  const { t } = useLocale();
  return (
    <p className="mt-3 text-sm text-muted-foreground">{t("auth.tagline")}</p>
  );
}

export function AuthCardBrand({ priority = false }: { priority?: boolean }) {
  return (
    <div className="mb-6 flex flex-col items-center text-center">
      <BrandLogo href="/" size="xl" priority={priority} />
      <AuthTagline />
    </div>
  );
}
