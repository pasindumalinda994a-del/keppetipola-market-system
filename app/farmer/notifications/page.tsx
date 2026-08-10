"use client";

import { useLocale } from "@/components/providers/locale-provider";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime } from "@/lib/format";
import { notifGroupKeys } from "@/lib/i18n/messages";
import { notifications } from "@/lib/mock";
import { cn } from "@/lib/utils";

const groups = ["Offers", "Sales", "Announcements", "System"] as const;

export default function FarmerNotificationsPage() {
  const { t, locale } = useLocale();

  return (
    <div>
      <PageHeader
        title={t("farmer.notifications.title")}
        description={t("farmer.notifications.description")}
      />
      <div className="space-y-8">
        {groups.map((group) => {
          const items = notifications.filter((n) => n.group === group);
          if (items.length === 0) return null;
          return (
            <section key={group}>
              <h2 className="mb-3 text-lg font-semibold">
                {t(notifGroupKeys[group])}
              </h2>
              <ul className="space-y-3">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      "rounded-lg bg-card px-4 py-3",
                      !n.read && "border-primary/30 bg-accent/30"
                    )}
                  >
                    <div className="flex justify-between gap-2">
                      <p className="font-medium">{n.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(n.createdAt, locale)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
