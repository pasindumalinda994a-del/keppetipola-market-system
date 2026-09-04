import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
  type Types,
} from "mongoose";
import { serializeId } from "@/lib/serialize";

export type ILoyaltyBalance = {
  farmerId: Types.ObjectId;
  farmerName: string;
  traderId: Types.ObjectId;
  traderName: string;
  tokenCount: number;
  tokensTowardReward: number;
  rewardUnlocked: boolean;
  lastEarnedAt?: Date;
};

const loyaltyBalanceSchema = new Schema<ILoyaltyBalance>(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    farmerName: { type: String, required: true, trim: true },
    traderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    traderName: { type: String, required: true, trim: true },
    tokenCount: { type: Number, default: 0, min: 0 },
    tokensTowardReward: { type: Number, default: 0, min: 0 },
    rewardUnlocked: { type: Boolean, default: false },
    lastEarnedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const value = serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: ["farmerId", "traderId"],
          dateOnly: ["lastEarnedAt"],
        });
        delete value.createdAt;
        delete value.updatedAt;
        return value;
      },
    },
  }
);

loyaltyBalanceSchema.index({ farmerId: 1, traderId: 1 }, { unique: true });

export type LoyaltyBalanceDocument = HydratedDocument<ILoyaltyBalance>;

export const LoyaltyBalance: Model<ILoyaltyBalance> =
  (mongoose.models.LoyaltyBalance as Model<ILoyaltyBalance>) ||
  mongoose.model<ILoyaltyBalance>("LoyaltyBalance", loyaltyBalanceSchema);

export default LoyaltyBalance;
