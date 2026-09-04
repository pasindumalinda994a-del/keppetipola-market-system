import type { UserDocument } from "@/database/user.model";
import { LoyaltyBalance } from "@/database/loyalty-balance.model";
import { LoyaltyRule } from "@/database/loyalty-rule.model";
import { LoyaltyTokenEvent } from "@/database/loyalty-token-event.model";
import type { SaleDocument } from "@/database/sale.model";
import { isDuplicateKeyError } from "@/lib/member-id";
import {
  DEFAULT_LOYALTY_DISCOUNT_PERCENT,
  DEFAULT_LOYALTY_THRESHOLD,
  defaultLoyaltyRule,
} from "@/lib/loyalty";
import type { LoyaltyBalance as LoyaltyBalanceView, LoyaltyRule as LoyaltyRuleView } from "@/types";

export class LoyaltyError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "LoyaltyError";
    this.status = status;
  }
}

export type LoyaltyPricing = {
  unitPrice: number;
  originalUnitPrice: number;
  loyaltyDiscountPercent: number;
  loyaltyApplied: boolean;
};

export type TokenIssueResult = {
  issued: boolean;
  unlockedNow: boolean;
  discountPercent: number;
};

type RuleInput = {
  tokenThreshold: number;
  discountPercent: number;
  isActive: boolean;
};

function toRuleView(rule: {
  toJSON: () => Record<string, unknown>;
}): LoyaltyRuleView {
  return rule.toJSON() as unknown as LoyaltyRuleView;
}

export async function getOrDefaultRule(
  traderId: string
): Promise<{ rule: LoyaltyRuleView; isDefault: boolean }> {
  const existing = await LoyaltyRule.findOne({ traderId });
  if (existing) {
    return { rule: toRuleView(existing), isDefault: false };
  }
  return { rule: defaultLoyaltyRule(traderId), isDefault: true };
}

export async function upsertRule(trader: UserDocument, input: RuleInput) {
  const tokenThreshold = Math.floor(Number(input.tokenThreshold));
  const discountPercent = Number(input.discountPercent);
  const isActive = Boolean(input.isActive);

  if (!Number.isFinite(tokenThreshold) || tokenThreshold < 1) {
    throw new LoyaltyError("Token threshold must be at least 1");
  }
  if (
    !Number.isFinite(discountPercent) ||
    discountPercent < 0 ||
    discountPercent > 100
  ) {
    throw new LoyaltyError("Discount percent must be between 0 and 100");
  }

  const rule = await LoyaltyRule.findOneAndUpdate(
    { traderId: trader._id },
    {
      $set: {
        traderId: trader._id,
        tokenThreshold,
        discountPercent,
        isActive,
      },
    },
    { new: true, upsert: true }
  );

  if (!rule) {
    throw new LoyaltyError("Could not save loyalty rule", 500);
  }

  if (isActive) {
    await LoyaltyBalance.updateMany(
      { traderId: trader._id, tokensTowardReward: { $gte: tokenThreshold } },
      { $set: { rewardUnlocked: true } }
    );
    await LoyaltyBalance.updateMany(
      { traderId: trader._id, tokensTowardReward: { $lt: tokenThreshold } },
      { $set: { rewardUnlocked: false } }
    );
  } else {
    await LoyaltyBalance.updateMany(
      { traderId: trader._id },
      { $set: { rewardUnlocked: false } }
    );
  }

  return toRuleView(rule);
}

function snapshotFromRule(
  rule: { tokenThreshold: number; discountPercent: number; isActive: boolean } | null
) {
  return {
    tokenThreshold: rule?.tokenThreshold ?? DEFAULT_LOYALTY_THRESHOLD,
    discountPercent: rule?.discountPercent ?? DEFAULT_LOYALTY_DISCOUNT_PERCENT,
    isActive: rule?.isActive ?? false,
  };
}

function toBalanceView(
  balance: { toJSON: () => Record<string, unknown> },
  snapshot: {
    tokenThreshold: number;
    discountPercent: number;
    isActive: boolean;
  }
): LoyaltyBalanceView {
  return {
    ...(balance.toJSON() as unknown as LoyaltyBalanceView),
    ...snapshot,
  };
}

export async function listBalancesForTrader(traderId: string) {
  const [ruleDoc, balances] = await Promise.all([
    LoyaltyRule.findOne({ traderId }),
    LoyaltyBalance.find({ traderId }).sort({ tokenCount: -1, farmerName: 1 }),
  ]);
  const snapshot = snapshotFromRule(ruleDoc);
  return balances.map((balance) => toBalanceView(balance, snapshot));
}

export async function listBalancesForFarmer(farmerId: string) {
  const balances = await LoyaltyBalance.find({ farmerId }).sort({
    tokenCount: -1,
    traderName: 1,
  });
  const traderIds = [...new Set(balances.map((b) => String(b.traderId)))];
  const rules = await LoyaltyRule.find({ traderId: { $in: traderIds } });
  const ruleByTrader = new Map(
    rules.map((rule) => [String(rule.traderId), rule])
  );

  return balances.map((balance) =>
    toBalanceView(
      balance,
      snapshotFromRule(ruleByTrader.get(String(balance.traderId)) ?? null)
    )
  );
}

export async function applyDiscountOnAccept(opts: {
  farmerId: string;
  traderId: string;
  unitPrice: number;
}): Promise<LoyaltyPricing> {
  const originalUnitPrice = opts.unitPrice;
  const rule = await LoyaltyRule.findOne({ traderId: opts.traderId });
  if (!rule || !rule.isActive) {
    return {
      unitPrice: originalUnitPrice,
      originalUnitPrice,
      loyaltyDiscountPercent: 0,
      loyaltyApplied: false,
    };
  }

  const redeemed = await LoyaltyBalance.findOneAndUpdate(
    {
      farmerId: opts.farmerId,
      traderId: opts.traderId,
      rewardUnlocked: true,
    },
    { $set: { tokensTowardReward: 0, rewardUnlocked: false } }
  );

  if (!redeemed) {
    return {
      unitPrice: originalUnitPrice,
      originalUnitPrice,
      loyaltyDiscountPercent: 0,
      loyaltyApplied: false,
    };
  }

  const unitPrice = Math.max(
    0,
    Math.round(originalUnitPrice * (1 - rule.discountPercent / 100))
  );

  return {
    unitPrice,
    originalUnitPrice,
    loyaltyDiscountPercent: rule.discountPercent,
    loyaltyApplied: true,
  };
}

export async function issueTokenForCompletedSale(
  sale: SaleDocument
): Promise<TokenIssueResult> {
  const none: TokenIssueResult = {
    issued: false,
    unlockedNow: false,
    discountPercent: 0,
  };

  const rule = await LoyaltyRule.findOne({ traderId: sale.traderId });
  if (!rule || !rule.isActive) {
    return none;
  }

  try {
    await LoyaltyTokenEvent.create({
      saleId: sale._id,
      farmerId: sale.farmerId,
      traderId: sale.traderId,
      tokensIssued: 1,
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return none;
    }
    throw err;
  }

  const existing = await LoyaltyBalance.findOne({
    farmerId: sale.farmerId,
    traderId: sale.traderId,
  });

  if (!existing) {
    const tokensTowardReward = Math.min(1, rule.tokenThreshold);
    const rewardUnlocked = tokensTowardReward >= rule.tokenThreshold;
    await LoyaltyBalance.create({
      farmerId: sale.farmerId,
      traderId: sale.traderId,
      farmerName: sale.farmerName,
      traderName: sale.traderName,
      tokenCount: 1,
      tokensTowardReward,
      rewardUnlocked,
      lastEarnedAt: new Date(),
    });
    return {
      issued: true,
      unlockedNow: rewardUnlocked,
      discountPercent: rule.discountPercent,
    };
  }

  const wasUnlocked = existing.rewardUnlocked;
  existing.tokenCount += 1;
  existing.tokensTowardReward = Math.min(
    existing.tokensTowardReward + 1,
    rule.tokenThreshold
  );
  existing.rewardUnlocked = existing.tokensTowardReward >= rule.tokenThreshold;
  existing.lastEarnedAt = new Date();
  existing.farmerName = sale.farmerName;
  existing.traderName = sale.traderName;
  await existing.save();

  return {
    issued: true,
    unlockedNow: !wasUnlocked && existing.rewardUnlocked,
    discountPercent: rule.discountPercent,
  };
}
