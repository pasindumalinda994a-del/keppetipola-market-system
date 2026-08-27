"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { formatRelativeTime } from "@/lib/format";
import { useNotifications } from "@/lib/hooks/use-notifications";
import { notifGroupKeys } from "@/lib/i18n/messages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/types";

const FARMER_GROUPS = [
  "Offers",
  "Applications",
  "Sales",
  "Announcements",
  "System",
] as const;
const TRADER_GROUPS = [
  "Applications",
  "Offers",
  "Accepted Offers",
  "Sales",
  "Announcements",
] as const;

export function NotificationsPage({
  role,
}: {
  role: "farmer" | "trader";
}) {
  const { t, locale } = useLocale();
  const { notifications, loading, markAllRead } = useNotifications();
  const [pending, setPending] = useState(false);
  const groups = role === "farmer" ? FARMER_GROUPS : TRADER_GROUPS;
  const titleKey =
    role === "farmer"
      ? "farmer.notifications.title"
      : "trader.notifications.title";
  const descriptionKey =
    role === "farmer"
      ? "farmer.notifications.description"
      : "trader.notifications.description";
  const emptyKey =
    role === "farmer"
      ? "farmer.notifications.empty"
      : "trader.notifications.empty";
  const markKey =
    role === "farmer"
      ? "farmer.notifications.markRead"
      : "trader.notifications.markRead";

  const onMarkRead = useCallback(async () => {
    setPending(true);
    try {
      await markAllRead();
    } catch {
      toast.error(t("common.retry"));
    } finally {
      setPending(false);
    }
  }, [markAllRead, t]);

  function itemsFor(group: string): NotificationItem[] {
    return notifications.filter((n) => n.group === group);
  }

  const hasAny = groups.some((g) => itemsFor(g).length > 0);

  return (
    <div>
      <PageHeader
        title={t(titleKey)}
        description={t(descriptionKey)}
        action={
          notifications.some((n) => !n.read) ? (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => void onMarkRead()}
            >
              {t(markKey)}
            </Button>
          ) : undefined
        }
      />
      {loading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : !hasAny ? (
        <EmptyState title={t(emptyKey)} />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => {
            const items = itemsFor(group);
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
      )}
    </div>
  );
}
