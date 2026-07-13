"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("lang.toggle")}
      className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 text-xs font-semibold"
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "en"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("lang.en")}
      </button>
      <button
        type="button"
        onClick={() => setLocale("si")}
        aria-pressed={locale === "si"}
        className={cn(
          "rounded-md px-2 py-1 transition-colors",
          locale === "si"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        {t("lang.si")}
      </button>
    </div>
  );
}
