import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { serializeId } from "@/lib/serialize";

export type SaleStatus = "Accepted" | "Completed" | "Cancelled";

export type ISale = {
  farmerId: Types.ObjectId;
  traderId: Types.ObjectId;
  farmerName: string;
  traderName: string;
  vegetableId: Types.ObjectId;
  vegetableName: string;
  quantityKg: number;
  unitPrice: number;
  total: number;
  delivery: Date;
  sourceOfferId: Types.ObjectId;
  harvestId?: Types.ObjectId;
  requestId?: Types.ObjectId;
  status: SaleStatus;
  date: Date;
  originalUnitPrice?: number;
  loyaltyDiscountPercent?: number;
  loyaltyApplied?: boolean;
};

const saleSchema = new Schema<ISale>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    traderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmerName: { type: String, required: true, trim: true },
    traderName: { type: String, required: true, trim: true },
    vegetableId: { type: Schema.Types.ObjectId, ref: "Vegetable", required: true },
    vegetableName: { type: String, required: true, trim: true },
    quantityKg: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    delivery: { type: Date, required: true },
    sourceOfferId: { type: Schema.Types.ObjectId, ref: "Offer", required: true, unique: true },
    harvestId: { type: Schema.Types.ObjectId, ref: "Harvest" },
    requestId: { type: Schema.Types.ObjectId, ref: "BuyingRequest" },
    status: {
      type: String,
      enum: ["Accepted", "Completed", "Cancelled"],
      default: "Accepted",
      index: true,
    },
    date: { type: Date, default: Date.now },
    originalUnitPrice: { type: Number, min: 0 },
    loyaltyDiscountPercent: { type: Number, default: 0, min: 0, max: 100 },
    loyaltyApplied: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        return serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: [
            "farmerId",
            "traderId",
            "vegetableId",
            "sourceOfferId",
            "harvestId",
            "requestId",
          ],
          dateOnly: ["delivery", "date"],
        });
      },
    },
  }
);

saleSchema.index({ farmerId: 1, createdAt: -1 });
saleSchema.index({ traderId: 1, createdAt: -1 });
saleSchema.index({ status: 1, date: -1 });

export type SaleDocument = HydratedDocument<ISale>;

export const Sale: Model<ISale> =
  (mongoose.models.Sale as Model<ISale>) ||
  mongoose.model<ISale>("Sale", saleSchema);

export default Sale;
