"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { LoyaltyProgressBar } from "@/components/loyalty/loyalty-progress";
import {
  LoyaltyStatusBadge,
  loyaltyStatusFromProgress,
} from "@/components/loyalty/loyalty-status-badge";
import { useLocale } from "@/components/providers/locale-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
  getLoyaltyProgress,
  getLoyaltyRuleForTrader,
  loyaltyBalances,
} from "@/lib/mock";
import { useAuth } from "@/components/providers/auth-provider";
import type { LoyaltyRule } from "@/types";

export default function TraderLoyaltyPage() {
  const { t, locale } = useLocale();
  const { user: trader } = useAuth();
  if (!trader) return null;
  const traderId = trader.id;

  const seedRule =
    getLoyaltyRuleForTrader(traderId) ??
    ({
      id: "rule-new",
      traderId,
      tokenThreshold: 10,
      discountPercent: 5,
      isActive: true,
      updatedAt: new Date().toISOString(),
    } satisfies LoyaltyRule);

  const [rule, setRule] = useState<LoyaltyRule>(seedRule);

  const balances = useMemo(
    () => loyaltyBalances.filter((b) => b.traderId === traderId),
    [traderId]
  );

  const enrolled = balances.length;
  const rewardsReady = balances.filter((b) => {
    const progress = getLoyaltyProgress(b, rule);
    return progress.unlocked;
  }).length;
  const avgTokens =
    enrolled === 0
      ? 0
      : Math.round(
          balances.reduce((sum, b) => sum + b.tokenCount, 0) / enrolled
        );

  function handleSave() {
    const threshold = Math.max(1, Math.floor(Number(rule.tokenThreshold) || 1));
    const discount = Math.min(
      100,
      Math.max(0, Number(rule.discountPercent) || 0)
    );
    setRule((prev) => ({
      ...prev,
      tokenThreshold: threshold,
      discountPercent: discount,
      updatedAt: new Date().toISOString(),
    }));
    toast.success(t("trader.loyalty.saved"));
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("trader.loyalty.title")}
        description={t("trader.loyalty.description")}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title={t("trader.loyalty.enrolled")}
          value={String(enrolled)}
        />
        <StatCard
          title={t("trader.loyalty.rewardsReady")}
          value={String(rewardsReady)}
        />
        <StatCard
          title={t("trader.loyalty.avgTokens")}
          value={String(avgTokens)}
        />
      </div>

      <div className="mx-auto max-w-xl space-y-4 rounded-lg bg-card p-6 sm:mx-0 sm:max-w-none">
        <div>
          <h2 className="font-heading text-lg font-semibold">
            {t("trader.loyalty.ruleTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("trader.loyalty.ruleDescription")}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="token-threshold">
              {t("trader.loyalty.tokenThreshold")}
            </Label>
            <Input
              id="token-threshold"
              type="number"
              min={1}
              value={rule.tokenThreshold}
              onChange={(e) =>
                setRule((prev) => ({
                  ...prev,
                  tokenThreshold: Number(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount-percent">
              {t("trader.loyalty.discountPercent")}
            </Label>
            <Input
              id="discount-percent"
              type="number"
              min={0}
              max={100}
              value={rule.discountPercent}
              onChange={(e) =>
                setRule((prev) => ({
                  ...prev,
                  discountPercent: Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label>{t("trader.loyalty.programActive")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("trader.loyalty.programActiveDesc")}
            </p>
          </div>
          <Switch
            checked={rule.isActive}
            onCheckedChange={(checked) =>
              setRule((prev) => ({ ...prev, isActive: checked }))
            }
          />
        </div>
        <Button onClick={handleSave}>{t("trader.loyalty.save")}</Button>
      </div>

      <div>
        <div className="mb-3">
          <h2 className="font-heading text-lg font-semibold">
            {t("trader.loyalty.farmersTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("trader.loyalty.farmersDescription")}
          </p>
        </div>
        {balances.length === 0 ? (
          <EmptyState
            title={t("trader.loyalty.emptyTitle")}
            description={t("trader.loyalty.emptyDescription")}
          />
        ) : (
          <div className="overflow-hidden rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.farmer")}</TableHead>
                  <TableHead>{t("loyalty.tokens")}</TableHead>
                  <TableHead className="min-w-40">
                    {t("trader.loyalty.progress")}
                  </TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("trader.loyalty.lastEarned")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => {
                  const progress = getLoyaltyProgress(balance, rule);
                  const status = loyaltyStatusFromProgress(progress);
                  return (
                    <TableRow key={balance.id}>
                      <TableCell className="font-medium">
                        {balance.farmerName}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {balance.tokenCount}
                      </TableCell>
                      <TableCell>
                        <LoyaltyProgressBar progress={progress} />
                      </TableCell>
                      <TableCell>
                        <LoyaltyStatusBadge status={status} />
                      </TableCell>
                      <TableCell>
                        {balance.lastEarnedAt
                          ? formatDate(balance.lastEarnedAt, locale)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
