"use client";

import { useLocale } from "@/components/providers/locale-provider";

export function AuthTagline() {
  const { t } = useLocale();
  return (
    <p className="mt-3 text-sm text-muted-foreground">{t("auth.tagline")}</p>
  );
}
