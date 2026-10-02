import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { Harvest } from "@/database/harvest.model";
import { LoyaltyBalance } from "@/database/loyalty-balance.model";
import { LoyaltyRule } from "@/database/loyalty-rule.model";
import { MarketPrice } from "@/database/market-price.model";
import { Offer } from "@/database/offer.model";
import { Sale } from "@/database/sale.model";
import { User, type UserDocument } from "@/database/user.model";
import { Vegetable } from "@/database/vegetable.model";
import { issueTokenForCompletedSale } from "@/lib/actions/loyalty.actions";
import connectDB from "@/lib/mongodb";

config({ path: resolve(process.cwd(), ".env.local") });

const TOPUP_MESSAGE = "loyalty-topup";
const QUANTITY_KG = 20;
const FALLBACK_UNIT_PRICE = 150;

function yesterdayAt(hour = 10): Date {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return date;
}

function idOf(value: { _id: unknown } | string): string {
  return String(typeof value === "string" ? value : value._id);
}

async function topup(): Promise<void> {
  await connectDB();

  const [farmers, traders, rules, carrot] = await Promise.all([
    User.find({ role: "farmer", status: "Active" }).sort({ name: 1 }),
    User.find({ role: "trader", status: "Active" }).sort({ name: 1 }),
    LoyaltyRule.find({ isActive: true }),
    Vegetable.findOne({ name: "Carrot" }),
  ]);

  const vegetable = carrot ?? (await Vegetable.findOne().sort({ name: 1 }));
  if (!vegetable) {
    throw new Error("No vegetables in the catalog. Seed produce before topping up loyalty.");
  }

  const activeTraderIds = new Set(traders.map((trader) => idOf(trader)));
  const tradersById = new Map(traders.map((trader) => [idOf(trader), trader]));
  const eligibleTraders = rules
    .map((rule) => tradersById.get(String(rule.traderId)))
    .filter((trader): trader is UserDocument => Boolean(trader) && activeTraderIds.has(idOf(trader!)))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (eligibleTraders.length === 0) {
    throw new Error("No active traders with an active loyalty rule.");
  }

  const balances = await LoyaltyBalance.find();
  const enrolled = new Map<string, number>();
  for (const trader of eligibleTraders) {
    enrolled.set(idOf(trader), 0);
  }
  for (const balance of balances) {
    const traderId = String(balance.traderId);
    if (enrolled.has(traderId)) {
      enrolled.set(traderId, (enrolled.get(traderId) ?? 0) + 1);
    }
  }

  const marketPrice = await MarketPrice.findOne({ vegetableId: vegetable._id });
  const unitPrice =
    marketPrice && marketPrice.average > 0
      ? Math.round(marketPrice.average)
      : FALLBACK_UNIT_PRICE;
  const when = yesterdayAt();

  console.log(
    `Loyalty top-up: ${farmers.length} active farmer(s), ${eligibleTraders.length} eligible trader(s), ${vegetable.name} @ Rs.${unitPrice}/kg.`
  );

  for (const farmer of farmers) {
    const farmerId = idOf(farmer);
    const already = await Offer.exists({
      farmerId: farmer._id,
      message: TOPUP_MESSAGE,
    });
    if (already) {
      console.log(`skip  ${farmer.name.padEnd(16)} already topped up`);
      continue;
    }

    const ownBalances = balances
      .filter((balance) => String(balance.farmerId) === farmerId)
      .filter((balance) => enrolled.has(String(balance.traderId)))
      .sort((a, b) => {
        if (b.tokenCount !== a.tokenCount) return b.tokenCount - a.tokenCount;
        return a.traderName.localeCompare(b.traderName);
      });

    let trader: UserDocument;
    if (ownBalances.length > 0) {
      const match = tradersById.get(String(ownBalances[0].traderId));
      if (!match) {
        throw new Error(`Trader missing for ${farmer.name}'s loyalty balance.`);
      }
      trader = match;
    } else {
      trader = [...eligibleTraders].sort((a, b) => {
        const diff = (enrolled.get(idOf(a)) ?? 0) - (enrolled.get(idOf(b)) ?? 0);
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name);
      })[0];
      enrolled.set(idOf(trader), (enrolled.get(idOf(trader)) ?? 0) + 1);
    }

    const before = await LoyaltyBalance.findOne({
      farmerId: farmer._id,
      traderId: trader._id,
    });
    const beforeTokens = before?.tokenCount ?? 0;
    const beforeToward = before?.tokensTowardReward ?? 0;

    const harvest = await Harvest.create({
      farmerId: farmer._id,
      farmerName: farmer.name,
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      quantityKg: QUANTITY_KG,
      remainingKg: 0,
      qualityGrade: "A",
      harvestDate: when,
      expectedDelivery: when,
      availableUntil: when,
      status: "Completed",
      applications: 0,
      photos: [],
    });

    const offer = await Offer.create({
      source: "harvest",
      harvestId: harvest._id,
      farmerId: farmer._id,
      traderId: trader._id,
      traderName: trader.name,
      farmerName: farmer.name,
      vegetableName: vegetable.name,
      price: unitPrice,
      quantityKg: QUANTITY_KG,
      delivery: when,
      message: TOPUP_MESSAGE,
      status: "Accepted",
    });

    const sale = await Sale.create({
      farmerId: farmer._id,
      traderId: trader._id,
      farmerName: farmer.name,
      traderName: trader.name,
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      quantityKg: QUANTITY_KG,
      unitPrice,
      total: unitPrice * QUANTITY_KG,
      delivery: when,
      sourceOfferId: offer._id,
      harvestId: harvest._id,
      status: "Completed",
      date: when,
    });

    const issued = await issueTokenForCompletedSale(sale);
    if (!issued.issued) {
      throw new Error(
        `Token was not issued for ${farmer.name} with ${trader.name}.`
      );
    }

    const after = await LoyaltyBalance.findOne({
      farmerId: farmer._id,
      traderId: trader._id,
    });
    console.log(
      `add   ${farmer.name.padEnd(16)} → ${trader.name.padEnd(12)} tokens ${beforeTokens} → ${after?.tokenCount ?? "?"}   toward ${beforeToward} → ${after?.tokensTowardReward ?? "?"}   unlocked ${Boolean(after?.rewardUnlocked)}`
    );
  }
}

async function main(): Promise<void> {
  try {
    await topup();
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
