"use client";

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
import { useAuth } from "@/components/providers/auth-provider";
import { ApiError, fetchLoyaltyBalances, fetchLoyaltyRule, saveLoyaltyRule } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useTokenQuery } from "@/lib/hooks/use-token-query";
import { defaultLoyaltyRule, getLoyaltyProgress } from "@/lib/loyalty";
import type { LoyaltyBalance, LoyaltyRule } from "@/types";

const emptyStats = { enrolled: 0, rewardsReady: 0, avgTokens: 0 };

export default function TraderLoyaltyPage() {
  const { t, locale } = useLocale();
  const { user: trader, token } = useAuth();
  const { data, setData, loading, refetch } = useTokenQuery(
    token,
    async (authToken) => {
      const [ruleData, balanceData] = await Promise.all([
        fetchLoyaltyRule(authToken),
        fetchLoyaltyBalances(authToken),
      ]);
      return {
        rule: ruleData.rule,
        balances: balanceData.balances,
        stats: balanceData.stats,
      };
    },
    {
      rule: defaultLoyaltyRule(trader?.id ?? ""),
      balances: [] as LoyaltyBalance[],
      stats: emptyStats,
    }
  );

  const rule = data.rule;
  const balances = data.balances;
  const stats = data.stats;

  function patchRule(patch: Partial<LoyaltyRule>) {
    setData((prev) => ({ ...prev, rule: { ...prev.rule, ...patch } }));
  }

  async function handleSave() {
    if (!token) return;
    const threshold = Math.max(1, Math.floor(Number(rule.tokenThreshold) || 1));
    const discount = Math.min(
      100,
      Math.max(0, Number(rule.discountPercent) || 0)
    );
    try {
      const saved = await saveLoyaltyRule(token, {
        tokenThreshold: threshold,
        discountPercent: discount,
        isActive: rule.isActive,
      });
      setData((prev) => ({ ...prev, rule: saved.rule }));
      toast.success(t("trader.loyalty.saved"));
      await refetch();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("common.retry"));
    }
  }

  if (!trader) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("trader.loyalty.title")}
        description={t("trader.loyalty.description")}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title={t("trader.loyalty.enrolled")}
          value={String(stats.enrolled)}
        />
        <StatCard
          title={t("trader.loyalty.rewardsReady")}
          value={String(stats.rewardsReady)}
        />
        <StatCard
          title={t("trader.loyalty.avgTokens")}
          value={String(stats.avgTokens)}
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
                patchRule({ tokenThreshold: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-percent">
              {t("trader.loyalty.discountPercent")}
            </Label>
            <Input
              id="offer-percent"
              type="number"
              min={0}
              max={100}
              value={rule.discountPercent}
              onChange={(e) =>
                patchRule({ discountPercent: Number(e.target.value) })
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
            onCheckedChange={(checked) => patchRule({ isActive: checked })}
          />
        </div>
        <Button onClick={() => void handleSave()} disabled={loading}>
          {t("trader.loyalty.save")}
        </Button>
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
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : balances.length === 0 ? (
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
