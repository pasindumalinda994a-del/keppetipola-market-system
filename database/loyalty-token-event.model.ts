import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type ILoyaltyTokenEvent = {
  saleId: Types.ObjectId;
  farmerId: Types.ObjectId;
  traderId: Types.ObjectId;
  tokensIssued: number;
};

const loyaltyTokenEventSchema = new Schema<ILoyaltyTokenEvent>(
  {
    saleId: {
      type: Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      unique: true,
    },
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    traderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokensIssued: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const value = serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["saleId", "farmerId", "traderId"],
          dates: ["createdAt"],
        });
        delete value.updatedAt;
        return value;
      },
    },
  }
);

export type LoyaltyTokenEventDocument = HydratedDocument<ILoyaltyTokenEvent>;

export const LoyaltyTokenEvent: Model<ILoyaltyTokenEvent> =
  (mongoose.models.LoyaltyTokenEvent as Model<ILoyaltyTokenEvent>) ||
  mongoose.model<ILoyaltyTokenEvent>(
    "LoyaltyTokenEvent",
    loyaltyTokenEventSchema
  );

export default LoyaltyTokenEvent;
