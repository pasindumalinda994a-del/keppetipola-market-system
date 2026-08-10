"use client";

import { cn } from "@/lib/utils";
import { useLocale } from "@/components/providers/locale-provider";
import type { LoyaltyProgress as LoyaltyProgressData } from "@/types";

export function LoyaltyProgressBar({
  progress,
  className,
  showLabel = true,
}: {
  progress: LoyaltyProgressData;
  className?: string;
  showLabel?: boolean;
}) {
  const { t } = useLocale();

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">
            {t("loyalty.progressLabel")
              .replace("{current}", String(progress.current))
              .replace("{threshold}", String(progress.threshold))}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {progress.percent}%
          </span>
        </div>
      ) : null}
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={progress.percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            progress.unlocked ? "bg-primary" : "bg-primary/80"
          )}
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
