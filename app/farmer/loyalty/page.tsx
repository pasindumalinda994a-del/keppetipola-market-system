"use client";

import { useMemo } from "react";
import { LoyaltyProgressBar } from "@/components/loyalty/loyalty-progress";
import {
  LoyaltyStatusBadge,
  loyaltyStatusFromProgress,
} from "@/components/loyalty/loyalty-status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  getLoyaltyProgress,
  getLoyaltyRuleForTrader,
  loyaltyBalances,
} from "@/lib/mock";
import { useAuth } from "@/components/providers/auth-provider";

export default function FarmerLoyaltyPage() {
  const { t } = useLocale();
  const { user: farmer } = useAuth();
  const farmerId = farmer?.id;

  const balances = useMemo(
    () =>
      farmerId
        ? loyaltyBalances.filter((b) => b.farmerId === farmerId)
        : [],
    [farmerId]
  );

  if (!farmer) return null;

  return (
    <div>
      <PageHeader
        title={t("farmer.loyalty.title")}
        description={t("farmer.loyalty.description")}
      />

      {balances.length === 0 ? (
        <EmptyState
          title={t("farmer.loyalty.emptyTitle")}
          description={t("farmer.loyalty.emptyDescription")}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {balances.map((balance) => {
            const rule = getLoyaltyRuleForTrader(balance.traderId);
            const progress = getLoyaltyProgress(balance, rule);
            const status = loyaltyStatusFromProgress(progress);
            const remaining = Math.max(
              0,
              progress.threshold - progress.current
            );

            return (
              <div
                key={balance.id}
                className="flex flex-col gap-4 rounded-lg bg-card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-heading text-lg font-semibold">
                      {balance.traderName}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("farmer.loyalty.tokensWithTrader").replace(
                        "{count}",
                        String(balance.tokenCount)
                      )}
                    </p>
                  </div>
                  <LoyaltyStatusBadge status={status} />
                </div>

                <LoyaltyProgressBar progress={progress} />

                {progress.unlocked ? (
                  <p className="text-sm font-medium text-primary">
                    {t("farmer.loyalty.rewardUnlocked")
                      .replace("{percent}", String(progress.discountPercent))}
                  </p>
                ) : progress.ruleActive ? (
                  <p className="text-sm text-muted-foreground">
                    {t("farmer.loyalty.keepTrading")
                      .replace("{remaining}", String(remaining))
                      .replace("{percent}", String(progress.discountPercent))}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("loyalty.status.inactive")}
                  </p>
                )}

                {progress.ruleActive ? (
                  <p className="text-xs text-muted-foreground">
                    {t("loyalty.discountOff").replace(
                      "{percent}",
                      String(progress.discountPercent)
                    )}{" "}
                    · {t("loyalty.threshold")}: {progress.threshold}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
