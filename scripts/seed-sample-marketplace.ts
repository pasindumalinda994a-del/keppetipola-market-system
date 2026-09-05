import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "node:path";
import mongoose, { type Types } from "mongoose";
import { Announcement } from "@/database/announcement.model";
import { Application } from "@/database/application.model";
import { BuyingRequest } from "@/database/buying-request.model";
import { ContactMessage } from "@/database/contact-message.model";
import { Counter } from "@/database/counter.model";
import { Harvest, type HarvestDocument } from "@/database/harvest.model";
import { LoyaltyBalance } from "@/database/loyalty-balance.model";
import { LoyaltyRule } from "@/database/loyalty-rule.model";
import { LoyaltyTokenEvent } from "@/database/loyalty-token-event.model";
import { MarketPrice } from "@/database/market-price.model";
import { MarketSettings } from "@/database/market-settings.model";
import {
  Notification,
  type NotificationGroup,
} from "@/database/notification.model";
import { Offer } from "@/database/offer.model";
import { PriceSnapshot } from "@/database/price-snapshot.model";
import { Sale, type SaleDocument } from "@/database/sale.model";
import { Stall } from "@/database/stall.model";
import { SystemLog } from "@/database/system-log.model";
import { Upload } from "@/database/upload.model";
import {
  User,
  type AccountStatus,
  type UserDocument,
  type UserRole,
} from "@/database/user.model";
import {
  Vegetable,
  type VegetableDocument,
} from "@/database/vegetable.model";
import {
  applyDiscountOnAccept,
  issueTokenForCompletedSale,
} from "@/lib/actions/loyalty.actions";
import { nextMemberId } from "@/lib/member-id";
import connectDB from "@/lib/mongodb";
import type { QualityGrade } from "@/types";

config({ path: resolve(process.cwd(), ".env.local") });

const DEMO_PASSWORD = "Password123";

const CATALOG: {
  name: string;
  category: string;
  imageUrl: string;
  lowest: number;
  highest: number;
  average: number;
  change: number;
  status: "Active" | "Inactive";
}[] = [
  {
    name: "Carrot",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Carrot.png",
    lowest: 190,
    highest: 200,
    average: 196,
    change: 5,
    status: "Active",
  },
  {
    name: "Cabbage",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Cabbage.png",
    lowest: 80,
    highest: 95,
    average: 88,
    change: -2,
    status: "Active",
  },
  {
    name: "Leeks",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Leeks.png",
    lowest: 220,
    highest: 245,
    average: 232,
    change: 8,
    status: "Active",
  },
  {
    name: "Beans",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Beans.png",
    lowest: 280,
    highest: 310,
    average: 295,
    change: 12,
    status: "Active",
  },
  {
    name: "Tomato",
    category: "Fruit",
    imageUrl: "/Vegitable-Images/Tomato.png",
    lowest: 150,
    highest: 175,
    average: 162,
    change: -4,
    status: "Active",
  },
  {
    name: "Potato",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Potato.png",
    lowest: 120,
    highest: 135,
    average: 128,
    change: 1,
    status: "Active",
  },
  {
    name: "Beetroot",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Beetroot.png",
    lowest: 160,
    highest: 180,
    average: 170,
    change: 3,
    status: "Active",
  },
  {
    name: "Capsicum",
    category: "Fruit",
    imageUrl: "/Vegitable-Images/Capsicum.png",
    lowest: 350,
    highest: 390,
    average: 370,
    change: -6,
    status: "Active",
  },
  {
    name: "Radish",
    category: "Vegetable",
    imageUrl: "/Vegitable-Images/Radish.png",
    lowest: 70,
    highest: 90,
    average: 80,
    change: 0,
    status: "Inactive",
  },
];

type VegName =
  | "Carrot"
  | "Cabbage"
  | "Leeks"
  | "Beans"
  | "Tomato"
  | "Potato"
  | "Beetroot"
  | "Capsicum";

type VegMap = Record<VegName, VegetableDocument>;

type TraderKey = "nuwan" | "kamal" | "sunil" | "supun" | "susantha";
type FarmerKey =
  | "bandu"
  | "jaliya"
  | "thushara"
  | "sumeda"
  | "karunarathna"
  | "sirisena"
  | "agith"
  | "shantha"
  | "premarathna"
  | "kumara";

function atDays(offset: number, hour = 10): Date {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

function utcDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function addUtcDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateKey(d);
}

function historyPoint(
  vegetableName: string,
  base: number,
  offsetDays: number
): { average: number; lowest: number; highest: number } {
  const seed = vegetableName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const wobble =
    Math.sin(offsetDays * 1.3 + seed * 0.17) * 10 +
    ((offsetDays + seed) % 4) * 2;
  const average = Math.max(
    1,
    Math.round(base - 10 + wobble + offsetDays * 0.05)
  );
  return {
    average,
    lowest: Math.max(1, average - 8),
    highest: average + 10,
  };
}

async function notify(
  userId: Types.ObjectId,
  group: NotificationGroup,
  title: string,
  message: string,
  read = false
): Promise<void> {
  await Notification.create({
    userId,
    group,
    title,
    message,
    read,
  });
}

const WIPE_TARGETS: { name: string; delete: () => Promise<{ deletedCount?: number }> }[] =
  [
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

async function wipeKeepAdmins(): Promise<UserDocument[]> {
  const admins = await User.find({ role: "admin" });
  for (const target of WIPE_TARGETS) {
    const result = await target.delete();
    console.log(`Cleared ${target.name}: ${result.deletedCount ?? 0}`);
  }
  const removed = await User.deleteMany({ role: { $ne: "admin" } });
  console.log(`Deleted non-admin users: ${removed.deletedCount ?? 0}`);
  await User.updateMany(
    { role: "admin" },
    { $set: { bookmarkedVegetableIds: [] } }
  );
  await MarketSettings.create({
    vegetableCategories: "Vegetable, Fruit, Other",
    opensAt: "04:00",
    closesAt: "14:00",
    marketName: "Keppetipola Market",
  });
  console.log("Recreated Keppetipola Market settings.");
  return admins;
}

async function ensureAdmin(
  admins: UserDocument[],
  passwordHash: string
): Promise<{ admin: UserDocument; created: boolean }> {
  if (admins.length > 0) {
    console.log(`Keeping ${admins.length} admin account(s).`);
    return { admin: admins[0], created: false };
  }
  const admin = await User.create({
    name: "Market Admin",
    email: "admin@keppetipola.lk",
    phone: "0812223344",
    password: passwordHash,
    role: "admin",
    address: "Market Office, Keppetipola",
    ruralServicesDivision: "",
    memberId: undefined,
    status: "Active",
    joinedAt: atDays(-40),
    reviewedAt: atDays(-40),
  });
  console.log("Created admin@keppetipola.lk (no existing admin found).");
  return { admin, created: true };
}

async function createAccount(input: {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address: string;
  ruralServicesDivision?: string;
  status: AccountStatus;
  passwordHash: string;
  joinedAt: Date;
  rejectionReason?: string;
}): Promise<UserDocument> {
  const memberId =
    input.role === "farmer" || input.role === "trader"
      ? await nextMemberId(input.role)
      : undefined;
  return User.create({
    name: input.name,
    email: input.email,
    phone: input.phone,
    password: input.passwordHash,
    role: input.role,
    address: input.address,
    ruralServicesDivision: input.ruralServicesDivision ?? "",
    memberId,
    status: input.status,
    rejectionReason: input.rejectionReason ?? "",
    reviewedAt:
      input.status === "Pending" ? undefined : atDays(-20, 9),
    joinedAt: input.joinedAt,
  });
}

async function seedCatalog(): Promise<VegMap> {
  const map = {} as VegMap;
  for (const spec of CATALOG) {
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
      imageUrl: vegetable.imageUrl,
      lowest: spec.lowest,
      highest: spec.highest,
      average: spec.average,
      change: spec.change,
      lastUpdated: new Date(),
    });
    if (spec.status === "Active" && spec.name !== "Radish") {
      map[spec.name as VegName] = vegetable;
    }
  }
  console.log(`Catalog: ${CATALOG.length} vegetables (1 inactive).`);
  return map;
}

async function seedPriceSnapshots(): Promise<void> {
  const prices = await MarketPrice.find();
  const today = utcDateKey();
  const ops = [];
  for (const price of prices) {
    const base = price.average > 0 ? price.average : 150;
    for (let offset = 364; offset >= 1; offset -= 1) {
      const date = addUtcDays(today, -offset);
      const point = historyPoint(price.vegetableName, base, offset);
      ops.push({
        updateOne: {
          filter: { vegetableId: price.vegetableId, date },
          update: {
            $set: {
              vegetableId: price.vegetableId,
              date,
              lowest: point.lowest,
              highest: point.highest,
              average: point.average,
            },
          },
          upsert: true,
        },
      });
    }
    ops.push({
      updateOne: {
        filter: { vegetableId: price.vegetableId, date: today },
        update: {
          $set: {
            vegetableId: price.vegetableId,
            date: today,
            lowest: price.lowest,
            highest: price.highest,
            average: price.average,
          },
        },
        upsert: true,
      },
    });
  }
  const result = await PriceSnapshot.bulkWrite(ops, { ordered: false });
  console.log(
    `Price history: snapshots for ${prices.length} vegetables (${result.upsertedCount} new).`
  );
}

async function createHarvest(opts: {
  farmer: UserDocument;
  veg: VegetableDocument;
  quantityKg: number;
  remainingKg?: number;
  grade?: QualityGrade;
  status?: HarvestDocument["status"];
  harvestOffset?: number;
  deliveryOffset?: number;
  availableOffset?: number;
}): Promise<HarvestDocument> {
  const harvestOffset = opts.harvestOffset ?? -2;
  const status = opts.status ?? "Active";
  const remainingKg = opts.remainingKg ?? opts.quantityKg;
  return Harvest.create({
    farmerId: opts.farmer._id,
    farmerName: opts.farmer.name,
    vegetableId: opts.veg._id,
    vegetableName: opts.veg.name,
    quantityKg: opts.quantityKg,
    remainingKg,
    qualityGrade: opts.grade ?? "A",
    harvestDate: atDays(harvestOffset),
    expectedDelivery: atDays(opts.deliveryOffset ?? 2),
    availableUntil: atDays(opts.availableOffset ?? (status === "Active" ? 7 : -1)),
    status,
    applications: 0,
    photos: [],
  });
}

async function createHarvestOffer(opts: {
  harvest: HarvestDocument;
  trader: UserDocument;
  price: number;
  quantityKg: number;
  delivery: Date;
  status: "Pending" | "Accepted" | "Cancelled";
  message?: string;
}) {
  const offer = await Offer.create({
    source: "harvest",
    harvestId: opts.harvest._id,
    farmerId: opts.harvest.farmerId,
    traderId: opts.trader._id,
    traderName: opts.trader.name,
    farmerName: opts.harvest.farmerName,
    vegetableName: opts.harvest.vegetableName,
    price: opts.price,
    quantityKg: opts.quantityKg,
    delivery: opts.delivery,
    message: opts.message ?? "",
    status: opts.status,
  });
  opts.harvest.applications += 1;
  await opts.harvest.save();
  return offer;
}

async function recordHarvestSale(opts: {
  harvest: HarvestDocument;
  trader: UserDocument;
  price: number;
  quantityKg: number;
  delivery: Date;
  date: Date;
  status: "Accepted" | "Completed";
  message?: string;
  originalUnitPrice?: number;
  loyaltyDiscountPercent?: number;
  loyaltyApplied?: boolean;
}): Promise<{ sale: SaleDocument }> {
  if (opts.quantityKg > opts.harvest.remainingKg) {
    throw new Error(
      `Harvest ${opts.harvest.vegetableName} (${opts.harvest.farmerName}) cannot sell ${opts.quantityKg} of remaining ${opts.harvest.remainingKg}`
    );
  }
  const offer = await createHarvestOffer({
    harvest: opts.harvest,
    trader: opts.trader,
    price: opts.price,
    quantityKg: opts.quantityKg,
    delivery: opts.delivery,
    status: "Accepted",
    message: opts.message,
  });
  opts.harvest.remainingKg -= opts.quantityKg;
  if (opts.harvest.remainingKg <= 0) {
    opts.harvest.remainingKg = 0;
    opts.harvest.status = "Completed";
  }
  await opts.harvest.save();

  const unitPrice = opts.price;
  const sale = await Sale.create({
    farmerId: opts.harvest.farmerId,
    traderId: opts.trader._id,
    farmerName: opts.harvest.farmerName,
    traderName: opts.trader.name,
    vegetableId: opts.harvest.vegetableId,
    vegetableName: opts.harvest.vegetableName,
    quantityKg: opts.quantityKg,
    unitPrice,
    total: unitPrice * opts.quantityKg,
    delivery: opts.delivery,
    sourceOfferId: offer._id,
    harvestId: opts.harvest._id,
    status: opts.status,
    date: opts.date,
    originalUnitPrice: opts.originalUnitPrice,
    loyaltyDiscountPercent: opts.loyaltyDiscountPercent ?? 0,
    loyaltyApplied: opts.loyaltyApplied ?? false,
  });

  await SystemLog.create({
    type: "Transaction",
    message: `Sale ${opts.status.toLowerCase()} (${opts.harvest.vegetableName}, ${opts.quantityKg} kg)`,
    user: opts.trader.email,
  });

  if (opts.status === "Completed") {
    await notify(
      opts.trader._id,
      "Accepted Offers",
      "Offer accepted",
      `${opts.harvest.farmerName} accepted your offer for ${opts.harvest.vegetableName} (${opts.quantityKg} kg).`,
      true
    );
    await notify(
      opts.trader._id,
      "Sales",
      "Sale completed",
      `${opts.harvest.vegetableName} sale (${opts.quantityKg} kg) was marked completed.`
    );
    await notify(
      opts.harvest.farmerId,
      "Sales",
      "Sale completed",
      `${opts.harvest.vegetableName} sale (${opts.quantityKg} kg) was marked completed.`,
      true
    );
  } else {
    await notify(
      opts.trader._id,
      "Accepted Offers",
      "Offer accepted",
      `${opts.harvest.farmerName} accepted your offer for ${opts.harvest.vegetableName} (${opts.quantityKg} kg).`
    );
  }
  return { sale };
}

async function createRequest(opts: {
  trader: UserDocument;
  veg: VegetableDocument;
  quantityKg: number;
  remainingKg?: number;
  minPrice: number;
  maxPrice: number;
  grade?: QualityGrade;
  pickupOffset?: number;
  closingOffset?: number;
  notes: string;
  status?: "Active" | "Closed" | "Cancelled";
}) {
  const status = opts.status ?? "Active";
  return BuyingRequest.create({
    traderId: opts.trader._id,
    traderName: opts.trader.name,
    vegetableId: opts.veg._id,
    vegetableName: opts.veg.name,
    quantityKg: opts.quantityKg,
    remainingKg: opts.remainingKg ?? opts.quantityKg,
    minPrice: opts.minPrice,
    maxPrice: opts.maxPrice,
    preferredGrade: opts.grade ?? "A",
    pickupDate: atDays(opts.pickupOffset ?? 2),
    closingTime: atDays(opts.closingOffset ?? (status === "Active" ? 5 : -2), 18),
    notes: opts.notes,
    status,
  });
}

async function createApplication(opts: {
  request: Awaited<ReturnType<typeof createRequest>>;
  farmer: UserDocument;
  quantityKg: number;
  grade?: QualityGrade;
  harvestOffset?: number;
  status: "Pending" | "Offered" | "Accepted" | "Cancelled";
}) {
  const application = await Application.create({
    requestId: opts.request._id,
    farmerId: opts.farmer._id,
    farmerName: opts.farmer.name,
    vegetableName: opts.request.vegetableName,
    quantityKg: opts.quantityKg,
    grade: opts.grade ?? "A",
    harvestDate: atDays(opts.harvestOffset ?? -2),
    status: opts.status,
  });
  if (opts.status !== "Cancelled") {
    await notify(
      opts.request.traderId,
      "Applications",
      "New application",
      `${opts.farmer.name} applied to your ${opts.request.vegetableName} request.`,
      opts.status === "Accepted"
    );
  }
  return application;
}

async function recordRequestSale(opts: {
  request: Awaited<ReturnType<typeof createRequest>>;
  application: Awaited<ReturnType<typeof createApplication>>;
  farmer: UserDocument;
  trader: UserDocument;
  price: number;
  quantityKg: number;
  delivery: Date;
  date: Date;
  status: "Accepted" | "Completed";
  message?: string;
}) {
  if (opts.quantityKg > opts.request.remainingKg) {
    throw new Error(
      `Request ${opts.request.vegetableName} (${opts.trader.name}) cannot buy ${opts.quantityKg} of remaining ${opts.request.remainingKg}`
    );
  }
  const offer = await Offer.create({
    source: "application",
    applicationId: opts.application._id,
    requestId: opts.request._id,
    farmerId: opts.farmer._id,
    traderId: opts.trader._id,
    traderName: opts.trader.name,
    farmerName: opts.farmer.name,
    vegetableName: opts.request.vegetableName,
    price: opts.price,
    quantityKg: opts.quantityKg,
    delivery: opts.delivery,
    message: opts.message ?? "",
    status: "Accepted",
  });
  opts.application.status = "Accepted";
  await opts.application.save();

  opts.request.remainingKg -= opts.quantityKg;
  if (opts.request.remainingKg <= 0) {
    opts.request.remainingKg = 0;
    opts.request.status = "Closed";
  }
  await opts.request.save();

  const sale = await Sale.create({
    farmerId: opts.farmer._id,
    traderId: opts.trader._id,
    farmerName: opts.farmer.name,
    traderName: opts.trader.name,
    vegetableId: opts.request.vegetableId,
    vegetableName: opts.request.vegetableName,
    quantityKg: opts.quantityKg,
    unitPrice: opts.price,
    total: opts.price * opts.quantityKg,
    delivery: opts.delivery,
    sourceOfferId: offer._id,
    requestId: opts.request._id,
    status: opts.status,
    date: opts.date,
  });

  await SystemLog.create({
    type: "Transaction",
    message: `Sale ${opts.status.toLowerCase()} (${opts.request.vegetableName}, ${opts.quantityKg} kg)`,
    user: opts.trader.email,
  });

  await notify(
    opts.trader._id,
    "Accepted Offers",
    "Offer accepted",
    `${opts.farmer.name} accepted your offer for ${opts.request.vegetableName} (${opts.quantityKg} kg).`,
    opts.status === "Completed"
  );
  if (opts.status === "Completed") {
    await notify(
      opts.farmer._id,
      "Sales",
      "Sale completed",
      `${opts.request.vegetableName} sale (${opts.quantityKg} kg) was marked completed.`
    );
  }
  return sale;
}

async function seedStallsAndRules(traders: Record<TraderKey, UserDocument>) {
  const stalls: {
    key: TraderKey;
    location: string;
    license: string;
    status: "Active" | "Pending";
  }[] = [
    { key: "nuwan", location: "Block A, Stall 12", license: "KM-2026-0101", status: "Active" },
    { key: "kamal", location: "Block B, Stall 04", license: "KM-2026-0102", status: "Active" },
    { key: "sunil", location: "Block C, Stall 09", license: "KM-2026-0103", status: "Active" },
    { key: "supun", location: "Block D, Stall 21", license: "KM-2026-0104", status: "Active" },
    { key: "susantha", location: "Block E, Stall 03", license: "KM-2026-0105", status: "Pending" },
  ];
  for (const stall of stalls) {
    const trader = traders[stall.key];
    await Stall.create({
      traderId: trader._id,
      traderName: trader.name,
      name: `${trader.name}'s Stall`,
      location: stall.location,
      license: stall.license,
      contact: trader.phone,
      status: stall.status,
    });
  }

  const rules: { key: TraderKey; tokenThreshold: number; discountPercent: number; isActive: boolean }[] =
    [
      { key: "nuwan", tokenThreshold: 3, discountPercent: 5, isActive: true },
      { key: "kamal", tokenThreshold: 5, discountPercent: 8, isActive: true },
      { key: "sunil", tokenThreshold: 3, discountPercent: 5, isActive: true },
      { key: "supun", tokenThreshold: 4, discountPercent: 10, isActive: true },
      { key: "susantha", tokenThreshold: 3, discountPercent: 5, isActive: false },
    ];
  for (const rule of rules) {
    await LoyaltyRule.create({
      traderId: traders[rule.key]._id,
      tokenThreshold: rule.tokenThreshold,
      discountPercent: rule.discountPercent,
      isActive: rule.isActive,
    });
  }
  console.log("Stalls: 4 Active + 1 Pending. Loyalty rules saved.");
}

async function seedMarketplace(opts: {
  traders: Record<TraderKey, UserDocument>;
  farmers: Record<FarmerKey, UserDocument>;
  veg: VegMap;
}): Promise<HarvestDocument> {
  const { traders, farmers, veg } = opts;
  const soon = atDays(2);
  const later = atDays(4);

  // --- Bandu (Nuwan) ---
  const banduCarrot = await createHarvest({
    farmer: farmers.bandu,
    veg: veg.Carrot,
    quantityKg: 400,
  });
  await createHarvestOffer({
    harvest: banduCarrot,
    trader: traders.nuwan,
    price: 198,
    quantityKg: 200,
    delivery: soon,
    status: "Pending",
    message: "Need Grade A carrots for stall restock",
  });
  await notify(
    farmers.bandu._id,
    "Offers",
    "New offer on Carrot",
    `${traders.nuwan.name} offered Rs.198/kg for 200kg.`
  );

  const banduLeeks = await createHarvest({
    farmer: farmers.bandu,
    veg: veg.Leeks,
    quantityKg: 180,
  });
  await recordHarvestSale({
    harvest: banduLeeks,
    trader: traders.nuwan,
    price: 238,
    quantityKg: 130,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const banduBeans = await createHarvest({
    farmer: farmers.bandu,
    veg: veg.Beans,
    quantityKg: 120,
    harvestOffset: -8,
    deliveryOffset: -5,
    availableOffset: -4,
  });
  await recordHarvestSale({
    harvest: banduBeans,
    trader: traders.nuwan,
    price: 295,
    quantityKg: 120,
    delivery: atDays(-2),
    date: atDays(0, 8),
    status: "Completed",
  });

  const banduPotato = await createHarvest({
    farmer: farmers.bandu,
    veg: veg.Potato,
    quantityKg: 100,
    harvestOffset: -12,
    deliveryOffset: -9,
    availableOffset: -8,
  });
  await recordHarvestSale({
    harvest: banduPotato,
    trader: traders.nuwan,
    price: 128,
    quantityKg: 100,
    delivery: atDays(-9),
    date: atDays(-8),
    status: "Completed",
  });

  const banduCabbage = await createHarvest({
    farmer: farmers.bandu,
    veg: veg.Cabbage,
    quantityKg: 300,
    status: "Closed",
    harvestOffset: -6,
    availableOffset: 3,
  });
  await createHarvestOffer({
    harvest: banduCabbage,
    trader: traders.kamal,
    price: 90,
    quantityKg: 100,
    delivery: soon,
    status: "Cancelled",
  });
  await notify(
    traders.kamal._id,
    "Offers",
    "Harvest listing closed",
    `${farmers.bandu.name} closed the Cabbage harvest listing.`,
    true
  );

  // --- Jaliya (Nuwan) ---
  const jaliyaPotato = await createHarvest({
    farmer: farmers.jaliya,
    veg: veg.Potato,
    quantityKg: 250,
  });
  await createHarvestOffer({
    harvest: jaliyaPotato,
    trader: traders.nuwan,
    price: 130,
    quantityKg: 100,
    delivery: soon,
    status: "Pending",
    message: "Can collect from the market gate",
  });
  await notify(
    farmers.jaliya._id,
    "Offers",
    "New offer on Potato",
    `${traders.nuwan.name} offered Rs.130/kg for 100kg.`
  );

  const jaliyaCarrot = await createHarvest({
    farmer: farmers.jaliya,
    veg: veg.Carrot,
    quantityKg: 200,
  });

  const jaliyaTomato = await createHarvest({
    farmer: farmers.jaliya,
    veg: veg.Tomato,
    quantityKg: 180,
    harvestOffset: -6,
    deliveryOffset: -3,
    availableOffset: -2,
  });
  await recordHarvestSale({
    harvest: jaliyaTomato,
    trader: traders.nuwan,
    price: 162,
    quantityKg: 180,
    delivery: atDays(-3),
    date: atDays(-1, 9),
    status: "Completed",
  });

  const jaliyaCabbage = await createHarvest({
    farmer: farmers.jaliya,
    veg: veg.Cabbage,
    quantityKg: 200,
    harvestOffset: -14,
    deliveryOffset: -11,
    availableOffset: -10,
  });
  await recordHarvestSale({
    harvest: jaliyaCabbage,
    trader: traders.nuwan,
    price: 90,
    quantityKg: 200,
    delivery: atDays(-11),
    date: atDays(-10),
    status: "Completed",
  });

  const jaliyaBeans = await createHarvest({
    farmer: farmers.jaliya,
    veg: veg.Beans,
    quantityKg: 150,
    status: "Closed",
    harvestOffset: -5,
  });
  await createHarvestOffer({
    harvest: jaliyaBeans,
    trader: traders.kamal,
    price: 300,
    quantityKg: 80,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Thushara (Kamal) ---
  const thusharaTomato = await createHarvest({
    farmer: farmers.thushara,
    veg: veg.Tomato,
    quantityKg: 300,
  });
  await createHarvestOffer({
    harvest: thusharaTomato,
    trader: traders.kamal,
    price: 165,
    quantityKg: 150,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.thushara._id,
    "Offers",
    "New offer on Tomato",
    `${traders.kamal.name} offered Rs.165/kg for 150kg.`
  );

  const thusharaCapsicum = await createHarvest({
    farmer: farmers.thushara,
    veg: veg.Capsicum,
    quantityKg: 140,
  });
  await recordHarvestSale({
    harvest: thusharaCapsicum,
    trader: traders.kamal,
    price: 368,
    quantityKg: 80,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const thusharaLeeks = await createHarvest({
    farmer: farmers.thushara,
    veg: veg.Leeks,
    quantityKg: 90,
    harvestOffset: -4,
    deliveryOffset: -1,
    availableOffset: 0,
  });
  await recordHarvestSale({
    harvest: thusharaLeeks,
    trader: traders.kamal,
    price: 232,
    quantityKg: 90,
    delivery: atDays(-1),
    date: atDays(0, 7),
    status: "Completed",
  });

  const thusharaBeet = await createHarvest({
    farmer: farmers.thushara,
    veg: veg.Beetroot,
    quantityKg: 70,
    harvestOffset: -11,
    deliveryOffset: -8,
    availableOffset: -7,
  });
  await recordHarvestSale({
    harvest: thusharaBeet,
    trader: traders.kamal,
    price: 170,
    quantityKg: 70,
    delivery: atDays(-8),
    date: atDays(-7),
    status: "Completed",
  });

  const thusharaCarrot = await createHarvest({
    farmer: farmers.thushara,
    veg: veg.Carrot,
    quantityKg: 200,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: thusharaCarrot,
    trader: traders.sunil,
    price: 194,
    quantityKg: 80,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Sumeda (Kamal) ---
  const sumedaBeans = await createHarvest({
    farmer: farmers.sumeda,
    veg: veg.Beans,
    quantityKg: 220,
  });
  await createHarvestOffer({
    harvest: sumedaBeans,
    trader: traders.kamal,
    price: 298,
    quantityKg: 100,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.sumeda._id,
    "Offers",
    "New offer on Beans",
    `${traders.kamal.name} offered Rs.298/kg for 100kg.`
  );

  const sumedaCabbage = await createHarvest({
    farmer: farmers.sumeda,
    veg: veg.Cabbage,
    quantityKg: 160,
  });
  await recordHarvestSale({
    harvest: sumedaCabbage,
    trader: traders.kamal,
    price: 88,
    quantityKg: 70,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const sumedaCapsicum = await createHarvest({
    farmer: farmers.sumeda,
    veg: veg.Capsicum,
    quantityKg: 60,
    harvestOffset: -9,
    deliveryOffset: -6,
    availableOffset: -5,
  });
  await recordHarvestSale({
    harvest: sumedaCapsicum,
    trader: traders.kamal,
    price: 370,
    quantityKg: 60,
    delivery: atDays(-6),
    date: atDays(-5),
    status: "Completed",
  });

  const sumedaPotato = await createHarvest({
    farmer: farmers.sumeda,
    veg: veg.Potato,
    quantityKg: 90,
    harvestOffset: -16,
    deliveryOffset: -13,
    availableOffset: -12,
  });
  await recordHarvestSale({
    harvest: sumedaPotato,
    trader: traders.kamal,
    price: 126,
    quantityKg: 90,
    delivery: atDays(-13),
    date: atDays(-12),
    status: "Completed",
  });

  const sumedaLeeks = await createHarvest({
    farmer: farmers.sumeda,
    veg: veg.Leeks,
    quantityKg: 100,
    status: "Cancelled",
  });
  await createHarvestOffer({
    harvest: sumedaLeeks,
    trader: traders.nuwan,
    price: 230,
    quantityKg: 40,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Karunarathna (Sunil) ---
  const karuTomato = await createHarvest({
    farmer: farmers.karunarathna,
    veg: veg.Tomato,
    quantityKg: 280,
  });
  await createHarvestOffer({
    harvest: karuTomato,
    trader: traders.sunil,
    price: 160,
    quantityKg: 120,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.karunarathna._id,
    "Offers",
    "New offer on Tomato",
    `${traders.sunil.name} offered Rs.160/kg for 120kg.`
  );

  const karuPotato = await createHarvest({
    farmer: farmers.karunarathna,
    veg: veg.Potato,
    quantityKg: 150,
  });
  await recordHarvestSale({
    harvest: karuPotato,
    trader: traders.sunil,
    price: 128,
    quantityKg: 80,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const karuCarrot = await createHarvest({
    farmer: farmers.karunarathna,
    veg: veg.Carrot,
    quantityKg: 100,
    harvestOffset: -10,
    deliveryOffset: -7,
    availableOffset: -6,
  });
  await recordHarvestSale({
    harvest: karuCarrot,
    trader: traders.sunil,
    price: 196,
    quantityKg: 100,
    delivery: atDays(-7),
    date: atDays(-6),
    status: "Completed",
  });

  const karuBeans = await createHarvest({
    farmer: farmers.karunarathna,
    veg: veg.Beans,
    quantityKg: 80,
    harvestOffset: -18,
    deliveryOffset: -15,
    availableOffset: -14,
  });
  await recordHarvestSale({
    harvest: karuBeans,
    trader: traders.sunil,
    price: 300,
    quantityKg: 80,
    delivery: atDays(-15),
    date: atDays(-14),
    status: "Completed",
  });

  const karuCapsicum = await createHarvest({
    farmer: farmers.karunarathna,
    veg: veg.Capsicum,
    quantityKg: 90,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: karuCapsicum,
    trader: traders.supun,
    price: 360,
    quantityKg: 40,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Sirisena (Sunil) ---
  const siriBeet = await createHarvest({
    farmer: farmers.sirisena,
    veg: veg.Beetroot,
    quantityKg: 200,
  });
  await createHarvestOffer({
    harvest: siriBeet,
    trader: traders.sunil,
    price: 172,
    quantityKg: 80,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.sirisena._id,
    "Offers",
    "New offer on Beetroot",
    `${traders.sunil.name} offered Rs.172/kg for 80kg.`
  );

  const siriCabbage = await createHarvest({
    farmer: farmers.sirisena,
    veg: veg.Cabbage,
    quantityKg: 180,
  });
  await recordHarvestSale({
    harvest: siriCabbage,
    trader: traders.sunil,
    price: 88,
    quantityKg: 80,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const siriPotato = await createHarvest({
    farmer: farmers.sirisena,
    veg: veg.Potato,
    quantityKg: 50,
    harvestOffset: -13,
    deliveryOffset: -10,
    availableOffset: -9,
  });
  await recordHarvestSale({
    harvest: siriPotato,
    trader: traders.sunil,
    price: 125,
    quantityKg: 50,
    delivery: atDays(-10),
    date: atDays(-9),
    status: "Completed",
  });

  const siriLeeks = await createHarvest({
    farmer: farmers.sirisena,
    veg: veg.Leeks,
    quantityKg: 120,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: siriLeeks,
    trader: traders.kamal,
    price: 228,
    quantityKg: 50,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Agith (Supun) ---
  const agithCarrot = await createHarvest({
    farmer: farmers.agith,
    veg: veg.Carrot,
    quantityKg: 260,
  });
  await createHarvestOffer({
    harvest: agithCarrot,
    trader: traders.supun,
    price: 197,
    quantityKg: 100,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.agith._id,
    "Offers",
    "New offer on Carrot",
    `${traders.supun.name} offered Rs.197/kg for 100kg.`
  );

  const agithBeans = await createHarvest({
    farmer: farmers.agith,
    veg: veg.Beans,
    quantityKg: 140,
  });
  await recordHarvestSale({
    harvest: agithBeans,
    trader: traders.supun,
    price: 292,
    quantityKg: 90,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const agithTomato = await createHarvest({
    farmer: farmers.agith,
    veg: veg.Tomato,
    quantityKg: 90,
    harvestOffset: -7,
    deliveryOffset: -4,
    availableOffset: -3,
  });
  await recordHarvestSale({
    harvest: agithTomato,
    trader: traders.supun,
    price: 158,
    quantityKg: 90,
    delivery: atDays(-4),
    date: atDays(-3),
    status: "Completed",
  });

  const agithLeeks = await createHarvest({
    farmer: farmers.agith,
    veg: veg.Leeks,
    quantityKg: 70,
    harvestOffset: -15,
    deliveryOffset: -12,
    availableOffset: -11,
  });
  await recordHarvestSale({
    harvest: agithLeeks,
    trader: traders.supun,
    price: 235,
    quantityKg: 70,
    delivery: atDays(-12),
    date: atDays(-11),
    status: "Completed",
  });

  const agithPotato = await createHarvest({
    farmer: farmers.agith,
    veg: veg.Potato,
    quantityKg: 110,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: agithPotato,
    trader: traders.susantha,
    price: 124,
    quantityKg: 40,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Shantha (Supun) ---
  const shanthaTomato = await createHarvest({
    farmer: farmers.shantha,
    veg: veg.Tomato,
    quantityKg: 240,
  });
  await createHarvestOffer({
    harvest: shanthaTomato,
    trader: traders.supun,
    price: 168,
    quantityKg: 90,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.shantha._id,
    "Offers",
    "New offer on Tomato",
    `${traders.supun.name} offered Rs.168/kg for 90kg.`
  );

  const shanthaCarrot = await createHarvest({
    farmer: farmers.shantha,
    veg: veg.Carrot,
    quantityKg: 160,
  });
  await recordHarvestSale({
    harvest: shanthaCarrot,
    trader: traders.supun,
    price: 195,
    quantityKg: 80,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const shanthaCapsicum = await createHarvest({
    farmer: farmers.shantha,
    veg: veg.Capsicum,
    quantityKg: 100,
    harvestOffset: -8,
    deliveryOffset: -5,
    availableOffset: -4,
  });
  await recordHarvestSale({
    harvest: shanthaCapsicum,
    trader: traders.supun,
    price: 365,
    quantityKg: 100,
    delivery: atDays(-5),
    date: atDays(-4),
    status: "Completed",
  });

  const shanthaBeet = await createHarvest({
    farmer: farmers.shantha,
    veg: veg.Beetroot,
    quantityKg: 80,
    harvestOffset: -17,
    deliveryOffset: -14,
    availableOffset: -13,
  });
  await recordHarvestSale({
    harvest: shanthaBeet,
    trader: traders.supun,
    price: 168,
    quantityKg: 80,
    delivery: atDays(-14),
    date: atDays(-13),
    status: "Completed",
  });

  const shanthaCabbage = await createHarvest({
    farmer: farmers.shantha,
    veg: veg.Cabbage,
    quantityKg: 90,
    harvestOffset: -21,
    deliveryOffset: -18,
    availableOffset: -17,
  });
  await recordHarvestSale({
    harvest: shanthaCabbage,
    trader: traders.supun,
    price: 86,
    quantityKg: 90,
    delivery: atDays(-18),
    date: atDays(-17),
    status: "Completed",
  });

  const shanthaBeans = await createHarvest({
    farmer: farmers.shantha,
    veg: veg.Beans,
    quantityKg: 100,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: shanthaBeans,
    trader: traders.nuwan,
    price: 290,
    quantityKg: 40,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Premarathna (Susantha) ---
  const premaLeeks = await createHarvest({
    farmer: farmers.premarathna,
    veg: veg.Leeks,
    quantityKg: 200,
  });
  await createHarvestOffer({
    harvest: premaLeeks,
    trader: traders.susantha,
    price: 234,
    quantityKg: 80,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.premarathna._id,
    "Offers",
    "New offer on Leeks",
    `${traders.susantha.name} offered Rs.234/kg for 80kg.`
  );

  const premaCapsicum = await createHarvest({
    farmer: farmers.premarathna,
    veg: veg.Capsicum,
    quantityKg: 150,
  });
  await recordHarvestSale({
    harvest: premaCapsicum,
    trader: traders.susantha,
    price: 372,
    quantityKg: 80,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const premaBeans = await createHarvest({
    farmer: farmers.premarathna,
    veg: veg.Beans,
    quantityKg: 130,
    harvestOffset: -9,
    deliveryOffset: -6,
    availableOffset: -5,
  });
  await recordHarvestSale({
    harvest: premaBeans,
    trader: traders.susantha,
    price: 288,
    quantityKg: 130,
    delivery: atDays(-6),
    date: atDays(-5),
    status: "Completed",
  });

  const premaPotato = await createHarvest({
    farmer: farmers.premarathna,
    veg: veg.Potato,
    quantityKg: 90,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: premaPotato,
    trader: traders.supun,
    price: 122,
    quantityKg: 30,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Kumara (Susantha) ---
  const kumaraBeet = await createHarvest({
    farmer: farmers.kumara,
    veg: veg.Beetroot,
    quantityKg: 180,
  });
  await createHarvestOffer({
    harvest: kumaraBeet,
    trader: traders.susantha,
    price: 175,
    quantityKg: 70,
    delivery: soon,
    status: "Pending",
  });
  await notify(
    farmers.kumara._id,
    "Offers",
    "New offer on Beetroot",
    `${traders.susantha.name} offered Rs.175/kg for 70kg.`
  );

  const kumaraTomato = await createHarvest({
    farmer: farmers.kumara,
    veg: veg.Tomato,
    quantityKg: 140,
  });
  await recordHarvestSale({
    harvest: kumaraTomato,
    trader: traders.susantha,
    price: 164,
    quantityKg: 80,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const kumaraCarrot = await createHarvest({
    farmer: farmers.kumara,
    veg: veg.Carrot,
    quantityKg: 80,
    harvestOffset: -12,
    deliveryOffset: -9,
    availableOffset: -8,
  });
  await recordHarvestSale({
    harvest: kumaraCarrot,
    trader: traders.susantha,
    price: 192,
    quantityKg: 80,
    delivery: atDays(-9),
    date: atDays(-8),
    status: "Completed",
  });

  const kumaraCabbage = await createHarvest({
    farmer: farmers.kumara,
    veg: veg.Cabbage,
    quantityKg: 100,
    status: "Closed",
  });
  await createHarvestOffer({
    harvest: kumaraCabbage,
    trader: traders.sunil,
    price: 84,
    quantityKg: 40,
    delivery: soon,
    status: "Cancelled",
  });

  // --- Buying requests ---
  const nuwanCarrotReq = await createRequest({
    trader: traders.nuwan,
    veg: veg.Carrot,
    quantityKg: 500,
    minPrice: 190,
    maxPrice: 198,
    notes: "Need Grade A carrots for stall restock.",
  });
  await createApplication({
    request: nuwanCarrotReq,
    farmer: farmers.bandu,
    quantityKg: 400,
    status: "Pending",
  });
  const jaliyaCarrotApp = await createApplication({
    request: nuwanCarrotReq,
    farmer: farmers.jaliya,
    quantityKg: 200,
    status: "Offered",
  });
  await Offer.create({
    source: "application",
    applicationId: jaliyaCarrotApp._id,
    requestId: nuwanCarrotReq._id,
    farmerId: farmers.jaliya._id,
    traderId: traders.nuwan._id,
    traderName: traders.nuwan.name,
    farmerName: farmers.jaliya.name,
    vegetableName: veg.Carrot.name,
    price: 196,
    quantityKg: 200,
    delivery: later,
    message: "Happy to take 200 kg at stall price",
    status: "Pending",
  });
  await notify(
    farmers.jaliya._id,
    "Offers",
    `Offer from ${traders.nuwan.name}`,
    `${traders.nuwan.name} offered Rs.196/kg for 200kg of Carrot.`
  );

  const nuwanTomatoReq = await createRequest({
    trader: traders.nuwan,
    veg: veg.Tomato,
    quantityKg: 300,
    minPrice: 155,
    maxPrice: 168,
    notes: "Looking for ripe tomatoes this week.",
  });
  const jaliyaTomatoApp = await createApplication({
    request: nuwanTomatoReq,
    farmer: farmers.jaliya,
    quantityKg: 180,
    status: "Accepted",
    harvestOffset: -6,
  });
  await recordRequestSale({
    request: nuwanTomatoReq,
    application: jaliyaTomatoApp,
    farmer: farmers.jaliya,
    trader: traders.nuwan,
    price: 162,
    quantityKg: 180,
    delivery: atDays(-3),
    date: atDays(-4),
    status: "Completed",
  });

  const nuwanBeansReq = await createRequest({
    trader: traders.nuwan,
    veg: veg.Beans,
    quantityKg: 150,
    minPrice: 285,
    maxPrice: 305,
    pickupOffset: -4,
    closingOffset: -3,
    notes: "Filled beans order.",
    status: "Closed",
  });
  const banduBeansApp = await createApplication({
    request: nuwanBeansReq,
    farmer: farmers.bandu,
    quantityKg: 150,
    status: "Accepted",
    harvestOffset: -8,
  });
  await recordRequestSale({
    request: nuwanBeansReq,
    application: banduBeansApp,
    farmer: farmers.bandu,
    trader: traders.nuwan,
    price: 300,
    quantityKg: 150,
    delivery: atDays(-3),
    date: atDays(-3),
    status: "Completed",
  });

  const nuwanLeeksReq = await createRequest({
    trader: traders.nuwan,
    veg: veg.Leeks,
    quantityKg: 200,
    minPrice: 220,
    maxPrice: 240,
    notes: "Cancelled — found stock from another yard.",
    status: "Cancelled",
    closingOffset: -1,
  });
  await createApplication({
    request: nuwanLeeksReq,
    farmer: farmers.sumeda,
    quantityKg: 80,
    status: "Cancelled",
  });
  await notify(
    farmers.sumeda._id,
    "Applications",
    "Buying request closed",
    `${traders.nuwan.name} closed the Leeks request.`,
    true
  );

  const kamalCabbageReq = await createRequest({
    trader: traders.kamal,
    veg: veg.Cabbage,
    quantityKg: 400,
    minPrice: 80,
    maxPrice: 92,
    notes: "Daily leafy restock.",
  });
  await createApplication({
    request: kamalCabbageReq,
    farmer: farmers.thushara,
    quantityKg: 200,
    status: "Pending",
  });
  const banduCabbageApp = await createApplication({
    request: kamalCabbageReq,
    farmer: farmers.bandu,
    quantityKg: 150,
    status: "Offered",
  });
  await Offer.create({
    source: "application",
    applicationId: banduCabbageApp._id,
    requestId: kamalCabbageReq._id,
    farmerId: farmers.bandu._id,
    traderId: traders.kamal._id,
    traderName: traders.kamal.name,
    farmerName: farmers.bandu.name,
    vegetableName: veg.Cabbage.name,
    price: 88,
    quantityKg: 150,
    delivery: later,
    message: "",
    status: "Pending",
  });
  await notify(
    farmers.bandu._id,
    "Offers",
    `Offer from ${traders.kamal.name}`,
    `${traders.kamal.name} offered Rs.88/kg for 150kg of Cabbage.`
  );

  const kamalPotatoReq = await createRequest({
    trader: traders.kamal,
    veg: veg.Potato,
    quantityKg: 250,
    minPrice: 120,
    maxPrice: 132,
    notes: "Partial fill in progress.",
  });
  const sumedaPotatoApp = await createApplication({
    request: kamalPotatoReq,
    farmer: farmers.sumeda,
    quantityKg: 150,
    status: "Accepted",
  });
  await recordRequestSale({
    request: kamalPotatoReq,
    application: sumedaPotatoApp,
    farmer: farmers.sumeda,
    trader: traders.kamal,
    price: 128,
    quantityKg: 150,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const kamalBeetReq = await createRequest({
    trader: traders.kamal,
    veg: veg.Beetroot,
    quantityKg: 80,
    minPrice: 160,
    maxPrice: 175,
    pickupOffset: -8,
    closingOffset: -6,
    notes: "Filled beetroot order.",
    status: "Closed",
  });
  const thusharaBeetApp = await createApplication({
    request: kamalBeetReq,
    farmer: farmers.thushara,
    quantityKg: 80,
    status: "Accepted",
    harvestOffset: -11,
  });
  await recordRequestSale({
    request: kamalBeetReq,
    application: thusharaBeetApp,
    farmer: farmers.thushara,
    trader: traders.kamal,
    price: 170,
    quantityKg: 80,
    delivery: atDays(-7),
    date: atDays(-6),
    status: "Completed",
  });

  const kamalCapsicumReq = await createRequest({
    trader: traders.kamal,
    veg: veg.Capsicum,
    quantityKg: 100,
    minPrice: 350,
    maxPrice: 380,
    notes: "Cancelled after quality check.",
    status: "Cancelled",
  });
  await createApplication({
    request: kamalCapsicumReq,
    farmer: farmers.jaliya,
    quantityKg: 40,
    status: "Cancelled",
  });

  const sunilBeansReq = await createRequest({
    trader: traders.sunil,
    veg: veg.Beans,
    quantityKg: 350,
    minPrice: 285,
    maxPrice: 305,
    notes: "Need beans for Colombo lorries.",
  });
  await createApplication({
    request: sunilBeansReq,
    farmer: farmers.karunarathna,
    quantityKg: 180,
    status: "Pending",
  });
  const siriBeansApp = await createApplication({
    request: sunilBeansReq,
    farmer: farmers.sirisena,
    quantityKg: 120,
    status: "Offered",
  });
  await Offer.create({
    source: "application",
    applicationId: siriBeansApp._id,
    requestId: sunilBeansReq._id,
    farmerId: farmers.sirisena._id,
    traderId: traders.sunil._id,
    traderName: traders.sunil.name,
    farmerName: farmers.sirisena.name,
    vegetableName: veg.Beans.name,
    price: 298,
    quantityKg: 120,
    delivery: later,
    message: "",
    status: "Pending",
  });
  await notify(
    farmers.sirisena._id,
    "Offers",
    `Offer from ${traders.sunil.name}`,
    `${traders.sunil.name} offered Rs.298/kg for 120kg of Beans.`
  );

  const sunilCarrotReq = await createRequest({
    trader: traders.sunil,
    veg: veg.Carrot,
    quantityKg: 200,
    minPrice: 190,
    maxPrice: 198,
    notes: "Partial carrot fill.",
  });
  const karuCarrotApp = await createApplication({
    request: sunilCarrotReq,
    farmer: farmers.karunarathna,
    quantityKg: 120,
    status: "Accepted",
  });
  await recordRequestSale({
    request: sunilCarrotReq,
    application: karuCarrotApp,
    farmer: farmers.karunarathna,
    trader: traders.sunil,
    price: 196,
    quantityKg: 120,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const sunilCabbageReq = await createRequest({
    trader: traders.sunil,
    veg: veg.Cabbage,
    quantityKg: 120,
    minPrice: 82,
    maxPrice: 92,
    pickupOffset: -10,
    closingOffset: -8,
    notes: "Filled cabbage order.",
    status: "Closed",
  });
  const karuCabbageApp = await createApplication({
    request: sunilCabbageReq,
    farmer: farmers.karunarathna,
    quantityKg: 120,
    status: "Accepted",
    harvestOffset: -12,
  });
  await recordRequestSale({
    request: sunilCabbageReq,
    application: karuCabbageApp,
    farmer: farmers.karunarathna,
    trader: traders.sunil,
    price: 88,
    quantityKg: 120,
    delivery: atDays(-8),
    date: atDays(-8),
    status: "Completed",
  });

  const sunilLeeksReq = await createRequest({
    trader: traders.sunil,
    veg: veg.Leeks,
    quantityKg: 90,
    minPrice: 220,
    maxPrice: 238,
    notes: "Cancelled — rain delayed pickup.",
    status: "Cancelled",
  });
  await createApplication({
    request: sunilLeeksReq,
    farmer: farmers.agith,
    quantityKg: 40,
    status: "Cancelled",
  });

  const supunTomatoReq = await createRequest({
    trader: traders.supun,
    veg: veg.Tomato,
    quantityKg: 280,
    minPrice: 150,
    maxPrice: 170,
    notes: "Ripe tomatoes for retail packs.",
  });
  await createApplication({
    request: supunTomatoReq,
    farmer: farmers.agith,
    quantityKg: 100,
    status: "Pending",
  });
  const shanthaTomatoApp = await createApplication({
    request: supunTomatoReq,
    farmer: farmers.shantha,
    quantityKg: 90,
    status: "Offered",
  });
  await Offer.create({
    source: "application",
    applicationId: shanthaTomatoApp._id,
    requestId: supunTomatoReq._id,
    farmerId: farmers.shantha._id,
    traderId: traders.supun._id,
    traderName: traders.supun.name,
    farmerName: farmers.shantha.name,
    vegetableName: veg.Tomato.name,
    price: 164,
    quantityKg: 90,
    delivery: later,
    message: "",
    status: "Pending",
  });
  await notify(
    farmers.shantha._id,
    "Offers",
    `Offer from ${traders.supun.name}`,
    `${traders.supun.name} offered Rs.164/kg for 90kg of Tomato.`
  );

  const supunLeeksReq = await createRequest({
    trader: traders.supun,
    veg: veg.Leeks,
    quantityKg: 160,
    minPrice: 225,
    maxPrice: 240,
    notes: "Partial leeks fill.",
  });
  const agithLeeksApp = await createApplication({
    request: supunLeeksReq,
    farmer: farmers.agith,
    quantityKg: 90,
    status: "Accepted",
  });
  await recordRequestSale({
    request: supunLeeksReq,
    application: agithLeeksApp,
    farmer: farmers.agith,
    trader: traders.supun,
    price: 232,
    quantityKg: 90,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const supunPotatoReq = await createRequest({
    trader: traders.supun,
    veg: veg.Potato,
    quantityKg: 110,
    minPrice: 120,
    maxPrice: 132,
    pickupOffset: -15,
    closingOffset: -13,
    notes: "Filled potato order.",
    status: "Closed",
  });
  const shanthaPotatoApp = await createApplication({
    request: supunPotatoReq,
    farmer: farmers.shantha,
    quantityKg: 110,
    status: "Accepted",
    harvestOffset: -16,
  });
  await recordRequestSale({
    request: supunPotatoReq,
    application: shanthaPotatoApp,
    farmer: farmers.shantha,
    trader: traders.supun,
    price: 128,
    quantityKg: 110,
    delivery: atDays(-13),
    date: atDays(-12),
    status: "Completed",
  });

  const supunCapsicumReq = await createRequest({
    trader: traders.supun,
    veg: veg.Capsicum,
    quantityKg: 70,
    minPrice: 350,
    maxPrice: 375,
    notes: "Cancelled — buyer withdrew.",
    status: "Cancelled",
  });
  await createApplication({
    request: supunCapsicumReq,
    farmer: farmers.bandu,
    quantityKg: 30,
    status: "Cancelled",
  });

  const susanthaBeansReq = await createRequest({
    trader: traders.susantha,
    veg: veg.Beans,
    quantityKg: 220,
    minPrice: 280,
    maxPrice: 300,
    notes: "Beans for Nuwara Eliya run.",
  });
  await createApplication({
    request: susanthaBeansReq,
    farmer: farmers.premarathna,
    quantityKg: 100,
    status: "Pending",
  });
  const kumaraBeansApp = await createApplication({
    request: susanthaBeansReq,
    farmer: farmers.kumara,
    quantityKg: 80,
    status: "Offered",
  });
  await Offer.create({
    source: "application",
    applicationId: kumaraBeansApp._id,
    requestId: susanthaBeansReq._id,
    farmerId: farmers.kumara._id,
    traderId: traders.susantha._id,
    traderName: traders.susantha.name,
    farmerName: farmers.kumara.name,
    vegetableName: veg.Beans.name,
    price: 290,
    quantityKg: 80,
    delivery: later,
    message: "",
    status: "Pending",
  });
  await notify(
    farmers.kumara._id,
    "Offers",
    `Offer from ${traders.susantha.name}`,
    `${traders.susantha.name} offered Rs.290/kg for 80kg of Beans.`
  );

  const susanthaCarrotReq = await createRequest({
    trader: traders.susantha,
    veg: veg.Carrot,
    quantityKg: 180,
    minPrice: 190,
    maxPrice: 198,
    notes: "Partial carrot fill.",
  });
  const premaCarrotApp = await createApplication({
    request: susanthaCarrotReq,
    farmer: farmers.premarathna,
    quantityKg: 90,
    status: "Accepted",
  });
  await recordRequestSale({
    request: susanthaCarrotReq,
    application: premaCarrotApp,
    farmer: farmers.premarathna,
    trader: traders.susantha,
    price: 194,
    quantityKg: 90,
    delivery: soon,
    date: atDays(-1),
    status: "Accepted",
  });

  const susanthaTomatoReq = await createRequest({
    trader: traders.susantha,
    veg: veg.Tomato,
    quantityKg: 90,
    minPrice: 150,
    maxPrice: 168,
    pickupOffset: -7,
    closingOffset: -5,
    notes: "Filled tomato order.",
    status: "Closed",
  });
  const premaTomatoApp = await createApplication({
    request: susanthaTomatoReq,
    farmer: farmers.premarathna,
    quantityKg: 90,
    status: "Accepted",
    harvestOffset: -8,
  });
  await recordRequestSale({
    request: susanthaTomatoReq,
    application: premaTomatoApp,
    farmer: farmers.premarathna,
    trader: traders.susantha,
    price: 160,
    quantityKg: 90,
    delivery: atDays(-5),
    date: atDays(-5),
    status: "Completed",
  });

  const susanthaCabbageReq = await createRequest({
    trader: traders.susantha,
    veg: veg.Cabbage,
    quantityKg: 80,
    minPrice: 80,
    maxPrice: 90,
    notes: "Cancelled — stall not yet approved.",
    status: "Cancelled",
  });
  await createApplication({
    request: susanthaCabbageReq,
    farmer: farmers.kumara,
    quantityKg: 40,
    status: "Cancelled",
  });

  console.log("Marketplace harvests, requests, offers, and sales seeded.");
  return jaliyaCarrot;
}

async function seedLoyaltyTokens(): Promise<void> {
  const completed = await Sale.find({ status: "Completed" });
  let issued = 0;
  let unlocked = 0;
  for (const sale of completed) {
    const result = await issueTokenForCompletedSale(sale);
    if (result.issued) issued += 1;
    if (result.unlockedNow) unlocked += 1;
  }
  console.log(
    `Loyalty: issued tokens for ${issued}/${completed.length} completed sales; ${unlocked} reward(s) unlocked.`
  );
}

async function seedJaliyaLoyaltySale(
  harvest: HarvestDocument,
  traders: Record<TraderKey, UserDocument>,
  farmers: Record<FarmerKey, UserDocument>
): Promise<void> {
  const pricing = await applyDiscountOnAccept({
    farmerId: String(farmers.jaliya._id),
    traderId: String(traders.nuwan._id),
    unitPrice: 196,
  });
  if (!pricing.loyaltyApplied) {
    throw new Error(
      "Expected Jaliya–Nuwan loyalty reward to be unlocked before the discounted sale."
    );
  }
  await recordHarvestSale({
    harvest,
    trader: traders.nuwan,
    price: pricing.unitPrice,
    quantityKg: 80,
    delivery: atDays(2),
    date: atDays(0, 11),
    status: "Accepted",
    originalUnitPrice: pricing.originalUnitPrice,
    loyaltyDiscountPercent: pricing.loyaltyDiscountPercent,
    loyaltyApplied: true,
  });
  await notify(
    farmers.jaliya._id,
    "Sales",
    "Loyalty discount applied",
    `${pricing.loyaltyDiscountPercent}% loyalty offer applied on your Carrot sale with ${traders.nuwan.name}.`
  );
  await notify(
    traders.nuwan._id,
    "Sales",
    "Loyalty discount applied",
    `${pricing.loyaltyDiscountPercent}% loyalty offer applied for ${farmers.jaliya.name} on Carrot.`
  );
}

async function seedAnnouncements(
  farmers: Record<FarmerKey, UserDocument>,
  traders: Record<TraderKey, UserDocument>
): Promise<void> {
  await Announcement.create({
    title: "Market opens at 4:00 AM tomorrow",
    body: "Early trading window for leafy vegetables. Arrive by 3:30 AM for unloading at Lanes 1–3.",
    status: "Published",
    publishedAt: atDays(-2, 10),
  });
  await Announcement.create({
    title: "Carrot demand high this week",
    body: "Traders report strong demand for Grade A carrots. Farmers with stock should list early.",
    status: "Published",
    publishedAt: atDays(-3, 14),
  });
  await Announcement.create({
    title: "Weighbridge maintenance Sunday",
    body: "Lane 2 weighbridge closed 6–10 AM. Use Lane 1 or Lane 3.",
    status: "Draft",
  });

  const recipients = [...Object.values(farmers), ...Object.values(traders)];
  await Promise.all(
    recipients.map((user) =>
      notify(
        user._id,
        "Announcements",
        "Market opens at 4:00 AM tomorrow",
        "Early trading window for leafy vegetables. Arrive by 3:30 AM for unloading at Lanes 1–3.",
        user.role === "trader"
      )
    )
  );
  console.log("Announcements: 2 published + 1 draft.");
}

async function seedContactsAndLogs(
  traders: Record<TraderKey, UserDocument>,
  farmers: Record<FarmerKey, UserDocument>,
  admin: UserDocument
): Promise<void> {
  await ContactMessage.create({
    name: "Nimal Silva",
    email: "nimal.visitor@gmail.com",
    message: "When does the weighbridge reopen on Sunday?",
    read: false,
    createdAt: atDays(-1, 16),
  });
  await ContactMessage.create({
    name: "Kumari Jayasuriya",
    email: "kumari.visitor@gmail.com",
    message: "Please confirm leafy vegetable unloading times for Block A.",
    read: true,
    createdAt: atDays(-3, 11),
  });
  await ContactMessage.create({
    name: "Ajith Perera",
    email: "ajith.visitor@gmail.com",
    message: "Can a new trader apply for a stall in Block E this month?",
    read: false,
    createdAt: atDays(0, 8),
  });

  await SystemLog.create([
    {
      type: "Login",
      message: `Farmer ${farmers.bandu.name} signed in`,
      user: farmers.bandu.email,
    },
    {
      type: "Login",
      message: `Trader ${traders.nuwan.name} signed in`,
      user: traders.nuwan.email,
    },
    {
      type: "Login",
      message: `Admin ${admin.name} signed in`,
      user: admin.email,
    },
    {
      type: "Price Update",
      message: "Carrot average updated to Rs.196",
      user: admin.email,
    },
    {
      type: "Price Update",
      message: "Beans average updated to Rs.295",
      user: admin.email,
    },
    {
      type: "Error",
      message: "Failed to sync weighbridge Lane 2",
      user: "",
    },
  ]);
  console.log("Contact inbox: 3 messages. System logs seeded.");
}

async function seedBookmarks(
  veg: VegMap,
  farmers: Record<FarmerKey, UserDocument>,
  traders: Record<TraderKey, UserDocument>,
  admin: UserDocument
): Promise<void> {
  const farmerIds = [veg.Carrot._id, veg.Leeks._id, veg.Beans._id];
  const traderIds = [veg.Carrot._id, veg.Tomato._id];
  for (const farmer of Object.values(farmers)) {
    farmer.bookmarkedVegetableIds = farmerIds;
    await farmer.save();
  }
  for (const trader of Object.values(traders)) {
    trader.bookmarkedVegetableIds = traderIds;
    await trader.save();
  }
  admin.bookmarkedVegetableIds = [veg.Carrot._id, veg.Cabbage._id];
  await admin.save();
  console.log("Bookmarks: set on farmers, traders, and admin.");
}

async function seedLoyaltyReadyNotification(
  farmers: Record<FarmerKey, UserDocument>,
  traders: Record<TraderKey, UserDocument>
): Promise<void> {
  const banduBalance = await LoyaltyBalance.findOne({
    farmerId: farmers.bandu._id,
    traderId: traders.nuwan._id,
  });
  if (banduBalance?.rewardUnlocked) {
    await notify(
      farmers.bandu._id,
      "Sales",
      "Loyalty reward unlocked",
      `You unlocked 5% off your next deal with ${traders.nuwan.name}.`
    );
  }
  const shanthaBalance = await LoyaltyBalance.findOne({
    farmerId: farmers.shantha._id,
    traderId: traders.supun._id,
  });
  if (shanthaBalance?.rewardUnlocked) {
    await notify(
      farmers.shantha._id,
      "Sales",
      "Loyalty reward unlocked",
      `You unlocked 10% off your next deal with ${traders.supun.name}.`
    );
  }
}

async function assertIntegrity(): Promise<void> {
  const mismatches: string[] = [];
  const harvests = await Harvest.find();
  const requests = await BuyingRequest.find();
  const sales = await Sale.find({
    status: { $in: ["Accepted", "Completed"] },
  });

  for (const harvest of harvests) {
    const sold = sales
      .filter((s) => s.harvestId && String(s.harvestId) === String(harvest._id))
      .reduce((sum, s) => sum + s.quantityKg, 0);
    const expected = harvest.quantityKg - sold;
    if (harvest.remainingKg !== expected) {
      mismatches.push(
        `Harvest ${harvest.vegetableName} (${harvest.farmerName}): remaining ${harvest.remainingKg} expected ${expected}`
      );
    }
    if (harvest.remainingKg === 0 && harvest.status === "Active") {
      mismatches.push(
        `Harvest ${harvest.vegetableName} (${harvest.farmerName}) remaining 0 but Active`
      );
    }
    if (harvest.remainingKg > 0 && harvest.status === "Completed") {
      mismatches.push(
        `Harvest ${harvest.vegetableName} (${harvest.farmerName}) Completed with remaining ${harvest.remainingKg}`
      );
    }
  }

  for (const request of requests) {
    const bought = sales
      .filter((s) => s.requestId && String(s.requestId) === String(request._id))
      .reduce((sum, s) => sum + s.quantityKg, 0);
    const expected = request.quantityKg - bought;
    if (request.remainingKg !== expected) {
      mismatches.push(
        `Request ${request.vegetableName} (${request.traderName}): remaining ${request.remainingKg} expected ${expected}`
      );
    }
    if (request.remainingKg === 0 && request.status === "Active") {
      mismatches.push(
        `Request ${request.vegetableName} (${request.traderName}) remaining 0 but Active`
      );
    }
  }

  if (mismatches.length) {
    throw new Error(`Integrity checks failed:\n${mismatches.join("\n")}`);
  }

  const [harvestCount, requestCount, saleCount, offerCount, appCount] =
    await Promise.all([
      Harvest.countDocuments(),
      BuyingRequest.countDocuments(),
      Sale.countDocuments(),
      Offer.countDocuments(),
      Application.countDocuments(),
    ]);
  console.log("\nIntegrity checks passed.");
  console.log(
    `Counts: ${harvestCount} harvests, ${requestCount} requests, ${appCount} applications, ${offerCount} offers, ${saleCount} sales.`
  );
}

function printLogins(
  admin: UserDocument,
  adminCreated: boolean,
  traders: Record<TraderKey, UserDocument>,
  farmers: Record<FarmerKey, UserDocument>,
  extras: { label: string; user: UserDocument }[]
): void {
  console.log("\nDemo logins (password: Password123)");
  console.log("----------------------------------------");
  if (adminCreated) {
    console.log(`admin     ${admin.email}  (created)`);
  } else {
    console.log(`admin     ${admin.email}  (existing password unchanged)`);
  }
  for (const trader of Object.values(traders)) {
    console.log(`trader    ${trader.email.padEnd(36)} ${trader.name}`);
  }
  for (const farmer of Object.values(farmers)) {
    console.log(`farmer    ${farmer.email.padEnd(36)} ${farmer.name}`);
  }
  for (const extra of extras) {
    console.log(
      `${extra.user.role.padEnd(9)} ${extra.user.email.padEnd(36)} ${extra.user.name} [${extra.user.status}]`
    );
  }
}

async function seed(): Promise<void> {
  await connectDB();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const existingAdmins = await wipeKeepAdmins();
  const { admin, created: adminCreated } = await ensureAdmin(
    existingAdmins,
    passwordHash
  );

  const traders = {
    nuwan: await createAccount({
      name: "Nuwan",
      email: "nuwan@trader.keppetipola.lk",
      phone: "0712000001",
      role: "trader",
      address: "Block A, Keppetipola Wholesale Market",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-4),
    }),
    kamal: await createAccount({
      name: "Kamal",
      email: "kamal@trader.keppetipola.lk",
      phone: "0712000002",
      role: "trader",
      address: "Block B, Keppetipola Wholesale Market",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-3),
    }),
    sunil: await createAccount({
      name: "Sunil",
      email: "sunil@trader.keppetipola.lk",
      phone: "0712000003",
      role: "trader",
      address: "Block C, Keppetipola Wholesale Market",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-2),
    }),
    supun: await createAccount({
      name: "Supun",
      email: "supun@trader.keppetipola.lk",
      phone: "0712000004",
      role: "trader",
      address: "Block D, Keppetipola Wholesale Market",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-1),
    }),
    susantha: await createAccount({
      name: "Susantha",
      email: "susantha@trader.keppetipola.lk",
      phone: "0712000005",
      role: "trader",
      address: "Block E, Keppetipola Wholesale Market",
      status: "Active",
      passwordHash,
      joinedAt: atDays(0, 7),
    }),
  } satisfies Record<TraderKey, UserDocument>;

  const farmers = {
    bandu: await createAccount({
      name: "Bandu",
      email: "bandu@farmer.keppetipola.lk",
      phone: "0771000001",
      role: "farmer",
      address: "Keppetipola, Welimada",
      ruralServicesDivision: "Keppetipola",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-4),
    }),
    jaliya: await createAccount({
      name: "Jaliya",
      email: "jaliya@farmer.keppetipola.lk",
      phone: "0771000002",
      role: "farmer",
      address: "Ambagasdowa, Welimada",
      ruralServicesDivision: "Welimada",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-4),
    }),
    thushara: await createAccount({
      name: "Thushara",
      email: "thushara@farmer.keppetipola.lk",
      phone: "0771000003",
      role: "farmer",
      address: "Uva Paranagama",
      ruralServicesDivision: "Uva Paranagama",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-3),
    }),
    sumeda: await createAccount({
      name: "Sumeda",
      email: "sumeda@farmer.keppetipola.lk",
      phone: "0771000004",
      role: "farmer",
      address: "Silmiyapura, Keppetipola",
      ruralServicesDivision: "Keppetipola",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-3),
    }),
    karunarathna: await createAccount({
      name: "Karunarathna",
      email: "karunarathna@farmer.keppetipola.lk",
      phone: "0771000005",
      role: "farmer",
      address: "Bandarawela Road, Welimada",
      ruralServicesDivision: "Bandarawela",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-2),
    }),
    sirisena: await createAccount({
      name: "Sirisena",
      email: "sirisena@farmer.keppetipola.lk",
      phone: "0771000006",
      role: "farmer",
      address: "Dambawinna, Welimada",
      ruralServicesDivision: "Welimada",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-2),
    }),
    agith: await createAccount({
      name: "Agith",
      email: "agith@farmer.keppetipola.lk",
      phone: "0771000007",
      role: "farmer",
      address: "Haputale Road",
      ruralServicesDivision: "Haputale",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-1),
    }),
    shantha: await createAccount({
      name: "Shantha",
      email: "shantha@farmer.keppetipola.lk",
      phone: "0771000008",
      role: "farmer",
      address: "Boralanda, Keppetipola",
      ruralServicesDivision: "Keppetipola",
      status: "Active",
      passwordHash,
      joinedAt: atDays(-1),
    }),
    premarathna: await createAccount({
      name: "Premarathna",
      email: "premarathna@farmer.keppetipola.lk",
      phone: "0771000009",
      role: "farmer",
      address: "Uva Paranagama North",
      ruralServicesDivision: "Uva Paranagama",
      status: "Active",
      passwordHash,
      joinedAt: atDays(0, 6),
    }),
    kumara: await createAccount({
      name: "Kumara",
      email: "kumara@farmer.keppetipola.lk",
      phone: "0771000010",
      role: "farmer",
      address: "Welimada Town",
      ruralServicesDivision: "Welimada",
      status: "Active",
      passwordHash,
      joinedAt: atDays(0, 7),
    }),
  } satisfies Record<FarmerKey, UserDocument>;

  const extras = {
    nimal: await createAccount({
      name: "Nimal",
      email: "nimal@farmer.keppetipola.lk",
      phone: "0761000001",
      role: "farmer",
      address: "Ettampitiya",
      ruralServicesDivision: "Ettampitiya",
      status: "Pending",
      passwordHash,
      joinedAt: atDays(0, 8),
    }),
    wijesinghe: await createAccount({
      name: "Wijesinghe",
      email: "wijesinghe@trader.keppetipola.lk",
      phone: "0761000002",
      role: "trader",
      address: "Keppetipola Market Road",
      status: "Pending",
      passwordHash,
      joinedAt: atDays(0, 8),
    }),
    rohan: await createAccount({
      name: "Rohan",
      email: "rohan@farmer.keppetipola.lk",
      phone: "0761000003",
      role: "farmer",
      address: "Hali-Ela",
      ruralServicesDivision: "Hali-Ela",
      status: "Rejected",
      passwordHash,
      joinedAt: atDays(-6),
      rejectionReason: "Identity photos were unclear. Please re-apply with sharper copies.",
    }),
    dinesh: await createAccount({
      name: "Dinesh",
      email: "dinesh@trader.keppetipola.lk",
      phone: "0761000004",
      role: "trader",
      address: "Welimada Junction",
      status: "Inactive",
      passwordHash,
      joinedAt: atDays(-25),
    }),
  };

  console.log("Created 5 traders, 10 farmers, and 4 admin-queue extras.");

  const veg = await seedCatalog();
  await seedPriceSnapshots();
  await seedStallsAndRules(traders);
  const jaliyaCarrotHarvest = await seedMarketplace({ traders, farmers, veg });
  await seedLoyaltyTokens();
  await seedJaliyaLoyaltySale(jaliyaCarrotHarvest, traders, farmers);
  await seedLoyaltyReadyNotification(farmers, traders);
  await seedAnnouncements(farmers, traders);
  await seedContactsAndLogs(traders, farmers, admin);
  await seedBookmarks(veg, farmers, traders, admin);
  await assertIntegrity();
  printLogins(admin, adminCreated, traders, farmers, [
    { label: "pending farmer", user: extras.nimal },
    { label: "pending trader", user: extras.wijesinghe },
    { label: "rejected farmer", user: extras.rohan },
    { label: "inactive trader", user: extras.dinesh },
  ]);
}

async function main(): Promise<void> {
  if (!process.argv.includes("--confirm")) {
    console.error(
      "Aborted: this wipes all non-admin data. Re-run with --confirm."
    );
    process.exit(1);
  }
  try {
    await seed();
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
