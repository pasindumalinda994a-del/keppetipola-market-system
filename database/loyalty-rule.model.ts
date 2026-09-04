import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type ILoyaltyRule = {
  traderId: Types.ObjectId;
  tokenThreshold: number;
  discountPercent: number;
  isActive: boolean;
};

const loyaltyRuleSchema = new Schema<ILoyaltyRule>(
  {
    traderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    tokenThreshold: {
      type: Number,
      required: true,
      min: 1,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const value = serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["traderId"],
          dates: ["updatedAt"],
        });
        delete value.createdAt;
        return value;
      },
    },
  }
);

export type LoyaltyRuleDocument = HydratedDocument<ILoyaltyRule>;

export const LoyaltyRule: Model<ILoyaltyRule> =
  (mongoose.models.LoyaltyRule as Model<ILoyaltyRule>) ||
  mongoose.model<ILoyaltyRule>("LoyaltyRule", loyaltyRuleSchema);

export default LoyaltyRule;
