"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/locale-provider";

export type LoyaltyStatus = "inProgress" | "rewardReady" | "inactive";

const statusStyles: Record<LoyaltyStatus, string> = {
  inProgress: "bg-sky-100 text-sky-900 border-sky-200",
  rewardReady: "bg-primary/15 text-primary border-primary/20",
  inactive: "bg-muted text-muted-foreground border-border",
};

export function LoyaltyStatusBadge({
  status,
  className,
}: {
  status: LoyaltyStatus;
  className?: string;
}) {
  const { t } = useLocale();
  const labelKey =
    status === "inProgress"
      ? "loyalty.status.inProgress"
      : status === "rewardReady"
        ? "loyalty.status.rewardReady"
        : "loyalty.status.inactive";

  return (
    <Badge
      variant="outline"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {t(labelKey)}
    </Badge>
  );
}

export function loyaltyStatusFromProgress(opts: {
  unlocked: boolean;
  ruleActive: boolean;
}): LoyaltyStatus {
  if (!opts.ruleActive) return "inactive";
  if (opts.unlocked) return "rewardReady";
  return "inProgress";
}
