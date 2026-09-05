import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose, { type Types } from "mongoose";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import { Harvest } from "@/database/harvest.model";
import { LoyaltyTokenEvent } from "@/database/loyalty-token-event.model";
import { MarketPrice } from "@/database/market-price.model";
import { MarketSettings } from "@/database/market-settings.model";
import { Notification } from "@/database/notification.model";
import { Offer } from "@/database/offer.model";
import { PriceSnapshot } from "@/database/price-snapshot.model";
import { Sale } from "@/database/sale.model";
import { Upload } from "@/database/upload.model";
import { User } from "@/database/user.model";
import { Vegetable } from "@/database/vegetable.model";
import { PRODUCE_CATALOG, produceNameRegex } from "@/lib/produce-catalog";
import { DEFAULT_PRODUCE_CATEGORIES } from "@/lib/produce";
import connectDB from "@/lib/mongodb";

config({ path: resolve(process.cwd(), ".env.local") });

const REMOVED_PRODUCE_NAMES = ["Small Onions"] as const;

function logDeleted(label: string, deletedCount: number | undefined): void {
  console.log(`Purged ${label}: ${deletedCount ?? 0}`);
}

async function purgeRemovedProduce(name: string): Promise<void> {
  const nameMatch = produceNameRegex(name);
  const vegetable = await Vegetable.findOne({ name: nameMatch });
  const vegetableId = vegetable?._id as Types.ObjectId | undefined;

  const harvestFilter = vegetableId
    ? { $or: [{ vegetableId }, { vegetableName: nameMatch }] }
    : { vegetableName: nameMatch };
  const harvests = await Harvest.find(harvestFilter).select("_id");
  const harvestIds = harvests.map((h) => h._id);

  if (harvestIds.length > 0) {
    const harvestOffers = await Offer.deleteMany({ harvestId: { $in: harvestIds } });
    logDeleted(`${name} harvest offers`, harvestOffers.deletedCount);
    const harvestUploads = await Upload.deleteMany({
      ownerType: "harvest",
      ownerId: { $in: harvestIds },
    });
    logDeleted(`${name} harvest uploads`, harvestUploads.deletedCount);
  }

  const harvestsDeleted = await Harvest.deleteMany(harvestFilter);
  logDeleted(`${name} harvests`, harvestsDeleted.deletedCount);

  const saleFilter = vegetableId
    ? { $or: [{ vegetableId }, { vegetableName: nameMatch }] }
    : { vegetableName: nameMatch };
  const sales = await Sale.find(saleFilter).select("_id");
  const saleIds = sales.map((s) => s._id);

  if (saleIds.length > 0) {
    const loyalty = await LoyaltyTokenEvent.deleteMany({ saleId: { $in: saleIds } });
    logDeleted(`${name} loyalty token events`, loyalty.deletedCount);
  }

  const salesDeleted = await Sale.deleteMany(saleFilter);
  logDeleted(`${name} sales`, salesDeleted.deletedCount);

  const requestFilter = vegetableId
    ? { $or: [{ vegetableId }, { vegetableName: nameMatch }] }
    : { vegetableName: nameMatch };
  const requests = await BuyingRequest.find(requestFilter).select("_id");
  const requestIds = requests.map((r) => r._id);

  if (requestIds.length > 0) {
    const apps = await Application.deleteMany({ requestId: { $in: requestIds } });
    logDeleted(`${name} applications by request`, apps.deletedCount);
    const requestOffers = await Offer.deleteMany({ requestId: { $in: requestIds } });
    logDeleted(`${name} request offers`, requestOffers.deletedCount);
  }

  const requestsDeleted = await BuyingRequest.deleteMany(requestFilter);
  logDeleted(`${name} buying requests`, requestsDeleted.deletedCount);

  const leftoverOffers = await Offer.deleteMany({ vegetableName: nameMatch });
  logDeleted(`${name} leftover offers`, leftoverOffers.deletedCount);
  const leftoverApps = await Application.deleteMany({ vegetableName: nameMatch });
  logDeleted(`${name} leftover applications`, leftoverApps.deletedCount);

  if (vegetableId) {
    const prices = await MarketPrice.deleteMany({ vegetableId });
    logDeleted(`${name} market prices`, prices.deletedCount);
    const snapshots = await PriceSnapshot.deleteMany({ vegetableId });
    logDeleted(`${name} price snapshots`, snapshots.deletedCount);
    const bookmarks = await User.updateMany(
      { bookmarkedVegetableIds: vegetableId },
      { $pull: { bookmarkedVegetableIds: vegetableId } }
    );
    console.log(`Cleared ${name} bookmarks from ${bookmarks.modifiedCount} user(s)`);
  }

  const mentionMatch = new RegExp(
    name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "i"
  );
  const notifications = await Notification.deleteMany({
    $or: [{ title: mentionMatch }, { message: mentionMatch }],
  });
  logDeleted(`${name} notifications`, notifications.deletedCount);

  if (vegetable) {
    await vegetable.deleteOne();
    console.log(`Deleted vegetable ${name} (${String(vegetable._id)})`);
  } else {
    console.log(`No vegetable document named ${name}`);
  }
}

async function seedProduceCatalog(): Promise<void> {
  await connectDB();

  for (const name of REMOVED_PRODUCE_NAMES) {
    await purgeRemovedProduce(name);
  }

  const settings = await MarketSettings.findOneAndUpdate(
    {},
    { $set: { vegetableCategories: DEFAULT_PRODUCE_CATEGORIES } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
  );
  console.log(`Categories: ${settings?.vegetableCategories ?? DEFAULT_PRODUCE_CATEGORIES}`);

  let updated = 0;
  let created = 0;

  for (const spec of PRODUCE_CATALOG) {
    const existing = await Vegetable.findOne({ name: produceNameRegex(spec.name) });
    if (existing) {
      existing.category = spec.category;
      existing.imageUrl = spec.imageUrl;
      if (spec.name === "Radish") {
        existing.status = "Active";
      }
      await existing.save();
      await MarketPrice.findOneAndUpdate(
        { vegetableId: existing._id },
        { $set: { imageUrl: spec.imageUrl, vegetableName: existing.name } }
      );
      updated += 1;
      console.log(`Updated ${existing.name} → ${spec.category} (${String(existing._id)})`);
      continue;
    }

    const vegetable = await Vegetable.create({
      name: spec.name,
      category: spec.category,
      unit: "kg",
      imageUrl: spec.imageUrl,
      status: spec.status,
    });
    await MarketPrice.create({
      vegetableId: vegetable._id,
      vegetableName: vegetable.name,
      imageUrl: spec.imageUrl,
      lowest: spec.lowest,
      highest: spec.highest,
      average: spec.average,
      change: spec.change,
      lastUpdated: new Date(),
    });
    created += 1;
    console.log(`Created ${vegetable.name} (${spec.category})`);
  }

  console.log(
    `Done. Updated ${updated} existing, created ${created} new. Catalog size ${PRODUCE_CATALOG.length}.`
  );
}

seedProduceCatalog()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
