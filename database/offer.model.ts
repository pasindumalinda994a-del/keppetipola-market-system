import mongoose, { Schema, type HydratedDocument, type Model, type Types } from "mongoose";
import { serializeId } from "@/lib/serialize";

export type OfferSource = "harvest" | "application";
export type OfferStatus = "Pending" | "Accepted" | "Cancelled";

export type IOffer = {
  source: OfferSource;
  harvestId?: Types.ObjectId;
  applicationId?: Types.ObjectId;
  requestId?: Types.ObjectId;
  farmerId: Types.ObjectId;
  traderId: Types.ObjectId;
  traderName: string;
  farmerName: string;
  vegetableName: string;
  price: number;
  quantityKg: number;
  delivery: Date;
  message: string;
  status: OfferStatus;
};

const offerSchema = new Schema<IOffer>(
  {
    source: { type: String, enum: ["harvest", "application"], required: true },
    harvestId: { type: Schema.Types.ObjectId, ref: "Harvest" },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application" },
    requestId: { type: Schema.Types.ObjectId, ref: "BuyingRequest" },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    traderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    traderName: { type: String, required: true, trim: true },
    farmerName: { type: String, required: true, trim: true },
    vegetableName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 1 },
    quantityKg: { type: Number, required: true, min: 1 },
    delivery: { type: Date, required: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Cancelled"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const value = serializeId(ret as unknown as Record<string, unknown>, {
          objectIds: [
            "harvestId",
            "applicationId",
            "requestId",
            "farmerId",
            "traderId",
          ],
          dateOnly: ["delivery"],
        });
        value.rating = 0;
        return value;
      },
    },
  }
);

offerSchema.index({ farmerId: 1, status: 1, createdAt: -1 });
offerSchema.index({ traderId: 1, createdAt: -1 });
offerSchema.index({ harvestId: 1, status: 1 });

export type OfferDocument = HydratedDocument<IOffer>;

export const Offer: Model<IOffer> =
  (mongoose.models.Offer as Model<IOffer>) ||
  mongoose.model<IOffer>("Offer", offerSchema);

export default Offer;
