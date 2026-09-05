import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";
import { DEFAULT_PRODUCE_CATEGORIES } from "@/lib/produce";
import { serializeId } from "@/lib/serialize";

export const DEFAULT_OFFER_TEMPLATE =
  "{{trader}} offered Rs.{{price}}/kg for your {{vegetable}} listing.";

export type IMarketSettings = {
  vegetableCategories: string;
  opensAt: string;
  closesAt: string;
  marketName: string;
  offerTemplate: string;
};

const marketSettingsSchema = new Schema<IMarketSettings>(
  {
    vegetableCategories: {
      type: String,
      default: DEFAULT_PRODUCE_CATEGORIES,
      trim: true,
    },
    opensAt: { type: String, default: "04:00", trim: true },
    closesAt: { type: String, default: "14:00", trim: true },
    marketName: {
      type: String,
      default: "Keppetipola Market",
      trim: true,
    },
    offerTemplate: {
      type: String,
      default: DEFAULT_OFFER_TEMPLATE,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>);
      },
    },
  }
);

export type MarketSettingsDocument = HydratedDocument<IMarketSettings>;

export const MarketSettings: Model<IMarketSettings> =
  (mongoose.models.MarketSettings as Model<IMarketSettings>) ||
  mongoose.model<IMarketSettings>("MarketSettings", marketSettingsSchema);

export default MarketSettings;
