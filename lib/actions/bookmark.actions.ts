import mongoose from "mongoose";
import { MarketPrice } from "@/database/market-price.model";
import { Vegetable } from "@/database/vegetable.model";
import type { UserDocument } from "@/database/user.model";
import { createNotification } from "@/lib/actions/marketplace.actions";
import { utcDateKey } from "@/lib/actions/price-history.actions";
import { MAX_BOOKMARKS } from "@/lib/bookmarks";

export class BookmarkError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BookmarkError";
    this.status = status;
  }
}

export async function setBookmarks(
  user: UserDocument,
  vegetableIds: unknown
): Promise<string[]> {
  if (!Array.isArray(vegetableIds)) {
    throw new BookmarkError("vegetableIds must be an array");
  }

  const ids = [
    ...new Set(
      vegetableIds
        .map((id) => String(id).trim())
        .filter(Boolean)
    ),
  ];

  if (ids.length > MAX_BOOKMARKS) {
    throw new BookmarkError(`You can bookmark up to ${MAX_BOOKMARKS} vegetables`);
  }

  for (const id of ids) {
    if (!mongoose.isValidObjectId(id)) {
      throw new BookmarkError("Invalid vegetable");
    }
  }

  if (ids.length > 0) {
    const count = await Vegetable.countDocuments({
      _id: { $in: ids },
      status: "Active",
    });
    if (count !== ids.length) {
      throw new BookmarkError("Vegetable not found or inactive");
    }
  }

  user.bookmarkedVegetableIds = ids.map((id) => new mongoose.Types.ObjectId(id));
  await user.save();
  return ids;
}

export async function sendPriceBookmarkDigest(user: UserDocument): Promise<void> {
  try {
    if (user.notificationPrefs?.priceBookmarks === false) return;
    const ids = user.bookmarkedVegetableIds ?? [];
    if (ids.length === 0) return;

    const today = utcDateKey();
    if (user.lastPriceDigestAt && utcDateKey(user.lastPriceDigestAt) === today) {
      return;
    }

    const prices = await MarketPrice.find({ vegetableId: { $in: ids } }).sort({
      vegetableName: 1,
    });
    if (prices.length === 0) return;

    const lines = prices
      .map((p) => `${p.vegetableName}: Rs.${p.average}/kg`)
      .join("; ");

    await createNotification(
      user._id,
      "System",
      "Daily price digest",
      lines
    );

    user.lastPriceDigestAt = new Date();
    await user.save();
  } catch (err) {
    console.error("sendPriceBookmarkDigest error:", err);
  }
}
