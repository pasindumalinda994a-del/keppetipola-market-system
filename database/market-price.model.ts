import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";

export type IMarketPrice = {
  vegetableId: Types.ObjectId;
  vegetableName: string;
  imageUrl: string;
  lowest: number;
  highest: number;
  average: number;
  change: number;
  lastUpdated: Date;
};

const marketPriceSchema = new Schema<IMarketPrice>(
  {
    vegetableId: {
      type: Schema.Types.ObjectId,
      ref: "Vegetable",
      required: true,
      unique: true,
    },
    vegetableName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    lowest: {
      type: Number,
      default: 0,
    },
    highest: {
      type: Number,
      default: 0,
    },
    average: {
      type: Number,
      default: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        const value = ret as unknown as Record<string, unknown>;
        value.vegetableId = String(value.vegetableId);
        delete value._id;
        delete value.__v;
        if (value.lastUpdated instanceof Date) {
          value.lastUpdated = value.lastUpdated.toISOString();
        }
        return value;
      },
    },
  }
);

export type MarketPriceDocument = HydratedDocument<IMarketPrice>;

export const MarketPrice: Model<IMarketPrice> =
  (mongoose.models.MarketPrice as Model<IMarketPrice>) ||
  mongoose.model<IMarketPrice>("MarketPrice", marketPriceSchema);

export default MarketPrice;
