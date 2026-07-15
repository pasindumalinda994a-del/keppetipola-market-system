"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";
import { notifications as allNotifications } from "@/lib/mock";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function NotificationDrawer({
  href = "/farmer/notifications",
  groups,
}: {
  href?: string;
  groups?: string[];
}) {
  const { t } = useLocale();
  const items = allNotifications
    .filter((n) => !groups || groups.includes(n.group))
    .slice(0, 8);
  const unread = items.filter((n) => !n.read).length;

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="relative" />}
        aria-label={t("shell.notifications")}
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        ) : null}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{t("shell.notifications")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 overflow-y-auto px-1 pb-6">
          {items.map((n) => (
            <div
              key={n.id}
              className={cn(
                "rounded-lg bg-card p-3",
                !n.read && "border-primary/30 bg-accent/40"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
              <p className="mt-2 text-xs font-medium text-primary">{n.group}</p>
            </div>
          ))}
        </div>
        <div className="border-t px-1 pt-3">
          <Button asChild variant="outline" className="w-full">
            <Link href={href}>{t("shell.viewAll")}</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
