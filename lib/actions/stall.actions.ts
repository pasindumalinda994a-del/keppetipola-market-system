import { Stall, type StallStatus } from "@/database/stall.model";
import { User, type UserDocument } from "@/database/user.model";
import { createNotification } from "@/lib/actions/marketplace.actions";
import { isDuplicateKeyError } from "@/lib/member-id";
import type { Stall as StallView } from "@/types";

export class StallError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "StallError";
    this.status = status;
  }
}

export type StallFields = {
  name: string;
  location: string;
  license?: string;
  contact?: string;
};

const ALLOWED_STATUSES: StallStatus[] = ["Pending", "Active", "Inactive"];

function toStallView(stall: { toJSON: () => Record<string, unknown> }): StallView {
  return stall.toJSON() as unknown as StallView;
}

function trimRequired(value: unknown, label: string): string {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new StallError(`${label} is required`);
  }
  return text;
}

function trimOptional(value: unknown): string {
  return String(value ?? "").trim();
}

function parseFields(input: StallFields): {
  name: string;
  location: string;
  license: string;
  contact: string;
} {
  return {
    name: trimRequired(input.name, "Stall name"),
    location: trimRequired(input.location, "Location"),
    license: trimOptional(input.license),
    contact: trimOptional(input.contact),
  };
}

export async function getStallForTrader(traderId: string) {
  const stall = await Stall.findOne({ traderId });
  return stall ? toStallView(stall) : null;
}

export async function getPublicTraderName(trader: UserDocument): Promise<string> {
  const stall = await Stall.findOne({
    traderId: trader._id,
    status: "Active",
  });
  const stallName = stall?.name?.trim();
  return stallName || trader.name;
}

export async function upsertTraderStall(trader: UserDocument, input: StallFields) {
  const fields = parseFields(input);
  const existing = await Stall.findOne({ traderId: trader._id });

  if (existing) {
    existing.name = fields.name;
    existing.location = fields.location;
    existing.license = fields.license;
    existing.contact = fields.contact;
    existing.traderName = trader.name;
    await existing.save();
    return toStallView(existing);
  }

  try {
    const stall = await Stall.create({
      traderId: trader._id,
      traderName: trader.name,
      ...fields,
      status: "Pending",
    });
    return toStallView(stall);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const stall = await Stall.findOne({ traderId: trader._id });
      if (stall) {
        stall.name = fields.name;
        stall.location = fields.location;
        stall.license = fields.license;
        stall.contact = fields.contact;
        stall.traderName = trader.name;
        await stall.save();
        return toStallView(stall);
      }
    }
    throw err;
  }
}

export async function listStalls() {
  const stalls = await Stall.find().sort({ createdAt: -1 });
  return stalls.map(toStallView);
}

export async function createStallForTrader(
  _admin: UserDocument,
  input: StallFields & { traderId: string }
) {
  const traderId = String(input.traderId || "").trim();
  if (!traderId) {
    throw new StallError("Trader is required");
  }

  const trader = await User.findById(traderId);
  if (!trader || trader.role !== "trader") {
    throw new StallError("Trader not found", 404);
  }

  const existing = await Stall.findOne({ traderId: trader._id });
  if (existing) {
    throw new StallError("This trader already has a stall");
  }

  const fields = parseFields(input);
  try {
    const stall = await Stall.create({
      traderId: trader._id,
      traderName: trader.name,
      ...fields,
      status: "Active",
    });
    return toStallView(stall);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new StallError("This trader already has a stall");
    }
    throw err;
  }
}

export async function updateStall(
  id: string,
  patch: Partial<StallFields> & { status?: StallStatus }
) {
  const stall = await Stall.findById(id);
  if (!stall) {
    throw new StallError("Stall not found", 404);
  }

  const previousStatus = stall.status;

  if (patch.name !== undefined) {
    stall.name = trimRequired(patch.name, "Stall name");
  }
  if (patch.location !== undefined) {
    stall.location = trimRequired(patch.location, "Location");
  }
  if (patch.license !== undefined) {
    stall.license = trimOptional(patch.license);
  }
  if (patch.contact !== undefined) {
    stall.contact = trimOptional(patch.contact);
  }

  if (patch.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(patch.status)) {
      throw new StallError("Status must be Pending, Active, or Inactive");
    }
    const from = stall.status;
    const to = patch.status;
    const allowed =
      (from === "Pending" && (to === "Active" || to === "Inactive")) ||
      (from === "Active" && to === "Inactive") ||
      (from === "Inactive" && to === "Active") ||
      from === to;
    if (!allowed) {
      throw new StallError(`Cannot change status from ${from} to ${to}`);
    }
    stall.status = to;
  }

  await stall.save();

  if (stall.status !== previousStatus) {
    if (stall.status === "Active") {
      await createNotification(
        stall.traderId,
        "System",
        "Stall approved",
        `${stall.name} is now active. Farmers will see this stall on new buying requests.`
      );
    } else if (stall.status === "Inactive") {
      await createNotification(
        stall.traderId,
        "System",
        "Stall deactivated",
        `${stall.name} is inactive. Farmers will not see it on new buying requests until it is reactivated.`
      );
    }
  }

  return toStallView(stall);
}
