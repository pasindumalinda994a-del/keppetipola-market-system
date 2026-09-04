import type { LoyaltyBalance, LoyaltyProgress, LoyaltyRule } from "@/types";

export const DEFAULT_LOYALTY_THRESHOLD = 10;
export const DEFAULT_LOYALTY_DISCOUNT_PERCENT = 5;

export function defaultLoyaltyRule(traderId: string): LoyaltyRule {
  return {
    id: "",
    traderId,
    tokenThreshold: DEFAULT_LOYALTY_THRESHOLD,
    discountPercent: DEFAULT_LOYALTY_DISCOUNT_PERCENT,
    isActive: true,
    updatedAt: new Date().toISOString(),
  };
}

export function getLoyaltyProgress(
  balance: LoyaltyBalance,
  rule?: LoyaltyRule | null
): LoyaltyProgress {
  const threshold = rule?.tokenThreshold ?? balance.tokenThreshold ?? DEFAULT_LOYALTY_THRESHOLD;
  const discountPercent = rule?.discountPercent ?? balance.discountPercent ?? 0;
  const ruleActive = rule?.isActive ?? balance.isActive ?? false;
  const unlocked =
    ruleActive &&
    (balance.rewardUnlocked || balance.tokensTowardReward >= threshold);
  const current = unlocked
    ? threshold
    : Math.min(balance.tokensTowardReward, threshold);
  const percent =
    threshold <= 0 ? 0 : Math.min(100, Math.round((current / threshold) * 100));

  return {
    current,
    threshold,
    percent,
    unlocked,
    discountPercent,
    ruleActive,
  };
}
