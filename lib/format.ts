import type { Locale } from "@/lib/i18n/messages";
import { fillTemplate, translate } from "@/lib/i18n/messages";

function dateLocale(locale: Locale = "en"): string {
  return locale === "si" ? "si-LK" : "en-LK";
}

export function formatLKR(amount: number, locale: Locale = "en"): string {
  return `Rs.${amount.toLocaleString(dateLocale(locale), {
    maximumFractionDigits: 0,
  })}`;
}

export function formatKg(qty: number, locale: Locale = "en"): string {
  return `${qty.toLocaleString(dateLocale(locale))}kg`;
}

export function formatRelativeTime(iso: string, locale: Locale = "en"): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return translate(locale, "time.justNow");
  if (minutes < 60) {
    return fillTemplate(translate(locale, "time.minAgo"), { n: minutes });
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return fillTemplate(translate(locale, "time.hoursAgo"), { n: hours });
  }
  const days = Math.floor(hours / 24);
  return fillTemplate(translate(locale, "time.daysAgo"), { n: days });
}

export function formatDate(iso: string, locale: Locale = "en"): string {
  return new Date(iso).toLocaleDateString(dateLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string, locale: Locale = "en"): string {
  return new Date(iso).toLocaleString(dateLocale(locale), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
