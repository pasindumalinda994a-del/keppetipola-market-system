import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose from "mongoose";
import { Announcement } from "@/database/announcement.model";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import { ContactMessage } from "@/database/contact-message.model";
import { Counter } from "@/database/counter.model";
import { Harvest } from "@/database/harvest.model";
import { LoyaltyBalance } from "@/database/loyalty-balance.model";
import { LoyaltyRule } from "@/database/loyalty-rule.model";
import { LoyaltyTokenEvent } from "@/database/loyalty-token-event.model";
import { MarketPrice } from "@/database/market-price.model";
import { MarketSettings } from "@/database/market-settings.model";
import { Notification } from "@/database/notification.model";
import { Offer } from "@/database/offer.model";
import { PriceSnapshot } from "@/database/price-snapshot.model";
import { Sale } from "@/database/sale.model";
import { Stall } from "@/database/stall.model";
import { SystemLog } from "@/database/system-log.model";
import { Upload } from "@/database/upload.model";
import { User } from "@/database/user.model";
import { Vegetable } from "@/database/vegetable.model";
import connectDB from "@/lib/mongodb";

config({ path: resolve(process.cwd(), ".env.local") });

type WipeTarget = {
  name: string;
  delete: () => Promise<{ deletedCount?: number }>;
};

const WIPE_TARGETS: WipeTarget[] = [
  { name: "loyalty token events", delete: () => LoyaltyTokenEvent.deleteMany({}) },
  { name: "loyalty balances", delete: () => LoyaltyBalance.deleteMany({}) },
  { name: "loyalty rules", delete: () => LoyaltyRule.deleteMany({}) },
  { name: "sales", delete: () => Sale.deleteMany({}) },
  { name: "offers", delete: () => Offer.deleteMany({}) },
  { name: "applications", delete: () => Application.deleteMany({}) },
  { name: "harvests", delete: () => Harvest.deleteMany({}) },
  { name: "buying requests", delete: () => BuyingRequest.deleteMany({}) },
  { name: "stalls", delete: () => Stall.deleteMany({}) },
  { name: "notifications", delete: () => Notification.deleteMany({}) },
  { name: "uploads", delete: () => Upload.deleteMany({}) },
  { name: "announcements", delete: () => Announcement.deleteMany({}) },
  { name: "contact messages", delete: () => ContactMessage.deleteMany({}) },
  { name: "system logs", delete: () => SystemLog.deleteMany({}) },
  { name: "price snapshots", delete: () => PriceSnapshot.deleteMany({}) },
  { name: "market prices", delete: () => MarketPrice.deleteMany({}) },
  { name: "vegetables", delete: () => Vegetable.deleteMany({}) },
  { name: "counters", delete: () => Counter.deleteMany({}) },
  { name: "market settings", delete: () => MarketSettings.deleteMany({}) },
];

async function resetKeepAdmin(): Promise<void> {
  if (!process.argv.includes("--confirm")) {
    console.error("Aborted: pass --confirm to wipe all data except admin users.");
    process.exit(1);
  }

  await connectDB();

  const admins = await User.find({ role: "admin" }).select("email name status");
  if (admins.length === 0) {
    console.error("Aborted: no admin users found. Refusing to wipe the database.");
    process.exit(1);
  }

  const userCount = await User.countDocuments();
  console.log(`Admins to keep (${admins.length}):`);
  for (const admin of admins) {
    console.log(`  - ${admin.email} (${admin.name}, ${admin.status})`);
  }
  console.log(`Other users to delete: ${userCount - admins.length}`);

  for (const target of WIPE_TARGETS) {
    const result = await target.delete();
    console.log(`Cleared ${target.name}: ${result.deletedCount ?? 0}`);
  }

  const removedUsers = await User.deleteMany({ role: { $ne: "admin" } });
  console.log(`Deleted non-admin users: ${removedUsers.deletedCount ?? 0}`);

  const bookmarkClear = await User.updateMany(
    { role: "admin" },
    { $set: { bookmarkedVegetableIds: [] } }
  );
  console.log(`Cleared admin bookmarks: ${bookmarkClear.modifiedCount ?? 0}`);

  await MarketSettings.create({});
  console.log("Recreated default market settings.");

  const remaining = await User.find({}).select("email role");
  console.log(`Remaining users (${remaining.length}):`);
  for (const user of remaining) {
    console.log(`  - ${user.email} (${user.role})`);
  }
}

async function main(): Promise<void> {
  try {
    await resetKeepAdmin();
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
