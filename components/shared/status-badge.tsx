"use client";

import { cn } from "@/lib/utils";
import type { Status } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/locale-provider";
import { statusMessageKeys } from "@/lib/i18n/messages";

const statusStyles: Record<Status, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-200",
  Offered: "bg-sky-100 text-sky-900 border-sky-200",
  Accepted: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Completed: "bg-primary/15 text-primary border-primary/20",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
  Active: "bg-emerald-100 text-emerald-900 border-emerald-200",
  Closed: "bg-muted text-muted-foreground border-border",
  Published: "bg-primary/15 text-primary border-primary/20",
  Draft: "bg-muted text-muted-foreground border-border",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

export function StatusBadge({
  status,
  className,
}: {
  status: Status | "Inactive";
  className?: string;
}) {
  const { t } = useLocale();
  const key = statusMessageKeys[status];
  const label = key ? t(key) : status;
  const style =
    status === "Inactive"
      ? "bg-muted text-muted-foreground border-border"
      : statusStyles[status as Status];

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", style, className)}
    >
      {label}
    </Badge>
  );
}
